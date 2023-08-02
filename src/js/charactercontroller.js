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
        gltfLoader.load(`https://masterfloppa.github.io/Demon-Dungeon/models/${objToRender}/scene.gltf`, (gltf) =>  {

            let object = gltf.scene;
            object.scale.set(0.7, 0.8, 0.8);

            object.position.set(-41, 4, -41);

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
            console.log('Character ' + (xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
        //If there is an error, log it
            console.error(error);
        }
        );
    }

    addCollider(){
        //this.objCollider = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        this.objCollider = new THREE.Sphere(new THREE.Vector3(10, 5, 0), 1.8);
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

        //console.log(this.objCollider.center);
     
        // const helper = new THREE.BoxHelper(controlObject, 0x0000FF);
        // helper.scale.set(0.1, 0.1, 0.1); 
        // this._params.scene.add(helper);
        // Update the collider position

    
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
        forward.multiplyScalar(velocity.z * timeInSeconds);

        let a = new THREE.Vector3(0, 0, 0);
        a.addVectors(controlObject.position, forward);
        const pointOfCollision = a;
        this.objCollider.center=pointOfCollision;

        //---------------- Collision Check ---------------------------
        for(let i=0; i<this._params.collider.length; i++)
        {
            if(this._params.collider[i].intersectsSphere(this.objCollider))
            {
                return;
            }
        }
        //----------------------------------------------------------

        controlObject.position.add(forward);
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
