document.addEventListener("DOMContentLoaded", () => {
    // 1. Custom Arrow Cursor with Shiny Text
    if (window.matchMedia("(pointer: fine)").matches) {
        document.body.classList.add("has-custom-cursor");

        const cursorContainer = document.createElement("div");
        cursorContainer.classList.add("cursor-container");
        document.body.appendChild(cursorContainer);

        const arrowSvg = `<svg viewBox="0 0 16 24" width="22" height="28" class="cursor-arrow">
          <path d="M1,1 L14.5,12 L7.5,13.5 L4.5,23 Z" fill="var(--primary)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" />
        </svg>`;
        
        cursorContainer.innerHTML = arrowSvg + `<div class="cursor-text-bubble"></div>`;
        const textBubble = cursorContainer.querySelector('.cursor-text-bubble');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Smooth follow
        const renderCursor = () => {
            cursorX += (mouseX - cursorX) * 0.25;
            cursorY += (mouseY - cursorY) * 0.25;
            cursorContainer.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(renderCursor);
        };
        requestAnimationFrame(renderCursor);

        // Map elements to shiny text
        const hoverTargets = document.querySelectorAll("#mypic, .work-card, .writing-item, a[href*='wa.me'], a[href*='newsletter'], a[href*='pulse']");
        hoverTargets.forEach(el => {
            el.addEventListener("mouseenter", () => {
                let text = "";
                
                if (el.id === 'mypic') {
                    text = "That's Me!";
                } else if (el.classList.contains('work-card')) {
                    text = "Let's View!";
                } else if (el.href && el.href.includes("wa.me")) {
                    text = "Let's Connect!";
                } else if (el.classList.contains('writing-item') || (el.href && (el.href.includes("newsletter") || el.href.includes("pulse")))) {
                    text = "Let's Read!";
                }

                if (text) {
                    cursorContainer.classList.add("active-text");
                    textBubble.innerText = text;
                }
            });
            el.addEventListener("mouseleave", () => {
                cursorContainer.classList.remove("active-text");
            });
        });
    }

    // 2. Typing Animation
    const eyebrow = document.querySelector(".hero-eyebrow");
    if (eyebrow) {
        // Keep initial test, append typing elements
        eyebrow.innerHTML = "Software Engineer · Based in India · ";
        
        const typingSpan = document.createElement("span");
        typingSpan.classList.add("typing-text");
        eyebrow.appendChild(typingSpan);

        const cursorSpan = document.createElement("span");
        cursorSpan.classList.add("typing-text-cursor");
        eyebrow.appendChild(cursorSpan);

        const words = ["Building backend systems.", "Scaling cloud infrastructure.", "Architecting Agentic AI."];
        let i = 0;
        let timer;

        function typingEffect() {
            let word = words[i].split("");
            var loopTyping = function() {
                if (word.length > 0) {
                    typingSpan.innerHTML += word.shift();
                } else {
                    setTimeout(deletingEffect, 2000);
                    return false;
                };
                timer = setTimeout(loopTyping, 80);
            };
            loopTyping();
        }

        function deletingEffect() {
            let word = typingSpan.innerHTML;
            var loopDeleting = function() {
                if (word.length > 0) {
                    word = word.substring(0, word.length - 1);
                    typingSpan.innerHTML = word;
                } else {
                    i = (i + 1) % words.length;
                    setTimeout(typingEffect, 500);
                    return false;
                };
                timer = setTimeout(loopDeleting, 40);
            };
            loopDeleting();
        }

        setTimeout(typingEffect, 1000); // start after 1 sec
    }

    // 3. Hero Parallax Scroll
    const heroImgDiv = document.getElementById("mypic-div");
    if (heroImgDiv) {
        heroImgDiv.classList.add("hero-parallax");
        window.addEventListener("scroll", () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                // Slower scroll for the image to create depth
                heroImgDiv.style.transform = `translateY(${scrollY * 0.15}px)`;
            }
        });
    }
});
