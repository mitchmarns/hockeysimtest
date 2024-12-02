// Load players from localStorage
const loadPlayers = () => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    if (playersData && playersData.players) {
        return playersData.players;
    }
    return []; // Return an empty array if no data is found
};

document.addEventListener("DOMContentLoaded", async () => {
    const teamName = document.getElementById("team").textContent;

    // Load players (assumed static data for now)
    const players = loadPlayers();

    // Function to render special teams (Powerplay and Penalty Kill)
    const renderSpecialTeams = (teamName) => {
        const powerplayContainer = document.getElementById("powerplay");
        const penaltyKillContainer = document.getElementById("penaltykill");

        // Clear the existing content in both sections
        powerplayContainer.innerHTML = "";
        penaltyKillContainer.innerHTML = "";

        // Create Powerplay slots (5 slots: LW, C, RW, LD, RD)
        for (let i = 1; i <= 2; i++) {
            const powerplayUnit = createSlot(`powerplay-${i}-LW`, `Unit ${i} - LW`);
            powerplayContainer.appendChild(powerplayUnit);

            const powerplayC = createSlot(`powerplay-${i}-C`, `Unit ${i} - C`);
            powerplayContainer.appendChild(powerplayC);

            const powerplayRW = createSlot(`powerplay-${i}-RW`, `Unit ${i} - RW`);
            powerplayContainer.appendChild(powerplayRW);

            const powerplayLD = createSlot(`powerplay-${i}-LD`, `Unit ${i} - LD`);
            powerplayContainer.appendChild(powerplayLD);

            const powerplayRD = createSlot(`powerplay-${i}-RD`, `Unit ${i} - RD`);
            powerplayContainer.appendChild(powerplayRD);
        }

        // Create Penalty Kill slots (4 slots: F1, F2, D1, D2)
        for (let i = 1; i <= 2; i++) {
            const penaltyKillF1 = createSlot(`penaltykill-${i}-F1`, `Unit ${i} - F1`);
            penaltyKillContainer.appendChild(penaltyKillF1);

            const penaltyKillF2 = createSlot(`penaltykill-${i}-F2`, `Unit ${i} - F2`);
            penaltyKillContainer.appendChild(penaltyKillF2);

            const penaltyKillD1 = createSlot(`penaltykill-${i}-D1`, `Unit ${i} - D1`);
            penaltyKillContainer.appendChild(penaltyKillD1);

            const penaltyKillD2 = createSlot(`penaltykill-${i}-D2`, `Unit ${i} - D2`);
            penaltyKillContainer.appendChild(penaltyKillD2);
        }
    };

    // Helper function to create slot elements for special teams
    const createSlot = (position, title) => {
        const slot = document.createElement("div");
        slot.classList.add("special-team-slot");
        slot.dataset.position = position;
        slot.innerHTML = `<h3>${title}</h3>`;
        return slot;
    };

    // Populate available players based on the current team
    const populateAvailablePlayers = (players, teamName) => {
        const playersContainer = document.getElementById("players");
        playersContainer.innerHTML = ""; // Clear current list

        // Filter players by team and line assignment status
        const availablePlayers = players.filter(player => player.team === teamName && !player.lineAssigned);
        availablePlayers.forEach(player => {
            const playerDiv = document.createElement("div");
            playerDiv.className = "player";
            playerDiv.draggable = true;
            playerDiv.dataset.id = player.id;

            const playerImg = document.createElement("img");
            playerImg.src = player.image;
            playerImg.alt = player.name;
            playerDiv.appendChild(playerImg);

            const playerName = document.createElement("span");
            playerName.textContent = `${player.name} #${player.id}`;
            playerDiv.appendChild(playerName);

            playerDiv.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("playerId", player.id);
            });

            playersContainer.appendChild(playerDiv);
        });
    };

    // Call render functions
    renderSpecialTeams(teamName); // Populate special team slots (Powerplay & Penalty Kill)
    populateAvailablePlayers(players, teamName); // Populate available players for the team
});
