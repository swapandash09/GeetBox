// Additional Features for GeetBox
document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('searchBar');
    const addSongsBtn = document.getElementById('addSongsBtn');
    const fileInput = document.getElementById('fileInput');
    const fileInputIntro = document.getElementById('fileInputIntro');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const themeSelect = document.getElementById('themeSelect');
    const sleepTimer = document.getElementById('sleepTimer');
    const voiceBtn = document.getElementById('voiceBtn');
    const introScreen = document.getElementById('intro-screen');
    const dashboard = document.getElementById('dashboard');

    getStartedBtn.addEventListener('click', () => fileInputIntro.click());
    addSongsBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        const newSongs = Array.from(fileInput.files);
        window.geetBoxData.loadSongs(newSongs);
        introScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
    });

    fileInputIntro.addEventListener('change', () => {
        const newSongs = Array.from(fileInputIntro.files);
        window.geetBoxData.loadSongs(newSongs);
        introScreen.classList.add('hidden');
        dashboard.classList.remove('hidden');
    });

    searchBar.addEventListener('input', () => {
        const query = searchBar.value.toLowerCase();
        const filtered = window.geetBoxData.filterSongs(query);
        window.geetBoxData.updateUI(filtered);
    });

    settingsBtn.addEventListener('click', () => settingsPanel.classList.remove('hidden'));

    themeSelect.addEventListener('change', () => {
        document.body.className = themeSelect.value;
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
        else if (command.includes('next')) window.geetBox.playNext();
        else if (command.includes('previous')) window.geetBox.playPrevious();
    };
});
