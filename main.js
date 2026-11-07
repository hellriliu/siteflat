/* Мобильное меню */
const burger = document.querySelector('.burger'), menu = document.getElementById('menu');
function setMenu(open){
  menu.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
}
burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu.classList.contains('open')) {
    setMenu(false);
    burger.focus();
  }
});

/* Появление блоков при прокрутке */
const io = new IntersectionObserver((entries, obs) => {
  entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add('visible'); obs.unobserve(en.target); } });
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* Фильтрация планировок */
const filterButtons = document.querySelectorAll('.filter-button');
const apartmentCards = document.querySelectorAll('.cards .card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach(filterButton => {
      filterButton.setAttribute('aria-pressed', String(filterButton === button));
    });

let shownCount = 0;
    apartmentCards.forEach(card => {
      const matches = filter === 'all' || card.dataset.rooms === filter;
      card.classList.toggle('hidden', !matches);

      if (matches) {
        shownCount++;
        card.classList.add('visible', 'filter-enter');
        void card.offsetWidth;
        card.classList.remove('filter-enter');
      }
    });
    const filterCount = document.getElementById('filter-count');
    if (filterCount) filterCount.textContent = 'Показано планировок: ' + shownCount;
  });
});

/* Форма: маска телефона и клиентская проверка (без отправки на сервер) */
const leadForm = document.getElementById('lead-form');
const nameInput = leadForm.elements.name;
const phoneInput = leadForm.elements.phone;
const formStatus = leadForm.querySelector('.form-status');

function formatPhoneNumber(value) {
  const rawDigits = value.replace(/\D/g, '');
  if (!rawDigits) return '';
  let digits = rawDigits;
  if (digits[0] === '7' || digits[0] === '8') digits = digits.slice(1);
  digits = digits.slice(0, 10);

  let formatted = '+7';
  if (digits.length) formatted += ' (' + digits.slice(0, 3);
  if (digits.length >= 3) formatted += ')';
  if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
  if (digits.length > 6) formatted += '-' + digits.slice(6, 8);
  if (digits.length > 8) formatted += '-' + digits.slice(8, 10);
  return formatted;
}

phoneInput.addEventListener('input', () => {
  const rawDigits = phoneInput.value.replace(/\D/g, '');
  const digitsBeforeCursor = phoneInput.value.slice(0, phoneInput.selectionStart).replace(/\D/g, '');
  const countryCodeEntered = digitsBeforeCursor.length > 0 &&
    (rawDigits.startsWith('7') || rawDigits.startsWith('8'));
  const localDigitsBeforeCursor = digitsBeforeCursor.length - Number(countryCodeEntered);

  phoneInput.value = formatPhoneNumber(phoneInput.value);
  let cursorPosition = 3;
  let localDigitsCount = 0;
  while (cursorPosition < phoneInput.value.length && localDigitsCount < localDigitsBeforeCursor) {
    if (/\d/.test(phoneInput.value[cursorPosition])) localDigitsCount++;
    cursorPosition++;
  }
  phoneInput.setSelectionRange(cursorPosition, cursorPosition);

  if (phoneInput.classList.contains('is-invalid')) {
    const phoneIsValid = phoneInput.value.replace(/\D/g, '').length === 11;
    phoneInput.classList.toggle('is-invalid', !phoneIsValid);
    phoneInput.setAttribute('aria-invalid', String(!phoneIsValid));
  }
  formStatus.textContent = '';
  formStatus.classList.remove('is-error', 'is-success');
});

nameInput.addEventListener('input', () => {
  if (nameInput.classList.contains('is-invalid')) {
    const nameIsValid = nameInput.value.trim().length > 0;
    nameInput.classList.toggle('is-invalid', !nameIsValid);
    nameInput.setAttribute('aria-invalid', String(!nameIsValid));
  }
  formStatus.textContent = '';
  formStatus.classList.remove('is-error', 'is-success');
});

leadForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const phoneIsValid = phoneInput.value.replace(/\D/g, '').length === 11;
  const nameIsValid = name.length > 0;

  nameInput.classList.toggle('is-invalid', !nameIsValid);
  phoneInput.classList.toggle('is-invalid', !phoneIsValid);
  nameInput.setAttribute('aria-invalid', String(!nameIsValid));
  phoneInput.setAttribute('aria-invalid', String(!phoneIsValid));

  if (!nameIsValid || !phoneIsValid) {
    const errors = [];
    if (!nameIsValid) errors.push('укажите имя');
    if (!phoneIsValid) errors.push('введите телефон полностью в формате +7 (XXX) XXX-XX-XX');
    formStatus.classList.remove('is-success');
    formStatus.classList.add('is-error');
    formStatus.textContent = 'Пожалуйста, ' + errors.join(' и ') + '.';
    (!nameIsValid ? nameInput : phoneInput).focus();
    return;
  }

  leadForm.reset();
  nameInput.classList.remove('is-invalid');
  phoneInput.classList.remove('is-invalid');
  nameInput.setAttribute('aria-invalid', 'false');
  phoneInput.setAttribute('aria-invalid', 'false');
  formStatus.classList.remove('is-error');
  formStatus.classList.add('is-success');
  formStatus.textContent = 'Спасибо, ' + name + '! Мы скоро перезвоним.';
});
