let doEvent = (array,e,tag)=>{
    let handles = [];
    array.forEach((item)=>{
        handles.push(item);
    });
    handles.forEach((item)=>{
        item(e);
    });
};
let getEventData = (e,isMouse)=>{
    let event = e;
    event.isTouch = !isMouse;
    event.isMouse = isMouse;
    return event;
};
class CrossEvent{
    constructor(){
        this.eventContainer = {
            "pointEnter":[],
            "pointMove":[],
            "pointOut":[],
            "pointDown":[],
            "pointUp":[],
            "pointClick":[],
            "pointDoubleClick":[],
            "wheel":[],
            "mouseWheel":[],
            "leftPointDown":[],
            "leftPointUp":[],
            "leftPointMove":[],
            "rightPointDown":[],
            "rightPointUp":[],
            "rightPointMove":[]
        };
        this.touchStartHandle = (e)=>{
            let event = getEventData(e,false);
            doEvent(this.eventContainer["pointEnter"],event);
            doEvent(this.eventContainer["pointDown"],event);
            if(event.touches.length===1)
                doEvent(this.eventContainer["leftPointDown"],event);
            else if(event.touches.length===2)
                doEvent(this.eventContainer["rightPointDown"],event);
        };
        this.touchMoveHandle = (e)=>{
            let event = getEventData(e,false);
            doEvent(this.eventContainer["pointMove"],event);
            if(event.touches.length===1)
                doEvent(this.eventContainer["leftPointMove"],event);
            else if(event.touches.length===2)
                doEvent(this.eventContainer["rightPointMove"],event);
        };
        this.touchEndHandle = (e)=>{
            let event = getEventData(e,false);
            doEvent(this.eventContainer["pointUp"],event);
            if(event.touches.length===0&&event.changedTouches.length===1){
                doEvent(this.eventContainer["leftPointUp"],event);
                this.clickHandle(e);
            }
            else if(event.touches.length===1&&event.changedTouches.length===1){
                doEvent(this.eventContainer["rightPointUp"],event);
            }
            doEvent(this.eventContainer["pointOut"],event);
        };
        let listenDoubleClick = false;
        let clickTimeListener = null;
        this.clickHandle = (e)=>{
            doEvent(this.eventContainer["pointClick"], e);
            if(listenDoubleClick){
                listenDoubleClick = false;
                clearTimeout(clickTimeListener);
                doEvent(this.eventContainer["pointDoubleClick"], e);
            }else{
                listenDoubleClick = true;
                clickTimeListener = setTimeout(()=>{
                    listenDoubleClick = false;
                },200);
            }
        };
    }
    add(eventType,handle){
        if(handle in this.eventContainer[eventType]){
            console.error("当前事件已包含该handle");
            return;
        }
        this.eventContainer[eventType].push(handle);
    }
    remove(eventType,handle){
        let index = this.eventContainer[eventType].indexOf(handle);
        if(index!==-1){
            this.eventContainer[eventType].splice(index,1);
        }
    }
    clear(){
        for(let k in this.eventContainer){
            this.eventContainer[k] = [];
        }
    }
    start(){
        wx.onTouchStart(this.touchStartHandle);
        wx.onTouchMove(this.touchMoveHandle);
        wx.onTouchEnd(this.touchEndHandle);
    }
    end(){
        wx.offTouchStart(this.touchStartHandle);
        wx.offTouchMove(this.touchMoveHandle);
        wx.offTouchEnd(this.touchEndHandle);
    }
    destroy(){
        this.clear();
        this.end();
    }
}
let DOMCrossPlatformEvent = {
    EventType:{
        "pointEnter":"pointEnter",
        "pointMove":"pointMove",
        "pointOut":"pointOut",
        "pointDown":"pointDown",
        "pointUp":"pointUp",
        "pointClick":"pointClick",
        "pointDoubleClick":"pointDoubleClick",
        "wheel":"wheel",
        "mouseWheel":"mouseWheel",
        "leftPointDown":"leftPointDown",
        "leftPointUp":"leftPointUp",
        "leftPointMove":"leftPointMove",
        "rightPointDown":"rightPointDown",
        "rightPointUp":"rightPointUp",
        "rightPointMove":"rightPointMove"
    },
    CreateCrossEvent:()=>{
        return new CrossEvent();
    }
};
export default DOMCrossPlatformEvent;