// js/settings.js

document.addEventListener('DOMContentLoaded', populateProjectDropdown);

function populateProjectDropdown() {
    const projectSelect = document.getElementById('selectProject');
    const projects = localStorage.getItem('projects');
    if (projects) {
        const projectsArray = JSON.parse(projects);
        projectsArray.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelect.appendChild(option);
        });
    }
}

function uploadTasksCSV() {
    const projectSelect = document.getElementById('selectProject');
    const fileInput = document.getElementById('taskCsvFile');
    const statusDiv = document.getElementById('task-csv-upload-status');
    const projectId = projectSelect.value;
    const file = fileInput.files[0];

    if (!projectId) {
        statusDiv.textContent = 'Please select a project first.';
        return;
    }

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            const csvData = event.target.result;
            const lines = csvData.split('\n').map(line => line.trim()).slice(1); // Skip the header row
            let tasksImportedCount = 0;

            lines.forEach(line => {
                if (line) {
                    const values = line.split(',');
                    if (values.length >= 6) {
                        const newTask = {
                            id: generateId(),
                            projectId: projectId,
                            name: values[0] ? values[0].trim() : 'New Task',
                            description: values[1] ? values[1].trim() : '',
                            priority: values[2] ? values[2].trim().toUpperCase() === 'TRUE' : false,
                            assignedTo: values[3] ? values[3].split(',').map(s => s.trim()) : [],
                            difficulty: values[4] ? parseInt(values[4].trim()) : 1,
                            completed: values[5] ? values[5].trim().toUpperCase() === 'TRUE' : false,
                            likes: 0,
                            likedBy: [],
                            applause: 0,
                            applaudedBy: []
                        };
                        saveTask(newTask);
                        tasksImportedCount++;
                    }
                }
            });

            statusDiv.textContent = `Successfully imported ${tasksImportedCount} tasks to project ID: ${projectId}.`;

        };

        reader.onerror = function() {
            statusDiv.textContent = 'Error reading the CSV file.';
        };

        reader.readAsText(file);
    } else {
        statusDiv.textContent = 'Please select a CSV file.';
    }
}

function downloadBackup() {
    const projects = localStorage.getItem('projects');
    const tasks = localStorage.getItem('tasks');
    const teams = localStorage.getItem('teams'); // Include other data if needed

    const backupData = {
        projects: projects ? JSON.parse(projects) : [],
        tasks: tasks ? JSON.parse(tasks) : [],
        teams: teams ? JSON.parse(teams) : []
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'playflow_backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function uploadBackup() {
    const fileInput = document.getElementById('backupFile');
    const statusDiv = document.getElementById('backup-upload-status');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);
                localStorage.setItem('projects', JSON.stringify(jsonData.projects || []));
                localStorage.setItem('tasks', JSON.stringify(jsonData.tasks || []));
                localStorage.setItem('teams', JSON.stringify(jsonData.teams || [])); // Restore other data if needed
                statusDiv.textContent = 'Backup restored successfully. You might need to refresh the page.';
            } catch (error) {
                statusDiv.textContent = 'Error parsing the backup file.';
            }
        };

        reader.onerror = function() {
            statusDiv.textContent = 'Error reading the backup file.';
        };

        reader.readAsText(file);
    } else {
        statusDiv.textContent = 'Please select a backup file.';
    }
}

function resetData() {
    if (confirm('Are you sure you want to delete all projects and tasks? This action cannot be undone.')) {
        localStorage.removeItem('projects');
        localStorage.removeItem('tasks');
        localStorage.removeItem('teams'); // Remove other data if needed
        alert('All data has been reset. The page will now reload.');
        window.location.reload();
    }
}

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

function saveTask(task) {
    let tasks = localStorage.getItem('tasks');
    let tasksArray = tasks ? JSON.parse(tasks) : [];
    tasksArray.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasksArray));
}