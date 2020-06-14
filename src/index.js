import React from "react";
import ReactDOM from "react-dom";
import { Maze } from './maze';
import style from "./style.scss";
const App = () => <Maze />
const rootElement = document.getElementById("root");

ReactDOM.render(<App />, rootElement);
