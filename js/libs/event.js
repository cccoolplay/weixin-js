export default class Event{
    constructor(){
        this.handles={};
    }
    debugAllEvents(){
        console.log(this.handles);
    }
    addEventListener(event_type,handle){
        if(this.handles[event_type] === undefined){
            this.handles[event_type] = [];
        }
        if(this.handles[event_type].indexOf(handle)===-1)
            this.handles[event_type].push(handle);
    }
    removeEventListener(event_type,handle){
        if(this.handles[event_type] instanceof Array){
            let hs = this.handles[event_type];
            hs.splice(hs.indexOf(handle),1);
            if(hs.length === 0)
                delete this.handles[event_type];
        }
    }
    clear(event_type){
        delete this.handles[event_type];
    }
    fire(event){
        let eventFire = (e)=>{
            if(this.handles[e.type] instanceof  Array){
                let hs = [];
                this.handles[e.type].forEach((item)=>{
                    if(item instanceof Function)
                        hs.push(item);
                });
                for (let i=0, len=hs.length; i < len; i++){
                    hs[i](e);
                }
            }
        };
        for (let i = 0,len=arguments.length; i < len; i++) {
            eventFire(arguments[i]);
        }
    }
    isContain(event_type){
        return this.handles[event_type]!==undefined&&this.handles[event_type]!==null;
    }
}