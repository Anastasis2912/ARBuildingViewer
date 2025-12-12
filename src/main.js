import './style.css'
import javascriptLogo from './javascript.svg'
import viteLogo from '/vite.svg'
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let camera, scene, renderer;
let AmongUsNFTMesh;

inti();

async function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setPixelRation(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setAnimationLoop(render);
  renderer.xr.enable = true;
  const container = document.querySelector("#scene-container");
  container.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  ambient.position.set(0.5, 1, 0.25);
  scene.add(ambient);

  //setup the image targets
  const imgNFTAmongUs = document.getElementById("imgNFTAmongUs");
  const imgNFTAmongUsBitmap = await createImageBitmap(imgNFTAmongUs);
  console.log(imgNFTAmongUsBitmap);


  const button = ARButton.CreateButton(render, {
    requiredFeatures: ["image-tracking"],
    trackedImages: [
      {
        image: imgNFTAmongUsBitmap,  //tell webxr this is the image target we want to track
        widthInMeters:0.2,  //in meters what the size of the PRINTED image in the real world
      },
    ],
    //this is for the mobile debug
    optionalFeatures: ["dom-overlay"],
    domOverlay: {
      root: document.body,
    },
  });
  document.body.appendChild(button);

  //add object for out Amongus marker image
  const AmongUsMarkerGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  AmongUsMarkerGeometry.translate(0, 0.1, 0);
  const AmongUsMarkerMaterial = new THREE.MeshNormalMaterial({
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  AmongUsMarkerMesh = new THREE.Mesh(AmongUsMarkerGeometry, AmongUsMarkerMaterial);
  AmongUsNFTMesh.name = "AmongUsMarkerCube";
  hiroMarkerMesh.matrixAutoUpdate = false;
  AmongUsNFTMesh.visible = false;
  scene.add(AmongUsNFTMesh);
}

function render(timestamp, frame){
  if(frame){
    const result = frame.getImageTrackingResult(); //checking if there are any images we track

    console.log(results);

    //if we have more than one images the results are an array
    for (const result of results) {
      // the result's index is the image's position in the trackedImages array specified at session creation
      const imageIndex = result.index;

      //get the pose of the image relatice to a refrence space.
      const referenceSpace = renderer.xr.getReferenceSpace();
      const pose = frame.getPose(result.imageSpace, referenceSpace);

      //checking the state of the tracking
      const state = result.trackingState;
      console.log(state);

      if (state == "tracked") {
        console.log("ImageIndex: ", imageIndex);

          if (imageIndex == 0) {
            AmongUsNFTMesh.visible = true;
            //update the target mesh when the Amongus image target is found
            AmongUsMarkerMesh.matrix.fromArray(pose.transform.matrix);
            console.log("AmongUs image target has been found", AmongUsMarkerMesh.position);
          }
          // Here we could place another 'if' like the one above to update any other trackable objects
      }

      else if (state == "emulated") {
        //console.log("Image target no longer seen");
      }
    }
  }
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(wiondow.innerWidth, window.innerHeight);
});