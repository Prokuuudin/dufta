function headerScroll() {
  const header = document.getElementById("header");
  if (!header) return;

  window.addEventListener(
    "scroll",
    function() {
      if (window.scrollY > 24) {
        header.classList.add("small");
        header.classList.add("header--elevated");
      } else {
        header.classList.remove("small");
        header.classList.remove("header--elevated");
      }
    },
    { passive: true },
  );
}

export default headerScroll;
