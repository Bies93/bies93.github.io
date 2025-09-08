// Animations and special effects for the IT Horror Blog

// Creepy cursor trail effect
class CursorTrail {
    constructor() {
        this.trails = [];
        this.maxTrails = 15;
        this.init();
    }
    
    init() {
        // Create trail elements
        for (let i = 0; i < this.maxTrails; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.opacity = 0;
            document.body.appendChild(trail);
            this.trails.push({
                element: trail,
                x: 0,
                y: 0,
                size: Math.random() * 10 + 5,
                opacity: 0
            });
        }
        
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.updatePosition(e.clientX, e.clientY);
        });
        
        // Animate trails
        this.animate();
    }
    
    updatePosition(x, y) {
        // Update the first trail immediately
        if (this.trails.length > 0) {
            this.trails[0].x = x;
            this.trails[0].y = y;
            this.trails[0].opacity = 0.7;
        }
        
        // Update subsequent trails with delay
        for (let i = 1; i < this.trails.length; i++) {
            setTimeout(() => {
                this.trails[i].x = x;
                this.trails[i].y = y;
                this.trails[i].opacity = 0.7 - (i * 0.05);
            }, i * 20);
        }
    }
    
    animate() {
        this.trails.forEach((trail, index) => {
            trail.element.style.left = `${trail.x}px`;
            trail.element.style.top = `${trail.y}px`;
            trail.element.style.opacity = trail.opacity;
            trail.element.style.width = `${trail.size}px`;
            trail.element.style.height = `${trail.size}px`;
            
            // Gradually reduce opacity
            trail.opacity *= 0.95;
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Blood drip animation control
class BloodDrip {
    constructor() {
        this.dripElement = document.querySelector('.blood-drip');
        if (this.dripElement) {
            this.init();
        }
    }
    
    init() {
        // Randomize drip animation
        const randomDelay = Math.random() * 5;
        this.dripElement.style.animationDelay = `${randomDelay}s`;
        
        // Add occasional extra drips
        setInterval(() => {
            if (Math.random() > 0.7) {
                this.createExtraDrip();
            }
        }, 10000);
    }
    
    createExtraDrip() {
        const extraDrip = document.createElement('div');
        extraDrip.className = 'extra-drip';
        extraDrip.style.left = `${Math.random() * 100}%`;
        extraDrip.style.animationDuration = `${Math.random() * 3 + 2}s`;
        
        const heroSection = document.querySelector('#hero');
        if (heroSection) {
            heroSection.appendChild(extraDrip);
            
            // Remove after animation completes
            setTimeout(() => {
                if (extraDrip.parentNode) {
                    extraDrip.parentNode.removeChild(extraDrip);
                }
            }, 5000);
        }
    }
}

// Glitch text effects
class GlitchText {
    constructor() {
        this.glitchElements = document.querySelectorAll('.glitch');
        this.init();
    }
    
    init() {
        this.glitchElements.forEach(element => {
            // Apply random glitch effects periodically
            setInterval(() => {
                if (Math.random() > 0.8) {
                    this.applyGlitch(element);
                }
            }, 3000);
        });
    }
    
    applyGlitch(element) {
        // Add glitch class
        element.classList.add('glitching');
        
        // Remove after a short time
        setTimeout(() => {
            element.classList.remove('glitching');
        }, 200);
    }
}

// Initialize all animation components when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cursor trail effect
    new CursorTrail();
    
    // Initialize blood drip effect
    new BloodDrip();
    
    // Initialize glitch text effects
    new GlitchText();
    
    console.log('Animation components initialized');
});

// Add glitching class styles dynamically
const glitchStyles = `
    .glitching::before {
        animation: glitch-1 0.3s linear;
    }
    
    .glitching::after {
        animation: glitch-2 0.3s linear;
    }
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = glitchStyles;
document.head.appendChild(styleSheet);