// UI/UX Enhancements for GeetBox
document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content section');
    const toggleLyricsBtn = document.getElementById('toggleLyricsBtn');
    const lyricsSection = document.getElementById('lyricsSection');
    const visualizer = document.getElementById('visualizer');
    const audioPlayer = document.getElementById('audioPlayer');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            sections.forEach(s => s.classList.add('hidden'));
            document.getElementById(item.dataset.tab).classList.remove('hidden');
        });
    });

    toggleLyricsBtn.addEventListener('click', () => {
        lyricsSection.classList.toggle('visible');
        toggleLyricsBtn.innerHTML = `Lyrics <i class="fas fa-chevron-${lyricsSection.classList.contains('visible') ? 'up' : 'down'}"></i>`;
    });

    const ctx = visualizer.getContext('2d');
    const analyser = new (window.AudioContext || window.webkitAudioContext).createAnalyser();
    const source = new (window.AudioContext || window.webkitAudioContext).createMediaElementSource(audioPlayer);
    source.connect(analyser);
    analyser.connect(new (window.AudioContext || window.webkitAudioContext).destination);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function drawVisualizer() {
        requestAnimationFrame(drawVisualizer);
        analyser.getByteFrequencyData(dataArray);
        ctx.clearRect(0, 0, visualizer.width, visualizer.height);
        const barWidth = (visualizer.width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] * 0.3;
            ctx.fillStyle = '#ff9a76';
            ctx.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    drawVisualizer();

    settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
});
