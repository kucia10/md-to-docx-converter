import os
import sys
from PIL import Image
import cairosvg

def svg_to_png(svg_path, png_path, size=(256, 256)):
    """SVG 파일을 PNG 파일로 변환합니다."""
    try:
        # CairoSVG를 사용하여 SVG를 PNG로 변환
        cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=size[0], output_height=size[1])
        print(f"변환 완료: {svg_path} -> {png_path}")
        return True
    except Exception as e:
        print(f"변환 실패: {e}")
        return False

if __name__ == "__main__":
    svg_file = "icon.svg"
    png_file = "icon.png"
    
    if os.path.exists(svg_file):
        svg_to_png(svg_file, png_file)
    else:
        print(f"SVG 파일을 찾을 수 없습니다: {svg_file}")