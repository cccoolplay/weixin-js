import * as THREE from '../three';

export default class targetCamera{
    constructor(camera){
        this.target = new THREE.Group();
        this.camMountGO = new THREE.Group();
        this.camera = camera;
        this.init();
    }
    init(){
        this.target.add(this.camMountGO);
        this.camMountGO.position.z = 5;
        this.update();
    }
    update(){
        this.camMountGO.position.x = 0 ;
        this.camMountGO.position.y = 0;
        this.target.updateMatrixWorld(true);
        this.camera.position.copy(this.camMountGO.getWorldPosition(new THREE.Vector3()));
        this.camera.lookAt(this.target.getWorldPosition(new THREE.Vector3()));
    }
    //(target)=>{}
    setTargetProps(setFun){
        setFun(this.target);
        this.update();
    }
    //(cam)=>{}
    setCamProps(setFun){
        setFun(this.camMountGO);
        this.update();
    }
}
