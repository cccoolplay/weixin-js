import * as THREE from './three';
//paras:{text,color,fontSize,width}
export default (paras)=>{
    paras = paras?paras:{};
    let canvas = wx.createCanvas();
    let context = canvas.getContext('2d');
    let color = "white";
    let fontSize = paras.fontSize?paras.fontSize:16;
    context.font = "normal "+fontSize*2+"px ''";
    if(paras.width){
        let  text_array = [];
        let  cur_text = "";
        let line_width = 0;
        let width = paras.width*2;
        for(let i = 0;i<paras.text.length;i++){
            line_width+= context.measureText(paras.text[i]).width;
            if(line_width>width){
                text_array.push(cur_text);
                cur_text = paras.text[i];
                line_width = context.measureText(paras.text[i]).width;
            }else{
                cur_text += paras.text[i];
            }
        }
        if(cur_text!==""){
            text_array.push(cur_text);
        }
        let height = text_array.length*fontSize*2;
        canvas.width = width;
        canvas.height = height;
        context.fillStyle = color;
        context.textAlign = 'start';
        context.textBaseline = 'alphabetic';
        context.font = "normal "+fontSize*2+"px ''";
        text_array.forEach((item,index)=>{
            console.log(item,"2222");
            context.fillText(item,0,(index+0.9)*fontSize*2);
        });
        console.log(height,width,"123123");
    }else{
        canvas.width = context.measureText(paras.text).width;
        canvas.height = fontSize*2;
        context.fillStyle = color;
        context.textAlign = 'start';
        context.textBaseline = 'alphabetic';
        context.font = "normal "+fontSize*2+"px ''";
        context.fillText(paras.text,0,fontSize*2*0.9);
    }
    let texture = new THREE.Texture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
}