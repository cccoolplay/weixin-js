import * as THREE from './three';
import 'GLTFLoader';
import 'three-polyfill';
export default class ThreeCore{
    constructor(){
        this.renderer = new THREE.WebGLRenderer({
            canvas:canvas,
            antialias:true,
            preserveDrawingBuffer:true
        });
        this.renderer.autoClear = false;
        this.renderer.localClippingEnabled = true;
        this.renderer.setClearColor("white");
        this.setupSizeAndRatio();
        wx.onWindowResize(()=>{
            this.setupSizeAndRatio();
        });
    }
    setupSizeAndRatio(){
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth,window.innerHeight);
    }
    //renderInfos:[{scene:,camera:}]
    render(renderInfos){
        this.renderer.clear();
        renderInfos.forEach((render_info)=>{
            this.renderer.render(render_info.scene,render_info.camera);
        })
    }
}