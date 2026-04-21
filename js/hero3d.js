// ============================================
// HERO 3D — Three.js animated geometric field
// Lazy-loaded when #home is in viewport
// ============================================

(function() {
    if (window.innerWidth <= 768) return; // Skip on mobile for perf
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    const canvas = document.getElementById('hero3d-canvas');
    if (!canvas) return;

    let loaded = false;

    function loadThreeAndInit() {
        if (loaded) return;
        loaded = true;
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
        script.onload = initScene;
        document.head.appendChild(script);
    }

    function initScene() {
        if (!window.THREE) return;
        const THREE = window.THREE;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 14;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Icosahedron wireframe — signature geometric centerpiece
        const geo = new THREE.IcosahedronGeometry(3.2, 1);
        const mat = new THREE.MeshBasicMaterial({ color: 0x19a7ce, wireframe: true, transparent: true, opacity: 0.35 });
        const mesh = new THREE.Mesh(geo, mat);
        scene.add(mesh);

        // Inner solid mesh with subtle color
        const innerGeo = new THREE.IcosahedronGeometry(2.6, 0);
        const innerMat = new THREE.MeshBasicMaterial({ color: 0x667eea, wireframe: true, transparent: true, opacity: 0.25 });
        const innerMesh = new THREE.Mesh(innerGeo, innerMat);
        scene.add(innerMesh);

        // Particle field
        const pCount = 200;
        const pGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount * 3; i++) positions[i] = (Math.random() - 0.5) * 30;
        pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pMat = new THREE.PointsMaterial({ color: 0xf093fb, size: 0.08, transparent: true, opacity: 0.6 });
        const points = new THREE.Points(pGeo, pMat);
        scene.add(points);

        // Mouse parallax
        let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
        window.addEventListener('mousemove', e => {
            targetX = (e.clientX / window.innerWidth - 0.5) * 0.4;
            targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
        });

        // Theme reactive color
        function updateColorsForTheme() {
            const isLight = document.body.classList.contains('light-mode');
            mat.color.setHex(isLight ? 0x764ba2 : 0x19a7ce);
            innerMat.color.setHex(isLight ? 0x19a7ce : 0x667eea);
        }
        updateColorsForTheme();

        const themeObserver = new MutationObserver(updateColorsForTheme);
        themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // Pause when offscreen
        let visible = true;
        const visObs = new IntersectionObserver(entries => {
            visible = entries[0].isIntersecting;
        });
        visObs.observe(heroSection);

        let frameId;
        function animate() {
            frameId = requestAnimationFrame(animate);
            if (!visible) return;
            mouseX += (targetX - mouseX) * 0.05;
            mouseY += (targetY - mouseY) * 0.05;
            mesh.rotation.x += 0.002;
            mesh.rotation.y += 0.003;
            innerMesh.rotation.x -= 0.003;
            innerMesh.rotation.y -= 0.002;
            points.rotation.y += 0.0008;
            camera.position.x += (mouseX * 3 - camera.position.x) * 0.05;
            camera.position.y += (-mouseY * 3 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            renderer.render(scene, camera);
        }
        animate();

        // Resize
        window.addEventListener('resize', () => {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        });

        // Fade in
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 1.2s ease';
        requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    }

    // Lazy trigger
    const initObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            loadThreeAndInit();
            initObserver.disconnect();
        }
    }, { threshold: 0.1 });
    initObserver.observe(heroSection);
})();
