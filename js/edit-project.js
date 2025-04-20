document.addEventListener('DOMContentLoaded', () => {
    loadTeams();
    loadProjectDetails();

    const form = document.getElementById('editProjectForm');
    form.addEventListener('submit', handleSaveChanges);
});

function navigateToDashboard() {
    window.location.href = 'dashboard.html';
}

function navigateToTeams() {
    window.location.href = 'teams.html';
}

function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function loadProjectDetails() {
    const projectId = getProjectIdFromUrl();
    if (projectId) {
        const projects = localStorage.getItem('projects');
        if (projects) {
            const projectsArray = JSON.parse(projects);
            const projectToEdit = projectsArray.find(project => project.id === projectId);

            if (projectToEdit) {
                document.getElementById('projectId').value = projectToEdit.id;
                document.getElementById('projectName').value = projectToEdit.name;
                document.getElementById('timelineValue').value = projectToEdit.timelineValue;
                document.getElementById('timelineUnit').value = projectToEdit.timelineUnit;
                document.getElementById('projectTeam').value = projectToEdit.teamId || '';
            } else {
                alert('Project not found.');
                navigateToDashboard();
            }
        } else {
            alert('No projects data found.');
            navigateToDashboard();
        }
    } else {
        alert('Invalid project ID.');
        navigateToDashboard();
    }
}

function handleSaveChanges(event) {
    event.preventDefault();

    const projectId = document.getElementById('projectId').value;
    const projectName = document.getElementById('projectName').value.trim();
    const timelineValue = document.getElementById('timelineValue').value;
    const timelineUnit = document.getElementById('timelineUnit').value;
    const projectTeam = document.getElementById('projectTeam').value;

    if (projectName) {
        const updatedProject = {
            id: projectId,
            name: projectName,
            timelineValue: timelineValue,
            timelineUnit: timelineUnit,
            teamId: projectTeam
        };

        saveUpdatedProject(updatedProject);
        navigateToDashboard();
    } else {
        alert('Project name is required.');
    }
}

function saveUpdatedProject(updatedProject) {
    const projects = localStorage.getItem('projects');
    if (projects) {
        const projectsArray = JSON.parse(projects);
        const updatedProjectsArray = projectsArray.map(project =>
            project.id === updatedProject.id ? updatedProject : project
        );
        localStorage.setItem('projects', JSON.stringify(updatedProjectsArray));
    }
}

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

