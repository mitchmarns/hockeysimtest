document.addEventListener("DOMContentLoaded", () => {
  const playersContainer = document.getElementById("players-container");
  const teamFilter = document.getElementById("team-filter");

  let playersData = [];
  const teams = ["Rangers", "Devils", "Islanders", "Sabres"];

  // Load data from localStorage or fallback to fetch
  const loadPlayers = async () => {
    const savedData = localStorage.getItem("playersData");
    if (savedData) {
      playersData = JSON.parse(savedData).players;
    } else {
      const response = await fetch("players.json");
      const data = await response.json();
      playersData = data.players;
      localStorage.setItem("playersData", JSON.stringify(data));
    }
    renderPlayers("all");
  };

  // Save updated data to localStorage
  const savePlayers = () => {
    localStorage.setItem("playersData", JSON.stringify({ players: playersData }));
  };

  // Render players based on selected team filter
  const renderPlayers = (teamFilterValue) => {
    playersContainer.innerHTML = ""; // Clear existing content
    const filteredPlayers = playersData.filter(player =>
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
    teamSelects.forEach(select => {
      select.addEventListener("change", (e) => {
        const playerId = parseInt(e.target.getAttribute("data-id"));
        const selectedTeam = e.target.value;

        // Update player's team
        const player = playersData.find(p => p.id === playerId);
        if (player) {
          player.team = selectedTeam || null; // Set team or unassign
          player.assigned = !!selectedTeam; // Mark as assigned if team is selected
          savePlayers();
          renderPlayers(teamFilter.value); // Re-render
        }
      });
    });
  };

  // Filter players by team
  teamFilter.addEventListener("change", (e) => {
    renderPlayers(e.target.value);
  });

  // Load players on page load
  loadPlayers();
});
