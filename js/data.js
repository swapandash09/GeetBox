// Data Management for GeetBox
window.geetBoxData = {
    songs: [],
    albums: {},
    favorites: JSON.parse(localStorage.getItem('favorites')) || [],
    recentlyPlayed: JSON.parse(localStorage.getItem('recentlyPlayed')) || [],
    queue: [],

    loadSongs: (newSongs) => {
        const songsList = window.geetBoxData.songs;
        newSongs.forEach(file => {
            jsmediatags.read(file, {
                onSuccess: (tag) => {
                    const picture = tag.tags.picture;
                    let albumArt = '';
                    if (picture) {
                        const base64String = btoa(
                            picture.data.reduce((data, byte) => data + String.fromCharCode(byte), '')
                        );
                        albumArt = `data:${picture.format};base64,${base64String}`;
                    }
                    const songData = {
                        file,
                        title: tag.tags.title || file.name,
                        artist: tag.tags.artist || 'Unknown Artist',
                        album: tag.tags.album || 'Unknown Album',
                        albumArt
                    };
                    songsList.push(songData);
                    window.geetBoxData.updateAlbums();
                    window.geetBoxData.updateUI();
                    // Save to IndexedDB
                    window.geetBoxData.saveSongToDB(songData);
                },
                onError: (error) => {
                    console.error('Error reading metadata:', error);
                    const songData = {
                        file,
                        title: file.name,
                        artist: 'Unknown Artist',
                        album: 'Unknown Album',
                        albumArt: ''
                    };
                    songsList.push(songData);
                    window.geetBoxData.updateAlbums();
                    window.geetBoxData.updateUI();
                    window.geetBoxData.saveSongToDB(songData);
                }
            });
        });
    },

    updateAlbums: () => {
        window.geetBoxData.albums = {};
        window.geetBoxData.songs.forEach(song => {
            const album = song.album;
            if (!window.geetBoxData.albums[album]) window.geetBoxData.albums[album] = [];
            window.geetBoxData.albums[album].push(song);
        });
    },

    filterSongs: (query) => {
        return window.geetBoxData.songs.filter(song => 
            song.title.toLowerCase().includes(query) || 
            song.artist.toLowerCase().includes(query)
        );
    },

    updateUI: (filteredSongs = window.geetBoxData.songs) => {
        const songsList = document.getElementById('songsList');
        songsList.innerHTML = filteredSongs.map((song, index) => `
            <div class="card" onclick="window.geetBox.playSong(${index})">
                <div class="album-art" style="background-image: url(${song.albumArt || ''})"></div>
                <p>${song.title}</p>
                <span>${song.artist}</span>
            </div>
        `).join('');
    },

    // IndexedDB Setup
    initDB: () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('GeetBoxDB', 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore('songs', { keyPath: 'id', autoIncrement: true });
            };
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    saveSongToDB: async (songData) => {
        const db = await window.geetBoxData.initDB();
        const transaction = db.transaction(['songs'], 'readwrite');
        const store = transaction.objectStore('songs');
        store.add({ ...songData, file: null }); // Cannot store File object in IndexedDB
    },

    loadSongsFromDB: async () => {
        const db = await window.geetBoxData.initDB();
        const transaction = db.transaction(['songs'], 'readonly');
        const store = transaction.objectStore('songs');
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }
};

// Load songs from IndexedDB on startup
document.addEventListener('DOMContentLoaded', async () => {
    const savedSongs = await window.geetBoxData.loadSongsFromDB();
    if (savedSongs.length > 0) {
        window.geetBoxData.songs = savedSongs;
        window.geetBoxData.updateAlbums();
        window.geetBoxData.updateUI();
    }
});
