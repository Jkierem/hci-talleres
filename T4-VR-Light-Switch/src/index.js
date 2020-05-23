import * as THREE from 'three';

import "three/examples/js/vr/HelioWebXRPolyfill"

import { VRButton } from 'three/examples/jsm/webxr/VRButton';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

var clock = new THREE.Clock();

var container;
var camera, scene, raycaster, renderer;

var room;

var controller, controllerGrip, tempMatrix = new THREE.Matrix4();

const throttle = (f,timing=1000) => {
    let id = null
    let ready = true
    return () => {
        if(id == null){
            f()
            id = setTimeout(() => id = null,timing);
        }
    }
}

const light = new THREE.DirectionalLight(0xffffff);
light.position.set(1, 1, 1).normalize();
let on = true;
const toggleLight = () => {
    light.color = on ? { r:0.1, g:0.1, b:0.1 } : { r:1, g:1, b:1 }
    on = !on
}

const handleIntersections = throttle(() => {
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, - 1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(room.children);
    intersects.forEach(x => {
        if(x.object.toggleLight){
            x.object.toggleLight()
        }
    })
},500)


init();
animate();

function init() {

    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x505050);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10);
    camera.position.set(0, 1.6, 3);
    scene.add(camera);

    room = new THREE.LineSegments(
        new BoxLineGeometry(6, 6, 6, 10, 10, 10).translate(0, 3, 0),
        new THREE.LineBasicMaterial({ color: 0x808080 })
    );
    scene.add(room);

    scene.add(new THREE.HemisphereLight(0x606060, 0x404040));
    
    scene.add(light);

    const sgeometry = new THREE.SphereGeometry( 1, 32, 32 );
    const smaterial = new THREE.MeshLambertMaterial( {color: 0xffff00} );
    const sphere = new THREE.Mesh( sgeometry, smaterial );
    sphere.position.x =  0
    sphere.position.y =  2
    sphere.position.z =  -4
    sphere.toggleLight = toggleLight
    
    room.add(sphere)

    var geometry = new THREE.BoxBufferGeometry(1, 1, 1);

    var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({ color: 0x00ffff }));
    object.position.x =  0
    object.position.y =  0
    object.position.z =  -2
    
    room.add(object);

    raycaster = new THREE.Raycaster();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    //

    function onSelectStart() {

        this.userData.isSelecting = true;

    }

    function onSelectEnd() {

        this.userData.isSelecting = false;

    }

    controller = renderer.xr.getController(0);
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
    controller.addEventListener('connected', function (event) {

        this.add(buildController(event.data));

    });
    controller.addEventListener('disconnected', function () {

        this.remove(this.children[0]);

    });
    scene.add(controller);

    var controllerModelFactory = new XRControllerModelFactory();

    controllerGrip = renderer.xr.getControllerGrip(0);
    controllerGrip.add(controllerModelFactory.createControllerModel(controllerGrip));
    scene.add(controllerGrip);

    window.addEventListener('resize', onWindowResize, false);

    //

    document.body.appendChild(VRButton.createButton(renderer));
    window.onclick = handleIntersections

}

function buildController(data) {
    switch (data.targetRayMode) {
        case 'gaze':
            var geometry = new THREE.RingBufferGeometry(0.02, 0.04, 32).translate(0, 0, - 1);
            var material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
            return new THREE.Mesh(geometry, material);
    }

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    if (controller.userData.isSelecting === true) {
        handleIntersections()
    }
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    renderer.render(scene, camera);

}