const canvas = document.getElementById("soldierCanvas");
const ctx = canvas.getContext("2d");

const soldier = new Image();
soldier.src = "soldier_sprite.png";

let frame = 0;

const frameWidth = 128;
const frameHeight = 128;
const totalFrames = 4;

function animateSoldier() {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   ctx.drawImage(
      soldier,
      frame * frameWidth,
      0,
      frameWidth,
      frameHeight,
      60,
      10,
      frameWidth,
      frameHeight
   );

   frame++;

   if (frame >= totalFrames) {
      frame = 0;
   }
}

soldier.onload = function() {
   setInterval(animateSoldier, 150);
};