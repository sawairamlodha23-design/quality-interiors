/**
 * Quality Interiors — Portfolio & Project Lightbox Engine
 * Handles Category Filtering & Detailed Project Deep-Dive Modal
 */

const PROJECT_DATA = {
  'warm-minimal': {
    title: 'The Warm Minimal Villa',
    category: 'Residential Interiors',
    location: 'Whitefield, Bangalore',
    area: '4,200 sq.ft',
    timeline: '14 Weeks',
    scope: 'Complete Turnkey Architecture & Millwork',
    materials: 'Natural White Oak, Travertine Stone, Bouclé Linen, Brushed Brass',
    image: 'assets/images/projects/project_warm_minimal.jpg',
    description: 'A serene double-height living sanctuary designed around expansive natural daylight, fluted oak architectural acoustic paneling, and curated custom furniture. Every element was custom-measured and factory-finished to ensure effortless visual flow and acoustic warmth.'
  },
  'urban-luxe': {
    title: 'Urban Luxe Penthouse',
    category: 'Residential Interiors',
    location: 'Indiranagar, Bangalore',
    area: '3,100 sq.ft',
    timeline: '10 Weeks',
    scope: 'Living Lounge, Dining & Master Suite',
    materials: 'Fluted Charcoal Ash, Italian Marble, Matte PU Lacquer, Ambient LED',
    image: 'assets/images/projects/project_urban_luxe.jpg',
    description: 'An executive penthouse featuring bespoke entertainment millwork with concealed wiring and motorized compartments, complemented by plush modular seating and warm indirect lighting.'
  },
  'kitchen-studio': {
    title: 'Contemporary Kitchen Studio',
    category: 'Modular Kitchens',
    location: 'Jubilee Hills, Hyderabad',
    area: '450 sq.ft',
    timeline: '4 Weeks',
    scope: 'Modular Kitchen, Breakfast Island & Pantry',
    materials: 'Calacatta Gold Quartz, Anti-Fingerprint Matte Laminate, Blum Soft-Close',
    image: 'assets/images/services/service_kitchen.jpg',
    description: 'An ergonomic chef’s kitchen featuring an oversized seamless waterfall island, integrated induction cooktop, fluted oak upper cabinetry, and customized pantry pull-outs.'
  },
  'master-suite': {
    title: 'Crafted Master Suite & Walk-In Wardrobe',
    category: 'Custom Furniture',
    location: 'Koregaon Park, Pune',
    area: '850 sq.ft',
    timeline: '6 Weeks',
    scope: 'Walk-In Closet, Acoustic Bed Wall & Vanity',
    materials: 'Fluted Natural Oak, Tinted Glass, Warm LED Strips, Leather Pulls',
    image: 'assets/images/services/service_furniture.jpg',
    description: 'A luxurious walk-in wardrobe system with bronze-tinted glass doors, vertical shelf illumination, bespoke jewelry drawers, and fluted panel acoustic headboard.'
  },
  'executive-office': {
    title: 'Boutique Executive Workspace',
    category: 'Commercial Interiors',
    location: 'Cybercity, Gurugram',
    area: '2,800 sq.ft',
    timeline: '8 Weeks',
    scope: 'Private Executive Suites, Boardroom & Lounge',
    materials: 'Smoked Oak Paneling, Crittall Glass Partitions, Acoustic Felt',
    image: 'assets/images/services/service_commercial.jpg',
    description: 'A sophisticated boutique corporate office balancing privacy and transparency through glass acoustic partitions, warm timber accents, and integrated technology credenzas.'
  },
  'scandinavian-home': {
    title: 'Modern Scandinavian Apartment',
    category: 'Residential Interiors',
    location: 'Powai, Mumbai',
    area: '1,850 sq.ft',
    timeline: '8 Weeks',
    scope: 'Full 3BHK Turnkey Interior Execution',
    materials: 'Birch Ply, Neutral Taupe Fabrics, Soft Sand Micro-cement',
    image: 'assets/images/projects/project_scandinavian.jpg',
    description: 'A light-filled apartment maximizing functional storage with concealed multi-purpose cabinetry, airy open-plan living, and calming earth-toned textures.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initPortfolioFilters();
  initProjectModal();
});

/**
 * 1. Category Filtering
 */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/**
 * 2. Project Modal Deep-Dive
 */
function initProjectModal() {
  const projectCards = document.querySelectorAll('.project-card');
  const modalOverlay = document.getElementById('project-modal');
  if (!modalOverlay) return;

  const closeBtn = modalOverlay.querySelector('.modal-close-btn');

  const openModal = (projectId) => {
    const data = PROJECT_DATA[projectId];
    if (!data) return;

    document.getElementById('modal-project-img').src = data.image;
    document.getElementById('modal-project-img').alt = data.title;
    document.getElementById('modal-project-category').textContent = data.category;
    document.getElementById('modal-project-title').textContent = data.title;
    document.getElementById('modal-project-desc').textContent = data.description;
    document.getElementById('modal-project-location').textContent = data.location;
    document.getElementById('modal-project-area').textContent = data.area;
    document.getElementById('modal-project-timeline').textContent = data.timeline;
    document.getElementById('modal-project-materials').textContent = data.materials;
    document.getElementById('modal-project-scope').textContent = data.scope;

    modalOverlay.classList.add('is-active');
    document.body.classList.add('no-scroll');
  };

  const closeModal = () => {
    modalOverlay.classList.remove('is-active');
    document.body.classList.remove('no-scroll');
  };

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const projectId = card.getAttribute('data-project-id');
      openModal(projectId);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('is-active')) {
      closeModal();
    }
  });
}
