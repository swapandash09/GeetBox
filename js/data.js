// Data Management for GeetBox
window.geetBoxData = {
    songs: [],
    albums: {},
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    recentlyPlayed: JSON.parse(localStorage.getItem('recentlyPlayed')) || [],
    queue: [],

    loadSongs: (newSongs) => {
        window.geetBoxData.songs = newSongs;
        window.geetBoxData.updateAlbums();
        window.geetBoxData.updateUI();
    },

    updateAlbums: () => {
        window.geetBoxData.albums = {};
        window.geetBoxData.songs.forEach(song => {
            const album = song.name.split('-')[0] || 'Unknown Album';
            if (!window.geetBoxData.albums[album]) window.geetBoxData.albums[album] = [];
            window.geetBoxData.albums[album].push(song);
        });
    },

    filterSongs: (query) => {
        return window.geetBoxData.songs.filter(song => song.name.toLowerCase().includes(query));
    },

    updateUI: (filteredSongs = window.geetBoxData.songs) => {
        const songsList = document.getElementById('songsList');
        songsList.innerHTML = filteredSongs.map((song, i) => `
            <div class="card" onclick="window.geetBox.playSong(URL.createObjectURL(${song}))">
                <div class="card-content">
                    <div class="album-art">${i + 1}</div>
                    <p>${song.name}</p>
                    <span>Local</span>
                </div>
            </div>
        `).join('');
    },

    clearQueue: () => {
        window.geetBoxData.queue = [];
        document.getElementById('queueList').innerHTML = '';
    },

    createPlaylist: (name) => {
        if (!window.geetBoxData.playlists) window.geetBoxData.playlists = [];
        window.geetBoxData.playlists.push({ name, songs: [] });
        localStorage.setItem('playlists', JSON.stringify(window.geetBoxData.playlists));
    }
};
