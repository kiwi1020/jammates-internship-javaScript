document.addEventListener('DOMContentLoaded', () => {
    let excelData = []; // 엑셀 파일에서 읽은 데이터를 저장할 배열
    let countryData = {}; // 각 국가별 데이터를 저장할 객체

    // 파일 선택 이벤트 리스너 설정
    document.getElementById('xlsfile').addEventListener('change', (e) => {
        const inputFile = e.target; // 선택한 파일을 가져옵니다.
        let reader = new FileReader(); // 파일을 읽기 위한 FileReader 객체를 생성합니다.

        // 파일 로드가 완료되었을 때 실행할 함수
        reader.onload = () => {
            let fileData = reader.result; // 파일 데이터를 가져옵니다.
            let wb = XLSX.read(fileData, { type: 'binary' }); // 파일 데이터를 엑셀 형식으로 읽습니다.

            // 엑셀 데이터를 JSON으로 변환하여 excelData 배열에 저장합니다.
            excelData = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1']).map((row) => ({
                description: row['Description'], // 설명
                transactionDate: row['Transaction Date'], // 거래 날짜
                transactionType: row['Transaction Type'], // 거래 유형
                productTitle: row['Product Title'].replace(/[?-]/g, '').trim(), // 제품 제목
                buyerCountry: row['Buyer Country'], // 구매자 국가
                merchantCurrency: row['Merchant Currency'], // 판매자 통화
                amount: parseFloat(row['Amount (Merchant Currency)']) || 0 // 금액, 없으면 0으로 설정
            }));

            processExcelData(); // 데이터를 처리하는 함수 호출
        };
        reader.readAsBinaryString(inputFile.files[0]); // 파일을 바이너리 문자열로 읽습니다.
    });

    // 엑셀 데이터를 처리하는 함수
    function processExcelData() {
        const refundDescriptions = new Set(); // 환불된 거래의 설명을 저장할 집합
        const descriptionAmounts = {}; // 각 설명별 금액을 합산하기 위한 객체
    
        // 'refund'가 포함된 거래의 설명을 기록
        excelData.forEach((row) => {
            if (row.transactionType.toLowerCase().includes('refund')) {
                refundDescriptions.add(row.description); // 환불된 거래의 설명을 저장
            }
        });
    
        // 각 설명별로 금액을 합산
        excelData.forEach((row) => {
            const { description, amount } = row;
            if (!descriptionAmounts[description]) {
                descriptionAmounts[description] = 0; // 초기값 설정
            }
            descriptionAmounts[description] += amount; // 금액을 합산
        });
    
        // 합산된 금액을 기준으로 데이터를 처리
        excelData.forEach((row) => {
            let { description, productTitle, buyerCountry } = row;
            let amount = descriptionAmounts[description]; // 합산된 금액을 가져옴
    
            // 구매자 국가가 대륙 객체에 포함된 경우
            if (Object.values(continent).some(cont => cont.hasOwnProperty(buyerCountry))) {
                if (!countryData[buyerCountry]) {
                    countryData[buyerCountry] = {
                        appMoney: 0, // 앱 금액 총합
                        inAppMoney: 0, // 인앱 금액 총합
                        appCount: 0, // 앱 거래 수
                        inAppCount: 0, // 인앱 거래 수
                        descriptions: {}, // 상세 설명
                        uniqueDescriptions: new Set() // 유니크한 설명 저장소
                    };
                }
                let country = countryData[buyerCountry];
    
                // 제품 제목이 'JAMMATES' 또는 'Real Band Sound, JAMMATES'인 경우
                if (productTitle === 'JAMMATES' || productTitle === 'Real Band Sound, JAMMATES') {
                    if (!country.descriptions['앱']) {
                        country.descriptions['앱'] = {}; // 앱 거래 설명 초기화
                    }
                    if (!country.descriptions['앱'][productTitle]) {
                        country.descriptions['앱'][productTitle] = {}; // 제품 제목 초기화
                    }
                    if (!country.descriptions['앱'][productTitle][amount]) {
                        country.descriptions['앱'][productTitle][amount] = { count: 0, totalAmount: 0 }; // 금액 초기화
                    }
                    if (!country.uniqueDescriptions.has(description)) {
                        country.uniqueDescriptions.add(description); // 유니크한 설명 추가
                        if (!refundDescriptions.has(description)) {
                            country.descriptions['앱'][productTitle][amount].count++;
                            country.descriptions['앱'][productTitle][amount].totalAmount += amount;
                            country.appMoney += amount; // 앱 금액 총합에 추가
                            country.appCount++; // 앱 거래 수 증가
                        }
                    }
                } else {
                    // 인앱 거래의 경우
                    if (!country.descriptions['인앱']) {
                        country.descriptions['인앱'] = {}; // 인앱 거래 설명 초기화
                    }
                    if (!country.descriptions['인앱'][productTitle]) {
                        country.descriptions['인앱'][productTitle] = {}; // 제품 제목 초기화
                    }
                    if (!country.descriptions['인앱'][productTitle][amount]) {
                        country.descriptions['인앱'][productTitle][amount] = { count: 0, totalAmount: 0 }; // 금액 초기화
                    }
                    if (!country.uniqueDescriptions.has(description)) {
                        country.uniqueDescriptions.add(description); // 유니크한 설명 추가
                        if (!refundDescriptions.has(description)) {
                            country.descriptions['인앱'][productTitle][amount].count++;
                            country.descriptions['인앱'][productTitle][amount].totalAmount += amount;
                            country.inAppMoney += amount; // 인앱 금액 총합에 추가
                            country.inAppCount++; // 인앱 거래 수 증가
                        }
                    }
                }
            }
        });
    
        updateHTML(); // HTML 업데이트 함수 호출
    }

    function formatNumbers(value) {
        const numberFormatter = new Intl.NumberFormat('en-US');
        return numberFormatter.format(value);
    }

    
    function updateHTML() {
        const container = document.querySelector('body'); // 결과를 표시할 컨테이너
        for (let country in countryData) {
            let countryInfo = countryData[country];
            let totalMoney = countryInfo.appMoney + countryInfo.inAppMoney; // 총 금액
            let totalCount = countryInfo.appCount + countryInfo.inAppCount; // 총 거래 수
    
            // 앱과 인앱의 개수가 모두 0이면 해당 국가를 건너뜀
            if (countryInfo.appCount === 0 && countryInfo.inAppCount === 0) {
                continue;
            }
    
            // 국가별 정보 표시 HTML 생성
            let htmlContent = `
            <div class="country_area country_${country}">
                <h2 class="country_ttl">${continentName(country) + "(" + country + ")" }</h2>
                <div class="summary_area">
                    <b class="summary_ttl">요약</b>
                    <div class="info_box">
                        <div class="info_row">
                            <div class="info_space">앱</div>
                            <div class="info_space">${formatNumbers(countryInfo.appCount)}</div>
                            <div class="info_space">${formatNumbers(countryInfo.appMoney)}</div>
                        </div>
                        <div class="info_row">
                            <div class="info_space">인앱</div>
                            <div class="info_space">${formatNumbers(countryInfo.inAppCount)}</div>
                            <div class="info_space">${formatNumbers(countryInfo.inAppMoney)}</div>
                        </div>
                        <div class="info_row">
                            <div class="info_space">Total</div>
                            <div class="info_space">${totalCount}</div>
                            <div class="info_space">${formatNumbers(totalMoney)}</div>
                        </div>
                    </div>
                </div>
                <div class="detail_area">
                    <b class="detail_ttl">상세</b>
                </div>
            </div>`;
    
            container.insertAdjacentHTML('beforeend', htmlContent); // 컨테이너에 HTML 추가
    
            // 상세 설명 추가
            Object.keys(countryInfo.descriptions).forEach((depth2) => {
                let descriptionHTML = '';
                let totalDescCount = 0;
                let totalDescMoney = 0;
    
                Object.keys(countryInfo.descriptions[depth2]).forEach((title, j) => {
                    Object.keys(countryInfo.descriptions[depth2][title]).forEach((amount, k) => {
                        if (countryInfo.descriptions[depth2][title][amount].count > 0) {
                            let descCount = countryInfo.descriptions[depth2][title][amount].count || 0;
                            let descMoney = countryInfo.descriptions[depth2][title][amount].totalAmount || 0;
    
                            totalDescCount += descCount;
                            totalDescMoney += descMoney;
    
                            // 상세 설명 HTML 생성
                            descriptionHTML += `
                                <div class="det_group det_group${j}_${k}">
                                    <div class="det_dt">
                                        ${title}
                                    </div>
                                    <div class="det_dd">
                                        <div class="det_row">
                                            <div class="det_space">${formatNumbers(descCount)}</div>
                                            <div class="det_space">${formatNumbers(amount)}</div>
                                            <div class="det_space">${formatNumbers(amount * descCount)}</div> 
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    });
                });
    
                // 데이터가 있는 경우 상세 설명 영역에 추가
                if (descriptionHTML) {
                    descriptionHTML += `
                        <div class="det_group det_total">
                            <div class="det_dt">
                                Total
                            </div>
                            <div class="det_dd">
                                <div class="det_row">
                                    <div class="det_space">${formatNumbers(totalDescCount)}</div>
                                    <div class="det_space">-</div>
                                    <div class="det_space">${formatNumbers(totalDescMoney)}</div>
                                </div>
                            </div>
                        </div>
                    `;
    
                    document.querySelector(`.country_${country} .detail_area`).insertAdjacentHTML('beforeend', /* html */`
                        <div class="det_area ${depth2 === '앱' ? 'app' : 'in_app'}"> 
                            <h3 class="det_ttl ${depth2 === '앱' ? 'app_color' : 'in_app_color'}">${depth2} 세분화</h3>
                            ${descriptionHTML}
                        </div>
                    `);
                }
            });
        }
    }
    
    
    // 국가 코드에 따라 대륙명 반환
    function continentName(countryCode) {
        for (let cont in continent) {
            if (continent[cont].hasOwnProperty(countryCode)) {
                return continent[cont][countryCode];
            }
        }
        return countryCode;
    }
});
