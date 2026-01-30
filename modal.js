// Player Modal Functionality Module
// Handles displaying player details in a modal

(function() {
  'use strict';

  // Function to show player modal
  window.showPlayerModal = function(player) {
    const playerModal = document.getElementById('player-modal');
    
    if (!playerModal) {
      console.error('Player modal element not found');
      return;
    }

    // Set avatar
    const modalAvatar = document.getElementById('modal-avatar');
    if (player.avatarUrl) {
      modalAvatar.innerHTML = `<img src="${player.avatarUrl}" alt="${player.player}" class="w-full h-full rounded-full object-cover">`;
    } else {
      modalAvatar.innerHTML = `<div class="text-5xl font-bold">${player.player.charAt(0).toUpperCase()}</div>`;
    }

    // Set player name
    document.getElementById('modal-player-name').textContent = player.player;

    // Set title with color
    const modalTitle = document.getElementById('modal-title');
    modalTitle.innerHTML = `
      <i data-lucide="award" class="w-5 h-5"></i>
      <span>${player.title}</span>
    `;
    
    // Update title background based on title
    let titleBg = 'from-gray-600 to-gray-700';
    if (player.title === 'Grandmaster' || player.title === 'Master') titleBg = 'from-yellow-600 to-yellow-700';
    else if (player.title === 'Ace') titleBg = 'from-pink-600 to-pink-700';
    else if (player.title === 'Specialist') titleBg = 'from-purple-600 to-purple-700';
    else if (player.title === 'Cadet' || player.title === 'Novice') titleBg = 'from-blue-600 to-blue-700';
    
    modalTitle.className = `px-4 py-2 bg-gradient-to-r ${titleBg} rounded-full text-white font-semibold flex items-center gap-2`;

    // Set region
    document.getElementById('modal-region').textContent = player.region;

    // Set rank and points
    document.getElementById('modal-rank').textContent = `#${player.num}.`;
    document.getElementById('modal-total-points').textContent = `(${player.totalPoints} points)`;

    // Set tiers
    const modalTiers = document.getElementById('modal-tiers');
    const tierIcons = [
      { icon: 'swords', color: 'text-green-400', bg: 'bg-green-900', value: player.pub, points: player.pubPoints, label: 'Pubs' },
      { icon: 'globe', color: 'text-purple-400', bg: 'bg-purple-900', value: player.event, points: player.eventPoints, label: 'Events' },
      { icon: 'target', color: 'text-red-500', bg: 'bg-red-900', value: player.speedrun, points: player.speedrunPoints, label: 'Speedrun' },
      { icon: 'shield', color: 'text-blue-500', bg: 'bg-blue-900', value: player.frontline, points: player.frontlinePoints, label: 'Frontline' },
      { icon: 'dollar-sign', color: 'text-pink-500', bg: 'bg-pink-900', value: player.support, points: player.supportPoints, label: 'Support' },
      { icon: 'users', color: 'text-cyan-400', bg: 'bg-cyan-900', value: player.officialEvents, points: player.officialEventsPoints, label: 'Official Events' }
    ];

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

    modalTiers.innerHTML = tierIcons.map(tier => {
      const borderColor = getTierBorderColor(tier.value);
      return `
        <div class="flex flex-col items-center gap-1">
          <div class="w-12 h-12 flex items-center justify-center rounded-full border-2 ${borderColor} ${tier.bg}/40 relative shadow-md">
            <i data-lucide="${tier.icon}" class="w-6 h-6 ${tier.color}"></i>
          </div>
          <span class="text-xs font-bold text-white">${tier.value}</span>
          <span class="text-xs text-slate-400">${tier.points || 0}pts</span>
        </div>
      `;
    }).join('');

    playerModal.classList.remove('hidden');
    
    // Re-initialize Lucide icons for the modal content
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      setTimeout(() => lucide.createIcons(), 0);
    }
  };

  // Initialize modal event listeners
  function initializeModal() {
    const playerModal = document.getElementById('player-modal');
    const closeModal = document.getElementById('close-modal');

    if (!playerModal || !closeModal) {
      console.error('Modal elements not found');
      return;
    }

    // Close modal on close button click
    closeModal.addEventListener('click', function() {
      playerModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    playerModal.addEventListener('click', function(e) {
      if (e.target === playerModal) {
        playerModal.classList.add('hidden');
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !playerModal.classList.contains('hidden')) {
        playerModal.classList.add('hidden');
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeModal);
  } else {
    // DOM is already ready
    initializeModal();
  }
})();