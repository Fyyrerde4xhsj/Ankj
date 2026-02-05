const AI = {
    history: JSON.parse(localStorage.getItem('ai_memory') || '{"biases": {"left":0, "right":0, "up":0}, "total_runs":0}'),
    currentSessionMoves: [],

    analyzeMove(playerX, playerY, gridWidth) {
        // Track current session bias
        if (playerX < gridWidth / 2) this.history.biases.left++;
        else this.history.biases.right++;
        
        this.currentSessionMoves.push({x: playerX, y: playerY});
        this.save();

        // If player moves in one direction 3 times, AI blocks it
        if (this.currentSessionMoves.length >= 3) {
            return this.decideCounterMeasure();
        }
        return null;
    },

    decideCounterMeasure() {
        const last3 = this.currentSessionMoves.slice(-3);
        const dx = last3[2].x - last3[0].x;
        
        if (dx > 1) return { type: 'BLOCK_RIGHT', msg: "PREDICTED: LATERAL SHIFT" };
        if (dx < -1) return { type: 'BLOCK_LEFT', msg: "PREDICTED: LATERAL SHIFT" };
        return { type: 'TRAP_NEAR', msg: "CALCULATING VULNERABILITIES" };
    },

    save() {
        localStorage.setItem('ai_memory', JSON.stringify(this.history));
    },

    getFeedback(win, moves) {
        if (!win) {
            if (moves > 7) return "You repeated patterns. I adapted.";
            return "You rushed into my firewalls.";
        }
        return "You were unpredictable... this time.";
    }
};