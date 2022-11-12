const distanceConfig = {
    WIDTH: 10,
    HEIGHT: 13,
    GAP: 7,
    MAX_DISTANCE_UNIT: 5,
    FLASH_DISTANCE: 100,
    PARAM: 0.1,
    FLASH_DURATION: 1000 / 4,
    FLASH_NUM: 3,
};

export class Distance {
    canvas
    ctx
    spritePos
    containerWidth
    xPos
    yPos

    highScore
    maxScore
    isFlash
    digits
    defaultString
    flashTime
    flashNum

    config
    maxScoreUnit

    constructor(canvas, spritePos, containerWidth) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.spritePos = spritePos;
        this.containerWidth = containerWidth;
        this.xPos = 0;
        this.yPos = 0;

        this.highScore = 0;
        this.maxScore = 0;
        this.isFlash = false;
        this.digits = [];
        this.defaultString = "";
        this.flashTime = 0;
        this.flashNum = 0;

        this.config = distanceConfig;
        this.maxScoreUnit = distanceConfig.MAX_DISTANCE_UNIT;

        this.init();
    }

    init() {
        let maxDistanceString = "";
        this.calcXPos();
        for (let i = 0; i < this.maxScoreUnit; i++) {
            this.draw(i, 0);
            this.defaultString += "0";
            maxDistanceString += "9";
        }

        this.maxScore = parseInt(maxDistanceString);
        this.setHighScore(0);
        this.drawHighScore();
    };

    calcXPos() {
        this.xPos = this.containerWidth - (distanceConfig.GAP * (this.maxScoreUnit + 1)) - 500;
    };

    draw(digitPos, value, highest) {
        let sourceWidth = distanceConfig.WIDTH;
        let sourceHeight = distanceConfig.HEIGHT;
        let sourceX = sourceWidth * value + this.spritePos.x;
        let sourceY = this.spritePos.y;
        let targetX = digitPos * distanceConfig.GAP;

        this.ctx.save();

        if (highest) {
            let highScoreX = this.xPos - (this.maxScoreUnit * 2) * distanceConfig.WIDTH;
            this.ctx.translate(highScoreX, this.yPos);
        } else {
            this.ctx.translate(this.xPos, this.yPos);
        }

        this.ctx.drawImage(document.getElementById("image"),
            sourceX, sourceY,
            sourceWidth, sourceHeight,
            targetX, this.yPos,
            sourceWidth / 2, sourceHeight,
        );

        this.ctx.restore();
    };

    getDistance(distance) {
        return distance ? Math.round(distance * distanceConfig.PARAM) : 0;
    };

    update(deltaTime, distance) {
        let paint = true;

        if (!this.isFlash) {
            distance = this.getDistance(distance);

            if (distance > 0) {
                if (!(distance % distanceConfig.FLASH_DISTANCE)) {
                    this.isFlash = true;
                    this.flashTime = 0;
                }

                let distanceString = (this.defaultString + distance).substr(-this.maxScoreUnit);
                this.digits = distanceString.split("");
            } else {
                this.digits = this.defaultString.split("");
            }
        } else {
            if (this.flashNum <= distanceConfig.FLASH_NUM) {
                this.flashTime += deltaTime;
                if (this.flashTime < distanceConfig.FLASH_DURATION) {
                    paint = false;
                } else if (this.flashTime > distanceConfig.FLASH_DURATION * 2) {
                    this.flashTime = 0;
                    this.flashNum++;
                }
            } else {
                this.isFlash = false;
                this.flashNum = 0;
                this.flashTime = 0;
            }
        }

        if (paint) {
            for (let i = 0; i < this.digits.length; i++) {
                this.draw(i, parseInt(this.digits[i]));
            }
        }

        this.drawHighScore();
    };

    drawHighScore() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;

        for (let i = 0; i < this.highScore.length; i++) {
            this.draw(i, parseInt(this.highScore[i]), true);
        }

        this.ctx.restore();
    };

    setHighScore(distance) {
        distance = this.getDistance(distance);
        let hightScoreString = (this.defaultString + distance).substr(-this.maxScoreUnit);
        this.highScore = ["10", "11", ""].concat(hightScoreString.split(""));
    };

    reset() {
        this.isFlash = false;
        this.update(0);
    }
}