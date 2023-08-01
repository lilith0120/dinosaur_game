import { HorizonLine } from "./horizon.js";
import { Cloud } from './cloud.js';
import { Night } from './night.js';
import { Obstacle } from './obstacle.js';
import { Dinosaur } from './dinosaur.js';
import { checkCollision } from './collision-box.js';
import { Distance } from './distance.js';

// 地面初始坐标
const spriteDefinition = {
    HORIZON: {
        x: 0,
        y: 0,
    },
    CLOUD: {
        x: 0,
        y: 0,
    },
    NIGHT: {
        x: 484,
        y: 2,
    },
    OBSTACLE: {
        x: 228,
        y: 2,
    },
    DINOSAUR: {
        x: 848,
        y: 2,
    },
    DISTANCE: {
        x: 655,
        y: 2,
    },
};

const Dimensions = {
    WIDTH: 800,
    HEIGHT: 150,
    YPOS: 127 // 在canvas的位置
};

// 画板大小
const canvasDefinition = {
    WIDTH: 800,
    HEIGHT: 200,
};

const keyCode = {
    JUMP: [32, 38],
    DUCK: [40],
    RESTART: [82],
};

window.onload = () => {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");

    let horizon = new HorizonLine(canvas, spriteDefinition.HORIZON, Dimensions);
    let cloud = new Cloud(canvas, spriteDefinition.CLOUD, Dimensions.WIDTH);
    let night = new Night(canvas, spriteDefinition.NIGHT, Dimensions.WIDTH);
    let obstacle = new Obstacle(canvas, spriteDefinition.OBSTACLE, Dimensions.WIDTH, 0.5, 1, 0, undefined);
    let dinosaur = new Dinosaur(canvas, spriteDefinition.DINOSAUR, Dimensions.HEIGHT);
    let distance = new Distance(canvas, spriteDefinition.DISTANCE, Dimensions.WIDTH);

    let startTime = 0;
    let gameScore = 0;
    let highScore = 0;
    let speed = 2.5;
    let isPlay = false;
    let isGameOver = true;
    let req = null;
    let playCnt = 0;

    function draw(time = 0) {
        let deltaTime = time - startTime;
        startTime = time;

        if (isPlay) {
            ctx.clearRect(0, 0, canvasDefinition.WIDTH, canvasDefinition.HEIGHT);
            gameScore++;
            if (speed < 13 && !(gameScore % 1000)) {
                speed += 0.5;
            }

            horizon.update(deltaTime, speed);
            cloud.updateCloud(0.2);
            night.invert(deltaTime, gameScore);
            obstacle.updateObstacle(deltaTime, speed);
            distance.update(deltaTime, gameScore);

            if (dinosaur.isJump) {
                dinosaur.updateJump(deltaTime);
            }

            if (checkCollision(dinosaur, obstacle.obstaclesLine[0])) {
                gameOver();
            }
        }

        dinosaur.update(deltaTime);
        req = window.requestAnimationFrame(draw);
    };
    draw();

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onKeyDown);

    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mouseup", onKeyUp);

    function onKeyDown(e) {
        if ((keyCode.RESTART.includes(e.keyCode) && playCnt > 0) ||
        (keyCode.JUMP.includes(e.keyCode) && playCnt === 0)) {
            if (isGameOver) {
                startGame();
            }
        }

        if (isGameOver) return;

        if (keyCode.JUMP.includes(e.keyCode)) {
            if (!dinosaur.isJump) {
                dinosaur.startJump();
            }
        } else if (keyCode.DUCK.includes(e.keyCode)) {
            if (dinosaur.isJump) {
                dinosaur.setSpeedDown();
            } else if (!dinosaur.isJump && !dinosaur.isDuck) {
                dinosaur.setDuck(true);
            }
        }
    }

    function onKeyUp(e) {
        if (keyCode.JUMP.includes(e.keyCode)) {
            dinosaur.endJump();
        } else if (keyCode.DUCK.includes(e.keyCode)) {
            dinosaur.speedDown = false;
            dinosaur.setDuck(false);
        }
    }

    function gameOver() {
        cancelAnimationFrame(req);
        req = null;
        if (gameScore > highScore) {
            highScore = gameScore;
            distance.setHighScore(highScore);
        }

        distance.isFlash = false;
        dinosaur.update(0, "HIT");

        startTime = 0;
        gameScore = 0;
        speed = 2.5;
        isPlay = false;
        isGameOver = true;
    }

    function startGame() {
        isGameOver = false;
        isPlay = true;
        playCnt += 1;

        night.reset();
        obstacle.reset();
        dinosaur.reset();
        distance.reset();

        startTime = 0;
        draw();
    }
};