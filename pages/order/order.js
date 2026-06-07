// pages/order/order.js
const productService = require('../../utils/product');
const util = require('../../utils/util');
const app = getApp();

Page({
  data: {
    categories: productService.getCategories(),
    current: '全部',
    keyword: '',
    products: [],
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadProducts();
  },

  onShow() {
    // 刷新购物车角标
    app.refreshCart();
  },

  // 切换分类
  switchCategory(e) {
    const cate = e.currentTarget.dataset.cate;
    if (cate === this.data.current) return;
    this.setData({ current: cate, products: [], page: 1, hasMore: true });
    this.loadProducts();
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  // 执行搜索
  onSearch() {
    this.setData({ products: [], page: 1, hasMore: true });
    this.loadProducts();
  },

  // 加载商品
  loadProducts() {
    const res = productService.getOnSale({
      category: this.data.current,
      keyword: this.data.keyword || undefined,
      page: this.data.page,
      pageSize: 10
    });

    // 预计算显示字段（WXML 不支持方法调用）
    const enriched = res.list.map(p => ({
      ...p,
      priceDisplay: '¥' + (p.price / 100).toFixed(0),
      origPriceDisplay: p.originalPrice && p.originalPrice > p.price ? '¥' + (p.originalPrice / 100).toFixed(0) : '',
      salesDisplay: p.sales > 999 ? (p.sales / 1000).toFixed(1) + 'k' : String(p.sales)
    }));

    this.setData({
      products: this.data.products.concat(enriched),
      hasMore: res.hasMore,
      page: res.page + 1
    });
  },

  // 加入购物车
  addToCart(e) {
    const product = e.currentTarget.dataset.item;

    if (!product || product.stock <= 0) {
      util.showToast('商品暂时缺货');
      return;
    }

    let cart = wx.getStorageSync('cart') || [];
    const idx = cart.findIndex(item => item.productId === product._id);
    if (idx >= 0) {
      if (cart[idx].qty >= product.stock) {
        util.showToast('已达库存上限');
        return;
      }
      cart[idx].qty += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        image: product.image || '',
        price: product.price,
        qty: 1,
        stock: product.stock
      });
    }

    wx.setStorageSync('cart', cart);
    app.refreshCart();

    // 加购动画反馈
    wx.showToast({ title: '已加入购物车', icon: 'success', duration: 1000 });
  },

  // 查看商品详情
  showDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: '详情页开发中', icon: 'none' });
  },

  // 触底加载
  onReachBottom() {
    if (this.data.hasMore) {
      this.loadProducts();
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ products: [], page: 1, hasMore: true });
    this.loadProducts();
    wx.stopPullDownRefresh();
  }
});
