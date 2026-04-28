function editProfile() {
    const currentBio = document.getElementById('bio').innerText;
    const newBio = prompt("Customize your shopper profile bio:", currentBio);
    
    if (newBio && newBio.trim() !== "") {
        const bioElement = document.getElementById('bio');
        bioElement.style.opacity = 0;
        
        setTimeout(() => {
            bioElement.innerText = newBio;
            bioElement.style.transition = "opacity 0.5s ease";
            bioElement.style.opacity = 1;
        }, 500);
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // Add toast styles dynamically if not in CSS
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        background: 'var(--primary)',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: '1000',
        animation: 'slideIn 0.3s ease-out'
    });

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease-in';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Interactivity for Easy Reorder
document.querySelector('.btn-glass').addEventListener('click', () => {
    showToast("Reordering your frequent items... 🛒");
});

// Add smooth reveal for cards on scroll
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card, .stat-card');
    cards.forEach((card, index) => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            card.style.opacity = 1;
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
});
