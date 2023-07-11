import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export function createWalls(scene) 
{
    // Box
    const boxGeometry = new THREE.BoxBufferGeometry(20, 20, 20);       
    const boxMaterial = new THREE.MeshBasicMaterial({                                   
        color: 0xFF0000
    });        
    
    //Box array
    const box = [];
    for(let i = 0; i < 20; i++)
    {
        box[i] = new THREE.Mesh(boxGeometry, boxMaterial);
        box[i].castShadow = true;
        box[i].receiveShadow = true;

        scene.add(box[i]);
    }

//-------------------------------* Positioning the walls *--------------------------------------------

   //box[0].position.set(30, 10, 30);
    // box[7].scale.set(1, 1, 1);
    



//------------------------------------------------------------------------------------------------

    //Box colliders array
    const boxCollider = [];
    for(let i = 0; i < 20; i++)
    {
        boxCollider[i] = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());             // axis-aligned bounding box (AABB)
        boxCollider[i].setFromObject(box[i]);
    }

    //-----------------------Helper----------------------------
    // const helper = new THREE.BoundingBoxHelper(box, 0x0000FF);
    // helper.update();    
    //scene.add(helper);
    //------------------------------------------------------------

    return boxCollider;
}