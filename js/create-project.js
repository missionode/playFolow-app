function navigateToDashboard() {
    window.location.href = 'dashboard.html';
}

function navigateToTeams() {
    window.location.href = 'teams.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createProjectForm');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the default form submission

        const projectName = document.getElementById('projectName').value.trim();
        const timelineValue = document.getElementById('timelineValue').value;
        const timelineUnit = document.getElementById('timelineUnit').value;
        const projectTeam = document.getElementById('projectTeam').value; // Currently not used

        if (projectName) {
            const newProject = {
                id: generateId(), // We'll create this function later
                name: projectName,
                timelineValue: timelineValue,
                timelineUnit: timelineUnit,
                teamId: projectTeam // Store the selected team ID
            };

            saveProject(newProject);
            navigateToDashboard();
        } else {
            alert('Project name is required.');
        }
    });

    // Function to load teams into the select dropdown (will be implemented later)
    loadTeams();
});

function generateId() {
    // Simple unique ID generator (for now)
    return Math.random().toString(36).substring(2, 15);
}

function saveProject(project) {
    let projects = localStorage.getItem('projects');
    let projectsArray = projects ? JSON.parse(projects) : [];
    projectsArray.push(project);
    localStorage.setItem('projects', JSON.stringify(projectsArray));
}

// Function to load teams from local storage (will be implemented later)
function loadTeams() {
    const teamsSelect = document.getElementById('projectTeam');
    const teams = localStorage.getItem('teams');
    if (teams) {
        const teamsArray = JSON.parse(teams);
        teamsArray.forEach(team => {
            const option = document.createElement('option');
            option.value = team.id;
            option.textContent = team.name;
            teamsSelect.appendChild(option);
        });
    }
}