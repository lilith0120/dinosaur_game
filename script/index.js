import { HorizonLine } from "./horizon.js";
import { Cloud } from './cloud.js';
import { Night } from './night.js';
import { Obstacle } from './obstacle.js';

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
};

const Dimensions = {
    WIDTH: 800,
    HEIGHT: 20,
    YPOS: 127 // 在canvas的位置
};

// 画板大小
const canvasDefinition = {
    WIDTH: 1200,
    HEIGHT: 200,
};

window.onload = () => {
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let horizon = new HorizonLine(canvas, spriteDefinition.HORIZON, Dimensions);
    let cloud = new Cloud(canvas, spriteDefinition.CLOUD, Dimensions.WIDTH);
    let night = new Night(canvas, spriteDefinition.NIGHT, Dimensions.WIDTH);
    let obstacle = new Obstacle(canvas, spriteDefinition.OBSTACLE, Dimensions.WIDTH, 0.5, 1, 0, undefined)
    let startTime = 0;
    let gameScore = 0;
    let speed = 2.5;

    (function draw(time = 0) {
        let deltaTime = time - startTime;
        gameScore++;
        if (speed < 13 && !(gameScore % 1000)) {
            speed += 0.5;
        }

        ctx.clearRect(0, 0, canvasDefinition.WIDTH, canvasDefinition.HEIGHT);
        horizon.update(deltaTime, speed);
        cloud.updateCloud(0.2);
        night.invert(deltaTime, gameScore);
        obstacle.updateObstacle(deltaTime, speed);

        startTime = time;
        window.requestAnimationFrame(draw);
    }());
};