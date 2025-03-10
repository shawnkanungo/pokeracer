let car;
let track;
let camera;
let lapCount = 0;
let checkpoints = [];
let lastCheckpoint = -1;

function setup() {
    createCanvas(800, 600);
    
    // Initialize car with Mario Kart-like properties
    car = {
        x: 400,
        y: 300,
        speed: 0,
        angle: 0,
        acceleration: 0.3,
        maxSpeed: 6,
        turnSpeed: 0.04,
        drift: false,
        driftAngle: 0,
        boost: 0,
        color: '#FF0000'
    };
    
    // Initialize camera
    camera = {
        x: 0,
        y: 0
    };
    
    // Create a more interesting track with Mario Kart-like elements
    track = {
        points: [
            // Main track
            {x: 100, y: 100},
            {x: 700, y: 100},
            {x: 700, y: 300},
            {x: 600, y: 400},
            {x: 400, y: 500},
            {x: 200, y: 400},
            {x: 100, y: 300},
            {x: 100, y: 100}
        ],
        width: 40
    };

    // Create checkpoints for lap counting
    for (let i = 0; i < track.points.length; i++) {
        checkpoints.push({
            x: track.points[i].x,
            y: track.points[i].y,
            radius: 20,
            passed: false
        });
    }
}

function draw() {
    background('#87CEEB'); // Sky blue background
    
    // Update camera position to follow car
    camera.x = car.x - width/2;
    camera.y = car.y - height/2;
    
    push();
    translate(-camera.x, -camera.y);
    
    // Draw grass background
    fill('#90EE90');
    rect(0, 0, 2000, 2000);
    
    // Draw track
    stroke(100);
    strokeWeight(track.width);
    noFill();
    beginShape();
    for (let point of track.points) {
        vertex(point.x, point.y);
    }
    endShape(CLOSE);
    
    // Draw track edges
    stroke(255);
    strokeWeight(2);
    beginShape();
    for (let point of track.points) {
        vertex(point.x, point.y);
    }
    endShape(CLOSE);
    
    // Draw checkpoints
    for (let i = 0; i < checkpoints.length; i++) {
        if (!checkpoints[i].passed) {
            fill(255, 255, 0);
            circle(checkpoints[i].x, checkpoints[i].y, checkpoints[i].radius * 2);
        }
    }
    
    pop();
    
    // Draw car with Mario Kart-like style
    push();
    translate(car.x, car.y);
    rotate(car.angle + (car.drift ? car.driftAngle : 0));
    
    // Car shadow
    fill(0, 0, 0, 50);
    ellipse(0, 15, 40, 10);
    
    // Car body
    fill(car.color);
    rect(-20, -15, 40, 30);
    
    // Car details
    fill(255);
    rect(-15, -10, 30, 20);
    
    // Wheels
    fill(0);
    rect(-25, -20, 10, 10);
    rect(15, -20, 10, 10);
    rect(-25, 10, 10, 10);
    rect(15, 10, 10, 10);
    
    // Boost effect
    if (car.boost > 0) {
        fill(255, 165, 0, car.boost * 100);
        rect(-30, -5, 10, 10);
    }
    
    pop();
    
    // Draw HUD
    drawHUD();
    
    // Update car position
    car.x += cos(car.angle) * car.speed;
    car.y += sin(car.angle) * car.speed;
    
    // Apply friction
    car.speed *= 0.98;
    
    // Update boost
    if (car.boost > 0) {
        car.boost -= 0.1;
    }
    
    // Check checkpoint collisions
    checkCheckpoints();
}

function drawHUD() {
    // Lap counter
    fill(255);
    textSize(24);
    textAlign(LEFT, TOP);
    text(`Lap: ${lapCount + 1}/3`, 20, 20);
    
    // Speed indicator
    text(`Speed: ${Math.round(car.speed * 10)}`, 20, 50);
    
    // Boost indicator
    if (car.boost > 0) {
        fill(255, 165, 0);
        rect(20, 80, car.boost * 100, 10);
    }
}

function checkCheckpoints() {
    for (let i = 0; i < checkpoints.length; i++) {
        let d = dist(car.x, car.y, checkpoints[i].x, checkpoints[i].y);
        if (d < checkpoints[i].radius && !checkpoints[i].passed) {
            checkpoints[i].passed = true;
            
            // If this is the first checkpoint and we've passed all others, complete a lap
            if (i === 0 && lastCheckpoint === checkpoints.length - 1) {
                lapCount++;
                if (lapCount >= 3) {
                    // Game over
                    alert('Race Complete!');
                    resetGame();
                }
            }
            
            lastCheckpoint = i;
            break;
        }
    }
}

function resetGame() {
    lapCount = 0;
    car.x = 400;
    car.y = 300;
    car.speed = 0;
    car.angle = 0;
    car.boost = 0;
    lastCheckpoint = -1;
    
    for (let checkpoint of checkpoints) {
        checkpoint.passed = false;
    }
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        car.speed = min(car.speed + car.acceleration, car.maxSpeed);
    }
    if (keyCode === DOWN_ARROW) {
        car.speed = max(car.speed - car.acceleration, -car.maxSpeed/2);
    }
    if (keyCode === LEFT_ARROW) {
        if (keyIsDown(SHIFT)) {
            // Drift left
            car.drift = true;
            car.driftAngle = -0.2;
            car.speed *= 1.2;
        } else {
            car.angle -= car.turnSpeed;
        }
    }
    if (keyCode === RIGHT_ARROW) {
        if (keyIsDown(SHIFT)) {
            // Drift right
            car.drift = true;
            car.driftAngle = 0.2;
            car.speed *= 1.2;
        } else {
            car.angle += car.turnSpeed;
        }
    }
    if (keyCode === 32) { // Spacebar for boost
        car.boost = 1;
        car.speed = min(car.speed * 1.5, car.maxSpeed * 1.5);
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        car.drift = false;
        car.driftAngle = 0;
    }
} 