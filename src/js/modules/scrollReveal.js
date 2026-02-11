import ScrollReveal from 'scrollreveal';

// Базовые настройки
ScrollReveal({
	distance: '30px',
	duration: 2800,
	// reset: true,
});

function scrollRevealFunc() {	
	ScrollReveal().reveal(`.title-1, .numbers-text, .awards__text`, {
		delay: 800,
		distance: '0px',
		opacity: 0,
	});

	ScrollReveal().reveal(`.header__row`, {
		origin: 'top',
	});

	ScrollReveal().reveal(`.title-2`, {
		delay: 300,
		origin: 'top',
	});

	ScrollReveal().reveal(`.hero__title, .about__text, .products-info__text, .distribution__text, .card-benefit__header, .numbers__img, .tradition-card__body, .delivery__images, .delivery-payment__text, .delivery-payment__list, .contacts, .footer__company, .swiper, .contacts__links`, {
		delay: 400,
		origin: 'left',
	});

	ScrollReveal().reveal(`.hero__slogan, .btn-link, .about__container, .distribution__benefits, .distribution__contact, .card-benefit__text, .numbers__content, .tradition-card__img, .blog-info__text, .blog-link, .footer__copyright, .footer__socials`, {
		delay: 600,
		origin: 'bottom',
	});

}

export default scrollRevealFunc;