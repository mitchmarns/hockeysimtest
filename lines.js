import { teams } from './team.js';

document.addEventListener('DOMContentLoaded', () => {
  const teamSelect = document.getElementById('team-select');
  const playersContainer = document.getElementById('available-players');
  let players = [];

  // Load teams from `team.js` or `localStorage`
  const savedTeams = JSON.parse(localStorage.getItem('teams')) || teams;

  if (!localStorage.getItem('teams')) {
    localStorage.setItem('teams', JSON.stringify(savedTeams));
  }

  // Populate the team dropdown and initialize the selected team
  savedTeams.forEach((team, index) => {
    const option = document.createElement('option');
    option.value = index;  // Value is the index of the team
    option.textContent = team.name;
    teamSelect.appendChild(option);
  });

  // Ensure selected team is stored in localStorage and update players
  const initialTeamIndex = parseInt(localStorage.getItem('selectedTeamIndex'), 10) || 0;
  teamSelect.value = initialTeamIndex; // Set the dropdown to the saved team index
  const initialTeamName = savedTeams[initialTeamIndex]?.name || '';
  
  updateAvailablePlayers(players, initialTeamName);

  // Fetch and display available players
  fetch('./players.json')
    .then(response => response.json())
    .then(playersData => {
      console.log('Players data:', playersData);
      players = playersData.players;

      // Check and assign the correct team to each player
    players.forEach(player => {
      if (!player.team) {
        // If a player has no team, try to assign it by finding the correct team
        const team = savedTeams.find(t => t.players.some(p => p.id === player.id));
        player.team = team ? team.name : null;
      }
    });

    // Save the updated players back to localStorage
    localStorage.setItem('players', JSON.stringify(players));

      // Load players from localStorage if they exist
      const savedPlayers = JSON.parse(localStorage.getItem('players')) || players;
      players = savedPlayers; // Assign saved players

      if (Array.isArray(players)) {
        // Initial population for the first team
        updateAvailablePlayers(players, initialTeamName);
        loadLineAssignments(initialTeamName);
        makeSlotsDroppable(players);

        // Update players list when a new team is selected
        teamSelect.addEventListener('change', () => {
          const selectedTeamIndex = parseInt(teamSelect.value, 10);
          const currentTeamName = savedTeams[selectedTeamIndex]?.name || '';
          console.log('Loading lines for team:', currentTeamName);

          // Save the line assignments for the previous team before changing
          const previousTeamIndex = parseInt(localStorage.getItem('selectedTeamIndex'), 10);
          const previousTeamName = savedTeams[previousTeamIndex]?.name || '';
          saveLineAssignments(previousTeamName); // Save the previous team lines
        
          // Update localStorage for the new team
          localStorage.setItem('selectedTeamIndex', selectedTeamIndex);
        
          // Clear player slots for the previous team
          clearPlayerSlots();
        
          // Update available players for selected team
          updateAvailablePlayers(players, currentTeamName);
        
          // Load the line assignments for the selected team
          loadLineAssignments(currentTeamName);
        
          // Reinitialize droppable slots for the new team
          makeSlotsDroppable(players);
        });
      }
    });
        
  // Function to clear player slots
  function clearPlayerSlots() {
  const playerSlots = document.querySelectorAll('.player-slot');
  console.log('Clearing player slots:', playerSlots);
    
    playerSlots.forEach(slot => {
      slot.textContent = slot.getAttribute('data-position');
      slot.removeAttribute('data-id');
      slot.removeAttribute('data-assigned');
      slot.style.backgroundColor = '';
      slot.classList.remove('assigned');
    });
  }

  // Save line assignments
  function saveLineAssignments(teamName) {
    if (!teamName) {
    console.error('Invalid team name in saveLineAssignments');
    return;
  }
    
    const playerSlots = document.querySelectorAll('.player-slot');
    const lineAssignments = {};

    playerSlots.forEach(slot => {
      const playerId = slot.getAttribute('data-id');
      const position = slot.getAttribute('data-position');
      if (playerId) {
        lineAssignments[position] = parseInt(playerId, 10);
      }
    });

    const savedLines = JSON.parse(localStorage.getItem('lineAssignments')) || {};
    savedLines[teamName] = lineAssignments;
    localStorage.setItem('lineAssignments', JSON.stringify(savedLines));
    console.log(`Saved line assignments for ${teamName}:`, lineAssignments);
  }

  // Load line assignments
  function loadLineAssignments(teamName) {
    const savedLines = JSON.parse(localStorage.getItem('lineAssignments')) || {};
    console.log('Loaded line assignments:', savedLines);
    const lineAssignments = savedLines[teamName] || {};
    console.log('Loaded line assignments for ' + teamName + ":", lineAssignments);

    const playerSlots = document.querySelectorAll('.player-slot');
    clearPlayerSlots(); // Clear current assignments

    console.log('Player slots to update:', playerSlots);
    console.log("Loaded line assignments for " + teamName + ":", lineAssignments);

    Object.entries(lineAssignments).forEach(([position, playerId]) => {
      const slot = Array.from(playerSlots).find(
        s => s.getAttribute('data-position') === position
      );
      const player = players.find(p => p.id === playerId);

      console.log('Found player:', player);

      if (slot && player) {
        slot.textContent = `${player.name} (${player.position})`;
        slot.classList.add('assigned');
        slot.setAttribute('data-id', player.id);
      } else {
      console.error('Player or slot not found for position:', position);
      }
    });
  }

  // Function to update the available players list
  function updateAvailablePlayers(players, selectedTeamName) {
    console.log('Selected team:', selectedTeamName);
    playersContainer.innerHTML = ''; // Clear existing players

    // Find the selected team object from the teams array
  const selectedTeam = savedTeams.find(team => team.name === selectedTeamName);
  if (!selectedTeam) {
    console.error(`Team not found: ${selectedTeamName}`);
    return;
  }

// Filter players based on their team property
  const teamPlayers = players.filter(player => player.team === selectedTeamName);
  console.log('Filtered players:', teamPlayers);

  if (teamPlayers.length === 0) {
    const noPlayersMessage = document.createElement('div');
    noPlayersMessage.textContent = 'No players available for this team.';
    playersContainer.appendChild(noPlayersMessage);
  } else {
    teamPlayers.forEach(player => {
      const playerDiv = createPlayerElement(player);
      playersContainer.appendChild(playerDiv);
    });
  }
}

  // Make slots droppable only for players of the selected team
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

        // Get dragged player data
        const playerId = event.dataTransfer.getData('playerId');
        const playerPosition = event.dataTransfer.getData('playerPosition');
        const slotPosition = slot.getAttribute('data-position');

        // Get selected team from dropdown
        const selectedTeamIndex = parseInt(teamSelect.value, 10);
        const selectedTeam = savedTeams[selectedTeamIndex];

        console.log('Selected team:', selectedTeam); // Debug log

        if (!selectedTeam) {
          console.error('Selected team is undefined.');
          return; // Prevent further execution if the selected team is invalid
        }

        // Find the player in the list
        const player = players.find(p => p.id.toString() === playerId);

        if (!player) {
          alert('Player not found.');
          return;
        }

        // Check if the player belongs to the selected team
        if (player.team !== selectedTeam.name) {
          alert(`Player cannot be placed in this team's lines.`);
          slot.style.backgroundColor = ''; // Reset the slot background
          return;
        }

        // Check if player position matches the slot
        if (playerPosition !== slotPosition) {
          alert('Player cannot be placed in this position!');
          slot.style.backgroundColor = ''; // Reset the slot background
          return;
        }

        // Assign player to the slot visually
        slot.textContent = `${player.name} (${player.position})`;
        slot.classList.add('assigned');
        slot.setAttribute('data-id', player.id);
        slot.style.backgroundColor = '';

        // Disable the slot to prevent multiple assignments
        slot.setAttribute('data-assigned', 'true');
        
        // Enable the player to be dragged again
        makePlayerDraggable(slot);
        
      });
    });
  }
// Function to handle removing the player from the assigned slot and adding back to available players
function removePlayerFromSlot(slot, player, selectedTeam) {
  // Remove the player from the assigned slot
  slot.textContent = `${player.position} - ${player.name}`;
  slot.classList.remove('assigned');
  slot.removeAttribute('data-id');
  slot.removeAttribute('data-assigned');

  // Add the player back to the list of available players
  updateAvailablePlayers(players, selectedTeam.name); // Ensure list is updated

  // Re-enable droppable behavior for the slot
  makeSlotsDroppable(players); // Ensure droppable behavior is still active
}
  
    // Draggable player element
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
  
  // Function to make the player element draggable
function makePlayerDraggable(slot) {
  const playerId = slot.getAttribute('data-id');
  const player = players.find(p => p.id.toString() === playerId);
  
  if (!player) return;

  slot.draggable = true;

  slot.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('playerId', player.id);
    event.dataTransfer.setData('playerPosition', player.position);
    slot.style.opacity = '0.5'; // To show that it is being dragged
  });

   slot.addEventListener('dragend', () => {
    slot.style.opacity = '1'; // Reset opacity when drag ends
  });
}

  // Remove the player from the assigned slot
  slot.textContent = `${player.position} - ${player.name}`;
  slot.classList.remove('assigned');
  slot.removeAttribute('data-id');
  slot.removeAttribute('data-assigned');

  // Add the player back to the list of available players
  updateAvailablePlayers(players, selectedTeam.name); // Ensure list is updated
  makeSlotsDroppable(players); // Ensure droppable behavior is still active
}

    return playerDiv;
  }

    });
                
