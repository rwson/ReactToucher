import React, {Component} from "react";
import Toucher from "./Toucher";

import "./App.css";


class CanvasEraser extends Component {

    constructor(props) {
        super(props);
        this.canvas = null;
        this.cxt = null;
        this.position = null;
        this.cfg = {
            tip: "",
            radius: 20,
            percent: 70,
            width: 300,
            height: 300,
            img: "",
            notifyCallback: () => {
                alert(this.cfg.tip);
            }
        };
    }

    componentWillMount() {
        if (this.props.config && Object.keys(this.props.config)) {
            Object.keys(this.props.config).forEach((key) => {
                this.cfg[key] = this.props.config[key];
            });
        }
        this.cfg.notifyCallback = this.cfg.notifyCallback.bind(this);
    }

    componentDidMount() {
        this.canvas = this.refs["canvasEl"];
        this.cxt = this.canvas.getContext("2d");
        this.position = this.canvas.getBoundingClientRect();
        this.cxt.beginPath();
        this.cxt.fillStyle = "#ccc";
        this.cxt.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.cxt.fill();
        this.cxt.globalCompositeOperation = "destination-out";
    }

    handleSwipe(ev) {
        if (ev && ev.position) {
            const x = ev.position.clientX - this.position.left,
                y = ev.position.clientY - this.position.top;
            const {canvas, cxt, cfg} = this;

            cxt.beginPath();
            cxt.arc(x, y, cfg.radius, 0, Math.PI * 2);
            cxt.fill();

            const imgData = cxt.getImageData(0, 0, canvas.width, canvas.height).data,
                len = imgData.length;
            let transparent = 0, percent;
            for (var i = 0; i < len; i += 4) {
                if (imgData[i] == 0 && imgData[i + 1] == 0 && imgData[i + 2] == 0 && imgData[i + 3] == 0) {
                    transparent += 4;
                }
            }

            percent = (transparent / len) * 100;
            if (percent > cfg.percent) {
                cxt.clearRect(0, 0, canvas.width, canvas.height);
                cfg.notifyCallback();
            }
        }
    }

    render() {

        const {cfg} = this;
        const style = {
            width: `${cfg.width}px`,
            height: `${cfg.height}px`
        };
        const TouchConfig = {
            event: {
                swipe: this.handleSwipe.bind(this)
            }
        };

        return (
            <div className="container" style={style}>
                <Toucher config={TouchConfig}>
                    <canvas ref="canvasEl" width={cfg.width} height={cfg.height}/>
                    <img src={cfg.img} width={cfg.width} height={cfg.height}/>
                </Toucher>
            </div>
        );
    }

    componentWillUnMount(){
        this.canvas = null;
        this.cxt = null;
        this.position = null;
        this.cfg = {};
    }
}

export default CanvasEraser;
