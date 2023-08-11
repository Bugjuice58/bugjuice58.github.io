let x = 0;
let y = 0;
let M = 0;
let mY = 0;
let mX = 0;
let r = 0;
let g = 0;
let b = 0;
let c = -1;
let startupCube = 1;
let squareSize = 0;
let f = false;
let theme = 'night';
let backgroundOn = true;
let showVid = false;

function setup() {
  createCanvas(displayWidth, displayHeight, WEBGL);
  colorMode(HSL);
}

function draw() {
  let dW = windowWidth;
  let dH = windowHeight;
  c = c + 1; 
  x = x + 0.01
  y = y + 0.01
  if (theme === 'night') {
  if (backgroundOn) {
  background(0);
  }
  noFill();
  stroke(c, 100, 50);
  }
  if (theme === 'retro') {
  if (backgroundOn) {
  background(c,100,25);
  }
  fill(c,100,50);
  stroke(c,100,25);
  }
  rotateX(x);
  rotateY(y);
  if (startupCube === 0) {
  box(200, 200, 200);
  }
  if (startupCube === 1) {
  box (squareSize, squareSize, squareSize);
    if (dW >=(dW + dH)) {
      squareSize = Math.sqrt(dH*dH)
    } else {
      squareSize = Math.sqrt(dW*dW)
    }
  }
  if (c >= 360) {
    c = 0;
  }
  camera(0, 0, (height*1.80) / tan(PI*30.0 / 180.0), 0, 0, 0, 0, 1, 0);
  strokeWeight(6);
}

function mousePressed () {
 if (f === false) {
   f = true; 
  } else {
   f = false; 
  }
 fullscreen(f);
}

function mouseDragged () {
 x = x + (movedY * -0.01)
 y = y + (movedX * 0.01)
 let M = 1;
 let mY = movedY;
 let mX = movedX;
}

function keyPressed() {
  if (key === 'm') {
    if (theme === 'night') {
      theme = 'retro'
    } else {
      theme = 'night'
    }
  }
  if (key === 's') {
    if (startupCube === 0) {
      startupCube = 1
    } else {
      startupCube = 0
    }
  }
  if (key === 'b') {
    if (backgroundOn) {
      backgroundOn = false
    } else {
      backgroundOn = true
    }
  }
  if (key === 'h') {
    if (showVid) {
    document.querySelector('#home').style.display = 'none'
    showVid = false
    } else {
    document.querySelector('#home').style.display = 'block'
    showVid = true
    }
  }
}