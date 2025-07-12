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
        shape: 'orbit-system' // Custom planetary orbit system
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
        shape: 'celebration' // Custom scene for "living"
    }
};

function createParticles(theme) {
    if (starfield) {
        scene.remove(starfield);
        // Remove all children if custom scene
        if (starfield.children) {
            for (let c of starfield.children) scene.remove(c);
        }
    }

    // Custom planetary orbit system for 'orbits'
    if (theme.shape === 'orbit-system') {
        const group = new THREE.Group();
        // Central star
        const starGeo = new THREE.SphereGeometry(0.7, 32, 32);
        const starMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
        const star = new THREE.Mesh(starGeo, starMat);
        group.add(star);
        // Planets
        const planetColors = [0x3399ff, 0x99ff33, 0xff3333];
        const orbits = [2, 3.2, 4.5];
        for (let i = 0; i < 3; i++) {
            const planetGeo = new THREE.SphereGeometry(0.2 + 0.05 * i, 24, 24);
            const planetMat = new THREE.MeshBasicMaterial({ color: planetColors[i] });
            const planet = new THREE.Mesh(planetGeo, planetMat);
            planet.userData = { orbitRadius: orbits[i], orbitSpeed: 0.01 + 0.005 * i, orbitAngle: Math.random() * Math.PI * 2 };
            group.add(planet);
        }
        starfield = group;
        scene.add(starfield);
        return;
    }

    // Custom celebration scene for 'living'
    if (theme.shape === 'celebration') {
        const group = new THREE.Group();
        // Central heart
        const heartShape = new THREE.Shape();
        heartShape.moveTo(0, 0.3);
        heartShape.bezierCurveTo(0, 0.5, 0.5, 0.5, 0.5, 0.2);
        heartShape.bezierCurveTo(0.5, -0.1, 0, -0.1, 0, 0.1);
        heartShape.bezierCurveTo(0, -0.1, -0.5, -0.1, -0.5, 0.2);
        heartShape.bezierCurveTo(-0.5, 0.5, 0, 0.5, 0, 0.3);
        const extrudeSettings = { depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 };
        const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
        const heartMat = new THREE.MeshPhongMaterial({ color: 0xff69b4, shininess: 100 });
        const heart = new THREE.Mesh(heartGeo, heartMat);
        heart.position.set(0, 0, 0);
        group.add(heart);
        // Add some floating spheres (confetti)
        for (let i = 0; i < 20; i++) {
            const confettiGeo = new THREE.SphereGeometry(0.07, 12, 12);
            const confettiMat = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
            const confetti = new THREE.Mesh(confettiGeo, confettiMat);
            confetti.position.set((Math.random() - 0.5) * 3, Math.random() * 2, (Math.random() - 0.5) * 3);
            group.add(confetti);
        }
        starfield = group;
        scene.add(starfield);
        return;
    }

    // Default: particles
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
        // Animate planetary orbits
        if (currentTheme.shape === 'orbit-system') {
            for (let i = 1; i < starfield.children.length; i++) {
                const planet = starfield.children[i];
                if (planet.userData) {
                    planet.userData.orbitAngle += planet.userData.orbitSpeed;
                    planet.position.x = Math.cos(planet.userData.orbitAngle) * planet.userData.orbitRadius;
                    planet.position.z = Math.sin(planet.userData.orbitAngle) * planet.userData.orbitRadius;
                }
            }
            starfield.rotation.y += currentTheme.speed;
        } else if (currentTheme.shape === 'celebration') {
            // Animate confetti
            for (let i = 1; i < starfield.children.length; i++) {
                const confetti = starfield.children[i];
                confetti.position.y += Math.sin(Date.now() * 0.001 + i) * 0.01;
                confetti.rotation.x += 0.01;
                confetti.rotation.y += 0.01;
            }
            starfield.rotation.y += currentTheme.speed;
        } else {
            starfield.rotation.x += currentTheme.speed;
            starfield.rotation.y += currentTheme.speed;
        }
    }
    renderer.render(scene, camera);
}

// Ensure video is loaded before starting animation
const headerVideo = document.getElementById('header-video');
if (headerVideo && !headerVideo.readyState || headerVideo.readyState < 3) {
    headerVideo.addEventListener('canplaythrough', () => {
        animate();
    }, { once: true });
} else {
    animate();
}

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
