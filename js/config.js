let config = {};

async function loadConfig() {
    try {
        const response = await fetch('data/config.json');
        if (!response.ok) throw new Error('Failed to load config');
        config = await response.json();
        
        const replacements = {};
        
        if (config.name) {
            replacements.name = config.name;
        }
        
        if (config.username) {
            replacements.username = config.username;
            if (!replacements.name) {
                replacements.name = config.username;
            }
        }
        
        if (config.birthDate) {
            replacements.birthdate = config.birthDate;
            replacements.birthDate = config.birthDate;
            replacements.age = calculateAge(config.birthDate).toString();
        }
        
        if (config.aboutMe && Array.isArray(config.aboutMe)) {
            config.aboutMe = config.aboutMe.map(text => {
                let processed = text;
                for (const [key, value] of Object.entries(replacements)) {
                    const regex = new RegExp('\\$' + key, 'gi');
                    processed = processed.replace(regex, value);
                }
                return processed;
            });
        }
        
        if (config.pageTitle) {
            let title = config.pageTitle;
            for (const [key, value] of Object.entries(replacements)) {
                const regex = new RegExp('\\$' + key, 'gi');
                title = title.replace(regex, value);
            }
            document.title = title;
        } else {
            document.title = config.name || config.username || 'Portfolio';
        }
    } catch (error) {
        console.error('Error loading config:', error);
        throw error;
    }
}

function calculateAge(birthDateStr) {
    const [day, month, year] = birthDateStr.split('.').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

loadConfig();
