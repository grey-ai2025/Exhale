/**
 * Exhale Waitlist Page - Main JavaScript
 * Three.js 3D Interactive Scene + Form Handling
 */

// ===========================================
// Global Variables
// ===========================================
let scene, camera, renderer;
let icons = [];
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
const clock = new THREE.Clock();
let introComplete = false;

// ===========================================
// Initialize on DOM Load
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initFormHandler();
    initAmbientGlow();

    // Initialize Three.js scene
    initThreeScene();

    // Start the loader sequence
    startLoaderSequence();

    animate();
});

// ===========================================
// Loader Sequence
// ===========================================
function startLoaderSequence() {
    const loaderOverlay = document.getElementById('loaderOverlay');

    // Minimum loader display time for smooth UX
    const minLoaderTime = 1500;
    const startTime = Date.now();

    // Wait for assets to be ready (or minimum time)
    function checkReady() {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minLoaderTime - elapsed);

        setTimeout(() => {
            // Fade out loader
            loaderOverlay.classList.add('fade-out');

            // After loader fades, start smoke reveal
            setTimeout(() => {
                loaderOverlay.style.display = 'none';
                startIntroReveal();
            }, 600);
        }, remaining);
    }

    // Check if Three.js scene is initialized
    if (renderer) {
        checkReady();
    } else {
        // Fallback: just use timer
        setTimeout(checkReady, 100);
    }
}

// ===========================================
// Theme Toggle (Dark Mode)
// ===========================================
function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.body.classList.add('dark-mode');
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

// ===========================================
// Intro Reveal Animation
// ===========================================
function startIntroReveal() {
    const introOverlay = document.getElementById('introOverlay');
    const sceneContainer = document.getElementById('sceneContainer');
    const content = document.querySelector('.content');

    // Start smoke dissipation
    introOverlay.classList.add('dissipating');

    // Reveal 3D scene
    setTimeout(() => {
        sceneContainer.classList.add('revealed');
    }, 300);

    // Reveal content
    setTimeout(() => {
        content.classList.add('revealed');
    }, 800);

    // Mark intro complete and hide overlay completely
    setTimeout(() => {
        introComplete = true;
        introOverlay.style.display = 'none';
    }, 3000);
}

// ===========================================
// Three.js Scene Setup
// ===========================================
function initThreeScene() {
    const container = document.getElementById('sceneContainer');
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera - wider FOV for full background coverage
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 15;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lighting
    setupLighting();

    // Create 3D Icons spread across viewport
    createIcons();

    // Mouse tracking
    document.addEventListener('mousemove', onMouseMove);

    // Resize handler
    window.addEventListener('resize', onWindowResize);
}

// ===========================================
// Lighting Setup
// ===========================================
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Cyan accent light
    const cyanLight = new THREE.PointLight(0xADFBF6, 1, 20);
    cyanLight.position.set(-3, 2, 5);
    scene.add(cyanLight);

    // Secondary light from below
    const fillLight = new THREE.DirectionalLight(0xADFBF6, 0.3);
    fillLight.position.set(-5, -5, 3);
    scene.add(fillLight);
}

// ===========================================
// Create 3D Icons
// ===========================================
function createIcons() {
    // Icons scattered across the entire viewport - edge to edge
    const iconConfigs = [
        // Top-left corner area
        { type: 'envelope', position: [-12, 7, -3], scale: 1.1 },
        { type: 'star', position: [-9, 5, -5], scale: 0.7, accent: true },

        // Top-center area
        { type: 'bell', position: [-2, 8, -4], scale: 0.9, accent: true },
        { type: 'document', position: [3, 7, -3], scale: 0.85 },

        // Top-right corner area
        { type: 'calendar', position: [10, 6, -4], scale: 1.0, accent: true },
        { type: 'magnifier', position: [14, 8, -5], scale: 0.8 },

        // Middle-left area
        { type: 'clock', position: [-14, 1, -4], scale: 0.9 },
        { type: 'inbox', position: [-11, -2, -3], scale: 1.0 },

        // Middle-right area
        { type: 'envelope', position: [12, 2, -3], scale: 1.2 },
        { type: 'star', position: [15, -1, -5], scale: 0.9, accent: true },

        // Bottom-left corner area
        { type: 'calendar', position: [-13, -6, -4], scale: 0.85, accent: true },
        { type: 'bell', position: [-9, -8, -5], scale: 0.75 },

        // Bottom-center area
        { type: 'magnifier', position: [-1, -7, -3], scale: 0.95 },
        { type: 'document', position: [5, -8, -4], scale: 0.8 },

        // Bottom-right corner area
        { type: 'inbox', position: [11, -6, -3], scale: 1.1 },
        { type: 'clock', position: [14, -8, -5], scale: 0.7, accent: true },

        // Extra scattered pieces for density
        { type: 'star', position: [-6, 3, -6], scale: 0.5, accent: true },
        { type: 'document', position: [8, 4, -6], scale: 0.6 },
        { type: 'envelope', position: [0, -4, -5], scale: 0.7 },
        { type: 'bell', position: [7, -3, -4], scale: 0.65, accent: true },
    ];

    iconConfigs.forEach((config, index) => {
        const icon = createIcon(config.type, config.accent);
        icon.position.set(...config.position);
        icon.scale.setScalar(config.scale);
        icon.userData = {
            originalPosition: new THREE.Vector3(...config.position),
            floatOffset: Math.random() * Math.PI * 2,
            floatSpeed: 0.3 + Math.random() * 0.2,
            rotationSpeed: 0.15 + Math.random() * 0.2
        };
        scene.add(icon);
        icons.push(icon);
    });
}

// ===========================================
// Create Individual Icon Geometries
// ===========================================
function createIcon(type, isAccent = false) {
    const group = new THREE.Group();
    const material = createMaterial(isAccent);

    switch(type) {
        case 'envelope':
            createEnvelope(group, material);
            break;
        case 'calendar':
            createCalendar(group, material);
            break;
        case 'magnifier':
            createMagnifier(group, material);
            break;
        case 'star':
            createStar(group, material);
            break;
        case 'inbox':
            createInbox(group, material);
            break;
        case 'document':
            createDocument(group, material);
            break;
        case 'bell':
            createBell(group, material);
            break;
        case 'clock':
            createClock(group, material);
            break;
    }

    return group;
}

// ===========================================
// Material Creation
// ===========================================
function createMaterial(isAccent = false) {
    return new THREE.MeshPhysicalMaterial({
        color: isAccent ? 0xADFBF6 : 0xffffff,
        metalness: 0.1,
        roughness: 0.1,
        transmission: isAccent ? 0.3 : 0.5,
        thickness: 0.5,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.9
    });
}

// ===========================================
// Icon Geometry Builders
// ===========================================
function createEnvelope(group, material) {
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(2, 1.3, 0.3);
    const body = new THREE.Mesh(bodyGeometry, material);
    group.add(body);

    // Flap (triangle)
    const flapShape = new THREE.Shape();
    flapShape.moveTo(-1, 0);
    flapShape.lineTo(0, -0.7);
    flapShape.lineTo(1, 0);
    flapShape.lineTo(-1, 0);

    const flapGeometry = new THREE.ExtrudeGeometry(flapShape, {
        depth: 0.1,
        bevelEnabled: false
    });
    const flap = new THREE.Mesh(flapGeometry, material);
    flap.position.set(0, 0.65, 0.1);
    flap.rotation.x = -0.3;
    group.add(flap);
}

function createCalendar(group, material) {
    // Main body
    const bodyGeometry = new THREE.BoxGeometry(1.6, 1.8, 0.2);
    const body = new THREE.Mesh(bodyGeometry, material);
    group.add(body);

    // Top bar
    const topBarGeometry = new THREE.BoxGeometry(1.6, 0.3, 0.25);
    const topBar = new THREE.Mesh(topBarGeometry, material);
    topBar.position.set(0, 0.75, 0.05);
    group.add(topBar);

    // Rings
    const ringMaterial = material.clone();
    ringMaterial.color.setHex(0x434343);

    const ringGeometry = new THREE.TorusGeometry(0.08, 0.03, 8, 16);
    [-0.5, 0.5].forEach(x => {
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.set(x, 0.9, 0.15);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
    });

    // Grid lines (simplified)
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x9A9A9A, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 3; i++) {
        const lineGeometry = new THREE.BoxGeometry(1.3, 0.02, 0.05);
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.2 - i * 0.4, 0.12);
        group.add(line);
    }
}

function createMagnifier(group, material) {
    // Glass circle
    const glassGeometry = new THREE.TorusGeometry(0.7, 0.12, 16, 32);
    const glass = new THREE.Mesh(glassGeometry, material);
    group.add(glass);

    // Handle
    const handleGeometry = new THREE.CylinderGeometry(0.1, 0.12, 1.2, 16);
    const handle = new THREE.Mesh(handleGeometry, material);
    handle.position.set(0.6, -0.9, 0);
    handle.rotation.z = Math.PI / 4;
    group.add(handle);

    // Inner glass (subtle)
    const innerGlassGeometry = new THREE.CircleGeometry(0.55, 32);
    const innerGlassMaterial = material.clone();
    innerGlassMaterial.opacity = 0.3;
    const innerGlass = new THREE.Mesh(innerGlassGeometry, innerGlassMaterial);
    innerGlass.position.z = 0.05;
    group.add(innerGlass);
}

function createStar(group, material) {
    // Main star using octahedron
    const starGeometry = new THREE.OctahedronGeometry(0.8, 0);
    const star = new THREE.Mesh(starGeometry, material);
    group.add(star);

    // Smaller sparkles
    const smallStarGeometry = new THREE.OctahedronGeometry(0.3, 0);
    const positions = [
        [0.9, 0.5, 0.3],
        [-0.7, -0.6, 0.2],
        [0.5, -0.8, -0.2]
    ];
    positions.forEach(pos => {
        const smallStar = new THREE.Mesh(smallStarGeometry, material);
        smallStar.position.set(...pos);
        smallStar.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(smallStar);
    });
}

function createInbox(group, material) {
    // Tray base
    const baseGeometry = new THREE.BoxGeometry(2, 0.2, 1.2);
    const base = new THREE.Mesh(baseGeometry, material);
    base.position.y = -0.4;
    group.add(base);

    // Back wall
    const backGeometry = new THREE.BoxGeometry(2, 0.8, 0.15);
    const back = new THREE.Mesh(backGeometry, material);
    back.position.set(0, 0, -0.5);
    group.add(back);

    // Side walls
    const sideGeometry = new THREE.BoxGeometry(0.15, 0.8, 1.2);
    [-0.95, 0.95].forEach(x => {
        const side = new THREE.Mesh(sideGeometry, material);
        side.position.set(x, 0, 0);
        group.add(side);
    });

    // Front lip
    const frontGeometry = new THREE.BoxGeometry(2, 0.3, 0.15);
    const front = new THREE.Mesh(frontGeometry, material);
    front.position.set(0, -0.25, 0.5);
    group.add(front);
}

function createDocument(group, material) {
    // Main page
    const pageGeometry = new THREE.BoxGeometry(1.4, 1.8, 0.08);
    const page = new THREE.Mesh(pageGeometry, material);
    group.add(page);

    // Corner fold
    const foldShape = new THREE.Shape();
    foldShape.moveTo(0, 0);
    foldShape.lineTo(0.4, 0);
    foldShape.lineTo(0, -0.4);
    foldShape.lineTo(0, 0);

    const foldGeometry = new THREE.ExtrudeGeometry(foldShape, {
        depth: 0.08,
        bevelEnabled: false
    });
    const fold = new THREE.Mesh(foldGeometry, material);
    fold.position.set(0.7, 0.9, 0);
    fold.rotation.y = Math.PI;
    group.add(fold);

    // Text lines
    const lineMaterial = new THREE.MeshBasicMaterial({ color: 0x9A9A9A, transparent: true, opacity: 0.4 });
    for (let i = 0; i < 4; i++) {
        const lineWidth = 1 - Math.random() * 0.3;
        const lineGeometry = new THREE.BoxGeometry(lineWidth, 0.06, 0.02);
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(-0.1, 0.5 - i * 0.35, 0.06);
        group.add(line);
    }
}

function createBell(group, material) {
    // Bell body (sphere + cone)
    const topGeometry = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const top = new THREE.Mesh(topGeometry, material);
    top.position.y = 0.4;
    group.add(top);

    const bodyGeometry = new THREE.ConeGeometry(0.7, 1, 32, 1, true);
    const body = new THREE.Mesh(bodyGeometry, material);
    body.rotation.x = Math.PI;
    body.position.y = -0.1;
    group.add(body);

    // Clapper
    const clapperGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const clapper = new THREE.Mesh(clapperGeometry, material);
    clapper.position.y = -0.5;
    group.add(clapper);

    // Handle
    const handleGeometry = new THREE.TorusGeometry(0.15, 0.05, 8, 16, Math.PI);
    const handle = new THREE.Mesh(handleGeometry, material);
    handle.position.y = 0.65;
    handle.rotation.x = Math.PI;
    group.add(handle);
}

function createClock(group, material) {
    // Clock face
    const faceGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.15, 32);
    const face = new THREE.Mesh(faceGeometry, material);
    face.rotation.x = Math.PI / 2;
    group.add(face);

    // Rim
    const rimGeometry = new THREE.TorusGeometry(0.9, 0.08, 16, 32);
    const rim = new THREE.Mesh(rimGeometry, material);
    rim.position.z = 0.05;
    group.add(rim);

    // Hour hand
    const hourHandGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.05);
    const handMaterial = new THREE.MeshBasicMaterial({ color: 0x434343 });
    const hourHand = new THREE.Mesh(hourHandGeometry, handMaterial);
    hourHand.position.set(0, 0.15, 0.12);
    hourHand.rotation.z = -Math.PI / 6;
    group.add(hourHand);

    // Minute hand
    const minuteHandGeometry = new THREE.BoxGeometry(0.06, 0.6, 0.05);
    const minuteHand = new THREE.Mesh(minuteHandGeometry, handMaterial);
    minuteHand.position.set(0.15, 0.15, 0.12);
    minuteHand.rotation.z = -Math.PI / 3;
    group.add(minuteHand);

    // Center dot
    const centerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const center = new THREE.Mesh(centerGeometry, material);
    center.position.z = 0.12;
    group.add(center);
}


// ===========================================
// Mouse Tracking
// ===========================================
function onMouseMove(event) {
    targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
}

// ===========================================
// Window Resize Handler
// ===========================================
function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// ===========================================
// Animation Loop
// ===========================================
function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth mouse following
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Animate each icon
    icons.forEach((icon, index) => {
        if (icon.userData.originalPosition) {
            const data = icon.userData;

            // Floating animation
            const floatY = Math.sin(elapsed * data.floatSpeed + data.floatOffset) * 0.3;
            const floatX = Math.cos(elapsed * data.floatSpeed * 0.7 + data.floatOffset) * 0.15;

            // Mouse parallax - stronger for closer objects
            const depthFactor = 1 + Math.abs(icon.userData.originalPosition.z) * 0.15;
            const parallaxStrength = 0.8;

            icon.position.x = data.originalPosition.x + floatX + (mouseX * parallaxStrength * depthFactor);
            icon.position.y = data.originalPosition.y + floatY + (mouseY * parallaxStrength * depthFactor);

            // Gentle rotation toward mouse
            icon.rotation.y = mouseX * 0.25;
            icon.rotation.x = -mouseY * 0.15;

            // Continuous slow rotation
            icon.rotation.z = Math.sin(elapsed * data.rotationSpeed) * 0.15;
        }
    });

    // Subtle camera movement based on mouse
    camera.position.x = mouseX * 0.8;
    camera.position.y = mouseY * 0.5;
    camera.lookAt(0, 0, -2);

    renderer.render(scene, camera);
}

// ===========================================
// Ambient Glow Effect (keep from original)
// ===========================================
function initAmbientGlow() {
    const glow = document.getElementById('glow');
    if (!glow) return;

    let glowMouseX = window.innerWidth / 2;
    let glowMouseY = window.innerHeight / 2;
    let glowX = glowMouseX;
    let glowY = glowMouseY;

    document.addEventListener('mousemove', (e) => {
        glowMouseX = e.clientX;
        glowMouseY = e.clientY;
    });

    function animateGlow() {
        glowX += (glowMouseX - glowX) * 0.08;
        glowY += (glowMouseY - glowY) * 0.08;

        glow.style.transform = `translate(${glowX - 350}px, ${glowY - 350}px)`;

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
}

// ===========================================
// Form Handler
// ===========================================
function initFormHandler() {
    const form = document.getElementById('waitlistForm');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const waitlistCount = document.getElementById('waitlistCount');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        submitBtn.textContent = 'Joining...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.textContent = 'Joined! ✓';
            submitBtn.classList.add('success');
            successMessage.classList.add('show');

            const currentCount = parseInt(waitlistCount.textContent.replace(/,/g, ''));
            animateCounter(currentCount, currentCount + 1);

            form.reset();
        }, 1500);
    });
}

// ===========================================
// Counter Animation
// ===========================================
function animateCounter(start, end) {
    const waitlistCount = document.getElementById('waitlistCount');
    const duration = 500;
    const startTime = performance.now();

    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const current = Math.floor(start + (end - start) * easeOutCubic(progress));
        waitlistCount.innerHTML = current.toLocaleString() + '<span>+</span>';

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
