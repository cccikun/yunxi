// app.js - 云溪小程序入口
App({
  onLaunch() {
    // 初始化本地存储数据
    this.initStorage();
    // 检查登录状态
    this.checkLogin();
  },

  // 全局数据
  globalData: {
    userInfo: null,           // 用户信息
    isLogin: false,           // 登录状态
    cartCount: 0,             // 购物车数量
    cartItems: [],            // 购物车商品
    balance: 0,               // 账户余额
    coupons: [],              // 优惠券列表
    selectedAddress: null     // 选中地址
  },

  // 初始化本地存储
  initStorage() {
    const cart = wx.getStorageSync('cart') || [];
    const balance = wx.getStorageSync('balance') || 0;
    const coupons = wx.getStorageSync('coupons') || [];
    this.globalData.cartItems = cart;
    this.globalData.balance = balance;
    this.globalData.coupons = coupons;
    this.updateCartCount();
  },

  // 检查登录
  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
      this.globalData.isLogin = true;
    }
  },

  // 更新购物车角标
  updateCartCount() {
    const total = this.globalData.cartItems.reduce((sum, item) => sum + item.qty, 0);
    this.globalData.cartCount = total;
    if (total > 0) {
      wx.setTabBarBadge({ index: 2, text: total > 99 ? '99+' : String(total) });
    } else {
      wx.removeTabBarBadge({ index: 2 });
    }
  },

  // 刷新购物车
  refreshCart() {
    const cart = wx.getStorageSync('cart') || [];
    this.globalData.cartItems = cart;
    this.updateCartCount();
  }
});
