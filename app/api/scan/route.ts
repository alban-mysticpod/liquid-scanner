import { NextRequest, NextResponse } from 'next/server';
import { scanLiquidFiles } from '../../../lib/fileScanner';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to the ThemeFiles folder inside the project
    const themeRootPath = path.resolve(process.cwd(), 'ThemeFiles');
    
    console.log('Scanning directory:', themeRootPath);
    
    const liquidFiles = await scanLiquidFiles(themeRootPath);
    
    return NextResponse.json({
      success: true,
      count: liquidFiles.length,
      files: liquidFiles,
      scannedPath: themeRootPath
    });
  } catch (error) {
    console.error('Error during scan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error scanning liquid files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
