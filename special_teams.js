document.addEventListener("DOMContentLoaded", async () => {
    const teamName = document.getElementById("team").textContent;  // Get the team name from the HTML
    const players = loadPlayers(); // Get players from localStorage or a predefined array

    // Function to render special teams (Powerplay and Penalty Kill)
    const renderSpecialTeams = (teamName) => {
        const powerplayContainer = document.getElementById("powerplay-units");
        const penaltyKillContainer = document.getElementById("penaltykill-units");
    // Load saved assignments
    const assignments = JSON.parse(localStorage.getItem("specialTeamsAssignments")) || {};

// Clear the existing content in both sections
        powerplayContainer.innerHTML = "";
        penaltyKillContainer.innerHTML = "";

        // Create Powerplay slots (5 slots)
        for (let i = 1; i <= 2; i++) {
            const powerplayUnit = document.createElement("div");
            powerplayUnit.classList.add("special-team-slot");
            powerplayUnit.innerHTML = `<h3>Unit ${i} - LW</h3>`;
            powerplayUnit.dataset.position = `powerplay-${i}-LW`;
            powerplayContainer.appendChild(powerplayUnit);

            const powerplayC = document.createElement("div");
            powerplayC.classList.add("special-team-slot");
            powerplayC.innerHTML = `<h3>Unit ${i} - C</h3>`;
            powerplayC.dataset.position = `powerplay-${i}-C`;
            powerplayContainer.appendChild(powerplayC);

            const powerplayRW = document.createElement("div");
            powerplayRW.classList.add("special-team-slot");
            powerplayRW.innerHTML = `<h3>Unit ${i} - RW</h3>`;
            powerplayRW.dataset.position = `powerplay-${i}-RW`;
            powerplayContainer.appendChild(powerplayRW);

            const powerplayLD = document.createElement("div");
            powerplayLD.classList.add("special-team-slot");
            powerplayLD.innerHTML = `<h3>Unit ${i} - LD</h3>`;
            powerplayLD.dataset.position = `powerplay-${i}-LD`;
            powerplayContainer.appendChild(powerplayLD);

            const powerplayRD = document.createElement("div");
            powerplayRD.classList.add("special-team-slot");
            powerplayRD.innerHTML = `<h3>Unit ${i} - RD</h3>`;
            powerplayRD.dataset.position = `powerplay-${i}-RD`;
            powerplayContainer.appendChild(powerplayRD);
        }

        // Create Penalty Kill slots (4 slots)
        for (let i = 1; i <= 2; i++) {
            const penaltyKillF1 = document.createElement("div");
            penaltyKillF1.classList.add("special-team-slot");
            penaltyKillF1.innerHTML = `<h3>Unit ${i} - F1</h3>`;
            penaltyKillF1.dataset.position = `penaltykill-${i}-F1`;
            penaltyKillContainer.appendChild(penaltyKillF1);

            const penaltyKillF2 = document.createElement("div");
            penaltyKillF2.classList.add("special-team-slot");
            penaltyKillF2.innerHTML = `<h3>Unit ${i} - F2</h3>`;
            penaltyKillF2.dataset.position = `penaltykill-${i}-F2`;
            penaltyKillContainer.appendChild(penaltyKillF2);

            const penaltyKillD1 = document.createElement("div");
            penaltyKillD1.classList.add("special-team-slot");
            penaltyKillD1.innerHTML = `<h3>Unit ${i} - D1</h3>`;
            penaltyKillD1.dataset.position = `penaltykill-${i}-D1`;
            penaltyKillContainer.appendChild(penaltyKillD1);

            const penaltyKillD2 = document.createElement("div");
            penaltyKillD2.classList.add("special-team-slot");
            penaltyKillD2.innerHTML = `<h3>Unit ${i} - D2</h3>`;
            penaltyKillD2.dataset.position = `penaltykill-${i}-D2`;
            penaltyKillContainer.appendChild(penaltyKillD2);
        }
    };

    // Populate available players based on the current team
    const populateAvailablePlayers = (players, teamName) => {
        const playersContainer = document.getElementById("players");
        playersContainer.innerHTML = ""; // Clear current list

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
    renderSpecialTeams(teamName);
    populateAvailablePlayers(players, teamName);
});


    populateAvailablePlayers(players);
    applyAssignmentsToSlots(players);
    addDropEventsToSlots();

