// 특정 div 요소를 PNG 이미지로 다운로드하는 함수
function PrintDiv(div) {
    div = div[0];
    html2canvas(div).then(function (canvas) {
        var myImage = canvas.toDataURL();
        downloadURI(myImage, "sheet_music.png")
    });
}

// 주어진 URI를 사용해 파일을 다운로드하는 함수
function downloadURI(uri, name) {
    var link = document.createElement("a")
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
}

// 원래 노트 값을 저장할 배열
const originalNotes = [];
// 플랫 음계 배열
const flatCharacters = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
// 샤프 음계 배열
const SharpCharacters = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 음을 변환하는 함수
function transformKey(character, direction) {

    // 플랫을 올리거나 내릴 때
    if (direction === 'upFlat' || direction === 'downFlat') {

        // 샤프 기호를 플랫으로 치환
        switch (character) {           
            case 'A#':
                character = 'B♭';
                break;
            case 'B#':
                character = 'C';
                break;
            case 'C#':
                character = 'D♭';
                break;
            case 'D#':
                character = 'E♭';
                break;
            case 'F#':
                character = 'G♭';
                break;
            case 'G#':
                character = 'A♭';
                break;
            case 'E#':
                character = 'F';
                break
            case 'C♭':
                character = 'B';
                break;
            case 'F♭':
                character = 'E';
                break;
            case 'N.C.':
                return 'N.C.';
            
            default:
        }

        const index = flatCharacters.indexOf(character);

        // 음을 3 세미톤 올림
        if (direction === 'upFlat') {
            if (index !== -1) {
                const newIndex = (index + 3) % flatCharacters.length;
                return flatCharacters[newIndex];
            } else {
                return "Invalid character";
            }
        }

        // 음을 2 세미톤 내림
        else {
            if (index !== -1) {
                const newIndex = (index - 2 + flatCharacters.length) % flatCharacters.length;
                return flatCharacters[newIndex];
            } else {
                return "Invalid character";
            }
        }

    // 샤프를 올리거나 내릴 때
    } else {
        // 플랫 기호를 샤프로 치환
        switch (character) {
            case 'A♭':
                character = 'G#';
                break;
            case 'B♭':
                character = 'A#';
                break;
            case 'C♭':
                character = 'B';
                break;
            case 'D♭':
                character = 'C#';
                break;
            case 'E♭':
                character = 'D#';
                break;
            case 'G♭':
                character = 'F#';
                break;          
            case 'F♭':
                character = 'E';
                break
            case 'B#':
                character = 'C';
                break;
            case 'E#':
                character = 'F';
                break;
            case 'N.C.':
                return 'N.C.';
            default:
        }

        const index = SharpCharacters.indexOf(character);

        // 음을 3 세미톤 올림
        if (direction === 'upSharp') {
            if (index !== -1) {
                const newIndex = (index + 3) % SharpCharacters.length;
                return SharpCharacters[newIndex];
            } else {
                return "Invalid character";
            }
        }

        // 음을 2 세미톤 내림
        else {
            if (index !== -1) {
                const newIndex = (index - 2 + SharpCharacters.length) % SharpCharacters.length;
                return SharpCharacters[newIndex];
            } else {
                return "Invalid character";
            }
        }
    }
}

// 노트를 변환하는 함수
function convertNote(direction) {
    originalNotes.forEach(data => {
        let currentNote = data.originalNote;  // 원래 노트를 가져옴
        if (data.SFText) {
            currentNote += data.SFText;  // 플랫 기호가 있으면 추가
        }

        let newNote;
        // 변환 방향에 따라 새로운 노트를 설정
        if (direction === 'upFlat') {
            newNote = transformKey(currentNote, 'upFlat');  // 음 변환 (올리기)
        } else if (direction === 'downFlat') {
            newNote = transformKey(currentNote, 'downFlat');  // 음 변환 (내리기)
        } else if (direction === 'downSharp') {
            newNote = transformKey(currentNote, 'downSharp');  // 음 변환 (내리기)
        } else if (direction === 'upSharp') {
            newNote = transformKey(currentNote, 'upSharp');  // 음 변환 (올리기)
        } else {
            newNote = currentNote;  // 기본값 (변환 없음)
        }

        if (newNote !== "Invalid character") {
            // 변환된 음표와 플랫 기호 설정
            if (newNote.length > 1) {
                if (newNote === 'N.C.') {
                    data.noteElement.innerText = 'N.C.';
                    data.SFElement.innerText = '';      
                } else {
                data.noteElement.innerText = newNote[0];  // 음표 설정
                data.SFElement.innerText = newNote.slice(1);  // 플랫 기호 설정
                }
            } else {
                data.noteElement.innerText = newNote;  // 음표 설정
                data.SFElement.innerText = '';  // 플랫 기호가 없으면 빈 문자열 설정
            }
        } 

        // 슬래시 노트와 SF 텍스트 변환
        let currentSlashNote = data.originalSlashNote;  // 원래 슬래시 노트를 가져옴
        if (data.slashSFText) {
            currentSlashNote += data.slashSFText;  // 플랫 기호가 있으면 추가
        }

        let newSlashNote;
        // 변환 방향에 따라 새로운 슬래시 노트를 설정
        if (direction === 'upFlat') {
            newSlashNote = transformKey(currentSlashNote, 'upFlat');  // 음 변환 (올리기)
        } else if (direction === 'downFlat') {
            newSlashNote = transformKey(currentSlashNote, 'downFlat');  // 음 변환 (내리기)
        } else if (direction === 'downSharp') {
            newSlashNote = transformKey(currentSlashNote, 'downSharp');  // 음 변환 (내리기)
        } else if (direction === 'upSharp') {
            newSlashNote = transformKey(currentSlashNote, 'upSharp');  // 음 변환 (올리기)
        } else {
            newSlashNote = currentSlashNote;  // 기본값 (변환 없음)
        }

        if (newSlashNote !== "Invalid character") {
            // 변환된 슬래시 음표와 플랫 기호 설정
            if (newSlashNote.length > 1) {
                data.slashNoteElement.innerText = newSlashNote[0];  // 슬래시 음표 설정
                data.slashSFElement.innerText = newSlashNote.slice(1);  // 플랫 기호 설정
            } else {
                data.slashNoteElement.innerText = newSlashNote;  // 슬래시 음표 설정
                data.slashSFElement.innerText = '';  // 플랫 기호가 없으면 빈 문자열 설정
            }
        }

        const noteDiv = data.noteElement.closest('.note');

        // class="note" data-code 변경
        noteDiv.setAttribute('data-code1', data.noteElement.innerText);
        noteDiv.setAttribute('data-code6', data.slashNoteElement.innerText);

        // 플랫과 샤프 기호에 따라 data-code2와 data-code7을 설정
        if (data.SFElement.innerText === '♭')
            noteDiv.setAttribute('data-code2', 'b');
        else if (data.SFElement.innerText === '#')
            noteDiv.setAttribute('data-code2', '#');
        else
            noteDiv.setAttribute('data-code2', '');

        if (data.slashSFElement.innerText === '♭')
            noteDiv.setAttribute('data-code7', 'b');
        else if (data.slashSFElement.innerText === '#')
            noteDiv.setAttribute('data-code7', '#');
        else
            noteDiv.setAttribute('data-code7', '');

        // data-code1부터 data-code7까지 값을 가져와 문자열로 합침
        const baseCodes = ['data-code1', 'data-code2', 'data-code3-1',
            'data-code3-2', 'data-code4', 'data-code5-1', 'data-code5-2']
            .map(attr => {
                const value = noteDiv.getAttribute(attr) || '';
                if (attr === 'data-code5-1' || attr === 'data-code5-2') {
                    return value ? `(${value})` : ''; // 값이 있을 경우 괄호 추가
                }
                return value;
            })
            .join('');

        const code6 = noteDiv.getAttribute('data-code6') || '';
        const code7 = noteDiv.getAttribute('data-code7') || '';

        // 합쳐진 문자열을 data-code에 설정
        const combinedCode = code6 ? `${baseCodes}/${code6}${code7}` : `${baseCodes}${code7}`;
        noteDiv.setAttribute('data-code', combinedCode);
    });
}

$(() => {
    // 저장 버튼 클릭 시 스크롤 맨 위로 이동
    $('.save_btn .hover').click((e) => {
        e.preventDefault();
        window.scrollTo(0, 0);
    });

    // 악보 높이 설정
    const jointNum = $('.aline >.joint').length;
    const hgt = Math.ceil(jointNum / (9 * 4)) * 960;
    $('#sheet_music').css({ 'height': hgt });

    // 음정 선택 드롭다운 추가
    $('.wrap').append(`
        <select class="pitch_selcet">
            <option value="default" selected>1. 기본(C key)</option>
            <option value="downFlat">2. Bb key(♭)</option>
            <option value="upFlat">3. Eb key(♭)</option>
            <option value="downSharp">4. Bb key(#)</option>
            <option value="upSharp">5. Eb key(#)</option>
        </select>
    `);

    // 드롭다운 변경 시 노트 변환 함수 호출
    $('.pitch_selcet').change(() => {
        const selectedKey = $('.pitch_selcet').val();
        convertNote(selectedKey);
    });
});

// 스크립트 로드 함수
function loadScript(url, callback) {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", function () {
    loadScript('../pub/codehtml.js',  function () {
        // codehtml.js가 작업을 완료한 후 100ms 지연하여 요소 선택
        setTimeout(() => {
            const elements = document.querySelectorAll('.jam1_txt');  // 모든 .jam1_txt 요소 선택

            elements.forEach(element => {
                const parentElement = element.closest('.jam1_box');  // 부모 요소 찾기
                const SFElement = parentElement.querySelector('.jam2_txt');  // jam2_txt 요소 찾기
                const SFText = SFElement.innerText.trim();  // 플랫 기호가 있는지 확인하고 텍스트 추출

                const slashNoteElement = parentElement.querySelector('.jam6_txt'); // jam6_txt 요소 찾기
                const slashElement = parentElement.querySelector('.jam7_txt');  // jam7_txt 요소 찾기
                const slashSFText = slashElement.innerText.trim();  // 플랫 기호가 있는지 확인하고 텍스트 추출

                // 원래 노트와 플랫 기호를 저장
                originalNotes.push({
                    noteElement: element,
                    SFElement: SFElement,
                    originalNote: element.innerText.trim(),
                    SFText: SFText,
                    slashNoteElement: slashNoteElement,
                    slashSFElement: slashElement,
                    originalSlashNote: slashNoteElement.innerText.trim(),
                    slashSFText: slashSFText
                });
            });
        }, 100); // 100ms 지연
    });
});
