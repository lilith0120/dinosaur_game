const nightConfig = {
    FADE_SPEED: 0.035,
    HEIGHT: 40,
    WIDTH: 20,
    MOON_SPEED: 0.25,
    STAR_NUM: 3,
    STAR_WEIGHT: 10,
    STAR_SPEED: 0.3,
    STAR_MAX_Y: 70,
};

const starDefinition = {
    x: 645,
    y: 2,
};

const MoonPhase = [140, 120, 100, 60, 40, 20, 0];
const INVERT_DURATION = 7000;

export class Night {
    canvas
    spritePos
    containerWidth
    xPos
    yPos
    curPhase
    opacity
    stars
    drawStars
    invertTime
    inverted
    invertTrigger

    constructor(canvas, spritePos, containerWidth) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.spritePos = spritePos;
        this.containerWidth = containerWidth - 450;
        this.xPos = containerWidth - 550;
        this.yPos = 0;
        this.curPhase = 0;
        this.opacity = 0;
        this.stars = [];
        this.drawStars = false;
        this.invertTime = 0;
        this.inverted = false;
        this.invertTrigger = false;

        this.placeStars();
    }

    placeStars() {
        let size = Math.round(this.containerWidth / nightConfig.STAR_NUM);
        for (let i = 0; i < nightConfig.STAR_NUM; i++) {
            this.stars[i] = {};
            this.stars[i].x = this.getRandomNum(size * i, size * (i + 1));
            this.stars[i].y = this.getRandomNum(0, nightConfig.STAR_MAX_Y);
            this.stars[i].sourceY = nightConfig.STAR_WEIGHT * i;
        }
    }

    getRandomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    invert(deltaTime, gameScore) {
        this.update(this.inverted);

        if (this.invertTime > INVERT_DURATION) {
            this.invertTime = 0;
            this.invertTrigger = false;
            this.inverted = document.body.classList.toggle('inverted', this.invertTrigger);
        } else if (this.invertTime) {
            this.invertTime += deltaTime;
        } else {
            this.invertTrigger = !(gameScore % 1000);
            if (this.invertTrigger && this.invertTime === 0) {
                this.invertTime += deltaTime;
                this.inverted = document.body.classList.toggle('inverted', this.invertTrigger);
            }
        }
    }

    update(actived) {
        if (actived && this.opacity === 0) {
            this.curPhase++;
            if (this.curPhase >= MoonPhase.length) {
                this.curPhase = 0;
            }
        }

        if (actived && this.opacity < 1) {
            this.opacity += nightConfig.FADE_SPEED;
        } else if (this.opacity > 0) {
            this.opacity -= nightConfig.FADE_SPEED;
        }

        if (this.opacity > 0) {
            this.xPos = this.updateXpos(this.xPos, nightConfig.MOON_SPEED);

            if (this.drawStars) {
                for (let i = 0; i < nightConfig.STAR_NUM; i++) {
                    this.stars[i].x = this.updateXpos(this.stars[i].x, nightConfig.STAR_SPEED);
                }
            }

            this.draw();
        } else {
            this.opacity = 0;
            this.placeStars();
        }

        this.drawStars = true;
    };

    updateXpos(pos, speed) {
        if (pos < -nightConfig.WIDTH * 2) {
            pos = this.containerWidth;
        } else {
            pos -= speed;
        }

        return pos;
    }

    draw() {
        let moonSourceWidth = this.curPhase === 3 ? nightConfig.WIDTH * 2 : nightConfig.WIDTH;
        let moonSourceX = this.spritePos.x + MoonPhase[this.curPhase];
        let starSourceX = starDefinition.x;

        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;

        if (this.drawStars) {
            for (let i = 0; i < nightConfig.STAR_NUM; i++) {
                this.ctx.drawImage(document.getElementById("image"),
                    starSourceX, this.stars[i].sourceY,
                    nightConfig.STAR_WEIGHT, nightConfig.STAR_WEIGHT,
                    Math.round(this.stars[i].x), this.stars[i].y,
                    nightConfig.STAR_WEIGHT / 2, nightConfig.STAR_WEIGHT,
                );
            }
        }

        this.ctx.drawImage(document.getElementById("image"),
            moonSourceX, this.spritePos.y,
            moonSourceWidth, nightConfig.HEIGHT,
            Math.round(this.xPos), this.yPos,
            moonSourceWidth / 2, nightConfig.HEIGHT,
        );

        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }
}