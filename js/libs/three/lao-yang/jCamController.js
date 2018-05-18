let THREE=require('../three');
import jProps from './jProps';
import jUtils from './jUtils';

//摄像机控制
export default class jCamControl{
    constructor(camera, viewPort, eventDispatcher) {
        this.object = camera;
        this.eventDispatcher = eventDispatcher;
        this.eventCenter = new THREE.EventDispatcher();
        this.target = new THREE.Vector3();
        this.props=new jProps({
            rect: viewPort !== undefined ? viewPort : {
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight
            },//屏幕控制区域
            enabled: true,//是否启用
            minDistance: 0,//最小目标距离
            maxDistance: Infinity,//最大目标距离
            minZoom: 0,//最小缩放值
            maxZoom: Infinity,//最大缩放值
            minPolarAngle: 0,//最小极角
            maxPolarAngle: Math.PI,//最大极角
            minAzimuthAngle: -Infinity,//最小方位角
            maxAzimuthAngle: Infinity,//最大方位角
            enableDamping: false,//是否启用粘滞
            dampingFactor: 0.1,//粘滞系数
            enableZoom: true,//是否可缩放
            zoomSpeed: 1,//缩放速度
            enableRotate: true,//是否可旋转
            rotateSpeed: 1.0,//旋转速度
            enablePan: true,//是否可平移
            autoRotateSpeed: 4.0,//自动旋转速度
            targetRangeMin:new THREE.Vector3(-50,-50,-50),//目标范围盒小值
            targetRangeMax:new THREE.Vector3(50,50,50),//目标范围盒大值
            stopWhenPointerOut:true,//pointOut事件时停止
        });
        this.init();
    }
    get doInfo(){
        return {
            pan:new THREE.Vector2().copy(this.panRecord),
            rotate:new THREE.Vector2().copy(this.rotRecord),
            scale:this._currentScale,
        }
    }//获取操作信息
    get posInfo(){
        return {
            target: new THREE.Vector3().copy(this.target),
            position: new THREE.Vector3().copy(this.object.position),
            focusLength: this._spherical.radius,
            zoom: this.object.zoom,
        };
    }//获取状态信息
    get currentScale(){
        return this._currentScale;
    }//获取缩放
    get spherical(){
        return this._spherical;
    }//获取球坐标
    get releaseUnfinishedEvent(){
        return ()=>{
            this._onMouseUp();
            this._onTouchEnd();
        };
    }//释放挂起事件
    init(){
        this.initVariable();
        this.initEventBind();
        this._addEventListener();
        this.initPropCallback();
        this.update();
    }
    initVariable(){
        this.mouseButton = {ORBIT: 'orbit', PAN: 'pan'};
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        this.focusLength0=this.object.position.distanceTo(this.target0);
        this.panRecord=new THREE.Vector2(0,0);
        this.rotRecord=new THREE.Vector2(0,0);
        //private
        this._autoRotate = false;
        this._oriTime=undefined;
        this._eventButton = '';
        this._STATE = {NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4};
        this._state = -1;
        this._EPS = 0.000001;
        this._spherical = new THREE.Spherical();
        this._oriSphericalRadius = false;
        this._sphericalDelta = new THREE.Spherical();
        this._scale = 1;
        this._currentScale = 1;
        this._panOffset = new THREE.Vector3();
        this._zoomChanged = false;
        this._lastTarget=new THREE.Vector3();
        this._lastTheta=0;
        this._lastPhi=0;
        this._rotateStart = new THREE.Vector2();
        this._rotateEnd = new THREE.Vector2();
        this._rotateDelta = new THREE.Vector2();
        this._panStart = new THREE.Vector2();
        this._panEnd = new THREE.Vector2();
        this._panDelta = new THREE.Vector2();
        this._dollyStart = new THREE.Vector2();
        this._dollyEnd = new THREE.Vector2();
        this._dollyDelta = new THREE.Vector2();
        this._timeInterval=false;
        this._changeEvent = {type: 'change'};
        this._startEvent = {type: 'start'};
        this._endEvent = {type: 'end'};
        this._panEvent = {type: 'pan'};
        this._rotateEvent = {type: 'rotate'};
        this._scaleEvent = {type: 'scale',paras:{zoom: 1}};
        this._shiftCameraEvent={type:'shiftCamera'};
        this._resizeEvent={type:'resize'};
        this._customEvent={type:'custom'};
        this.lastPosition = new THREE.Vector3();
        this.lastQuaternion = new THREE.Quaternion();
        this.quat=new THREE.Quaternion().setFromUnitVectors(this.object.up, new THREE.Vector3(0,1,0));
        this.curZoomDelta=0;
        this.endZoomDelta=0;
    }
    initPropCallback(){
        this.props.onKeyChange('rect',()=>{
            let temp=(()=>{
                let tp=[];
                for(let key of Object.keys(this.props.rect.value)){
                    tp.push(this.props.rect.value[key]);
                }
                return tp;
            })();
            if(this.props.rect.value.left===undefined)this.props.rect.value.left=temp[0];
            if(this.props.rect.value.top===undefined)this.props.rect.value.top=temp[1];
            if(this.props.rect.value.width===undefined)this.props.rect.value.width=temp[2];
            if(this.props.rect.value.height===undefined)this.props.rect.value.height=temp[3];
            this.fireResizeEvent();
            this.fireChangeEvent();
        });
    }
    initEventBind(){
        this.onLeftPointDownBind=(e)=>{
            this._onLeftPointDown(e);
        };
        this.onRightPointDownBind=(e)=>{
            this._onRightPointDown(e);
        };
        this.onMouseWheelBind=(e)=>{
            this._onMouseWheel(e);
        };
        this.onMouseMoveBind=(e)=>{
            this._onMouseMove(e);
        };
        this.onMouseUpBind=(e)=>{
            this._onMouseUp(e);
        };
        this.onTouchMoveBind=(e)=>{
            this._onTouchMove(e);
        };
        this.onTouchEndBind=(e)=>{
            this._onTouchEnd(e);
        };
        this.fireCustomEvent=()=>{
            this.eventCenter.dispatchEvent(this._customEvent);
        };
        this.fireResizeEvent=()=>{
            this.eventCenter.dispatchEvent(this._resizeEvent);
        };
        this.fireChangeEvent=()=>{
            this.eventCenter.dispatchEvent(this._changeEvent);
        };
        this.fireShiftCameraEvent=()=>{
            this.eventCenter.dispatchEvent(this._shiftCameraEvent);
        };
        this.firePanEvent=()=>{
            this.eventCenter.dispatchEvent(this._panEvent);
        };
        this.fireRotateEvent=()=>{
            this.eventCenter.dispatchEvent(this._rotateEvent);
        };
        this.fireScaleEvent=()=>{
            this._scaleEvent.paras.zoom=this._currentScale;
            this.eventCenter.dispatchEvent(this._scaleEvent);
        };
        this.fireStartEvent=()=>{
            this.eventCenter.dispatchEvent(this._startEvent);
        };
        this.fireEndEvent=()=>{
            this.eventCenter.dispatchEvent(this._endEvent);
        };
    }
    setCamera(camera){
        this.object=camera;
        this.fireChangeEvent();
        this.fireShiftCameraEvent();
    }//设置相机
    setTo(target,position,focusLength,zoom){
        this.target.copy(jUtils.limitVector3(target,this.props.targetRangeMin.value,this.props.targetRangeMax.value));
        this.object.position.copy(position);
        if(this.object instanceof THREE.OrthographicCamera)this.object.zoom = zoom;
        this.object.updateProjectionMatrix();
        this.update();
        this.fireCustomEvent();
        this._state = this._STATE.NONE;
    }//设置相机到（目标，位置，焦距，倍率）
    reset() {
        this.target.copy(jUtils.limitVector3(this.target0,this.props.targetRangeMin.value,this.props.targetRangeMax.value));
        this.object.position.copy(this.position0);
        this.panRecord.set(0,0);
        this.rotRecord.set(0,0);
        if(this.object instanceof THREE.OrthographicCamera)this.object.zoom = this.zoom0;
        this.object.updateProjectionMatrix();
        this.update();
        this.fireCustomEvent();
        this._state = this._STATE.NONE;
    }//重设到初始状态
    resetTo(target,position,panRecord,rotRecord,zoom,focusLength){
        this.target.copy(jUtils.limitVector3(target,this.props.targetRangeMin.value,this.props.targetRangeMax.value));
        this.object.position.copy(position);
        this.panRecord.set(panRecord.x,panRecord.y);
        this.rotRecord.set(rotRecord.x,rotRecord.y);
        if(this.object instanceof THREE.OrthographicCamera)this.object.zoom = zoom;
        this.object.updateProjectionMatrix();
        this.update();
        this.fireCustomEvent();
        this._state = this._STATE.NONE;
    }//重设到操作点
    dispose() {
        if(this.eventDispatcher.element)this.eventDispatcher.element.removeEventListener('contextmenu', this.onContextMenu, false);
        this.eventDispatcher.remove('leftPointDown', this.onLeftPointDownBind);
        this.eventDispatcher.remove('rightPointDown', this.onRightPointDownBind);
        this.eventDispatcher.remove('mouseWheel', this.onMouseWheelBind);
    }
    activeAutoRotate(bool){
        this._autoRotate=bool;
        if(bool){
            if(this._timeInterval!==false)return;
            this._timeInterval=setInterval(()=>{this.update()},jUtils.Hz);
        }else{
            if(this._timeInterval===false)return;
            clearInterval(this._timeInterval);
            this._timeInterval=false;
        }
    }//激活自动旋转
    update() {
        let offset = new THREE.Vector3();
        let quatInverse = this.quat.clone().inverse();
        let position = this.object.position;
        offset.copy(position).sub(this.target);
        offset.applyQuaternion(this.quat);
        this._spherical.setFromVector3(offset);
        if (this._autoRotate && this._state === this._STATE.NONE) {
            let tempAngle=this._getAutoRotationAngle();
            this.rotRecord.x+=tempAngle*this.props.rect.value.width/(2*Math.PI*this.props.rotateSpeed.value);
            this._rotateLeft(tempAngle);
        }
        this._spherical.theta += this._sphericalDelta.theta;
        this._spherical.phi += this._sphericalDelta.phi;
        this._spherical.theta = Math.max(this.props.minAzimuthAngle.value, Math.min(this.props.maxAzimuthAngle.value, this._spherical.theta));
        this._spherical.phi = Math.max(this.props.minPolarAngle.value, Math.min(this.props.maxPolarAngle.value, this._spherical.phi));
        this._spherical.makeSafe();
        if (this._oriSphericalRadius === false) this._oriSphericalRadius = this._spherical.radius;
        if (this.object instanceof THREE.OrthographicCamera) {
            if (this.object.focusLength === undefined) {
                this._spherical.radius *= this._scale;
                this._spherical.radius = Math.max(this.props.minDistance.value, Math.min(this.props.maxDistance.value, this._spherical.radius));
            } else {
                this._spherical.radius *= this._scale;
                this._spherical.radius = Math.max(this.props.minDistance.value, Math.min(this.props.maxDistance.value, this._spherical.radius));
                this.object.focusLength = this._spherical.radius;
                this.object.updateProjectionMatrix();
            }
        } else {
            this._spherical.radius *= this._scale;
            this._spherical.radius = Math.max(this.props.minDistance.value, Math.min(this.props.maxDistance.value, this._spherical.radius));
        }
        let tempScale=this._oriSphericalRadius / this._spherical.radius;
        if(!jUtils.pcsEqual(this._currentScale ,tempScale,jUtils.T.num)) {
            this._currentScale=tempScale;
            this._zoomChanged=true;
        }
        this.target.copy(jUtils.limitVector3(this.target.add(this._panOffset),this.props.targetRangeMin.value,this.props.targetRangeMax.value));
        offset.setFromSpherical(this._spherical);
        offset.applyQuaternion(quatInverse);
        position.copy(this.target).add(offset);
        this.object.lookAt(this.target);
        if (this.props.enableDamping.value === true) {
            this._sphericalDelta.theta *= (1 - this.props.dampingFactor.value);
            this._sphericalDelta.phi *= (1 - this.props.dampingFactor.value);
        } else {
            this._sphericalDelta.set(0, 0, 0);
        }
        if(this._zoomChanged){
            this.fireScaleEvent();
        }
        if(this._lastTarget.distanceToSquared(this.target)>this._EPS){
            this.firePanEvent();
            this._lastTarget.copy(this.target);
        }
        if(!jUtils.pcsEqual(this._lastTheta,this._spherical.theta,jUtils.T.num)||!jUtils.pcsEqual(this._lastPhi,this._spherical.phi,jUtils.T.num)){
            this.fireRotateEvent();
            this._lastTheta=this._spherical.theta;
            this._lastPhi=this._spherical.phi;
        }
        this._scale = 1;
        this._panOffset.set(0, 0, 0);
        if (this._zoomChanged || this.lastPosition.distanceToSquared(this.object.position) > this._EPS ||
            8 * (1 - this.lastQuaternion.dot(this.object.quaternion)) > this._EPS) {
            this.fireChangeEvent();
            this.lastPosition.copy(this.object.position);
            this.lastQuaternion.copy(this.object.quaternion);
            this._zoomChanged = false;
            return true;
        }
        return false;
    }//更新
    panDo(end){
        this._panStart.copy(this.panRecord);
        this._handleMouseMovePan(end);
        this.panRecord.copy(end);
    }//执行操作点平移
    rotateDo(end){
        this._rotateStart.copy(this.rotRecord);
        this._handleMouseMoveRotate(end);
        this.rotRecord.copy(end);
    }//执行操作点旋转
    scaleDo(end){
        let zoomScale=end/this._currentScale;
        this._dollyIn(zoomScale);
        this.update();
    }//执行操作点缩放
    static onContextMenu(event) {
        event.preventDefault();
    }
    _checkAvailable(pointX, pointY) {
        if (pointX < this.props.rect.value.left || pointX > (this.props.rect.value.left + this.props.rect.value.width))return false;
        return !(pointY < this.props.rect.value.top || pointY > (this.props.rect.value.top + this.props.rect.value.height));
    }
    _addEventListener() {
        if(this.eventDispatcher.element)this.eventDispatcher.element.addEventListener('contextmenu', jCamControl.onContextMenu, false);
        this.eventDispatcher.add('leftPointDown', this.onLeftPointDownBind);
        this.eventDispatcher.add('rightPointDown', this.onRightPointDownBind);
        this.eventDispatcher.add('mouseWheel', this.onMouseWheelBind);
    }
    _onRightPointDown(event) {
        if (event.isMouse) {
            if (!this._checkAvailable(event.clientX, event.clientY))return;
            this._eventButton = this.mouseButton.PAN;
            this._onMouseDown(event);
        } else if (event.isTouch) {
            if (!this._checkAvailable(event.touches[0].pageX, event.touches[0].pageY) ||
                !this._checkAvailable(event.touches[1].pageX, event.touches[1].pageY))return;
            this._onTouchStart(event);
        }
    }
    _onLeftPointDown(event) {
        if (event.isMouse) {
            if (!this._checkAvailable(event.clientX, event.clientY))return;
            this._eventButton = this.mouseButton.ORBIT;
            this._onMouseDown(event);
        } else if (event.isTouch) {
            if (!this._checkAvailable(event.touches[0].pageX, event.touches[0].pageY))return;
            this._onTouchStart(event);
        }
    }
    _onMouseWheel(event) {
        if (this.props.enabled.value === false || this.props.enableZoom.value === false ||
            (this._state !== this._STATE.NONE && this._state !== this._STATE.ROTATE))return;
        if (!this._checkAvailable(event.clientX, event.clientY))return;
        if(!this._limitUpdateRate())return;
        // event.preventDefault();
        // event.stopPropagation();
        this._handleMouseWheel(event);
        this.fireStartEvent();
        this.fireEndEvent();
        this.fireCustomEvent();
    }
    _onMouseDown(event) {
        if (this.props.enabled.value === false)return;
        // event.preventDefault();
        if (this._eventButton === this.mouseButton.ORBIT) {
            if (this.props.enableRotate.value === false)return;
            this._handleMouseDownRotate(event);
            this._state = this._STATE.ROTATE;
        } else if (this._eventButton === this.mouseButton.PAN) {
            if (this.props.enablePan.value === false)return;
            this._handleMouseDownPan(event);
            this._state = this._STATE.PAN;
        }
        if (this._state !== this._STATE.NONE) {
            this.eventDispatcher.add('leftPointMove', this.onMouseMoveBind);
            this.eventDispatcher.add('rightPointMove', this.onMouseMoveBind);
            this.eventDispatcher.add('leftPointUp', this.onMouseUpBind);
            this.eventDispatcher.add('rightPointUp', this.onMouseUpBind);
            if(this.props.stopWhenPointerOut.value)this.eventDispatcher.add('pointOut', this.onMouseUpBind);
            this.fireStartEvent();
        }
    }
    _onTouchStart(event) {
        if (this.props.enabled.value === false)return;
        switch (event.touches.length) {
            case 1:
                if (this.props.enableRotate.value === false)return;
                this._handleTouchStartRotate(event);
                this._state = this._STATE.TOUCH_ROTATE;
                break;
            case 2:
                if (this.props.enableZoom.value === false && this.props.enablePan.value === false)return;
                if (this.props.enableZoom.value !== false) this._handleTouchStartDolly(event);
                if (this.props.enablePan.value !== false) this._handleTouchStartPan(event);
                this._state = this._STATE.TOUCH_DOLLY_PAN;
                break;
            default:
                this._state = this._STATE.NONE;
        }
        if (this._state !== this._STATE.NONE) {
            this.eventDispatcher.add('leftPointMove', this.onTouchMoveBind);
            this.eventDispatcher.add('leftPointUp', this.onTouchEndBind);
            if(this.props.stopWhenPointerOut.value)this.eventDispatcher.add('pointOut', this.onTouchEndBind);
            this.eventDispatcher.add('rightPointMove', this.onTouchMoveBind);
            this.eventDispatcher.add('rightPointUp', this.onTouchEndBind);
            this.fireStartEvent();
        }
    }
    _handleMouseDownPan(event) {
        this._panStart.set(event.clientX, event.clientY);
    }
    _handleTouchStartPan(event) {
        this._panStart.set((event.touches[0].pageX + event.touches[1].pageX) / 2, (event.touches[0].pageY + event.touches[1].pageY) / 2);
    }
    _handleMouseDownRotate(event) {
        this._rotateStart.set(event.clientX, event.clientY);
    }
    _handleTouchStartRotate(event) {
        this._rotateStart.set(event.touches[0].pageX, event.touches[0].pageY);
    }
    _handleTouchStartDolly(event) {
        let dx = event.touches[0].pageX - event.touches[1].pageX;
        let dy = event.touches[0].pageY - event.touches[1].pageY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        this._dollyStart.set(0, distance);
    }
    _onMouseMove(event) {
        if (this.props.enabled.value === false)return;
        if(!this._limitUpdateRate())return;
        // event.preventDefault();
        this.fireCustomEvent();
        if (this._state === this._STATE.ROTATE) {
            if (this.props.enableRotate.value === false)return;
            this._handleMouseMoveRotate(event);
        } else if (this._state === this._STATE.PAN) {
            if (this.props.enablePan.value === false)return;
            this._handleMouseMovePan(event);
        }
    }
    _onTouchMove(event) {
        if (this.props.enabled.value === false)return;
        if(!this._limitUpdateRate())return;
        // event.stopPropagation();
        this.fireCustomEvent();
        switch (event.touches.length) {
            case 1:
                if (this.props.enableRotate.value === false)return;
                if (this._state !== this._STATE.TOUCH_ROTATE)return;
                this._handleTouchMoveRotate(event);
                break;
            case 2:
                if (this.props.enableZoom.value === false && this.props.enablePan.value === false)return;
                if (this._state !== this._STATE.TOUCH_DOLLY_PAN)return;
                if (this.props.enableZoom.value !== false) this._handleTouchMoveDolly(event);
                if (this.props.enablePan.value !== false) this._handleTouchMovePan(event);
                break;
            default:
                this._state = this._STATE.NONE;
        }
    }
    _handleMouseMovePan(event) {
        this._panEnd.set(event.clientX, event.clientY);
        this._panDelta.subVectors(this._panEnd, this._panStart);
        this._pan(this._panDelta.x, this._panDelta.y);
        this._panStart.copy(this._panEnd);
        this.update();
    }
    _handleTouchMovePan(event) {
        this._panEnd.set((event.touches[0].pageX + event.touches[1].pageX) / 2, (event.touches[0].pageY + event.touches[1].pageY) / 2);
        this._panDelta.subVectors(this._panEnd, this._panStart);
        this._pan(this._panDelta.x, this._panDelta.y);
        this._panStart.copy(this._panEnd);
        this.update();
    }
    _handleMouseMoveRotate(event) {
        this._rotateEnd.set(event.clientX, event.clientY);
        this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart);
        this.rotRecord.add(this._rotateDelta);
        this._rotateLeft(2 * Math.PI * this._rotateDelta.x / this.props.rect.value.width * this.props.rotateSpeed.value);
        this._rotateUp(2 * Math.PI * this._rotateDelta.y / this.props.rect.value.height * this.props.rotateSpeed.value);
        this._rotateStart.copy(this._rotateEnd);
        this.update();
    }
    _handleTouchMoveRotate(event) {
        this._rotateEnd.set(event.touches[0].pageX, event.touches[0].pageY);
        this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart);
        this.rotRecord.add(this._rotateDelta);
        this._rotateLeft(2 * Math.PI * this._rotateDelta.x / this.props.rect.value.width * this.props.rotateSpeed.value);
        this._rotateUp(2 * Math.PI * this._rotateDelta.y / this.props.rect.value.height * this.props.rotateSpeed.value);
        this._rotateStart.copy(this._rotateEnd);
        this.update();
    }
    _handleMouseWheel(event) {
        let delta = 0;
        if (event.deltaY !== null) {
            delta = event.deltaY;
        } else if (event.wheelDelta !== null) {//webkit/Opera/Explorer 9
            delta = event.wheelDelta;
        } else if (event.detail !== undefined) {//fire fox
            delta = -event.detail;
        }
        if(delta===0)return;
        this.endZoomDelta+=delta;
        this.animate=()=>{
            this.uDelta=this.endZoomDelta/30;
            this.curZoomDelta+=this.uDelta;
            if((this.endZoomDelta>=0&&this.curZoomDelta>=this.endZoomDelta)||(this.endZoomDelta<=0&&this.curZoomDelta<=this.endZoomDelta)){
                this.endZoomDelta=0;
                this.curZoomDelta=0;
                return;
            }
            let speed=this.uDelta/delta*this.props.zoomSpeed.value;
            if (this.uDelta < 0) {
                this._dollyOut(this._getZoomScale(speed));
            } else if (this.uDelta > 0) {
                this._dollyIn(this._getZoomScale(speed));
            }
            this.update();
            requestAnimationFrame(this.animate);
        };
        this.animate();
        // if (delta < 0) {
        //     this._dollyOut(this._getZoomScale(this.props.zoomSpeed.value));
        // } else if (delta > 0) {
        //     this._dollyIn(this._getZoomScale(this.props.zoomSpeed.value));
        // }
        // this.update();
    }
    _handleTouchMoveDolly(event) {
        let dx = event.touches[0].pageX - event.touches[1].pageX;
        let dy = event.touches[0].pageY - event.touches[1].pageY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        this._dollyEnd.set(0, distance);
        this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart);
        if (Math.abs(this._dollyDelta.y) / this._dollyStart.y < 0.05)return;
        if (this._dollyDelta.y > 0) {
            this._dollyOut(this._getZoomScale());
        } else if (this._dollyDelta.y < 0) {
            this._dollyIn(this._getZoomScale());
        }
        this._dollyStart.copy(this._dollyEnd);
        this.update();
    }
    _pan(deltaX, deltaY) {
        this.panRecord.x+=deltaX;
        this.panRecord.y+=deltaY;
        let offset = new THREE.Vector3();
        if (this.object instanceof THREE.PerspectiveCamera) {
            let position = this.object.position;
            offset.copy(position).sub(this.target);
            let targetDistance = offset.length();
            targetDistance *= Math.tan((this.object.fov / 2) * Math.PI / 180);
            this._panLeft(2 * deltaX * targetDistance / this.props.rect.value.height, this.object.matrix);
            this._panUp(2 * deltaY * targetDistance / this.props.rect.value.height, this.object.matrix);
        } else if (this.object instanceof THREE.OrthographicCamera) {
            this._panLeft(deltaX * (this.object.right - this.object.left) / this.object.zoom / this.props.rect.value.width, this.object.matrix);
            this._panUp(deltaY * (this.object.top - this.object.bottom) / this.object.zoom / this.props.rect.value.height, this.object.matrix);
        } else {
            console.warn('WARNING:JORCameraControl.js encountered an unknown camera type -controller disabled.');
            this.props.enabled.value=false;
        }
    }
    _panUp(distance, objectMatrix) {
        let v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 1);
        v.multiplyScalar(distance);
        this._panOffset.add(v);
    }
    _panLeft(distance, objectMatrix) {
        let v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0);
        v.multiplyScalar(-distance);
        this._panOffset.add(v);
    }
    _rotateLeft(angle) {
        this._sphericalDelta.theta -= angle;
    }
    _rotateUp(angle) {
        this._sphericalDelta.phi -= angle;
    }
    _getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * this.props.autoRotateSpeed.value;
    }
    _dollyOut(dollyScale) {
        if (this.object instanceof THREE.PerspectiveCamera) {
            this._scale *= dollyScale;
        } else if (this.object instanceof THREE.OrthographicCamera) {
            this.object.zoom = Math.max(this.props.minZoom.value, Math.min(this.props.maxZoom.value, this.object.zoom / dollyScale));
            this.object.updateProjectionMatrix();
            this._zoomChanged = true;
            this._scale *= dollyScale;
        } else {
            console.warn('WARNING:jCameraController.js encountered an unknown camera type -controller disabled');
            this.props.enabled.value=false;
        }
    }
    _dollyIn(dollyScale) {
        if (this.object instanceof THREE.PerspectiveCamera) {
            this._scale /= dollyScale;
        } else if (this.object instanceof THREE.OrthographicCamera) {
            this.object.zoom = Math.max(this.props.minZoom.value, Math.min(this.props.maxZoom.value, this.object.zoom * dollyScale));
            this.object.updateProjectionMatrix();
            this._zoomChanged = true;
            this._scale /= dollyScale;
        } else {
            console.warn('WARNING:JORCameraControl.js encountered an unknown camera type -controller disabled');
            this.props.enabled.value=false;
        }
    }
    _getZoomScale(speed) {
        let sp=speed?speed:this.props.zoomSpeed.value;
        return Math.pow(0.95,sp);
    }
    _onMouseUp(event) {
        if (this.props.enabled.value === false)return;
        this._handleMouseUp(event);
        this.eventDispatcher.remove('leftPointMove', this.onMouseMoveBind);
        this.eventDispatcher.remove('leftPointUp', this.onMouseUpBind);
        this.eventDispatcher.remove('rightPointMove', this.onMouseMoveBind);
        this.eventDispatcher.remove('rightPointUp', this.onMouseUpBind);
        if(this.props.stopWhenPointerOut.value)this.eventDispatcher.remove('pointOut', this.onMouseUpBind);
        this.fireEndEvent();
        this._state = this._STATE.NONE;
    }
    _onTouchEnd(event) {
        if (this.props.enabled.value === false)return;
        this._handleTouchEnd(event);
        this.eventDispatcher.remove('leftPointMove', this.onTouchMoveBind);
        this.eventDispatcher.remove('leftPointUp', this.onTouchEndBind);
        if(this.props.stopWhenPointerOut.value)this.eventDispatcher.remove('pointOut', this.onTouchEndBind);
        this.eventDispatcher.remove('rightPointMove', this.onTouchMoveBind);
        this.eventDispatcher.remove('rightPointUp', this.onTouchEndBind);
        this.fireEndEvent();
        this._state = this._STATE.NONE;
    }
    _handleMouseUp(event) {}
    _handleTouchEnd(event) {}
    _limitUpdateRate(){
        let time=new Date().getTime();
        if(this._oriTime===undefined){
            this._oriTime=time;
        }else{
            if(time-this._oriTime<jUtils.Hz){
                return false;
            }else{
                this._oriTime=time;
                return true;
            }
        }
    }
}