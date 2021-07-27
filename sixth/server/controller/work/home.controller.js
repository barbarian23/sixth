import { HOME_URL } from "../../constants/work/work.constants";
import { SOCKET_WORKING_CRAWLED_ITEM_DATA } from "../../../common/constants/common.constants";
import { getListTdInformation, getTdInformation } from "../../service/util/utils.server";
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

export async function doGetInfomation(line, mNumber, mSufNumber, worksheet, socket, driver, style) {
    try {
        console.log("mNumber ", mNumber);
        // go to login url
        await driver.goto(HOME_URL);

        let selector = "#txtSearch";
        await driver.$eval(selector, (el, value) => el.value = value, numberPhone);

        // select to password input & send password
        selector = "#month";
        await driver.$eval(selector, (el, value) => el.value = value, month);

        // select to button search & click button
        selector = "#Div_Param > div:nth-child(2) > div:nth-child(3) > button"; // need to update
        await Promise.all([driver.click(selector)]);//, driver.waitForNavigation({ waitUntil: 'load', timeout: 0 })]);

        await timer(2000);

        //lấy ra table result search - chỉ lấy phần row data
        let resultHtml = await driver.$$eval("#tbody_td_207", spanData => spanData.map((span) => {
            return span.innerHTML;
        }));

        console.log("dataFromTable is: ", resultHtml);

        if (JSON.stringify(resultHtml) == JSON.stringify([""])) { //  table k co du lieu >> k them vao excel
            // bo qua,k them du lieu vao excel
            socket.send(SOCKET_WORKING_CRAWLED_ITEM_DATA, { index: index + 1, phone: numberPhone });

        } else {
            //let listTdTag = getListTdInformation(resultHtml);
            let listTdTag = getListTdInformation(resultHtml[0]);
            console.log("index", index);
            // crawl BTS_NAME
            let btsName = getTdInformation(listTdTag[1]);
            // crawl MATINH - important
            let maTinh = getTdInformation(listTdTag[2]);
            // crawl TOTAL_TKC - optional
            let totalTKC = getTdInformation(listTdTag[3]);
            // thêm data vao excel
            writeToXcell(worksheet, line, 1, index, style); // STT
            writeToXcell(worksheet, line, 2, numberPhone, style); // SDT
            writeToXcell(worksheet, line, 3, btsName[0], style); // BTS_NAME
            writeToXcell(worksheet, line, 4, maTinh[0], style); // MA_TINH
            writeToXcell(worksheet, line, 5, totalTKC[0], style); // TOTAL_TKC
            // gửi dữ liệu về client
            // await socket.send(SOCKET_WORKING_CRAWLED_ITEM_DATA, { index:index, phone: numberPhone, btsName: btsName, maTinh: maTinh, totalTKC: totalTKC });
            socket.send(SOCKET_WORKING_CRAWLED_ITEM_DATA, { index: index, phone: numberPhone });
            // clearInterval(itemPhone.interval);
            line++;
        }
        return line;
    } catch (e) {
        console.log("doGetInfomation error ", e);
    }
}
// export default doGetInfomation;
