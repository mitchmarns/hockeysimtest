// Load players from localStorage
const loadPlayers = () => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    if (playersData && playersData.players) {
        return playersData.players;
    }
    return []; // Return an empty array if no data is found
};

// Save players data to localStorage
const savePlayers = (players) => {
    localStorage.setItem("playersData", JSON.stringify({ players }));
};

document.addEventListener("DOMContentLoaded", async () => {
    const teamSelector = document.getElementById("team-selector");

    // Load players (assumed static data for now)
    const players = loadPlayers();



// Render lines
const renderSpecialTeams = (teamName) => {
    const powerplayContainer = document.getElementById("powerplay");
    const penaltyKillContainer = document.getElementById("penaltykill");
    
    powerplayContainer.innerHTML = "";
    penaltyKillContainer.innerHTML = "";

    // Create Powerplay slots (5 slots: LW, C, RW, LD, RD)
    for (let i = 1; i <= 2; i++) {
        ["LW", "C", "RW", "LD", "RD"].forEach((position) => {
            const slotId = `powerplay-${i}-${position}`;
            const slot = createSlot(slotId, `Unit ${i} - ${position}`);

            // Check if a player is assigned to this slot
            const assignedPlayer = players.find(
                (player) => player.specialTeamAssigned === slotId && player.team === teamName
            );
            if (assignedPlayer) {
                // Populate the slot with the assigned player
                slot.innerHTML = `
                    <div class="slot-content">
                        <img src="${assignedPlayer.image}" alt="${assignedPlayer.name}" class="player-image">
                        <span>${assignedPlayer.name}</span>
                    </div>
                `;
                slot.classList.add("assigned");
            }

            powerplayContainer.appendChild(slot);
        });
    }

    // Create Penalty Kill slots (4 slots: F1, F2, D1, D2)
    for (let i = 1; i <= 2; i++) {
        ["F1", "F2", "D1", "D2"].forEach((position) => {
            const slotId = `penaltykill-${i}-${position}`;
            const slot = createSlot(slotId, `Unit ${i} - ${position}`);

            // Check if a player is assigned to this slot
            const assignedPlayer = players.find(
                (player) => player.specialTeamAssigned === slotId && player.team === teamName
            );
            if (assignedPlayer) {
                // Populate the slot with the assigned player
                slot.innerHTML = `
                    <div class="slot-content">
                        <img src="${assignedPlayer.image}" alt="${assignedPlayer.name}" class="player-image">
                        <span>${assignedPlayer.name}</span>
                    </div>
                `;
                slot.classList.add("assigned");
            }

            penaltyKillContainer.appendChild(slot);
        });
    }
};


    // Helper function to create slot elements for special teams
    const createSlot = (position, title) => {
        const slot = document.createElement("div");
        slot.classList.add("special-team-slot");
        slot.dataset.position = position;
        slot.innerHTML = `<h3>${title}</h3>`;

        // Add drag-and-drop event listeners
        slot.ondragover = (e) => e.preventDefault(); // Allow the drop
        slot.ondrop = handleDrop; // Handle the drop event

        return slot;
    };

    // Populate available players based on the current team
    const populateAvailablePlayers = (players, teamName) => {
        const playersContainer = document.getElementById("players");
        playersContainer.innerHTML = ""; // Clear current list

        // Filter players by team and line assignment status
        const availablePlayers = players.filter(player => player.team === teamName && !player.specialTeamAssigned);
        availablePlayers.forEach(player => {
            const playerDiv = document.createElement("div");
            playerDiv.className = "player";
            playerDiv.draggable = true;
            playerDiv.dataset.id = player.id;

            const playerImg = document.createElement("img");
            playerImg.src = player.image;
            playerImg.alt = player.name;
            playerDiv.appendChild(playerImg);

            const playerInfo = document.createElement("div");
            playerInfo.className = "player-info";

            const playerName = document.createElement("span");
            playerName.textContent = `${player.name} #${player.id}`;
            playerDiv.appendChild(playerName);

            const playerPosition = document.createElement("span");
            playerPosition.className = "player-position";
            playerPosition.textContent = `Position: ${player.position}`;
            playerInfo.appendChild(playerPosition);
        
            playerDiv.appendChild(playerInfo);
        
             playerDiv.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("playerId", player.id);
            });
        
            playersContainer.appendChild(playerDiv);
        });
    };

    // Handle the drop event
    const handleDrop = (event) => {
        event.preventDefault();

        const playerId = event.dataTransfer.getData("playerId");
        const droppedSlot = event.currentTarget;
        const position = droppedSlot.dataset.position;

        // Find the player by ID
        const player = players.find((p) => p.id === parseInt(playerId));
        if (player) {
            // Update the player's assignment
            player.specialTeamAssigned = position;

            // Save the updated players data
            savePlayers(players);

            // Update the slot content to show the player's details
            droppedSlot.innerHTML = `
                <div class="slot-content">
                    <img src="${player.image}" alt="${player.name}" class="player-image">
                    <span>${player.name}</span>
                </div>
            `;
            droppedSlot.classList.add("assigned");
        }
    };

    // Handle team selection change
    const onTeamChange = () => {
        const selectedTeam = teamSelector.value;
        renderSpecialTeams(selectedTeam);
        populateAvailablePlayers(players, selectedTeam);
    };

    // Add event listener for dropdown changes
    teamSelector.addEventListener("change", onTeamChange);
    
    // Initial render for the default team
    onTeamChange();
});
