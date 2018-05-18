import UI from './ui';

//anchor:{x:0-1y:0-1}
export default class Anchor extends UI{
    constructor(paras,eventSysterm,inputEvent){
        super(paras,eventSysterm,inputEvent);
        this.anchor = this.paras.anchor?this.paras.anchor:{x:0,y:0};
        wx.onWindowResize(()=>{
            this.anchor = this.anchor;
        })
    }
    get anchor(){
        return this._anchor;
    }
    set anchor(anchor){
        this._anchor = anchor;
        this.UINode.position.x = (anchor.x-0.5)*window.innerWidth;
        this.UINode.position.y = (0.5-anchor.y)*window.innerHeight;
    }
}
