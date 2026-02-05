const UI = {
    update(moves, aiMsg) {
        document.getElementById('moves-val').innerText = moves;
        const aiStatus = document.getElementById('ai-status');
        aiStatus.innerText = "AI: " + aiMsg;
        aiStatus.style.color = aiMsg.includes("PREDICTED") ? "#ff073a" : "#00f3ff";
    },

    showHUD(show) {
        document.getElementById('hud').classList.toggle('hidden', !show);
    },

    hideScreens() {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    },

    showGameOver(win, msg) {
        const screen = document.getElementById('screen-gameover');
        screen.classList.remove('hidden');
        document.getElementById('go-title').innerText = win ? "ACCESS GRANTED" : "HACK FAILED";
        document.getElementById('go-title').style.color = win ? "#39ff14" : "#ff073a";
        document.getElementById('go-msg').innerText = msg;
        this.showHUD(false);
        Ads.showBanner();
    }
};