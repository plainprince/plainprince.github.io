// Canvas background animation
// We wrap it in an IIFE to avoid global scope pollution (like 'config') if other scripts use it.
(() => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let dots = [];
    
    // Configuration
    // Dynamic values will be set in resize()
    const dotConfig = {
        dotCount: 100, 
        connectionDistance: 150, // will be updated
        mouseDistance: 200,
        dotBaseRadius: 1.0, // Smaller dots (was 1.5)
        dotVariance: 0.3,   // Reduced variance
        baseSpeed: 0.3,
        speedVariance: 0.2,
        direction: { x: -0.5, y: 0.5 }, 
        colors: {
            dot: 'rgba(255, 255, 255, 0.4)', // Darker/Less visible dots (was 0.8)
            line: 'rgba(255, 255, 255, ',   // We append alpha later
            mouseLine: 'rgba(127, 219, 202, ' 
        }
    };
    
    let mouse = { x: -1000, y: -1000 };
    
    class Dot {
        constructor(isInitial = false) {
            this.init(isInitial);
        }
    
        init(isInitial) {
            if (isInitial) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
            } else {
                if (Math.random() > 0.5) {
                    this.x = Math.random() * width + width * 0.2; 
                    this.y = -Math.random() * height * 0.2;
                } else {
                    this.x = width + Math.random() * width * 0.2;
                    this.y = Math.random() * height;
                }
            }
    
            this.radius = dotConfig.dotBaseRadius + Math.random() * dotConfig.dotVariance;
            
            const speed = dotConfig.baseSpeed + Math.random() * dotConfig.speedVariance;
            this.vx = (dotConfig.direction.x + (Math.random() - 0.5) * 0.5) * speed;
            this.vy = (dotConfig.direction.y + (Math.random() - 0.5) * 0.5) * speed;
        }
    
        update(speedFactor = 1.0) {
            this.x += this.vx * speedFactor;
            this.y += this.vy * speedFactor;
    
            if (this.x < -100 || this.y > height + 100) {
                this.init(false); 
            }
        }
    
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = dotConfig.colors.dot;
            ctx.fill();
        }
    }
    
    function init() {
        resize();
        dots = [];
        const density = (width * height) / 15000; 
        const count = Math.min(Math.max(density, 50), 150);
        
        for (let i = 0; i < count; i++) {
            dots.push(new Dot(true));
        }
    }
    
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        
        // Normalize coordinate system to use css pixels
        ctx.scale(dpr, dpr);
        
        // CSS size needs to match window size
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        // Dynamic connection distance based on screen size
        // Mobile (<600px): shorter distance to avoid clutter? Or longer to ensure connections?
        // User said: "on mobile they seem long but on desktop relaly short"
        // Wait, "on mobile they seem long" -> Mobile needs SHORTER distance?
        // "on desktop relaly short" -> Desktop needs LONGER distance?
        // Yes.
        
        // Base calc: diagonal or width
        const diagonal = Math.sqrt(width*width + height*height);
        
        // Desktop (1920x1080) ~ 2200 diag. 
        // Mobile (375x800) ~ 900 diag.
        
        // Let's try 10% of diagonal, clamped.
        dotConfig.connectionDistance = Math.min(Math.max(diagonal * 0.1, 100), 250);
        
        // Adjust mouse distance too
        dotConfig.mouseDistance = dotConfig.connectionDistance * 1.5;
    }
    
    let lastTime = 0;
    const targetFPS = 120;
    const targetFrameTime = 1000 / targetFPS;

    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Normalize speed to target FPS
        // If running at 60fps (dt=16.6ms), factor is ~2.0 (needs 2x movement to match 120fps speed)
        // If running at 120fps (dt=8.3ms), factor is 1.0
        const speedFactor = deltaTime / targetFrameTime;

        ctx.clearRect(0, 0, width, height);
        
        const isMobile = window.innerWidth < 768;
    
        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            
            if (!isMobile) {
                const dxMouse = mouse.x - dot.x;
                const dyMouse = mouse.y - dot.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        
                if (distMouse < dotConfig.mouseDistance) {
                    const opacity = 1 - (distMouse / dotConfig.mouseDistance);
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = dotConfig.colors.mouseLine + opacity + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
    
            for (let j = i + 1; j < dots.length; j++) {
                const other = dots[j];
                const dx = other.x - dot.x;
                const dy = other.y - dot.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
    
                if (dist < dotConfig.connectionDistance) {
                    const opacity = (1 - (dist / dotConfig.connectionDistance));
                    ctx.beginPath();
                    ctx.moveTo(dot.x, dot.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = dotConfig.colors.line + (opacity * 0.8) + ')'; 
                    ctx.lineWidth = 0.5; // Keep thin
                    ctx.stroke();
                }
            }
    
            dot.update(speedFactor);
            dot.draw();
        }
    
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', () => {
        resize();
        init(); 
    });
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });
    
    init();
    
    // Start animation loop
    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        animate(timestamp);
    });
})();
