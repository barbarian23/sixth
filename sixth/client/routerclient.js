import React from "react";
import { Route } from "react-router-dom";
import Home from "./screen/home/home.screen";
import Login from "./screen/login/login.screen";
import { CLIENT_LOGIN, CLIENT_HOME } from "../common/constants/common.constants";

class MainRouter extends React.Component {
    render() {
        return (
            <div>
                <Route exact path={CLIENT_LOGIN} component={Login} />
                <Route path={CLIENT_HOME} component={Home} />
            </div>
        );
    }
}
export default MainRouter;