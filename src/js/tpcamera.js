import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

class ThirdPersonCamera 
{
    constructor(params) {
        this._params = params;
        this._camera = params.camera;

        this._currentPosition = new THREE.Vector3();
        this._currentLookat = new THREE.Vector3();
    }
  
    _CalculateIdealOffset() {
        const idealOffset = new THREE.Vector3(0, 10, -10); // original is 0, 20, -30
        idealOffset.applyQuaternion(this._params.target.Rotation);
        idealOffset.add(this._params.target.Position);
        return idealOffset;
    }
  
    _CalculateIdealLookat() {
        const idealLookat = new THREE.Vector3(0, -10, 50);
        idealLookat.applyQuaternion(this._params.target.Rotation);
        idealLookat.add(this._params.target.Position);
        return idealLookat;
    }
  
    Update(timeElapsed) 
    {
        const idealOffset = this._CalculateIdealOffset();
        const idealLookat = this._CalculateIdealLookat();

        const t = 1.0 - Math.pow(0.001, timeElapsed);               // For smoothing
        this._currentPosition.lerp(idealOffset, t);
        this._currentLookat.lerp(idealLookat, t);

        this._camera.position.copy(this._currentPosition);
        this._camera.lookAt(this._currentLookat);
    }
}

export { ThirdPersonCamera };