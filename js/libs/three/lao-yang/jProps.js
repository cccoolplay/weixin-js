import jUtils from './jUtils';

//属性类
class Prop{
    constructor(key,value){
        this.type=jUtils.typeCheck(value);
        this.key=key;
        this.value=value;
        this.oldValue=value;
        this.oriValue=value;
        this.allwaysCallback=false;//是否总是执行回调
    }
    get old(){
        return this.oldValue;
    }
    get value(){
        return this._value;
    }
    set value(val){
        if(!this.allwaysCallback) {
            if (jUtils.pcsEqual(this.oldValue, val)){
                return;
            }
        }
        this._value=val;
        this.oldValue=val;
        this.callback();
    }
    reset(call=false){
        this._value = this.oriValue;
        this.oldValue=this.oriValue;
        if(!call)return;
        this.callback();
    }
    onChange(callback){
        this.callback=callback;
        return this;
    }
    callback(){}
}

//属性
export default class jProps{
    constructor(props={}){
        this.type='jProps';
        this.finalKey=undefined;//执行键
        this.init(props);
    }
    init(props){
        let keys=Object.keys(props);
        this.callbacks={};
        for(let i=0;i<keys.length;i++){
            let key=keys[i];
            this.callbacks[key]=()=>{};
            this[key]=new Prop(key,props[key]);
            this[key].onChange(()=>{
                if(this.finalKey!==key&&this.finalKey!==undefined)return;
                this.onChangeCallback();
                this.callbacks[key]();
            });
        }
    }
    add(props={}){
        let keys=Object.keys(props);
        for(let i=0;i<keys.length;i++){
            let key=keys[i];
            this.callbacks[key]=()=>{};
            this[key]=new Prop(key,props[key]);
            this[key].onChange(()=>{
                if(this.finalKey!==key&&this.finalKey!==undefined)return;
                this.onChangeCallback();
                this.callbacks[key]();
            });
        }
    }//添加属性
    all(onlyValue=false){
        let out={};
        for(let key of Object.keys(this)){
            if(this[key] instanceof Prop){
                if(onlyValue){
                    out[key]=this[key].value;
                }else {
                    out[key] = this[key];
                }
            }
        }
        return out;
    }//获取所有属性（仅属性值=false）
    resetAll(call=false){
        for(let key of Object.keys(this)){
            if(this[key] instanceof Prop){
                this[key].reset(call);
            }
        }
    }//重设所有元素到原始值（是否执行回调）
    onKeyChange(key,callback){
        this.callbacks[key]=callback;
        return this;
    }//某一属性改变时执行回调
    onChange(callback){
        this.onChangeCallback=callback;
        return this;
    }//任一属性改变时执行回调
    onMultiKeyChange(callback,...keys){
        keys.forEach((key)=>{
            this.callbacks[key]=callback;
        });
    }//多个属性改变时执行同一回调
    onChangeCallback(){}
}