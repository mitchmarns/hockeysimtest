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

  // Filter players for the selected team and exclude injured players
  const teamPlayers = players.filter(player => player.team === selectedTeamName && !player.injured);

  // Group players by position
  const leftWings = teamPlayers.filter(player => player.position === 'LW').sort((a, b) => b.skills.shooting - a.skills.shooting);
  const centers = teamPlayers.filter(player => player.position === 'C').sort((a, b) => b.skills.passing - a.skills.passing);
  const rightWings = teamPlayers.filter(player => player.position === 'RW').sort((a, b) => b.skills.shooting - a.skills.shooting);
  const defensemen = teamPlayers.filter(player => player.position === 'LD' || player.position === 'RD').sort((a, b) => b.skills.defense - a.skills.defense);
  // Power Play (PP) assignments
  const pp1 = [];
  const pp2 = [];

  // Assign PP1: Best LW, C, RW, and 2 best D
  if (leftWings.length > 0) pp1.push(leftWings[0]);
  if (centers.length > 0) pp1.push(centers[0]);
  if (rightWings.length > 0) pp1.push(rightWings[0]);
  pp1.push(...defensemen.slice(0, 2)); // Best 2 defensemen

  // Assign PP2: Next best LW, C, RW, and next 2 best D
  if (leftWings.length > 1) pp2.push(leftWings[1]);
  if (centers.length > 1) pp2.push(centers[1]);
  if (rightWings.length > 1) pp2.push(rightWings[1]);
  pp2.push(...defensemen.slice(2, 4)); // Next 2 defensemen

  // Penalty Kill (PK) assignments
  const pk1 = [];
  const pk2 = [];

  // Assign PK1: Best defensive forwards and best 2 defensive defensemen
  const defensiveForwards = teamPlayers
    .filter(player => player.position !== 'D')
    .sort((a, b) => b.skills.defense - a.skills.defense);
  pk1.push(...defensiveForwards.slice(0, 2)); // Best 2 defensive forwards
  pk1.push(...defensemen.slice(0, 2)); // Best 2 defensemen

  // Assign PK2: Next best defensive forwards and next 2 defensive defensemen
  pk2.push(...defensiveForwards.slice(2, 4)); // Next 2 defensive forwards
  pk2.push(...defensemen.slice(2, 4)); // Next 2 defensemen

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
    console.log("Rendering players:", players);
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
  console.log("Loaded players:", players);
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
