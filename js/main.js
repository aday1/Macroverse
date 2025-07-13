import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Handle video loading and loading screen
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('header-video');
    const loadingScreen = document.getElementById('loading-screen');
    
    const hideLoadingScreen = () => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    };
    
    // Check if video is ready
    if (video.readyState >= 3) {
        hideLoadingScreen();
    } else {
        video.addEventListener('canplaythrough', hideLoadingScreen);
        video.addEventListener('loadeddata', hideLoadingScreen);
        // Fallback timeout
        setTimeout(hideLoadingScreen, 3000);
    }
});

// Slow down header video to quarter speed for more atmospheric effect
document.addEventListener('DOMContentLoaded', () => {
    const headerVideo = document.getElementById('header-video');
    if (headerVideo) {
        // Set playback rate to quarter speed once video is ready
        headerVideo.addEventListener('loadedmetadata', () => {
            headerVideo.playbackRate = 0.25;
            console.log('Header video playback rate set to 0.25x (quarter speed)');
        });
        
        // Also set it immediately in case the video is already loaded
        if (headerVideo.readyState >= 1) {
            headerVideo.playbackRate = 0.25;
            console.log('Header video playback rate set to 0.25x (immediate)');
        }
    }
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);
// Disable controls on mobile for better scroll experience
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
if (isMobile) {
    controls.enabled = false;
}

let currentSceneObject;

// --- Scene Creation Functions ---

function createEnergyField() {
    const group = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 50; i++) {
        const points = [];
        const start = new THREE.Vector3((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30, (Math.random() - 0.5) * 30);
        points.push(start);
        for (let j = 0; j < 5; j++) {
            points.push(start.clone().add(new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        line.userData.originalPoints = points.map(p => p.clone());
        group.add(line);
    }
    group.userData.animate = () => {
        group.children.forEach(line => {
            const points = line.userData.originalPoints;
            const newPoints = points.map(p => p.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2)));
            line.geometry.setFromPoints(newPoints);
            line.geometry.verticesNeedUpdate = true;
        });
    };
    return group;
}

function createGasCloud() {
    const group = new THREE.Group();
    const textureLoader = new THREE.TextureLoader();
    
    // Enhanced gas clouds with more density and variety
    for (let layer = 0; layer < 4; layer++) {
        const cloudTexture = textureLoader.load('https://cdn.rawgit.com/mrdoob/three.js/master/examples/textures/cloud.png');
        const material = new THREE.PointsMaterial({
            color: layer === 0 ? 0x4169e1 : (layer === 1 ? 0x6a8dff : (layer === 2 ? 0x87ceeb : 0x00bfff)),
            size: 25 - layer * 3,
            map: cloudTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.8 - layer * 0.15
        });
        
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const particleCount = 300 - layer * 50;
        
        for (let i = 0; i < particleCount; i++) {
            // Create more concentrated clouds around the center
            const radius = Math.random() * (40 + layer * 10);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        }
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const points = new THREE.Points(geometry, material);
        points.userData.layer = layer;
        group.add(points);
    }

    // Enhanced blue giant star with fusion core
    const starGeometry = new THREE.SphereGeometry(6, 32, 32);
    const starMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x6a8dff, 
        transparent: true, 
        opacity: 0.9
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    
    // Add pulsing fusion core
    const coreGeometry = new THREE.SphereGeometry(3, 16, 16);
    const coreMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.6
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    star.add(core);
    
    // Add heat waves around the star
    for (let i = 0; i < 6; i++) {
        const heatRing = new THREE.Mesh(
            new THREE.RingGeometry(8 + i * 2, 9 + i * 2, 32),
            new THREE.MeshBasicMaterial({ 
                color: i % 2 === 0 ? 0xff4500 : 0xff6500, 
                transparent: true, 
                opacity: 0.2 - i * 0.02,
                side: THREE.DoubleSide
            })
        );
        heatRing.rotation.x = Math.random() * Math.PI;
        heatRing.rotation.y = Math.random() * Math.PI;
        heatRing.userData.rotSpeed = (Math.random() - 0.5) * 0.01;
        star.add(heatRing);
    }
    
    group.add(star);

    // Add gravitational effect particles
    const gravityGeometry = new THREE.BufferGeometry();
    const gravityPositions = [];
    for (let i = 0; i < 150; i++) {
        const distance = Math.random() * 100 + 50;
        const angle = Math.random() * Math.PI * 2;
        gravityPositions.push(
            Math.cos(angle) * distance,
            (Math.random() - 0.5) * 20,
            Math.sin(angle) * distance
        );
    }
    gravityGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gravityPositions, 3));
    const gravityMaterial = new THREE.PointsMaterial({ 
        color: 0xffaa00, 
        size: 2, 
        transparent: true, 
        opacity: 0.6 
    });
    const gravityField = new THREE.Points(gravityGeometry, gravityMaterial);
    group.add(gravityField);

    group.userData.animate = () => {
        const time = Date.now() * 0.001;
        
        // Animate gas clouds
        group.children.forEach(child => {
            if (child.userData.layer !== undefined) {
                child.rotation.y += 0.001 * (1 + child.userData.layer * 0.5);
                child.rotation.x += 0.0005;
            }
        });
        
        // Animate star core pulsing (fusion effect)
        if (star.children[0]) {
            star.children[0].scale.setScalar(1 + Math.sin(time * 8) * 0.2);
            star.children[0].material.opacity = 0.6 + Math.sin(time * 6) * 0.3;
        }
        
        // Animate heat rings
        star.children.forEach(child => {
            if (child.userData.rotSpeed !== undefined) {
                child.rotation.z += child.userData.rotSpeed;
                child.material.opacity = Math.abs(Math.sin(time * 2 + child.rotation.z)) * 0.3;
            }
        });
        
        // Animate star itself
        star.rotation.y += 0.002;
        star.material.opacity = 0.9 + Math.sin(time * 3) * 0.1;
        
        // Animate gravity field
        gravityField.rotation.y -= 0.0008;
        const positions = gravityField.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            // Simulate gravitational pull
            const x = positions[i];
            const z = positions[i + 2];
            const distance = Math.sqrt(x * x + z * z);
            const pullForce = 0.1 / (distance * 0.01);
            positions[i] *= 1 - pullForce * 0.001;
            positions[i + 2] *= 1 - pullForce * 0.001;
        }
        gravityField.geometry.attributes.position.needsUpdate = true;
    };
    return group;
}

function createSolarSystem() {
    const group = new THREE.Group();
    const sun = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffdd00 }));
    group.add(sun);

    for (let i = 0; i < 5; i++) {
        const planet = new THREE.Mesh(new THREE.SphereGeometry(Math.random() * 0.5 + 0.2, 16, 16), new THREE.MeshStandardMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) }));
        const distance = i * 3 + 5;
        const angle = Math.random() * Math.PI * 2;
        planet.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
        planet.userData.distance = distance;
        planet.userData.angle = angle;
        planet.userData.speed = Math.random() * 0.01 + 0.005;
        group.add(planet);
    }
    const light = new THREE.PointLight(0xffdd00, 2, 100);
    group.add(light);
    group.userData.animate = () => {
        group.children.forEach(child => {
            if (child.userData.distance) {
                child.userData.angle += child.userData.speed;
                child.position.x = Math.cos(child.userData.angle) * child.userData.distance;
                child.position.z = Math.sin(child.userData.angle) * child.userData.distance;
            }
        });
    };
    return group;
}

function createLifeScene() {
    const group = new THREE.Group();
    
    // Create diverse ecosystem terrain with biomes
    const terrainGeometry = new THREE.PlaneGeometry(80, 80, 64, 64);
    const terrainVertices = terrainGeometry.attributes.position.array;
    const terrainColors = [];
    
    // Create realistic biome terrain with elevation and color
    for (let i = 0; i < terrainVertices.length; i += 3) {
        const x = terrainVertices[i];
        const y = terrainVertices[i + 1];
        
        // Create diverse elevation using multiple noise layers
        const elevation1 = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 5;
        const elevation2 = Math.sin(x * 0.1 + y * 0.08) * 2;
        const elevation3 = Math.sin(x * 0.2 - y * 0.15) * 1;
        const totalElevation = elevation1 + elevation2 + elevation3;
        
        terrainVertices[i + 2] = totalElevation;
        
        // Determine biome based on position and elevation
        const biomeNoise = Math.sin(x * 0.03) + Math.cos(y * 0.04);
        
        if (totalElevation < -2) {
            // Deep water/ocean floor
            terrainColors.push(0.1, 0.2, 0.4);
        } else if (totalElevation < 0) {
            // Shallow water/wetlands
            terrainColors.push(0.2, 0.4, 0.6);
        } else if (biomeNoise > 0.5) {
            // Forest biome
            terrainColors.push(0.2, 0.4, 0.1);
        } else if (biomeNoise > -0.5) {
            // Grassland biome
            terrainColors.push(0.3, 0.5, 0.2);
        } else {
            // Desert/rocky biome
            terrainColors.push(0.6, 0.4, 0.2);
        }
    }
    
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.setAttribute('color', new THREE.Float32BufferAttribute(terrainColors, 3));
    terrainGeometry.computeVertexNormals();
    
    const terrainMaterial = new THREE.MeshLambertMaterial({ 
        vertexColors: true,
        transparent: true,
        opacity: 0.9
    });
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -15;
    group.add(terrain);

    // Create living microorganisms (bacteria, cells)
    const microorganisms = [];
    for (let i = 0; i < 200; i++) {
        const organism = new THREE.Group();
        
        // Cell membrane
        const membraneGeometry = new THREE.SphereGeometry(0.3 + Math.random() * 0.2, 8, 8);
        const membraneMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(
                0.4 + Math.random() * 0.4,
                0.6 + Math.random() * 0.4,
                0.2 + Math.random() * 0.3
            ),
            transparent: true,
            opacity: 0.6,
            wireframe: Math.random() > 0.7
        });
        const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
        organism.add(membrane);
        
        // Nucleus/DNA core
        const nucleusGeometry = new THREE.SphereGeometry(0.1, 6, 6);
        const nucleusMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
        organism.add(nucleus);
        
        // Organelles (mitochondria, etc.)
        for (let j = 0; j < 3 + Math.floor(Math.random() * 4); j++) {
            const organelleGeometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 4, 4);
            const organelleMaterial = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color(Math.random(), Math.random(), Math.random()),
                transparent: true,
                opacity: 0.7
            });
            const organelle = new THREE.Mesh(organelleGeometry, organelleMaterial);
            organelle.position.set(
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.4
            );
            organism.add(organelle);
        }
        
        // Position organisms in clusters (colonies)
        const clusterX = (Math.random() - 0.5) * 60;
        const clusterZ = (Math.random() - 0.5) * 60;
        organism.position.set(
            clusterX + (Math.random() - 0.5) * 10,
            -10 + Math.random() * 20,
            clusterZ + (Math.random() - 0.5) * 10
        );
        
        // Movement and behavior properties
        organism.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.01,
                (Math.random() - 0.5) * 0.02
            ),
            lifespan: Math.random() * 1000 + 500,
            age: 0,
            reproductionRate: Math.random() * 0.001,
            species: Math.floor(Math.random() * 5),
            energy: Math.random() * 100 + 50
        };
        
        microorganisms.push(organism);
        group.add(organism);
    }

    // Create DNA helix structures (genetic information visualization)
    for (let i = 0; i < 8; i++) {
        const dnaGroup = new THREE.Group();
        const helixHeight = 4 + Math.random() * 6;
        
        // Create double helix structure
        for (let j = 0; j < 50; j++) {
            const t = (j / 50) * helixHeight;
            const angle1 = t * Math.PI * 2 * 2; // Two complete turns
            const angle2 = angle1 + Math.PI; // Opposite strand
            
            // First strand
            const sphere1 = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 6, 6),
                new THREE.MeshBasicMaterial({ 
                    color: Math.random() > 0.5 ? 0x00ff00 : 0x0000ff,
                    transparent: true,
                    opacity: 0.8
                })
            );
            sphere1.position.set(
                Math.cos(angle1) * 0.5,
                t - helixHeight/2,
                Math.sin(angle1) * 0.5
            );
            
            // Second strand
            const sphere2 = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 6, 6),
                new THREE.MeshBasicMaterial({ 
                    color: Math.random() > 0.5 ? 0xff0000 : 0xffff00,
                    transparent: true,
                    opacity: 0.8
                })
            );
            sphere2.position.set(
                Math.cos(angle2) * 0.5,
                t - helixHeight/2,
                Math.sin(angle2) * 0.5
            );
            
            dnaGroup.add(sphere1, sphere2);
            
            // Base pairs (connecting strands)
            if (j % 3 === 0) {
                const connector = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 1, 6),
                    new THREE.MeshBasicMaterial({ 
                        color: 0x888888,
                        transparent: true,
                        opacity: 0.6
                    })
                );
                connector.position.set(
                    (Math.cos(angle1) * 0.5 + Math.cos(angle2) * 0.5) / 2,
                    t - helixHeight/2,
                    (Math.sin(angle1) * 0.5 + Math.sin(angle2) * 0.5) / 2
                );
                connector.rotation.z = Math.PI / 2;
                dnaGroup.add(connector);
            }
        }
        
        dnaGroup.position.set(
            (Math.random() - 0.5) * 50,
            Math.random() * 10,
            (Math.random() - 0.5) * 50
        );
        dnaGroup.userData.rotSpeed = (Math.random() - 0.5) * 0.01;
        group.add(dnaGroup);
    }

    // Create plant life with growth simulation
    const plants = [];
    for (let i = 0; i < 30; i++) {
        const plant = new THREE.Group();
        const growth = Math.random() * 0.8 + 0.2;
        
        // Stem
        const stemGeometry = new THREE.CylinderGeometry(
            0.05 * growth, 
            0.1 * growth, 
            2 * growth, 
            8
        );
        const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = growth;
        plant.add(stem);
        
        // Leaves (fractal branching)
        for (let j = 0; j < 5 + Math.floor(growth * 10); j++) {
            const leafGeometry = new THREE.ConeGeometry(
                0.2 * growth, 
                0.8 * growth, 
                4
            );
            const leafMaterial = new THREE.MeshBasicMaterial({ 
                color: new THREE.Color(
                    0.1 + Math.random() * 0.3,
                    0.4 + Math.random() * 0.4,
                    0.1 + Math.random() * 0.2
                ),
                transparent: true,
                opacity: 0.7
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
            const angle = (j / 5) * Math.PI * 2;
            const height = j * 0.3 * growth;
            leaf.position.set(
                Math.cos(angle) * 0.5 * growth,
                height + growth,
                Math.sin(angle) * 0.5 * growth
            );
            leaf.rotation.z = angle;
            plant.add(leaf);
        }
        
        // Position on terrain
        plant.position.set(
            (Math.random() - 0.5) * 70,
            -15,
            (Math.random() - 0.5) * 70
        );
        
        plant.userData = {
            growth: growth,
            maxGrowth: Math.random() * 0.5 + 0.8,
            growthRate: Math.random() * 0.001 + 0.0005
        };
        
        plants.push(plant);
        group.add(plant);
    }

    // Create animal life (simple creatures)
    const animals = [];
    for (let i = 0; i < 15; i++) {
        const animal = new THREE.Group();
        
        // Body
        const bodyGeometry = new THREE.CapsuleGeometry(0.2, 0.8, 4, 8);
        const bodyMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(
                Math.random() * 0.8 + 0.2,
                Math.random() * 0.6 + 0.2,
                Math.random() * 0.4 + 0.1
            ),
            transparent: true,
            opacity: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        animal.add(body);
        
        // Simple limbs/appendages
        for (let j = 0; j < 4; j++) {
            const limbGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
            const limbMaterial = new THREE.MeshBasicMaterial({ color: 0x654321 });
            const limb = new THREE.Mesh(limbGeometry, limbMaterial);
            const angle = (j / 4) * Math.PI * 2;
            limb.position.set(
                Math.cos(angle) * 0.3,
                -0.2,
                Math.sin(angle) * 0.3
            );
            limb.rotation.z = angle;
            animal.add(limb);
        }
        
        animal.position.set(
            (Math.random() - 0.5) * 60,
            -10 + Math.random() * 5,
            (Math.random() - 0.5) * 60
        );
        
        animal.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.05,
                0,
                (Math.random() - 0.5) * 0.05
            ),
            wanderAngle: Math.random() * Math.PI * 2,
            energy: Math.random() * 100 + 50,
            species: Math.floor(Math.random() * 3)
        };
        
        animals.push(animal);
        group.add(animal);
    }

    // Atmospheric particles and spores (reproduction)
    const sporeGeometry = new THREE.BufferGeometry();
    const sporePositions = [];
    const sporeColors = [];
    const sporeVelocities = [];
    
    for (let i = 0; i < 1000; i++) {
        sporePositions.push(
            (Math.random() - 0.5) * 100,
            Math.random() * 40 - 20,
            (Math.random() - 0.5) * 100
        );
        
        // Different types of airborne particles
        const sporeType = Math.random();
        if (sporeType > 0.7) {
            sporeColors.push(1, 1, 0); // Pollen - yellow
        } else if (sporeType > 0.4) {
            sporeColors.push(0, 1, 0.5); // Spores - green
        } else {
            sporeColors.push(0.8, 0.8, 0.8); // Dust/debris - gray
        }
        
        sporeVelocities.push(
            (Math.random() - 0.5) * 0.01,
            Math.random() * 0.005,
            (Math.random() - 0.5) * 0.01
        );
    }
    
    sporeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sporePositions, 3));
    sporeGeometry.setAttribute('color', new THREE.Float32BufferAttribute(sporeColors, 3));
    const sporeMaterial = new THREE.PointsMaterial({ 
        size: 0.1, 
        transparent: true, 
        opacity: 0.6,
        vertexColors: true
    });
    const spores = new THREE.Points(sporeGeometry, sporeMaterial);
    spores.userData.velocities = sporeVelocities;
    group.add(spores);

    // Food web visualization (energy flow)
    const foodWeb = [];
    for (let i = 0; i < 20; i++) {
        const points = [];
        const startPoint = new THREE.Vector3(
            (Math.random() - 0.5) * 60,
            -10 + Math.random() * 15,
            (Math.random() - 0.5) * 60
        );
        points.push(startPoint);
        
        // Create flowing energy lines between organisms
        for (let j = 1; j < 8; j++) {
            const nextPoint = startPoint.clone().add(new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 10
            ));
            points.push(nextPoint);
        }
        
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x00ff88,
            transparent: true,
            opacity: 0.3
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.userData.flow = 0;
        foodWeb.push(line);
        group.add(line);
    }

    // Add enhanced lighting for biological processes
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    group.add(ambientLight);
    
    const sunLight = new THREE.DirectionalLight(0xffffe0, 0.8);
    sunLight.position.set(20, 30, 10);
    group.add(sunLight);
    
    // Bioluminescent lighting (from organisms)
    for (let i = 0; i < 10; i++) {
        const bioLight = new THREE.PointLight(
            new THREE.Color(Math.random(), Math.random() * 0.5 + 0.5, Math.random()), 
            0.5, 
            10
        );
        bioLight.position.set(
            (Math.random() - 0.5) * 60,
            -5 + Math.random() * 10,
            (Math.random() - 0.5) * 60
        );
        bioLight.userData.flicker = Math.random() * 0.002 + 0.001;
        group.add(bioLight);
    }
    
    group.userData.animate = () => {
        const time = Date.now() * 0.001;
        
        // Animate terrain with geological processes
        const terrainVertices = terrain.geometry.attributes.position.array;
        for (let i = 0; i < terrainVertices.length; i += 3) {
            const x = terrainVertices[i];
            const y = terrainVertices[i + 1];
            const baseHeight = Math.sin(x * 0.05) * Math.cos(y * 0.05) * 5 + 
                              Math.sin(x * 0.1 + y * 0.08) * 2 + 
                              Math.sin(x * 0.2 - y * 0.15) * 1;
            terrainVertices[i + 2] = baseHeight + Math.sin(time * 0.5 + x * 0.01) * 0.1;
        }
        terrain.geometry.attributes.position.needsUpdate = true;
        terrain.geometry.computeVertexNormals();
        
        // Simulate microorganism behavior (movement, reproduction, death)
        microorganisms.forEach((organism, index) => {
            if (!organism.parent) return; // Skip if removed
            
            organism.userData.age += 1;
            
            // Movement simulation (chemotaxis, random walk)
            const velocity = organism.userData.velocity;
            velocity.add(new THREE.Vector3(
                (Math.random() - 0.5) * 0.001,
                (Math.random() - 0.5) * 0.0005,
                (Math.random() - 0.5) * 0.001
            ));
            
            // Boundary conditions
            if (Math.abs(organism.position.x) > 30) velocity.x *= -1;
            if (Math.abs(organism.position.z) > 30) velocity.z *= -1;
            if (organism.position.y > 10 || organism.position.y < -20) velocity.y *= -1;
            
            organism.position.add(velocity);
            
            // Metabolism and energy consumption
            organism.userData.energy -= 0.1;
            if (organism.userData.energy <= 0) {
                // Death and decomposition
                organism.material.opacity *= 0.99;
                if (organism.material.opacity < 0.1) {
                    group.remove(organism);
                    microorganisms.splice(index, 1);
                }
            }
            
            // Reproduction
            if (organism.userData.energy > 80 && Math.random() < organism.userData.reproductionRate) {
                organism.userData.energy *= 0.6; // Cost of reproduction
                // Create offspring nearby (simplified)
                if (microorganisms.length < 150) {
                    // Reproduction logic would create new organism here
                }
            }
            
            // Cell division animation
            const scale = 1 + Math.sin(time * 10 + organism.position.x) * 0.1;
            organism.scale.setScalar(scale);
            
            // Rotate organelles
            organism.children.forEach((child, childIndex) => {
                if (childIndex > 1) { // Skip membrane and nucleus
                    child.rotation.x += 0.01;
                    child.rotation.y += 0.005;
                }
            });
        });
        
        // Animate DNA helixes (genetic transcription)
        group.children.forEach(child => {
            if (child.userData.rotSpeed !== undefined) {
                child.rotation.y += child.userData.rotSpeed;
                child.rotation.x += child.userData.rotSpeed * 0.3;
                
                // Breathing effect for DNA
                const breathe = 1 + Math.sin(time * 3) * 0.1;
                child.scale.setScalar(breathe);
            }
        });
        
        // Plant growth simulation
        plants.forEach(plant => {
            if (plant.userData.growth < plant.userData.maxGrowth) {
                plant.userData.growth += plant.userData.growthRate;
                const growth = plant.userData.growth;
                
                // Update plant size
                plant.scale.setScalar(growth);
                
                // Phototropism (leaning toward light)
                plant.rotation.z += Math.sin(time * 0.5) * 0.001;
                
                // Leaf movement (heliotropism)
                plant.children.forEach((leaf, index) => {
                    if (index > 0) { // Skip stem
                        leaf.rotation.y += Math.sin(time * 2 + index) * 0.002;
                    }
                });
            }
        });
        
        // Animal behavior simulation
        animals.forEach(animal => {
            // Wandering behavior
            animal.userData.wanderAngle += (Math.random() - 0.5) * 0.1;
            animal.userData.velocity.x = Math.cos(animal.userData.wanderAngle) * 0.02;
            animal.userData.velocity.z = Math.sin(animal.userData.wanderAngle) * 0.02;
            
            // Boundary avoidance
            if (Math.abs(animal.position.x) > 25) {
                animal.userData.wanderAngle += Math.PI;
            }
            if (Math.abs(animal.position.z) > 25) {
                animal.userData.wanderAngle += Math.PI;
            }
            
            animal.position.add(animal.userData.velocity);
            
            // Look in direction of movement
            animal.lookAt(animal.position.clone().add(animal.userData.velocity));
            
            // Animate limbs (walking)
            animal.children.forEach((limb, index) => {
                if (index > 0) { // Skip body
                    limb.rotation.x = Math.sin(time * 5 + index) * 0.3;
                }
            });
            
            // Energy and foraging
            animal.userData.energy -= 0.05;
            if (animal.userData.energy < 30) {
                // Seek food behavior would go here
                animal.userData.energy += 0.1;
            }
        });
        
        // Animate atmospheric spores and pollen
        const sporePositions = spores.geometry.attributes.position.array;
        const velocities = spores.userData.velocities;
        
        for (let i = 0; i < sporePositions.length; i += 3) {
            const idx = i / 3;
            
            // Wind and gravity effects
            sporePositions[i] += velocities[idx * 3] + Math.sin(time + sporePositions[i] * 0.01) * 0.002;
            sporePositions[i + 1] += velocities[idx * 3 + 1] - 0.001; // Gravity
            sporePositions[i + 2] += velocities[idx * 3 + 2] + Math.cos(time + sporePositions[i + 2] * 0.01) * 0.002;
            
            // Reset particles that fall too low or drift too far
            if (sporePositions[i + 1] < -25 || Math.abs(sporePositions[i]) > 50 || Math.abs(sporePositions[i + 2]) > 50) {
                sporePositions[i] = (Math.random() - 0.5) * 60;
                sporePositions[i + 1] = 20 + Math.random() * 10;
                sporePositions[i + 2] = (Math.random() - 0.5) * 60;
            }
        }
        spores.geometry.attributes.position.needsUpdate = true;
        
        // Animate food web energy flows
        foodWeb.forEach(web => {
            web.userData.flow += 0.02;
            if (web.userData.flow > 1) web.userData.flow = 0;
            
            // Create flowing effect along the line
            web.material.opacity = 0.2 + Math.sin(web.userData.flow * Math.PI * 2) * 0.2;
        });
        
        // Animate bioluminescent lights (breathing effect)
        group.children.forEach(child => {
            if (child.userData.flicker) {
                child.intensity = 0.3 + Math.sin(time * 60 * child.userData.flicker) * 0.2;
            }
        });
        
        // Simulate seasonal changes
        const season = Math.sin(time * 0.1);
        sunLight.intensity = 0.6 + season * 0.3;
        sunLight.color.setHSL(0.1 + season * 0.05, 0.8, 0.7);
    };
    return group;
}

function createCivilizationScene() {
    const group = new THREE.Group();
    
    // Create a detailed Earth-like planet with continents and oceans
    const planetGeometry = new THREE.SphereGeometry(5, 128, 128);
    const planetVertices = planetGeometry.attributes.position.array;
    const planetColors = [];
    const planetUvs = planetGeometry.attributes.uv.array;
    
    // Add realistic surface variation and color mapping
    for (let i = 0; i < planetVertices.length; i += 3) {
        const x = planetVertices[i];
        const y = planetVertices[i + 1];
        const z = planetVertices[i + 2];
        const length = Math.sqrt(x * x + y * y + z * z);
        
        // Calculate spherical coordinates for continent mapping
        const lat = Math.asin(y / length);
        const lon = Math.atan2(z, x);
        
        // Create continent patterns using noise functions
        const continentNoise1 = Math.sin(lat * 3) * Math.cos(lon * 2);
        const continentNoise2 = Math.sin(lat * 5 + lon * 3) * 0.5;
        const continentNoise3 = Math.sin(lat * 7 - lon * 2) * 0.3;
        const continentValue = continentNoise1 + continentNoise2 + continentNoise3;
        
        // Add surface elevation variation
        const elevation = continentValue * 0.08;
        planetVertices[i] *= (1 + elevation / length);
        planetVertices[i + 1] *= (1 + elevation / length);
        planetVertices[i + 2] *= (1 + elevation / length);
        
        // Determine if this point is land or ocean
        const isLand = continentValue > -0.2;
        
        if (isLand) {
            // Land colors - greens and browns
            const landType = Math.sin(lat * 8 + lon * 6) + Math.cos(lat * 12);
            if (landType > 0.5) {
                // Mountains/deserts - browns
                planetColors.push(0.6, 0.4, 0.2);
            } else if (landType > -0.2) {
                // Forests - greens
                planetColors.push(0.2, 0.6, 0.2);
            } else {
                // Plains - lighter greens
                planetColors.push(0.4, 0.7, 0.3);
            }
        } else {
            // Ocean colors - blues
            const depth = Math.abs(continentValue + 0.2) * 3;
            if (depth > 0.8) {
                // Deep ocean - dark blue
                planetColors.push(0.0, 0.1, 0.4);
            } else {
                // Shallow water - lighter blue
                planetColors.push(0.1, 0.3, 0.8);
            }
        }
    }
    
    planetGeometry.attributes.position.needsUpdate = true;
    planetGeometry.setAttribute('color', new THREE.Float32BufferAttribute(planetColors, 3));
    planetGeometry.computeVertexNormals();
    
    const planetMaterial = new THREE.MeshStandardMaterial({ 
        vertexColors: true,
        roughness: 0.7,
        metalness: 0.1,
        transparent: true,
        opacity: 0.95
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    group.add(planet);
    
    // Add atmospheric glow effect
    const atmosphereGeometry = new THREE.SphereGeometry(5.2, 64, 64);
    const atmosphereMaterial = new THREE.MeshLambertMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.15,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    group.add(atmosphere);
    
    // Add cloud layer for more realism
    const cloudGeometry = new THREE.SphereGeometry(5.15, 64, 64);
    const cloudVertices = cloudGeometry.attributes.position.array;
    const cloudColors = [];
    
    // Create realistic cloud patterns
    for (let i = 0; i < cloudVertices.length; i += 3) {
        const x = cloudVertices[i];
        const y = cloudVertices[i + 1];
        const z = cloudVertices[i + 2];
        const length = Math.sqrt(x * x + y * y + z * z);
        
        const lat = Math.asin(y / length);
        const lon = Math.atan2(z, x);
        
        // Create cloud patterns using multiple noise layers
        const cloudNoise1 = Math.sin(lat * 4 + lon * 3) * 0.5;
        const cloudNoise2 = Math.sin(lat * 8 - lon * 5) * 0.3;
        const cloudNoise3 = Math.sin(lat * 12 + lon * 7) * 0.2;
        const cloudDensity = (cloudNoise1 + cloudNoise2 + cloudNoise3 + 1) / 2;
        
        // Clouds are more likely near equator and storm systems
        const cloudThreshold = 0.4 + Math.abs(lat) * 0.2;
        const opacity = cloudDensity > cloudThreshold ? (cloudDensity - cloudThreshold) * 2 : 0;
        
        cloudColors.push(1, 1, 1, opacity); // White clouds with varying opacity
    }
    
    cloudGeometry.setAttribute('color', new THREE.Float32BufferAttribute(cloudColors, 4));
    const cloudMaterial = new THREE.MeshLambertMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        alphaTest: 0.1
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    group.add(clouds);
    
    // Enhanced city lights following continental patterns
    const lightsMaterial = new THREE.PointsMaterial({ 
        color: 0xffff00, 
        size: 0.1,
        transparent: true,
        opacity: 0.8
    });
    const lightsGeometry = new THREE.BufferGeometry();
    const lightPositions = [];
    const lightColors = [];
    
    // Create realistic city distributions on continents
    for (let lat = -Math.PI/2; lat < Math.PI/2; lat += 0.1) {
        for (let lon = -Math.PI; lon < Math.PI; lon += 0.1) {
            const continentNoise1 = Math.sin(lat * 3) * Math.cos(lon * 2);
            const continentNoise2 = Math.sin(lat * 5 + lon * 3) * 0.5;
            const continentNoise3 = Math.sin(lat * 7 - lon * 2) * 0.3;
            const continentValue = continentNoise1 + continentNoise2 + continentNoise3;
            
            // Only place cities on land areas
            if (continentValue > -0.1 && Math.random() < 0.15) {
                const p = new THREE.Vector3();
                p.setFromSphericalCoords(5.08, Math.PI/2 - lat, lon);
                lightPositions.push(p.x, p.y, p.z);
                
                // Different city types have different colors
                const cityType = Math.random();
                if (cityType > 0.8) {
                    lightColors.push(1, 0.5, 0); // Orange - industrial
                } else if (cityType > 0.6) {
                    lightColors.push(0, 1, 1); // Cyan - tech hubs
                } else {
                    lightColors.push(1, 1, 0.7); // Warm white - residential
                }
            }
        }
    }
    
    lightsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lightPositions, 3));
    lightsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lightColors, 3));
    const cityLights = new THREE.Points(lightsGeometry, new THREE.PointsMaterial({ 
        size: 0.1,
        transparent: true,
        opacity: 0.8,
        vertexColors: true
    }));
    planet.add(cityLights);

    // Bright Wireframe Spaceships - different types
    const spaceships = [];
    for (let i = 0; i < 15; i++) {
        let spaceship;
        const shipType = Math.floor(Math.random() * 3);
        const shipColor = [0x00ffff, 0xff00ff, 0xffff00, 0xff0080, 0x80ff00][Math.floor(Math.random() * 5)];
        
        switch(shipType) {
            case 0: // Fighters
                const fighterGroup = new THREE.Group();
                const body = new THREE.Mesh(
                    new THREE.ConeGeometry(0.15, 1.2, 6),
                    new THREE.MeshBasicMaterial({ 
                        color: shipColor, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                const wing1 = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 0.05, 0.3),
                    new THREE.MeshBasicMaterial({ 
                        color: shipColor, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                const wing2 = wing1.clone();
                wing1.position.set(0.4, 0, 0);
                wing2.position.set(-0.4, 0, 0);
                fighterGroup.add(body, wing1, wing2);
                spaceship = fighterGroup;
                break;
                
            case 1: // Cruisers
                spaceship = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8),
                    new THREE.MeshBasicMaterial({ 
                        color: shipColor, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                break;
                
            case 2: // Capital ships
                const capitalGroup = new THREE.Group();
                const hull = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.6, 2.0),
                    new THREE.MeshBasicMaterial({ 
                        color: shipColor, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                const tower = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2, 0.4, 0.8),
                    new THREE.MeshBasicMaterial({ 
                        color: shipColor, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                tower.position.y = 0.5;
                capitalGroup.add(hull, tower);
                spaceship = capitalGroup;
                break;
        }
        
        const pathRadius = Math.random() * 8 + 8;
        const angle = Math.random() * Math.PI * 2;
        const inclination = (Math.random() - 0.5) * Math.PI * 0.3;
        
        spaceship.position.set(
            Math.cos(angle) * pathRadius * Math.cos(inclination),
            Math.sin(inclination) * pathRadius,
            Math.sin(angle) * pathRadius * Math.cos(inclination)
        );
        
        spaceship.userData.pathRadius = pathRadius;
        spaceship.userData.angle = angle;
        spaceship.userData.inclination = inclination;
        spaceship.userData.speed = (Math.random() - 0.5) * 0.003 + 0.001;
        spaceship.userData.type = 'spaceship';
        
        spaceships.push(spaceship);
        group.add(spaceship);
    }

    // Bright Wireframe Satellites - various types
    for (let i = 0; i < 20; i++) {
        let satellite;
        const satType = Math.floor(Math.random() * 4);
        const satColor = [0x00ffff, 0xff4000, 0x40ff00, 0xff0040, 0x4000ff][Math.floor(Math.random() * 5)];
        
        switch(satType) {
            case 0: // Communication satellites
                const commGroup = new THREE.Group();
                const commBody = new THREE.Mesh(
                    new THREE.BoxGeometry(0.4, 0.4, 0.2),
                    new THREE.MeshBasicMaterial({ 
                        color: satColor, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.9
                    })
                );
                const panel1 = new THREE.Mesh(
                    new THREE.PlaneGeometry(0.8, 0.3),
                    new THREE.MeshBasicMaterial({ 
                        color: 0x00ffff, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.7,
                        side: THREE.DoubleSide
                    })
                );
                const panel2 = panel1.clone();
                panel1.position.set(0.6, 0, 0);
                panel2.position.set(-0.6, 0, 0);
                panel1.rotation.y = Math.PI / 2;
                panel2.rotation.y = Math.PI / 2;
                commGroup.add(commBody, panel1, panel2);
                satellite = commGroup;
                break;
                
            case 1: // Space stations
                const stationGroup = new THREE.Group();
                const central = new THREE.Mesh(
                    new THREE.SphereGeometry(0.3, 8, 8),
                    new THREE.MeshBasicMaterial({ 
                        color: 0xff8000, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.9
                    })
                );
                for (let j = 0; j < 6; j++) {
                    const module = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.1, 0.1, 0.6, 6),
                        new THREE.MeshBasicMaterial({ 
                            color: 0x00ff80, 
                            wireframe: true,
                            transparent: true,
                            opacity: 0.8
                        })
                    );
                    const angle = (j / 6) * Math.PI * 2;
                    module.position.set(Math.cos(angle) * 0.5, 0, Math.sin(angle) * 0.5);
                    stationGroup.add(module);
                }
                stationGroup.add(central);
                satellite = stationGroup;
                break;
                
            case 2: // Research probes
                satellite = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.2),
                    new THREE.MeshBasicMaterial({ 
                        color: 0xff4080, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.9
                    })
                );
                break;
                
            case 3: // Defense platforms
                const defenseGroup = new THREE.Group();
                const platform = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8),
                    new THREE.MeshBasicMaterial({ 
                        color: 0xff0040, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.9
                    })
                );
                const weapon = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8),
                    new THREE.MeshBasicMaterial({ 
                        color: 0x40ff80, 
                        wireframe: true,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                weapon.position.y = 0.25;
                defenseGroup.add(platform, weapon);
                satellite = defenseGroup;
                break;
        }
        
        const pathRadius = Math.random() * 4 + 6;
        const angle = Math.random() * Math.PI * 2;
        const inclination = (Math.random() - 0.5) * Math.PI * 0.5;
        
        satellite.position.set(
            Math.cos(angle) * pathRadius * Math.cos(inclination),
            Math.sin(inclination) * pathRadius,
            Math.sin(angle) * pathRadius * Math.cos(inclination)
        );
        
        satellite.userData.pathRadius = pathRadius;
        satellite.userData.angle = angle;
        satellite.userData.inclination = inclination;
        satellite.userData.speed = Math.random() * 0.004 + 0.002;
        satellite.userData.type = 'satellite';
        satellite.userData.rotSpeed = (Math.random() - 0.5) * 0.02;
        
        group.add(satellite);
    }

    // Space traffic lanes (light trails)
    for (let i = 0; i < 8; i++) {
        const points = [];
        const radius = 12 + i * 2;
        for (let j = 0; j <= 64; j++) {
            const angle = (j / 64) * Math.PI * 2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 4,
                Math.sin(angle) * radius
            ));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.4 
        });
        const lane = new THREE.Line(geometry, material);
        lane.userData.baseOpacity = 0.2;
        group.add(lane);
    }

    group.userData.animate = () => {
        const time = Date.now() * 0.001;
        
        // Animate planet rotation
        planet.rotation.y += 0.001;
        
        // Animate atmosphere with subtle pulsing
        atmosphere.rotation.y += 0.0005;
        atmosphere.material.opacity = 0.15 + Math.sin(time * 0.5) * 0.05;
        
        // Animate clouds at different speed than planet
        clouds.rotation.y += 0.0008;
        clouds.rotation.x += 0.0002;
        
        // Animate city lights with realistic day/night cycle effect
        const nightSide = Math.sin(planet.rotation.y);
        cityLights.material.opacity = 0.6 + Math.abs(nightSide) * 0.4;
        cityLights.material.size = 0.08 + Math.sin(time * 8) * 0.02;
        
        // Animate spaceships and satellites
        group.children.forEach(child => {
            if (child.userData.pathRadius) {
                child.userData.angle += child.userData.speed;
                
                const x = Math.cos(child.userData.angle) * child.userData.pathRadius * Math.cos(child.userData.inclination);
                const y = Math.sin(child.userData.inclination) * child.userData.pathRadius;
                const z = Math.sin(child.userData.angle) * child.userData.pathRadius * Math.cos(child.userData.inclination);
                
                child.position.set(x, y, z);
                
                if (child.userData.type === 'spaceship') {
                    // Spaceships look at their direction of travel
                    const nextX = Math.cos(child.userData.angle + 0.1) * child.userData.pathRadius * Math.cos(child.userData.inclination);
                    const nextZ = Math.sin(child.userData.angle + 0.1) * child.userData.pathRadius * Math.cos(child.userData.inclination);
                    child.lookAt(new THREE.Vector3(nextX, y, nextZ));
                } else if (child.userData.type === 'satellite') {
                    // Satellites rotate on their axis and stay oriented toward planet
                    child.rotation.y += child.userData.rotSpeed;
                    child.rotation.x += child.userData.rotSpeed * 0.5;
                    // Keep communication arrays pointed toward planet
                    child.lookAt(new THREE.Vector3(0, 0, 0));
                }
            }
            
            // Animate traffic lanes with flowing effect
            if (child.material && child.material.color && child.material.color.r === 0) {
                child.material.opacity = child.userData.baseOpacity + Math.sin(time * 3 + child.position.x) * 0.15;
            }
        });
    };
    return group;
}


// Create intro/header scene with cosmic intro GLSL effects
function createIntroScene() {
    const group = new THREE.Group();
    
    // Central cosmic portal/vortex
    const portalGeometry = new THREE.RingGeometry(1, 8, 32, 8);
    const portalMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            varying vec2 vUv;
            
            float noise(vec2 p) {
                return sin(p.x * 10.0 + time) * sin(p.y * 10.0 + time * 0.8) * 0.5 + 0.5;
            }
            
            void main() {
                vec2 center = vec2(0.5);
                float dist = distance(vUv, center);
                
                // Spiral pattern
                float angle = atan(vUv.y - center.y, vUv.x - center.x) + time * 2.0;
                float spiral = sin(angle * 8.0 + dist * 20.0 - time * 5.0) * 0.5 + 0.5;
                
                // Cosmic colors
                vec3 color1 = vec3(0.1, 0.3, 0.8); // Deep blue
                vec3 color2 = vec3(0.8, 0.2, 0.9); // Purple
                vec3 color3 = vec3(0.9, 0.7, 0.1); // Gold
                
                float n = noise(vUv * 3.0 + time * 0.1);
                vec3 color = mix(color1, color2, spiral);
                color = mix(color, color3, n * spiral);
                
                // Fade from center
                float fade = 1.0 - smoothstep(0.0, 0.8, dist);
                
                gl_FragColor = vec4(color * fade, fade * 0.8);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide
    });
    
    const portal = new THREE.Mesh(portalGeometry, portalMaterial);
    portal.rotation.x = -Math.PI / 2;
    group.add(portal);
    
    // Floating cosmic particles
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = [];
    const particleColors = [];
    
    for (let i = 0; i < particleCount; i++) {
        particlePositions.push(
            (Math.random() - 0.5) * 50,
            Math.random() * 30 - 15,
            (Math.random() - 0.5) * 50
        );
        
        const hue = Math.random();
        const color = new THREE.Color().setHSL(hue, 0.8, 0.6);
        particleColors.push(color.r, color.g, color.b);
    }
    
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    group.add(particles);
    
    // Cosmic rings
    for (let i = 0; i < 5; i++) {
        const ringGeometry = new THREE.RingGeometry(5 + i * 3, 6 + i * 3, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(i * 0.2, 0.6, 0.4),
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
        ring.rotation.z = Math.random() * Math.PI;
        ring.userData.rotSpeed = (Math.random() - 0.5) * 0.002;
        group.add(ring);
    }
    
    group.userData.animate = () => {
        const time = Date.now() * 0.001;
        
        // Update portal shader
        portal.material.uniforms.time.value = time;
        portal.rotation.z += 0.005;
        
        // Animate particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i] * 0.01) * 0.02;
            // Swirl effect
            const x = positions[i];
            const z = positions[i + 2];
            const distance = Math.sqrt(x * x + z * z);
            const angle = Math.atan2(z, x) + time * 0.001;
            positions[i] = Math.cos(angle) * distance;
            positions[i + 2] = Math.sin(angle) * distance;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Animate rings
        group.children.forEach(child => {
            if (child.userData.rotSpeed) {
                child.rotation.z += child.userData.rotSpeed;
                child.material.opacity = 0.1 + Math.sin(time * 2 + child.position.y) * 0.1;
            }
        });
    };
    
    return group;
}

const sectionThemes = {
    'intro': createIntroScene,
    'energy': createEnergyField,
    'particles': () => {
        const group = new THREE.Group();
        
        // Create fundamental particles soup - quarks, gluons, electrons, neutrinos
        const particleTypes = [
            { name: 'quarks', color: 0xff0040, size: 0.3, count: 800 },
            { name: 'gluons', color: 0x00ff80, size: 0.2, count: 600 },
            { name: 'electrons', color: 0x4080ff, size: 0.15, count: 400 },
            { name: 'neutrinos', color: 0xffff00, size: 0.1, count: 1000 }
        ];
        
        const allParticles = [];
        
        particleTypes.forEach(type => {
            const geometry = new THREE.BufferGeometry();
            const positions = [];
            const velocities = [];
            const colors = [];
            
            for (let i = 0; i < type.count; i++) {
                // Dense soup distribution
                const radius = Math.random() * 15 + 5;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;
                
                positions.push(
                    radius * Math.sin(phi) * Math.cos(theta),
                    radius * Math.sin(phi) * Math.sin(theta),
                    radius * Math.cos(phi)
                );
                
                // High-energy random motion
                velocities.push(
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.1
                );
                
                const color = new THREE.Color(type.color);
                colors.push(color.r, color.g, color.b);
            }
            
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            
            const material = new THREE.PointsMaterial({
                size: type.size,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            
            const particles = new THREE.Points(geometry, material);
            particles.userData = {
                velocities: velocities,
                type: type.name,
                interactionStrength: Math.random() * 0.5 + 0.5
            };
            
            allParticles.push(particles);
            group.add(particles);
        });
        
        // Add particle interaction field visualization
        const fieldGeometry = new THREE.SphereGeometry(20, 32, 32);
        const fieldMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8000,
            transparent: true,
            opacity: 0.1,
            wireframe: true
        });
        const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
        group.add(field);
        
        // Add energy waves
        for (let i = 0; i < 5; i++) {
            const waveGeometry = new THREE.RingGeometry(i * 4 + 2, i * 4 + 3, 32);
            const waveMaterial = new THREE.MeshBasicMaterial({
                color: 0xff4000,
                transparent: true,
                opacity: 0.3,
                side: THREE.DoubleSide
            });
            const wave = new THREE.Mesh(waveGeometry, waveMaterial);
            wave.rotation.x = Math.random() * Math.PI;
            wave.rotation.y = Math.random() * Math.PI;
            wave.userData.speed = (Math.random() + 0.5) * 0.01;
            group.add(wave);
        }
        
        group.userData.animate = () => {
            const time = Date.now() * 0.001;
            
            // Animate particle soup with high-energy interactions
            allParticles.forEach(particleSystem => {
                const positions = particleSystem.geometry.attributes.position.array;
                const velocities = particleSystem.userData.velocities;
                const strength = particleSystem.userData.interactionStrength;
                
                for (let i = 0; i < positions.length; i += 3) {
                    // Update positions with velocity
                    positions[i] += velocities[i * 3];
                    positions[i + 1] += velocities[i * 3 + 1];
                    positions[i + 2] += velocities[i * 3 + 2];
                    
                    // Add quantum fluctuations
                    positions[i] += Math.sin(time * 10 + i) * 0.02 * strength;
                    positions[i + 1] += Math.cos(time * 12 + i) * 0.02 * strength;
                    positions[i + 2] += Math.sin(time * 8 + i) * 0.02 * strength;
                    
                    // Containment field (particles stay in hot soup)
                    const distance = Math.sqrt(positions[i]**2 + positions[i + 1]**2 + positions[i + 2]**2);
                    if (distance > 25) {
                        velocities[i * 3] *= -0.8;
                        velocities[i * 3 + 1] *= -0.8;
                        velocities[i * 3 + 2] *= -0.8;
                    }
                    
                    // Add brownian motion
                    velocities[i * 3] += (Math.random() - 0.5) * 0.001;
                    velocities[i * 3 + 1] += (Math.random() - 0.5) * 0.001;
                    velocities[i * 3 + 2] += (Math.random() - 0.5) * 0.001;
                    
                    // Velocity damping
                    velocities[i * 3] *= 0.99;
                    velocities[i * 3 + 1] *= 0.99;
                    velocities[i * 3 + 2] *= 0.99;
                }
                
                particleSystem.geometry.attributes.position.needsUpdate = true;
                
                // Particle system rotation for dynamic effect
                particleSystem.rotation.y += 0.002 * strength;
            });
            
            // Animate field
            field.rotation.x += 0.005;
            field.rotation.y += 0.003;
            field.material.opacity = 0.05 + Math.sin(time * 2) * 0.05;
            
            // Animate energy waves
            group.children.forEach(child => {
                if (child.userData.speed) {
                    child.rotation.z += child.userData.speed;
                    child.material.opacity = 0.2 + Math.sin(time * 3 + child.position.x) * 0.1;
                }
            });
        };
        
        return group;
    },
    'blue-giants': createGasCloud,
    'orbits': createSolarSystem,
    'life': createLifeScene,
    'living': createCivilizationScene,
    'performance': createCivilizationScene // Using civilization scene for performance section
};

let isTransitioning = false;

// Safety function to ensure canvas is always in proper state
function ensureCanvasState() {
    const canvas = document.querySelector('#bg');
    if (canvas && !isTransitioning) {
        canvas.style.transition = '';
        canvas.style.opacity = '1';
        // Remove old overlay fade code since we're using shader-only fades
    }
}

// Call safety check periodically
setInterval(ensureCanvasState, 2000);

function setScene(themeFunction, sectionName = null, forceChange = false) {
    const now = Date.now();
    
    // Debounce scene changes unless forced (like navigation clicks)
    if (!forceChange && (isTransitioning || (now - lastSceneChangeTime) < SCENE_CHANGE_DEBOUNCE)) {
        return;
    }
    
    isTransitioning = true;
    lastSceneChangeTime = now;
    
    const canvas = document.querySelector('#bg');
    
    // Update scene title immediately when scene change starts
    if (sectionName) {
        updateSceneTitle(sectionName);
    }
    
    // GLSL shader-only fade transition (no section content fade)
    canvas.style.transition = 'opacity 0.3s ease-in-out';
    canvas.style.opacity = '0';
    
    setTimeout(() => {
        // Change the scene during fade
        if (currentSceneObject) {
            scene.remove(currentSceneObject);
        }
        currentSceneObject = themeFunction();
        scene.add(currentSceneObject);
        
        console.log('GLSL scene changed with shader-only fade to:', sectionName || 'unknown');
        
        // Fade GLSL back in
        setTimeout(() => {
            canvas.style.opacity = '1';
            
            setTimeout(() => {
                canvas.style.transition = '';
                isTransitioning = false;
            }, 300);
        }, 50);
    }, 150); // Total: 0.3 seconds
}

const sections = document.querySelectorAll('section');

// Enhanced mobile detection
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (typeof window.orientation !== "undefined") ||
           (navigator.userAgent.indexOf('IEMobile') !== -1) ||
           window.innerWidth <= 768;
};

const mobileDetected = isMobileDevice();
console.log('Mobile detected:', mobileDetected); // Debug logging

// Multiple detection methods for scene changes with snappier debouncing
let lastActiveSection = '';
let lastSceneChangeTime = 0;
const SCENE_CHANGE_DEBOUNCE = 400; // Reduced from 800ms to 400ms for snappier response

// Function to update scroll progress indicator
function updateScrollProgress() {
    const scrollProgress = document.getElementById('scroll-progress-bar');
    const scrollIndicator = document.getElementById('scroll-progress-indicator');
    
    if (!scrollProgress || !scrollIndicator) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercentage = Math.min(Math.max(scrollTop / documentHeight, 0), 1);
    
    // Update progress bar height
    scrollProgress.style.height = (scrollPercentage * 100) + '%';
    
    // Update indicator position
    const containerHeight = document.getElementById('scroll-progress-container').offsetHeight;
    const indicatorPosition = scrollPercentage * (containerHeight - 16); // 16px is indicator height
    scrollIndicator.style.top = indicatorPosition + 'px';
    
    // Change indicator color based on progress
    if (scrollPercentage < 0.3) {
        scrollIndicator.style.background = '#ff0080'; // Pink for beginning
    } else if (scrollPercentage < 0.7) {
        scrollIndicator.style.background = '#0ff'; // Cyan for middle
    } else {
        scrollIndicator.style.background = '#80ff00'; // Green for end
    }
}

// Function to update scene title indicator
function updateSceneTitle(sectionName) {
    const indicator = document.getElementById('scene-title-indicator');
    if (!indicator) return;
    
    const sceneInfo = {
        'intro': { number: '0', name: 'Cosmic Intro' },
        'energy': { number: '1', name: 'Energy Field' },
        'particles': { number: '2', name: 'Particles' },
        'blue-giants': { number: '3', name: 'Blue Giants' },
        'orbits': { number: '4', name: 'Orbits' },
        'life': { number: '5', name: 'Life' },
        'living': { number: '6', name: 'Living' },
        'performance': { number: '7', name: 'Performance' }
    };
    
    const info = sceneInfo[sectionName];
    if (info) {
        const numberSpan = indicator.querySelector('.scene-number');
        const nameSpan = indicator.querySelector('.scene-name');
        
        if (numberSpan && nameSpan) {
            numberSpan.textContent = info.number + '.';
            nameSpan.textContent = info.name;
        }
        
        // Show the indicator with animation
        indicator.classList.add('visible');
        console.log('Scene title updated:', info.number, info.name);
    }
}

// Function to update active navigation state and highlight section titles
function updateActiveNav(activeSection) {
    const navLinks = document.querySelectorAll('.nav-link');
    const arrows = document.querySelectorAll('.nav-timeline-arrow');
    
    // Remove active class from all links and arrows
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    arrows.forEach(arrow => {
        arrow.classList.remove('active');
    });
    
    // Add active class to current section link and arrow
    navLinks.forEach(link => {
        if (link.dataset.section === activeSection) {
            link.classList.add('active');
            const arrow = link.querySelector('.nav-timeline-arrow');
            if (arrow) {
                arrow.classList.add('active');
            }
        }
    });
    
    // Highlight the current section title
    highlightCurrentSectionTitle(activeSection);
    
    console.log('Updated navigation and arrow for:', activeSection);
}

// Function to highlight the current section title
function highlightCurrentSectionTitle(sectionName) {
    // Remove active class from all section titles
    const allTitles = document.querySelectorAll('.section-title');
    allTitles.forEach(title => {
        title.classList.remove('active');
    });
    
    // Add active class to current section title
    const currentSection = document.getElementById(sectionName);
    if (currentSection) {
        const sectionTitle = currentSection.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.classList.add('active');
            console.log('Highlighted section title:', sectionName);
        }
    }
}

// Update navigation state based on scroll position
function updateNavigationFromScroll(sectionName) {
    if (sectionName) {
        updateActiveNav(sectionName);
        console.log('Updated navigation highlighting for:', sectionName);
    }
}

// Enhanced intersection observer with intro section support
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const themeName = entry.target.id;
            console.log('Section intersecting:', themeName, 'Ratio:', entry.intersectionRatio);
            
            // Special threshold for intro section (more sensitive)
            const threshold = themeName === 'intro' ? 0.2 : 0.3;
            
            // Only change scene if enough of section is visible
            if (entry.intersectionRatio > threshold && sectionThemes[themeName] && themeName !== lastActiveSection) {
                console.log('Changing scene to:', themeName);
                setScene(sectionThemes[themeName], themeName);
                updateNavigationFromScroll(themeName);
                lastActiveSection = themeName;
            }
        }
    });
}, { 
    threshold: [0.1, 0.2, 0.3, 0.5, 0.7],  // More granular thresholds
    rootMargin: mobileDetected ? '-10% 0px -10% 0px' : '-5% 0px -5% 0px'  // Tighter margins for accuracy
});

// Enhanced scroll detection to include intro section and prevent blank states
let scrollTimeout;
const handleScroll = () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    // Update scroll progress immediately for smooth animation
    updateScrollProgress();
    
    const throttleTime = mobileDetected ? 50 : 100;
    
    scrollTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        console.log('Scroll position:', scrollPosition, 'Window height:', windowHeight, 'Doc height:', documentHeight);
        
        // Special handling for intro section at the top
        if (scrollPosition < windowHeight * 0.5) {
            if (lastActiveSection !== 'intro') {
                console.log('At top - switching to intro scene');
                setScene(sectionThemes['intro'], 'intro');
                updateNavigationFromScroll('intro');
                lastActiveSection = 'intro';
            }
            return;
        }
        
        // Special handling for end of page - maintain last valid scene
        if (scrollPosition + windowHeight >= documentHeight - 100) {
            console.log('Near end of page - maintaining current scene:', lastActiveSection);
            return; // Don't change scene at the very end
        }
        
        let mostVisibleSection = null;
        let maxVisibleArea = 0;
        
        // Find the section with the most visible area
        sections.forEach((section) => {
            if (section.id === 'intro') return; // Skip intro, handled above
            
            const rect = section.getBoundingClientRect();
            const sectionTop = Math.max(0, -rect.top);
            const sectionBottom = Math.min(rect.height, windowHeight - rect.top);
            const visibleHeight = Math.max(0, sectionBottom - sectionTop);
            const visibleArea = visibleHeight / rect.height;
            
            if (visibleArea > maxVisibleArea && visibleArea > 0.3) { // Must be at least 30% visible
                maxVisibleArea = visibleArea;
                mostVisibleSection = section;
            }
        });
        
        if (mostVisibleSection) {
            const themeName = mostVisibleSection.id;
            console.log('Most visible section:', themeName, 'Visibility:', maxVisibleArea);
            if (sectionThemes[themeName] && themeName !== lastActiveSection) {
                console.log('Scroll changing scene to:', themeName);
                setScene(sectionThemes[themeName], themeName);
                updateNavigationFromScroll(themeName);
                lastActiveSection = themeName;
            }
        }
    }, throttleTime);
};

// Use scroll detection as primary method on mobile, intersection observer on desktop
if (mobileDetected) {
    console.log('Using scroll detection for mobile');
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Also use intersection observer as backup
    sections.forEach(section => {
        observer.observe(section);
    });
} else {
    console.log('Using intersection observer for desktop');
    sections.forEach(section => {
        observer.observe(section);
    });
}

// Manual trigger on page load to set initial scene
setTimeout(() => {
    handleScroll();
}, 1000);

// Navigation functionality
const navLinks = document.querySelectorAll('.nav-link');
const navToggle = document.getElementById('nav-toggle');
const navSidebar = document.getElementById('navigation-sidebar');

// Handle navigation clicks
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = link.dataset.section;
        const targetSection = document.getElementById(sectionName);
        
        console.log('Navigation clicked:', sectionName);
        
        if (targetSection && sectionThemes[sectionName]) {
            // Force immediate scene change with fade transition for navigation
            setScene(sectionThemes[sectionName], sectionName, true);
            lastActiveSection = sectionName;
            
            // Update navigation state
            updateActiveNav(sectionName);
            
            // Smooth scroll to section with small delay for transition
            setTimeout(() => {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 150);
            
            // Close sidebar on mobile after click
            if (mobileDetected) {
                navSidebar.classList.remove('open');
            }
            
            // Close sidebar on desktop after click too
            navSidebar.classList.remove('open');
            
            console.log('Scene changed to:', sectionName); // Debug
        }
    });
});

// Toggle navigation sidebar
navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    navSidebar.classList.toggle('open');
    console.log('Nav toggle clicked, open:', navSidebar.classList.contains('open'));
});

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!navSidebar.contains(e.target) && !navToggle.contains(e.target)) {
        navSidebar.classList.remove('open');
    }
});

// Additional touch event handling for mobile
if (mobileDetected) {
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndY = e.changedTouches[0].screenY;
        // Trigger scroll detection after touch scroll
        setTimeout(handleScroll, 300);
    }, { passive: true });
    
    // Also trigger on scroll events for mobile browsers that support it
    document.addEventListener('scroll', handleScroll, { passive: true });
    
    // Periodic check for mobile (fallback)
    setInterval(() => {
        handleScroll();
    }, 2000);
}

function animate() {
    requestAnimationFrame(animate);
    if (currentSceneObject && currentSceneObject.userData.animate) {
        currentSceneObject.userData.animate();
    }
    controls.update();
    renderer.render(scene, camera);
}

// Wait for DOM to be fully loaded before setting up navigation
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation after DOM is loaded
    setTimeout(() => {
        updateActiveNav('energy');
        console.log('Navigation initialized');
    }, 100);
    
    // Collapsible content functionality
    document.querySelectorAll('.collapse-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const contentDiv = this.parentElement.nextElementSibling;
            const icon = this.querySelector('.collapse-icon');
            
            if (contentDiv.classList.contains('expanded')) {
                contentDiv.classList.remove('expanded');
                icon.textContent = '+';
                this.setAttribute('aria-expanded', 'false');
            } else {
                contentDiv.classList.add('expanded');
                icon.textContent = '−';
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
});

// Initial scene setup with snappier fade-in
function initializeScene() {
    // Start with intro scene
    currentSceneObject = createIntroScene();
    scene.add(currentSceneObject);
    lastActiveSection = 'intro';
    
    // Create faster fade-in effect for initial load
    const canvas = document.querySelector('#bg');
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 1.2s ease-out';
    
    // Set initial navigation state and highlight intro title
    updateActiveNav('intro');
    
    // Show scene title indicator immediately for intro
    updateSceneTitle('intro');
    
    // Initialize scroll progress indicator
    updateScrollProgress();
    
    // Remove loading screen and fade in the scene (with extra time for preloading)
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.5s ease-out';
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
        
        // Faster fade in the intro scene
        setTimeout(() => {
            canvas.style.opacity = '1';
            
            setTimeout(() => {
                canvas.style.transition = '';
                console.log('Initial intro scene loaded with shader-only fade-in');
            }, 1200);
        }, 300);
    }, 1500); // Increased delay for better preloading
}

// Initialize and start
initializeScene();
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
