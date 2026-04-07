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

  const headerAnimatedElements = Array.from(
    document.querySelectorAll(
      ".header .logo, .header__nav, .header__right-side, .mobile-nav-btn",
    ),
  );

  headerAnimatedElements.forEach((element, index) => {
    element.animate(
      [
        { opacity: 0, transform: "translateY(-14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        delay: 80 + index * 70,
        duration: 600,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );
  });

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

  ScrollReveal().reveal(`.about__image, .applications__image`, {
    delay: 120,
    origin: "left",
  });

  ScrollReveal().reveal(
    `.about__content, .applications__textcol, .products-info__column, .blog-info__text`,
    {
      delay: 150,
      origin: "bottom",
      distance: "18px",
    },
  );

  ScrollReveal().reveal(
    `.products-slider__slide, .blog-slide, .how-to-use__item, .uses-cases__item, .btn-link`,
    {
      delay: 120,
      interval: 80,
      origin: "bottom",
      distance: "20px",
    },
  );

  const benefitsItems = Array.from(
    document.querySelectorAll(".benefits__item"),
  );
  const benefitsGrid = document.querySelector(".benefits__content");

  if (benefitsGrid && benefitsItems.length) {
    const benefitsIconStartDelay = 380;
    const benefitsIconInterval = 300;

    const runBenefitsIconAnimation = () => {
      benefitsItems.forEach((item, index) => {
        setTimeout(() => {
          item.classList.remove("benefits__item--revealed");
          void item.offsetWidth;
          item.classList.add("benefits__item--revealed");
        }, index * benefitsIconInterval);
      });
    };

    if ("IntersectionObserver" in window) {
      const benefitsObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(runBenefitsIconAnimation, benefitsIconStartDelay);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.25 },
      );

      benefitsObserver.observe(benefitsGrid);
    } else {
      setTimeout(runBenefitsIconAnimation, benefitsIconStartDelay);
    }
  }

  ScrollReveal().reveal(`.about__how-step, .uses-cases__description-text`, {
    delay: 130,
    interval: 80,
    origin: "bottom",
    distance: "16px",
  });

  ScrollReveal().reveal(`.consist__notes`, {
    delay: 190,
    interval: 120,
    origin: "left",
    distance: "24px",
    duration: 780,
  });

  ScrollReveal().reveal(`.how-to-use__important`, {
    delay: 180,
    origin: "bottom",
    distance: "24px",
    duration: 780,
    scale: 0.97,
    opacity: 0,
  });

  ScrollReveal().reveal(
    `.products-slider, .blog-section__slider, .uses-cases__description, .consist__cards`,
    {
      delay: 120,
      origin: "bottom",
      distance: "18px",
    },
  );

  ScrollReveal().reveal(
    `.benefits__content, .delivery-payment__card, .consist__list-item`,
    {
      delay: 120,
      interval: 90,
      origin: "bottom",
      distance: "20px",
    },
  );

  ScrollReveal().reveal(
    `.delivery-payment__actions, .footer__info, .footer__contacts, .footer__meta`,
    {
      delay: 140,
      interval: 100,
      origin: "bottom",
      distance: "18px",
    },
  );
}

export default scrollRevealFunc;
