// js/project-feed.js
document.addEventListener('DOMContentLoaded', () => {
    loadProjectDetails();
    loadTasks();
    loadTeamMembersForFilter(); // Populate the "Assigned To" filter dropdown
    loadTeamMembersForAddTask(); // --- RE-ADDED --- Populate the "Assigned To" in Add Task

    const addTaskForm = document.getElementById('addTaskForm');
    addTaskForm.addEventListener('submit', handleAddTask);

    // Event listeners for search and filters
    const searchInput = document.getElementById('searchTasks');
    searchInput.addEventListener('input', filterTasks);

    const priorityFilter = document.getElementById('filterPriority');
    priorityFilter.addEventListener('change', filterTasks);

    const completedFilter = document.getElementById('filterCompleted');
    completedFilter.addEventListener('change', filterTasks);

    const assignedToFilter = document.getElementById('filterAssignedTo');
    assignedToFilter.addEventListener('change', filterTasks);

    const difficultyFilter = document.getElementById('filterDifficulty');
    difficultyFilter.addEventListener('change', filterTasks);
});

function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function loadProjectDetails() {
    const projectId = getProjectIdFromUrl();
    const projectNameElement = document.getElementById('projectName');
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const daysLeftElement = document.getElementById('daysLeft');

    const projects = localStorage.getItem('projects');
    if (projects) {
        const projectsArray = JSON.parse(projects);
        const currentProject = projectsArray.find(project => project.id === projectId);
        if (currentProject) {
            projectNameElement.textContent = currentProject.name;
            // You might want to load timeline and calculate progress here later
        } else {
            projectNameElement.textContent = 'Project Not Found';
        }
    }

    updateProgress();
    updateDaysLeft();
}

function navigateToDashboard() {
    window.location.href = 'dashboard.html';
}

function loadTasks() {
    const projectId = getProjectIdFromUrl();
    const taskListDiv = document.getElementById('taskList');
    taskListDiv.innerHTML = ''; // Clear existing tasks

    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const projectTasks = tasksArray.filter(task => task.projectId === projectId);

        // Sort tasks: First by Completion (Active -> Completed), then by Priority (High -> Low) within Active
        projectTasks.sort((a, b) => {
            if (!a.completed && b.completed) return -1;
            if (a.completed && !b.completed) return 1;
            if (a.priority && !b.priority) return -1;
            if (!a.priority && b.priority) return 1;
            return 0;
        });

        projectTasks.forEach(task => {
            const taskCard = createTaskCard(task);
            taskListDiv.appendChild(taskCard);
        });
    }
    updateProgress();
    updateDaysLeft();
}

function navigateToEditTask(taskId) {
    const projectId = getProjectIdFromUrl(); // Make sure you're getting the projectId
    window.location.href = `edit-task.html?id=${taskId}&projectId=${projectId}`;
}

// Temporary user identifier function (replace with actual user ID later)
function getCurrentUserId() {
    // In a real application, this would come from your authentication system
    return 'user-1'; // For now, we'll just use a static ID
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.classList.add('task-card');

    if (task.completed) {
        card.classList.add('task-completed');
    }

    if (task.priority) {
        card.classList.add('priority-high');
    }

    // Add data attributes for filtering
    card.dataset.priority = task.priority;
    card.dataset.completed = task.completed;
    card.dataset.assignedTo = task.assignedTo ? task.assignedTo.join(', ').toLowerCase() : '';
    card.dataset.difficulty = task.difficulty;
    card.dataset.name = task.name.toLowerCase();
    card.dataset.description = (task.description || '').toLowerCase();

    const completionCheckbox = document.createElement('input');
    completionCheckbox.type = 'checkbox';
    completionCheckbox.checked = task.completed;
    completionCheckbox.addEventListener('change', () => toggleTaskCompletion(task.id, completionCheckbox.checked));

    const title = document.createElement('h3');
    title.appendChild(completionCheckbox);
    const titleText = document.createElement('span');
    titleText.textContent = task.name;
    title.appendChild(titleText);

    if (task.priority) {
        const priorityIcon = document.createElement('span');
        priorityIcon.textContent = ' 🔥';
        priorityIcon.classList.add('priority-icon');
        title.appendChild(priorityIcon);
    }

    const description = document.createElement('p');
    description.textContent = task.description || '';

    const assignedTo = document.createElement('p');
    assignedTo.classList.add('assigned-to');
    assignedTo.textContent = `Assigned to: ${task.assignedTo ? task.assignedTo.join(', ') : 'Not assigned'}`;

    const difficulty = document.createElement('p');
    difficulty.classList.add('difficulty');
    difficulty.textContent = `Difficulty: ${task.difficulty}`;

    const actions = document.createElement('div');
    actions.classList.add('actions');
    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => navigateToEditTask(task.id);
    actions.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-button'); // Add a class for styling
    deleteButton.onclick = () => handleDeleteTask(task.id); // Add event listener
    actions.appendChild(deleteButton);

    const social = document.createElement('div');
    social.classList.add('social');
    const likeButton = document.createElement('button');
    likeButton.classList.add('like-button');
    likeButton.classList.add('like-icon');
    likeButton.innerHTML = `👍 <span>${task.likes || 0}</span>`;
    likeButton.addEventListener('click', () => handleLike(task.id));
    social.appendChild(likeButton);

    const applauseButton = document.createElement('button');
    applauseButton.classList.add('applause-button');
    applauseButton.classList.add('applause-icon');
    applauseButton.innerHTML = `👏 <span>${task.applause || 0}</span>`;
    applauseButton.addEventListener('click', () => handleApplause(task.id));
    social.appendChild(applauseButton);

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(assignedTo);
    card.appendChild(difficulty);
    card.appendChild(actions);
    card.appendChild(social);

    return card;
}

function handleAddTask(event) {
    event.preventDefault();

    const projectId = getProjectIdFromUrl();
    const taskName = document.getElementById('taskName').value.trim();
    const taskDescription = document.getElementById('taskDescription').value.trim();
    const taskPriority = document.getElementById('taskPriority').checked;
    const taskAssignedTo = Array.from(document.getElementById('taskAssignedTo').selectedOptions).map(option => option.value);
    const taskDifficulty = document.getElementById('taskDifficulty').value;

    if (taskName) {
        const newTask = {
            id: generateId(),
            projectId: projectId,
            name: taskName,
            description: taskDescription,
            priority: taskPriority,
            assignedTo: taskAssignedTo,
            difficulty: parseInt(taskDifficulty),
            completed: false, // Initially not completed
            likes: 0,
            likedBy: [],
            applause: 0,
            applaudedBy: []
        };
        saveTask(newTask);
        addTaskForm.reset();
        loadTasks(); // Reload tasks to display the new one
    } else {
        alert('Task name is required.');
    }
}

function saveTask(task) {
    let tasks = localStorage.getItem('tasks');
    let tasksArray = tasks ? JSON.parse(tasks) : [];
    const existingTaskIndex = tasksArray.findIndex(t => t.id === task.id);
    if (existingTaskIndex > -1) {
        tasksArray[existingTaskIndex] = task; // Update existing task
    } else {
        tasksArray.push(task); // Add new task
    }
    localStorage.setItem('tasks', JSON.stringify(tasksArray));
    loadTasks(); // Reload tasks to update the view
}

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

// Function to load team members for the filter dropdown
function loadTeamMembersForFilter() {
    const projectId = getProjectIdFromUrl();
    const assignedToFilter = document.getElementById('filterAssignedTo');
    assignedToFilter.innerHTML = '<option value="">All</option>'; // Reset options

    const projects = localStorage.getItem('projects');
    if (projects) {
        const projectsArray = JSON.parse(projects);
        const currentProject = projectsArray.find(project => project.id === projectId);
        if (currentProject && currentProject.teamId) {
            const teams = localStorage.getItem('teams');
            if (teams) {
                const teamsArray = JSON.parse(teams);
                const currentTeam = teamsArray.find(team => team.id === currentProject.teamId);
                if (currentTeam && currentTeam.members) {
                    currentTeam.members.forEach(member => {
                        const option = document.createElement('option');
                        option.value = member.toLowerCase(); // Use lowercase for easier filtering
                        option.textContent = member;
                        assignedToFilter.appendChild(option);
                    });
                }
            }
        }
    }
}

// Function to load team members for the Add Task dropdown
function loadTeamMembersForAddTask() {
    const projectId = getProjectIdFromUrl();
    const assignedToSelect = document.getElementById('taskAssignedTo');
    assignedToSelect.innerHTML = '<option value="">-- Select Team Members --</option>';

    const projects = localStorage.getItem('projects');
    if (projects) {
        const projectsArray = JSON.parse(projects);
        const currentProject = projectsArray.find(project => project.id === projectId);
        if (currentProject && currentProject.teamId) {
            const teams = localStorage.getItem('teams');
            if (teams) {
                const teamsArray = JSON.parse(teams);
                const currentTeam = teamsArray.find(team => team.id === currentProject.teamId);
                if (currentTeam && currentTeam.members) {
                    currentTeam.members.forEach(member => {
                        const option = document.createElement('option');
                        option.value = member;
                        option.textContent = member;
                        assignedToSelect.appendChild(option);
                    });
                }
            }
        }
    }
}

function updateProgress() {
    const projectId = getProjectIdFromUrl();
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    const completionMessageContainer = document.getElementById('completionMessageContainer'); // Add this to your HTML
    let totalDifficulty = 0;
    let completedDifficulty = 0;
    let allTasksCompleted = false;

    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const projectTasks = tasksArray.filter(task => task.projectId === projectId);

        if (projectTasks.length > 0) {
            let completedCount = 0;
            projectTasks.forEach(task => {
                totalDifficulty += parseInt(task.difficulty);
                if (task.completed) {
                    completedDifficulty += parseInt(task.difficulty);
                    completedCount++;
                }
            });
            allTasksCompleted = completedCount === projectTasks.length;

            if (totalDifficulty > 0) {
                const progress = (completedDifficulty / totalDifficulty) * 100;
                progressBar.style.width = `${progress}%`;
                progressPercentage.textContent = `${Math.round(progress)}%`;

                if (allTasksCompleted && projectTasks.length > 0) {
                    confetti(); // Using the library we included

                    if (completionMessageContainer) {
                        completionMessageContainer.textContent = '🎉 Project Completed! 🎉';
                        completionMessageContainer.style.display = 'block'; // Make it visible
                    } else {
                        alert('🎉 Project Completed! 🎉'); // Fallback if container not found
                    }
                } else if (completionMessageContainer) {
                    completionMessageContainer.style.display = 'none'; // Hide if not complete
                    completionMessageContainer.textContent = '';
                }

            } else {
                progressBar.style.width = '0%';
                progressPercentage.textContent = '0%';
                if (completionMessageContainer) {
                    completionMessageContainer.style.display = 'none';
                    completionMessageContainer.textContent = '';
                }
            }
        } else {
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            if (completionMessageContainer) {
                completionMessageContainer.style.display = 'none';
                completionMessageContainer.textContent = '';
            }
        }
    } else {
        progressBar.style.width = '0%';
        progressPercentage.textContent = '0%';
        if (completionMessageContainer) {
            completionMessageContainer.style.display = 'none';
            completionMessageContainer.textContent = '';
        }
    }
}

function updateDaysLeft() {
    const projectId = getProjectIdFromUrl();
    const daysLeftElement = document.getElementById('daysLeft');
    const projects = localStorage.getItem('projects');
    if (projects) {
        const projectsArray = JSON.parse(projects);
        const currentProject = projectsArray.find(project => project.id === projectId);
        if (currentProject && currentProject.timelineValue && currentProject.timelineUnit) {
            const timelineValue = parseInt(currentProject.timelineValue);
            // Basic calculation - you'd likely want a more sophisticated date handling
            daysLeftElement.textContent = `${timelineValue} ${currentProject.timelineUnit} remaining`;
        } else {
            daysLeftElement.textContent = 'Timeline not set';
        }
    }
}

function toggleTaskCompletion(taskId, isCompleted) {
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const updatedTasksArray = tasksArray.map(task =>
            task.id === taskId ? { ...task, completed: isCompleted } : task
        );
        localStorage.setItem('tasks', JSON.stringify(updatedTasksArray));
        loadTasks(); // Reload tasks to update the progress bar and task list order
    }
}

function handleLike(taskId) {
    const userId = getCurrentUserId();
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const updatedTasksArray = tasksArray.map(task => {
            if (task.id === taskId) {
                const likedBy = task.likedBy || [];
                if (!likedBy.includes(userId)) {
                    likedBy.push(userId);
                    return { ...task, likedBy: likedBy, likes: likedBy.length };
                }
                return task;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasksArray));
        loadTasks();
    }
}

function handleApplause(taskId) {
    const userId = getCurrentUserId();
    const tasks = localStorage.getItem('tasks');
    if (tasks) {
        const tasksArray = JSON.parse(tasks);
        const updatedTasksArray = tasksArray.map(task => {
            if (task.id === taskId) {
                const applaudedBy = task.applaudedBy || [];
                if (!applaudedBy.includes(userId)) {
                    applaudedBy.push(userId);
                    return { ...task, applaudedBy: applaudedBy, applause: applaudedBy.length };
                }
                return task;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasksArray));
        loadTasks();
    }
}

function handleDeleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const tasks = localStorage.getItem('tasks');
        if (tasks) {
            const tasksArray = JSON.parse(tasks);
            const updatedTasksArray = tasksArray.filter(task => task.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(updatedTasksArray));
            loadTasks(); // Reload tasks to update the display on the current project feed
        }
    }
}

// Function to filter tasks based on search and filter criteria
function filterTasks() {
    const searchTerm = document.getElementById('searchTasks').value.toLowerCase();
    const priorityFilterValue = document.getElementById('filterPriority').value;
    const completedFilterValue = document.getElementById('filterCompleted').value;
    const assignedToFilterValue = document.getElementById('filterAssignedTo').value;
    const difficultyFilterValue = document.getElementById('filterDifficulty').value;

    const taskCards = document.querySelectorAll('#taskList .task-card');

    taskCards.forEach(card => {
        const nameMatch = card.dataset.name.includes(searchTerm);
        const descriptionMatch = card.dataset.description.includes(searchTerm);
        const searchMatch = nameMatch || descriptionMatch;

        const priorityMatch = priorityFilterValue === '' || card.dataset.priority === priorityFilterValue;
        const completedMatch = completedFilterValue === '' || card.dataset.completed === completedFilterValue;
        const assignedToMatch = assignedToFilterValue === '' || card.dataset.assignedTo.includes(assignedToFilterValue);
        const difficultyMatch = difficultyFilterValue === '' || card.dataset.difficulty === difficultyFilterValue;

        if (searchMatch && priorityMatch && completedMatch && assignedToMatch && difficultyMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}