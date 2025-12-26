document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-image');
    const usernameDisplay = document.getElementById('username-display');
    
    function setupHero() {
        if (config.username) {
            usernameDisplay.textContent = config.name || config.username;
            profileImg.src = `https://github.com/${config.username}.png`;
        }
    }
    
    if (config.username) {
        setupHero();
    } else {
        const checkConfig = setInterval(() => {
            if (config.username) {
                setupHero();
                clearInterval(checkConfig);
            }
        }, 100);
    }

    const matrixCard = document.getElementById('matrix-card');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";
    
    const cacheSize = 256;
    const textCache = new Array(cacheSize);
    let cacheIndex = 0;
    
    let lastUpdate = 0;
    const fpsLimit = 60;
    const updateLimit = 1000 / fpsLimit;
    
    
    function initCache() {
        const width = matrixCard.clientWidth;
        const height = matrixCard.clientHeight;
        const estimatedChars = Math.ceil((width * height) / 50) * 8; 
        
        for (let i = 0; i < cacheSize; i++) {
            let str = "";
            for (let j = 0; j < estimatedChars; j++) {
                str += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            textCache[i] = str;
        }
        
        matrixCard.textContent = textCache[0];
    }

    setTimeout(initCache, 50);
    
    window.addEventListener('resize', debounce(initCache, 200));

    function setSpotlightToCenter() {
        const width = matrixCard.offsetWidth;
        const height = matrixCard.offsetHeight;
        matrixCard.style.setProperty('--mouse-x', `${width / 2}px`);
        matrixCard.style.setProperty('--mouse-y', `${height / 2}px`);
    }
    
    setSpotlightToCenter();

    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            setSpotlightToCenter();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;

        const rect = matrixCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        matrixCard.style.setProperty('--mouse-x', `${x}px`);
        matrixCard.style.setProperty('--mouse-y', `${y}px`);
        
        const now = Date.now();
        if (now - lastUpdate > updateLimit) {
            if (textCache[0]) {
                cacheIndex = (cacheIndex + 1) % cacheSize;
                matrixCard.textContent = textCache[cacheIndex];
            }
            lastUpdate = now;
        }
    });
});
