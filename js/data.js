// ========== DATA MANAGEMENT WITH MONGODB API ==========

const API = '/api';

// XSS Protection - escape HTML entities
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Generic fetch helper
async function api(url, options = {}) {
  try {
    const res = await fetch(API + url, {
      ...options,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'API error');
    }
    return res.json();
  } catch (err) {
    console.error('API Error:', err.message);
    throw err;
  }
}

const DB = {
  // ========== SHOPS ==========
  async getShops() { return api('/shops'); },
  async getShop(id) { return api('/shops/' + id); },
  async addShop(data) { return api('/shops', { method: 'POST', body: JSON.stringify(data) }); },
  async updateShop(id, data) { return api('/shops/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteShop(id) { return api('/shops/' + id, { method: 'DELETE' }); },

  // ========== CATEGORIES ==========
  async getCategories() { return api('/categories'); },
  async addCategory(data) { return api('/categories', { method: 'POST', body: JSON.stringify(data) }); },
  async updateCategory(id, data) { return api('/categories/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteCategory(id) { return api('/categories/' + id, { method: 'DELETE' }); },

  // ========== TESTIMONIALS ==========
  async getTestimonials() { return api('/testimonials'); },
  async addTestimonial(data) { return api('/testimonials', { method: 'POST', body: JSON.stringify(data) }); },
  async updateTestimonial(id, data) { return api('/testimonials/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteTestimonial(id) { return api('/testimonials/' + id, { method: 'DELETE' }); },
  async getReplies(id) { return api('/testimonials/' + id + '/replies'); },
  async addReply(id, reply) { return api('/testimonials/' + id + '/reply', { method: 'POST', body: JSON.stringify({ reply }) }); },

  // ========== INQUIRIES ==========
  async getInquiries() { return api('/inquiries'); },
  async addInquiry(data) { return api('/inquiries', { method: 'POST', body: JSON.stringify(data) }); },
  async updateInquiry(id, data) { return api('/inquiries/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteInquiry(id) { return api('/inquiries/' + id, { method: 'DELETE' }); },

  // ========== TASKS ==========
  async getTasks() { return api('/tasks'); },
  async addTask(data) { return api('/tasks', { method: 'POST', body: JSON.stringify(data) }); },
  async updateTask(id, data) { return api('/tasks/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteTask(id) { return api('/tasks/' + id, { method: 'DELETE' }); },

  // ========== NOTES ==========
  async getNotes() { return api('/notes'); },
  async addNote(data) { return api('/notes', { method: 'POST', body: JSON.stringify(data) }); },
  async updateNote(id, data) { return api('/notes/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteNote(id) { return api('/notes/' + id, { method: 'DELETE' }); },

  // ========== EVENTS ==========
  async getEvents() { return api('/events'); },
  async addEvent(data) { return api('/events', { method: 'POST', body: JSON.stringify(data) }); },
  async updateEvent(id, data) { return api('/events/' + id, { method: 'PUT', body: JSON.stringify(data) }); },
  async deleteEvent(id) { return api('/events/' + id, { method: 'DELETE' }); },

  // ========== SETTINGS ==========
  async getSettings() { return api('/settings'); },
  async updateSettings(data) { return api('/settings', { method: 'PUT', body: JSON.stringify(data) }); },

  // ========== ANALYTICS ==========
  async getShopAnalytics(shopId, days) { return api('/analytics/' + shopId + '?days=' + (days || 7)); },
  async getAnalyticsOverview() { return api('/analytics/overview/all'); },

  // ========== ADMIN ==========
  async resetData() { return api('/admin/reset', { method: 'POST' }); }
};
