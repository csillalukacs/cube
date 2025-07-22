import * as THREE from 'three';


export default class Cubie
{
    constructor(x, y, z)      
    {
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = this.createMesh();
    }

    static directions = {
        UP: new THREE.Vector3(0, 1, 0),
        DOWN: new THREE.Vector3(0, -1, 0),
        LEFT: new THREE.Vector3(-1, 0, 0),
        RIGHT: new THREE.Vector3(1, 0, 0),
        FORWARD: new THREE.Vector3(0, 0, 1),
        BACK: new THREE.Vector3(0, 0, -1)
    }

    static colors = {
        WHITE: 0xffffff,
        YELLOW: 0xffd500,
        ORANGE: 0xff5800,
        RED: 0xb71234,
        BLUE: 0x0046ad,
        GREEN: 0x009b48,
    }

    static roughnessTexture = new THREE.TextureLoader().load('rect5.png');

    createMesh()
    {
        const geometry = new THREE.BoxGeometry(0.98, 0.98, 0.98).toNonIndexed();
        
        const positionAttribute = geometry.getAttribute( 'position' );
        const normals = geometry.getAttribute( 'normal');
            
        const colors = [];
        const color = new THREE.Color();
        const normal = new THREE.Vector3();

        for ( let i = 0; i < positionAttribute.count; i += 6 ) 
        {
            color.set(0x0);

            normal.fromBufferAttribute(normals, i);
            if (normal.equals(Cubie.directions.UP) && this.y === 1) color.set(Cubie.colors.WHITE);
            if (normal.equals(Cubie.directions.DOWN) && this.y === -1) color.set(Cubie.colors.YELLOW);
            if (normal.equals(Cubie.directions.LEFT) && this.x === -1) color.set(Cubie.colors.ORANGE);
            if (normal.equals(Cubie.directions.RIGHT) && this.x === 1) color.set(Cubie.colors.RED);
            if (normal.equals(Cubie.directions.BACK) && this.z === -1) color.set(Cubie.colors.BLUE);
            if (normal.equals(Cubie.directions.FORWARD) && this.z === 1) color.set(Cubie.colors.GREEN);
            
            for (let j = 0; j < 6; j++)
            {
                colors.push( color.r, color.g, color.b );
            }
        }
                        
        geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        const material = this.createMaterial(); 
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(this.x, this.y, this.z);
        return mesh;
    }

    createMaterial() 
    {
        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            defines: { USE_UV: '' },
            roughness: 1,
            metalness: 0.1
        });

        material.roughnessMap = Cubie.roughnessTexture

        material.onBeforeCompile = (shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <color_fragment>',
                `
                    #include <color_fragment>
                    vec2 cUv = vUv - 0.5;
                    if (abs(cUv.x) > 0.45 || abs(cUv.y) > 0.45) diffuseColor = vec4(0.0, 0.0, 0.0, 1.0);
                    if (abs(cUv.x) + abs(cUv.y) > 0.85) diffuseColor = vec4(0.0, 0.0, 0.0, 1.0);
                `
            );
        };
        
        return material;
    }
}