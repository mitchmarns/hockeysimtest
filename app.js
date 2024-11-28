document.addEventListener('DOMContentLoaded', () => {
  const saveLinesBtn = document.getElementById('save-lines-btn');
  const resetLinesBtn = document.getElementById('reset-lines-btn');
  const teamSelect = document.getElementById('team-select');
  const playerContainer = document.getElementById('player-container');
  let teams = JSON.parse(localStorage.getItem('teams')) || [];
  let players = [];

  // Fetch players from players.json
  fetch('players.json')
    .then(response => response.json())
    .then(data => {
      players = data.players;
      initializePage();
    });

  // Initialize the page after players are loaded
  function initializePage() {
    // Populate team dropdown
    teams.forEach((team, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = team.name;
      teamSelect.appendChild(option);
    });

    // Set initial team based on localStorage or default to the first team
    const initialTeamIndex = parseInt(localStorage.getItem('selectedTeamIndex'), 10) || 0;
    teamSelect.value = initialTeamIndex;
    const initialTeamName = teams[initialTeamIndex]?.name;
    updatePlayerAssignments(initialTeamName);

    // Event listener to update players when a new team is selected
    teamSelect.addEventListener('change', () => {
      const selectedTeamIndex = parseInt(teamSelect.value, 10);
      const selectedTeamName = teams[selectedTeamIndex]?.name;
      localStorage.setItem('selectedTeamIndex', selectedTeamIndex);
      updatePlayerAssignments(selectedTeamName);
    });
  }

  // Update player assignments based on the selected team
  function updatePlayerAssignments(teamName) {
    playerContainer.innerHTML = ''; // Clear previous player assignments
    const selectedTeam = teams.find(team => team.name === teamName);
    if (!selectedTeam) return;

    const teamPlayers = players.filter(player => player.team === teamName);

    teamPlayers.forEach(player => {
      const playerBox = createPlayerBox(player, teamName);
      playerContainer.appendChild(playerBox);
    });
  }

  // Create a player box with a dropdown for line assignments
  function createPlayerBox(player, teamName) {
    const playerBox = document.createElement('div');
    playerBox.classList.add('player-box');

    const playerName = document.createElement('div');
    playerName.textContent = `${player.name} (${player.position})`;
    playerBox.appendChild(playerName);

    // Line dropdown
    const lineDropdown = document.createElement('select');
    lineDropdown.classList.add('player-dropdown');
    const positions = ['1st Line', '2nd Line', '3rd Line', '4th Line'];

    positions.forEach(line => {
      const option = document.createElement('option');
      option.value = line;
      option.textContent = line;
      lineDropdown.appendChild(option);
    });

    playerBox.appendChild(lineDropdown);

    // Set previous line assignment if exists in localStorage
    const savedAssignments = JSON.parse(localStorage.getItem('lineAssignments')) || {};
    const playerLine = savedAssignments[player.id];
    if (playerLine) {
      lineDropdown.value = playerLine;
    }

    return playerBox;
  }

  // Save line assignments to localStorage
  saveLinesBtn.addEventListener('click', () => {
    const savedAssignments = {};

    // Get all player assignments
    const playerBoxes = document.querySelectorAll('.player-box');
    playerBoxes.forEach(box => {
      const playerName = box.querySelector('div').textContent;
      const playerId = players.find(p => p.name === playerName).id;
      const selectedLine = box.querySelector('select').value;
      savedAssignments[playerId] = selectedLine;
    });

    localStorage.setItem('lineAssignments', JSON.stringify(savedAssignments));
    alert('Line assignments saved!');
  });

  // Reset line assignments
  resetLinesBtn.addEventListener('click', () => {
    const playerBoxes = document.querySelectorAll('.player-box');
    playerBoxes.forEach(box => {
      const lineDropdown = box.querySelector('select');
      lineDropdown.value = '1st Line';  // Reset to default line
    });

    localStorage.removeItem('lineAssignments');
    alert('Line assignments reset!');
  });
});
