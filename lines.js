document.addEventListener('DOMContentLoaded', () => {
  // Fetch the players data from the JSON file
  fetch('./players.json')
    .then(response => response.json())
    .then(playersData => {
      const players = playersData.players; // Access the players array
      const playersContainer = document.getElementById('available-players'); // Ensure you have the container
      const teamSelect = document.getElementById('team-select');

      if (Array.isArray(players)) {
        players.forEach(player => {
          const playerDiv = createPlayerElement(player);
          playersContainer.appendChild(playerDiv);
        });
      } else {
        console.error('Expected an array of players, but got:', players);
      }

      // Make slots droppable after players are loaded
      makeSlotsDroppable(players);
    })
    .catch(error => {
      console.error('Error loading player data:', error);
    });

  // Load teams from localStorage
  const savedTeams = localStorage.getItem('teams');
  if (savedTeams) {
    const teams = JSON.parse(savedTeams);

  // Create an auto-assign button
  const autoAssignButton = document.createElement('button');
  autoAssignButton.textContent = 'Auto-Assign Players';
  document.body.appendChild(autoAssignButton);

  // Event listener for auto-assign
  autoAssignButton.addEventListener('click', () => {
    const savedTeams = localStorage.getItem('teams');
    if (savedTeams) {
      const teams = JSON.parse(savedTeams);
      populateLines(teams);
    } else {
      alert('No saved teams found to auto-assign.');
    }
  });

  // Function to create a draggable player element
  function createPlayerElement(player) {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.textContent = `${player.name} - ${player.position}`;
    playerDiv.draggable = true;
    playerDiv.setAttribute('data-id', player.id);
    playerDiv.setAttribute('data-position', player.position);

    // Add dragstart event to the player element
    playerDiv.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('playerId', player.id);
      event.dataTransfer.setData('playerPosition', player.position);
    });

    return playerDiv;
  }

  // Function to populate the lines based on saved teams
  function populateLines(teams) {
    // Clear existing assignments before populating
    const slots = document.querySelectorAll('.player-slot');
    slots.forEach(slot => {
      slot.textContent = slot.getAttribute('data-position');
      slot.classList.remove('assigned');
      slot.removeAttribute('data-id');
    });

    teams.forEach(team => {
      team.players.forEach(player => {
        const slot = document.querySelector(`[data-position="${player.position}"]`);
        if (slot) {
          slot.textContent = `${player.name} (${player.position})`;
          slot.classList.add('assigned');
          slot.setAttribute('data-id', player.id);
          const option = document.createElement('option');
          option.value = index; // Use index or a unique team identifier
          option.textContent = `Team ${index + 1}`;
          teamSelect.appendChild(option);
        }
      });
    });
  }

  / Populate lines when a team is selected
    teamSelect.addEventListener('change', () => {
      const selectedTeamIndex = teamSelect.value;
      const selectedTeam = teams[selectedTeamIndex];
      if (selectedTeam) {
        populateLines([selectedTeam]); // Populate lines for the selected team
      }
    });
  } else {
    console.error('No team data found in localStorage.');
  }

  // Function to populate the lines based on a team
  function populateLines(teams) {
    // Clear existing assignments before populating
    const slots = document.querySelectorAll('.player-slot');
    slots.forEach(slot => {
      slot.textContent = slot.getAttribute('data-position'); // Reset to default position
      slot.classList.remove('assigned');
      slot.removeAttribute('data-id');
    });

    teams.forEach(team => {
      team.players.forEach(player => {
        const slot = document.querySelector(`[data-position="${player.position}"]`);
        if (slot) {
          slot.textContent = `${player.name} (${player.position})`;
          slot.classList.add('assigned');
          slot.setAttribute('data-id', player.id);
        }
      });
    });
  }

  // Function to make slots droppable
  function makeSlotsDroppable(players) {
    const playerSlots = document.querySelectorAll('.player-slot');
    playerSlots.forEach(slot => {
      slot.addEventListener('dragover', (event) => {
        event.preventDefault();
        slot.style.backgroundColor = 'rgba(0, 128, 0, 0.2)';
      });

      slot.addEventListener('dragleave', () => {
        slot.style.backgroundColor = '';
      });

      slot.addEventListener('drop', (event) => {
        event.preventDefault();
        const playerId = event.dataTransfer.getData('playerId');
        const playerPosition = event.dataTransfer.getData('playerPosition');
        const slotPosition = slot.getAttribute('data-position');

        const player = players.find(p => p.id.toString() === playerId);

        if (player && playerPosition === slotPosition) {
          slot.textContent = `${player.name} (${player.position})`;
          slot.classList.add('assigned');
          slot.setAttribute('data-id', player.id);
        } else {
          alert('Player cannot be placed in this slot!');
        }

        slot.style.backgroundColor = '';
      });
    });
  }

  // Function to update teams in localStorage
  function updateTeamsWithAssignments() {
    const teams = [];

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

      teams.push({ line: line.id, players: teamPlayers });
    });

    localStorage.setItem('teams', JSON.stringify(teams));
    console.log('Teams updated and saved to localStorage.');
  }
});
