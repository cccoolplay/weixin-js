import * as THREE from '../three'
import ThreeUtility from '../three-utility/three-utility'
import EventSystem from './event-system'

export default class ViewportRaycaster {

    get left() {
        return EventSystem.width * this.leftRatio;
    }

    get top() {
        return EventSystem.height * this.topRatio;
    }

    get width() {
        return EventSystem.width * this.widthRatio;
    }

    get height() {
        return EventSystem.height * this.heightRatio;
    }

    constructor(_camera, _depth, _leftRatio, _topRatio, _widthRatio, _heightRatio) {
        this.id = ThreeUtility.guid();
        this.camera = _camera;
        this.depth = _depth;

        this.layers = new THREE.Layers();

        this.leftRatio = _leftRatio;
        this.topRatio = _topRatio;
        this.widthRatio = _widthRatio;
        this.heightRatio = _heightRatio;

        if (!this.depth) this.depth = 0;
        if (!this.leftRatio) this.leftRatio = 0;
        if (!this.topRatio) this.topRatio = 0;
        if (!this.widthRatio) this.widthRatio = 1;
        if (!this.heightRatio) this.heightRatio = 1;

        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = this.camera.near;
        this.raycaster.far = this.camera.far;
    }

    getCoords(_clientX, _clientY) {
        return ThreeUtility.getCoordsFromClientXY(_clientX, _clientY, EventSystem.width, EventSystem.height, this.left, this.top, this.width, this.height);
    }

    getRaycastHits(_coords, _object3Ds) {
        this.raycaster.setFromCamera(_coords, this.camera);
        let hits = this.raycaster.intersectObjects(_object3Ds);
        let layerHits = [];
        if (hits.length > 0) {
            hits.forEach((_d) => {
                if (_d.object.layers.test(this.layers)) {
                    layerHits.push(_d);
                }
            });
        }
        return layerHits;
    }
}