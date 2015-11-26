// Enemies our player must avoid
var Enemy = function(x, y) {
    this.x = x;                                     // Current x position for enemy
    this.y = y;                                     // Current y position for enemy
    this.movementSpeed = getRandomNumber(20, 30);   // Movement speed of enemy
    this.width = 50;                                // Width for the enemy, used for calculating the collision
    this.height = 72;                               // Height for the enemy, used for calculating the collision
    this.sprite = 'images/enemy-bug.png';           // Image of enemy
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (this.x <= ctx.canvas.width) {
        this.x += (10 * this.movementSpeed) * dt;
    } else {
        this.x = enemyStartingX[getRandomNumber(1, 3)];
        this.movementSpeed = getRandomNumber(20, 30);
    }

    // Check for collisions with the player
    if (collidesWithPlayer(player, this)) {
        // Add a tombstone to the players current position
        var tombstone = new Tombstone(player.x, player.y);
        allTombstones.push(tombstone);

        // If it's not game over, remove a life and decrement the score
        if (!gameOver) {
            player.lives.removeLife();
            player.score.decrementScore(10);
        }

        // If the player still has more than one life, reset to the
        // starting the position, otherwise set the gameover boolean to true
        if (player.lives.numberOfLives > 0) {
            player.reset();
        } else {
            gameOver = true;
        }
    }

};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Class for tombstones.
// Places a tombstone image where the enemy hit the player.
var Tombstone = function(x, y) {
    this.x = x;
    this.y = y;
    this.sprite = 'images/Tombstone.png';
};

// Draw the tombstone on the screen
Tombstone.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Class for keeping track of the number of lives left for the player
var Lives = function(x, y, numberOfLives) {
    this.x = x;                             // X position of heart showing lives remaining
    this.y = y;                             // Y position of heart showing lives remaining
    this.numberOfLives = numberOfLives;     // Number of lives left
    this.sprite = 'images/Heart.png';       // Image of heart holding the number of lives
};

// Draw the Heart on the screen and also draw the number of lives left for the player
Lives.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.font="bold 42px Arial";
    ctx.fillStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.fillText(this.numberOfLives, 455, 108);
    ctx.strokeText(this.numberOfLives, 455, 108);

};

// Decrement the number of lives left by one
Lives.prototype.removeLife = function() {
    if (this.numberOfLives > 0) {
        this.numberOfLives -= 1;
    }
};

// Class to keep track of the players score
var Score = function(amount) {
    this.amount = amount;           // Current score of the player
};

// Draw the score on the screen
Score.prototype.render = function() {
    ctx.font="bold 45px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.fillText(this.amount, 48, 110);
    ctx.strokeText(this.amount, 48, 110);
};

// Increment the score by the given amount
Score.prototype.incrementScore = function(amount) {
    this.amount += amount;
};

// Decrement the score by the given amount. Don't let the score go below 0.
Score.prototype.decrementScore = function(amount) {
    var newAmount = this.amount - amount;
    this.amount = newAmount >= 0 ? newAmount :  0;
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x, y) {
    this.startingCoordinates = { startX: x, startY: y }; // Starting position for player
    this.x = x;                             // Current x position
    this.y = y;                             // Current y position
    this.width = 50;                        // Width for the player, used for calculating the collision
    this.height = 72;                       // Height for the player, used for calculating the collision
    this.score = new Score(0);              // Score for the player
    this.sprite = 'images/char-boy.png';    // Image for the player
    this.lives = new Lives(404, 5, 3);      // Number of lives for the player
    this.waitOnWater = 6;                   // Number of ticks to remain on the water before resetting to start position
};

// Draw the player, his/her remaining lives and his/her score on the screen
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    this.lives.render();
    this.score.render();
};

// When the player is hit by an enemy, reset the player to the starting position
Player.prototype.reset = function () {
    this.x = this.startingCoordinates.startX;
    this.y = this.startingCoordinates.startY;
};

// Checks if player won (reached the water), if so increments the score and resets the player to the starting position
Player.prototype.update = function() {
    if (this.y < 0) {
        if (this.waitOnWater < 0) {
            this.score.incrementScore(20);
            this.reset();
            this.waitOnWater = 6;
        } else {
            this.waitOnWater--;
        }
    }
};

// Handles the user input
// Valid input is "up", "down", "left", "right" and "h"
Player.prototype.handleInput = function(input) {

    if (input === undefined) { return; }

    var height = 83 * 5,
        width = ctx.canvas.width;

    switch(input) {
        case "up":
            this.y = (this.y - 83 >= -10 ? this.y - 83 : this.y);
            break;
        case "down":
            this.y = (this.y + 83 < height ? this.y + 83 : this.y);
            break;
        case "right":
            this.x = (this.x + 101 < width ? this.x + 101 : this.x);
            break;
        case "left":
            this.x = (this.x - 101 >= 0 ? this.x - 101 : this.x);
            break;
        case "help":
        default:
            alert("Frogger Help - Allowable input:\n\nUp: Move player up\nDown: Move player down\nLeft: Move player left\nRight: Mover player right");
    }
};

// Detects the collision between player and enemy
// Algorithm was not created by myself, source code obtained from here (Axis-Aligned Bounding Box):
// https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collidesWithPlayer(player, enemy) {
    return (player.x < enemy.x + enemy.width &&
            player.x + player.width  > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var enemyStartingY = {
    1: 62,      // Top row of stone path
    2: 145,     // Middle row of stone path
    3: 228      // Bottom row of stone path
};

var enemyStartingX = {
    1: -300,
    2: -500,
    3: -700
};

var totalEnemies = 5,       // Total number of enemies to have in the game
    counter = 1,            // Counter used to select the starting position and row of the enemy
    allEnemies = [],        // Array to hold all the enemies
    allTombstones = [],     // Array to hold all the tombstones
    gameOver = false;       // Boolean indicating if the game is over

for (var i = 0; i < totalEnemies; i++) {
    counter = counter > 3 ? 1 : counter;
    var enemy = new Enemy(enemyStartingX[counter], enemyStartingY[counter]);
    allEnemies.push(enemy);
    counter++;
}

var player = new Player(202, 405);

// Generates and returns a random number between given min and max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * max) + min;
}

// Menu to show the game over screen. This will show the text "GAME OVER!", the players final score and a button to start again.
function gameOverMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(100, 130, 303, 260);
    ctx.textAlign = "center";
    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#ff0000";
    ctx.fillText("GAME OVER!", ctx.canvas.width / 2, 200);
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Your Score:", ctx.canvas.width / 2, 240);
    ctx.font = "bold 34px Arial";
    ctx.fillText(player.score.amount, ctx.canvas.width / 2, 280);
    ctx.font = "normal 32px Arial";
    ctx.fillStyle = "#09f209";
    ctx.fillText("Start Again", ctx.canvas.width / 2, 340);
    ctx.rect(160,308,185,45);
    ctx.strokeStyle = '#09f209';
    ctx.stroke();
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        72: 'help'
    };

    if (!gameOver) {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});

// Mouse event listener for when the game is over, so that the user can click the 'Start Again' button in the game over menu.
// When the 'Start Again' button is clicked, the game is reset
document.addEventListener("mousedown", function(e) {
    if (gameOver) {
        var mouseX = e.x;
        var mouseY = e.y;
        mouseX -= ctx.canvas.offsetLeft;
        mouseY -= ctx.canvas.offsetTop;
        var startAgainText = {x:160, y:308, w:185, h:44};
        if(mouseX >= startAgainText.x &&
           mouseX <= startAgainText.x + startAgainText.w &&
           mouseY >= startAgainText.y &&
           mouseY <= startAgainText.y + startAgainText.h){
            gameOver = false;
            player.lives.numberOfLives = 3;
            player.score.amount = 0;
            player.reset();
            allTombstones = [];
        }
    }
});