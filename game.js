let scene, camera, renderer, car, track;
let lapCount = 0;
let checkpoints = [];
let lastCheckpoint = -1;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Sky blue

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x90EE90,
        side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Create track
    createTrack();

    // Create car
    createCar();

    // Add event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Hide loading screen
    document.getElementById('loading').style.display = 'none';
}

// Create the racing track
function createTrack() {
    const trackGeometry = new THREE.BufferGeometry();
    const trackPoints = [
        new THREE.Vector3(-20, 0.1, -20),
        new THREE.Vector3(20, 0.1, -20),
        new THREE.Vector3(20, 0.1, 20),
        new THREE.Vector3(-20, 0.1, 20),
        new THREE.Vector3(-20, 0.1, -20)
    ];
    
    trackGeometry.setFromPoints(trackPoints);
    const trackMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    track = new THREE.Line(trackGeometry, trackMaterial);
    scene.add(track);

    // Create checkpoints
    trackPoints.forEach((point, index) => {
        if (index < trackPoints.length - 1) {
            checkpoints.push({
                position: point,
                radius: 2,
                passed: false
            });
        }
    });
}

// Create the car
function createCar() {
    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.4, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const wheels = [];
    const wheelPositions = [
        [-1.2, 0.2, -1.2], [1.2, 0.2, -1.2],
        [-1.2, 0.2, 1.2], [1.2, 0.2, 1.2]
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.position.set(...pos);
        wheel.rotation.z = Math.PI / 2;
        wheel.castShadow = true;
        wheel.receiveShadow = true;
        wheels.push(wheel);
        body.add(wheel);
    });

    car = {
        mesh: body,
        speed: 0,
        angle: 0,
        acceleration: 0.1,
        maxSpeed: 0.5,
        turnSpeed: 0.02,
        drift: false,
        boost: 0
    };

    scene.add(car.mesh);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle key presses
function onKeyDown(event) {
    switch(event.keyCode) {
        case 38: // Up arrow
            car.speed = Math.min(car.speed + car.acceleration, car.maxSpeed);
            break;
        case 40: // Down arrow
            car.speed = Math.max(car.speed - car.acceleration, -car.maxSpeed/2);
            break;
        case 37: // Left arrow
            if (event.shiftKey) {
                car.drift = true;
                car.mesh.rotation.y += car.turnSpeed * 2;
            } else {
                car.mesh.rotation.y += car.turnSpeed;
            }
            break;
        case 39: // Right arrow
            if (event.shiftKey) {
                car.drift = true;
                car.mesh.rotation.y -= car.turnSpeed * 2;
            } else {
                car.mesh.rotation.y -= car.turnSpeed;
            }
            break;
        case 32: // Spacebar
            car.boost = 1;
            car.speed = Math.min(car.speed * 1.5, car.maxSpeed * 1.5);
            break;
    }
}

// Handle key releases
function onKeyUp(event) {
    switch(event.keyCode) {
        case 37: // Left arrow
        case 39: // Right arrow
            car.drift = false;
            break;
    }
}

// Update game state
function update() {
    // Update car position
    car.mesh.position.x += Math.sin(car.mesh.rotation.y) * car.speed;
    car.mesh.position.z += Math.cos(car.mesh.rotation.y) * car.speed;

    // Apply friction
    car.speed *= 0.98;

    // Update boost
    if (car.boost > 0) {
        car.boost -= 0.01;
    }

    // Update camera position
    camera.position.x = car.mesh.position.x;
    camera.position.z = car.mesh.position.z + 10;
    camera.position.y = 5;
    camera.lookAt(car.mesh.position);

    // Check checkpoints
    checkCheckpoints();

    // Update HUD
    updateHUD();
}

// Check checkpoint collisions
function checkCheckpoints() {
    checkpoints.forEach((checkpoint, index) => {
        const distance = car.mesh.position.distanceTo(checkpoint.position);
        if (distance < checkpoint.radius && !checkpoint.passed) {
            checkpoint.passed = true;
            
            if (index === 0 && lastCheckpoint === checkpoints.length - 1) {
                lapCount++;
                if (lapCount >= 3) {
                    alert('Race Complete!');
                    resetGame();
                }
            }
            
            lastCheckpoint = index;
        }
    });
}

// Update HUD
function updateHUD() {
    document.getElementById('lap').textContent = lapCount + 1;
    document.getElementById('speed').textContent = Math.round(Math.abs(car.speed) * 100);
    document.getElementById('boost').textContent = Math.round(car.boost * 100);
}

// Reset game
function resetGame() {
    lapCount = 0;
    car.mesh.position.set(0, 0.5, 0);
    car.speed = 0;
    car.angle = 0;
    car.boost = 0;
    lastCheckpoint = -1;
    
    checkpoints.forEach(checkpoint => {
        checkpoint.passed = false;
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Start the game
init();
animate(); 