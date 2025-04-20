// js/report.js

document.addEventListener('DOMContentLoaded', () => {
    generateProjectCompletionReport();
    generateTaskCompletionReport();
    generateTaskPriorityReport();
    generateTeamLikesApplauseReport();
});

function generateProjectCompletionReport() {
    const reportContainer = document.getElementById('project-completion-report');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    let completedProjects = 0;

    projects.forEach(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id);
        if (projectTasks.length > 0 && projectTasks.every(task => task.completed)) {
            completedProjects++;
        }
    });

    reportContainer.textContent = `Completed Projects: ${completedProjects} / ${projects.length}`;
}

function generateTaskCompletionReport() {
    const reportContainer = document.getElementById('task-completion-report');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completedTasks = tasks.filter(task => task.completed).length;
    reportContainer.textContent = `Completed Tasks: ${completedTasks} / ${tasks.length}`;
}

function generateTaskPriorityReport() {
    const reportContainer = document.getElementById('task-priority-report');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const highPriorityTasks = tasks.filter(task => task.priority).length;
    reportContainer.textContent = `High Priority Tasks: ${highPriorityTasks} / ${tasks.length}`;
}


function generateTeamLikesApplauseReport() {
    const reportContainer = document.getElementById('team-likes-applause-report');
    reportContainer.innerHTML = '';

    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const teams = JSON.parse(localStorage.getItem('teams') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]'); // Fetch user data

    if (teams.length === 0) {
        reportContainer.textContent = 'No teams available to generate the report.';
        return;
    }

    if (projects.length === 0) {
        reportContainer.textContent = 'No projects available to generate the report.';
        return;
    }

    if (tasks.length === 0) {
        reportContainer.textContent = 'No tasks available to generate the report.';
        return;
    }

    const teamEngagement = {};

    teams.forEach(team => {
        teamEngagement[team.name] = {
            likesByUser: {},
            applauseByUser: {}
        };

        const teamProjects = projects.filter(project => project.teamId === team.id);

        teamProjects.forEach(project => {
            const projectTasks = tasks.filter(task => task.projectId === project.id);
            projectTasks.forEach(task => {
                // Attribute likes to assignees if there are any likes
                if ((task.likedBy || []).length > 0) {
                    (task.assignedTo || []).forEach(assigneeId => {
                        const user = users.find(u => u.id === assigneeId);
                        const userName = user ? user.name : assigneeId; // Use ID if name not found
                        teamEngagement[team.name].likesByUser[userName] = (teamEngagement[team.name].likesByUser[userName] || 0) + (task.likes || 0);
                    });
                }

                // Attribute applauses to assignees if there are any applauses
                if ((task.applaudedBy || []).length > 0) {
                    (task.assignedTo || []).forEach(assigneeId => {
                        const user = users.find(u => u.id === assigneeId);
                        const userName = user ? user.name : assigneeId; // Use ID if name not found
                        teamEngagement[team.name].applauseByUser[userName] = (teamEngagement[team.name].applauseByUser[userName] || 0) + (task.applause || 0);
                    });
                }
            });
        });
    });

    if (Object.keys(teamEngagement).length > 0) {
        const reportHTML = Object.entries(teamEngagement)
            .map(([teamName, engagement]) => {
                const likesList = Object.entries(engagement.likesByUser)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([userName, count]) => `<li>${userName}: <span>${count}</span></li>`)
                    .join('');

                const applauseList = Object.entries(engagement.applauseByUser)
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([userName, count]) => `<li>${userName}: <span>${count}</span></li>`)
                    .join('');

                return `
                    <div class="team-engagement">
                        <h3>${teamName}</h3>
                        <h4>Likes (Received by Assignees)</h4>
                        ${likesList ? `<ul>${likesList}</ul>` : '<p>No likes received by assignees yet.</p>'}
                        <h4>Applauses (Received by Assignees)</h4>
                        ${applauseList ? `<ul>${applauseList}</ul>` : '<p>No applauses received by assignees yet.</p>'}
                    </div>
                `;
            })
            .join('');
        reportContainer.innerHTML = reportHTML;
    } else {
        reportContainer.textContent = 'No team engagement data found.';
    }
}