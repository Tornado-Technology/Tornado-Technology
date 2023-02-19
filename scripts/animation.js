const canvas = document.querySelector('#animation');
const context = canvas.getContext( '2d' );
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const minDist = 20;
const maxDist = 40;
const initialWidth = 10;
const maxLines = 200;
const initialLines = 12;
const speed = 3;
const lines = [];

let frame = 0;
let timeSinceLast = 0;

const dirs = [
  // Straight x, y velocity
  [ 0,  1],
  [ 1,  0],
  [ 0, -1],
  [-1,  0],

  // Diagonals, 0.7 = sin(PI/4) = cos(PI/4)
  [ 0.7,  0.7],
  [ 0.7, -0.7],
  [-0.7,  0.7],
  [-0.7, -0.7],
];

const starter = { // starting parent line, just a pseudo line
  x: width / 2,
  y: height / 2,
  vx: 0,
  vy: 0,
  width: initialWidth
};

const start = () => {
  lines.length = 0;

  for (let i = 0; i < initialLines; i++) {
    lines.push(new Line(starter));
  }

  context.fillStyle = '#222';
  context.fillRect(0, 0, width, height);
  context.lineCap = 'round';
}

const getColor = (x) => `hsl(${x / width * 360 + frame}, 80%, 50%)`;

const render = () => {
  window.requestAnimationFrame(render);
  frame++;

  context.shadowBlur = 0;
  context.fillStyle = 'rgba(0, 0, 0, 0.02)';
  context.fillRect(0, 0, width, height);
  context.shadowBlur = 0.5;

  for (let i = 0; i < lines.length; i++) {
    // If true it's dead
    if (lines[i].step()) {
      lines.splice(i, 1);
      i--;
    }
  }

  // Spawn new
  timeSinceLast++;
  if (lines.length < maxLines && timeSinceLast > 5 && Math.random() < 0.5) {
    timeSinceLast = 0;
    lines.push(new Line(starter));

    // Cover the middle;
    context.fillStyle = context.shadowColor = getColor(starter.x);
    context.beginPath();
    context.arc(starter.x, starter.y, initialWidth, 0, Math.PI * 2);
    context.fill();
  }
}

class Line {
  constructor(parent) {
    this.x = parent.x | 0;
    this.y = parent.y | 0;
    this.width = parent.width / 1.25;

    do {
      const dir = dirs[(Math.random() * dirs.length) | 0];
      this.vx = dir[0];
      this.vy = dir[1];
    } while ((this.vx === -parent.vx && this.vy === -parent.vy ) || ( this.vx === parent.vx && this.vy === parent.vy));

    this.vx *= speed;
    this.vy *= speed;

    this.dist = ( Math.random() * ( maxDist - minDist ) + minDist );
  }

  step() {
    let dead = false;
    let prevX = this.x;
    let prevY = this.y;
    this.x += this.vx;
    this.y += this.vy;
    this.dist--;

    // Kill if out of screen
    if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
      dead = true;
    }

    // Make children :D
    if (this.dist <= 0 && this.width > 1) {
      // Keep yo self, sometimes
      this.dist = Math.random() * (maxDist - minDist) + minDist;

      // Add 2 children
      if (lines.length < maxLines) {
        lines.push(new Line(this));
      }

      if (lines.length < maxLines && Math.random() < 0.5) {
        lines.push(new Line(this));
      }

      // Kill the poor thing
      if (Math.random() < 0.2) {
        dead = true;
      }
    }

    context.strokeStyle = context.shadowColor = getColor( this.x );
    context.beginPath();
    context.lineWidth = this.width;
    context.moveTo( this.x, this.y );
    context.lineTo( prevX, prevY );
    context.stroke();

    return dead;
  }

}

start();
render();

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  starter.x = width / 2;
  starter.y = height / 2;
  start();
});
