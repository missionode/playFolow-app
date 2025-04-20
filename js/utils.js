// js/utils.js

const mainMenu = [
    { name: 'Dashboard', link: 'dashboard.html' },
    { name: 'Create Project', link: 'create-project.html' },
    { name: 'Teams', link: 'teams.html' },
    // Add links to specific project feeds dynamically if needed,
    // otherwise, users will navigate to them from the dashboard.
    { name: 'Settings', link: 'settings.html' },
    { name: 'Reports', link: 'report.html' }
    // Add more menu items as your application grows
];

function generateFloatingMenuHTML() {
    const iconHTML = `
        <div id="floatingMenuIcon">
            ☰
        </div>
    `;

    const menuItemsHTML = mainMenu.map(item => `
        <a href="${item.link}">${item.name}</a>
    `).join('');

    const menuHTML = `
        <div id="floatingMenu">
            ${menuItemsHTML}
        </div>
    `;

    return iconHTML + menuHTML;
}

function injectFloatingMenu() {
    const body = document.querySelector('body');
    if (body) {
        body.insertAdjacentHTML('beforeend', generateFloatingMenuHTML());
        addFloatingMenuEventListeners();
    }
}

function addFloatingMenuEventListeners() {
    const icon = document.getElementById('floatingMenuIcon');
    const menu = document.getElementById('floatingMenu');

    if (icon && menu) {
        icon.addEventListener('click', () => {
            menu.classList.toggle('open');
        });

        // Close the menu if the user clicks outside of it
        document.addEventListener('click', (event) => {
            if (!icon.contains(event.target) && !menu.contains(event.target)) {
                menu.classList.remove('open');
            }
        });
    }
}

// Inject the menu when the script loads
injectFloatingMenu();

// Basic CSS (you might want to put this in a separate utils.css and link it in your HTML)
const style = document.createElement('style');
style.textContent = `
    #floatingMenuIcon {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #007bff;
        color: white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5em;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    #floatingMenu {
        position: fixed;
        bottom: 75px; /* Position above the icon */
        right: 20px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
        display: none; /* Initially hidden */
        flex-direction: column;
        gap: 8px;
        z-index: 999;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    #floatingMenu.open {
        display: flex;
    }

    #floatingMenu a {
        color: #333;
        text-decoration: none;
        padding: 5px 10px;
        border-radius: 3px;
    }

    #floatingMenu a:hover {
        background-color: #f0f0f0;
    }
`;
document.head.appendChild(style);