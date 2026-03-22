function scrollTop() {
    const topBtn = document.getElementById('topBtn');
    window.onscroll = () => {
        topBtn.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? 'block' : 'none';
    };
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
