import { CollisionBox } from './collision-box.js';

const dinosaurConfig = {
    BLINK_TIME: 1000,
    WIDTH: 44,
    DUCK_WIDTH: 59,
    HEIGHT: 47,
    MAX_JUMP_HEIGHT: 30,
    MIN_JUMP_HEIGHT: 30,
    BOTTOM_DISTANCE: 10,
    JUMP_SPEED: -10,
    DROP_SPEED: -5,
    DROP_DOWN_SPEED: 3,
    GRAVITY: 0.6,
};

const dinosaurCollisionBoxs = {
    DUCK: [
        new CollisionBox(1, 18, 110, 25),
    ],
    RUN: [
        new CollisionBox(10, 0, 40, 16),
        new CollisionBox(1, 18, 65, 9),
        new CollisionBox(9, 35, 14, 8),
        new CollisionBox(1, 24, 55, 5),
        new CollisionBox(2, 30, 40, 4),
        new CollisionBox(4, 34, 30, 4),
    ],
};

const dinosaurStatus = {
    WAIT: {
        frames: [44, 0],
        frames_rate: 1000 / 3,
    },
    RUN: {
        frames: [88, 132],
        frames_rate: 1000 / 12,
    },
    HIT: {
        frames: [220],
        frames_rate: 1000 / 60,
    },
    JUMP: {
        frames: [0],
        frames_rate: 1000 / 60,
    },
    DUCK: {
        frames: [262, 321],
        frames_rate: 1000 / 8,
    },
};

const FPS = 60;

export class Dinosaur {
    canvas
    ctx
    spritePos
    containerHeight
    xPos
    yPos
    groundYPos
    currentAniFrames
    animationFrames
    blinkDelay
    aniStartTime
    time
    currentFramesRate
    config
    jumpSpeed
    status
    isJump
    isDuck
    minJumpHeight
    reachMinJumpHeight
    isDrop
    jumpCount
    speedDown
    collisionBoxes

    constructor(canvas, spritePos, containerHeight) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.spritePos = spritePos;
        this.containerHeight = containerHeight;
        this.xPos = 10;
        this.yPos = 0;

        this.groundYPos = 0;
        this.currentAniFrames = 0;
        this.animationFrames = [];
        this.blinkDelay = 0;
        this.aniStartTime = 0;
        this.time = 0;
        this.currentFramesRate = 1000 / FPS;
        this.config = dinosaurConfig;
        this.collisionBoxes = dinosaurCollisionBoxs;
        this.jumpSpeed = 0;

        this.status = "WAIT";
        this.isJump = false;
        this.isDuck = false;
        this.reachMinJumpHeight = false;
        this.isDrop = false;
        this.jumpCount = 0;
        this.speedDown = false;

        this.init();
    };

    init() {
        this.groundYPos = this.containerHeight - dinosaurConfig.HEIGHT - dinosaurConfig.BOTTOM_DISTANCE;
        this.yPos = this.groundYPos;
        this.minJumpHeight = this.groundYPos - dinosaurConfig.MIN_JUMP_HEIGHT;

        this.draw(0, 0);
        this.update(0, "WAIT");
    };

    draw(x, y) {
        let sourceX = x + this.spritePos.x;
        let sourceY = y + this.spritePos.y;

        let sourceWidth = this.isDuck && this.status !== "HIT" ?
            dinosaurConfig.DUCK_WIDTH : dinosaurConfig.WIDTH;
        let sourceHeight = dinosaurConfig.HEIGHT;

        this.ctx.drawImage(document.getElementById("image"),
            sourceX, sourceY,
            sourceWidth, sourceHeight,
            this.xPos, this.yPos,
            sourceWidth / 2, sourceHeight,
        );
    };

    update(deltaTime, curStatus) {
        this.time += deltaTime;

        if (curStatus) {
            this.status = curStatus;
            this.currentAniFrames = 0;
            this.currentFramesRate = dinosaurStatus[curStatus].frames_rate;
            this.animationFrames = dinosaurStatus[curStatus].frames;

            if (this.status === "WAIT") {
                this.aniStartTime = this.getTimeStamp();
                this.setBlinkDelay();
            }
        }

        if (this.time >= this.currentFramesRate) {
            this.currentAniFrames = this.currentAniFrames === 1 ? 0 : 1;
            this.time = 0;
        }

        if (this.status === "WAIT") {
            this.blink(this.getTimeStamp());
        } else {
            this.draw(this.animationFrames[this.currentAniFrames] ?? this.animationFrames[0], 0);
        }
    };

    getTimeStamp() {
        return new Date().getTime();
    };

    setBlinkDelay() {
        this.blinkDelay = Math.ceil(Math.random() * dinosaurConfig.BLINK_TIME);
    };

    blink(time) {
        let deltaTime = time - this.aniStartTime;
        if (deltaTime >= this.blinkDelay) {
            this.draw(this.animationFrames[this.currentAniFrames], 0);

            if (this.currentAniFrames === 1) {
                this.setBlinkDelay();
                this.aniStartTime = time;
            }
        }
    };

    startJump() {
        if (!this.isJump) {
            this.isJump = true;
            this.update(0, "JUMP");
            this.jumpSpeed = dinosaurConfig.JUMP_SPEED;
            this.reachMinJumpHeight = false;
        }
    };

    updateJump(deltaTime) {
        let curFamesRate = dinosaurStatus[this.status].frames_rate;
        let curFames = deltaTime / curFamesRate;
        this.jumpSpeed += dinosaurConfig.GRAVITY * curFames;

        if (this.speedDown) {
            this.yPos += Math.round(this.jumpSpeed * curFames * dinosaurConfig.DROP_DOWN_SPEED);
        } else {
            this.yPos += Math.round(this.jumpSpeed * curFames);
        }

        if (this.yPos <= this.minJumpHeight || this.speedDown) {
            this.reachMinJumpHeight = true;
        }

        if (this.yPos <= dinosaurConfig.MAX_JUMP_HEIGHT || this.speedDown) {
            this.endJump();
        }

        if (this.yPos >= this.groundYPos) {
            this.reset();
            this.jumpCount++;
        }

        this.update(deltaTime);
    };

    endJump() {
        if (this.reachMinJumpHeight && this.jumpSpeed < dinosaurConfig.DROP_SPEED) {
            this.jumpSpeed = dinosaurConfig.DROP_SPEED;
        }
    };

    reset() {
        this.isJump = false;
        this.isDuck = false;
        this.yPos = this.groundYPos;
        this.jumpSpeed = 0;
        this.update(0, "RUN");
        this.jumpCount = 0;
        this.speedDown = false;
    };

    setSpeedDown() {
        this.speedDown = true;
        this.jumpSpeed = 1;
    };

    setDuck(isDuck) {
        if (isDuck && this.status !== "DUCK") {
            this.update(0, "DUCK");
            this.isDuck = true;
        } else if (this.status === "DUCK") {
            this.update(0, "RUN");
            this.isDuck = false
        }
    };
}