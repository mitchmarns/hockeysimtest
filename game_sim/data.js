// Load players from localStorage
export const loadTeamsFromStorage = () => {
  const teamsData = localStorage.getItem("teams");
  console.log('Loaded teams data from localStorage:', teamsData); // Log raw data
  if (teamsData) {
    try {
      return JSON.parse(teamsData) || [];
    } catch (error) {
      console.error("Error parsing teams data from localStorage", error);
      return [];
    }
  }
  return [];
};

// Save players to localStorage
export const savePlayersToStorage = (players) => {
  localStorage.setItem("playersData", JSON.stringify({ players }));
};
