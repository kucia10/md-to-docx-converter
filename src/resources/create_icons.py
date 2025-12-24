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

def create_ico_from_png(png_path, ico_path, sizes=[16, 32, 48, 64, 128, 256]):
    """PNG 파일을 ICO 파일로 변환합니다."""
    try:
        images = []
        for size in sizes:
            # 각 크기로 이미지 리사이즈
            img = Image.open(png_path)
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            images.append(img)
        
        # ICO 파일로 저장
        images[0].save(ico_path, format='ICO', sizes=[(size, size) for size in sizes])
        print(f"ICO 파일 생성 완료: {ico_path}")
        return True
    except Exception as e:
        print(f"ICO 파일 생성 실패: {e}")
        return False

def create_icns_from_png(png_path, icns_path, sizes=[16, 32, 64, 128, 256, 512, 1024]):
    """PNG 파일을 ICNS 파일로 변환합니다."""
    try:
        from PIL import Image
        import icns
        
        images = []
        for size in sizes:
            # 각 크기로 이미지 리사이즈
            img = Image.open(png_path)
            img = img.resize((size, size), Image.Resampling.LANCZOS)
            images.append(img)
        
        # ICNS 파일로 저장
        icns_images = []
        for img in images:
            icns_images.append(img)
        
        icns.save(icns_path, icns_images)
        print(f"ICNS 파일 생성 완료: {icns_path}")
        return True
    except Exception as e:
        print(f"ICNS 파일 생성 실패: {e}")
        return False

def create_all_icons():
    """모든 OS별 아이콘 파일을 생성합니다."""
    svg_file = "icon.svg"
    
    if not os.path.exists(svg_file):
        print(f"SVG 파일을 찾을 수 없습니다: {svg_file}")
        return False
    
    # 기본 PNG 파일 생성 (256x256)
    png_file = "icon.png"
    if not os.path.exists(png_file):
        print("기본 PNG 파일 생성...")
        svg_to_png(svg_file, png_file, (256, 256))
    
    # Windows ICO 파일 생성
    ico_file = "icon.ico"
    if not os.path.exists(ico_file):
        print("Windows ICO 파일 생성...")
        create_ico_from_png(png_file, ico_file)
    
    # macOS ICNS 파일 생성
    icns_file = "icon.icns"
    if not os.path.exists(icns_file):
        print("macOS ICNS 파일 생성...")
        create_icns_from_png(png_file, icns_file)
    
    # Linux용 다양한 크기의 PNG 파일 생성
    linux_sizes = [16, 32, 48, 64, 128, 256, 512, 1024]
    for size in linux_sizes:
        linux_png = f"icon_{size}x{size}.png"
        if not os.path.exists(linux_png):
            print(f"Linux용 {size}x{size} PNG 파일 생성...")
            svg_to_png(svg_file, linux_png, (size, size))
    
    print("모든 아이콘 파일 생성 완료!")
    return True

if __name__ == "__main__":
    create_all_icons()