function initAboutLeavesParallax() {
  const section = document.querySelector(".about");

  if (!section) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (prefersReducedMotion) {
    return;
  }

  const leaves = Array.from(
    section.querySelectorAll(".about__leaf[data-depth]"),
  );

  if (!leaves.length) {
    return;
  }

  let ticking = false;

  const updateParallax = () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const sectionCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;
    const normalized = Math.max(
      Math.min((sectionCenter - viewportCenter) / viewportHeight, 1),
      -1,
    );

    leaves.forEach((leaf, index) => {
      const depth = Number(leaf.dataset.depth) || 0;
      const direction = index % 2 === 0 ? 1 : -1;
      const shiftY = -normalized * depth * 420;
      const shiftX = normalized * depth * 150 * direction;

      leaf.style.setProperty("--leaf-parallax-x", `${shiftX.toFixed(2)}px`);
      leaf.style.setProperty("--leaf-parallax-y", `${shiftY.toFixed(2)}px`);
    });

    ticking = false;
  };

  const requestTick = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  requestTick();
}

export default initAboutLeavesParallax;
