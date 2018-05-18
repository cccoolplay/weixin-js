import * as THREE from '../three';

export default class CameraTarget {
    constructor(camera,target){
        this.target = target;
        this.camera = camera;
    }
}