import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
import os

def preprocess_image(image_path):
    try:
        image = Image.open(image_path)
        gray = ImageOps.grayscale(image)
        enhanced_image = ImageEnhance.Contrast(gray).enhance(2)
        binary_image = enhanced_image.point(lambda x: 0 if x < 150 else 255, '1')
        binary_image = binary_image.filter(ImageFilter.MedianFilter())
        binary_image = binary_image.filter(ImageFilter.SHARPEN)
        return binary_image
    except Exception as e:
        print(f"Exception occurred while preprocessing image: {e}")
        return None

def count_lines(image_path):
    try:
        # Load image using PIL
        pil_image = Image.open(image_path).convert('L')
        # Convert PIL image to OpenCV format
        open_cv_image = np.array(pil_image)

        # Apply edge detection
        edges = cv2.Canny(open_cv_image, 50, 150, apertureSize=3)

        # Detect lines using Hough Line Transform
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, 100, minLineLength=100, maxLineGap=10)

        if lines is not None:
            # Filter out vertical lines
            vertical_lines = [line for line in lines if abs(line[0][0] - line[0][2]) < 10]
            
            # Calculate unique y-coordinates of the vertical lines
            y_coordinates = sorted(set(line[0][1] for line in vertical_lines))
            num_lines = len(y_coordinates) - 1
            
            return num_lines
        else:
            return 0
    except Exception as e:
        print(f"Exception occurred while processing image: {e}")
        return 0

def generate_html_content(num_joints):
    html_header = '''
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
                <!-- 1 -->
                <!-- 1 line -->
                <div class="joint">
                    <div class="beat">
                        <span>4</span>
                        <span>4</span>
                    </div>
                    
                </div>
                
                <div class="joint">
                    
                </div>

                <div class="joint">
                    
                </div>

                <div class="joint">
                    
                </div>
                '''

    html_footer = '''
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
    '''

    html_body = ""
    for i in range(2, num_joints + 1):
        for j in range(4):
            joint_class = "joint"
            if i == num_joints and j == 3:
                joint_class = "joint end_line"
            if j == 0:
                html_body += f'''
                <!-- {((i - 1) * 4) + 1} -->
                <!-- {i} line -->
                <div class="{joint_class}">
                    
                </div>
                '''
            else:
                html_body += f'''
                <div class="{joint_class}">
                    
                </div>
                '''

    return html_header + html_body + html_footer

def process_images(input_dir, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    for filename in os.listdir(input_dir):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            image_path = os.path.join(input_dir, filename)
            output_html_path = os.path.join(output_dir, f"{os.path.splitext(filename)[0]+'(C)'}.html")
            
            # Count lines in the image
            num_lines = count_lines(image_path)
            
            # Generate HTML content
            html_content = generate_html_content(num_lines)
            
            # Save HTML to file
            with open(output_html_path, 'w', encoding='utf-8') as f:
                f.write(html_content)
            print(f"Processed {image_path} -> {output_html_path}")

# 입력 디렉토리와 출력 디렉토리 경로 설정
input_dir = r'C:\Users\애드업\Desktop\test\[악보] 기본제공'
output_dir = r'C:\Users\애드업\Desktop\test\임시'

# 디렉토리 내 모든 이미지 파일을 처리하여 HTML 파일 생성
process_images(input_dir, output_dir)
