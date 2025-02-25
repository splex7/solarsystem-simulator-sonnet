import * as THREE from 'three';

export class PlanetManager {
    constructor(scene) {
        this.scene = scene;
        this.planets = [];
        this.orbits = [];
        this.planetsData = [];
        this.selectedPlanet = null;
        this.setupInfoCard();
        this.setupRaycaster();
    }

    setupInfoCard() {
        this.infoCard = document.getElementById('info-card');
        this.planetName = document.getElementById('planet-name');
        this.planetDescription = document.getElementById('planet-description');
    }

    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    async loadPlanets(planetLoader) {
        this.planetsData = await planetLoader.loadPlanets();
        this.createOrbits();
        this.createPlanets();
        this.createSun();
    }

    createOrbits() {
        this.planetsData.forEach(data => {
            const orbitGeometry = new THREE.RingGeometry(data.orbit, data.orbit + 0.05, 128);
            const orbitMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2;
            this.scene.add(orbit);
            this.orbits.push(orbit);
        });
    }

    createPlanets() {
        const planetGeometry = new THREE.SphereGeometry(1, 32, 32);

        this.planetsData.forEach((data, index) => {
            const material = new THREE.MeshPhongMaterial({
                map: data.texture,
                shininess: 100,
                emissiveMap: data.texture,
                emissiveIntensity: 0.5
            });

            const planet = new THREE.Mesh(planetGeometry, material);
            planet.castShadow = true;
            planet.receiveShadow = true;
            planet.scale.setScalar(data.size);
            planet.userData = { 
                name: data.name, 
                description: data.description,
                orbit: data.orbit,
                angle: (Math.PI * 2 / this.planetsData.length) * index
            };
            this.scene.add(planet);
            this.planets.push(planet);
        });
    }

    createSun() {
        const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
        const sunMaterial = new THREE.MeshPhongMaterial({
            emissive: 0xffff00,
            emissiveIntensity: 1,
            color: 0xff5500
        });

        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(0, 0, 0);
        this.scene.add(this.sun);

        // Add sun light
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.position.set(0, 0, 0);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.1;
        this.sunLight.shadow.camera.far = 30;
        this.scene.add(this.sunLight);
    }

    handleClick(event, camera) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera);
        const intersects = this.raycaster.intersectObjects(this.planets);

        if (intersects.length > 0) {
            this.selectedPlanet = intersects[0].object;
            this.showInfoCard(event);
            return this.selectedPlanet;
        } else {
            this.hideInfoCard();
            this.selectedPlanet = null;
            return null;
        }
    }

    showInfoCard(event) {
        this.infoCard.style.display = 'block';
        this.infoCard.style.top = '50%';
        const planetData = this.planetsData.find(data => data.name === this.selectedPlanet.userData.name);
        this.planetName.textContent = planetData.name;
        this.planetDescription.textContent = planetData.description;
        document.getElementById('planet-fun-fact').textContent = planetData.funFact;
    }

    hideInfoCard() {
        this.infoCard.style.display = 'none';
    }

    update() {
        this.planets.forEach((planet, index) => {
            const data = this.planetsData[index];
            planet.userData.angle += 0.005 / Math.sqrt(data.orbit);
            planet.position.x = Math.cos(planet.userData.angle) * data.orbit;
            planet.position.z = Math.sin(planet.userData.angle) * data.orbit;
            planet.rotation.y += 0.02;
        });
    }

    getSelectedPlanet() {
        return this.selectedPlanet;
    }
}