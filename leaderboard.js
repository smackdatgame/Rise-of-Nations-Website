// leaderboard.js

// Define constants for Google Sheets API access
const SHEET_ID = "1IU-KLaDjhjsyvM9NtPFSXt0HSD1rJJZnT8bEJ6klIVs"; // ID of the Google Spreadsheet
const SHEET_TITLE = "Overall_Rank"; // Name of the sheet to fetch data from
const SHEET_RANGE = "A2:I20"; // Start from A2 to skip header row

// Construct the URL for fetching data from Google Sheets
const FULL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

// Initialize an array to store all player data
let allPlayers = [];

// Function to get Roblox avatar headshot using a CORS proxy
async function getRobloxAvatar(userId) {
  if (!userId) {
    console.log('No userId provided');
    return null;
  }
  
  console.log(`Fetching avatar for userId: ${userId}`);
  
  try {
    // Using a CORS proxy to avoid CORS issues
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    const data = await response.json();
    console.log(`Avatar response for ${userId}:`, data);
    
    if (data.data && data.data.length > 0 && data.data[0].state === 'Completed') {
      return data.data[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching avatar for user ${userId}:`, error);
    return null;
  }
}

// Fetch data from the Google Sheet
fetch(FULL_SHEET_URL)
  .then(res => res.text())
  .then(async rep => {
    // Parse the response to extract JSON data (Google Sheets specific parsing)
    const data = JSON.parse(rep.substring(47).slice(0, -2));
    const rows = data.table.rows;

    console.log('Total rows:', rows.length);

    // Process each row starting from index 0 (header already skipped in SHEET_RANGE)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].c || []; // Handle potential missing cells

      // Extract cell values with fallbacks
      const num = row[0] ? row[0].v : (i + 1); // Rank number
      const player = row[1] ? row[1].v : 'Unknown'; // Player name
      const region = row[2] ? row[2].v : 'NA'; // Region
      const pub = row[3] ? row[3].v : 'N/A'; // Pub Tier
      const event = row[4] ? row[4].v : 'N/A'; // Event Tier
      const tournament = row[5] ? row[5].v : 'N/A'; // Tournament Tier
      const eco = row[6] ? row[6].v : 'N/A'; // Eco Tier
      const mp = row[7] ? row[7].v : 'N/A'; // Mp Tier
      const userId = row[8] ? row[8].v : null; // User ID

      console.log(`Row ${i + 1}: Player=${player}, UserId=${userId}`);

      // Skip invalid rows
      if (!player || player === 'Unknown') continue;

      // Helper function to get numeric tier level from string
      function getTierLevel(tier) {
        if (tier === 'N/A') return 0;
        const match = tier.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }

      // Map tier levels to points
      const tierPointsMap = {
        1: 50,
        2: 40,
        3: 30,
        4: 15, // Average for Tier 4
        5: 5   // Average for Tier 5
      };

      // Calculate points for each category
      const pubPoints = tierPointsMap[getTierLevel(pub)] || 0;
      const eventPoints = tierPointsMap[getTierLevel(event)] || 0;
      const tournamentPoints = tierPointsMap[getTierLevel(tournament)] || 0;
      const ecoPoints = tierPointsMap[getTierLevel(eco)] || 0;
      const mpPoints = tierPointsMap[getTierLevel(mp)] || 0;

      // Sum up total points
      const totalPoints = pubPoints + eventPoints + tournamentPoints + ecoPoints + mpPoints;

      // Determine title based on total points
      let title = 'Rookie';
      if (totalPoints >= 250) title = 'Grandmaster';
      else if (totalPoints >= 200) title = 'Master';
      else if (totalPoints >= 150) title = 'Ace';
      else if (totalPoints >= 100) title = 'Specialist';
      else if (totalPoints >= 50) title = 'Cadet';
      else if (totalPoints >= 10) title = 'Novice';

      // Assign color class for title
      let titleColor = 'text-gray-400';
      if (title === 'Grandmaster' || title === 'Master') titleColor = 'text-yellow-400';
      else if (title === 'Ace') titleColor = 'text-pink-500';
      else if (title === 'Specialist') titleColor = 'text-purple-500';
      else if (title === 'Cadet' || title === 'Novice') titleColor = 'text-blue-400';

      // Assign colors for region badge
      let regionBg = 'bg-red-900/50';
      let regionText = 'text-red-300';
      if (region === 'EU') {
        regionBg = 'bg-green-900/50';
        regionText = 'text-green-300';
      }

      // Get Roblox avatar using the User ID from the spreadsheet
      const avatarUrl = await getRobloxAvatar(userId);
      console.log(`Avatar URL for ${player}:`, avatarUrl);

      // Store player data in the array
      allPlayers.push({
        num,
        player,
        region,
        pub,
        event,
        tournament,
        eco,
        mp,
        totalPoints,
        title,
        titleColor,
        regionBg,
        regionText,
        avatarUrl,
        userId
      });
    }

    console.log('All players processed:', allPlayers);

    // Render all players initially
    renderPlayers(allPlayers);

    // Add event listener for search input
    const searchInput = document.querySelector('input[placeholder="Search player..."]');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        // Filter players based on search term
        const filteredPlayers = allPlayers.filter(p => p.player.toLowerCase().includes(searchTerm));
        renderPlayers(filteredPlayers);
      });
    }

    // Initialize Lucide icons
    lucide.createIcons();
  })
  .catch(error => {
    // Log any errors during fetch
    console.error('Error fetching spreadsheet data:', error);
  });

// Function to render players to the DOM
function renderPlayers(players) {
  // Select the container for player rows
  const container = document.querySelector('.mt-4.space-y-3');
  container.innerHTML = ''; // Clear existing content

  // Loop through players and generate HTML
  players.forEach(p => {
    // Define tier icons and their properties
    const tierIcons = [
      { category: 'pub', icon: 'swords', color: 'text-green-400', value: p.pub },
      { category: 'event', icon: 'globe', color: 'text-purple-400', value: p.event },
      { category: 'tournament', icon: 'target', color: 'text-red-500', value: p.tournament },
      { category: 'eco', icon: 'dollar-sign', color: 'text-green-500', value: p.eco },
      { category: 'mp', icon: 'user', color: 'text-purple-500', value: p.mp }
    ];

    // Generate HTML for tiers
    let tiersHTML = '';
    tierIcons.forEach(tier => {
      tiersHTML += `
        <div class="flex flex-col items-center gap-1">
          <div class="w-8 h-8 flex items-center justify-center bg-slate-800/50 rounded-full">
            <i data-lucide="${tier.icon}" class="w-5 h-5 ${tier.color}"></i>
          </div>
          <span class="text-xs font-medium text-slate-400">${tier.value}</span>
        </div>
      `;
    });

    // Generate avatar HTML with fallback
    const avatarHTML = p.avatarUrl 
      ? `<img src="${p.avatarUrl}" alt="${p.player} avatar" class="w-12 h-12 rounded-full border-2 border-slate-700" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border-2 border-slate-700" style="display:none;">${p.player.charAt(0).toUpperCase()}</div>`
      : `<div class="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border-2 border-slate-700">${p.player.charAt(0).toUpperCase()}</div>`;

    // Generate player row HTML
    const rowHTML = `
      <div class="bg-slate-900/50 rounded-xl px-6 py-4 flex items-center">
        <div class="w-16 text-yellow-400 font-bold text-lg">#${p.num}.</div>
        <div class="ml-4">
          ${avatarHTML}
        </div>
        <div class="flex-1 ml-4">
          <h3 class="font-bold text-white text-lg">${p.player}</h3>
          <p class="text-sm ${p.titleColor} flex items-center gap-1">
            <i data-lucide="award" class="w-4 h-4"></i>
            Combat ${p.title} (${p.totalPoints} points)
          </p>
        </div>
        <div class="w-32 text-center">
          <span class="px-4 py-1.5 rounded-full text-sm font-medium ${p.regionBg} ${p.regionText}">${p.region}</span>
        </div>
        <div class="flex-1 flex justify-end gap-4">
          ${tiersHTML}
        </div>
      </div>
    `;

    // Append row to container
    container.innerHTML += rowHTML;
  });

  // Re-initialize Lucide icons after updating DOM
  lucide.createIcons();
}