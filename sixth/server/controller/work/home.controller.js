import { HOME_URL } from "../../constants/work/work.constants";
import { SOCKET_WORKING_CRAWLED_ITEM_DATA } from "../../../common/constants/common.constants";
import { getListTd, getListTr, getTdInformation } from "../../service/util/utils.server";
const DEFAULT_DELAY = 2000;

/**
 * 
 * @param {*} ms sleep đi 1 vài giây, đơn vị là milisecond
 */
function timer(ms) {
    ms = ms == null ? DEFAULT_DELAY : ms;
    return new Promise(res => setTimeout(res, ms));
}
//ghi ra từng ô trong excel
async function writeToXcell(worksheet, x, y, title, style) {
    try {
        worksheet.cell(x, y).string(title + "").style(style);
    } catch (e) {
        console.log("e", e);
    }
}

const maxLength = 6;

// function sinh number
export function renderNumber(curNumber, checkOk) {
    if (curNumber === null) {
        return null; // khong render duoc nua
    }
    else {
        if (checkOk) { // neu checkok 
            curNumber = backNewNumber(curNumber); // sinh ra so moi, tang va quay lai
        } else {
            if (curNumber.length < maxLength) {
                curNumber = nextNewNumber(curNumber); // sinh ra so moi, them so
            } else {
                curNumber = backNewNumber(curNumber); // sinh ra so moi, tang va quay lai
            }

        }
    }
    return curNumber;
}

// function backtrack cho newNumber
function backNewNumber(number) {
    const newNumber = [];
    let j = number.length - 1;
    while (j >= 0) {
        number[j] += 1;
        if (number[j] > 9) {
            j -= 1;
        } else {
            break;
        }
    }

    number.map((item) => {
        if (item <= 9) {
            newNumber.push(item);
        }
    });
    if (newNumber.length === 0) {
        return null;
    }

    return newNumber;
}

function nextNewNumber(number) {
    const newNumber = [];
    number.map((item) => {
        newNumber.push(item);
    });
    newNumber.push(0);

    return newNumber;
}

function convertArrayToNumber(arrayNumber) {
    let newNumber = 0;
    let count = arrayNumber.length - 1;
    let index = 0;
    while (count >= 0) {
        newNumber += arrayNumber[index] * Math.pow(10, count);
        count--;
        index++;
    }
    return newNumber;
}

export async function doGetInfomation(line, mNumber, mSufNumber, worksheet, socket, driver, style) {
    try {
        // chuyển mSufNumber sang số 
        mSufNumber = convertArrayToNumber(mSufNumber);
        //
        console.log("mNumber: ", mNumber, " and mSufNumber: ", mSufNumber);
        // go to home url
        await driver.goto(HOME_URL);

        // Lập HĐ
        let selector = "#myMenuID > table > tbody > tr > td:nth-child(2) > span.ThemeOfficeMainFolderText";
        await Promise.all([driver.click(selector)]);

        // Khởi tạo thuê bao trả sau
        selector = "#cmSubMenuID2 > table > tbody > tr:nth-child(40) > td.ThemeOfficeMenuItemText";
        await Promise.all([driver.click(selector)]);

        // Kho số
        // Kho số/ Chọn Kho trả sau viễn thông tỉnh - value "3"
        selector = "#cmdKhoSo";
        // await Promise.all([driver.click(selector)]); không cần click trước
        await Promise.all([driver.select(selector, '3')]);

        // Số thuê bao - chọn ra đầu số thuê bao
        // Chọn đầu số - Đặt đầu số mặc định là 8481
        selector = "#prefix";
        await driver.$eval(selector, (el, value) => el.value = value, mNumber);

        // Chọn sufNumber input và điền sufNumber 
        selector = ""; //>> need to update selector
        await driver.$eval(selector, (el, value) => el.value = value, mSufNumber);

        // Bấm nút tìm kiếm
        selector = "#search";
        await Promise.all([driver.click(selector)]);
        await timer(2000);

        // lấy toàn bộ kết quả và bắt đầu kiểm tra số row trong bảng
        //lấy ra table result search - chỉ lấy phần row data
        let resultHtml = await driver.$$eval("#dsthuebao", spanData => spanData.map((span) => {
            return span.innerHTML;
        }));

        console.log("dataFromTable is: ", resultHtml);
        // write sub header - exp: 84812
        writeToXcell(worksheet, line, 1, mNumber.toString() + mSufNumber.toString(), style); // sub header
        if (JSON.stringify(resultHtml) == JSON.stringify(["null"])) { //  table k co du lieu >> return line luôn, chỉ xét trường hợp có dữ liệu
            line++;
        } else {
            // Lan 1: chưa bấm next
            let count = getCountTr(resultHtml);
            if (count < 19) {
                let listTr = getListTr(resultHtml);
                listTr.forEach(element => {
                    let listTd = getListTd(element);
                    let col1 = getTdInformation(listTd[0]);
                    let col2 = getTdInformation(listTd[1]);
                    let col3 = getTdInformation(listTd[2]);
                    let col4 = getTdInformation(listTd[3]);
                    let col5 = getTdInformation(listTd[4]);

                    writeToXcell(worksheet, line, 1, col1[1], style);
                    writeToXcell(worksheet, line, 2, col2[1], style);
                    writeToXcell(worksheet, line, 3, col3[1], style);
                    writeToXcell(worksheet, line, 4, col4[1], style);
                    writeToXcell(worksheet, line, 5, col5[1], style);

                    line++;
                });
            } else {
                // Lấy giá trị đầu tiên cuả lần 1
                let listTr = getListTr(resultHtml);
                let firstListTd = getListTd(listTr[0]);
                let firstNumber = getTdInformation(firstListTd[2]);

                // bấm next lần 1
                await Promise.all([driver.click("#btnNext")]);
                let resultHtmlNext = await driver.$$eval("#dsthuebao", spanData => spanData.map((span) => {
                    return span.innerHTML;
                }));

                // Lấy giá trị đầu tiên của lần 2
                let listTrNext = getListTr(resultHtmlNext);
                let firstListTdNext = getListTd(listTrNext[0]);
                let firstNumberNext = getTdInformation(firstListTdNext[2]);

                //Number đầu tiên giống nhau -> chỉ có 19 kết quả
                if (firstNumber[1] === firstNumberNext[1]) {
                    // ghi ra file giống trường hợp < 19 kết quả
                    let listTr = getListTr(resultHtml);
                    listTr.forEach(element => {
                        let listTd = getListTd(element);
                        let col1 = getTdInformation(listTd[0]);
                        let col2 = getTdInformation(listTd[1]);
                        let col3 = getTdInformation(listTd[2]);
                        let col4 = getTdInformation(listTd[3]);
                        let col5 = getTdInformation(listTd[4]);

                        writeToXcell(worksheet, line, 1, col1[1], style);
                        writeToXcell(worksheet, line, 2, col2[1], style);
                        writeToXcell(worksheet, line, 3, col3[1], style);
                        writeToXcell(worksheet, line, 4, col4[1], style);
                        writeToXcell(worksheet, line, 5, col5[1], style);

                        line++;
                    });
                } else {
                    // line++; return; de next so
                    line++;
                }
            }
        }
        return line;
    } catch (e) {
        console.log("doGetInfomation error ", e);
    }
}
