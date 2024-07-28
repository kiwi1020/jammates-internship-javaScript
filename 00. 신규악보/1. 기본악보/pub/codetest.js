const fs = require('fs');

const positions = {
    position_1: ["A", "B", "C", "D", "E", "F", "G"],
    position_2: ["#", "b", ""],
    position_3: ["maj", "dim", "add", "sus", "alt", "aug", "m", ""],
    position_4: ["2", "4", "7", "6", "9", "11", "13", ""],
    position_5_1: ["(6)", "(9)", "(11)", "(#5)", "(#9)", "(b5)", "(b6)", "(b9)", "(maj)", "(maj7)", "(add4)", "(add9)", "(add11)", "(add13)", "(sus)", "(sus2)", "(sus4)", "(alt)", "(omit5)", ""],
    position_5_2: ["(6)", "(9)", "(11)", "(#5)", "(#9)", "(#11)", "(b5)", "(b6)", "(b9)", "(b13)",""],
    position_6: ["/A", "/B", "/C", "/D", "/E", "/F", "/G", "/9", ""],
    position_7: ["#", "b", ""]
};

function isValidCombination(p3, p4, p5_1, p5_2) {

    // maj, m는 6, 7, 9, 11, 13만 뒤에 올 수 있다.
    if (["maj", "m"].includes(p3) && !["6", "7", "9", "11", "13", ""].includes(p4)) {
        return false;
    }

    // dim 뒤에는 7, "" 나올 수 있다.
    if (["dim"].includes(p3) && !["7", ""].includes(p4)) {
        return false;
    }

    // add 뒤에는 4, 9, 11, 13만 올 수 있다.
    if ((p3 === "add") && !["4", "9", "11", "13", ""].includes(p4)) {
        return false;
    }

    // sus 뒤에는 2와 4만 올 수 있다.
    if ((p3 === "sus") && !["2", "4", ""].includes(p4)) {
        return false;
    }

    // aug, alt뒤에는 숫자 코드가 나올 수 없다.
    if (["aug", "alt"].includes(p3) && ["2", "4", "7", "6", "9", "11", "13"].includes(p4)) {
        return false;
    }

    // 3번에 공백이 올 경우 뒤에는 2, 4가 나올 수 없다.
    if ([""].includes(p3) && !["2", "4"].includes(p4)) {
        return false;
    }

    // 3번 자리에 add 나오면 5번 자리에 문자가 올 수 없다.
    if ((p3 === "add") && !["(6)", "(9)", "(11)", "(#5)", "(#9)", "(b5)", "(b6)", "(b9)", ""].includes(p5_1)) {
    return false;
    }

    // 3번 자리에 sus 나오면 5번 자리에 문자가 올 수 없다.
    if ((p3 === "sus") && !["(6)", "(9)", "(11)", "(#5)", "(#9)", "(b5)", "(b6)", "(b9)", ""].includes(p5_1)) {
        return false;
    }

    // 3번 자리에 alt 나오면 5번 자리에 문자가 올 수 없다.
    if ((p3 === "alt") && !["(6)", "(9)", "(11)", "(#5)", "(#9)", "(b5)", "(b6)", "(b9)", ""].includes(p5_1)) {
        return false;
    }

    // 3번 자리에 aug 나오면 5번 자리에 문자가 올 수 없다.
    if ((p3 === "aug") && !["(6)", "(9)", "(11)", "(#5)", "(#9)", "(b5)", "(b6)", "(b9)", ""].includes(p5_1)) {
        return false;
    }


    // 5-1, 5-2 자리는 같은 코드가 나올 수 없다 
    // if (p5_1 === p5_2 && p5_1 !== "") {
    //   return false;
    //}
    // 3번에 add가 들어오면 5-1,5-2는 add가 들어올 수 없다.
    // if ([""].includes(p3) && !["2", "4"].includes(p4)) {
    //     return false;
    // }

    // // 3번에 m과 dim이 오면 5-1,5-2는 maj, maj7이 무조건 와야되고 나머지는 올수 없다.
    // if ([""].includes(p3) && !["2", "4"].includes(p4)) {
    //     return false;
    // }

    // // 
    // if ([""].includes(p3) && !["2", "4"].includes(p4)) {
    //     return false;
    // }



    return true;
}

function createHTML(combination, lineCounter) {
    let html = "";
    html += `<div class="joint"><code>${combination}</code></div>\n`;
    lineCounter++;
    if (lineCounter % 4 === 0) {
        html += '<div class="joint"><code></code></div>\n';
    }
    return { html, lineCounter };
}

fs.writeFileSync('combinations.html', '<html><head><style>.joint{display:inline-block;width:100px;}</style></head><body>\n', 'utf8');
let lineCounter = 1;

for (let pos1 of positions.position_1) {
    for (let pos2 of positions.position_2) {
        for (let pos3 of positions.position_3) {
                for (let pos4 of positions.position_4) {
                    if (!isValidCombination(pos3, pos4)) continue;
                    for (let pos5_1 of positions.position_5_1) {
                        for (let pos5_2 of positions.position_5_2) {
                            for (let pos6 of positions.position_6) {
                                for (let pos7 of positions.position_7) {
                                    let combination = [pos1, pos2, pos3, pos4, pos5_1, pos5_2, pos6, pos7].join("");
                                    let { html, newLineCounter } = createHTML(combination, lineCounter);
                                    lineCounter = newLineCounter;
                                    fs.appendFileSync('combinations.html', html, 'utf8');
                                }
                            }
                        }
                    }
                }
        }
    }
}

fs.appendFileSync('combinations.html', '</body></html>', 'utf8');
console.log("HTML 파일이 생성되었습니다.");
