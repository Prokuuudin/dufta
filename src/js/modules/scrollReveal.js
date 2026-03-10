import ScrollReveal from "scrollreveal";

// Базовые настройки
ScrollReveal({
  distance: "24px",
  duration: 700,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  viewFactor: 0.15,
  // reset: true,
});

function scrollRevealFunc() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  ScrollReveal().reveal(`.hero__title, .hero__slogan`, {
    delay: 220,
    distance: "0px",
    duration: 650,
    scale: 0.98,
    opacity: 0,
  });

  ScrollReveal().reveal(`.title-2`, {
    delay: 100,
    origin: "top",
    distance: "18px",
  });

  ScrollReveal().reveal(
    `.about__image, .applications__image, .uses-cases__image`,
    {
      delay: 120,
      origin: "left",
    },
  );

  ScrollReveal().reveal(
    `.about__content, .applications__textcol, .uses-cases__text, .products-info__column, .blog-info__text, .how-to-use__pro-tip`,
    {
      delay: 150,
      origin: "right",
    },
  );

  ScrollReveal().reveal(
    `.products-slider__slide, .blog-slide, .benefits__item, .how-to-use__item, .btn-link`,
    {
      delay: 120,
      interval: 80,
      origin: "bottom",
      distance: "20px",
    },
  );
}

export default scrollRevealFunc;
