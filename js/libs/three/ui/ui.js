import * as THREE from '../three';
import ThreeUtility from '../three-utility/three-utility';
import Event from '../../event';
import ThreeText2D from '../three-text2d';
//position
//width
//height
//rotation
//name
//pressSetup:(ui,value)=>{}
//enableSetup:(ui,value)=>{}
let initParas = ["position","scale","rotation","name"];
let event_types = ["pointDown","pointUp","pointMove","pointClick","pointDoubleClick"];
export default class UI{
    constructor(paras,eventSysterm,inputEvent,uiCamera){
        this.uiCamera = uiCamera;
        this.paras = paras;
        this.UINode = new THREE.Group();
        let children = this.children();
        if(children){
            children.forEach((c)=>{
                this.UINode.add(c);
            });
        }
        initParas.forEach((key)=>{
            let p = paras[key];
            if(p!==undefined){
                if(key==="position"||key==="rotation"){
                    this.UINode[key].set(p.x,p.y,p.z);
                }
            }
        });
        this.event = new Event();
        this.EventSystem = eventSysterm;
        this.InputEvent = inputEvent;
        this.InputEvent.getAdd(this.UINode).onPress.add((_data)=>{
            if(!this.isEnable)
                return;
            if(this.paras.pressSetup){
                this.paras.pressSetup(this,_data.isPress);
            }
        });
        this.isEnable = this.paras.isEnable===false?false:true;
    }
    children(){

    }
    //……………………刷新组件…………………………………………
    update(){
        
    }
    createPlane(width,height){
        let geometry = new THREE.PlaneBufferGeometry(width,height,0);
        let material = new THREE.MeshBasicMaterial({transparent:true});
        let mesh = new THREE.Mesh( geometry, material );
        return mesh;
    }
    createText(textParas){
        let text_texture = new ThreeText2D(textParas);
        let text = this.createPlane(text_texture.image.width/2,text_texture.image.height/2);
        text.material.map = text_texture;
        text.material.color.set(textParas.color?textParas.color:"black");
        text.material.transparent = true;
        text.material.needsUpdate = true;
        return text;
    }
    //……………………销毁…………………………………………
    destroy(){
        ThreeUtility.destroyObject3d(this.UINode);
    }
    get isEnable(){
        return this._enable;
    }
    set isEnable(isEnable){
        if(this.isEnable!==isEnable){
            this._enable = isEnable;
            if(this.paras.enableSetup){
                this.paras.enableSetup(this,this.isEnable);
            }
        }
    }
}