import _ from 'lodash';

const gameState = {
  gameSpace: {
    canvas: document.getElementById('gameSpace'),
    context: undefined,
    width: 1280,
    height: 720,
  },
  ball: {
    radius: 10,
    position: {
      x: undefined,
      y: undefined,
    },
    color: '#4d089a',
    velocity: 4,
    xSpeed: undefined,
    ySpeed: undefined,
  },
  brick: {
    width: undefined,
    height: undefined,
    margin: 40,
    position: {
      x: undefined,
      y: undefined,
    },
    isDestroyed: false,
  },
  numberOfBricksRow: 5,
  numberOfBricksColumn: 9,
  bricks: [],
  paddle: {
    width: 120,
    height: 10,
    position: {
      x: undefined,
      y: undefined,
    },
    velocity: 30,
    xSpeed: undefined,
  },
};

const setupBallState = () => {
  gameState.ball.position.x = gameState.gameSpace.canvas.width / 2;
  gameState.ball.position.y = gameState.gameSpace.canvas.height - 50;
  gameState.ball.xSpeed = gameState.ball.velocity;
  gameState.ball.ySpeed = -gameState.ball.velocity;
};

const setupBricksState = () => {
  gameState.brick.width = _.ceil((gameState.gameSpace.width - ((gameState.numberOfBricksColumn + 1) * gameState.brick.margin)) / gameState.numberOfBricksColumn);
  gameState.brick.height = _.ceil(((gameState.gameSpace.height / 2) - ((gameState.numberOfBricksRow + 1) * gameState.brick.margin)) / gameState.numberOfBricksRow);
  for (let col = 0; col < gameState.numberOfBricksColumn; col += 1) {
    for (let row = 0; row < gameState.numberOfBricksRow; row += 1) {
      const brick = _.cloneDeep(gameState.brick);
      brick.position.x = col * gameState.brick.width + (gameState.brick.margin * col) + gameState.brick.margin;
      brick.position.y = row * gameState.brick.height + (gameState.brick.margin * row) + gameState.brick.margin;
      gameState.bricks.push(brick);
    }
  }
};

const setupPaddleState = () => {
  gameState.paddle.position.x = (gameState.gameSpace.canvas.width - gameState.paddle.width) / 2;
  gameState.paddle.position.y = gameState.gameSpace.canvas.height - gameState.paddle.height;
  gameState.paddle.xSpeed = gameState.paddle.velocity;
};

const setupGameSpaceState = () => {
  gameState.gameSpace.context = gameState.gameSpace.canvas.getContext('2d');
  gameState.gameSpace.canvas.width = gameState.gameSpace.width;
  gameState.gameSpace.canvas.height = gameState.gameSpace.height;
};

const setupGameState = () => {
  setupGameSpaceState();
  setupBallState();
  setupBricksState();
  setupPaddleState();
};

const renderBall = () => {
  gameState.gameSpace.context.beginPath();
  gameState.gameSpace.context.arc(gameState.ball.position.x, gameState.ball.position.y,
    gameState.ball.radius, 0, Math.PI * 2);
  gameState.gameSpace.context.fillStyle = gameState.ball.color;
  gameState.gameSpace.context.fill();
  gameState.gameSpace.context.closePath();
};

const updateBallState = () => {
  gameState.ball.position.x += gameState.ball.xSpeed;
  gameState.ball.position.y += gameState.ball.ySpeed;
};

const detectBorderGameSpaceCollision = () => {
  const isLeftCollision = () => gameState.ball.position.x - gameState.ball.radius < 0;

  const isRightCollision = () => gameState.ball.position.x + gameState.ball.radius > gameState.gameSpace.canvas.width;

  const isTopCollision = () => gameState.ball.position.y - gameState.ball.radius < 0;

  const isBottomCollision = () => gameState.ball.position.y + gameState.ball.radius > gameState.gameSpace.canvas.height;

  if (isLeftCollision()) {
    gameState.ball.xSpeed = -gameState.ball.xSpeed;
  } else if (isRightCollision()) {
    gameState.ball.xSpeed = -gameState.ball.xSpeed;
  } else if (isTopCollision()) {
    gameState.ball.ySpeed = -gameState.ball.ySpeed;
  }
};

const detectBrickCollision = () => {
  const isLeftCollision = (brick) => gameState.ball.position.x + gameState.ball.radius > brick.position.x;

  const isRightCollision = (brick) => gameState.ball.position.x - gameState.ball.radius < brick.position.x + brick.width;

  const isTopCollision = (brick) => gameState.ball.position.y + gameState.ball.radius > brick.position.y;

  const isBottomCollision = (brick) => gameState.ball.position.y - gameState.ball.radius < brick.position.y + brick.height;

  for (let index = 0; index < gameState.numberOfBricksColumn * gameState.numberOfBricksRow; index += 1) {
    if (isLeftCollision(gameState.bricks[index])
    && isRightCollision(gameState.bricks[index])
    && isBottomCollision(gameState.bricks[index])
    && isTopCollision(gameState.bricks[index])
    && !gameState.bricks[index].isDestroyed) {
      gameState.ball.ySpeed = -gameState.ball.ySpeed;
      gameState.bricks[index].isDestroyed = true;
    }
  }
};

const detectPaddleCollision = () => {
  const isTopCollision = () => gameState.ball.position.y + gameState.ball.radius > gameState.paddle.position.y;

  const isLeftCollision = () => gameState.ball.position.x + gameState.ball.radius > gameState.paddle.position.x;

  const isRightCollision = () => gameState.ball.position.x - gameState.ball.radius < gameState.paddle.position.x + gameState.paddle.width;

  if (isLeftCollision() && isRightCollision() && isTopCollision()) {
    gameState.ball.ySpeed = -gameState.ball.ySpeed;
  }
};

const detectCollision = () => {
  detectBrickCollision();
  detectPaddleCollision();
  detectBorderGameSpaceCollision();
};

const updateGameState = () => {
  updateBallState();
  detectCollision();
};

const clearGameSpace = () => {
  gameState.gameSpace.context.clearRect(0, 0,
    gameState.gameSpace.canvas.width, gameState.gameSpace.canvas.height);
};

const renderBrick = (brick) => {
  gameState.gameSpace.context.beginPath();
  gameState.gameSpace.context.rect(brick.position.x, brick.position.y,
    gameState.brick.width, gameState.brick.height);
  gameState.gameSpace.context.fillStyle = '#0095DD';
  gameState.gameSpace.context.fill();
  gameState.gameSpace.context.closePath();
};

const renderBricks = () => {
  gameState.bricks.forEach((brick) => {
    if (!brick.isDestroyed) {
      renderBrick(brick);
    }
  });
};

const renderPaddle = () => {
  gameState.gameSpace.context.beginPath();
  gameState.gameSpace.context.rect(gameState.paddle.position.x, gameState.paddle.position.y,
    gameState.paddle.width, gameState.paddle.height);
  gameState.gameSpace.context.fillStyle = '#0095DD';
  gameState.gameSpace.context.fill();
  gameState.gameSpace.context.closePath();
};

const render = () => {
  clearGameSpace();
  renderBall();
  renderBricks();
  renderPaddle();
  updateGameState();
  window.requestAnimationFrame(render);
};

const processInput = () => {
  const isLeftBorder = () => gameState.paddle.position.x <= 0;

  const isRightBorder = () => gameState.paddle.position.x + gameState.paddle.width >= gameState.gameSpace.canvas.width;


  document.addEventListener('keydown', (event) => {
    if (event.key === 'Right' || event.key === 'ArrowRight') {
      if (!isRightBorder()) {
        gameState.paddle.position.x += gameState.paddle.xSpeed;
      }
    } else if (event.key === 'Left' || event.key === 'ArrowLeft') {
      if (!isLeftBorder()) {
        gameState.paddle.position.x -= gameState.paddle.xSpeed;
      }
    }
  }, false);
  document.addEventListener('mousemove', (event) => {
    if (!isLeftBorder()) {
      gameState.paddle.position.x = event.x;
    } else if (!isRightBorder()) {
      gameState.paddle.position.x = event.x;
    } if (isLeftBorder()) {
      gameState.paddle.position.x = 0;
    } else if (isRightBorder()) {
      gameState.paddle.position.x = gameState.gameSpace.canvas.width - gameState.paddle.width;
    }
  }, false);
};

const startGameLoop = () => {
  processInput();
  setupGameState();
  window.requestAnimationFrame(render);
};

startGameLoop();
