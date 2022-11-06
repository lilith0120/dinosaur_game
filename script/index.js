import { HorizonLine } from "./horizon.js";
import { Cloud } from './cloud.js';
import { Night } from './night.js';

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
    let horizon = new HorizonLine(canvas, spriteDefinition.HORIZON, Dimensions);
    let cloud = new Cloud(canvas, spriteDefinition.CLOUD, Dimensions.WIDTH);
    let night = new Night(canvas, spriteDefinition.NIGHT, Dimensions.WIDTH);
    let startTime = 0;
    let gameScore = 0;
    (function draw(time = 0) {
        let deltaTime = time - startTime;
        gameScore++;
        horizon.ctx.clearRect(0, 0, canvasDefinition.WIDTH, canvasDefinition.HEIGHT);
        horizon.update(deltaTime, 2.5);
        cloud.updateCloud(1);
        night.invert(deltaTime, gameScore);

        startTime = time;
        window.requestAnimationFrame(draw);
    }());
};