import * as THREE from 'three';

export class Planets {
    constructor(scene) {
        this.scene = scene;
        this.planets = [];
        this.orbits = [];
        this.planetsData = [];
        this.textureLoader = new THREE.TextureLoader();
    }

    async loadPlanets() {
        try {
            const response = await fetch('planets.json');
            const data = await response.json();
            this.planetsData = data.planets;
            this.createOrbits();
            this.createPlanets();
        } catch (error) {
            console.error('Error loading planets data:', error);
        }
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
                shininess: 100,
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
                angle: (Math.PI * 2 / this.planetsData.length) * index,
                funFact: data.funFact
            };

            // Load texture with proper error handling
            this.textureLoader.load(
                `${data.name.toLowerCase()}.jpg`,
                (texture) => {
                    material.map = texture;
                    material.emissiveMap = texture;
                    material.emissiveIntensity = 0.5;
                    material.needsUpdate = true;
                },
                undefined,
                (error) => {
                    console.error(`Error loading texture for ${data.name}:`, error);
                }
            );

            // Add cloud layer for Earth
            if (data.name === 'Earth') {
                this.addEarthClouds(planet);
            }

            this.scene.add(planet);
            this.planets.push(planet);
        });
    }

    addEarthClouds(planet) {
        const cloudGeometry = new THREE.SphereGeometry(1.05, 32, 32);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.6,
        });
        
        this.textureLoader.load(
            'cloud.jpg',
            (texture) => {
                cloudMaterial.map = texture;
                cloudMaterial.needsUpdate = true;
            },
            undefined,
            (error) => {
                console.error('Error loading cloud texture:', error);
            }
        );

        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        clouds.raycast = () => {};
        planet.add(clouds);
        planet.userData.clouds = clouds;
    }

    update() {
        this.planets.forEach((planet, index) => {
            const data = this.planetsData[index];
            planet.userData.angle += 0.005 / Math.sqrt(data.orbit);
            planet.position.x = Math.cos(planet.userData.angle) * data.orbit;
            planet.position.z = Math.sin(planet.userData.angle) * data.orbit;
            planet.rotation.y += 0.002;

            if (planet.userData.clouds) {
                planet.userData.clouds.rotation.y += 0.0022;
            }
        });
    }

    getPlanets() {
        return this.planets;
    }
}