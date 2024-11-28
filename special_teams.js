// Utility function to create a player element
function createPlayerElement(player) {
  const playerDiv = document.createElement('div');
  playerDiv.classList.add('player');
  playerDiv.dataset.id = player.id;
  playerDiv.textContent = `${player.name} (${player.position})`;
  return playerDiv;
}

// Assign Power Play (PP) and Penalty Kill (PK) units for a specific team
function assignSpecialTeams(players, selectedTeamName) {
  const pp1 = [];
  const pp2 = [];
  const pk1 = [];
  const pk2 = [];

  // Filter players for the selected team
  const teamPlayers = players.filter(player => player.team === selectedTeamName && !player.injured);

  // Group players by position
  const forwards = teamPlayers.filter(player => player.position !== 'D').sort((a, b) => b.scoring - a.scoring);
  const defensemen = teamPlayers.filter(player => player.position === 'D').sort((a, b) => b.defense - a.defense);

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

// Save special team assignments back to LocalStorage for a specific team
function saveSpecialTeamAssignments(selectedTeamName) {
  const pp1 = Array.from(document.getElementById('powerplay1').children).map(el => el.dataset.id);
  const pp2 = Array.from(document.getElementById('powerplay2').children).map(el => el.dataset.id);
  const pk1 = Array.from(document.getElementById('penaltykill1').children).map(el => el.dataset.id);
  const pk2 = Array.from(document.getElementById('penaltykill2').children).map(el => el.dataset.id);

  const allSpecialTeams = JSON.parse(localStorage.getItem('specialTeams')) || {};
  allSpecialTeams[selectedTeamName] = { PP1: pp1, PP2: pp2, PK1: pk1, PK2: pk2 };
  localStorage.setItem('specialTeams', JSON.stringify(allSpecialTeams));
}

// Initialize the special teams page
document.addEventListener('DOMContentLoaded', () => {
  const players = JSON.parse(localStorage.getItem('teamPlayers')) || [];
  const allSpecialTeams = JSON.parse(localStorage.getItem('specialTeams')) || {};
  const teamSelector = document.getElementById('team-selector');

  // Load initial team
  let selectedTeamName = teamSelector.value;

  // Handle team selection change
  teamSelector.addEventListener('change', () => {
    selectedTeamName = teamSelector.value;
    loadTeamSpecialTeams(players, selectedTeamName, allSpecialTeams);
  });

  // Load special teams for the initial team
  loadTeamSpecialTeams(players, selectedTeamName, allSpecialTeams);
});

// Load special teams for a specific team
function loadTeamSpecialTeams(players, selectedTeamName, allSpecialTeams) {
  const lineAssignments = allSpecialTeams[selectedTeamName] || {};
  const specialTeams = assignSpecialTeams(players, selectedTeamName);

  // Merge automatic assignments with saved data
  specialTeams.PP1 = lineAssignments.PP1 || specialTeams.PP1;
  specialTeams.PP2 = lineAssignments.PP2 || specialTeams.PP2;
  specialTeams.PK1 = lineAssignments.PK1 || specialTeams.PK1;
  specialTeams.PK2 = lineAssignments.PK2 || specialTeams.PK2;

  renderSpecialTeams(specialTeams);
}
