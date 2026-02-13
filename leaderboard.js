// leaderboard.js

// Define constants for Google Sheets API access
const SHEET_ID = "1IU-KLaDjhjsyvM9NtPFSXt0HSD1rJJZnT8bEJ6klIVs";
const SHEET_TITLE = "Overall_Rank";
const SHEET_RANGE = "A2:H"; // Columns A-H: A=Player, B=Region, C=Pubs, D=Events, E=Speedrun, F=Frontline, G=Support, H=Official_Events

// Construct URL for fetching data from Google Sheets
const FULL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

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

// Fetch data from Overall_Rank sheet
fetch(FULL_SHEET_URL)
  .then(res => res.text())
  .then(async (rep) => {
    // Parse the response to extract JSON data
    const data = JSON.parse(rep.substring(47).slice(0, -2));
    const rows = data.table.rows;

    console.log('Total rows:', rows.length);
    console.log('Full data structure:', data);

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].c || [];

      // Based on Overall_Rank spreadsheet:
      // Column A (index 0) = Player
      // Column B (index 1) = Region
      // Column C (index 2) = Pubs rank points
      // Column D (index 3) = Events rank points
      // Column E (index 4) = Speedrun rank points
      // Column F (index 5) = Frontline rank points
      // Column G (index 6) = Support rank points
      // Column H (index 7) = Official Events rank points
      const player = row[0] && row[0].v ? row[0].v : null;
      const region = row[1] && row[1].v ? row[1].v : 'NA';
      const pubPoints = row[2] && row[2].v !== null && row[2].v !== undefined ? row[2].v : 0;
      const eventPoints = row[3] && row[3].v !== null && row[3].v !== undefined ? row[3].v : 0;
      const speedrunPoints = row[4] && row[4].v !== null && row[4].v !== undefined ? row[4].v : 0;
      const frontlinePoints = row[5] && row[5].v !== null && row[5].v !== undefined ? row[5].v : 0;
      const supportPoints = row[6] && row[6].v !== null && row[6].v !== undefined ? row[6].v : 0;
      const officialEventsPoints = row[7] && row[7].v !== null && row[7].v !== undefined ? row[7].v : 0;
      const userId = null;

      console.log(`Row ${i + 1}: Player=${player}, Region=${region}, Pub=${pubPoints}, Event=${eventPoints}, Speedrun=${speedrunPoints}, Frontline=${frontlinePoints}, Support=${supportPoints}, OfficialEvents=${officialEventsPoints}`);

      // Skip invalid rows
      if (!player) {
        console.log(`Skipping row ${i + 1} - no player name`);
        continue;
      }

      // Points are already extracted from the Overall_Rank sheet columns above

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

    // Fetch avatars with a delay to avoid rate limiting
    const fetchAvatarsWithDelay = async () => {
      for (let i = 0; i < allPlayers.length; i++) {
        const player = allPlayers[i];
        if (player.userId) {
          try {
            const avatarUrl = await getRobloxAvatar(player.userId);
            player.avatarUrl = avatarUrl;
            
            // Update just this player's avatar in the DOM
            renderPlayers(allPlayers);
            
            // Small delay between requests to avoid rate limiting
            if (i < allPlayers.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } catch (error) {
            console.error(`Error fetching avatar for ${player.player}:`, error);
          }
        }
      }
      console.log('All avatars fetched');
    };
    
    // Start fetching avatars
    fetchAvatarsWithDelay();

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
      ? `<img src="${p.avatarUrl}" alt="${p.player} avatar" class="w-12 h-12 rounded-full border-2 border-slate-700" crossorigin="anonymous" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
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