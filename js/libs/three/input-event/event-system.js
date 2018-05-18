import * as THREE from '../three'

import ThreeUtility from '../three-utility/three-utility'
import InputEventData from './input-event-data'

export default class EventSystem {

    constructor() {
        this.m_rendererWidth = 100;
        this.m_rendererHeight = 100;

        this.viewportRaycasters = [];

        this.m_coords = undefined;
        this.m_coordsDelta = new THREE.Vector2(0, 0);

        this.m_viewportCoords = new THREE.Vector2(0, 0);
        this.m_viewportCoordsDelta = new THREE.Vector2(0, 0);

        this.m_pressEventData = undefined;
        this.m_dragEventData = undefined;

        this.m_pressViewportRaycaster = undefined;

        this.m_raycastObject3Ds = [];

        this.initEvent();
    }

    initEvent() {

        wx.onTouchStart((_res) => {
            this.touchStart(_res);
        });

        wx.onTouchMove((_res) => {
            this.touchMove(_res);
        });

        wx.onTouchEnd((_res) => {
            this.touchEnd(_res);
        });

        wx.onTouchCancel((_res) => {
            this.touchCancel(_res);
        });
    }

    touchStart(_res) {
        if (_res && _res.changedTouches && _res.changedTouches.length > 0) {
            let curTouch = _res.changedTouches[0];
            this.m_coords = this.getCoords(curTouch.clientX, curTouch.clientY);

            let hits = undefined;
            let hit = undefined;

            for (let i = 0; i < this.viewportRaycasters.length; i++) {
                let viewportRaycaster = this.viewportRaycasters[i];
                this.m_viewportCoords = viewportRaycaster.getCoords(curTouch.clientX, curTouch.clientY);
                hits = viewportRaycaster.getRaycastHits(this.m_viewportCoords, this.m_raycastObject3Ds);
                if (hits.length > 0) {
                    this.m_pressViewportRaycaster = viewportRaycaster;
                    hit = hits[0];
                    break;
                }
            }

            if (hit) {
                this.m_pressEventData = new InputEventData();
                this.m_pressEventData.inputID = 0;
                this.m_pressEventData.isHover = false;
                this.m_pressEventData.isPress = true;
                this.m_pressEventData.isDragging = false;
                this.m_pressEventData.coords = this.m_coords.clone();
                this.m_pressEventData.coordsDelta = new THREE.Vector2(0, 0);

                this.m_pressEventData.viewportCoords = this.m_viewportCoords.clone();
                this.m_pressEventData.viewportCoordsDelta = new THREE.Vector2(0, 0);

                this.m_pressEventData.camera = this.m_pressViewportRaycaster.camera;
                this.m_pressEventData.pressRaycaster = this.m_pressViewportRaycaster.raycaster;

                this.m_pressEventData.hitObject = hit.object;
                this.m_pressViewportRaycaster.raycaster.ray.at(hit.distance, this.m_pressEventData.hitPosition);
                this.m_pressEventData.hitNormal = hit.face.normal.clone();

                this.invokePress(this.m_pressEventData);

                this.m_dragEventData = this.m_pressEventData.clone();
            }
        }
    }

    touchMove(_res) {
        if (_res && _res.changedTouches && _res.changedTouches.length > 0) {
            let curTouch = _res.changedTouches[0];
            let curCoords = this.getCoords(curTouch.clientX, curTouch.clientY);
            this.m_coordsDelta.set(curCoords.x - this.m_coords.x, curCoords.y - this.m_coords.y);
            this.m_coords = curCoords;

            if (this.m_pressViewportRaycaster) {
                let curViewportRaycasterCoords = this.m_pressViewportRaycaster.getCoords(curTouch.clientX, curTouch.clientY);
                this.m_viewportCoordsDelta.set(curViewportRaycasterCoords.x - this.m_viewportCoords.x, curViewportRaycasterCoords.y - this.m_viewportCoords.y);
                this.m_viewportCoords = curViewportRaycasterCoords;
            }
            else {
                this.m_viewportCoords.set(0, 0);
                this.m_viewportCoordsDelta.set(0, 0);
            }
        }

        if (this.m_dragEventData) {

            this.m_dragEventData.isDragging = true;

            this.m_dragEventData.coords.set(this.m_coords.x, this.m_coords.y);
            this.m_dragEventData.coordsDelta.set(this.m_coordsDelta.x, this.m_coordsDelta.y);

            this.m_dragEventData.viewportCoords.set(this.m_viewportCoords.x, this.m_viewportCoords.y);
            this.m_dragEventData.viewportCoordsDelta.set(this.m_viewportCoordsDelta.x, this.m_viewportCoordsDelta.y);

            this.invokeDragging(this.m_dragEventData);
        }
    }

    touchEnd(_res) {
        if (_res && _res.changedTouches && _res.changedTouches.length > 0) {
            let curTouch = _res.changedTouches[0];
            let curCoords = this.getCoords(curTouch.clientX, curTouch.clientY);
            this.m_coordsDelta.set(curCoords.x - this.m_coords.x, curCoords.y - this.m_coords.y);
            this.m_coords = curCoords;

            if (this.m_pressViewportRaycaster) {
                let curViewportRaycasterCoords = this.m_pressViewportRaycaster.getCoords(curTouch.clientX, curTouch.clientY);
                this.m_viewportCoordsDelta.set(curViewportRaycasterCoords.x - this.m_viewportCoords.x, curViewportRaycasterCoords.y - this.m_viewportCoords.y);
                this.m_viewportCoords = curViewportRaycasterCoords;
            }
            else {
                this.m_viewportCoords.set(0, 0);
                this.m_viewportCoordsDelta.set(0, 0);
            }
        }

        if (this.m_pressEventData) {
            this.m_pressEventData.isPress = false;

            this.m_pressEventData.coords.set(this.m_coords.x, this.m_coords.y);
            this.m_pressEventData.coordsDelta.set(this.m_coordsDelta.x, this.m_coordsDelta.y);

            this.m_pressEventData.viewportCoords.set(this.m_viewportCoords.x, this.m_viewportCoords.y);
            this.m_pressEventData.viewportCoordsDelta.set(this.m_viewportCoordsDelta.x, this.m_viewportCoordsDelta.y);

            this.invokePress(this.m_pressEventData);
            this.invokeClick(this.m_pressEventData);
        }

        this.clearEventData();
    }

    touchCancel(_res) {
        this.touchEnd(_res);
    }

    clearEventData() {
        this.m_pressEventData = undefined;
        this.m_dragEventData = undefined;
        this.m_pressViewportRaycaster = undefined;
    }

    addViewport(_viewportRaycaster) {
        if (this.viewportRaycasters.indexOf(_viewportRaycaster) === -1) {
            this.viewportRaycasters.push(_viewportRaycaster);
            this.viewportRaycasters.sort((_a, _b) => {
                return _b.depth - _a.depth;
            });
        }
    }

    removeViewport(_viewportRaycaster) {
        let index = this.viewportRaycasters.indexOf(_viewportRaycaster);
        if (index !== -1) {
            this.viewportRaycasters.splice(index, 1);
        }
    }

    addObject3D(_object3D) {
        if (this.m_raycastObject3Ds.indexOf(_object3D) === -1) {
            this.m_raycastObject3Ds.push(_object3D);
        }
    }

    removeObject3D(_object3D) {
        let index = this.m_raycastObject3Ds.indexOf(_object3D);
        if (index !== -1) {
            this.m_raycastObject3Ds.splice(index, 1);
        }
    }

    invokePress(_data) {
        let inputEvent = this.getInputEventFromObject(_data.hitObject);
        if (inputEvent) {
            let eventData = _data.clone();
            eventData.eventObject = inputEvent.object;
            inputEvent.onPress.invoke(eventData);
        }
    }

    invokeClick(_data) {
        let inputEvent = this.getInputEventFromObject(_data.hitObject);
        if (inputEvent) {
            let eventData = _data.clone();
            eventData.eventObject = inputEvent.object;
            inputEvent.onClick.invoke(eventData);
        }
    }

    invokeDragging(_data) {
        let inputEvent = this.getInputEventFromObject(_data.hitObject);
        if (inputEvent) {
            let eventData = _data.clone();
            eventData.eventObject = inputEvent.object;
            inputEvent.onDragging.invoke(eventData);
        }
    }

    getInputEventFromObject(_object) {
        if (_object.inputEvent) {
            return _object.inputEvent;
        }
        else if (_object.parent) {
            return this.getInputEventFromObject(_object.parent);
        }
        else {
            return undefined;
        }
    }

    getCoords(_clientX, _clientY) {
        return ThreeUtility.getCoordsFromClientXY(_clientX, _clientY, this.m_rendererWidth, this.m_rendererHeight);
    }

    static setSize(_rendererWidth, _rendererHeight) {
        EventSystem.current.m_rendererWidth = _rendererWidth;
        EventSystem.current.m_rendererHeight = _rendererHeight;
    }

    static addViewportRaycaster(_viewportRaycaster) {
        EventSystem.current.addViewport(_viewportRaycaster);
    }

    static removeViewportRaycaster(_viewportRaycaster) {
        EventSystem.current.removeViewport(_viewportRaycaster);
    }

    static addRaycastObject3D(_object) {
        EventSystem.current.addObject3D(_object);
    }

    static removeRaycastObject3D(_object) {
        EventSystem.current.removeObject3D(_object);
    }

    static get current() {
        if (EventSystem.m_current === undefined) {
            EventSystem.m_current = new EventSystem();
        }
        return EventSystem.m_current;
    }

    static get width() {
        return EventSystem.current.m_rendererWidth;
    }

    static get height() {
        return EventSystem.current.m_rendererHeight;
    }
}

EventSystem.m_current = undefined;