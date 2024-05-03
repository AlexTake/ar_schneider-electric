import * as THREE from 'three';

import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

const container = document.getElementById('container');
const viewer = document.getElementById('model-viewer')

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

const pmremGenerator = new THREE.PMREMGenerator(renderer);


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x95b4e6);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.05, 0.3);

let frame_color = "anthracite";
let button_count = "one";
let button_color = "anthracite";

document.querySelectorAll('.color-square-frame').forEach(function (element) {
    element.addEventListener('click', function () {
        frame_color = this.getAttribute('name');
        LoadFrame();
    });
});

document.querySelectorAll('.number').forEach(function (element) {
    element.addEventListener('click', function () {
        button_count = this.id;
        LoadButton();
    });
});

document.querySelectorAll('.color-square-btn').forEach(function (element) {
    element.addEventListener('click', function () {
        button_color = this.getAttribute('name');
        LoadButton();
    });
});

const loader = new GLTFLoader();

function LoadFrame() {
    removeOldModel("frame")
    loader.load(`./models/frame/${frame_color}.glb`, function (gltf1) {
        const model1 = gltf1.scene;
        model1.name = "frame"
        scene.add(model1);
        Export()
    }, undefined, function (error) {
        console.error(error);
    });

}

function LoadButton() {
    removeOldModel("btn")
    loader.load(`./models/${button_count}_button/${button_color}.glb`, function (gltf2) {
        const model2 = gltf2.scene;
        model2.name = "btn"
        scene.add(model2);
        Export()
    }, undefined, function (error) {
        console.error(error);
    });

}

function removeOldModel(name) {
    scene.children.filter(child => child.name && child.name.includes(name)).forEach(child => {
        scene.remove(child);
    });
}

window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

};

LoadFrame()
LoadButton()
animate()

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

document.getElementById("ExportBtn").addEventListener('click', OpenModel);

function exportGLTF() {
    const exporter = new GLTFExporter();
    exporter.parse(
        scene,
        function (result) {
            loadToModelViewerAndroid(result)
        },
        // called when there is an error in the generation
        function (error) {

            console.log('An error happened');

        },
        { binary: true }
    );
    console.log(exporter)
}

function loadToModelViewerAndroid(result) {
    viewer.src = URL.createObjectURL(new Blob([result], { type: 'model/gltf-binary' }));
}

async function exportUSDZ() {
    const exporter = new USDZExporter();
    const arraybuffer = await exporter.parse(scene);
    loadToModelViewerIOS(arraybuffer)
}

function loadToModelViewerIOS(result) {
    viewer.setAttribute('ios-src', URL.createObjectURL(new Blob([result], { type: 'application/octet-stream' })));
}

function Export() {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
        console.log("IOS detected");
        exportUSDZ()
    } else if (/Android/.test(navigator.userAgent)) {
        console.log("Android detected");
        exportGLTF()
    }
}

function OpenModel() {
    Export()
    if (viewer.canActivateAR);
    viewer.activateAR();
}