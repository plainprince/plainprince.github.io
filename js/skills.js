document.addEventListener('DOMContentLoaded', () => {
    const skillsGrid = document.getElementById('skills-grid');
    const modal = document.getElementById('skill-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    skillsGrid.addEventListener('mousemove', (e) => {
        const cards = skillsGrid.querySelectorAll('.skill-card');
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });

    function renderSkills() {
        if (!config.skills || config.skills.length === 0) {
            console.error('No skills data available');
            return;
        }
        
        const skillsData = config.skills;
            const fragment = document.createDocumentFragment();

            skillsData.forEach(skill => {
                const card = document.createElement('div');
                card.className = 'card skill-card';
                card.style.setProperty('--skill-color', skill.color);
                
                card.style.borderColor = 'rgba(255, 255, 255, 0.1)'; 

                card.innerHTML = `
                    <div class="card-content">
                        <h3 class="card-title" style="color: ${skill.color}">${skill.name}</h3>
                        <div class="card-desc-container">
                            <p class="card-desc-text">${skill.desc}</p>
                        </div>
                    </div>
                `;

                card.addEventListener('click', () => {
                    openModal(skill);
                });
                
                fragment.appendChild(card);
            });

            skillsGrid.appendChild(fragment);
            
            updateLineClamps();
    }
    
    if (config.skills && config.skills.length > 0) {
        renderSkills();
    } else {
        const checkConfig = setInterval(() => {
            if (config.skills && config.skills.length > 0) {
                renderSkills();
                clearInterval(checkConfig);
            }
        }, 100);
    }

    function updateLineClamps() {
        const cards = skillsGrid.querySelectorAll('.skill-card');
        const lineHeight = 1.35 * 16;
        const paddingVertical = 3 * 16;
        const titleHeightEst = 3 * 16;
        const extraDeduction = paddingVertical + titleHeightEst;

        cards.forEach(card => {
            const width = card.offsetWidth;
            if (width === 0) return;

            const targetHeight = (width * 9) / 16;
            
            const availableTextHeight = targetHeight - extraDeduction;
            
            const lines = Math.max(1, Math.floor(availableTextHeight / lineHeight));
            
            card.style.setProperty('--line-clamp', lines);
        });
    }
    
    // Update clamps on resize
    window.addEventListener('resize', () => {
        requestAnimationFrame(updateLineClamps);
    });

    skillsGrid.addEventListener('mousemove', (e) => {
        const cards = skillsGrid.querySelectorAll('.skill-card');
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        }
    });

    function openModal(skill) {
        modalTitle.textContent = skill.name;
        modalTitle.style.color = skill.color;
        
        modalBody.innerHTML = `
            <p class="lead">${skill.desc}</p>
        `;
        
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.add('visible');
        });
    }

    function closeModalHandler() {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); 
    }

    closeModal.addEventListener('click', closeModalHandler);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalHandler();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) {
            closeModalHandler();
        }
    });
});
