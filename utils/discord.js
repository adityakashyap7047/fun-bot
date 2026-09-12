const axios = require('axios');

// Per-channel webhook URLs
const WEBHOOKS = {
  shopCreated:      process.env.DISCORD_SHOP_CREATED,
  shopUpdated:      process.env.DISCORD_SHOP_UPDATED,
  statusChanged:    process.env.DISCORD_STATUS_CHANGED,
  categoryCreated:  process.env.DISCORD_CATEGORY_CREATED,
  shopDeleted:      process.env.DISCORD_SHOP_DELETED,
  inquiryCreated:   process.env.DISCORD_INQUIRY_CREATED,
  inquiryDeleted:   process.env.DISCORD_INQUIRY_DELETED,
  reviewCreated:    process.env.DISCORD_REVIEW_CREATED,
  taskCreated:      process.env.DISCORD_TASK_CREATED,
  taskCompleted:    process.env.DISCORD_TASK_COMPLETED,
  noteCreated:      process.env.DISCORD_NOTE_CREATED,
  eventCreated:     process.env.DISCORD_EVENT_CREATED,
  botTester:        process.env.DISCORD_BOT_TESTER
};

// Color codes for embeds
const COLORS = {
  green:  0x00b894,
  blue:   0x6c5ce7,
  orange: 0xfdcb6e,
  red:    0xe17055,
  pink:   0xfd79a8,
  teal:   0x00cec9,
  purple: 0x8b5cf6
};

// Send Discord Embed to a specific channel webhook
async function sendToChannel(webhookUrl, title, description, color = COLORS.green, fields = []) {
  if (!webhookUrl || webhookUrl.includes('YOUR_WEBHOOK')) {
    return;
  }

  const embed = {
    title,
    description,
    color,
    timestamp: new Date().toISOString(),
    footer: { text: 'ShopLocal Admin Panel' },
    fields: fields.map(f => ({
      name: f.name,
      value: f.value,
      inline: f.inline !== undefined ? f.inline : true
    }))
  };

  try {
    await axios.post(webhookUrl, {
      username: 'ShopLocal Bot',
      avatar_url: 'https://img.icons8.com/color/96/shop.png',
      content: '@everyone',
      embeds: [embed]
    });
    console.log(`✅ Discord: ${title}`);
  } catch (err) {
    console.error(`❌ Discord failed (${title}):`, err.message);
  }
}

// Send embed to ALL configured channels (broadcast/announcement)
async function broadcastToAll(title, description, color = COLORS.purple, fields = []) {
  const allUrls = Object.values(WEBHOOKS).filter(u => u && !u.includes('YOUR_WEBHOOK'));
  if (allUrls.length === 0) {
    console.log('⚠️ No Discord webhooks configured. Skipping broadcast.');
    return;
  }

  const embed = {
    title,
    description,
    color,
    timestamp: new Date().toISOString(),
    footer: { text: 'ShopLocal Admin Panel' },
    fields: fields.map(f => ({
      name: f.name,
      value: f.value,
      inline: f.inline !== undefined ? f.inline : true
    }))
  };

  const results = await Promise.allSettled(
    allUrls.map(url =>
      axios.post(url, {
        username: 'ShopLocal Bot',
        avatar_url: 'https://img.icons8.com/color/96/shop.png',
        content: '@everyone',
        embeds: [embed]
      })
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  console.log(`📢 Broadcast sent to ${sent} channels${failed ? ` (${failed} failed)` : ''}`);
}

// ========== SHOP NOTIFICATIONS ==========
async function shopCreated(shop) {
  await sendToChannel(WEBHOOKS.shopCreated,
    '🏪 New Shop Listed!',
    `**${shop.name}** has been registered on ShopLocal.`,
    COLORS.green,
    [
      { name: 'Owner', value: shop.owner },
      { name: 'Category', value: shop.category },
      { name: 'Phone', value: shop.phone },
      { name: 'Plan', value: shop.plan.toUpperCase(), inline: false }
    ]
  );
}

async function shopUpdated(shop) {
  await sendToChannel(WEBHOOKS.shopUpdated,
    '📝 Shop Updated',
    `**${shop.name}** details have been updated.`,
    COLORS.blue,
    [
      { name: 'Owner', value: shop.owner },
      { name: 'Status', value: shop.status },
      { name: 'Plan', value: shop.plan.toUpperCase() }
    ]
  );
}

async function shopDeleted(shopName) {
  await sendToChannel(WEBHOOKS.shopDeleted,
    '🗑️ Shop Removed',
    `**${shopName}** has been removed from ShopLocal.`,
    COLORS.red
  );
}

async function shopStatusChanged(shop, oldStatus) {
  const statusColors = { active: COLORS.green, pending: COLORS.orange, inactive: COLORS.red };
  await sendToChannel(WEBHOOKS.statusChanged,
    '🔄 Shop Status Changed',
    `**${shop.name}** status changed from \`${oldStatus}\` to \`${shop.status}\`.`,
    statusColors[shop.status] || COLORS.blue,
    [
      { name: 'Shop', value: shop.name },
      { name: 'Old Status', value: oldStatus },
      { name: 'New Status', value: shop.status }
    ]
  );
}

// ========== INQUIRY NOTIFICATIONS ==========
async function inquiryCreated(inquiry) {
  await sendToChannel(WEBHOOKS.inquiryCreated,
    '📩 New Inquiry Received!',
    `**${inquiry.shopName}** wants to list their shop on ShopLocal.`,
    COLORS.teal,
    [
      { name: 'Owner', value: inquiry.ownerName },
      { name: 'Phone', value: inquiry.phone },
      { name: 'Category', value: inquiry.category || 'Not specified' },
      { name: 'Message', value: inquiry.description || 'No message', inline: false }
    ]
  );
}

async function inquiryDeleted() {
  await sendToChannel(WEBHOOKS.inquiryDeleted,
    '🗑️ Inquiry Removed',
    'An inquiry has been removed from the system.',
    COLORS.red
  );
}

// ========== TESTIMONIAL NOTIFICATIONS ==========
async function testimonialCreated(test) {
  const stars = '⭐'.repeat(test.rating);
  await sendToChannel(WEBHOOKS.reviewCreated,
    '⭐ New Review Received!',
    `**${test.name}** left a review for **${test.shop}**.`,
    COLORS.orange,
    [
      { name: 'Rating', value: stars },
      { name: 'Review', value: test.review.substring(0, 200), inline: false }
    ]
  );
}

// ========== TASK NOTIFICATIONS ==========
async function taskCreated(task) {
  const priorityEmoji = { high: '🔴', medium: '🟡', low: '🔵' };
  await sendToChannel(WEBHOOKS.taskCreated,
    '✅ New Task Created',
    `**${task.title}** has been added to the task board.`,
    COLORS.blue,
    [
      { name: 'Priority', value: `${priorityEmoji[task.priority] || ''} ${task.priority}` },
      { name: 'Due Date', value: task.dueDate || 'No deadline' }
    ]
  );
}

async function taskCompleted(task) {
  await sendToChannel(WEBHOOKS.taskCompleted,
    '🎉 Task Completed!',
    `**${task.title}** has been marked as done.`,
    COLORS.green
  );
}

// ========== CATEGORY NOTIFICATIONS ==========
async function categoryCreated(cat) {
  await sendToChannel(WEBHOOKS.categoryCreated,
    '📁 New Category Added',
    `**${cat.name}** category has been created.`,
    COLORS.pink,
    [{ name: 'Icon', value: cat.icon }]
  );
}

// ========== NOTE NOTIFICATIONS ==========
async function noteCreated(note) {
  await sendToChannel(WEBHOOKS.noteCreated,
    '📝 New Note Added',
    `**${note.title}** has been created.`,
    COLORS.blue
  );
}

// ========== EVENT NOTIFICATIONS ==========
async function eventCreated(event) {
  await sendToChannel(WEBHOOKS.eventCreated,
    '📅 New Event Scheduled',
    `**${event.title}** has been added to the calendar.`,
    COLORS.teal,
    [
      { name: 'Date', value: event.date },
      { name: 'Time', value: event.time || 'All day' },
      { name: 'Type', value: event.type }
    ]
  );
}

// ========== ONBOARDING NOTIFICATION ==========
async function onboardingCompleted(data) {
  await sendToChannel(WEBHOOKS.botTester,
    '🚀 New Partner Onboarded!',
    `A new shop owner has completed registration.`,
    COLORS.green,
    [
      { name: 'Owner', value: data.ownerName },
      { name: 'Shop', value: data.shopName },
      { name: 'Category', value: data.category },
      { name: 'Phone', value: data.phone }
    ]
  );
}

// ========== DAILY SUMMARY ==========
async function dailySummary(stats) {
  await broadcastToAll(
    '📊 Daily Summary',
    'Here\'s today\'s overview of ShopLocal.',
    COLORS.blue,
    [
      { name: 'Total Shops', value: String(stats.totalShops) },
      { name: 'Active Shops', value: String(stats.activeShops) },
      { name: 'New Inquiries', value: String(stats.newInquiries) },
      { name: 'Total Reviews', value: String(stats.totalReviews) },
      { name: 'Open Tasks', value: String(stats.openTasks) }
    ]
  );
}

// ========== ANNOUNCEMENT / BROADCAST ==========
async function sendAnnouncement(title, message, color = COLORS.purple, fields = []) {
  await broadcastToAll(
    `📢 ${title}`,
    message,
    color,
    fields
  );
}

// ========== TEST: Send to bot-tester-feed ==========
async function testNotification() {
  await sendToChannel(WEBHOOKS.botTester,
    '🧪 Test Notification',
    'Bot is working! This is a test message.',
    COLORS.teal,
    [{ name: 'Status', value: 'Connected ✅' }]
  );
}

module.exports = {
  COLORS,
  WEBHOOKS,
  sendToChannel,
  broadcastToAll,
  shopCreated,
  shopUpdated,
  shopDeleted,
  shopStatusChanged,
  inquiryCreated,
  inquiryDeleted,
  testimonialCreated,
  taskCreated,
  taskCompleted,
  categoryCreated,
  noteCreated,
  eventCreated,
  onboardingCompleted,
  dailySummary,
  sendAnnouncement,
  testNotification
};
