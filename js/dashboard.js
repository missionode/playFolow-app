function navigateToCreateProject() {
    window.location.href = 'create-project.html';
}

function loadProjects() {
    const projects = localStorage.getItem('projects');
    const projectListDiv = document.getElementById('projectList');
    const noProjectsDiv = document.getElementById('noProjects');

    projectListDiv.innerHTML = ''; // Clear any existing project cards

    if (projects) {
        const projectsArray = JSON.parse(projects);
        if (projectsArray.length > 0) {
            projectsArray.forEach(project => {
                const projectCard = createProjectCard(project);
                projectListDiv.appendChild(projectCard);
            });
            noProjectsDiv.style.display = 'none'; // Hide "No projects" message
        } else {
            noProjectsDiv.style.display = 'block'; // Show "No projects" message
        }
    } else {
        noProjectsDiv.style.display = 'block'; // Show "No projects" message if 'projects' item is not in localStorage
    }
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.classList.add('project-card');

    const titleLink = document.createElement('a');
    titleLink.href = `project-feed.html?id=${project.id}`;
    titleLink.style.textDecoration = 'none'; // Remove default link underline
    titleLink.style.color = 'inherit'; // Inherit text color from parent

    const title = document.createElement('h3');
    title.textContent = project.name;

    titleLink.appendChild(title);

    const timeline = document.createElement('p');
    timeline.textContent = `Timeline: ${project.timelineValue} ${project.timelineUnit}`;

    const actions = document.createElement('div');
    actions.classList.add('actions');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => navigateToEditProject(project.id); // We'll implement this later

    actions.appendChild(editButton);
    card.appendChild(titleLink); // Append the link containing the title
    card.appendChild(timeline);
    card.appendChild(actions);

    return card;
}

function navigateToEditProject(projectId) {
    window.location.href = `edit-project.html?id=${projectId}`;
}

// Load projects when the page loads
window.onload = loadProjects;