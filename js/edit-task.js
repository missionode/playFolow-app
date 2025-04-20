document.addEventListener('DOMContentLoaded', () => {
    loadTeamMembers(); // Call loadTeamMembers first
    loadTaskDetails(); // Then call loadTaskDetails
    const editTaskForm = document.getElementById('editTaskForm');
    editTaskForm.addEventListener('submit', handleSaveChanges);
});

function getTaskIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function navigateToProjectFeed() {
    const taskId = getTaskIdFromUrl();
    let projectId;
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const currentTask = tasksArray.find(task => task.id === taskId);
        if (currentTask) {
            projectId = currentTask.projectId;
        }
    }
    if (projectId) {
        window.location.href = `project-feed.html?id=${projectId}`;
    } else {
        // Fallback: If projectId cannot be reliably determined from the task,
        // we might need to reconsider how we pass or store the projectId.
        // For now, let's try to get it from the URL if available (as when first loading the edit page).
        const projectIdFromUrl = new URLSearchParams(window.location.search).get('projectId');
        if (projectIdFromUrl) {
            window.location.href = `project-feed.html?id=${projectIdFromUrl}`;
        } else {
            window.location.href = 'dashboard.html'; // Last resort fallback
        }
    }
}

function loadTaskDetails() {
    const taskId = getTaskIdFromUrl();
    console.log('loadTaskDetails: Editing Task ID:', taskId);
    if (taskId) {
        const tasks = localStorage.getItem('tasks');
        if (tasks) {
            const tasksArray = JSON.parse(tasks);
            const taskToEdit = tasksArray.find(task => task.id === taskId);
            console.log('loadTaskDetails: Task to Edit:', taskToEdit);

            if (taskToEdit) {
                document.getElementById('taskId').value = taskToEdit.id;
                document.getElementById('taskName').value = taskToEdit.name;
                document.getElementById('taskDescription').value = taskToEdit.description || '';
                document.getElementById('taskPriority').checked = taskToEdit.priority || false;
                document.getElementById('taskDifficulty').value = taskToEdit.difficulty;

                if (taskToEdit.assignedTo && Array.isArray(taskToEdit.assignedTo)) {
                    const assignedToSelect = document.getElementById('taskAssignedTo');
                    const assignedMembers = taskToEdit.assignedTo;
                    console.log('loadTaskDetails: Assigned Members in Task:', assignedMembers);
                    console.log('loadTaskDetails: Number of Options:', assignedToSelect.options.length);

                    Array.from(assignedToSelect.options).forEach(option => {
                        console.log('loadTaskDetails: Option Value:', option.value);
                        const isSelected = assignedMembers.includes(option.value);
                        console.log('loadTaskDetails: Is Selected:', isSelected);
                        option.selected = isSelected;
                        console.log('loadTaskDetails: Option Selected State:', option.selected);
                    });
                } else {
                    console.log('loadTaskDetails: No assigned members or not an array.');
                }

            } else {
                alert('Task not found.');
                navigateToProjectFeed();
            }
        } else {
            alert('No task data found.');
            navigateToProjectFeed();
        }
    } else {
        alert('Invalid task ID.');
        navigateToProjectFeed();
    }
}

function loadTeamMembers() {
    const taskId = getTaskIdFromUrl();
    console.log('loadTeamMembers: Task ID:', taskId);
    let projectId;
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const currentTask = tasksArray.find(task => task.id === taskId);
        console.log('loadTeamMembers: Current Task (for projectId):', currentTask);
        if (currentTask) {
            projectId = currentTask.projectId;
            console.log('loadTeamMembers: Project ID:', projectId);
        }
    }

    if (projectId) {
        const assignedToSelect = document.getElementById('taskAssignedTo');
        assignedToSelect.innerHTML = '<option value="">-- Select Team Members --</option>';
        console.log('loadTeamMembers: Clearing existing options.');

        const projects = localStorage.getItem('projects');
        if (projects) {
            const projectsArray = JSON.parse(projects);
            const currentProject = projectsArray.find(project => project.id === projectId);
            console.log('loadTeamMembers: Current Project:', currentProject);
            if (currentProject && currentProject.teamId) {
                console.log('loadTeamMembers: Project Team ID:', currentProject.teamId);
                const teams = localStorage.getItem('teams');
                if (teams) {
                    const teamsArray = JSON.parse(teams);
                    const currentTeam = teamsArray.find(team => team.id === currentProject.teamId);
                    console.log('loadTeamMembers: Current Team:', currentTeam);
                    if (currentTeam && currentTeam.members) {
                        console.log('loadTeamMembers: Team Members:', currentTeam.members);
                        currentTeam.members.forEach(member => {
                            const option = document.createElement('option');
                            option.value = member;
                            option.textContent = member;
                            assignedToSelect.appendChild(option);
                            console.log('loadTeamMembers: Added option:', member);
                        });
                    } else {
                        console.log('loadTeamMembers: No members in the team or team is undefined.');
                    }
                } else {
                    console.log('loadTeamMembers: Project has no team ID.');
                }
            } else {
                console.log('loadTeamMembers: Project not found.');
            }
        } else {
            console.log('loadTeamMembers: No projects data found.');
        }
    } else {
        console.log('loadTeamMembers: Project ID not found for the task.');
    }
}

function handleSaveChanges(event) {
    event.preventDefault();

    const taskId = document.getElementById('taskId').value;
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskPriority = document.getElementById('taskPriority').checked;
    const taskAssignedTo = Array.from(document.getElementById('taskAssignedTo').selectedOptions).map(option => option.value);
    const taskDifficulty = document.getElementById('taskDifficulty').value;

    if (taskName) {
        const updatedTask = {
            id: taskId,
            projectId: getProjectIdForTask(taskId),
            name: taskName,
            description: taskDescription,
            priority: taskPriority,
            assignedTo: taskAssignedTo,
            difficulty: parseInt(taskDifficulty),
            ...getOriginalTaskData(taskId)
        };

        saveTask(updatedTask); // Reusing saveTask from project-feed.js
        navigateToProjectFeed();
    } else {
        alert('Task name is required.');
    }
}

function getProjectIdForTask(taskId) {
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const task = tasksArray.find(t => t.id === taskId);
        return task ? task.projectId : null;
    }
    return null;
}

function getOriginalTaskData(taskId) {
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const task = tasksArray.find(t => t.id === taskId);
        return task ? { completed: task.completed, likes: task.likes, applause: task.applause } : {};
    }
    return {};
}

function saveTask(task) {
    let tasks = localStorage.getItem('tasks');
    let tasksArray = tasks ? JSON.parse(tasks) : [];
    const existingTaskIndex = tasksArray.findIndex(t => t.id === task.id);
    if (existingTaskIndex > -1) {
        tasksArray[existingTaskIndex] = task; // Update existing task
    } else {
        tasksArray.push(task); // Add new task (shouldn't happen in edit)
    }
    localStorage.setItem('tasks', JSON.stringify(tasksArray));
}


function handleDeleteTaskFromEdit() {
    const taskId = document.getElementById('taskId').value;
    const projectId = new URLSearchParams(window.location.search).get('projectId'); // Get projectId from the URL
    if (confirm('Are you sure you want to delete this task?')) {
        const tasks = localStorage.getItem('tasks');
        if (tasks) {
            const tasksArray = JSON.parse(tasks);
            const updatedTasksArray = tasksArray.filter(task => task.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(updatedTasksArray));
            if (projectId) {
                window.location.href = `project-feed.html?id=${projectId}`; // Redirect to the current project feed
            } else {
                window.location.href = 'dashboard.html'; // Fallback if projectId not found in URL
            }
        }
    }
}