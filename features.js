// Additional Features for GeetBox

document.addEventListener('DOMContentLoaded', () => {
    console.log("Loading additional features for GeetBox...");

    // Elements
    const searchBtn = document.getElementById('searchBtn');
    const searchBar = document.getElementById('searchBar');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const tabs = document.querySelectorAll('.tab');
    const settingsBtn = document.getElementById('menuBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const themeSelect = document.getElementById('themeSelect');
    const seasonSelect = document.getElementById('seasonSelect');
    const sleepTimer = document.getElementById('sleepTimer');
    const voiceBtn = document.getElementById('voiceBtn');
    const moreBtn = document.getElementById('moreBtn');
    const moreMenu = document.getElementById('moreMenu');
    const shareSong = document.getElementById('shareSong');
    const addToPlaylist = document.getElementById('addToPlaylist');
    const downloadSong = document.getElementById('downloadSong');
    const songDetails = document.getElementById('songDetails');
    const miniVisualizer = document.getElementById('miniVisualizer');
    const audioPlayer = document.getElementById('audioPlayer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const repeatBtn = document.getElementById('repeatBtn');
    const toggleLyricsBtn = document.getElementById('toggleLyricsBtn');
    const lyricsSection = document.getElementById('lyricsSection');

    let playlists = JSON.parse(localStorage.getItem('playlists')) || [];
    let currentSeason = 'spring';
    let isLyricsVisible = false;

    // Visualizer Setup
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function drawMiniVisualizer() {
        requestAnimationFrame(drawMiniVisualizer);
        analyser.getByteFrequencyData(dataArray);
        const ctx = miniVisualizer.getContext('2d');
        ctx.clearRect(0, 0, miniVisualizer.width, miniVisualizer.height);
        const barWidth = (miniVisualizer.width / bufferLength) * 5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 0.5;
            ctx.fillStyle = geetBox.getSeasonColor();
            ctx.fillRect(x, miniVisualizer.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    drawMiniVisualizer();

    // Search Toggle
    searchBtn.addEventListener('click', () => {
        console.log("Search button clicked.");
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden')) {
            searchBar.focus();
        }
    });

    // Search Functionality
    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        console.log("Search query:", query);
        const filteredSongs = Array.from(document.getElementById('fileInput').files).filter(song => song.name.toLowerCase().includes(query));
        geetBox.loadLocalSongs(filteredSongs);

        // Search Suggestions
        searchSuggestions.innerHTML = '';
        if (query) {
            searchSuggestions.classList.remove('hidden');
            const suggestions = Array.from(document.getElementById('fileInput').files)
                .filter(song => song.name.toLowerCase().includes(query))
                .slice(0, 5);
            suggestions.forEach((song, index) => {
                const li = document.createElement('li');
                li.textContent = `${song.name} - Local File`;
                li.addEventListener('click', () => {
                    const songIndex = Array.from(document.getElementById('fileInput').files).findIndex(s => s.name === song.name);
                    geetBox.playSong(songIndex);
                    searchBar.value = '';
                    searchSuggestions.classList.add('hidden');
                });
                searchSuggestions.appendChild(li);
            });
        } else {
            searchSuggestions.classList.add('hidden');
        }
    });

    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log("Tab clicked:", tab.dataset.tab);
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.content section').forEach(section => {
                section.classList.add('hidden');
            });
            document.getElementById(tab.dataset.tab).classList.remove('hidden');
        });
    });

    // Settings
    settingsBtn.addEventListener('click', () => {
        console.log("Settings button clicked.");
        settingsPanel.classList.toggle('hidden');
    });

    themeSelect.addEventListener('change', () => {
        console.log("Theme changed:", themeSelect.value);
        document.body.className = themeSelect.value;
    });

    seasonSelect.addEventListener('change', () => {
        console.log("Season changed:", seasonSelect.value);
        currentSeason = seasonSelect.value;
        document.body.className = currentSeason;
    });

    // Sleep Timer
    let sleepTimeout;
    sleepTimer.addEventListener('change', () => {
        console.log("Sleep timer set to:", sleepTimer.value);
        clearTimeout(sleepTimeout);
        const minutes = parseInt(sleepTimer.value);
        if (minutes > 0) {
            sleepTimeout = setTimeout(() => {
                audioPlayer.pause();
                document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
                document.getElementById('fullPlayPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
                sleepTimer.value = '0';
                alert("Sleep timer ended. Playback paused.");
            }, minutes * 60 * 1000);
        }
    });

    // Voice Control
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';

    voiceBtn.addEventListener('click', () => {
        console.log("Voice control button clicked.");
        recognition.start();
    });

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log("Voice command:", command);
        if (command.includes('play')) geetBox.togglePlayPause();
        else if (command.includes('pause')) geetBox.togglePlayPause();
        else if (command.includes('next')) nextBtn.click();
        else if (command.includes('previous')) prevBtn.click();
        else if (command.includes('shuffle')) shuffleBtn.click();
        else if (command.includes('repeat')) repeatBtn.click();
    };

    recognition.onerror = (err) => {
        console.error("Voice recognition error:", err);
    };

    // 3-Dot Menu
    moreBtn.addEventListener('click', () => {
        console.log("More button clicked.");
        moreMenu.classList.toggle('hidden');
    });

    shareSong.addEventListener('click', () => {
        console.log("Share song clicked.");
        alert(`Sharing ${document.getElementById('fullSongName').textContent} (placeholder)`);
        moreMenu.classList.add('hidden');
    });

    addToPlaylist.addEventListener('click', () => {
        console.log("Add to playlist clicked.");
        const playlistName = prompt("Enter playlist name:");
        if (playlistName) {
            const playlist = playlists.find(p => p.name === playlistName) || { name: playlistName, songs: [] };
            if (!playlists.some(p => p.name === playlistName)) {
                playlists.push(playlist);
            }
            playlist.songs.push(document.getElementById('fileInput').files[currentSongIndex]);
            localStorage.setItem('playlists', JSON.stringify(playlists));
            alert(`Added to playlist: ${playlistName}`);
        }
        moreMenu.classList.add('hidden');
    });

    downloadSong.addEventListener('click', () => {
        console.log("Download song clicked.");
        alert("Download functionality is not implemented yet.");
        moreMenu.classList.add('hidden');
    });

    songDetails.addEventListener('click', () => {
        console.log("Song details clicked.");
        const song = document.getElementById('fileInput').files[currentSongIndex];
        const details = `
            Name: ${song.name}
            Size: ${(song.size / 1024 / 1024).toFixed(2)} MB
            Duration: ${document.getElementById('duration').textContent}
        `;
        alert(details);
        moreMenu.classList.add('hidden');
    });

    // Slide-to-Lyrics Toggle
    toggleLyricsBtn.addEventListener('click', () => {
        isLyricsVisible = !isLyricsVisible;
        lyricsSection.classList.toggle('visible', isLyricsVisible);
        toggleLyricsBtn.innerHTML = `Lyrics <i class="fas fa-chevron-${isLyricsVisible ? 'up' : 'down'}"></i>`;
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            geetBox.togglePlayPause();
        } else if (e.code === 'ArrowRight') {
            nextBtn.click();
        } else if (e.code === 'ArrowLeft') {
            prevBtn.click();
        }
    });
});
