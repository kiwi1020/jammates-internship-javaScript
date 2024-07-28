document.addEventListener('DOMContentLoaded', () => {
    let objData; // 엑셀 데이터    
    let excelData = []; // 엑셀 특정 데이터 추출 값 

    document.getElementById('xlsfile').addEventListener('change', (e) => {
        const inputFile = e.target;
        let reader = new FileReader();

        reader.onload = () => {
            let fileData = reader.result;
            let wb = XLSX.read(fileData, { type: 'binary' });

            objData = XLSX.utils.sheet_to_json(wb.Sheets['Sheet1']);
            objData.forEach((t, i) => {
                if (!excelData[i])
                    excelData[i] = []; // 초기화

                excelData[i].push(objData[i]['Description']);
                excelData[i].push(objData[i]['Transaction Type']);
                excelData[i].push(objData[i]['Product Title'].replace(/[?-]/g, '').trim());
                excelData[i].push(objData[i]['Buyer Country']);
                excelData[i].push(parseFloat(objData[i]['Amount (Merchant Currency)'])); // 숫자로 변환
            });
            
            displayRefunds(); // 실행
        };
        reader.readAsBinaryString(inputFile.files[0]);
    });

    function formatNumbers(num) {
        return num.toLocaleString(); // 숫자를 포맷하는 함수
    }

    function displayRefunds() {
        let refundData = excelData.filter(row => row[1].toLowerCase().includes('refund'));
        let appCount = 0, appAmount = 0, inAppCount = 0, inAppAmount = 0;
        let countryTotalCount = 0, countryTotalAmount = 0, packageTotalCount = 0, packageTotalAmount = 0;
        let uniqueDescriptions = new Set();

        const countryContainer = document.querySelector('.country-rows');
        countryContainer.innerHTML = '';

        const packageContainer = document.querySelector('.package-rows');
        packageContainer.innerHTML = '';

        refundData.forEach(row => {
            let description = row[0]; // Description이 첫 번째 요소라고 가정
            const productTitle = row[2];

            if (!uniqueDescriptions.has(description)) {
                uniqueDescriptions.add(description);

                if (productTitle === 'JAMMATES' || productTitle === 'Real Band Sound, JAMMATES') {
                    // 앱으로 분류
                    const countryRow = document.createElement('div');
                    countryRow.className = 'sum_group  no-bg half-width';

                    //구분, 국가, 국가 코드, 금액
                    countryRow.innerHTML = `
                    <div class="sum_dt">앱</div>
                    <div class="sum_dt">${getCountryName(row[3])}</div>
                    <div class="sum_dt">${row[3]}</div>
                    <div class="sum_dt">${formatNumbers(row[4])}</div>
                `;
                    countryContainer.appendChild(countryRow);

                    countryTotalCount++;
                    countryTotalAmount += row[4];
                } else {
                    // 인앱으로 분류
                    const packageRow = document.createElement('div');
                    packageRow.className = 'sum_group no-bg';

                    //구분, 패키지명, 한글명, 국가, 국가 코드, 금액
                    packageRow.innerHTML = `
                    <div class="sum_dt">패키지</div>
                    <div class="sum_dt">${row[2]}</div>
                    <div class="sum_dt">${getKoreanName(row[2])}</div>
                    <div class="sum_dt">${getCountryName(row[3])}</div>
                    <div class="sum_dt">${row[3]}</div>
                    <div class="sum_dt">${formatNumbers(row[4])}</div>
                `;
                    packageContainer.appendChild(packageRow);

                    packageTotalCount++;
                    packageTotalAmount += row[4];
                }
        }
        });


        uniqueDescriptions = new Set();

        // 앱 및 인앱 총계 업데이트
        refundData.forEach((row) => {
            let description = row[0]; // Description이 첫 번째 요소라고 가정
            let productTitle = row[2]; // Product Title이 네 번째 요소라고 가정
            let amount = row[4];

            if (productTitle === 'JAMMATES' || productTitle === 'Real Band Sound, JAMMATES') {
                appAmount += amount;
            } else {
                inAppAmount += amount;
            }
            
            if (!uniqueDescriptions.has(description)) {
                uniqueDescriptions.add(description);

                // Product Title이 'JAMMATES'나 'Real Band Sound, JAMMATES'인 경우 앱으로 처리
                if (productTitle === 'JAMMATES' || productTitle === 'Real Band Sound, JAMMATES') {
                    appCount++;
                } else {
                    inAppCount++;
                }
            }
        });

        document.getElementById('app-count').textContent = appCount;
        document.getElementById('app-amount').textContent = formatNumbers(appAmount);
        document.getElementById('inapp-count').textContent = inAppCount;
        document.getElementById('inapp-amount').textContent = formatNumbers(inAppAmount);
        document.getElementById('total-count').textContent = appCount + inAppCount;
        document.getElementById('total-amount').textContent = formatNumbers(appAmount + inAppAmount);

        // 국가 및 패키지 총계 업데이트
        document.getElementById('country-total-count').textContent = appCount;
        document.getElementById('country-total-amount').textContent = formatNumbers(appAmount);
        document.getElementById('package-total-count').textContent = inAppCount;
        document.getElementById('package-total-amount').textContent = formatNumbers(inAppAmount);
    }
   
    
    
});
