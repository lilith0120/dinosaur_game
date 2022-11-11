
export class CollisionBox {
    xPos
    yPos
    width
    height

    constructor(xPos, yPos, width, height) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.width = width / 2;
        this.height = height;
    };
};

export function checkCollision(dinosaur, obstacle, ctx) {
    let dinosaurBox = new CollisionBox(dinosaur.xPos + 1, dinosaur.yPos + 1, dinosaur.config.WIDTH - 2, dinosaur.config.HEIGHT - 2);
    let obstacleBox = new CollisionBox(obstacle.xPos + 1, obstacle.yPos + 1, obstacle.type.width * obstacle.size - 2, obstacle.type.height - 2);

    if (ctx) {
        drawCollisionBoxes(ctx, dinosaurBox, obstacleBox);
    }

    if (checkHit(dinosaurBox, obstacleBox)) {
        let dinosaurBoxes = dinosaur.isDuck ? dinosaur.collisionBoxes.DUCK : dinosaur.collisionBoxes.RUN;
        let obstacleBoxes = obstacle.collisionBoxes;

        for (let i = 0; i < dinosaurBoxes.length; i++) {
            for (let j = 0; j < obstacleBoxes.length; j++) {
                let adjDinosaurBox = adjustCollisionBox(dinosaurBoxes[i], dinosaurBox);
                let adjObstacleBox = adjustCollisionBox(obstacleBoxes[j], obstacleBox);

                if (ctx) {
                    drawCollisionBoxes(ctx, adjDinosaurBox, adjObstacleBox);
                }

                if (checkHit(adjDinosaurBox, adjObstacleBox)) {
                    return [adjDinosaurBox, adjObstacleBox];
                }
            }
        }
    }

    return false;
};

function checkHit(dinosaurBox, obstacleBox) {
    let dinosaurXPos = dinosaurBox.xPos;
    let dinosaurYPos = dinosaurBox.yPos;
    let obstacleXPos = obstacleBox.xPos;
    let obstacleYPos = obstacleBox.yPos;

    return dinosaurXPos < obstacleXPos + obstacleBox.width &&
        dinosaurXPos + dinosaurBox.width > obstacleXPos &&
        dinosaurYPos < obstacleYPos + obstacleBox.height &&
        dinosaurYPos + dinosaurBox.height > obstacleYPos;
};

function adjustCollisionBox(box, adjustment) {
    return new CollisionBox(box.xPos + adjustment.xPos, box.yPos + adjustment.yPos, box.width, box.height);
};

function drawCollisionBoxes(ctx, dinosaurBox, obstacleBox) {
    ctx.save();
    ctx.strokeStyle = "#f00";
    ctx.strokeRect(dinosaurBox.xPos, dinosaurBox.yPos, dinosaurBox.width, dinosaurBox.height);
    ctx.strokeStyle = "#0f0";
    ctx.strokeRect(obstacleBox.xPos, obstacleBox.yPos, obstacleBox.width, obstacleBox.height);
    ctx.restore();
};