// Schema Resolution Engine - Implementation of the 5 rules

export interface SectionSchema {
  name: string;
  file: string;
  settings: any[];
  blocks: any[];
  presets: any[];
  limit?: number;
  enabled_on?: {
    templates?: string[];
    groups?: string[];
  };
  disabled_on?: {
    groups?: string[];
  };
  
  // Enhanced properties
  isThemeBlockContainer: boolean;
  isAddable: boolean;
  sectionBlocks: BlockDefinition[];
  allowedThemeBlocks: ThemeBlockReference[];
}

export interface BlockDefinition {
  type: string;
  settings: any[];
  isThemeBlock: boolean;
  isPrivate: boolean;
  file?: string;
}

export interface ThemeBlockReference {
  type: string;
  isExplicit: boolean; // explicitly listed vs @theme
}

export interface SectionGroup {
  handle: string;
  type: 'header' | 'footer' | 'custom';
  sections: string[];
  definedIn: string;
  usedInLayouts: string[];
}

export interface PageCapabilities {
  templateName: string;
  availableGroups: string[];
  addableSections: SectionCapability[];
}

export interface SectionCapability {
  sectionType: string;
  file: string;
  canAdd: boolean;
  reason?: string;
  availableBlocks: BlockCapability[];
  presets: any[];
}

export interface BlockCapability {
  blockType: string;
  isThemeBlock: boolean;
  isPrivate: boolean;
  canAdd: boolean;
  reason?: string;
}

export class SchemaResolver {
  private sections: Map<string, SectionSchema> = new Map();
  private themeBlocks: Map<string, BlockDefinition> = new Map();
  private sectionGroups: Map<string, SectionGroup> = new Map();
  private templates: Map<string, any> = new Map();

  constructor(
    private sectionFiles: { file: string; content: string; schema: any }[],
    private blockFiles: { file: string; content: string; schema: any }[],
    private templateFiles: { file: string; content: any }[],
    private layoutFiles: { file: string; content: string }[]
  ) {
    this.init();
  }

  private init() {
    this.parseSections();
    this.parseThemeBlocks();
    this.detectSectionGroups();
    this.parseTemplates();
  }

  // Rule 1: Sections Analysis
  private parseSections() {
    this.sectionFiles.forEach(({ file, content, schema }) => {
      const sectionType = file.replace('.liquid', '');
      
      const sectionSchema: SectionSchema = {
        name: schema.name || sectionType,
        file,
        settings: schema.settings || [],
        blocks: schema.blocks || [],
        presets: schema.presets || [],
        limit: schema.limit,
        enabled_on: schema.enabled_on,
        disabled_on: schema.disabled_on,
        
        // Enhanced analysis
        isThemeBlockContainer: this.isThemeBlockContainer(content),
        isAddable: this.isAddableSection(schema),
        sectionBlocks: this.extractSectionBlocks(schema.blocks || []),
        allowedThemeBlocks: this.extractAllowedThemeBlocks(schema.blocks || [])
      };

      this.sections.set(sectionType, sectionSchema);
    });
  }

  // Rule 4: Theme Blocks Analysis
  private parseThemeBlocks() {
    this.blockFiles.forEach(({ file, content, schema }) => {
      const blockType = file.replace('.liquid', '');
      
      const blockDef: BlockDefinition = {
        type: blockType,
        settings: schema.settings || [],
        isThemeBlock: true,
        isPrivate: blockType.startsWith('_'),
        file
      };

      this.themeBlocks.set(blockType, blockDef);
    });
  }

  // Rule 2: Section Groups Detection
  private detectSectionGroups() {
    // TODO: Parse sections/*.json group files
    // TODO: Scan layout/*.liquid for {% sections 'group-handle' %}
    
    // For now, add default groups
    this.sectionGroups.set('header', {
      handle: 'header',
      type: 'header',
      sections: [],
      definedIn: 'sections/header-group.json',
      usedInLayouts: ['theme.liquid']
    });

    this.sectionGroups.set('footer', {
      handle: 'footer', 
      type: 'footer',
      sections: [],
      definedIn: 'sections/footer-group.json',
      usedInLayouts: ['theme.liquid']
    });
  }

  // Rule 3: Template Analysis
  private parseTemplates() {
    this.templateFiles.forEach(({ file, content }) => {
      const templateName = file.replace('.json', '');
      this.templates.set(templateName, content);
    });
  }

  // Rule 5: Calculate Page Capabilities
  public getPageCapabilities(templateName: string): PageCapabilities {
    const template = this.templates.get(templateName);
    const availableGroups = this.getAvailableGroups(templateName);
    
    const addableSections: SectionCapability[] = [];

    // Check each section for addability on this template
    this.sections.forEach((section, sectionType) => {
      const canAdd = this.canAddSectionToTemplate(section, templateName, availableGroups);
      
      if (canAdd.allowed) {
        const availableBlocks = this.getAvailableBlocks(section);
        
        addableSections.push({
          sectionType,
          file: section.file,
          canAdd: true,
          availableBlocks,
          presets: section.presets
        });
      } else {
        addableSections.push({
          sectionType,
          file: section.file,
          canAdd: false,
          reason: canAdd.reason,
          availableBlocks: [],
          presets: section.presets
        });
      }
    });

    return {
      templateName,
      availableGroups,
      addableSections
    };
  }

  // Helper methods
  private isThemeBlockContainer(content: string): boolean {
    return content.includes("{% content_for 'blocks' %}");
  }

  private isAddableSection(schema: any): boolean {
    return (schema.presets && schema.presets.length > 0);
  }

  private extractSectionBlocks(blocks: any[]): BlockDefinition[] {
    return blocks
      .filter(block => block.type !== '@theme' && block.type !== '@app')
      .map(block => ({
        type: block.type,
        settings: block.settings || [],
        isThemeBlock: false,
        isPrivate: false
      }));
  }

  private extractAllowedThemeBlocks(blocks: any[]): ThemeBlockReference[] {
    const themeBlocks: ThemeBlockReference[] = [];
    
    blocks.forEach(block => {
      if (block.type === '@theme') {
        // Allow all public theme blocks
        this.themeBlocks.forEach((themeDef, type) => {
          if (!themeDef.isPrivate) {
            themeBlocks.push({ type, isExplicit: false });
          }
        });
      } else if (this.themeBlocks.has(block.type)) {
        // Explicitly allowed theme block (can be private)
        themeBlocks.push({ type: block.type, isExplicit: true });
      }
    });

    return themeBlocks;
  }

  private getAvailableGroups(templateName: string): string[] {
    // TODO: Implement based on layout scanning
    return ['header', 'footer', 'main'];
  }

  private canAddSectionToTemplate(
    section: SectionSchema, 
    templateName: string, 
    availableGroups: string[]
  ): { allowed: boolean; reason?: string } {
    
    // Check if section has presets (required for addability)
    if (!section.isAddable) {
      return { allowed: false, reason: 'No presets defined' };
    }

    // Check enabled_on restrictions
    if (section.enabled_on) {
      if (section.enabled_on.templates && !section.enabled_on.templates.includes(templateName)) {
        return { allowed: false, reason: `Only enabled on: ${section.enabled_on.templates.join(', ')}` };
      }
      
      if (section.enabled_on.groups) {
        const hasAllowedGroup = section.enabled_on.groups.some(group => availableGroups.includes(group));
        if (!hasAllowedGroup) {
          return { allowed: false, reason: `Only enabled in groups: ${section.enabled_on.groups.join(', ')}` };
        }
      }
    }

    // Check disabled_on restrictions
    if (section.disabled_on?.groups) {
      const hasDisabledGroup = section.disabled_on.groups.some(group => availableGroups.includes(group));
      if (hasDisabledGroup) {
        return { allowed: false, reason: `Disabled in groups: ${section.disabled_on.groups.join(', ')}` };
      }
    }

    return { allowed: true };
  }

  private getAvailableBlocks(section: SectionSchema): BlockCapability[] {
    const blocks: BlockCapability[] = [];

    // Add section-specific blocks
    section.sectionBlocks.forEach(block => {
      blocks.push({
        blockType: block.type,
        isThemeBlock: false,
        isPrivate: false,
        canAdd: true
      });
    });

    // Add allowed theme blocks
    section.allowedThemeBlocks.forEach(themeRef => {
      const themeDef = this.themeBlocks.get(themeRef.type);
      if (themeDef) {
        blocks.push({
          blockType: themeRef.type,
          isThemeBlock: true,
          isPrivate: themeDef.isPrivate,
          canAdd: true
        });
      }
    });

    return blocks;
  }

  // Public getters
  public getSections(): Map<string, SectionSchema> {
    return this.sections;
  }

  public getThemeBlocks(): Map<string, BlockDefinition> {
    return this.themeBlocks;
  }

  public getSectionGroups(): Map<string, SectionGroup> {
    return this.sectionGroups;
  }
}
