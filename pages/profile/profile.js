// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    balance: 0,
    points: 0
  },

  onShow() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const balance = wx.getStorageSync('balance') || 0;
    const memberInfo = app.globalData.memberInfo || {};
    this.setData({
      userInfo: userInfo,
      balance: balance,
      points: memberInfo.points || 0
    });
  },

  // 跳转常用功能
  goPage(e) {
    const page = e.currentTarget.dataset.page;
    const pageMap = {
      'my-orders': '/pages/my-orders/my-orders',
      'coupon': '/pages/coupon/coupon',
      'recharge': '/pages/recharge/recharge',
      'wheel': '/pages/wheel/wheel'
    };
    wx.navigateTo({ url: pageMap[page] });
  },

  // 跳转后台管理
  goAdmin(e) {
    const page = e.currentTarget.dataset.page;
    const pageMap = {
      'products': '/pages/admin-products/admin-products',
      'orders': '/pages/admin-orders/admin-orders',
      'inventory': '/pages/admin-inventory/admin-inventory',
      'members': '/pages/admin-members/admin-members',
      'stats': '/pages/admin-inventory/admin-inventory',
      'settings': '/pages/admin-inventory/admin-inventory'
    };
    const target = pageMap[page];
    if (target) {
      wx.navigateTo({ url: target });
    }
  }
});
