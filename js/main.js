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
        shape: 'ring'
    },
    'life': {
        color: 0x32cd32,
        size: 1.2,
        speed: 0.0008,
        shape: 'dna' // Custom shape
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

    const geometry = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: theme.color,
        size: theme.size,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    starfield = new THREE.Points(geometry, material);
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
