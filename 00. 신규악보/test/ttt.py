import pytesseract
from PIL import Image, ImageEnhance, ImageFilter
import os

# Tesseract 실행 파일 경로 설정 (Tesseract 설치 경로)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# 이미지 전처리 함수
def preprocess_image(image_path):
    # 이미지 열기
    image = Image.open(image_path)
    # 이미지 확대
    scale_factor = 2  # 확대 배율 설정
    width, height = image.size
    image = image.resize((width * scale_factor, height * scale_factor), Image.LANCZOS)
    # 이미지 대비 조정
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(2)
    # 이미지 필터링
    image = image.filter(ImageFilter.SHARPEN)
    # 이미지 저장 (디버깅 용도)
    preprocessed_image_path = image_path.replace('.png', '_preprocessed.png')
    image.save(preprocessed_image_path)
    return preprocessed_image_path

# 이미지 파일 경로
image_paths = [r'C:\Users\애드업\Desktop\test\musical_chords.png']

# Tesseract 설정 - 숫자, 영어 대소문자, 특정 특수문자만 인식
custom_config = r'-c tessedit_char_whitelist=2345679ABCDEFGLTabdgilmostu#()/% --psm 6'

# HTML 파일 시작 부분
html_content = """
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>악보 음표</title>
    <link rel="stylesheet" href="../pub/common.css">
    <link rel="stylesheet" href="../pub/style.css">
    <script src="../pub/html2canvas.js"></script>
    <script src="../pub/jquery-3.3.1.min.js"></script>
    <script src="../pub/code.js"></script>
</head>
<body>
    <div class="wrap">
        <div class="sheet_music" id="sheet_music" data-sheet="Db">
            <div class="aline">
"""

# 각 이미지에서 텍스트 추출 및 HTML에 추가
for image_path in image_paths:
    preprocessed_image_path = preprocess_image(image_path)
    text = pytesseract.image_to_string(Image.open(preprocessed_image_path), config=custom_config)
    lines = text.split('\n')
    for line in lines:
        # 추출된 줄이 빈 문자열이 아니면 추가
        if line.strip():
            html_content += f'<div class="joint"><code>{line}</code></div>\n'

# HTML 파일 끝 부분
html_content += """
            </div>
        </div>
        
        <div class="save_wrap">
            <div class="save_btn">
                <a class="hover" href='javascript:void(0);' onclick="PrintDiv($('#sheet_music'));">이미지로 저장</a>
            </div>
        </div>
    </div>
</body>
</html>
"""

# HTML 파일 저장
output_path = r'C:\Users\애드업\Desktop\test\output.html'
with open(output_path, 'w', encoding='utf-8') as file:
    file.write(html_content)

print(f'HTML file saved to {output_path}')
