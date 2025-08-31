import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface BlockInfo {
  name: string;
  file: string;
  displayName: string;
  isPrivate: boolean;
  hasSchema: boolean;
  schema?: any;
  canBeAddedToSection: boolean;
  reason?: string;
}

interface SectionBlocksInfo {
  sectionName: string;
  sectionFile: string;
  sectionDisplayName: string;
  acceptsThemeBlocks: boolean;
  acceptsAppBlocks: boolean;
  allowedPrivateBlocks: string[];
  availableBlocks: {
    publicBlocks: BlockInfo[];
    privateBlocks: BlockInfo[];
  };
}

// Load translation data
let translationData: any = null;

function loadTranslations(): any {
  if (translationData) return translationData;
  
  try {
    const translationPath = path.resolve(process.cwd(), 'ThemeFiles', 'locales', 'en.default.schema.json');
    const content = fs.readFileSync(translationPath, 'utf-8');
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

function analyzeBlockCompatibility(
  blockName: string,
  blockFile: string,
  isPrivate: boolean,
  sectionSchema: any
): { canBeAdded: boolean; reason?: string } {
  
  // Check if section accepts any theme blocks
  const acceptsThemeBlocks = sectionSchema.blocks?.some((block: any) => block.type === '@theme');
  
  // Check if this specific block is explicitly allowed (for both public and private blocks)
  const fileNameWithoutExtension = blockFile.replace('.liquid', '');
  const isExplicitlyAllowed = sectionSchema.blocks?.some((block: any) => {
    // Handle private blocks (with underscore prefix)
    if (isPrivate) {
      // Private blocks can be referenced as "_blockname" or "blockname"
      return block.type === `_${blockName}` || 
             block.type === blockName || 
             block.type === fileNameWithoutExtension ||
             block.type === `_${fileNameWithoutExtension}`;
    }
    // Handle public blocks (no underscore)
    else {
      // Public blocks are referenced by their filename (without .liquid)
      return block.type === blockName || 
             block.type === fileNameWithoutExtension;
    }
  });

  // If explicitly allowed, always allow
  if (isExplicitlyAllowed) {
    return { canBeAdded: true };
  }

  // If section accepts @theme, public blocks can be added
  if (acceptsThemeBlocks && !isPrivate) {
    return { canBeAdded: true };
  }

  // If section doesn't accept @theme and block is not explicitly allowed
  if (!acceptsThemeBlocks && !isExplicitlyAllowed) {
    if (isPrivate) {
      return { 
        canBeAdded: false, 
        reason: 'Private block not explicitly allowed in this section' 
      };
    } else {
      return { 
        canBeAdded: false, 
        reason: 'Section does not accept @theme blocks and block not explicitly allowed' 
      };
    }
  }

  // Private blocks must be explicitly allowed
  if (isPrivate) {
    return { 
      canBeAdded: false, 
      reason: 'Private block not explicitly allowed in this section' 
    };
  }

  return { canBeAdded: false, reason: 'Unknown compatibility issue' };
}

export async function GET(request: NextRequest) {
  try {
    const sectionsPath = path.resolve(process.cwd(), 'ThemeFiles', 'sections');
    const blocksPath = path.resolve(process.cwd(), 'ThemeFiles', 'blocks');
    
    console.log('Analyzing sections in:', sectionsPath);
    console.log('Analyzing blocks in:', blocksPath);

    // Get all .liquid files in sections directory
    const sectionFiles = fs.readdirSync(sectionsPath)
      .filter(file => file.endsWith('.liquid'))
      .map(file => ({
        name: file.replace('.liquid', ''),
        file: file,
        path: path.join(sectionsPath, file)
      }));

    // Get all .liquid files in blocks directory
    const blockFiles = fs.readdirSync(blocksPath)
      .filter(file => file.endsWith('.liquid'))
      .map(file => ({
        name: file.replace('.liquid', ''),
        file: file,
        path: path.join(blocksPath, file),
        isPrivate: file.startsWith('_')
      }));

    console.log(`Found ${sectionFiles.length} sections and ${blockFiles.length} blocks`);

    const result: SectionBlocksInfo[] = [];

    // Analyze each section
    sectionFiles.forEach(({ name: sectionName, file: sectionFile, path: sectionPath }) => {
      const sectionSchema = extractSchemaFromFile(sectionPath);
      
      if (!sectionSchema) {
        console.log(`No valid schema found for section ${sectionFile}`);
        return;
      }

      const sectionDisplayName = sectionSchema.name ? resolveTranslation(sectionSchema.name) : sectionName.replace(/_/g, ' ');
      
      // Check what types of blocks this section accepts
      const acceptsThemeBlocks = sectionSchema.blocks?.some((block: any) => block.type === '@theme') || false;
      const acceptsAppBlocks = sectionSchema.blocks?.some((block: any) => block.type === '@app') || false;
      
      // Get explicitly allowed private blocks
      const allowedPrivateBlocks = sectionSchema.blocks
        ?.filter((block: any) => block.type.startsWith('_'))
        .map((block: any) => block.type) || [];

      const publicBlocks: BlockInfo[] = [];
      const privateBlocks: BlockInfo[] = [];

      // Analyze each block's compatibility with this section
      blockFiles.forEach(({ name: blockName, file: blockFile, path: blockPath, isPrivate }) => {
        const blockSchema = extractSchemaFromFile(blockPath);
        const blockDisplayName = blockSchema?.name ? resolveTranslation(blockSchema.name) : blockName.replace(/_/g, ' ');
        
        const compatibility = analyzeBlockCompatibility(blockName, blockFile, isPrivate, sectionSchema);
        
        const blockInfo: BlockInfo = {
          name: blockName,
          file: blockFile,
          displayName: blockDisplayName,
          isPrivate,
          hasSchema: !!blockSchema,
          schema: blockSchema,
          canBeAddedToSection: compatibility.canBeAdded,
          reason: compatibility.reason
        };

        if (isPrivate) {
          privateBlocks.push(blockInfo);
        } else {
          publicBlocks.push(blockInfo);
        }
      });

      // Sort blocks by addability and name
      const sortBlocks = (blocks: BlockInfo[]) => 
        blocks.sort((a, b) => {
          if (a.canBeAddedToSection !== b.canBeAddedToSection) {
            return a.canBeAddedToSection ? -1 : 1;
          }
          return a.displayName.localeCompare(b.displayName);
        });

      result.push({
        sectionName,
        sectionFile,
        sectionDisplayName,
        acceptsThemeBlocks,
        acceptsAppBlocks,
        allowedPrivateBlocks,
        availableBlocks: {
          publicBlocks: sortBlocks(publicBlocks),
          privateBlocks: sortBlocks(privateBlocks)
        }
      });
    });

    // Sort sections by name
    result.sort((a, b) => a.sectionDisplayName.localeCompare(b.sectionDisplayName));

    // Add summary statistics
    const summary = {
      totalSections: sectionFiles.length,
      totalBlocks: blockFiles.length,
      publicBlocks: blockFiles.filter(b => !b.isPrivate).length,
      privateBlocks: blockFiles.filter(b => b.isPrivate).length,
      sectionsAcceptingThemeBlocks: result.filter(s => s.acceptsThemeBlocks).length,
      sectionsAcceptingAppBlocks: result.filter(s => s.acceptsAppBlocks).length
    };

    return NextResponse.json({
      success: true,
      summary,
      sectionBlocks: result,
      scannedPaths: {
        sections: sectionsPath,
        blocks: blocksPath
      }
    });

  } catch (error) {
    console.error('Error analyzing blocks by section:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error analyzing blocks by section',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
