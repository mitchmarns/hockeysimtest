document.addEventListener("DOMContentLoaded", async () => {
  const playersContainer = document.getElementById("players");
  const slots = document.querySelectorAll(".line-slot");

  // Load saved assignments
  const assignments = JSON.parse(localStorage.getItem("lineAssignments")) || {};

  // Fetch players from players.json
  const fetchPlayers = async () => {
    try {
      const response = await fetch("players.json");
      const data = await response.json();
      return data.players; // Assuming the structure is { "players": [...] }
    } catch (error) {
      console.error("Error fetching players:", error);
      return [];
    }
  };

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

      // image
      const playerImg = document.createElement("img");
      playerImg.src = player.image;
      playerImg.alt = player.name;
      playerImg.className = "player-image";

      // name
      const playerName = document.createElement("span");
      playerName.textContent = player.name;

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
        playerName.textContent = player.name;

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
        const player = document.querySelector(`[data-id="${playerId}"]`);

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
      });
    });
  };

  // Initialize the page
  const init = async () => {
    const players = await fetchPlayers();

    // Save players to localStorage for persistence
    localStorage.setItem("playersData", JSON.stringify(players));

    populateAvailablePlayers(players);
    applyAssignmentsToSlots(players);
    addDropEventsToSlots();
  };

  init();
});
