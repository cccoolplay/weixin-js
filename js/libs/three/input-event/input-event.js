import InputEventListener from './input-event-listener'

export default class InputEvent {
    constructor(_object) {
        this.m_object = _object;

        this.m_onClick = undefined;
        this.m_onPress = undefined;
        this.m_onDraging = undefined;
    }

    get object() {
        return this.m_object;
    }

    get onClick() {
        if (!this.m_onClick)
            this.m_onClick = new InputEventListener();
        return this.m_onClick;
    }

    get onPress() {
        if (!this.m_onPress)
            this.m_onPress = new InputEventListener();
        return this.m_onPress;
    }

    get onDragging() {
        if (!this.m_onDraging)
            this.m_onDraging = new InputEventListener();
        return this.m_onDraging;
    }

    static getAdd(_object3d) {
        if (_object3d.inputEvent === undefined) {
            _object3d.inputEvent = new InputEvent(_object3d);
        }
        return _object3d.inputEvent;
    }

}
