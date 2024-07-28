// 대륙과 국가 데이터를 가져오는 함수
function getContinentAndCountry(code) {
    for (const [continentName, countries] of Object.entries(continent)) {
        if (code in countries) {
            return {
                continent: continentName,
                country: countries[code]
            };
        }
    }
    return {
        continent: '알 수 없음',
        country: '알 수 없음'
    };
}

// 엑셀 데이터를 처리하는 함수
function processExcelData(excelData) {
    const descriptionSet = new Set();
    const refundDescriptions = new Set();
    const salesData = {}; // 국가별 판매 데이터 저장

    // 환불 타입을 포함한 주문 번호를 추적
    for (let record of excelData) {
        let description = record[0];
        let type = record[2];

        if (type.toLowerCase().includes('refund')) {
            refundDescriptions.add(description);
        }
    }

    excelData.forEach(data => {
        const description = data[0];
        const productTitle = data[3];
        const buyerCountry = data[4];
        const { continent, country } = getContinentAndCountry(buyerCountry);

        // 환불된 주문 번호는 처리하지 않음
        if (refundDescriptions.has(description)) {
            return;
        }

        if (!salesData[continent]) {
            salesData[continent] = {};
        }

        if (!salesData[continent][country]) {
            salesData[continent][country] = {
                countryCode: buyerCountry,
                appSales: 0,
                inAppSales: 0
            };
        }

        if (!descriptionSet.has(description)) {
            if (productTitle === 'JAMMATES' || productTitle === 'Real Band Sound, JAMMATES') {
                salesData[continent][country].appSales++;
            } else {
                salesData[continent][country].inAppSales++;
            }
            descriptionSet.add(description);
        }
    });

    return salesData; // 수집된 데이터를 반환합니다.
}


// 데이터를 사용하여 HTML을 업데이트하는 함수
function step6(excelData) {
    const data = processExcelData(excelData); // 수집된 데이터를 가져옵니다.
    const sumBox = document.querySelector('.sum_area.continent .sum_box');
    const totalBox = document.querySelector('.sum_box.sum_type_continent_box .sum_dd .sum_row');

    // 전체 판매량을 저장할 변수
    let totalAppSales = 0;
    let totalInAppSales = 0;

    Object.keys(continent).forEach((depth1) => {
        let check = false;

        // 각 대륙 내의 국가 코드 (depth2) 순회
        Object.keys(continent[depth1]).forEach((depth2) => {
            if (data[depth1] && data[depth1][continent[depth1][depth2]]) {
                check = true;
            }
        });

        // 국가 코드가 data에 포함되어 있는 경우
        if (check) {
            const sumGroup = document.createElement('div');
            sumGroup.className = 'sum_group';

            const sumDt = document.createElement('div');
            sumDt.className = 'sum_dt';
            sumDt.textContent = depth1;
            sumGroup.appendChild(sumDt);

            const sumDd = document.createElement('div');
            sumDd.className = 'sum_dd';

            // 각 대륙 내의 국가 코드 (depth2) 순회
            Object.keys(continent[depth1]).forEach((depth2) => {
                const countryName = continent[depth1][depth2];
                if (data[depth1] && data[depth1][countryName]) {
                    const { appSales, inAppSales } = data[depth1][countryName];

                    const sumRow = document.createElement('div');
                    sumRow.className = 'sum_row';

                    const countryNameDiv = document.createElement('div');
                    countryNameDiv.className = 'sum_space';
                    countryNameDiv.textContent = countryName;
                    sumRow.appendChild(countryNameDiv);

                    const countryCodeDiv = document.createElement('div');
                    countryCodeDiv.className = 'sum_space';
                    countryCodeDiv.textContent = depth2;
                    sumRow.appendChild(countryCodeDiv);

                    const appSalesDiv = document.createElement('div');
                    appSalesDiv.className = 'sum_space';
                    appSalesDiv.textContent = appSales;
                    sumRow.appendChild(appSalesDiv);

                    const inAppSalesDiv = document.createElement('div');
                    inAppSalesDiv.className = 'sum_space';
                    inAppSalesDiv.textContent = inAppSales;
                    sumRow.appendChild(inAppSalesDiv);

                    sumDd.appendChild(sumRow);

                    // 전체 판매량에 추가
                    totalAppSales += appSales;
                    totalInAppSales += inAppSales;
                }
            });

            sumGroup.appendChild(sumDd);
            sumBox.appendChild(sumGroup);
        }
    });

    // Total 섹션 업데이트
    const totalAppSalesDiv = totalBox.querySelector('.sum_space:nth-child(3)');
    const totalInAppSalesDiv = totalBox.querySelector('.sum_space:nth-child(4)');

    totalAppSalesDiv.textContent = totalAppSales;
    totalInAppSalesDiv.textContent = totalInAppSales;
}


