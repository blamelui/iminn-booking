/* ============================================================
   I'M INN HOTEL — SORSOGON
   Main script: navbar, weather API, form validation, totals
   ============================================================ */

/* ------------------------------------------------------------
   1. NAVBAR — scroll effect + mobile hamburger
   ------------------------------------------------------------ */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('open');
  });
}

/* ------------------------------------------------------------
   2. WEATHER API — Open-Meteo (no key required)
      Coordinates for Sorsogon City: 12.9739 N, 124.0052 E
   ------------------------------------------------------------ */
const SORSOGON_LAT = 12.9739;
const SORSOGON_LON = 124.0052;

async function loadWeather() {
  const weatherMain = document.getElementById('weatherMain');
  if (!weatherMain) return; // Only run on booking page

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${SORSOGON_LAT}&longitude=${SORSOGON_LON}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min&timezone=Asia%2FManila`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API request failed');
    const data = await res.json();

    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const feels = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const wind = Math.round(current.wind_speed_10m);
    const code = current.weather_code;

    const { icon, text } = describeWeather(code);

    weatherMain.innerHTML = `
      <div class="weather-icon" style="font-size:2.6rem;margin-bottom:10px;">${icon}</div>
      <div class="weather-temp">${temp}<span>°C</span></div>
      <div class="weather-desc">${text}</div>
      <div class="weather-details">
        <div class="weather-detail">Feels like<strong>${feels}°C</strong></div>
        <div class="weather-detail">Humidity<strong>${humidity}%</strong></div>
        <div class="weather-detail">Wind<strong>${wind} km/h</strong></div>
        <div class="weather-detail">Local time<strong>${getLocalTime()}</strong></div>
      </div>
    `;
  } catch (err) {
    console.error('Weather error:', err);
    weatherMain.innerHTML = `<div class="weather-loading">Weather temporarily unavailable.</div>`;
  }
}

function describeWeather(code) {
  const map = {
    0:  { icon: '☀️', text: 'Clear sky' },
    1:  { icon: '🌤️', text: 'Mainly clear' },
    2:  { icon: '⛅', text: 'Partly cloudy' },
    3:  { icon: '☁️', text: 'Overcast' },
    45: { icon: '🌫️', text: 'Foggy' },
    48: { icon: '🌫️', text: 'Depositing rime fog' },
    51: { icon: '🌦️', text: 'Light drizzle' },
    53: { icon: '🌦️', text: 'Moderate drizzle' },
    55: { icon: '🌧️', text: 'Dense drizzle' },
    61: { icon: '🌧️', text: 'Slight rain' },
    63: { icon: '🌧️', text: 'Moderate rain' },
    65: { icon: '🌧️', text: 'Heavy rain' },
    71: { icon: '🌨️', text: 'Slight snow' },
    80: { icon: '🌦️', text: 'Rain showers' },
    81: { icon: '🌧️', text: 'Moderate showers' },
    82: { icon: '⛈️', text: 'Violent showers' },
    95: { icon: '⛈️', text: 'Thunderstorm' },
    96: { icon: '⛈️', text: 'Thunderstorm with hail' },
    99: { icon: '⛈️', text: 'Severe thunderstorm' }
  };
  return map[code] || { icon: '🌡️', text: 'Unknown' };
}

function getLocalTime() {
  return new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Manila'
  });
}

/* ------------------------------------------------------------
   3. BOOKING FORM — totals, validation, submission
   ------------------------------------------------------------ */
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
  const fields = {
    fullName: document.getElementById('fullName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    guests: document.getElementById('guests'),
    checkin: document.getElementById('checkin'),
    checkout: document.getElementById('checkout'),
    roomType: document.getElementById('roomType'),
    extraBed: document.getElementById('extraBed'),
    extraHour: document.getElementById('extraHour'),
    requests: document.getElementById('requests')
  };

  const totalPreview = {
    nights: document.getElementById('nightsDisplay'),
    roomSubtotal: document.getElementById('roomSubtotal'),
    addonsTotal: document.getElementById('addonsTotal'),
    grandTotal: document.getElementById('grandTotal')
  };

  /* --- 3a. Pre-select room from URL (e.g. booking.html?room=Quads) --- */
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedRoom = urlParams.get('room');
  if (preselectedRoom) {
    [...fields.roomType.options].forEach(opt => {
      if (opt.value === preselectedRoom) fields.roomType.value = preselectedRoom;
    });
  }

  /* --- 3b. Set minimum dates (today + tomorrow) --- */
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = d => d.toISOString().split('T')[0];

  fields.checkin.min = fmt(today);
  fields.checkout.min = fmt(tomorrow);

  /* --- 3c. Live total calculator --- */
  function calculateTotals() {
    const roomOpt = fields.roomType.selectedOptions[0];
    const roomPrice = roomOpt ? parseInt(roomOpt.dataset.price || 0) : 0;

    const bedPrice = parseInt(fields.extraBed.selectedOptions[0]?.dataset.price || 0);
    const hourPrice = parseInt(fields.extraHour.selectedOptions[0]?.dataset.price || 0);
    const addons = bedPrice + hourPrice;

    const inDate = fields.checkin.value ? new Date(fields.checkin.value) : null;
    const outDate = fields.checkout.value ? new Date(fields.checkout.value) : null;

    let nights = 0;
    if (inDate && outDate && outDate > inDate) {
      nights = Math.round((outDate - inDate) / (1000 * 60 * 60 * 24));
    }

    const roomSubtotal = roomPrice * nights;
    const grand = roomSubtotal + addons;

    totalPreview.nights.textContent = nights > 0 ? `${nights} night${nights > 1 ? 's' : ''}` : '—';
    totalPreview.roomSubtotal.textContent = peso(roomSubtotal);
    totalPreview.addonsTotal.textContent = peso(addons);
    totalPreview.grandTotal.textContent = peso(grand);

    return { nights, roomPrice, addons, grand, roomName: roomOpt?.value || '' };
  }

  const peso = n => '₱' + n.toLocaleString('en-PH');

  ['roomType', 'extraBed', 'extraHour', 'checkin', 'checkout'].forEach(id => {
    fields[id].addEventListener('change', calculateTotals);
  });

  /* --- 3d. Validation --- */
  function showError(field, message) {
    clearError(field);
    field.style.borderColor = '#C1272D';
    const err = document.createElement('small');
    err.className = 'field-error';
    err.style.color = '#C1272D';
    err.style.fontSize = '0.8rem';
    err.style.marginTop = '4px';
    err.textContent = message;
    field.parentElement.appendChild(err);
  }

  function clearError(field) {
    field.style.borderColor = '';
    const existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();
  }

  function validate() {
    let valid = true;

    // Name: letters, spaces, . - ' only
    const nameVal = fields.fullName.value.trim();
    const nameRegex = /^[A-Za-zÀ-ÿ.'\-\s]{2,}$/;
    if (!nameVal) {
      showError(fields.fullName, 'Name is required.');
      valid = false;
    } else if (!nameRegex.test(nameVal)) {
      showError(fields.fullName, 'Name must contain letters only.');
      valid = false;
    } else clearError(fields.fullName);

    // Email
    const emailVal = fields.email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      showError(fields.email, 'Email is required.');
      valid = false;
    } else if (!emailRegex.test(emailVal)) {
      showError(fields.email, 'Please enter a valid email address.');
      valid = false;
    } else clearError(fields.email);

    // Phone: digits, spaces, + - only, 7-15 digits
    const phoneVal = fields.phone.value.trim();
    const digits = phoneVal.replace(/\D/g, '');
    const phoneRegex = /^[\d\s+\-()]+$/;
    if (!phoneVal) {
      showError(fields.phone, 'Phone number is required.');
      valid = false;
    } else if (!phoneRegex.test(phoneVal) || digits.length < 7 || digits.length > 15) {
      showError(fields.phone, 'Please enter a valid phone number.');
      valid = false;
    } else clearError(fields.phone);

    // Guests
    const g = parseInt(fields.guests.value);
    if (!g || g < 1 || g > 10) {
      showError(fields.guests, 'Guests must be between 1 and 10.');
      valid = false;
    } else clearError(fields.guests);

    // Check-in
    const inDate = fields.checkin.value ? new Date(fields.checkin.value) : null;
    const outDate = fields.checkout.value ? new Date(fields.checkout.value) : null;
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);

    if (!inDate) {
      showError(fields.checkin, 'Check-in date is required.');
      valid = false;
    } else if (inDate < todayMid) {
      showError(fields.checkin, 'Check-in cannot be in the past.');
      valid = false;
    } else clearError(fields.checkin);

    // Check-out
    if (!outDate) {
      showError(fields.checkout, 'Check-out date is required.');
      valid = false;
    } else if (inDate && outDate <= inDate) {
      showError(fields.checkout, 'Check-out must be after check-in.');
      valid = false;
    } else clearError(fields.checkout);

    // Room
    if (!fields.roomType.value) {
      showError(fields.roomType, 'Please select a room type.');
      valid = false;
    } else clearError(fields.roomType);

    return valid;
  }

  // Clear errors when user types again
  Object.values(fields).forEach(f => {
    f.addEventListener('input', () => clearError(f));
    f.addEventListener('change', () => clearError(f));
  });

  /* ----------------------------------------------------------
     4. SUBMIT — send data to Google Apps Script
     ----------------------------------------------------------
     ⚠️ REPLACE the URL below with your own Apps Script Web App URL
     after you deploy the Code.gs in Message 5.
     ---------------------------------------------------------- */
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx86V4pFi4P9VNcxJRRZifYlUt5MFLswgsuc31Ycuge-AuCJ2Px-oc_1yzpFdvANTgE/exec';

  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const formMessage = document.getElementById('formMessage');

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.textContent = '';
    formMessage.className = 'form-message';

    if (!validate()) {
      formMessage.textContent = 'Please fix the errors above.';
      formMessage.classList.add('error');
      return;
    }

    if (APPS_SCRIPT_URL === 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      formMessage.textContent = '⚠️ Backend URL not set yet. See Message 5 instructions.';
      formMessage.classList.add('error');
      return;
    }

    const totals = calculateTotals();
    const payload = {
      fullName: fields.fullName.value.trim(),
      email: fields.email.value.trim(),
      phone: fields.phone.value.trim(),
      guests: fields.guests.value,
      checkin: fields.checkin.value,
      checkout: fields.checkout.value,
      roomType: fields.roomType.value,
      roomPrice: totals.roomPrice,
      nights: totals.nights,
      extraBed: fields.extraBed.value,
      extraHour: fields.extraHour.value,
      addons: totals.addons,
      total: totals.grand,
      requests: fields.requests.value.trim()
    };

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires this
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      // Because of no-cors we can't read the response.
      // If no exception thrown, we assume success.
      formMessage.textContent = `✅ Booking confirmed! A confirmation email is on its way to ${payload.email}.`;
      formMessage.classList.add('success');
      bookingForm.reset();
      calculateTotals();
    } catch (err) {
      console.error('Submit error:', err);
      formMessage.textContent = '❌ Something went wrong. Please try again.';
      formMessage.classList.add('error');
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });

  // Initial calculation
  calculateTotals();
}

/* ------------------------------------------------------------
   5. INIT
   ------------------------------------------------------------ */
loadWeather();