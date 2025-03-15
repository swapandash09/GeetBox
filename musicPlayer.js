// Core Music Player Functionality for GeetBox

document.addEventListener('DOMContentLoaded', () => {
    console.log("Loading core music player functionality for GeetBox...");

    // Elements
    const fileInput = document.getElementById('fileInput');
    const addSongsBtn = document.getElementById('addSongsBtn');
    const localSongsList = document.getElementById('localSongsList');
    const recentlyPlayedList = document.getElementById('recentlyPlayedList');
    const queueList = document.getElementById('queueList');
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const fullPlayPauseBtn = document.getElementById('fullPlayPauseBtn');
    const miniProgressBar = document.getElementById('miniProgressBar');
    const fullProgressBar = document.getElementById('fullProgressBar');
    const miniSongName = document.getElementById('miniSongName');
    const miniArtist = document.getElementById('miniArtist');
    const miniAlbumArt = document.getElementById('miniAlbumArt');
    const fullSongName = document.getElementById('fullSongName');
    const fullArtist = document.getElementById('fullArtist');
    const fullAlbumArt = document.getElementById('fullAlbumArt');
    const miniPlayer = document.getElementById('miniPlayer');
    const fullPlayer = document.getElementById('fullPlayer');
    const closeFullPlayer = document.getElementById('closeFullPlayer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const volume = document.getElementById('volume');
    const speedSelect = document.getElementById('speedSelect');
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    const lyricsText = document.getElementById('lyricsText');

    // Debugging: Check if elements are found
    if (!audioPlayer) {
        console.error("Audio player element not found.");
        return;
    }

    let songs = [];
    let currentSongIndex = 0;
    let isShuffling = false;
    let isRepeating = false;
    let recentlyPlayed = JSON.parse(localStorage.getItem('recentlyPlayed')) || [];
    let queue = [];
    let albumArtCache = {};

    // Add Songs Button
    addSongsBtn.addEventListener('click', () => {
        console.log("Add Songs button clicked.");
        fileInput.click();
    });

    // Extract Album Art
    function extractAlbumArt(file, callback) {
        jsmediatags.read(file, {
            onSuccess: (tag) => {
                const picture = tag.tags.picture;
                if (picture) {
                    const base64String = btoa(
                        picture.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
                    );
                    const imageUrl = `data:${picture.format};base64,${base64String}`;
                    albumArtCache[file.name] = imageUrl;
                    callback(imageUrl);
                } else {
                    callback(null);
                }
            },
            onError: (error) => {
                console.error("Error reading metadata:", error);
                callback(null);
            }
        });
    }

    // Load Local Files
    fileInput.addEventListener('change', () => {
        console.log("File input changed. Loading songs...");
        songs = Array.from(fileInput.files);
        if (songs.length === 0) {
            console.warn("No songs selected.");
            return;
        }
        songs.forEach(song => {
            queue.push(song);
            extractAlbumArt(song, (imageUrl) => {
                if (imageUrl) {
                    albumArtCache[song.name] = imageUrl;
                }
            });
        });
        loadLocalSongs();
        loadQueue();
        playSong(currentSongIndex);
    });

    function loadLocalSongs(filteredSongs = songs) {
        console.log("Loading local songs:", filteredSongs);
        localSongsList.innerHTML = '';
        filteredSongs.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="album-art" id="albumArt-${index}">🎵</div>
                <p>${song.name}</p>
                <span>Local File</span>
            `;
            card.addEventListener('click', () => playSong(index));
            localSongsList.appendChild(card);

            // Set album art
            const albumArtElement = document.getElementById(`albumArt-${index}`);
            if (albumArtCache[song.name]) {
                albumArtElement.style.backgroundImage = `url(${albumArtCache[song.name]})`;
                albumArtElement.innerHTML = '';
            }
        });
    }

    function loadRecentlyPlayed() {
        console.log("Loading recently played songs:", recentlyPlayed);
        recentlyPlayedList.innerHTML = '';
        recentlyPlayed.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="album-art" id="recentAlbumArt-${index}">🎵</div>
                <p>${song.name}</p>
                <span>Local File</span>
            `;
            card.addEventListener('click', () => {
                const songIndex = songs.findIndex(s => s.name === song.name);
                if (songIndex !== -1) playSong(songIndex);
            });
            recentlyPlayedList.appendChild(card);

            // Set album art
            const albumArtElement = document.getElementById(`recentAlbumArt-${index}`);
            if (albumArtCache[song.name]) {
                albumArtElement.style.backgroundImage = `url(${albumArtCache[song.name]})`;
                albumArtElement.innerHTML = '';
            }
        });
    }

    function loadQueue() {
        console.log("Loading queue:", queue);
        queueList.innerHTML = '';
        queue.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="album-art" id="queueAlbumArt-${index}">🎵</div>
                <p>${song.name}</p>
                <span>Local File</span>
            `;
            card.addEventListener('click', () => {
                currentSongIndex = songs.findIndex(s => s.name === song.name);
                playSong(currentSongIndex);
            });
            queueList.appendChild(card);

            // Set album art
            const albumArtElement = document.getElementById(`queueAlbumArt-${index}`);
            if (albumArtCache[song.name]) {
                albumArtElement.style.backgroundImage = `url(${albumArtCache[song.name]})`;
                albumArtElement.innerHTML = '';
            }
        });
    }

    function playSong(index) {
        console.log("Playing song at index:", index);
        if (!songs || songs.length === 0) {
            console.warn("No songs available to play.");
            return;
        }
        currentSongIndex = index;
        const song = songs[index];
        audioPlayer.src = URL.createObjectURL(song);
        audioPlayer.play().then(() => {
            console.log("Song playing:", song.name);
            playPauseBtn.textContent = '⏸️';
            fullPlayPauseBtn.textContent = '⏸️';
            miniSongName.textContent = song.name;
            miniArtist.textContent = 'Local File';
            fullSongName.textContent = song.name;
            fullArtist.textContent = 'Local File';
            lyricsText.textContent = getDummyLyrics(song.name);

            // Set album art
            if (albumArtCache[song.name]) {
                miniAlbumArt.style.backgroundImage = `url(${albumArtCache[song.name]})`;
                miniAlbumArt.innerHTML = '';
                fullAlbumArt.style.backgroundImage = `url(${albumArtCache[song.name]})`;
                fullAlbumArt.innerHTML = '';
            } else {
                miniAlbumArt.style.backgroundImage = '';
                miniAlbumArt.innerHTML = '🎵';
                fullAlbumArt.style.backgroundImage = '';
                fullAlbumArt.innerHTML = '🎵';
            }

            // Add to recently played
            if (!recentlyPlayed.some(s => s.name === song.name)) {
                recentlyPlayed.unshift({ name: song.name });
                if (recentlyPlayed.length > 5) recentlyPlayed.pop();
                localStorage.setItem('recentlyPlayed', JSON.stringify(recentlyPlayed));
                loadRecentlyPlayed();
            }

            // Update queue
            queue = [...songs].splice(index);
            loadQueue();
        }).catch(err => {
            console.error("Error playing song:", err);
            alert("Failed to play the song. Check the console for details.");
        });

        // Auto-play next
        audioPlayer.onended = () => {
            console.log("Song ended. Checking next action...");
            if (isRepeating) {
                playSong(currentSongIndex);
            } else if (isShuffling) {
                currentSongIndex = Math.floor(Math.random() * songs.length);
                playSong(currentSongIndex);
            } else if (currentSongIndex < songs.length - 1) {
                currentSongIndex++;
                playSong(currentSongIndex);
            }
        };
    }

    function getDummyLyrics(songName) {
        const dummyLyrics = {
            'song1.mp3': `This is a sample lyric for song 1...\nFeel the beat, let it flow,\nThrough the rhythm, we will grow.`,
            'song2.mp3': `This is a sample lyric for song 2...\nDancing in the moonlight glow,\nStars above, hearts in tow.`
        };
        return dummyLyrics[songName] || `Lyrics for ${songName} will appear here...`;
    }

    // Play/Pause
    playPauseBtn.addEventListener('click', () => togglePlayPause());
    fullPlayPauseBtn.addEventListener('click', () => togglePlayPause());

    function togglePlayPause() {
        console.log("Toggling play/pause...");
        if (audioPlayer.paused) {
            audioPlayer.play().then(() => {
                console.log("Playing...");
                playPauseBtn.textContent = '⏸️';
                fullPlayPauseBtn.textContent = '⏸️';
            }).catch(err => {
                console.error("Error playing audio:", err);
            });
        } else {
            audioPlayer.pause();
            console.log("Paused...");
            playPauseBtn.textContent = '▶️';
            fullPlayPauseBtn.textContent = '▶️';
        }
    }

    // Next/Previous
    nextBtn.addEventListener('click', () => {
        console.log("Next button clicked.");
        currentSongIndex = isShuffling ? Math.floor(Math.random() * songs.length) : (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    });

    prevBtn.addEventListener('click', () => {
        console.log("Previous button clicked.");
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    });

    // Shuffle
    shuffleBtn.addEventListener('click', () => {
        console.log("Shuffle button clicked.");
        isShuffling = !isShuffling;
        shuffleBtn.style.color = isShuffling ? getSeasonColor() : '#40c4ff';
    });

    // Repeat
    repeatBtn.addEventListener('click', () => {
        console.log("Repeat button clicked.");
        isRepeating = !isRepeating;
        repeatBtn.style.color = isRepeating ? getSeasonColor() : '#40c4ff';
        audioPlayer.loop = isRepeating;
    });

    // Progress Bar and Time
    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        miniProgressBar.value = progress || 0;
        fullProgressBar.value = progress || 0;
        currentTime.textContent = formatTime(audioPlayer.currentTime);
        duration.textContent = formatTime(audioPlayer.duration);
    });

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Volume
    volume.addEventListener('input', () => {
        console.log("Volume changed:", volume.value);
        audioPlayer.volume = volume.value;
    });

    // Speed
    speedSelect.addEventListener('change', () => {
        console.log("Speed changed:", speedSelect.value);
        audioPlayer.playbackRate = parseFloat(speedSelect.value);
    });

    // Full Player Toggle
    miniPlayer.addEventListener('click', () => {
        console.log("Mini player clicked. Opening full player...");
        fullPlayer.classList.remove('hidden');
    });

    closeFullPlayer.addEventListener('click', () => {
        console.log("Closing full player...");
        fullPlayer.classList.add('hidden');
    });

    // Touch Gestures for Full Player
    let touchStartX = 0;
    fullPlayer.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });

    fullPlayer.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance > 50) {
            prevBtn.click(); // Swipe right to previous song
        } else if (swipeDistance < -50) {
            nextBtn.click(); // Swipe left to next song
        }
    });

    // Initial Load
    console.log("Loading recently played songs...");
    loadRecentlyPlayed();
    loadQueue();

    // Expose functions for features.js
    window.geetBox = {
        playSong,
        togglePlayPause,
        loadLocalSongs,
        getSeasonColor: () => {
            const season = document.getElementById('seasonSelect')?.value || 'spring';
            switch (season) {
                case 'spring': return '#76b041';
                case 'summer': return '#ff6f61';
                case 'autumn': return '#e76f51';
                case 'winter': return '#6096b4';
                default: return '#ff6f61';
            }
        }
    };
});
