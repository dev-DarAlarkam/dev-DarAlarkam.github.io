// Navigation functions
function showSection(type) {
    // Hide all sections
    document.getElementById('nav-section').classList.add('hidden');
    document.getElementById('certificate-section').classList.add('hidden');
    document.getElementById('announcements-section').classList.add('hidden');

    // Show selected section
    if (type === 'certificates') {
        document.getElementById('certificate-section').classList.remove('hidden');
        document.getElementById('certificate-preview').classList.add('hidden');
    } else if (type === 'announcements') {
        document.getElementById('announcements-section').classList.remove('hidden');
    }
}

function showNavigation() {
    // Hide all sections
    document.getElementById('certificate-section').classList.add('hidden');
    document.getElementById('announcements-section').classList.add('hidden');
    document.getElementById('certificate-preview').classList.add('hidden');
    
    // Show navigation
    document.getElementById('nav-section').classList.remove('hidden');
    
    // Reset form
    document.getElementById('certificate-form').reset();
    document.getElementById('pdf-button').disabled = true;
    document.getElementById('png-button').disabled = true;
    document.getElementById('message').innerHTML = '';
}

const pageHeader = document.querySelector('header');
const pageFooter = document.querySelector('footer');

function updateScrollVisibility() {
    pageHeader.classList.toggle('is-hidden', window.scrollY > 0);

    const reachedBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
    pageFooter.classList.toggle('is-visible', reachedBottom);
}

window.addEventListener('scroll', updateScrollVisibility, { passive: true });
window.addEventListener('resize', updateScrollVisibility);
updateScrollVisibility();