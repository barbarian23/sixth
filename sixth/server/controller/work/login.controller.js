import { HOME_URL, LOGIN_URL } from "../../constants/work/work.constants";
import { SOCKET_SOMETHING_ERROR, SOCKET_LOGIN_INCORRECT, SOCKET_LOGIN_STATUS } from "../../../common/constants/common.constants";
const { By, Key, until } = require('selenium-webdriver');


const DEFAULT_DELAY = 2000;

/**
 * 
 * @param {*} ms sleep đi 1 vài giây, đơn vị là milisecond
 */
function timer(ms) {
    ms = ms == null ? DEFAULT_DELAY : ms;
    return new Promise(res => setTimeout(res, ms));
}

// do login
async function doLogin(username, password, socket, driver, driver2) {
    try {
        console.log("username ", username, "password", password);
        // go to login url
        //await driver.goto(LOGIN_URL);
        await driver.get(LOGIN_URL);

        // wait to complete
        //await driver.waitForFunction('document.readyState === "complete"'); // need open comment
        //await driver.executeScript('document.readyState === "complete"');

        // select to username input & send username
        //let selector = "body #ctl01 .page .main .accountInfo #MainContent_LoginUser_UserName"; // need open comment
        let selector = "#username";
        //await driver.$eval(selector, (el, value) => el.value = value, username);
        await driver.findElement(By.css(selector)).sendKeys(username);

        // select to password input & send password
         //selector = "body #ctl01 .page .main .accountInfo #MainContent_LoginUser_Password";// need open comment
        selector = "#passWord";

        //await driver.$eval(selector, (el, value) => el.value = value, password);
        await driver.findElement(By.css(selector)).sendKeys(password);

        // select to button login & click button
        // selector = "body #ctl01 .page .main .accountInfo #MainContent_LoginUser_LoginButton";// need open comment
        selector = "#btnLogin";
        //await Promise.all([driver.click(selector), driver.waitForNavigation({ waitUntil: 'networkidle0' })]);
        await driver.findElement(By.css(selector)).click();

        await timer(2500);

        //selector = ""; // lay ra DOM khi login loi  
        // let dataFromLoginSummarySpan = await driver.$$eval(selector, spanData => spanData.map((span) => {
        //     return span.innerHTML;
        // }));
        // lay ra DOM khi login loi  
        let errLogin = await driver.executeScript('return document.getElementById("inform").innerHTML');
        // let dataFromLoginSummarySpan = await driver.executeScript(function () {
        //     return document.querySelector('#something').innerHTML;
        // });

        if (errLogin == null || errLogin == "") {
            socket.send(SOCKET_LOGIN_INCORRECT, { data: -1 });
            return;
        }

        //đi tới trang thông tin số
        //await driver.goto(HOME_URL);
        await driver.get(HOME_URL);

        // wait to complete

        // await driver.evaluate("setInterval(()=>{document.querySelector('#passOTP')},500)");

        // await driver.waitForFunction('document.querySelector("#passOTP") != null');

        //await driver2.goto(OTP_URL);

        socket.send(SOCKET_LOGIN_STATUS, { data: 1 });

    } catch (e) {
        console.log("Login Error", e);
        socket.send(SOCKET_LOGIN_INCORRECT, { data: -1 });
        socket.send(SOCKET_SOMETHING_ERROR, { data: 0 });
    }
}
export default doLogin;
