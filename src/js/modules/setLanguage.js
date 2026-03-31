import translations from "../../html/data/translations";

function setLanguage() {
  const radioButtons = document.querySelectorAll('input[name="language"]');
  const supportedLanguages = new Set(["ru", "lv", "lt", "ee", "en"]);

  function getBrowserLanguage() {
    const browserLanguages = navigator.languages?.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || "en"];

    for (const language of browserLanguages) {
      const normalizedLanguage = language.toLowerCase().split("-")[0];
      const mappedLanguage =
        normalizedLanguage === "et" ? "ee" : normalizedLanguage;

      if (supportedLanguages.has(mappedLanguage)) {
        return mappedLanguage;
      }
    }

    return "en";
  }

  function getShopUrlByLanguage(language) {
    const shopUrls = {
      en: "https://thomas-shop.eu/en/21-odor-removers",
      lv: "https://thomas-shop.eu/lv/21-odor-removers",
      ee: "https://thomas-shop.eu/et/21-odor-removers",
      lt: "https://thomas-shop.eu/lt/21-odor-removers",
      ru: "https://thomas-shop.eu/ru/21-dlya-udaleniya-zapakhov",
    };

    return shopUrls[language] || shopUrls.en;
  }

  function getBlogUrlByLanguage(language) {
    const blogUrls = {
      en: "https://thomas-shop.eu/en/blog",
      lv: "https://thomas-shop.eu/lv/blog",
      ee: "https://thomas-shop.eu/et/blog",
      lt: "https://thomas-shop.eu/lt/blog",
      ru: "https://thomas-shop.eu/ru/blog",
    };

    return blogUrls[language] || blogUrls.en;
  }

  function getBlogArticle1UrlByLanguage(language) {
    const blogArticle1Urls = {
      en:
        "https://thomas-shop.eu/en/blog/post/cat-urine-smell-why-it-is-so-strong-and-how-to-get-rid-of-it",
      lv:
        "https://thomas-shop.eu/lv/blog/post/ka%C4%B7a-ur%C4%ABna-smaka-k%C4%81p%C4%93c-t%C4%81-ir-tik-sp%C4%93c%C4%ABga-un-k%C4%81-no-t%C4%81s-atbr%C4%ABvoties",
      ee:
        "https://thomas-shop.eu/et/blog/post/kasside-uriini-l%C3%B5hn-miks-see-on-nii-tugev-ja-kuidas-sellest-vabaneda",
      lt:
        "https://thomas-shop.eu/lt/blog/post/kat%C4%97s-%C5%A1lapimo-kvapas-kod%C4%97l-jis-toks-stiprus-ir-kaip-jo-atsikratyti",
      ru:
        "https://thomas-shop.eu/ru/blog/post/%D0%B7%D0%B0%D0%BF%D0%B0%D1%85-%D0%BA%D0%BE%D1%88%D0%B0%D1%87%D1%8C%D0%B5%D0%B9-%D0%BC%D0%BE%D1%87%D0%B8-%D0%BF%D0%BE%D1%87%D0%B5%D0%BC%D1%83-%D0%BE%D0%BD-%D1%82%D0%B0%D0%BA%D0%BE%D0%B9-%D1%81%D0%B8%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9-%D0%B8-%D0%BA%D0%B0%D0%BA-%D0%BE%D1%82-%D0%BD%D0%B5%D0%B3%D0%BE-%D0%B8%D0%B7%D0%B1%D0%B0%D0%B2%D0%B8%D1%82%D1%8C%D1%81%D1%8F",
    };

    return blogArticle1Urls[language] || blogArticle1Urls.en;
  }

  function getBlogArticle2UrlByLanguage(language) {
    const blogArticle2Urls = {
      en:
        "https://thomas-shop.eu/en/blog/post/the-science-of-enzymatic-cleaning-how-enzymes-remove-odors-and-stains",
      lv:
        "https://thomas-shop.eu/lv/blog/post/fermentu-t%C4%ABr%C4%AB%C5%A1anas-zin%C4%81tne-k%C4%81-fermenti-enz%C4%ABmi-no%C5%86em-smakas-un-traipus",
      ee:
        "https://thomas-shop.eu/et/blog/post/ens%C3%BCmaatilise-puhastamise-teadus-kuidas-ens%C3%BC%C3%BCmid-eemaldavad-l%C3%B5hnu-ja-plekke",
      lt:
        "https://thomas-shop.eu/lt/blog/post/fermentinis-valymas-kaip-fermentai-pa%C5%A1alina-kvapus-ir-d%C4%97mes",
      ru:
        "https://thomas-shop.eu/ru/blog/post/%D0%BD%D0%B0%D1%83%D0%BA%D0%B0-%D1%84%D0%B5%D1%80%D0%BC%D0%B5%D0%BD%D1%82%D0%BD%D0%BE%D0%B9-%D0%BE%D1%87%D0%B8%D1%81%D1%82%D0%BA%D0%B8-%D0%BA%D0%B0%D0%BA-%D1%8D%D0%BD%D0%B7%D0%B8%D0%BC%D1%8B-%D1%83%D0%B4%D0%B0%D0%BB%D1%8F%D1%8E%D1%82-%D0%B7%D0%B0%D0%BF%D0%B0%D1%85%D0%B8-%D0%B8-%D0%BF%D1%8F%D1%82%D0%BD%D0%B0",
    };

    return blogArticle2Urls[language] || blogArticle2Urls.en;
  }

  function getBlogArticle3UrlByLanguage(language) {
    const blogArticle3Urls = {
      en:
        "https://thomas-shop.eu/en/blog/post/odors-in-a-mattress-why-they-appear-and-how-to-remove-them",
      lv:
        "https://thomas-shop.eu/lv/blog/post/smakas-matrac%C4%AB-k%C4%81p%C4%93c-t%C4%81s-par%C4%81d%C4%81s-un-k%C4%81-t%C4%81s-no%C5%86emt",
      ee:
        "https://thomas-shop.eu/et/blog/post/l%C3%B5hnad-madratsis-miks-need-tekivad-ja-kuidas-neid-eemaldada",
      lt:
        "https://thomas-shop.eu/lt/blog/post/kvapai-%C4%8Diu%C5%BEinyje-kod%C4%97l-jie-atsiranda-ir-kaip-juos-pa%C5%A1alinti",
      ru:
        "https://thomas-shop.eu/ru/blog/post/%D0%B7%D0%B0%D0%BF%D0%B0%D1%85%D0%B8-%D0%B2-%D0%BC%D0%B0%D1%82%D1%80%D0%B0%D1%81%D0%B5-%D0%BF%D0%BE%D1%87%D0%B5%D0%BC%D1%83-%D0%BE%D0%BD%D0%B8-%D0%BF%D0%BE%D1%8F%D0%B2%D0%BB%D1%8F%D1%8E%D1%82%D1%81%D1%8F-%D0%B8-%D0%BA%D0%B0%D0%BA-%D0%B8%D1%85-%D1%83%D0%B4%D0%B0%D0%BB%D0%B8%D1%82%D1%8C",
    };

    return blogArticle3Urls[language] || blogArticle3Urls.en;
  }

  function getAgreementPolicyUrlByLanguage(language) {
    const agreementPolicyUrls = {
      en: "https://thomas-shop.eu/en/content/12-privacy-policy",
      lv: "https://thomas-shop.eu/lv/content/12-privatuma-politika",
      lt: "https://thomas-shop.eu/lt/content/12-privatumo-politika",
      ee: "https://thomas-shop.eu/et/content/12-privaatsuspoliitika",
      ru: "https://thomas-shop.eu/ru/content/12-politika-konfidencialnosti",
    };

    return agreementPolicyUrls[language] || agreementPolicyUrls.en;
  }

  function getProduct1UrlByLanguage(language) {
    const product1Urls = {
      en:
        "https://thomas-shop.eu/en/odor-removers/96-duftafresh-500-ml-odor-remover.html",
      lv:
        "https://thomas-shop.eu/lv/odor-removers/96-duftafresh-500-ml-smaku-noņemšanas-līdzeklis.html",
      ee:
        "https://thomas-shop.eu/et/odor-removers/96-duftafresh-500-ml-lõhnade-eemaldaja.html",
      lt:
        "https://thomas-shop.eu/lt/odor-removers/96-duftafresh-500-ml-kvapų-šalinimo-priemonė.html",
      ru:
        "https://thomas-shop.eu/ru/dlya-udaleniya-zapakhov/96-duftafresh-500-ml-удалитель-запаха.html",
    };

    return product1Urls[language] || product1Urls.en;
  }

  function getProduct2UrlByLanguage(language) {
    const product2Urls = {
      en:
        "https://thomas-shop.eu/en/odor-removers/100-duftafresh-1l-odor-remover.html",
      lv:
        "https://thomas-shop.eu/lv/odor-removers/100-duftafresh-1l-smaku-noņemšanas-līdzeklis.html",
      ee:
        "https://thomas-shop.eu/et/odor-removers/100-duftafresh-500-ml-odor-remover.html",
      lt:
        "https://thomas-shop.eu/lt/odor-removers/100-duftafresh-1l-kvapų-šalinimo-priemonė.html",
      ru:
        "https://thomas-shop.eu/ru/dlya-udaleniya-zapakhov/100-duftafresh-1л-удалитель-запаха.html",
    };

    return product2Urls[language] || product2Urls.en;
  }

  function getProduct3UrlByLanguage(language) {
    const product3Urls = {
      en:
        "https://thomas-shop.eu/en/odor-removers/97-duftapet-500-ml-pet-odor-remover.html",
      lv:
        "https://thomas-shop.eu/lv/odor-removers/97-duftapet-500-ml-dzīvnieku-smaku-noņēmējs.html",
      ee:
        "https://thomas-shop.eu/et/odor-removers/97-duftapet-500-ml-loomade-lõhnade-eemaldaja.html",
      lt:
        "https://thomas-shop.eu/lt/odor-removers/97-duftapet-500-ml-gyvūnų-kvapų-šalintojas.html",
      ru:
        "https://thomas-shop.eu/ru/dlya-udaleniya-zapakhov/97-duftapet-500-ml-удалитель-запахов-животных.html",
    };

    return product3Urls[language] || product3Urls.en;
  }

  function getProduct4UrlByLanguage(language) {
    const product4Urls = {
      en:
        "https://thomas-shop.eu/en/odor-removers/101-duftapet-1l-pet-odor-remover.html",
      lv:
        "https://thomas-shop.eu/lv/odor-removers/101-duftapet-1l-dzīvnieku-smaku-noņēmējs.html",
      ee:
        "https://thomas-shop.eu/et/odor-removers/101-duftapet-1l-loomade-lõhnade-eemaldaja-st.html",
      lt:
        "https://thomas-shop.eu/lt/odor-removers/101-duftapet-1l-gyvūnų-kvapų-šalintojas.html",
      ru:
        "https://thomas-shop.eu/ru/dlya-udaleniya-zapakhov/101-duftapet-1л-удалитель-запахов-животных.html",
    };

    return product4Urls[language] || product4Urls.en;
  }

  function getProduct5UrlByLanguage(language) {
    const product5Urls = {
      en:
        "https://thomas-shop.eu/en/odor-removers/188-duftafresh-odor-remover-500-ml-1l-refill-set.html",
      lv:
        "https://thomas-shop.eu/lv/odor-removers/188-duftafresh-smaku-noņemšanas-līdzeklis-500-ml-1l-komplekts.html",
      ee:
        "https://thomas-shop.eu/et/odor-removers/188-duftafresh-lõhnade-eemaldaja-500-ml-1l-komplekt.html",
      lt:
        "https://thomas-shop.eu/lt/odor-removers/188-duftafresh-kvapų-šalinimo-priemonė-500-ml-1l-rinkinys.html",
      ru:
        "https://thomas-shop.eu/ru/dlya-udaleniya-zapakhov/188-duftafresh-удалитель-запаха-500-ml-1-л-комплект.html",
    };

    return product5Urls[language] || product5Urls.en;
  }

  function getProduct6UrlByLanguage(language) {
    const product6Urls = {
      en:
        "https://thomas-shop.eu/en/odor-removers/189-duftapet-pet-odor-remover-500-ml-1l-refill-set.html",
      lv:
        "https://thomas-shop.eu/lv/odor-removers/189-duftapet-dzīvnieku-smaku-noņēmējs-500-ml-1l-komplekts.html",
      ee:
        "https://thomas-shop.eu/et/odor-removers/189-duftapet-loomade-lõhnade-eemaldaja-500-ml-1l-komplekt.html",
      lt:
        "https://thomas-shop.eu/lt/odor-removers/189-duftapet-gyvūnų-kvapų-šalintojas-500-ml-1l-rinkinys.html",
      ru:
        "https://thomas-shop.eu/ru/dlya-udaleniya-zapakhov/189-duftapet-удалитель-запахов-животных-500мл-1л-комплект.html",
    };

    return product6Urls[language] || product6Urls.en;
  }

  // Функция для обновления текстовых элементов
  function updateLanguage(language) {
    // Обновление текста для элементов с data-key
    document.querySelectorAll("[data-key]").forEach((el) => {
      const key = el.getAttribute("data-key");
      if (translations[language][key]) {
        el.textContent = translations[language][key];
      }
    });

    // Обновление плейсхолдеров для элементов с data-placeholder-key
    document.querySelectorAll("[data-placeholder-key]").forEach((el) => {
      const key = el.getAttribute("data-placeholder-key");
      if (translations[language][key]) {
        el.setAttribute("placeholder", translations[language][key]);
      }
    });

    // Обновление метатегов description и keywords
    const metaDesc = document.querySelector('meta[name="description"]');
    const metaKeywords = document.querySelector('meta[name="keywords"]');

    if (metaDesc && translations[language]["desc-content"]) {
      metaDesc.setAttribute("content", translations[language]["desc-content"]);
    }
    if (metaKeywords && translations[language]["keywords-content"]) {
      metaKeywords.setAttribute(
        "content",
        translations[language]["keywords-content"],
      );
    }

    const shopUrl = getShopUrlByLanguage(language);
    document
      .querySelectorAll(
        '[data-key="nav-shop"], [data-key="mobile-nav-shop"], [data-key="about-shop-link"], [data-key="delivery-payment-link"], [data-key="products-link"]',
      )
      .forEach((shopLink) => {
        shopLink.setAttribute("href", shopUrl);
      });

    const blogUrl = getBlogUrlByLanguage(language);
    const blogLink = document.querySelector("#blog-link-btn");
    if (blogLink) {
      blogLink.setAttribute("href", blogUrl);
    }

    const blogArticle1Url = getBlogArticle1UrlByLanguage(language);
    document
      .querySelectorAll('[data-blog-article-link="1"]')
      .forEach((blogArticle1Link) => {
        blogArticle1Link.setAttribute("href", blogArticle1Url);
      });

    const blogArticle2Url = getBlogArticle2UrlByLanguage(language);
    document
      .querySelectorAll('[data-blog-article-link="2"]')
      .forEach((blogArticle2Link) => {
        blogArticle2Link.setAttribute("href", blogArticle2Url);
      });

    const blogArticle3Url = getBlogArticle3UrlByLanguage(language);
    document
      .querySelectorAll('[data-blog-article-link="3"]')
      .forEach((blogArticle3Link) => {
        blogArticle3Link.setAttribute("href", blogArticle3Url);
      });

    const agreementPolicyUrl = getAgreementPolicyUrlByLanguage(language);
    const agreementLink = document.querySelector('[data-key="agreement-link"]');
    if (agreementLink) {
      agreementLink.setAttribute("href", agreementPolicyUrl);
    }

    const product1Url = getProduct1UrlByLanguage(language);
    const product1Link = document.querySelector('[data-key="product-1-link"]');
    if (product1Link) {
      product1Link.setAttribute("href", product1Url);
    }

    const product2Url = getProduct2UrlByLanguage(language);
    const product2Link = document.querySelector('[data-key="product-2-link"]');
    if (product2Link) {
      product2Link.setAttribute("href", product2Url);
    }

    const product3Url = getProduct3UrlByLanguage(language);
    const product3Link = document.querySelector('[data-key="product-3-link"]');
    if (product3Link) {
      product3Link.setAttribute("href", product3Url);
    }

    const product4Url = getProduct4UrlByLanguage(language);
    const product4Link = document.querySelector('[data-key="product-4-link"]');
    if (product4Link) {
      product4Link.setAttribute("href", product4Url);
    }

    const product5Url = getProduct5UrlByLanguage(language);
    const product5Link = document.querySelector('[data-key="product-5-link"]');
    if (product5Link) {
      product5Link.setAttribute("href", product5Url);
    }

    const product6Url = getProduct6UrlByLanguage(language);
    const product6Link = document.querySelector('[data-key="product-6-link"]');
    if (product6Link) {
      product6Link.setAttribute("href", product6Url);
    }

    // Сохранение выбранного языка в localStorage
    localStorage.setItem("selectedLanguage", language);

    // Обновление URL
    const url = new URL(window.location);
    url.searchParams.set("lang", language);
    window.history.replaceState(null, "", url);

    window.dispatchEvent(
      new CustomEvent("language:updated", {
        detail: { language },
      }),
    );
  }

  // Инициализация языка при загрузке страницы
  function initializeLanguage() {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    const initialLanguage = savedLanguage || getBrowserLanguage();

    // Установка радиокнопки
    const initialRadio = document.querySelector(
      `input[name="language"][value="${initialLanguage}"]`,
    );
    if (initialRadio) {
      initialRadio.checked = true;
    }

    // Обновление языка
    updateLanguage(initialLanguage);
  }

  // Обработчики переключения языка
  radioButtons.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      if (event.target.checked) {
        updateLanguage(event.target.value);
      }
    });
  });

  // Запуск инициализации
  initializeLanguage();
}

export default setLanguage;
