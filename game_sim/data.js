// Load players from localStorage
export const loadPlayersFromStorage = () => {
  const playersData = localStorage.getItem("playersData");
  if (playersData) {
    try {
      return JSON.parse(playersData).players || [];
    } catch (error) {
      console.error("Error parsing players data from localStorage", error);
      return [];
    }
  }
  return [];
};

