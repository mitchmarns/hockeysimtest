document.addEventListener("DOMContentLoaded", async () => {
  const playersContainer = document.getElementById("players-container");
  const teamFilter = document.getElementById("team-filter");

  let playersData = { players: [] };
  const teams = ["Rangers", "Devils", "Islanders", "Sabres"];

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

  // Save updated data to localStorage
  const savePlayers = () => {
    const dataToSave = { players: playersData.players };
    localStorage.setItem("playersData", JSON.stringify(dataToSave));
  };

  // Render players based on selected team filter
  const renderPlayers = (teamFilterValue) => {
    playersContainer.innerHTML = ""; // Clear existing content
    
    const filteredPlayers = playersData.players.filter(player =>
      teamFilterValue === "all" || player.team === teamFilterValue
    );

    filteredPlayers.forEach(player => {
      const playerCard = document.createElement("div");
      playerCard.className = "player-card";
      playerCard.innerHTML = `
        <img src="${player.image}" alt="${player.name}" class="player-image">
        <h3>${player.name}</h3>
        <p>Position: ${player.position}</p>
        <p>Team: ${player.team || "Unassigned"}</p>
        <select class="team-select" data-id="${player.id}">
          <option value="">Assign to team</option>
          ${teams.map(team => `<option value="${team}" ${player.team === team ? "selected" : ""}>${team}</option>`).join("")}
        </select>
      `;
      playersContainer.appendChild(playerCard);
    });

    addEventListeners();
  };

  // Add event listeners to team dropdowns
const addEventListeners = () => {
    const teamSelects = document.querySelectorAll(".team-select");
    teamSelects.forEach((select) => {
      select.addEventListener("change", (e) => {
        const playerId = parseInt(e.target.getAttribute("data-id"));
        const selectedTeam = e.target.value;
        const player = playersData.players.find((p) => p.id === playerId);
        if (player) {
          player.team = selectedTeam || null;
          player.assigned = !!selectedTeam;
          savePlayers();
          renderPlayers(teamFilter.value);
        }
      });
    });
  };

  const loadPlayers = async () => {
    try {
      playersData.players = await fetchPlayers();
      renderPlayers("all");
    } catch (error) {
      console.error("Error loading players:", error);
      playersData = { players: [] };
      renderPlayers("all");
    }
  };

  // Filter players by team
  teamFilter.addEventListener("change", (e) => {
    renderPlayers(e.target.value);
  });

  // Load players on page load
  loadPlayers();
});
