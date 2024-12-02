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

  // Get players from localStorage
  const players = loadPlayers();

  // Populate the "Available Players" section with unassigned players
  const populateAvailablePlayers = (players) => {
    playersContainer.innerHTML = ""; // Clear current list
    const unassignedPlayers = players.filter(
      (player) => !player.assigned && !assignments[player.lineAssigned]
    );

    unassignedPlayers.forEach((player) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "player";
      playerDiv.draggable = true;
      playerDiv.dataset.id = player.id;
      playerDiv.dataset.team = player.team;
      playerDiv.dataset.position = player.position;

      // image
      const playerImg = document.createElement("img");
      playerImg.src = player.image;
      playerImg.alt = player.name;
      playerImg.className = "player-image";

      // name
// Add player name, ID, position, and team
      const playerName = document.createElement("span");
      playerName.innerHTML = `${player.name} (#${player.id})<br>Position: ${player.position}<br>Team: ${player.team || "Unassigned"}`;

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
        const playerImg = document.createElement("img");
        playerImg.src = player.image;
        playerImg.alt = player.name;
        playerImg.className = "player-image";

        const playerName = document.createElement("span");
        playerName.textContent = `${player.name} (#${player.id})`;

        slot.textContent = ''; // Clear the slot
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
        const player = playerDiv ? players.find(p => p.id == playerId) : null;
        

        // Validate if the player's position and team match the slot's position
        const slotPosition = slot.dataset.position.split("-")[1];
        const playerTeam = player.dataset.team; 
        
      if (player && player.position === slotPosition && playerTeam === teamName) {
        // Update UI
        const playerImg = document.createElement("img");
        playerImg.src = player.querySelector("img").src;
        playerImg.alt = player.textContent.trim();
        playerImg.className = "player-image";

        const playerName = document.createElement("span");
        playerName.textContent = player.textContent.trim();

        slot.textContent = ''; // Clear the slot
        slot.appendChild(playerImg);
        slot.appendChild(playerName);

        slot.dataset.assignedPlayer = playerId;

        // Update assignments
        assignments[slot.dataset.position] = playerId;
        localStorage.setItem("lineAssignments", JSON.stringify(assignments));

        // Mark player as assigned
        const players = JSON.parse(localStorage.getItem("playersData")) || [];
        const updatedPlayers = players.map((p) => {
          if (p.id === parseInt(playerId)) p.assigned = true;
          return p;
        });
        
        localStorage.setItem("playersData", JSON.stringify(updatedPlayers));

        // Refresh available players
        populateAvailablePlayers(updatedPlayers);
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
});
