import * as THREE from '../three'

export default class ThreeUtility {

    static getCoordsFromClientXY(_clientX, _clientY, _width, _height, _x, _y, _w, _h) {

        if (_x === undefined) _x = 0;
        if (_y === undefined) _y = 0;
        if (_w === undefined) _w = _width;
        if (_h === undefined) _h = _height;

        if (_x === 0 && _y === 0 && _w === _width && _h === _height) {
            return new THREE.Vector2((_clientX / _width) * 2 - 1, -(_clientY / _height) * 2 + 1);
        }
        else {
            _clientX -= _x;
            _clientY -= _y;

            return new THREE.Vector2((_clientX / _w) * 2 - 1, -(_clientY / _h) * 2 + 1);
        }
    }

    static destroyObject3d(object3D) {
        object3D.traverse((go) => {
            go.raycast = () => { };
            if (go.geometry) {
                go.geometry.dispose();
            }
            if (go.material) {
                let clearMaterial = (m) => {
                    for (let k in m) {
                        if (/(map|Map)$/g.exec(k)) {
                            if (m[k]) {
                                m[k].dispose();
                            }
                        }
                    }
                    m.dispose();
                };
                if (Array.isArray(go.material)) {
                    go.material.forEach((m) => {
                        clearMaterial(m);
                    })
                } else {
                    clearMaterial(go.material);
                }
            }
        });
        if (object3D.parent) {
            object3D.parent.remove(object3D);
        }
        object3D.raycast = () => { }
    }

    static guid() {
        let s4 = () => {
            {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
        };

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }
}