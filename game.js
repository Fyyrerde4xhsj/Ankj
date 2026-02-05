const Game = {
    canvas: null, ctx: null,
    gridSize: 4,
    tiles: [],
    player: { x: 1, y: 3 },
    core: { x: 2, y: 0 },
    moves: 12,
    state: 'MENU',
    cellSize: 0,
    path: [],

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 120;
        this.cellSize = Math.min(this.canvas.width, this.canvas.height) / 5;
        
        this.setupGrid();
        this.player = { x: 1, y: 3 };
        this.path = [{x:1, y:3}];
        this.moves = 12;
        this.state = 'PLAYING';
        
        UI.showHUD(true);
        UI.hideScreens();
        
        this.canvas.onclick = (e) => this.handleClick(e);
        this.render();
    },

    setupGrid() {
        this.tiles = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                // Hide traps randomly, but not near start
                const isTrap = (y < 2 && Math.random() > 0.7);
                this.tiles[y][x] = { type: 'empty', trap: isTrap, blocked: false };
            }
        }
    },

    handleClick(e) {
        if (this.state !== 'PLAYING') return;

        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left - (this.canvas.width - this.gridSize * this.cellSize) / 2;
        const my = e.clientY - rect.top - (this.canvas.height - this.gridSize * this.cellSize) / 2;

        const tx = Math.floor(mx / this.cellSize);
        const ty = Math.floor(my / this.cellSize);

        if (this.isAdjacent(tx, ty)) {
            this.moveTo(tx, ty);
        }
    },

    isAdjacent(x, y) {
        const dx = Math.abs(x - this.player.x);
        const dy = Math.abs(y - this.player.y);
        return (dx + dy === 1);
    },

    moveTo(x, y) {
        if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) return;
        if (this.tiles[y][x].blocked) return;

        this.player = { x, y };
        this.path.push({x, y});
        this.moves--;

        // Trigger AI
        const reaction = AI.analyzeMove(x, y, this.gridSize);
        if (reaction) {
            this.applyAI(reaction);
        }

        // Logic Checks
        if (x === this.core.x && y === this.core.y) {
            this.endGame(true);
        } else if (this.tiles[y][x].trap) {
            this.tiles[y][x].triggered = true;
            this.endGame(false);
        } else if (this.moves <= 0) {
            this.endGame(false);
        }
        
        UI.update(this.moves, reaction ? reaction.msg : "OBSERVING...");
        this.render();
    },

    applyAI(reaction) {
        if (reaction.type === 'BLOCK_RIGHT' && this.player.x < 3) {
            this.tiles[this.player.y][this.player.x + 1].blocked = true;
        }
        if (reaction.type === 'BLOCK_LEFT' && this.player.x > 0) {
            this.tiles[this.player.y][this.player.x - 1].blocked = true;
        }
    },

    endGame(win) {
        this.state = 'GAMEOVER';
        UI.showGameOver(win, AI.getFeedback(win, this.path.length));
    },

    render() {
        const ctx = this.ctx;
        const offset = (this.canvas.width - this.gridSize * this.cellSize) / 2;
        const offsetY = (this.canvas.height - this.gridSize * this.cellSize) / 2;

        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const tx = offset + x * this.cellSize;
                const ty = offsetY + y * this.cellSize;

                // Draw Tile
                ctx.strokeStyle = '#222';
                ctx.strokeRect(tx, ty, this.cellSize, this.cellSize);

                if (this.tiles[y][x].blocked) {
                    ctx.fillStyle = 'rgba(255, 7, 58, 0.3)';
                    ctx.fillRect(tx, ty, this.cellSize, this.cellSize);
                    ctx.fillStyle = '#ff073a';
                    ctx.fillText("LOCKED", tx + 5, ty + 20);
                }

                if (this.tiles[y][x].triggered) {
                    ctx.fillStyle = '#ff073a';
                    ctx.fillRect(tx+10, ty+10, this.cellSize-20, this.cellSize-20);
                }
            }
        }

        // Core (Blue)
        ctx.shadowBlur = 15; ctx.shadowColor = '#00f3ff';
        ctx.fillStyle = '#00f3ff';
        ctx.fillRect(offset + this.core.x * this.cellSize + 10, offsetY + this.core.y * this.cellSize + 10, this.cellSize - 20, this.cellSize - 20);

        // Player (Green)
        ctx.shadowColor = '#39ff14';
        ctx.fillStyle = '#39ff14';
        ctx.beginPath();
        ctx.arc(offset + this.player.x * this.cellSize + this.cellSize/2, offsetY + this.player.y * this.cellSize + this.cellSize/2, this.cellSize/4, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Path (Line)
        if (this.path.length > 1) {
            ctx.strokeStyle = 'rgba(57, 255, 20, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(offset + this.path[0].x * this.cellSize + this.cellSize/2, offsetY + this.path[0].y * this.cellSize + this.cellSize/2);
            for(let p of this.path) {
                ctx.lineTo(offset + p.x * this.cellSize + this.cellSize/2, offsetY + p.y * this.cellSize + this.cellSize/2);
            }
            ctx.stroke();
        }
    }
};