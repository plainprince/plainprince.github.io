(() => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let dots = [];
    
    const dotConfig = {
        dotCount: 100, 
        connectionDistance: 150,
        mouseDistance: 200,
        dotBaseRadius: 1.0,
        dotVariance: 0.3,
        baseSpeed: 0.3,
        speedVariance: 0.2,
        direction: { x: -0.5, y: 0.5 }, 
        colors: {
            dot: 'rgba(255, 255, 255, 0.4)',
            line: 'rgba(255, 255, 255, ',
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
        
        ctx.scale(dpr, dpr);
        
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        const diagonal = Math.sqrt(width*width + height*height);
        
        dotConfig.connectionDistance = Math.min(Math.max(diagonal * 0.1, 100), 250);
        
        dotConfig.mouseDistance = dotConfig.connectionDistance * 1.5;
    }
    
    let lastTime = 0;
    const targetFPS = 120;
    const targetFrameTime = 1000 / targetFPS;

    function animate(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
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
                    ctx.lineWidth = 0.5;
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
    
    requestAnimationFrame((timestamp) => {
        lastTime = timestamp;
        animate(timestamp);
    });
})();
