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
    let cart = wx.getStorageSync('cart') || [];
    // 过滤无效项：数量<=0 的商品直接移除
    cart = cart.filter(item => item.qty > 0);
    wx.setStorageSync('cart', cart);

    const enriched = cart.map(item => ({
      ...item,
      checked: item.checked !== false,
      priceDisplay: '¥' + (item.price / 100).toFixed(0)
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
    let removed = false;

    const cart = this.data.cart.reduce((arr, item) => {
      if (item.productId === id) {
        const newQty = item.qty + delta;
        // 数量为0时移除商品
        if (newQty <= 0) {
          removed = true;
          return arr;
        }
        const qty = Math.min(newQty, item.stock);
        arr.push({ ...item, qty });
      } else {
        arr.push(item);
      }
      return arr;
    }, []);

    this.setData({ cart });
    wx.setStorageSync('cart', cart);
    app.refreshCart();
    this.calcTotal();

    if (removed) {
      util.showToast('已移除商品');
    }
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
