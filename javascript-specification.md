# JavaScript Functionality Specification

## Overview

The JavaScript for this website will handle interactive elements, animations, and user experience enhancements that support the horror/thriller theme. All JavaScript will be organized into modular, maintainable code.

## File Structure

```
js/
├── main.js (core functionality)
└── animations.js (special effects and animations)
```

## Main.js Functionality

### 1. Navigation and Smooth Scrolling

```javascript
// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Mobile navigation toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});
```

### 2. Form Validation and Handling

```javascript
// Contact form validation
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            showMessage('Please fill in all fields.', 'error');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // If validation passes, simulate form submission
        submitForm({ name, email, subject, message });
    });
}

function submitForm(data) {
    // Show loading state
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate API call (in a real implementation, this would be an actual fetch request)
    setTimeout(() => {
        showMessage('Message sent successfully! I\'ll get back to you soon.', 'success');
        contactForm.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 1500);
}

function showMessage(message, type) {
    // Remove any existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    
    // Add to form
    contactForm.appendChild(messageElement);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}
```

### 3. Scroll Effects and Animations

```javascript
// Add fade-in animation to elements when they come into view
const fadeElements = document.querySelectorAll('.fade-in');

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1
});

fadeElements.forEach(element => {
    fadeInObserver.observe(element);
});

// Header shadow on scroll
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
```

### 4. Dark Mode Toggle

```javascript
// Dark mode toggle functionality
const darkModeToggle = document.createElement('button');
darkModeToggle.className = 'dark-mode-toggle';
darkModeToggle.innerHTML = '🌙';
darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');

// Add to header
const headerContainer = document.querySelector('#header .container');
headerContainer.appendChild(darkModeToggle);

// Check for saved theme or default to dark
const currentTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', currentTheme);

darkModeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update button icon
    darkModeToggle.innerHTML = newTheme === 'dark' ? '🌙' : '☀️';
});
```

## Animations.js Functionality

### 1. Creepy Cursor Trail Effect

```javascript
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

// Initialize cursor trail
new CursorTrail();
```

### 2. Blood Drip Animation Control

```javascript
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
        
        document.querySelector('#hero').appendChild(extraDrip);
        
        // Remove after animation completes
        setTimeout(() => {
            extraDrip.remove();
        }, 5000);
    }
}

// Initialize blood drip effect
new BloodDrip();
```

### 3. Glitch Text Effects

```javascript
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

// Initialize glitch text effects
new GlitchText();
```

### 4. Heartbeat Effect for Interactive Elements

```javascript
// Heartbeat effect for interactive elements
class HeartbeatEffect {
    constructor() {
        this.heartbeatElements = document.querySelectorAll('.btn, .project-card, .blog-post');
        this.init();
    }
    
    init() {
        this.heartbeatElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.startHeartbeat(element);
            });
            
            element.addEventListener('mouseleave', () => {
                this.stopHeartbeat(element);
            });
        });
    }
    
    startHeartbeat(element) {
        element.classList.add('heartbeat');
    }
    
    stopHeartbeat(element) {
        element.classList.remove('heartbeat');
    }
}

// Initialize heartbeat effects
new HeartbeatEffect();
```

## DOM Content Loaded Initialization

```javascript
// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new CursorTrail();
    new BloodDrip();
    new GlitchText();
    new HeartbeatEffect();
    
    // Additional initialization code here
    console.log('IT Horror Blog initialized');
});
```

## Performance Considerations

1. **Debounce Scroll Events**: Use debounce for scroll-based animations
2. **Intersection Observer**: Use for fade-in animations instead of scroll listeners
3. **Request Animation Frame**: Use for smooth animations
4. **Event Delegation**: Use for dynamically added elements
5. **Memory Management**: Remove event listeners when components are destroyed

## Accessibility Features

1. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
2. **ARIA Labels**: Add appropriate ARIA attributes for screen readers
3. **Focus Management**: Manage focus for modal dialogs and interactive elements
4. **Reduced Motion**: Respect user's preference for reduced motion

```javascript
// Respect user's preference for reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches) {
    // Disable animations
    document.body.classList.add('reduce-motion');
}
```

## Error Handling

```javascript
// Global error handling
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});
```

## Module Structure

All JavaScript will be organized using ES6 modules for better maintainability:

```javascript
// main.js
import { initNavigation } from './navigation.js';
import { initForms } from './forms.js';
import { initScrollEffects } from './scroll-effects.js';

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initForms();
    initScrollEffects();
});
```

This modular approach allows for easier testing, maintenance, and code reuse.