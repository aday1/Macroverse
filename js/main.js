import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

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
    const cloudTexture = textureLoader.load('https://cdn.rawgit.com/mrdoob/three.js/master/examples/textures/cloud.png');
    const material = new THREE.PointsMaterial({
        color: 0x4169e1,
        size: 20,
        map: cloudTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 200; i++) {
        positions.push((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, material);
    group.add(points);
    group.userData.animate = () => {
        points.rotation.y += 0.001;
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
    // Snowflakes
    const snowflakeMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true });
    const snowflakeGeometry = new THREE.BufferGeometry();
    const snowflakePositions = [];
    for (let i = 0; i < 1000; i++) {
        snowflakePositions.push((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50);
    }
    snowflakeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowflakePositions, 3));
    const snowflakes = new THREE.Points(snowflakeGeometry, snowflakeMaterial);
    group.add(snowflakes);

    // Nebula
    const textureLoader = new THREE.TextureLoader();
    const nebulaTexture = textureLoader.load('https://cdn.rawgit.com/mrdoob/three.js/master/examples/textures/crate.gif'); // Placeholder
    const nebulaMaterial = new THREE.MeshBasicMaterial({ map: nebulaTexture, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const nebula = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), nebulaMaterial);
    nebula.position.z = -20;
    group.add(nebula);
    
    group.userData.animate = () => {
        snowflakes.rotation.y += 0.0005;
        nebula.rotation.z += 0.0002;
    };
    return group;
}

function createCivilizationScene() {
    const group = new THREE.Group();
    // Planet
    const planet = new THREE.Mesh(new THREE.SphereGeometry(5, 32, 32), new THREE.MeshStandardMaterial({ color: 0x2288ff, roughness: 0.8 }));
    group.add(planet);
    // City lights
    const lightsMaterial = new THREE.PointsMaterial({ color: 0xffff00, size: 0.05 });
    const lightsGeometry = new THREE.BufferGeometry();
    const lightPositions = [];
    for (let i = 0; i < 500; i++) {
        const phi = Math.acos(-1 + (2 * i) / 500);
        const theta = Math.sqrt(500 * Math.PI) * phi;
        const p = new THREE.Vector3();
        p.setFromSphericalCoords(5.05, phi, theta);
        lightPositions.push(p.x, p.y, p.z);
    }
    lightsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lightPositions, 3));
    const cityLights = new THREE.Points(lightsGeometry, lightsMaterial);
    planet.add(cityLights);

    // Spaceship
    const spaceship = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1, 8), new THREE.MeshStandardMaterial({ color: 0xaaaaaa }));
    spaceship.position.set(10, 5, 0);
    group.add(spaceship);

    group.userData.animate = () => {
        planet.rotation.y += 0.001;
        spaceship.position.x = Math.cos(Date.now() * 0.0001) * 10;
        spaceship.position.z = Math.sin(Date.now() * 0.0001) * 10;
        spaceship.lookAt(planet.position);
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
    'living': createCivilizationScene
};

function setScene(themeFunction) {
    if (currentSceneObject) {
        scene.remove(currentSceneObject);
    }
    currentSceneObject = themeFunction();
    scene.add(currentSceneObject);
}

const sections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const themeName = entry.target.id;
            if (sectionThemes[themeName]) {
                setScene(sectionThemes[themeName]);
            }
        }
    });
}, { threshold: 0.7 });

sections.forEach(section => {
    observer.observe(section);
});

function animate() {
    requestAnimationFrame(animate);
    if (currentSceneObject && currentSceneObject.userData.animate) {
        currentSceneObject.userData.animate();
    }
    controls.update();
    renderer.render(scene, camera);
}

// Initial scene
setScene(sectionThemes['energy']);
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
