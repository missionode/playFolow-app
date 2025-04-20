document.addEventListener('DOMContentLoaded', () => {
    loadTeams();

    const newTeamForm = document.getElementById('newTeamForm');
    newTeamForm.addEventListener('submit', handleCreateNewTeam);
});

function showCreateTeamModal() {
    const modal = document.getElementById('createTeamModal');
    modal.style.display = 'block';
}

function hideCreateTeamModal() {
    const modal = document.getElementById('createTeamModal');
    modal.style.display = 'none';
}

function handleCreateNewTeam(event) {
    event.preventDefault();
    const teamNameInput = document.getElementById('teamName');
    const teamName = teamNameInput.value.trim();

    if (teamName) {
        const newTeam = {
            id: generateId(),
            name: teamName,
            members: [] // Initialize with no members
        };
        saveTeam(newTeam);
        teamNameInput.value = ''; // Clear the form
        hideCreateTeamModal();
        loadTeams(); // Reload the team list
    } else {
        alert('Team name is required.');
    }
}

function loadTeams() {
    const teamListDiv = document.getElementById('teamList');
    const noTeamsDiv = document.getElementById('noTeams');
    teamListDiv.innerHTML = ''; // Clear existing team cards

    const teams = localStorage.getItem('teams');
    if (teams) {
        const teamsArray = JSON.parse(teams);
        if (teamsArray.length > 0) {
            teamsArray.forEach(team => {
                const teamCard = createTeamCard(team);
                teamListDiv.appendChild(teamCard);
            });
            noTeamsDiv.style.display = 'none';
        } else {
            noTeamsDiv.style.display = 'block';
        }
    } else {
        noTeamsDiv.style.display = 'block';
    }
}

function createTeamCard(team) {
    const card = document.createElement('div');
    card.classList.add('team-card');
    card.dataset.teamId = team.id; // Store team ID for easy access

    const title = document.createElement('h3');
    title.textContent = team.name;

    const manageMembersButton = document.createElement('button');
    manageMembersButton.textContent = 'Manage Members';
    manageMembersButton.onclick = () => showManageMembersSection(team.id, team.name, team.members);

    card.appendChild(title);
    card.appendChild(manageMembersButton);

    return card;
}

function showManageMembersSection(teamId, teamName, members) {
    const manageMembersSection = document.getElementById('manageMembersSection');
    const currentTeamNameElement = document.getElementById('currentTeamName');
    const memberListElement = document.getElementById('memberList');
    const selectedTeamIdInput = document.getElementById('selectedTeamId');

    currentTeamNameElement.textContent = teamName;
    selectedTeamIdInput.value = teamId;
    memberListElement.innerHTML = ''; // Clear existing members

    if (members && members.length > 0) {
        members.forEach((member, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = member;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.onclick = () => removeMemberFromTeam(teamId, index); // Pass team ID and member index
            listItem.appendChild(removeButton);
            memberListElement.appendChild(listItem);
        });
    }

    manageMembersSection.style.display = 'block';
}

function hideManageMembersSection() {
    const manageMembersSection = document.getElementById('manageMembersSection');
    manageMembersSection.style.display = 'none';
}

function addMemberToTeam() {
    const newMemberNameInput = document.getElementById('newMemberName');
    const newMemberName = newMemberNameInput.value.trim();
    const selectedTeamId = document.getElementById('selectedTeamId').value;

    if (newMemberName && selectedTeamId) {
        const teams = localStorage.getItem('teams');
        if (teams) {
            const teamsArray = JSON.parse(teams);
            const updatedTeams = teamsArray.map(team => {
                if (team.id === selectedTeamId) {
                    return { ...team, members: [...team.members, newMemberName] };
                }
                return team;
            });
            localStorage.setItem('teams', JSON.stringify(updatedTeams));
            newMemberNameInput.value = ''; // Clear the input
            // Reload the members list in the UI
            const currentTeam = updatedTeams.find(team => team.id === selectedTeamId);
            if (currentTeam) {
                showManageMembersSection(currentTeam.id, currentTeam.name, currentTeam.members);
            }
        }
    } else {
        alert('Please enter a member name.');
    }
}

function removeMemberFromTeam(teamId, memberIndex) {
    const teams = localStorage.getItem('teams');
    if (teams) {
        const teamsArray = JSON.parse(teams);
        const updatedTeams = teamsArray.map(team => {
            if (team.id === teamId) {
                const updatedMembers = [...team.members];
                updatedMembers.splice(memberIndex, 1); // Remove member at the specified index
                return { ...team, members: updatedMembers };
            }
            return team;
        });
        localStorage.setItem('teams', JSON.stringify(updatedTeams));

        // Reload the members list in the UI
        const currentTeam = updatedTeams.find(team => team.id === teamId);
        if (currentTeam) {
            showManageMembersSection(currentTeam.id, currentTeam.name, currentTeam.members);
        }
    }
}

function saveTeam(team) {
    let teams = localStorage.getItem('teams');
    let teamsArray = teams ? JSON.parse(teams) : [];
    teamsArray.push(team);
    localStorage.setItem('teams', JSON.stringify(teamsArray));
}

function generateId() {
    return Math.random().toString(36).substring(2, 15);
}