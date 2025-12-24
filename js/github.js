// GitHub Data Fetching and Rendering

let allRepos = [];

document.addEventListener('DOMContentLoaded', () => {
    function initGithub() {
        fetchRepos();
        
        const projectsGrid = document.getElementById('projects-grid');
        projectsGrid.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.project-card');
            for (const card of cards) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    }
    
    if (config.githubApiUrl) {
        initGithub();
    } else {
        const checkConfig = setInterval(() => {
            if (config.githubApiUrl) {
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
        const response = await fetch(config.githubApiUrl + '?per_page=100'); // Fetch up to 100 repos
        if (!response.ok) throw new Error('Failed to fetch repos');
        allRepos = await response.json();
        
        // Initial Render: Projects (Starred, Non-Fork)
        renderProjects('my-projects');
    } catch (error) {
        console.error(error);
        const grid = document.getElementById('projects-grid');
        grid.innerHTML = '<p style="color: var(--accent-orange)">Failed to load projects.</p>';
    }
}

function renderProjects(filterType) {
    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';

    let filteredRepos = [];

    switch (filterType) {
        case 'my-projects':
            // Starred AND Not Fork
            filteredRepos = allRepos.filter(repo => repo.stargazers_count > 0 && !repo.fork);
            break;
        case 'forks':
            // All Forks
            filteredRepos = allRepos.filter(repo => repo.fork);
            break;
        case 'trash':
            // Not Starred AND Not Fork (The "trash" definition from user)
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
        
        // Setup internal HTML
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
}

