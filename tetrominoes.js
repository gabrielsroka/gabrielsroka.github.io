var speed = 30; // lower is faster

// jshint ignore:start

var state = "init"; // also: "play", "game over"

const ROWS = 20;
const COLS = 10;
const SIZE = height / ROWS;

const black = color(0, 0, 0);
const white = color(255, 255, 255);
const colors = [color(170, 0, 0), color(192, 192, 192), color(170, 0, 170),
    color(0, 0, 170), color(0, 170, 0), color(170, 85, 0), color(0, 170, 170)];

var shapes = [ // each shape has four rotations: 0, 90, 180, 270
    [ // I
        [[1, 1, 1, 1]], // 0
        [[1],           // 90
         [1], 
         [1], 
         [1]],
        [[1, 1, 1, 1]], // 180
        [[1],           // 270
         [1], 
         [1], 
         [1]]
    ],
    
    [ // J
        [[1, 1, 1], 
         [0, 0, 1]],
        [[0, 1], 
         [0, 1], 
         [1, 1]],
        [[1, 0, 0], 
         [1, 1, 1]],
        [[1, 1], 
         [1], 
         [1]]
    ],

    [ // L
        [[1, 1, 1], 
         [1]],
        [[1, 1], 
         [0, 1], 
         [0, 1]],
        [[0, 0, 1], 
         [1, 1, 1]],
        [[1, 0], 
         [1], 
         [1, 1]]
    ],

    [ // O
        [[1, 1], 
         [1, 1]],
        [[1, 1], 
         [1, 1]],
        [[1, 1], 
         [1, 1]],
        [[1, 1], 
         [1, 1]]
    ],
    
    [ // S
        [[0, 1, 1], 
         [1, 1]],
        [[1, 0], 
         [1, 1], 
         [0, 1]],
        [[0, 1, 1], 
         [1, 1]],
        [[1, 0], 
         [1, 1], 
         [0, 1]]
    ],

    [ // T
        [[1, 1, 1], 
         [0, 1]],
        [[0, 1], 
         [1, 1], 
         [0, 1]],
        [[0, 1, 0], 
         [1, 1, 1]],
        [[1, 0], 
         [1, 1], 
         [1]]
    ],

    [ // Z
        [[1, 1, 0], 
         [0, 1, 1]],
        [[0, 1], 
         [1, 1], 
         [1]],
        [[1, 1, 0], 
         [0, 1, 1]],
        [[0, 1], 
         [1, 1], 
         [1]]
    ]
];

var board = {
    test: false, // show all shapes
    init: function () {
        this.score = 0;
        this.pieces = [];
        for (var r = 0; r < ROWS; r++) {
            this.pieces.push([]);
            for (var c = 0; c < COLS; c++) {
                this.pieces[r].push(false);
            }
        }
    },
    draw: function () {
        textSize(24);
        text(this.score, width - 24, 48);
        textSize(12);
        if (state === "game over") {
            text("game over -- click to play again", frameCount % width, 12);
        }
        noFill();
        stroke(white);
        rect(SIZE - 2, -2, SIZE * COLS + 4, height + 4);
        stroke(black);
        fill(white);
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                if (this.pieces[r][c]) {
                    rect((c + 1) * SIZE, r * SIZE, SIZE, SIZE);
                }
            }
        }
    }
};

var tetro = {
    init: function () {
        this.c = 4;
        this.r = 0;
        this.shapeNum = round(random(0, shapes.length - 1));
        this.rotation = 0;
    },
    draw: function () {
        fill(colors[this.shapeNum]);
        this.shape = shapes[this.shapeNum][this.rotation];
        for (var r = 0; r < this.shape.length; r++) {
            for (var c = 0; c < this.shape[r].length; c++) {
                if (this.shape[r][c]) {
                    rect(SIZE * (c + this.c + 1), SIZE * (r + this.r) , SIZE, SIZE);
                }
            }
        }
        fill(white);
        
        if (frameCount % speed === 0 && state != "game over" && !board.test) {
            this.detect();
        }
    },
    move: function (keyCode) {
        if (keyCode === LEFT) {
            if (this.c > 0) {
                this.c--;
            }
        } else if (keyCode === RIGHT) {
            if (this.c < COLS - this.shape[0].length) {
                this.c++;
            }
        } else if (keyCode === DOWN) {
            this.detect();
        } else if (keyCode === UP) {
            this.rotation = (this.rotation + 1) % 4;
            this.shape = shapes[this.shapeNum][this.rotation];
            if (this.c > COLS - this.shape[0].length) {
                this.c = COLS - this.shape[0].length;
            }
        }
    },
    detect: function () {
        var hit = false;
        if (this.r + this.shape.length === ROWS) {
            hit = true;
        } else {
            for (var r = 0; r < this.shape.length; r++) {
                for (var c = 0; c < this.shape[r].length; c++) {
                    var row = min(this.r + r + 1, ROWS - 1);
                    var col = min(this.c + c, COLS - 1);
                    if (this.shape[r][c] && board.pieces[row][col]) {
                        hit = true;
                        break;
                    }
                }
            }
        }
        if (hit) {
            if (this.r === 1) {
                state = "game over";
                playSound(getSound("rpg/giant-no"));
            } else {
                for (var r = 0; r < this.shape.length; r++) {
                    for (var c = 0; c < this.shape[r].length; c++) {
                        var row = min(this.r + r, ROWS - 1);
                        var col = min(this.c + c, COLS - 1);
                        if (this.shape[r][c]) {
                            board.pieces[row][col] = this.shape[r][c];
                        }
                    }
                }
                var oldScore = board.score;
                for (var h = 0; h < this.shape.length; h++) {
                    var fullRow = true;
                    for (var c = 0; c < COLS; c++) {
                        fullRow = fullRow && board.pieces[this.r + h][c];
                    }
                    if (fullRow) {
                        board.score++;
                        for (var r = this.r - 1; r >= 0; r--) {
                            for (var c = 0; c < COLS; c++) {
                                board.pieces[r + h + 1][c] = board.pieces[r + h][c];
                            }
                        }
                    }
                }
                if (oldScore + 4 === board.score) {
                    board.score += 4;
                    playSound(getSound("retro/coin"));
                } else if (oldScore < board.score) {
                    playSound(getSound("retro/laser3"));
                }
                if (state !== "game over") {
                    this.init();
                }
            }
        }
        if (state !== "game over") {
            this.r++;
        }
    }
};

board.init();
tetro.init();

var test = function () {
    const SIZE = round(height / 7 / 5 * 0.95);
    for (var s = 0; s < shapes.length; s++) {
        for (var rot = 0; rot < shapes[s].length; rot++) {
            var shape = shapes[s][rot];
            noFill();
            stroke(white);
            rect(SIZE * (rot * 5 + 3) - 2, SIZE * (s * 5 + 2) - 2, 
                SIZE * 4 + 4, SIZE * 4 + 4);
            stroke(black);
            fill(colors[s]);
            for (var r = 0; r < shape.length; r++) {
                for (var c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        rect(SIZE * (rot * 5 + c + 3), SIZE * (s * 5 + r + 2), SIZE, SIZE);
                    }
                }
            }
            fill(white);
        }
    }
};

draw = function () {
    background(black);

    if (board.test) {
        test();
    } else if (state === "play" || state === "game over") {
        board.draw();
        tetro.draw();
    } else if (state === "init")  {
        var x = width / 2;
        var y = height / 3;
        textAlign(CENTER);
        textSize(24);
        text("tetrominoes", x, y);
        textSize(14);
        text("LEFT, RIGHT - move\nUP - rotate\nDOWN - drop\n\nclick to play or pause", 
            x, y + 36);
        const SIZE = round(height / 7 / 5 * 0.95);
        var shape = shapes[5][0];
        for (var r = 0; r < shape.length; r++) {
            for (var c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    rect(SIZE * (c + 11), SIZE * (r + 23), SIZE, SIZE);
                }
            }
        }
    }    
};

keyPressed = function () {
    if (state === "play") {
        tetro.move(keyCode);
    }
    if (key.toString() === " ") {
        board.test = !board.test;
    } else if (key.toString() === "i") { // cheat codes
        tetro.shapeNum = 0;
    } else if (key.toString() === "j") {
        tetro.shapeNum = 1;
    } else if (key.toString() === "l") {
        tetro.shapeNum = 2;
    } else if (key.toString() === "o") {
        tetro.shapeNum = 3;
    } else if (key.toString() === "s") {
        tetro.shapeNum = 4;
    } else if (key.toString() === "t") {
        tetro.shapeNum = 5;
    } else if (key.toString() === "z") {
        tetro.shapeNum = 6;
    }
};

mouseClicked = function () {
    if (state === "play") {
        state = "init"; // pause
    } else if (state === "game over") {
        board.init();
        tetro.init();
        state = "play";
    } else {
        state = "play";
    }
};
