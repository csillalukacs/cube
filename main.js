import * as THREE from 'three';
import Cube from './Cube.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
 
window.addEventListener('mousemove', (event) =>
{
    cube.mouse.x = event.clientX / sizes.width * 2 - 1
    cube.mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
})

window.addEventListener('keydown', (e) =>
{
    if (cube.animating !== -1) return;
    switch (e.key)
    {
        case 'w':
            cube.startRotation(0);
            break;
        case 's':
            cube.startRotation(1);
            break;
        case 'a':
            cube.startRotation(2);
            break;
        case 'd':
            cube.startRotation(3);
            break;
        case 'q':
            cube.startRotation(4);
            break;
        case 'e':
            cube.startRotation(5);
            break;
    }
})


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;

// add some lights to the scene
const pointLight = new THREE.PointLight(0xffffff, 30)
pointLight.position.set(2,3,5)
scene.add(pointLight)

const pointLight2 = new THREE.PointLight(0xffffff, 30)
pointLight2.position.set(0, 3, 0)
scene.add(pointLight2)

const pointLight3 = new THREE.PointLight(0xffffff, 30)
pointLight3.position.set(0, 0, 6)
scene.add(pointLight3)

const ambientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(ambientLight)

const cube = new Cube(scene, camera);
cube.addtoScene(scene);
camera.position.z = 6;

function animate() 
{
    cube.update();
    renderer.render(scene, camera);

}
renderer.setAnimationLoop( animate );

