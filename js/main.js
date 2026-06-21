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

// Static projects gallery
const STATIC_PROJECTS = [
  {
    title: 'Hardwood Flooring',
    caption: 'Engineered oak installation · Destin, FL',
    category: 'hardwood',
    image: '/images/hardwood.jpg'
  },
  {
    title: 'Kitchen Tile',
    caption: 'Porcelain tile · Fort Walton Beach, FL',
    category: 'tile',
    image: '/images/tile.jpg'
  },
  {
    title: 'Luxury Vinyl Plank',
    caption: 'Waterproof LVP · Miramar Beach, FL',
    category: 'vinyl',
    image: '/images/vinyl.jpg'
  },
  {
    title: 'Laminate Flooring',
    caption: 'Premium laminate · Niceville, FL',
    category: 'laminate',
    image: '/images/laminate.jpg'
  },
  {
    title: 'Bathroom Tile',
    caption: 'Porcelain tile · Destin, FL',
    category: 'tile',
    image: '/images/tile-bath.jpg'
  },
  {
    title: 'Floor Restoration',
    caption: 'Hardwood refinishing · 30A, FL',
    category: 'restoration',
    image: '/images/restoration.jpg'
  }
];

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!projects.length) return;
  grid.innerHTML = projects.map(p => `
    <div class="project-card" data-category="${p.category || 'other'}">
      <div class="project-card__photo">
        <img src="${p.image}" alt="${p.title}" loading="lazy" />
        <span class="project-card__cat">${p.category}</span>
      </div>
      <div class="project-card__body">
        <div class="project-card__title">${p.title}</div>
        <div class="project-card__caption">${p.caption}</div>
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
