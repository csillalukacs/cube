import * as THREE from 'three';
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';


export default class Teapot
{
    constructor(scene, camera) 
    {
        this.scene = scene;
        this.camera = camera;
        Teapot.ROTATION_DURATION = 200;
        this.animating = -1;

        const teapotGeometry = new TeapotGeometry(1, 10, 5);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(1,1,1), 
            roughness: 0.3, 
            metalness: 0.0, 
            side: THREE.DoubleSide, 
        });
        const mesh = new THREE.Mesh(teapotGeometry, material);

        this.mesh = mesh;
    }

    addtoScene() 
    {
        this.scene.add(this.mesh);
    }

    startRotation(axis)
    {
        console.log("starting rotation", axis)
        if (this.animating !== -1) return;
        this.rotationStarted = Date.now();

        this.startAngle = this.mesh.rotation[axis];
        this.endAngle = this.startAngle + Math.PI / 2;
        this.animating = axis;
    }

    rotate(axis, endAngle)
    {
        console.log("rotating", axis, endAngle)
        this.mesh.rotation[axis] = endAngle % (Math.PI * 2);
    }

    update() 
    {
        if (this.animating !== -1)
        {
            const delta = Date.now() - this.rotationStarted;
            const angle = delta*(Math.PI / 2 / Teapot.ROTATION_DURATION);
            this.rotate(this.animating, this.startAngle + angle);
            if (delta >= Teapot.ROTATION_DURATION)
            {
                this.rotate(this.animating, this.endAngle);
                this.animating = -1;
            }
            return;
        } 

    }
}