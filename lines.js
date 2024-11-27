document.addEventListener('DOMContentLoaded', () => {
  const teamSelect = document.getElementById('team-select');
  if (Array.isArray(teams) && teams.length > 0) {
    // Populate the dropdown with team names
    teams.forEach((team, index) => {
      const option = document.createElement('option');
      option.value = index; // Use index to identify the team
      option.textContent = team.name; // Display the team name
      teamSelect.appendChild(option);
    });

    console.log('Team dropdown populated with:', teams);
  } else {
    console.error('No teams available in the teams array.');
  }

  // Handle team selection
  teamSelect.addEventListener('change', () => {
    const selectedIndex = teamSelect.value;
    if (selectedIndex !== "") {
      const selectedTeam = teams[selectedIndex];
      console.log(`Selected Team:`, selectedTeam);
      // Add logic here to handle selected team (e.g., populate lines or assign players)
    }
  });
});

  const playersContainer = document.getElementById('available-players');

  // Fetch the players data from the JSON file
  fetch('./players.json')
    .then(response => response.json())
    .then(playersData => {
      const players = playersData.players; // Access the players array
      if (Array.isArray(players)) {
        players.forEach(player => {
          const playerDiv = createPlayerElement(player);
          playersContainer.appendChild(playerDiv);
        });

        // Make slots droppable after players are loaded
        makeSlotsDroppable(players);
      } else {
        console.error('Expected an array of players, but got:', players);
      }
    })
    .catch(error => console.error('Error loading player data:', error));

  // Load teams from localStorage
  const savedTeams = localStorage.getItem('teams');
  if (savedTeams) {
    const teams = JSON.parse(savedTeams);

    // Populate the team dropdown
    teams.forEach((team, index) => {
      const option = document.createElement('option');
      option.value = index; // Use index as the key
      option.textContent = `Team ${index + 1}`; // Example team name
      teamSelect.appendChild(option);
    });

    // Populate lines when a team is selected
    teamSelect.addEventListener('change', () => {
      const selectedTeamIndex = teamSelect.value;
      const selectedTeam = teams[selectedTeamIndex];
      if (selectedTeam) {
        populateLines([selectedTeam]);
      }
    });

    // Auto-Assign Button
    const autoAssignButton = document.createElement('button');
    autoAssignButton.textContent = 'Auto-Assign Players';
    document.body.appendChild(autoAssignButton);

    autoAssignButton.addEventListener('click', () => {
      if (teams.length) {
        populateLines(teams);
      } else {
        alert('No saved teams found to auto-assign.');
      }
    });
  } else {
    console.error('No team data found in localStorage.');
  }

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

  // Function to populate the lines
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
});
