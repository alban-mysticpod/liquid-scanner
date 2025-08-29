# 🎨 Liquid Files Scanner

A Next.js application for hierarchical analysis of Shopify Liquid theme files with visual schema exploration.

## ✨ Features

- **📂 Hierarchical File Explorer**: Navigate through directories and files with collapsible sections
- **⚙️ Schema Visualization**: Interactive display of Shopify section schemas
- **🎨 Visual Type Icons**: Custom SVG icons for different setting types (checkbox, select, image_picker, etc.)
- **🌈 Color-Coded Interface**: Visual distinction between directories, files, settings, blocks, and presets
- **📊 Collapsible Options**: Expandable tables for setting options and configurations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **📁 Embedded Theme Files**: Complete Horizon theme included in `ThemeFiles/` directory

## 📁 Project Structure

```
liquid-scanner/
├── app/                    # Next.js application
│   ├── api/scan/          # File scanning API
│   ├── components/        # React components
│   │   ├── CollapsibleSection.tsx    # Hierarchical sections
│   │   ├── FileExplorer.tsx          # Main file explorer
│   │   ├── KeyValueList.tsx          # Setting display
│   │   └── SettingTypeIcon.tsx       # SVG icon system
│   ├── globals.css        # Tailwind styles
│   ├── layout.tsx         # App layout
│   └── page.tsx          # Main page
├── lib/                   # Utility libraries
│   └── fileScanner.ts    # File scanning logic
├── ThemeFiles/           # 🎯 Shopify Horizon theme files
│   ├── assets/           # Theme assets (97 files)
│   ├── blocks/           # Content blocks (84 with schemas)
│   ├── config/           # Theme configuration
│   ├── layout/           # Layout templates
│   ├── locales/          # Translation files
│   ├── sections/         # Theme sections (30 with schemas)
│   ├── snippets/         # Code snippets (105 files)
│   └── templates/        # Page templates
└── README.md
```

## 🛠️ Technology Stack

- **Next.js 14** with TypeScript
- **React** components with state management
- **Tailwind CSS** for styling
- **SVG Icon System** for visual indicators
- **File System API** for .liquid file scanning
- **JSON Schema Parser** for Shopify theme analysis

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/alban-mysticpod/liquid-scanner.git
cd liquid-scanner

# Install dependencies
npm install

# Run in development mode on port 8002
npm run dev

# Or run in production
npm run build
npm start
```

## 📖 Usage

1. **Start the application**: `npm run dev`
2. **Open**: [http://localhost:8002](http://localhost:8002)
3. **Explore**: Navigate through the hierarchical file structure
4. **Analyze**: Click on files to view their schemas
5. **Visualize**: See settings, blocks, and presets with type-specific icons
6. **Filter**: Toggle between all files or schema-only view

## 🎯 Key Features

### **Color-Coded Hierarchy**
- 🔵 **Directories**: Slate blue background with left border
- 🟢 **Files**: Emerald green background for .liquid files
- 🟦 **Settings**: Blue sections for configuration options
- 🟣 **Blocks**: Purple sections for content blocks  
- 🟡 **Presets**: Amber sections for preset configurations

### **Visual Setting Types**
- ☑️ `checkbox` - Checkbox icon
- 📋 `select` - Dropdown menu icon
- 🖼️ `image_picker` - Image selection icon
- 🎨 `color` - Color palette icon
- 📝 `text` - Text input icon
- 🔢 `number` - Numeric input icon
- And 15+ more setting types with custom icons

### **Interactive Elements**
- **Collapsible sections** with persistent icons
- **Options tables** for setting configurations
- **Simplified titles** showing just setting IDs/names
- **Responsive design** for all screen sizes

## 📊 Theme Analysis

The included Horizon theme contains:
- **222 total .liquid files**
- **114 files with JSON schemas**
- **84 blocks** with configuration schemas
- **30 sections** with settings and presets
- **Multiple setting types**: range, select, checkbox, color, image_picker, etc.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is open source and available under the MIT License.