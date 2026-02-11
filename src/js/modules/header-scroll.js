function headerScroll() {
    window.addEventListener('scroll', function () {
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('small');
        } else {
            header.classList.remove('small');
        }
    });
}

export default headerScroll;