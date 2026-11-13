
"use strict";

/*
  Space Defender
  Author: Phillip Mathis

  JavaScript game logic, keyboard/touch controls,
  and optional synthesized retro arcade background music.
*/

// GAME ELEMENTS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const missionStatusEl = document.getElementById("missionStatus");

const playAgainBtn = document.getElementById("playAgain");
const musicToggle = document.getElementById("musicToggle");

// GAME VARIABLES
let score = 0;
let lives = 3;
let gameOver = false;

// PLAYER SHIP
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 50,
  width: 40,
  height: 30,
  speed: 6,
  dx: 0
};

// GAME OBJECTS
const lasers = [];
const invaders = [];

const invaderRows = 3;
const invaderCols = 7;

const invaderWidth = 40;
const invaderHeight = 25;

let invaderSpeed = 2;
let invaderDirection = 1;

// KEYBOARD CONTROLS
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};


// CREATE ENEMY SHIPS
function createInvaders() {

  for (let row = 0; row < invaderRows; row++) {

    for (let col = 0; col < invaderCols; col++) {

      invaders.push({
        x: col * (invaderWidth + 20) + 50,
        y: row * (invaderHeight + 20) + 50,
        width: invaderWidth,
        height: invaderHeight,
        alive: true
      });

    }

  }

}


// FIRE LASER
function fireLaser() {

  if (gameOver) return;

  lasers.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 15,
    speed: 12
  });

}


// KEYBOARD EVENT LISTENERS
document.addEventListener("keydown", (event) => {

  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === "ArrowLeft") {
    keys.ArrowLeft = true;
  }

  if (event.code === "ArrowRight") {
    keys.ArrowRight = true;
  }

  if (event.code === "Space" && !keys.Space) {

    keys.Space = true;
    fireLaser();

  }

});


document.addEventListener("keyup", (event) => {

  if (event.code === "ArrowLeft") {
    keys.ArrowLeft = false;
  }

  if (event.code === "ArrowRight") {
    keys.ArrowRight = false;
  }

  if (event.code === "Space") {
    keys.Space = false;
  }

});


window.addEventListener("blur", () => {

  keys.ArrowLeft = false;
  keys.ArrowRight = false;
  keys.Space = false;

});


// TOUCH CONTROLS
function bindHoldButton(buttonId, keyName) {

  const button = document.getElementById(buttonId);

  button.addEventListener("pointerdown", (event) => {

    event.preventDefault();

    keys[keyName] = true;

    if (button.setPointerCapture) {
      button.setPointerCapture(event.pointerId);
    }

    if (keyName === "Space") {
      fireLaser();
    }

  });

  const release = () => {
    keys[keyName] = false;
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);

}


bindHoldButton("moveLeft", "ArrowLeft");
bindHoldButton("moveRight", "ArrowRight");
bindHoldButton("fire", "Space");


// END GAME
function endGame(message) {

  gameOver = true;

  missionStatusEl.textContent = message;

  playAgainBtn.disabled = false;
  playAgainBtn.textContent = "PLAY AGAIN";

}


// UPDATE GAME
function update() {

  if (gameOver) return;

  // PLAYER MOVEMENT
  if (keys.ArrowLeft) {
    player.dx = -player.speed;
  }

  else if (keys.ArrowRight) {
    player.dx = player.speed;
  }

  else {
    player.dx = 0;
  }

  player.x += player.dx;

  player.x = Math.max(
    0,
    Math.min(canvas.width - player.width, player.x)
  );


  // LASER MOVEMENT
  for (let i = lasers.length - 1; i >= 0; i--) {

    lasers[i].y -= lasers[i].speed;

    if (lasers[i].y + lasers[i].height < 0) {
      lasers.splice(i, 1);
    }

  }


  // ENEMY MOVEMENT
  let hitWall = false;

  invaders.forEach((invader) => {

    if (!invader.alive) return;

    invader.x += invaderSpeed * invaderDirection;

    if (
      invader.x + invader.width >= canvas.width ||
      invader.x <= 0
    ) {
      hitWall = true;
    }

  });


  if (hitWall) {

    invaderDirection *= -1;

    invaders.forEach((invader) => {

      if (invader.alive) {
        invader.y += 15;
      }

    });

  }


  // LASER AND ENEMY COLLISIONS
  for (let i = lasers.length - 1; i >= 0; i--) {

    const laser = lasers[i];
    let hit = false;

    for (let j = 0; j < invaders.length; j++) {

      const invader = invaders[j];

      if (
        invader.alive &&
        laser.x < invader.x + invader.width &&
        laser.x + laser.width > invader.x &&
        laser.y < invader.y + invader.height &&
        laser.y + laser.height > invader.y
      ) {

        invader.alive = false;

        score += 10;
        scoreEl.textContent = score;

        hit = true;
        break;

      }

    }

    if (hit) {
      lasers.splice(i, 1);
    }

  }


  // CREATE A NEW WAVE
  if (
    invaders.length > 0 &&
    invaders.every((invader) => !invader.alive)
  ) {

    invaderSpeed += 0.5;
    createInvaders();

  }


  // CHECK ENEMY POSITION
  if (
    invaders.some(
      (invader) =>
        invader.alive &&
        invader.y + invader.height >= player.y
    )
  ) {

    endGame("DEFENSE LOST");

  }

}


// DRAW PLAYER SHIP
function drawShip() {

  ctx.save();

  ctx.shadowColor = "#53ffe1";
  ctx.shadowBlur = 14;

  ctx.fillStyle = "#53ffe1";

  ctx.beginPath();

  ctx.moveTo(
    player.x + player.width / 2,
    player.y
  );

  ctx.lineTo(
    player.x,
    player.y + player.height
  );

  ctx.lineTo(
    player.x + player.width,
    player.y + player.height
  );

  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";

  ctx.fillRect(
    player.x + 17,
    player.y + 17,
    6,
    9
  );

  ctx.restore();

}


// DRAW GAME
function draw() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  // BACKGROUND STARS
  ctx.fillStyle = "rgba(210, 235, 255, 0.55)";

  for (let i = 0; i < 34; i++) {

    const x = (i * 97 + 23) % canvas.width;
    const y = (i * 53 + 17) % canvas.height;

    ctx.fillRect(
      x,
      y,
      i % 5 === 0 ? 2 : 1,
      i % 5 === 0 ? 2 : 1
    );

  }


  // GAME OVER SCREEN
  if (gameOver) {

    ctx.fillStyle = "#ff4e91";

    ctx.textAlign = "center";

    ctx.shadowColor = "#ff4e91";
    ctx.shadowBlur = 14;

    ctx.font = "bold 38px Courier New";

    ctx.fillText(
      "GAME OVER",
      canvas.width / 2,
      canvas.height / 2 - 8
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#f3f7ff";
    ctx.font = "16px Courier New";

    ctx.fillText(
      "Select PLAY AGAIN to restart",
      canvas.width / 2,
      canvas.height / 2 + 28
    );

    return;

  }


  // DRAW PLAYER
  drawShip();


  // DRAW LASERS
  ctx.save();

  ctx.fillStyle = "#ff4e91";
  ctx.shadowColor = "#ff4e91";
  ctx.shadowBlur = 10;

  lasers.forEach((laser) => {

    ctx.fillRect(
      laser.x,
      laser.y,
      laser.width,
      laser.height
    );

  });

  ctx.restore();


  // DRAW ENEMY SHIPS
  invaders.forEach((invader) => {

    if (!invader.alive) return;

    ctx.save();

    ctx.fillStyle = "#ffd36a";
    ctx.shadowColor = "#ffd36a";
    ctx.shadowBlur = 8;

    ctx.fillRect(
      invader.x,
      invader.y,
      invader.width,
      invader.height
    );

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#17203a";

    ctx.fillRect(
      invader.x + 8,
      invader.y + 6,
      6,
      6
    );

    ctx.fillRect(
      invader.x + invader.width - 14,
      invader.y + 6,
      6,
      6
    );

    ctx.restore();

  });

}


// RESET GAME
function resetGame() {

  score = 0;
  lives = 3;
  gameOver = false;

  invaderSpeed = 2;
  invaderDirection = 1;

  player.x = canvas.width / 2 - player.width / 2;
  player.dx = 0;

  lasers.length = 0;
  invaders.length = 0;

  keys.ArrowLeft = false;
  keys.ArrowRight = false;
  keys.Space = false;

  scoreEl.textContent = score;
  livesEl.textContent = lives;

  missionStatusEl.textContent = "IN PROGRESS";

  createInvaders();

  playAgainBtn.disabled = true;
  playAgainBtn.textContent = "PLAY AGAIN";

  playAgainBtn.blur();

}


playAgainBtn.addEventListener("click", resetGame);


// ============================================
// RETRO ARCADE BACKGROUND MUSIC
// ============================================

let audioContext = null;
let masterGain = null;

let musicOn = false;
let musicTimer = null;

let noteIndex = 0;


// RETRO ARCADE MELODY
const melody = [
  440,
  523.25,
  659.25,
  523.25,
  392,
  440,
  523.25,
  659.25,
  587.33,
  523.25,
  440,
  392,
  349.23,
  392,
  440,
  523.25
];


// PLAY INDIVIDUAL MUSIC NOTE
function playArcadeNote(frequency) {

  const oscillator = audioContext.createOscillator();
  const noteGain = audioContext.createGain();

  // Square wave creates classic arcade sound
  oscillator.type = "square";

  oscillator.frequency.value = frequency;

  // Keep individual notes quiet
  noteGain.gain.setValueAtTime(
    0.12,
    audioContext.currentTime
  );

  noteGain.gain.exponentialRampToValueAtTime(
    0.001,
    audioContext.currentTime + 0.20
  );

  oscillator.connect(noteGain);
  noteGain.connect(masterGain);

  oscillator.start();

  oscillator.stop(
    audioContext.currentTime + 0.20
  );

}


// START BACKGROUND MUSIC
function startMusic() {

  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {

    musicToggle.textContent = "MUSIC UNAVAILABLE";
    musicToggle.disabled = true;

    return;

  }


  // CREATE AUDIO CONTEXT
  if (!audioContext) {

    audioContext = new AudioContextClass();

    masterGain = audioContext.createGain();

    // Overall background music volume
    masterGain.gain.value = 0.035;

    masterGain.connect(audioContext.destination);

  }


  audioContext.resume();

  musicOn = true;
  noteIndex = 0;

  musicToggle.textContent = "♫ RETRO MUSIC: ON";

  musicToggle.setAttribute(
    "aria-pressed",
    "true"
  );


  // Play a new note every 250 milliseconds
  musicTimer = setInterval(() => {

    playArcadeNote(melody[noteIndex]);

    noteIndex = (noteIndex + 1) % melody.length;

  }, 250);

}


// STOP BACKGROUND MUSIC
function stopMusic() {

  if (musicTimer) {

    clearInterval(musicTimer);
    musicTimer = null;

  }

  if (audioContext) {
    audioContext.suspend();
  }

  musicOn = false;

  musicToggle.textContent = "♫ RETRO MUSIC: OFF";

  musicToggle.setAttribute(
    "aria-pressed",
    "false"
  );

}


// MUSIC ON/OFF BUTTON
musicToggle.addEventListener("click", () => {

  if (musicOn) {
    stopMusic();
  }

  else {
    startMusic();
  }

});


// GAME LOOP
function gameLoop() {

  update();
  draw();

  requestAnimationFrame(gameLoop);

}


// START GAME
createInvaders();
gameLoop();
