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

  // ── 加载购物车 ──
  loadCart() {
    const raw = wx.getStorageSync('cart') || [];
    // 只保留合法商品（qty 必须是有效正整数）
    const valid = raw.filter(item => {
      if (!item || !item.productId || !item.name) return false;
      const qty = Number(item.qty);
      return !isNaN(qty) && qty > 0;
    });
    wx.setStorageSync('cart', valid);

    const cart = valid.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image || '',
      price: Number(item.price) || 0,
      qty: Number(item.qty) || 1,
      stock: Number(item.stock) || 99,
      spec: item.spec || '',
      checked: item.checked !== false,
      priceDisplay: '¥' + ((Number(item.price) || 0) / 100).toFixed(0)
    }));

    this.setData({ cart, isEmpty: cart.length === 0 });
    this.calcTotal();
  },

  // ── 切换勾选 ──
  toggleCheck(e) {
    const id = e.currentTarget.dataset.id;
    const cart = this.data.cart.map(item =>
      item.productId === id ? { ...item, checked: !item.checked } : item
    );
    this.setData({ cart });
    this._save(cart);
    this.calcTotal();
  },

  // ── 全选/取消 ──
  toggleAll() {
    const allChecked = !this.data.allChecked;
    const cart = this.data.cart.map(item => ({ ...item, checked: allChecked }));
    this.setData({ cart, allChecked });
    this._save(cart);
    this.calcTotal();
  },

  // ── 修改数量 ──
  changeQty(e) {
    const { id, delta } = e.currentTarget.dataset;
    const idx = this.data.cart.findIndex(item => item.productId === id);
    if (idx === -1) return;

    const target = this.data.cart[idx];
    const curQty = Number(target.qty) || 0;
    const newQty = curQty + delta;

    // 数量归零 → 直接从数组中移除
    if (newQty <= 0) {
      // 直接用下标切掉（filter 有时不会被 WeChat 检测到变化）
      const cart = [...this.data.cart];
      cart.splice(idx, 1);
      const empty = cart.length === 0;
      // 先置空，再赋值，强制触发视图全量刷新
      this.setData({ cart: [], isEmpty: true }, () => {
        this.setData({
          cart,
          isEmpty: empty,
          allChecked: empty ? false : this.data.allChecked,
          checkedCount: 0,
          totalAmount: 0,
          totalAmountDisplay: '¥0'
        });
      });
      this._save(cart);
      app.refreshCart();
      util.showToast('已移除商品');
      return;
    }

    // 正常增减
    const qty = Math.min(newQty, target.stock);
    const cart = [...this.data.cart];
    cart[idx] = { ...target, qty };
    this.setData({ cart });
    this._save(cart);
    app.refreshCart();
    this.calcTotal();
  },

  // ── 写存储（只保留必要字段） ──
  _save(cart) {
    const clean = cart.map(item => ({
      productId: item.productId,
      name: item.name,
      image: item.image || '',
      price: item.price,
      qty: item.qty,
      stock: item.stock,
      spec: item.spec || '',
      checked: item.checked
    }));
    wx.setStorageSync('cart', clean);
  },

  // ── 计算总价 ──
  calcTotal() {
    let totalAmount = 0;
    let checkedCount = 0;
    let allChecked = this.data.cart.length > 0;

    this.data.cart.forEach(item => {
      const qty = Number(item.qty) || 0;
      if (item.checked) {
        totalAmount += (Number(item.price) || 0) * qty;
        checkedCount += qty;
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
