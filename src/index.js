import React from "react";
import ReactDOM from "react-dom";
import CanvasEraser from "./CanvasEraser";

import "./index.css";

const config = {
    tip: "哟!刮出个大美女!",
    radius: 20,
    percent: 70,
    width: 300,
    height: 300,
    img: "img/beauty.jpg",
    notifyCallback: () => {
        alert(config.tip);
    }
};

ReactDOM.render(
    <div>
        <CanvasEraser config={config}/>
    </div>,
    document.getElementById("root")
);
