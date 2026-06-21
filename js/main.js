/* Cambirela Construction — main.js */

// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
});

// Close menu on link click
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
  });
});

// Scroll-triggered animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .review-card, .why-item, .project-card')
  .forEach(el => observer.observe(el));

// Portfolio filter
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('.project-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});

// Static fallback projects (shown when API is unavailable)
const STATIC_PROJECTS = [
  {
    title: 'Living Room Hardwood Transformation',
    caption: 'Complete hardwood installation · Destin, FL',
    category: 'hardwood',
    before_image: '/images/projects/lr-before.jpg',
    after_image: '/images/projects/lr-after.jpg'
  },
  {
    title: 'Kitchen Tile Renovation',
    caption: 'Porcelain tile installation · Fort Walton Beach, FL',
    category: 'tile',
    before_image: '/images/projects/kitchen-before.jpg',
    after_image: '/images/projects/kitchen-after.jpg'
  },
  {
    title: 'Master Bedroom LVP Installation',
    caption: 'Luxury vinyl plank · Miramar Beach, FL',
    category: 'vinyl',
    before_image: '/images/projects/bedroom-before.jpg',
    after_image: '/images/projects/bedroom-after.jpg'
  }
];

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!projects.length) return;
  grid.innerHTML = projects.map(p => `
    <div class="project-card" data-category="${p.category || 'other'}">
      <div class="project-card__images">
        <img class="project-card__img" src="${p.before_image}" alt="Before — ${p.title}" loading="lazy" />
        <img class="project-card__img" src="${p.after_image}" alt="After — ${p.title}" loading="lazy" />
        <div class="project-card__divider"></div>
        <div class="project-card__labels">
          <span class="label-before">Before</span>
          <span class="label-after">After</span>
        </div>
      </div>
      <div class="project-card__body">
        <div class="project-card__title">${p.title}</div>
        <div class="project-card__caption">${p.caption}</div>
        ${p.category ? `<span class="project-card__tag">${p.category}</span>` : ''}
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.project-card').forEach(el => observer.observe(el));
}

async function loadProjects() {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error();
    const projects = await res.json();
    renderProjects(projects.length ? projects : STATIC_PROJECTS);
  } catch (_) {
    renderProjects(STATIC_PROJECTS);
  }
}
loadProjects();

// Contact form
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const data = Object.fromEntries(new FormData(form));

  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      form.reset();
      formSuccess.classList.add('visible');
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      throw new Error();
    }
  } catch {
    alert('Something went wrong. Please call or text us directly at (850) 000-0000.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send My Free Estimate Request';
  }
});
