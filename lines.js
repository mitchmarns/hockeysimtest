document.addEventListener('DOMContentLoaded', () => {
  // Fetch the players data from the JSON file
  fetch('./players.json')
    .then(response => response.json())
    .then(playersData => {
      const players = playersData.players; // Access the players array
      const playersContainer = document.getElementById('available-players'); // Ensure you have the container

      if (Array.isArray(players)) {
        players.forEach(player => {
          const playerDiv = createPlayerElement(player);
          playersContainer.appendChild(playerDiv);
        });
      } else {
        console.error('Expected an array of players, but got:', players);
      }
    })
    .catch(error => {
      console.error('Error loading player data:', error);
    });

  // Load saved teams
  const savedTeams = localStorage.getItem('teams');
  if (savedTeams) {
    const teams = JSON.parse(savedTeams);
    console.log('Loaded teams:', teams);
    populateLines(teams);
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
      event.dataTransfer.setData('playerId', event.target.getAttribute('data-id'));
      event.dataTransfer.setData('playerPosition', event.target.getAttribute('data-position'));
    });

    return playerDiv;
  }

  // Function to populate the lines based on saved teams
  function populateLines(teams) {
    teams.forEach(team => {
      team.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.textContent = `${player.name} (${player.position})`;
        playerDiv.setAttribute('data-id', player.id);
        playerDiv.setAttribute('data-position', player.position);

        // Append player to the appropriate line slot
        const slot = document.querySelector(`[data-position="${player.position}"]`);
        if (slot) {
          slot.textContent = `${player.name} (${player.position})`;
          slot.classList.add('assigned');
        }
      });
    });
  }

  // Make slots droppable
  const playerSlots = document.querySelectorAll('.player-slot');
  playerSlots.forEach(slot => {
    slot.addEventListener('dragover', (event) => {
      event.preventDefault();  // Allow dropping
      slot.style.backgroundColor = 'rgba(0, 128, 0, 0.2)';  // Highlight the slot
    });

    slot.addEventListener('dragleave', () => {
      slot.style.backgroundColor = '';  // Reset the slot's background color
    });

    slot.addEventListener('drop', (event) => {
      event.preventDefault();
      const playerId = event.dataTransfer.getData('playerId');
      const playerPosition = event.dataTransfer.getData('playerPosition');
      const slotPosition = slot.getAttribute('data-position');

      // Debugging logs to check values
  console.log('Player Position:', playerPosition);
  console.log('Slot Position:', slotPosition);

  // Check if player position matches slot position
  if (playerPosition === slotPosition) {
    const player = findPlayerById(playerId);  // Retrieve player data based on ID

    if (player) {
      // Assign player to the slot
      slot.textContent = `${player.name} (${player.position})`;
      slot.classList.add('assigned');
      player.assigned = true;  // Mark the player as assigned (or do any further handling)
      updateTeamsWithAssignments();  // Update teams in localStorage
    }
  } else {
    // If the positions do not match, show an alert (you can customize this behavior)
    alert("Player cannot be placed in this slot!");
    console.log(`Player with position ${playerPosition} cannot be placed in ${slotPosition} slot.`);
  }
        slot.style.backgroundColor = '';  // Reset the slot's background color
});

      // Find the player by ID (you can use playersData or any other method)
      const player = findPlayerById(playerId);  // Add a helper function to find player by ID
      if (player && playerPosition === slot.getAttribute('data-position')) {
        // Assign player to the slot
        slot.textContent = `${player.name} (${player.position})`;
        slot.classList.add('assigned');
        player.assigned = true;  // Mark as assigned (or store in your teams array)
        updateTeamsWithAssignments();  // Update teams with this new assignment
      } else {
        alert("Player cannot be placed in this slot!");
      }

      slot.style.backgroundColor = '';  // Reset the slot's background color
    });
  });

  // Function to find a player by ID (if necessary)
  function findPlayerById(playerId) {
    const playersContainer = document.getElementById('available-players');
    const players = playersContainer.querySelectorAll('.player');
    for (let player of players) {
      if (player.getAttribute('data-id') === playerId) {
        return {
          id: player.getAttribute('data-id'),
          name: player.textContent,
          position: player.getAttribute('data-position')
        };
      }
    }
    return null; // Player not found
  }

  // Function to update teams in localStorage
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

});
