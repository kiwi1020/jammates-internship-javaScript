// const data = 'C#majadd7(#5)(#9)/Gb';

$(() => {
    const promises = []; // 각 코드 요소에 대한 Promise 배열 선언

    $('code').each((i, target) => {
        const $target = $(target);
        const beat = $target.attr('data-beat') === undefined ? '1/2' : $target.attr('data-beat');
        const shortCode = $target.text();
        let positions;
        // extractSymbolPositions 함수 실행 및 Promise 반환
        const promise = new Promise((resolve, reject) => {
            positions = extractSymbolPositions(shortCode, i).map(cleanString); // 데이터 처리 비동기 작업 수행
            resolve(); // 데이터 처리 완료 시 Promise resolve
        });
        
        promises.push(promise); // 배열에 Promise 추가

        promise.then(() => {
            console.log(positions)
            let [position_1,position_2,position_3_1,position_3_2,position_4,position_5_1,position_5_2,position_6,position_7] = positions;
            let [replaced_1,replaced_2,replaced_3_1,replaced_3_2,replaced_4,replaced_5_1,replaced_5_2,replaced_6,replaced_7] = positions.map(item=>item.replace(/b/g, '♭').replace(/\balt\b/gi, 'alt').replace(/[♭#]/g, match => `<span class="SF_HambakSnow">${match}</span>`));
            const newDiv = `
                <div class="note" data-beat="${beat}" data-code="${shortCode}" data-code1="${position_1}" data-code2="${position_2}" data-code3="${position_3_1}${position_3_2}" data-code3-1="${position_3_1}" data-code3-2="${position_3_2}" data-code4="${position_4}" data-code5="${position_5_1}${position_5_2}" data-code5-1="${position_5_1}" data-code5-2="${position_5_2}" data-code6="${position_6}" data-code7="${position_7}">
                    <div class="jam1_box">
                        <span class="jam1_txt">${replaced_1}</span>
                        <div class="jam1_top">
                            <span class="jam2_txt">
                                ${replaced_2}
                            </span>
                            <div class="jam5_box">
                                <span class="jam5_txt jam5_2_txt">${replaced_5_2}</span>
                                <span class="jam5_txt jam5_1_txt">${replaced_5_1}</span>
                            </div>
                        </div>
                        <div class="jam1_btm">
                            <span class="jam3_txt jam3_1_txt">${replaced_3_1}</span>
                            <span class="jam3_txt jam3_2_txt">${replaced_3_2}</span>
                            <div class="jam3_top">
                                <span class="jam4_txt">${replaced_4}</span>
                            </div>
                            <div class="jam3_btm">
                                <span class="jam6_txt">${replaced_6}</span>
                                <span class="jam7_txt">${replaced_7}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $target.replaceWith(newDiv); // DOM 업데이트
        });
    });
    
});


// 심볼 위치를 추출하는 함수
function extractSymbolPositions(data, index) {
    // 주어진 인덱스에서 괄호 안의 내용을 추출하는 함수
    function extractParentheses(startIndex) {
        const firstParenIndex = data.indexOf(')', startIndex); // 첫 번째 닫는 괄호의 위치 찾기
        if (firstParenIndex !== -1) { // 닫는 괄호가 존재할 때
            const part1 = data.slice(startIndex, firstParenIndex + 1); // 시작 인덱스부터 첫 번째 닫는 괄호까지 추출
            const secondParenIndex = data.indexOf(')', firstParenIndex + 1); // 두 번째 닫는 괄호의 위치 찾기
            if (secondParenIndex !== -1) { // 두 번째 닫는 괄호가 존재할 때
                const part2 = data.slice(firstParenIndex + 1, secondParenIndex + 1); // 첫 번째 닫는 괄호 다음부터 두 번째 닫는 괄호까지 추출
                return [part1, part2];
            }
            return [part1, null]; // 두 번째 닫는 괄호가 없을 때
        }
        return [null, null]; // 닫는 괄호가 전혀 없을 때
    }

    let position_1 = null,
        position_2 = null,
        position_3_1 = null,
        position_3_2 = null,
        position_4 = null,
        position_5_1 = null,
        position_5_2 = null,
        position_6 = null,
        position_7 = null;
    // '/'의 위치 찾기
    let slashIndex = data.indexOf('/');

    if (slashIndex !== -1) { // '/'가 존재할 때
        // Am, Bm, Cm 등의 경우
        if (!(data[slashIndex + 2] == '#' || data[slashIndex + 2] == 'b')) {
            // '/' 이후 세 글자를 position_6에 할당
            position_6 = data.slice(slashIndex, slashIndex + 3);
            // '/' 이후 한 글자를 position_7에 할당
            if (data.slice(slashIndex + 3))
                position_7 = data.slice(slashIndex + 3, slashIndex + 4);
        } 
        // Ab, Bb, Cb 등의 경우
        else {
            // '/' 이후 두 글자를 position_6에 할당
            position_6 = data.slice(slashIndex, slashIndex + 2);
            // '/' 이후 한 글자를 position_7에 할당
            if (data.slice(slashIndex + 2))
                position_7 = data.slice(slashIndex + 2, slashIndex + 3);
        }
    }

    // 첫 번째 문자 추출
    let firstChar = data.slice(0, 1);

    // 첫 번째 문자가 대문자(A-Z) 혹은 '%' 인지 확인
    if (firstChar >= 'A' && firstChar <= 'Z' || firstChar == '%') {
        // 첫 번째 문자가 'N'인 경우 처리
        if (firstChar === 'N') {
            position_1 = data.slice(0, 4); // 첫 번째 자리부터 4자리까지 추출 
        } // 첫 번째 문자가 '%'인 경우 처리 
        else if (firstChar === '%') {
            position_1 = data.slice(0, 1); // 첫 번째 자리 추출
        } else {
            position_1 = firstChar; // 첫 번째 문자를 position_1에 할당

            // 두 번째 문자 추출
            let secondChar = data.slice(1, 2);

            // 두 번째 문자가 '#' 또는 'b'인 경우 처리
            if (secondChar === '#' || secondChar === 'b') {
                position_2 = secondChar; // 두 번째 문자를 position_2에 할당

                // 세 번째 문자가 6~9 숫자인지 확인

                let thirdChar = data.slice(2, 3);
                if (thirdChar >= '6' && thirdChar <= '9') {
                    position_3_1 = thirdChar; // 세 번째 문자를 position_3_1에 할당
                    let thirdTwoChar = data.slice(3, 4);

                    // 네 번째 자리가 정수인지 확인
                    if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                        // 네 번째 자리의 숫자가 11 또는 13인 경우 처리
                        if (thirdTwoChar === '1') {
                            position_4 = data.slice(3, 5); // 네 번째 자리와 그 다음 자리까지 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(5); // 다섯 번째 자리부터 괄호 내용 추출
                        } else { // 네 번째 자리의 숫자가 2, 4, 7, 6, 9인 경우 처리
                            position_4 = data.slice(3, 4); // 네 번째 자리만 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(4); // 네 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '(') { // 세 번째 자리 이후 바로 괄호가 있는 경우
                        // 3-2 <-> 5-1 변환식
                        if (!document.querySelectorAll('code')[index].hasAttribute('data-beat')) {
                            if (extractParentheses(3)[0].length >= 6 && position_4 == null) {
                                [position_3_2, position_5_1] = extractParentheses(3);
                                let match = position_3_2.match(/([a-zA-Z]+)(\d+)/);
                                if (match && match[1]) {
                                    position_3_2 = match[1]; // 문자 부분
                                    position_4 = match[2];   // 숫자 부분
                                    }
                                else {
                                    position_3_2 = null;
                                    [position_5_1, position_5_2] = extractParentheses(3); // 세 번째 자리부터 괄호 내용 추출
                                }
                            }
                            else {
                                if (extractParentheses(2)[0].startsWith('(a') === true || extractParentheses(2)[0].startsWith('(s') === true) {
                                    [position_3_1, position_5_1] = extractParentheses(3);
                                } else {   
                                    [position_5_1, position_5_2] = extractParentheses(3); // 두 번째 자리부터 괄호 내용 추출
                                }
                            }
                        }
                        else {
                            [position_5_1, position_5_2] = extractParentheses(3); // 두 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '/' || thirdTwoChar === '') { // 3-2자리가 없는 경우
                        position_3_2 = null;
                    } else { // 세 번째 자리에 add, sus, alt가 있는 경우 처리
                        position_3_2 = data.slice(3, 6); // 세 번째 자리부터 세 글자를 position_3_2에 할당
                        let fourthChar = data.slice(6, 7);
                        if (+fourthChar >= 1 && +fourthChar <= 13) {
                            if (fourthChar === '1') {
                                position_4 = data.slice(6, 8); // 여섯 번째 자리와 그 다음 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(8); // 여덟 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = fourthChar; // 네 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParenteses(7); // 일곱 번째 자리부터 괄호 내용 추출
                            }
                        } else {
                            [position_5_1, position_5_2] = extractParentheses(6); // 여섯 번째 자리부터 괄호 내용 추출
                        }
                    }
                } else if (thirdChar === '1') { // 세 번째 자리가 1인 경우 처리
                    position_3_1 = data.slice(2, 4); // 세 번째 자리와 그 다음 자리까지 position_3_1에 할당
                    let thirdTwoChar = data.slice(4, 5);
                    if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                        if (thirdTwoChar === '1') {
                            position_4 = data.slice(4, 6); // 네 번째 자리와 그 다음 자리까지 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(6); // 여섯 번째 자리부터 괄호 내용 추출
                        } else {
                            position_4 = data.slice(4, 5); // 네 번째 자리만 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(5); // 다섯 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '(') { // 세 번째 자리 이후 바로 괄호가 있는 경우
                        // 3-2 <-> 5-1 변환식
                        if (!document.querySelectorAll('code')[index].hasAttribute('data-beat')) {
                            if (extractParentheses(4)[0].length >= 6 && position_4 == null) {
                                [position_3_2, position_5_1] = extractParentheses(4);
                                let match = position_3_2.match(/([a-zA-Z]+)(\d+)/);
                                if (match && match[1]) {
                                    position_3_2 = match[1]; // 문자 부분
                                    position_4 = match[2];   // 숫자 부분
                                    }
                                else {
                                    position_3_2 = null;
                                    [position_5_1, position_5_2] = extractParentheses(4); // 네 번째 자리부터 괄호 내용 추출
                                }
                            }
                            else {
                                [position_5_1, position_5_2] = extractParentheses(4); // 네 번째 자리부터 괄호 내용 추출
                            }
                        }
                        else { 
                            [position_5_1, position_5_2] = extractParentheses(4); // 네 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '/' || thirdTwoChar === '') { // 3-2자리가 없는 경우
                        position_3_2 = null;
                    } else {
                        position_3_2 = data.slice(4, 7); // 네 번째 자리부터 세 글자를 position_3_2에 할당
                        let fourthChar = data.slice(7, 8);
                        if (+fourthChar >= 1 && +fourthChar <= 13) {
                            if (fourthChar === '1') {
                                position_4 = data.slice(7, 9); // 일곱 번째 자리와 그 다음 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(9); // 아홉 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = data.slice(7, 8); // 일곱 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(8); // 여덟 번째 자리부터 괄호 내용 추출
                            }
                        } else {
                            [position_5_1, position_5_2] = extractParentheses(7); // 일곱 번째 자리부터 괄호 내용 추출
                        }
                    }
                } else if (thirdChar === '(') { // 3-1 자리 이후 바로 괄호가 있는 경우
                    // 3-2 <-> 5-1 변환식
                    if (!document.querySelectorAll('code')[index].hasAttribute('data-beat')) {
                        if (extractParentheses(2)[0].length >= 6 && position_4 == null) {
                            [position_3_2, position_5_1] = extractParentheses(2);
                            let match = position_3_2.match(/([a-zA-Z]+)(\d+)/);
                            if (match && match[1]) {
                                position_3_2 = match[1]; // 문자 부분
                                position_4 = match[2];   // 숫자 부분
                                
                                }
                            else {
                                position_3_2 = null;
                                [position_5_1, position_5_2] = extractParentheses(2); // 두 번째 자리부터 괄호 내용 추출
                            }
                        }
                        else {
                            if (extractParentheses(2)[0].startsWith('(a') === true || extractParentheses(2)[0].startsWith('(s') === true) {
                                [position_3_1, position_5_1] = extractParentheses(3);
                            } else {   
                                
                                [position_5_1, position_5_2] = extractParentheses(3); // 두 번째 자리부터 괄호 내용 추출
                            }
                            
                        }
                    }
                    else {
                        [position_5_1, position_5_2] = extractParentheses(2); // 두 번째 자리부터 괄호 내용 추출
                    }
                } else if (thirdChar === '/' || thirdChar === "") { // 세 번째 자리에 '/'가 있는 경우
                    position_3_2 = null; // 3-2 자리에 아무것도 할당하지 않음
                } else { // 세 번째 자리에 다른 문자가 있는 경우 처리
                    if (data.slice(2, 5) !== 'maj' && thirdChar === 'm') { // 3-1 자리가 maj가 아닌'm'으로 시작하는 경우
                        position_3_1 = thirdChar; // 세 번째 문자를 position_3_1에 할당
                        let thirdTwoChar = data.slice(3, 4);
                        if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                            if (thirdTwoChar === '1') {
                                position_4 = data.slice(3, 5); // 세 번째 자리와 그 다음 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(5); // 다섯 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = data.slice(3, 4); // 세 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(4);
                            }
                        } else if (thirdTwoChar === '(') {
                            [position_5_1, position_5_2] = extractParentheses(3); // 두 번째 자리부터 괄호 내용 추출
                            
                        } else if (thirdTwoChar === '/' || thirdTwoChar === '') { // 3-2자리가 없는 경우
                            position_3_2 = null;
                        } else {
                            position_3_2 = data.slice(3, 6); // 세 번째 자리부터 세 글자를 position_3_2에 할당
                            if (+data.slice(6, 7) === 1) {
                                position_4 = data.slice(6, 8); // 여섯 번째 자리와 그 다음 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(8); // 여덟 번째 자리부터 괄호 내용 추출  
                            }

                            else if (data.slice(6, 7) === "(" || data.slice(6, 7) == "") { // 네 번째 자리가 없는 경우
                                [position_5_1, position_5_2] = extractParentheses(6); // 여섯 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = data.slice(6, 7); // 여섯 번째 자리와 그 다음 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(7); // 일곱 번째 자리부터 괄호 내용 추출 
                            }
                        }
                    } else {
                        position_3_1 = data.slice(2, 5); // 두 번째 자리부터 네 번째 자리까지 position_3_1에 할당
                        let thirdTwoChar = data.slice(5, 6);
                        if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                            if (thirdTwoChar === '1') {
                                position_4 = data.slice(5, 7); // 다섯 번째 자리와 여섯 번째 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(7);
                            } else {
                                position_4 = data.slice(5, 6); // 다섯 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(6);
                                
                            }
                        } else if (thirdTwoChar === '(') {
                            [position_5_1, position_5_2] = extractParentheses(5); // 두 번째 자리부터 괄호 내용 추출   
                        } else if (thirdTwoChar === '/' || thirdTwoChar === "") {
                            position_3_2 = null; // 3-2 자리에 아무것도 할당하지 않음
                        } else {
                            position_3_2 = data.slice(5, 8); // 다섯 번째 자리부터 일곱 번째 자리까지 position_3_2에 할당
                            let fourthChar = data.slice(8, 9);
                            if (+fourthChar >= 1 && +fourthChar <= 13) {
                                if (fourthChar === '1') {
                                    position_4 = data.slice(8, 10); // 여덟 번째 자리부터 아홉 번째 자리까지 position_4에 할당
                                    [position_5_1, position_5_2] = extractParentheses(10); // 열 번째 자리부터 괄호 내용 추출
                                } else {
                                    position_4 = fourthChar; // 네 번째 자리만 position_4에 할당
                                    [position_5_1, position_5_2] = extractParentheses(9); // 아홉 번째 자리부터 괄호 내용 추출
                                }
                            } else {
                                [position_5_1, position_5_2] = extractParentheses(8); // 여덟 번째 자리부터 괄호 내용 추출
                            }
                        }
                    }
                }
            } else { // 두 번째 문자가 '#' 또는 'b'가 아닌 경우 처리
                // 세 번째 문자가 6~9 숫자인지 확인
                let thirdChar = data.slice(1, 2);
                if (thirdChar >= '6' && thirdChar <= '9') {
                    position_3_1 = thirdChar; // 세 번째 문자를 position_3_1에 할당
                    let thirdTwoChar = data.slice(2, 3);

                    if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                        if (thirdTwoChar === '1') {
                            position_4 = data.slice(2, 4); // 두 번째 자리와 세 번째 자리까지 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(4); // 네 번째 자리부터 괄호 내용 추출
                        } else {
                            position_4 = data.slice(2, 3); // 두 번째 자리만 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(3); // 세 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '(') {
                        // 비트 유무 판별식
                        // 3-2 <-> 5-1 변환식
                        if (!document.querySelectorAll('code')[index].hasAttribute('data-beat')) {
                            if (extractParentheses(2)[0].length >= 6 && position_4 == null) {
                                [position_3_2, position_5_1] = extractParentheses(2);
                                let match = position_3_2.match(/([a-zA-Z]+)(\d+)/);
                                if (match && match[1]) {
                                    
                                    position_3_2 = match[1]; // 문자 부분
                                    position_4 = match[2];   // 숫자 부분
                                    }
                                else {
                                    position_3_2 = null;
                                    [position_5_1, position_5_2] = extractParentheses(2); // 두 번째 자리부터 괄호 내용 추출
                                }
                            }
                            else {
                                if (extractParentheses(2)[0].startsWith('(a') === true || extractParentheses(2)[0].startsWith('(s') === true) {
                                    [position_3_2, position_5_1] = extractParentheses(2);
                                } else {
                                    [position_5_1, position_5_2] = extractParentheses(2); // 두 번째 자리부터 괄호 내용 추출
                                }
                            }
                        }
                        else {
                            [position_5_1, position_5_2] = extractParentheses(2); // 세 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '/' || thirdTwoChar === '') { // 3-2자리가 없는 경우
                        position_3_2 = null;
                    } else {
                        position_3_2 = data.slice(2, 5); // 두 번째 자리부터 네 번째 자리까지 position_3_2에 할당
                        let fourthChar = data.slice(5, 6);
                        if (+fourthChar >= 1 && +fourthChar <= 13) {
                            if (fourthChar === '1') {
                                position_4 = data.slice(5, 7); // 다섯 번째 자리와 여섯 번째 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(7); // 일곱 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = fourthChar; // 네 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(6); // 여섯 번째 자리부터 괄호 내용 추출
                            }
                        } else {
                            [position_5_1, position_5_2] = extractParentheses(5); // 다섯 번째 자리부터 괄호 내용 추출
                        }
                    }
                } else if (thirdChar === '1') {
                    position_3_1 = data.slice(1, 3); // 첫 번째 자리와 두 번째 자리까지 position_3_1에 할당
                    let thirdTwoChar = data.slice(3, 4);
                    if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                        if (thirdTwoChar === '1') {
                            position_4 = data.slice(3, 5); // 세 번째 자리와 네 번째 자리까지 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(5); // 다섯 번째 자리부터 괄호 내용 추출
                        } else {
                            position_4 = data.slice(3, 4); // 세 번째 자리만 position_4에 할당
                            [position_5_1, position_5_2] = extractParentheses(4); // 네 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '(') {
                        // 3-2 <-> 5-1 변환식
                        if (!document.querySelectorAll('code')[index].hasAttribute('data-beat')) {
                            if (extractParentheses(3)[0].length >= 6 && position_4 == null) {
                                [position_3_2, position_5_1] = extractParentheses(3);
                                let match = position_3_2.match(/([a-zA-Z]+)(\d+)/);
                                if (match && match[1]) {
                                    position_3_2 = match[1]; // 문자 부분
                                    position_4 = match[2];   // 숫자 부분
                                    }
                                else {
                                    position_3_2 = null;
                                    [position_5_1, position_5_2] = extractParentheses(3); // 세 번째 자리부터 괄호 내용 추출
                                }
                            }
                            else {
                                [position_5_1, position_5_2] = extractParentheses(3); // 세 번째 자리부터 괄호 내용 추출
                            }
                        }
                        else {
                            [position_5_1, position_5_2] = extractParentheses(3); // 세 번째 자리부터 괄호 내용 추출
                        }
                    } else if (thirdTwoChar === '/' || thirdTwoChar === '') { // 3-2자리가 없는 경우
                        position_3_2 = null;
                    } else {
                        position_3_2 = data.slice(3, 6); // 세 번째 자리부터 다섯 번째 자리까지 position_3_2에 할당
                        let fourthChar = data.slice(6, 7);
                        if (+fourthChar >= 1 && +fourthChar <= 13) {
                            if (fourthChar === '1') {
                                position_4 = data.slice(6, 8); // 여섯 번째 자리와 일곱 번째 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(8); // 여덟 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = fourthChar; // 여섯 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(7); // 일곱 번째 자리부터 괄호 내용 추출
                            }
                        } else {
                            [position_5_1, position_5_2] = extractParentheses(6); // 여섯 번째 자리부터 괄호 내용 추출
                        }
                    }
                } else if (thirdChar === '(') {
                    // 3-2 <-> 5-1 변환식
                    if (!document.querySelectorAll('code')[index].hasAttribute('data-beat')) {
                        if (extractParentheses(1)[0].length >= 6 && position_4 == null) {
                            [position_3_2, position_5_1] = extractParentheses(2);
                            let match = position_3_2.match(/([a-zA-Z]+)(\d+)/);
                            if (match && match[1]) {
                                position_3_2 = match[1]; // 문자 부분
                                position_4 = match[2];   // 숫자 부분
                                }
                            else {
                                position_3_2 = null;
                                [position_5_1, position_5_2] = extractParentheses(2); // 두 번째 자리부터 괄호 내용 추출
                            }
                        }
                        else {
                            if (extractParentheses(1)[0].startsWith('(a') === true || extractParentheses(1)[0].startsWith('(s') === true) {
                                [position_3_1, position_5_1] = extractParentheses(2);
                            } else {
                                [position_5_1, position_5_2] = extractParentheses(2); // 두 번째 자리부터 괄호 내용 추출
                            }
                        }
                    }
                    else {
                        [position_5_1, position_5_2] = extractParentheses(2); // 세 번째 자리부터 괄호 내용 추출
                    }
                } else if (thirdChar === '/' || thirdChar === "") {
                    position_3_2 = null; // 세 번째 자리에 아무것도 할당하지 않음
                } else {
                    if (data.slice(1, 4) !== 'maj' && thirdChar === 'm') { // 세 번째 자리가 'maj'가 아니고 'm'인 경우 처리
                        position_3_1 = thirdChar; // 세 번째 문자를 position_3_1에 할당
                        let thirdTwoChar = data.slice(2, 3);
                        if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                            if (thirdTwoChar === '1') {
                                position_4 = data.slice(2, 4); // 두 번째 자리와 세 번째 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(4);
                            } else {
                                position_4 = data.slice(2, 3); // 두 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(3);
                            }
                        } else if (thirdTwoChar === '(') {   
                            [position_5_1, position_5_2] = extractParentheses(3);
                        } else if (thirdTwoChar === '/' || thirdTwoChar === '') { // 3-2자리가 없는 경우
                            position_3_2 = null;
                        } else {  // 3-2번째에 add, sus, alt가 있는 경우
                            position_3_2 = data.slice(2, 5)
                            if (+data.slice(5, 6) === 1) {
                                position_4 = data.slice(5, 7); // 다섯 번째 자리와 그 다음 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(7); // 일곱 번째 자리부터 괄호 내용 추출  
                            } else if (data.slice(5, 6) === '(' || data.slice(5, 6) === "") {
                                [position_5_1, position_5_2] = extractParentheses(5); // 다섯 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = data.slice(5, 6); // 다섯 번째 자리를 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(6); // 여섯 번째 자리부터 괄호 내용 추출 
                            }
                        }
                    } else {
                        position_3_1 = data.slice(1, 4); // 첫 번째 자리부터 세 번째 자리까지 position_3_1에 할당
                        let thirdTwoChar = data.slice(4, 5);
                        if (+thirdTwoChar >= 1 && +thirdTwoChar <= 13) {
                            if (thirdTwoChar === '1') {
                                position_4 = data.slice(4, 6); // 네 번째 자리와 다섯 번째 자리까지 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(6); // 여섯 번째 자리부터 괄호 내용 추출
                            } else {
                                position_4 = data.slice(4, 5); // 네 번째 자리만 position_4에 할당
                                [position_5_1, position_5_2] = extractParentheses(5); // 다섯 번째 자리부터 괄호 내용 추출
                            }
                        } else if (thirdTwoChar === '(') {
                            [position_5_1, position_5_2] = extractParentheses(4);
                        } else if (thirdTwoChar === '/' || thirdTwoChar === "") {
                            position_3_2 = null; // 3-2 자리에 아무것도 할당하지 않음
                        } else {
                            position_3_2 = data.slice(4, 7); // 네 번째 자리부터 여섯 번째 자리까지 position_3_2에 할당
                            let fourthChar = data.slice(7, 8);
                            if (+fourthChar >= 1 && +fourthChar <= 13) {
                                if (fourthChar === '1') {
                                    position_4 = data.slice(7, 9); // 일곱 번째 자리와 여덟 번째 자리까지 position_4에 할당
                                    [position_5_1, position_5_2] = extractParentheses(9); // 아홉 번째 자리부터 괄호 내용 추출
                                } else {
                                    position_4 = fourthChar; // 일곱 번째 자리만 position_4에 할당
                                    [position_5_1, position_5_2] = extractParentheses(8); // 여덟 번째 자리부터 괄호 내용 추출
                                }
                            } else {
                                [position_5_1, position_5_2] = extractParentheses(7); // 일곱 번째 자리부터 괄호 내용 추출
                            }
                        }
                    }
                }
            }
        }
    }

    // 결과 출력
    // console.log("1번: " + cleanString(position_1));
    // console.log("2번: " + cleanString(position_2));
    // console.log("3-1번: " + cleanString(position_3_1));
    // console.log("3-2번: " + cleanString(position_3_2));
    // console.log("4번: " + cleanString(position_4));
    // console.log("5-1번: " + cleanString(position_5_1));
    // console.log("5-2번: " + cleanString(position_5_2));
    // console.log("6번: " + cleanString(position_6));
    // console.log("7번: " + cleanString(position_7));

    
    return [position_1, position_2, position_3_1, position_3_2,  position_4, position_5_1, position_5_2, position_6, position_7];
}


function cleanString(str) {
    if (str === null) return '';
    return str.replace(/[()\/]/g, '');
}