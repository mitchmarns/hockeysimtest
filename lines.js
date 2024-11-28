// lines.js

import { teams } from './team.js'; // Import teams data

document.addEventListener('DOMContentLoaded', () => {
  displayTeamsForLineAssignment();
});

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

// Example logic to handle save/reset
document.getElementById('save').addEventListener('click', () => {
  // Logic to save line assignments, e.g., to localStorage or server
  alert('Line assignments saved!');
});

document.getElementById('reset').addEventListener('click', () => {
  // Reset line assignments logic
  alert('Line assignments reset!');
});
