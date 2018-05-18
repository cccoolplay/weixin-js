import * as THREE from './three';
THREE.Sprite.prototype.raycast = function () {
    let intersectPoint = new THREE.Vector3();
    let worldPosition = new THREE.Vector3();
    let worldScale = new THREE.Vector3();
    return function raycast( raycaster, intersects ) {
        worldPosition.setFromMatrixPosition(this.matrixWorld);
        worldScale.setFromMatrixScale( this.matrixWorld );
        let min = new THREE.Vector2(worldPosition.x-this.center.x*worldScale.x,worldPosition.y-this.center.y*worldScale.y);
        let max = new THREE.Vector2(worldPosition.x+(1-this.center.x)*worldScale.x,worldPosition.y+(1-this.center.y)*worldScale.y);
        let box2d = new THREE.Box2(min,max);
        raycaster.ray.closestPointToPoint( worldPosition, intersectPoint );
        let contain = box2d.containsPoint(new THREE.Vector2(intersectPoint.x,intersectPoint.y));
        if(!contain) return;
        let distance = raycaster.ray.origin.distanceTo( intersectPoint );
        if ( distance < raycaster.near || distance > raycaster.far ) return;
        intersects.push( {
            distance: distance,
            point: intersectPoint.clone(),
            face: null,
            object: this
        } );
    };
}();