import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Handle loading screen
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Initializing Macroverse');
    const loadingScreen = document.getElementById('loading-screen');
    
    const hideLoadingScreen = () => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                console.log('Loading screen hidden');
            }, 500);
        }
    };
    
    // Initialize Three.js scene first
    try {
        initializeThreeJS();
        console.log('Three.js initialized successfully');
        // Hide loading screen after scene is ready
        setTimeout(hideLoadingScreen, 1200);
    } catch (error) {
        console.error('Error initializing Three.js:', error);
        // Still hide loading screen even if there's an error
        setTimeout(hideLoadingScreen, 1200);
    }
});

function initializeThreeJS() {
    console.log('Setting up Three.js scene');
    
    const canvas = document.querySelector('#bg');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create animated background particles
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        velocities[i * 3] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0x4fc3f7,
        size: 2,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    
    // Add some connecting lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4fc3f7, 
        transparent: true, 
        opacity: 0.1 
    });
    
    for (let i = 0; i < 20; i++) {
        linePositions.push(
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60,
            (Math.random() - 0.5) * 60
        );
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update particles
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i * 3];
            positions[i * 3 + 1] += velocities[i * 3 + 1];
            positions[i * 3 + 2] += velocities[i * 3 + 2];
            
            // Wrap around edges
            if (Math.abs(positions[i * 3]) > 50) velocities[i * 3] *= -1;
            if (Math.abs(positions[i * 3 + 1]) > 50) velocities[i * 3 + 1] *= -1;
            if (Math.abs(positions[i * 3 + 2]) > 50) velocities[i * 3 + 2] *= -1;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        
        // Rotate the scene slightly
        particles.rotation.y += 0.001;
        lines.rotation.x += 0.0005;
        lines.rotation.y += 0.0008;
        
        renderer.render(scene, camera);
    }
    
    // Window resize handler
    const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Start animation
    animate();
    console.log('Three.js animation started');
}

// --- Original Scene Creation Functions (kept for compatibility) ---

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
    
    // Create terrain/earth-like base
    const terrainGeometry = new THREE.PlaneGeometry(60, 60, 32, 32);
    const terrainVertices = terrainGeometry.attributes.position.array;
    
    // Add height variation to create terrain
    for (let i = 0; i < terrainVertices.length; i += 3) {
        terrainVertices[i + 2] = Math.sin(terrainVertices[i] * 0.1) * Math.cos(terrainVertices[i + 1] * 0.1) * 3;
    }
    terrainGeometry.attributes.position.needsUpdate = true;
    terrainGeometry.computeVertexNormals();
    
    const terrainMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        transparent: true,
        opacity: 0.8
    });
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -15;
    group.add(terrain);
    
    // Add vegetation/life patches
    for (let i = 0; i < 20; i++) {
        const patchGeometry = new THREE.CircleGeometry(Math.random() * 3 + 1, 8);
        const patchMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(0.1 + Math.random() * 0.3, 0.4 + Math.random() * 0.4, 0.1),
            transparent: true,
            opacity: 0.7
        });
        const patch = new THREE.Mesh(patchGeometry, patchMaterial);
        patch.rotation.x = -Math.PI / 2;
        patch.position.set(
            (Math.random() - 0.5) * 50,
            -14.5,
            (Math.random() - 0.5) * 50
        );
        group.add(patch);
    }
    
    // Water bodies
    for (let i = 0; i < 5; i++) {
        const waterGeometry = new THREE.CircleGeometry(Math.random() * 4 + 2, 16);
        const waterMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x4682B4,
            transparent: true,
            opacity: 0.6
        });
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.set(
            (Math.random() - 0.5) * 40,
            -14.8,
            (Math.random() - 0.5) * 40
        );
        water.userData.baseY = water.position.y;
        group.add(water);
    }
    
    // Mountains/hills in the distance
    for (let i = 0; i < 8; i++) {
        const mountainGeometry = new THREE.ConeGeometry(Math.random() * 3 + 2, Math.random() * 8 + 5, 8);
        const mountainMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x696969,
            transparent: true,
            opacity: 0.6
        });
        const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
        mountain.position.set(
            (Math.random() - 0.5) * 80,
            -10 + Math.random() * 5,
            (Math.random() - 0.5) * 80
        );
        group.add(mountain);
    }
    
    // Complex life patterns (fractal-like structures)
    for (let i = 0; i < 15; i++) {
        const complexity = Math.random() * 0.5 + 0.5;
        const lifeForm = new THREE.Group();
        
        // Central structure
        const coreGeometry = new THREE.SphereGeometry(complexity * 2, 8, 8);
        const coreMaterial = new THREE.MeshBasicMaterial({ 
            color: new THREE.Color(0.2, 0.6 + Math.random() * 0.4, 0.3),
            transparent: true,
            opacity: 0.7
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        lifeForm.add(core);
        
        // Branching structures
        for (let j = 0; j < 6; j++) {
            const branchGeometry = new THREE.CylinderGeometry(0.1, 0.3, complexity * 3, 4);
            const branchMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x228B22,
                transparent: true,
                opacity: 0.6
            });
            const branch = new THREE.Mesh(branchGeometry, branchMaterial);
            const angle = (j / 6) * Math.PI * 2;
            branch.position.set(
                Math.cos(angle) * complexity * 2,
                complexity,
                Math.sin(angle) * complexity * 2
            );
            branch.rotation.z = angle;
            lifeForm.add(branch);
        }
        
        lifeForm.position.set(
            (Math.random() - 0.5) * 40,
            -10 + Math.random() * 10,
            (Math.random() - 0.5) * 40
        );
        lifeForm.userData.rotSpeed = (Math.random() - 0.5) * 0.01;
        group.add(lifeForm);
    }

    // Atmospheric particles
    const atmosphereGeometry = new THREE.BufferGeometry();
    const atmospherePositions = [];
    for (let i = 0; i < 800; i++) {
        atmospherePositions.push(
            (Math.random() - 0.5) * 100,
            Math.random() * 40 - 20,
            (Math.random() - 0.5) * 100
        );
    }
    atmosphereGeometry.setAttribute('position', new THREE.Float32BufferAttribute(atmospherePositions, 3));
    const atmosphereMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.2, 
        transparent: true, 
        opacity: 0.4 
    });
    const atmosphere = new THREE.Points(atmosphereGeometry, atmosphereMaterial);
    group.add(atmosphere);

    // Add ambient lighting for the scene
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    group.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    group.add(directionalLight);
    
    group.userData.animate = () => {
        const time = Date.now() * 0.001;
        
        // Animate terrain (subtle breathing effect)
        const terrainVertices = terrain.geometry.attributes.position.array;
        for (let i = 0; i < terrainVertices.length; i += 3) {
            const x = terrainVertices[i];
            const y = terrainVertices[i + 1];
            terrainVertices[i + 2] = Math.sin(x * 0.1 + time * 0.5) * Math.cos(y * 0.1 + time * 0.3) * 3 + Math.sin(time * 2) * 0.2;
        }
        terrain.geometry.attributes.position.needsUpdate = true;
        terrain.geometry.computeVertexNormals();
        
        // Animate water
        group.children.forEach(child => {
            if (child.material && child.material.color && child.material.color.b > 0.5) { // Water detection
                child.position.y = child.userData.baseY + Math.sin(time * 3) * 0.1;
                child.material.opacity = 0.6 + Math.sin(time * 4) * 0.2;
            }
        });
        
        // Animate life forms
        group.children.forEach(child => {
            if (child.userData.rotSpeed !== undefined) {
                child.rotation.y += child.userData.rotSpeed;
                child.children.forEach(subChild => {
                    if (subChild.geometry instanceof THREE.SphereGeometry) {
                        subChild.scale.setScalar(1 + Math.sin(time * 5 + child.position.x) * 0.1);
                    }
                });
            }
        });
        
        // Animate atmosphere
        atmosphere.rotation.y += 0.0002;
        const positions = atmosphere.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i] * 0.01) * 0.01;
            if (positions[i + 1] > 20) positions[i + 1] = -20;
        }
        atmosphere.geometry.attributes.position.needsUpdate = true;
    };
    return group;
}

function createCivilizationScene() {
    const group = new THREE.Group();
    
    // Enhanced planet with more detailed surface
    const planetGeometry = new THREE.SphereGeometry(5, 64, 64);
    const planetVertices = planetGeometry.attributes.position.array;
    
    // Add surface variation
    for (let i = 0; i < planetVertices.length; i += 3) {
        const length = Math.sqrt(planetVertices[i] ** 2 + planetVertices[i + 1] ** 2 + planetVertices[i + 2] ** 2);
        const noise = Math.sin(planetVertices[i] * 0.8) * Math.cos(planetVertices[i + 1] * 0.8) * 0.1;
        planetVertices[i] *= (1 + noise / length);
        planetVertices[i + 1] *= (1 + noise / length);
        planetVertices[i + 2] *= (1 + noise / length);
    }
    planetGeometry.attributes.position.needsUpdate = true;
    planetGeometry.computeVertexNormals();
    
    const planetMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2288ff, 
        roughness: 0.8,
        metalness: 0.1
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    group.add(planet);
    
    // Enhanced city lights with different patterns
    const lightsMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 0.08 });
    const lightsGeometry = new THREE.BufferGeometry();
    const lightPositions = [];
    
    // Create city clusters
    for (let cluster = 0; cluster < 8; cluster++) {
        const clusterLat = (Math.random() - 0.5) * Math.PI;
        const clusterLon = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < 100; i++) {
            const lat = clusterLat + (Math.random() - 0.5) * 0.5;
            const lon = clusterLon + (Math.random() - 0.5) * 0.5;
            const p = new THREE.Vector3();
            p.setFromSphericalCoords(5.05, Math.PI/2 - lat, lon);
            lightPositions.push(p.x, p.y, p.z);
        }
    }
    
    lightsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lightPositions, 3));
    const cityLights = new THREE.Points(lightsGeometry, lightsMaterial);
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
        
        // Animate planet
        planet.rotation.y += 0.001;
        
        // Animate city lights (flickering effect)
        cityLights.material.size = 0.08 + Math.sin(time * 10) * 0.02;
        
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
                    // Satellites rotate on their axis
                    child.rotation.y += child.userData.rotSpeed;
                    child.rotation.x += child.userData.rotSpeed * 0.5;
                }
            }
            
            // Animate traffic lanes
            if (child.material && child.material.color && child.material.color.r === 0) {
                child.material.opacity = child.userData.baseOpacity + Math.sin(time * 3 + child.position.x) * 0.1;
            }
        });
    };
    return group;
}


const sectionThemes = {
    'energy': createEnergyField,
    'particles': () => {
        const group = new THREE.Group();
        const material = new THREE.PointsMaterial({ color: 0xff4500, size: 0.1 });
        const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
        const points = new THREE.Points(geometry, material);
        group.add(points);
        group.userData.animate = () => {
            points.rotation.y += 0.005;
        };
        return group;
    },
    'blue-giants': createGasCloud,
    'orbits': createSolarSystem,
    'life': createLifeScene,
    'living': createCivilizationScene,
    'performance': createCivilizationScene // Using civilization scene for performance section
};

function setScene(themeFunction) {
    if (currentSceneObject) {
        scene.remove(currentSceneObject);
    }
    currentSceneObject = themeFunction();
    scene.add(currentSceneObject);
    
    // Debug: Add visual indicator for mobile
    const isMobileCheck = isMobileDevice();
    if (isMobileCheck) {
        console.log('Scene changed successfully');
        // Temporarily flash the screen to indicate scene change (for debugging)
        const canvas = document.querySelector('#bg');
        canvas.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            canvas.style.filter = 'brightness(1)';
        }, 200);
    }
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

// Multiple detection methods for scene changes
let lastActiveSection = '';

// Function to update active navigation state
function updateActiveNav(activeSection) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === activeSection) {
            link.classList.add('active');
        }
    });
}

// Update navigation state based on scroll position
function updateNavigationFromScroll(sectionName) {
    if (sectionName && sectionName !== lastActiveSection) {
        updateActiveNav(sectionName);
    }
}

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const themeName = entry.target.id;
            console.log('Section intersecting:', themeName); // Debug logging
            if (sectionThemes[themeName] && themeName !== lastActiveSection) {
                console.log('Changing scene to:', themeName); // Debug logging
                setScene(sectionThemes[themeName]);
                lastActiveSection = themeName;
                updateNavigationFromScroll(themeName);
            }
        }
    });
}, { 
    threshold: mobileDetected ? [0.1, 0.25, 0.5] : [0.5, 0.7],  // Multiple thresholds for mobile
    rootMargin: mobileDetected ? '-15% 0px -15% 0px' : '0px'  // Adjust margins for mobile
});

// Fallback scroll detection for mobile
let scrollTimeout;
const handleScroll = () => {
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }
    
    const throttleTime = mobileDetected ? 50 : 100; // Faster response on mobile
    
    scrollTimeout = setTimeout(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        console.log('Scroll position:', scrollPosition, 'Window height:', windowHeight); // Debug
        
        // Calculate which section should be active based on scroll position
        sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionHeight = rect.height;
            const sectionCenter = sectionTop + sectionHeight / 2;
            
            // More lenient detection for mobile
            const viewportCenter = scrollPosition + windowHeight / 2;
            const sectionStart = sectionTop + (mobileDetected ? sectionHeight * 0.2 : sectionHeight * 0.3);
            const sectionEnd = sectionTop + sectionHeight - (mobileDetected ? sectionHeight * 0.2 : sectionHeight * 0.3);
            
            // Check if viewport center is within section bounds
            if (viewportCenter >= sectionStart && viewportCenter <= sectionEnd) {
                const themeName = section.id;
                console.log('Scroll detected section:', themeName, 'at position:', viewportCenter); // Debug logging
                if (sectionThemes[themeName] && themeName !== lastActiveSection) {
                    console.log('Scroll changing scene to:', themeName); // Debug logging
                    setScene(sectionThemes[themeName]);
                    lastActiveSection = themeName;
                    updateNavigationFromScroll(themeName);
                }
            }
        });
    }, throttleTime); // Faster throttle for mobile
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
        
        console.log('Navigation clicked:', sectionName); // Debug
        
        if (targetSection && sectionThemes[sectionName]) {
            // Immediately change the scene
            setScene(sectionThemes[sectionName]);
            lastActiveSection = sectionName;
            
            // Update navigation state
            updateActiveNav(sectionName);
            
            // Add visual feedback for scene change
            const canvas = document.querySelector('#bg');
            canvas.style.transition = 'filter 0.3s ease';
            canvas.style.filter = 'brightness(1.3) contrast(1.1)';
            setTimeout(() => {
                canvas.style.filter = 'brightness(1) contrast(1)';
            }, 300);
            
            // Scroll to the section with smooth behavior
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
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

// Story Navigation Functions
function initializeStoryNavigation() {
    const storyNavLinks = document.querySelectorAll('.nav-link');
    const storySections = document.querySelectorAll('.story-section');
    
    // Show first story by default
    showStory('energy');
    
    storyNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showStory(sectionId);
            updateActiveNav(sectionId);
        });
    });
}

function showStory(sectionId) {
    // Hide all story sections
    document.querySelectorAll('.story-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected story section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update the background scene
    if (sectionThemes[sectionId]) {
        setScene(sectionThemes[sectionId]);
    }
}

// Initialization function
function initializeApp() {
    // Initial scene
    setScene(sectionThemes['energy']);
    animate();
    
    // Initialize navigation after DOM is loaded
    setTimeout(() => {
        updateActiveNav('energy');
        console.log('Navigation initialized');
    }, 100);
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
