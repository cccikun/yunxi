// pages/cart/cart.js
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    cart: [],
    allChecked: true,
    totalAmount: 0,
    checkedCount: 0
  },

  onShow() {
    this.loadCart();
  },

  loadCart() {
    const cart = wx.getStorageSync('cart') || [];
    const enriched = cart.map(item => ({
      ...item,
      checked: item.checked !== false
    }));
    this.setData({ cart: enriched });
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
    const cart = this.data.cart.map(item => {
      if (item.productId === id) {
        const qty = Math.max(1, Math.min(item.qty + delta, item.stock));
        return { ...item, qty };
      }
      return item;
    });
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

    this.setData({ totalAmount, checkedCount, allChecked });
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
