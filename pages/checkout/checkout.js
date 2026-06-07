// pages/checkout/checkout.js
const app = getApp();
const util = require('../../utils/util');

Page({
  data: {
    items: [],
    address: null,
    totalAmount: 0,
    payMethod: 'wechat',
    balance: 0,
    showPayModal: false,
    submitting: false
  },

  onLoad() {
    // 从购物车中取已勾选商品
    const cart = wx.getStorageSync('cart') || [];
    const checked = cart.filter(item => item.checked && item.qty > 0);
    if (checked.length === 0) {
      util.showToast('请先在购物车中选择商品');
      setTimeout(() => wx.switchTab({ url: '/pages/cart/cart' }), 1500);
      return;
    }
    const items = checked.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image || '',
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 1,
      priceDisplay: '¥' + ((Number(item.price) || 0) / 100).toFixed(0)
    }));
    const totalAmount = items.reduce((s, i) => s + i.price * i.qty, 0);
    const balance = wx.getStorageSync('balance') || 0;
    this.setData({ items, totalAmount, balance });
  },

  // ── 选择地址 ──
  chooseAddress() {
    wx.chooseAddress({
      success: (res) => {
        this.setData({
          address: {
            name: res.userName,
            phone: res.telNumber,
            province: res.provinceName,
            city: res.cityName,
            district: res.countyName,
            detail: res.detailInfo
          }
        });
      },
      fail: (err) => {
        if (err.errMsg.indexOf('cancel') === -1) {
          wx.showModal({
            title: '需要地址权限',
            content: '请在设置中允许使用通讯录地址',
            confirmText: '去设置',
            success: (r) => { if (r.confirm) wx.openSetting(); }
          });
        }
      }
    });
  },

  // ── 选择支付方式 ──
  selectPay(e) {
    this.setData({ payMethod: e.currentTarget.dataset.method });
  },

  // ── 提交订单 → 弹窗确认支付 ──
  submitOrder() {
    if (!this.data.address) {
      util.showToast('请选择收货地址');
      return;
    }
    if (this.data.payMethod === 'balance') {
      const balance = wx.getStorageSync('balance') || 0;
      if (balance * 100 < this.data.totalAmount) {
        util.showToast('余额不足，请充值或选择微信支付');
        return;
      }
    }
    this.setData({ showPayModal: true });
  },

  // ── 确认支付 ──
  confirmPay() {
    this.setData({ showPayModal: false, submitting: true });

    const orderId = 'ORD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // 余额支付：扣余额
    if (this.data.payMethod === 'balance') {
      const balance = (wx.getStorageSync('balance') || 0) - this.data.totalAmount / 100;
      wx.setStorageSync('balance', Math.max(0, balance));
      app.globalData.balance = Math.max(0, balance);
    }

    // 创建订单
    const order = {
      _id: orderId,
      items: this.data.items,
      address: this.data.address,
      totalAmount: this.data.totalAmount,
      payMethod: this.data.payMethod,
      status: 'paid',
      createdAt: Date.now()
    };

    // 存储订单
    const orders = wx.getStorageSync('orders') || [];
    orders.unshift(order);
    wx.setStorageSync('orders', orders);

    // 清除购物车中已结算商品
    let cart = wx.getStorageSync('cart') || [];
    const paidIds = this.data.items.map(i => i.productId);
    cart = cart.filter(item => !paidIds.includes(item.productId));
    wx.setStorageSync('cart', cart);
    app.refreshCart();

    this.setData({ submitting: false });

    // 跳转支付成功页
    wx.showModal({
      title: '支付成功',
      content: `订单号：${orderId}\n金额：¥${(this.data.totalAmount / 100).toFixed(0)}\n支付方式：${this.data.payMethod === 'wechat' ? '微信支付' : '余额支付'}`,
      confirmText: '查看订单',
      cancelText: '返回首页',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({ url: '/pages/my-orders/my-orders' });
        } else {
          wx.switchTab({ url: '/pages/index/index' });
        }
      }
    });
  },

  // ── 取消支付 ──
  cancelPay() {
    this.setData({ showPayModal: false });
  }
});
