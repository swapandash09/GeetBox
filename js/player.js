// Core Player Functionality for GeetBox
document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const fullPlayPauseBtn = document.getElementById('fullPlayPauseBtn');
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
    const miniPlayer = document.getElementById('miniPlayer');
    const fullPlayer = document.getElementById('fullPlayer');
    const closeFullPlayer = document.getElementById('closeFullPlayer');
    const miniSongName = document.getElementById('miniSongName');
    const miniArtist = document.getElementById('miniArtist');
    const fullSongName = document.getElementById('fullSongName');
    const fullArtist = document.getElementById('fullArtist');
    const miniAlbumArt = document.getElementById('miniAlbumArt');
    const fullAlbumArt = document.getElementById('fullAlbumArt');

    let isPlaying = false;
    let isShuffling = false;
    let isRepeating = false;
    let isMuted = false;
    let currentSongIndex = -1;

    window.geetBox = {
        playSong: (index) => {
            if (index < 0 || index >= window.geetBoxData.songs.length) return;
            currentSongIndex = index;
            const song = window.geetBoxData.songs[index];
            const songUrl = URL.createObjectURL(song.file);
            audioPlayer.src = songUrl;
            audioPlayer.play().then(() => {
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                fullPlayPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                miniSongName.textContent = song.title || song.file.name;
                miniArtist.textContent = song.artist || 'Unknown Artist';
                fullSongName.textContent = song.title || song.file.name;
                fullArtist.textContent = song.artist || 'Unknown Artist';
                miniAlbumArt.style.backgroundImage = song.albumArt ? `url(${song.albumArt})` : '';
                fullAlbumArt.style.backgroundImage = song.albumArt ? `url(${song.albumArt})` : '';
            }).catch(err => console.error('Playback error:', err));
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
                }).catch(err => console.error('Playback error:', err));
            }
        },
        playNext: () => {
            let nextIndex = currentSongIndex + 1;
            if (nextIndex >= window.geetBoxData.songs.length) {
                nextIndex = 0; // Loop to start
            }
            window.geetBox.playSong(nextIndex);
        },
        playPrevious: () => {
            let prevIndex = currentSongIndex - 1;
            if (prevIndex < 0) {
                prevIndex = window.geetBoxData.songs.length - 1; // Loop to end
            }
            window.geetBox.playSong(prevIndex);
        },
        seek: (event, progressBar) => {
            const rect = progressBar.getBoundingClientRect();
            const pos = (event.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = pos * audioPlayer.duration;
        }
    };

    playPauseBtn.addEventListener('click', window.geetBox.togglePlayPause);
    fullPlayPauseBtn.addEventListener('click', window.geetBox.togglePlayPause);
    nextBtn.addEventListener('click', window.geetBox.playNext);
    prevBtn.addEventListener('click', window.geetBox.playPrevious);
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

    speedSelect.addEventListener('change', () => {
        audioPlayer.playbackRate = parseFloat(speedSelect.value);
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100 || 0;
        miniProgressBar.value = progress;
        fullProgressBar.value = progress;
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        duration.textContent = formatTime(audioPlayer.duration);
    });

    audioPlayer.addEventListener('ended', () => {
        if (isRepeating) {
            window.geetBox.playSong(currentSongIndex);
        } else {
            window.geetBox.playNext();
        }
    });

    miniProgressBar.addEventListener('click', (e) => window.geetBox.seek(e, miniProgressBar));
    fullProgressBar.addEventListener('click', (e) => window.geetBox.seek(e, fullProgressBar));

    miniPlayer.addEventListener('click', (e) => {
        if (!e.target.closest('.mini-controls')) {
            fullPlayer.classList.remove('hidden');
        }
    });

    closeFullPlayer.addEventListener('click', () => fullPlayer.classList.add('hidden'));

    // Swipe Gestures for Full Player
    let touchStartX = 0;
    let touchEndX = 0;
    fullPlayer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    fullPlayer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
            window.geetBox.playNext(); // Swipe left for next
        } else if (touchEndX - touchStartX > 50) {
            window.geetBox.playPrevious(); // Swipe right for previous
        }
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
});
