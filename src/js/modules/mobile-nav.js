function mobileNav() {
	const navBtn = document.querySelector('.mobile-nav-btn');
	const nav = document.querySelector('.mobile-nav');
	const menuIcon = document.querySelector('.nav-icon');
	const navLinks = document.querySelectorAll('.mobile-nav a'); // Ссылки в меню
	const langSwitcher = document.querySelector('.switcher-wrapper'); // Переключатель языка

	// Функция закрытия меню
	const closeMenu = () => {
		nav.classList.remove('mobile-nav--open');
		menuIcon.classList.remove('nav-icon--active');
		document.body.classList.remove('no-scroll');
	};

	// Открытие/закрытие меню по кнопке
	navBtn.onclick = function () {
		nav.classList.toggle('mobile-nav--open');
		menuIcon.classList.toggle('nav-icon--active');
		document.body.classList.toggle('no-scroll');
	};

	// Закрытие меню при клике на пункт меню
	navLinks.forEach(link => {
		link.addEventListener('click', closeMenu);
	});

	// Закрытие меню при клике вне меню (кроме переключателя языка)
	document.addEventListener('click', (e) => {
		const clickedInsideNav = nav.contains(e.target);
		const clickedOnBtn = navBtn.contains(e.target);
		const clickedOnLangSwitcher = langSwitcher && langSwitcher.contains(e.target);

		if (!clickedInsideNav && !clickedOnBtn && !clickedOnLangSwitcher) {
			closeMenu();
		}
	});
}

export default mobileNav;
