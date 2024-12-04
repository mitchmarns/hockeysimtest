document.addEventListener("DOMContentLoaded", async () => {
  const playersContainer = document.getElementById("players");
  const slots = document.querySelectorAll(".line-slot");
  const teamName = document.getElementById("team").textContent;

  // Load saved assignments
  const assignments = JSON.parse(localStorage.getItem("lineAssignments")) || {};

// Load players from localStorage
  const loadPlayers = () => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    if (playersData && playersData.players) {
      return playersData.players;
    }
    return [];
  };

  // Apply the assignment to the player and update the stored players data
  const updatePlayerAssignment = (playerId, slotPosition) => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    
    // Ensure players data exists
    if (!playersData || !playersData.players) {
      return; // Exit if players data isn't loaded correctly
    }
  
    // Find the player and update their assignment
    playersData.players.forEach((player) => {
      if (player.id === parseInt(playerId)) {
        player.lineAssigned = slotPosition; // Update line assignment
      }
    });
    
  // Update localStorage with the modified players data
  localStorage.setItem("playersData", JSON.stringify(playersData));
};

  // Get players from localStorage
  const players = loadPlayers();

// Populate the "Available Players" section with unassigned players
const populateAvailablePlayers = (players) => {
  playersContainer.innerHTML = ""; // Clear current list
  const unassignedPlayers = players.filter(
    (player) => !player.lineAssigned // Player is not assigned to a line
  );

  unassignedPlayers.forEach((player) => {
    const playerDiv = document.createElement("div");
    playerDiv.className = "player";
    playerDiv.draggable = true;
    playerDiv.dataset.id = player.id;
    playerDiv.dataset.team = player.team;
    playerDiv.dataset.position = player.position;

    // Apply a class or style based on injury or scratch status
    if (player.injured) {
      playerDiv.classList.add("injured");  // Add a class for injured players
      playerDiv.draggable = false;  // Prevent dragging for injured players
    } else if (player.healthyScratch) {
      playerDiv.classList.add("healthy-scratch");  // Add a class for healthy scratched players
      playerDiv.draggable = false;  // Prevent dragging for healthy scratched players
    }

    // image
    const playerImg = document.createElement("img");
    playerImg.src = player.image;
    playerImg.alt = player.name;
    playerImg.className = "player-image";

    // name
    const playerName = document.createElement("span");
    playerName.textContent = `${player.name} #${player.id} ${player.team || "Unassigned"} ${player.position}`;

    playerDiv.appendChild(playerImg);
    playerDiv.appendChild(playerName);

    playersContainer.appendChild(playerDiv);
      
    // Add drag event to player
    playerDiv.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("playerId", player.id);
    });
  });
};

// Apply assignments to slots
const applyAssignmentsToSlots = (players) => {
  for (const [slotId, playerId] of Object.entries(assignments)) {
    const slot = document.querySelector(`[data-position="${slotId}"]`);
    const player = players.find((p) => p.id === parseInt(playerId));
      
    if (slot && player) {
      // Check if player was already assigned
      const existingPlayerImg = slot.querySelector("img");
      if (existingPlayerImg) {
        existingPlayerImg.remove(); // Remove previous player image if any
      }
        
      const playerImg = document.createElement("img");
      playerImg.src = player.image;
      playerImg.alt = player.name;
      playerImg.className = "player-image";

      const playerName = document.createElement("span");
      playerName.textContent = `${player.name} (#${player.id})`;

      slot.classList.add('slot-content');
      slot.textContent = '';
        
      slot.appendChild(playerImg);
      slot.appendChild(playerName);

      slot.dataset.assignedPlayer = playerId;
    }
  }
};

  // Handle drop events on slots
  const addDropEventsToSlots = () => {
    slots.forEach((slot) => {
      slot.addEventListener("dragover", (e) => {
        e.preventDefault(); // Allow drop
      });

      slot.addEventListener("drop", (e) => {
        e.preventDefault();
        
        const playerId = e.dataTransfer.getData("playerId");
        const playerDiv = document.querySelector(`[data-id="${playerId}"]`);
        const player = players.find((p) => p.id == playerId);

        if (!player) {
          alert("Error: Player data not found.");
          return;
        }

        if (player.injured || player.healthyScratch) {
        alert(`${player.name} cannot be assigned to a line because they are either injured or a healthy scratch.`);
        return;  // Prevent the player from being dropped
      }

        // Extract relevant information from data-position
        const positionParts = slot.dataset.position.split('-');
        const slotTeam = positionParts[0];   // 'Rangers'
        const slotLineType = positionParts[1];  // 'forward'
        const slotPosition = positionParts[2];  // 'LW'

        // Validate if the player's position and team match the slot's position
        if (player.team === slotTeam && 
            ((player.position === slotPosition) || 
             (slotLineType === 'goalies' && (slotPosition === 'Starter' || slotPosition === 'Backup') && 
              (player.position === 'Starter' || player.position === 'Backup')))) {

        // Update UI: Add player to the slot
        const playerImg = document.createElement("img");
        playerImg.src = player.image; // Use player.image from the object
        playerImg.alt = player.name;
        playerImg.className = "player-image";

        const playerName = document.createElement("span");
        playerName.textContent = `${player.name} (#${player.id})`;

        slot.classList.add('slot-content');
        slot.textContent = ''; 
        slot.appendChild(playerImg);
        slot.appendChild(playerName);

        slot.dataset.assignedPlayer = playerId;

        // Update assignments
        assignments[slot.dataset.position] = playerId;
        localStorage.setItem("lineAssignments", JSON.stringify(assignments));

          // Mark player as assigned
          players.forEach((p) => {
            if (p.id === parseInt(playerId)) {
              p.lineAssigned = slot.dataset.position; 
            }
          });
        
        localStorage.setItem("playersData", JSON.stringify({ players }));

        // Refresh available players
        populateAvailablePlayers(players);
      } else {
        alert("The player cannot be assigned to this slot because either the position or team does not match.");
        }
      });
    });
  };

// Initialize the page
  const init = () => {
    populateAvailablePlayers(players);
    applyAssignmentsToSlots(players);
    addDropEventsToSlots();
  };

  init();
});

