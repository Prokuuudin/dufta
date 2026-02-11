function getCookiesConsent() {
    document.querySelector('.reject-btn').addEventListener('click', e => {
        document.querySelector('.cookiebg').classList.remove('appear');
    });
    document.querySelector('.accept-btn').addEventListener('click', e => {
        localStorage.setItem("cookieBannerDisplayed", "true");
        document.querySelector('.cookiebg').classList.remove('appear');
    });

    setTimeout(() => {
        if (!localStorage.getItem("cookieBannerDisplayed")) {
            document.querySelector('.cookiebg').classList.add('appear');
        }
    }, 3000);
}

export default getCookiesConsent


