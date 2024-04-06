const gameLocalBtn = document.getElementById('game-local-btn');
const gameOnlineBtn = document.getElementById('game-online-btn');
const gameRequestBtn = document.getElementById('game-friend-btn');

gameLocalBtn.addEventListener('click', () => {
    console.log('gameLocalBtn clicked');
    window.location.href = '../gameLocal/gameLocal.html';
});

gameOnlineBtn.addEventListener('click', () => {
    window.location.href = '../gameOnline/gameOnline.html';
});

gameRequestBtn.addEventListener('click', () => {
    window.location.href = '../friendSelection/friendSelection.html';
});