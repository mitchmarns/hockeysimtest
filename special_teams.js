document.addEventListener("DOMContentLoaded", async () => {
    const playersContainer = document.getElementById("players");
    const slots = document.querySelectorAll(".special-team-slot");
    const teamName = document.getElementById("team").textContent;

    // Load saved assignments
    const assignments = JSON.parse(localStorage.getItem("specialTeamsAssignments")) || {};

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
        if (!playersData || !playersData.players) {
            return;
        }

        playersData.players.forEach((player) => {
            if (player.id === parseInt(playerId)) {
                player.specialTeamsAssigned = slotPosition;
            }
        });

        localStorage.setItem("playersData", JSON.stringify(playersData));
    };

    const players = loadPlayers();

    // Populate the "Available Players" section with unassigned players
    const populateAvailablePlayers = (players) => {
        playersContainer.innerHTML = "";
        const unassignedPlayers = players.filter(
            (player) => !player.specialTeamsAssigned && !assignments[player.specialTeamsAssigned]
        );

        unassignedPlayers.forEach((player) => {
            const playerDiv = document.createElement("div");
            playerDiv.className = "player";
            playerDiv.draggable = true;
            playerDiv.dataset.id = player.id;
            playerDiv.dataset.team = player.team;
            playerDiv.dataset.position = player.position;

            const playerImg = document.createElement("img");
            playerImg.src = player.image;
            playerImg.alt = player.name;
            playerImg.className = "player-image";

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

    // Apply assignments to special team slots
    const applyAssignmentsToSlots = (players) => {
        for (const [slotId, playerId] of Object.entries(assignments)) {
            const slot = document.querySelector(`[data-position="${slotId}"]`);
            const player = players.find((p) => p.id === parseInt(playerId));

            if (slot && player) {
                const existingPlayerImg = slot.querySelector("img");
                if (existingPlayerImg) {
                    existingPlayerImg.remove();
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
                e.preventDefault();
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

                const positionParts = slot.dataset.position.split('-');
                const slotTeam = positionParts[0];   // 'powerplay'
                const slotUnit = positionParts[1];   // '1'
                const slotPosition = positionParts[2];  // 'LW'

                if (player.team === slotTeam && player.position === slotPosition) {
                    const playerImg = document.createElement("img");
                    playerImg.src = player.image;
                    playerImg.alt = player.name;

                    slot.textContent = '';
                    slot.appendChild(playerImg);

                    assignments[slot.dataset.position] = player.id;

                    updatePlayerAssignment(player.id, slot.dataset.position);
                    localStorage.setItem("specialTeamsAssignments", JSON.stringify(assignments));
                    populateAvailablePlayers(players);
                    applyAssignmentsToSlots(players);
                } else {
                    alert("This player is not eligible for this slot.");
                }
            });
        });
    };

    populateAvailablePlayers(players);
    applyAssignmentsToSlots(players);
    addDropEventsToSlots();
});
