import * as THREE from './three';
import Event from '../event';
let loadEvent = new Event();
let loadManager = new THREE.LoadingManager();
loadManager.onStart = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
loadManager.onLoad = function ( ) {
    console.log( 'Loading complete!');
};
loadManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
    console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
};
loadManager.onError = function ( url ) {
    console.log( 'There was an error loading ' + url );
};
export default {
    loadEvent:loadEvent,
    loadManager:loadManager
}

