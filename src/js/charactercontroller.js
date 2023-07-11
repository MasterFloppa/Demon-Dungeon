import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

class BasicCharacterControls {
    constructor(params) {
      this._Init(params);
    }
  
    _Init(params) {
      this._params = params;
      this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
      this._acceleration = new THREE.Vector3(1, 0.50, 50.0);                 
      this._velocity = new THREE.Vector3(0, 0, 0);
      this._position = new THREE.Vector3();
  
      this._input = new BasicCharacterControllerInput();

      this.collisonCheck = false;

      this.LoadModel();
      this.addCollider();
    }

    LoadModel(){
        let objToRender = 'demon';
        const gltfLoader = new GLTFLoader();
        gltfLoader.load(`../../models/${objToRender}/scene.gltf`, (gltf) =>  {

            let object = gltf.scene;
            object.scale.set(1, 1, 1);
            object.position.set(10, 5, 0);

            this._target = object;
            this._params.scene.add(object);

            object.traverse(function (child){
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
    
        },
        function (xhr) {
        //While it is loading, log the progress
            console.log('Model ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
        //If there is an error, log it
            console.error(error);
        }
        );
    }

    addCollider(){
        this.objCollider = new THREE.Sphere(new THREE.Vector3(10, 5, 0) , 2);
    }
    
    get Position() {
        return this._position;
    }

    get Rotation() {
        if (!this._target) {                        
            return new THREE.Quaternion();          // Used by the camera to rotate the camera
        }
        return this._target.quaternion;
    }
  
    Update(timeInSeconds) {
    
        if (!this._target) {                        // Very IMPORTANT, if the target is not loaded, do not update
            return;
        }

        const velocity = this._velocity;    
        const controlObject = this._target; 

        // Update the collider position
        const idealColliderPosition = new THREE.Vector3(0, 0, 0);        
        idealColliderPosition.applyQuaternion(controlObject.quaternion);
        idealColliderPosition.add(controlObject.position);
        this.objCollider.center=idealColliderPosition;

        if(!this.collisonCheck)
        {         
            //---------------------* Deceleration *---------------------
            const frameDecceleration = new THREE.Vector3(
                velocity.x * this._decceleration.x,
                velocity.y * this._decceleration.y,
                velocity.z * this._decceleration.z
            );
        
            //Apply the decceleration to the velocity until the velocity is 0
            frameDecceleration.multiplyScalar(timeInSeconds);                         
            frameDecceleration.z = Math.sign(frameDecceleration.z) * 
                                    Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));  // Make sure the decceleration does not exceed the velocity
            velocity.add(frameDecceleration);
            //-----------------------------------------------------------

            const _Q = new THREE.Quaternion();
            const _A = new THREE.Vector3();
            const _R = controlObject.quaternion.clone();

            const acc = this._acceleration.clone();                                                
            if (this._input._keys.shift) {                                       
                acc.multiplyScalar(2.5);
            }
            if (this._input._keys.forward){ // && !this.collisonCheck) {
                velocity.z += acc.z * timeInSeconds;
            }
            if (this._input._keys.backward) {
                velocity.z -= acc.z * timeInSeconds;
            }
            if (this._input._keys.left) {
                _A.set(0, 1, 0);                                                                      // Set the axis of rotation to the y-axis
                _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * this._acceleration.y);              // Rotate the quaternion by the angle of rotation
                _R.multiply(_Q);                                                                      // Multiply the quaternion by the rotation quaternion
            }
            if (this._input._keys.right) {
                _A.set(0, 1, 0);
                _Q.setFromAxisAngle(_A, -Math.PI * timeInSeconds * this._acceleration.y);
                _R.multiply(_Q);
            }
            controlObject.quaternion.copy(_R);                      // Set the rotation of the character to the new rotation
        
            const forward = new THREE.Vector3(0, 0, 1);
            forward.applyQuaternion(controlObject.quaternion);      // To make sure the character moves in the direction it is looking at
            forward.normalize();                                    // To make sure the character moves at the same speed in all directions, 
                                                                    // So that diagonal movement, is not faster than horizontal or vertical movement
        
            const sideways = new THREE.Vector3(1, 0, 0);
            //sideways.applyQuaternion(controlObject.quaternion);
            sideways.normalize();
        
            forward.multiplyScalar(velocity.z * timeInSeconds);
            sideways.multiplyScalar(velocity.x * timeInSeconds);

            controlObject.position.add(forward);         // Add the velocity to the current position
            controlObject.position.add(sideways);

        }
        else{
            //If colliding with the wall
            const dir=Math.sign(velocity.z);
            const idealJumpback = new THREE.Vector3(0, 0, -3*dir);
            idealJumpback.applyQuaternion(controlObject.quaternion);
            idealJumpback.add(controlObject.position);

            const t = 1.0 - Math.pow(0.001, timeInSeconds);
            controlObject.position.lerp(idealJumpback, t);
        }

        this._position.copy(controlObject.position);
    }
}

class BasicCharacterControllerInput 
{
    constructor() {
      this._Init();    
    }
  
    _Init() {
        this._keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            shift: false,
        };
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
    }
  
    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._keys.forward = true;
                break;
            case 65: // a
                this._keys.left = true;
                break;
            case 83: // s
                this._keys.backward = true;
                break;
            case 68: // d
                this._keys.right = true;
                break;
            // case 32: // SPACE
            //   this._keys.space = true;
            //   break;
            case 16: // SHIFT
                this._keys.shift = true;
                break;
        }
    }
  
    _onKeyUp(event) {
        switch(event.keyCode) {
            case 87: // w
                this._keys.forward = false;
                break;
            case 65: // a
                this._keys.left = false;
                break;
            case 83: // s
                this._keys.backward = false;
                break;
            case 68: // d
                this._keys.right = false;
                break;
            // case 32: // SPACE
            //   this._keys.space = false;
            //   break;
            case 16: // SHIFT
                this._keys.shift = false;
                break;
        }
    }
};


export { BasicCharacterControls, BasicCharacterControllerInput  };