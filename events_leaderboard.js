// events_leaderboard.js

const SHEET_ID = "1IU-KLaDjhjsyvM9NtPFSXt0HSD1rJJZnT8bEJ6klIVs";
const SHEET_TITLE = "Events_Rank";
const SHEET_RANGE = "A2:D"; // Columns A-D starting from row 2 to skip header

const FULL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

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

// Function to determine tier based on points
function getTierFromPoints(points) {
  if (points >= 60) return 1;      // HT1: 60+ points
  else if (points >= 45) return 1; // LT1: 45-59 points
  else if (points >= 30) return 2; // HT2: 30-44 points
  else if (points >= 20) return 2; // LT2: 20-29 points
  else if (points >= 10) return 3; // HT3: 10-19 points
  else if (points >= 6) return 3;  // LT3: 6-9 points
  else if (points >= 4) return 4;  // HT4: 4-5 points
  else if (points >= 3) return 4;  // LT4: 3 points
  else if (points >= 2) return 5;  // HT5: 2 points
  else if (points >= 1) return 5;  // LT5: 1 point
  return 0; // No tier for 0 points
}

// Function to get tier header background color
function getTierHeaderBg(tier) {
  switch(tier) {
    case 1: return 'bg-gradient-to-r from-yellow-600 to-yellow-700'; // Gold
    case 2: return 'bg-gradient-to-r from-gray-400 to-gray-500'; // Silver
    case 3: return 'bg-gradient-to-r from-orange-700 to-orange-800'; // Bronze
    case 4: return 'bg-gradient-to-r from-gray-600 to-gray-700'; // Grey
    case 5: return 'bg-gradient-to-r from-gray-700 to-gray-800'; // Dark Grey
    default: return 'bg-amber-900/70';
  }
}

// Function to get tier points text color
function getTierPointsColor(tier) {
  switch(tier) {
    case 1: return 'text-yellow-400'; // Gold
    case 2: return 'text-gray-300'; // Silver
    case 3: return 'text-orange-400'; // Bronze
    case 4: return 'text-gray-400'; // Grey
    case 5: return 'text-gray-500'; // Dark Grey
    default: return 'text-amber-400';
  }
}

fetch(FULL_SHEET_URL)
  .then(res => res.text())
  .then(async rep => {
    const data = JSON.parse(rep.substring(47).slice(0, -2));
    const rows = data.table.rows;
    const container = document.querySelector('.mt-4.space-y-3');

    console.log('Total rows:', rows.length);
    console.log('Data structure:', data);

    // Clear existing content if any
    container.innerHTML = '';
    container.classList.remove('space-y-3');
    container.classList.add('flex', 'gap-4', 'overflow-x-auto');

    // Group players by tier
    let tierGroups = {1: [], 2: [], 3: [], 4: [], 5: []};

    // Process rows
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] ? rows[i].c : null;
      if (!row) {
        console.log(`Row ${i + 1}: Empty row, skipping`);
        continue;
      }

      // Based on your spreadsheet structure:
      // Column A (index 0) = Player
      // Column B (index 1) = Region
      // Column C (index 2) = Points
      // Column D (index 3) = User ID
      const player = row[0] && row[0].v ? row[0].v : null;
      const region = row[1] && row[1].v ? row[1].v : 'NA';
      const points = row[2] && row[2].v !== null && row[2].v !== undefined ? row[2].v : 0;
      const userId = row[3] && row[3].v ? String(row[3].v) : null;

      console.log(`Row ${i + 1}: Player=${player}, Region=${region}, Points=${points}, UserId=${userId}`);

      // Skip if no player name
      if (!player) {
        console.log(`Row ${i + 1}: No player name, skipping`);
        continue;
      }

      // Determine tier based on points
      const tierLevel = getTierFromPoints(points);

      console.log(`${player}: Points=${points}, Tier=${tierLevel}`);

      if (tierLevel >= 1 && tierLevel <= 5) {
        // Fetch avatar for each player
        const avatarUrl = await getRobloxAvatar(userId);
        
        tierGroups[tierLevel].push({
          player, 
          region, 
          points, 
          num: i + 1, // Row number for sorting
          userId, 
          avatarUrl
        });
      }
    }

    console.log('Tier groups:', tierGroups);

    // Sort each tier group by points descending, then by num ascending
    for (let t = 1; t <= 5; t++) {
      tierGroups[t].sort((a, b) => b.points - a.points || a.num - b.num);
    }

    // Build HTML for tier columns
    let html = '';
    for (let t = 1; t <= 5; t++) {
      const headerBg = getTierHeaderBg(t);
      const pointsColor = getTierPointsColor(t);
      
      html += `
        <div class="flex-1 min-w-[200px] bg-slate-900/50 rounded-xl overflow-hidden">
          <h3 class="${headerBg} text-center font-bold text-white py-3 flex justify-center items-center gap-2">
            <span>🏆</span> Tier ${t}
          </h3>
          <ul class="p-4 space-y-3">
      `;

      if (tierGroups[t].length === 0) {
        html += '<li class="text-center text-slate-400 text-sm py-4">No players yet</li>';
      } else {
        tierGroups[t].forEach((p, index) => {
          // Generate avatar HTML with fallback
          const avatarHTML = p.avatarUrl 
            ? `<img src="${p.avatarUrl}" alt="${p.player} avatar" class="w-10 h-10 rounded-lg border-2 border-slate-700" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold border-2 border-slate-700" style="display:none;">${p.player.charAt(0).toUpperCase()}</div>`
            : `<div class="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-white font-bold border-2 border-slate-700">${p.player.charAt(0).toUpperCase()}</div>`;
          
          html += `
            <li class="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between hover:bg-slate-800/70 transition-colors">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                ${avatarHTML}
                <div class="flex flex-col min-w-0">
                  <span class="text-white font-semibold truncate">${p.player}</span>
                  <span class="text-slate-400 text-xs">${p.region}</span>
                </div>
              </div>
              <span class="${pointsColor} font-bold text-lg">${p.points}</span>
            </li>
          `;
        });
      }

      html += '</ul></div>';
    }

    container.innerHTML = html;
    console.log('Leaderboard rendered successfully');
  })
  .catch(error => {
    console.error('Error fetching spreadsheet data:', error);
    const container = document.querySelector('.mt-4.space-y-3');
    if (container) {
      container.innerHTML = `
        <div class="bg-red-900/50 rounded-xl px-6 py-4 text-center">
          <p class="text-red-300 font-medium">Error loading Events leaderboard data</p>
          <p class="text-red-400 text-sm mt-2">${error.message}</p>
        </div>
      `;
    }
  });