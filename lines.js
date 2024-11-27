import { teams as definedTeams } from './team.js';

document.addEventListener('DOMContentLoaded', () => {
  const teamSelect = document.getElementById('team-select');
  const playersContainer = document.getElementById('available-players');

  // Load teams from `team.js` or `localStorage`
  const savedTeams = JSON.parse(localStorage.getItem('teams')) || definedTeams;

  // Save back to localStorage if loading from `team.js`
  if (!localStorage.getItem('teams')) {
    localStorage.setItem('teams', JSON.stringify(savedTeams));
  }

  // Populate the team dropdown
  if (Array.isArray(savedTeams) && savedTeams.length > 0) {
    savedTeams.forEach((team, index) => {
      const option = document.createElement('option');
      option.value = index; // Use index as the key
      option.textContent = team.name; // Display team name
      teamSelect.appendChild(option);
    });

    console.log('Team dropdown populated with:', savedTeams);
  } else {
    console.error('No teams available to populate the dropdown.');
  }

  // Handle team selection
  teamSelect.addEventListener('change', () => {
    const selectedIndex = teamSelect.value;
    if (selectedIndex !== "") {
      const selectedTeam = savedTeams[selectedIndex];
      console.log(`Selected Team:`, selectedTeam);
      populateLines(selectedTeam.players); // Populate lines for the selected team
    }
  });

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

  // Auto-Assign Button
  const autoAssignButton = document.createElement('button');
  autoAssignButton.textContent = 'Auto-Assign Players';
  document.body.appendChild(autoAssignButton);

  autoAssignButton.addEventListener('click', () => {
    if (savedTeams.length) {
      savedTeams.forEach(team => populateLines(team.players));
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

  // Function to populate the lines
  function populateLines(players) {
    const slots = document.querySelectorAll('.player-slot');
    slots.forEach(slot => {
      // Reset slot to its default state
      slot.textContent = slot.getAttribute('data-position');
      slot.classList.remove('assigned');
      slot.removeAttribute('data-id');
    });

    players.forEach(player => {
      const slot = document.querySelector(`[data-position="${player.position}"]`);
      if (slot) {
        slot.textContent = `${player.name} (${player.position})`;
        slot.classList.add('assigned');
        slot.setAttribute('data-id', player.id);
      }
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
