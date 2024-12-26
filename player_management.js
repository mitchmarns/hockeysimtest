// player_management.js

// Load players and merge injury data from teams in localStorage
const loadPlayers = () => {
    try {
        const playersData = JSON.parse(localStorage.getItem("playersData"));
        const teamsData = JSON.parse(localStorage.getItem("teams"));

        if (!playersData || !Array.isArray(playersData.players) || !Array.isArray(teamsData)) {
            return [];
        }

        // Sync injury and healthy scratch statuses from teams
        teamsData.forEach(team => {
            team.players.forEach(teamPlayer => {
                const player = playersData.players.find(p => p.id === teamPlayer.id);
                if (player) {
                    player.injured = teamPlayer.injured;
                    player.healthyScratch = teamPlayer.healthyScratch;
                }
            });
        });

        return playersData.players;
    } catch (error) {
        console.error("Error loading player data:", error);
        return [];
    }
};
// Save players and update injury/healthy scratch status in teams
const savePlayers = (players) => {
    try {
        const teamsData = JSON.parse(localStorage.getItem("teams"));

        if (Array.isArray(teamsData)) {
            teamsData.forEach(team => {
                team.players.forEach(teamPlayer => {
                    const player = players.find(p => p.id === teamPlayer.id);
                    if (player) {
                        teamPlayer.injured = player.injured;
                        teamPlayer.healthyScratch = player.healthyScratch;
                    }
                });
            });

            localStorage.setItem("teams", JSON.stringify(teamsData));
        }

        localStorage.setItem("playersData", JSON.stringify({ players }));
    } catch (error) {
        console.error("Error saving player data:", error);
    }
};

// Create a visual badge for injury/healthy scratch status
const createStatusBadge = (player) => {
    const badge = document.createElement("span");
    badge.className = "status-badge";

    if (player.injured) {
        badge.textContent = "Injured";
        badge.classList.add("badge-injured");
    } else if (player.healthyScratch) {
        badge.textContent = "Healthy Scratch";
        badge.classList.add("badge-scratch");
    } else {
        badge.textContent = "Active";
        badge.classList.add("badge-active");
    }

    return badge;
};

// Create a toggle button for injury and healthy scratch
const createToggleButton = (player, type, players) => {
    const button = document.createElement("button");
    button.className = "toggle-button";
    button.textContent = type === "injury" 
        ? (player.injured ? "Mark as Healthy" : "Mark as Injured")
        : (player.healthyScratch ? "Remove Healthy Scratch" : "Add to Healthy Scratch");

    button.addEventListener("click", () => {
        const action = type === "injury" 
            ? (player.injured ? "mark as healthy" : "mark as injured")
            : (player.healthyScratch ? "remove from healthy scratch" : "add to healthy scratch");

        const confirmationMessage = `Are you sure you want to ${action} ${player.name}?`;

        if (window.confirm(confirmationMessage)) {
            // Toggle status
            if (type === "injury") {
                player.injured = !player.injured;
            } else if (type === "healthyScratch") {
                player.healthyScratch = !player.healthyScratch;
            }

            savePlayers(players); // Save updated data
            renderPlayerList(); // Re-render list
        }
    });

    return button;
};

// Render the player list
const renderPlayerList = () => {
    const players = loadPlayers();
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Clear the list

    players.forEach(player => {
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("player-item");

        // Player information
        const playerInfoDiv = document.createElement("div");
        playerInfoDiv.classList.add("player-info");
        playerInfoDiv.innerHTML = `<strong>${player.name}</strong> (ID: ${player.id})`;

        // Create status badge
        const statusBadge = createStatusBadge(player);

        // Create toggle buttons
        const injuryButton = createToggleButton(player, "injury", players);
        const healthyScratchButton = createToggleButton(player, "healthyScratch", players);

        // Append elements to the player div
        playerDiv.appendChild(playerInfoDiv);
        playerDiv.appendChild(statusBadge);
        playerDiv.appendChild(injuryButton);
        playerDiv.appendChild(healthyScratchButton);

        playersList.appendChild(playerDiv);
    });
};

// Run the render function when the page loads
document.addEventListener("DOMContentLoaded", renderPlayerList);
