import * as THREE from 'three';

export class PlanetLoader {
    constructor() {
        this.textureLoader = new THREE.TextureLoader();
    }

    async loadPlanets() {
        try {
            const response = await fetch('planets.json');
            const data = await response.json();
            return data.planets.map(planet => ({
                ...planet,
                color: parseInt(planet.color),
                texture: this.textureLoader.load(planet.textureFile)
            }));
        } catch (error) {
            console.error('Error loading planet data:', error);
            return [];
        }
    }
}