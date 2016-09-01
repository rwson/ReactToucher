### ReactToucher

React手势管理系统

----

#### Usage

    npm install ReactToucher --save

    //  ...

    import React,{ Component } from "react";
    import ReactDOM from "react-dom";
    import ReactToucher from "ReactToucher";
    
    class App extend Component {
        
        constructor(props) {
            super(props);
        }
        
        handleSwipe() {
            //  ...
        }
        
        handleLongTap() {
            //  ...
        }
        
        render() {
            const config={
                event: {
                    longTap: {
                        el: '.div',
                        handler: this.handleLongTap.bind(this)
                    },
                    swipe: this.handleSwipe.bind(this)
                },
                cfg:{
                    longTapTime: 700
                }
            };

            return (
                <div>
                    <ReactToucher config={config}>
                        <div className="div"></div>
                        <div className="div"></div>
                    </ReactToucher>
                </div>
            );
        }
    }
    
    ReactDOM.rander(<App />, document.querySelector("#app"));

#### 支持事件类型

singleTap

longTap

swipe

swipeStart

swipeEnd

swipeUp

swipeRight

swipeDown

swipeLeft

pinch

rotate


在传入事件回调的时候,需要在组件中用

    this.xxxMethod.bind(this)

否则,如果在该方法中用会导致this指向window的问题

#### 所有的可选参数

- **config**

名称 | 意义 | 类型 | 可选 | 默认
---|---|---|---|---
singleTap | 轻击屏幕配置 | Function/Object | 是 | NA
longTap | 长按回调 | Function/Object | 是 | NA
swipe | 手指在屏幕滑动过程回调 | Function/Object | 是 | NA
swipeStart | 手指开始滑动回调 | Function/Object | 是 | NA
swipeEnd | 结束滑动过程回调 | Function/Object | 是 | NA
swipeUp | 上滑 | Function/Object | 是 | NA
swipeRight | 右滑 | Function/Object | 是 | NA
swipeDown | 下滑 | Function/Object | 是 | NA
swipeLeft | 左滑 | Function/Object | 是 | NA
pinch | 缩放 | Function/Object | 是 | NA
rotate | 旋转 | Function/Object | 是 | NA

当该事件对应的配置项是Object的时候,必须传入el和handler属性,否则该配置项无效,且handler的触发条件是事件的作用在el对应的元素上

- **cfg**

名称 | 意义 | 类型 | 可选 | 默认
---|---|---|---|---
longTapTime | 手指按下不动多久(ms)触发长按事件 | Number | 是 | 700


