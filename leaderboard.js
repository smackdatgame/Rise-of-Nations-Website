// leaderboard.js

// Define constants for Google Sheets API access
const SHEET_ID = "1IU-KLaDjhjsyvM9NtPFSXt0HSD1rJJZnT8bEJ6klIVs";
const SHEET_TITLE = "Overall_Rank";
const SHEET_RANGE = "A2:D"; // Start from A2 to skip header, include columns A-D

// Define all ranking sheets with proper ranges
const PUBS_SHEET_TITLE = "Pubs_Rank";
const PUBS_SHEET_RANGE = "A2:E"; // Include Points column (E)

const EVENTS_SHEET_TITLE = "Events_Rank";
const EVENTS_SHEET_RANGE = "A2:E";

const SPEEDRUN_SHEET_TITLE = "Speedrun_Rank";
const SPEEDRUN_SHEET_RANGE = "A2:E";

const FRONTLINE_SHEET_TITLE = "Frontline_Rank";
const FRONTLINE_SHEET_RANGE = "A2:E";

const SUPPORT_SHEET_TITLE = "Support_Rank";
const SUPPORT_SHEET_RANGE = "A2:E";

const OFFICIAL_EVENTS_SHEET_TITLE = "Official_Events_Rank";
const OFFICIAL_EVENTS_SHEET_RANGE = "A2:E";

// Construct URLs for fetching data from Google Sheets
const FULL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;
const PUBS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${PUBS_SHEET_TITLE}&range=${PUBS_SHEET_RANGE}`;
const EVENTS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${EVENTS_SHEET_TITLE}&range=${EVENTS_SHEET_RANGE}`;
const SPEEDRUN_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SPEEDRUN_SHEET_TITLE}&range=${SPEEDRUN_SHEET_RANGE}`;
const FRONTLINE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${FRONTLINE_SHEET_TITLE}&range=${FRONTLINE_SHEET_RANGE}`;
const SUPPORT_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SUPPORT_SHEET_TITLE}&range=${SUPPORT_SHEET_RANGE}`;
const OFFICIAL_EVENTS_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${OFFICIAL_EVENTS_SHEET_TITLE}&range=${OFFICIAL_EVENTS_SHEET_RANGE}`;

// Initialize an array to store all player data
let allPlayers = [];

// Function to convert points to tier string
function pointsToTier(points) {
  if (!points || points === 0) return 'N/A';
  if (points >= 60) return 'HT1';
  else if (points >= 45) return 'LT1';
  else if (points >= 30) return 'HT2';
  else if (points >= 20) return 'LT2';
  else if (points >= 10) return 'HT3';
  else if (points >= 6) return 'LT3';
  else if (points >= 4) return 'HT4';
  else if (points >= 3) return 'LT4';
  else if (points >= 2) return 'HT5';
  else if (points >= 1) return 'LT5';
  return 'N/A';
}
// Function to get Roblox avatar headshot using a CORS proxy
async function getRobloxAvatar(userId) {
  if (!userId) {
    console.log('No userId provided');
    return null;
  }
  
  console.log(`Fetching avatar for userId: ${userId}`);
  
  try {
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
async function fetchRankingPoints(sheetUrl, sheetName) {
  try {
    const response = await fetch(sheetUrl);
    const text = await response.text();
    const data = JSON.parse(text.substring(47).slice(0, -2));
    const rows = data.table.rows;
    
    // Create a map of player name to points
    const pointsMap = {};
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] ? rows[i].c : null;
      if (!row) continue;
      
      // Column A (index 0) = Player name
      // Column C (index 2) = Points
      const player = row[0] && row[0].v ? row[0].v : null;
      const points = row[2] && row[2].v !== null ? row[2].v : 0;
      
      if (player) {
        pointsMap[player] = points;
      }
    }
    
    console.log(`${sheetName} points map:`, pointsMap);
    return pointsMap;
  } catch (error) {
    console.error(`Error fetching ${sheetName} data:`, error);
    return {};
  }
}

// Fetch data from all sheets
Promise.all([
  fetch(FULL_SHEET_URL).then(res => res.text()),
  fetchRankingPoints(PUBS_SHEET_URL, 'Pubs_Rank'),
  fetchRankingPoints(EVENTS_SHEET_URL, 'Events_Rank'),
  fetchRankingPoints(SPEEDRUN_SHEET_URL, 'Speedrun_Rank'),
  fetchRankingPoints(FRONTLINE_SHEET_URL, 'Frontline_Rank'),
  fetchRankingPoints(SUPPORT_SHEET_URL, 'Support_Rank'),
  fetchRankingPoints(OFFICIAL_EVENTS_SHEET_URL, 'Official_Events_Rank')
])
  .then(async ([rep, pubsPointsMap, eventsPointsMap, speedrunPointsMap, frontlinePointsMap, supportPointsMap, officialEventsPointsMap]) => {
    // Parse the response to extract JSON data
    const data = JSON.parse(rep.substring(47).slice(0, -2));
    const rows = data.table.rows;

    console.log('Total rows:', rows.length);
    console.log('Full data structure:', data);

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].c || [];

      // Based on your spreadsheet:
      // Column A (index 0) = Player
      // Column B (index 1) = Region
      // Column C (index 2) = User ID (not column I/index 8)
      const player = row[0] && row[0].v ? row[0].v : null;
      const region = row[1] && row[1].v ? row[1].v : 'NA';
      const userId = row[2] && row[2].v ? String(row[2].v) : null;

      console.log(`Row ${i + 1}: Player=${player}, Region=${region}, UserId=${userId}`);

      // Skip invalid rows
      if (!player) {
        console.log(`Skipping row ${i + 1} - no player name`);
        continue;
      }

      // Get points from respective ranking sheets
      const pubPoints = pubsPointsMap[player] || 0;
      const eventPoints = eventsPointsMap[player] || 0;
      const speedrunPoints = speedrunPointsMap[player] || 0;
      const frontlinePoints = frontlinePointsMap[player] || 0;
      const supportPoints = supportPointsMap[player] || 0;
      const officialEventsPoints = officialEventsPointsMap[player] || 0;

      // Convert points to tier strings
      const pub = pointsToTier(pubPoints);
      const event = pointsToTier(eventPoints);
      const speedrun = pointsToTier(speedrunPoints);
      const frontline = pointsToTier(frontlinePoints);
      const support = pointsToTier(supportPoints);
      const officialEvents = pointsToTier(officialEventsPoints);

      // Sum up total points
      const totalPoints = pubPoints + eventPoints + speedrunPoints + frontlinePoints + supportPoints + officialEventsPoints;

      console.log(`${player}: pub=${pubPoints}(${pub}), event=${eventPoints}(${event}), speedrun=${speedrunPoints}(${speedrun}), frontline=${frontlinePoints}(${frontline}), support=${supportPoints}(${support}), officialEvents=${officialEventsPoints}(${officialEvents}), total=${totalPoints}`);

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
      if (title === 'Grandmaster') titleColor = 'text-yellow-400';
      else if (title === 'Master') titleColor = 'text-yellow-500';
      else if (title === 'Ace') titleColor = 'text-pink-500';
      else if (title === 'Specialist') titleColor = 'text-purple-500';
      else if (title === 'Cadet') titleColor = 'text-blue-400';
      else if (title === 'Novice') titleColor = 'text-blue-400';

      // Assign colors for region badge
      let regionBg = 'bg-red-900/50';
      let regionText = 'text-red-300';
      if (region === 'EU') {
        regionBg = 'bg-green-900/50';
        regionText = 'text-green-300';
      } else if (region === 'ASIA') {
        regionBg = 'bg-blue-900/50';
        regionText = 'text-blue-300';
      } else if (region === 'OC') {
        regionBg = 'bg-purple-900/50';
        regionText = 'text-purple-300';
      } else if (region === 'AFRICA' || region === 'AF') {
        regionBg = 'bg-orange-900/50';
        regionText = 'text-orange-300';
      }

      // Store userId for parallel avatar fetching later
      const avatarUrl = null;

      // Store player data
      allPlayers.push({
        num: 0,
        player,
        region,
        pub,
        event,
        speedrun,
        frontline,
        support,
        officialEvents,
        totalPoints,
        title,
        titleColor,
        regionBg,
        regionText,
        avatarUrl,
        userId,
        pubPoints,
        eventPoints,
        speedrunPoints,
        frontlinePoints,
        supportPoints,
        officialEventsPoints
      });
    }

    console.log('All players processed:', allPlayers);

    // Sort players by total points (highest to lowest)
    allPlayers.sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Reassign rank numbers
    allPlayers.forEach((player, index) => {
      player.num = index + 1;
    });

    console.log('Players sorted and ranked:', allPlayers);

    // Render all players with fallback avatars (initials) first
    renderPlayers(allPlayers);

    // Fetch all avatars in parallel
    const avatarPromises = allPlayers.map(player => 
      player.userId ? getRobloxAvatar(player.userId) : Promise.resolve(null)
    );
    
    Promise.all(avatarPromises).then(avatarUrls => {
      // Update player avatars with fetched URLs
      allPlayers.forEach((player, index) => {
        player.avatarUrl = avatarUrls[index];
      });
      
      console.log('All avatars fetched:', allPlayers);
      
      // Re-render players with actual avatars
      renderPlayers(allPlayers);
    }).catch(error => {
      console.error('Error fetching avatars in parallel:', error);
    });

    // Add event listener for search input
    const searchInput = document.querySelector('input[placeholder="Search player..."]');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const filteredPlayers = allPlayers.filter(p => 
          p.player.toLowerCase().includes(searchTerm)
        );
        renderPlayers(filteredPlayers);
      });
    }

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  })
  .catch(error => {
    console.error('Error fetching spreadsheet data:', error);
    // Display error message to user
    const container = document.querySelector('.mt-4.space-y-3');
    if (container) {
      container.innerHTML = `
        <div class="bg-red-900/50 rounded-xl px-6 py-4 text-center">
          <p class="text-red-300 font-medium">Error loading leaderboard data</p>
          <p class="text-red-400 text-sm mt-2">${error.message}</p>
        </div>
      `;
    }
  });

// Function to render players to the DOM
function renderPlayers(players) {
  const container = document.querySelector('.mt-4.space-y-3');
  if (!container) {
    console.error('Container not found');
    return;
  }
  
  container.innerHTML = '';

  // Function to get tier border color
  const getTierBorderColor = (tier) => {
    switch(tier) {
      case 'HT1': return 'border-yellow-200';
      case 'LT1': return 'border-yellow-500';
      case 'HT2': return 'border-gray-200';
      case 'LT2': return 'border-gray-400';
      case 'HT3': return 'border-orange-500';
      case 'LT3': return 'border-orange-800';
      case 'HT4': return 'border-gray-600';
      case 'LT4': return 'border-gray-600';
      case 'HT5': return 'border-gray-800';
      case 'LT5': return 'border-gray-800';
      default: return 'border-slate-700';
    }
  };

  // Loop through players and generate HTML
  players.forEach(p => {
    // Define tier icons and their properties
    const tierIcons = [
      { category: 'pub', icon: 'swords', color: 'text-green-400', value: p.pub },
      { category: 'event', icon: 'user', color: 'text-purple-400', value: p.event },
      { category: 'speedrun', icon: 'zap', color: 'text-red-500', value: p.speedrun },
      { category: 'frontline', icon: 'shield', color: 'text-blue-500', value: p.frontline },
      { category: 'support', icon: 'dollar-sign', color: 'text-pink-500', value: p.support },
      { category: 'officialEvents', icon: 'globe', color: 'text-cyan-400', value: p.officialEvents }
    ];

    // Generate HTML for tiers
    let tiersHTML = '';
    tierIcons.forEach(tier => {
      const borderColor = getTierBorderColor(tier.value);
      tiersHTML += `
        <div class="flex flex-col items-center gap-1">
          <div class="w-10 h-10 flex items-center justify-center rounded-full border-2 ${borderColor} bg-slate-900/80">
            <i data-lucide="${tier.icon}" class="w-5 h-5 ${tier.color}"></i>
          </div>
          <span class="text-xs font-medium text-slate-400">${tier.value}</span>
        </div>
      `;
    });

    // Generate avatar HTML with fallback to initials
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
            ${p.title} (${p.totalPoints} points)
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

    container.innerHTML += rowHTML;
  });

  // Re-initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}