import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
//import { RGBELoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/RGBELoader.js';

//-----------------------------------* CharacterControls *-------------------------------------
import { BasicCharacterControls, BasicCharacterControllerInput  } from "./charactercontroller.js";

//--------------------------------------* ThirdPersonCamera *----------------------------------------
import { ThirdPersonCamera } from "./tpcamera.js";



//------------------------------------------------* MAIN *--------------------------------------------
let world = null;
window.addEventListener('DOMContentLoaded', () => {
    world = new World();
});
//----------------------------------------------------------------------------------------------------



class World
{
    constructor() {
        this.animate = animate.bind(this);
        this.Initialize();
    }

Initialize() {
//--------------------------------------* ESSENTIALS *---------------------------------------------
this.renderer = new THREE.WebGLRenderer({
    //alpha: true,                                             
    antialias: true                                             
});
this.renderer.setSize(window.innerWidth, window.innerHeight);
this.renderer.shadowMap.enabled = true; 
this.renderer.setPixelRatio(window.devicePixelRatio);
//this.renderer.setClearColor(0xA3A3A3);
this.renderer.setAnimationLoop(this.animate);               //MOST IMPORTANT!!!
document.body.appendChild(this.renderer.domElement);


this.scene = new THREE.Scene();
this.camera = new THREE.PerspectiveCamera(
    50,                                             // Field of view (FOV)
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
this.camera.position.set(75, 20, 0);


const controls = new OrbitControls(this.camera, this.renderer.domElement);
controls.update();        // Does nothing?!


// Clock
this.clock = new THREE.Clock();

// Window resize
window.addEventListener('resize', () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
//------------------------------------------------------------------------------------------------



//---------------------------------------* BACKGROUND *-------------------------------------------
//IMAGE BACKGROUD

// const imgName = 'dungeon.jpg';
// const texturePath = `../bg/imgName`;
// const texture = new THREE.TextureLoader().load(texturePath);
// texture.needsUpdate = true;
//this.scene.background = texture;

const cubeTextureLoader = new THREE.CubeTextureLoader();
const texture = cubeTextureLoader.load([                // Takes an array of images (6) for each side of the cube
    '../../images/posx.jpg',                     // Right side                 
    '../../images/negx.jpg',                     // Left side
    '../../images/posy.jpg',                     // Top side
    '../../images/negy.jpg',                     // Bottom side
    '../../images/posz.jpg',                     // Back side
    '../../images/negz.jpg',                     // Front side           
]);                                                                         //Using a skybox
this.scene.background = texture;
//-------------------------------------------------
//HDRI BACKGROUD

// this.renderer.toneMapping = THREE.ACESFilmicToneMapping;       
// this.renderer.toneMappingExposure = 1;                        

// Interpolating between pixels to make the image look smoother
// this.renderer.outputEncoding = THREE.sRGBEncoding;                           // Gamma correction

// const rgbeLoader = new RGBELoader();
// const hdrToLoad = 'moonlit4k.hdr';
// rgbeLoader.load(`bg/hdrToLoad`, function (texture) {
//     texture.mapping = THREE.EquirectangularReflectionMapping;        // Makes the texture wrap around the scene
//     this.scene.background = texture;
//     this.scene.environment = texture;
// });

//------------------------------------------------------------------------------------------------



//--------------------------------------* HELPERS *-----------------------------------------------
const gridHelper = new THREE.GridHelper(30, 20);        // 30 is the size of the grid, 20 is the number of divisions
//this.scene.add(gridHelper);                                 

const axesHelper = new THREE.AxesHelper(10);             // 10 is the size of the axes helper
//this.scene.add(axesHelper);        
//------------------------------------------------------------------------------------------------



//---------------------------------------* Lighting *---------------------------------------------

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 3.0);
// directionalLight.position.set(-100, 100, 100);
directionalLight.position.set(0, 100, 50);
directionalLight.target.position.set(0, 0, 0);
directionalLight.castShadow = true;
directionalLight.shadow.bias = -0.001;
directionalLight.shadow.mapSize.width = 4096;
directionalLight.shadow.mapSize.height = 4096;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 500.0;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 500.0;
directionalLight.shadow.camera.left = 50;
directionalLight.shadow.camera.right = -50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
this.scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x808080, 1);
this.scene.add(ambientLight);



//-----------------------------------------
//FOG
//scene.fog = new THREE.Fog(0xFFFFFF, 10, 200);            // 10 is the near clipping plane, 200 is the far clipping plane
//scene.fog = new THREE.FogExp2(0x888888, 0.01);           // (color, density)

//------------------------------------------------------------------------------------------------



//--------------------------------------* AUDIO *-------------------------------------------------

const listener = new THREE.AudioListener();
this.camera.add(listener);
const audioLoader = new THREE.AudioLoader();

const sound = new THREE.Audio(listener);
const soundToRender = 'evil_laugh';
// audioLoader.load(`audio/soundToRender.mp3`, function (buffer) {
//   sound.setBuffer(buffer);
//   sound.setVolume(1);
//   sound.setLoop(true);
// });

//-------------------------------------------------------------------------------------------------


//--------------------------------------* OBJECTS *-------------------------------------------------
// Plane
const planeGeometry = new THREE.PlaneGeometry(100, 100, 10, 10);                 
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
this.scene.add(plane);


// Box
const boxGeometry = new THREE.BoxGeometry(20, 20, 20);                              // Create a box geometry
const boxMaterial = new THREE.MeshBasicMaterial({                                   // Create a material (color) for the box
    color: 0xFF0000
});        
this.box = new THREE.Mesh(boxGeometry, boxMaterial);

this.box.position.set(30, 10, 30);
this.box.castShadow = true;
this.box.receiveShadow = true;
this.scene.add(this.box);

//Box collider
this.boxCollider = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());             // axis-aligned bounding box (AABB)
this.boxCollider.setFromObject(this.box);
console.log(this.boxCollider);


//-----------------------Helper----------------------------

const helper = new THREE.BoundingBoxHelper(this.box, 0x0000FF);
helper.update();    
this.scene.add(helper);

//------------------------------------------------------------




this._Connect();
//------------------------------------------------------------------------------------------------
}

//--------------------------------------* CONNECTIONS *------------------------------------------------
_Connect() {
    // Connect camera and scene to the controls
    const params = {
        camera: this.camera,
        scene: this.scene,
    }
    this.controls = new BasicCharacterControls(params);
  
    // Connect camera and target to the third person camera
    const params2 = {
        camera: this.camera,
        target: this.controls,
    }
    //this.thirdPersonCamera = new ThirdPersonCamera(params2);
}
//------------------------------------------------------------------------------------------------
    updateFrame(timeElapsed) 
    {
        const timeElapsedS = timeElapsed; // * 0.001;

        if (this.controls) 
        {
            this.controls.Update(timeElapsedS);
        }

        if(this.thirdPersonCamera)
        {
            this.thirdPersonCamera.Update(timeElapsedS);
        }
        
        //----------------Tesing---------------------
        //const point = this.controls.Position
       // console.log(this.controls.Position);


        if(this.boxCollider.intersectsSphere(this.controls.objCollider))
        {
            // console.log(this.controls.collisonCheck);
            this.controls.collisonCheck = true;
            this.box.material.color.setHex( 0xffffff );
        }
        else
        {
            this.controls.collisonCheck = false;
            this.box.material.color.setHex( 0xff0000);
        }
        //------------------------------------------
    }
}


//--------------------------------------* ANIMATE *-----------------------------------------------
function animate(time) 
{
    // Update the controls
    const updateDelta = world.clock.getDelta();
    world.updateFrame(updateDelta);
    
 
    world.renderer.render(this.scene, this.camera);
}

//------------------------------------------------------------------------------------------------

