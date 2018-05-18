import * as THREE from '../three';
import Button from './button';
import Anchor from './anchor';
import Progress from './progress';
import Slider from './slider';
import SelectGrid from './select-grid/select-grid';
import EventSystem from '../input-event/event-system';
import ViewportRaycaster from '../input-event/viewport-raycaster';
import InputEvent from '../input-event/input-event';
let ui_types = {
    "button":Button,
    "anchor":Anchor,
    "progress":Progress,
    "slider":Slider,
    "selectGrid":SelectGrid
};
export default class UICore{
    constructor(camDepth,sceneLayer){
        this.uiScene = new THREE.Scene();
        this.uiCamera = new THREE.OrthographicCamera(
            -window.innerWidth/2,window.innerWidth/2,window.innerHeight/2,-window.innerHeight/2,0,1000);
        this.uiCamera.position.z = 100;
        this.camDepth = camDepth;
        this.sceneLayer = sceneLayer;
        EventSystem.setSize(window.innerWidth,window.innerHeight);
        let viewportRaycasterUI = new ViewportRaycaster(this.uiCamera,camDepth);
        viewportRaycasterUI.layers.set(sceneLayer);
        EventSystem.addViewportRaycaster(viewportRaycasterUI);
    }
    createUIComponent(type,paras){
        let component = new ui_types[type](paras,EventSystem,InputEvent,this.uiCamera);
        this.uiScene.add(component.UINode);
        return component;
    }
    updateLayer(){
        this.uiScene.traverse((child)=>{
            if(child.layers){
                child.layers.set(this.sceneLayer);
            }
        })
    }
}