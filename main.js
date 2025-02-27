import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
// add fog
scene.fog = new THREE.FogExp2(0x000814, 0.005);

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
camera.position.set(16, 10, 16);
camera.lookAt(0, 0, 0);

// Load planets data from JSON
let planetsData = [];

// Create texture loader before using it
const textureLoader = new THREE.TextureLoader();

// Function to initialize planets
function initializePlanets(data) {
    planetsData = data;

    // Create orbital paths
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
    const planetGeometry = new THREE.SphereGeometry(1, 32, 32);

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
            angle: (Math.PI * 2 / planetsData.length) * index,
            funFact: data.funFact
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
}

// Load planet data
fetch('planets.json')
    .then(response => response.json())
    .then(data => {
        initializePlanets(data.planets);
    })
    .catch(error => console.error('Error loading planets data:', error));

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
sun.userData.maxHp = 32;
sun.userData.currentHp = 32;

// Create 32 HP ring segments
sun.userData.hpRings = [];
const segmentCount = 32;
const angleStep = (Math.PI * 2) / segmentCount;

for (let i = 0; i < segmentCount; i++) {
    const startAngle = i * angleStep;
    const endAngle = (i + 0.9) * angleStep; // Leave small gap between segments
    
    const hpRingGeometry = new THREE.RingGeometry(2, 2.2, 1, 1, startAngle, angleStep * 0.9);
    const hpRingMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const ringSegment = new THREE.Mesh(hpRingGeometry, hpRingMaterial);
    ringSegment.rotation.x = Math.PI / 2;
    ringSegment.position.y = -1;
    
    sun.userData.hpRings.push(ringSegment);
    scene.add(ringSegment);
}
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



// Load sun data
fetch('planets.json')
   .then(response => response.json())
   .then(data => {
        sun.data = data.star;
    })
   .catch(error => console.error('Error loading sun data:', error));
// Initialize arrays for planets and orbits
const planets = [];
const orbits = [];

// Add grid plane
const gridHelper = new THREE.GridHelper(1000, 200, 0x00ff00, 0x00ff00);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
gridHelper.position.y = -2; // GRID Y LEVEL
scene.add(gridHelper);

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


const ambientLight = new THREE.AmbientLight(0xffffff, 0.15); // Increased intensity
scene.add(ambientLight);


// Raycaster for planet selection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Info card elements
const infoCard = document.getElementById('info-card');
const planetName = document.getElementById('planet-name');
const planetDescription = document.getElementById('planet-description');
const planetFunFact = document.getElementById('planet-fun-fact');

// Set info card styles
infoCard.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
infoCard.style.position = 'fixed';
infoCard.style.bottom = '20px';
infoCard.style.left = '50%';
infoCard.style.transform = 'translateX(-50%)';
infoCard.style.width = '400px';
infoCard.style.maxHeight = '70vh';
infoCard.style.overflowY = 'auto';
infoCard.style.transition = 'all 0.3s ease';
infoCard.style.zIndex = '1000';

// Camera animation
let targetPosition = null;
let isAnimating = false;
let selectedPlanet = null;
let cameraOffset = new THREE.Vector3(0, 2, 5);
let isFollowingPlanet = false;

// Click event handler
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([...planets, sun]);

    if (intersects.length > 0) {
        const clickedPlanet = intersects[0].object;
        
        if (selectedPlanet === clickedPlanet) {
            // Clicking the same planet again - stop following
            isFollowingPlanet = false;
            isAnimating = true;
            selectedPlanet = null;
            infoCard.style.display = 'none';
        } else {
            // Clicking a different planet - start following
            selectedPlanet = clickedPlanet;
            isFollowingPlanet = true;
            isAnimating = true;
            infoCard.style.display = 'block';
            
            if (selectedPlanet === sun) {
                planetName.textContent = "Sun";
                planetDescription.textContent = "태양계의 중심에 있는 항성으로, 모든 행성에 빛과 열을 제공합니다.";
                planetFunFact.textContent = "태양은 지구로부터 약 1억 5천만 킬로미터 떨어져 있으며, 표면 온도는 약 5,500°C입니다. 태양의 질량은 지구의 약 33만 배이며, 태양계 전체 질량의 99.86%를 차지합니다. 태양의 중심부 온도는 약 1,500만°C에 달하며, 매초 수소를 헬륨으로 융합하는 핵융합 반응이 일어나고 있습니다.";
            } else {
                planetName.textContent = selectedPlanet.userData.name;
                planetDescription.textContent = selectedPlanet.userData.description;
                planetFunFact.textContent = selectedPlanet.userData.funFact;
            }
        }
    } else {
        // Clicking empty space - stop following if currently following
        if (isFollowingPlanet) {
            isFollowingPlanet = false;
            isAnimating = true;
            selectedPlanet = null;
            infoCard.style.display = 'none';
        }
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
            
            // Check for planet intersection first
            const touch = event.touches[0];
            const touchMouse = new THREE.Vector2();
            touchMouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            touchMouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
            
            raycaster.setFromCamera(touchMouse, camera);
            const intersects = raycaster.intersectObjects([...planets, sun]);
            
            if (intersects.length === 0) {
                generateAsteroid(touch); // Only create particle if no planet was touched
            } else {
                onMouseClick(touch); // Handle planet selection if a planet was touched
            }
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
        if (!isFollowingPlanet) {
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
    }

    handleZoom(delta) {
        if (!isFollowingPlanet) {
            const direction = new THREE.Vector3().subVectors(this.camera.position, this.target).normalize();
            const newPosition = this.camera.position.clone().addScaledVector(direction, delta);
            
            const distance = newPosition.distanceTo(this.target);
            if (distance > 5 && distance < 100) {
                this.camera.position.copy(newPosition);
            }
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

// Particle system setup
const particles = [];
const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const particleMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shininess: 80,
    emissiveMap: textureLoader.load('asteroid.jpg'),
    emissiveIntensity: 0.8
});

// Create Audio context and load sound effect
let audioContext;
let collisionSound;

// Audio permission handling
const audioPermissionDialog = document.getElementById('audio-permission');
const enableAudioButton = document.getElementById('enable-audio');

// Show audio permission dialog
audioPermissionDialog.style.display = 'block';

// Initialize audio context on user interaction
enableAudioButton.addEventListener('click', async () => {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Load collision sound
    try {
        const response = await fetch('boom.mp3');
        const arrayBuffer = await response.arrayBuffer();
        collisionSound = await audioContext.decodeAudioData(arrayBuffer);
        
        // Hide the permission dialog
        audioPermissionDialog.style.display = 'none';
    } catch (error) {
        console.error('Error loading collision sound:', error);
    }
});

function playCollisionSound() {
    if (collisionSound && audioContext && audioContext.state === 'running') {
        const source = audioContext.createBufferSource();
        source.buffer = collisionSound;
        // Create a GainNode to control the volume
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.2; // Set volume to 20%
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
    }
}

function generateAsteroidName() {
    const prefixes =  [
        "케레스", "베스타", "팔라스", "유노", "프시케", "히기에아",
        "유노미아", "유프로시네", "인터람니아", "다비다",
        "실비아", "키벨레", "디스베", "유로파", "암피트리테", "헤베"
      ];
    const suffixes = ['X', 'Y', 'Z', 'A', 'B', 'C'];
    const numbers = Math.floor(Math.random() * 999);
    return `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${numbers}-${suffixes[Math.floor(Math.random() * suffixes.length)]}`;
}

function generateAsteroid(event) {
    // Convert 2D click coordinates to 3D world coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // Get the direction vector
    const direction = raycaster.ray.direction;
selectedPlanet
    // Create particle with random size variation
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    const randomScale = 0.8 + Math.random() * 0.4; // Random scale between 0.8 and 1.2
    particle.scale.setScalar(randomScale);
    particle.position.copy(camera.position).add(direction.multiplyScalar(10));

    // Add wireframe outline
    const wireframeGeometry = new THREE.WireframeGeometry(particleGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
    });
    const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
    particle.add(wireframe);

    // Create and add asteroid name label
    const asteroidName = generateAsteroidName();
    const textSprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture((() => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 64;
            context.font = '24px Arial';
            context.fillStyle = '#00FF00';
            context.textAlign = 'center';
            context.fillText(asteroidName, 128, 32);
            return canvas;
        })())
    }));
    textSprite.scale.set(2, 0.5, 1);
    textSprite.position.y = 0.5;
    particle.add(textSprite);
    particle.userData.name = asteroidName;
    particle.userData.scale = randomScale; // Store the random scale for future reference

    // Initialize velocity (perpendicular to the direction to create orbital motion)
    const perpendicular = new THREE.Vector3(1, 0, 0);
    if (Math.abs(direction.dot(perpendicular)) > 0.9) {
        perpendicular.set(0, 1, 0);
    }
    const velocity = new THREE.Vector3().crossVectors(direction, perpendicular).normalize();
    particle.velocity = velocity.multiplyScalar(0.3);

    // Create vertical guide line
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5
    });
    
    // Create line vertices (will be updated in animation)
    const lineVertices = new Float32Array(6); // 2 points * 3 coordinates
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(lineVertices, 3));
    
    const guideLine = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(guideLine);
    particle.userData.guideLine = guideLine;

    // Add particle to the scene and particles array
    scene.add(particle);
    particles.push(particle);
}

// Add particle creation event listener
renderer.domElement.addEventListener('click', (event) => {
    if (!isFollowingPlanet) {
        generateAsteroid(event);
    }
});

//'retry-button' make refresh page
document.getElementById('retry-button').addEventListener('click', () => {
    location.reload();
});


// Animation function
// Update animation loop to include cloud rotation and particle movement
function animate() {
    requestAnimationFrame(animate);

    // Update Sun rotation and HP bar
    sun.rotation.y += 0.001;
    
    // Update HP ring segments based on current HP
    if (sun.userData.hpRings) {
        const hpPercentage = sun.userData.currentHp / sun.userData.maxHp;
        const totalSegments = sun.userData.hpRings.length;
        const activeSegments = Math.ceil(hpPercentage * totalSegments);
        
        // Check if Sun's HP is zero and show retry button
        if (sun.userData.currentHp <= 0) {
            document.getElementById('retry-button').style.display = 'block';
        }
        
        sun.userData.hpRings.forEach((ring, index) => {
            const color = new THREE.Color();
            color.setHSL(hpPercentage * 0.3, 1, 0.5); // Green to red transition
            ring.material.color = color;
            
            // Show/hide segments based on current HP
            if (index < activeSegments) {
                ring.visible = true;
                ring.material.opacity = 0.8;
            } else {
                ring.visible = false;
            }
        });
    }

    // Update Planet positions
    planets.forEach((planet, index) => {
        const data = planetsData[index];
        planet.userData.angle += 0.005 / Math.sqrt(data.orbit);
        planet.position.x = Math.cos(planet.userData.angle) * data.orbit;
        planet.position.z = Math.sin(planet.userData.angle) * data.orbit;
        planet.rotation.y += 0.002;

        if (planet.userData.clouds) {
            planet.userData.clouds.rotation.y += 0.0022;
        }
    });

    // Update particle positions based on gravity
    const G = 0.1; // Further reduced gravitational constant for slower movement
    const sunMass = 100; // Sun's mass
    const planetMass = 10; // Planet mass for gravity calculations
    
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        let totalForce = new THREE.Vector3(0, 0, 0);
        
        // Calculate sun's gravitational force
        const toSun = new THREE.Vector3().subVectors(sun.position, particle.position);
        const distanceToSun = toSun.length();
        const sunForceMagnitude = G * sunMass / (distanceToSun * distanceToSun);
        totalForce.add(toSun.normalize().multiplyScalar(sunForceMagnitude));
        
        // Update guide line vertices
        if (particle.userData.guideLine) {
            const positions = particle.userData.guideLine.geometry.attributes.position.array;
            // Set top point (asteroid position)
            positions[0] = particle.position.x;
            positions[1] = particle.position.y;
            positions[2] = particle.position.z;
            // Set bottom point at grid level (directly below asteroid)
            positions[3] = particle.position.x;
            positions[4] = -2; // Grid level at Y=-10
            positions[5] = particle.position.z;
            particle.userData.guideLine.geometry.attributes.position.needsUpdate = true;
        }

        // Check for collision with sun
        if (distanceToSun < 2) {
            createImpactEffect(particle.position, 0xffff00, 0.5, scene);
            playCollisionSound();
            // Reduce sun's HP
            sun.userData.currentHp = Math.max(0, sun.userData.currentHp - 1);
            logCollision(particle.userData.name, "Sun");
            if (particle.userData.guideLine) {
                scene.remove(particle.userData.guideLine);
            }
            scene.remove(particle);
            particles.splice(i, 1);
            continue;
        }
        
        // Calculate planets' gravitational forces and check collisions
        let hasCollided = false;
        planets.forEach(planet => {
            const toPlanet = new THREE.Vector3().subVectors(planet.position, particle.position);
            const distanceToPlanet = toPlanet.length();
            
            // Calculate planet's gravitational force
            const planetForceMagnitude = G * planetMass / (distanceToPlanet * distanceToPlanet);
            totalForce.add(toPlanet.normalize().multiplyScalar(planetForceMagnitude));
            
            // Check for collision with planet (using planet's size for collision detection)
            if (distanceToPlanet < planet.scale.x) {
                hasCollided = true;
                // Create impact effect with planet-specific color
                const impactColor = planet.userData.name === 'Earth' ? 0x4169E1 :
                                  planet.userData.name === 'Mars' ? 0xFF4500 :
                                  planet.userData.name === 'Venus' ? 0xFFA500 : 0xE5E5E5;
                createImpactEffect(particle.position, impactColor, 0.3, scene);
                playCollisionSound();
                // Reduce planet's HP
                planet.userData.currentHp = Math.max(0, planet.userData.currentHp - 1);
                logCollision(particle.userData.name, `${planet.userData.name}`);
                if (particle.userData.guideLine) {
                    scene.remove(particle.userData.guideLine);
                }
                scene.remove(particle);
                particles.splice(i, 1);
            }
        });
        
        if (hasCollided) continue;
        
        // Update particle velocity and position
        particle.velocity.add(totalForce.multiplyScalar(0.3));
        particle.position.add(particle.velocity.multiplyScalar(0.3));
    }

    function logCollision(object1, object2) {
    const logEntry = document.createElement('li');
    logEntry.className = 'collision-log-entry';
    logEntry.textContent = `${object1} 💥 ${object2}`;
    const logEntries = document.querySelector('.collision-log-entries');
    
    logEntries.appendChild(logEntry);
    
    // Keep only the last 5 entries
    while (logEntries.children.length > 5) {
        logEntries.removeChild(logEntries.firstChild);
    }
}

function createImpactEffect(position, color, size, scene) {
        const impactGeometry = new THREE.SphereGeometry(size, 16, 16);
        const impactMaterial = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 1
        });
        const impact = new THREE.Mesh(impactGeometry, impactMaterial);
        impact.position.copy(position);
        scene.add(impact);
    
        // Animate impact effect
        const startTime = Date.now();
        const duration = 2000;
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
    
            if (progress < 1) {
                impact.material.opacity = 1 - progress;
                impact.scale.setScalar(1 + progress);
                requestAnimationFrame(animate);
            } else {
                scene.remove(impact);
            }
        };
        animate();
    }

    // Camera animation logic
    if (isAnimating) {
        if (isFollowingPlanet && selectedPlanet) {
            // Follow selected planet
            targetPosition = selectedPlanet.position.clone().add(cameraOffset);
            camera.position.lerp(targetPosition, 0.05);
            camera.lookAt(selectedPlanet.position);
            isAnimating = true; // Keep animating to follow the planet
        } else {
            // Return to initial position
            const initialPosition = new THREE.Vector3(16, 10, 16);
            camera.position.lerp(initialPosition, 0.05);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            
            // Stop animating when close enough to initial position
            if (camera.position.distanceTo(initialPosition) < 0.1) {
                isAnimating = false;
            }
        }
    }

    renderer.render(scene, camera);
}

// Start animation
animate();