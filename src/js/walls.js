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
    for(let i = 0; i <= 20; i++)
    {
        box[i] = new THREE.Mesh(boxGeometry, boxMaterial);
        box[i].castShadow = true;
        box[i].receiveShadow = true;
        scene.add(box[i]);
    }

//-------------------------------* Positioning the walls *--------------------------------------------

   //maze walls
   //box[0].position.set(30, 10, 30);
    // box[7].scale.set(1, 1, 1);
    box[0].position.set(50, 10, 0); 
    box[0].scale.set(0.1, 1, 5);    //left wall
    box[1].position.set(-50, 10, 0); 
    box[1].scale.set(0.1, 1, 5);    //right wall
    box[2].position.set(0, 10, 50); 
    box[2].scale.set(5, 1, 0.1);  //top wall
    box[3].position.set(0, 10, -50); 
    box[3].scale.set(5, 1, 0.1);  //bottom wall
    box[4].position.set(26, 10, 0); 
    box[4].scale.set(2.5, 1, 0.1); //center left horizontal wall
    box[5].position.set(35, 10, -10); 
    box[5].scale.set(0.1, 1, 1);    //bottom left vertical wall
    box[6].position.set(35, 10, -40); 
    box[6].scale.set(0.1, 1, 1);    //bottom left vertical wall
    box[7].position.set(40, 10, 35); 
    box[7].scale.set(1, 1, 0.1);    //top left horizontal wall
    box[8].position.set(15, 10, 31.3); 
    box[8].scale.set(0.1, 1, 1.87); //center top vertical wall
    box[9].position.set(25, 10, 13.67); 
    box[9].scale.set(1, 1, 0.1);    //center top vertical horizontal protruding wall
    box[10].position.set(-40, 10, 20); 
    box[10].scale.set(1, 1, 0.1);   //top right horizontal wall
    box[11].position.set(-30, 10, 27); 
    box[11].scale.set(0.1, 1, 0.8); //top right horizontal vertical protruding wall
    box[12].position.set(20, 10, -32); 
    box[12].scale.set(0.1, 1, 1.8); //bottom left long vertical wall
    box[13].position.set(10, 10, -15); 
    box[13].scale.set(1, 1, 0.1);   //bottom left long vertical horizontal protruding wall
    box[14].position.set(0, 10, -22.5); 
    box[14].scale.set(0.1, 1, 0.85);   //centre bottom vertical wall
    box[15].position.set(-15, 10, -30); 
    box[15].scale.set(1.5, 1, 0.1); //center bottom  horizontal wall
    box[16].position.set(-30, 10, -12.3); 
    box[16].scale.set(0.1, 1, 1.87); //bottom right vertical wall
    box[17].position.set(-15, 10, 0); 
    box[17].scale.set(0.1, 1, 1.5); //center vertical wall
    box[18].position.set(-6, 10, 15); 
    box[18].scale.set(1, 1, 0.1);   //center vertical horizontal protruding wall
    box[19].position.set(5, 10, 25); 
    box[19].scale.set(0.1, 1, 1.1);   //center top vertical wall
    box[20].position.set(-6, 10, 35); 
    box[20].scale.set(1, 1, 0.1);   //center top horizontal wall



//------------------------------------------------------------------------------------------------

    //Box colliders array
    const boxCollider = [];
    for(let i = 0; i <= 20; i++)
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