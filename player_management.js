// player_management.js

// Load players data from localStorage
const loadPlayers = () => {
    const playersData = JSON.parse(localStorage.getItem("playersData"));
    return playersData ? playersData.players : [];
};

// Save players data to localStorage
const savePlayers = (players) => {
    localStorage.setItem("playersData", JSON.stringify({ players }));
};

// Create a toggle button for injury and healthy scratch
const createToggleButton = (player, type, players) => {
    const button = document.createElement("button");
    button.textContent = type === "injury" ? 
        (player.injured ? "Mark as Healthy" : "Mark as Injured") : 
        (player.healthyScratch ? "Remove from Healthy Scratch" : "Add to Healthy Scratch");

    // Toggle functionality
    button.addEventListener("click", () => {
        if (type === "injury") {
            player.injured = !player.injured; // Toggle injury status
        } else if (type === "healthyScratch") {
            player.healthyScratch = !player.healthyScratch; // Toggle healthy scratch status
        }

        savePlayers(players); // Save updated player data
        renderPlayerList(); // Re-render the player list with updated statuses
    });

    return button;
};

// Render the player list
const renderPlayerList = () => {
    const players = loadPlayers();  // Load players here, so we have the latest state
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Clear current list

    players.forEach(player => {
        const playerDiv = document.createElement("div");
        playerDiv.classList.add("player-item");

        const playerInfoDiv = document.createElement("div");
        playerInfoDiv.classList.add("player-info");
        playerInfoDiv.innerHTML = `<strong>${player.name}</strong> (ID: ${player.id})`;

        // Create buttons for toggling injury and healthy scratch states
        const injuryButton = createToggleButton(player, "injury", players);
        const healthyScratchButton = createToggleButton(player, "healthyScratch", players);

        // Append buttons to the player div
        playerDiv.appendChild(playerInfoDiv);
        playerDiv.appendChild(injuryButton);
        playerDiv.appendChild(healthyScratchButton);

        playersList.appendChild(playerDiv);
    });
};

// Run the render function when the page loads
document.addEventListener("DOMContentLoaded", renderPlayerList);
