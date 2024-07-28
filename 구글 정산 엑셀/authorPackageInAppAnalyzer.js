document.addEventListener('DOMContentLoaded', () => {

    let objData; // 엑셀 데이터    
    let excelData = []; // 엑셀 툭정 데이터 추출 값 

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
                excelData[i].push(objData[i]['Transaction Date']);
                excelData[i].push(objData[i]['Transaction Type']);
                excelData[i].push(objData[i]['Product Title'].replace(/[?-]/g, '').trim());
                excelData[i].push(objData[i]['Buyer Country']);
                excelData[i].push(objData[i]['Merchant Currency']);
                excelData[i].push(parseFloat(objData[i]['Amount (Merchant Currency)'])); // 숫자로 변환
            });
            test(); // 실행!!!!!!!!!!!!
        };
        reader.readAsBinaryString(inputFile.files[0]);
    });

    // 국내, 해외, 앱, 인앱 개수
    function countAppInApp(excelData) {
        let uniqueDescriptions = new Set();
        let refundDescriptions = new Set();
        let counts = {
            appDomestic: 0,
            appOverseas: 0,
            inAppDomestic: 0,
            inAppOverseas: 0,
        };

        // 환불 타입을 포함한 주문 번호를 추적
        for (let record of excelData) {
            let description = record[0];
            let type = record[2];

            if (type.toLowerCase().includes('refund')) {
                refundDescriptions.add(description);
            }
        }
        excelData.forEach((row) => {
            let description = row[0]; // Description이 첫 번째 요소라고 가정
            let productTitle = row[3]; // Product Title이 네 번째 요소라고 가정
            let buyerCountry = row[4]; // Buyer Country가 다섯 번째 요소라고 가정

            // 환불이 포함된 주문 번호는 처리하지 않음
            if (refundDescriptions.has(description)) {
                return;
            }

            if (!uniqueDescriptions.has(description)) {
                uniqueDescriptions.add(description);

                // Product Title이 'JAMMATES'나 'Real Band Sound, JAMMATES'인 경우 앱으로 처리
                if (productTitle === 'JAMMATES' || productTitle === 'Real Band Sound, JAMMATES') {
                    if (buyerCountry === 'KR') {
                        counts.appDomestic++;
                    } else {
                        counts.appOverseas++;
                    }
                } else {
                    if (buyerCountry === 'KR') {
                        counts.inAppDomestic++;
                    } else {
                        counts.inAppOverseas++;
                    }
                }
            }
        });
        return counts;
    }

    // 국내 ,해외, 앱, 인앱 매출
    function sumAreaWorldwide() {

        let sums = {
            sumDomestic: 0,
            sumOverseas: 0,
            sumApp: 0,
            sumInApp: 0,
            sumAppDomestic: 0,
            sumInAppDomestic: 0,
            sumAppOverseas: 0,
            sumInAppOverseas: 0
        };

        excelData.forEach((data, i) => {

            if (data[4] === 'KR') {
                sums.sumDomestic += data[6];
                if (data[3] === 'JAMMATES' || data[3] === 'Real Band Sound, JAMMATES')
                    sums.sumAppDomestic += data[6];
                else
                    sums.sumInAppDomestic += data[6];
            }

            else {
                sums.sumOverseas += data[6];
                if (data[3] === 'JAMMATES' || data[3] === 'Real Band Sound, JAMMATES')
                    sums.sumAppOverseas += data[6];
                else
                    sums.sumInAppOverseas += data[6];
            }

            if (data[3] === 'JAMMATES' || data[3] === 'Real Band Sound, JAMMATES')
                sums.sumApp += data[6];

            else
                sums.sumInApp += data[6];
        })
        return sums;
    };

    function transformDataToGivenArray(excelData) {
        let typeMap = new Map();
        let processedDescriptions = new Set();
        let refundDescriptions = new Set();

        // refund 타입을 포함한 주문 번호를 추적
        for (let record of excelData) {
            let description = record[0];
            let type = record[2];

            if (type.toLowerCase().includes('refund')) {
                refundDescriptions.add(description);
            }
        }

        for (let record of excelData) {
            let description = record[0];
            let name = record[3];  // '?'와 '-' 제거
            let amount = record[6];

            // 환불이 포함된 주문 번호는 처리하지 않음
            if (refundDescriptions.has(description)) {
                continue;
            }

            if (!typeMap.has(name)) {
                typeMap.set(name, { 이름: name, 개수: 0, 합계: 0 });
            }

            let typeData = typeMap.get(name);

            // description이 처음 등장한 경우에만 개수를 증가시킴
            if (!processedDescriptions.has(description)) {
                typeData.개수 += 1;
                processedDescriptions.add(description);
            }

            typeData.합계 += amount;
        }

        // 합계 데이터에 천 단위로 ',' 문자를 넣음
        const numberFormatter = new Intl.NumberFormat('en-US');

        return Array.from(typeMap.values()).map(item => ({
            ...item,
            합계: numberFormatter.format(item.합계)
        }));
    }

    // 국내 + 해외 총합 계 
    function typeList2(excelData) {
        let resultArray = [];
        let givenArray = transformDataToGivenArray(excelData)
        // 주어진 주문 목록을 기준으로 결과 배열 작성
        for (const orderObj of givenOrderInPlayApps) {
            const name = Object.keys(orderObj)[0];
            const type = orderObj[name];
            const obj = givenArray.find(item => item.이름 === type);

            if (obj) {
                resultArray.push({ 이름: name, 개수: obj.개수, 합계: obj.합계 });
            }
            else {
                resultArray.push({ 이름: name, 개수: '-', 합계: '-' });
            }


        }
        // givenOrderInPlayApps에서 모든 type 값 추출
        const orderTypes = Object.values(givenOrderInPlayApps).map(order => Object.values(order)).flat();

        // 해당 순서에 없는 타입을 찾아서 추가
        for (const item of givenArray) {
            const typeExists = orderTypes.includes(item.이름);
            const isExcluded = item.이름 === "JAMMATES" || item.이름 === "Real Band Sound, JAMMATES";
            if (!typeExists && !isExcluded) {
                resultArray.push({ 이름: item.이름, 개수: item.개수, 합계: item.합계 });
            }
        }


        // HTML 구조 생성
        const $sumTypeGroup = $('.worldwide .sum_type_nation_box').find('.sum_group');

        $sumTypeGroup.before(/* html */`
            <div class="sum_group sum_group_after bg_fee9ff">
                <div class="sum_dt">
                    국내 + 해외 앱 총(JAMMATES)
                </div>
                <div class="sum_dd">
                    <div class="sum_row">
                        <div class="sum_space" id="worldWideAppTotal1"></div>
                        <div class="sum_space" id="worldWideAppTotal2"></div>
                    </div>
                </div>
            </div>
        `);


        resultArray.forEach((v, i) => {
            $sumTypeGroup.before(/* html */`
                <div class="sum_group">
                    <div class="sum_dt">
                        ${v.이름}
                    </div>
                    <div class="sum_dd">
                        <div class="sum_row">
                            <div class="sum_space">${v.개수}</div>
                            <div class="sum_space">${v.합계}</div>
                        </div>
                    </div>
                </div>
            `);
        });

        $sumTypeGroup.before(/* html */`
            <div class="sum_group sum_group_after bg_fee9ff">
                <div class="sum_dt">
                    국내 + 해외 인앱 총
                </div>
                <div class="sum_dd">
                    <div class="sum_row">
                        <div class="sum_space" id="worldWideInAppTotal1"></div>
                        <div class="sum_space" id="worldWideInAppTotal2"></div>
                    </div>
                </div>
            </div>
        `);

    }

    // 국내 총합 계 
    function typeList3(excelData) {
        let resultArray = [];
        let givenArray = transformDataToGivenArray(excelData.filter(row => row[4] === 'KR'))

        // 주어진 주문 목록을 기준으로 결과 배열 작성
        for (const orderObj of givenOrderInPlayApps) {
            const name = Object.keys(orderObj)[0];
            const type = orderObj[name];
            const obj = givenArray.find(item => item.이름 === type);

            if (obj) {
                resultArray.push({ 이름: name, 개수: obj.개수, 합계: obj.합계 });
            }
            else {
                resultArray.push({ 이름: name, 개수: '-', 합계: '-' });
            }
        }


        // givenOrderInPlayApps에서 모든 type 값 추출
        const orderTypes = Object.values(givenOrderInPlayApps).map(order => Object.values(order)).flat();

        // 해당 순서에 없는 타입을 찾아서 추가
        for (const item of givenArray) {
            const typeExists = orderTypes.includes(item.이름);
            const isExcluded = item.이름 === "JAMMATES" || item.이름 === "Real Band Sound, JAMMATES";
            if (!typeExists && !isExcluded) {
                resultArray.push({ 이름: item.이름, 개수: item.개수, 합계: item.합계 });
            }
        }


        // HTML 구조 생성
        const $sumTypeGroup = $('.domestic .sum_type_nation_box').find('.sum_group');

        $sumTypeGroup.before(/* html */`
            <div class="sum_group sum_group_after bg_fee9ff">
                <div class="sum_dt">
                    국내 앱 총 (JAMMATES)
                </div>
                <div class="sum_dd">
                    <div class="sum_row">
                        <div class="sum_space" id="DomesticAppTotal1"></div>
                        <div class="sum_space" id="DomesticAppTotal2"></div>
                    </div>
                </div>
            </div>
        `);


        resultArray.forEach((v, i) => {
            $sumTypeGroup.before(/* html */`
                <div class="sum_group">
                    <div class="sum_dt">
                        ${v.이름}
                    </div>
                    <div class="sum_dd">
                        <div class="sum_row">
                            <div class="sum_space">${v.개수}</div>
                            <div class="sum_space">${v.합계}</div>
                        </div>
                    </div>
                </div>
            `);
        });

        $sumTypeGroup.before(/* html */`
            <div class="sum_group sum_group_after bg_fee9ff">
                <div class="sum_dt">
                    국내 인앱 총
                </div>
                <div class="sum_dd">
                    <div class="sum_row">
                        <div class="sum_space" id="DomesticInAppTotal1"></div>
                        <div class="sum_space" id="DomesticInAppTotal2"></div>
                    </div>
                </div>
            </div>
        `);

    }

    // 해외 총합 계 
    function typeList4(excelData) {

        let resultArray = [];
        let givenArray = transformDataToGivenArray(excelData.filter(row => row[4] !== 'KR'))

        // 주어진 주문 목록을 기준으로 결과 배열 작성
        for (const orderObj of givenOrderInPlayApps) {
            const name = Object.keys(orderObj)[0];
            const type = orderObj[name];
            const obj = givenArray.find(item => item.이름 === type);

            if (obj) {
                resultArray.push({ 이름: name, 개수: obj.개수, 합계: obj.합계 });
            }
            else {
                resultArray.push({ 이름: name, 개수: '-', 합계: '-' });
            }
        }


        // givenOrderInPlayApps에서 모든 type 값 추출
        const orderTypes = Object.values(givenOrderInPlayApps).map(order => Object.values(order)).flat();

        // 해당 순서에 없는 타입을 찾아서 추가
        for (const item of givenArray) {
            const typeExists = orderTypes.includes(item.이름);
            const isExcluded = item.이름 === "JAMMATES" || item.이름 === "Real Band Sound, JAMMATES";
            if (!typeExists && !isExcluded) {
                resultArray.push({ 이름: item.이름, 개수: item.개수, 합계: item.합계 });
            }
        }

        // HTML 구조 생성
        const $sumTypeGroup = $('.overseas .sum_type_nation_box').find('.sum_group');

        $sumTypeGroup.before(/* html */`
            <div class="sum_group sum_group_after bg_fee9ff">
                <div class="sum_dt">
                해외 앱 총 (JAMMATES)
                </div>
                <div class="sum_dd">
                    <div class="sum_row">
                        <div class="sum_space" id="overseaAppTotal1"></div>
                        <div class="sum_space" id="overseaAppTotal2"></div>
                    </div>
                </div>
            </div>
        `);


        resultArray.forEach((v, i) => {
            $sumTypeGroup.before(/* html */`
                <div class="sum_group">
                    <div class="sum_dt">
                        ${v.이름}
                    </div>
                    <div class="sum_dd">
                        <div class="sum_row">
                            <div class="sum_space">${v.개수}</div>
                            <div class="sum_space">${v.합계}</div>
                        </div>
                    </div>
                </div>
            `);
        });

        $sumTypeGroup.before(/* html */`
            <div class="sum_group sum_group_after bg_fee9ff">
                <div class="sum_dt">
                해외 인앱 총
                </div>
                <div class="sum_dd">
                    <div class="sum_row">
                        <div class="sum_space" id="overseaInAppTotal1"></div>
                        <div class="sum_space" id="overseaInAppTotal2"></div>
                    </div>
                </div>
            </div>
        `);

    }

    // 작가별 패키지 정보
    function typeList5(excelData) {
        let resultArray = [];
        let processedDescriptions = new Set();
        let refundDescriptions = new Set();

        // 주어진 배열을 객체 배열로 변환
        const transformedArray = excelData.map(item => ({
            번호: item[0],
            타입: item[2],
            이름: item[3],
            나라: item[4],
            개수: 1,
            금액: item[6],
            합계: item[6]
        }));

        // refund 타입을 포함한 주문 번호를 추적
        transformedArray.forEach(item => {
            if (item.타입.toLowerCase().includes('refund')) {
                refundDescriptions.add(item.번호);
            }
        });
        
        // 타입별로 데이터를 누적
        const result = transformedArray.reduce((acc, current) => {
            const existingData = acc.find(item => item.이름 === current.이름 && item.나라 === current.나라); // 이름과 나라를 함께 비교
            let description = current.번호;

            // refundDescriptions에 포함된 주문 번호는 제외
            if (!processedDescriptions.has(description) && !refundDescriptions.has(description)) {
                processedDescriptions.add(description);

                if (existingData) {
                    existingData.개수 += current.개수;
                    existingData.금액 += current.금액;
                    existingData.합계 += current.합계;
                } else {
                    acc.push({ ...current }); // 새로운 타입일 경우에만 추가
                }
            }

            return acc;
        }, []);

        // 주어진 주문 목록을 기준으로 결과 배열 작성
        for (const orderObj of givenOrderInPlayApps) {
            const name = Object.keys(orderObj)[0];
            const type = orderObj[name];
            const obj = result.find(item => item.이름 === type); // 'result' 배열에서 찾아야 합니다.

            if (obj) {
                const domesticCount = result.filter(item => item.이름 === type && item.나라 == 'KR').reduce((acc, curr) => acc + curr.개수, 0);
                const internationalCount = result.filter(item => item.이름 === type && item.나라 != 'KR').reduce((acc, curr) => acc + curr.개수, 0);
                resultArray.push({ 이름: name, 개수: obj.개수, 합계: obj.합계, 국내: domesticCount, 해외: internationalCount });
            } else {
                resultArray.push({ 이름: name, 개수: '-', 합계: '-', 국내: '-', 해외: '-' });
            }
        }

        // givenOrderInPlayApps에서 모든 type 값 추출
        const orderTypes = givenOrderInPlayApps.map(order => Object.values(order)).flat();

        // 해당 순서에 없는 타입을 찾아서 추가
        for (const item of result) {
            const typeExists = orderTypes.includes(item.이름);
            const isExcluded = item.이름 === "JAMMATES" || item.이름 === "Real Band Sound, JAMMATES";
            if (!typeExists && !isExcluded) {
                const domesticCount = result.filter(resultItem => resultItem.이름 === item.이름 && resultItem.나라 === 'KR').reduce((acc, curr) => acc + curr.개수, 0);
                const internationalCount = result.filter(resultItem => resultItem.이름 === item.이름 && resultItem.나라 !== 'KR').reduce((acc, curr) => acc + curr.개수, 0);
                resultArray.push({ 이름: item.이름, 개수: item.개수, 합계: item.합계, 국내: domesticCount, 해외: internationalCount });
            }
        }

       
        
        Object.keys(writerPackageInPlayApps).forEach((depth1, i) => {
            let check = false;
            let domesticSum = 0;
            let internationalSum = 0;
            let uniqueSongCount = new Set(); // 고유 곡 개수를 추적하기 위한 Set

            writerPackageInPlayApps[depth1].forEach((depth2, i) => {
                resultArray.forEach((name, i) => {
                    if (name.이름 === Object.keys(depth2)[0] && resultArray[i]['개수'] !== "-") {
                        check = true;
                        domesticSum += resultArray[i]['국내'] !== '-' ? resultArray[i]['국내'] : 0;
                        internationalSum += resultArray[i]['해외'] !== '-' ? resultArray[i]['해외'] : 0;
                        uniqueSongCount.add(name.이름); // 고유 곡 이름을 Set에 추가
                    }
                });
            });

            if (check) {
                $('.sum_area.writer .sum_box').eq(0).append(/* html */`
                    <div class="sum_group">
                        <div class="sum_dt">
                            ${depth1}
                        </div>
                        <div class="sum_dt">
                            ${uniqueSongCount.size} 
                        </div>
                        <div class="sum_dd">
                        </div>
                        <div class="sum_dt">
                            ${domesticSum}
                        </div>
                        <div class="sum_dt">
                            ${internationalSum}
                        </div>
                        <div class="sum_dt">
                            ${domesticSum + internationalSum}
                        </div>
                    </div>
                `);

                writerPackageInPlayApps[depth1].forEach((depth2, i) => {
                    resultArray.forEach((name, i) => {
                        if (name.이름 === Object.keys(depth2)[0] && resultArray[i]['개수'] !== "-") {
                            const $sumGroupDd = $('.sum_area.writer .sum_box:not(.sum_type_writer_box) .sum_group .sum_dd');
                            $sumGroupDd.eq($sumGroupDd.length - 1).append(/* html */`
                                <div class="sum_row">
                                    <div class="sum_space">${Object.values(depth2)[0]}</div>
                                    <div class="sum_space">${Object.keys(depth2)[0]}</div>
                                    <div class="sum_space">${resultArray[i]['국내']}</div>
                                    <div class="sum_space">${resultArray[i]['해외']}</div>
                                    <div class="sum_space">${resultArray[i]['국내'] + resultArray[i]['해외']}</div>
                                </div>
                            `);
                        }
                    });
                });
            }
        });

    }


    function formatNumbers(value) {
        const numberFormatter = new Intl.NumberFormat('en-US');
        return numberFormatter.format(value);
    }


    function totalResult() {
        $('.sum_area.writer .sum_box:not(.sum_type_writer_box) .sum_group .sum_row').each((i, t1) => {
            const name = $(t1).find('.sum_space').eq(1).text().trim();
            $('.domestic .sum_type_nation_box .sum_group').each((i, t2) => {
                const dtName = $(t2).find('.sum_dt').text().trim();
                if (name === dtName) {
                    const dtCount = $(t2).find('.sum_space').eq(0).text();
                    $(t1).find('.sum_space').eq(2).text(dtCount);
                }
            });
            $('.overseas .sum_type_nation_box .sum_group').each((i, t2) => {
                const dtName = $(t2).find('.sum_dt').text().trim();
                if (name === dtName) {
                    const dtCount = $(t2).find('.sum_space').eq(0).text();
                    $(t1).find('.sum_space').eq(3).text(dtCount);
                }
            });
        });

        let packageDomestic = 0;
        let packageOverseas = 0;
        let packageTotal = 0;
        $('.sum_area.writer .sum_box:not(.sum_type_writer_box) .sum_group').each((i, depth1) => {
            if (i === 0) return;
            let countSum = 0;
            let domesticSum = 0;
            let overseasSum = 0;

            $('.sum_area.writer .sum_box .sum_group').eq(i).find('.sum_row').each((i, depth2) => {
                countSum = i + 1;
                domesticSum += +$(depth2).find('.sum_space').eq(2).text().replace('-', '0');
                overseasSum += +$(depth2).find('.sum_space').eq(3).text().replace('-', '0');
            });

            packageDomestic += domesticSum;
            packageOverseas += overseasSum;
            packageTotal += domesticSum + overseasSum;

            $(depth1).find('.sum_dt').eq(1).text(countSum);
            $(depth1).find('.sum_dt').eq(2).text(domesticSum);
            $(depth1).find('.sum_dt').eq(3).text(overseasSum);
            $(depth1).find('.sum_dt').eq(4).text(domesticSum + overseasSum);
        });

        const $sumTypeWriterBox = $('.sum_area.writer .sum_box.sum_type_writer_box');
        $sumTypeWriterBox.find('.sum_row .sum_space').eq(2).text(packageDomestic);
        $sumTypeWriterBox.find('.sum_row .sum_space').eq(3).text(packageOverseas);
        $sumTypeWriterBox.find('.sum_row .sum_space').eq(4).text(packageTotal);
        $sumTypeWriterBox.find('.sum_dt').eq(2).text(packageDomestic);
        $sumTypeWriterBox.find('.sum_dt').eq(3).text(packageOverseas);
        $sumTypeWriterBox.find('.sum_dt').eq(4).text(packageTotal);
    }

    // 여기서 작업!!!!!!!!!!!!!!
    function test() {
        let counts = countAppInApp(excelData);
        let sums = sumAreaWorldwide(excelData);

        step6(excelData);
        typeList2(excelData);
        typeList3(excelData);
        typeList4(excelData);
        typeList5(excelData);
        
        totalResult();

        // '국내 + 해외 총합계' 섹션 업데이트
        document.querySelector('.sum_area.worldwide .sum_group:nth-child(1) .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.appOverseas; // 앱 첫 번째 값
        document.querySelector('.sum_area.worldwide .sum_group:nth-child(1) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumApp); // 앱 두 번째 값

        document.querySelector('.sum_area.worldwide .sum_group:nth-child(2) .sum_space:nth-child(1)').textContent = counts.inAppOverseas + counts.inAppDomestic; // 인앱 첫 번째 값
        document.querySelector('.sum_area.worldwide .sum_group:nth-child(2) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumInApp); // 인앱 두 번째 값

        document.querySelector('.sum_area.worldwide .sum_group:nth-child(3) .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.appOverseas + counts.inAppOverseas + counts.inAppDomestic; // Total 첫 번째 값
        document.querySelector('.sum_area.worldwide .sum_group:nth-child(3) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumApp + sums.sumInApp); // Total 두 번째 값

        document.getElementById('worldWideAppTotal1').textContent = counts.appDomestic + counts.appOverseas;
        document.getElementById('worldWideAppTotal2').textContent = formatNumbers(sums.sumAppDomestic + sums.sumAppOverseas);

        document.getElementById('worldWideInAppTotal1').textContent = counts.inAppDomestic + counts.inAppOverseas;
        document.getElementById('worldWideInAppTotal2').textContent = formatNumbers(sums.sumInAppDomestic + sums.sumInAppOverseas);

        document.querySelector('.sum_area.worldwide .sum_box.sum_type_nation_box .sum_group:last-of-type .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.appOverseas + counts.inAppOverseas + counts.inAppDomestic;
        document.querySelector('.sum_area.worldwide .sum_box.sum_type_nation_box .sum_group:last-of-type .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumApp + sums.sumInApp);


        // '국내 총합계' 섹션 업데이트
        document.querySelector('.sum_area.domestic .sum_group:nth-child(1) .sum_space:nth-child(1)').textContent = counts.appDomestic; // 앱 첫 번째 값
        document.querySelector('.sum_area.domestic .sum_group:nth-child(1) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppDomestic); // 앱 두 번째 값

        document.querySelector('.sum_area.domestic .sum_group:nth-child(2) .sum_space:nth-child(1)').textContent = counts.inAppDomestic; // 인앱 첫 번째 값
        document.querySelector('.sum_area.domestic .sum_group:nth-child(2) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumInAppDomestic); // 인앱 두 번째 값

        document.querySelector('.sum_area.domestic .sum_group:nth-child(3) .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.inAppDomestic; // Total 첫 번째 값
        document.querySelector('.sum_area.domestic .sum_group:nth-child(3) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppDomestic + sums.sumInAppDomestic); // Total 두 번째 값

        document.getElementById('DomesticAppTotal1').textContent = counts.appDomestic;
        document.getElementById('DomesticAppTotal2').textContent = formatNumbers(sums.sumAppDomestic);

        document.getElementById('DomesticInAppTotal1').textContent = counts.inAppDomestic;
        document.getElementById('DomesticInAppTotal2').textContent = formatNumbers(sums.sumInAppDomestic);

       
        document.querySelector('.sum_area.domestic .sum_box.sum_type_nation_box .sum_group:last-of-type .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.inAppDomestic;
        document.querySelector('.sum_area.domestic .sum_box.sum_type_nation_box .sum_group:last-of-type .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppDomestic + sums.sumInAppDomestic);

        // '해외 총합계' 섹션 업데이트
        document.querySelector('.sum_area.overseas .sum_group:nth-child(1) .sum_space:nth-child(1)').textContent = counts.appOverseas; // 앱 첫 번째 값
        document.querySelector('.sum_area.overseas .sum_group:nth-child(1) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppOverseas); // 앱 두 번째 값

        document.querySelector('.sum_area.overseas .sum_group:nth-child(2) .sum_space:nth-child(1)').textContent = counts.inAppOverseas; // 인앱 첫 번째 값
        document.querySelector('.sum_area.overseas .sum_group:nth-child(2) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumInAppOverseas); // 인앱 두 번째 값

        document.querySelector('.sum_area.overseas .sum_group:nth-child(3) .sum_space:nth-child(1)').textContent = counts.appOverseas + counts.inAppOverseas; // Total 첫 번째 값
        document.querySelector('.sum_area.overseas .sum_group:nth-child(3) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppOverseas + sums.sumInAppOverseas); // Total 두 번째 값

        document.getElementById('overseaAppTotal1').textContent = counts.appOverseas;
        document.getElementById('overseaAppTotal2').textContent = formatNumbers(sums.sumAppOverseas);

        document.getElementById('overseaInAppTotal1').textContent = counts.inAppOverseas;
        document.getElementById('overseaInAppTotal2').textContent = formatNumbers(sums.sumInAppOverseas);

        document.querySelector('.sum_area.overseas .sum_box.sum_type_nation_box .sum_group:last-of-type .sum_space:nth-child(1)').textContent = counts.appOverseas + counts.inAppOverseas;
        document.querySelector('.sum_area.overseas .sum_box.sum_type_nation_box .sum_group:last-of-type .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppOverseas + sums.sumInAppOverseas);

        // '앱 총합계' 섹션 업데이트
        document.querySelector('.sum_area.sum_app .sum_group:nth-child(1) .sum_space:nth-child(1)').textContent = counts.appDomestic; // 국내 첫 번째 값
        document.querySelector('.sum_area.sum_app .sum_group:nth-child(1) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppDomestic); // 국내 두 번째 값

        document.querySelector('.sum_area.sum_app .sum_group:nth-child(2) .sum_space:nth-child(1)').textContent = counts.appOverseas; // 해외 첫 번째 값
        document.querySelector('.sum_area.sum_app .sum_group:nth-child(2) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppOverseas); // 해외 두 번째 값

        document.querySelector('.sum_area.sum_app .sum_group:nth-child(3) .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.appOverseas; // Total 첫 번째 값
        document.querySelector('.sum_area.sum_app .sum_group:nth-child(3) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumAppDomestic + sums.sumAppOverseas); // Total 두 번째 값

        // '인앱 총합계' 섹션 업데이트
        document.querySelector('.sum_area.sum_in_app .sum_group:nth-child(1) .sum_space:nth-child(1)').textContent = counts.inAppDomestic; // 국내 첫 번째 값
        document.querySelector('.sum_area.sum_in_app .sum_group:nth-child(1) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumInAppDomestic); // 국내 두 번째 값

        document.querySelector('.sum_area.sum_in_app .sum_group:nth-child(2) .sum_space:nth-child(1)').textContent = counts.inAppOverseas; // 해외 첫 번째 값
        document.querySelector('.sum_area.sum_in_app .sum_group:nth-child(2) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumInAppOverseas); // 해외 두 번째 값

        document.querySelector('.sum_area.sum_in_app .sum_group:nth-child(3) .sum_space:nth-child(1)').textContent = counts.inAppDomestic + counts.inAppOverseas; // Total 첫 번째 값
        document.querySelector('.sum_area.sum_in_app .sum_group:nth-child(3) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumInAppDomestic + sums.sumInAppOverseas); // Total 두 번째 값

        // '앱 + 인앱 총합계' 섹션 업데이트
        document.querySelector('.sum_area.sum_all .sum_group:nth-child(1) .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.inAppDomestic; // 국내 첫 번째 값
        document.querySelector('.sum_area.sum_all .sum_group:nth-child(1) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumDomestic); // 국내 두 번째 값

        document.querySelector('.sum_area.sum_all .sum_group:nth-child(2) .sum_space:nth-child(1)').textContent = counts.appOverseas + counts.inAppOverseas; // 해외 첫 번째 값
        document.querySelector('.sum_area.sum_all .sum_group:nth-child(2) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumOverseas); // 해외 두 번째 값

        document.querySelector('.sum_area.sum_all .sum_group:nth-child(3) .sum_space:nth-child(1)').textContent = counts.appDomestic + counts.inAppDomestic + counts.appOverseas + counts.inAppOverseas; // Total 첫 번째 값
        document.querySelector('.sum_area.sum_all .sum_group:nth-child(3) .sum_space:nth-child(2)').textContent = formatNumbers(sums.sumDomestic + sums.sumOverseas); // Total 두 번째 값
    
    //--------------------------
    
    
    }

});

