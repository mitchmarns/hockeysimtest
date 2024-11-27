fetch('./players.json')
  .then(response => response.json())
  .then(playersData => {
      console.log(playersData);
    const players = playersData.players; // Access the players array
    console.log(players);  // Log the array to verify it's correct

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


    // Create player elements for the drag-and-drop area
      players.forEach(player => {
        const playerDiv = createPlayerElement(player);
        playersContainer.appendChild(playerDiv);
      });

  // Load saved teams
  const savedTeams = localStorage.getItem('teams');

  if (savedTeams) {
    const teams = JSON.parse(savedTeams);
    console.log('Loaded teams:', teams);

    // Use this data to populate the lines with already assigned players
        populateLines(teams);
      } else {
        console.error('No team data found in localStorage.');
      }
    })
    .catch(error => {
      console.error('Error loading player data:', error);
    });
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

// Function to handle slots being droppable
function makeSlotsDroppable() {
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

      // Find the player by ID
      const player = playersData.find(p => p.id == playerId);
      if (player && playerPosition === slot.getAttribute('data-position')) {
        // Assign player to the slot
        slot.textContent = `${player.name} (${player.position})`;
        slot.classList.add('assigned');
        player.assigned = true;  // Mark as assigned

        // Optionally, store the updated data in localStorage
        updateTeamsWithAssignments();
      } else {
        alert("Player cannot be placed in this slot!");
      }

      slot.style.backgroundColor = '';  // Reset the slot's background color
    });
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
