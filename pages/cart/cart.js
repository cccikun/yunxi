// pages/cart/cart.js
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    cart: [],
    isEmpty: true,
    allChecked: true,
    totalAmount: 0,
    checkedCount: 0
  },

  onShow() {
    this.loadCart();
  },

  loadCart() {
    let cart = wx.getStorageSync('cart') || [];

    // 过滤+修复无效项
    cart = cart.filter(item => {
      if (!item || typeof item !== 'object') return false;
      if (!item.productId || !item.name) return false;
      // 修复 null/undefined/NaN 的数量
      if (item.qty == null || isNaN(item.qty)) item.qty = 1;
      if (item.price == null || isNaN(item.price)) item.price = 0;
      if (item.stock == null || isNaN(item.stock)) item.stock = 99;
      return item.qty > 0;
    });
    wx.setStorageSync('cart', cart);

    const enriched = cart.map(item => ({
      ...item,
      checked: item.checked !== false,
      priceDisplay: '¥' + ((item.price || 0) / 100).toFixed(0)
    }));
    this.setData({ cart: enriched, isEmpty: enriched.length === 0 });
    this.calcTotal();
  },

  toggleCheck(e) {
    const id = e.currentTarget.dataset.id;
    const cart = this.data.cart.map(item =>
      item.productId === id ? { ...item, checked: !item.checked } : item
    );
    this.setData({ cart });
    wx.setStorageSync('cart', cart);
    this.calcTotal();
  },

  toggleAll() {
    const allChecked = !this.data.allChecked;
    const cart = this.data.cart.map(item => ({ ...item, checked: allChecked }));
    this.setData({ cart, allChecked });
    wx.setStorageSync('cart', cart);
    this.calcTotal();
  },

  changeQty(e) {
    const { id, delta } = e.currentTarget.dataset;

    // 找到目标商品索引
    const targetIdx = this.data.cart.findIndex(item => item.productId === id);
    if (targetIdx === -1) return;

    const target = this.data.cart[targetIdx];
    const newQty = (target.qty || 0) + delta;

    // 数量归零：直接过滤掉该项
    if (newQty <= 0) {
      const cart = this.data.cart.filter(item => item.productId !== id);
      const empty = cart.length === 0;
      this.setData({
        cart,
        isEmpty: empty,
        ...(empty ? { allChecked: false, checkedCount: 0, totalAmount: 0, totalAmountDisplay: '¥0' } : {})
      });
      wx.setStorageSync('cart', cart);
      app.refreshCart();
      if (!empty) this.calcTotal();
      util.showToast('已移除商品');
      return;
    }

    // 正常增减：构建新数组（不修改原数组）
    const qty = Math.min(newQty, target.stock);
    const cart = [...this.data.cart];
    cart[targetIdx] = { ...target, qty };
    this.setData({ cart });
    wx.setStorageSync('cart', cart);
    app.refreshCart();
    this.calcTotal();
  },

  calcTotal() {
    let totalAmount = 0;
    let checkedCount = 0;
    let allChecked = this.data.cart.length > 0;

    this.data.cart.forEach(item => {
      if (item.checked) {
        totalAmount += item.price * item.qty;
        checkedCount += item.qty;
      } else {
        allChecked = false;
      }
    });

    this.setData({
      totalAmount,
      checkedCount,
      allChecked,
      isEmpty: this.data.cart.length === 0,
      totalAmountDisplay: '¥' + (totalAmount / 100).toFixed(0)
    });
  },

  goCheckout() {
    if (this.data.checkedCount === 0) {
      util.showToast('请选择商品');
      return;
    }
    wx.navigateTo({ url: '/pages/checkout/checkout' });
  },

  goOrder() {
    wx.switchTab({ url: '/pages/order/order' });
  }
});
