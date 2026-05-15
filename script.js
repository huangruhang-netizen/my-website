/* ============================================
   东南亚厨电工厂 - 落地页交互脚本
   ============================================ */

(function () {
  'use strict';

  // ---------- i18n: IP-based Language Detection ----------
  var currentLang = 'zh';

  function detectLanguageByIP() {
    // Try free IP geolocation APIs
    var apis = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/?fields=countryCode'
    ];

    function tryAPI(index) {
      if (index >= apis.length) {
        applyLanguage(currentLang);
        return;
      }
      fetch(apis[index], { signal: AbortSignal.timeout ? AbortSignal.timeout(3000) : undefined })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var cc = (data.country_code || data.countryCode || '').toUpperCase();
          var langMap = {
            'TH': 'th',
            'VN': 'vi',
            'ID': 'id',
            'MY': 'en',
            'SG': 'en',
            'PH': 'en',
            'MM': 'en',
            'KH': 'en',
            'CN': 'zh',
            'TW': 'zh',
            'HK': 'zh',
            'MO': 'zh'
          };
          var detected = langMap[cc] || 'en';
          var saved = localStorage.getItem('kitchen_lang');
          if (saved && I18N[saved]) {
            currentLang = saved;
          } else {
            currentLang = detected;
          }
          applyLanguage(currentLang);
        })
        .catch(function () {
          tryAPI(index + 1);
        });
    }

    var saved = localStorage.getItem('kitchen_lang');
    if (saved && I18N[saved]) {
      currentLang = saved;
      applyLanguage(currentLang);
    } else {
      tryAPI(0);
    }
  }

  function applyLanguage(lang) {
    if (!I18N[lang]) lang = 'en';
    currentLang = lang;
    var t = I18N[lang];

    document.documentElement.lang = t.lang;
    document.title = t.title;

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        var attrTarget = el.getAttribute('data-i18n-attr');
        if (attrTarget) {
          el.setAttribute(attrTarget, t[key]);
        } else if (el.tagName === 'TITLE') {
          document.title = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-ph');
      if (t[key] !== undefined) {
        el.placeholder = t[key];
      }
    });

    // Update lang switcher active state
    document.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    localStorage.setItem('kitchen_lang', lang);
  }

  // ---------- Language Switcher UI ----------
  var langToggle = document.getElementById('langToggle');
  var langMenu = document.getElementById('langMenu');

  if (langToggle && langMenu) {
    langToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      langMenu.classList.toggle('open');
    });

    document.querySelectorAll('.lang-option').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lang = this.getAttribute('data-lang');
        applyLanguage(lang);
        langMenu.classList.remove('open');
      });
    });

    document.addEventListener('click', function () {
      langMenu.classList.remove('open');
    });
  }

  // ---------- WeChat Modal ----------
  window.openWechatModal = function () {
    var modal = document.getElementById('wechatModal');
    if (modal) modal.classList.add('open');
  };

  window.closeWechatModal = function () {
    var modal = document.getElementById('wechatModal');
    if (modal) modal.classList.remove('open');
  };

  var wechatClose = document.getElementById('wechatClose');
  if (wechatClose) {
    wechatClose.addEventListener('click', closeWechatModal);
  }

  var wechatModal = document.getElementById('wechatModal');
  if (wechatModal) {
    wechatModal.addEventListener('click', function (e) {
      if (e.target === wechatModal) closeWechatModal();
    });
  }

  // ---------- Factory Video ----------
  window.playFactoryVideo = function () {
    var poster = document.getElementById('videoPoster');
    var video = document.getElementById('factoryVideo');
    if (poster && video) {
      poster.style.display = 'none';
      video.style.display = 'block';
      video.play();
    }
  };

  // ---------- Bottom Bar Show/Hide ----------
  var bottomBar = document.getElementById('bottomBar');
  var heroSection = document.getElementById('hero');
  var lastScrollY = 0;

  function handleScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    var heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

    if (scrollY > heroBottom - 200) {
      bottomBar.classList.add('visible');
    } else {
      bottomBar.classList.remove('visible');
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ---------- Intersection Observer for Animations ----------
  var animatedElements = document.querySelectorAll(
    '.section-header, .product-card, .adapt-item, .factory-item, .oem-item, .stat, .scene-card'
  );

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var siblings = el.parentElement
              ? Array.from(el.parentElement.children)
              : [];
            var siblingIndex = siblings.indexOf(el);
            el.style.animationDelay = siblingIndex * 0.08 + 's';
            el.classList.add('animate-in');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    animatedElements.forEach(function (el) {
      el.style.opacity = '0';
      observer.observe(el);
    });
  } else {
    animatedElements.forEach(function (el) {
      el.style.opacity = '1';
    });
  }

  // ---------- Smooth Scroll for Anchor Links ----------
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = 20;
        var top =
          target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ---------- Form Submission ----------
  window.handleSubmit = function (e) {
    e.preventDefault();

    var form = document.getElementById('inquiryForm');
    var success = document.getElementById('formSuccess');

    var formData = new FormData(form);
    var data = {};
    formData.forEach(function (value, key) {
      if (data[key]) {
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    });

    console.log('Inquiry submitted:', data);

    form.style.display = 'none';
    success.style.display = 'block';
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // ---------- Touch Feedback ----------
  document.querySelectorAll('.btn, .bottom-btn').forEach(function (btn) {
    btn.addEventListener('touchstart', function () {
      this.style.transform = 'scale(0.96)';
    });
    btn.addEventListener('touchend', function () {
      this.style.transform = '';
    });
  });

  // ---------- Parallax Effect for Hero ----------
  var heroContent = document.querySelector('.hero-content');

  function handleHeroParallax() {
    var scrollY = window.scrollY || window.pageYOffset;
    if (scrollY < window.innerHeight) {
      var opacity = 1 - scrollY / (window.innerHeight * 0.7);
      var translateY = scrollY * 0.3;
      heroContent.style.opacity = Math.max(0, opacity);
      heroContent.style.transform = 'translateY(' + translateY + 'px)';
    }
  }

  window.addEventListener('scroll', handleHeroParallax, { passive: true });

  // ---------- Initialize Language ----------
  detectLanguageByIP();

})();
