import React from "react";
import style from "./popup.module.css";

export default function Popup() {
    console.log(style)

    return (
        <div>
            <h1>ChatGPT Extension</h1>
            <button className={style.button}>Hello, world</button>
            <button className={style.button}></button>
        </div>
    )
}