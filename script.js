window.onload = () => {
    let canvas = document.getElementById("canvas");
    let horizon = new HorizonLine(canvas, spriteDefinition.HORIZON);
    let startTime = 0;
    (function draw(time = 0) {
        horizon.ctx.clearRect(0, 0, RunnerDimensions.WIDTH, RunnerDimensions.HEIGHT);
        horizon.update(time - startTime, 2);
        startTime = time;
        window.requestAnimationFrame(draw);
    }());
};

const FPS = 60;
const RunnerDimensions = {
    WIDTH: 800,
    HEIGHT: 200,
};

const Dimensions = {
    WIDTH: 800,
    HEIGHT: 20,
    YPOS: 127 // 在canvas的位置
};

// 地面初始坐标
let spriteDefinition = {
    HORIZON: {
        x: 0,
        y: 0,
    }
};

// canvas: 绘制画布,
// spritePos: 地面坐标
class HorizonLine {
    spritePos
    canvas
    ctx
    dimensions
    xPos
    yPos
    bumpThreshold
    sourceXPos

    constructor(canvas, spritePos) {
        this.canvas = canvas;
        this.spritePos = spritePos;
        this.ctx = canvas.getContext("2d");
        this.dimensions = Dimensions;
        this.xPos = [];
        this.yPos = 0;
        this.sourceXPos = [this.spritePos.x, this.spritePos.x + this.dimensions.WIDTH];
        this.bumpThreshold = 0.5;

        this.setSourceDimesions();
        this.draw();
    }

    // 设置地面资源位置
    setSourceDimesions() {
        this.xPos = [0, this.dimensions.WIDTH];
        this.yPos = this.dimensions.YPOS;
    }

    // 绘制地图
    draw() {
        this.ctx.drawImage(document.getElementById("horizon"),
            this.sourceXPos[0], this.spritePos.y,
            this.dimensions.WIDTH * 2, this.dimensions.HEIGHT * 2,
            this.xPos[0], this.yPos,
            this.dimensions.WIDTH, this.dimensions.HEIGHT,
        );
        this.ctx.drawImage(document.getElementById("horizon"),
            this.sourceXPos[1], this.spritePos.y,
            this.dimensions.WIDTH * 2, this.dimensions.HEIGHT * 2,
            this.xPos[1], this.yPos,
            this.dimensions.WIDTH, this.dimensions.HEIGHT,
        )
    }

    // 获取随机地板
    getRandomSource() {
        return Math.random() > this.bumpThreshold ? this.dimensions.WIDTH: 0;
    }

    // 更新x轴地板
    updateXpos(pos, increment) {
        let line1 = pos;
        let line2 = pos === 0 ? 1 : 0;

        this.xPos[line1] -= increment;
        this.xPos[line2] = this.xPos[line1] + this.dimensions.WIDTH;

        // 如果第一块地板完全离开画布，就拉回右侧准备
        // 第二块地板进入画布
        if (this.xPos[line1] <= -this.dimensions.WIDTH) {
            this.xPos[line1] += this.dimensions.WIDTH * 2;
            this.xPos[line2] = this.xPos[line1] - this.dimensions.WIDTH;

            this.sourceXPos[line1] = this.getRandomSource();
        }

    }

    // 更新地板
    update(deltaTime, speed) {
        let increment = Math.floor(speed * (FPS / 1000) * deltaTime);

        // 交换两块地板
        if (this.xPos[0] <= 0) {
            this.updateXpos(0, increment);
        } else {
            this.updateXpos(1, increment);
        }
        this.draw();
    }

    reset() {
        this.xPos = [0, this.dimensions.WIDTH];
    }
}