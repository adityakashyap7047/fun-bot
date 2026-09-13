// ========== MAP PAGE JS ==========

let map;
let allShops = [];
let markers = [];
let activeInfoWindow = null;
let selectedCategory = 'all';
let userLocation = null;

const CATEGORY_COLORS = {
  'Food & Drinks': '#e17055',
  'Fashion': '#6c5ce7',
  'Grocery': '#00b894',
  'Beauty': '#fd79a8',
  'Services': '#0984e3',
  'Electronics': '#636e72'
};

const CATEGORY_ICONS = {
  'Food & Drinks': 'fas fa-utensils',
  'Fashion': 'fas fa-tshirt',
  'Grocery': 'fas fa-shopping-basket',
  'Beauty': 'fas fa-spa',
  'Services': 'fas fa-tools',
  'Electronics': 'fas fa-laptop'
};

window.initMap = function() {
  if (typeof google === 'undefined' || !google.maps) {
    document.getElementById('mapContainer').innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-dim);text-align:center;padding:40px;"><i class="fas fa-map-marked-alt" style="font-size:3rem;margin-bottom:16px;color:var(--primary)"></i><h3 style="margin-bottom:8px">Map requires Google Maps API key</h3><p style="font-size:0.9rem;max-width:400px">Add your Google Maps API key to map.html to enable the interactive map. Shop listings are still available in the sidebar.</p></div>';
    loadShopsForList();
    return;
  }

  const defaultCenter = { lat: 20.5937, lng: 78.9629 };

  map = new google.maps.Map(document.getElementById('mapContainer'), {
    center: defaultCenter,
    zoom: 5,
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'simplified' }] }
    ]
  });

  loadShops();
  setupSearch();
  setupCategoryFilters();
  setupNearMe();
  setupMobileToggle();
};

// Load shops for sidebar-only mode (no map)
async function loadShopsForList() {
  try {
    allShops = await DB.getShops();
    const locatedShops = allShops.filter(s => s.location && s.location.lat && s.location.lng);
    updateShopCount(locatedShops.length);
    renderShopList(locatedShops);
  } catch (err) {
    console.error('Failed to load shops:', err);
  }
}

async function loadShops() {
  try {
    allShops = await DB.getShops();
    const locatedShops = allShops.filter(s => s.location && s.location.lat && s.location.lng);
    updateShopCount(locatedShops.length);
    renderMarkers(locatedShops);
    renderShopList(locatedShops);
  } catch (err) {
    console.error('Failed to load shops:', err);
    document.getElementById('shopList').innerHTML = `
      <div class="shop-list-empty">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Failed to load shops</h3>
        <p>Please try again later.</p>
      </div>`;
  }
}

function renderMarkers(shops) {
  markers.forEach(m => m.setMap(null));
  markers = [];

  shops.forEach(shop => {
    const color = CATEGORY_COLORS[shop.category] || '#6c5ce7';
    const marker = new google.maps.Marker({
      position: { lat: shop.location.lat, lng: shop.location.lng },
      map: map,
      title: shop.name,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: color,
        fillOpacity: 0.9,
        strokeColor: '#fff',
        strokeWeight: 2
      },
      animation: google.maps.Animation.DROP
    });

    const infoContent = `
      <div class="map-info-window">
        <span class="info-category">${escapeHtml(shop.category)}</span>
        <h4>${escapeHtml(shop.name)}</h4>
        <p><i class="fas fa-user" style="width:14px;font-size:0.7rem"></i> ${escapeHtml(shop.owner)}</p>
        <p><i class="fas fa-phone" style="width:14px;font-size:0.7rem"></i> ${escapeHtml(shop.phone)}</p>
        ${shop.address ? `<p><i class="fas fa-map-marker-alt" style="width:14px;font-size:0.7rem"></i> ${escapeHtml(shop.address)}</p>` : ''}
        <a class="info-link" href="/#${shop._id}" onclick="event.preventDefault();">View Details</a>
      </div>`;

    const infoWindow = new google.maps.InfoWindow({ content: infoContent });

    marker.addListener('click', () => {
      if (activeInfoWindow) activeInfoWindow.close();
      infoWindow.open(map, marker);
      activeInfoWindow = infoWindow;
      highlightShopCard(shop._id);
    });

    marker.shopData = shop;
    markers.push(marker);
  });
}

function renderShopList(shops) {
  const list = document.getElementById('shopList');

  if (shops.length === 0) {
    list.innerHTML = `
      <div class="shop-list-empty">
        <i class="fas fa-store-slash"></i>
        <h3>No shops found</h3>
        <p>Try a different search or category.</p>
      </div>`;
    return;
  }

  list.innerHTML = shops.map(shop => {
    const color = CATEGORY_COLORS[shop.category] || '#6c5ce7';
    const icon = CATEGORY_ICONS[shop.category] || 'fas fa-store';
    const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, shop.location.lat, shop.location.lng) : null;

    return `
      <div class="shop-list-card" data-id="${shop._id}" onclick="focusShop('${shop._id}')">
        <div class="shop-list-card-header">
          <h4 class="shop-list-card-name">${escapeHtml(shop.name)}</h4>
          <span class="shop-list-card-category" style="background:${color}15;color:${color}"><i class="${icon}"></i> ${escapeHtml(shop.category)}</span>
        </div>
        <div class="shop-list-card-detail"><i class="fas fa-user"></i> ${escapeHtml(shop.owner)}</div>
        <div class="shop-list-card-detail"><i class="fas fa-phone"></i> ${escapeHtml(shop.phone)}</div>
        ${shop.address ? `<div class="shop-list-card-detail"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(shop.address)}</div>` : ''}
        ${distance !== null ? `<div class="shop-list-card-distance"><i class="fas fa-walking"></i> ${distance} km away</div>` : ''}
      </div>`;
  }).join('');
}

function updateShopCount(count) {
  document.getElementById('shopCount').textContent = `${count} shop${count !== 1 ? 's' : ''}`;
}

function focusShop(id) {
  const marker = markers.find(m => m.shopData._id === id);
  if (!marker) return;

  map.panTo(marker.getPosition());
  map.setZoom(16);

  if (activeInfoWindow) activeInfoWindow.close();
  const infoContent = `
    <div class="map-info-window">
      <span class="info-category">${escapeHtml(marker.shopData.category)}</span>
      <h4>${escapeHtml(marker.shopData.name)}</h4>
      <p><i class="fas fa-user" style="width:14px;font-size:0.7rem"></i> ${escapeHtml(marker.shopData.owner)}</p>
      <p><i class="fas fa-phone" style="width:14px;font-size:0.7rem"></i> ${escapeHtml(marker.shopData.phone)}</p>
      ${marker.shopData.address ? `<p><i class="fas fa-map-marker-alt" style="width:14px;font-size:0.7rem"></i> ${escapeHtml(marker.shopData.address)}</p>` : ''}
    </div>`;
  const infoWindow = new google.maps.InfoWindow({ content: infoContent });
  infoWindow.open(map, marker);
  activeInfoWindow = infoWindow;

  highlightShopCard(id);

  if (window.innerWidth <= 768) {
    document.getElementById('mapSidebar').classList.add('mobile-hidden');
  }
}

function highlightShopCard(id) {
  document.querySelectorAll('.shop-list-card').forEach(card => {
    card.classList.toggle('active', card.dataset.id === id);
  });
  const card = document.querySelector(`.shop-list-card[data-id="${id}"]`);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function setupSearch() {
  const nameInput = document.getElementById('shopSearchInput');
  const locationInput = document.getElementById('locationSearchInput');
  let locationAutocomplete;

  if (typeof google !== 'undefined' && google.maps && google.maps.places) {
    locationAutocomplete = new google.maps.places.Autocomplete(locationInput, {
      types: ['(cities)'],
      componentRestrictions: { country: 'in' }
    });

    locationAutocomplete.addListener('place_changed', () => {
      const place = locationAutocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        map.setCenter(place.geometry.location);
        map.setZoom(12);
        filterShops();
      }
    });
  }

  nameInput.addEventListener('input', filterShops);
  locationInput.addEventListener('input', filterShops);
}

function filterShops() {
  const query = document.getElementById('shopSearchInput').value.toLowerCase().trim();
  const locationQuery = document.getElementById('locationSearchInput').value.toLowerCase().trim();

  let filtered = allShops.filter(s => s.location && s.location.lat && s.location.lng);

  if (query) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(query) ||
      s.owner.toLowerCase().includes(query) ||
      s.category.toLowerCase().includes(query)
    );
  }

  if (locationQuery) {
    filtered = filtered.filter(s =>
      (s.location.city && s.location.city.toLowerCase().includes(locationQuery)) ||
      (s.location.state && s.location.state.toLowerCase().includes(locationQuery)) ||
      (s.address && s.address.toLowerCase().includes(locationQuery))
    );
  }

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(s => s.category === selectedCategory);
  }

  updateShopCount(filtered.length);
  renderMarkers(filtered);
  renderShopList(filtered);

  if (filtered.length > 0) {
    const bounds = new google.maps.LatLngBounds();
    filtered.forEach(s => bounds.extend({ lat: s.location.lat, lng: s.location.lng }));
    map.fitBounds(bounds, 50);
  }
}

function setupCategoryFilters() {
  document.querySelectorAll('.cat-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.category;
      filterShops();
    });
  });
}

function setupNearMe() {
  document.getElementById('nearMeBtn')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        map.setCenter(userLocation);
        map.setZoom(12);

        new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#4285f4',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 3
          }
        });

        filterShops();
      },
      () => {
        alert('Unable to detect your location. Please allow location access.');
      }
    );
  });
}

function setupMobileToggle() {
  document.getElementById('sidebarToggle')?.addEventListener('click', () => {
    const sidebar = document.getElementById('mapSidebar');
    sidebar.classList.toggle('mobile-hidden');
  });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}
