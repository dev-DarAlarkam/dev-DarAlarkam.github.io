// Navigation functions
function showSection(type) {
    const pages = {
        certificates: 'html/certificates.html',
        'completion-certificate': 'html/completion-certificates.html',
        announcements: 'html/announcements.html',
        resources: 'html/resources.html',
        anthem: 'html/anthem.html',
        'rooms-program': 'html/rooms-program.html'
    };

    if (pages[type]) {
        window.location.href = pages[type];
    }
}

function showNavigation() {
    window.location.href = 'index.html';
}

const pageHeader = document.querySelector('header');
const pageFooter = document.querySelector('footer');
const yearDisplay = document.getElementById('year-display');

if (yearDisplay) {
    yearDisplay.textContent = new Date().getFullYear();
}

function updateScrollVisibility() {
    if (!pageHeader || !pageFooter) {
        return;
    }

    pageHeader.classList.toggle('is-hidden', window.scrollY > 0);

    const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
    pageFooter.classList.toggle('is-visible', reachedBottom);
}

window.addEventListener('scroll', updateScrollVisibility, { passive: true });
window.addEventListener('resize', updateScrollVisibility);
updateScrollVisibility();