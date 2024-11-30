import { loadTeamsFromLocalStorage, teams } from './team.js';

document.addEventListener('DOMContentLoaded', () => {
  loadTeamsFromLocalStorage();
  initializeSpecialTeams();
  displaySpecialTeams();
});

// Initialize Special Teams Structure
function initializeSpecialTeams() {
  teams.forEach(team => {
    if (!team.specialTeams) {
      team.specialTeams = {
        powerplay: [
          { LW: null, C: null, RW: null, LD: null, RD: null }, // Unit 1
          { LW: null, C: null, RW: null, LD: null, RD: null }  // Unit 2
        ],
        penaltyKill: [
          { LD: null, RD: null, F1: null, F2: null },          // Unit 1
          { LD: null, RD: null, F1: null }                    // Unit 2 (3-man PK)
        ]
      };
    }
  });
}

// Display Special Teams UI
function displaySpecialTeams() {
  const container = document.getElementById('special-teams-container');
  container.innerHTML = '';

  teams.forEach(team => {
    const teamContainer = document.createElement('div');
    teamContainer.className = 'team-special-teams';
    teamContainer.innerHTML = `<h2>${team.name}</h2>`;
    
    // Powerplay Units
    const powerplayContainer = createUnitContainer(team, 'powerplay', ['LW', 'C', 'RW', 'LD', 'RD']);
    teamContainer.appendChild(powerplayContainer);

    // Penalty Kill Units
    const penaltyKillContainer = createUnitContainer(team, 'penaltyKill', ['LD', 'RD', 'F1', 'F2']);
    teamContainer.appendChild(penaltyKillContainer);

    container.appendChild(teamContainer);
  });

  enableDragAndDrop();
}

// Create Unit Container
function createUnitContainer(team, unitType, roles) {
  const container = document.createElement('div');
  container.className = `${unitType}-container`;

  const unitTitle = unitType === 'powerplay' ? 'Powerplay Units' : 'Penalty Kill Units';
  container.innerHTML = `<h3>${unitTitle}</h3>`;

  team.specialTeams[unitType].forEach((unit, index) => {
    const unitDiv = document.createElement('div');
    unitDiv.className = 'unit';
    unitDiv.innerHTML = `<h4>${unitType === 'powerplay' ? 'PP' : 'PK'} Unit ${index + 1}</h4>`;
    
    roles.forEach(role => {
      const playerSlot = document.createElement('div');
      playerSlot.className = 'player-slot';
      playerSlot.dataset.team = team.name;
      playerSlot.dataset.unitType = unitType;
      playerSlot.dataset.unitIndex = index;
      playerSlot.dataset.role = role;

      const playerId = unit[role];
      const player = playerId ? team.players.find(p => p.id === playerId) : null;

      playerSlot.innerHTML = player ? `
        <div class="player" data-id="${player.id}">
          <img src="${player.image}" alt="${player.name}" />
          <span>${player.name}</span>
          <button class="remove-btn">Remove</button>
        </div>
      ` : '<span>Empty</span>';

      unitDiv.appendChild(playerSlot);
    });

    container.appendChild(unitDiv);
  });

  return container;
}

// Enable Drag-and-Drop for Special Teams
function enableDragAndDrop() {
  const container = document.getElementById('special-teams-container');

  // Drag Start
  container.addEventListener('dragstart', e => {
    const playerBox = e.target.closest('.player');
    if (playerBox) {
      e.dataTransfer.setData('playerId', playerBox.dataset.id);
      e.dataTransfer.setData('teamName', playerBox.closest('.team-special-teams').querySelector('h2').textContent);
    }
  });

  // Drag Over
  container.addEventListener('dragover', e => {
    e.preventDefault();
  });

  // Drop
  container.addEventListener('drop', e => {
    const slot = e.target.closest('.player-slot');
    if (!slot) return;

    const playerId = parseInt(e.dataTransfer.getData('playerId'));
    const teamName = e.dataTransfer.getData('teamName');
    const role = slot.dataset.role;
    const unitType = slot.dataset.unitType;
    const unitIndex = parseInt(slot.dataset.unitIndex);

    const team = teams.find(t => t.name === teamName);
    const player = team.players.find(p => p.id === playerId);

    if (!player || !team) return;

    // Assign player to special team slot
    const unit = team.specialTeams[unitType][unitIndex];
    unit[role] = player.id;

    // Persist changes
    localStorage.setItem('teams', JSON.stringify(teams));
    displaySpecialTeams();
  });
}
