// lines.js

import { teams } from './team.js'; // Import teams data

document.addEventListener('DOMContentLoaded', () => {
  displayTeamsForLineAssignment();
  displayAvailablePlayers();
});

// Function to display players for line assignment
function displayTeamsForLineAssignment() {
  const container = document.getElementById('team-lines');
  container.innerHTML = ''; // Clear any existing content

  teams.forEach(team => {
    // Display the team's name and their players
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team-container');
    
    teamDiv.innerHTML = `<h2>${team.name}</h2>`;
    team.players.forEach(player => {
      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player-container');
      
      playerDiv.innerHTML = `
        <p>${player.name} - ${player.position}</p>
        <label for="line-${player.id}">Assign to line:</label>
        <select id="line-${player.id}">
          <option value="line1">Line 1</option>
          <option value="line2">Line 2</option>
          <option value="line3">Line 3</option>
          <option value="line4">Line 4</option>
        </select>
      `;
      teamDiv.appendChild(playerDiv);
    });

    container.appendChild(teamDiv);
  });
}

// Function to display available players
function displayAvailablePlayers() {
  const availablePlayersContainer = document.getElementById('available-players');
  availablePlayersContainer.innerHTML = ''; // Clear any existing content

  const availablePlayers = getAvailablePlayers();  // This function should return players who are not assigned to any team yet
  availablePlayers.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player-container');

    playerDiv.innerHTML = `
      <p>${player.name} - ${player.position}</p>
      <label for="line-${player.id}">Assign to line:</label>
      <select id="line-${player.id}">
        <option value="line1">Line 1</option>
        <option value="line2">Line 2</option>
        <option value="line3">Line 3</option>
        <option value="line4">Line 4</option>
      </select>
    `;
    availablePlayersContainer.appendChild(playerDiv);
  });
}

// Save
document.getElementById('save').addEventListener('click', () => {
  const lineAssignments = {};

  // Collect the line assignments for all players
  document.querySelectorAll('select[id^="line-"]').forEach(select => {
    const playerId = select.id.split('-')[1];  // Extract player ID from the select element ID
    const selectedLine = select.value;  // Get the selected line for the player
    lineAssignments[playerId] = selectedLine;  // Store the assignment
  });

  console.log('Line Assignments:', lineAssignments);
  alert('Line assignments saved!');
});

// Reset
document.getElementById('reset').addEventListener('click', () => {
  // Reset all line selections to default (line 1)
  document.querySelectorAll('select[id^="line-"]').forEach(select => {
    select.value = 'line1';  // Reset each select element to 'line1'
  });

  alert('Line assignments reset!');
});

// Helper function to get available players (not assigned to any team)
function getAvailablePlayers() {
  let availablePlayers = [];

  teams.forEach(team => {
    team.players.forEach(player => {
      if (!player.line) {  // Check if the player has not been assigned to a line
        availablePlayers.push(player);
      }
    });
  });

  return availablePlayers;
}
