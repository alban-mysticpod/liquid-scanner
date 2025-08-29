# Liquid Files Scanner

A Next.js application to scan and analyze `.liquid` files in the Shopify Horizon theme.

## Features

- ✅ Recursive scan of all `.liquid` files
- ✅ Schema extraction and parsing from `{% schema %}` sections
- ✅ Filter files by schema presence
- ✅ Interactive schema viewer with JSON formatting
- ✅ Organized display by directories
- ✅ Detailed information (size, modification date)
- ✅ Modern UI with Tailwind CSS
- ✅ REST API for file scanning
- ✅ Configured to run on port 8002

## Installation

```bash
# Install dependencies
npm install

# Run in development mode on port 8002
npm run dev

# Or run in production
npm run build
npm start
```

## Usage

1. Start the application: `npm run dev`
2. Open [http://localhost:8002](http://localhost:8002)
3. The application automatically scans `.liquid` files from the Horizon theme
4. Browse results organized by directories
5. Click on files with schemas to view their JSON configuration
6. Use the filter toggle to show all files or only those with schemas

## Structure

- `/app` - Next.js 13+ pages and layout
- `/lib` - File scanning logic
- `/app/api` - API routes for scanning

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- Node.js File System API
