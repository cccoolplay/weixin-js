import * as THREE from '../three'

export default class InputEventData {

    constructor() {
        this.inputID = -1;

        this.isHover = false;
        this.isPress = false;
        this.isDragging = false;

        this.coords = new THREE.Vector2(0, 0);
        this.coordsDelta = new THREE.Vector2(0, 0);
        
        this.viewportCoords = new THREE.Vector2(0, 0);
        this.viewportCoordsDelta = new THREE.Vector2(0, 0);

        this.camera = undefined;

        this.eventObject = undefined;

        this.hitObject = undefined;

        this.hitPosition = new THREE.Vector3(0, 0, 0);
        this.hitNormal = new THREE.Vector3(0, 0, 0);

        this.pressRaycaster = undefined;
    }

    clone() {
        let cloneData = new InputEventData();

        cloneData.inputID = this.inputID;

        cloneData.isHover = this.isHover;
        cloneData.isPress = this.isPress;
        cloneData.isDragging = this.isDragging;

        cloneData.coords = this.coords.clone();
        cloneData.coordsDelta = this.coordsDelta.clone();

        cloneData.viewportCoords = this.viewportCoords.clone();
        cloneData.viewportCoordsDelta = this.viewportCoordsDelta.clone();

        cloneData.camera = this.camera;

        cloneData.eventObject = this.eventObject;

        cloneData.hitObject = this.hitObject;

        cloneData.hitPosition = this.hitPosition.clone();
        cloneData.hitNormal = this.hitNormal.clone();

        cloneData.pressRaycaster = this.pressRaycaster;

        return cloneData;
    }
}
