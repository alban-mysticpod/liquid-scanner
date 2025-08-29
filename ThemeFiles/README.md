# Horizon Theme Files

This directory contains a copy of the Shopify Horizon theme files for analysis and development purposes.

## Structure

- **`assets/`** - Theme assets (CSS, JS, images, icons)
- **`blocks/`** - Reusable content blocks (84 files with schemas)
- **`config/`** - Theme configuration and settings
- **`layout/`** - Theme layout templates
- **`locales/`** - Translation files for internationalization
- **`sections/`** - Theme sections (30 files with schemas)  
- **`snippets/`** - Reusable code snippets
- **`templates/`** - Page templates

## Schema Files

This theme contains **114 files with JSON schemas** that define:
- Settings configuration
- Block types and their properties
- Preset configurations
- UI components structure

## Usage

These files are scanned by the Liquid Files Scanner application to provide:
- Hierarchical file exploration
- Visual schema analysis
- Interactive settings/blocks/presets viewer
- Type-specific icons and color coding

The scanner analyzes the `{% schema %}` sections in `.liquid` files to extract and visualize the theme's configuration structure.
