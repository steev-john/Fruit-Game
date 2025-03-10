document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Make the canvas responsive
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Prevent arrow key scrolling
    document.addEventListener('keydown', (e) => {
        const keysToPrevent = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (keysToPrevent.includes(e.key)) {
            e.preventDefault(); // Prevent default browser scrolling
        }
    });

    // Game variables
    let basketX = canvas.width / 2 - 150 / 2; // Center the basket with increased width
    let basketY = canvas.height - 70; // Position of the basket
    let fruitX = Math.random() * (canvas.width - 40); // Adjusted for larger apple
    let fruitY = 0;
    let fruitVelX = Math.random() * 2 - 1; // Random initial horizontal velocity
    let fruitVelY = 4; // Initial vertical velocity
    let score = 0;
    let gameOver = false;
    const basketSpeed = 12; // Increased speed for smoother movement
    let isSquished = false;
    let squishEndTime = 0; // Timestamp when squish animation should end
    let fruitPieces = []; // Array to hold fruit pieces

    // Create blades array (20 blades) with uniform speed
    const bladeCount = 20;
    const bladeSpacing = canvas.width / bladeCount; // Space between blades
    const blades = Array.from({ length: bladeCount }, (_, i) => ({
        x: i * bladeSpacing + bladeSpacing / 2, // Position each blade evenly
        y: canvas.height - 5, // Align to bottom of canvas
        angle: 0, // Initial angle
        speed: 0.05, // Uniform speed for all blades
        size: bladeSpacing / 2, // Blade size proportional to spacing
    }));

    // Draw wooden board (basket) with increased width
    function drawBasket() {
        ctx.fillStyle = '#964B00'; // Brown color for wood
        ctx.fillRect(basketX, basketY, 150, 20); // Increased width to 150
        ctx.strokeStyle = '#5C4033';
        ctx.lineWidth = 2;
        ctx.strokeRect(basketX, basketY, 150, 20);
    }

    // Draw fruit (larger apple)
    function drawFruit() {
        if (!isSquished) {
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(fruitX + 20, fruitY + 20, 20, 0, Math.PI * 2); // Larger apple radius (20)
            ctx.fill();
            ctx.fillStyle = 'green';
            ctx.fillRect(fruitX + 18, fruitY, 4, 8); // Adjusted stem dimensions for larger apple
        }
    }

    // Draw spinning blades
    function drawBlades() {
        blades.forEach((blade) => {
            ctx.save();
            ctx.translate(blade.x, blade.y); // Position blade at its center
            ctx.rotate(blade.angle); // Rotate blade by its angle
            ctx.beginPath();
            for (let i = 0; i < 3; i++) { // Create a triangular blade with three arms
                const angleOffset = (Math.PI * 2) / 3 * i; // Divide circle into three parts
                const x1 = Math.cos(angleOffset) * blade.size;
                const y1 = Math.sin(angleOffset) * blade.size;
                const x2 = Math.cos(angleOffset + Math.PI / 6) * (blade.size / 1.5);
                const y2 = Math.sin(angleOffset + Math.PI / 6) * (blade.size / 1.5);

                ctx.moveTo(0, 0);
                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.closePath();
            }
            ctx.fillStyle = 'gray';
            ctx.fill();
            ctx.restore();

            blade.angle += blade.speed; // Increment angle for spinning effect
        });
    }

    // Update game state
    let moveLeft = false;
    let moveRight = false;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') moveLeft = true;
        else if (e.key === 'ArrowRight') moveRight = true;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft') moveLeft = false;
        else if (e.key === 'ArrowRight') moveRight = false;
    });

    function update() {
        if (!gameOver) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBasket();
            drawBlades();

            // Move basket smoothly
            if (moveLeft && basketX > 0) {
                basketX -= basketSpeed;
            }
            if (moveRight && basketX < canvas.width - 150) {
                basketX += basketSpeed;
            }

            // Move fruit
            if (!isSquished) {
                fruitX += fruitVelX;
                fruitY += fruitVelY;

                // Collision detection with basket
                if (
                    fruitY + 40 > basketY && // Adjusted for larger apple size
                    fruitX + 40 > basketX &&
                    fruitX < basketX + 150
                ) {
                    score++;
                    fruitVelY *= -1.1; 
                    fruitVelX = Math.random() * 4 - 2; 
                }

                // Collision detection with top and bottom of canvas
                if (fruitY < 0) {
                    fruitVelY *= -1; 
                } else if (fruitY + 40 > canvas.height) { 
                    isSquished=true ; 
                    squishEndTime=Date.now()+1000 ;  
                }

                // Collision detection with sides of canvas
                if (fruitX < 0 || fruitX + 40 > canvas.width) {
                    fruitVelX *= -1; 
                }

                // Collision detection with blades
                blades.forEach((blade) => {
                    if (
                        fruitY + 40 > blade.y - blade.size &&
                        fruitX + 40 > blade.x - blade.size &&
                        fruitX < blade.x + blade.size
                    ) {
                        isSquished = true;
                        squishEndTime = Date.now() + 1000; // Set end time for squish animation

                        // Create fruit pieces
                        for (let i = 0; i < 20; i++) {
                            fruitPieces.push({
                                x: fruitX + Math.random() * 40,
                                y: fruitY + Math.random() * 40,
                                velX: Math.random() * 2 - 1,
                                velY: Math.random() * 2 - 1,
                            });
                        }
                    }
                });

                drawFruit(); 
            } else { 
                if (Date.now() < squishEndTime) { 
                    drawFruitPieces(); 
                } else { 
                    gameOver=true; 
                }
            }

            ctx.font='24px Arial';
            ctx.fillStyle='black';
            ctx.fillText(`Score: ${score}`,10 ,30);

            requestAnimationFrame(update); 
        } else { 
            displayGameOver(); 
        }
    }

   function drawFruitPieces(){
       if(fruitPieces.length>0){
           for(const piece of fruitPieces){
               ctx.fillStyle='red'; 
               ctx.beginPath(); 
               ctx.arc(piece.x ,piece.y ,2 ,0 ,Math.PI*2); 
               ctx.fill(); 

               piece.x+=piece.velX; 
               piece.y+=piece.velY;

               if(Math.random()<0.1){ 
                   ctx.beginPath(); 
                   ctx.moveTo(piece.x ,piece.y); 
                   ctx.lineTo(
                       piece.x+Math.random()*10-5 ,
                       piece.y+Math.random()*10-5 
                   ); 
                   ctx.strokeStyle='red'; 
                   ctx.lineWidth=1; 
                   ctx.stroke(); 
               }
           }
       }
   }

   function displayGameOver(){
       ctx.clearRect(0 ,0 ,canvas.width ,canvas.height); 
       drawBasket(); 
       drawBlades(); 
       ctx.font='48px Arial'; 
       ctx.fillStyle='black'; 
       ctx.textAlign='center'; 
       ctx.textBaseline='middle'; 
       ctx.fillText('Game Over',canvas.width/2 ,canvas.height/2-50); 
       ctx.font='24px Arial'; 
       ctx.fillStyle='black'; 
       ctx.textAlign='center'; 
       ctx.textBaseline='middle'; 
       ctx.fillText(`Final Score: ${score}`,canvas.width/2 ,canvas.height/2); 

       drawRestartButton();  
   }

   function drawRestartButton(){
       const buttonWidth=100 ; 
       const buttonHeight=50 ; 
       const buttonX=canvas.width/2-buttonWidth/2 ; 
       const buttonY=canvas.height/2+100 ; 

       ctx.fillStyle='green'; 
       ctx.fillRect(buttonX ,buttonY ,buttonWidth ,buttonHeight); 

       ctx.font='24px Arial'; 
       ctx.fillStyle='white'; 
       ctx.textAlign='center'; 
       ctx.textBaseline='middle'; 
       ctx.fillText('Restart',canvas.width/2 ,buttonY+buttonHeight/2); 

       addRestartListeners(buttonX ,buttonY ,buttonWidth ,buttonHeight);  
   }

   function addRestartListeners(buttonX ,buttonY ,buttonWidth ,buttonHeight){
      document.addEventListener('keydown' ,(e)=>{
          if(e.key===' '){  
              location.reload();  
          }
      });

      canvas.addEventListener('click' ,(e)=>{
          const rect=canvas.getBoundingClientRect(); 
          const x=e.clientX-rect.left;  
          const y=e.clientY-rect.top;

          if(x>buttonX && x<buttonX+buttonWidth && y>buttonY && y<buttonY+buttonHeight){  
              location.reload();  
          }
      });
   }

   update();   
});
