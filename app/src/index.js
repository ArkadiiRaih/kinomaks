import "core-js/es/map";
import "core-js/es/set";
import React from "react";
import { render } from "react-dom";
import App from "./App";
import connect from "@vkontakte/vk-connect";

connect.send("VKWebAppInit");

render(<App />, document.getElementById("root"));
