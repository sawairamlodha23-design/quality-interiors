/**
 * Quality Interiors — Interactive Cost & Scope Estimator
 * Helps urban homeowners & clients estimate their project budget in 3 quick steps
 */

const ESTIMATOR_DATA = {
  '2bhk': {
    name: '2 BHK Apartment (800 - 1,100 sq.ft)',
    essential: {
      priceRange: '₹4.5 Lakh – ₹6.2 Lakh',
      timeline: '4 - 6 Weeks',
      inclusions: [
        'Modular Kitchen with Marine-Grade BWP Ply',
        '2 Custom Floor-to-Ceiling Wardrobes',
        'Sleek Wall-Mounted TV Unit in Living Room',
        'Standard Soft-Close Hardware & Basic Lighting'
      ]
    },
    premium: {
      priceRange: '₹7.0 Lakh – ₹9.8 Lakh',
      timeline: '6 - 8 Weeks',
      inclusions: [
        'Acrylic / Matte PU Modular Kitchen with Quartz Island',
        '2 Premium Fluted Glass / Lacquered Wardrobes',
        'Designer False Ceiling & Ambient Cove Lighting',
        'Living Room Feature Wall & Custom Dining Set',
        'Complete Bathroom Vanities & Shoe Rack'
      ]
    },
    luxury: {
      priceRange: '₹11.5 Lakh – ₹16.0 Lakh',
      timeline: '8 - 10 Weeks',
      inclusions: [
        'Imported Blum/Hettich German Kitchen Architecture',
        'Full Walk-In Wardrobes with Integrated Vertical LEDs',
        'Italian Travertine Accent Walls & Fluted Wood Millwork',
        'Turnkey Automation, Wall Finishes & Bespoke Furniture',
        'Dedicated Senior Interior Architect Supervision'
      ]
    }
  },
  '3bhk': {
    name: '3 BHK Apartment (1,200 - 1,800 sq.ft)',
    essential: {
      priceRange: '₹6.8 Lakh – ₹9.5 Lakh',
      timeline: '6 - 8 Weeks',
      inclusions: [
        'Full Modular Kitchen with Soft-Close Accessories',
        '3 Custom Modular Wardrobes with Loft Storage',
        'Living Room TV Unit & Shoe Console',
        'Basic Electrical Redirection & Quality Hardware'
      ]
    },
    premium: {
      priceRange: '₹10.5 Lakh – ₹15.5 Lakh',
      timeline: '8 - 10 Weeks',
      inclusions: [
        'Chef’s Modular Kitchen with Quartz Countertops & Pantry',
        '3 Designer Wardrobes with Fluted/Tinted Glass Accents',
        'Architectural False Ceiling with Magnetic Track Lighting',
        'Custom Sofa, Dining Table & Foyer Console',
        'Vanity Storage, Wallpaper & Accent Wall Paneling'
      ]
    },
    luxury: {
      priceRange: '₹17.0 Lakh – ₹24.5 Lakh',
      timeline: '10 - 12 Weeks',
      inclusions: [
        'Ultra-Luxury Modular Kitchen with Built-in Appliance Tower',
        'Bespoke Master Walk-In Dressing Suite & Dressers',
        'Veneer & Acoustic Slat Paneling Across Living & Dining',
        'Custom Curated Furniture & Motorized Curtains Integration',
        '10-Year Warranty with Lifetime Factory Service Support'
      ]
    }
  },
  '4bhk-villa': {
    name: '4 BHK / Luxury Villa (2,000 - 4,500 sq.ft)',
    essential: {
      priceRange: '₹11.0 Lakh – ₹15.0 Lakh',
      timeline: '8 - 10 Weeks',
      inclusions: [
        'Complete Modular Kitchen & Utility Storage',
        '4 Full Wardrobes with Internal Organizers',
        'Living & Family Room Entertainment Consoles',
        'Essential False Ceilings & Heavy Duty Hardware'
      ]
    },
    premium: {
      priceRange: '₹16.5 Lakh – ₹24.0 Lakh',
      timeline: '10 - 14 Weeks',
      inclusions: [
        'Premium Island Kitchen with Breakfast Bar & Quartz Top',
        '4 Designer Wardrobes with Built-In Vanities & Mirrors',
        'Comprehensive False Ceiling & Architectural Lighting Grid',
        'Double-Height Feature Wall & Custom Dining Furniture',
        'Bar Unit, Foyer Partition & Storage Solutions'
      ]
    },
    luxury: {
      priceRange: '₹26.0 Lakh – ₹42.0 Lakh',
      timeline: '14 - 18 Weeks',
      inclusions: [
        'Bespoke German Kitchen Architecture & Butler Pantry',
        'Luxury Master Walk-in Suite with Leather & Wood Millwork',
        'Full Double-Height Marble & Fluted Wood Cladding',
        'Complete Turnkey Execution, Home Automation & Decor',
        'End-to-End White Glove Handover with 10-Yr Warranty'
      ]
    }
  },
  'commercial': {
    name: 'Boutique Commercial / Office (1,000 - 3,000 sq.ft)',
    essential: {
      priceRange: '₹6.0 Lakh – ₹9.5 Lakh',
      timeline: '4 - 6 Weeks',
      inclusions: [
        'Modular Workstations for 10-15 Team Members',
        'Reception Desk & Waiting Area Furniture',
        'Basic Electrical, Data Cabling & Ceiling Grid'
      ]
    },
    premium: {
      priceRange: '₹11.0 Lakh – ₹17.5 Lakh',
      timeline: '6 - 8 Weeks',
      inclusions: [
        'Executive Cabin Millwork & 10-Seater Conference Room',
        'Aluminum/Glass Partitioning & Acoustic Ceilings',
        'Pantry Cabinetry, Breakout Seating & Designer Lighting'
      ]
    },
    luxury: {
      priceRange: '₹19.0 Lakh – ₹32.0 Lakh',
      timeline: '8 - 12 Weeks',
      inclusions: [
        'Bespoke Veneer & Fluted Wood Executive Suites',
        'Acoustic Double-Glazed Glass Systems & Smart Access',
        'Designer Lounge, Reception Statement Wall & Coffee Bar',
        'Complete Turnkey MEP Execution & Fire/Safety Handover'
      ]
    }
  }
};

let currentProperty = '3bhk';
let currentScope = 'premium';

document.addEventListener('DOMContentLoaded', () => {
  initEstimator();
});

function initEstimator() {
  const propertyCards = document.querySelectorAll('.estimator-property-card');
  const scopeCards = document.querySelectorAll('.estimator-scope-card');
  const applyBtn = document.getElementById('apply-estimator-btn');

  if (!propertyCards.length || !scopeCards.length) return;

  propertyCards.forEach(card => {
    card.addEventListener('click', () => {
      propertyCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentProperty = card.getAttribute('data-property');
      updateEstimateUI();
    });
  });

  scopeCards.forEach(card => {
    card.addEventListener('click', () => {
      scopeCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentScope = card.getAttribute('data-scope');
      updateEstimateUI();
    });
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      applyEstimateToForm();
    });
  }

  updateEstimateUI();
}

function updateEstimateUI() {
  const propData = ESTIMATOR_DATA[currentProperty];
  if (!propData) return;

  const scopeData = propData[currentScope];
  if (!scopeData) return;

  const priceEl = document.getElementById('estimator-price-val');
  const timelineEl = document.getElementById('estimator-timeline-val');
  const nameEl = document.getElementById('estimator-property-label');
  const inclusionsContainer = document.getElementById('estimator-inclusions-list');

  if (priceEl) priceEl.textContent = scopeData.priceRange;
  if (timelineEl) timelineEl.textContent = `Estimated Timeline: ${scopeData.timeline}`;
  if (nameEl) nameEl.textContent = propData.name;

  if (inclusionsContainer) {
    inclusionsContainer.innerHTML = '';
    scopeData.inclusions.forEach(item => {
      const li = document.createElement('div');
      li.className = 'estimator-breakdown-item';
      li.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${item}</span>
      `;
      inclusionsContainer.appendChild(li);
    });
  }
}

function applyEstimateToForm() {
  const projectTypeSelect = document.getElementById('form-project-type');
  const budgetSelect = document.getElementById('form-budget');
  const detailsTextarea = document.getElementById('form-details');
  const formSection = document.getElementById('consultation-form');

  if (projectTypeSelect) {
    if (currentProperty === '2bhk' || currentProperty === '3bhk' || currentProperty === '4bhk-villa') {
      projectTypeSelect.value = 'Full Home Interior';
    } else if (currentProperty === 'commercial') {
      projectTypeSelect.value = 'Commercial Interior';
    }
  }

  if (budgetSelect) {
    if (currentScope === 'essential') {
      budgetSelect.value = '₹5L - ₹10L';
    } else if (currentScope === 'premium') {
      budgetSelect.value = '₹10L - ₹20L';
    } else if (currentScope === 'luxury') {
      budgetSelect.value = '₹20L+';
    }
  }

  if (detailsTextarea) {
    const propName = ESTIMATOR_DATA[currentProperty]?.name || currentProperty;
    detailsTextarea.value = `Selected Estimate: ${propName} (${currentScope.toUpperCase()} Scope). Looking forward to discussing the design and material layout.`;
  }

  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });
    const firstInput = document.getElementById('form-name');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 600);
    }
  }
}
