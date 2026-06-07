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
    // 过滤无效项：数量<=0 的商品直接移除
    cart = cart.filter(item => item.qty > 0);
    wx.setStorageSync('cart', cart);

    const enriched = cart.map(item => ({
      ...item,
      checked: item.checked !== false,
      priceDisplay: '¥' + (item.price / 100).toFixed(0)
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

    // 先在原数组上找到目标，修改数量
    const cart = this.data.cart;
    const targetIdx = cart.findIndex(item => item.productId === id);
    if (targetIdx === -1) return;

    const target = cart[targetIdx];
    const newQty = target.qty + delta;

    // 数量归零：直接从数组中 splice 掉，即刻消失
    if (newQty <= 0) {
      cart.splice(targetIdx, 1);
      const empty = cart.length === 0;
      this.setData({
        cart: [...cart],
        isEmpty: empty,
        allChecked: empty ? false : this.data.allChecked,
        checkedCount: 0,
        totalAmount: 0,
        totalAmountDisplay: '¥0'
      });
      wx.setStorageSync('cart', cart);
      app.refreshCart();
      this.calcTotal();
      util.showToast('已移除商品');
      return;
    }

    // 正常增减
    const qty = Math.min(newQty, target.stock);
    const updated = { ...target, qty };
    cart.splice(targetIdx, 1, updated);
    this.setData({ cart: [...cart] });
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
