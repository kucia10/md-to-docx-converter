#!/usr/bin/env python3
"""
Markdown to DOCX Converter using Pandoc
"""

import argparse
import sys
import os
import json
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional


class PandocConverter:
    def __init__(self):
        self.pandoc_path = self._get_pandoc_path()
        # Get the directory where this script is located
        self.script_dir = Path(__file__).parent.resolve()
        
    def _get_pandoc_path(self) -> str:
        """Get the path to the bundled Pandoc executable"""
        if getattr(sys, 'frozen', False):
            # Running as a bundled executable
            if sys.platform == 'win32':
                return os.path.join(os.path.dirname(sys.executable), 'bin', 'pandoc.exe')
            else:
                return os.path.join(os.path.dirname(sys.executable), 'bin', 'pandoc')
        else:
            # Running in development
            return 'pandoc'
    
    def convert(
        self,
        input_path: str,
        output_path: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Convert Markdown to DOCX using Pandoc
        
        Args:
            input_path: Path to input Markdown file
            output_path: Path to output DOCX file
            options: Conversion options dictionary
            
        Returns:
            Dictionary with conversion result
        """
        try:
            # Validate input file
            if not os.path.exists(input_path):
                return {
                    'success': False,
                    'error': f'Input file not found: {input_path}'
                }
            
            # Create output directory if it doesn't exist
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)
            
            # Build Pandoc command
            cmd = self._build_pandoc_command(input_path, output_path, options)
            
            # Execute Pandoc
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60  # 60 seconds timeout
            )
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'message': 'Conversion completed successfully',
                    'output_path': output_path,
                    'input_path': input_path
                }
            else:
                return {
                    'success': False,
                    'error': f'Pandoc failed: {result.stderr}',
                    'return_code': result.returncode
                }
                
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Conversion timed out after 60 seconds'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def _build_pandoc_command(
        self,
        input_path: str,
        output_path: str,
        options: Dict[str, Any]
    ) -> list:
        """Build Pandoc command with options"""
        cmd = [self.pandoc_path]
        
        # Input and output files
        cmd.extend([input_path, '-o', output_path])
        
        # Basic options
        cmd.append('--from=markdown')
        cmd.append('--to=docx')
        cmd.append('--standalone')
        
        # Default font settings (Georgia, 14pt)
        cmd.extend(['--variable', 'fontfamily=Georgia'])
        cmd.extend(['--variable', 'fontsize=14pt'])
        
        # Default line spacing (1.5)
        cmd.extend(['--variable', 'line-spacing=1.5'])
        
        # Default page orientation (portrait)
        orientation = options.get('orientation', 'portrait')
        if orientation == 'landscape':
            cmd.extend(['--variable', 'class=landscape'])
        
        # Default margins (top:2.54cm, bottom:2.54cm, left:3.18cm, right:3.18cm)
        cmd.extend(['--variable', 'margin-top=2.54cm'])
        cmd.extend(['--variable', 'margin-bottom=2.54cm'])
        cmd.extend(['--variable', 'margin-left=3.18cm'])
        cmd.extend(['--variable', 'margin-right=3.18cm'])
        
        # Table of contents (enabled by default)
        cmd.append('--toc')
        cmd.extend(['--toc-depth', '3'])
        
        # Reference style (disabled due to missing/corrupted reference doc)
        # Use default Pandoc styling instead
        # reference_style = options.get('referenceStyle', 'chicago')
        # if reference_style and (self.script_dir / 'filters' / 'chicago-reference.docx').exists():
        #     reference_doc_path = self.script_dir / 'filters' / 'chicago-reference.docx'
        #     cmd.extend(['--citeproc', f'--reference-doc={reference_doc_path}'])
        
        # Highlight style for code blocks
        cmd.extend(['--highlight-style', 'pygments'])
        
        # Custom document properties
        cmd.extend(['--variable', 'documentclass=article'])
        cmd.extend(['--variable', 'papersize=A4'])
        
        return cmd


def main():
    """Main function to handle command line arguments"""
    parser = argparse.ArgumentParser(description='Convert Markdown to DOCX using Pandoc')
    parser.add_argument('--input', required=True, help='Input Markdown file path')
    parser.add_argument('--output', required=True, help='Output DOCX file path')
    parser.add_argument('--font-size', type=int, help='Font size in points')
    parser.add_argument('--font-family', help='Font family name')
    parser.add_argument('--line-height', type=float, help='Line height')
    parser.add_argument('--margin-top', type=float, help='Top margin in cm')
    parser.add_argument('--margin-bottom', type=float, help='Bottom margin in cm')
    parser.add_argument('--margin-left', type=float, help='Left margin in cm')
    parser.add_argument('--margin-right', type=float, help='Right margin in cm')
    parser.add_argument('--orientation', choices=['portrait', 'landscape'], help='Page orientation')
    parser.add_argument('--generate-toc', action='store_true', help='Generate table of contents')
    parser.add_argument('--reference-style', choices=['apa', 'mla', 'chicago', 'harvard'], help='Citation style')
    parser.add_argument('--image-handling', choices=['embed', 'link'], help='Image handling method')
    parser.add_argument('--code-block-style', choices=['fenced', 'indented'], help='Code block style')
    
    args = parser.parse_args()
    
    # Convert args to options dictionary
    options = {
        'fontSize': args.font_size,
        'fontFamily': args.font_family,
        'lineHeight': args.line_height,
        'marginTop': args.margin_top,
        'marginBottom': args.margin_bottom,
        'marginLeft': args.margin_left,
        'marginRight': args.margin_right,
        'orientation': args.orientation,
        'generateToc': args.generate_toc,
        'referenceStyle': args.reference_style,
        'imageHandling': args.image_handling,
        'codeBlockStyle': args.code_block_style,
    }
    
    # Filter out None values
    options = {k: v for k, v in options.items() if v is not None}
    
    # Create converter and perform conversion
    converter = PandocConverter()
    result = converter.convert(args.input, args.output, options)
    
    # Output result as JSON
    print(json.dumps(result))
    
    # Exit with appropriate code
    sys.exit(0 if result['success'] else 1)


if __name__ == '__main__':
    main()