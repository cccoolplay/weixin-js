export default class InputEventListener {
    constructor() {
        this.events = [];
    }

    add(_event) {
        if (_event in this.events) {
            console.error("当前事件已包含该handle");
            return;
        }
        this.events.push(_event);
    }

    remove(_event) {
        let index = this.events.indexOf(_event);
        if (index !== -1) {
            this.events.splice(index, 1);
        }
    }

    invoke(_data) {
        this.events.forEach((_e) => {
            if (_e)
                _e(_data);
        });
    }
}