document.addEventListener('DOMContentLoaded', () => {
    const aboutContent = document.getElementById('about-content');
    
    function renderAboutMe() {
        if (!config.aboutMe || !Array.isArray(config.aboutMe)) {
            aboutContent.innerHTML = '<p>Loading...</p>';
            return;
        }
        
        const paragraphs = config.aboutMe.map(text => `<p>${text}</p>`).join('');
        aboutContent.innerHTML = paragraphs;
    }
    
    if (config.aboutMe && Array.isArray(config.aboutMe)) {
        renderAboutMe();
    } else {
        const checkConfig = setInterval(() => {
            if (config.aboutMe && Array.isArray(config.aboutMe)) {
                renderAboutMe();
                clearInterval(checkConfig);
            }
        }, 100);
    }
});


