import * as THREE from '../three';
import UI from './ui';
//value 0-1
export default class Progress extends UI{
    constructor(paras,eventSysterm,inputEvent,uiCamera){
        super(paras,eventSysterm,inputEvent,uiCamera);
        this.value = !isNaN(parseFloat(this.paras.value))?THREE.Math.clamp(this.paras.value,0,1):0;
    }
    children(){
        this.bk = this.createPlane(this.paras.width,this.paras.height);
        this.fk = this.createPlane(this.paras.width,this.paras.height);
        this.clip_plane = new THREE.Plane(new THREE.Vector3(-1,0,0),0.1);
        this.fk.material.clippingPlanes = [this.clip_plane];
        this.fk.material.color.set("#009b92");
        return [this.bk,this.fk];
    }
    get value(){
        return THREE.Math.clamp(this._value,0,1);
    }
    set value(value){
        this._value = value;
        this.update();
    }
    update(){
        this.UINode.updateMatrixWorld(true);
        this.clip_plane.constant = THREE.Math.lerp(-this.paras.width*0.5,this.paras.width*0.5,this._value)
            + this.UINode.getWorldPosition(new THREE.Vector3()).x;
        if(this._oldValue!==this.value){
            this._oldValue = this.value;
            this.event.fire({
                type:"onValueChange",
                value:this._value
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