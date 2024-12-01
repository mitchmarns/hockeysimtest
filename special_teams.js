document.addEventListener("DOMContentLoaded", async () => {
  const playersContainer = document.getElementById("players");
  const slots = document.querySelectorAll(".line-slot");

  // Load saved assignments
  const assignments = JSON.parse(localStorage.getItem("specialTeamsAssignments")) || {};

  // Fetch players from localStorage (players should be saved in localStorage)
  const fetchPlayers = () => {
    return JSON.parse(localStorage.getItem("playersData")) || [];
  };

  // Populate the "Available Players" section with unassigned players
  const populateAvailablePlayers = (players) => {
    playersContainer.innerHTML = ""; // Clear current list
    const unassignedPlayers = players.filter(
      (player) => !player.assigned && !assignments[player.specialTeamAssigned]
    );

    unassignedPlayers.forEach((player) => {
      const playerDiv = document.createElement("div");
      playerDiv.className = "player";
      playerDiv.draggable = true;
      playerDiv.dataset.id = player.id;

      // Create an image element
      const playerImg = document.createElement("img");
      playerImg.src = player.image;
      playerImg.alt = player.name;
      playerImg.className = "player-image";

      // Append image and name to the player div
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

  // Apply assignments to special teams slots
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

  // Handle drop events on special teams slots
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
        localStorage.setItem("specialTeamsAssignments", JSON.stringify(assignments));

        // Mark player as assigned
        const players = fetchPlayers();
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
  const init = () => {
    const players = fetchPlayers();
    populateAvailablePlayers(players);
    applyAssignmentsToSlots(players);
    addDropEventsToSlots();
  };

  init();
});
