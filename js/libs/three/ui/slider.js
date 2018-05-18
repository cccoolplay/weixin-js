import * as THREE from '../three';
import UI from './ui';
//min
//max
//value
export default class Slider extends UI{
    constructor(paras,eventSysterm,inputEvent,uiCamera){
        super(paras,eventSysterm,inputEvent,uiCamera);
        this.min = !isNaN(parseFloat(this.paras.min))?this.paras.min:0;
        this.max = !isNaN(parseFloat(this.paras.max))?this.paras.max:1;
        setTimeout(()=>{
            this.value = !isNaN(parseFloat(this.paras.value))?THREE.Math.clamp(this.paras.value,this.min,this.max):this.min;
        },0);
        this.EventSystem.addRaycastObject3D(this.bk);
        this.EventSystem.addRaycastObject3D(this.tag);
        this.InputEvent.getAdd(this.UINode).onDragging.add((_data)=>{
            let worldPos = new THREE.Vector3(_data.coords.x,_data.coords.y,-1).unproject(this.uiCamera);
            let value = (worldPos.x - this.UINode.getWorldPosition(new THREE.Vector3()).x)/this.paras.width +0.5;
            this.value = THREE.Math.lerp(this.min,this.max,value);
        });
    }
    children(){
        this.bk = this.createPlane(this.paras.width,this.paras.height);
        this.fk = this.createPlane(this.paras.width,this.paras.height);
        this.clip_plane = new THREE.Plane(new THREE.Vector3(-1,0,0),0.1);
        this.fk.material.clippingPlanes = [this.clip_plane];
        this.fk.material.color.set("#009b92");
        this.tag = this.createPlane(this.paras.height*1.2,this.paras.height*1.2);
        this.tag.material.color.set("#009b92");
        return [this.bk,this.fk,this.tag];
    }
    get min(){
        return this._min;
    }
    set min(min){
        this._min = min;
        this.update();
    }
    get max(){
        return this._max;
    }
    set max(max){
        this._max = max;
        this.update();
    }
    get value(){
        return THREE.Math.clamp(this._value,this.min,this.max);
    }
    set value(value){
        this._value = value;
        this.update();
    }
    update(){
        let value = (this.value-this.min)/(this.max - this.min);
        let local_pos_x = THREE.Math.lerp(-this.paras.width*0.5,this.paras.width*0.5,value);
        this.clip_plane.constant = local_pos_x + this.UINode.getWorldPosition(new THREE.Vector3()).x;
        this.tag.position.x = local_pos_x;
        if(this._oldValue!==this.value){
            this._oldValue = this.value;
            this.event.fire({
                type:"onValueChange",
                value:this.value
            })
        }
    }
    onValueChange(callback){
        this.event.addEventListener("onValueChange",callback);
    }
    offValueChange(callback){
        this.event.removeEventListener("onValueChange",callback);
    }
}
