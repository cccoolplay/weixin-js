// import GUID_UUID from 'GUID_UUID';

export default class LitTween {

    guid() {
        let s4 = () => {
            {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    constructor(_from, _to, _time) {
        this.id = this.guid();
        this.tag = "0";
        this.from = _from;
        this.to = _to;
        this.cycleTime = _time;
        this.ease = LitTween.ease.linear;

        this.isRunning = true;
        this.isPause = false;
        this.isStop = false;
        this.lastTime = Date.now();
        this.runTime = 0;
        this.callStart = false;
        this.runDelayTime = 0;
        requestAnimationFrame(this.runDelay.bind(this));
    }

    run() {
        let curTime = Date.now();

        if (!this.isPause && !this.isStop) {

            if (!this.callStart) {
                this.callStart = true;
                this.runStart();
                this.lastTime = Date.now();
            }

            this.runTime += (curTime - this.lastTime) / 1000;

            let t = this.runTime / this.cycleTime;
            if (t < 0) t = 0;
            if (t > 1) t = 1;

            let result = this.ease(this.from, this.to, t);

            this.runUpdate(result);

            if (t < 1) {
                requestAnimationFrame(this.run.bind(this));
            }
            else {
                this.isRunning = false;
                this.isStop = true;
                this.runComplete();
                this.cancel();
            }
        }

        this.lastTime = curTime;
    }

    runDelay() {
        if (this.delayTime > 0) {
            let curTime = Date.now();
            if (!this.isPause && !this.isStop) {

                this.runDelayTime += (curTime - this.lastTime) / 1000;

                if (this.runDelayTime >= this.delayTime) {
                    this.lastTime = curTime;
                    this.run();
                    return;
                }
                else {
                    requestAnimationFrame(this.runDelay.bind(this));
                }
            }

            this.lastTime = curTime;
        }
        else {
            this.run();
        }
    }

    runStart() {
        if (this.onStart !== undefined)
            this.onStart();
    }

    runUpdate(_value) {
        if (this.onUpdate !== undefined)
            this.onUpdate(_value);
    }

    runComplete() {
        if (this.onComplete !== undefined)
            this.onComplete();
    }

    setTag(_tag) {
        this.tag = _tag;
        return this;
    }

    setOnStart(_onStart) {
        this.onStart = _onStart;
        return this;
    }

    setOnUpdate(_onUpdate) {
        this.onUpdate = _onUpdate;
        return this;
    }

    setOnComplete(_onComplete) {
        this.onComplete = _onComplete;
        return this;
    }

    //延迟时间(秒)
    setDelay(_delayTime) {
        this.delayTime = _delayTime;
        return this;
    }

    setEase(_ease) {
        this.ease = _ease.bind(this);
        return this;
    }

    stopRun(_callOnComplete) {
        if (this.isRunning) {
            let isCall = _callOnComplete !== undefined ? _callOnComplete : false;
            if (isCall)
                this.runComplete();
            this.isRunning = false;
            this.isStop = true;
        }
    }

    cancel(_callOnComplete) {
        this.stopRun(_callOnComplete);
        LitTween.cancel(this);
    }
}
LitTween.tweens = [];
LitTween.cancel = (_tween, _callOnComplete) => {
    let length = LitTween.tweens.length;
    for (let i = 0; i < length; i++) {
        if (LitTween.tweens[i].id === _tween.id) {
            _tween.stopRun(_callOnComplete);
            LitTween.tweens.splice(i, 1);
            break;
        }
    }
};
LitTween.cancelByTag = (_tag, _callOnComplete) => {
    let index = 0;
    while (index < LitTween.tweens.length) {
        if (LitTween.tweens[index].tag === _tag) {
            LitTween.tweens[index].stopRun(_callOnComplete);
            LitTween.tweens.splice(index, 1);
        }
        else {
            index++;
        }
    }
};
LitTween.valueTo = (_from, _to, _time) => {
    let tween = new LitTween(_from, _to, _time);
    LitTween.tweens.push(tween);
    return tween;
};

LitTween.ease = {
    linear: (start, end, val) => {
        return (1 - val) * start + end * val;
    },
    clerp: (start, end, val) => {
        let min = 0.0;
        let max = 360.0;
        let half = Math.abs((max - min) / 2.0);
        let retval = 0.0;
        let diff = 0.0;
        if ((end - start) < -half) {
            diff = ((max - start) + end) * val;
            retval = start + diff;
        } else if ((end - start) > half) {
            diff = -((max - end) + start) * val;
            retval = start + diff;
        } else retval = start + (end - start) * val;
        return retval;
    },
    easeInQuad: (start, end, val) => {
        end -= start;
        return end * val * val + start;
    },
    easeOutQuad: (start, end, val) => {
        end -= start;
        return -end * val * (val - 2) + start;
    },
    easeInOutQuad: (start, end, val) => {
        val /= 0.5;
        end -= start;
        if (val < 1) return end / 2 * val * val + start;
        val--;
        return -end / 2 * (val * (val - 2) - 1) + start;
    },
    easeInCubic: (start, end, val) => {
        end -= start;
        return end * val * val * val + start;
    },

    easeOutCubic: (start, end, val) => {
        val--;
        end -= start;
        return end * (val * val * val + 1) + start;
    },

    easeInOutCubic: (start, end, val) => {
        val /= 0.5;
        end -= start;
        if (val < 1) return end / 2 * val * val * val + start;
        val -= 2;
        return end / 2 * (val * val * val + 2) + start;
    },
};