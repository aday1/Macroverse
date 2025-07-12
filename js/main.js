import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

let starfield;
const sections = document.querySelectorAll('section');

function createSatellite() {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.2), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
    const panel1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.02), new THREE.MeshStandardMaterial({ color: 0x0000ff }));
    panel1.position.x = 0.5;
    const panel2 = panel1.clone();
    panel2.position.x = -0.5;
    const satellite = new THREE.Group();
    satellite.add(body);
    satellite.add(panel1);
    satellite.add(panel2);
    return satellite;
}

function createDNA() {
    const group = new THREE.Group();
    const material = new THREE.MeshPhongMaterial({ color: 0x32cd32 });
    for (let i = 0; i < 20; i++) {
        const r = 0.5;
        const angle = i * Math.PI / 5;
        const x1 = r * Math.cos(angle);
        const z1 = r * Math.sin(angle);
        const y = i * 0.2 - 2;

        const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), material);
        sphere1.position.set(x1, y, z1);
        group.add(sphere1);

        const x2 = -x1;
        const z2 = -z1;
        const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), material);
        sphere2.position.set(x2, y, z2);
        group.add(sphere2);

        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, r * 2), material);
        bar.position.set(0, y, 0);
        bar.rotation.y = angle;
        group.add(bar);
    }
    return group;
}

const sectionThemes = {
    'energy': {
        color: 0xc0c0c0,
        size: 0.7,
        speed: 0.0001,
        shape: 'star'
    },
    'particles': {
        color: 0xff4500,
        size: 1.5,
        speed: 0.001,
        shape: 'box'
    },
    'blue-giants': {
        color: 0x4169e1,
        size: 2.5,
        speed: 0.0002,
        shape: 'sphere'
    },
    'orbits': {
        color: 0xffd700,
        size: 1,
        speed: 0.0005,
        shape: 'satellite'
    },
    'life': {
        color: 0x32cd32,
        size: 1.2,
        speed: 0.0008,
        shape: 'dna'
    },
    'living': {
        color: 0xff69b4,
        size: 1.8,
        speed: 0.0003,
        shape: 'heart' // Custom shape
    }
};

function createParticles(theme) {
    if (starfield) {
        scene.remove(starfield);
    }

    const count = 500;
    const group = new THREE.Group();

    for (let i = 0; i < count; i++) {
        let particle;
        if (theme.shape === 'satellite') {
            particle = createSatellite();
        } else if (theme.shape === 'dna') {
            particle = createDNA();
        } else {
            const geometry = theme.shape === 'box' ? new THREE.BoxGeometry(0.1, 0.1, 0.1) : new THREE.SphereGeometry(0.1, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color: theme.color });
            particle = new THREE.Mesh(geometry, material);
        }
        
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(20));
        particle.position.set(x, y, z);
        particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        group.add(particle);
    }
    
    starfield = group;
    scene.add(starfield);
}

let currentTheme = sectionThemes['energy'];
createParticles(currentTheme);

function animate() {
    requestAnimationFrame(animate);
    if (starfield) {
        starfield.rotation.x += currentTheme.speed;
        starfield.rotation.y += currentTheme.speed;
    }
    renderer.render(scene, camera);
}

animate();

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const themeName = entry.target.id;
            document.documentElement.style.setProperty('--accent-color', `hsl(${Math.random() * 360}, 100%, 70%)`);
            currentTheme = sectionThemes[themeName];
            createParticles(currentTheme);
        }
    });
}, { threshold: 0.6 });

sections.forEach(section => {
    observer.observe(section);
});

function moveCamera() {
    const t = document.body.getBoundingClientRect().top;
    if (starfield) {
        starfield.position.y = t * 0.005;
    }
}

document.body.onscroll = moveCamera;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
