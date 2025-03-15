// Additional Features for GeetBox
document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const addSongsBtn = document.getElementById('addSongsBtn');
    const fileInput = document.getElementById('fileInput');
    const settingsPanel = document.getElementById('settingsPanel');
    const themeSelect = document.getElementById('themeSelect');
    const seasonSelect = document.getElementById('seasonSelect');
    const sleepTimer = document.getElementById('sleepTimer');
    const voiceBtn = document.getElementById('voiceBtn');
    const clearQueueBtn = document.getElementById('clearQueueBtn');
    const createPlaylistBtn = document.getElementById('createPlaylistBtn');

    addSongsBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        const songs = Array.from(fileInput.files);
        window.geetBoxData.loadSongs(songs);
    });

    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        const filtered = window.geetBoxData.filterSongs(query);
        window.geetBoxData.updateUI(filtered);
    });

    themeSelect.addEventListener('change', () => {
        document.body.className = themeSelect.value;
    });

    seasonSelect.addEventListener('change', () => {
        document.body.className = seasonSelect.value;
    });

    let sleepTimeout;
    sleepTimer.addEventListener('change', () => {
        clearTimeout(sleepTimeout);
        const minutes = parseInt(sleepTimer.value);
        if (minutes > 0) {
            sleepTimeout = setTimeout(() => {
                document.getElementById('audioPlayer').pause();
                sleepTimer.value = '0';
                alert('Sleep timer ended.');
            }, minutes * 60 * 1000);
        }
    });

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    voiceBtn.addEventListener('click', () => recognition.start());

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        if (command.includes('play')) window.geetBox.togglePlayPause();
        else if (command.includes('pause')) window.geetBox.togglePlayPause();
    };

    clearQueueBtn.addEventListener('click', () => window.geetBoxData.clearQueue());

    createPlaylistBtn.addEventListener('click', () => {
        const name = prompt('Enter playlist name');
        if (name) window.geetBoxData.createPlaylist(name);
    });
});
