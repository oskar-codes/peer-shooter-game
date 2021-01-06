let game = new Vue({
  el: '#app',
  data: {
    id: '',
    connection: undefined,
    local: {x: 0, y: 0, dx: 0, dy: 0, health: 100},
    remote: {x: 0, y: 0, health: 100},
    localProjectiles: [],
    remoteProjectiles: [],
    shake: 0
  }
});

const connect = document.querySelector('#connect');
const peerInput = document.querySelector('#peer-input');
const peer = new Peer();
connect.addEventListener('click', (e) => {
  console.log('SENT REQUEST');
  handleConnection(peer.connect(peerInput.value));
});

peer.on('open', id => {
  game.id = id;
});

peer.on('connection', handleConnection);
function handleConnection(connection) {
  connection.on('open', () => {
    console.log('CONNECTION STARTED');
    game.connection = connection;
    setupGame();
  });
  connection.on('data', acceptData);
}

function acceptData(data) {
  if (data.type === 'position') {
    game.remote.x = data.data.x;
    game.remote.y = data.data.y;
  } else if (data.type === 'projectile') {
    game.remoteProjectiles.push(data.data);
  } else if (data.type === 'health') {
    game.remote.health = data.data;
  } else if (data.type === 'loss') {
    alert('You won!');
    resetPlayers();
  }
}

function sendData(data) {
  //game.connection.send(data);
}
setupGame();
function setupGame() {

  resetPlayers();

  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  
  SimpleCanvas.setupCanvas(ctx);
  
  SimpleCanvas.init = () => {
  
  }
  
  SimpleCanvas.update = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    const speed = 0.5;
    if (SimpleCanvas.btn('A')) game.local.dx -= speed;
    if (SimpleCanvas.btn('D')) game.local.dx += speed;
    if (SimpleCanvas.btn('W')) game.local.dy -= speed;
    if (SimpleCanvas.btn('S')) game.local.dy += speed;
    game.local.dx *= 0.9;
    game.local.dy *= 0.9;
    game.local.x += game.local.dx;
    game.local.y += game.local.dy;

    sendData({
      type: 'position',
      data: game.local
    });
    sendData({
      type: 'health',
      data: game.local.health
    });

    SimpleCanvas.cls();

    SimpleCanvas.rectfill(xAdjust(-200), yAdjust(-200), 400, 400, 'grey')

    SimpleCanvas.rectfill(xAdjust(game.remote.x), yAdjust(game.remote.y), 30, 30, 'red');
    SimpleCanvas.rectfill(window.innerWidth / 2, window.innerHeight / 2, 30, 30, 'white');

    SimpleCanvas.text(`Your health: ${game.local.health}`, 10, 40, 'white');
    SimpleCanvas.text(`Enemy health: ${game.remote.health}`, 10, 80, 'white');

    game.localProjectiles.forEach(projectile => {
      projectile.x += projectile.dx;
      projectile.y += projectile.dy;

      SimpleCanvas.circfill(xAdjust(projectile.x), yAdjust(projectile.y), 4, 'white');
    });

    game.remoteProjectiles.forEach(projectile => {
      projectile.x += projectile.dx;
      projectile.y += projectile.dy;

      const a = {
        x: game.local.x,
        y: game.local.y,
        w: 30,
        h: 30
      }
      const b = {
        x: projectile.x - 2,
        y: projectile.y - 2,
        w: 4,
        h: 4
      }

      if (a.x + a.w > b.x &&
          a.x < b.x + b.w &&
          a.y + a.h > b.y &&
          a.y < b.y + b.h &&
          !projectile.hasHit) {
        game.local.health -= 10;
        projectile.hasHit = true;
        if (game.local.health <= 0) {
          alert('You lost!');
          resetPlayers();
          sendData({
            type: 'loss'
          });
        }
      }

      SimpleCanvas.circfill(xAdjust(projectile.x), yAdjust(projectile.y), 4, 'red')
    });


    handleShooting();
    updateShake();
  }
}

function xAdjust(x) {
  return window.innerWidth / 2 + x - game.local.x;
}
function yAdjust(y) {
  return window.innerHeight / 2 + y - game.local.y;
}

function updateShake() {
  game.shake *= 0.95;
  if (game.shake < 0.05) {
    game.shake = 0;
  }

  let shakeY = Math.random() * 32 - 16;
  shakeY *= game.shake;

  let shakeX = Math.random() * 32 - 16;
  shakeX *= game.shake;

  document.querySelector('canvas').style.transform = `translate(${shakeX}px, ${shakeY}px)`;
}

function resetPlayers() {
  game.local.x = 0;
  game.local.y = 0;
  game.local.dx = 0;
  game.local.dy = 0;
  game.local.health = 100;

  game.remote.x = 0;
  game.remote.y = 0;
  game.remote.health = 100;

  game.localProjectiles = [];
  game.remoteProjectiles = [];
}

const sound = new Howl({
  src: ['sounds/sfx_wpn_laser8.wav']
});

let shootTimer = 0;
let canshoot = true;
function handleShooting() {
  if (!canshoot) {
    shootTimer += 1;
    if (shootTimer >= 10) {
      canshoot = true;
      shootTimer = 0;
    }
  }
  if (SimpleCanvas.mousedown() && canshoot) {
    canshoot = false;

    let bulletDx = SimpleCanvas.mouse()[0] - window.innerWidth / 2 - 15;
    let bulletDy = SimpleCanvas.mouse()[1] - window.innerHeight / 2 - 15;
    const norm = Math.sqrt(bulletDx**2 + bulletDy**2);
    
    bulletDx /= norm;
    bulletDy /= norm;

    let angle = Math.atan2(bulletDx, -bulletDy) - Math.PI / 2;
    bulletDx = Math.cos(angle) * 30;
    bulletDy = Math.sin(angle) * 30;

    const projectile = {
      x: game.local.x + 15,
      y: game.local.y + 15,
      dx: bulletDx,
      dy: bulletDy,
      hasHit: false
    }

    sendData({
      type: 'projectile',
      data: projectile
    });

    game.localProjectiles.push(projectile);

    sound.play();
    
    game.shake += 1;
  }
}