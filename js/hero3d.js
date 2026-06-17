// ============================================
// HERO 3D — v9.0 "CINEMATIC AURORA"
// Full-screen chromatic shader plane
// + cursor ripples + chromatic aberration + scroll parallax
// ============================================

(function() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const heroSection = document.getElementById('home');
    if (!heroSection) return;

    const canvas = document.getElementById('hero3d-canvas');
    if (!canvas) return;

    // Performance tier: phone / tablet / desktop
    const isPhone = window.innerWidth <= 640;
    const isTablet = window.innerWidth > 640 && window.innerWidth <= 1024;
    const isDesktop = window.innerWidth > 1024;

    // WORLD CLASS FIX: Skip WebGL entirely on ALL mobile devices (< 768px).
    // This saves massive battery drain and prevents scroll jitter.
    // The CSS gradient mesh will successfully take over rendering.
    if (window.innerWidth < 768) return;

    // PORT-08: also bail on low-end / memory-constrained devices even above 768px
    // (cheap tablets, low-RAM laptops). The CSS gradient mesh fallback covers these.
    // navigator.deviceMemory: GB of RAM (Chromium only); <= 4 GB is treated as low-end.
    // navigator.hardwareConcurrency: logical CPU cores; <= 4 is treated as low-end.
    const deviceMemory = navigator.deviceMemory;            // undefined on Safari/FF
    const cores = navigator.hardwareConcurrency;            // undefined on very old browsers
    const lowMemory = typeof deviceMemory === 'number' && deviceMemory <= 4;
    const lowCores = typeof cores === 'number' && cores <= 4;
    // Coarse pointer + no hover usually means a touch device (phone/tablet).
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (lowMemory || (lowCores && coarsePointer)) return;

    let loaded = false;

    function loadAndInit() {
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
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: !isPhone, // skip AA on phones for perf
            alpha: true,
            powerPreference: isPhone ? 'low-power' : 'high-performance'
        });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        // Tighter pixel ratio cap on phones to save GPU
        const pixelCap = isPhone ? 1.25 : isTablet ? 1.75 : 2;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelCap));
        renderer.setClearColor(0x000000, 0);

        // ============================================
        // Full-screen plane with chromatic aurora shader
        // ============================================
        const vertexShader = `
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uMouseStrength;

            // Simplex 2D noise
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vUv = uv;
                vPosition = position;

                vec3 pos = position;

                // Subtle wave distortion
                float n = snoise(uv * 2.5 + uTime * 0.15) * 0.15;
                pos.z += n;

                // Cursor-driven ripple
                float distToMouse = distance(uv, uMouse * 0.5 + 0.5);
                float ripple = sin(distToMouse * 15.0 - uTime * 3.0) * exp(-distToMouse * 4.0) * uMouseStrength * 0.15;
                pos.z += ripple;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const fragmentShader = `
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uMouseStrength;
            uniform vec3 uColor1;
            uniform vec3 uColor2;
            uniform vec3 uColor3;
            uniform vec3 uColor4;
            uniform float uLightMode;

            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m; m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            // FBM — fractal brownian motion, creates cloud-like patterns
            float fbm(vec2 p) {
                float value = 0.0;
                float amp = 0.5;
                for (int i = 0; i < 4; i++) {
                    value += amp * snoise(p);
                    p *= 2.0;
                    amp *= 0.5;
                }
                return value;
            }

            void main() {
                vec2 uv = vUv;
                float t = uTime * 0.12;

                // Layered aurora bands
                vec2 q = uv * 2.0;
                q.x += t * 0.3;

                float band1 = fbm(q + vec2(0.0, t));
                float band2 = fbm(q * 1.5 + vec2(t * 0.7, -t * 0.4));
                float band3 = fbm(q * 0.8 - vec2(t * 0.5, t * 0.3));

                // Cursor influence
                float mouseDist = distance(uv, uMouse * 0.5 + 0.5);
                float mouseGlow = exp(-mouseDist * 3.0) * uMouseStrength;

                // Compose colors (iridescent / chromatic)
                float f1 = smoothstep(-0.3, 0.5, band1);
                float f2 = smoothstep(-0.3, 0.5, band2);
                float f3 = smoothstep(-0.3, 0.5, band3);

                vec3 col = mix(uColor1, uColor2, f1);
                col = mix(col, uColor3, f2 * 0.7);
                col = mix(col, uColor4, f3 * 0.5);

                // Cursor adds warmer highlight
                col += vec3(0.3, 0.4, 0.8) * mouseGlow * 0.6;

                // Chromatic aberration on edges
                vec2 centered = uv - 0.5;
                float edge = length(centered);
                float chroma = smoothstep(0.3, 0.75, edge);
                col.r += chroma * 0.08;
                col.b -= chroma * 0.05;

                // Radial vignette (darkens edges)
                float vig = 1.0 - smoothstep(0.3, 0.9, edge);
                col *= mix(0.5, 1.0, vig);

                // Subtle film grain
                float grain = fract(sin(dot(uv * 1000.0 + t, vec2(12.9898, 78.233))) * 43758.5453);
                col += (grain - 0.5) * 0.02;

                // Horizontal scanline shimmer (very subtle)
                float scan = sin(uv.y * 800.0 + t * 20.0) * 0.01;
                col += scan;

                // Light mode: invert tone logic, soften
                if (uLightMode > 0.5) {
                    col = mix(col, vec3(1.0) - col * 0.3, 0.4);
                    col *= 0.85;
                }

                // Overall intensity
                float alpha = 0.85 + 0.1 * sin(t * 2.0);

                gl_FragColor = vec4(col, alpha);
            }
        `;

        // Plane sized to fill the frustum at z=0 (lower segments on mobile)
        const segs = isPhone ? 32 : isTablet ? 48 : 64;
        const planeGeo = new THREE.PlaneGeometry(14, 8, segs, segs);
        const planeMat = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uMouseStrength: { value: 0 },
                uColor1: { value: new THREE.Color(0x0a0a3a) }, // deep midnight
                uColor2: { value: new THREE.Color(0x2955C8) }, // saturated blue
                uColor3: { value: new THREE.Color(0x7C3AED) }, // violet
                uColor4: { value: new THREE.Color(0xEC4899) }, // magenta
                uLightMode: { value: 0 }
            },
            transparent: true,
            depthWrite: false
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.position.z = -1;
        scene.add(plane);

        // ============================================
        // Floating geometric shards for depth + detail
        // ============================================
        const shards = new THREE.Group();
        const SHARD_COUNT = isPhone ? 3 : isTablet ? 5 : 6;
        for (let i = 0; i < SHARD_COUNT; i++) {
            const geo = new THREE.OctahedronGeometry(0.25 + Math.random() * 0.15, 0);
            const mat = new THREE.MeshBasicMaterial({
                color: 0xEDEDED,
                wireframe: true,
                transparent: true,
                opacity: 0.25
            });
            const shard = new THREE.Mesh(geo, mat);
            shard.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 3 + 1
            );
            shard.userData = {
                rotX: (Math.random() - 0.5) * 0.005,
                rotY: (Math.random() - 0.5) * 0.008,
                floatAmp: 0.05 + Math.random() * 0.1,
                floatSpeed: 0.3 + Math.random() * 0.4,
                floatOffset: Math.random() * Math.PI * 2
            };
            shards.add(shard);
        }
        scene.add(shards);

        // ============================================
        // Mouse + theme + scroll
        // ============================================
        const targetMouse = new THREE.Vector2(0, 0);
        const mouse = new THREE.Vector2(0, 0);
        let targetStrength = 0, mouseStrength = 0;

        function setPointer(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            if (clientY >= rect.top && clientY <= rect.bottom) {
                targetMouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
                targetMouse.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
                targetStrength = 1.0;
            } else {
                targetStrength = 0;
            }
        }
        window.addEventListener('mousemove', e => setPointer(e.clientX, e.clientY));
        window.addEventListener('touchmove', e => {
            if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });
        window.addEventListener('touchstart', e => {
            if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: true });

        // Auto-drift on mobile (no cursor to drive it naturally)
        if (isPhone) {
            setInterval(() => {
                targetMouse.x = (Math.random() - 0.5) * 1.2;
                targetMouse.y = (Math.random() - 0.5) * 1.0;
                targetStrength = 0.7;
            }, 2200);
        }

        let scrollOffset = 0;
        window.addEventListener('scroll', () => {
            scrollOffset = Math.min(window.scrollY / window.innerHeight, 1.5);
        }, { passive: true });

        function updateTheme() {
            const isLight = document.body.classList.contains('light-mode');
            planeMat.uniforms.uLightMode.value = isLight ? 1.0 : 0.0;
            if (isLight) {
                planeMat.uniforms.uColor1.value.setHex(0xe8e4f0);
                planeMat.uniforms.uColor2.value.setHex(0x2955C8);
                planeMat.uniforms.uColor3.value.setHex(0x7C3AED);
                planeMat.uniforms.uColor4.value.setHex(0xEC4899);
                shards.children.forEach(s => {
                    s.material.color.setHex(0x1a1a1a);
                    s.material.opacity = 0.25;
                });
            } else {
                planeMat.uniforms.uColor1.value.setHex(0x0a0a3a);
                planeMat.uniforms.uColor2.value.setHex(0x2955C8);
                planeMat.uniforms.uColor3.value.setHex(0x7C3AED);
                planeMat.uniforms.uColor4.value.setHex(0xEC4899);
                shards.children.forEach(s => {
                    s.material.color.setHex(0xEDEDED);
                    s.material.opacity = 0.22;
                });
            }
        }
        updateTheme();
        new MutationObserver(updateTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });

        // Visibility gating
        let visible = true;
        new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(heroSection);

        // ============================================
        // Animation loop
        // ============================================
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            if (!visible) return;
            const t = clock.getElapsedTime();

            // Smooth mouse
            mouse.x += (targetMouse.x - mouse.x) * 0.06;
            mouse.y += (targetMouse.y - mouse.y) * 0.06;
            mouseStrength += (targetStrength - mouseStrength) * 0.08;

            planeMat.uniforms.uTime.value = t;
            planeMat.uniforms.uMouse.value.copy(mouse);
            planeMat.uniforms.uMouseStrength.value = mouseStrength;

            // Plane subtle rotate for parallax
            plane.rotation.x = mouse.y * 0.08;
            plane.rotation.y = mouse.x * 0.08;

            // Shards float + spin
            shards.children.forEach(s => {
                s.rotation.x += s.userData.rotX;
                s.rotation.y += s.userData.rotY;
                s.position.y += Math.sin(t * s.userData.floatSpeed + s.userData.floatOffset) * 0.001;
            });
            // Shards rotate as a group with scroll — camera-journey feel
            shards.rotation.y = t * 0.03 + scrollOffset * 0.4;
            shards.rotation.x = -scrollOffset * 0.2;

            // Camera subtle parallax + scroll push
            camera.position.x = mouse.x * 0.3;
            camera.position.y = -mouse.y * 0.2 - scrollOffset * 0.8;
            camera.position.z = 5 + scrollOffset * 1.2;
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);
        }
        animate();

        window.addEventListener('resize', () => {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        });

        // Fade in dramatically
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 2.2s cubic-bezier(0.22, 1, 0.36, 1) 0.2s';
        requestAnimationFrame(() => { canvas.style.opacity = '1'; });
    }

    // Lazy trigger
    const initObs = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            loadAndInit();
            initObs.disconnect();
        }
    }, { threshold: 0.05 });
    initObs.observe(heroSection);
})();
