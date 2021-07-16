import { OPEN_OTP_SCREEN, LOGIN_ERROR, LOGGINGIN } from '../../action/login/login.action';

const initialState = {
    logginin: false,
    isSomethingError: false,
    isLoginSuccess: false,
    username: "",
    password: "",
    loginStatusText: "Đang đăng nhập",
    loginError: "",
};

export default function loginReducer(state = initialState, action) {
    // console.log("initialState " + JSON.stringify(state));
    // console.log("[loginReducers " + action.type + "]", action.value);

    switch (action.type) {

        case OPEN_OTP_SCREEN:
            return {
                ...state,
                isLoginSuccess: true
            }
        case LOGIN_ERROR:
            return {
                ...state,
                loginError: action.value,
                isSomethingError: true //hiện dòng chữ đăng nhập thất bại
            }
        case LOGGINGIN:
            return {
                ...state,
                logginin: action.value,
            }
        default:
            return {
                ...state
            }
    }
}