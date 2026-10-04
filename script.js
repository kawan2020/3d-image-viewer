// 💡 CHANGE THIS NUMBER TO CONTROL THE NUMBER OF FACES / IMAGES (e.g. 4, 6, 8)
const TOTAL_IMAGES = 4; 

let currentIndex = 0;
let isFullscreen = false;

const box = document.getElementById('box');
const header = document.getElementById('main-header');
const dotsContainer = document.getElementById('pagination-dots');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// Trigonometric Z-offset calculation for any N-sided prism
function getZOffset() {
  const width = box.offsetWidth;
  const angleRad = (360 / TOTAL_IMAGES / 2) * (Math.PI / 180);
  return Math.round((width / 2) / Math.tan(angleRad));
}

let zOffset = getZOffset();

// 1. Setup N-Sided 3D Prism Faces & Dots
function setupGallery() {
  box.innerHTML = '';
  dotsContainer.innerHTML = '';
  zOffset = getZOffset();

  const angleStep = 360 / TOTAL_IMAGES;

  for (let i = 1; i <= TOTAL_IMAGES; i++) {
    const slide = document.createElement('div');
    slide.className = 'slide';

    const img = document.createElement('img');
    img.src = `images/image${i}.jpg`;
    img.alt = `Image ${i}`;
    slide.appendChild(img);

    const angle = (i - 1) * angleStep;
    slide.style.transform = `rotateY(${angle}deg) translateZ(${zOffset}px)`;

    box.appendChild(slide);

    const dot = document.createElement('div');
    dot.className = `dot ${i === 1 ? 'active' : ''}`;
    dotsContainer.appendChild(dot);
  }
}

setupGallery();

window.addEventListener('resize', () => {
  if (!isFullscreen) setupGallery();
});

// 2. Button Click Listeners (Laptop/Desktop Arrow Controls)
if (prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateGallery(true, 'right');
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < TOTAL_IMAGES - 1) {
      currentIndex++;
      updateGallery(true, 'left');
    }
  });
}

// 3. Gesture Handling (Touch & Laptop Mouse Drag / Scroll Support)
let startX = 0;
let startTime = 0;
let isDragging = false;
let lastTap = 0;

// Mobile Touch Events
document.addEventListener('touchstart', (e) => {
  handleStart(e.touches[0].clientX);
});

document.addEventListener('touchend', (e) => {
  handleEnd(e.changedTouches[0].clientX);
});

// Laptop Mouse Drag Events
document.addEventListener('mousedown', (e) => {
  // Prevent button clicks from triggering drag starts
  if (e.target === prevBtn || e.target === nextBtn) return;
  isDragging = true;
  handleStart(e.clientX);
});

document.addEventListener('mouseup', (e) => {
  if (isDragging) {
    isDragging = false;
    handleEnd(e.clientX);
  }
});

function handleStart(clientX) {
  startX = clientX;
  startTime = new Date().getTime();

  // Double-tap or double-click detection
  const now = new Date().getTime();
  if (now - lastTap < 300 && now - lastTap > 0) {
    toggleFullscreen();
  }
  lastTap = now;
}

function handleEnd(clientX) {
  const diffX = startX - clientX;
  const timeDiff = new Date().getTime() - startTime;
  const velocity = Math.abs(diffX) / (timeDiff || 1);

  if (Math.abs(diffX) > 40) {
    if (diffX > 0 && currentIndex < TOTAL_IMAGES - 1) {
      currentIndex++;
      updateGallery(velocity > 0.6, 'left');
    } else if (diffX < 0 && currentIndex > 0) {
      currentIndex--;
      updateGallery(velocity > 0.6, 'right');
    }
  }
}

// Laptop Mouse Scroll Wheel Navigation
document.addEventListener('wheel', (e) => {
  if (e.deltaY > 30 && currentIndex < TOTAL_IMAGES - 1) {
    currentIndex++;
    updateGallery(false, 'left');
  } else if (e.deltaY < -30 && currentIndex > 0) {
    currentIndex--;
    updateGallery(false, 'right');
  }
}, { passive: true });

// 4. Rotate 3D Dynamic Prism (Subtle 12° Overshoot)
function updateGallery(isFastSwipe = false, direction = '') {
  if (isFullscreen) {
    const slides = document.querySelectorAll('.slide');
    slides.forEach((slide, idx) => {
      slide.style.display = idx === currentIndex ? 'block' : 'none';
      slide.style.transform = 'none';
    });
  } else {
    const angleStep = 360 / TOTAL_IMAGES;
    let targetAngle = currentIndex * -angleStep;

    let overshoot = 0;
    if (isFastSwipe) {
      overshoot = direction === 'left' ? -12 : 12;
    }

    box.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    box.style.transform = `translateZ(-${zOffset}px) rotateY(${targetAngle + overshoot}deg)`;

    if (overshoot !== 0) {
      setTimeout(() => {
        box.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        box.style.transform = `translateZ(-${zOffset}px) rotateY(${targetAngle}deg)`;
      }, 250);
    }
  }

  // Update Dots
  const dotsList = document.querySelectorAll('.dot');
  dotsList.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentIndex);
  });

  // Toggle Header
  if (currentIndex > 0 || isFullscreen) {
    header.classList.add('hidden');
  } else {
    header.classList.remove('hidden');
  }
}

updateGallery();

// 5. Toggle Fullscreen Mode
function toggleFullscreen() {
  isFullscreen = !isFullscreen;
  box.classList.toggle('fullscreen', isFullscreen);
  dotsContainer.classList.toggle('hidden', isFullscreen);

  if (isFullscreen) {
    header.classList.add('hidden');
    updateGallery();
  } else {
    setupGallery();
    updateGallery();
  }
}