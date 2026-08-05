(function () {
  'use strict';

  const SHIPMENTS_KEY = 'pandaCargo_shipments';
  const THEME_STORAGE_KEY = 'pandaCargo_theme';
  const LANG_STORAGE_KEY = 'pandaCargo_lang';
  const DEVICE_TOKEN_KEY = 'device_token';
  const SETTINGS_KEY = 'pandaCargo_admin_settings';
  const ACCESS_FLAG_KEY = 'access_granted';
  const ACCESS_SECRET = 'pd_sec_8f92k4x1';
  const PRICE_PER_KG = 250;

  /* SHA-256 of warehouse password — plaintext is never stored */
  const PASSWORD_SHA256 = 'e1b3da7873109b1c49fed74139832446750e5b88b4dd096a57745d6858d93d31';

  const SEED_SHIPMENTS = [
    { track: 'CN2026118', clientCode: '126', status: 'arrived',  weightKg: 3.2, priceSom: 800,  updatedAt: '2026-08-03T14:20:00' },
    { track: 'CN2026094', clientCode: '126', status: 'arrived',  weightKg: 1.4, priceSom: 350,  updatedAt: '2026-08-04T09:05:00' },
    { track: 'CN2025871', clientCode: '042', status: 'received', weightKg: 5.0, priceSom: 1250, updatedAt: '2026-07-29T17:40:00' },
    { track: 'CN2026140', clientCode: '088', status: 'arrived',  weightKg: 0.8, priceSom: 200,  updatedAt: '2026-08-04T07:12:00' }
  ];

  /* ============ i18n ============ */

  const I18N = {
    ru: {
      page_title: 'Panda Cargo — Админ',
      aria_lang: 'Сменить язык',
      aria_theme: 'Переключить тему',
      aria_settings: 'Настройки',
      close_aria: 'Закрыть',
      scan_track_aria: 'Сканировать штрих-код трека',
      scan_client_aria: 'Сканировать QR клиента',
      select_all_aria: 'Выбрать все',
      select_row_aria: 'Выбрать посылку',
      admin_badge: 'Админ',
      footer: 'Panda Cargo — склад',
      not_found_title: 'Страница не найдена',
      not_found_text: 'Запрошенная страница не существует или была удалена.',

      stat_total: 'Всего',
      stat_warehouse: 'На складе',
      stat_issued: 'Выдано',
      stat_due: 'К оплате (склад)',
      som: 'сом',
      kg: 'кг',

      receive_title: 'Приём посылок',
      receive_subtitle: 'Сканируйте или введите данные вручную',
      track_label: 'Трек-код',
      track_placeholder: 'CN2026118',
      client_label: 'Код клиента',
      client_placeholder: '126 или PC-126',
      weight_label: 'Вес (кг)',
      weight_placeholder: '3.2',
      price_label: 'Стоимость (сом)',
      price_placeholder: '800',
      rate_hint: '{rate} сом/кг',
      price_formula: '{weight} × {rate} = {price} сом',
      price_formula_empty: 'вес × {rate} = цена',
      add_to_warehouse: 'Добавить на склад',
      added_ok: 'Посылка {track} добавлена на склад',

      all_shipments: 'Все посылки',
      all_shipments_subtitle: 'Поиск, фильтры и выдача',
      quick_issue: 'Быстрая выдача по QR',
      search_placeholder: 'Трек-код или код клиента',
      find: 'Найти',
      filter_all: 'Все',
      filter_warehouse: 'На складе',
      filter_issued: 'Выдано',
      empty_shipments: 'Посылок пока нет',

      col_track: 'Трек-код',
      col_client: 'Код клиента',
      col_weight: 'Вес',
      col_price: 'Стоимость',
      col_date: 'Дата',
      col_status: 'Статус',
      col_action: 'Действие',
      status_arrived: 'На складе',
      status_received: 'Выдано',
      issue_btn: 'Выдать',
      issued_btn: 'Выдано',

      bulk_selected: 'Выбрано: {count}',
      bulk_issue: 'Выдать выбранные',
      bulk_clear: 'Снять',
      toast_bulk_issued: 'Выдано посылок: {count}',
      toast_bulk_none: 'Нет выбранных посылок на складе',

      settings_title: 'Настройки',
      pin_protect: 'Защита PIN-кодом',
      pin_protect_hint: 'Запрашивать PIN при каждом открытии админки',
      pin_label: 'PIN-код (4–8 цифр)',
      settings_save: 'Сохранить',
      settings_saved: 'Настройки сохранены',
      pin_unlock_title: 'Введите PIN',
      pin_unlock_hint: 'Доступ к админ-панели',
      pin_unlock_btn: 'Войти',
      err_pin_format: 'PIN должен быть из 4–8 цифр',
      err_pin_required: 'Укажите PIN, чтобы включить защиту',
      err_pin_wrong: 'Неверный PIN-код',
      device_auth_title: 'Авторизация устройства',
      device_auth_ok: 'Это устройство авторизовано',
      device_reset: 'Сбросить авторизацию устройства',
      device_reset_done: 'Авторизация устройства сброшена',
      device_unlock_title: 'Новое устройство',
      device_unlock_hint: 'Введите пароль склада для авторизации',
      device_password_label: 'Пароль',
      device_unlock_btn: 'Авторизовать',
      err_password_wrong: 'Неверный пароль',
      err_password_empty: 'Введите пароль',
      err_crypto: 'Браузер не поддерживает безопасную проверку пароля',

      scanner_title: 'Сканер',
      scanner_hint_default: 'Наведите камеру на код',
      scanner_hint_track: 'Наведите камеру на штрих-код товара',
      scanner_hint_client: 'Наведите камеру на QR-код клиента',
      scanner_hint_quick: 'Наведите камеру на QR клиента — выдадим все посылки на складе',
      scanner_start_fail: 'Не удалось открыть камеру. Проверьте разрешения.',
      scanner_lib_missing: 'Библиотека сканера не загружена',

      err_track: 'Введите трек-код',
      err_track_exists: 'Посылка с таким трек-кодом уже есть',
      err_client: 'Введите код клиента',
      err_weight: 'Укажите корректный вес',
      err_price: 'Укажите стоимость',
      err_not_found: 'Ничего не найдено',
      err_no_arrived: 'У клиента №{code} нет посылок на складе',
      err_qr_invalid: 'Не удалось распознать QR клиента',

      toast_issued: 'Выдано: {track}',
      toast_quick_issued: 'Клиенту №{code} выдано посылок: {count}',
      toast_scan_track: 'Трек-код считан',
      toast_scan_client: 'Код клиента считан'
    },

    ky: {
      page_title: 'Panda Cargo — Админ',
      aria_lang: 'Тилди алмаштыруу',
      aria_theme: 'Теманы алмаштыруу',
      aria_settings: 'Жөндөөлөр',
      close_aria: 'Жабуу',
      scan_track_aria: 'Трек штрих-кодун скандоо',
      scan_client_aria: 'Кардардын QR скандоо',
      select_all_aria: 'Баарын тандоо',
      select_row_aria: 'Посылканы тандоо',
      admin_badge: 'Админ',
      footer: 'Panda Cargo — склад',
      not_found_title: 'Барак табылган жок',
      not_found_text: 'Суралган барак жок же өчүрүлгөн.',

      stat_total: 'Баары',
      stat_warehouse: 'Складда',
      stat_issued: 'Берилди',
      stat_due: 'Төлөөгө (склад)',
      som: 'сом',
      kg: 'кг',

      receive_title: 'Посылкаларды кабыл алуу',
      receive_subtitle: 'Сканерлеңиз же кол менен киргизиңиз',
      track_label: 'Трек-код',
      track_placeholder: 'CN2026118',
      client_label: 'Кардар коду',
      client_placeholder: '126 же PC-126',
      weight_label: 'Салмак (кг)',
      weight_placeholder: '3.2',
      price_label: 'Баасы (сом)',
      price_placeholder: '800',
      rate_hint: '{rate} сом/кг',
      price_formula: '{weight} × {rate} = {price} сом',
      price_formula_empty: 'салмак × {rate} = баа',
      add_to_warehouse: 'Складга кошуу',
      added_ok: '{track} посылкасы складга кошулду',

      all_shipments: 'Бардык посылкалар',
      all_shipments_subtitle: 'Издөө, чыпкалар жана берүү',
      quick_issue: 'QR менен тез берүү',
      search_placeholder: 'Трек-код же кардар коду',
      find: 'Издөө',
      filter_all: 'Баары',
      filter_warehouse: 'Складда',
      filter_issued: 'Берилди',
      empty_shipments: 'Азырынча посылка жок',

      col_track: 'Трек-код',
      col_client: 'Кардар коду',
      col_weight: 'Салмак',
      col_price: 'Баасы',
      col_date: 'Күнү',
      col_status: 'Статус',
      col_action: 'Аракет',
      status_arrived: 'Складда',
      status_received: 'Берилди',
      issue_btn: 'Берүү',
      issued_btn: 'Берилди',

      bulk_selected: 'Тандалды: {count}',
      bulk_issue: 'Тандалгандарды берүү',
      bulk_clear: 'Алып салуу',
      toast_bulk_issued: 'Берилди: {count}',
      toast_bulk_none: 'Складда тандалган посылка жок',

      settings_title: 'Жөндөөлөр',
      pin_protect: 'PIN-код менен коргоо',
      pin_protect_hint: 'Админди ачканда ар жолу PIN суроо',
      pin_label: 'PIN-код (4–8 сан)',
      settings_save: 'Сактоо',
      settings_saved: 'Жөндөөлөр сакталды',
      pin_unlock_title: 'PIN киргизиңиз',
      pin_unlock_hint: 'Админ панелге кирүү',
      pin_unlock_btn: 'Кирүү',
      err_pin_format: 'PIN 4–8 сандан турушу керек',
      err_pin_required: 'Коргоону күйгүзүү үчүн PIN киргизиңиз',
      err_pin_wrong: 'PIN-код туура эмес',
      device_auth_title: 'Түзмөктү авторизациялоо',
      device_auth_ok: 'Бул түзмөк авторизацияланган',
      device_reset: 'Түзмөк авторизациясын жокко чыгаруу',
      device_reset_done: 'Түзмөк авторизациясы жокко чыгарылды',
      device_unlock_title: 'Жаңы түзмөк',
      device_unlock_hint: 'Авторизация үчүн складдын сырсөзүн киргизиңиз',
      device_password_label: 'Сырсөз',
      device_unlock_btn: 'Авторизациялоо',
      err_password_wrong: 'Сырсөз туура эмес',
      err_password_empty: 'Сырсөздү киргизиңиз',
      err_crypto: 'Браузер коопсуз текшерүүнү колдобойт',

      scanner_title: 'Сканер',
      scanner_hint_default: 'Камераны кодго багыттаңыз',
      scanner_hint_track: 'Камераны товардын штрих-кодуна багыттаңыз',
      scanner_hint_client: 'Камераны кардардын QR кодуна багыттаңыз',
      scanner_hint_quick: 'Кардардын QR кодуна багыттаңыз — складдагы бардык посылкалар берилет',
      scanner_start_fail: 'Камера ачылган жок. Уруксаттарды текшериңиз.',
      scanner_lib_missing: 'Сканер китепканасы жүктөлгөн жок',

      err_track: 'Трек-кодду киргизиңиз',
      err_track_exists: 'Мындай трек-коду бар посылка бар',
      err_client: 'Кардар кодун киргизиңиз',
      err_weight: 'Туура салмакты киргизиңиз',
      err_price: 'Баасын киргизиңиз',
      err_not_found: 'Эч нерсе табылган жок',
      err_no_arrived: '№{code} кардардын складда посылкасы жок',
      err_qr_invalid: 'Кардардын QR коду таанылган жок',

      toast_issued: 'Берилди: {track}',
      toast_quick_issued: '№{code} кардарга берилди: {count}',
      toast_scan_track: 'Трек-код окулду',
      toast_scan_client: 'Кардар коду окулду'
    }
  };

  /* ============ СОСТОЯНИЕ ============ */

  const state = {
    lang: document.documentElement.getAttribute('data-lang') === 'ky' ? 'ky' : 'ru',
    shipments: [],
    activeFilter: 'all',
    searchQuery: '',
    priceManual: false,
    selected: new Set(),
    unlocked: false,
    settings: {
      pinEnabled: false,
      pinHash: ''
    },
    scanner: {
      mode: null,
      instance: null,
      busy: false
    }
  };

  let toastTimer = null;

  /* ============ УТИЛИТЫ ============ */

  function t(key, vars) {
    const dict = I18N[state.lang] || I18N.ru;
    let str = dict[key] ?? I18N.ru[key] ?? key;
    if (vars) {
      Object.keys(vars).forEach(k => {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
      });
    }
    return str;
  }

  function applyI18n() {
    document.documentElement.setAttribute('lang', state.lang);
    document.documentElement.setAttribute('data-lang', state.lang);
    document.title = t('page_title');

    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });

    const langCode = document.getElementById('langBtnCode');
    if (langCode) langCode.textContent = state.lang === 'ru' ? 'KG' : 'RU';

    const rateHint = document.getElementById('rateHint');
    if (rateHint) rateHint.textContent = t('rate_hint', { rate: PRICE_PER_KG });

    const selectAll = document.getElementById('selectAll');
    if (selectAll) selectAll.setAttribute('aria-label', t('select_all_aria'));

    updatePriceFormula();
    renderStats();
    renderTable();
    updateBulkBar();
  }

  function setLang(lang) {
    state.lang = lang === 'ky' ? 'ky' : 'ru';
    localStorage.setItem(LANG_STORAGE_KEY, state.lang);
    applyI18n();
  }

  function toggleLang() {
    setLang(state.lang === 'ru' ? 'ky' : 'ru');
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatSom(amount) {
    const n = Math.round(Number(amount) || 0);
    return n.toLocaleString('ru-RU') + ' ' + t('som');
  }

  function formatDateShort(isoString) {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '—';
    return pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear();
  }

  function normalizeTrack(value) {
    return String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  }

  function normalizeClientCode(value) {
    return String(value || '').trim().replace(/\D/g, '');
  }

  function formatClientLabel(code) {
    const c = normalizeClientCode(code);
    return c ? 'PC-' + c.padStart(Math.max(3, c.length), '0') : '—';
  }

  function calcPrice(weightKg) {
    const w = Number(weightKg);
    if (!w || w <= 0) return 0;
    return Math.round(w * PRICE_PER_KG);
  }

  function formatWeightDisplay(value) {
    const w = Number(value);
    if (!w || w <= 0) return '';
    return String(Math.round(w * 100) / 100);
  }

  function updatePriceFormula() {
    const el = document.getElementById('priceFormula');
    const weightInput = document.getElementById('weightInput');
    if (!el) return;

    const weight = formatWeightDisplay(weightInput?.value);
    if (!weight) {
      el.textContent = t('price_formula_empty', { rate: PRICE_PER_KG });
      el.classList.remove('is-ready');
      return;
    }

    const price = calcPrice(weight);
    el.textContent = t('price_formula', {
      weight,
      rate: PRICE_PER_KG,
      price: price.toLocaleString('ru-RU')
    });
    el.classList.add('is-ready');
  }

  function showMessage(el, message) {
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = message;
  }

  function showToast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 3200);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ============ URL ACCESS GATE ============ */

  function hasUrlAccess() {
    return localStorage.getItem(ACCESS_FLAG_KEY) === '1' ||
      localStorage.getItem(ACCESS_FLAG_KEY) === 'true';
  }

  function grantUrlAccess() {
    localStorage.setItem(ACCESS_FLAG_KEY, '1');
    document.documentElement.setAttribute('data-access', 'granted');
  }

  function cleanSecretFromUrl() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('key')) return;
    params.delete('key');
    const qs = params.toString();
    const cleanUrl = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    if (window.history?.replaceState) {
      window.history.replaceState(null, '', cleanUrl);
    }
  }

  function checkUrlAccessGate() {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('key');

    if (urlKey === ACCESS_SECRET) {
      grantUrlAccess();
      cleanSecretFromUrl();
      return true;
    }

    if (hasUrlAccess()) {
      document.documentElement.setAttribute('data-access', 'granted');
      return true;
    }

    document.documentElement.setAttribute('data-access', 'denied');
    return false;
  }

  function showNotFound() {
    hideApp();
    hideAllGates();
    closeSettings();

    const toast = document.getElementById('toast');
    if (toast) toast.hidden = true;

    const bulk = document.getElementById('bulkBar');
    if (bulk) bulk.hidden = true;

    const notFound = document.getElementById('notFound');
    if (notFound) {
      notFound.hidden = false;
      const title = notFound.querySelector('.not-found__title');
      const text = notFound.querySelector('.not-found__text');
      if (title) title.textContent = t('not_found_title');
      if (text) text.textContent = t('not_found_text');
    }

    document.title = '404 — ' + t('not_found_title');
  }

  function hideNotFound() {
    const notFound = document.getElementById('notFound');
    if (notFound) notFound.hidden = true;
  }

  /* ============ АВТОРИЗАЦИЯ УСТРОЙСТВА + PIN ============ */

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { pinEnabled: false, pinHash: '' };
      const parsed = JSON.parse(raw);
      return {
        pinEnabled: Boolean(parsed.pinEnabled),
        pinHash: String(parsed.pinHash || '')
      };
    } catch (e) {
      return { pinEnabled: false, pinHash: '' };
    }
  }

  function saveSettings(settings) {
    state.settings = {
      pinEnabled: Boolean(settings.pinEnabled),
      pinHash: String(settings.pinHash || '')
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  }

  function isValidPinFormat(pin) {
    return /^\d{4,8}$/.test(String(pin || ''));
  }

  function isPinProtectionOn() {
    return state.settings.pinEnabled && Boolean(state.settings.pinHash);
  }

  function getDeviceToken() {
    return localStorage.getItem(DEVICE_TOKEN_KEY) || '';
  }

  function isDeviceAuthorized() {
    return Boolean(getDeviceToken());
  }

  function createDeviceToken() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }

  function authorizeDevice() {
    localStorage.setItem(DEVICE_TOKEN_KEY, createDeviceToken());
  }

  function resetDeviceAuth() {
    localStorage.removeItem(DEVICE_TOKEN_KEY);
  }

  async function sha256Hex(text) {
    if (!crypto?.subtle?.digest) {
      throw new Error('crypto_unavailable');
    }
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
  }

  async function verifyPassword(password) {
    const hash = await sha256Hex(password);
    return hash === PASSWORD_SHA256;
  }

  async function verifyPin(pin) {
    const hash = await sha256Hex(pin);
    return hash === state.settings.pinHash;
  }

  function showApp() {
    const app = document.getElementById('app');
    if (app) app.hidden = false;
    state.unlocked = true;
  }

  function hideApp() {
    const app = document.getElementById('app');
    if (app) app.hidden = true;
    state.unlocked = false;
  }

  function hideAllGates() {
    hideDeviceAuthGate();
    hidePinGate();
  }

  /** After device is trusted: either ask PIN or open the app */
  function continueAfterDeviceAuth() {
    hideDeviceAuthGate();
    if (isPinProtectionOn()) {
      showPinGate();
    } else {
      hidePinGate();
      showApp();
      refreshUI();
    }
  }

  function showDeviceAuthGate() {
    hideApp();
    hidePinGate();
    closeSettings();
    const overlay = document.getElementById('deviceAuthOverlay');
    if (overlay) overlay.hidden = false;
    const input = document.getElementById('devicePasswordInput');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }
    showMessage(document.getElementById('deviceAuthError'), '');
  }

  function hideDeviceAuthGate() {
    const overlay = document.getElementById('deviceAuthOverlay');
    if (overlay) overlay.hidden = true;
  }

  function showPinGate() {
    hideApp();
    hideDeviceAuthGate();
    closeSettings();
    const overlay = document.getElementById('pinOverlay');
    if (overlay) overlay.hidden = false;
    const input = document.getElementById('pinInput');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }
    showMessage(document.getElementById('pinError'), '');
  }

  function hidePinGate() {
    const overlay = document.getElementById('pinOverlay');
    if (overlay) overlay.hidden = true;
  }

  function openSettings() {
    if (!state.unlocked) return;
    const overlay = document.getElementById('settingsOverlay');
    const toggle = document.getElementById('pinToggle');
    const pinInput = document.getElementById('settingsPinInput');
    const pinBlock = document.getElementById('settingsPinBlock');
    const status = document.getElementById('deviceAuthStatus');

    if (toggle) toggle.checked = state.settings.pinEnabled;
    if (pinInput) pinInput.value = '';
    if (pinBlock) pinBlock.hidden = !state.settings.pinEnabled;
    if (status) status.textContent = t('device_auth_ok');
    showMessage(document.getElementById('settingsError'), '');

    if (overlay) overlay.hidden = false;
  }

  function closeSettings() {
    const overlay = document.getElementById('settingsOverlay');
    if (overlay) overlay.hidden = true;
  }

  function initDeviceAuthUI() {
    document.getElementById('settingsBtn')?.addEventListener('click', openSettings);
    document.getElementById('settingsClose')?.addEventListener('click', closeSettings);

    document.getElementById('settingsOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'settingsOverlay') closeSettings();
    });

    document.getElementById('pinToggle')?.addEventListener('change', (e) => {
      const pinBlock = document.getElementById('settingsPinBlock');
      if (pinBlock) pinBlock.hidden = !e.target.checked;
      if (e.target.checked) {
        document.getElementById('settingsPinInput')?.focus();
      }
    });

    document.getElementById('settingsSaveBtn')?.addEventListener('click', async () => {
      const err = document.getElementById('settingsError');
      const enabled = Boolean(document.getElementById('pinToggle')?.checked);
      const pin = String(document.getElementById('settingsPinInput')?.value || '').trim();

      showMessage(err, '');

      try {
        if (enabled) {
          if (pin) {
            if (!isValidPinFormat(pin)) {
              showMessage(err, t('err_pin_format'));
              return;
            }
            const pinHash = await sha256Hex(pin);
            saveSettings({ pinEnabled: true, pinHash });
          } else if (state.settings.pinHash) {
            saveSettings({ pinEnabled: true, pinHash: state.settings.pinHash });
          } else {
            showMessage(err, t('err_pin_required'));
            return;
          }
        } else {
          saveSettings({
            pinEnabled: false,
            pinHash: state.settings.pinHash
          });
        }

        closeSettings();
        showToast(t('settings_saved'));
      } catch (error) {
        showMessage(err, t('err_crypto'));
      }
    });

    document.getElementById('resetDeviceBtn')?.addEventListener('click', () => {
      resetDeviceAuth();
      closeSettings();
      showToast(t('device_reset_done'));
      showDeviceAuthGate();
    });

    document.getElementById('deviceAuthForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = document.getElementById('devicePasswordInput');
      const err = document.getElementById('deviceAuthError');
      const submitBtn = document.getElementById('deviceAuthSubmit');
      const password = String(input?.value || '');

      showMessage(err, '');

      if (!password) {
        showMessage(err, t('err_password_empty'));
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      try {
        const ok = await verifyPassword(password);
        if (!ok) {
          showMessage(err, t('err_password_wrong'));
          form.classList.remove('is-wrong');
          void form.offsetWidth;
          form.classList.add('is-wrong');
          if (input) {
            input.value = '';
            input.focus();
          }
          return;
        }

        authorizeDevice();
        continueAfterDeviceAuth();
      } catch (error) {
        showMessage(err, t('err_crypto'));
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    document.getElementById('pinForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const input = document.getElementById('pinInput');
      const err = document.getElementById('pinError');
      const pin = String(input?.value || '').trim();

      showMessage(err, '');

      if (!isValidPinFormat(pin)) {
        showMessage(err, t('err_pin_format'));
        return;
      }

      try {
        const ok = await verifyPin(pin);
        if (!ok) {
          showMessage(err, t('err_pin_wrong'));
          form.classList.remove('is-wrong');
          void form.offsetWidth;
          form.classList.add('is-wrong');
          if (input) {
            input.value = '';
            input.focus();
          }
          return;
        }

        hidePinGate();
        showApp();
        refreshUI();
      } catch (error) {
        showMessage(err, t('err_crypto'));
      }
    });
  }

  /* ============ ХРАНИЛИЩЕ ============ */

  function loadShipments() {
    try {
      const raw = localStorage.getItem(SHIPMENTS_KEY);
      if (!raw) {
        localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(SEED_SHIPMENTS));
        return SEED_SHIPMENTS.map(s => ({ ...s }));
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return SEED_SHIPMENTS.map(s => ({ ...s }));
      return parsed.map(normalizeShipment);
    } catch (e) {
      return SEED_SHIPMENTS.map(s => ({ ...s }));
    }
  }

  function normalizeShipment(s) {
    return {
      track: normalizeTrack(s.track),
      clientCode: normalizeClientCode(s.clientCode),
      status: s.status === 'received' ? 'received' : 'arrived',
      weightKg: Number(s.weightKg) || 0,
      priceSom: Math.round(Number(s.priceSom) || 0),
      updatedAt: s.updatedAt || new Date().toISOString()
    };
  }

  function saveShipments() {
    localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(state.shipments));
  }

  /* ============ РЕНДЕР ============ */

  function renderStats() {
    const arrived = state.shipments.filter(s => s.status === 'arrived');
    const received = state.shipments.filter(s => s.status === 'received');
    const due = arrived.reduce((sum, s) => sum + s.priceSom, 0);

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    set('statTotal', String(state.shipments.length));
    set('statWarehouse', String(arrived.length));
    set('statIssued', String(received.length));
    set('statDue', formatSom(due));
  }

  function getFilteredShipments() {
    let list = state.shipments.slice();

    if (state.activeFilter === 'arrived') {
      list = list.filter(s => s.status === 'arrived');
    } else if (state.activeFilter === 'received') {
      list = list.filter(s => s.status === 'received');
    }

    const q = state.searchQuery.trim().toUpperCase();
    if (q) {
      const qCode = normalizeClientCode(q);
      list = list.filter(s => {
        const trackMatch = s.track.includes(q);
        const codeMatch = qCode && s.clientCode.includes(qCode);
        const labelMatch = formatClientLabel(s.clientCode).toUpperCase().includes(q);
        return trackMatch || codeMatch || labelMatch;
      });
    }

    return list.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'arrived' ? -1 : 1;
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
  }

  function pruneSelection() {
    const valid = new Set(state.shipments.map(s => s.track));
    state.selected.forEach(track => {
      if (!valid.has(track)) state.selected.delete(track);
    });
  }

  function updateBulkBar() {
    const bar = document.getElementById('bulkBar');
    const countEl = document.getElementById('bulkCount');
    const count = state.selected.size;

    if (!bar) return;

    if (count === 0) {
      bar.hidden = true;
      return;
    }

    bar.hidden = false;
    if (countEl) countEl.textContent = t('bulk_selected', { count });
  }

  function syncSelectAllCheckbox(list) {
    const selectAll = document.getElementById('selectAll');
    if (!selectAll) return;

    const issuable = list.filter(s => s.status === 'arrived');
    if (issuable.length === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
      selectAll.disabled = true;
      return;
    }

    selectAll.disabled = false;
    const selectedIssuable = issuable.filter(s => state.selected.has(s.track)).length;
    selectAll.checked = selectedIssuable === issuable.length;
    selectAll.indeterminate = selectedIssuable > 0 && selectedIssuable < issuable.length;
  }

  function renderTable() {
    const body = document.getElementById('shipmentsBody');
    const empty = document.getElementById('tableEmpty');
    if (!body) return;

    pruneSelection();
    body.innerHTML = '';
    const list = getFilteredShipments();

    if (list.length === 0) {
      if (empty) {
        empty.hidden = false;
        empty.textContent = t('empty_shipments');
      }
      syncSelectAllCheckbox([]);
      updateBulkBar();
      return;
    }

    if (empty) empty.hidden = true;

    list.forEach((shipment, index) => {
      const tr = document.createElement('tr');
      tr.dataset.track = shipment.track;
      tr.style.animationDelay = (index * 0.04) + 's';

      const canIssue = shipment.status === 'arrived';
      const isSelected = state.selected.has(shipment.track);
      if (isSelected) tr.classList.add('is-selected');

      tr.innerHTML =
        '<td class="td-check"></td>' +
        '<td class="cell-mono">' + escapeHtml(shipment.track) + '</td>' +
        '<td class="cell-mono">' + escapeHtml(formatClientLabel(shipment.clientCode)) + '</td>' +
        '<td class="cell-mono">' + shipment.weightKg + ' ' + t('kg') + '</td>' +
        '<td class="cell-mono">' + formatSom(shipment.priceSom) + '</td>' +
        '<td>' + formatDateShort(shipment.updatedAt) + '</td>' +
        '<td><span class="badge badge--' + shipment.status + '">' +
          (shipment.status === 'received' ? t('status_received') : t('status_arrived')) +
        '</span></td>' +
        '<td></td>';

      const checkTd = tr.children[0];
      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'row-check';
      check.checked = isSelected;
      check.disabled = !canIssue;
      check.setAttribute('aria-label', t('select_row_aria'));
      if (canIssue) {
        check.addEventListener('change', () => {
          if (check.checked) state.selected.add(shipment.track);
          else state.selected.delete(shipment.track);
          tr.classList.toggle('is-selected', check.checked);
          syncSelectAllCheckbox(list);
          updateBulkBar();
        });
      }
      checkTd.appendChild(check);

      const actionTd = tr.lastElementChild;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn--sm btn--issue';
      btn.textContent = canIssue ? t('issue_btn') : t('issued_btn');
      btn.disabled = !canIssue;
      if (canIssue) {
        btn.addEventListener('click', () => issueShipment(shipment.track));
      }
      actionTd.appendChild(btn);

      body.appendChild(tr);
    });

    syncSelectAllCheckbox(list);
    updateBulkBar();
  }

  function refreshUI() {
    renderStats();
    renderTable();
  }

  /* ============ ПРИЁМ / ВЫДАЧА ============ */

  function addShipment(data) {
    const track = normalizeTrack(data.track);
    const clientCode = normalizeClientCode(data.clientCode);
    const weightKg = Number(data.weightKg);
    const priceSom = Math.round(Number(data.priceSom));

    if (!track) return { ok: false, error: t('err_track') };
    if (!clientCode) return { ok: false, error: t('err_client') };
    if (!weightKg || weightKg <= 0) return { ok: false, error: t('err_weight') };
    if (priceSom < 0 || Number.isNaN(priceSom)) return { ok: false, error: t('err_price') };

    if (state.shipments.some(s => s.track === track)) {
      return { ok: false, error: t('err_track_exists') };
    }

    const shipment = {
      track,
      clientCode,
      status: 'arrived',
      weightKg,
      priceSom,
      updatedAt: new Date().toISOString()
    };

    state.shipments.unshift(shipment);
    saveShipments();
    refreshUI();
    return { ok: true, shipment };
  }

  function issueShipment(track) {
    const key = normalizeTrack(track);
    const item = state.shipments.find(s => s.track === key);
    if (!item || item.status === 'received') return false;

    item.status = 'received';
    item.updatedAt = new Date().toISOString();
    state.selected.delete(key);
    saveShipments();
    refreshUI();
    showToast(t('toast_issued', { track: item.track }));
    return true;
  }

  function issueSelected() {
    const tracks = Array.from(state.selected);
    let count = 0;
    const now = new Date().toISOString();

    tracks.forEach(track => {
      const item = state.shipments.find(s => s.track === track);
      if (item && item.status === 'arrived') {
        item.status = 'received';
        item.updatedAt = now;
        count += 1;
      }
    });

    state.selected.clear();

    if (count === 0) {
      showToast(t('toast_bulk_none'));
      refreshUI();
      return;
    }

    saveShipments();
    refreshUI();
    showToast(t('toast_bulk_issued', { count }));
  }

  function clearSelection() {
    state.selected.clear();
    renderTable();
  }

  function issueAllForClient(clientCode) {
    const code = normalizeClientCode(clientCode);
    if (!code) return { ok: false, error: t('err_client') };

    const pending = state.shipments.filter(
      s => s.clientCode === code && s.status === 'arrived'
    );

    if (pending.length === 0) {
      return { ok: false, error: t('err_no_arrived', { code }) };
    }

    const now = new Date().toISOString();
    pending.forEach(s => {
      s.status = 'received';
      s.updatedAt = now;
      state.selected.delete(s.track);
    });

    saveShipments();
    refreshUI();
    showToast(t('toast_quick_issued', { code, count: pending.length }));
    return { ok: true, count: pending.length };
  }

  /* ============ QR / BARCODE ПАРСИНГ ============ */

  function parseClientFromScan(raw) {
    const text = String(raw || '').trim();
    if (!text) return null;

    try {
      const json = JSON.parse(text);
      if (json && (json.client != null || json.clientCode != null || json.clientId != null)) {
        const code = normalizeClientCode(json.client ?? json.clientCode ?? json.clientId);
        return code || null;
      }
    } catch (e) {
      /* not JSON */
    }

    const digits = normalizeClientCode(text);
    if (digits && digits.length >= 1 && digits.length <= 8 && !/[A-Za-z]{2,}/.test(text.replace(/^PC-?/i, ''))) {
      return digits;
    }

    const pcMatch = text.match(/PC[-\s]?(\d{1,8})/i);
    if (pcMatch) return normalizeClientCode(pcMatch[1]);

    return null;
  }

  function parseTrackFromScan(raw) {
    const text = String(raw || '').trim().toUpperCase();
    if (!text) return null;

    try {
      const json = JSON.parse(text);
      if (json && json.track) return normalizeTrack(json.track);
    } catch (e) {
      /* plain barcode */
    }

    const cleaned = text.replace(/\s+/g, '');
    if (/^[A-Z]{1,4}\d{4,}$/.test(cleaned)) return cleaned;
    if (/^[A-Z0-9-]{5,}$/.test(cleaned) && /\d/.test(cleaned)) return cleaned;

    return cleaned.length >= 4 ? cleaned : null;
  }

  /* ============ СКАНЕР ============ */

  function setScannerError(message) {
    const el = document.getElementById('scannerError');
    if (!el) return;
    if (!message) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = message;
  }

  async function stopScanner() {
    const inst = state.scanner.instance;
    state.scanner.instance = null;
    state.scanner.mode = null;
    state.scanner.busy = false;

    if (inst) {
      try {
        if (inst.isScanning) await inst.stop();
      } catch (e) { /* ignore */ }
      try {
        await inst.clear();
      } catch (e) { /* ignore */ }
    }

    const overlay = document.getElementById('scannerOverlay');
    if (overlay) overlay.hidden = true;

    const viewport = document.getElementById('scannerViewport');
    if (viewport) viewport.innerHTML = '';

    setScannerError('');
  }

  async function openScanner(mode) {
    if (typeof Html5Qrcode === 'undefined') {
      showToast(t('scanner_lib_missing'));
      return;
    }

    await stopScanner();

    state.scanner.mode = mode;
    const overlay = document.getElementById('scannerOverlay');
    const hint = document.getElementById('scannerHint');
    const title = document.getElementById('scannerTitle');

    if (overlay) overlay.hidden = false;
    if (title) title.textContent = t('scanner_title');

    const hintKey =
      mode === 'track' ? 'scanner_hint_track' :
      mode === 'client' ? 'scanner_hint_client' :
      mode === 'quick' ? 'scanner_hint_quick' :
      'scanner_hint_default';

    if (hint) hint.textContent = t(hintKey);
    setScannerError('');

    const scanner = new Html5Qrcode('scannerViewport', { verbose: false });
    state.scanner.instance = scanner;

    const config = {
      fps: 10,
      qrbox: function (viewW, viewH) {
        const edge = Math.min(viewW, viewH) * 0.72;
        return { width: Math.max(180, edge), height: Math.max(180, edge) };
      },
      aspectRatio: 1.0
    };

    const onSuccess = async (decodedText) => {
      if (state.scanner.busy) return;
      state.scanner.busy = true;

      try {
        await handleScanResult(mode, decodedText);
      } finally {
        await stopScanner();
      }
    };

    try {
      await scanner.start(
        { facingMode: 'environment' },
        config,
        onSuccess,
        function () { /* ignore frame misses */ }
      );
    } catch (err) {
      console.error(err);
      setScannerError(t('scanner_start_fail'));
      state.scanner.busy = false;
    }
  }

  async function handleScanResult(mode, raw) {
    if (mode === 'track') {
      const track = parseTrackFromScan(raw);
      if (!track) {
        showToast(t('err_not_found'));
        return;
      }
      const input = document.getElementById('trackInput');
      if (input) {
        input.value = track;
        input.focus();
      }
      showToast(t('toast_scan_track'));
      return;
    }

    if (mode === 'client') {
      const code = parseClientFromScan(raw);
      if (!code) {
        showToast(t('err_qr_invalid'));
        return;
      }
      const input = document.getElementById('clientInput');
      if (input) {
        input.value = formatClientLabel(code);
        input.focus();
      }
      showToast(t('toast_scan_client'));
      return;
    }

    if (mode === 'quick') {
      const code = parseClientFromScan(raw);
      if (!code) {
        showToast(t('err_qr_invalid'));
        return;
      }
      const result = issueAllForClient(code);
      if (!result.ok) showToast(result.error);
    }
  }

  /* ============ ФОРМА / СОБЫТИЯ ============ */

  function initReceiveForm() {
    const form = document.getElementById('receiveForm');
    const weightInput = document.getElementById('weightInput');
    const priceInput = document.getElementById('priceInput');
    const errEl = document.getElementById('receiveError');
    const okEl = document.getElementById('receiveSuccess');

    const syncPriceFromWeight = () => {
      updatePriceFormula();
      if (state.priceManual) return;
      const price = calcPrice(weightInput.value);
      if (priceInput) priceInput.value = price > 0 ? String(price) : '';
    };

    weightInput?.addEventListener('input', syncPriceFromWeight);

    priceInput?.addEventListener('input', () => {
      state.priceManual = true;
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      showMessage(errEl, '');
      showMessage(okEl, '');

      const result = addShipment({
        track: document.getElementById('trackInput')?.value,
        clientCode: document.getElementById('clientInput')?.value,
        weightKg: weightInput?.value,
        priceSom: priceInput?.value
      });

      if (!result.ok) {
        showMessage(errEl, result.error);
        return;
      }

      showMessage(okEl, t('added_ok', { track: result.shipment.track }));
      form.reset();
      state.priceManual = false;
      updatePriceFormula();

      const row = document.querySelector(
        '.shipments-table tbody tr[data-track="' + result.shipment.track + '"]'
      );
      if (row) {
        row.classList.add('is-highlight');
        row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => row.classList.remove('is-highlight'), 2400);
      }
    });

    updatePriceFormula();
  }

  function initSearchAndFilters() {
    document.getElementById('searchForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      state.searchQuery = document.getElementById('searchInput')?.value || '';
      renderTable();

      const list = getFilteredShipments();
      if (state.searchQuery.trim() && list.length === 0) {
        showToast(t('err_not_found'));
      } else if (list.length === 1) {
        const row = document.querySelector(
          '.shipments-table tbody tr[data-track="' + list[0].track + '"]'
        );
        if (row) {
          row.classList.add('is-highlight');
          row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          setTimeout(() => row.classList.remove('is-highlight'), 1800);
        }
      }
    });

    document.getElementById('searchInput')?.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTable();
    });

    document.getElementById('filterTabs')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tabs__btn');
      if (!btn) return;
      document.querySelectorAll('.filter-tabs__btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.activeFilter = btn.dataset.filter || 'all';
      renderTable();
    });
  }

  function initBulkActions() {
    document.getElementById('selectAll')?.addEventListener('change', (e) => {
      const list = getFilteredShipments().filter(s => s.status === 'arrived');
      if (e.target.checked) {
        list.forEach(s => state.selected.add(s.track));
      } else {
        list.forEach(s => state.selected.delete(s.track));
      }
      renderTable();
    });

    document.getElementById('bulkIssueBtn')?.addEventListener('click', issueSelected);
    document.getElementById('bulkClearBtn')?.addEventListener('click', clearSelection);
  }

  function initScannerButtons() {
    document.getElementById('scanTrackBtn')?.addEventListener('click', () => openScanner('track'));
    document.getElementById('scanClientBtn')?.addEventListener('click', () => openScanner('client'));
    document.getElementById('quickIssueBtn')?.addEventListener('click', () => openScanner('quick'));
    document.getElementById('scannerClose')?.addEventListener('click', () => stopScanner());

    document.getElementById('scannerOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'scannerOverlay') stopScanner();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (state.scanner.mode) stopScanner();
      else if (!document.getElementById('settingsOverlay')?.hidden) closeSettings();
    });
  }

  function initThemeAndLang() {
    document.getElementById('themeBtn')?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('langBtn')?.addEventListener('click', toggleLang);
  }

  /* ============ СТАРТ ============ */

  function init() {
    state.settings = loadSettings();
    state.shipments = loadShipments();

    if (!checkUrlAccessGate()) {
      applyI18n();
      showNotFound();
      return;
    }

    hideNotFound();
    applyI18n();
    initThemeAndLang();
    initDeviceAuthUI();
    initReceiveForm();
    initSearchAndFilters();
    initBulkActions();
    initScannerButtons();

    if (!isDeviceAuthorized()) {
      hideAllGates();
      showDeviceAuthGate();
      return;
    }

    continueAfterDeviceAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
