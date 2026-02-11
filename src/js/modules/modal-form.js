function getModalForm() {
    let openFormBtns = document.querySelectorAll('.open-form-btn');
    let modalForm = document.getElementById('modal-form');
    let closeModalBtn = document.getElementById('modal__form__close-btn');
    let body = document.querySelector('body');
    let header = document.querySelector('header');
    let widthScroll;

    if (openFormBtns.length > 0) {
        for (let btn of openFormBtns) {
            btn.onclick = function () {
                modalForm.classList.add('modal-form--active');
                widthScroll = window.innerWidth - modalForm.offsetWidth + 'px';
                body.style.overflow = 'hidden';
                header.style.overflow = 'hidden';
                header.style.paddingRight = widthScroll;
                body.style.paddingRight = widthScroll;
            }
        }
    }

    closeModalBtn.onclick = function () {
        modalForm.classList.remove('modal-form--active');
        setTimeout(() => {
            body.style.overflow = 'visible';
            body.style.paddingRight = '0px';
            header.style.overflow = 'visible';
            header.style.paddingRight = '0px';
        }, 800);
    }

    window.addEventListener('click', (e) => {
        let target = e.target;
        if (target === modalForm) {
            modalForm.classList.remove('modal-form--active');
            setTimeout(() => {
                body.style.overflow = 'visible';
                body.style.paddingRight = '0px';
                header.style.overflow = 'visible';
                header.style.paddingRight = '0px';
            }, 800);
        }
    });
}

export default getModalForm;

