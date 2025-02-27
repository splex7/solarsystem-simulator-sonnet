import * as THREE from 'three';

export class Sun {
    constructor(scene) {
        this.scene = scene;
        this.textureLoader = new THREE.TextureLoader();
        this.createSun();
        this.createSunLight();
        
    }

    createSun() {
        const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: this.textureLoader.load('sun.jpg'),
            color: 0xffff00
        });

        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(0, 0, 0);
        this.sun.castShadow = false;
        this.sun.receiveShadow = false;
        this.sun.userData = {
            name: "Sun",
            description: "태양계의 중심에 있는 항성으로, 모든 행성에 빛과 열을 제공합니다.",
            funFact: "태양은 지구로부터 약 1억 5천만 킬로미터 떨어져 있으며, 표면 온도는 약 5,500°C입니다. 태양의 질량은 지구의 약 33만 배이며, 태양계 전체 질량의 99.86%를 차지합니다. 태양의 중심부 온도는 약 1,500만°C에 달하며, 매초 수소를 헬륨으로 융합하는 핵융합 반응이 일어나고 있습니다."
        };
        this.scene.add(this.sun);
    }

    createSunLight() {
        this.sunLight = new THREE.PointLight(0xffffff, 100.0, 100.0);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 50;
        this.scene.add(this.sunLight);
    }

    update() {
        this.sun.rotation.y += 0.001;
    }

    getSun() {
        return this.sun;
    }
}