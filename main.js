import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
// add fog
scene.fog = new THREE.FogExp2(0x000814, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0x000814, 1);
document.body.appendChild(renderer.domElement);

// Camera initial position
camera.position.set(20, 10, 20);
camera.lookAt(0, 0, 0);

// Planets data
const planetsData = [
    { name: 'Mercury', description: 'The smallest and innermost planet in the Solar System.', color: 0xE5E5E5, size: 1*0.5, orbit: 6 },
    { name: 'Venus', description: 'Often called Earth\'s sister planet due to similar size.', color: 0xFFA500, size: 1.2*0.5, orbit: 8 },
    { name: 'Earth', description: 'Our home planet, the only known planet to harbor life.', color: 0x4169E1, size: 1.3*0.5, orbit: 10 },
    { name: 'Mars', description: 'The Red Planet, named after the Roman god of war.', color: 0xFF4500, size: 1.1*0.5, orbit: 12 }
];

// Create texture loader before using it
const textureLoader = new THREE.TextureLoader();

// Create Sun
const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
const sunMaterial = new THREE.MeshPhongMaterial({
    // 태양의 발광 색상 (노란색)
    emissive: 0xffff00,
    // 태양 텍스처 맵 로드
    map: textureLoader.load(`sun.jpg`),
    // 표면 광택도
    shininess: 100,
    // 발광 텍스처 맵 로드
    emissiveMap: textureLoader.load(`sun.jpg`),
    // 발광 강도
    emissiveIntensity: 0.5
});

const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.position.set(0, 0, 0);
scene.add(sun);

// Add a point light at the sun's position for better illumination
const sunLight = new THREE.PointLight(0xffffff, 100.0, 100.0);
sunLight.position.set(0, 0, 0);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
scene.add(sunLight);

// Create orbital paths
const orbits = [];
planetsData.forEach(data => {
    const orbitGeometry = new THREE.RingGeometry(data.orbit, data.orbit + 0.05, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
        
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    orbits.push(orbit);
});

// Create planets
const planets = [];
const planetGeometry = new THREE.SphereGeometry(1, 32, 32);
// Remove duplicate textureLoader declaration

planetsData.forEach((data, index) => {
    const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load(`${data.name.toLowerCase()}.jpg`),
        shininess: 100,
        emissiveMap: textureLoader.load(`${data.name.toLowerCase()}.jpg`),
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
        angle: (Math.PI * 2 / planetsData.length) * index
    };

    // Load texture with proper error handling
    textureLoader.load(
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
        const cloudGeometry = new THREE.SphereGeometry(1.05, 32, 32);
        const cloudMaterial = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0.6,
        });
        
        // Load cloud texture with error handling
        textureLoader.load(
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
    scene.add(planet);
    planets.push(planet);
});

// Add stars
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
scene.add(stars);

// Remove old lighting setup
// Lighting
// Enhanced lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.05); // Increased intensity
scene.add(ambientLight);

// Main point light (sun-like)
// const mainLight = new THREE.PointLight(0xFFFFFF, 3); // Increased intensity
// mainLight.position.set(20, 10, 20);
// scene.add(mainLight);

// Secondary lights for better coverage
// const secondaryLight = new THREE.PointLight(0xFFFFFF, 1.5); // Increased intensity
// secondaryLight.position.set(-15, -10, -15);
// scene.add(secondaryLight);

// const fillLight = new THREE.PointLight(0xFFFAF0, 1); // Increased intensity
// fillLight.position.set(0, 15, 0);
// scene.add(fillLight);

// Raycaster for planet selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Info card elements
const infoCard = document.getElementById('info-card');
const planetName = document.getElementById('planet-name');
const planetDescription = document.getElementById('planet-description');

// Camera animation
let targetPosition = null;
let isAnimating = false;
let selectedPlanet = null;
let cameraOffset = new THREE.Vector3(0, 2, 5);

// Click event handler
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        selectedPlanet = intersects[0].object;
        isAnimating = true;

        // Show info card
        infoCard.style.display = 'block';
        infoCard.style.left = event.clientX + 'px';
        infoCard.style.top = event.clientY + 'px';
        planetName.textContent = selectedPlanet.userData.name;
        planetDescription.textContent = selectedPlanet.userData.description;
    } else {
        // Reset camera position
        selectedPlanet = null;
        targetPosition = new THREE.Vector3(20, 10, 20);
        isAnimating = true;
        infoCard.style.display = 'none';
    }
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Camera Controller Class
class CameraController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        this.target = new THREE.Vector3(0, 0, 0);
        this.zoomSpeed = 0.1;
        this.rotationSpeed = 0.002;

        // Mouse/Touch state
        this.pointerDown = false;
        this.pointerPosition = new THREE.Vector2();
        this.previousPointerPosition = new THREE.Vector2();
        this.pinchStartDistance = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.domElement.addEventListener('mousedown', this.onPointerDown.bind(this));
        this.domElement.addEventListener('mousemove', this.onPointerMove.bind(this));
        this.domElement.addEventListener('mouseup', this.onPointerUp.bind(this));
        this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this));

        // Touch events
        this.domElement.addEventListener('touchstart', this.onTouchStart.bind(this));
        this.domElement.addEventListener('touchmove', this.onTouchMove.bind(this));
        this.domElement.addEventListener('touchend', this.onTouchEnd.bind(this));

        // Prevent context menu
        this.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

        // Click event for planet selection
        this.domElement.addEventListener('click', onMouseClick);
    }

    onPointerDown(event) {
        if (event.button === 0) {
            this.pointerDown = true;
            this.pointerPosition.set(event.clientX, event.clientY);
            this.previousPointerPosition.copy(this.pointerPosition);
        }
    }

    onPointerUp(event) {
        if (event.button === 0) {
            this.pointerDown = false;
        }
    }

    onPointerMove(event) {
        if (!isAnimating) {
            this.previousPointerPosition.copy(this.pointerPosition);
            this.pointerPosition.set(event.clientX, event.clientY);

            if (this.pointerDown) {
                this.handleRotation();
            }
        }
    }

    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            this.pointerDown = true;
            this.pointerPosition.set(event.touches[0].clientX, event.touches[0].clientY);
            this.previousPointerPosition.copy(this.pointerPosition);
            onMouseClick(event.touches[0]);
        } else if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            this.pinchStartDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
        }
    }

    onTouchMove(event) {
        event.preventDefault();
        if (!isAnimating) {
            if (event.touches.length === 1 && this.pointerDown) {
                this.previousPointerPosition.copy(this.pointerPosition);
                this.pointerPosition.set(event.touches[0].clientX, event.touches[0].clientY);
                this.handleRotation();
            } else if (event.touches.length === 2) {
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                const currentDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                const delta = (currentDistance - this.pinchStartDistance) * this.zoomSpeed;
                this.handleZoom(-delta);
                this.pinchStartDistance = currentDistance;
            }
        }
    }

    onTouchEnd(event) {
        if (event.touches.length === 0) {
            this.pointerDown = false;
        }
    }

    onMouseWheel(event) {
        event.preventDefault();
        if (!isAnimating) {
            this.handleZoom(event.deltaY * this.zoomSpeed);
        }
    }

    handleRotation() {
        const deltaX = (this.pointerPosition.x - this.previousPointerPosition.x) * this.rotationSpeed;
        const deltaY = (this.pointerPosition.y - this.previousPointerPosition.y) * this.rotationSpeed;

        const position = this.camera.position.clone().sub(this.target);
        const distance = position.length();

        position.applyAxisAngle(new THREE.Vector3(0, 1, 0), -deltaX);

        const right = new THREE.Vector3().crossVectors(position, new THREE.Vector3(0, 1, 0)).normalize();
        position.applyAxisAngle(right, -deltaY);

        position.normalize().multiplyScalar(distance);
        this.camera.position.copy(this.target).add(position);
        this.camera.lookAt(this.target);
    }

    handleZoom(delta) {
        const direction = new THREE.Vector3().subVectors(this.camera.position, this.target).normalize();
        const newPosition = this.camera.position.clone().addScaledVector(direction, delta);
        
        const distance = newPosition.distanceTo(this.target);
        if (distance > 5 && distance < 100) {
            this.camera.position.copy(newPosition);
        }
    }

    update() {
        this.target.set(0, 0, 0);
    }
}

// Initialize camera controller
const cameraController = new CameraController(camera, renderer.domElement);

// Event listener for window resize
window.addEventListener('resize', onWindowResize);

// Animation function
// Update animation loop to include cloud rotation
function animate() {
    requestAnimationFrame(animate);

    // Update planet positions
    planets.forEach((planet, index) => {
        const data = planetsData[index];
        planet.userData.angle += 0.005 / Math.sqrt(data.orbit); // Adjust speed based on orbit radius
        planet.position.x = Math.cos(planet.userData.angle) * data.orbit;
        planet.position.z = Math.sin(planet.userData.angle) * data.orbit;
        planet.rotation.y += 0.002; // Planet's self-rotation

        // Rotate clouds slightly faster than Earth
        if (planet.userData.clouds) {
            planet.userData.clouds.rotation.y += 0.0022;
        }
    });

    // Smooth camera animation
    if (isAnimating) {
        if (selectedPlanet) {
            // Calculate desired camera position based on planet position
            targetPosition = selectedPlanet.position.clone().add(cameraOffset);
            camera.position.lerp(targetPosition, 0.05);
            camera.lookAt(selectedPlanet.position);
        } else if (targetPosition) {
            camera.position.lerp(targetPosition, 0.05);
            camera.lookAt(0, 0, 0);
            
            // Only stop animating when returning to default view
            if (camera.position.distanceTo(targetPosition) < 0.1) {
                isAnimating = false;
            }
        }
    }

    renderer.render(scene, camera);
}

// Start animation
animate();