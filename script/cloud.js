const cloudConfig = {
    HEIGHT: 15,
    WIDTH: 50,
    MAX_GAP: 300,
    MIN_GAP: 100,
    MAX_HEIGHT: 30,
    MIN_HEIGHT: 70,
    MAX_NUM: 7,
    CLOUD_RATE: 0.5,
};

let CloudsLine = [];

export class Cloud {
    canvas
    spritePos
    containerWidth
    xPos
    yPos
    remove
    cloudGap

    constructor(canvas, spritePos, containerWidth) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.spritePos = spritePos;
        this.containerWidth = containerWidth;
        this.xPos = containerWidth;
        this.yPos = 0;
        this.remove = false;

        this.cloudGap = this.getRandomNum(cloudConfig.MIN_GAP, cloudConfig.MAX_GAP);
        this.init();
    }

    getRandomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    init() {
        this.yPos = this.getRandomNum(cloudConfig.MAX_HEIGHT, cloudConfig.MIN_HEIGHT);
        this.draw();
    };

    draw() {
        this.ctx.save();
        this.ctx.drawImage(document.getElementById("cloud"),
            this.spritePos.x, this.spritePos.y,
            cloudConfig.WIDTH * 2, cloudConfig.HEIGHT * 2,
            this.xPos, this.yPos,
            cloudConfig.WIDTH, cloudConfig.HEIGHT,
        );
        this.ctx.restore();
    };

    updateCloud(speed) {
        let cloudNum = CloudsLine.length;
        if (!cloudNum) {
            this.addCloud();
        } else {
            for (let i = 0; i < cloudNum; i++) {
                CloudsLine[i].update(speed);
            }

            let lastCloud = CloudsLine[cloudNum - 1];
            if (cloudNum < cloudConfig.MAX_NUM &&
                (this.containerWidth - lastCloud.xPos) > lastCloud.cloudGap &&
                cloudConfig.CLOUD_RATE > Math.random()) {
                this.addCloud();
            }

            CloudsLine = CloudsLine.filter(cloud => !cloud.remove);
        }
    };

    addCloud() {
        let newCloud = new Cloud(this.canvas, this.spritePos, this.containerWidth);
        CloudsLine.push(newCloud);
    }

    update(speed) {
        if (!this.remove) {
            this.xPos -= Math.ceil(speed);
            this.draw();

            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    }

    isVisible() {
        return this.xPos + cloudConfig.WIDTH > 0;
    }
}