const Shop = require('./models/Shop');
const Category = require('./models/Category');
const Testimonial = require('./models/Testimonial');
const Inquiry = require('./models/Inquiry');
const Task = require('./models/Task');
const Note = require('./models/Note');
const Event = require('./models/Event');
const Setting = require('./models/Setting');

async function seedData() {
  try {
    // Ensure admin settings exist
    let settingCount = 0;
    try {
      settingCount = await Setting.countDocuments();
    } catch (e) {
      console.log('⏳ Waiting for MongoDB connection...');
      return;
    }

    if (settingCount === 0) {
      const adminUser = process.env.ADMIN_USERNAME || 'admin';
      const adminPass = process.env.ADMIN_PASSWORD;
      if (!adminPass) {
        console.error('❌ ADMIN_PASSWORD not set in .env file!');
        return;
      }
      await Setting.create({ username: adminUser, password: adminPass });
      console.log(`Admin account created (${adminUser})`);
    }

    const shopCount = await Shop.countDocuments();
    if (shopCount > 0) {
      console.log('📦 Database already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding database...');

    // Categories
    await Category.insertMany([
      { name: 'Food & Drinks', icon: 'fas fa-utensils' },
      { name: 'Fashion', icon: 'fas fa-tshirt' },
      { name: 'Grocery', icon: 'fas fa-shopping-basket' },
      { name: 'Beauty', icon: 'fas fa-spa' },
      { name: 'Services', icon: 'fas fa-tools' },
      { name: 'Electronics', icon: 'fas fa-laptop' }
    ]);

    // Shops
    await Shop.insertMany([
      { name: 'Taste of India', owner: 'Rajesh Kumar', category: 'Food & Drinks', phone: '+91 98765 43210', address: '45 MG Road, Delhi', description: 'Authentic Indian cuisine with a modern twist.', status: 'active', plan: 'pro' },
      { name: 'Fashion Hub', owner: 'Priya Sharma', category: 'Fashion', phone: '+91 87654 32109', address: '12 Fashion Street, Mumbai', description: 'Trendy clothing and accessories.', status: 'active', plan: 'enterprise' },
      { name: 'Fresh Mart', owner: 'Amit Patel', category: 'Grocery', phone: '+91 76543 21098', address: '78 Green Avenue, Bangalore', description: 'Fresh vegetables, fruits, and daily essentials.', status: 'active', plan: 'basic' },
      { name: 'Glow Beauty Salon', owner: 'Sneha Reddy', category: 'Beauty', phone: '+91 65432 10987', address: '23 Beauty Lane, Hyderabad', description: 'Premium beauty and wellness services.', status: 'pending', plan: 'pro' },
      { name: 'Tech Solutions', owner: 'Vikram Singh', category: 'Electronics', phone: '+91 54321 09876', address: '90 Tech Park, Pune', description: 'Computer and mobile repair services.', status: 'active', plan: 'basic' },
      { name: 'Spice Garden', owner: 'Anita Desai', category: 'Food & Drinks', phone: '+91 43210 98765', address: '56 Spice Market, Jaipur', description: 'Traditional spices and ready-to-eat food.', status: 'active', plan: 'enterprise' }
    ]);

    // Testimonials
    await Testimonial.insertMany([
      { name: 'Rajesh Kumar', shop: 'Taste of India', rating: 5, review: 'ShopLocal has been amazing for my business! Saw a 40% increase in customers within a week.' },
      { name: 'Priya Sharma', shop: 'Fashion Hub', rating: 5, review: 'The investment was totally worth it. My shop now gets visibility from customers I could never reach.' },
      { name: 'Amit Patel', shop: 'Fresh Mart', rating: 4, review: 'Great platform for local businesses. The admin panel makes it easy to manage my listing.' },
      { name: 'Sneha Reddy', shop: 'Glow Beauty Salon', rating: 5, review: 'The Pro plan is fantastic! Social media promotion brought in so many new clients.' }
    ]);

    // Inquiries
    await Inquiry.insertMany([
      { shopName: 'Pizza Palace', ownerName: 'Mohit Verma', phone: '+91 11111 22222', category: 'Food & Drinks', address: '15 Food Court, Noida', description: 'Want to list my pizza shop' },
      { shopName: 'Style Studio', ownerName: 'Kavita Joshi', phone: '+91 33333 44444', category: 'Fashion', address: '8 Mall Road, Chandigarh', description: 'Interested in Pro plan' }
    ]);

    // Tasks
    await Task.insertMany([
      { title: 'Follow-up with Pizza Palace', description: 'Call Mohit about listing', priority: 'high', done: false, dueDate: '2026-09-15' },
      { title: 'Update shop photos for Fashion Hub', description: 'Priya sent new collection photos', priority: 'medium', done: false, dueDate: '2026-09-16' },
      { title: 'Process Glow Beauty payment', description: '₹299 Pro plan renewal', priority: 'high', done: false, dueDate: '2026-09-14' },
      { title: 'Send weekly newsletter', description: 'Include new shop listings', priority: 'low', done: true, dueDate: '2026-09-13' }
    ]);

    // Notes
    await Note.insertMany([
      { title: 'Marketing Ideas', content: '1. Run Instagram ads\n2. Partner with food bloggers\n3. Create shop owner testimonials', color: '#6c5ce7' },
      { title: 'Pricing Feedback', content: 'Customers love the ₹99 plan. Consider keeping it as an entry point.', color: '#00b894' },
      { title: 'Bug Report', content: 'Shop images not loading on mobile for some listings.', color: '#e17055' }
    ]);

    // Events
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    await Event.insertMany([
      { title: 'Team standup', time: '09:00-09:30', type: 'meeting', date: fmt(today) },
      { title: 'Client call', time: '14:00-15:00', type: 'call', date: fmt(today) },
      { title: 'Review shop applications', time: '10:00-11:00', type: 'meeting', date: fmt(new Date(today.getTime() + 86400000)) }
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
  }
}

module.exports = seedData;
