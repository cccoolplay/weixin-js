import UI from '../ui';
//textParas:{text:"",color:"",fontSize:"",width:}
//isSelected:false
//selectSetup:(ui,value)=>{}
export default class SelectGrid extends UI{
    constructor(paras,eventSysterm,inputEvent,uiCamera){
        super(paras,eventSysterm,inputEvent,uiCamera);
        this.EventSystem.addRaycastObject3D(this.bk);
        this.InputEvent.getAdd(this.UINode).onClick.add((_data)=>{
            if(!this.isEnable)
                return;
            this.isSelected = !this.isSelected;
        });
        setTimeout(()=>{
            this.isSelected = this.paras.isSelected;
        },0);
    }
    children(){
        this.bk = this.createPlane(this.paras.width,this.paras.height);
        this.text = this.createText(this.paras.textParas);
        return [this.bk,this.text];
    }
    get isSelected(){
        return this._isSelected===true?true:false;
    }
    set isSelected(isSelected){
        this._isSelected = isSelected;
        this.update();
    }
    update(){
        if(this.paras.selectSetup){
            this.paras.selectSetup(this,this.isSelected);
        }
        if(this.isSelected !== this._oldIsSelected){
            this._oldIsSelected = this.isSelected;
            this.event.fire({
                type:"onValueChange",
                value:this.isSelected
            })
        }
    }
    //……………………添加事件…………………………………………
    onValueChange(callback){
        this.event.addEventListener("onValueChange",callback);
    }
    offValueChange(callback){
        this.event.removeEventListener("onValueChange",callback);
    }
}