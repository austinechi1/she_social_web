document.addEventListener('DOMContentLoaded', function () {
  const headerLogo = document.querySelector('.nav-logo img');
  const footerLogo = document.querySelector('#footer-logo-img');

  if (headerLogo && footerLogo) {
    footerLogo.src = headerLogo.src;
  }
});

/*    NAV: scroll class    */
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/*    Mobile menu toggle    */
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenuClose = document.querySelector('.mobile-menu-close');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu a');

function setMobileMenu(open) {
  document.body.classList.toggle('mobile-menu-open', open);
  if (mobileMenuToggle) mobileMenuToggle.setAttribute('aria-expanded', String(open));
  if (mobileMenu) mobileMenu.setAttribute('aria-hidden', String(!open));
  if (mobileMenuBackdrop) mobileMenuBackdrop.setAttribute('aria-hidden', String(!open));
}

if (mobileMenuToggle) mobileMenuToggle.addEventListener('click', () => setMobileMenu(!document.body.classList.contains('mobile-menu-open')));
if (mobileMenuClose) mobileMenuClose.addEventListener('click', () => setMobileMenu(false));
if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', () => setMobileMenu(false));
mobileMenuLinks.forEach(link => link.addEventListener('click', () => setMobileMenu(false)));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMobileMenu(false);
});
window.addEventListener('resize', () => {
  if (window.innerWidth >= 768) setMobileMenu(false);
}, { passive: true });

/*    FAQ toggle    */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-btn').setAttribute('aria-expanded','false');
  });
  if (!isOpen) {
    item.classList.add('open');
    btn.setAttribute('aria-expanded','true');
  }
}

/*    Contact form    */
function submitForm() {
  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  if (!name || !email) {
    alert('Please enter your name and email to continue.');
    return;
  }
  document.getElementById('form-fields').style.display = 'none';
  document.getElementById('form-success').style.display = 'block';
}

/*    Video testimonial play-in-place    */
function playVideoProof(frame) {
  const video = frame.querySelector('video');
  if (!video) return;
  video.setAttribute('controls', '');
  video.play();
  frame.classList.add('playing');
  const playBtn = frame.querySelector('.video-proof-play');
  if (playBtn) playBtn.style.display = 'none';
  const badge = frame.querySelector('.video-proof-duration');
  if (badge) badge.style.display = 'none';
}

/*    BTS videos: only play while actually in view    */
const btsVideos = document.querySelectorAll('.bts-video');
const btsIo = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const video = entry.target;
    if (entry.isIntersecting) {
      if (video.preload === 'none') video.preload = 'metadata';
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { threshold: 0.25 });
btsVideos.forEach(v => btsIo.observe(v));

/*    BTS background sound: auto-loop while section is in view, pause outside it    */
const btsSection = document.getElementById('behind-the-scenes');
const btsAudio = document.getElementById('bts-audio');

if (btsSection && btsAudio) {
  // Browsers block audio-with-sound until the visitor has interacted with the
  // page at least once. Silently "unlock" playback on the first click/tap/key
  // anywhere on the page, so the scroll-triggered play below actually works.
  let btsAudioUnlocked = false;
  function unlockBtsAudio() {
    if (btsAudioUnlocked) return;
    btsAudioUnlocked = true;
    btsAudio.preload = 'auto';
    btsAudio.play().then(() => {
      btsAudio.pause();
      btsAudio.currentTime = 0;
      // If the section is already in view when the unlock happens, start it now.
      const rect = btsSection.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;
      if (inView) btsAudio.play().catch(() => {});
    }).catch(() => {});
    ['click', 'touchstart', 'keydown'].forEach(evt =>
      document.removeEventListener(evt, unlockBtsAudio)
    );
  }
  ['click', 'touchstart', 'keydown'].forEach(evt =>
    document.addEventListener(evt, unlockBtsAudio, { once: false, passive: true })
  );

  const btsAudioIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        btsAudio.preload = 'auto';
        btsAudio.currentTime = 0;
        btsAudio.play().catch(() => {});
      } else {
        btsAudio.pause();
      }
    });
  }, { threshold: 0.4 });
  btsAudioIo.observe(btsSection);
}

/*    Scroll-triggered fade-in    */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.pain-card,.pkg-card,.what-item,.process-step,.ideal-card,.proof-card,.founder-stat,.truth-item,.opp-card,.elev-step'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  io.observe(el);
});
