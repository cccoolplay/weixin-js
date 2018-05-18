let THREE=require('../three');

//射线
class Ray{
    constructor(start=new THREE.Vector3(),direction=new THREE.Vector3(0,1,0)){
        this.start=new THREE.Vector3().copy(start);
        this.direction=new THREE.Vector3().copy(direction);
    }
    get end(){
        return new THREE.Vector3().addVectors(this.start,new THREE.Vector3().copy(this.direction).multiplyScalar(jUtils.precision));
    }
    set(start,direction){
        this.start.copy(start);
        this.direction.copy(direction);
    }
    applyMatrix4(matrix4){
        let start=new THREE.Vector3().copy(this.start).applyMatrix4(matrix4);
        let dir=new THREE.Vector3().copy(this.direction).applyMatrix4(matrix4);
        this.set(start,dir);
    }
    clone(){
        return new Ray(this.start,this.direction);
    }
}
//直线
class Line{
    constructor(startPoint=new THREE.Vector3(),endPoint=new THREE.Vector3()){
        this.start=new THREE.Vector3().copy(startPoint);
        this.end=new THREE.Vector3().copy(endPoint);
        //parametric equation:r(t)=startpoint+t*direction
    }
    get direction(){
        return new THREE.Vector3().subVectors(this.end,this.start).normalize();
    }
    get length(){
        return this.start.distanceTo(this.end);
    }
    set(startPoint,endPoint){
        this.start.copy(startPoint);
        this.end.copy(endPoint);
    }
    clone(){
        return new Line(this.start,this.end);
    }
}
//圆
class Circle{
    constructor(center,radius,normal){
        this.center=new THREE.Vector3().copy(center);
        this.radius=radius;
        this.normal=new THREE.Vector3().copy(normal);
    }
    get area(){
        return jUtils.circleArea(this.radius);
    }
    get circumference(){
        return jUtils.circleCircumference(this.radius);
    }
    set(center,radius,normal){
        this.center.copy(center);
        this.radius=radius;
        this.normal.copy(normal);
    }
    clone(){
        return new Circle(this.center,this.radius,this.normal);
    }
}
//平面
class Plane{
    constructor(normal=new THREE.Vector3(0,1,0),onePoint=new THREE.Vector3()){
        this.normal=new THREE.Vector3().copy(normal);
        this.point=new THREE.Vector3().copy(onePoint);
        //........implicit equation:p.dot(normal)=d
    }
    get implicitParameter_d(){
        return this.point.dot(this.normal);
    }
    set(normal,onePoint){
        this.normal.copy(normal);
        this.point.copy(onePoint);
    }
    setFromThreePoints(p1,p2,p3,pConstant){
        let dir1=new THREE.Vector3().subVectors(p2,p1);
        let dir2=new THREE.Vector3().subVectors(p3,p1);
        dir1.cross(dir2).normalize();
        this.set(dir1,new THREE.Vector3().copy(pConstant));
    }
    clone(){
        return new Plane(this.normal,this.point);
    }
}
//三角形
class Triangle{
    constructor(pointA=new THREE.Vector3(),pointB=new THREE.Vector3(),pointC=new THREE.Vector3()){
        this.a=new THREE.Vector3().copy(pointA);
        this.b=new THREE.Vector3().copy(pointB);
        this.c=new THREE.Vector3().copy(pointC);
    }
    get plane(){
        let dirAB=new THREE.Vector3().subVectors(this.b,this.a);
        let dirAC=new THREE.Vector3().subVectors(this.c,this.a);
        dirAB.cross(dirAC).normalize();
        return new Plane(dirAB,this.a);
    }
    get lineCA(){
        return new Line(this.c,this.a);
    }
    get lineBC(){
        return new Line(this.b,this.c);
    }
    get lineAB(){
        return new Line(this.a,this.b);
    }
    set(pointA,pointB,pointC){
        this.a.copy(pointA);
        this.b.copy(pointB);
        this.c.copy(pointC);
    }
    clone(){
        return new Triangle(this.a,this.b,this.c);
    }
}
//球
class Sphere{
    constructor(radius,center=new THREE.Vector3()){
        this.radius=radius;
        this.center=new THREE.Vector3().copy(center);
    }
    get area(){
        return jUtils.sphereArea(this.radius);
    }
    get volume(){
        return jUtils.sphereVolume(this.radius);
    }
    set(radius,center){
        this.radius=radius;
        this.center.copy(center);
    }
    clone(){
        return new Sphere(this.radius,this.center);
    }
}
//椭圆
class Ellipse{
    constructor(focal1=new THREE.Vector3(),focal2=new THREE.Vector3(),p=new THREE.Vector3()){
        this.focal1=new THREE.Vector3().copy(focal1);
        this.focal2=new THREE.Vector3().copy(focal2);
        this.p=new THREE.Vector3().copy(p);
    }
    circumference(startAngle,endAngle){
        //需要定积分脚本
        //let PE=new 参数方程();
        //PE.input('power(power('+A+',2)*power(sin(t),2)+power('+B+',2)*power(cos(t),2),0.5)',['t']);
        //let INT=new 定积分();
        //INT.input('X',PE);
        //return Math.abs(INT.output(startAngle,endAngle));
    }
    area(startAngle,endAngle) {
        let r=this.radius;
        let vE = r.short * r.long * (Math.sin(endAngle * 2) / 4 + endAngle / 2);
        let vS = r.short * r.long * (Math.sin(startAngle * 2) / 4 + startAngle / 2);
        return Math.abs(vE - vS);
    }
    get radius(){
        let bLength=this.focal1.distanceTo(this.p)+this.focal2.distanceTo(this.p);
        let b=bLength/2;
        let aLength=this.focal1.distanceTo(this.focal2);
        let a=aLength/2;
        let angle=jUtils.arccos(a/b,false);
        let A=b*Math.sin(angle);
        return {
            short: Math.abs(A),
            long: Math.abs(b)
        }
    }
    get center(){
        return new THREE.Vector3().addVectors(this.focal1,this.focal2).divideScalar(2);
    }
    get normal(){
        let d1=new THREE.Vector3().subVectors(this.focal1,this.p).normalize();
        let d2=new THREE.Vector3().subVectors(this.focal2,this.p).normalize();
        return d1.cross(d2).normalize();
    }
    set(focal1,focal2,p){
        this.focal1.copy(focal1);
        this.focal2.copy(focal2);
        this.p.copy(p);
    }
    clone(){
        return new Ellipse(this.focal1,this.focal2,this.p);
    }
}
//二维包围盒
class AABB2D{
    constructor(max=new THREE.Vector3(),min=new THREE.Vector3()){
        this.max=new THREE.Vector3().copy(max);
        this.min=new THREE.Vector3().copy(min);
    }
    set(max,min){
        this.max.copy(max);
        this.min.copy(min);
    }
    clone(){
        return new AABB2D(this.max,this.min);
    }
}
//三维包围盒
class AABB3D{
    constructor(boundMax=new THREE.Vector3(),boundMin=new THREE.Vector3()){
        this.max=new THREE.Vector3().copy(boundMax);
        this.min=new THREE.Vector3().copy(boundMin);
    }
    get FRU(){
        return new THREE.Vector3().copy(this.max);
    }
    get FRB(){
        return new THREE.Vector3().set(this.max.x,this.min.y,this.max.z);
    }
    get FLU(){
        return new THREE.Vector3().set(this.min.x,this.max.y,this.max.z);
    }
    get FLB(){
        return new THREE.Vector3().set(this.min.x,this.min.y,this.max.z);
    }
    get BRU(){
        return new THREE.Vector3().set(this.max.x,this.max.y,this.min.z);
    }
    get BRB(){
        return new THREE.Vector3().set(this.max.x,this.min.y,this.min.z);
    }
    get BLU(){
        return new THREE.Vector3().set(this.min.x,this.max.y,this.min.z);
    }
    get BLB(){
        return new THREE.Vector3().copy(this.min);
    }
    get FR(){
        return new Line(this.FRU,this.FRB);
    }
    get FL(){
        return new Line(this.FLU,this.FLB);
    }
    get FU(){
        return new Line(this.FRU,this.FLU);
    }
    get FB(){
        return new Line(this.FRB,this.FLB);
    }
    get RU(){
        return new Line(this.FRU,this.BRU);
    }
    get RB(){
        return new Line(this.FRB,this.BRB);
    }
    get LU(){
        return new Line(this.FLU,this.BLU);
    }
    get LB(){
        return new Line(this.FLB,this.BLB);
    }
    get BU(){
        return new Line(this.BRU,this.BLU);
    }
    get BB(){
        return new Line(this.BRB,this.BLB);
    }
    get BR(){
        return new Line(this.BRU,this.BRB);
    }
    get BL(){
        return new Line(this.BLU,this.BLB);
    }
    get upPlane(){
        return new Plane(new THREE.Vector3(0,1,0),this.max);
    }
    get downPlane(){
        return new Plane(new THREE.Vector3(0,-1,0),this.min);
    }
    get leftPlane(){
        return new Plane(new THREE.Vector3(-1,0,0),this.min);
    }
    get rightPlane(){
        return new Plane(new THREE.Vector3(1,0,0),this.max);
    }
    get frontPlane(){
        return new Plane(new THREE.Vector3(0,0,1),this.max);
    }
    get backPlane(){
        return new Plane(new THREE.Vector3(0,0,-1),this.min);
    }
    get backAABB(){
        return new AABB2D(new THREE.Vector3(this.max.x,this.max.y,this.min.z),this.min);
    }
    get upAABB(){
        return new AABB2D(this.max,new THREE.Vector3(this.min.x,this.max.y,this.min.z));
    }
    get downAABB(){
        return new AABB2D(new THREE.Vector3(this.max.x,this.min.y,this.max.z),this.min);
    }
    get leftAABB(){
        return new AABB2D(new THREE.Vector3(this.min.x,this.max.y,this.max.z),this.min);
    }
    get rightAABB(){
        return new AABB2D(this.max,new THREE.Vector3(this.max.x,this.min.y,this.min.z));
    }
    get frontAABB(){
        return new AABB2D(this.max,new THREE.Vector3(this.min.x,this.min.y,this.max.z));
    }
    set(boundMax,boundMin) {
        this.max.copy(boundMax);
        this.min.copy(boundMin);
    }
    clone(){
        return new AABB3D(this.max,this.min);
    }
}
//文字sprite
class Text extends THREE.Sprite{
    constructor(values={}) {
        super();
        this.props={
            fontSize:values.fontSize||16,
            text:values.text||'test',
            color:'#'+values.color.getHexString()||'#000000',
            depthTest:values.depthTest!==undefined?values.depthTest:true,
            fontFamily:values.fontFamily||'Arial',
            fontStyle:values.fontStyle||'normal',
            vivid:values.vivid||1,
            alphaTest:values.alphaTest||0.1,
            transparent:values.transparent!==undefined?values.transparent:true,
            opacity:values.opacity!==undefined?values.opacity:1,
            backGround:values.backGround?'#'+values.backGround.getHexString():null,
            border:values.border?'#'+values.border.getHexString():null,
        };
        this.material=new THREE.SpriteMaterial();
        this.init();
    }
    set value(values){
        for(let key in values){
            if(this.props[''+key+'']===undefined)continue;
            if(values[''+key+''] instanceof THREE.Color){
                this.props[''+key+'']='#'+values[''+key+''].getHexString();
            }else{
                this.props[''+key+'']=values[''+key+''];
            }
        }
        this.initMaterial();
    }
    set map(texture){
        if(texture){
            this.material.map=texture;
        }else{
            this.initMaterial();
        }
    }
    set threshold(val){
        this._threshold=val;
    }
    init(){
        this.initVariable();
        this.initMaterial();
        this.initRayCast();
    }
    initVariable(){
        this._threshold=1;
    }
    initMaterial() {
        let canvas=document.createElement('canvas');
        let _fontSize = this.props.fontSize * jUtils.Pr * this.props.vivid;
        let ratBasic = 100 * 16 / this.props.fontSize * this.props.vivid;
        let ctx = canvas.getContext('2d');
        ctx.font = '' + this.props.fontStyle + ' ' + _fontSize + 'px ' + this.props.fontFamily + '';
        let textT=' '+this.props.text+' ';
        canvas.width = ctx.measureText(textT).width;
        canvas.height = _fontSize * 1.5;
        let ratX = canvas.width / ratBasic;
        let ratY = canvas.height / canvas.width * ratX;
        if(this.props.backGround){
            ctx.rect(0,0,canvas.width,canvas.height);
            ctx.fillStyle=this.props.backGround;
            ctx.fill();
        }
        if(this.props.border){
            let w=canvas.height*0.04;
            ctx.lineWidth=w;
            ctx.moveTo(w*0.5,w*0.5);
            ctx.lineTo(w*0.5,canvas.height-w*0.5);
            ctx.lineTo(canvas.width-w*0.5,canvas.height-w*0.5);
            ctx.lineTo(canvas.width-w*0.5,w*0.5);
            ctx.lineTo(w*0.5,w*0.5);
            ctx.lineTo(w*0.5,canvas.height*0.5);
            ctx.strokeStyle=this.props.border;
            ctx.stroke();
        }
        ctx.font = '' + this.props.fontStyle + ' ' + _fontSize + 'px ' + this.props.fontFamily + '';
        ctx.fillStyle = this.props.color;
        ctx.fillText(' '+this.props.text, 0,_fontSize*1.1);
        let texture = new THREE.Texture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        this.material.map = texture;
        this.material.transparent = this.props.transparent;
        this.material.opacity = this.props.opacity;
        this.material.alphaTest = this.props.alphaTest;
        this.material.depthTest = this.props.depthTest;
        this.scale.set(ratX, ratY, 1);
    }
    initRayCast() {
        this.raycast=(()=>{
            let intersectPoint = new THREE.Vector3();
            let worldPosition = new THREE.Vector3();
            let worldScale = new THREE.Vector3();
            return (raycaster, intersects)=>{
                worldPosition.setFromMatrixPosition(this.matrixWorld);
                raycaster.ray.closestPointToPoint(worldPosition, intersectPoint);
                worldScale.setFromMatrixScale(this.matrixWorld);
                let guessSizeSq = worldScale.x * worldScale.y / 4*this._threshold;
                if (worldPosition.distanceToSquared(intersectPoint) > guessSizeSq) return;
                let distance = raycaster.ray.origin.distanceTo(intersectPoint);
                if (distance < raycaster.near || distance > raycaster.far) return;
                intersects.push({
                    distance: distance,
                    point: intersectPoint.clone(),
                    face: null,
                    object: this
                });
            };
        })();
    }
}

//变量
let variable= {
    precision: 1000000,
    minimum:0.0000001,
    Hz: 16,
    Pr: 1,
    DEC: 0.01,
};

//常用方法
export default class jUtils {
    constructor() {}

    //*******************************************************全局参数******************************************************

    //精度
    static get precision(){
        return variable.precision;
    }
    static set precision(val){
        variable.precision=val;
    }
    //近似0
    static get minimum(){
        return variable.minimum;
    }
    static set minimum(val){
        variable.minimum=val;
    }
    //自然数
    static get e(){
        return 2.718281828459045;
    }
    //更新频率（ms）
    static get Hz(){
        return variable.Hz;
    }
    static set Hz(val){
        variable.Hz=val;
    }
    //类型
    static get T() {
        return {
            _msh: 'mesh',
            _pln: 'plane',
            _lin: 'line',
            _grp: 'group',
            _idf: 'indexFace',
            _drl: 'dirLine',
            _ndl: 'noDirLine',
            //
            elr: 'euler',
            qtn: 'quaternion',
            clr: 'color',
            mt4: 'matrix4',
            mt3: 'matrix3',
            vc4: 'vector4',
            vc3: 'vector3',
            vc2: 'vector2',
            num: 'number',
            str: 'string',
            bol: 'boolean',
            smb: 'symbol',
            udf: 'undefined',
            ary: 'array',
            nry: 'disorderArray',
            fuc: 'function',
            obj: 'object',
        };
    }
    //屏幕像素比
    static get Pr(){
        return variable.Pr;
    }
    static set Pr(val){
        variable.Pr=val;
    }
    //小数显示精度
    static get DEC(){
        return variable.DEC;
    }
    static set DEC(val){
        variable.DEC=val;
    }
    //角度到弧度
    static get DEGToRAD(){
        return Math.PI / 180;
    }
    //弧度到角度
    static get RADToDEG(){
        return 180 / Math.PI;
    }

    //*******************************************************自定义图元*****************************************************

    //获取三角形类
    static get Triangle() {
        return Triangle;
    }
    //获取数学射线类
    static get Ray() {
        return Ray;
    }
    //获取直线类
    static get Line() {
        return Line;
    }
    //获取数学平面类
    static get Plane() {
        return Plane;
    }
    //获取圆类
    static get Circle() {
        return Circle;
    }
    //获取球类
    static get Sphere() {
        return Sphere;
    }
    //获取椭圆类
    static get Ellipse() {
        return Ellipse;
    }
    //获取二维包围盒类
    static get AABBTwoD() {
        return AABB2D;
    }
    //获取三位包围盒类
    static get AABBThreeD() {
        return AABB3D;
    }
    //获取文字sprite类
    static get Text(){
        return Text;
    }
    //创建直线
    static line(startPoint, endPoint) {
        return new Line(startPoint, endPoint);
    }
    //创建射线
    static ray(start, direction) {
        return new Ray(start, direction);
    }
    //创建圆
    static circle(center, radius, normal) {
        return new Circle(center, radius, normal);
    }
    //创建平面
    static plane(normal, onePoint) {
        return new Plane(normal, onePoint);
    }
    //创建三角形
    static triangle(pointA, pointB, pointC) {
        return new Triangle(pointA, pointB, pointC);
    }
    //创建球
    static sphere(radius, center) {
        return new Sphere(radius, center);
    }
    //创建椭圆
    static ellipse(focal1, focal2, p) {
        return new Ellipse(focal1, focal2, p);
    }
    //创建二维包围盒
    static AABB2D(max, min) {
        return new AABB2D(max, min);
    }
    //创建三维包围盒
    static AABB3D(boundMax, boundMin) {
        return new AABB3D(boundMax, boundMin);
    }
    //创建文字sprite
    static text(values={}){
        return new Text(values);
    }

    //*******************************************************常用方法*****************************************************

    //计算反正弦,默认弧度
    static arcsin(number, isInDegree=false) {
        if (Math.abs(number) > 1) {
            console.log("输入值超出反正弦定义域！");
            return;
        }
        let angle = Math.asin(number);
        if (!isInDegree)return angle;
        return jUtils.radianToDegree(angle);
    }
    //计算反余弦,默认弧度
    static arccos(number, isInDegree=false) {
        if (Math.abs(number) > 1) {
            console.log("输入值超出反余弦定义域！");
            return;
        }
        let angle = Math.acos(number);
        if (!isInDegree)return angle;
        return jUtils.radianToDegree(angle);
    }
    //计算反正切,默认弧度
    static arctan(number, isInDegree=false) {
        let angle = Math.atan(number);
        if (!isInDegree)return angle;
        return jUtils.radianToDegree(angle);
    }
    //计算反余切,默认弧度
    static arccot(number, isInDegree=false) {
        let angle = Math.PI / 2 - Math.atan(number);
        if (isInDegree) angle = jUtils.radianToDegree(angle);
        return angle;
    }
    //获取元素绝对像素坐标
    static absPositionOfElement(element) {
        let SPX = 0;
        let SPY = 0;
        while (element !== document.body) {
            SPX += element.offsetLeft;
            SPY += element.offsetTop;
            element = element.offsetParent;
        }
        SPX += window.screenLeft + document.body.clientLeft - document.body.scrollLeft;
        SPY += window.screenTop + document.body.clientTop - document.body.scrollTop;
        return {left: SPX, top: SPY};
    }
    //26进制到10进制
    static abcConvertToDecimal(str){
        let n=0;
        let s=str.match(/./g);
        for(let i=str.length-1,j=1;i>=0;i--,j*=26){
            let c=s[i].toUpperCase();
            if(c<'A'||c>'Z'){
                return 0;
            }
            n+=(c.codePointAt(0)-64)*j;
        }
        return n;
    }
    //弓形面积,默认弧度
    static bowArea(radius, angle, isInDegree=false) {
        let _angle = isInDegree ? jUtils.degreeToRadian(angle) : angle;
        let arcA = jUtils.sectorArea(radius, _angle, false);
        let h = radius * Math.cos(_angle);
        let a = radius * Math.sin(_angle);
        let triA = a * h;
        return (Math.abs(_angle) > Math.PI) ? arcA + triA : arcA - triA;
    }
    //弓形周长,默认弧度
    static bowCircumference(radius, angle, isInDegree=false) {
        let _angle = angle;
        if (isInDegree) _angle = jUtils.degreeToRadian(angle);
        let length = jUtils.circularArcLength(radius, _angle, false);
        let a = radius * Math.sin(_angle);
        return length + a * 2;
    }
    //角平分线
    static bisectorOfAngle(p1, p2, p3,n=2) {
        let vFrom = new THREE.Vector3().subVectors(p1, p2).normalize();
        let vTo = new THREE.Vector3().subVectors(p3, p2).normalize();
        let temp=new THREE.Vector3().lerpVectors(vFrom,vTo,1/n);
        return new Line(p2,new THREE.Vector3().addVectors(p2,temp));
    }
    //角平分面
    static bisectionPlaneOf2Planes(plane1, plane2, point) {
        let n1 = new THREE.Vector3().copy(plane1.normal);
        let n2 = new THREE.Vector3().copy(plane2.normal);
        let nTarget = jUtils.bisectorOfAngle(n1, new THREE.Vector3(0, 0, 0), n2).direction;
        return new Plane(nTarget, new THREE.Vector3().copy(point));
    }
    //获取字符串字节长度
    static byteLengthOfString(str) {
        let byteLength = 0;
        if (str === undefined || str.length === 0)return 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 255) {
                byteLength += 2;
            } else {
                byteLength++;
            }
        }
        return byteLength;
    }
    //包围盒是否与包围球相交
    static AABB3IntersectSphere(AABB3,sphere){
        let center=new THREE.Vector3().copy(sphere.center);
        center.clamp(AABB3.min,AABB3.max);
        return center.distanceTo(sphere.center)<=sphere.radius;
    }
    //根据半径计算全圆面积
    static circleArea(radius) {
        let r = Number.parseFloat(radius);
        if (Number.isNaN(r))return 0;
        return Math.PI * r * r;
    }
    //余弦计算,默认弧度
    static cos(degree, isInDegree=false) {
        if (isInDegree) degree = jUtils.degreeToRadian(degree);
        return Math.cos(degree);
    }
    //根据半径计算全圆周长
    static circleCircumference(radius) {
        let r = Number.parseFloat(radius);
        if (Number.isNaN(r))return 0;
        return 2 * Math.PI * r;
    }
    //余切计算,默认弧度
    static cot(radian, isInDegree=false) {
        if (isInDegree) radian = jUtils.radianToDegree(radian);
        return 1 / Math.tan(radian);
    }
    //余割计算,默认弧度
    static csc(radian, isInDegree=false) {
        if (isInDegree) radian = jUtils.radianToDegree(radian);
        return 1 / Math.sin(radian);
    }
    //长方体表面积
    static cuboidSuperficialArea(length, width, height) {
        return (length * width + length * height + width * height) * 2;
    }
    //长方体体积
    static cuboidVolume(length, width, height) {
        return length * width * height;
    }
    //圆柱侧面积
    static cylinderFlankArea(radius, height) {
        let circumference = jUtils.circleCircumference(radius);
        return circumference * height;
    }
    //圆柱表面积
    static cylinderSuperficialArea(radius, height) {
        let abottom = jUtils.circleArea(radius);
        let aflank = jUtils.cylinderFlankArea(radius, height);
        return aflank + abottom + abottom;
    }
    //圆柱体积
    static cylinderVolume(radius, height) {
        let areaBottom = jUtils.circleArea(radius);
        return areaBottom * height;
    }
    //圆锥体积
    static circularconeVolume(radius, height) {
        let areabottom = jUtils.circleArea(radius);
        return areabottom * height / 3;
    }
    //圆弧长,默认使用弧度
    static circularArcLength(radius, angle, isInDegree=false) {
        let _angle = angle;
        if (isInDegree) _angle = jUtils.degreeToRadian(angle);
        return _angle * radius;
    }
    //圆台母线
    static circularTruncatedConeGeneratrix(topRadius, bottomRadius, height) {
        return Math.sqrt(Math.pow((bottomRadius - topRadius), 2) + Math.pow(height, 2));
    }
    //圆台侧面积
    static circularTruncatedConeFlankArea(topRadius, bottomRadius, length, isGeneratrix) {
        let _length = length;
        if (!isGeneratrix) _length = jUtils.circularTruncatedConeGeneratrix(topRadius, bottomRadius, length);
        return Math.PI * _length * (topRadius + bottomRadius);
    }
    //圆台表面积
    static circularTruncatedConeSuperficialArea(topRadius, bottomRadius, length, isGeneratrix) {
        let flankArea = jUtils.circularTruncatedConeFlankArea(topRadius, bottomRadius, length, isGeneratrix);
        let topArea = jUtils.circleArea(topRadius);
        let bottomArea = jUtils.circleArea(bottomRadius);
        return Number.parseFloat(flankArea + topArea + bottomArea);
    }
    //圆锥母线
    static circularConeGeneratrix(radius, height) {
        return Math.sqrt(Math.pow(radius, 2) + Math.pow(height, 2));
    }
    //圆锥侧面积
    static circularConeFlankArea(radius, length, isGeneratrix) {
        let generatrix = length;
        if (!isGeneratrix) jUtils.circularConeGeneratrix(radius, length);
        return Math.PI * radius * generatrix;
    }
    //圆锥表面积
    static circularConeSuperficialArea(radius, length, isGeneratrix) {
        let bottomArea = jUtils.circleArea(radius);
        let flankArea = jUtils.circularConeFlankArea(radius, length, isGeneratrix);
        return Number.parseFloat(bottomArea + flankArea);
    }
    //圆锥体积
    static coneVolume(bottomArea, height) {
        return bottomArea * height / 3;
    }
    //圆台体积
    static circularTruncatedConeVolume(topRadius, bottomRadius, height) {
        return Math.PI * height * (Math.pow(topRadius, 2) + Math.pow(bottomRadius, 2) + topRadius * bottomRadius) / 3;
    }
    //两直线的公垂线
    static closestPointsOf2LinesIn3D(line1, line2) {
        let p1 =line1.start;
        let d1 =new THREE.Vector3().copy(line1.direction);
        let p2 =line2.start;
        let d2 =new THREE.Vector3().copy(line2.direction);
        let crs = new THREE.Vector3().crossVectors(d1, d2);
        if (jUtils.pcsEqual(crs, new THREE.Vector3(0, 0, 0), jUtils.T.vc3)) {
            return new Line(p1, p2);
        }
        let v1a = new THREE.Vector3().subVectors(p2, p1);
        let v2a = new THREE.Vector3().copy(v1a);
        let v1b = v1a.cross(d2);
        let v1c = new THREE.Vector3().crossVectors(d1, d2);
        let v2c =v1c;
        let v1d = v1b.dot(v1c);
        let v1e = Math.pow(v1c.length(), 2);
        let t1 = v1d / v1e;
        let v2b = v2a.cross(d1);
        let v2d = v2b.dot(v2c);
        let v2e = Math.pow(v2c.length(), 2);
        let t2 = v2d / v2e;
        let pStart = d1.multiplyScalar(t1).add(p1);
        let pEnd = d2.multiplyScalar(t2).add(p2);
        return new Line(pStart, pEnd);
    }
    //4点球
    static circumSphereBy4Points(p1, p2, p3, p4) {
        if (jUtils.checkCoplanar(p1, p2, p3, p4)) {
            return new Sphere(0.000001, new THREE.Vector3(0, 0, 0));
        }
        let nom1 = jUtils.planeBy3Points(p1, p2, p3).normal;
        let nom2 = jUtils.planeBy3Points(p2, p3, p4).normal;
        let pnt1 = jUtils.triangleCircumcircle(p1, p2, p3).center;
        let pnt2 = jUtils.triangleCircumcircle(p2, p3, p4).center;
        let line1 = new Line(pnt1, new THREE.Vector3().addVectors(pnt1, nom1));
        let line2 = new Line(pnt2, new THREE.Vector3().addVectors(pnt2, nom2));
        let crossPoint = jUtils.closestPointsOf2LinesIn3D(line1, line2).start;
        let radius = crossPoint.distanceTo(p1);
        return new Sphere(radius, crossPoint);
    }
    //判断4点共面
    static checkCoplanar(p1, p2, p3, p4) {
        let plane = jUtils.planeBy3Points(p1, p2, p3);
        let n = plane.normal;
        let d = plane.implicitParameter_d;
        let nd = n.dot(p4);
        return jUtils.pcsEqual(nd, d, jUtils.T.num);
    }
    //判断3点共线
    static checkColinear(p1, p2, p3) {
        let v1 = new THREE.Vector3().subVectors(p2, p1);
        let v2 = new THREE.Vector3().subVectors(p3, p1);
        let crs = new THREE.Vector3().crossVectors(v1, v2);
        return jUtils.pcsEqual(crs, new THREE.Vector3(0, 0, 0), jUtils.T.vc3);
    }
    //检测包围盒是否相交
    static checkAABBIntersectAABB(AABB1, AABB2, is3DAABB = false) {
        if (is3DAABB === false) {
            return !(AABB1.max.x < AABB2.min.x || AABB1.max.y < AABB2.min.y || AABB2.max.x < AABB1.min.x || AABB2.max.y < AABB1.min.y);
        } else {
            return !(AABB1.max.x < AABB2.min.x || AABB1.max.y < AABB2.min.y || AABB1.max.z < AABB2.min.z
            || AABB2.max.x < AABB1.min.x || AABB2.max.y < AABB1.min.y || AABB2.max.z < AABB1.min.z);
        }
    }
    //检测点是否在2D包围盒中
    static checkPointIn2DAABB(point, AB2D, is3DPoint = false) {
        if (is3DPoint === false) {
            if (point.x < AB2D.min.x || point.x > AB2D.max.x)return false;
            return !(point.y < AB2D.min.y || point.y > AB2D.max.y);
        } else {
            if (jUtils.pcsEqual(AB2D.max.z, AB2D.min.z, jUtils.T.num)) {
                if (point.x < AB2D.min.x || point.x > AB2D.max.x)return false;
                return !(point.y < AB2D.min.y || point.y > AB2D.max.y);
            } else if (jUtils.pcsEqual(AB2D.max.x, AB2D.min.x, jUtils.T.num)) {
                if (point.y < AB2D.min.y || point.y > AB2D.max.y)return false;
                return !(point.z < AB2D.min.z || point.z > AB2D.max.z);
            } else {
                if (point.x < AB2D.min.x || point.x > AB2D.max.x)return false;
                return !(point.z < AB2D.min.z || point.z > AB2D.max.z);
            }
        }
    }
    //2d线是否与包围盒边界相交
    static checkLineIntersectBoundLinesOfAABBIn2D(p1, p2, AB2D) {
        let maxX = AB2D.max.x;
        let minX = AB2D.min.x;
        let maxY = AB2D.max.y;
        let minY = AB2D.min.y;
        let topLeft = new THREE.Vector3(minX, maxY, 0);
        let topRight = new THREE.Vector3(maxX, maxY, 0);
        let bottomLeft = new THREE.Vector3(minX, minY, 0);
        let bottomRight = new THREE.Vector3(maxX, minY, 0);
        if (jUtils.ifTwoLinesIntersect2D([topLeft, topRight], [new THREE.Vector3(p1.x, p1.y, 0), new THREE.Vector3(p2.x, p2.y, 0)]))return true;
        if (jUtils.ifTwoLinesIntersect2D([topRight, bottomRight], [new THREE.Vector3(p1.x, p1.y, 0), new THREE.Vector3(p2.x, p2.y, 0)]))return true;
        if (jUtils.ifTwoLinesIntersect2D([bottomLeft, bottomRight], [new THREE.Vector3(p1.x, p1.y, 0), new THREE.Vector3(p2.x, p2.y, 0)]))return true;
        return jUtils.ifTwoLinesIntersect2D([topLeft, bottomLeft], [new THREE.Vector3(p1.x, p1.y, 0), new THREE.Vector3(p2.x, p2.y, 0)]);
    }
    //计算旋转位置
    static computeRotatePosition(target,pStart,pEnd,angle){
        let dir=new THREE.Vector3().subVectors(pEnd,pStart).normalize();
        let tp=new THREE.Vector3().copy(target).sub(pStart);
        return tp.applyAxisAngle(dir,angle).add(pStart);
    }
    //将有XYZ键值的物体转化为坐标
    static convertXYZObjToVec(obj){
        return new THREE.Vector3(obj.x?obj.x:0,obj.y?obj.y:0,obj.z?obj.z:0);
    }
    //将有rgb键值的物体转化为颜色
    static convertRGBObjToColor(obj){
        if(obj.r===undefined||obj.g===undefined||obj.b===undefined)return obj;
        return new THREE.Color(obj.r,obj.g,obj.b);
    }
    //计算3点法线
    static computeThreePointNormal(p1,p2,p3){
        let AB = new THREE.Vector3().subVectors(p2, p1);
        let AC = new THREE.Vector3().subVectors(p3, p1);
        return AB.cross(AC).normalize();
    }
    //计算点序列的平均法线
    static computeAverageNormalOfPointSequence(points) {
        let normals = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < points.length - 2; i++) {
            let normal = jUtils.computeThreePointNormal(points[i], points[i + 1], points[i + 2]);
            normals.add(normal);
        }
        let normal = jUtils.computeThreePointNormal(points[points.length - 2], points[points.length - 1], points[0]);
        normals.add(normal);
        normal = jUtils.computeThreePointNormal(points[points.length - 1], points[0], points[1]);
        normals.add(normal);
        return normals.normalize();
    }
    //点到网格最近点的信息（局部坐标系）
    static closestPointOfPointAndMesh(point,mesh){
        let worldInverse = new THREE.Matrix4().getInverse(mesh.matrixWorld);
        let p = new THREE.Vector3().copy(point).applyMatrix4(worldInverse);
        let faceIndex;
        let minDistanceLine = undefined;
        let a = new THREE.Vector3();
        let b = new THREE.Vector3();
        let c = new THREE.Vector3();
        let triangle = new Triangle();
        let ai, bi, ci;
        let indexed=false;
        let sphere=new Sphere();
        let AABB3=new AABB3D();
        let boundMax=new THREE.Vector3();
        let boundMin=new THREE.Vector3();
        if(mesh.geometry instanceof THREE.BufferGeometry) {
            let indexAttribute = mesh.geometry.index;
            let positions = mesh.geometry.getAttribute('position').array;
            if (indexAttribute) {
                let indices = indexAttribute.array;
                for (let i = 0; i < indices.length ; i += 3) {
                    ai = indices[i];
                    bi = indices[i + 1];
                    ci = indices[i + 2];
                    a.set(positions[ai * 3], positions[ai * 3 + 1], positions[ai * 3 + 2]);
                    b.set(positions[bi * 3], positions[bi * 3 + 1], positions[bi * 3 + 2]);
                    c.set(positions[ci * 3], positions[ci * 3 + 1], positions[ci * 3 + 2]);
                    if(minDistanceLine){
                        boundMax.set(Math.max(a.x,b.x,c.x),Math.max(a.y,b.y,c.y),Math.max(a.z,b.z,c.z));
                        boundMin.set(Math.min(a.x,b.x,c.x),Math.min(a.y,b.y,c.y),Math.min(a.z,b.z,c.z));
                        AABB3.set(boundMax,boundMin);
                        if(!jUtils.AABB3IntersectSphere(AABB3,sphere)){
                            continue;
                        }
                    }
                    triangle.set(a, b, c);
                    let tempLine = jUtils.distanceOfPointAndTriangle(p, triangle);
                    if (minDistanceLine === undefined || tempLine.length < minDistanceLine.length) {
                        minDistanceLine = tempLine;
                        faceIndex = i / 3;
                        indexed=true;
                        sphere.set(minDistanceLine.length,p);
                    }
                }
            } else {
                let indices = mesh.geometry.drawRange;
                for (let i = indices.start; i < indices.count / 3 - 2; i += 3) {
                    ai = i * 3;
                    bi = (i + 1) * 3;
                    ci = (i + 2) * 3;
                    a.set(positions[ai * 3], positions[ai * 3 + 1], positions[ai * 3 + 2]);
                    b.set(positions[bi * 3], positions[bi * 3 + 1], positions[bi * 3 + 2]);
                    c.set(positions[ci * 3], positions[ci * 3 + 1], positions[ci * 3 + 2]);
                    if(minDistanceLine){
                        boundMax.set(Math.max(a.x,b.x,c.x),Math.max(a.y,b.y,c.y),Math.max(a.z,b.z,c.z));
                        boundMin.set(Math.min(a.x,b.x,c.x),Math.min(a.y,b.y,c.y),Math.min(a.z,b.z,c.z));
                        AABB3.set(boundMax,boundMin);
                        if(!jUtils.AABB3IntersectSphere(AABB3,sphere)){
                            continue;
                        }
                    }
                    triangle.set(a, b, c);
                    let tempLine = jUtils.distanceOfPointAndTriangle(p, triangle);
                    if (minDistanceLine === undefined || tempLine.length < minDistanceLine.length) {
                        minDistanceLine = tempLine;
                        faceIndex = ai;
                        indexed=false;
                        sphere.set(minDistanceLine.length,p);
                    }
                }
            }
        }else{
            for (let i = 0; i < mesh.geometry.faces.length; i++) {
                ai = mesh.geometry.faces[i].a;
                bi = mesh.geometry.faces[i].b;
                ci = mesh.geometry.faces[i].c;
                a.copy(mesh.geometry.vertices[ai]);
                b.copy(mesh.geometry.vertices[bi]);
                c.copy(mesh.geometry.vertices[ci]);
                if(minDistanceLine){
                    boundMax.set(Math.max(a.x,b.x,c.x),Math.max(a.y,b.y,c.y),Math.max(a.z,b.z,c.z));
                    boundMin.set(Math.min(a.x,b.x,c.x),Math.min(a.y,b.y,c.y),Math.min(a.z,b.z,c.z));
                    AABB3.set(boundMax,boundMin);
                    if(!jUtils.AABB3IntersectSphere(AABB3,sphere)){
                        continue;
                    }
                }
                triangle.set(a, b, c);
                let tempLine = jUtils.distanceOfPointAndTriangle(p, triangle);
                if (minDistanceLine === undefined || tempLine.length < minDistanceLine.length) {
                    minDistanceLine = tempLine;
                    faceIndex=i;
                    indexed=true;
                    sphere.set(minDistanceLine.length,p);
                }
            }
        }
        return {
            point: minDistanceLine.start,
            faceIndex: faceIndex,
            indexed: indexed,
        };
    }
    //点到代表多段线的点序列的最近距离线段
    static closestPointOfPointsAndPoint(point,points){
        let minDistanceLine = undefined;
        let previousIndex = undefined;
        let nextIndex = undefined;
        let line=new Line();
        let AABB3=new AABB3D();
        let sphere=new Sphere();
        let boundMax=new THREE.Vector3();
        let boundMin=new THREE.Vector3();
        for (let i = 0; i < points.length - 1; i++) {
            let pointA = points[i];
            let pointB = points[i + 1];
            if(minDistanceLine){
                boundMax.set(Math.max(pointA.x,pointB.x),Math.max(pointA.y,pointB.y),Math.max(pointA.z,pointB.z));
                boundMin.set(Math.min(pointA.x,pointB.x),Math.min(pointA.y,pointB.y),Math.min(pointA.z,pointB.z));
                AABB3.set(boundMax,boundMin);
                if(!jUtils.AABB3IntersectSphere(AABB3,sphere)){
                    continue;
                }
            }
            line.set(pointA, pointB);
            let tempLine = jUtils.distanceOfPointAndLineSegment(point, line);
            if (minDistanceLine === undefined || tempLine.length < minDistanceLine.length) {
                minDistanceLine = tempLine;
                previousIndex = i;
                nextIndex = i + 1;
                sphere.set(minDistanceLine.length,point);
            }
        }
        return {line: minDistanceLine, previous: previousIndex, next: nextIndex};
    }
    //射线到代表多段线的点序列的最近线段
    static closestPointOfRayAndPoints(ray,points,worldMatrix){
        let vertices=(()=>{
            if(worldMatrix){
                let tp=[];
                points.forEach((p)=>{
                    tp.push(new THREE.Vector3().copy(p).applyMatrix4(worldMatrix));
                });
                return tp;
            }else{
                return points.slice(0);
            }
        })();
        let edges = [];
        for (let h = 0; h < vertices.length - 1; h++) {
            edges.push(new Line(vertices[h], vertices[h + 1]));
        }
        let minIndex = undefined;
        let minLength = undefined;
        let minLine = undefined;
        for (let h = 0; h < vertices.length; h++) {
            let temp = jUtils.verticalLineOfLineAndPoint(vertices[h], ray.start, ray.end);
            let distance = temp.length;
            if (minLength === undefined) {
                minLength = distance;
                minIndex = h;
                minLine = temp;
            } else {
                if (distance < minLength) {
                    minLength = distance;
                    minIndex = h;
                    minLine = temp;
                }
            }
        }
        minLine = new Line(minLine.end, minLine.start);
        for (let h = 0; h < edges.length; h++) {
            let tempDisLine = jUtils.distanceOfPointAndLineSegment(minLine.end, edges[h]);
            if (tempDisLine.length < minLine.length) {
                minLine = tempDisLine;
                minIndex = jUtils.ifElementInElements(edges[h].start, vertices, true, jUtils.T.vc3);
            }
        }
        let lineLeft = undefined;
        let disLine = undefined;
        let minDis = undefined;
        let offsetIndex = 0;
        let ratio = 0;
        if (vertices[minIndex - 1] !== undefined) {
            lineLeft = new Line(vertices[minIndex - 1], vertices[minIndex]);
            disLine = jUtils.closestPointsOf2LinesIn3D(lineLeft, ray);
            if (jUtils.ifPointOnLine(disLine.start, lineLeft.start, lineLeft.end)) {
                minLine = disLine;
                minDis = minLine.length;
                offsetIndex = -1;
                let d1 = vertices[minIndex].distanceTo(minLine.start);
                let d2 = vertices[minIndex].distanceTo(vertices[minIndex - 1]);
                ratio = d2 === 0 ? 0 : d1 / d2;
            }
        }
        let lineRight = undefined;
        if (vertices[minIndex + 1] !== undefined) {
            lineRight = new Line(vertices[minIndex], vertices[minIndex + 1]);
            disLine = jUtils.closestPointsOf2LinesIn3D(lineRight, ray);
            if (jUtils.ifPointOnLine(disLine.start, lineRight.start, lineRight.end)) {
                if (minDis === undefined || minDis > disLine.length) {
                    minLine = disLine;
                    offsetIndex = 1;
                    let d1 = vertices[minIndex].distanceTo(minLine.start);
                    let d2 = vertices[minIndex].distanceTo(vertices[minIndex + 1]);
                    ratio = d2 === 0 ? 0 : d1 / d2;
                }
            }
        }
        return {line: minLine, index: minIndex, indexOffset: offsetIndex, ratio: ratio};
    }
    //点序列中距离射线最近的点
    static closestPointInPointsToRay(ray,points,worldMatrix){
        let vertices=(()=>{
            if(worldMatrix){
                let tp=[];
                points.forEach((p)=>{
                    tp.push(new THREE.Vector3().copy(p).applyMatrix4(worldMatrix));
                });
                return tp;
            }else{
                return points.slice(0);
            }
        })();
        let edges = [];
        for (let h = 0; h < vertices.length - 1; h++) {
            edges.push(new Line(vertices[h], vertices[h + 1]));
        }
        let minIndex = undefined;
        let minLength = undefined;
        let minLine = undefined;
        for (let h = 0; h < vertices.length; h++) {
            let temp = jUtils.verticalLineOfLineAndPoint(vertices[h], ray.start, ray.end);
            let distance = temp.length;
            if (minLength === undefined) {
                minLength = distance;
                minIndex = h;
                minLine = temp;
            } else {
                if (distance < minLength) {
                    minLength = distance;
                    minIndex = h;
                    minLine = temp;
                }
            }
        }
        minLine = new Line(minLine.end, minLine.start);
        return {line: minLine, index: minIndex};
    }
    //代表多段线的点序列到射线的最近位置信息
    static closestPointOfRayAndSpline(ray, points,worldMatrix) {
        let rayC=ray.clone().applyMatrix4(new THREE.Matrix4().getInverse(worldMatrix));
        let edges = [];
        for (let h = 0; h < points.length - 1; h++) {
            edges.push(new Line(points[h], points[h + 1]));
        }
        let minIndex = undefined;
        let minLength = undefined;
        let minLine = undefined;
        for (let h = 0; h < points.length; h++) {
            let temp = jUtils.verticalLineOfLineAndPoint(points[h], rayC.start, rayC.end);
            let distance = temp.length;
            if (minLength === undefined) {
                minLength = distance;
                minIndex = h;
                minLine = temp;
            } else {
                if (distance < minLength) {
                    minLength = distance;
                    minIndex = h;
                    minLine = temp;
                }
            }
        }
        minLine = new Line(minLine.end, minLine.start);
        for (let h = 0; h < edges.length; h++) {
            let tempDisLine = jUtils.distanceOfPointAndLineSegment(minLine.end, edges[h]);
            if (tempDisLine.length < minLine.length) {
                minLine = tempDisLine;
                minIndex = jUtils.ifElementInElements(edges[h].start, points, true, jUtils.T.vc3);
            }
        }
        let lineLeft = undefined;
        let disLine = undefined;
        let minDis = undefined;
        let offsetIndex = 0;
        let ratio = 0;
        if (points[minIndex - 1] !== undefined) {
            lineLeft = new Line(points[minIndex - 1], points[minIndex]);
            disLine = jUtils.closestPointsOf2LinesIn3D(lineLeft, rayC);
            if (jUtils.ifPointOnLine(disLine.start, lineLeft.start, lineLeft.end)) {
                minLine = disLine;
                minDis = minLine.length;
                offsetIndex = -1;
                let d1 = points[minIndex].distanceTo(minLine.start);
                let d2 = points[minIndex].distanceTo(points[minIndex - 1]);
                ratio = d2 === 0 ? 0 : d1 / d2;
            }
        }
        let lineRight = undefined;
        if (points[minIndex + 1] !== undefined) {
            lineRight = new Line(points[minIndex], points[minIndex + 1]);
            disLine = jUtils.closestPointsOf2LinesIn3D(lineRight, rayC);
            if (jUtils.ifPointOnLine(disLine.start, lineRight.start, lineRight.end)) {
                if (minDis === undefined || minDis > disLine.length) {
                    minLine = disLine;
                    offsetIndex = 1;
                    let d1 = points[minIndex].distanceTo(minLine.start);
                    let d2 = points[minIndex].distanceTo(points[minIndex + 1]);
                    ratio = d2 === 0 ? 0 : d1 / d2;
                }
            }
        }
        return {line: minLine, index: minIndex, indexOffset: offsetIndex, ratio: ratio};
    }
    //计算mesh的面UV
    static computeFaceUV(geometry) {
        geometry.computeBoundingBox();
        let max = geometry.boundingBox.max;
        let min = geometry.boundingBox.min;
        let deltaX = max.x - min.x;
        let deltaY = max.y - min.y;
        let deltaZ = max.z - min.z;
        let tX = undefined;
        let tY = undefined;
        if (Math.max(deltaX, deltaY, deltaZ) === deltaX) {
            tX = 'x';
            if (Math.min(deltaX, deltaY, deltaZ) === deltaY) {
                tY = 'z';
            } else {
                tY = 'y';
            }
        } else if (Math.max(deltaX, deltaY, deltaZ) === deltaY) {
            tX = 'y';
            if (Math.min(deltaX, deltaY, deltaZ) === deltaX) {
                tY = 'z';
            } else {
                tY = 'x';
            }
        } else if (Math.max(deltaX, deltaY, deltaZ) === deltaZ) {
            tX = 'z';
            if (Math.min(deltaX, deltaY, deltaZ) === deltaY) {
                tY = 'x';
            } else {
                tY = 'y';
            }
        }
        let offset = (function () {
            let temp = new THREE.Vector2();
            if (tX === 'x') temp.x = 0 - min.x;
            if (tX === 'y') temp.x = 0 - min.y;
            if (tX === 'z') temp.x = 0 - min.z;
            if (tY === 'x') temp.y = 0 - min.x;
            if (tY === 'y') temp.y = 0 - min.y;
            if (tY === 'z') temp.y = 0 - min.z;
            return temp;
        }());
        let range = (function () {
            let temp = new THREE.Vector2();
            if (tX === 'x') temp.x = max.x - min.x;
            if (tX === 'y') temp.x = max.y - min.y;
            if (tX === 'z') temp.x = max.z - min.z;
            if (tY === 'x') temp.y = max.x - min.x;
            if (tY === 'y') temp.y = max.y - min.y;
            if (tY === 'z') temp.y = max.z - min.z;
            return temp;
        }());
        let faces = geometry.faces;
        geometry.faceVertexUvs[0] = [];
        for (let i = 0; i < faces.length; i++) {
            let v1 = geometry.vertices[faces[i].a];
            let v2 = geometry.vertices[faces[i].b];
            let v3 = geometry.vertices[faces[i].c];
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(((function () {
                        if (tX === 'x')return v1.x;
                        if (tX === 'y')return v1.y;
                        if (tX === 'z')return v1.z;
                    }()) + offset.x) / range.x, ((function () {
                        if (tY === 'x')return v1.x;
                        if (tY === 'y')return v1.y;
                        if (tY === 'z')return v1.z;
                    }()) + offset.y) / range.y),
                new THREE.Vector2(((function () {
                        if (tX === 'x')return v2.x;
                        if (tX === 'y')return v2.y;
                        if (tX === 'z')return v2.z;
                    }()) + offset.x) / range.x, ((function () {
                        if (tY === 'x')return v2.x;
                        if (tY === 'y')return v2.y;
                        if (tY === 'z')return v2.z;
                    }()) + offset.y) / range.y),
                new THREE.Vector2(((function () {
                        if (tX === 'x')return v3.x;
                        if (tX === 'y')return v3.y;
                        if (tX === 'z')return v3.z;
                    }()) + offset.x) / range.x, ((function () {
                        if (tY === 'x')return v3.x;
                        if (tY === 'y')return v3.y;
                        if (tY === 'z')return v3.z;
                    }()) + offset.y) / range.y)
            ]);
        }
        geometry.uvsNeedUpdate = true;
    }
    //计算bufferGeometry的UV
    static computeBufferFaceUV(geometry) {
        geometry.computeBoundingBox();
        let max = geometry.boundingBox.max;
        let min = geometry.boundingBox.min;
        let deltaX = max.x - min.x;
        let deltaY = max.y - min.y;
        let deltaZ = max.z - min.z;
        let tX = undefined;
        let tY = undefined;
        if (Math.max(deltaX, deltaY, deltaZ) === deltaX) {
            tX = 'x';
            if (Math.min(deltaX, deltaY, deltaZ) === deltaY) {
                tY = 'z';
            } else {
                tY = 'y';
            }
        } else if (Math.max(deltaX, deltaY, deltaZ) === deltaY) {
            tX = 'y';
            if (Math.min(deltaX, deltaY, deltaZ) === deltaX) {
                tY = 'z';
            } else {
                tY = 'x';
            }
        } else if (Math.max(deltaX, deltaY, deltaZ) === deltaZ) {
            tX = 'z';
            if (Math.min(deltaX, deltaY, deltaZ) === deltaY) {
                tY = 'x';
            } else {
                tY = 'y';
            }
        }
        let offset = (function () {
            let temp = new THREE.Vector2();
            if (tX === 'x') temp.x = 0 - min.x;
            if (tX === 'y') temp.x = 0 - min.y;
            if (tX === 'z') temp.x = 0 - min.z;
            if (tY === 'x') temp.y = 0 - min.x;
            if (tY === 'y') temp.y = 0 - min.y;
            if (tY === 'z') temp.y = 0 - min.z;
            return temp;
        }());
        let range = (function () {
            let temp = new THREE.Vector2();
            if (tX === 'x') temp.x = max.x - min.x;
            if (tX === 'y') temp.x = max.y - min.y;
            if (tX === 'z') temp.x = max.z - min.z;
            if (tY === 'x') temp.y = max.x - min.x;
            if (tY === 'y') temp.y = max.y - min.y;
            if (tY === 'z') temp.y = max.z - min.z;
            return temp;
        }());
        let position=geometry.getAttribute('position').array;
        let uvs = [];
        for (let i = 0; i < position.length/3; i++) {
            let v1 ={x:position[i*3],y:position[i*3+1],z:position[i*3+2]};
            uvs.push(
                ((function () {
                        if (tX === 'x')return v1.x;
                        if (tX === 'y')return v1.y;
                        if (tX === 'z')return v1.z;
                    }()) + offset.x) / range.x, ((function () {
                        if (tY === 'x')return v1.x;
                        if (tY === 'y')return v1.y;
                        if (tY === 'z')return v1.z;
                    }()) + offset.y) / range.y
            );
        }
        geometry.getAttribute('uv').copyArray(uvs);
        geometry.getAttribute('uv').needsUpdate=true;
    }
    //检测线（或点序列）是否闭合
    static checkLineClosed(line,isPoints=false){
        let start=isPoints?line[0]:line.geometry.vertices[0];
        let end=isPoints?line[line.length-1]:line.geometry.vertices[line.geometry.vertices.length-1];
        return jUtils.pcsEqual(start,end,jUtils.T.vc3);
    }
    //计算点群的包围盒大小
    static computeBoundMaxAndMin(points, offset) {
        let xs = [];
        let ys = [];
        let zs = [];
        for (let p of points) {
            xs.push(p.x);
            ys.push(p.y);
            zs.push(p.z);
        }
        let maxX = Math.max(...xs) + offset;
        let maxY = Math.max(...ys) + offset;
        let maxZ = Math.max(...zs) + offset;
        let minX = Math.min(...xs) - offset;
        let minY = Math.min(...ys) - offset;
        let minZ = Math.min(...zs) - offset;
        let max = new THREE.Vector3(maxX, maxY, maxZ);
        let min = new THREE.Vector3(minX, minY, minZ);
        return {max: max, min: min};
    }
    //计算线段在平面上的投影线段
    static computeProjectLineOnPlane(line, planeNormal, constant) {
        let offset = new THREE.Vector3().copy(planeNormal).multiplyScalar(constant);
        let start = new THREE.Vector3().copy(line.start);
        let end = new THREE.Vector3().copy(line.end);
        let pStart = start.projectOnPlane(planeNormal).add(offset);
        let pEnd = end.projectOnPlane(planeNormal).add(offset);
        return new Line(pStart, pEnd);
    }
    //计算序列所代表的点群的包围球
    static computeBoundingSphereByTypedArray(array){
        let boundingSphere=new THREE.Sphere();
        let vector = new THREE.Vector3();
        return (()=> {
            let xs=0,ys=0,zs=0,il=array.length / 3;
            for (let i = 0; i < il; i++) {
                xs+= array[i * 3];
                ys+= array[i * 3 + 1];
                zs+= array[i * 3 + 2];
            }
            let center=new THREE.Vector3(xs/il,ys/il,zs/il);
            let maxRadiusSq = 0;
            for (let i = 0; i < il; i++) {
                vector.x = array[i * 3];
                vector.y = array[i * 3 + 1];
                vector.z = array[i * 3 + 2];
                let len=center.distanceTo(vector);
                maxRadiusSq = Math.max(maxRadiusSq,len );
            }
            boundingSphere.center.copy(center);
            boundingSphere.radius = maxRadiusSq;
            if (isNaN(boundingSphere.radius)) {
                console.warn('jUtils.computeBoundingSphereByTypedArray(): Computed radius is NaN. The "array"  is likely to have NaN values.');
            } else {
                return boundingSphere;
            }
        })();
    }
    //创建圆
    static createCirclePoints(matrix,radius=1,startAngle=0,endAngle=Math.PI*2,segments=36){
        let delta=(endAngle-startAngle)/segments;
        let g=[];
        for(let i=0;i<segments+1;i++){
            let x=radius*Math.cos(startAngle+delta*i);
            let y=radius*Math.sin(startAngle+delta*i);
            g.push(matrix?new THREE.Vector3(x,y,0).applyMatrix4(matrix):new THREE.Vector3(x,y,0));
        }
        return g;
    }
    //创建圆弧
    static createArcBy3Points(pStart,pMid,pEnd,segments=36){
        let c=jUtils.triangleCircumcircle(pStart,pMid,pEnd);
        let center=c.center;
        let vX=new THREE.Vector3().subVectors(pStart,center).normalize();
        let vZ=new THREE.Vector3().copy(c.normal);
        let vY=new THREE.Vector3().crossVectors(vZ,vX).normalize();
        let vT=new THREE.Vector3().copy(center);
        let trsMatrix=jUtils.makeMatrix4ByVector3(vX,vY,vZ,vT);
        let vE=new THREE.Vector3().subVectors(pEnd,center);
        let vM=new THREE.Vector3().subVectors(pMid,center);
        let tempAngle=Math.abs(vX.angleTo(vE));
        let scm=new THREE.Vector3().crossVectors(vX,vM).normalize();
        let sce=new THREE.Vector3().crossVectors(vX,vE).normalize();
        if(!jUtils.pcsEqual(scm,sce,jUtils.T.vc3)){
            tempAngle=Math.PI*2-tempAngle;
        }
        return jUtils.createCirclePoints(trsMatrix,c.radius,0,tempAngle,segments);
    }
    //根据中心点，法线点，半径点计算圆弧顶点
    static computeArcPointsByCNR(vc,vr,vn,r,segments,startAngle,endAngle){
        let az=new THREE.Vector3().subVectors(vn,vc).normalize();
        let ax=new THREE.Vector3().subVectors(vr,vc).normalize();
        let ay=new THREE.Vector3().crossVectors(az,ax).normalize();
        az.crossVectors(ax,ay).normalize();
        let mat=jUtils.makeMatrix4ByVector3(ax,ay,az,vc);
        let vs=[];
        let ua=(endAngle-startAngle)/(segments-1);
        for(let i=0;i<segments;i++){
            let x=r*Math.cos(startAngle+ua*i);
            let y=r*Math.sin(startAngle+ua*i);
            vs.push(new THREE.Vector3(x,y,0).applyMatrix4(mat));
        }
        return vs;
    }
    //根据中心点，圆上2点计算圆弧顶点
    static computeArcPointsByCPP(vc,v1,v2,segments,startAngle,endAngle){
        let dir1=new THREE.Vector3().subVectors(v1,vc).normalize();
        let dir2=new THREE.Vector3().subVectors(v2,vc).normalize();
        let vz=new THREE.Vector3().crossVectors(dir1,dir2).normalize();
        let vx=new THREE.Vector3().copy(dir1);
        let vy=new THREE.Vector3().crossVectors(vz,vx).normalize();
        vz.crossVectors(vx,vy).normalize();
        let mat=jUtils.makeMatrix4ByVector3(vx,vy,vz,vc);
        let vs=[];
        let ua=(endAngle-startAngle)/(segments-1);
        let r=vc.distanceTo(v1);
        for(let i=0;i<segments;i++){
            let x=r*Math.cos(startAngle+ua*i);
            let y=r*Math.sin(startAngle+ua*i);
            vs.push(new THREE.Vector3(x,y,0).applyMatrix4(mat));
        }
        return vs;
    }
    //取中间值
    static clamp( value, min, max ) {
        return Math.max( min, Math.min( max, value ) );
    }
    //克隆gltf模型包
    static cloneGLTF(gltf){
        let clone = {
            animations: gltf.animations,
            scene: gltf.scene.clone(true)
        };
        let skinnedMeshes = {};
        gltf.scene.traverse(node => {
            if (node.isSkinnedMesh) {
                skinnedMeshes[node.name] = node;
            }
        });
        let cloneBones = {};
        let cloneSkinnedMeshes = {};
        clone.scene.traverse(node => {
            if (node.isBone) {
                cloneBones[node.name] = node;
            }
            if (node.isSkinnedMesh) {
                cloneSkinnedMeshes[node.name] = node;
            }
        });
        for (let name in skinnedMeshes) {
            let skinnedMesh = skinnedMeshes[name];
            let skeleton = skinnedMesh.skeleton;
            let cloneSkinnedMesh = cloneSkinnedMeshes[name];
            let orderedCloneBones = [];
            for (let i = 0; i < skeleton.bones.length; ++i) {
                let cloneBone = cloneBones[skeleton.bones[i].name];
                orderedCloneBones.push(cloneBone);
            }
            cloneSkinnedMesh.bind(
                new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses),
                cloneSkinnedMesh.matrixWorld);
        }
        return clone;
    }
    //度转换为弧度
    static degreeToRadian(degree) {
        let r = Number.parseFloat(degree);
        if (Number.isNaN(r))return 0;
        return r * jUtils.DEGToRAD;
    }
    //根据对角线计算菱形面积
    static diamondAreaInDiagonal(diagonal1, diagonal2) {
        return diagonal1 * diagonal2 / 2;
    }
    //点到三角面的距离线段
    static distanceOfPointAndTriangle(point, triangle) {
        let toPlane = jUtils.verticalLineOfPlaneAndPoint(triangle.plane, point);
        let closestPoint = new THREE.Vector3().copy(toPlane.start);
        if (jUtils.ifPointInTriangle(triangle.a, triangle.b, triangle.c, closestPoint)){
            return toPlane;
        }
        return jUtils.closestPointOfPointsAndPoint(point,[triangle.a,triangle.b,triangle.c,triangle.a]).line;
    }
    //点到线段的最近距离线段
    static distanceOfPointAndLineSegment(Point, line) {
        let point = Point;
        let start = line.start;
        let end = line.end;
        let tempLine = jUtils.verticalLineOfLineAndPoint(point, start, end);
        let closestPoint = new THREE.Vector3().copy(tempLine.start);
        if (jUtils.ifPointOnLine(closestPoint, start, end)) {
            return tempLine;
        } else {
            let disA = point.distanceTo(start);
            let disB = point.distanceTo(end);
            return (disA > disB) ? new Line(end, point) : new Line(start, point);
        }
    }
    //10进制到26进制
    static decimalConvertToABC(n){
        let str='';
        while (n>0){
            let m=n%26;
            if(m===0)m=26;
            str=String.fromCodePoint(m+64)+str;
            n=(n-m)/26;
        }
        return str;
    }
    //舍取数字为小数显示精度
    static decNumber(number,DEC){
        let dec=DEC?DEC:jUtils.DEC;
        let decN=dec;
        let temp=dec.toString();
        let l=temp.length;
        let dl=temp.indexOf(".");
        dl=dl===-1?0:dl;
        let dc=Math.pow(10,l-dl-1);
        let count=Math.round(number/decN)*decN;
        return Math.round(count*dc)/dc;
    }
    //点到向量的距离和距离点
    static distanceOfPointToVector(v,vs,ve){
        let dv=new THREE.Vector3().subVectors(v,vs);
        let de=new THREE.Vector3().subVectors(ve,vs);
        dv.projectOnVector(de).add(vs);
        return {distance:v.distanceTo(dv),point:dv};
    }
    //获取嵌套数组所有元素
    static decomposeArray(array){
        let temp=[];
        let dps=(array,targetArray)=>{
            for(let i=0;i<array.length;i++){
                let tp=array[i];
                if(!(tp instanceof Array)||typeof (tp)==='string'){
                    targetArray.push(tp);
                }else{
                    dps(tp,targetArray);
                }
            }
        };
        dps(array,temp);
        return temp;
    }
    //代表任意线的点序列的比例分点
    static dividePointOfPoints(ratio,points){
        let lengths=jUtils.pointsEveryLength(points);
        let length=lengths[lengths.length-1];
        let len=length*jUtils.clamp(ratio,0,1);
        for(let i=0;i<lengths.length;i++){
            if(lengths[i]===len){
                return new THREE.Vector3().copy(points[i]);
            }else if(lengths[i]>len&&lengths[i-1]<len){
                let rat=(lengths[i]-len)/(lengths[i]-lengths[i-1]);
                let dir=new THREE.Vector3().subVectors(points[i-1],points[i]);
                return dir.multiplyScalar(rat).add(points[i]);
            }
        }
        return null;
    }
    //指数函数,e的x次方
    static exp(x) {
        let r = Number.parseFloat(x);
        if (Number.isNaN(r))return 0;
        return Math.pow(jUtils.e, r);
    }
    //按指数函数衰减或递增
    static exponentAttenuate(rat,start,end,isIncrease=true){
        let x=jUtils.clamp(rat,0,1)*(end-start)+start;
        let exp=(v)=>{
            if(isIncrease){
                return Math.pow(jUtils.e,v);
            }else{
                return Math.pow(jUtils.e,-v);
            }
        };
        let a=exp(start);
        let b=exp(end);
        let ma=Math.max(a,b);
        let mi=Math.min(a,b);
        let cu=exp(x);
        return (cu-mi)/(ma-mi);
    }
    //0及正数的阶乘
    static factorial(n) {
        let result = undefined;
        if (n === 0) result = 1;
        if (n === 0.5) result = 0.886226925;
        if (n > 0.5 && n < 1) result = (1 + Math.sin(n * Math.PI) / (1.4 + 25 * n)) * Math.pow(n, 0.55 * n);
        if (n > 0 && n < 0.5) {
            let N = 1 - n;
            let V = jUtils.factorial(N);
            result = (N * n * Math.PI) / (V * Math.sin(n * Math.PI));
        }
        if (n === 1) result = 1;
        if (n > 1 && n % 1 !== 0) {
            result = n * jUtils.factorial(n - 1);
        }
        if (n > 1 && n % 1 === 0) {
            result = n * jUtils.factorial(n - 1);
        }
        if (n < 0) result = '无效';
        return result;
    }
    //查找任意个连续元素的首次出现位置
    static findElementsPosition(array,...es){
        for(let i=0;i<array.length;i++){
            if(array[i]===es[0]){
                let ok=true;
                for(let j=1;j<es.length;j++){
                    if(array[i+j]===undefined){
                        return -1;
                    }else if(es[j]!==array[i+j]){
                        ok=false;
                        break;
                    }
                }
                if(ok)return i;
            }
        }
        return -1;
    }
    //将正整数转化为字母表示(A,B,C,A1,B1...)
    static getStringByNumber(number){
        let n=number;
        let n1=Math.floor(n/26);
        let s1=n1===0?'':''+n1+'';
        n=number+1;
        let n2=n%26===0?26:n%26;
        let s2=jUtils.decimalConvertToABC(n2);
        return s2+s1;
    }
    //获取矩阵的X轴
    static getXOfMatrix(matrix){
        let v=new THREE.Vector3();
        v.x=matrix.elements[0];
        v.y=matrix.elements[1];
        v.z=matrix.elements[2];
        return v;
    }
    //获取矩阵的Y轴
    static getYOfMatrix(matrix){
        let v=new THREE.Vector3();
        v.x=matrix.elements[4];
        v.y=matrix.elements[5];
        v.z=matrix.elements[6];
        return v;
    }
    //获取矩阵的Z轴
    static getZOfMatrix(matrix){
        let v=new THREE.Vector3();
        v.x=matrix.elements[8];
        v.y=matrix.elements[9];
        v.z=matrix.elements[10];
        return v;
    }
    //获取矩阵的平移
    static getTOfMatrix(matrix){
        let v=new THREE.Vector3();
        v.x=matrix.elements[12];
        v.y=matrix.elements[13];
        v.z=matrix.elements[14];
        return v;
    }
    //获取圆柱顶点及面
    static getCylinderGeometryInfo(rb=1,rt=1,h=1,segments=36){
        let vts=[];
        let vbs=[];
        let fs=[];
        let ua=Math.PI*2/segments;
        for(let i=0;i<segments;i++){
            let ca=ua*i;
            let cos=Math.cos(ca);
            let sin=Math.sin(ca);
            if(rt!==0) {
                let x = cos * rt;
                let y = sin * rt;
                vts.push(new THREE.Vector3(x, h / 2, y));
            }
            if(rb!==0) {
                let x = cos * rb;
                let y = sin * rb;
                vbs.push(new THREE.Vector3(x, -h / 2, y));
            }
        }
        let vs=[];
        vs.push(new THREE.Vector3(0,-h/2,0));
        vs.push(...vbs);
        vs.push(...vts);
        vs.push(new THREE.Vector3(0,h/2,0));
        for(let i=0;i<vbs.length;i++){
            let j=i+1;
            if(i===vbs.length-1)j=0;
            let a=new THREE.Vector3().subVectors(vs[i+1],vs[0]);
            let b=new THREE.Vector3().subVectors(vs[j+1],vs[0]);
            let n=new THREE.Vector3().crossVectors(a,b);
            fs.push(new THREE.Face3(i+1,j+1,0,n));
        }
        for(let i=0;i<vts.length;i++){
            let j=i+1;
            if(i===vts.length-1)j=0;
            let a=new THREE.Vector3().subVectors(vs[j+segments+1],vs[vs.length-1]);
            let b=new THREE.Vector3().subVectors(vs[i+segments+1],vs[vs.length-1]);
            let n=new THREE.Vector3().crossVectors(a,b);
            fs.push(new THREE.Face3(j+segments+1,i+segments+1,vs.length-1,n));
        }
        if(vbs.length!==0) {
            for (let i = 0; i < vbs.length; i++) {
                let j = i + 1;
                if (i === vbs.length - 1) j = 0;
                if (vts.length === 0) {
                    let a=new THREE.Vector3().subVectors(vs[j+1],vs[0]).normalize();
                    let b=new THREE.Vector3().subVectors(vs[i+1],vs[0]).normalize();
                    let c=new THREE.Vector3().addVectors(a,b).normalize();
                    fs.push(new THREE.Face3(j + 1, i + 1, vs.length - 1,[a,b,c]));
                } else {
                    let a=new THREE.Vector3(vs[j + 1].x,0,vs[j + 1].z).normalize();
                    let b=new THREE.Vector3(vs[i + 1].x,0,vs[i + 1].z).normalize();
                    let c=new THREE.Vector3(vs[i + segments + 1].x,0,vs[i + segments + 1].z).normalize();
                    fs.push(new THREE.Face3(j + 1, i + 1, i + segments + 1,[a,b,c]));
                    a=new THREE.Vector3(vs[j + segments + 1].x,0,vs[j + segments + 1].z).normalize();
                    b=new THREE.Vector3(vs[j + 1].x,0,vs[j + 1].z).normalize();
                    c=new THREE.Vector3(vs[i + segments + 1].x,0,vs[i + segments + 1].z).normalize();
                    fs.push(new THREE.Face3(j + segments + 1, j + 1, i + segments + 1,[a,b,c]));
                }
            }
        }else{
            for(let i=0;i<vts.length;i++){
                let j=i+1;
                if(i===vts.length-1)j=0;
                let a=new THREE.Vector3().subVectors(vs[j+1],vs[vs.length-1]).normalize();
                let b=new THREE.Vector3().subVectors(vs[i+1],vs[vs.length-1]).normalize();
                let c=new THREE.Vector3().addVectors(a,b).normalize();
                fs.push(new THREE.Face3(0,j+1,i+1,[a,b,c]));
            }
        }
        return {vertices:vs,faces:fs};
    }
    //根据uuid获取场景物体
    static getObjectByUuid(scene,uuid){
        let target=undefined;
        scene.children.forEach((o)=>{
            if(o.uuid!==undefined&&o.uuid===uuid)target=o;
        });
        return target;
    }
    //获取点序列的平均拟合平面
    static getPlaneOfPoints(points){
        let pa=new THREE.Vector3(0,0,0);
        for(let p of points){
            pa.add(p);
        }
        pa.divideScalar(points.length);
        let normal=jUtils.computeAverageNormalOfPointSequence(points);
        return new Plane(normal,pa);
    }
    //获取点到参数方程曲线点集最近点的参数值
    static getClosestTOfPointAndPoints(v,vs,trsMatrix,max=5,min=-5,count=50) {
        let dT = (max - min) / count;
        let vertices = [];
        for (let i = 0; i < vs.length; i++) {
            vertices.push(new THREE.Vector3().copy(vs[i]).applyMatrix4(trsMatrix));
        }
        let info = jUtils.closestPointOfPointsAndPoint(v, vertices);
        let pP = info.line.start;
        let tolL = vertices[info.previous].distanceTo(vertices[info.next]);
        let pL = vertices[info.previous].distanceTo(pP);
        let r = pL / tolL;
        return {t: min + dT * info.previous + dT * r, previous: info.previous, next: info.next};
    }
    //获取点在代表参数曲线的点序列上的位置参数
    static getCurTOfParaLine(tMin,tMax,point,points,worldMatrix,returnInfo=false){
        let count=points.length-1;
        if(count<1){
            console.warn('the vertices of line cannot be less than 2');
            return;
        }
        let p=new THREE.Vector3().copy(point);
        if(worldMatrix){
            p.applyMatrix4(new THREE.Matrix4().getInverse(worldMatrix));
        }
        let info=jUtils.closestPointOfPointsAndPoint(p,points);
        let dT=(tMax-tMin)/count;
        let pre=points[info.previous];
        let nxt=points[info.next];
        let cp=info.line.start;
        let tol=pre.distanceTo(nxt);
        let l=pre.distanceTo(cp);
        let rat=l/tol;
        return returnInfo?{t:tMin+info.previous*dT+dT*rat,dt:dT}:tMin+info.previous*dT+dT*rat;
    }
    //获取两点在闭合曲线上的最近距离线（点集）
    static getClosestLineOfCircleLine(linePoints,sPrevious,start,sNext,ePrevious,end,eNext){
        let g=[];
        let l=0;
        if(sNext===eNext){
            g.push(start,end);
            l=start.distanceTo(end);
        }else if(sNext<eNext){
            let tolLs=jUtils.pointsEveryLength(linePoints);
            let tolL=tolLs[tolLs.length-1];
            let ps=[];
            for(let i=sNext;i<eNext;i++){
                ps.push(linePoints[i]);
            }
            ps.unshift(start);
            ps.push(end);
            let pLs=jUtils.pointsEveryLength(ps);
            let pL=pLs[pLs.length-1];
            if(pL>tolL/2){
                for(let i=sPrevious;i>=0;i--){
                    g.push(linePoints[i]);
                }
                for(let i=linePoints.length-1;i>=eNext;i--){
                    g.push(linePoints[i]);
                }
                g.unshift(start);
                g.push(end);
                l=tolL-pL;
            }else{
                g=ps;
                l=pL;
            }
        }else{
            let tolLs=jUtils.pointsEveryLength(linePoints);
            let tolL=tolLs[tolLs.length-1];
            let ps=[];
            for(let i=sPrevious;i>ePrevious;i--){
                ps.push(linePoints[i]);
            }
            ps.unshift(start);
            ps.push(end);
            let pLs=jUtils.pointsEveryLength(ps);
            let pL=pLs[pLs.length-1];
            if(pL>tolL/2){
                for(let i=sNext;i<linePoints.length;i++){
                    g.push(linePoints[i]);
                }
                for(let i=0;i<eNext;i++){
                    g.push(linePoints[i]);
                }
                g.unshift(start);
                g.push(end);
                l=tolL-pL;
            }else{
                g=ps;
                l=pL;
            }
        }
        return {points:g,length:l};
    }
    //获取圆geometry或顶点集
    static getCircleGeometry(radius,startAngle,endAngle,segments,returnGeometry=true){
        let delta=(endAngle-startAngle)/segments;
        if(returnGeometry) {
            let g = new THREE.Geometry();
            for (let i = 0; i < segments + 1; i++) {
                let ca=startAngle+delta * i;
                let x = radius * Math.cos(ca);
                let y = radius * Math.sin(ca);
                g.vertices.push(new THREE.Vector3(x, y, 0));
            }
            return g;
        }else{
            let g = [];
            for (let i = 0; i < segments + 1; i++) {
                let ca=startAngle+delta * i;
                let x = radius * Math.cos(ca);
                let y = radius * Math.sin(ca);
                g.push(new THREE.Vector3(x, y, 0));
            }
            return g;
        }
    }
    //获取圆面geometry或信息
    static getCirclePlaneGeometry(radius,startAngle,endAngle,segments,hasCenter=true,returnGeometry=true){
        let uAngle=(endAngle-startAngle)/segments;
        let vs=[];
        let fs=[];
        for (let i = 0; i < segments + 1; i++) {
            let ca=startAngle+uAngle * i;
            let x = radius * Math.cos(ca);
            let y = radius * Math.sin(ca);
            vs.push(new THREE.Vector3(x, y, 0));
        }
        if(hasCenter)vs.push(new THREE.Vector3(0,0,0));
        for(let i=0;i<vs.length-2;i++){
            let j=i+1;
            let k=vs.length-1;
            let a=new THREE.Vector3().subVectors(vs[k],vs[i]);
            let b=new THREE.Vector3().subVectors(vs[j],vs[i]);
            let n=new THREE.Vector3().crossVectors(a,b).normalize();
            fs.push(new THREE.Face3(i,k,j,n));
        }
        if(returnGeometry){
            let temp=new THREE.Geometry();
            temp.vertices=vs;
            temp.faces=fs;
            return temp;
        }else{
            return {vertices:vs,faces:fs};
        }
    }
    //获取父场景
    static getParentScene(obj){
        let _obj=obj;
        while (_obj.parent){
            _obj=_obj.parent;
            if(_obj instanceof THREE.Scene)return _obj;
        }
        return null;
    }
    //获取圆的一般方程DEF
    static getGenEqOfCircle(center,radius){
        let d=-2*center.x;
        let e=-2*center.y;
        let f=(d*d+e*e-4*radius*radius)*0.25;
        return {D:d,E:e,F:f};
    }
    //根据一般方程获取两圆交点方程x，y值
    static getCircleIntXY(geA,geB,pcs=0.0001){
        let D=geA.D,E=geA.E,F=geA.F;
        let d=geB.D,e=geB.E,f=geB.F;
        let a=D-d===0?pcs:D-d;
        let b=E-e===0?pcs:E-e;
        let c=F-f===0?pcs:F-f;
        let m=-a/b,n=-c/b;
        let h=-b/a,k=-c/a;
        let m2=m*m+1;
        let ed2=Math.pow(E*m+2*m*n+D,2);
        let ef4=4*m2*(n*n+E*n+F);
        let ed3=E*m+2*m*n+D;
        let sq = Math.sqrt(ed2 - ef4);
        if(Number.isNaN(sq)||Number.isNaN(sq))return false;
        let x1 = -(sq + ed3) / (2 * m2);
        let x2 = (sq - ed3) / (2 * m2);
        let h2=h*h+1;
        let de2=Math.pow(D*h+E+2*h*k,2);
        let df4=4*h2*(D*k+F+k*k);
        let de3=D*h+2*h*k+E;
        sq = Math.sqrt(de2 - df4);
        if(Number.isNaN(sq)||Number.isNaN(sq))return false;
        let y1 = -(sq + de3) / (2 * h2);
        let y2 = (sq - de3) / (2 * h2);
        return {nx:x1,px:x2,ny:y1,py:y2};
    }
    //根据交点方程xy值获取两圆交点
    static getCircleInt(x1,x2,y1,y2,d,e,f) {
        let int1=undefined, int2=undefined;
        let check=(x,y)=>{
            return jUtils.pcsEqual(x*x+y*y+d*x+e*y+f,0,jUtils.T.num);
        };
        if(check(x1,y1)){
            int1=new THREE.Vector2(x1,y1);
            int2=new THREE.Vector2(x2,y2);
        }else{
            int1=new THREE.Vector2(x2,y1);
            int2=new THREE.Vector2(x1,y2);
        }
        return [int1, int2];
    }
    //16进制字符串转为RGB颜色
    static hexStringToRGBColor(hexString) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
        let rgba=result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
        if(rgba===null)return new THREE.Color(0.0,0.0,0.0);
        return new THREE.Color(rgba.r / 255,rgba.g / 255,rgba.b / 255);
    }
    //四面体内切球
    static inscribedSphereOfTetrahedron(p1, p2, p3, p4) {
        let xCenter, yCenter, zCenter;
        let sc1 = jUtils.triangleArea(p2, p3, p4);
        let sc2 = jUtils.triangleArea(p1, p3, p4);
        let sc3 = jUtils.triangleArea(p1, p2, p4);
        let sc4 = jUtils.triangleArea(p1, p2, p3);
        let sc = sc1 + sc2 + sc3 + sc4;
        xCenter = (sc1 * p1.x + sc2 * p2.x + sc3 * p3.x + sc4 * p4.x) / sc;
        yCenter = (sc1 * p1.y + sc2 * p2.y + sc3 * p3.y + sc4 * p4.y) / sc;
        zCenter = (sc1 * p1.z + sc2 * p2.z + sc3 * p3.z + sc4 * p4.z) / sc;
        let center = new THREE.Vector3(xCenter, yCenter, zCenter);
        let plane = jUtils.planeBy3Points(p1, p2, p3);
        let radius = jUtils.verticalLineOfPlaneAndPoint(plane, center).length;
        return new Sphere(radius, center);
    }
    //计算两个平面的交线
    static intersectLineOfTwoPlane(plane1, plane2) {
        let n1 = new THREE.Vector3().copy(plane1.normal);
        let n2 = new THREE.Vector3().copy(plane2.normal);
        let crs = new THREE.Vector3().crossVectors(n1, n2);
        if (jUtils.pcsEqual(crs, new THREE.Vector3(0, 0, 0), jUtils.T.vc3)) {
            return new Line(plane1.onepoint, plane2.onepoint);
        }
        let nTarget = new THREE.Vector3().crossVectors(n1, n2).normalize();
        let s1 = plane1.implicitParameter_d;
        let s2 = plane2.implicitParameter_d;
        let p1 = n1.dot(n2) * s2;
        let p2 = Math.pow(n2.length(), 2) * s1;
        let p3 = Math.pow(n1.dot(n2), 2);
        let p4 = Math.pow(n1.length(), 2) * Math.pow(n2.length(), 2);
        let parameterA = (p1 - p2) / (p3 - p4);
        p1 = n1.dot(n2) * s1;
        p2 = Math.pow(n1.length(), 2) * s2;
        let parameterB = (p1 - p2) / (p3 - p4);
        let startPoint = new THREE.Vector3().copy(n1).multiplyScalar(parameterA);
        startPoint.add(new THREE.Vector3().copy(n2).multiplyScalar(parameterB));
        return new Line(startPoint, new THREE.Vector3().addVectors(startPoint, nTarget));
    }
    //点是否在线段上
    static ifPointOnLine(point, start, end,customPrecision=false) {
        let sp = start.distanceTo(point);
        let pe = end.distanceTo(point);
        let se = start.distanceTo(end);
        return jUtils.pcsEqual(sp + pe, se, jUtils.T.num,customPrecision);
    }
    //判断点是否在三角形内部
    static ifPointInTriangle(a, b, c, p) {
        let v0 = new THREE.Vector3().subVectors(c, a);
        let v1 = new THREE.Vector3().subVectors(b, a);
        let v2 = new THREE.Vector3().subVectors(p, a);
        let d00, d01, d02, d11, d12;
        d00 = v0.dot(v0);
        d01 = v0.dot(v1);
        d02 = v0.dot(v2);
        d11 = v1.dot(v1);
        d12 = v1.dot(v2);
        let u = Math.round(((d11 * d02 - d12 * d01) / (d00 * d11 - d01 * d01)) * jUtils.precision) / jUtils.precision;
        if (u < 0 || u > 1)return false;
        let v = Math.round(((d12 * d00 - d01 * d02) / (d00 * d11 - d01 * d01)) * jUtils.precision) / jUtils.precision;
        if (v < 0 || v > 1)return false;
        return u + v <= 1;
    }
    //判断两条由两点所代表的线段是否相交
    static ifTwoLinesIntersect2D(l1, l2) {
        let a =l1[0];
        let b =l1[1];
        let c =l2[0];
        let d =l2[1];
        if (jUtils.pcsEqual(a, c, jUtils.T.vc3) || jUtils.pcsEqual(a, d, jUtils.T.vc3))return false;
        if (jUtils.pcsEqual(b, c, jUtils.T.vc3) || jUtils.pcsEqual(b, d, jUtils.T.vc3))return false;
        if (jUtils.checkColinear(a, b, c) || jUtils.checkColinear(a, b, d))return false;
        if (jUtils.checkColinear(c, d, a) || jUtils.checkColinear(c, d, b))return false;
        let dir=new THREE.Vector3();
        let d1=new THREE.Vector3();
        let d2=new THREE.Vector3();
        let crs1=new THREE.Vector3();
        let crs2=new THREE.Vector3();
        dir.subVectors(b, a);
        d1.subVectors(c, a);
        d2.subVectors(d, a);
        crs1.crossVectors(d1, dir).normalize();
        crs2.crossVectors(d2, dir).normalize();
        if (!jUtils.pcsEqual(crs1, new THREE.Vector3().copy(crs2).negate(), jUtils.T.vc3))return false;
        dir.subVectors(d, c);
        d1.subVectors(a, c);
        d2.subVectors(b, c);
        crs1.crossVectors(d1, dir).normalize();
        crs2.crossVectors(d2, dir).normalize();
        return jUtils.pcsEqual(crs1, new THREE.Vector3().copy(crs2).negate(), jUtils.T.vc3);
    }
    //元素是否在元素序列中
    static ifElementInElements(e, es, isreturn=false, type) {
        for (let i = 0; i < es.length; i++) {
            if (jUtils.pcsEqual(e, es[i], type)) {
                return (isreturn ? i : true);
            }
        }
        return (isreturn ? undefined : false);
    }
    //检测字符串是否是数字
    static ifStringIsNumber(str) {
        if(str.charAt(0)==='.'||str.charAt(str.length-1)==='.')return false;
        let reg = /[0-9]/g;
        let tp=str;
        tp=tp.replace(reg,'');
        return (tp===''||tp==='.');
    }
    //点是否在3D包围盒中
    static ifPointIn3DAABB(point, boundMax, boundMin) {
        if (point.x < boundMin.x || point.x > boundMax.x)return false;
        if (point.y < boundMin.y || point.y > boundMax.y)return false;
        return !(point.z < boundMin.z || point.z > boundMax.z);
    }
    //点是否在2D包围盒中
    static ifPointIn2DAABB(point, boundMax, boundMin) {
        if (point.x < boundMin.x || point.x > boundMax.x)return false;
        return !(point.y < boundMin.y || point.y > boundMax.y);
    }
    //线是否与平面相交且交点在规定包围盒中
    static ifLineIntersect2DAABB(line, plane, AABB) {
        let rp0 =line.start;
        let rd =line.direction;
        let rt = 0;
        let pn =plane.normal;
        let pd = plane.implicitParameter_d;
        let DDotN = rd.dot(pn);
        if (DDotN === 0) {
            return false;
        } else if (DDotN < 0) {
            rt = (pd - rp0.dot(pn)) / DDotN;
        } else {
            rp0 =line.end;
            rd.negate();
            rt = (pd - rp0.dot(pn)) / (rd.dot(pn));
        }
        if (Math.abs(rt) > line.length)return false;
        let intersection = rd.multiplyScalar(rt).add(rp0);
        return jUtils.checkPointIn2DAABB(intersection, AABB, true);
    }
    //检测线段是否与三角面相交
    static ifLineIntersectTriangle(line, triangle) {
        if (!(triangle instanceof Triangle)) {
            console.warn('Type error,the triangle should be type of JORScripts.FunctionalExpression.triangle');
            return false;
        }
        let plane = triangle.plane;
        let rp0 =line.start;
        let rd = line.direction;
        let rt = 0;
        let pn = plane.normal;
        let pd = plane.implicitParameter_d;
        let DDotN = rd.dot(pn);
        if (DDotN === 0) {
            return false;
        } else if (DDotN < 0) {
            rt = (pd - rp0.dot(pn)) / DDotN;
        } else {
            rp0 =line.end;
            rd.negate();
            rt = (pd - rp0.dot(pn)) / (-DDotN);
        }
        if (Math.abs(rt) > line.length || rt < 0)return false;
        let intersection = rd.multiplyScalar(rt).add(rp0);
        return jUtils.ifPointInTriangle(triangle.a, triangle.b, triangle.c, intersection);
    }
    //检测线段是否与包围盒相交
    static ifLineIntersect3DAABB(lineStart, lineEnd, boundMax, boundMin) {
        if (jUtils.ifPointIn3DAABB(lineStart, boundMax, boundMin))return true;
        if (jUtils.ifPointIn3DAABB(lineEnd, boundMax, boundMin))return true;
        let AABB = new AABB3D(boundMax, boundMin);
        let lineMaxMin = jUtils.computeBoundMaxAndMin([lineStart, lineEnd], 0);
        let lineAABB = new AABB3D(lineMaxMin.max, lineMaxMin.min);
        if (!jUtils.checkAABBIntersectAABB(AABB, lineAABB, true))return false;
        let line = new Line(lineStart, lineEnd);
        if (jUtils.ifLineIntersect2DAABB(line, AABB.upPlane, AABB.upAABB))return true;
        if (jUtils.ifLineIntersect2DAABB(line, AABB.downPlane, AABB.downAABB))return true;
        if (jUtils.ifLineIntersect2DAABB(line, AABB.leftPlane, AABB.leftAABB))return true;
        if (jUtils.ifLineIntersect2DAABB(line, AABB.rightPlane, AABB.rightAABB))return true;
        if (jUtils.ifLineIntersect2DAABB(line, AABB.frontPlane, AABB.frontAABB))return true;
        return jUtils.ifLineIntersect2DAABB(line, AABB.backPlane, AABB.backAABB);
    }
    //检测平面是否与包围盒相交
    static ifPlaneIntersect3DAABB(plane, boundMax, boundMin) {
        if (!(plane instanceof Plane)) {
            console.warn('Type error,plane should be type of jUtils.plane');
            return false;
        }
        let AABB = new AABB3D(boundMax, boundMin);
        let temp = jUtils.verticalLineOfPlaneAndPoint(plane, AABB.FRU).direction;
        if(!jUtils.pcsEqual(temp,jUtils.verticalLineOfPlaneAndPoint(plane, AABB.FRB).direction,jUtils.T.vc3))return true;
        if(!jUtils.pcsEqual(temp,jUtils.verticalLineOfPlaneAndPoint(plane, AABB.FLU).direction,jUtils.T.vc3))return true;
        if(!jUtils.pcsEqual(temp,jUtils.verticalLineOfPlaneAndPoint(plane, AABB.FLB).direction,jUtils.T.vc3))return true;
        if(!jUtils.pcsEqual(temp,jUtils.verticalLineOfPlaneAndPoint(plane, AABB.BRU).direction,jUtils.T.vc3))return true;
        if(!jUtils.pcsEqual(temp,jUtils.verticalLineOfPlaneAndPoint(plane, AABB.BRB).direction,jUtils.T.vc3))return true;
        if(!jUtils.pcsEqual(temp,jUtils.verticalLineOfPlaneAndPoint(plane, AABB.BLU).direction,jUtils.T.vc3))return true;
        if(!jUtils.pcsEqual(temp,jUtils.verticalLineOfPlaneAndPoint(plane, AABB.BLB).direction,jUtils.T.vc3)){
            return true;
        }else {
            return false;
        }
    }
    //检测三角面是否与包围盒相交
    static ifTriangleIntersect3DAABB(triangle, boundMax, boundMin) {
        let triRange = jUtils.computeBoundMaxAndMin([triangle.a, triangle.b, triangle.c], 0);
        let triAABB = new AABB3D(triRange.max, triRange.min);
        let AABB = new AABB3D(boundMax, boundMin);
        if (!jUtils.checkAABBIntersectAABB(triAABB, AABB, true))return false;
        if (jUtils.ifPointIn3DAABB(triangle.a, boundMax, boundMin))return true;
        if (jUtils.ifPointIn3DAABB(triangle.b, boundMax, boundMin))return true;
        if (jUtils.ifPointIn3DAABB(triangle.c, boundMax, boundMin))return true;
        if (jUtils.ifLineIntersect3DAABB(triangle.a, triangle.b, boundMax, boundMin))return true;
        if (jUtils.ifLineIntersect3DAABB(triangle.b, triangle.c, boundMax, boundMin))return true;
        if (jUtils.ifLineIntersect3DAABB(triangle.c, triangle.a, boundMax, boundMin))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.FU, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.FB, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.FL, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.FR, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.BU, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.BB, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.BL, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.BR, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.LU, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.LB, triangle))return true;
        if (jUtils.ifLineIntersectTriangle(AABB.RU, triangle))return true;
        return jUtils.ifLineIntersectTriangle(AABB.RB, triangle);
    }
    //代表两条多段线的顶点序列（世界坐标系）的交点集
    static intersectionsOf2Spline(ps1,ps2,index=false){
        let ints=[];
        let line1=new Line();
        let line2=new Line();
        for(let i=0;i<ps1.length-1;i++){
            for(let j=0;j<ps2.length-1;j++){
                line1.set(ps1[i],ps1[i+1]);
                line2.set(ps2[j],ps2[j+1]);
                let temp=jUtils.closestPointsOf2LinesIn3D(line1,line2);
                if(jUtils.pcsEqual(temp.length,0,jUtils.T.num)){
                    if(jUtils.ifPointOnLine(temp.start,line1.start,line1.end)&&jUtils.ifPointOnLine(temp.start,line2.start,line2.end)) {
                        ints.push(temp.start);
                        if(index!==false){
                            if(index<=ints.length-1){
                                return ints;
                            }
                        }
                    }
                }
            }
        }
        return ints;
    }
    //代表多段线的顶点序列（世界坐标系）与Mesh的交点集
    static intersectionsOfSplineSurface(points,mesh,index=false){
        let ints=[];
        let tempLine=new Line();
        for(let i=0;i<points.length-1;i++){
            tempLine.set(points[i],points[i+1]);
            let int=jUtils.lineIntersectMesh(tempLine,mesh,false);
            if(int!==false){
                ints.push(...int);
                if(index!==false){
                    if(index<=ints.length-1){
                        return ints;
                    }
                }
            }
        }
        return ints;
    }
    //判断字符串是否为颜色值#fffFFF,rgb(255,255,255),rgba(255,255,255,1.0)
    static ifStringIsColor(str){
        let reg=new RegExp(/[\s]/g);
        let _str=str.replace(reg,"");
        let reg1=new RegExp(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
        let reg2=new RegExp(/^[rR][gG][bB][\(]((2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),){2}(2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?)[\)]$/);
        let reg3=new RegExp(/^[rR][gG][bB][aA][\(]((2[0-4][0-9]|25[0-5]|[01]?[0-9][0-9]?),){3}([01]|1[\.][0]*|0[\.][0-9]*)[\)]$/);
        let bool=reg1.test(_str);
        if(!bool)bool=reg2.test(_str);
        if(!bool)bool=reg3.test(_str);
        return bool;
    }
    //组合线段序列为线顶点序列
    static joinLines(lines) {
        let points = [];
        for (let i = 0; i < lines.length; i++) {
            if (i === 0) points.push(new THREE.Vector3().copy(lines[i].start));
            points.push(new THREE.Vector3().copy(lines[i].end));
        }
        return points;
    }
    //转换弧度到0-2pi范围内
    static limitRadian(radian){
        let temp=0;
        if(Math.abs(radian)>Math.PI*2){
            if(radian>0){
                temp=radian%(Math.PI*2);
            }else{
                temp=Math.PI*2+radian%(Math.PI*2);
            }
        }else{
            if(radian>0){
                temp=radian;
            }else{
                temp=Math.PI*2+radian;
            }
        }
        return temp;
    }
    //有限面面积
    static limitedFacesArea(faces) {
        let arrayfaces = [];
        if (faces instanceof THREE.Mesh) {
            faces.geometry.faces.forEach(function (f) {
                arrayfaces.push([faces.geometry.vertices[f.a], faces.geometry.vertices[f.b], faces.geometry.vertices[f.c]]);
            });
        } else if (faces instanceof Array) {
            faces.forEach(function (face) {
                if (!(face instanceof THREE.Mesh)) {
                    console.log("列表元素类型错误，不能计算面积！");
                    return;
                }
                face.geometry.faces.forEach(function (f) {
                    arrayfaces.push([face.geometry.vertices[f.a], face.geometry.vertices[f.b], face.geometry.vertices[f.c]]);
                });
            });
        } else {
            console.log("元素类型错误，不能计算面积！");
            return;
        }
        if (arrayfaces.length === 0) {
            console.log("几何体不包含任何面，将返回0作为面积！");
            return 0;
        }
        let unitAreas = [];
        arrayfaces.forEach(function (f) {
            unitAreas.push(jUtils.triangleArea(f[0], f[1], f[2]));
        });
        return jUtils.sumArrayElements(unitAreas, jUtils.T.num);
    }
    //任意底数的对数
    static log(base, antilog) {
        if (base <= 0 || base === 1) {
            //console.log("负数,0,1为无效参数，请重新输入！");
            return;
        }
        if (base === antilog)return 1;
        if (antilog === 1)return 0;
        if (base === jUtils.e)return Math.log(antilog);
        let baseLe = Math.log(base);
        let antilogLe = Math.log(antilog);
        return antilogLe / baseLe;
    }
    //直线与直线的夹角
    static lineAngleToLine(line1, line2, isVector=true, isInDegree=false) {
        let v1 = new THREE.Vector3().subVectors(line1.end, line1.start);
        let v2 = new THREE.Vector3().subVectors(line2.end, line2.start);
        let angle = v1.angleTo(v2);
        if (!isVector) {
            angle = Math.abs(angle);
            if (angle > (Math.PI / 2)) angle = Math.PI - angle;
        }
        if (isInDegree) angle = jUtils.radianToDegree(angle);
        return angle;
    }
    //直线与平面的夹角
    static lineAngleToPlane(line, planeNormal, isVector, isInDegree) {
        let vline = new THREE.Vector3().subVectors(line.end, line.start);
        let angle = vline.angleTo(planeNormal);
        angle = Math.PI / 2 - angle;
        if (!isVector) {
            angle = Math.abs(angle);
        }
        if (isInDegree) angle = jUtils.radianToDegree(angle);
        return angle;
    }
    //限制更新频率（首执行）
    static limitUpdateRateHead(){
        let time=new Date().getTime();
        if(jUtils.timer===undefined){
            jUtils.timer=time+jUtils.Hz;
            return true;
        }else{
            if(jUtils.timer-time>0){
                return false;
            }else{
                jUtils.timer=time+jUtils.Hz;
                return true;
            }
        }
    }
    //限制更新频率（尾执行）
    static limitUpdateRateTail(){
        let time=new Date().getTime();
        if(jUtils.timer===undefined){
            jUtils.timer=time;
            return true;
        }else{
            if(time-jUtils.timer<jUtils.Hz-1){
                return false;
            }else{
                jUtils.timer=time;
                return true;
            }
        }
    }
    //线段与三角面的交点
    static lineIntersectTriangle(line, triangle) {
        let plane = triangle.plane;
        let rp0 =line.start;
        let rd = line.direction;
        let rt = undefined;
        let pn =plane.normal;
        let pd = plane.implicitParameter_d;
        let DDotN = rd.dot(pn);
        let isIntersect = true;
        if (DDotN === 0) {
            isIntersect = false;
        } else if (DDotN < 0) {
            rt = (pd - rp0.dot(pn)) / DDotN;
        } else {
            rp0 =line.end;
            rd.negate();
            rt = (pd - rp0.dot(pn)) / (-DDotN);
        }
        if (rt > line.length || rt < 0) {
            isIntersect = false;
        }
        if (isIntersect) {
            let intersection = rd.multiplyScalar(rt).add(rp0);
            if (jUtils.ifPointInTriangle(triangle.a, triangle.b, triangle.c, intersection)) {
                return intersection;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
    //线段与平面交点
    static lineIntersectPlane(line, plane) {
        let rp0 = line.start;
        let rd = line.direction;
        let rt = undefined;
        let pn = plane.normal;
        let pd = plane.implicitParameter_d;
        let DDotN = rd.dot(pn);
        if (DDotN === 0) {
            return false;
        } else if (DDotN < 0) {
            rt = (pd - rp0.dot(pn)) / DDotN;
        } else {
            rp0 =line.end;
            rd.negate();
            rt = (pd - rp0.dot(pn)) / (-DDotN);
        }
        if (rt > line.length || rt < 0)return false;
        return rd.multiplyScalar(rt).add(rp0);
    }
    //线段与网格体的交点集或交点
    static lineIntersectMesh(line, mesh, onlyClosest=true) {
        let vertices = [];
        let iPoints = [];
        let tempTriangle=new Triangle();
        if(mesh.geometry instanceof THREE.BufferGeometry){
            let positions=mesh.geometry.getAttribute('position').array;
            if(mesh.geometry.index){
                let indices=mesh.geometry.index.array;
                for(let i=0;i<indices.length;i++){
                    let index=indices[i];
                    vertices.push(new THREE.Vector3(positions[index*3],positions[index*3+1],positions[index*3+2]).applyMatrix4(mesh.matrixWorld));
                }
                for (let i = 0; i < indices.length; i+=3) {
                    let tempA = vertices[i];
                    let tempB = vertices[i+1];
                    let tempC = vertices[i+2];
                    let tempBound = jUtils.computeBoundMaxAndMin([tempA, tempB, tempC], 0.001);
                    if (!jUtils.ifLineIntersect3DAABB(line.start, line.end, tempBound.max, tempBound.min))continue;
                    tempTriangle.set(tempA, tempB, tempC);
                    let iPoint = jUtils.lineIntersectTriangle(line, tempTriangle);
                    if (iPoint !== false) iPoints.push(iPoint);
                }
            }else{
                for(let i=mesh.geometry.drawRange.start;i<mesh.geometry.drawRange.count;i+=3){
                    vertices.push(new THREE.Vector3(positions[i],positions[i+1],positions[i+2]).applyMatrix4(mesh.matrixWorld));
                }
                for (let i = 0; i < vertices.length; i+=3) {
                    let tempA = vertices[i];
                    let tempB = vertices[i+1];
                    let tempC = vertices[i+2];
                    let tempBound = jUtils.computeBoundMaxAndMin([tempA, tempB, tempC], 0.001);
                    if (!jUtils.ifLineIntersect3DAABB(line.start, line.end, tempBound.max, tempBound.min))continue;
                    tempTriangle.set(tempA, tempB, tempC);
                    let iPoint = jUtils.lineIntersectTriangle(line, tempTriangle);
                    if (iPoint !== false) iPoints.push(iPoint);
                }
            }
        }else {
            for (let i = 0; i < mesh.geometry.vertices.length; i++) {
                vertices.push(new THREE.Vector3().copy(mesh.geometry.vertices[i]).applyMatrix4(mesh.matrixWorld));
            }
            for (let i = 0; i < mesh.geometry.faces.length; i++) {
                let tempFace = mesh.geometry.faces[i];
                let tempA = vertices[tempFace.a];
                let tempB = vertices[tempFace.b];
                let tempC = vertices[tempFace.c];
                let tempBound = jUtils.computeBoundMaxAndMin([tempA, tempB, tempC], 0.001);
                if (!jUtils.ifLineIntersect3DAABB(line.start, line.end, tempBound.max, tempBound.min))continue;
                tempTriangle.set(tempA, tempB, tempC);
                let iPoint = jUtils.lineIntersectTriangle(line, tempTriangle);
                if (iPoint !== false) iPoints.push(iPoint);
            }
        }
        if (!onlyClosest)return iPoints.length === 0 ? false : iPoints;
        let dis = undefined;
        let closestPoint = false;
        for (let i = 0; i < iPoints.length; i++) {
            let tempD = iPoints[i].distanceTo(line.start);
            if (dis === undefined) {
                dis = tempD;
                closestPoint = iPoints[i];
            } else {
                if (dis > tempD) {
                    dis = tempD;
                    closestPoint = iPoints[i];
                }
            }
        }
        return closestPoint;
    }
    //限制向量范围
    static limitVector3(v,min,max){
        let temp=new THREE.Vector3().copy(v);
        temp.x=temp.x<min.x?min.x:(temp.x>max.x?max.x:temp.x);
        temp.y=temp.y<min.y?min.y:(temp.y>max.y?max.y:temp.y);
        temp.z=temp.z<min.z?min.z:(temp.z>max.z?max.z:temp.z);
        return temp;
    }
    //由轴向量及平移向量构建矩阵
    static makeMatrix4ByVector3(vX, vY, vZ, vT) {
        let mtx=new THREE.Matrix4();
        let te=mtx.elements;
        te[ 0 ] = vX.x;	    te[ 4 ] = vY.x;	    te[ 8 ] = vZ.x;	    te[ 12 ] = vT.x;
        te[ 1 ] = vX.y;	    te[ 5 ] = vY.y;	    te[ 9 ] = vZ.y;	    te[ 13 ] = vT.y;
        te[ 2 ] = vX.z;	    te[ 6 ] = vY.z;	    te[ 10 ] = vZ.z;	te[ 14 ] =vT.z;
        te[ 3 ] = 0;	    te[ 7 ] = 0;	    te[ 11 ] = 0;	    te[ 15 ] = 1;
        return mtx;
    }
    //生成斜测投影剪裁矩阵
    static makeCabinetShearMatrix(angle,offsetx,offsety,offsetz) {
        let mtx=new THREE.Matrix4();
        let te=mtx.elements;
        te[ 0 ] = 1;	    te[ 4 ] = 0;	    te[ 8 ] = -0.5 * Math.cos(angle);	    te[ 12 ] = offsetx;
        te[ 1 ] = 0;	    te[ 5 ] = 1;	    te[ 9 ] = -0.5 * Math.sin(angle);	    te[ 13 ] = offsety;
        te[ 2 ] = 0;	    te[ 6 ] = 0;	    te[ 10 ] = 1;	                        te[ 14 ] = offsetz;
        te[ 3 ] = 0;	    te[ 7 ] = 0;	    te[ 11 ] = 0;	                        te[ 15 ] = 1;
        return mtx;
    }
    //生成斜测投影矩阵
    static makeCabinetMatrix(left, right, top, bottom, near, far,xzAngle) {
        let mOthor =new THREE.Matrix4.makeOrthographic(left,right,top,bottom,near,far);
        let mShear = jUtils.makeCabinetShearMatrix(xzAngle,0,0,0);
        return mOthor.multiply(mShear);
    }
    //构建单位矩阵
    static makeUnitMatrix4() {
        let mtx=new THREE.Matrix4();
        let te=mtx.elements;
        te[ 0 ] = 1;	    te[ 4 ] = 0;	    te[ 8 ] = 0;	    te[ 12 ] = 0;
        te[ 1 ] = 0;	    te[ 5 ] = 1;	    te[ 9 ] = 0;	    te[ 13 ] = 0;
        te[ 2 ] = 0;	    te[ 6 ] = 0;	    te[ 10 ] = 1;	    te[ 14 ] =0;
        te[ 3 ] = 0;	    te[ 7 ] = 0;	    te[ 11 ] = 0;	    te[ 15 ] = 1;
        return mtx;
    }
    //创建2D包围盒
    static make2DAABB(p1, p2) {
        let max = new THREE.Vector2();
        let min = new THREE.Vector2();
        max.x = Math.max(p1.x, p2.x);
        max.y = Math.max(p1.y, p2.y);
        min.x = Math.min(p1.x, p2.x);
        min.y = Math.min(p1.y, p2.y);
        return new AABB2D(max, min);
    }
    //多字贴图
    static multiTextTexture(color='#000000',text='',size=64,ratio=4,fontWeight='bold') {
        let c=document.createElement('canvas');
        c.width=size;
        c.height=size;
        let ctx=c.getContext('2d');
        ctx.scale(0.9,1.1);
        ctx.beginPath();
        ctx.fillStyle=color;
        ctx.font=''+fontWeight+' '+size/ratio+'px Arial';
        ctx.textAlign='center';
        ctx.fillText(text,size/(ratio*0.5),size/(ratio*0.5));
        ctx.closePath();
        let texture=new THREE.Texture(c);
        texture.needsUpdate=true;
        return texture;
    }
    //获取序列中出现次数最多的元素或次数
    static maxTimesElementInElements(ary,returnTimes=false){
        let el=null;
        let max=-1;
        for(let i=0;i<ary.length;i++){
            let temp=ary[i];
            let count=0;
            for(let j=0;j<ary.length;j++){
                if(temp===ary[j])count++;
            }
            if(max<count){
                el=temp;
                max=count;
            }
        }
        return returnTimes?max:el;
    }
    //开n次方
    static nRoot(n, number) {
        if (n === 0 || n < 0) {
            console.log("参数非法，请输入正数进行开方！");
            return;
        }
        if (n === 1)return number;
        if (n === 2)return Math.sqrt(number);
        let t = Math.floor(n / 2);
        let r = n % 2;
        let result = number;
        if (r === 0) {
            for (let i = t; i > 0; i--) {
                result = Math.sqrt(result);
            }
        } else {
            let nmin = number, nmax = number;
            for (let j = t; j > 0; j--) {
                nmax = Math.sqrt(nmax);
            }
            for (let k = t + 1; k > 0; k--) {
                nmin = Math.sqrt(nmin);
            }
            let gtroot = [];
            if (number > 1) {
                getroot(nmin, (nmin + nmax) / 2, nmax, n, number, 1 / jUtils.precision, 0, 40, gtroot);
            } else {
                getroot(nmax, (nmin + nmax) / 2, nmin, n, number, 1 / jUtils.precision, 0, 40, gtroot);
            }
            result = gtroot[0];
        }
        return result;
        function getroot(min, mid, max, tn, tnumber, precision, times, depth, tresult) {
            times++;
            if (times > depth) {
                tresult.push(mid);
                return;
            }
            let midn = Math.pow(mid, tn);
            if (Math.abs(tnumber - midn) <= precision) {
                tresult.push(mid);
                return;
            }
            if ((tnumber - midn) > 0) {
                getroot(mid, (mid + max) * 0.5, max, tn, tnumber, precision, times, depth, tresult);
            } else {
                getroot(min, (min + mid) * 0.5, mid, tn, tnumber, precision, times, depth, tresult);
            }
        }
    }
    //代表任意线的点序列的N分点
    static nEquidistantPointOfPoints(points, n,cutLength=jUtils.precision) {
        let vertices = points;
        let lengths = jUtils.pointsEveryLength(points);
        let length = lengths[lengths.length - 1];
        let unitLength = length / n;
        let nPoints = [];
        let deltaLength = 0;
        let lengthCount = 1;
        let tempDir = undefined;
        nPoints.push(new THREE.Vector3().copy(vertices[0]));
        for (let i = 1; i < vertices.length; i++) {
            while (lengths[i] > unitLength * lengthCount) {
                tempDir = new THREE.Vector3().subVectors(vertices[i], vertices[i - 1]).normalize();
                deltaLength = unitLength * lengthCount - lengths[i - 1];
                nPoints.push(new THREE.Vector3().addVectors(vertices[i - 1], tempDir.multiplyScalar(deltaLength)));
                if(nPoints.length>=cutLength)return nPoints;
                lengthCount++;
                if (lengthCount >= n)break;
            }
        }
        nPoints.push(new THREE.Vector3().copy(vertices[vertices.length - 1]));
        return nPoints;
    }
    //线段的n等分点
    static nEquidistantPointsOfLine(n, line) {
        if (Math.floor(n) < 2) {
            console.log("请输入大于等于2的整数求等分点！");
            return;
        }
        let start = new THREE.Vector3().copy(line.start);
        let length = line.length;
        let nom = new THREE.Vector3().copy(line.direction);
        let unitLength = length / Math.round(n);
        let result = [];
        for (let i = 0; i < n - 1; i++) {
            result.push(new THREE.Vector3().copy(nom).multiplyScalar(unitLength * (i + 1)).add(start));
        }
        return result;
    }
    //在点集中插入偏移点
    static offsetPoints(points,offset,offsetSelf){
        let tp=[];
        points.forEach((p)=>{
            if(!offsetSelf){
                tp.push(new THREE.Vector3().copy(p));
            }else{
                tp.push(new THREE.Vector3().addVectors(p,offsetSelf));
            }
            tp.push(new THREE.Vector3().addVectors(p,offset));
        });
        return tp;
    }
    //按精度判断是否相等
    static pcsEqual(a,b,type=false,customPrecision=false){
        let pcs=customPrecision!==false?customPrecision:jUtils.precision;
        let _type=type;
        if(type===false) {
            let type0 = jUtils.typeCheck(a);
            let type1 = jUtils.typeCheck(b);
            if (type0 !== type1)return false;
            _type=type1;
        }
        switch(_type){
            case jUtils.T.num:
                return (Math.round(a * pcs) === Math.round(b * pcs));
                break;
            case jUtils.T.str:
                return a===b;
                break;
            case jUtils.T.bol:
                return a===b;
                break;
            case jUtils.T.udf:
                return true;
                break;
            case jUtils.T.mt3:
                for(let i=0;i<a.elements.length;i++) {
                    if (Math.abs(a.elements[i]-b.elements[i]) * pcs>1)return false;
                    // if (Math.round(a.elements[i] * pcs) !== Math.round(b.elements[i] * pcs))return false;
                }
                return true;
                break;
            case jUtils.T.mt4:
                for(let i=0;i<a.elements.length;i++) {
                    if (Math.abs(a.elements[i]-b.elements[i]) * pcs>1)return false;
                    // if (Math.round(a.elements[i] * pcs) !== Math.round(b.elements[i] * pcs))return false;
                }
                return true;
                break;
            case jUtils.T.vc3:
                if(Math.abs(a.x  -b.x )* pcs>1)return false;
                if(Math.abs(a.y -b.y) * pcs>1)return false;
                return !(Math.abs(a.z -b.z )* pcs>1);
                break;
            case jUtils.T.vc2:
                if(Math.abs(a.x -b.x) * pcs>1)return false;
                return !(Math.abs(a.y -b.y )* pcs>1);
                // return (Math.round(a.x * pcs) === Math.round(b.x * pcs)) &&
                //     (Math.round(a.y * pcs) === Math.round(b.y * pcs));
                break;
            case jUtils.T.vc4:
                if(Math.abs(a.x  -b.x )* pcs>1)return false;
                if(Math.abs(a.y -b.y) * pcs>1)return false;
                if(Math.abs(a.z -b.z) * pcs>1)return false;
                return !(Math.abs(a.w -b.w )* pcs>1);
                // return (Math.round(a.x * pcs) === Math.round(b.x * pcs)) &&
                //     (Math.round(a.y * pcs) === Math.round(b.y * pcs)) &&
                //     (Math.round(a.z * pcs) === Math.round(b.z * pcs)) &&
                //     (Math.round(a.w * pcs) === Math.round(b.w * pcs));
                break;
            case jUtils.T.smb:
                return false;
                break;
            case jUtils.T.obj:
                return a===b;
                break;
            case jUtils.T.ary:
                if(a.length!==b.length)return false;
                if(a.length===b.length===0)return true;
                for(let i=0;i<a.length;i++){
                    if(!jUtils.pcsEqual(a[i],b[i],false,customPrecision))return false;
                }
                return true;
                break;
            case jUtils.T.nry:
                if(a.length!==b.length)return false;
                if(a.length===b.length===0)return true;
                for(let i=0;i<a.length;i++){
                    let fail=true;
                    for(let j=0;j<b.length;j++){
                        if(jUtils.pcsEqual(a[i],b[j],false,customPrecision))fail=false;
                    }
                    if(fail)return false;
                }
                return true;
                break;
            case jUtils.T.clr:
                return (Math.round(a.r * pcs) === Math.round(b.r * pcs)) &&
                    (Math.round(a.g * pcs) === Math.round(b.g * pcs)) &&
                    (Math.round(a.b * pcs) === Math.round(b.b * pcs));
                break;
            case jUtils.T.qtn:
                return (Math.round(a.x * pcs) === Math.round(b.x * pcs)) &&
                    (Math.round(a.y * pcs) === Math.round(b.y * pcs)) &&
                    (Math.round(a.z * pcs) === Math.round(b.z * pcs)) &&
                    (Math.round(a.w * pcs) === Math.round(b.w * pcs));
                break;
            case jUtils.T.elr:
                return (Math.round(a.x * pcs) === Math.round(b.x * pcs)) &&
                    (Math.round(a.y * pcs) === Math.round(b.y * pcs)) &&
                    (Math.round(a.z * pcs) === Math.round(b.z * pcs))&&
                    a.order===b.order;
                break;
            case jUtils.T._ndl:
                let isA = (jUtils.pcsEqual(a.start, b.start, jUtils.T.vc3) && jUtils.pcsEqual(a.end, b.end, jUtils.T.vc3));
                let isB = (jUtils.pcsEqual(a.start, b.end, jUtils.T.vc3) && jUtils.pcsEqual(a.end, b.start, jUtils.T.vc3));
                return isA || isB;
                break;
            case jUtils.T._drl:
                return jUtils.pcsEqual(a.start, b.start, jUtils.T.vc3) && jUtils.pcsEqual(a.end, b.end, jUtils.T.vc3);
                break;
            case jUtils.T._idf:
                let A, B, C, D, E, F;
                if (a.a !== undefined && b.a !== undefined) {
                    A = a.a;
                    B = a.b;
                    C = a.c;
                    D = b.a;
                    E = b.b;
                    F = b.c;
                } else {
                    A = a[0];
                    B = a[1];
                    C = a[2];
                    D = b[0];
                    E = b[1];
                    F = b[2];
                }
                if (A === D && B === E && C === F) {
                    return true;
                } else if (A === D && B === F && C === E) {
                    return true;
                } else if (A === E && B === F && C === D) {
                    return true;
                } else if (A === E && B === D && C === F) {
                    return true;
                } else if (A === F && B === D && C === E) {
                    return true;
                } else {
                    return  A === F && B === E && C === D;
                }
                break;
            case jUtils.T._grp:
                if(a.length!==b.length)return false;
                if(a.length===b.length===0)return true;
                a.forEach((i)=>{
                    if(b.findIndex((t)=>jUtils.pcsEqual(t,i,type,customPrecision))===-1)return false;
                });
                b.forEach((i)=>{
                    if(a.findIndex((t)=>jUtils.pcsEqual(t,i,type,customPrecision))===-1)return false;
                });
                return true;
                break;
        }
        console.warn('unsupported type!');
        return undefined;
    }
    //根据弧度计算正切
    static pTan(radian) {
        let result = undefined;
        if (radian / Math.PI % 0.5 === 0 && radian / Math.PI % 1 !== 0) {
            result = Infinity;
        } else {
            result = Math.tan(radian);
        }
        return result;
    }
    //根据弧度计算正割
    static pSec(radian) {
        let result = undefined;
        if (radian / Math.PI % 0.5 === 0 && radian / Math.PI % 1 !== 0) {
            result = Infinity;
        } else {
            result = jUtils.sec(radian);
        }
        return result;
    }
    //根据弧度计算余割
    static pCsc(radian) {
        let result = undefined;
        if (radian / Math.PI % 1 === 0) {
            result = Infinity;
        } else {
            result = jUtils.csc(radian);
        }
        return result;
    }
    //平行四边形面积
    static parallelogramArea(bottom, height) {
        return bottom * height;
    }
    //多边形内角和,默认弧度
    static polygonInteriorAngleSum(numberOfEdge, isInDegree=false) {
        let anglesum = (numberOfEdge - 2) * Math.PI;
        if (!isInDegree)return anglesum;
        return jUtils.radianToDegree(anglesum);
    }
    //棱柱体积
    static prismVolume(bottomArea, height) {
        return bottomArea * height;
    }
    //平面与平面的夹角
    static planeAngleToPlane(plane1Normal, plane2Normal, isVector, isInDegree) {
        let angle = plane1Normal.angleTo(plane2Normal);
        if (!isVector) {
            angle = Math.abs(angle);
            if (angle > (Math.PI / 2)) angle = Math.PI - angle;
        }
        if (isInDegree) angle = jUtils.radianToDegree(angle);
        return angle;
    }
    //三点平面
    static planeBy3Points(p1, p2, p3) {
        let v1 = new THREE.Vector3().subVectors(p3, p2);
        let v2 = new THREE.Vector3().subVectors(p1, p2);
        let center = new THREE.Vector3().addVectors(p1, p2);
        center.add(p3);
        center.divideScalar(3);
        let normal = new THREE.Vector3().crossVectors(v1, v2).normalize();
        return new Plane(normal, center);
    }
    //代表任意线的点序列的起点到各点的长度
    static pointsEveryLength(points) {
        let vertices = points;
        let tolLength = [0];
        let tempLength = 0;
        for (let i = 1; i < vertices.length; i++) {
            tempLength += vertices[i - 1].distanceTo(vertices[i]);
            tolLength.push(tempLength);
        }
        return tolLength;
    }
    //平面与三角面的交线
    static planeIntersectTriangle(plane, triangle) {
        let intersectAB = jUtils.lineIntersectPlane(triangle.lineAB, plane);
        let intersectBC = jUtils.lineIntersectPlane(triangle.lineBC, plane);
        let intersectCA = jUtils.lineIntersectPlane(triangle.lineCA, plane);
        if (intersectAB !== false && intersectBC !== false)return new Line(intersectAB, intersectBC);
        if (intersectAB !== false && intersectCA !== false)return new Line(intersectAB, intersectCA);
        if (intersectBC !== false && intersectCA !== false)return new Line(intersectBC, intersectCA);
        return false;
    }
    //弧度转换为度
    static radianToDegree(radian) {
        let r = Number.parseFloat(radian);
        if (Number.isNaN(r))return 0;
        return r * jUtils.RADToDEG;
    }
    //矩形周长
    static rectangleCircumference(length, width) {
        let l = Number.parseFloat(length);
        if (Number.isNaN(l)) l = 0;
        let w = Number.parseFloat(width);
        if (Number.isNaN(w)) w = 0;
        return (l + w) * 2;
    }
    //矩形面积
    static rectangleArea(length, width) {
        let l = Number.parseFloat(length);
        if (Number.isNaN(l)) l = 0;
        let w = Number.parseFloat(width);
        if (Number.isNaN(w)) w = 0;
        return l * w;
    }
    //特定区间随机数
    static random(min, max) {
        let delta = max - min;
        let rDelta = delta * Math.random();
        return min + rDelta;
    }
    //特定区间随机整数
    static randInt(min,max){
        return Math.round(jUtils.random(min,max));
    }
    //移除序列中的重复元素
    static removeDuplicateElements(es, type) {
        let temp = Array.from(es);
        for (let i = 0; i < es.length; i++) {
            let number = 0;
            for (let j = 0; j < temp.length; j++) {
                if (jUtils.pcsEqual(es[i], temp[j], type)) number++;
                if (number > 1) {
                    temp.splice(j, 1);
                    j = -1;
                    number = 0;
                }
            }
        }
        return temp;
    }
    //移除重复元素并重新排列线段碎片
    static regroupLines(lines) {
        let tempLines = lines;
        let linesGroup = [];
        let endPoint=new THREE.Vector3();
        let startPoint=new THREE.Vector3();
        while (tempLines.length > 0) {
            let newLines = [];
            newLines.push(tempLines[0]);
            endPoint.copy(newLines[0].end);
            tempLines.splice(0, 1);
            for (let i = 0; i < tempLines.length; i++) {
                let tempLine = tempLines[i];
                if (jUtils.pcsEqual(endPoint, tempLine.start, jUtils.T.vc3)) {
                    newLines.push(tempLine);
                    endPoint.copy(tempLine.end);
                    tempLines.splice(i, 1);
                    i = -1;
                } else if (jUtils.pcsEqual(endPoint, tempLine.end, jUtils.T.vc3)) {
                    newLines.push(new Line(tempLine.end, tempLine.start));
                    endPoint.copy(tempLine.start);
                    tempLines.splice(i, 1);
                    i = -1;
                }
            }
            if (tempLines.length > 0) {
                startPoint.copy(newLines[0].start);
                for (let i = 0; i < tempLines.length; i++) {
                    let tempLine = tempLines[i];
                    if (jUtils.pcsEqual(startPoint, tempLine.end, jUtils.T.vc3)) {
                        newLines.unshift(tempLine);
                        startPoint.copy(tempLine.start);
                        tempLines.splice(i, 1);
                        i = -1;
                    } else if (jUtils.pcsEqual(startPoint, tempLine.start, jUtils.T.vc3)) {
                        newLines.unshift(new Line(tempLine.end, tempLine.start));
                        startPoint.copy(tempLine.end);
                        tempLines.splice(i, 1);
                        i = -1;
                    }
                }
            }
            linesGroup.push(newLines);
        }
        return linesGroup;
    }
    //从序列中随机获取多个元素
    static randomFromArray(es,count){
        let temp=[];
        let tes=es.slice(0);
        if(es.length<count){
            temp=es.slice(0);
        }else{
            while(temp.length<count){
                let index=jUtils.randInt(0,tes.length-1);
                temp.push(tes[index]);
                tes.splice(index,1);
            }
        }
        return temp;
    }
    //点在代表多段线的点序列中的位置比值
    static ratioOfPointAndPoints(point,points){
        let lens=jUtils.pointsEveryLength(points);
        for(let i=0;i<points.length-1;i++){
            let a=points[i];
            let b=points[i+1];
            if(jUtils.ifPointOnLine(point,a,b)){
                return (lens[i]+point.distanceTo(a))/lens[lens.length-1];
            }
        }
    }
    //根据半径计算全球面积
    static sphereArea(radius) {
        let r = Number.parseFloat(radius);
        if (Number.isNaN(r))return 0;
        return 4 * Math.PI * r * r;
    }
    //根据半径计算全球体积
    static sphereVolume(radius) {
        let r = Number.parseFloat(radius);
        if (Number.isNaN(r))return 0;
        return 4 * Math.PI * Math.pow(r, 3) / 3;
    }
    //正弦计算,默认弧度
    static sin(degree, isInDegree=false) {
        if (isInDegree) degree = jUtils.degreeToRadian(degree);
        return Math.sin(degree);
    }
    //正割计算,默认弧度
    static sec(radian, isInDegree=false) {
        if (isInDegree) radian = jUtils.radianToDegree(radian);
        return 1 / Math.cos(radian);
    }
    //扇形面积,默认使用弧度
    static sectorArea(radius, angle, isInDegree=false) {
        let _angle = angle;
        if (isInDegree) _angle = jUtils.degreeToRadian(angle);
        let length = jUtils.circularArcLength(radius, _angle, false);
        return length * radius / 2;
    }
    //扇形周长,默认弧度
    static sectorCircumference(radius, angle, isInDegree=false) {
        let _angle = angle;
        if (isInDegree) _angle = jUtils.degreeToRadian(angle);
        let length = jUtils.circularArcLength(radius, _angle, false);
        return length + radius * 2;
    }
    //对称点,返回由对称点指向中心的线
    static symmetryPointOfPoint(point, target, targetType) {
        let symmetryLine;
        let dirLine, startPoint;
        if(targetType===undefined){
            if(target instanceof THREE.Vector3)targetType=jUtils.T.vc3;
            if(target instanceof Line)targetType=jUtils.T._lin;
            if(target instanceof Plane)targetType=jUtils.T._pln;
        }
        switch (targetType) {
            case jUtils.T.vc3:
                dirLine = new THREE.Vector3().subVectors(target, point);
                startPoint = new THREE.Vector3().addVectors(dirLine, target);
                symmetryLine = new Line(startPoint, new THREE.Vector3().copy(target));
                break;
            case jUtils.T._lin:
                dirLine = jUtils.verticalLineOfLineAndPoint(point, target.start, target.end);
                let ndir = new THREE.Vector3().copy(dirLine.direction).negate();
                startPoint = new THREE.Vector3().addVectors(dirLine.start, ndir.multiplyScalar(dirLine.length));
                symmetryLine = new Line(startPoint, dirLine.start);
                break;
            case jUtils.T._pln:
                dirLine = jUtils.verticalLineOfPlaneAndPoint(target, point);
                ndir = new THREE.Vector3().copy(dirLine.direction).negate();
                startPoint = new THREE.Vector3().addVectors(dirLine.start, ndir.multiplyScalar(dirLine.length));
                symmetryLine = new Line(startPoint, dirLine.start);
                break;
        }
        if (symmetryLine === undefined) {
            console.log("输入的类型无法创建对称点！");
            return;
        }
        return symmetryLine;
    }
    //屏幕坐标转化为世界坐标
    static screenPointToWorld(rect,camera,point,scale=1) {
        let x = point.x - rect.left;
        let y = point.y - rect.top;
        let p = new THREE.Vector2();
        p.x = ((x / rect.width) * 2 - 1) * scale;
        p.y = (1 - (y / rect.height) * 2) * scale;
        let raycaster = new THREE.Raycaster();
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        raycaster.setFromCamera(p, camera);
        let cd=new THREE.Vector3();
        camera.getWorldDirection(cd);
        let dir = new THREE.Vector3().copy(cd).negate();
        let plane = new THREE.Plane(dir, 0);
        let intersect =new THREE.Vector3();
        raycaster.ray.intersectPlane(plane,intersect);
        return (intersect) ? intersect : false;
    }
    //屏幕坐标转化为世界坐标
    static screenPointToWorldFocus(rect,camera,focus, point, isOrigin=true, scale=1) {
        let x = point.x - rect.left;
        let y = point.y - rect.top;
        let p = new THREE.Vector2();
        p.x = ((x / rect.width) * 2 - 1) * scale;
        p.y = (1 - (y / rect.height) * 2) * scale;
        let raycaster = new THREE.Raycaster();
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        raycaster.setFromCamera(p, camera);
        let plane = undefined;
        let dir=new THREE.Vector3();
        if (!isOrigin) {
            dir.copy(camera.getWorldDirection()).negate();
            plane = new THREE.Plane(dir, 0);
            let matrix=new THREE.Matrix4().makeTranslation(focus.x,focus.y,focus.z);
            plane.applyMatrix4(matrix);
        } else {
            dir.copy(camera.getWorldDirection()).negate();
            plane = new THREE.Plane(dir, 0);
        }
        let intersect = raycaster.ray.intersectPlane(plane);
        return (intersect) ? intersect : false;
    }
    //序列之和
    static sumArrayElements(array, type) {
        let result = undefined;
        switch (type) {
            case jUtils.T.num:
                result = 0;
                array.map(e => result += Number.parseFloat(e));
                break;
            case jUtils.T.str:
                result = "";
                array.map(e => result += e);
                break;
            case jUtils.T.v3:
                result = new THREE.Vector3(0, 0, 0);
                array.map(e => result.add(e));
                break;
        }
        if (result === undefined) {
            console.warn('unsupported type');
            return false;
        }
        return result;
    }
    //计算屏幕线与视口边界交点（像素）
    static screenLineIntersectViewportBorder(screenStart, screenEnd, domElementOrRect,isRect=false) {
        let line = new Line(screenStart, screenEnd);
        let rect = isRect?domElementOrRect:domElementOrRect.getBoundingClientRect();
        let tl = new THREE.Vector3(rect.left, rect.top, 0);
        let tr = new THREE.Vector3(rect.right, rect.top, 0);
        let bl = new THREE.Vector3(rect.left, rect.bottom, 0);
        let br = new THREE.Vector3(rect.right, rect.bottom, 0);
        let top = new Line(tl, tr);
        let left = new Line(tl, bl);
        let bottom = new Line(bl, br);
        let right = new Line(tr, br);
        let result = [];
        let iTop = jUtils.closestPointsOf2LinesIn3D(line, top).start;
        if (jUtils.ifPointOnLine(iTop, top.start, top.end)) result.push(iTop);
        let iBottom = jUtils.closestPointsOf2LinesIn3D(line, bottom).start;
        if (jUtils.ifPointOnLine(iBottom, bottom.start, bottom.end)) result.push(iBottom);
        let iLeft = jUtils.closestPointsOf2LinesIn3D(line, left).start;
        if (jUtils.ifPointOnLine(iLeft, left.start, left.end)) result.push(iLeft);
        let iRight = jUtils.closestPointsOf2LinesIn3D(line, right).start;
        if (jUtils.ifPointOnLine(iRight, right.start, right.end)) result.push(iRight);
        return result;
    }
    //设置矩阵的X轴
    static setXOfMatrix(matrix,v){
        matrix.elements[0]=v.x;
        matrix.elements[1]=v.y;
        matrix.elements[2]=v.z;
    }
    //设置矩阵的Y轴
    static setYOfMatrix(matrix,v){
        matrix.elements[4]=v.x;
        matrix.elements[5]=v.y;
        matrix.elements[6]=v.z;
    }
    //设置矩阵的Z轴
    static setZOfMatrix(matrix,v){
        matrix.elements[8]=v.x;
        matrix.elements[9]=v.y;
        matrix.elements[10]=v.z;
    }
    //设置矩阵的平移
    static setTOfMatrix(matrix,v){
        matrix.elements[12]=v.x;
        matrix.elements[13]=v.y;
        matrix.elements[14]=v.z;
    }
    //根据向量的旋转构建旋转矩阵
    static setMatrixFromTwoVector3(vFrom,vTo) {
        let from=new THREE.Vector3().copy(vFrom).normalize();
        let to=new THREE.Vector3().copy(vTo).normalize();
        let quaternion=new THREE.Quaternion().setFromUnitVectors(from,to);
        return new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
    }
    //将数组按规定长度分为子数组
    static splitArrayToArrays(array,n=2,hasTail=false){
        let layers=[];
        let length=array.length;
        let count=0;
        let temp=[];
        for(let i=0;i<length;i++){
            temp.push(array[i]);
            count++;
            if(count===n){
                layers.push([...temp]);
                count=0;
                temp=[];
            }else{
                if(hasTail&&i===length-1){
                    layers.push([...temp]);
                }
            }
        }
        return layers;
    }
    //单字符贴图
    static singleTextTexture(color='#000000',text='',size=32,fontWeight='normal',offsetX=0,offsetY=0,backgroundColor) {
        let c=document.createElement('canvas');
        c.width=size;
        c.height=size;
        let ctx=c.getContext('2d');
        if(backgroundColor!==undefined){
            ctx.fillStyle=backgroundColor;
            ctx.fillRect(0,0,c.width,c.height);
        }
        ctx.beginPath();
        ctx.fillStyle=color;
        ctx.font=''+fontWeight+' '+size+'px Arial';
        ctx.textAlign='center';
        ctx.fillText(text,size/2+offsetX,size+offsetY);
        ctx.closePath();
        let texture=new THREE.Texture(c);
        texture.needsUpdate=true;
        return texture;
    }
    //获取按序列值大小排序的序列号
    static sortIndexArray(ary,direction=-1){
        let array=[...ary];
        let highToLow = [];
        let temp;
        for (let i = 0; i < array.length; i++) {
            highToLow.push(i);
        }
        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < array.length; j++) {
                if(direction<=0) {
                    if (array[j] > array[j + 1]) {
                        temp = array[j];
                        array[j] = array[j + 1];
                        array[j + 1] = temp;
                        temp = highToLow[j];
                        highToLow[j] = highToLow[j + 1];
                        highToLow[j + 1] = temp;
                    }
                }else{
                    if (array[j] < array[j + 1]) {
                        temp = array[j];
                        array[j] = array[j + 1];
                        array[j + 1] = temp;
                        temp = highToLow[j];
                        highToLow[j] = highToLow[j + 1];
                        highToLow[j + 1] = temp;
                    }
                }
            }
        }
        return highToLow;
    }
    //正切计算,默认弧度
    static tan(degree, isInDegree=false) {
        if (isInDegree) degree = jUtils.degreeToRadian(degree);
        return Math.tan(degree);
    }
    //三角形面积
    static triangleArea(p1, p2, p3) {
        let bottom = p1.distanceTo(p2);
        let height = jUtils.verticalLineOfLineAndPoint(p3, p1, p2).length;
        return bottom * height / 2;
    }
    //3面交点
    static threePlaneIntersection(plane1, plane2, plane3) {
        let n1 =plane1.normal;
        let n2 =plane2.normal;
        let n3 =plane3.normal;
        let d1 = plane1.implicitParameter_d;
        let d2 = plane2.implicitParameter_d;
        let d3 = plane3.implicitParameter_d;
        let v1d = new THREE.Vector3().crossVectors(n2, n3).dot(n1);
        if (jUtils.pcsEqual(v1d, 0, jUtils.T.num)) {
            return jUtils.triangleGravityCenter(plane1.onepoint, plane2.onepoint, plane3.onepoint);
        }
        let v1a = new THREE.Vector3().crossVectors(n3, n2).multiplyScalar(d1);
        let v1b = new THREE.Vector3().crossVectors(n3, n1).multiplyScalar(d2);
        let v1c = new THREE.Vector3().crossVectors(n1, n2).multiplyScalar(d3);
        return v1a.add(v1b).add(v1c).divideScalar(v1d);
    }
    //梯形面积
    static trapeziumArea(top, bottom, height) {
        return (top + bottom) * height / 2;
    }
    //三角形重心
    static triangleGravityCenter(p1, p2, p3) {
        let gCenter = new THREE.Vector3().addVectors(p1, p2);
        gCenter.add(p3);
        return gCenter.divideScalar(3);
    }
    //三角形外接圆
    static triangleCircumcircle(p1, p2, p3) {
        let e1, e2, e3, d1, d2, d3, c1, c2, c3, c;
        e1 = new THREE.Vector3().subVectors(p3, p2);
        e2 = new THREE.Vector3().subVectors(p1, p3);
        e3 = new THREE.Vector3().subVectors(p2, p1);
        d1 = -(e2.dot(e3));
        d2 = -(e3.dot(e1));
        d3 = -(e1.dot(e2));
        c1 = d2 * d3;
        c2 = d3 * d1;
        c3 = d1 * d2;
        c = c1 + c2 + c3;
        c = (c === 0) ? (1 / jUtils.precision) : c;
        let v1 = new THREE.Vector3().copy(p1).multiplyScalar((c2 + c3) / (2 * c));
        let v2 = new THREE.Vector3().copy(p2).multiplyScalar((c3 + c1) / (2 * c));
        let v3 = new THREE.Vector3().copy(p3).multiplyScalar((c1 + c2) / (2 * c));
        let center = new THREE.Vector3().addVectors(v1, v2).add(v3);
        let radius = Math.sqrt((d1 + d2) * (d2 + d3) * (d3 + d1) / c) / 2;
        let normal =jUtils.computeThreePointNormal(p1,p2,p3);
        return new Circle(center, radius, normal);
    }
    //三角形内切圆
    static triangleInscribedCircle(p1, p2, p3) {
        let l1, l2, l3, p;
        l3 = p1.distanceTo(p2);
        l1 = p2.distanceTo(p3);
        l2 = p3.distanceTo(p1);
        p = l1 + l2 + l3;
        let v1 = new THREE.Vector3().copy(p1).multiplyScalar(l1 / p);
        let v2 = new THREE.Vector3().copy(p2).multiplyScalar(l2 / p);
        let v3 = new THREE.Vector3().copy(p3).multiplyScalar(l3 / p);
        let center = new THREE.Vector3().addVectors(v1, v2).add(v3);
        let area = jUtils.triangleArea(p1, p2, p3);
        let radius = 2 * area / p;
        let normal = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(p3, p2), new THREE.Vector3().subVectors(p1, p2)).normalize();
        return new Circle(center, radius, normal);
    }
    //三角形垂心
    static triangleOrthocenter(p1, p2, p3) {
        let va = new THREE.Vector3().subVectors(p3, p2);
        let vb = new THREE.Vector3().subVectors(p1, p3);
        let vc = new THREE.Vector3().subVectors(p2, p1);
        let alpha = (va.dot(vb)) * (va.dot(vc));
        let beta = (vb.dot(vc)) * (vb.dot(va));
        let gamma = (vc.dot(va)) * (vc.dot(vb));
        let ts = alpha + beta + gamma;
        let ca = new THREE.Vector3().copy(p1).multiplyScalar(alpha / ts);
        let cb = new THREE.Vector3().copy(p2).multiplyScalar(beta / ts);
        let cc = new THREE.Vector3().copy(p3).multiplyScalar(gamma / ts);
        return new THREE.Vector3().addVectors(ca, cb).add(cc);
    }
    //三角形首点所对应的旁切圆
    static triangleEscribedCircle(pA, pB, pC) {
        let area = jUtils.triangleArea(pA, pB, pC);
        let lab, lac, lbc;
        lab = pA.distanceTo(pB);
        lac = pA.distanceTo(pC);
        lbc = pB.distanceTo(pC);
        let r = (area * 2) / (lab + lac - lbc);
        let vab = new THREE.Vector3().subVectors(pB, pA);
        let vac = new THREE.Vector3().subVectors(pC, pA);
        let angle = (vab.angleTo(vac)) * 0.5;
        let labe = r / Math.tan(angle);
        let pabe = new THREE.Vector3().copy(vab).normalize().multiplyScalar(labe);
        pabe.add(pA);
        let pProject = vac.projectOnVector(vab);
        pProject.add(pA);
        let nom = new THREE.Vector3().subVectors(pC, pProject).normalize();
        let center = nom.multiplyScalar(r);
        center.add(pabe);
        let normal = new THREE.Vector3().crossVectors(new THREE.Vector3().subVectors(pC, pB), new THREE.Vector3().subVectors(pA, pB)).normalize();
        return new Circle(center, r, normal);
    }
    //三角面与三角面的交线
    static triangleIntersectTriangle(triangle1, triangle2) {
        let lineStart = undefined;
        let tempLine=new Line();
        let getLine=(intersect)=>{
            if (intersect !== false) {
                if (lineStart === undefined || jUtils.pcsEqual(intersect, lineStart, jUtils.T.vc3)) {
                    lineStart =intersect;
                } else {
                    tempLine.set(lineStart, intersect);
                    lineStart = undefined;
                    return tempLine;
                }
            }
        };
        let tri1ABInt = jUtils.lineIntersectTriangle(triangle1.lineAB, triangle2);
        let line = getLine(tri1ABInt);
        if (line !== undefined)return line;
        let tri1BCInt = jUtils.lineIntersectTriangle(triangle1.lineBC, triangle2);
        line = getLine(tri1BCInt);
        if (line !== undefined)return line;
        let tri1CAInt = jUtils.lineIntersectTriangle(triangle1.lineCA, triangle2);
        line = getLine(tri1CAInt);
        if (line !== undefined)return line;
        let tri2ABInt = jUtils.lineIntersectTriangle(triangle2.lineAB, triangle1);
        line = getLine(tri2ABInt);
        if (line !== undefined)return line;
        let tri2BCInt = jUtils.lineIntersectTriangle(triangle2.lineBC, triangle1);
        line = getLine(tri2BCInt);
        if (line !== undefined)return line;
        let tri2CAInt = jUtils.lineIntersectTriangle(triangle2.lineCA, triangle1);
        line = getLine(tri2CAInt);
        if (line !== undefined)return line;
        return false;
    }
    //获取对象类型
    static typeOf(object){
        if(object.type!==undefined)return object.type;
        return jUtils.typeCheck(object);
    }
    //检测类型
    static typeCheck(p){
        if(typeof p==='number')return jUtils.T.num;
        if(typeof p==='string')return jUtils.T.str;
        if(typeof p==='boolean')return jUtils.T.bol;
        if(typeof p==='symbol')return jUtils.T.smb;
        if(typeof p==='undefined')return jUtils.T.udf;
        if(Array.isArray(p))return jUtils.T.ary;
        if(p&&p.isVector3)return jUtils.T.vc3;
        if(p&&p.isVector4)return jUtils.T.vc4;
        if(p&&p.isVector2)return jUtils.T.vc2;
        if(p&&p.isMatrix3)return jUtils.T.mt3;
        if(p&&p.isMatrix4)return jUtils.T.mt4;
        if(p&&p.isColor)return jUtils.T.clr;
        if(p instanceof THREE.Quaternion)return jUtils.T.qtn;
        if(p&&p.isEuler)return jUtils.T.elr;
        if(typeof p==='function')return jUtils.T.fuc;
        return jUtils.T.obj;
    }
    //更新相机长宽比
    static updateCameraAspect(camera,w,h,factor){
        if(camera instanceof THREE.PerspectiveCamera){
            camera.aspect=w/h;
        }else if(camera instanceof THREE.OrthographicCamera){
            camera.left=-w/factor;
            camera.right=w/factor;
            camera.top=h/factor;
            camera.bottom=-h/factor;
        }else{
            console.warn('unsupported type of camera');
        }
        camera.updateProjectionMatrix();
    }
    //创建UUID
    static UUID() {
        let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split( '' );
        let uuid = new Array( 36 );
        let rnd = 0, r;
        return (()=>{
            for ( let i = 0; i < 36; i ++ ) {
                if ( i === 8 || i === 13 || i === 18 || i === 23 ) {
                    uuid[ i ] = '-';
                } else if ( i === 14 ) {
                    uuid[ i ] = '4';
                } else {
                    if ( rnd <= 0x02 ) rnd = 0x2000000 + ( Math.random() * 0x1000000 ) | 0;
                    r = rnd & 0xf;
                    rnd = rnd >> 4;
                    uuid[ i ] = chars[ ( i === 19 ) ? ( r & 0x3 ) | 0x8 : r ];
                }
            }
            return uuid.join( '' );
        })();
    }
    //返回与参考向量不相等的向量
    static unEqual(v,offset,...refV){
        let temp=new THREE.Vector3().copy(v);
        let isOk=true;
        refV.forEach((ref)=>{if(jUtils.pcsEqual(ref,temp,jUtils.T.vc3))isOk=false;});
        if(isOk)return temp;
        isOk=true;
        temp.x+=offset;
        refV.forEach((ref)=>{if(jUtils.pcsEqual(ref,temp,jUtils.T.vc3))isOk=false;});
        if(isOk)return temp;
        isOk=true;
        temp.x-=offset;
        temp.y+=offset;
        refV.forEach((ref)=>{if(jUtils.pcsEqual(ref,temp,jUtils.T.vc3))isOk=false;});
        if(isOk)return temp;
        temp.y-=offset;
        temp.z+=offset;
        return temp;
    }
    //点到直线的垂线段
    static verticalLineOfLineAndPoint(point, lineStart, lineEnd) {
        let sp = new THREE.Vector3().subVectors(point, lineStart);
        let se = new THREE.Vector3().subVectors(lineEnd, lineStart);
        let pProject = sp.projectOnVector(se);
        pProject.add(lineStart);
        return new Line(pProject, point);
    }
    //点到平面的垂线段
    static verticalLineOfPlaneAndPoint(plane, point) {
        let d = plane.implicitParameter_d;
        let p=new THREE.Vector3().copy(point);
        let n = new THREE.Vector3().copy(plane.normal);
        let v1a = d - p.dot(n);
        let v1b = n.multiplyScalar(v1a);
        let q = v1b.add(p);
        return new Line(q,p);
    }
    //世界坐标转化为屏幕坐标
    static worldPointToScreen(camera,rect, point) {
        let halfWidth = rect.width / 2;
        let halfHeight = rect.height / 2;
        camera.updateMatrixWorld();
        camera.updateProjectionMatrix();
        let tempPoint =new THREE.Vector3().copy(point).project(camera);
        tempPoint.x = (tempPoint.x * halfWidth) + halfWidth;
        tempPoint.y = -(tempPoint.y * halfHeight) + halfHeight;
        tempPoint.z = 0;
        return tempPoint;
    }
    //在规定时间间隔内只执行最后一次
    static waitToExecute(previousTime,timeInterval,timeout,fuc) {
        let curTime = new Date().getTime();
        if (previousTime.t === undefined) {
            previousTime.t = curTime;
        }
        if (curTime - previousTime.t < timeInterval) {
            if (timeout.t !== undefined) {
                clearTimeout(timeout.t);
                timeout.t = undefined;
            }
            timeout.t = setTimeout(() => {
                previousTime.t = undefined;
                fuc();
            }, timeInterval - (curTime - previousTime.t));
        } else {
            if (timeout.t !== undefined) {
                clearTimeout(timeout.t);
                timeout.t = undefined;
            }
            previousTime.t = undefined;
            fuc();
        }
    }
    //数值在范围内
    static zoneEqual(target,delta,value){
        return (value>target-delta&&value<target+delta);
    }
}

