/**
 * Toucher.js
 * build by rwson @8/31/16
 * mail:rw_Song@sina.com
 */

"use strict";

import React, {Component} from "react";

//  获取对象上的类名
function _typeOf(obj) {
    return Object.prototype.toString.call(obj).toLowerCase().slice(8, -1);
}

//  获取当前时间戳
function getTimeStr() {
    return +(new Date());
}

//  获取位置信息
function getPosInfo(ev) {
    let _touches = ev.touches;
    if (!_touches || _touches.length === 0) {
        return;
    }
    return {
        pageX: ev.touches[0].pageX,
        pageY: ev.touches[0].pageY,
        clientX: ev.touches[0].clientX || 0,
        clientY: ev.touches[0].clientY || 0
    };
}

//  绑定事件
function bindEv(el, type, fn) {
    if (el.addEventListener) {
        el.addEventListener(type, fn, false);
    } else {
        el["on" + type] = fn;
    }
}

//  解绑事件
function unBindEv(el, type, fn) {
    if (el.removeEventListener) {
        el.removeEventListener(type, fn, false);
    } else {
        el["on" + type] = fn;
    }
}

//  获得滑动方向
function getDirection(startX, startY, endX, endY) {
    const xRes = startX - endX,
        xResAbs = Math.abs(startX - endX),
        yRes = startY - endY,
        yResAbs = Math.abs(startY - endY);
    let direction = "";

    if (xResAbs >= yResAbs && xResAbs > 25) {
        direction = (xRes > 0) ? "Right" : "Left";
    } else if (yResAbs > xResAbs && yResAbs > 25) {
        direction = (yRes > 0) ? "Down" : "Up";
    }
    return direction;
}

//  取得两点之间直线距离
function getDistance(startX, startY, endX, endY) {
    return Math.sqrt(Math.pow((startX - endX), 2) + Math.pow((startY - endY), 2));
}

function getLength(pos) {
    return Math.sqrt(Math.pow(pos.x, 2) + Math.pow(pos.y, 2));
}

function cross(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
}

//  取向量
function getVector(startX, startY, endX, endY) {
    return (startX * endX) + (startY * endY);
}

//  获取角度
function getAngle(v1, v2) {
    const mr = getLength(v1) * getLength(v2);
    if (mr === 0) {
        return 0
    }
    let r = getVector(v1.x, v1.y, v2.x, v2.y) / mr;
    if (r > 1) {
        r = 1;
    }
    return Math.acos(r);
}

//  获取旋转的角度
function getRotateAngle(v1, v2) {
    let angle = getAngle(v1, v2);
    if (cross(v1, v2) > 0) {
        angle *= -1;
    }
    return angle * 180 / Math.PI;
}

//  包装一个新的事件对象
function wrapEvent(ev, obj) {
    let res = ev;
    if (_typeOf(obj) === "object") {
        for (let i in obj) {
            try {
                res[i] = obj[i];
            } catch (e) {
            }
        }
    }
    return res;
}


//  把伪数组转换成数组
function toArray(list) {
    if (list && (typeof list === "object") && isFinite(list.length) && (list.length >= 0) && (list.length === Math.floor(list.length)) && list.length < 4294967296) {
        return [].slice.call(list);
    }
}

//  判断一个元素列表里面是否有多个元素
function isContain(collection, el) {
    if (arguments.length === 2) {
        return collection.some(function (elItem) {
            return el.isEqualNode(elItem);
        });
    }
    return false;
}

let storeEvents = {};

let _wrapped;

const support = ["singleTap", "longTap", "swipe", "swipeStart", "swipeEnd", "swipeUp", "swipeRight", "swipeDown", "swipeLeft", "pinch", "rotate"];

/**
 * Event module
 */
class Event {

    static add(type, el, handler) {
        let selector = el,
            len = arguments.length,
            finalObject = {}, _type;
        /**
         * Event.add("swipe", function() {
                 *      //  ...
                 * });
         */

        if (_typeOf(el) === "string") {
            el = document.querySelectorAll(el);
        }

        if (len === 2 && _typeOf(el) === "function") {
            finalObject = {
                handler: el
            };
        } else if (len === 3 && el instanceof HTMLElement || el instanceof NodeList && _typeOf(handler) === "function") {
            /**
             * Event.add("swipe", "#div", function(ev) {
                     *      //  ...
                     * });
             */
            _type = _typeOf(el);
            finalObject = {
                type: _type,
                selector: selector,
                el: _type === "nodelist" ? toArray(el) : el,
                handler: handler
            };
        }

        if (!storeEvents[type]) {
            storeEvents[type] = [];
        }

        storeEvents[type].push(finalObject);
    }

    static trigger(type, el, argument) {
        const len = arguments.length;

        /**
         * Event.trigger("swipe", document.querySelector("#div"), {
                 *      //  ...
                 * });
         */

        if (len === 3 && _typeOf(storeEvents[type]) === "array" && storeEvents[type].length) {
            storeEvents[type].forEach(function (item) {
                if (_typeOf(item.handler) === "function") {
                    if (item.type && item.el) {
                        argument.target = el;
                        if (item.type === "nodelist" && isContain(item.el, el)) {
                            item.handler(argument);
                        } else if (item.el.isEqualNode && item.el.isEqualNode(el)) {
                            item.handler(argument);
                        }
                    } else {
                        item.handler(argument);
                    }
                }
            });
        }
    }
}

class Toucher extends Component {

    constructor(prop) {
        super(prop);
        this.el;
        this.scale = 1;
        this.pinchStartLen = null;
        this.isDoubleTap = false;
        this.triggedSwipeStart = false;
        this.triggedLongTap = false;
        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.singleTapTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.startPos = {};
        this.endPos = {};
        this.preTapPosition = {};
        this.cfg = {
            longTapTime: 700,

        };

        this.startFn = this._handleTouchStart.bind(this);
        this.moveFn = this._handleTouchMove.bind(this);
        this.cancelFn = this._handleTouchCancel.bind(this);
        this.endFn = this._handleTouchEnd.bind(this);
    }

    _handleTouchStart(ev) {
        let touches = ev.touches,
            target = ev.target,
            otherToucher, v;
        if (!touches || touches.length === 0) {
            return;
        }

        this.now = getTimeStr();
        this.startPos = getPosInfo(ev);
        this.delta = this.now - (this.last || this.now);
        this.triggedSwipeStart = false;
        this.triggedLongTap = false;

        //  快速双击
        if (JSON.stringify(this.preTapPosition).length > 2 && this.delta < this.cfg.doubleTapTime && getDistance(this.preTapPosition.clientX, this.preTapPosition.clientY, this.startPos.clientX, this.startPos.clientY) < 25) {
            this.isDoubleTap = true;
        }

        //  长按定时
        this.longTapTimeout = setTimeout(function () {
            _wrapped = {
                el: this.el,
                type: "longTap",
                timeStr: getTimeStr(),
                position: this.startPos
            };
            Event.trigger("longTap", target, _wrapped);
            this.triggedLongTap = true;
        }, this.cfg.longTapTime || 700);

        //  多个手指放到屏幕
        if (ev.touches.length > 1) {
            this._cancelLongTap();
            otherToucher = ev.touches[1];
            v = {
                x: otherToucher.pageX - this.startPos.pageX,
                y: otherToucher.pageY - this.startPos.pageY
            };
            this.preV = v;
            this.pinchStartLen = getLength(v);
            this.isDoubleTap = false;
        }

        this.last = this.now;
        this.preTapPosition = this.startPos;

        ev.preventDefault();
    }

    _handleTouchMove(ev) {
        if (!ev.touches || ev.touches.length === 0) {
            return;
        }

        let v, otherToucher,
            len = ev.touches.length,
            posNow = getPosInfo(ev),
            preV = this.preV,
            currentX = posNow.pageX,
            currentY = posNow.pageY,
            target = ev.target;

        //  手指移动取消长按事件和双击
        this._cancelLongTap();
        this.isDoubleTap = false;

        //  一次按下抬起只触发一次swipeStart
        if (!this.triggedSwipeStart) {
            _wrapped = {
                el: this.el,
                type: "swipeStart",
                timeStr: getTimeStr(),
                position: posNow
            };
            Event.trigger("swipeStart", target, _wrapped);
            this.triggedSwipeStart = true;
        } else {
            _wrapped = {
                el: this.el,
                type: "swipe",
                timeStr: getTimeStr(),
                position: posNow
            };
            Event.trigger("swipe", target, _wrapped);
        }

        if (len > 1) {
            otherToucher = ev.touches[1];
            v = {
                x: otherToucher.pageX - currentX,
                y: otherToucher.pageY - currentY
            };

            //  缩放
            _wrapped = wrapEvent(ev, {
                el: this.el,
                type: "pinch",
                scale: getLength(v) / this.pinchStartLen,
                timeStr: getTimeStr(),
                position: posNow
            });
            Event.trigger("pinch", target, _wrapped);

            //  旋转
            _wrapped = wrapEvent(ev, {
                el: this.el,
                type: "rotate",
                angle: getRotateAngle(v, preV),
                timeStr: getTimeStr(),
                position: posNow
            });
            Event.trigger("rotate", target, _wrapped);
            ev.preventDefault();
        }

        this.endPos = posNow;
    }

    _handleTouchCancel(ev) {
        clearTimeout(this.longTapTimeout);
        clearTimeout(this.tapTimeout);
        clearTimeout(this.swipeTimeout);
        clearTimeout(this.singleTapTimeout);
    }

    _handleTouchEnd(ev) {
        if (!ev.changedTouches) {
            return;
        }

        //  取消长按
        this._cancelLongTap();

        var self = this;
        var direction = getDirection(this.endPos.clientX, this.endPos.clientY, this.startPos.clientX, this.startPos.clientY);
        var callback, target = ev.target;

        if (direction !== "") {
            this.swipeTimeout = setTimeout(function () {
                _wrapped = wrapEvent(ev, {
                    el: this.el,
                    type: "swipe",
                    timeStr: getTimeStr(),
                    position: this.endPos
                });
                Event.trigger("swipe", target, _wrapped);

                //  获取具体的swipeXyz方向
                callback = self["swipe" + direction];
                _wrapped = wrapEvent(ev, {
                    el: this.el,
                    type: "swipe" + direction,
                    timeStr: getTimeStr(),
                    position: this.endPos
                });
                Event.trigger(("swipe" + direction), target, _wrapped);

                _wrapped = wrapEvent(ev, {
                    el: this.el,
                    type: "swipeEnd",
                    timeStr: getTimeStr(),
                    position: this.endPos
                });
                Event.trigger("swipeEnd", target, _wrapped);
            }, 0);
        } else if (!this.triggedLongTap) {
            this.tapTimeout = setTimeout(() => {
                if (this.isDoubleTap) {
                    _wrapped = wrapEvent(ev, {
                        el: this.el,
                        type: "doubleTap",
                        timeStr: getTimeStr(),
                        position: this.startPos
                    });
                    Event.trigger("doubleTap", target, _wrapped);
                    clearTimeout(this.singleTapTimeout);
                    this.isDoubleTap = false;
                } else {
                    this.singleTapTimeout = setTimeout(() => {
                        _wrapped = wrapEvent(ev, {
                            el: this.el,
                            type: "singleTap",
                            timeStr: getTimeStr(),
                            position: this.startPos
                        });
                        Event.trigger("singleTap", target, _wrapped);
                    }, 100);
                }
            }, 0);
        }

        this.startPos = {};
        this.endPos = {};
    }

    _cancelLongTap() {
        if (_typeOf(this.longTapTimeout) !== "null") {
            clearTimeout(this.longTapTimeout);
        }
    }

    componentDidMount() {
        let cfgEvent, type;
        const {config} = this.props;
        if (config.cfg) {
            this.cfg = config.cfg;
        }
        this.el = this.refs["toucherContainer"];
        bindEv(this.el, "touchstart", this.startFn);
        bindEv(this.el, "touchmove", this.moveFn);
        bindEv(this.el, "touchcancel", this.cancelFn);
        bindEv(this.el, "touchend", this.endFn);

        if (config.event && Object.keys(config.event)) {
            Object.keys(config.event).forEach((key) => {
                if (support.indexOf(key) > -1) {
                    cfgEvent = config.event[key];
                    type = _typeOf(cfgEvent);
                    if (type === "function") {
                        Event.add(key, cfgEvent);
                    } else if (type === "object" && cfgEvent.el && cfgEvent.handler) {
                        Event.add(key, cfgEvent.el, cfgEvent.handler);
                    }
                }
            });
        }

    }

    render() {
        const {children} = this.props;
        return (
            <div className="toucher-container" ref="toucherContainer">
                {children}
            </div>
        );
    }

    componentWillUnMount() {
        this.cfg = {};
        unBindEv(this.el, "touchstart", this.startFn);
        unBindEv(this.el, "touchmove", this.moveFn);
        unBindEv(this.el, "touchcancel", this.cancelFn);
        unBindEv(this.el, "touchend", this.endFn);
    }

}

Toucher.propTypes = {
    config: React.PropTypes.object.isRequired
};

export default Toucher;
