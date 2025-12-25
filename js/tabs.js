document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    function switchTab(tabId) {
        // Update Buttons
        tabBtns.forEach(btn => {
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update Panes
        tabPanes.forEach(pane => {
            if (pane.id === tabId) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });

    // Sub-tabs logic (Projects specific)
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    
    // We'll expose a global event or method to filter projects
    // or we can handle it here if we assume github.js populates the list first
    // Better: Dispatch a custom event "filterProjects"
    
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            subTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterType = btn.dataset.subtab;
            
            // Dispatch event for github.js to handle
            const event = new CustomEvent('filterProjects', { detail: filterType });
            document.dispatchEvent(event);
        });
    });
});


