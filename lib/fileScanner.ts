import fs from 'fs';
import path from 'path';

export interface LiquidFile {
  name: string;
  path: string;
  relativePath: string;
  size: number;
  lastModified: Date;
  directory: string;
  hasSchema: boolean;
  schema?: any;
  schemaRaw?: string;
}

function extractSchema(content: string): { hasSchema: boolean; schema?: any; schemaRaw?: string } {
  // Search for {% schema %} section in content
  const schemaRegex = /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/i;
  const match = content.match(schemaRegex);
  
  if (!match) {
    return { hasSchema: false };
  }
  
  const schemaRaw = match[1].trim();
  
  try {
    // Attempt to parse JSON
    const schema = JSON.parse(schemaRaw);
    return {
      hasSchema: true,
      schema,
      schemaRaw
    };
  } catch (error) {
    // In case of parsing error, keep the raw content
    return {
      hasSchema: true,
      schemaRaw,
      schema: null
    };
  }
}

export async function scanLiquidFiles(rootPath: string): Promise<LiquidFile[]> {
  const liquidFiles: LiquidFile[] = [];
  
  async function scanDirectory(currentPath: string) {
    try {
      const items = await fs.promises.readdir(currentPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item.name);
        
        if (item.isDirectory()) {
          // Recursively scan subdirectories
          await scanDirectory(fullPath);
        } else if (item.isFile() && item.name.endsWith('.liquid')) {
          // This is a .liquid file
          const stats = await fs.promises.stat(fullPath);
          const relativePath = path.relative(rootPath, fullPath);
          const directory = path.dirname(relativePath);
          
          // Read file content to extract schema
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8');
            const schemaInfo = extractSchema(content);
            
            liquidFiles.push({
              name: item.name,
              path: fullPath,
              relativePath: relativePath,
              size: stats.size,
              lastModified: stats.mtime,
              directory: directory === '.' ? 'root' : directory,
              hasSchema: schemaInfo.hasSchema,
              schema: schemaInfo.schema,
              schemaRaw: schemaInfo.schemaRaw
            });
          } catch (error) {
            console.error(`Error reading file ${fullPath}:`, error);
            // Add file without schema in case of error
            liquidFiles.push({
              name: item.name,
              path: fullPath,
              relativePath: relativePath,
              size: stats.size,
              lastModified: stats.mtime,
              directory: directory === '.' ? 'root' : directory,
              hasSchema: false
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${currentPath}:`, error);
    }
  }
  
  await scanDirectory(rootPath);
  return liquidFiles.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function groupFilesByDirectory(files: LiquidFile[]): Record<string, LiquidFile[]> {
  return files.reduce((groups, file) => {
    const dir = file.directory;
    if (!groups[dir]) {
      groups[dir] = [];
    }
    groups[dir].push(file);
    return groups;
  }, {} as Record<string, LiquidFile[]>);
}
