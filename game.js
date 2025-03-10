let car;
let track;
let camera;

function setup() {
    createCanvas(800, 600);
    
    // Initialize car
    car = {
        x: 400,
        y: 300,
        speed: 0,
        angle: 0,
        acceleration: 0.5,
        maxSpeed: 5,
        turnSpeed: 0.05
    };
    
    // Initialize camera
    camera = {
        x: 0,
        y: 0
    };
    
    // Initialize track
    track = {
        points: [
            {x: 100, y: 100},
            {x: 700, y: 100},
            {x: 700, y: 500},
            {x: 100, y: 500}
        ]
    };
}

function draw() {
    background(26, 26, 26);
    
    // Update camera position to follow car
    camera.x = car.x - width/2;
    camera.y = car.y - height/2;
    
    // Draw track
    push();
    translate(-camera.x, -camera.y);
    stroke(255);
    strokeWeight(20);
    noFill();
    beginShape();
    for (let point of track.points) {
        vertex(point.x, point.y);
    }
    endShape(CLOSE);
    pop();
    
    // Draw car
    push();
    translate(car.x, car.y);
    rotate(car.angle);
    
    // Car body
    fill(255, 0, 0);
    rect(-20, -10, 40, 20);
    
    // Wheels
    fill(0);
    rect(-25, -15, 10, 10);
    rect(15, -15, 10, 10);
    rect(-25, 5, 10, 10);
    rect(15, 5, 10, 10);
    
    pop();
    
    // Update car position
    car.x += cos(car.angle) * car.speed;
    car.y += sin(car.angle) * car.speed;
    
    // Apply friction
    car.speed *= 0.98;
}

function keyPressed() {
    if (keyCode === UP_ARROW) {
        car.speed = min(car.speed + car.acceleration, car.maxSpeed);
    }
    if (keyCode === DOWN_ARROW) {
        car.speed = max(car.speed - car.acceleration, -car.maxSpeed/2);
    }
    if (keyCode === LEFT_ARROW) {
        car.angle -= car.turnSpeed;
    }
    if (keyCode === RIGHT_ARROW) {
        car.angle += car.turnSpeed;
    }
} 