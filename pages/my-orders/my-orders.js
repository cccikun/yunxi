// pages/my-orders/my-orders.js
const util = require('../../utils/util');

Page({
  data: {
    orders: [],
    util: util
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    const orders = wx.getStorageSync('orders') || [];
    // 补充显示字段
    const enriched = orders.map(o => ({
      ...o,
      items: (o.items || []).map(g => ({
        ...g,
        priceDisplay: '¥' + ((Number(g.price) || 0) / 100).toFixed(0)
      }))
    }));
    this.setData({ orders: enriched });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/order/order' });
  }
});
