// Core Player Functionality for GeetBox
document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const fullPlayPauseBtn = document.getElementById('fullPlayPauseBtn');
    const miniPrevBtn = document.getElementById('miniPrevBtn');
    const miniNextBtn = document.getElementById('miniNextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const volume = document.getElementById('volume');
    const muteBtn = document.getElementById('muteBtn');
    const speedSelect = document.getElementById('speedSelect');
    const miniProgressBar = document.getElementById('miniProgressBar');
    const fullProgressBar = document.getElementById('fullProgressBar');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');

    let isPlaying = false;
    let isShuffling = false;
    let isRepeating = false;
    let isMuted = false;

    window.geetBox = {
        playSong: (songUrl) => {
            audioPlayer.src = songUrl;
            if (!isPlaying) {
                audioPlayer.play().then(() => {
                    isPlaying = true;
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    fullPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                }).catch(err => console.error(err));
            }
        },
        togglePlayPause: () => {
            if (isPlaying) {
                audioPlayer.pause();
                isPlaying = false;
                playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                fullPlayPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                audioPlayer.play().then(() => {
                    isPlaying = true;
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    fullPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                }).catch(err => console.error(err));
            }
        },
        seek: (event, progressBar) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (event.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = pos * audioPlayer.duration;
        }
    };

    playPauseBtn.addEventListener('click', geetBox.togglePlayPause);
    fullPlayPauseBtn.addEventListener('click', geetBox.togglePlayPause);
    miniPrevBtn.addEventListener('click', () => console.log('Prev'));
    miniNextBtn.addEventListener('click', () => console.log('Next'));
    prevBtn.addEventListener('click', () => console.log('Prev'));
    nextBtn.addEventListener('click', () => console.log('Next'));
    shuffleBtn.addEventListener('click', () => isShuffling = !isShuffling);
    repeatBtn.addEventListener('click', () => isRepeating = !isRepeating);

    volume.addEventListener('input', () => {
        audioPlayer.volume = volume.value;
        isMuted = volume.value === 0;
        muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-off"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        audioPlayer.volume = isMuted ? 0 : volume.value;
        muteBtn.innerHTML = isMuted ? '<i class="fas fa-volume-off"></i>' : '<i class="fas fa-volume-up"></i>';
    });

    speedSelect.addEventListener('change', () => audioPlayer.playbackRate = parseFloat(speedSelect.value));

    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
        miniProgressBar.value = progress;
        fullProgressBar.value = progress;
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        duration.textContent = formatTime(audioPlayer.duration);
    });

    miniProgressBar.addEventListener('click', (e) => geetBox.seek(e, miniProgressBar));
    fullProgressBar.addEventListener('click', (e) => geetBox.seek(e, fullProgressBar));

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
});
