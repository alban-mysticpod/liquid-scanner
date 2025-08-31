import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SectionInfo {
  name: string;
  file: string;
  displayName: string;
  hasPresets: boolean;
  presetsCount: number;
  presets: any[];
  enabled_on?: {
    templates?: string[];
    groups?: string[];
  };
  disabled_on?: {
    groups?: string[];
  };
  availableInGroups: {
    header: boolean;
    main: boolean;
    footer: boolean;
  };
  restrictions: {
    header?: string;
    main?: string;
    footer?: string;
  };
}

interface PageZones {
  header: SectionInfo[];
  main: SectionInfo[];
  footer: SectionInfo[];
}

interface PageSections {
  [pageType: string]: PageZones;
}

// Page types configuration
const PAGE_TYPES = {
  'index': {
    name: 'Home Page',
    template: 'index',
    groups: ['header', 'footer', 'main']
  },
  'product': {
    name: 'Product Page', 
    template: 'product',
    groups: ['header', 'footer', 'main']
  },
  'collection': {
    name: 'Collection Page',
    template: 'collection', 
    groups: ['header', 'footer', 'main']
  },
  'cart': {
    name: 'Cart Page',
    template: 'cart',
    groups: ['header', 'footer', 'main']
  },
  'blog': {
    name: 'Blog Pages',
    template: 'blog',
    groups: ['header', 'footer', 'main']
  },
  '404': {
    name: '404 Error Page',
    template: '404',
    groups: ['header', 'footer', 'main']
  },
  'search': {
    name: 'Search Page',
    template: 'search',
    groups: ['header', 'footer', 'main']
  },
  'page': {
    name: 'Regular Pages',
    template: 'page',
    groups: ['header', 'footer', 'main']
  }
};

// Load translation data once
let translationData: any = null;

function loadTranslations(): any {
  if (translationData) return translationData;
  
  try {
    const translationPath = path.resolve(process.cwd(), 'ThemeFiles', 'locales', 'en.default.schema.json');
    const content = fs.readFileSync(translationPath, 'utf-8');
    // Remove comments from JSON
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '');
    translationData = JSON.parse(cleanContent);
    return translationData;
  } catch (error) {
    console.error('Error loading translations:', error);
    return { names: {} };
  }
}

function resolveTranslation(translationKey: string): string {
  const translations = loadTranslations();
  
  if (translationKey.startsWith('t:names.')) {
    const key = translationKey.replace('t:names.', '');
    return translations.names?.[key] || key.replace(/_/g, ' ');
  }
  
  return translationKey;
}

function extractSchemaFromFile(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i;
    const match = content.match(schemaRegex);
    
    if (!match) return null;
    
    const schemaRaw = match[1].trim();
    return JSON.parse(schemaRaw);
  } catch (error) {
    console.error(`Error parsing schema from ${filePath}:`, error);
    return null;
  }
}

function analyzeSectionAvailability(
  schema: any, 
  pageTemplate: string,
  sectionName: string
): { availableInGroups: { header: boolean; main: boolean; footer: boolean; }; restrictions: any } {
  
  const zones = ['header', 'main', 'footer'];
  const availableInGroups = {
    header: false,  // Start with false, enable only if allowed
    main: false,
    footer: false
  };
  const restrictions: any = {};

  // First check template restrictions - if not allowed on this template, block everything
  if (schema.enabled_on?.templates && !schema.enabled_on.templates.includes(pageTemplate)) {
    const reason = `Only enabled on templates: ${schema.enabled_on.templates.join(', ')}`;
    restrictions.header = reason;
    restrictions.main = reason;
    restrictions.footer = reason;
    return { availableInGroups, restrictions };
  }

  // Check each zone individually
  zones.forEach(zone => {
    let canAddToZone = false;
    let reason = '';

    // If section has enabled_on.groups, only allow in those groups
    if (schema.enabled_on?.groups) {
      if (schema.enabled_on.groups.includes(zone)) {
        canAddToZone = true;
      } else {
        canAddToZone = false;
        reason = `Only enabled in groups: ${schema.enabled_on.groups.join(', ')}`;
      }
    }
    // If section has disabled_on.groups, block those groups
    else if (schema.disabled_on?.groups) {
      if (schema.disabled_on.groups.includes(zone)) {
        canAddToZone = false;
        reason = `Disabled in group: ${zone}`;
      } else {
        canAddToZone = true;
      }
    }
    // If no group restrictions, check if section is addable based on presets
    else {
      const hasPresets = schema.presets && schema.presets.length > 0;
      
      // System sections (main-*, password, etc.) are available in main content even without presets
      // Check by file name since some system sections might not have presets
      const isSystemSection = sectionName.startsWith('main-') || 
                              sectionName === 'password' ||
                              sectionName === 'header' ||
                              sectionName === 'footer';
      
      if (hasPresets || (isSystemSection && zone === 'main')) {
        canAddToZone = true;
      } else if (!hasPresets && zone !== 'main') {
        canAddToZone = false;
        reason = 'No presets defined - not addable in header/footer';
      } else if (!hasPresets && zone === 'main' && !isSystemSection) {
        canAddToZone = false;
        reason = 'No presets defined - not addable';
      }
    }

    availableInGroups[zone as keyof typeof availableInGroups] = canAddToZone;
    if (!canAddToZone && reason) {
      restrictions[zone] = reason;
    }
  });

  return { availableInGroups, restrictions };
}

export async function GET(request: NextRequest) {
  try {
    const sectionsPath = path.resolve(process.cwd(), 'ThemeFiles', 'sections');
    console.log('Analyzing sections in:', sectionsPath);

    // Get all .liquid files in sections directory
    const sectionFiles = fs.readdirSync(sectionsPath)
      .filter(file => file.endsWith('.liquid'))
      .map(file => ({
        name: file.replace('.liquid', ''),
        file: file,
        path: path.join(sectionsPath, file)
      }));

    console.log(`Found ${sectionFiles.length} section files`);

    const result: PageSections = {};

    // Initialize each page type with zones
    Object.keys(PAGE_TYPES).forEach(pageType => {
      result[pageType] = {
        header: [],
        main: [],
        footer: []
      };
    });

    // Analyze each section
    sectionFiles.forEach(({ name, file, path: filePath }) => {
      const schema = extractSchemaFromFile(filePath);
      
      if (!schema) {
        console.log(`No valid schema found for ${file}`);
        return;
      }

      // Check compatibility with each page type
      Object.entries(PAGE_TYPES).forEach(([pageType, pageConfig]) => {
        const analysis = analyzeSectionAvailability(schema, pageConfig.template, name);

        // Resolve the display name from translations
        const displayName = schema.name ? resolveTranslation(schema.name) : name.replace(/_/g, ' ');
        
        const sectionInfo: SectionInfo = {
          name,
          file,
          displayName,
          hasPresets: schema.presets && schema.presets.length > 0,
          presetsCount: schema.presets ? schema.presets.length : 0,
          presets: schema.presets || [],
          enabled_on: schema.enabled_on,
          disabled_on: schema.disabled_on,
          availableInGroups: analysis.availableInGroups,
          restrictions: analysis.restrictions
        };

        // Add to appropriate zones
        if (analysis.availableInGroups.header) {
          result[pageType].header.push(sectionInfo);
        }
        if (analysis.availableInGroups.main) {
          result[pageType].main.push(sectionInfo);
        }
        if (analysis.availableInGroups.footer) {
          result[pageType].footer.push(sectionInfo);
        }
      });
    });

    // Sort sections in each zone by name
    Object.keys(result).forEach(pageType => {
      ['header', 'main', 'footer'].forEach(zone => {
        result[pageType][zone as keyof PageZones].sort((a, b) => 
          a.displayName.localeCompare(b.displayName)
        );
      });
    });

    // Add summary statistics
    const summary = {
      totalSections: sectionFiles.length,
      byPage: Object.entries(result).map(([pageType, zones]) => ({
        pageType,
        pageName: PAGE_TYPES[pageType as keyof typeof PAGE_TYPES].name,
        header: zones.header.length,
        main: zones.main.length,
        footer: zones.footer.length,
        total: zones.header.length + zones.main.length + zones.footer.length,
        withPresets: {
          header: zones.header.filter(s => s.hasPresets).length,
          main: zones.main.filter(s => s.hasPresets).length,
          footer: zones.footer.filter(s => s.hasPresets).length
        }
      }))
    };

    return NextResponse.json({
      success: true,
      summary,
      sectionsByPage: result,
      scannedPath: sectionsPath
    });

  } catch (error) {
    console.error('Error analyzing sections:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error analyzing sections by page',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
