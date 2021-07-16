import { combineReducers } from 'redux';
import homeReducer from "./home/home.reducer";
import loginReducer from "./login/login.reducer";

const rootReducer = combineReducers({
    login: loginReducer,
    home: homeReducer,
});

export default rootReducer;