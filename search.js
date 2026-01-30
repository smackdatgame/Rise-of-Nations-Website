// Search Functionality Module
// Handles player search and search results dropdown

(function() {
  'use strict';

  // Initialize search functionality
  function initializeSearch() {
    const playerSearch = document.getElementById('player-search');
    const searchResults = document.getElementById('search-results');

    if (!playerSearch || !searchResults) {
      console.error('Search elements not found');
      return;
    }

    // Player search input handler
    playerSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      
      if (searchTerm.length === 0) {
        searchResults.classList.add('hidden');
        return;
      }

      // Filter players from allPlayers array (defined in leaderboard.js or page-specific leaderboard)
      // Check for allPlayers first, then fall back to page-specific arrays
      let playersArray;
      if (typeof allPlayers !== 'undefined') {
        playersArray = allPlayers;
      } else if (typeof pubPlayers !== 'undefined') {
        playersArray = pubPlayers;
      } else if (typeof eventPlayers !== 'undefined') {
        playersArray = eventPlayers;
      } else if (typeof speedrunPlayers !== 'undefined') {
        playersArray = speedrunPlayers;
      } else if (typeof frontlinePlayers !== 'undefined') {
        playersArray = frontlinePlayers;
      } else if (typeof supportPlayers !== 'undefined') {
        playersArray = supportPlayers;
      } else if (typeof officialEventsPlayers !== 'undefined') {
        playersArray = officialEventsPlayers;
      }

      if (playersArray) {
        const filteredPlayers = playersArray.filter(p => 
          p.player.toLowerCase().includes(searchTerm)
        ).slice(0, 5); // Show max 5 results

        if (filteredPlayers.length > 0) {
          searchResults.innerHTML = filteredPlayers.map(p => {
            const avatarHTML = p.avatarUrl 
              ? `<img src="${p.avatarUrl}" alt="${p.player}" class="w-10 h-10 rounded-full">`
              : `<div class="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">${p.player.charAt(0).toUpperCase()}</div>`;
            
            return `
              <div class="search-result-item px-4 py-3 hover:bg-slate-800/70 cursor-pointer flex items-center gap-3 border-b border-slate-800 last:border-b-0" data-player="${p.player}">
                ${avatarHTML}
                <div class="flex-1">
                  <div class="font-semibold text-white">${p.player}</div>
                  <div class="text-xs text-slate-400">#${p.num} • ${p.totalPoints} points</div>
                </div>
                <span class="px-2 py-1 rounded text-xs ${p.regionBg} ${p.regionText}">${p.region}</span>
              </div>
            `;
          }).join('');
          searchResults.classList.remove('hidden');

          // Add click handlers to search results
          attachSearchResultClickHandlers();
        } else {
          searchResults.innerHTML = '<div class="px-4 py-3 text-center text-slate-400">No players found</div>';
          searchResults.classList.remove('hidden');
        }
      } else {
        console.warn('No player array found. Make sure the leaderboard JavaScript file is loaded first.');
      }
    });

    // Close search results when clicking outside
    document.addEventListener('click', function(event) {
      if (!playerSearch.contains(event.target) && !searchResults.contains(event.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }

  // Attach click handlers to search result items
  function attachSearchResultClickHandlers() {
    const playerSearch = document.getElementById('player-search');
    const searchResults = document.getElementById('search-results');

    // Determine which player array to use
    let playersArray;
    if (typeof allPlayers !== 'undefined') {
      playersArray = allPlayers;
    } else if (typeof pubPlayers !== 'undefined') {
      playersArray = pubPlayers;
    } else if (typeof eventPlayers !== 'undefined') {
      playersArray = eventPlayers;
    } else if (typeof speedrunPlayers !== 'undefined') {
      playersArray = speedrunPlayers;
    } else if (typeof frontlinePlayers !== 'undefined') {
      playersArray = frontlinePlayers;
    } else if (typeof supportPlayers !== 'undefined') {
      playersArray = supportPlayers;
    } else if (typeof officialEventsPlayers !== 'undefined') {
      playersArray = officialEventsPlayers;
    }

    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', function() {
        const playerName = this.getAttribute('data-player');
        const player = playersArray ? playersArray.find(p => p.player === playerName) : null;
        if (player) {
          // Call the global showPlayerModal function
          if (typeof window.showPlayerModal === 'function') {
            window.showPlayerModal(player);
          } else {
            console.error('showPlayerModal function not found');
          }
          searchResults.classList.add('hidden');
          playerSearch.value = '';
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearch);
  } else {
    // DOM is already ready
    initializeSearch();
  }

  // Expose initialization function globally if needed
  window.initializeSearch = initializeSearch;
})();