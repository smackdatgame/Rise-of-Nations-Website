// leaderboard.js

const SHEET_ID = "1IU-KLaDjhjsyvM9NtPFSXt0HSD1rJJZnT8bEJ6klIVs";
const SHEET_TITLE = "Overall_Rank";
const SHEET_RANGE = "A1:H20";

const FULL_SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}&range=${SHEET_RANGE}`;

fetch(FULL_SHEET_URL)
  .then(res => res.text())
  .then(rep => {
    const data = JSON.parse(rep.substring(47).slice(0, -2));
    const rows = data.table.rows;
    const container = document.querySelector('.mt-4.space-y-3');

    // Clear existing content if any
    container.innerHTML = '';

    // Skip header row (i=0)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].c;

      // Extract data, handling possible null values
      const num = row[0] ? row[0].v : '';
      const player = row[1] ? row[1].v : 'Unknown';
      const region = row[2] ? row[2].v : 'NA';
      const pub = row[3] ? row[3].v : 'N/A';
      const event = row[4] ? row[4].v : 'N/A';
      const tournament = row[5] ? row[5].v : 'N/A';
      const eco = row[6] ? row[6].v : 'N/A';
      const mp = row[7] ? row[7].v : 'N/A';

      // Function to extract tier level number
      function getTierLevel(tier) {
        if (tier === 'N/A') return 0;
        const match = tier.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      }

      // Points mapping based on tier level
      const tierPointsMap = {
        1: 50,
        2: 40,
        3: 30,
        4: 15,  // Average of 10-19
        5: 5    // Average of 1-9
      };

      // Calculate points for each category
      const pubPoints = tierPointsMap[getTierLevel(pub)] || 0;
      const eventPoints = tierPointsMap[getTierLevel(event)] || 0;
      const tournamentPoints = tierPointsMap[getTierLevel(tournament)] || 0;
      const ecoPoints = tierPointsMap[getTierLevel(eco)] || 0;
      const mpPoints = tierPointsMap[getTierLevel(mp)] || 0;

      const totalPoints = pubPoints + eventPoints + tournamentPoints + ecoPoints + mpPoints;

      // Determine title based on total points
      let title = 'Rookie';
      if (totalPoints >= 250) title = 'Grandmaster';
      else if (totalPoints >= 200) title = 'Master';
      else if (totalPoints >= 150) title = 'Ace';
      else if (totalPoints >= 100) title = 'Specialist';
      else if (totalPoints >= 50) title = 'Cadet';
      else if (totalPoints >= 10) title = 'Novice';

      // Title color class
      let titleColor = 'text-gray-400';
      if (title === 'Grandmaster' || title === 'Master') titleColor = 'text-yellow-400';
      else if (title === 'Ace') titleColor = 'text-pink-500';
      else if (title === 'Specialist') titleColor = 'text-purple-500';
      else if (title === 'Cadet' || title === 'Novice') titleColor = 'text-blue-400';

      // Region color
      let regionBg = 'bg-red-900/50';
      let regionText = 'text-red-300';
      if (region === 'EU') {
        regionBg = 'bg-green-900/50';
        regionText = 'text-green-300';
      }

      // Tier icons and colors (customized to match common themes)
      const tierIcons = [
        { category: 'pub', icon: 'swords', color: 'text-green-400', value: pub },
        { category: 'event', icon: 'globe', color: 'text-purple-400', value: event },
        { category: 'tournament', icon: 'target', color: 'text-red-500', value: tournament },
        { category: 'eco', icon: 'dollar-sign', color: 'text-green-500', value: eco },
        { category: 'mp', icon: 'user', color: 'text-purple-500', value: mp }
      ];

      // Generate tiers HTML
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

      // Player row HTML
      const rowHTML = `
        <div class="bg-slate-900/50 rounded-xl px-6 py-4 flex items-center">
          <div class="w-16 text-yellow-400 font-bold text-lg">#${num}.</div>
          <div class="flex-1 ml-4">
            <h3 class="font-bold text-white text-lg">${player}</h3>
            <p class="text-sm ${titleColor} flex items-center gap-1">
              <i data-lucide="award" class="w-4 h-4"></i>
              Combat ${title} (${totalPoints} points)
            </p>
          </div>
          <div class="w-32 text-center">
            <span class="px-4 py-1.5 rounded-full text-sm font-medium ${regionBg} ${regionText}">${region}</span>
          </div>
          <div class="flex-1 flex justify-end gap-4">
            ${tiersHTML}
          </div>
        </div>
      `;

      container.innerHTML += rowHTML;
    }

    // Re-initialize Lucide icons after adding dynamic content
    lucide.createIcons();
  })
  .catch(error => {
    console.error('Error fetching spreadsheet data:', error);
    // Optionally, display an error message in the UI
  });