import UI from './ui';
//textParas:{text:"",color:"",fontSize:"",width:}
export default class Button extends UI{
    constructor(paras,eventSysterm,inputEvent,uiCamera){
        super(paras,eventSysterm,inputEvent,uiCamera);
        this.EventSystem.addRaycastObject3D(this.bk);
        this.InputEvent.getAdd(this.UINode).onClick.add((_data)=>{
            if(!this.isEnable)
                return;
            let event = _data;
            event.type = "onClick";
            this.event.fire(event);
        });
    }
    children(){
        this.bk = this.createPlane(this.paras.width,this.paras.height);
        this.text = this.createText(this.paras.textParas);
        return [this.bk,this.text];
    }
    //……………………添加事件…………………………………………
    onClick(callback){
        this.event.addEventListener("onClick",callback);
    }
    offClick(callback){
        this.event.removeEventListener("onClick",callback);
    }
}