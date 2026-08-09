(function () {
  'use strict';

  const THEME_STORAGE_KEY = 'pandaCargo_theme';
  const LANG_STORAGE_KEY = 'pandaCargo_lang';
  const DEVICE_TOKEN_KEY = 'device_token';
  const SETTINGS_KEY = 'pandaCargo_admin_settings';
  const ACCESS_FLAG_KEY = 'access_granted';
  const ACCESS_SECRET = 'pd_sec_8f92k4x1';
  const PRICE_PER_KG = 260;
  const STORAGE_FREE_DAYS = 5;
  const STORAGE_FEE_PER_DAY = 10;
  /** Код страны для WhatsApp (Кыргызстан) */
  const PHONE_COUNTRY_CODE = '996';

  /* SHA-256 of warehouse password — plaintext is never stored */
  const PASSWORD_SHA256 = 'e1b3da7873109b1c49fed74139832446750e5b88b4dd096a57745d6858d93d31';

  const db = window.PandaSupabase.createClient();
  const STATUS_READY = window.PandaSupabase.STATUS_READY;
  const STATUS_ISSUED = window.PandaSupabase.STATUS_ISSUED;
  const STATUS_DELIVERED = window.PandaSupabase.STATUS_DELIVERED || 'delivered';

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
      track_multi_hint: 'Enter — следующее поле · Del — удалить · ☐ — трек нечитаемый',
      client_label: 'Код клиента',
      client_placeholder: '126 или PC-126',
      client_parcels_btn: 'Посылки',
      client_parcels_title: 'Посылки клиента',
      client_parcels_empty: 'У клиента нет посылок',
      track_blind_aria: 'Трек нечитаемый',
      added_ok_multi: 'Добавлено на склад: {count}',
      err_tracks: 'Укажите хотя бы один трек-код',
      err_track_blind: 'Отметьте ☐ или введите трек',
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
      search_placeholder: 'QR, 6-значный код или трек',
      find: 'Найти',
      filter_all: 'Все',
      filter_warehouse: 'На складе',
      filter_issued: 'Выдано',
      empty_shipments: 'Посылок пока нет',

      voice_found: 'Товаров {count} на сумму {sum} сом.',
      voice_not_found: 'Посылок не найдено.',
      toast_pickup_found: 'Клиент №{code}: {count} шт. на {sum} сом',
      toast_pickup_none: 'Посылок не найдено',
      err_pickup_code: 'Код выдачи не распознан',

      col_track: 'Трек-код',
      col_client: 'Код клиента',
      col_weight: 'Вес',
      col_price: 'Стоимость',
      col_storage: 'Хранение',
      col_date: 'Дата',
      col_status: 'Статус',
      col_action: 'Действие',
      status_arrived: 'На складе',
      status_received: 'Выдано',
      issue_btn: 'Выдать',
      issued_btn: 'Выдано',
      storage_free: 'без пени',
      storage_fee: '+{fee} сом ({days} дн.)',
      storage_days_overdue: '{days} дн. просрочки',

      nav_ops: 'Приёмка и выдача',
      nav_clients: 'Клиенты',
      nav_cash: 'Касса за день',
      nav_report: 'Отчёт за месяц',

      clients_title: 'Клиенты',
      clients_subtitle: 'Список клиентов и быстрый переход в WhatsApp',
      clients_empty: 'Клиентов пока нет',
      col_client_code: 'Персональный код',
      col_client_name: 'ФИО / Email',
      col_client_phone: 'Телефон',
      col_client_registered: 'Регистрация',
      wa_btn: 'WhatsApp',
      no_phone: 'Нет номера',

      cash_title: 'Касса за день',
      cash_subtitle: 'Аналитика выдачи с 00:00 до текущего момента',
      cash_issued_count: 'Выдано посылок',
      cash_total: 'Итого касса',
      cash_delivery: 'За доставку',
      cash_storage: 'За хранение',
      cash_date: 'Сегодня, {date}',

      issue_title: 'Выдача посылок',
      issue_selected: 'Выбрано',
      issue_pay: 'К оплате',
      issue_select_all: 'Выбрать все',
      issue_confirm: 'Выдать выбранные',
      issue_client: 'Клиент {code}',
      bulk_sum: 'К оплате: {sum}',

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
      scanner_hint_quick: 'Наведите камеру на QR клиента — откроется окно выдачи',
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
      toast_scan_client: 'Код клиента считан',

      report_title: 'Отчёт за месяц',
      report_subtitle: 'Сводка по приёму, выдаче и выручке',
      report_accepted: 'Принято',
      report_issued: 'Выдано',
      report_weight: 'Вес',
      report_revenue: 'Выручка',
      report_clients: 'Клиенты',
      report_avg: 'Средний чек',
      report_empty: 'Нет данных за этот месяц',
      month_prev_aria: 'Предыдущий месяц',
      month_next_aria: 'Следующий месяц'
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
      track_multi_hint: 'Enter — кийинки талаа · Del — өчүрүү · ☐ — трек окулбайт',
      client_label: 'Кардар коду',
      client_placeholder: '126 же PC-126',
      client_parcels_btn: 'Посылкалар',
      client_parcels_title: 'Кардардын посылкалары',
      client_parcels_empty: 'Кардардын посылкасы жок',
      track_blind_aria: 'Трек окулбайт',
      added_ok_multi: 'Складга кошулду: {count}',
      err_tracks: 'Жок дегенде бир трек-код жазыңыз',
      err_track_blind: '☐ белгилеңиз же трек жазыңыз',
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
      search_placeholder: 'QR, 6 орундуу код же трек',
      find: 'Издөө',
      filter_all: 'Баары',
      filter_warehouse: 'Складда',
      filter_issued: 'Берилди',
      empty_shipments: 'Азырынча посылка жок',

      voice_found: 'Товарлар {count}, суммасы {sum} сом.',
      voice_not_found: 'Посылка табылган жок.',
      toast_pickup_found: '№{code} кардар: {count} дана, {sum} сом',
      toast_pickup_none: 'Посылка табылган жок',
      err_pickup_code: 'Берүү коду таанылган жок',

      col_track: 'Трек-код',
      col_client: 'Кардар коду',
      col_weight: 'Салмак',
      col_price: 'Баасы',
      col_storage: 'Сактоо',
      col_date: 'Күнү',
      col_status: 'Статус',
      col_action: 'Аракет',
      status_arrived: 'Складда',
      status_received: 'Берилди',
      issue_btn: 'Берүү',
      issued_btn: 'Берилди',
      storage_free: 'айыпсыз',
      storage_fee: '+{fee} сом ({days} күн)',
      storage_days_overdue: '{days} күн кечигүү',

      nav_ops: 'Кабыл алуу жана берүү',
      nav_clients: 'Кардарлар',
      nav_cash: 'Күндүк касса',
      nav_report: 'Айлык отчет',

      clients_title: 'Кардарлар',
      clients_subtitle: 'Тизме жана WhatsApp',
      clients_empty: 'Азырынча кардар жок',
      col_client_code: 'Жеке код',
      col_client_name: 'Аты-жөнү / Email',
      col_client_phone: 'Телефон',
      col_client_registered: 'Каттоо',
      wa_btn: 'WhatsApp',
      no_phone: 'Номер жок',

      cash_title: 'Күндүк касса',
      cash_subtitle: 'Берүү аналитикасы 00:00дан азыркы учукка чейин',
      cash_issued_count: 'Берилген посылкалар',
      cash_total: 'Жалпы касса',
      cash_delivery: 'Жеткирүү үчүн',
      cash_storage: 'Сактоо үчүн',
      cash_date: 'Бүгүн, {date}',

      issue_title: 'Посылкаларды берүү',
      issue_selected: 'Тандалды',
      issue_pay: 'Төлөөгө',
      issue_select_all: 'Баарын тандоо',
      issue_confirm: 'Тандалгандарды берүү',
      issue_client: 'Кардар {code}',
      bulk_sum: 'Төлөөгө: {sum}',

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
      scanner_hint_quick: 'Кардардын QR кодуна багыттаңыз — берүү терезеси ачылат',
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
      toast_scan_client: 'Кардар коду окулду',

      report_title: 'Айлык отчет',
      report_subtitle: 'Кабыл алуу, берүү жана киреше боюнча жыйынтык',
      report_accepted: 'Кабыл алынды',
      report_issued: 'Берилди',
      report_weight: 'Салмак',
      report_revenue: 'Киреше',
      report_clients: 'Кардарлар',
      report_avg: 'Орточо чек',
      report_empty: 'Бул айда маалымат жок',
      month_prev_aria: 'Мурунку ай',
      month_next_aria: 'Кийинки ай'
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
    reportYear: new Date().getFullYear(),
    reportMonth: new Date().getMonth(),
    settings: {
      pinEnabled: false,
      pinHash: ''
    },
    scanner: {
      mode: null,
      instance: null,
      busy: false
    },
    scannerFocus: 'track',
    clientsCache: [],
    clientsCacheAt: 0,
    activeSection: 'ops',
    issueModal: {
      open: false,
      clientCode: '',
      tracks: [],
      selected: new Set(),
      speakOnChange: true,
      busy: false
    },
    clientParcelsModal: {
      open: false,
      clientCode: '',
      userId: '',
      filter: 'all',
      selected: new Set(),
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
    renderReport();
    renderClients();
    renderCashDay();
    updateBulkBar();
    if (state.issueModal.open) renderIssueModalSummary();
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

  function startOfLocalDay(date) {
    const d = date instanceof Date ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function calendarDaysBetween(fromIso, toDate) {
    const start = startOfLocalDay(fromIso);
    const end = startOfLocalDay(toDate || new Date());
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
    return Math.max(0, Math.round((end - start) / 86400000));
  }

  /** Пеня за хранение: с 6-го дня на складе +10 сом/день */
  function calcStorageFee(fromIso, toDate) {
    const days = calendarDaysBetween(fromIso, toDate);
    const overdue = Math.max(0, days - STORAGE_FREE_DAYS);
    return overdue * STORAGE_FEE_PER_DAY;
  }

  function getShipmentAsOf(shipment) {
    if (shipment && shipment.status === 'received') {
      if (shipment.deliveredAt) return new Date(shipment.deliveredAt);
      if (shipment.updatedAt) return new Date(shipment.updatedAt);
    }
    return new Date();
  }

  /** Плата за хранение: приоритет — поле storage_fee из БД */
  function getShipmentStorageFee(shipment, asOfDate) {
    if (shipment && shipment.storageFee != null && !Number.isNaN(Number(shipment.storageFee))) {
      return Math.max(0, Math.round(Number(shipment.storageFee) || 0));
    }
    const asOf = asOfDate || getShipmentAsOf(shipment);
    return calcStorageFee(shipment.createdAt || shipment.updatedAt, asOf);
  }

  function getShipmentDelivery(shipment) {
    return Math.round(Number(shipment.priceSom) || 0);
  }

  function getShipmentTotalDue(shipment, asOfDate) {
    return getShipmentDelivery(shipment) + getShipmentStorageFee(shipment, asOfDate);
  }

  function summarizeParcels(parcels, asOfDate) {
    const list = Array.isArray(parcels) ? parcels : [];
    let delivery = 0;
    let storage = 0;
    list.forEach(s => {
      delivery += getShipmentDelivery(s);
      storage += getShipmentStorageFee(s, asOfDate);
    });
    return {
      count: list.length,
      delivery: delivery,
      storage: storage,
      total: delivery + storage,
      overdueDaysTotal: list.reduce((acc, s) => {
        const days = calendarDaysBetween(s.createdAt || s.updatedAt, asOfDate || getShipmentAsOf(s));
        return acc + Math.max(0, days - STORAGE_FREE_DAYS);
      }, 0)
    };
  }

  function formatStorageLabel(shipment, asOfDate) {
    const fee = getShipmentStorageFee(shipment, asOfDate);
    if (fee <= 0) return t('storage_free');

    // Если fee из БД — показываем сумму без пересчёта дней (дней может не быть)
    if (shipment && shipment.storageFee != null) {
      return '+' + fee + ' ' + t('som');
    }

    const days = calendarDaysBetween(shipment.createdAt || shipment.updatedAt, asOfDate || getShipmentAsOf(shipment));
    const overdue = Math.max(0, days - STORAGE_FREE_DAYS);
    return t('storage_fee', { fee: fee, days: overdue });
  }

  function normalizePhoneDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function toWhatsAppNumber(phone) {
    let digits = normalizePhoneDigits(phone);
    if (!digits) return '';

    if (digits.startsWith('00')) digits = digits.slice(2);

    // Локальный формат KG: 0XXXXXXXXX → 996XXXXXXXXX
    if (digits.length === 10 && digits.startsWith('0')) {
      digits = PHONE_COUNTRY_CODE + digits.slice(1);
    } else if (digits.length === 9) {
      digits = PHONE_COUNTRY_CODE + digits;
    } else if (digits.length === 12 && digits.startsWith('996')) {
      /* already ok */
    }

    if (digits.length < 10) return '';
    return digits;
  }

  function whatsappUrl(phone) {
    const n = toWhatsAppNumber(phone);
    return n ? 'https://wa.me/' + n : '';
  }

  function formatPhoneDisplay(phone) {
    const n = toWhatsAppNumber(phone);
    if (!n) return String(phone || '').trim() || '—';
    if (n.startsWith(PHONE_COUNTRY_CODE) && n.length === 12) {
      return '+' + PHONE_COUNTRY_CODE + ' ' + n.slice(3, 6) + ' ' + n.slice(6, 9) + ' ' + n.slice(9);
    }
    return '+' + n;
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

  function showToast(message, durationMs) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, typeof durationMs === 'number' ? durationMs : 3200);
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
  async function continueAfterDeviceAuth() {
    hideDeviceAuthGate();
    if (isPinProtectionOn()) {
      showPinGate();
      return;
    }
    hidePinGate();
    showApp();
    await reloadShipments();
    loadClientsCache(true).catch(() => {});
    setScannerFocusTarget('track');
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
        await continueAfterDeviceAuth();
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
        await reloadShipments();
        loadClientsCache(true).catch(() => {});
        setScannerFocusTarget('track');
      } catch (error) {
        showMessage(err, t('err_crypto'));
      }
    });
  }

  /* ============ ХРАНИЛИЩЕ (Supabase parcels) ============ */

  function loadShipments() {
    return fetchParcels();
  }

  async function fetchParcels() {
    let { data, error } = await db
      .from('parcels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error && /created_at/i.test(error.message || '')) {
      const retry = await db.from('parcels').select('*');
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error(error);
      showToast(error.message || 'Supabase error');
      return [];
    }

    return (data || []).map(window.PandaSupabase.mapParcelFromDb).filter(Boolean);
  }

  function normalizeShipment(s) {
    return window.PandaSupabase.mapParcelFromDb({
      id: s.id,
      track_number: s.track,
      client_code: s.clientCode,
      user_id: s.userId,
      status: s.status === 'received' ? STATUS_DELIVERED : STATUS_READY,
      weight: s.weightKg,
      price: s.priceSom,
      storage_fee: s.storageFee,
      created_at: s.createdAt,
      updated_at: s.updatedAt,
      delivered_at: s.deliveredAt
    });
  }

  async function reloadShipments() {
    state.shipments = await fetchParcels();
    refreshUI();
  }

  /* ============ РЕНДЕР ============ */

  function renderStats() {
    const arrived = state.shipments.filter(s => s.status === 'arrived');
    const received = state.shipments.filter(s => s.status === 'received');
    const due = arrived.reduce((sum, s) => sum + getShipmentTotalDue(s), 0);

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
        const userMatch = s.userId && s.userId.toUpperCase().includes(q);
        return trackMatch || codeMatch || labelMatch || userMatch;
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
    const sumEl = document.getElementById('bulkSum');
    const count = state.selected.size;

    if (!bar) return;

    // Скрываем нижнюю панель, пока открыто окно выдачи
    if (count === 0 || state.issueModal.open) {
      bar.hidden = true;
      return;
    }

    const selectedParcels = state.shipments.filter(
      s => state.selected.has(s.track) && s.status === 'arrived'
    );
    const totals = summarizeParcels(selectedParcels);

    bar.hidden = false;
    if (countEl) countEl.textContent = t('bulk_selected', { count });
    if (sumEl) sumEl.textContent = t('bulk_sum', { sum: formatSom(totals.total) });
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

      const storageFee = getShipmentStorageFee(shipment);
      const totalDue = getShipmentTotalDue(shipment);

      tr.innerHTML =
        '<td class="td-check"></td>' +
        '<td class="cell-mono">' + escapeHtml(shipment.track) + '</td>' +
        '<td class="cell-mono">' + escapeHtml(formatClientLabel(shipment.clientCode)) + '</td>' +
        '<td class="cell-mono">' + shipment.weightKg + ' ' + t('kg') + '</td>' +
        '<td class="cell-mono"><div class="price-stack">' +
          '<span>' + formatSom(shipment.priceSom) + '</span>' +
          (canIssue && storageFee > 0
            ? '<span class="price-stack__total">' + formatSom(totalDue) + '</span>'
            : '') +
        '</div></td>' +
        '<td><span class="storage-fee' + (storageFee > 0 ? '' : ' storage-fee--zero') + '">' +
          escapeHtml(formatStorageLabel(shipment)) +
        '</span></td>' +
        '<td>' + formatDateShort(shipment.createdAt || shipment.updatedAt) + '</td>' +
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
        btn.addEventListener('click', () => {
          openIssueModal([shipment], shipment.clientCode);
        });
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
    renderReport();
    renderClients();
    renderCashDay();
    updateBulkBar();
    if (state.issueModal.open) syncIssueModalFromState();
  }

  /* ============ ОТЧЁТ ЗА МЕСЯЦ ============ */

  function shiftReportMonth(delta) {
    const d = new Date(state.reportYear, state.reportMonth + delta, 1);
    state.reportYear = d.getFullYear();
    state.reportMonth = d.getMonth();
    renderReport();
  }

  function formatMonthLabel(year, month) {
    const locale = state.lang === 'ky' ? 'ky-KG' : 'ru-RU';
    try {
      return new Date(year, month, 1).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return (month + 1) + '.' + year;
    }
  }

  function isInReportMonth(isoString) {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return false;
    return d.getFullYear() === state.reportYear && d.getMonth() === state.reportMonth;
  }

  function getActivityDate(shipment) {
    return shipment.createdAt || shipment.updatedAt;
  }

  function getMonthShipments() {
    return state.shipments
      .filter(s => {
        const createdInMonth = isInReportMonth(getActivityDate(s));
        const issuedInMonth =
          s.status === 'received' && isInReportMonth(s.deliveredAt || s.updatedAt);
        return createdInMonth || issuedInMonth;
      })
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  function renderReport() {
    const label = document.getElementById('monthLabel');
    if (label) {
      const text = formatMonthLabel(state.reportYear, state.reportMonth);
      label.textContent = text.charAt(0).toUpperCase() + text.slice(1);
    }

    const prevBtn = document.getElementById('monthPrev');
    const nextBtn = document.getElementById('monthNext');
    if (prevBtn) prevBtn.setAttribute('aria-label', t('month_prev_aria'));
    if (nextBtn) nextBtn.setAttribute('aria-label', t('month_next_aria'));

    const now = new Date();
    const isCurrentOrFuture =
      state.reportYear > now.getFullYear() ||
      (state.reportYear === now.getFullYear() && state.reportMonth >= now.getMonth());
    if (nextBtn) nextBtn.disabled = isCurrentOrFuture;

    const accepted = state.shipments.filter(s => isInReportMonth(getActivityDate(s)));
    const issued = state.shipments.filter(
      s => s.status === 'received' && isInReportMonth(s.deliveredAt || s.updatedAt)
    );
    const monthList = getMonthShipments();

    const weight = accepted.reduce((sum, s) => sum + (Number(s.weightKg) || 0), 0);
    const revenue = issued.reduce((sum, s) => {
      return sum + getShipmentDelivery(s) + getShipmentStorageFee(s);
    }, 0);
    const clients = new Set(monthList.map(s => s.clientCode).filter(Boolean));
    const avg = issued.length ? Math.round(revenue / issued.length) : 0;

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    set('reportAccepted', String(accepted.length));
    set('reportIssued', String(issued.length));
    set('reportWeight', (Math.round(weight * 100) / 100) + ' ' + t('kg'));
    set('reportRevenue', formatSom(revenue));
    set('reportClients', String(clients.size));
    set('reportAvg', formatSom(avg));

    const body = document.getElementById('reportBody');
    const empty = document.getElementById('reportEmpty');
    if (!body) return;

    body.innerHTML = '';

    if (monthList.length === 0) {
      if (empty) {
        empty.hidden = false;
        empty.textContent = t('report_empty');
      }
      return;
    }

    if (empty) empty.hidden = true;

    monthList.forEach((shipment, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = (index * 0.03) + 's';
      tr.innerHTML =
        '<td class="cell-mono">' + escapeHtml(shipment.track) + '</td>' +
        '<td class="cell-mono">' + escapeHtml(formatClientLabel(shipment.clientCode)) + '</td>' +
        '<td class="cell-mono">' + shipment.weightKg + ' ' + t('kg') + '</td>' +
        '<td class="cell-mono">' + formatSom(shipment.priceSom) + '</td>' +
        '<td>' + formatDateShort(shipment.updatedAt) + '</td>' +
        '<td><span class="badge badge--' + shipment.status + '">' +
          (shipment.status === 'received' ? t('status_received') : t('status_arrived')) +
        '</span></td>';
      body.appendChild(tr);
    });
  }

  function initReportUI() {
    document.getElementById('monthPrev')?.addEventListener('click', () => shiftReportMonth(-1));
    document.getElementById('monthNext')?.addEventListener('click', () => shiftReportMonth(1));
  }

  /* ============ ПРИЁМ / ВЫДАЧА ============ */

  async function addShipment(data) {
    const track = normalizeTrack(data.track);
    const clientCode = normalizeClientCode(data.clientCode);
    const weightKg = Number(data.weightKg);
    const priceSom = Math.round(Number(data.priceSom));

    if (!track) return { ok: false, error: t('err_track') };
    if (!clientCode) return { ok: false, error: t('err_client') };
    if (!weightKg || weightKg <= 0) return { ok: false, error: t('err_weight') };
    if (priceSom < 0 || Number.isNaN(priceSom)) return { ok: false, error: t('err_price') };

    const payload = {
      track_number: track,
      weight: weightKg,
      price: priceSom,
      status: STATUS_READY,
      client_code: clientCode
    };

    let { data: rows, error } = await db
      .from('parcels')
      .insert(payload)
      .select('*')
      .limit(1);

    if (error && /client_code/i.test(error.message || '')) {
      const retry = await db
        .from('parcels')
        .insert({
          track_number: track,
          weight: weightKg,
          price: priceSom,
          status: STATUS_READY
        })
        .select('*')
        .limit(1);
      rows = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error(error);
      return { ok: false, error: error.message || t('err_track_exists') };
    }

    const shipment = window.PandaSupabase.mapParcelFromDb((rows && rows[0]) || {
      track_number: track,
      weight: weightKg,
      price: priceSom,
      status: STATUS_READY,
      client_code: clientCode
    });

    await reloadShipments();
    return { ok: true, shipment };
  }

  async function updateParcelStatus(track, status, extra) {
    const key = normalizeTrack(track);
    const dbStatus = window.PandaSupabase.mapStatusToDb(status);
    const now = new Date().toISOString();
    const extras = extra || {};

    const payload = Object.assign(
      {
        status: dbStatus,
        updated_at: now
      },
      extras
    );

    // При выдаче всегда пишем delivered + delivered_at
    if (dbStatus === STATUS_DELIVERED || status === 'received' || status === 'delivered') {
      payload.status = STATUS_DELIVERED;
      payload.delivered_at = extras.delivered_at || now;
    }

    let { error } = await db
      .from('parcels')
      .update(payload)
      .eq('track_number', key);

    if (error && /updated_at/i.test(error.message || '')) {
      const withoutUpdated = Object.assign({}, payload);
      delete withoutUpdated.updated_at;
      const retry = await db
        .from('parcels')
        .update(withoutUpdated)
        .eq('track_number', key);
      error = retry.error;
    }

    if (error && /storage_fee/i.test(error.message || '')) {
      const withoutStorage = Object.assign({}, payload);
      delete withoutStorage.storage_fee;
      delete withoutStorage.updated_at;
      const retry = await db
        .from('parcels')
        .update(withoutStorage)
        .eq('track_number', key);
      error = retry.error;
    }

    if (error) {
      console.error('parcel status update error:', error, { track: key, payload });
    }

    return { ok: !error, error, deliveredAt: payload.delivered_at || null };
  }

  async function deliverParcel(shipment) {
    const item = typeof shipment === 'string'
      ? state.shipments.find(s => s.track === normalizeTrack(shipment))
      : shipment;

    if (!item || item.status === 'received') {
      return { ok: false, error: { message: 'already delivered' } };
    }

    const storageFee = getShipmentStorageFee(item);
    const now = new Date().toISOString();

    return updateParcelStatus(item.track, 'delivered', {
      delivered_at: now,
      storage_fee: storageFee
    });
  }

  async function issueShipment(track) {
    const key = normalizeTrack(track);
    const item = state.shipments.find(s => s.track === key);
    if (!item || item.status === 'received') return false;

    const result = await deliverParcel(item);
    if (!result.ok) {
      showToast((result.error && result.error.message) || 'Supabase error');
      return false;
    }

    state.selected.delete(key);
    await reloadShipments();
    showToast(t('toast_issued', { track: key }));
    return true;
  }

  async function issueSelected() {
    const parcels = state.shipments.filter(
      s => state.selected.has(s.track) && s.status === 'arrived'
    );

    if (parcels.length === 0) {
      showToast(t('toast_bulk_none'));
      return;
    }

    openIssueModal(parcels, parcels[0].clientCode);
  }

  function clearSelection() {
    state.selected.clear();
    renderTable();
  }

  async function issueAllForClient(clientCode) {
    const code = normalizeClientCode(clientCode);
    if (!code) return { ok: false, error: t('err_client') };

    const pending = state.shipments.filter(
      s => s.clientCode === code && s.status === 'arrived'
    );

    if (pending.length === 0) {
      return { ok: false, error: t('err_no_arrived', { code }) };
    }

    let count = 0;
    for (const s of pending) {
      const result = await deliverParcel(s);
      if (result.ok) {
        count += 1;
        state.selected.delete(s.track);
      }
    }

    await reloadShipments();
    showToast(t('toast_quick_issued', { code, count }));
    return { ok: true, count };
  }

  /* ============ СУТОЧНЫЙ КОД ВЫДАЧИ (синхрон с клиентом) ============ */

  /**
   * Алгоритм (не менять без синхронизации с клиентом):
   *   seed = "PandaCargo.pickup.v1|{userId}|{YYYY-MM-DD}"
   *   FNV-1a 32-bit → n % 1_000_000 → 6 цифр
   */
  const PICKUP_CODE_SALT = 'PandaCargo.pickup.v1';

  function localDayKey(date) {
    const d = date || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  function fnv1a32(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function generateDailyPickupCode(userId, dateYmd) {
    const id = String(userId || '').trim();
    if (!id) return '';
    const day = dateYmd || localDayKey();
    const seed = PICKUP_CODE_SALT + '|' + id + '|' + day;
    const n = fnv1a32(seed) % 1000000;
    return String(n).padStart(6, '0');
  }

  function normalizePickupDigits(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatPickupCode(digits) {
    const d = normalizePickupDigits(digits);
    if (d.length !== 6) return d;
    return d.slice(0, 3) + '-' + d.slice(3);
  }

  function isPickupCodeInput(value) {
    const d = normalizePickupDigits(value);
    return d.length === 6 && /^\d{6}$/.test(d);
  }

  async function loadClientsCache(force) {
    const fresh = Date.now() - state.clientsCacheAt < 60 * 1000;
    if (!force && state.clientsCache.length && fresh) {
      return state.clientsCache;
    }

    const { data, error } = await db.from('clients').select('*');

    if (error) {
      console.error('clients load error:', error);
      state.clientsCache = [];
      state.clientsCacheAt = Date.now();
      return [];
    }

    state.clientsCache = (data || []).map(row => ({
      id: row.id,
      userId: row.user_id || row.id,
      clientCode: normalizeClientCode(row.client_code),
      email: row.email || '',
      fullName: String(row.full_name || row.fullName || row.name || row.fio || '').trim(),
      phone: String(row.phone || row.phone_number || row.tel || '').trim(),
      createdAt: row.created_at || row.createdAt || ''
    })).filter(c => c.clientCode || c.userId);

    state.clientsCacheAt = Date.now();
    return state.clientsCache;
  }

  function mapClientDisplayName(client) {
    if (client.fullName) return client.fullName;
    if (client.email) return client.email;
    return '—';
  }

  async function renderClients() {
    const body = document.getElementById('clientsBody');
    const empty = document.getElementById('clientsEmpty');
    if (!body) return;

    // Всегда свежий запрос из таблицы clients
    const clients = await loadClientsCache(true);
    const sorted = clients.slice().sort((a, b) => {
      const ac = Number(a.clientCode) || 0;
      const bc = Number(b.clientCode) || 0;
      return ac - bc;
    });

    body.innerHTML = '';

    if (sorted.length === 0) {
      if (empty) {
        empty.hidden = false;
        empty.textContent = t('clients_empty');
      }
      return;
    }

    if (empty) empty.hidden = true;

    sorted.forEach((client, index) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = (index * 0.03) + 's';

      const phoneTd = document.createElement('td');
      phoneTd.className = 'phone-cell';

      const phoneText = document.createElement('span');
      phoneText.className = 'cell-mono';
      phoneText.textContent = client.phone ? formatPhoneDisplay(client.phone) : t('no_phone');
      phoneTd.appendChild(phoneText);

      const wa = whatsappUrl(client.phone);
      if (wa) {
        const link = document.createElement('a');
        link.className = 'btn--wa';
        link.href = wa;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = t('wa_btn');
        phoneTd.appendChild(link);
      }

      const parcelsBtn = document.createElement('button');
      parcelsBtn.type = 'button';
      parcelsBtn.className = 'btn--client-parcels';
      parcelsBtn.textContent = t('client_parcels_btn');
      parcelsBtn.addEventListener('click', () => {
        openClientParcelsModal(client);
      });
      phoneTd.appendChild(parcelsBtn);

      const codeTd = document.createElement('td');
      codeTd.className = 'cell-mono';
      codeTd.textContent = formatClientLabel(client.clientCode);

      const nameTd = document.createElement('td');
      nameTd.textContent = mapClientDisplayName(client);

      const dateTd = document.createElement('td');
      dateTd.textContent = client.createdAt ? formatDateShort(client.createdAt) : '—';

      tr.appendChild(codeTd);
      tr.appendChild(nameTd);
      tr.appendChild(phoneTd);
      tr.appendChild(dateTd);
      body.appendChild(tr);
    });
  }

  function isDeliveredToday(shipment) {
    const raw = shipment && (shipment.deliveredAt || shipment.delivered_at);
    if (!raw) return false;
    const at = new Date(raw);
    if (Number.isNaN(at.getTime())) return false;
    return localDayKey(at) === localDayKey(new Date());
  }

  /* ============ ПОСЫЛКИ КЛИЕНТА (модалка) ============ */

  function getClientParcelsFiltered() {
    const code = normalizeClientCode(state.clientParcelsModal.clientCode);
    const uid = String(state.clientParcelsModal.userId || '').trim();
    let list = state.shipments.filter(s => {
      if (code && s.clientCode === code) return true;
      if (uid && s.userId === uid) return true;
      return false;
    });

    const f = state.clientParcelsModal.filter;
    if (f === 'arrived') list = list.filter(s => s.status === 'arrived');
    if (f === 'received') list = list.filter(s => s.status === 'received');
    return list.sort((a, b) => {
      if (a.status !== b.status) return a.status === 'arrived' ? -1 : 1;
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
  }

  function renderClientParcelsModal() {
    const listEl = document.getElementById('clientParcelsList');
    const emptyEl = document.getElementById('clientParcelsEmpty');
    if (!listEl) return;

    const list = getClientParcelsFiltered();
    listEl.innerHTML = '';

    if (list.length === 0) {
      if (emptyEl) {
        emptyEl.hidden = false;
        emptyEl.textContent = t('client_parcels_empty');
      }
    } else if (emptyEl) {
      emptyEl.hidden = true;
    }

    list.forEach(shipment => {
      const canIssue = shipment.status === 'arrived';
      const checked = state.clientParcelsModal.selected.has(shipment.track);
      const card = document.createElement('label');
      card.className = 'issue-card' + (checked ? ' is-checked' : '');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'row-check';
      check.checked = checked;
      check.disabled = !canIssue;

      const body = document.createElement('div');
      body.innerHTML =
        '<p class="issue-card__track">' + escapeHtml(shipment.track) + '</p>' +
        '<p class="issue-card__meta">' +
          escapeHtml(shipment.weightKg + ' ' + t('kg')) + ' · ' +
          escapeHtml(formatDateShort(shipment.createdAt || shipment.updatedAt)) + ' · ' +
          escapeHtml(shipment.status === 'received' ? t('status_received') : t('status_arrived')) +
        '</p>';

      const price = document.createElement('div');
      price.className = 'issue-card__price';
      price.textContent = formatSom(getShipmentTotalDue(shipment));

      if (canIssue) {
        check.addEventListener('change', () => {
          if (check.checked) state.clientParcelsModal.selected.add(shipment.track);
          else state.clientParcelsModal.selected.delete(shipment.track);
          card.classList.toggle('is-checked', check.checked);
          updateClientParcelsSummary();
        });
      }

      card.appendChild(check);
      card.appendChild(body);
      card.appendChild(price);
      listEl.appendChild(card);
    });

    updateClientParcelsSummary();
  }

  function updateClientParcelsSummary() {
    const selected = state.shipments.filter(
      s => state.clientParcelsModal.selected.has(s.track) && s.status === 'arrived'
    );
    const totals = summarizeParcels(selected);
    const countEl = document.getElementById('clientParcelsCount');
    const totalEl = document.getElementById('clientParcelsTotal');
    const btn = document.getElementById('clientParcelsIssueBtn');
    if (countEl) countEl.textContent = String(totals.count);
    if (totalEl) totalEl.textContent = formatSom(totals.total);
    if (btn) btn.disabled = totals.count === 0 || state.clientParcelsModal.busy;
  }

  async function openClientParcelsModal(client) {
    await reloadShipments();

    state.clientParcelsModal.open = true;
    state.clientParcelsModal.clientCode = normalizeClientCode(client.clientCode);
    state.clientParcelsModal.userId = String(client.userId || client.id || '');
    state.clientParcelsModal.filter = 'all';
    state.clientParcelsModal.selected = new Set();

    const overlay = document.getElementById('clientParcelsOverlay');
    if (overlay) overlay.hidden = false;

    const label = document.getElementById('clientParcelsLabel');
    if (label) {
      label.textContent = formatClientLabel(state.clientParcelsModal.clientCode) +
        (client.fullName || client.email ? ' · ' + mapClientDisplayName(client) : '');
    }

    document.querySelectorAll('#clientParcelsFilters .filter-tabs__btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.filter === 'all');
    });

    renderClientParcelsModal();
  }

  function closeClientParcelsModal() {
    state.clientParcelsModal.open = false;
    state.clientParcelsModal.selected.clear();
    const overlay = document.getElementById('clientParcelsOverlay');
    if (overlay) overlay.hidden = true;
  }

  async function confirmClientParcelsIssue() {
    if (state.clientParcelsModal.busy) return;
    const selected = state.shipments.filter(
      s => state.clientParcelsModal.selected.has(s.track) && s.status === 'arrived'
    );
    if (!selected.length) {
      showToast(t('toast_bulk_none'));
      return;
    }

    state.clientParcelsModal.busy = true;
    const btn = document.getElementById('clientParcelsIssueBtn');
    if (btn) btn.disabled = true;

    let count = 0;
    try {
      for (const s of selected) {
        const result = await deliverParcel(s);
        if (result.ok) {
          count += 1;
          state.clientParcelsModal.selected.delete(s.track);
        }
      }
      await reloadShipments();
      renderClientParcelsModal();
      renderCashDay();
      if (count === 0) showToast(t('toast_bulk_none'));
      else showToast(t('toast_bulk_issued', { count }), 1500);
    } finally {
      state.clientParcelsModal.busy = false;
      updateClientParcelsSummary();
    }
  }

  function initClientParcelsModal() {
    document.getElementById('clientParcelsClose')?.addEventListener('click', closeClientParcelsModal);
    document.getElementById('clientParcelsOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'clientParcelsOverlay') closeClientParcelsModal();
    });

    document.getElementById('clientParcelsFilters')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-tabs__btn');
      if (!btn) return;
      document.querySelectorAll('#clientParcelsFilters .filter-tabs__btn').forEach(b =>
        b.classList.toggle('is-active', b === btn)
      );
      state.clientParcelsModal.filter = btn.dataset.filter || 'all';
      renderClientParcelsModal();
    });

    document.getElementById('clientParcelsSelectArrived')?.addEventListener('click', () => {
      getClientParcelsFiltered()
        .filter(s => s.status === 'arrived')
        .forEach(s => state.clientParcelsModal.selected.add(s.track));
      renderClientParcelsModal();
    });

    const issueBtn = document.getElementById('clientParcelsIssueBtn');
    issueBtn?.addEventListener('pointerup', (e) => {
      e.preventDefault();
      confirmClientParcelsIssue();
    });
    issueBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      confirmClientParcelsIssue();
    });
  }

  function getTodayIssuedParcels() {
    return state.shipments.filter(isDeliveredToday);
  }

  function renderCashDay() {
    const issued = getTodayIssuedParcels();
    let delivery = 0;
    let storage = 0;

    issued.forEach(s => {
      delivery += getShipmentDelivery(s);
      storage += getShipmentStorageFee(s);
    });

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    set('cashIssuedCount', String(issued.length));
    set('cashDelivery', formatSom(delivery));
    set('cashStorage', formatSom(storage));
    set('cashTotal', formatSom(delivery + storage));

    const dateLabel = document.getElementById('cashDateLabel');
    if (dateLabel) {
      dateLabel.textContent = t('cash_date', { date: formatDateShort(new Date().toISOString()) });
    }
  }

  function setActiveSection(section) {
    const id = section || 'ops';
    state.activeSection = id;

    document.querySelectorAll('.section-nav__btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.section === id);
    });

    const map = {
      ops: 'sectionOps',
      clients: 'sectionClients',
      cash: 'sectionCash',
      report: 'sectionReport'
    };

    Object.keys(map).forEach(key => {
      const el = document.getElementById(map[key]);
      if (el) el.hidden = key !== id;
    });

    if (id === 'clients') renderClients();
    if (id === 'cash') renderCashDay();
    if (id === 'report') renderReport();
    if (id === 'ops') setTimeout(focusScannerField, 50);
  }

  function initSectionNav() {
    document.getElementById('sectionNav')?.addEventListener('click', (e) => {
      const btn = e.target.closest('.section-nav__btn');
      if (!btn) return;
      setActiveSection(btn.dataset.section || 'ops');
    });
  }

  async function findClientByPickupCode(rawCode) {
    const digits = normalizePickupDigits(rawCode);
    if (digits.length !== 6) return null;

    const today = localDayKey();
    const clients = await loadClientsCache(false);

    for (const client of clients) {
      const ids = [client.userId, client.id].filter(Boolean);
      for (const id of ids) {
        if (generateDailyPickupCode(id, today) === digits) return client;
      }
    }

    // Retry with forced refresh in case cache is stale
    const fresh = await loadClientsCache(true);
    for (const client of fresh) {
      const ids = [client.userId, client.id].filter(Boolean);
      for (const id of ids) {
        if (generateDailyPickupCode(id, today) === digits) return client;
      }
    }

    return null;
  }

  function verifyDailyPickupCode(userId, inputCode, dateYmd) {
    const expected = generateDailyPickupCode(userId, dateYmd);
    const got = normalizePickupDigits(inputCode);
    return Boolean(expected) && expected === got;
  }

  window.PandaCargo = window.PandaCargo || {};
  window.PandaCargo.generateDailyPickupCode = generateDailyPickupCode;
  window.PandaCargo.verifyDailyPickupCode = verifyDailyPickupCode;

  /* ============ ОЗВУЧКА ============ */

  function speakRu(text) {
    const message = String(text || '').trim();
    if (!message || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(message);
      utter.lang = 'ru-RU';
      utter.rate = 1;
      utter.pitch = 1;

      const voices = window.speechSynthesis.getVoices() || [];
      const ruVoice = voices.find(v => /^ru/i.test(v.lang)) ||
        voices.find(v => /russian|рус/i.test(v.name || ''));
      if (ruVoice) utter.voice = ruVoice;

      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('speechSynthesis:', e);
    }
  }

  function speakIssueResult(parcels) {
    const list = Array.isArray(parcels) ? parcels : [];
    // Озвучка всегда на русском (ru-RU), независимо от языка UI
    if (list.length === 0) {
      speakRu('Посылок не найдено.');
      return;
    }
    const totals = summarizeParcels(list);
    speakRu('Товаров ' + totals.count + ' на сумму ' + Math.round(totals.total) + ' сом.');
  }

  /* ============ ОКНО ВЫДАЧИ (частичная) ============ */

  function getIssueSelectedParcels() {
    return state.shipments.filter(
      s => state.issueModal.selected.has(s.track) && s.status === 'arrived'
    );
  }

  function renderIssueModalSummary(options) {
    const opts = options || {};
    const selected = getIssueSelectedParcels();
    const totals = summarizeParcels(selected);

    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };

    set('issueCount', String(totals.count));
    set('issueDelivery', formatSom(totals.delivery));
    set('issueStorage', formatSom(totals.storage));
    set('issueTotal', formatSom(totals.total));

    const confirmBtn = document.getElementById('issueConfirmBtn');
    if (confirmBtn) confirmBtn.disabled = totals.count === 0;

    if (opts.speak) speakIssueResult(selected);
  }

  function renderIssueModalList() {
    const listEl = document.getElementById('issueList');
    const emptyEl = document.getElementById('issueEmpty');
    if (!listEl) return;

    listEl.innerHTML = '';
    const parcels = state.shipments.filter(
      s => state.issueModal.tracks.includes(s.track) && s.status === 'arrived'
    );

    if (parcels.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;

    parcels.forEach(shipment => {
      const checked = state.issueModal.selected.has(shipment.track);
      const fee = getShipmentStorageFee(shipment);
      const card = document.createElement('label');
      card.className = 'issue-card' + (checked ? ' is-checked' : '');

      const check = document.createElement('input');
      check.type = 'checkbox';
      check.className = 'row-check';
      check.checked = checked;

      const body = document.createElement('div');
      body.innerHTML =
        '<p class="issue-card__track">' + escapeHtml(shipment.track) + '</p>' +
        '<p class="issue-card__meta">' +
          escapeHtml(shipment.weightKg + ' ' + t('kg')) + ' · ' +
          escapeHtml(formatDateShort(shipment.createdAt || shipment.updatedAt)) +
        '</p>';

      const price = document.createElement('div');
      price.className = 'issue-card__price';
      price.innerHTML =
        formatSom(getShipmentTotalDue(shipment)) +
        (fee > 0
          ? '<span class="issue-card__storage">' + escapeHtml(formatStorageLabel(shipment)) + '</span>'
          : '');

      check.addEventListener('change', () => {
        if (check.checked) state.issueModal.selected.add(shipment.track);
        else state.issueModal.selected.delete(shipment.track);
        card.classList.toggle('is-checked', check.checked);
        renderIssueModalSummary({ speak: state.issueModal.speakOnChange });
      });

      card.appendChild(check);
      card.appendChild(body);
      card.appendChild(price);
      listEl.appendChild(card);
    });
  }

  function syncIssueModalFromState() {
    if (!state.issueModal.open) return;

    state.issueModal.tracks = state.issueModal.tracks.filter(track => {
      const s = state.shipments.find(x => x.track === track);
      return s && s.status === 'arrived';
    });
    const alive = new Set(state.issueModal.tracks);
    state.issueModal.selected.forEach(track => {
      if (!alive.has(track)) state.issueModal.selected.delete(track);
    });

    const label = document.getElementById('issueClientLabel');
    if (label) {
      label.textContent = t('issue_client', {
        code: formatClientLabel(state.issueModal.clientCode)
      });
    }

    renderIssueModalList();
    renderIssueModalSummary({ speak: false });

    if (state.issueModal.tracks.length === 0) {
      closeIssueModal();
    }
  }

  function openIssueModal(parcels, clientCode) {
    const list = (parcels || []).filter(s => s && s.status === 'arrived');
    state.issueModal.open = true;
    state.issueModal.clientCode = normalizeClientCode(clientCode) || (list[0] && list[0].clientCode) || '';
    state.issueModal.tracks = list.map(s => s.track);
    state.issueModal.selected = new Set(state.issueModal.tracks);
    state.issueModal.speakOnChange = true;

    state.selected.clear();
    state.issueModal.tracks.forEach(track => state.selected.add(track));

    const overlay = document.getElementById('issueOverlay');
    if (overlay) overlay.hidden = false;

    const label = document.getElementById('issueClientLabel');
    if (label) {
      label.textContent = t('issue_client', {
        code: formatClientLabel(state.issueModal.clientCode)
      });
    }

    renderIssueModalList();
    renderIssueModalSummary({ speak: true });
    updateBulkBar();
  }

  function closeIssueModal() {
    state.issueModal.open = false;
    state.issueModal.tracks = [];
    state.issueModal.selected.clear();
    const overlay = document.getElementById('issueOverlay');
    if (overlay) overlay.hidden = true;
    updateBulkBar();
    focusScannerField();
  }

  async function confirmIssueModal() {
    if (state.issueModal.busy) return;

    const selected = getIssueSelectedParcels();
    if (selected.length === 0) {
      showToast(t('toast_bulk_none'));
      return;
    }

    state.issueModal.busy = true;
    const confirmBtn = document.getElementById('issueConfirmBtn');
    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.classList.add('is-busy');
    }

    let count = 0;
    try {
      for (const s of selected) {
        const result = await deliverParcel(s);
        if (result.ok) {
          count += 1;
          state.selected.delete(s.track);
          state.issueModal.selected.delete(s.track);
        } else {
          console.error('deliver failed:', result.error, s.track);
        }
      }

      await reloadShipments();

      if (count === 0) {
        showToast(t('toast_bulk_none'));
        return;
      }

      showToast(t('toast_bulk_issued', { count }), 1500);
      closeIssueModal();
      renderCashDay();
    } finally {
      state.issueModal.busy = false;
      if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('is-busy');
      }
    }
  }

  function initIssueModal() {
    document.getElementById('issueClose')?.addEventListener('click', closeIssueModal);
    document.getElementById('issueOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'issueOverlay') closeIssueModal();
    });

    const confirmBtn = document.getElementById('issueConfirmBtn');
    confirmBtn?.addEventListener('pointerup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      confirmIssueModal();
    });
    confirmBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      confirmIssueModal();
    });

    document.getElementById('issueSelectAllBtn')?.addEventListener('click', () => {
      state.issueModal.tracks.forEach(track => state.issueModal.selected.add(track));
      renderIssueModalList();
      renderIssueModalSummary({ speak: true });
    });
  }

  /* ============ QR / BARCODE / PICKUP ПАРСИНГ ============ */

  function parseClientFromScan(raw) {
    const text = String(raw || '').trim();
    if (!text) return null;

    try {
      const json = JSON.parse(text);
      if (json) {
        // Клиентский QR: { client, day, issuedAt, token } — token = суточный 6-значный код
        const tokenDigits = normalizePickupDigits(json.token || json.pickupCode || json.code);
        const userId = String(
          json.userId || json.user_id || json.client || json.uid || ''
        ).trim();
        const day = json.day || json.date || '';

        if (tokenDigits.length === 6 && userId) {
          if (!day || verifyDailyPickupCode(userId, tokenDigits, day)) {
            return { userId: userId, pickupCode: tokenDigits, day: day || localDayKey() };
          }
          return null;
        }

        if (tokenDigits.length === 6) {
          return { pickupCode: tokenDigits, day: day || localDayKey() };
        }

        if (userId && !/^\d{1,8}$/.test(userId)) {
          return { userId: userId };
        }

        if (json.clientCode != null || json.clientId != null ||
            (json.client != null && /^\d{1,8}$/.test(String(json.client)))) {
          const code = normalizeClientCode(json.clientCode ?? json.clientId ?? json.client);
          return code || null;
        }

        if (userId) return { userId: userId };
      }
    } catch (e) {
      /* not JSON */
    }

    if (isPickupCodeInput(text)) {
      return { pickupCode: normalizePickupDigits(text) };
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

    // Don't treat 6-digit pickup codes as tracks
    if (isPickupCodeInput(text)) return null;

    const cleaned = text.replace(/\s+/g, '');
    // Числовые штрих-коды (EAN и т.п.)
    if (/^\d{7,}$/.test(cleaned)) return cleaned;
    if (/^[A-Z]{1,4}\d{4,}$/.test(cleaned)) return cleaned;
    if (/^[A-Z0-9-]{5,}$/.test(cleaned) && /\d/.test(cleaned) && /[A-Z]/.test(cleaned)) {
      return cleaned;
    }

    return cleaned.length >= 5 ? cleaned : null;
  }

  async function resolveIssueLookup(raw) {
    const text = String(raw || '').trim();
    if (!text) return { ok: false, reason: 'empty' };

    // 1) QR JSON / pickup 6 digits / client code
    const parsed = parseClientFromScan(text);

    if (parsed && typeof parsed === 'object' && parsed.userId && parsed.pickupCode) {
      const day = parsed.day || localDayKey();
      if (!verifyDailyPickupCode(parsed.userId, parsed.pickupCode, day)) {
        return { ok: false, reason: 'pickup' };
      }
      const clients = await loadClientsCache(false);
      const client = clients.find(c =>
        c.userId === parsed.userId || String(c.id) === parsed.userId
      );
      return {
        ok: true,
        clientCode: client ? client.clientCode : '',
        userId: parsed.userId,
        via: 'pickup-qr'
      };
    }

    if (parsed && typeof parsed === 'object' && parsed.pickupCode) {
      const client = await findClientByPickupCode(parsed.pickupCode);
      if (!client) return { ok: false, reason: 'pickup' };
      return {
        ok: true,
        clientCode: client.clientCode,
        userId: client.userId,
        via: 'pickup'
      };
    }

    if (parsed && typeof parsed === 'object' && parsed.userId) {
      const clients = await loadClientsCache(false);
      const client = clients.find(c =>
        c.userId === parsed.userId || String(c.id) === parsed.userId
      );
      if (client) {
        return { ok: true, clientCode: client.clientCode, userId: client.userId, via: 'qr-user' };
      }
      return { ok: true, clientCode: '', userId: parsed.userId, via: 'qr-user' };
    }

    if (typeof parsed === 'string' && parsed) {
      return { ok: true, clientCode: parsed, via: 'client' };
    }

    // 2) Track code → find shipment → its client
    const track = parseTrackFromScan(text);
    if (track) {
      const shipment = state.shipments.find(s => s.track === track);
      if (shipment) {
        return {
          ok: true,
          clientCode: shipment.clientCode,
          track: shipment.track,
          via: 'track'
        };
      }
      return { ok: false, reason: 'not_found', track };
    }

    // 3) Raw 6 digits already handled; try plain digits as pickup
    if (isPickupCodeInput(text)) {
      const client = await findClientByPickupCode(text);
      if (!client) return { ok: false, reason: 'pickup' };
      return { ok: true, clientCode: client.clientCode, userId: client.userId, via: 'pickup' };
    }

    return { ok: false, reason: 'not_found' };
  }

  function getArrivedForClient(clientCode, userId) {
    const code = normalizeClientCode(clientCode);
    const uid = String(userId || '').trim();
    return state.shipments.filter(s => {
      if (s.status !== 'arrived') return false;
      if (code && s.clientCode && s.clientCode === code) return true;
      if (uid && s.userId && s.userId === uid) return true;
      return false;
    });
  }

  async function collectClientParcels(clientCode, userId) {
    const code = normalizeClientCode(clientCode);
    const uid = String(userId || '').trim();

    // Обновляем данные со склада перед поиском
    try {
      state.shipments = await fetchParcels();
    } catch (e) {
      console.error('parcels reload before issue lookup:', e);
    }

    const clients = await loadClientsCache(true);
    const client = clients.find(c =>
      (code && c.clientCode === code) ||
      (uid && (c.userId === uid || String(c.id) === uid))
    );

    const codes = new Set([code, client && client.clientCode].filter(Boolean).map(String));
    const ids = new Set(
      [uid, client && client.userId, client && client.id]
        .filter(Boolean)
        .map(String)
    );

    const list = state.shipments.filter(s => {
      if (codes.has(String(s.clientCode || ''))) return true;
      if (s.userId && ids.has(String(s.userId))) return true;
      return false;
    });

    return {
      clientCode: (client && client.clientCode) || code || '',
      userId: (client && client.userId) || uid || '',
      all: list,
      arrived: list.filter(s => s.status === 'arrived')
    };
  }

  async function runIssueLookup(raw, options) {
    const opts = options || {};
    const result = await resolveIssueLookup(raw);

    if (!result.ok) {
      state.selected.clear();
      state.searchQuery = '';
      state.activeFilter = 'arrived';
      document.querySelectorAll('.filter-tabs__btn').forEach(b =>
        b.classList.toggle('is-active', b.dataset.filter === 'arrived')
      );
      renderTable();
      speakIssueResult([]);
      showToast(
        result.reason === 'pickup' ? t('err_pickup_code') : t('toast_pickup_none')
      );
      return result;
    }

    let parcels = [];

    if (result.track) {
      const one = state.shipments.find(s => s.track === result.track && s.status === 'arrived');
      if (one) parcels = [one];
    }

    if (parcels.length === 0) {
      const pack = await collectClientParcels(result.clientCode, result.userId);
      parcels = pack.arrived;
      if (!result.clientCode && pack.clientCode) result.clientCode = pack.clientCode;
      renderTable();
    }

    state.selected.clear();
    parcels.forEach(s => state.selected.add(s.track));

    state.activeFilter = 'arrived';
    document.querySelectorAll('.filter-tabs__btn').forEach(b =>
      b.classList.toggle('is-active', b.dataset.filter === 'arrived')
    );

    state.searchQuery = result.clientCode || result.userId || '';
    renderTable();
    updateBulkBar();

    if (parcels.length === 0) {
      speakIssueResult([]);
      showToast(t('toast_pickup_none'));
      return { ok: false, reason: 'not_found', parcels };
    }

    const totals = summarizeParcels(parcels);
    showToast(t('toast_pickup_found', {
      code: result.clientCode || '—',
      count: parcels.length,
      sum: Math.round(totals.total).toLocaleString('ru-RU')
    }));

    openIssueModal(parcels, result.clientCode);

    return { ok: true, parcels, clientCode: result.clientCode };
  }

  /* ============ USB-СКАНЕР: ФОКУС ============ */

  function getActiveTrackInput() {
    const focused = document.querySelector('#trackFields .track-field__input:focus');
    if (focused) return focused;
    const inputs = document.querySelectorAll('#trackFields .track-field__input');
    if (!inputs.length) return null;
    // Предпочитаем пустое поле, иначе последнее
    for (let i = 0; i < inputs.length; i++) {
      if (!String(inputs[i].value || '').trim() && !inputs[i].disabled) return inputs[i];
    }
    return inputs[inputs.length - 1];
  }

  function getScannerField() {
    if (state.scannerFocus === 'issue') {
      return document.getElementById('searchInput');
    }
    return getActiveTrackInput();
  }

  function focusScannerField() {
    if (!state.unlocked) return;
    if (state.scanner.mode) return;
    if (state.issueModal.open) return;
    if (state.clientParcelsModal.open) return;
    if (state.activeSection !== 'ops') return;
    if (document.getElementById('settingsOverlay') && !document.getElementById('settingsOverlay').hidden) return;
    if (document.getElementById('pinOverlay') && !document.getElementById('pinOverlay').hidden) return;
    if (document.getElementById('deviceAuthOverlay') && !document.getElementById('deviceAuthOverlay').hidden) return;

    // Не перехватываем фокус, если пользователь уже в другом поле формы приёмки
    const active = document.activeElement;
    if (
      active &&
      active.closest &&
      active.closest('#receiveForm') &&
      !active.classList.contains('track-field__input')
    ) {
      return;
    }

    const field = getScannerField();
    if (!field) return;
    try {
      field.focus({ preventScroll: true });
    } catch (e) {
      field.focus();
    }
  }

  function setScannerFocusTarget(target) {
    state.scannerFocus = target === 'issue' ? 'issue' : 'track';
    focusScannerField();
  }

  function initScannerFocus() {
    const searchInput = document.getElementById('searchInput');
    const receivePanel = document.getElementById('receivePanel');
    const shipmentsPanel = document.getElementById('shipmentsPanel');
    const trackFields = document.getElementById('trackFields');

    trackFields?.addEventListener('focusin', (e) => {
      if (e.target && e.target.classList && e.target.classList.contains('track-field__input')) {
        state.scannerFocus = 'track';
      }
    });

    searchInput?.addEventListener('focus', () => {
      state.scannerFocus = 'issue';
    });

    receivePanel?.addEventListener('pointerdown', () => {
      state.scannerFocus = 'track';
    });
    shipmentsPanel?.addEventListener('pointerdown', () => {
      state.scannerFocus = 'issue';
    });

    document.addEventListener('click', (e) => {
      if (!state.unlocked) return;
      if (state.issueModal.open) return;
      if (state.clientParcelsModal.open) return;
      const el = e.target;
      if (!(el instanceof Element)) return;

      if (
        el.closest('input, textarea, select, button, a, label, .scanner-overlay, .modal-overlay, .bulk-bar, .section-nav, .track-field')
      ) {
        return;
      }

      focusScannerField();
    });

    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = function () {
        window.speechSynthesis.getVoices();
      };
    }

    setTimeout(focusScannerField, 100);
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
      const track = parseTrackFromScan(raw) || normalizeTrack(raw);
      if (!track) {
        showToast(t('err_not_found'));
        return;
      }
      const input = getActiveTrackInput();
      if (input) {
        input.value = track;
        input.disabled = false;
        const row = input.closest('.track-field');
        const check = row && row.querySelector('.track-field__check');
        if (check) check.classList.remove('is-on');
        input.classList.remove('is-blind');
        input.focus();
      }
      setScannerFocusTarget('track');
      showToast(t('toast_scan_track'), 1200);
      return;
    }

    if (mode === 'client') {
      const parsed = parseClientFromScan(raw);
      let code = null;

      if (typeof parsed === 'string') {
        code = parsed;
      } else if (parsed && parsed.userId && parsed.pickupCode) {
        const day = parsed.day || localDayKey();
        if (verifyDailyPickupCode(parsed.userId, parsed.pickupCode, day)) {
          const clients = await loadClientsCache(false);
          const client = clients.find(c =>
            c.userId === parsed.userId || String(c.id) === parsed.userId
          );
          code = client ? client.clientCode : null;
        }
      } else if (parsed && parsed.pickupCode) {
        const client = await findClientByPickupCode(parsed.pickupCode);
        code = client ? client.clientCode : null;
      } else if (parsed && parsed.userId) {
        const clients = await loadClientsCache(false);
        const client = clients.find(c =>
          c.userId === parsed.userId || String(c.id) === parsed.userId
        );
        code = client ? client.clientCode : null;
      }

      if (!code) {
        showToast(t('err_qr_invalid'));
        return;
      }
      const input = document.getElementById('clientInput');
      if (input) {
        input.value = formatClientLabel(code);
        input.focus();
      }
      showToast(t('toast_scan_client'), 1200);
      return;
    }

    if (mode === 'quick') {
      await runIssueLookup(raw, { autoIssue: false });
      setScannerFocusTarget('issue');
    }
  }

  /* ============ МУЛЬТИ-ТРЕК ПРИЁМКА ============ */

  function createTrackFieldRow(initialValue) {
    const row = document.createElement('div');
    row.className = 'track-field';

    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'track-field__check';
    checkBtn.setAttribute('aria-label', t('track_blind_aria'));
    checkBtn.title = t('track_blind_aria');
    checkBtn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 10 17.5 19 7"/></svg>';

    const input = document.createElement('input');
    input.className = 'field__input field__input--mono track-field__input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.placeholder = t('track_placeholder');
    if (initialValue) input.value = initialValue;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'track-field__remove';
    removeBtn.setAttribute('aria-label', 'Delete');
    removeBtn.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

    const syncBlind = () => {
      const on = checkBtn.classList.contains('is-on');
      input.classList.toggle('is-blind', on);
      if (on) {
        input.dataset.blind = '1';
      } else {
        delete input.dataset.blind;
      }
    };

    checkBtn.addEventListener('click', () => {
      checkBtn.classList.toggle('is-on');
      syncBlind();
      if (!checkBtn.classList.contains('is-on')) input.focus();
    });

    removeBtn.addEventListener('click', () => {
      const wrap = document.getElementById('trackFields');
      if (!wrap) return;
      if (wrap.querySelectorAll('.track-field').length <= 1) {
        input.value = '';
        checkBtn.classList.remove('is-on');
        syncBlind();
        input.focus();
        return;
      }
      row.remove();
      updateTrackRemoveButtons();
      focusScannerField();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const track = normalizeTrack(input.value);
        if (track) input.value = track;

        if (!track && !checkBtn.classList.contains('is-on')) {
          return;
        }

        // Новое поле для следующего скана — фокус остаётся на треках
        const next = appendTrackField('');
        if (next) next.focus();
        updateTrackRemoveButtons();
        return;
      }

      if (e.key === 'Delete' || (e.key === 'Backspace' && !String(input.value || '') && !e.repeat)) {
        const wrap = document.getElementById('trackFields');
        const rows = wrap ? wrap.querySelectorAll('.track-field') : [];
        if (e.key === 'Delete' || (e.key === 'Backspace' && rows.length > 1 && !String(input.value || ''))) {
          e.preventDefault();
          if (rows.length <= 1) {
            input.value = '';
            return;
          }
          const prev = row.previousElementSibling;
          const next = row.nextElementSibling;
          row.remove();
          updateTrackRemoveButtons();
          const focusRow = prev || next;
          const focusInput = focusRow && focusRow.querySelector('.track-field__input');
          if (focusInput) focusInput.focus();
        }
      }
    });

    // Не даём сканеру увести Enter на submit формы
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') e.preventDefault();
    });

    row.appendChild(checkBtn);
    row.appendChild(input);
    row.appendChild(removeBtn);
    return row;
  }

  function appendTrackField(value) {
    const wrap = document.getElementById('trackFields');
    if (!wrap) return null;
    const row = createTrackFieldRow(value || '');
    wrap.appendChild(row);
    updateTrackRemoveButtons();
    return row.querySelector('.track-field__input');
  }

  function resetTrackFields() {
    const wrap = document.getElementById('trackFields');
    if (!wrap) return;
    wrap.innerHTML = '';
    appendTrackField('');
  }

  function updateTrackRemoveButtons() {
    const wrap = document.getElementById('trackFields');
    if (!wrap) return;
    const rows = wrap.querySelectorAll('.track-field');
    rows.forEach(row => {
      const btn = row.querySelector('.track-field__remove');
      if (btn) btn.disabled = rows.length <= 1;
    });
  }

  function collectReceiveTracks() {
    const wrap = document.getElementById('trackFields');
    if (!wrap) return { ok: false, error: t('err_tracks'), tracks: [] };

    const rows = Array.from(wrap.querySelectorAll('.track-field'));
    const tracks = [];
    const seen = new Set();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const input = row.querySelector('.track-field__input');
      const check = row.querySelector('.track-field__check');
      const blind = check && check.classList.contains('is-on');
      let track = normalizeTrack(input && input.value);

      if (!track && blind) {
        track = 'NR' + Date.now().toString(36).toUpperCase() + String(i + 1);
      }

      if (!track) {
        // Пустые необязательные хвосты игнорируем
        continue;
      }

      if (seen.has(track)) continue;
      seen.add(track);
      tracks.push(track);
    }

    if (tracks.length === 0) {
      return { ok: false, error: t('err_tracks'), tracks: [] };
    }

    return { ok: true, tracks: tracks };
  }

  /* ============ ФОРМА / СОБЫТИЯ ============ */

  function initReceiveForm() {
    const form = document.getElementById('receiveForm');
    const weightInput = document.getElementById('weightInput');
    const priceInput = document.getElementById('priceInput');
    const errEl = document.getElementById('receiveError');
    const okEl = document.getElementById('receiveSuccess');

    resetTrackFields();

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

    // Если в поле клиента случайно просканировали трек — переносим в трек-поле
    document.getElementById('clientInput')?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const raw = String(e.target.value || '').trim();
      const asTrack = parseTrackFromScan(raw) ||
        (/^\d{7,}$/.test(raw.replace(/\s+/g, '')) ? normalizeTrack(raw) : null);

      if (asTrack && (asTrack.length > 8 || /[A-Z]/i.test(asTrack))) {
        e.target.value = '';
        const current = getActiveTrackInput();
        if (current && !String(current.value || '').trim()) {
          current.value = asTrack;
          current.focus();
        } else {
          const next = appendTrackField(asTrack);
          if (next) next.focus();
        }
        showToast(t('toast_scan_track'), 1000);
        return;
      }
    });

    // Блокируем Enter на форме, кроме явного submit кнопкой
    form?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.target && e.target.id === 'addShipmentBtn') return;
      if (e.target && e.target.classList && e.target.classList.contains('track-field__input')) return;
      // Enter в client/weight/price не сабмитит форму случайно от сканера
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON')) {
        e.preventDefault();
      }
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      showMessage(errEl, '');
      showMessage(okEl, '');

      const submitBtn = document.getElementById('addShipmentBtn');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const collected = collectReceiveTracks();
        if (!collected.ok) {
          showMessage(errEl, collected.error);
          return;
        }

        const clientCode = document.getElementById('clientInput')?.value;
        const weightKg = weightInput?.value;
        const priceSom = priceInput?.value;

        let okCount = 0;
        let lastError = '';
        const addedTracks = [];

        for (const track of collected.tracks) {
          const result = await addShipment({
            track: track,
            clientCode: clientCode,
            weightKg: weightKg,
            priceSom: priceSom
          });
          if (result.ok) {
            okCount += 1;
            addedTracks.push(result.shipment.track);
          } else {
            lastError = result.error || 'error';
          }
        }

        if (okCount === 0) {
          showMessage(errEl, lastError || t('err_tracks'));
          return;
        }

        const okText = okCount === 1
          ? t('added_ok', { track: addedTracks[0] })
          : t('added_ok_multi', { count: okCount });

        showToast(okText, 1000);
        showMessage(okEl, okText);

        form.reset();
        resetTrackFields();
        state.priceManual = false;
        updatePriceFormula();
        setScannerFocusTarget('track');

        await reloadShipments();
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(focusScannerField, 50);
      }
    });

    updatePriceFormula();
  }

  function initSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');

    document.getElementById('searchForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const raw = searchInput?.value || '';
      if (!raw.trim()) return;

      await runIssueLookup(raw, { autoIssue: false });

      if (searchInput) searchInput.value = '';
      setScannerFocusTarget('issue');
      focusScannerField();
    });

    // Live filter for typed queries (не для 6-значного кода — ждём Enter)
    searchInput?.addEventListener('input', (e) => {
      const val = e.target.value;
      if (isPickupCodeInput(val)) return;
      state.searchQuery = val;
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
    document.getElementById('scanClientBtn')?.addEventListener('click', () => openScanner('client'));
    document.getElementById('quickIssueBtn')?.addEventListener('click', () => openScanner('quick'));
    document.getElementById('scannerClose')?.addEventListener('click', () => stopScanner());

    document.getElementById('scannerOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'scannerOverlay') stopScanner();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (state.scanner.mode) stopScanner();
      else if (state.issueModal.open) closeIssueModal();
      else if (state.clientParcelsModal.open) closeClientParcelsModal();
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

  async function init() {
    state.settings = loadSettings();
    state.shipments = [];

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
    initReportUI();
    initScannerButtons();
    initScannerFocus();
    initIssueModal();
    initClientParcelsModal();
    initSectionNav();
    setActiveSection('ops');

    if (!isDeviceAuthorized()) {
      hideAllGates();
      showDeviceAuthGate();
      return;
    }

    await continueAfterDeviceAuth();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
