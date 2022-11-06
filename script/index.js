import { HorizonLine } from "./horizon.js";
import { Cloud } from './cloud.js';

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
    let startTime = 0;
    (function draw(time = 0) {
        horizon.ctx.clearRect(0, 0, canvasDefinition.WIDTH, canvasDefinition.HEIGHT);
        horizon.update(time - startTime, 2);
        cloud.updateCloud(2);
        startTime = time;
        window.requestAnimationFrame(draw);
    }());
};