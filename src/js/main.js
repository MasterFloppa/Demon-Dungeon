import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
//import { RGBELoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/RGBELoader.js';

//-----------------------------------* CharacterControls *-------------------------------------
import { BasicCharacterControls, BasicCharacterControllerInput  } from "./charactercontroller.js";

//--------------------------------------* ThirdPersonCamera *----------------------------------------
import { ThirdPersonCamera } from "./tpcamera.js";

//--------------------------------------* WALLS *------------------------------------------------
import { createWalls } from './walls.js';



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
this.camera.position.set(0, 50, -100);
this.camera.lookAt(0, 50, -105);


// const controls = new OrbitControls(this.camera, this.renderer.domElement);
// controls.update();        // Does nothing?!


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


//------------------------------------------------------------------------------------------------



//--------------------------------------* AUDIO *-------------------------------------------------
const listener = new THREE.AudioListener();
this.camera.add(listener);
const audioLoader = new THREE.AudioLoader();

const sound = new THREE.Audio(listener);
let soundToRender = 'scary';
audioLoader.load(`../../Audio/${soundToRender}.mp3`, function (buffer) {
    sound.setBuffer(buffer);
    sound.setVolume(1);
    sound.setLoop(true);
});
this.bgSound = sound;

const sound2 = new THREE.Audio(listener);
soundToRender = 'Finish';
audioLoader.load(`../../Audio/${soundToRender}.mp3`, function (buffer) {
    sound2.setBuffer(buffer);
    sound2.setVolume(2);
    sound2.setLoop(true);
});
this.finishSound = sound2;

//-------------------------------------------------------------------------------------------------



//--------------------------------------* OBJECTS *-------------------------------------------------
// Plane
const floor = new THREE.TextureLoader().load('../../images/floor.jpg'); 
const planeGeometry = new THREE.PlaneGeometry(100, 100, 50, 50); //50 50 change                
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xa30d1b,
    map: floor,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
this.scene.add(plane);

// Plane 2
const bg = new THREE.TextureLoader().load('images/DemonGates.jpg');              

const planeMaterial2 = new THREE.MeshStandardMaterial({
    map: bg,
});
this.homebg = new THREE.Mesh(planeGeometry, planeMaterial2);
this.homebg.position.set(0, 50, -130);
this.scene.add(this.homebg);

//------------------------------------------------------------------------------------------------


this.boxCollider=createWalls(this.scene);
this.portalCollider = new THREE.Sphere(new THREE.Vector3(0, 0, 0) , 2);
this.gameOver=false;

this.loadPortal();
this._Connect();
//-------------------------------------------------------------------------------------------------
}


//----------------------------------------* Portal *-----------------------------------------------
loadPortal()
{
    let objToRender = 'magic_ring';
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(`../../models/${objToRender}/scene.gltf`, (gltf) =>  {

        let object = gltf.scene;
        object.scale.set(1.4, 1.4, 1.4);
        object.position.set(42, 1, -8);

        this.portal = object;
        this.portalCollider.center = object.position;
        this.scene.add(object);

    },
    function (xhr) {
    //While it is loading, log the progress
        console.log('Portal ' + (xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
    //If there is an error, log it
        console.error(error);
    }
    );
}

//--------------------------------------------------------------------------------------------------



//-------------------------------------* CONNECTIONS *----------------------------------------------
_Connect() {
    // Connect camera and scene to the controls
    const params = {
        camera: this.camera,
        scene: this.scene,
        collider: this.boxCollider,
    }
    this.controls = new BasicCharacterControls(params);
  
    // Connect camera and target to the third person camera
    const params2 = {
        camera: this.camera,
        target: this.controls,
        scene: this.scene,
    }
    this.thirdPersonCamera = new ThirdPersonCamera(params2);

}
//------------------------------------------------------------------------------------------------
    updateFrame(timeElapsed) 
    {
        const element=document.getElementById("container");
        if(element)
        {
            this.camera.position.set(0, 50, -100);
            return;
        }

        this.homebg.visible = false;

        if(this.portal)
            this.portal.rotation.y += timeElapsed*1.2;
        if(this.gameOver)
        {
            this.controls._target.rotation.y += timeElapsed*1.2;

            if(this.bgSound && this.bgSound.isPlaying)
                this.bgSound.stop();

            if(this.finishSound && !this.finishSound.isPlaying)
                this.finishSound.play();

            return;
        }
        
        if(this.bgSound && !this.bgSound.isPlaying)
            this.bgSound.play();

        if(this.portalCollider.intersectsSphere(this.controls.objCollider))
        {
            console.log("You win!");
            this.gameOver=true;
            this.camera.position.z -= 3;
            document.getElementById("winner").style.visibility="visible";
        }


        if (this.controls) 
        {
            this.controls.Update(timeElapsed);
        }
        if(this.thirdPersonCamera && this.controls && !this.gameOver)
        {
            this.thirdPersonCamera.Update(timeElapsed);
        }
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

  
