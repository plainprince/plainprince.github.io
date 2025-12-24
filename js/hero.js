document.addEventListener('DOMContentLoaded', () => {
    const profileImg = document.getElementById('profile-image');
    const usernameDisplay = document.getElementById('username-display');
    
    function setupHero() {
        if (config.username) {
            usernameDisplay.textContent = config.username;
            profileImg.src = config.pfpUrl;
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

    // 2. Matrix Card Logic
    const matrixCard = document.getElementById('matrix-card');
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&";
    
    // Cache for random strings
    const cacheSize = 256;
    const textCache = new Array(cacheSize);
    let cacheIndex = 0;
    
    // Throttling Logic
    let lastUpdate = 0;
    const fpsLimit = 60;
    const updateLimit = 1000 / fpsLimit;
    
    // Pre-calculate size
    
    function initCache() {
        const width = matrixCard.clientWidth;
        const height = matrixCard.clientHeight;
        // Increased multiplier from 6 to 8 to ensure vertical overflow
        const estimatedChars = Math.ceil((width * height) / 50) * 8; 
        
        for (let i = 0; i < cacheSize; i++) {
            let str = "";
            for (let j = 0; j < estimatedChars; j++) {
                str += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            textCache[i] = str;
        }
        
        // Initial set
        matrixCard.textContent = textCache[0];
    }

    // Initial generation
    setTimeout(initCache, 50);
    
    // Re-init on resize
    window.addEventListener('resize', debounce(initCache, 200));

    // Interaction
    function setSpotlightToCenter() {
        const width = matrixCard.offsetWidth;
        const height = matrixCard.offsetHeight;
        matrixCard.style.setProperty('--mouse-x', `${width / 2}px`);
        matrixCard.style.setProperty('--mouse-y', `${height / 2}px`);
    }
    
    // Initial center set (for page load before mouse move)
    setSpotlightToCenter();

    // Mobile fallback (keep centered on mobile)
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) {
            setSpotlightToCenter();
        }
    });

    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return; // Disable mouse interaction on mobile

        // Use the card itself for bounding rect to get correct coordinates
        // relative to the element drawing the gradient
        const rect = matrixCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update CSS variables for the gradient mask on the inner card
        // This should remain smooth (no throttling), as it's just CSS
        matrixCard.style.setProperty('--mouse-x', `${x}px`);
        matrixCard.style.setProperty('--mouse-y', `${y}px`);
        
        // Cycle through cache (Throttled)
        const now = Date.now();
        if (now - lastUpdate > updateLimit) {
            if (textCache[0]) { // Check if initialized
                cacheIndex = (cacheIndex + 1) % cacheSize;
                matrixCard.textContent = textCache[cacheIndex];
            }
            lastUpdate = now;
        }
    });
});
