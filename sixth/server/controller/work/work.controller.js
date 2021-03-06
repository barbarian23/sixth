import socketServer from "../../service/socket/socket.server.service";
// import csvService from "../../service/csv/csv.server.service";
import {
    SOCKET_LOGIN,
    SOCKET_WORKING_START_CRAWL_DATA,
    SOCKET_CRAWLED_DONE
} from "../../../common/constants/common.constants";
import doLogin from "../work/login.controller";
import { renderNumber, doGetInfomation } from "../work/home.controller";


//const puppeteer = require('puppeteer');
const webdriver = require('selenium-webdriver');
const { Builder } = require('selenium-webdriver');
const { ServiceBuilder } = require('selenium-webdriver/ie');
const path = require('path');

//C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
//C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
let exPath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
var driver, browser;

//puppeteer
//socket
var socket = null;
var excel = require('excel4node');
var wb, ws;
var fileName;
var THRESLDHOLD = 50;
const MIN_TIME = 2000;
var line = 2;//bỏ qua header và excel abwts đầu từ một

const preparePuppteer = function () {
    return new Promise(async (res, rej) => {
        try {
            let browser = await puppeteer.launch({
                args: ["--no-sandbox", "--proxy-server='direct://'", '--proxy-bypass-list=*'],
                headless: true,
                ignoreHTTPSErrors: true,
                executablePath: exPath == "" ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" : exPath
            })

            // let pageLogin = await browser.newPage();
            // pageLogin.setViewport({ width: 2600, height: 3800 });

            res(browser);
        } catch (e) {
            rej(e);
        }
    });
}

const prepareSelenium = function () {
    return new Promise(async (res, rej) => {
        try {
            //chạy bằng ie trong máy
            require('iedriver');

            //option
            let ieCapabilities = webdriver.Capabilities.ie();
            ieCapabilities.set("ignoreProtectedModeSettings", true);
            ieCapabilities.set("ignoreZoomSetting", true);
            ieCapabilities.set("headless", true);

            //work khi cần đường dẫn tới 1 driver
            //const driverPath = path.join(__dirname, "seleniumdriver\\ie\\IEDriverServer.exe"); // or wherever you've your geckodriver
            const driverPath = "./seleniumdriver/ie/IEDriverServer.exe";
            console.log("driverPath",driverPath);
            const serviceBuilder = new ServiceBuilder(driverPath);
            const browser = await new Builder()
                .forBrowser('internet explorer')
                .setIeService(serviceBuilder)
                .build();
            //===============================================================

            //work fine không cần đưòng dẫn tới driver mà dùng trực tiếp ie trong máy
            // require('iedriver');
            // let browser = new webdriver.Builder()
            //     .forBrowser("internet explorer")
            //     .withCapabilities(ieCapabilities)
            //     .build();

            res(browser);
        } catch (e) {
            rej(e);
        }
    });
}


const workingController = async function (server) {
    try {
        driver = await prepareSelenium();

        //await driver.get("https://www.google.com");
        //driver = await browser.newPage();
        //driver.setViewport({ width: 2600, height: 3800 });

        //khoi tao socket 
        socket = socketServer(server);
        socket.receive((receive) => {
            //login
            receive.on(SOCKET_LOGIN, login);

            //tra cứu số
            receive.on(SOCKET_WORKING_START_CRAWL_DATA, doGetInfor);
        });
    } catch (e) {
        console.error("loi puppteer hoac socket", e);

    }
}

//login
const login = async function (data) {
    try {
        console.log("login voi username va password", data.username, data.password);
        //let driver2 = await browser.newPage();
        doLogin(data.username, data.password, socket, driver, null); //driver 2 null
    } catch (e) {
        console.log("login error ", e);
    }
}

// crawl data
const doGetInfor = async function (data) { // crawl data in table : data la mNumber - dau so tra cuu
    try {
        console.log("data from client: ", data.mNumber);
        createFileExcel(data.mNumber);
        let style = wb.createStyle({
            alignment: {
                vertical: ['center'],
                horizontal: ['center'],
                wrapText: true,
            },
            font: {
                name: 'Arial',
                color: '#4e3861',
                size: 12,
            },
        });

        // start 
        let mSufNumber = await renderNumber([], false);
        while (true) {
            let countResult = await doGetInfomation(line, data.mNumber, mSufNumber, ws, socket, driver, style);
            if (countResult <= 19) {
                mSufNumber = renderNumber(mSufNumber, true);
            }
            else {
                mSufNumber = renderNumber(mSufNumber, false);
            }

            if (mSufNumber === null) {
                break;
            }
        }
        // end
        await wb.write(fileName);
        socket.send(SOCKET_CRAWLED_DONE, { data: 2 });
        line = 2;
    } catch (e) {
        console.log("doGetInfor error ", e);
    }
}
// timer
function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}
//// foreach
////prepare file xlsx to save data
//ghi ra từng ô
async function writeHeader(wb, ws) {
    try {
        let style = wb.createStyle({
            alignment: {
                vertical: ['center'],
                horizontal: ['center'],
                wrapText: true,
            },
            font: {
                bold: true,
                name: 'Arial',
                color: '#4e3861',
                size: 12,
            },
        });

        ws.cell(1, 1).string("STT").style(style);
        ws.cell(1, 2).string("SĐT").style(style);
        ws.cell(1, 3).string("BTS_NAME").style(style);
        ws.cell(1, 4).string("MA_TINH").style(style);
        ws.cell(1, 5).string("TOTAL_TKC").style(style);
    } catch (e) {
        console.log("e", e);
    }
}

const createFileExcel = function (data) {
    try {
        wb = new excel.Workbook();
        ws = wb.addWorksheet('Tra cứu');

        ws.column(1).setWidth(5);//STT
        ws.column(2).setWidth(30);//Số thuê bao,
        ws.column(3).setWidth(30);//BTS_NAME,
        ws.column(4).setWidth(30);//MA_TINH,
        ws.column(5).setWidth(30);//TOTAL_TKC

        writeHeader(wb, ws);
        let today = new Date();
        fileName = data + " Ngay " + today.getDate() + " Thang " + (today.getMonth() + 1) + " Nam " + today.getFullYear() + " " + today.getHours() + " Gio " + today.getMinutes() + " Phut.xlsx";
        wb.write(fileName);

    } catch (e) {
        console.log("createFileExcel error ", e);
    }
}
////////////////////////


let random = () => {
    let rd = Math.floor(Math.random() * 10);
    console.log("number random", rd);
    return rd;
}

export default workingController;