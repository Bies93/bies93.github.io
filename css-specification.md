# CSS Styling Specification for Dark Horror/Thriller Theme

## Overall Design Principles

- Dark, moody color scheme with blood red accents
- Subtle animations and transitions for eerie effects
- Typography that enhances the horror atmosphere
- Responsive design that works on all devices
- Performance-optimized with minimal CSS

## Color Palette

```css
:root {
  /* Primary Colors */
  --dark-bg: #0a0a0a;
  --darker-bg: #000000;
  --secondary-bg: #1a1a1a;
  --light-text: #f8f8ff;
  --muted-text: #a9a9a9;
  
  /* Accent Colors */
  --blood-red: #8b0000;
  --zombie-green: #32cd32;
  --haunted-purple: #4b0082;
  --ghostly-white: #f8f8ff;
  
  /* Shadows and Effects */
  --blood-shadow: 0 0 10px rgba(139, 0, 0, 0.5);
  --glow-shadow: 0 15px rgba(139, 0, 0, 0.7);
}
```

## Typography

```css
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Creepster&family=Roboto:wght@300;400;700&display=swap');

body {
  font-family: 'Roboto', sans-serif;
  font-weight: 300;
  color: var(--light-text);
  background-color: var(--dark-bg);
  line-height: 1.6;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Creepster', cursive;
  font-weight: 400;
  letter-spacing: 1px;
}

.section-title {
  position: relative;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.section-title::after {
  content: "";
  display: block;
  width: 100px;
  height: 3px;
  background: var(--blood-red);
  margin: 10px auto;
  box-shadow: var(--blood-shadow);
}
```

## Layout and Grid System

```css
.container {
  width: 90%;
  max-width: 120px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Flexbox and Grid utilities */
.flex {
  display: flex;
}

.grid {
  display: grid;
}

/* Section spacing */
section {
  padding: 80px 0;
}

section:nth-child(even) {
  background-color: var(--secondary-bg);
}
```

## Header and Navigation

```css
#header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: 20px 0;
  border-bottom: 1px solid var(--blood-red);
  box-shadow: var(--blood-shadow);
}

.logo h1 a {
  color: var(--light-text);
  text-decoration: none;
 font-size: 1.8rem;
}

.blood {
  color: var(--blood-red);
  text-shadow: var(--blood-shadow);
}

.nav-menu {
  display: flex;
  list-style: none;
}

.nav-menu li {
  margin-left: 30px;
}

.nav-menu a {
  color: var(--light-text);
  text-decoration: none;
  font-weight: 400;
  transition: all 0.3s ease;
  position: relative;
}

.nav-menu a:hover {
  color: var(--blood-red);
}

.nav-menu a::after {
  content: "";
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--blood-red);
  transition: width 0.3s ease;
}

.nav-menu a:hover::after {
  width: 100%;
}
```

## Hero Section

```css
#hero {
  height: 100vh;
  display: flex;
 align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(rgba(10, 10, 0.7), rgba(10, 10, 0.9)), 
              url('../images/hero-bg.jpg') center/cover no-repeat;
}

.hero-content h2 {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: var(--glow-shadow);
  animation: pulse 2s infinite;
}

.glitch {
  position: relative;
}

.glitch::before,
.glitch::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.glitch::before {
  left: 2px;
  text-shadow: -2px 0 var(--blood-red);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-1 3s infinite linear alternate-reverse;
}

.glitch::after {
  left: -2px;
  text-shadow: -2px 0 var(--zombie-green);
  clip: rect(44px, 450px, 56px, 0);
  animation: glitch-2 2s infinite linear alternate-reverse;
}

.blood-drip {
 position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 20px;
  background: url('../images/blood-drip.svg') repeat-x;
  animation: drip 10s linear infinite;
}
```

## About Section

```css
#about {
  background-color: var(--darker-bg);
}

.about-content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  align-items: center;
}

.profile-image {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: var(--blood-shadow);
}

.profile-image img {
  width: 100%;
  display: block;
  transition: transform 0.5s ease;
}

.profile-image:hover img {
  transform: scale(1.05);
}

.haunted-frame {
 position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid var(--blood-red);
  pointer-events: none;
  box-shadow: inset 0 0 20px rgba(139, 0, 0, 0.5);
}

.skills .skill-bar {
  margin-bottom: 20px;
}

.skills .skill-bar p {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.progress {
  height: 10px;
  background: var(--secondary-bg);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 5px;
  animation: progress-animation 2s ease-out forwards;
  transform-origin: left;
  transform: scaleX(0);
}

.progress-fill.web {
  background: var(--blood-red);
  box-shadow: var(--blood-shadow);
}

.progress-fill.security {
  background: var(--zombie-green);
  box-shadow: 0 0 10px rgba(50, 205, 50, 0.5);
}

.progress-fill.data {
  background: var(--haunted-purple);
  box-shadow: 0 0 10px rgba(75, 0, 130, 0.5);
}
```

## Projects Section

```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.project-card {
  background: var(--secondary-bg);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
 box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  position: relative;
}

.project-card:hover {
  transform: translateY(-10px);
  box-shadow: var(--blood-shadow);
}

.project-image {
  height: 200px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.1);
}

.project-content {
  padding: 20px;
}

.project-content h3 {
  margin: 0 0 10px;
  color: var(--ghostly-white);
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  margin: 15px 0;
}

.tag {
  background: var(--blood-red);
  color: var(--light-text);
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-right: 10px;
  margin-bottom: 10px;
  box-shadow: var(--blood-shadow);
}

.project-link {
  display: inline-block;
  color: var(--blood-red);
  text-decoration: none;
  font-weight: 700;
  position: relative;
  transition: all 0.3s ease;
}

.project-link::after {
  content: "→";
  margin-left: 5px;
  transition: transform 0.3s ease;
}

.project-link:hover {
  color: var(--zombie-green);
}

.project-link:hover::after {
  transform: translateX(5px);
}
```

## Blog Section

```css
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.blog-post {
  background: var(--secondary-bg);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
}

.blog-post:hover {
  transform: translateY(-5px);
  box-shadow: var(--blood-shadow);
}

.post-image {
  height: 200px;
}

.post-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  padding: 20px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
 color: var(--muted-text);
}

.post-meta .category {
  background: var(--blood-red);
  color: var(--light-text);
  padding: 3px 8px;
  border-radius: 5px;
}

.read-more {
  display: inline-block;
  color: var(--blood-red);
  text-decoration: none;
  font-weight: 700;
  margin-top: 15px;
  position: relative;
 transition: all 0.3s ease;
}

.read-more::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: var(--blood-red);
  transition: width 0.3s ease;
}

.read-more:hover::after {
  width: 100%;
}
```

## Contact Section

```css
.contact-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.contact-info p {
  margin-bottom: 20px;
  font-size: 1.1rem;
}

.contact-item {
  margin-bottom: 20px;
}

.contact-item h3 {
  color: var(--blood-red);
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.contact-item h3 i {
  margin-right: 10px;
}

.contact-form .form-group {
  margin-bottom: 20px;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--secondary-bg);
  background: rgba(26, 26, 26, 0.7);
  color: var(--light-text);
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
  transition: all 0.3s ease;
}

.contact-form input:focus,
.contact-form textarea:focus {
  outline: none;
  border-color: var(--blood-red);
  box-shadow: var(--blood-shadow);
}

.btn {
  display: inline-block;
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 700;
  cursor: pointer;
 transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-family: 'Roboto', sans-serif;
}

.btn-primary {
  background: var(--blood-red);
  color: var(--light-text);
  box-shadow: var(--blood-shadow);
}

.btn-primary:hover {
  background: #a50000;
  transform: translateY(-3px);
  box-shadow: var(--glow-shadow);
}

.btn-secondary {
  background: transparent;
  color: var(--light-text);
  border: 2px solid var(--blood-red);
}

.btn-secondary:hover {
  background: var(--blood-red);
  transform: translateY(-3px);
}
```

## Footer

```css
#footer {
  background: var(--darker-bg);
  padding: 40px 0 20px;
  border-top: 1px solid var(--blood-red);
}

.footer-content {
  text-align: center;
}

.footer-logo h2 {
  margin-bottom: 20px;
  font-size: 2rem;
}

.social-links {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--secondary-bg);
  color: var(--light-text);
  margin: 0 10px;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--blood-red);
  transform: translateY(-5px);
  box-shadow: var(--blood-shadow);
}

.footer-info p {
  margin: 5px 0;
  color: var(--muted-text);
  font-size: 0.9rem;
}
```

## Animations and Keyframes

```css
@keyframes pulse {
  0% {
    text-shadow: 0 0 10px rgba(139, 0, 0, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(139, 0, 0, 0.8), 0 0 30px rgba(139, 0, 0, 0.6);
  }
  100% {
    text-shadow: 0 0 10px rgba(139, 0, 0, 0.5);
  }
}

@keyframes glitch-1 {
  0% {
    clip: rect(42px, 9999px, 44px, 0);
  }
  5% {
    clip: rect(12px, 9999px, 59px, 0);
  }
  10% {
    clip: rect(48px, 9999px, 29px, 0);
  }
  15% {
    clip: rect(42px, 9999px, 73px, 0);
  }
  20% {
    clip: rect(63px, 999px, 27px, 0);
  }
  25% {
    clip: rect(34px, 999px, 55px, 0);
  }
  30% {
    clip: rect(86px, 9999px, 73px, 0);
  }
  35% {
    clip: rect(20px, 999px, 20px, 0);
  }
  40% {
    clip: rect(26px, 999px, 60px, 0);
  }
  45% {
    clip: rect(25px, 999px, 66px, 0);
  }
  50% {
    clip: rect(57px, 999px, 98px, 0);
  }
  55% {
    clip: rect(5px, 9999px, 46px, 0);
  }
  60% {
    clip: rect(82px, 999px, 31px, 0);
  }
  65% {
    clip: rect(54px, 9999px, 27px, 0);
  }
  70% {
    clip: rect(28px, 999px, 99px, 0);
  }
  75% {
    clip: rect(45px, 9999px, 69px, 0);
  }
  80% {
    clip: rect(23px, 999px, 85px, 0);
  }
  85% {
    clip: rect(1px, 9999px, 83px, 0);
  }
  90% {
    clip: rect(72px, 999px, 11px, 0);
  }
  95% {
    clip: rect(60px, 999px, 89px, 0);
  }
  100% {
    clip: rect(52px, 999px, 74px, 0);
  }
}

@keyframes glitch-2 {
  0% {
    clip: rect(65px, 999px, 32px, 0);
  }
  5% {
    clip: rect(52px, 999px, 34px, 0);
  }
  10% {
    clip: rect(24px, 9999px, 59px, 0);
  }
  15% {
    clip: rect(3px, 9999px, 80px, 0);
  }
  20% {
    clip: rect(79px, 9999px, 85px, 0);
  }
  25% {
    clip: rect(97px, 999px, 42px, 0);
  }
  30% {
    clip: rect(84px, 999px, 56px, 0);
  }
  35% {
    clip: rect(56px, 9999px, 24px, 0);
  }
  40% {
    clip: rect(10px, 9999px, 30px, 0);
  }
  45% {
    clip: rect(84px, 9999px, 85px, 0);
  }
  50% {
    clip: rect(92px, 999px, 20px, 0);
  }
  55% {
    clip: rect(95px, 9999px, 50px, 0);
  }
  60% {
    clip: rect(89px, 999px, 50px, 0);
  }
  65% {
    clip: rect(6px, 9999px, 90px, 0);
  }
  70% {
    clip: rect(80px, 99px, 89px, 0);
  }
  75% {
    clip: rect(86px, 999px, 84px, 0);
  }
  80% {
    clip: rect(27px, 999px, 50px, 0);
  }
  85% {
    clip: rect(45px, 9999px, 38px, 0);
  }
  90% {
    clip: rect(25px, 999px, 20px, 0);
  }
  95% {
    clip: rect(75px, 999px, 11px, 0);
  }
  100% {
    clip: rect(2px, 9999px, 50px, 0);
  }
}

@keyframes drip {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 100px 0;
  }
}

@keyframes progress-animation {
  to {
    transform: scaleX(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 1s ease-out;
}
```

## Responsive Design

```css
@media (max-width: 768px) {
  .hero-content h2 {
    font-size: 2.5rem;
  }
  
  .about-content {
    grid-template-columns: 1fr;
  }
  
  .contact-content {
    grid-template-columns: 1fr;
  }
  
  .nav-menu {
    position: fixed;
    left: -100%;
    top: 70px;
    flex-direction: column;
    background-color: var(--secondary-bg);
    width: 100%;
    text-align: center;
    transition: 0.3s;
    box-shadow: var(--blood-shadow);
    padding: 20px 0;
  }
  
  .nav-menu.active {
    left: 0;
  }
  
  .nav-menu li {
    margin: 15px 0;
  }
  
  .hamburger {
    display: block;
    cursor: pointer;
  }
}

@media (max-width: 480px) {
  .hero-content h2 {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .btn {
    padding: 10px 20px;
  }
}
```

## Special Effects and Transitions

```css
/* Creepy cursor trail effect */
.cursor-trail {
  position: fixed;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--blood-red);
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 9999;
  opacity: 0.7;
  box-shadow: var(--blood-shadow);
}

/* Fog overlay effect */
.fog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: url('../images/fog.png');
  opacity: 0.1;
  pointer-events: none;
  z-index: -1;
  animation: fog-animation 30s linear infinite;
}

@keyframes fog-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 1000px 1000px;
  }
}
```

## Performance Optimizations

1. **Minimize CSS**: All CSS should be minified for production
2. **Combine Files**: Main styles and responsive styles in one file
3. **Use Efficient Selectors**: Avoid overly specific selectors
4. **Leverage Hardware Acceleration**: Use transform and opacity for animations
5. **Optimize Images**: Use appropriate formats and compress images