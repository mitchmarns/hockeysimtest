// Utility function to create a player element
function createPlayerElement(player) {
  const playerDiv = document.createElement('div');
  playerDiv.classList.add('player');
  playerDiv.dataset.id = player.id;
  playerDiv.textContent = `${player.name} (${player.position})`;
  return playerDiv;
}

// Assign Power Play (PP) and Penalty Kill (PK) units
function assignSpecialTeams(players, lineAssignments) {
  const pp1 = [];
  const pp2 = [];
  const pk1 = [];
  const pk2 = [];

  // Filter assigned players
  const assignedPlayers = players.filter(player => player.team && !player.injured);

  // Group players by position
  const forwards = assignedPlayers.filter(player => player.position !== 'D').sort((a, b) => b.scoring - a.scoring);
  const defensemen = assignedPlayers.filter(player => player.position === 'D').sort((a, b) => b.defense - a.defense);

  // Assign PP units
  pp1.push(...forwards.slice(0, 3), ...defensemen.slice(0, 2)); // Top 3 forwards and 2 defensemen
  pp2.push(...forwards.slice(3, 6), ...defensemen.slice(2, 4)); // Next 3 forwards and 2 defensemen

  // Assign PK units
  pk1.push(...forwards.slice(0, 2), ...defensemen.slice(0, 2)); // Best defensive forwards and defensemen
  pk2.push(...forwards.slice(2, 4), ...defensemen.slice(2, 4)); // Next-best defensive forwards and defensemen

  return { PP1: pp1, PP2: pp2, PK1: pk1, PK2: pk2 };
}

// Render the special teams on the page
function renderSpecialTeams(specialTeams) {
  const pp1Container = document.getElementById('powerplay1');
  const pp2Container = document.getElementById('powerplay2');
  const pk1Container = document.getElementById('penaltykill1');
  const pk2Container = document.getElementById('penaltykill2');

  // Helper to populate a container with players
  function populateContainer(container, players) {
    container.innerHTML = ''; // Clear the container
    players.forEach(player => {
      const playerDiv = createPlayerElement(player);
      container.appendChild(playerDiv);
    });
  }

  populateContainer(pp1Container, specialTeams.PP1);
  populateContainer(pp2Container, specialTeams.PP2);
  populateContainer(pk1Container, specialTeams.PK1);
  populateContainer(pk2Container, specialTeams.PK2);
}

// Initialize the special teams page
document.addEventListener('DOMContentLoaded', () => {
  // Retrieve players and line assignments from LocalStorage
  const players = JSON.parse(localStorage.getItem('teamPlayers')) || [];
  const lineAssignments = JSON.parse(localStorage.getItem('lineAssignments')) || {};

  // Assign special teams
  const specialTeams = assignSpecialTeams(players, lineAssignments);

  // Render the special teams
  renderSpecialTeams(specialTeams);

  // Make players draggable (optional for manual adjustments)
  makePlayersDraggable();
  makeSlotsDroppable();
});

// Enable drag-and-drop for manual adjustments (optional)
function makePlayersDraggable() {
  const playerElements = document.querySelectorAll('.player');
  playerElements.forEach(player => {
    player.setAttribute('draggable', true);

    player.addEventListener('dragstart', event => {
      event.dataTransfer.setData('playerId', player.dataset.id);
    });
  });
}

function makeSlotsDroppable() {
  const slots = document.querySelectorAll('.pp-unit, .pk-unit');
  slots.forEach(slot => {
    slot.addEventListener('dragover', event => {
      event.preventDefault();
    });

    slot.addEventListener('drop', event => {
      const playerId = event.dataTransfer.getData('playerId');
      const player = players.find(p => p.id === parseInt(playerId, 10));
      if (player) {
        // Move the player to the new slot
        slot.appendChild(createPlayerElement(player));
        // Save updates to LocalStorage
        saveSpecialTeamAssignments();
      }
    });
  });
}

// Save special team assignments back to LocalStorage
function saveSpecialTeamAssignments() {
  const pp1 = Array.from(document.getElementById('powerplay1').children).map(el => el.dataset.id);
  const pp2 = Array.from(document.getElementById('powerplay2').children).map(el => el.dataset.id);
  const pk1 = Array.from(document.getElementById('penaltykill1').children).map(el => el.dataset.id);
  const pk2 = Array.from(document.getElementById('penaltykill2').children).map(el => el.dataset.id);

  const specialTeams = { PP1: pp1, PP2: pp2, PK1: pk1, PK2: pk2 };
  localStorage.setItem('specialTeams', JSON.stringify(specialTeams));
}
