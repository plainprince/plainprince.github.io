let allRepos = [];

document.addEventListener('DOMContentLoaded', () => {
    function initGithub() {
        fetchRepos();
    }
    
    if (config.username) {
        initGithub();
    } else {
        const checkConfig = setInterval(() => {
            if (config.username) {
                initGithub();
                clearInterval(checkConfig);
            }
        }, 100);
    }
    
    document.addEventListener('filterProjects', (e) => {
        renderProjects(e.detail);
    });
});

async function fetchRepos() {
    try {
        const cached = localStorage.getItem(`repos_${config.username}`);
        const now = Date.now();
        
        if (cached) {
            const { timestamp, data } = JSON.parse(cached);
            if (now - timestamp < 3600000) {
                allRepos = data;
                renderProjects('my-projects');
                return;
            }
        }

        const apiUrl = `https://api.github.com/users/${config.username}/repos`;
        const response = await fetch(apiUrl + '?per_page=100');
        if (!response.ok) throw new Error('Failed to fetch repos');
        allRepos = await response.json();
        
        localStorage.setItem(`repos_${config.username}`, JSON.stringify({
            timestamp: now,
            data: allRepos
        }));
        
        renderProjects('my-projects');
    } catch (error) {
        console.error(error);
        
        const cached = localStorage.getItem(`repos_${config.username}`);
        if (cached) {
            allRepos = JSON.parse(cached).data;
            renderProjects('my-projects');
            return;
        }

        const grid = document.getElementById('projects-grid');
        grid.innerHTML = '<p style="color: var(--accent-orange)">Failed to load projects. (Offline mode active)</p>';
    }
}

function renderProjects(filterType) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let filteredRepos = [];

    switch (filterType) {
        case 'my-projects':
            filteredRepos = allRepos.filter(repo => repo.stargazers_count > 0 && !repo.fork);
            break;
        case 'forks':
            filteredRepos = allRepos.filter(repo => repo.fork);
            break;
        case 'trash':
            filteredRepos = allRepos.filter(repo => !repo.fork && repo.stargazers_count === 0);
            break;
        default:
            filteredRepos = allRepos;
    }

    if (filteredRepos.length === 0) {
        grid.innerHTML = '<p style="color: var(--text-secondary)">No projects found in this category.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();

    filteredRepos.forEach(repo => {
        const card = document.createElement('a');
        card.href = repo.html_url;
        card.target = "_blank";
        card.className = 'card project-card';
        
        card.innerHTML = `
            <div class="card-content">
                <h3 class="card-title">${repo.name}</h3>
                <p class="card-desc">${repo.description || 'No description available.'}</p>
                <div class="card-meta">
                    <span>★ ${repo.stargazers_count}</span>
                    <span style="margin-left: 10px;">${repo.language || 'Plain Text'}</span>
                </div>
            </div>
            <div class="card-border"></div>
        `;

        fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    
    // Attach mousemove listener after cards are rendered (only once)
    if (!window.__projectsMouseMoveAttached) {
        grid.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.project-card');
            for (const card of cards) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
        window.__projectsMouseMoveAttached = true;
    }
}
