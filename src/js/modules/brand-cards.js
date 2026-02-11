function openBrandCard() {
  document.querySelectorAll('.brand-card').forEach(card => {
    const front = card.querySelector('.card-front');
    const closeBtn = card.querySelector('.close-btn');

    front.addEventListener('click', () => {
      // Открыть текущую карточку, не закрывая другие
      card.classList.add('flipped');
    });

    closeBtn.addEventListener('click', e => {
      e.stopPropagation();
      // Закрытие только по кнопке
      card.classList.remove('flipped');
    });
  });
}

export default openBrandCard;
