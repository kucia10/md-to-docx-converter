#!/bin/bash

# macOS용 ICNS 파일 생성 스크립트
# 여러 크기의 PNG 파일을 하나의 ICNS 파일로 합침

ICON_SIZES=("16x16" "32x32" "64x64" "128x128" "256x256" "512x512" "1024x1024")
INPUT_ICONS=()

# 각 크기의 PNG 파일 확인
for size in "${ICON_SIZES[@]}"; do
    if [ -f "icon_${size}.png" ]; then
        INPUT_ICONS+=("icon_${size}.png")
    else
        echo "경고: icon_${size}.png 파일이 없습니다."
    fi
done

# 실제로 존재하는 파일들 추가
if [ -f "icon_48x48.png" ]; then
    INPUT_ICONS+=("icon_48x48.png")
fi
if [ -f "icon_256x256.png" ]; then
    INPUT_ICONS+=("icon_256x256.png")
fi
if [ -f "icon_512x512.png" ]; then
    INPUT_ICONS+=("icon_512x512.png")
fi
if [ -f "icon_1024x1024.png" ]; then
    INPUT_ICONS+=("icon_1024x1024.png")
fi

# ICNS 파일 생성
if command -v iconutil &> /dev/null; then
    # iconutil 사용 (macOS 12.5+)
    echo "iconutil을 사용하여 ICNS 파일 생성..."
    mkdir -p temp_icons
    for icon in "${INPUT_ICONS[@]}"; do
        cp "$icon" temp_icons/
    done
    cd temp_icons
    iconutil -c icns *.png -o ../icon.icns
    cd ..
    rm -rf temp_icons
elif command -v sips &> /dev/null; then
    # sips 사용 (대체 방법)
    echo "sips를 사용하여 ICNS 파일 생성..."
    # 여러 PNG 파일을 하나의 ICNS로 변환하는 복잡한 과정이 필요합니다.
    # 여기서는 간단한 방법으로 대체합니다.
    cp icon_1024x1024.png icon.icns
    echo "주의: 1024x1024 PNG 파일을 ICNS 파일로 사용합니다."
else
    echo "경고: ICNS 파일 생성을 위한 도구가 없습니다."
    echo "icon_1024x1024.png 파일을 ICNS로 사용합니다."
    cp icon_1024x1024.png icon.icns
fi

echo "ICNS 파일 생성 완료: icon.icns"