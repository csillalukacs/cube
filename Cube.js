import * as THREE from 'three';
import Cubie from './Cubie.js';
import {sizes} from './main.js';

export default class Cube
{
    constructor(scene, camera) 
    {
        this.scene = scene;
        this.camera = camera;
        this.group = new THREE.Group();
        this.animating = -1;
        this.cubies = [];
        this.raycaster = new THREE.Raycaster()
        this.mouse = new THREE.Vector2()
        this.rotationStarted = null;
        this.highlightedSide = null;
        this.mouseDownPosition = new THREE.Vector2();

        Cube.ROTATION_DURATION = 200;
        
        this.sides = [];
        // 0 top, 1 bottom, 2 left, 3 right, 4 front, 5 back
        for (let i = 0; i < 6; i++)
        {
            const gr = new THREE.Group();
            this.sides.push({array: [], group: gr});
            this.group.add(gr);
        }

        this.theRest = new THREE.Group();
        this.group.add(this.theRest);

        const geometry = new THREE.BoxGeometry(3, 3, 3);
        const material = new THREE.MeshStandardMaterial({ 
            color: new THREE.Color(1,0.5,1), 
            opacity: 0.1,
            roughness: 0.3, 
            metalness: 0.0, 
            side: THREE.DoubleSide, 
            transparent: true,
            visible: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        this.hitbox = mesh;
        this.group.add(mesh);

        window.addEventListener("mouseup", this.onClick.bind(this));
        window.addEventListener("mousedown", this.mouseDown.bind(this));
    }

    mouseDown(event)
    {
        this.mouseDownPosition.x = (event.clientX / sizes.width) * 2 - 1
        this.mouseDownPosition.y = - (event.clientY / sizes.height) * 2 + 1
    }


    onClick(event)
    {
        const mouseUpX = (event.clientX / sizes.width) * 2 - 1
        const mouseUpY = - (event.clientY / sizes.height) * 2 + 1
        if (Math.abs(mouseUpX - this.mouseDownPosition.x) > 0.01 || Math.abs(mouseUpY - this.mouseDownPosition.y) > 0.01) return;
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObject(this.hitbox);
        if (!intersects[0]) return;
        const face = intersects[0].face;
        for (let i = 0; i < 6; i++)
        {
            const key = Object.keys(Cubie.directions)[i];
            if (face.normal.equals(Cubie.directions[key]))
            {
                this.startRotation(i);     
            }
        }
    }

    getRelativePosition(cubie)
    {
        let position = new THREE.Vector3();
        cubie.mesh.getWorldPosition(position);
        const mat = this.group.matrix.clone();
        mat.invert();
        position.applyMatrix4(mat);
        return position.round();
    }

    isOnSide(cubie, sideIndex)
    {
        let position = this.getRelativePosition(cubie);
        switch (sideIndex)
        {
            case 0:
                return Math.abs(position.y - 1) < 0.01;
            case 1:
                return Math.abs(position.y + 1) < 0.01;
            case 2:
                return Math.abs(position.x + 1) < 0.01;
            case 3:
                return Math.abs(position.x - 1) < 0.01;
            case 4:
                return Math.abs(position.z - 1) < 0.01;
            case 5:
                return Math.abs(position.z + 1) < 0.01;
        }
    }

    updateSide(sideIndex)
    {
        if (this.animating !== -1) return;
        this.cubies.forEach(cubie => 
        {
            if (this.isOnSide(cubie, sideIndex))
            {
                if (!this.sides[sideIndex].array.includes(cubie))
                    this.sides[sideIndex].array.push(cubie);
                this.sides[sideIndex].group.attach(cubie.mesh);
            }
            else
            {
                this.sides[sideIndex].array = this.sides[sideIndex].array.filter(c => c !== cubie);
                this.theRest.attach(cubie.mesh);
            }
        });
    }
  
    createCubie(x, y, z) 
    {
        const cubie = new Cubie(x, y, z);
        this.cubies.push(cubie);
        return cubie;
    }

    addtoScene() 
    {
        for (let i = -1; i < 2; i++) 
        {
            for (let j = -1; j < 2; j++) 
            {
                for (let k = -1; k < 2; k++) 
                {
                    const cubie = this.createCubie(i, j, k);
                    this.theRest.add(cubie.mesh);
                }
            }
        }
        this.scene.add(this.group);
    }

    startRotation(sideIndex)
    {
        if (this.animating !== -1) return;
        this.resetHighlight();
        this.updateSide(sideIndex);
        this.rotationStarted = Date.now();
        const axis = (sideIndex === 0 || sideIndex === 1) ? "y" : 
        (sideIndex === 2 || sideIndex === 3) ? "x" : "z";
        this.startAngle = this.sides[sideIndex].group.rotation[axis];
        const reverse = sideIndex === 0 || sideIndex === 3 || sideIndex === 4;
        this.endAngle = this.startAngle + (Math.PI / 2) * ( reverse ? -1 : 1);
        this.animating = sideIndex;
    }

    rotateSide(sideIndex, endAngle)
    {
        const axis = (sideIndex === 0 || sideIndex === 1) ? "y" : 
        (sideIndex === 2 || sideIndex === 3) ? "x" : "z";

        this.sides[sideIndex].group.rotation[axis] = endAngle % (Math.PI * 2);
    }

    resetHighlight()
    {
        for (const cubie of this.cubies)
        {
            cubie.mesh.material.emissive.set(0x000000);
        }
        this.highlightedSide = null;
    }

    update() 
    {
        this.group.rotation.x += 0.002;
        this.group.rotation.y += 0.002;

        if (this.animating !== -1)
        {
            const reverse = this.animating === 0 || this.animating === 3 || this.animating === 4;
            const delta = Date.now() - this.rotationStarted;
            const angle = delta*(Math.PI / 2 / Cube.ROTATION_DURATION)*(reverse ? -1 : 1);
            this.rotateSide(this.animating, this.startAngle + angle);
            if (delta >= Cube.ROTATION_DURATION)
            {
                this.rotateSide(this.animating, this.endAngle);
                const r = (angle) => Math.round(angle / (Math.PI/2)) * (Math.PI/2);
                this.cubies.forEach(cubie => {
                    cubie.mesh.rotation.x = r(cubie.mesh.rotation.x);
                    cubie.mesh.rotation.y = r(cubie.mesh.rotation.y);
                    cubie.mesh.rotation.z = r(cubie.mesh.rotation.z);
                })
                this.animating = -1;
            }
            return;
        } 

        this.raycaster.setFromCamera(this.mouse, this.camera)
        const intersects = this.raycaster.intersectObject(this.hitbox);

        if (!intersects.length)
        {
            this.resetHighlight();
            return;
        };

        const face = intersects[0].face;
        for (let i = 0; i < 6; i++)
        {
            const key = Object.keys(Cubie.directions)[i];
            if (this.highlightedSide !== i && face.normal.equals(Cubie.directions[key]))
            {
                this.updateSide(i);
                this.resetHighlight();
                this.highlightedSide = i;
                for (const cubie of this.sides[i].array)
                {
                    cubie.mesh.material.emissive.set(0x444444);
                }
            }
        }
    }
}