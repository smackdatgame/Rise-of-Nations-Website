// leaderboard.js

const SHEET_ID = "1IU-KLaDjhjsyvM9NtPFSXt0HSD1rJJZnT8bEJ6klIVs";
const SHEET_TITLE = "MpMax_Rank";
const SHEET_RANGE = "A2:F20"; // Extended to column F for User ID and skip header

const FULL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

// Function to get Roblox avatar headshot using a CORS proxy
async function getRobloxAvatar(userId) {
  if (!userId) return null;
  
  try {
    const proxyUrl = 'https://corsproxy.io/?';
    const apiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`;
    
    const response = await fetch(proxyUrl + encodeURIComponent(apiUrl));
    const data = await response.json();
    
    if (data.data && data.data.length > 0 && data.data[0].state === 'Completed') {
      return data.data[0].imageUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching avatar for user ${userId}:`, error);
    return null;
  }
}

fetch(FULL_SHEET_URL)
  .then(res => res.text())
  .then(async rep => {
    const data = JSON.parse(rep.substring(47).slice(0, -2));
    const rows = data.table.rows;
    const container = document.querySelector('.mt-4.space-y-3');

    // Clear existing content if any
    container.innerHTML = '';
    container.classList.remove('space-y-3');
    container.classList.add('flex', 'gap-4', 'overflow-x-auto');

    // Function to extract tier level number
    function getTierLevel(tier) {
      if (tier === 'N/A' || !tier) return 0;
      const match = tier.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    }

    // Group players by tier
    let tierGroups = {1: [], 2: [], 3: [], 4: [], 5: []};

    // Process rows (header already skipped in SHEET_RANGE)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] ? rows[i].c : null;
      if (!row || !row[1] || !row[1].v) continue; // Skip empty or invalid rows

      const num = row[0] ? row[0].v : (i + 1);
      const player = row[1].v;
      const region = row[2] ? row[2].v : 'NA';
      const MpMaxTier = row[3] ? row[3].v : 'N/A';
      const points = row[4] ? row[4].v : 0;
      const userId = row[5] ? row[5].v : null; // User ID from column F

      const tierLevel = getTierLevel(MpMaxTier);
      if (tierLevel >= 1 && tierLevel <= 5) {
        // Fetch avatar for each player
        const avatarUrl = await getRobloxAvatar(userId);
        
        tierGroups[tierLevel].push({
          player, 
          region, 
          points, 
          num, 
          userId, 
          avatarUrl
        });
      }
    }

    // Sort each tier group by points descending, then by num ascending
    for (let t = 1; t <= 5; t++) {
      tierGroups[t].sort((a, b) => b.points - a.points || a.num - b.num);
    }

    // Build HTML for tier columns
    let html = '';
    for (let t = 1; t <= 5; t++) {
      html += `
        <div class="flex-1 min-w-[180px] bg-slate-900/50 rounded-xl overflow-hidden">
          <h3 class="bg-amber-900/70 text-center font-bold text-white py-2 flex justify-center items-center gap-1">
            <span>🏆</span> Tier ${t}
          </h3>
          <ul class="p-4 space-y-3">
      `;

      if (tierGroups[t].length === 0) {
        html += '<li class="text-center text-slate-400 text-sm">No players yet</li>';
      } else {
        tierGroups[t].forEach((p, index) => {
          // Generate avatar HTML with fallback
          const avatarHTML = p.avatarUrl 
            ? `<img src="${p.avatarUrl}" alt="${p.player} avatar" class="w-8 h-8 rounded" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold text-xs" style="display:none;">${p.player.charAt(0).toUpperCase()}</div>`
            : `<div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-white font-bold text-xs">${p.player.charAt(0).toUpperCase()}</div>`;
          
          html += `
            <li class="flex items-center gap-3 justify-between">
              <div class="flex items-center gap-3">
                ${avatarHTML}
                <span class="text-white font-medium">${p.player}</span>
              </div>
              <span class="text-amber-400 font-semibold">${p.points}</span>
            </li>
          `;
        });
      }

      html += '</ul></div>';
    }

    container.innerHTML = html;
  })
  .catch(error => {
    console.error('Error fetching spreadsheet data:', error);
    // Optionally, display an error message in the UI
  });