// Main JavaScript untuk portfolio
document.addEventListener('DOMContentLoaded', function () {
    // Dark mode toggle functionality
    const darkModeToggle = document.getElementById('darkModeToggle');

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function () {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
            updateDarkModeIcon();
        });
    }

    // Set initial dark mode state
    if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
    }
    updateDarkModeIcon();

    // Active nav link highlighting
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        let scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink);
    highlightNavLink(); // Initial call

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobileMenu');
                const mobileMenuButton = document.getElementById('mobileMenuButton');
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.querySelector('span').textContent = 'menu';
                }
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('section-fade-in');
        observer.observe(section);
    });

    // CV Download functionality
    const downloadCVButton = document.querySelector('.download-cv-btn');
    if (downloadCVButton) {
        downloadCVButton.addEventListener('click', function (e) {
            // In production, this would download the actual CV
            // For demo purposes, show a message
            if (!this.getAttribute('href').includes('assets/documents/')) {
                e.preventDefault();
                alert('CV download functionality would be implemented here. In production, link to your actual CV PDF file.');

                // Create a temporary download link
                const text = "Rivaldo Timoty - Data Scientist\n\nContact Information\nEmail: rivaldo.timoty@example.com\nPhone: +62 812 3456 7890\n\nExperience:\n- Data Scientist at PT Stellar Data Constellation\n- Data Analyst Intern at Global Tech Solutions\n- Teaching Assistant at ITS";
                const blob = new Blob([text], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Rivaldo_Timoty_CV.txt';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        });
    }

    // Project card hover effects
    const projectCards = document.querySelectorAll('.group');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.3s ease';
        });
    });

    // Form handling for future implementation
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
});

function updateDarkModeIcon() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const isDark = document.documentElement.classList.contains('dark');
        darkModeToggle.innerHTML = isDark
            ? '<span class="material-icons-outlined">light_mode</span>'
            : '<span class="material-icons-outlined">dark_mode</span>';
        darkModeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
}

function handleContactFormSubmit(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Show loading state
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.innerHTML = '<div class="loading"></div> Sending...';
    submitButton.disabled = true;

    // Simulate API call
    setTimeout(() => {
        alert('Thank you for your message! This is a demo form. In production, this would connect to a backend service.');

        // Reset form and button
        event.target.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 1500);
}

// Skill bars animation
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
            bar.style.transition = 'width 1.5s ease-in-out';
        }, 300);
    });
}

// Initialize skill bars animation when section is in view
const skillsSection = document.getElementById('skills');
if (skillsSection) {
    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                skillsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillsObserver.observe(skillsSection);
}

// Add current year to footer
const currentYearElement = document.getElementById('currentYear');
if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}