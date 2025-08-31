# 🧠 Schema Resolution Implementation Plan

## 📊 Current State vs Target State

### ✅ What we already have:
- Basic section schema extraction
- Template analysis (which sections are used)
- File scanning and organization
- UI with Pages/File Explorer views

### 🎯 What we need to implement:

## 1. 🔧 Enhanced Section Analysis

```typescript
interface SectionSchema {
  name: string;
  settings: Setting[];
  blocks: BlockDefinition[];
  presets: Preset[];
  limit?: number;
  enabled_on?: {
    templates?: string[];
    groups?: string[];
  };
  disabled_on?: {
    groups?: string[];
  };
  
  // New properties to add:
  isThemeBlockContainer: boolean; // {% content_for 'blocks' %}
  isAddable: boolean; // has presets + permissions
  sectionBlocks: SectionBlock[]; // blocks defined in schema
  allowedThemeBlocks: string[]; // @theme or explicit list
}
```

## 2. 🗂️ Section Groups Detection

```typescript
interface SectionGroup {
  handle: string; // header, footer, custom-group-name
  type: 'header' | 'footer' | 'custom';
  sections: string[]; // section instances
  definedIn: string; // sections/header-group.json
  usedInLayouts: string[]; // layout/theme.liquid
}

// Need to scan:
// - sections/*.json files
// - layout/*.liquid for {% sections 'group-handle' %}
```

## 3. 🧩 Block Type Resolution

```typescript
interface BlockDefinition {
  type: string;
  isThemeBlock: boolean; // from /blocks/ vs section-specific
  isPrivate: boolean; // starts with _
  settings: Setting[];
  file?: string; // for theme blocks
  allowedInSections: string[]; // which sections can use this
}

interface ThemeBlock {
  file: string; // e.g., "_cta.liquid"
  type: string; // extracted from filename
  schema: BlockSchema;
  isPrivate: boolean;
  usedInSections: string[];
}
```

## 4. 🎯 Page Capability Calculator

```typescript
interface PageCapabilities {
  templateName: string; // index, product, collection
  availableGroups: string[]; // header, footer, main content
  addableSections: SectionCapability[];
}

interface SectionCapability {
  sectionType: string;
  file: string;
  canAdd: boolean;
  reason?: string; // why it can't be added
  availableBlocks: BlockCapability[];
  settings: Setting[];
}

interface BlockCapability {
  blockType: string;
  isThemeBlock: boolean;
  settings: Setting[];
  canAdd: boolean;
}
```

## 🔄 Implementation Steps

### Phase 1: Enhanced Section Parsing
1. Update section scanner to detect `{% content_for 'blocks' %}`
2. Parse all block definitions from schemas
3. Identify theme block containers (`@theme` vs explicit lists)

### Phase 2: Theme Blocks Analysis
1. Scan `/blocks/*.liquid` files
2. Extract schemas and detect private/public status
3. Map theme blocks to sections that can use them

### Phase 3: Section Groups Discovery
1. Parse `sections/*.json` group files
2. Scan layouts for `{% sections %}` tags
3. Build group-to-template mapping

### Phase 4: Permissions Resolution
1. Implement enabled_on/disabled_on logic
2. Calculate per-template section availability
3. Resolve theme block accessibility

### Phase 5: UI Integration
1. Update PagesView to show real capabilities
2. Add section/block browsers per page
3. Show availability reasons (why section can/can't be added)

## 📁 New Components Needed

```
app/
├── lib/
│   ├── schema-resolver.ts       # Main resolution logic
│   ├── section-parser.ts        # Enhanced section parsing
│   ├── theme-block-parser.ts    # Theme blocks analysis
│   ├── group-detector.ts        # Section groups detection
│   └── capability-calculator.ts # Page capabilities
├── components/
│   ├── SectionBrowser.tsx       # Browse available sections
│   ├── BlockBrowser.tsx         # Browse available blocks
│   ├── CapabilityViewer.tsx     # Show what can be added
│   └── PermissionExplainer.tsx  # Explain why something is/isn't available
└── types/
    └── schema-types.ts          # All TypeScript interfaces
```

## 🎯 Expected Output

For each page type, we'll be able to show:

### Home Page (index.json):
```
✅ Available Sections (23):
├── 🎨 Banners
│   ├── ✅ hero (2 presets) - Can add
│   ├── ✅ marquee (1 preset) - Can add  
│   └── ❌ slideshow - Disabled on header
├── 🛍️ Products  
│   ├── ✅ product-list (3 presets) - Can add
│   └── ✅ featured-product - Can add
└── 📖 Storytelling
    ├── ✅ media-with-content (2 presets) - Can add
    └── ✅ section (12 presets) - Can add

🧩 Available Blocks per Section:
├── hero section:
│   ├── Section blocks: text, button, divider
│   └── Theme blocks: @theme (all public blocks)
└── section (custom):
    ├── Section blocks: text, image, button
    └── Theme blocks: contact-form, accordion, etc.
```

This gives us the complete picture of what's possible on each page type!
