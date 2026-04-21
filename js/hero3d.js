// ============================================
// HERO 3D — v6.1 "SYSTEMS GRAPH"
// A slowly rotating 3D network of nodes connected by lines —
// the visual metaphor for someone who builds backend systems,
// APIs, and distributed infrastructure. Subtle, relevant, alive.
// ============================================

(function() {
    if (window.innerWidth <= 768) return;
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
        const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
        camera.position.set(0, 0, 22);

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // ============================================
        // Build a network topology: 50 nodes distributed on a sphere
        // with connections drawn between nearest neighbors
        // ============================================
        const NODE_COUNT = 50;
        const CONNECTION_DIST = 4.5;
        const SPHERE_RADIUS = 7;

        // Create nodes as positions
        const nodePositions = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            // Fibonacci sphere distribution for even spacing
            const phi = Math.acos(1 - 2 * (i + 0.5) / NODE_COUNT);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;
            const jitter = 0.4;
            const r = SPHERE_RADIUS + (Math.random() - 0.5) * jitter * 2;
            const x = r * Math.sin(phi) * Math.cos(theta);
            const y = r * Math.sin(phi) * Math.sin(theta);
            const z = r * Math.cos(phi);
            nodePositions.push(new THREE.Vector3(x, y, z));
        }

        // ---- Node points (glowing dots) ----
        const nodeGeometry = new THREE.BufferGeometry();
        const nodeArray = new Float32Array(NODE_COUNT * 3);
        const nodeSizes = new Float32Array(NODE_COUNT);
        nodePositions.forEach((p, i) => {
            nodeArray[i * 3] = p.x;
            nodeArray[i * 3 + 1] = p.y;
            nodeArray[i * 3 + 2] = p.z;
            nodeSizes[i] = Math.random() * 0.6 + 0.4;
        });
        nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodeArray, 3));
        nodeGeometry.setAttribute('aSize', new THREE.BufferAttribute(nodeSizes, 1));

        const nodeVS = `
            attribute float aSize;
            uniform float uTime;
            varying float vSize;
            void main() {
                vSize = aSize;
                vec4 mv = modelViewMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * mv;
                float pulse = 0.85 + 0.15 * sin(uTime * 1.2 + position.x * 2.0 + position.y * 3.0);
                gl_PointSize = aSize * pulse * (280.0 / -mv.z);
            }
        `;
        const nodeFS = `
            uniform vec3 uColor;
            varying float vSize;
            void main() {
                float d = length(gl_PointCoord - vec2(0.5));
                if (d > 0.5) discard;
                // Core bright, edge soft
                float core = smoothstep(0.5, 0.0, d);
                float halo = smoothstep(0.5, 0.35, d) * 0.5;
                gl_FragColor = vec4(uColor, core * 0.95 + halo);
            }
        `;
        const nodeMat = new THREE.ShaderMaterial({
            vertexShader: nodeVS,
            fragmentShader: nodeFS,
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color(0x5B8DEF) }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const nodes = new THREE.Points(nodeGeometry, nodeMat);
        scene.add(nodes);

        // ---- Edge lines (connections) ----
        const edgeVertices = [];
        const edgeOpacities = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            for (let j = i + 1; j < NODE_COUNT; j++) {
                const d = nodePositions[i].distanceTo(nodePositions[j]);
                if (d < CONNECTION_DIST) {
                    edgeVertices.push(
                        nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
                        nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
                    );
                    // Stronger lines for closer pairs
                    const strength = 1 - (d / CONNECTION_DIST);
                    edgeOpacities.push(strength, strength);
                }
            }
        }
        const edgeGeo = new THREE.BufferGeometry();
        edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edgeVertices), 3));
        edgeGeo.setAttribute('aOpacity', new THREE.BufferAttribute(new Float32Array(edgeOpacities), 1));

        const edgeVS = `
            attribute float aOpacity;
            varying float vOpacity;
            void main() {
                vOpacity = aOpacity;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const edgeFS = `
            uniform vec3 uColor;
            uniform float uGlobalOpacity;
            varying float vOpacity;
            void main() {
                gl_FragColor = vec4(uColor, vOpacity * uGlobalOpacity * 0.45);
            }
        `;
        const edgeMat = new THREE.ShaderMaterial({
            vertexShader: edgeVS,
            fragmentShader: edgeFS,
            uniforms: {
                uColor: { value: new THREE.Color(0x5B8DEF) },
                uGlobalOpacity: { value: 1.0 }
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        const edges = new THREE.LineSegments(edgeGeo, edgeMat);
        scene.add(edges);

        // ---- Container group for rotation ----
        const graph = new THREE.Group();
        graph.add(nodes);
        graph.add(edges);
        scene.remove(nodes);
        scene.remove(edges);
        scene.add(graph);

        // ---- Background dust particles (sparse, far) ----
        const dustCount = 120;
        const dustGeo = new THREE.BufferGeometry();
        const dustPos = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            const r = 18 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            dustPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
            dustPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            dustPos[i * 3 + 2] = r * Math.cos(phi);
        }
        dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
        const dustMat = new THREE.PointsMaterial({
            color: 0xEDEDED,
            size: 0.04,
            transparent: true,
            opacity: 0.35,
            sizeAttenuation: true,
            depthWrite: false
        });
        const dust = new THREE.Points(dustGeo, dustMat);
        scene.add(dust);

        // ============================================
        // Mouse / theme / visibility
        // ============================================
        let targetX = 0, targetY = 0, mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', e => {
            targetX = (e.clientX / window.innerWidth - 0.5);
            targetY = -(e.clientY / window.innerHeight - 0.5);
        });

        function updateTheme() {
            const isLight = document.body.classList.contains('light-mode');
            nodeMat.uniforms.uColor.value.setHex(isLight ? 0x3D6FD8 : 0x5B8DEF);
            edgeMat.uniforms.uColor.value.setHex(isLight ? 0x3D6FD8 : 0x5B8DEF);
            edgeMat.uniforms.uGlobalOpacity.value = isLight ? 1.4 : 1.0;
            dustMat.color.setHex(isLight ? 0x333333 : 0xEDEDED);
        }
        updateTheme();
        new MutationObserver(updateTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        let visible = true;
        new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(heroSection);

        // ============================================
        // Animate
        // ============================================
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            if (!visible) return;

            const t = clock.getElapsedTime();

            mouseX += (targetX - mouseX) * 0.04;
            mouseY += (targetY - mouseY) * 0.04;

            // Network rotates steadily
            graph.rotation.y = t * 0.08 + mouseX * 0.3;
            graph.rotation.x = t * 0.03 + mouseY * 0.25;
            graph.rotation.z = Math.sin(t * 0.05) * 0.05;

            // Dust counter-rotates very slowly
            dust.rotation.y = -t * 0.01;
            dust.rotation.x = t * 0.005;

            nodeMat.uniforms.uTime.value = t;

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        });

        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 1.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s';
        requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    }

    const initObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            loadThreeAndInit();
            initObs.disconnect();
        }
    }, { threshold: 0.1 });
    initObs.observe(heroSection);
})();
