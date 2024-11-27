document.addEventListener('DOMContentLoaded', () => {
  const savedTeams = localStorage.getItem('teams');
  if (savedTeams) {
    teams = JSON.parse(savedTeams);
    displayTeams();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const savedTeams = localStorage.getItem('teams');

  if (savedTeams) {
    const teams = JSON.parse(savedTeams);
    console.log('Loaded teams:', teams);

    // Use this data to populate the drag-and-drop UI
    populateLines(teams);
  } else {
    console.error('No team data found in localStorage.');
  }
});

// Function to populate the lines based on saved teams
function populateLines(teams) {
  teams.forEach(team => {
    team.players.forEach(player => {
      const playerDiv = document.createElement('div');
      playerDiv.classList.add('player');
      playerDiv.textContent = `${player.name} (${player.position})`;
      playerDiv.draggable = true;

      // Append playerDiv to the appropriate team section or roster
      // You can customize this to fit your UI structure
      document.getElementById('roster-container').appendChild(playerDiv);
    });
  });
}
