// js/report.js
document.addEventListener('DOMContentLoaded', () => {
    loadReportData();
});

function loadReportData() {
    const projects = localStorage.getItem('projects');
    const tasks = localStorage.getItem('tasks');
    let projectsArray = projects ? JSON.parse(projects) : [];
    let tasksArray = tasks ? JSON.parse(tasks) : [];

    // Project Summary
    document.getElementById('total-projects').textContent = projectsArray.length;
    const completedProjects = projectsArray.filter(project => {
        return tasksArray.filter(task => task.projectId === project.id).every(task => task.completed);
    }).length;
    document.getElementById('completed-projects').textContent = completedProjects;

    // Task Summary (All Projects)
    document.getElementById('total-tasks').textContent = tasksArray.length;
    document.getElementById('completed-tasks-all').textContent = tasksArray.filter(task => task.completed).length;
    document.getElementById('high-priority-tasks').textContent = tasksArray.filter(task => task.priority).length;
    const totalDifficulty = tasksArray.reduce((sum, task) => sum + parseInt(task.difficulty || 0), 0);
    const averageDifficulty = tasksArray.length > 0 ? (totalDifficulty / tasksArray.length).toFixed(1) : 0;
    document.getElementById('average-difficulty').textContent = averageDifficulty;

    // Social Performance (All Projects - Updated for Users)
    const allLikes = tasksArray.reduce((acc, task) => acc.concat(task.likedBy || []), []);
    const uniqueLikersCount = [...new Set(allLikes)].length;
    const allApplause = tasksArray.reduce((acc, task) => acc.concat(task.applaudedBy || []), []);
    const uniqueApplaudersCount = [...new Set(allApplause)].length;
    document.getElementById('total-likes').textContent = uniqueLikersCount;
    document.getElementById('total-applause').textContent = uniqueApplaudersCount;

    // Populate Project Select Dropdown
    const projectSelect = document.getElementById('project-select');
    projectsArray.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        projectSelect.appendChild(option);
    });

    // Event listener for project selection
    projectSelect.addEventListener('change', (event) => {
        const selectedProjectId = event.target.value;
        if (selectedProjectId) {
            displayProjectTaskDetails(selectedProjectId, tasksArray);
        } else {
            // Reset project-specific details
            document.getElementById('project-total-tasks').textContent = '0';
            document.getElementById('project-completed-tasks').textContent = '0';
            document.getElementById('project-high-priority-tasks').textContent = '0';
            document.getElementById('project-average-difficulty').textContent = '0';
            document.getElementById('project-total-likes').textContent = '0';
            document.getElementById('project-total-applause').textContent = '0';
        }
    });
}

function displayProjectTaskDetails(projectId, allTasks) {
    const projectTasks = allTasks.filter(task => task.projectId === projectId);

    document.getElementById('project-total-tasks').textContent = projectTasks.length;
    document.getElementById('project-completed-tasks').textContent = projectTasks.filter(task => task.completed).length;
    document.getElementById('project-high-priority-tasks').textContent = projectTasks.filter(task => task.priority).length;
    const totalDifficulty = projectTasks.reduce((sum, task) => sum + parseInt(task.difficulty || 0), 0);
    const averageDifficulty = projectTasks.length > 0 ? (totalDifficulty / projectTasks.length).toFixed(1) : 0;
    document.getElementById('project-average-difficulty').textContent = averageDifficulty;

    // Social Performance (Selected Project - Updated for Users)
    const projectLikes = projectTasks.reduce((acc, task) => acc.concat(task.likedBy || []), []);
    const projectUniqueLikersCount = [...new Set(projectLikes)].length;
    const projectApplause = projectTasks.reduce((acc, task) => acc.concat(task.applaudedBy || []), []);
    const projectUniqueApplaudersCount = [...new Set(projectApplause)].length;
    document.getElementById('project-total-likes').textContent = projectUniqueLikersCount;
    document.getElementById('project-total-applause').textContent = projectUniqueApplaudersCount;
}