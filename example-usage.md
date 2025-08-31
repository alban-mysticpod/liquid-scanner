# 🎯 Example: Schema Resolution in Action

## How the 5 Rules Work Together

Based on your AI agent's rules, here's what our implementation would produce:

### 📄 For Home Page (index.json):

```typescript
const homePageCapabilities = resolver.getPageCapabilities('index');

// Result:
{
  templateName: 'index',
  availableGroups: ['header', 'footer', 'main'],
  addableSections: [
    {
      sectionType: 'hero',
      file: 'hero.liquid',
      canAdd: true,
      presets: [
        { name: 't:names.hero', category: 't:categories.banners' },
        { name: 't:names.hero_marquee', category: 't:categories.banners' }
      ],
      availableBlocks: [
        // Section blocks (defined in hero schema)
        { blockType: 'text', isThemeBlock: false, canAdd: true },
        { blockType: 'button', isThemeBlock: false, canAdd: true },
        { blockType: 'image', isThemeBlock: false, canAdd: true },
        
        // Theme blocks (from @theme)
        { blockType: 'contact-form', isThemeBlock: true, isPrivate: false, canAdd: true },
        { blockType: 'accordion', isThemeBlock: true, isPrivate: false, canAdd: true },
        // Note: _private-block would NOT appear here (private rule)
      ]
    },
    {
      sectionType: 'product-list',
      file: 'product-list.liquid', 
      canAdd: true,
      presets: [
        { name: 't:names.products_grid', category: 't:categories.products' },
        { name: 't:names.products_carousel', category: 't:categories.products' },
        { name: 't:names.products_editorial', category: 't:categories.products' }
      ],
      availableBlocks: [
        { blockType: '_product-list-content', isThemeBlock: false, canAdd: true },
        { blockType: '_product-card', isThemeBlock: false, canAdd: true }
      ]
    },
    {
      sectionType: 'slideshow',
      file: 'slideshow.liquid',
      canAdd: false,
      reason: 'Disabled in groups: header, footer',
      presets: [/* ... */],
      availableBlocks: []
    }
  ]
}
```

### 🛍️ For Product Page (product.json):

```typescript
const productPageCapabilities = resolver.getPageCapabilities('product');

// Key differences:
{
  addableSections: [
    {
      sectionType: 'product-information',
      canAdd: true, // This section works on product pages
      availableBlocks: [
        // Has @theme, so gets ALL public theme blocks:
        { blockType: 'contact-form', isThemeBlock: true, canAdd: true },
        { blockType: 'accordion', isThemeBlock: true, canAdd: true },
        { blockType: 'text', isThemeBlock: true, canAdd: true },
        // But NOT _private-block (starts with _)
        
        // Plus section-specific blocks:
        { blockType: '_product-media-gallery', isThemeBlock: false, canAdd: true },
        { blockType: '_product-details', isThemeBlock: false, canAdd: true }
      ]
    },
    {
      sectionType: 'main-collection',
      canAdd: false,
      reason: 'Only enabled on: collection', // enabled_on rule
    }
  ]
}
```

## 🧩 Theme Blocks Resolution Example

```typescript
// For a section with explicit theme block listing:
{
  "blocks": [
    {"type": "@theme"},           // = all public theme blocks
    {"type": "_private-cta"},     // = this specific private block
    {"type": "contact-form"}      // = this specific public block
  ]
}

// Results in:
allowedThemeBlocks: [
  // From @theme (all public):
  { type: 'contact-form', isExplicit: false },
  { type: 'accordion', isExplicit: false },
  { type: 'text', isExplicit: false },
  // NOT _private-block (it's private)
  
  // Explicitly listed (can be private):
  { type: '_private-cta', isExplicit: true },
  { type: 'contact-form', isExplicit: true } // duplicate, but explicit
]
```

## 🗂️ Section Groups Discovery

```typescript
// After scanning layout/theme.liquid:
{% sections 'header' %}    // → header group exists
{% sections 'footer' %}    // → footer group exists

// After scanning sections/header-group.json:
{
  "name": "Header",
  "type": "header", 
  "sections": {
    "announcement": { "type": "header-announcements" },
    "header": { "type": "header" }
  }
}

// Results in:
sectionGroups: {
  'header': {
    handle: 'header',
    type: 'header',
    sections: ['announcement', 'header'],
    definedIn: 'sections/header-group.json',
    usedInLayouts: ['theme.liquid']
  }
}
```

## 🎯 UI Integration

In our PagesView component, this would show:

```jsx
// Home Page
<PageSection title="🏠 Home Page">
  <SectionBrowser 
    sections={homePageCapabilities.addableSections}
    onSectionSelect={handleSectionSelect}
  />
</PageSection>

// Each section shows:
✅ Hero Section (2 presets available)
├── 🎨 Banners category
├── 📝 Settings: 25 configurable options
├── 🧩 Blocks: 3 section blocks + 12 theme blocks
└── ➕ Can be added to this page

❌ Slideshow Section (1 preset)
├── 📖 Storytelling category  
├── 🚫 Cannot add: Disabled in groups: header, footer
└── 💡 Available on: collection, product, blog pages
```

This gives us the **complete picture** of what's possible on each page, following all 5 rules!
