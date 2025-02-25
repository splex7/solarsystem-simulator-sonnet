import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.setupRenderer();
        this.setupLighting();
        this.createStars();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x000814, 1);
        document.body.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(20, 10, 20);
        this.camera.lookAt(0, 0, 0);
        return this.camera;
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
        this.scene.add(ambientLight);

        // Main point light (sun-like)
        const mainLight = new THREE.PointLight(0xFFFFFF, 3);
        mainLight.position.set(20, 10, 20);
        this.scene.add(mainLight);

        // Secondary lights
        const secondaryLight = new THREE.PointLight(0xFFFFFF, 1.5);
        secondaryLight.position.set(-15, -10, -15);
        this.scene.add(secondaryLight);

        const fillLight = new THREE.PointLight(0xFFFAF0, 1);
        fillLight.position.set(0, 15, 0);
        this.scene.add(fillLight);
    }

    createStars() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.2,
            transparent: true,
            opacity: 1,
            blending: THREE.AdditiveBlending
        });

        const starsVertices = [];
        for(let i = 0; i < 12000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(stars);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }
}