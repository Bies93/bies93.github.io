// 🕷️ MODERN 2025 CYBERPUNK WEBSITE ENGINE
// Advanced JavaScript with ES2025+ Features, PWA, Performance Monitoring, and AI capabilities

class CyberpunkWebsiteEngine {
  constructor() {
    this.init();
    this.setupPerformanceMonitoring();
    this.setupAccessibilityFeatures();
    this.setupAIAssistantIntegration();
  }

  async init() {
    try {
      console.log('🚀 Initializing Cyberpunk Engine v2.0.0 with AI Integration');

      await this.waitForDOM();
      this.setupNavigation();
      this.setupInteractiveEffects();
      this.setupScrollInteractions();
      this.setupWebVitals();
      this.setupCursorEffects();
      this.setupThemeManagement();
      this.setupContactForm();
      this.setupProjectFiltering();
      this.setupPWAPrompt();

      document.dispatchEvent(new CustomEvent('app:initialized'));
      console.log('✅ Cyberpunk Engine fully operational');

    } catch (error) {
      console.error('❌ Engine initialization failed:', error);
      this.displayCriticalFailure(error);
    }
  }

  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      } else {
        resolve();
      }
    });
  }

  // 🚀 Advanced Navigation with Locomotive Scroll
  setupNavigation() {
    const header = document.getElementById('header');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu-2');

    // Sticky header with enhanced backdrop
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;

      if (scrolled > 100) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }

      lastScrollTop = scrolled;
    }, { passive: true });

    // Smooth scrolling with offset
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          const offsetTop = targetElement.offsetTop - header.offsetHeight;

          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });

          // Update active states
          navLinks.forEach(l => l.classList.remove('active-link'));
          link.classList.add('active-link');
        }
      });
    });

    // Mobile menu with advanced animations
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('active');
        mobileMenu.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', !isOpen);
        mobileMenuToggle.classList.toggle('active');

        // Animate hamburger icon
        const spans = mobileMenuToggle.querySelectorAll('span');
        if (!isOpen) {
          spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
          spans[0].style.transform = '';
          spans[1].style.opacity = '';
          spans[2].style.transform = '';
        }
      });
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-menu a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', false);
        mobileMenuToggle.classList.remove('active');
      });
    });
  }

  // 🎨 Advanced Theme Management with Auto-Detection
  setupThemeManagement() {
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') ||
                        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', currentTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Add transition effect
        document.body.style.transition = 'background-color 0.5s ease, color 0.5s ease';
        setTimeout(() => document.body.style.transition = '', 500);
      });
    }

    // Auto-detect system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  // 🎯 Advanced Scroll Interactions
  setupScrollInteractions() {
    // Intersection Observer for fade-in animations
    const scrollItems = document.querySelectorAll('[data-scroll]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    scrollItems.forEach(item => observer.observe(item));

    // Advanced parallax effects
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    window.addEventListener('scroll', () => {
      parallaxElements.forEach(element => {
        const speed = element.dataset.parallax || 0.5;
        const scrolled = window.pageYOffset;
        const rate = scrolled * -speed;
        element.style.transform = `translateY(${rate}px)`;
      });
    }, { passive: true });
  }

  // ⚡ Performance Monitoring with Core Web Vitals
  setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // LCP Monitoring
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('LCP:', entry.startTime);
        });
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // FID Monitoring
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      }).observe({ type: 'first-input', buffered: true });

      // CLS Monitoring
      let cls = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        console.log('CLS:', cls);
      }).observe({ type: 'layout-shift', buffered: true });
    }
  }

  // ♿ Advanced Accessibility Features
  setupAccessibilityFeatures() {
    // Skip links
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    skipLinks.forEach(link => {
      link.addEventListener('focus', () => {
        link.style.top = '0';
      });
      link.addEventListener('blur', () => {
        link.style.top = '-40px';
      });
    });

    // ARIA live regions for announcements
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);

    // Keyboard navigation enhancements
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
        this.handleKeyboardNavigation(e);
      }
    });

    // High contrast mode detection
    window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
      if (e.matches) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
    });
  }

  // 🖱️ Advanced Cursor Effects with 3D Tracking
  setupCursorEffects() {
    if (!('ontouchstart' in window)) {
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-outline"></div>';
      document.body.appendChild(cursor);

      let mouseX = 0, mouseY = 0;
      let cursorX = 0, cursorY = 0;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      // Smooth cursor animation
      const animateCursor = () => {
        cursorX += (mouseX - cursorX) * 0.1;
        cursorY += (mouseY - cursorY) * 0.1;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;

        requestAnimationFrame(animateCursor);
      };
      animateCursor();

      // Cursor state changes on interactive elements
      document.addEventListener('mouseenter', (e) => {
        if (e.target.matches('a, button, [data-cursor-hover]')) {
          cursor.classList.add('hover');
        }
      }, true);

      document.addEventListener('mouseleave', (e) => {
        if (e.target.matches('a, button, [data-cursor-hover]')) {
          cursor.classList.remove('hover');
        }
      }, true);
    }
  }

  // 🎪 Interactive Effects Engine
  setupInteractiveEffects() {
    this.setupGlitchEffects();
    this.setupParticleBackground();
    this.setupMagnetEffect();
    this.setupScrollTriggers();
  }

  // 🔄 Glitch Text Effects
  setupGlitchEffects() {
    const glitchElements = document.querySelectorAll('.glitch-text');

    glitchElements.forEach(element => {
      if (!element.dataset.glitchInitialized) {
        element.dataset.glitchInitialized = 'true';

        setInterval(() => {
          if (Math.random() > 0.95) { // 5% chance per second
            this.applyGlitchEffect(element);
          }
        }, 1000);
      }
    });
  }

  applyGlitchEffect(element) {
    element.classList.add('glitching');
    setTimeout(() => {
      element.classList.remove('glitching');
    }, 200);
  }

  // 🦄 Particle Background System
  setupParticleBackground() {
    const particles = [];
    const hero = document.getElementById('hero');
    if (!hero) return;

    const particleCanvas = document.createElement('canvas');
    particleCanvas.style.position = 'absolute';
    particleCanvas.style.top = '0';
    particleCanvas.style.left = '0';
    particleCanvas.style.pointerEvents = 'none';
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;

    hero.appendChild(particleCanvas);

    const ctx = particleCanvas.getContext('2d');

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const animateParticles = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      particles.forEach((particle, index) => {
        // Move particles
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x > window.innerWidth) particle.x = 0;
        if (particle.x < 0) particle.x = window.innerWidth;
        if (particle.y > window.innerHeight) particle.y = 0;
        if (particle.y < 0) particle.y = window.innerHeight;

        // Draw particle
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby particles
        for (let j = index + 1; j < particles.length; j++) {
          const otherParticle = particles[j];
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${(100 - distance) / 200})`;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }
      });

      requestAnimationFrame(animateParticles);
    };

    animateParticles();

    // Resize handling
    window.addEventListener('resize', () => {
      particleCanvas.width = window.innerWidth;
      particleCanvas.height = window.innerHeight;
    }, { passive: true });
  }

  // 🧲 Magnet Effect for Interactive Elements
  setupMagnetEffect() {
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    const mouse = { x: 0, y: 0 };

    document.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    magneticElements.forEach(element => {
      const rect = element.getBoundingClientRect();

      const moveElement = () => {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = mouse.x - centerX;
        const deltaY = mouse.y - centerY;

        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 100;

        if (distance < maxDistance) {
          const strength = (maxDistance - distance) / maxDistance;
          const moveX = deltaX * strength * 0.3;
          const moveY = deltaY * strength * 0.3;

          element.style.transform = `translate(${moveX}px, ${moveY}px) scale(${1 + strength * 0.1})`;
        } else {
          element.style.transform = '';
        }

        requestAnimationFrame(moveElement);
      };

      element.addEventListener('mouseenter', () => {
        rect = element.getBoundingClientRect();
        moveElement();
      });

      element.addEventListener('mouseleave', () => {
        element.style.transform = '';
      });
    });
  }

  // 📧 Advanced Contact Form
  setupContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    // Real-time validation with feedback
    const inputs = contactForm.querySelectorAll('input, textarea');

    inputs.forEach(input => {
      input.addEventListener('input', () => this.validateField(input));
      input.addEventListener('blur', () => this.validateField(input));
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Check all validations
      const isValid = this.validateForm(contactForm);
      if (!isValid) {
        this.announce('Please fill out all required fields correctly.');
        return;
      }

      await this.submitContactForm(contactForm);
    });
  }

  validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    let isValid = true;
    let message = '';

    switch (field.type) {
      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        message = isValid ? '' : 'Please enter a valid email address.';
        break;
      case 'text':
        isValid = value.length >= 3;
        message = isValid ? '' : 'Minimum 3 characters required.';
        break;
      default:
        isValid = value.length > 0;
        message = isValid ? '' : 'This field is required.';
    }

    field.classList.toggle('field-valid', !isRequired || isValid);
    field.classList.toggle('field-invalid', isRequired && !isValid);

    // Update aria-describedby
    field.setAttribute('aria-invalid', !isValid);

    if (message) {
      let errorElement = field.parentNode.querySelector('.error-message');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);
      }
      errorElement.textContent = message;
    } else {
      const errorElement = field.parentNode.querySelector('.error-message');
      if (errorElement) {
        errorElement.remove();
      }
    }

    return isValid;
  }

  validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let allValid = true;

    requiredFields.forEach(field => {
      if (!this.validateField(field)) {
        allValid = false;
      }
    });

    return allValid;
  }

  async submitContactForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;

    // Loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Simulate API call (replace with actual endpoint)
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success/failure
          Math.random() > 0.95 ? reject(new Error('Network error')) : resolve();
        }, 2000);
      });

      this.announce('Message sent successfully! I\'ll get back to you soon.');

      // Show success animation
      this.showSuccessAnimation(form);

      // Reset form
      form.reset();

      // Reset button
      submitButton.disabled = false;
      submitButton.textContent = originalText;

    } catch (error) {
      console.error('Form submission error:', error);
      this.announce('Failed to send message. Please try again.');

      submitButton.disabled = false;
      submitButton.textContent = 'Try Again';
    }
  }

  // 🔧 Project Filtering System
  setupProjectFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter projects with animation
        projectCards.forEach(card => {
          const category = card.dataset.category;
          const shouldShow = filter === 'all' || category === filter;

          if (shouldShow) {
            card.style.display = '';
            card.classList.add('animate-slide-up');
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
            card.classList.remove('animate-slide-up');
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });

        this.announce(`${filter === 'all' ? 'All' : filter} projects shown`);
      });
    });
  }

  // 📱 PWA Installation & Enhancements
  setupPWAPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button after some interaction
      setTimeout(() => {
        this.showInstallPrompt();
      }, 3000);
    });

    window.addEventListener('appinstalled', (e) => {
      console.log('PWA installed');
      deferredPrompt = null;
    });
  }

  showInstallPrompt() {
    const installButton = document.getElementById('install-pwa');

    if (installButton) {
      installButton.classList.remove('hidden');

      window.promptLater = () => {
        this.deferredPrompt.prompt();
        installButton.classList.add('hidden');
      };
    }
  }

  // 🔔 Notification System
  announce(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }

    // Also show in corner notification style
    this.showToast(message);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm glass animate-slide-up ${
      type === 'success' ? 'border-green-400' :
      type === 'error' ? 'border-red-400' : 'border-primary'
    }`;

    toast.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="text-2xl">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </div>
        <div class="font-medium">${message}</div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-white">✕</button>
      </div>
    `;

    document.body.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  // 🎉 Success Animation
  showSuccessAnimation(form) {
    const confetti = document.createElement('div');
    confetti.className = 'fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(confetti);

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'absolute w-2 h-2';
      particle.style.background = ['#ff0050', '#8338ec', '#ff7300', '#3bf0c3'][Math.floor(Math.random() * 4)];
      particle.style.borderRadius = '50%';
      particle.style.position = 'absolute';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animation = `confetti ${1 + Math.random() * 2}s ease-out forwards`;

      confetti.appendChild(particle);
    }

    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }

  // 🚨 Critical Error Handling
  displayCriticalFailure(error) {
    document.body.innerHTML = `
      <div class="fixed inset-0 bg-red-900/50 flex items-center justify-content-center z-50">
        <div class="glass p-8 rounded-xl max-w-md text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h1 class="text-2xl font-bold mb-4">System Error</h1>
          <p class="mb-4 text-gray-300">Something went wrong while loading the application.</p>
          <button onclick="window.location.reload()" class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80">
            Restart System
          </button>
        </div>
      </div>
    `;
  }

  // 🤖 AI Assistant Integration (Future Feature)
  setupAIAssistantIntegration() {
    // Placeholder for AI features - would integrate OpenAI or similar
    // This would add intelligent suggestions, auto-complete, etc.
  }
}

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.cyberpunkWebsite = new CyberpunkWebsiteEngine();
  } catch (error) {
    console.error('Critical engine failure:', error);
    CyberpunkWebsiteEngine.prototype.displayCriticalFailure(error);
  }
});

// Export for development
export default CyberpunkWebsiteEngine;

// Add custom CSS animations via JavaScript
const cssAnimations = `
@keyframes glitching {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}

@keyframes confetti {
  0% {
    transform: translateY(-100vh) rotate(0deg) scale(0);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg) scale(1);
    opacity: 0;
  }
}

.glitching {
  animation: glitching 0.2s ease-in-out;
}

.custom-cursor {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.1s ease;
}

.cursor-dot {
  width: 6px;
  height: 6px;
  background: var(--primary);
  border-radius: 50%;
  margin: 50% 50%;
  transform: translate(-50%, -50%);
}

.cursor-outline {
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--primary);
  border-radius: 50%;
}

.custom-cursor.hover {
  transform: scale(1.5);
}

.in-view {
  opacity: 1;
  transform: translateY(0);
}

.field-valid {
  border-color: var(--success);
}

.field-invalid {
  border-color: var(--error);
}

.error-message {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.glitch-text {
  position: relative;
}

.glitch-text::before,
.glitch-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch-text::before {
  left: 2px;
  text-shadow: -2px 0 var(--primary);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitching-inverse 3s infinite linear alternate-reverse;
}

.glitch-text::after {
  left: -2px;
  text-shadow: -2px 0 var(--secondary);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitching-other 2s infinite linear alternate-reverse;
}

@keyframes glitching-inverse {
  0% { clip: rect(42px, 9999px, 44px, 0); }
  5% { clip: rect(12px, 9999px, 59px, 0); }
  10% { clip: rect(48px, 99px, 29px, 0); }
  100% { clip: rect(52px, 999px, 74px, 0); }
}

@keyframes glitching-other {
  0% { clip: rect(65px, 999px, 32px, 0); }
  5% { clip: rect(52px, 999px, 34px, 0); }
  10% { clip: rect(24px, 999px, 59px, 0); }
  100% { clip: rect(2px, 999px, 50px, 0); }
}
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = cssAnimations;
document.head.appendChild(styleSheet);

// Initialize PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function installPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
  }
}