document.addEventListener('DOMContentLoaded', () => {
  const playersContainer = document.getElementById('available-players');
  const teamSelect = document.getElementById('team-select');
  const autoAssignButton = document.getElementById('auto-assign');
  const linesContainer = document.getElementById('lines-container');
  let players = [];
  let teams = [];

  // Fetch players and teams data from localStorage (or JSON file if needed)
  const savedTeams = localStorage.getItem('teams');
  if (savedTeams) {
    teams = JSON.parse(savedTeams);
    // Populate team selector
    populateTeamSelector(teams);
  } else {
    console.error('No team data found in localStorage.');
  }

  // Load players (you may fetch them from a file or use a static list)
  fetch('./players.json')
    .then(response => response.json())
    .then(data => {
      players = data.players;
      populateAvailablePlayers(players);
    })
    .catch(error => console.error('Error loading player data:', error));

  // Function to populate available players list
  function populateAvailablePlayers(players) {
    playersContainer.innerHTML = ''; // Clear current content
    players.forEach(player => {
      const playerDiv = createPlayerElement(player);
      playersContainer.appendChild(playerDiv);
    });
  }

  // Function to create a draggable player element
  function createPlayerElement(player) {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.textContent = `${player.name} - ${player.position}`;
    playerDiv.draggable = true;
    playerDiv.setAttribute('data-id', player.id);
    playerDiv.setAttribute('data-position', player.position);

    // Add dragstart event
    playerDiv.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('playerId', player.id);
      event.dataTransfer.setData('playerPosition', player.position);
    });

    return playerDiv;
  }

  // Function to populate the team selector dropdown
  function populateTeamSelector(teams) {
    teamSelect.innerHTML = ''; // Clear the current options
    teams.forEach(team => {
      const option = document.createElement('option');
      option.value = team.name;
      option.textContent = team.name;
      teamSelect.appendChild(option);
    });

    // Automatically populate lines when a team is selected
    teamSelect.addEventListener('change', () => {
      const selectedTeam = teamSelect.value;
      if (selectedTeam) {
        const team = teams.find(t => t.name === selectedTeam);
        if (team) {
          populateLines(team);
        }
      }
    });
  }

  // Function to populate lines with players for the selected team
  function populateLines(team) {
    // Clear existing lines
    const lines = document.querySelectorAll('.line, .goalie-line');
    lines.forEach(line => {
      const slots = line.querySelectorAll('.player-slot');
      slots.forEach(slot => {
        slot.textContent = slot.getAttribute('data-position'); // Reset the slot
        slot.classList.remove('assigned');
      });
    });

    // Populate the lines based on the selected team's players
    team.players.forEach(player => {
      const slot = document.querySelector(`[data-position="${player.position}"]`);
      if (slot) {
        slot.textContent = `${player.name} (${player.position})`;
        slot.classList.add('assigned');
      }
    });
  }

  // Make player slots droppable
  function makeSlotsDroppable() {
    const playerSlots = document.querySelectorAll('.player-slot');
    playerSlots.forEach(slot => {
      slot.addEventListener('dragover', (event) => {
        event.preventDefault();
        slot.style.backgroundColor = 'rgba(0, 128, 0, 0.2)';  // Highlight
      });

      slot.addEventListener('dragleave', () => {
        slot.style.backgroundColor = '';  // Reset highlight
      });

      slot.addEventListener('drop', (event) => {
        event.preventDefault();

        const playerId = event.dataTransfer.getData('playerId');
        const playerPosition = event.dataTransfer.getData('playerPosition');
        const player = players.find(p => p.id === playerId);

        if (player && player.position === playerPosition) {
          slot.textContent = `${player.name} (${player.position})`;
          slot.classList.add('assigned');
          updateTeamsWithAssignments();
        } else {
          alert("Player can't be placed here!");
        }
      });
    });
  }

  // Button to auto-assign players to lines
  autoAssignButton.addEventListener('click', () => {
    const selectedTeam = teamSelect.value;
    const team = teams.find(t => t.name === selectedTeam);
    if (team) {
      autoAssignPlayersToLines(team);
    }
  });

  // Function to auto-assign players to lines
  function autoAssignPlayersToLines(team) {
    // Reset all lines first
    const lines = document.querySelectorAll('.line, .goalie-line');
    lines.forEach(line => {
      const slots = line.querySelectorAll('.player-slot');
      slots.forEach(slot => {
        slot.textContent = slot.getAttribute('data-position');
        slot.classList.remove('assigned');
      });
    });

    // Automatically assign players to positions (this logic can be adjusted)
    team.players.forEach(player => {
      const slot = document.querySelector(`[data-position="${player.position}"]`);
      if (slot) {
        slot.textContent = `${player.name} (${player.position})`;
        slot.classList.add('assigned');
      }
    });
  }

  // Function to update the teams with assigned players and save to localStorage
  function updateTeamsWithAssignments() {
    const teams = [];

    // Collect teams' player assignments (based on the assigned slots)
    const lines = document.querySelectorAll('.line, .goalie-line');
    lines.forEach(line => {
      const teamPlayers = [];
      const playerSlots = line.querySelectorAll('.player-slot.assigned');

      playerSlots.forEach(slot => {
        const playerId = slot.getAttribute('data-id');
        const playerName = slot.textContent;
        const playerPosition = slot.getAttribute('data-position');
        teamPlayers.push({ id: playerId, name: playerName, position: playerPosition });
      });

      // Save each team with their players
      teams.push({ line: line.id, players: teamPlayers });
    });

    // Save teams to localStorage
    localStorage.setItem('teams', JSON.stringify(teams));
    console.log('Teams updated and saved to localStorage.');
  }

  // Call function to make slots droppable
  makeSlotsDroppable();
});
