class WalkingMan {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            return;
        }
        
        // Default options
        this.options = {
            direction: 'right',
            fps: 8,
            spriteHeight: 64, // Height of a single frame
            scale: 2,
            ...options
        };
        
        this.currentFrame = 0;
        this.totalFrames = 8; // 8 frames in the walking animation
        this.animationId = null;
        this.isPlaying = false;
        
        this.init();
    }
    
    init() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Load sprite sheet
        this.spriteSheet = new Image();
        this.spriteSheet.src = '8 Direction Walk Sheets (10 Colors)/Blue/blue_walk_EAST-Sheet.png';
        this.spriteSheet.onload = () => {
            // Calculate the frame width based on the actual sprite sheet
            // The sprite sheet should have 8 frames horizontally
            this.frameWidth = this.spriteSheet.width / this.totalFrames;
            this.frameHeight = this.spriteSheet.height;
            
            // Set canvas dimensions based on the actual sprite dimensions and scale
            this.canvas.width = this.frameWidth * this.options.scale;
            this.canvas.height = this.frameHeight * this.options.scale;
            this.canvas.style.display = 'block';
            this.canvas.style.margin = '0 auto';
            
            this.drawFrame();
        };
        
        // Create controls if needed
        if (this.options.showControls) {
            this.createControls();
        }
    }
    
    createControls() {
        const controls = document.createElement('div');
        controls.className = 'sprite-controls';
        controls.style.display = 'flex';
        controls.style.justifyContent = 'center';
        controls.style.gap = '10px';
        controls.style.marginTop = '10px';
        
        // Play/Pause button
        const playPauseBtn = document.createElement('button');
        playPauseBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
        playPauseBtn.onclick = () => {
            if (this.isPlaying) {
                this.pause();
                playPauseBtn.textContent = 'Play';
            } else {
                this.play();
                playPauseBtn.textContent = 'Pause';
            }
        };
        
        // Speed control
        const speedLabel = document.createElement('label');
        speedLabel.textContent = 'Speed: ';
        
        const speedInput = document.createElement('input');
        speedInput.type = 'range';
        speedInput.min = '1';
        speedInput.max = '16';
        speedInput.value = this.options.fps;
        speedInput.oninput = () => {
            this.setFPS(parseInt(speedInput.value));
        };
        
        speedLabel.appendChild(speedInput);
        
        controls.appendChild(playPauseBtn);
        controls.appendChild(speedLabel);
        
        this.container.appendChild(controls);
    }
    
    drawFrame() {
        if (!this.spriteSheet.complete) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate the position of the current frame in the sprite sheet
        const frameX = this.currentFrame * this.frameWidth;
        const frameY = 0;
        
        this.ctx.drawImage(
            this.spriteSheet,
            frameX, frameY,
            this.frameWidth, this.frameHeight,
            0, 0,
            this.canvas.width, this.canvas.height
        );
    }
    
    update() {
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        this.drawFrame();
    }
    
    play() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        const frameInterval = 1000 / this.options.fps;
        
        const animate = () => {
            this.update();
            this.animationId = setTimeout(() => {
                requestAnimationFrame(animate);
            }, frameInterval);
        };
        
        animate();
    }
    
    pause() {
        this.isPlaying = false;
        clearTimeout(this.animationId);
    }
    
    setFPS(fps) {
        this.options.fps = fps;
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }
}

// Export the class
export default WalkingMan; 