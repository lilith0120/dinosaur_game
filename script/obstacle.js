import { CollisionBox } from './collision-box.js';

const obstacleType = [
    {
        type: 'SMALL_CACTUS',
        width: 17,
        height: 35,
        yPos: 105,
        repeat_speed: 2,
        speed: 0,
        gap: 120,
        collisionBoxes: [
            new CollisionBox(0, 7, 10, 27),
            new CollisionBox(3, 0, 15, 34),
            new CollisionBox(5, 4, 7, 14),
        ],
    },
    {
        type: 'LARGE_CACTUS',
        width: 25,
        height: 50,
        yPos: 90,
        repeat_speed: 5,
        speed: 0,
        gap: 120,
        collisionBoxes: [
            new CollisionBox(0, 12, 15, 38),
            new CollisionBox(4, 0, 15, 49),
            new CollisionBox(8, 10, 20, 38),
        ],
    },
    {
        type: 'PTEROSAUR',
        width: 46,
        height: 40,
        yPos: [100, 75, 50],
        repeat_speed: 999,
        speed: 3.5,
        gap: 150,
        frames_num: 2,
        frames_rate: 1000 / 6,
        speed_offset: 0.8,
        collisionBoxes: [
            new CollisionBox(7, 15, 60, 5),
            new CollisionBox(9, 21, 100, 6),
            new CollisionBox(1, 14, 20, 3),
            new CollisionBox(3, 10, 20, 7),
            new CollisionBox(5, 8, 30, 9),
        ],
    },
];

const spriteDefinition = {
    SMALL_CACTUS: {
        x: 228,
        y: 2,
    },
    LARGE_CACTUS: {
        x: 332,
        y: 2,
    },
    PTEROSAUR: {
        x: 134,
        y: 2,
    },
};

const FPS = 60;
const MAX_OBSTACLE_LENGTH = 3;
const MAX_OBSTACLE_REPEAT = 2;
const MAX_OBSTACLE_DISTANCE = 1.5;

let obstaclesLine = [];
let obstaclesType = [];

export class Obstacle {
    canvas
    spritePos
    containerWidth
    type
    gapDistance
    gap
    remove
    xPos
    yPos
    width
    speedOffset
    collisionBoxes
    obstaclesLine

    constructor(canvas, spritePos, containerWidth, gapDistance, speed, offsetX, type) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.spritePos = spritePos;
        this.containerWidth = containerWidth;
        this.type = type ?? obstacleType[0];
        this.gapDistance = gapDistance;
        this.offsetX = offsetX;
        this.size = this.getRandomNum(1, MAX_OBSTACLE_LENGTH);
        this.remove = false;
        this.xPos = containerWidth + offsetX - 500;
        this.yPos = 0;
        this.width = 0;
        this.gap = 0;
        this.speedOffset = 0;
        this.collisionBoxes = [];
        this.obstaclesLine = obstaclesLine;

        this.currentFrames = 0;
        this.time = 0;

        this.init(speed);
    };

    getRandomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    init(speed) {
        if (this.size > 1 && this.type.repeat_speed > speed) {
            this.size = 1;
        }

        this.width = this.size * this.type.width;

        if (Array.isArray(this.type.yPos)) {
            let yPosConfig = this.type.yPos;
            this.yPos = yPosConfig[this.getRandomNum(0, yPosConfig.length - 1)];
        } else {
            this.yPos = this.type.yPos;
        }

        this.draw();
        this.cloneCollisionBoxs();

        if (this.size > 1) {
            this.collisionBoxes[1].width = this.width - this.collisionBoxes[0].width - this.collisionBoxes[2].width;
            this.collisionBoxes[2].xPos = (this.width - this.collisionBoxes[2].width) / 2;
        }

        if (this.type.speed_offset) {
            this.speedOffset = Math.random() > 0.5 ? this.type.speed_offset : -this.type.speed_offset;
        }

        this.gap = this.getRandomGap(this.gapDistance, speed);
    };

    draw() {
        let sourceWidth = this.type.width * this.size;
        let sourceHeight = this.type.height;
        let sourceX = this.spritePos.x;

        if (this.currentFrames > 0) {
            sourceX += sourceWidth * this.currentFrames;
        }

        this.ctx.drawImage(document.getElementById("image"),
            sourceX, this.spritePos.y,
            sourceWidth, sourceHeight,
            this.xPos, this.yPos,
            sourceWidth / 2, sourceHeight,
        );
    };

    getRandomGap(gapDistance, speed) {
        let minGap = Math.round(this.width * speed + this.type.gap * gapDistance);
        let maxGap = Math.round(minGap * MAX_OBSTACLE_DISTANCE);
        return this.getRandomNum(minGap, maxGap);
    };

    updateObstacle(deltaTime, speed) {
        for (let i = 0; i < obstaclesLine.length; i++) {
            let obstacle = obstaclesLine[i];
            obstacle.update(deltaTime, speed);
            if (obstacle.remove) {
                obstaclesLine.splice(i, 1);
            }
        }

        let obstacleLength = obstaclesLine.length;
        if (obstacleLength) {
            let lastObstacle = obstaclesLine[obstacleLength - 1];
            if ((lastObstacle.xPos + lastObstacle.width + lastObstacle.gap) < this.containerWidth - 500) {
                this.addObstacle(speed);
            }
        } else {
            this.addObstacle(speed);
        }

    };

    update(deltaTime, speed) {
        if (!this.remove) {
            speed += this.speedOffset;

            this.xPos -= Math.floor(speed * (FPS / 1000) * Math.round(deltaTime));
            if (this.type.frames_num) {
                this.time += deltaTime;
                if (this.time >= this.type.frames_rate) {
                    this.currentFrames = this.currentFrames === 1 ? 0 : 1;
                    this.time = 0;
                }
            }

            this.draw();

            if (!this.isVisible()) {
                this.remove = true;
            }
        }
    };

    addObstacle(speed) {
        let curType;
        do {
            curType = obstacleType[this.getRandomNum(0, obstacleType.length - 1)];
        } while (this.checkObstacleRepeat(curType) || speed < curType.speed);

        let obstacleSpritePos = spriteDefinition[curType.type];
        let newObstacle = new Obstacle(this.canvas, obstacleSpritePos, this.containerWidth, this.gapDistance, speed, curType.width, curType);
        obstaclesLine.push(newObstacle);
        obstaclesType.push(curType.type);

        if (obstaclesType.length > MAX_OBSTACLE_REPEAT) {
            obstaclesType.splice(0, MAX_OBSTACLE_REPEAT);
        }
    };

    checkObstacleRepeat(curType) {
        let repeat = 0;
        for (let i = 0; i < obstaclesType.length; i++) {
            repeat = obstaclesType[i] === curType ? repeat + 1 : 0;
        }

        return repeat >= MAX_OBSTACLE_REPEAT;
    }

    isVisible() {
        return this.xPos + this.width > 0;
    }

    cloneCollisionBoxs() {
        let boxs = this.type.collisionBoxes;
        for (let i = 0; i < boxs.length; i++) {
            let box = new CollisionBox(boxs[i].xPos, boxs[i].yPos, boxs[i].width, boxs[i].height);
            this.collisionBoxes.push(box);
        }
    }
}