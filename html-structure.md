# HTML Structure Specification

## Overall Page Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IT Hobby Blog | bies93.github.io</title>
    <!-- SEO Meta Tags -->
    <meta name="description" content="Welcome to my IT hobby blog where I explore coding, cybersecurity, and technology with a dark twist.">
    <meta name="keywords" content="IT, coding, cybersecurity, technology, hobby, programming">
    <meta name="author" content="bies93">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Roboto:wght@300;400;700&display=swap" rel="stylesheet">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/responsive.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="images/favicon.ico">
</head>
<body>
    <!-- Header/Navigation -->
    <header id="header">
        <div class="container">
            <div class="logo">
                <h1><a href="#hero">bies93<span class="blood">.io</span></a></h1>
            </div>
            <nav>
                <ul class="nav-menu">
                    <li><a href="#hero">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#projects">Projects</a></li>
                    <li><a href="#blog">Blog</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
        </div>
    </header>

    <!-- Hero Section -->
    <section id="hero">
        <div class="container">
            <div class="hero-content">
                <h2 class="glitch" data-text="Welcome to the Dark Side of IT">Welcome to the Dark Side of IT</h2>
                <p>Where code meets horror and technology tells tales</p>
                <div class="cta-buttons">
                    <a href="#projects" class="btn btn-primary">Explore Projects</a>
                    <a href="#blog" class="btn btn-secondary">Read Blog</a>
                </div>
            </div>
        <div class="blood-drip"></div>
    </section>

    <!-- About Section -->
    <section id="about">
        <div class="container">
            <h2 class="section-title">About <span class="blood">Me</span></h2>
            <div class="about-content">
                <div class="profile-image">
                    <img src="images/profile.jpg" alt="bies93">
                    <div class="haunted-frame"></div>
                </div>
                <div class="bio">
                    <p>Welcome to my digital crypt. I'm a tech enthusiast with a passion for all things IT, from coding to cybersecurity, wrapped in a dark, mysterious aesthetic.</p>
                    <p>By day, I explore the depths of code and technology. By night, I document my journey in this haunted corner of the internet.</p>
                    <div class="skills">
                        <h3>My Haunted Skills</h3>
                        <div class="skill-bar">
                            <p>Web Development <span>85%</span></p>
                            <div class="progress">
                                <div class="progress-fill web"></div>
                            </div>
                        <div class="skill-bar">
                            <p>Cybersecurity <span>75%</span></p>
                            <div class="progress">
                                <div class="progress-fill security"></div>
                            </div>
                        <div class="skill-bar">
                            <p>Data Analysis <span>70%</span></p>
                            <div class="progress">
                                <div class="progress-fill data"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Projects Section -->
    <section id="projects">
        <div class="container">
            <h2 class="section-title">My <span class="blood">Projects</span></h2>
            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-image">
                        <img src="images/projects/project1.jpg" alt="Project 1">
                    </div>
                    <div class="project-content">
                        <h3>Haunted Network Scanner</h3>
                        <p>A cybersecurity tool that detects vulnerabilities with a spooky interface.</p>
                        <div class="project-tags">
                            <span class="tag">Python</span>
                            <span class="tag">Security</span>
                        </div>
                        <a href="#" class="project-link">View Details</a>
                    </div>
                <div class="project-card">
                    <div class="project-image">
                        <img src="images/projects/project2.jpg" alt="Project 2">
                    </div>
                    <div class="project-content">
                        <h3>Ghost in the Shell Script</h3>
                        <p>Automated bash scripts that perform system tasks with eerie efficiency.</p>
                        <div class="project-tags">
                            <span class="tag">Bash</span>
                            <span class="tag">Automation</span>
                        </div>
                        <a href="#" class="project-link">View Details</a>
                    </div>
                </div>
                <div class="project-card">
                    <div class="project-image">
                        <img src="images/projects/project3.jpg" alt="Project 3">
                    </div>
                    <div class="project-content">
                        <h3>Zombie Process Monitor</h3>
                        <p>A real-time system monitor with a horror-themed dashboard.</p>
                        <div class="project-tags">
                            <span class="tag">JavaScript</span>
                            <span class="tag">System</span>
                        </div>
                        <a href="#" class="project-link">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Blog Section -->
    <section id="blog">
        <div class="container">
            <h2 class="section-title">Latest <span class="blood">Blog</span> Posts</h2>
            <div class="blog-grid">
                <article class="blog-post">
                    <div class="post-image">
                        <img src="images/blog/post1.jpg" alt="Blog Post 1">
                    </div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="date">October 31, 2023</span>
                            <span class="category">Security</span>
                        </div>
                        <h3>The Phantom Menace: Understanding Zero-Day Exploits</h3>
                        <p>Delve into the shadowy world of zero-day vulnerabilities and how they haunt the cybersecurity landscape.</p>
                        <a href="#" class="read-more">Read More</a>
                    </div>
                </article>
                <article class="blog-post">
                    <div class="post-image">
                        <img src="images/blog/post2.jpg" alt="Blog Post 2">
                    </div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="date">October 15, 2023</span>
                            <span class="category">Programming</span>
                        </div>
                        <h3>Ghosts in the Code: Debugging the Unexplainable</h3>
                        <p>When your code behaves like it's possessed, these techniques will help you exorcise those digital demons.</p>
                        <a href="#" class="read-more">Read More</a>
                    </div>
                </article>
                <article class="blog-post">
                    <div class="post-image">
                        <img src="images/blog/post3.jpg" alt="Blog Post 3">
                    </div>
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="date">September 30, 2023</span>
                            <span class="category">Hardware</span>
                        </div>
                        <h3>Raising the Dead: Reviving Vintage Computer Hardware</h3>
                        <p>Bringing old computers back from the grave and what we can learn from their resurrection.</p>
                        <a href="#" class="read-more">Read More</a>
                    </div>
                </article>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact">
        <div class="container">
            <h2 class="section-title">Get in <span class="blood">Touch</span></h2>
            <div class="contact-content">
                <div class="contact-info">
                    <p>Have a project that needs a dark touch or just want to chat about tech? Reach out!</p>
                    <div class="contact-methods">
                        <div class="contact-item">
                            <h3><i class="icon-email"></i> Email</h3>
                            <p>contact@bies93.io</p>
                        </div>
                        <div class="contact-item">
                            <h3><i class="icon-location"></i> Location</h3>
                            <p>Digital Realm</p>
                        </div>
                    </div>
                </div>
                <form id="contact-form" class="contact-form">
                    <div class="form-group">
                        <input type="text" id="name" name="name" placeholder="Your Name" required>
                    </div>
                    <div class="form-group">
                        <input type="email" id="email" name="email" placeholder="Your Email" required>
                    </div>
                    <div class="form-group">
                        <input type="text" id="subject" name="subject" placeholder="Subject" required>
                    </div>
                    <div class="form-group">
                        <textarea id="message" name="message" placeholder="Your Message" rows="5" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Message</button>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer id="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">
                    <h2>bies93<span class="blood">.io</span></h2>
                </div>
                <div class="social-links">
                    <a href="#" class="social-link"><i class="icon-github"></i></a>
                    <a href="#" class="social-link"><i class="icon-twitter"></i></a>
                    <a href="#" class="social-link"><i class="icon-linkedin"></i></a>
                </div>
                <div class="footer-info">
                    <p>&copy; 2023 bies93.io. All rights reserved.</p>
                    <p>Built with blood, sweat, and a few tears.</p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="js/main.js"></script>
    <script src="js/animations.js"></script>
</body>
</html>
```

## Key Semantic Elements

1. **Header (`<header>`)**
   - Contains navigation and site identity
   - Responsive hamburger menu for mobile

2. **Main Sections (`<section>`)**
   - Hero section for impactful introduction
   - About section for personal information
   - Projects section with grid layout
   - Blog section with article previews
   - Contact section with form

3. **Articles (`<article>`)**
   - Used for blog post previews
   - Proper meta information (date, category)

4. **Navigation (`<nav>`)**
   - Semantic navigation list
   - Smooth scrolling anchors

5. **Forms (`<form>`)**
   - Properly labeled form elements
   - Validation attributes

6. **Footer (`<footer>`)**
   - Site information and copyright
   - Social media links

## Accessibility Features

- Proper heading hierarchy (h1, h2, h3)
- Alt text for all images
- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Sufficient color contrast