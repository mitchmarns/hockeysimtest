document.addEventListener("DOMContentLoaded", () => {
  const playersContainer = document.getElementById("players-container");
  const teamFilter = document.getElementById("team-filter");

  let playersData = { players: [] };
  const teams = ["Rangers", "Devils", "Islanders", "Sabres"];

const loadPlayers = async () => {
  try {
    const savedData = localStorage.getItem("playersData");
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // Check if the data is an array (old structure)
      if (Array.isArray(parsedData)) {
        // Fix old structure (array of players)
        playersData = { players: parsedData };  // Wrapping the array into the correct structure
        localStorage.setItem("playersData", JSON.stringify(playersData)); // Save in the correct structure
      } else if (parsedData && parsedData.players && Array.isArray(parsedData.players)) {
        // Valid structure
        playersData = parsedData;
      } else {
        console.error("Invalid localStorage data structure");
        playersData = { players: [] }; // Default empty structure
      }
    } else {
      // No data in localStorage, fetch from players.json
      const response = await fetch("players.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch players.json: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.players && Array.isArray(data.players)) {
        playersData = data; // Valid structure
        localStorage.setItem("playersData", JSON.stringify(playersData)); // Save it in the correct structure
      } else {
        console.error("Invalid players.json structure");
        playersData = { players: [] }; // Default empty structure
      }
    }

    // After loading, check the structure of playersData
    console.log("playersData loaded: ", playersData); // Debugging log
    renderPlayers("all");
  } catch (error) {
    console.error("Error loading players:", error);
    playersData = { players: [] }; // Fallback to empty structure
    renderPlayers("all");
  }
}
});

  // Save updated data to localStorage
  const savePlayers = () => {
    localStorage.setItem("playersData", JSON.stringify({ players: playersData }));
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
    teamSelects.forEach(select => {
      select.addEventListener("change", (e) => {
        const playerId = parseInt(e.target.getAttribute("data-id"));
        const selectedTeam = e.target.value;

        // Update player's team
        const player = playersData.players.find(p => p.id === playerId);
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
