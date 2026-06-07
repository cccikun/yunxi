// pages/admin-products/admin-products.js
const productService = require('../../utils/product');
const util = require('../../utils/util');

Page({
  data: {
    keyword: '',
    products: [],
    totalCount: 0,
    onsaleCount: 0
  },

  onShow() {
    this.loadProducts();
  },

  // ── 数据加载 ──
  loadProducts() {
    let list = productService.getAll();
    const totalCount = list.length;
    const onsaleCount = list.filter(p => p.isOnSale).length;

    if (this.data.keyword) {
      const kw = this.data.keyword.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(kw));
    }

    list.sort((a, b) => b.createdAt - a.createdAt);

    // 预计算显示字段
    list = list.map(p => ({
      ...p,
      priceDisplay: '¥' + (p.price / 100).toFixed(0),
      origPriceDisplay: p.originalPrice && p.originalPrice > p.price ? '¥' + (p.originalPrice / 100).toFixed(0) : '',
      salesDisplay: p.sales > 999 ? (p.sales / 1000).toFixed(1) + 'k' : String(p.sales || 0)
    }));

    this.setData({ products: list, totalCount, onsaleCount });
  },

  // ── 搜索 ──
  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.loadProducts();
  },

  // ── 新增商品 ──
  showAddForm() {
    wx.showModal({
      title: '新增商品',
      editable: true,
      placeholderText: '输入商品名称',
      success: (res) => {
        if (!res.confirm || !res.content.trim()) return;
        const name = res.content.trim();

        // 输入价格
        wx.showModal({
          title: '设置价格（元）',
          editable: true,
          placeholderText: '例如 26',
          success: (r2) => {
            if (!r2.confirm || !r2.content) return;
            const priceYuan = parseFloat(r2.content);
            if (isNaN(priceYuan) || priceYuan <= 0) {
              util.showToast('价格无效');
              return;
            }
            const price = Math.round(priceYuan * 100);

            // 选择分类
            const categories = productService.getCategories().filter(c => c !== '全部');
            wx.showActionSheet({
              itemList: categories,
              success: (r3) => {
                const category = categories[r3.tapIndex];
                productService.add({ name, price, category, stock: 99 });
                util.showToast('添加成功', 'success');
                this.loadProducts();
              }
            });
          }
        });
      }
    });
  },

  // ── 调整价格 ──
  editPrice(e) {
    const { id, price } = e.currentTarget.dataset;
    const product = productService.getById(id);
    if (!product) return;

    wx.showModal({
      title: `调价 - ${product.name}`,
      content: `当前价格：¥${(price / 100).toFixed(0)}`,
      editable: true,
      placeholderText: '输入新价格（元）',
      success: (res) => {
        if (!res.confirm || !res.content) return;
        const newPrice = Math.round(parseFloat(res.content) * 100);
        if (isNaN(newPrice) || newPrice <= 0) {
          util.showToast('价格无效');
          return;
        }
        productService.update(id, { price: newPrice, originalPrice: price });
        util.showToast('调价成功', 'success');
        this.loadProducts();
      }
    });
  },

  // ── 上传图片 ──
  changeImage(e) {
    const id = e.currentTarget.dataset.id;

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;

        // 小程序本地版：将图片转 base64 存入 storage
        wx.getFileSystemManager().readFile({
          filePath: tempPath,
          encoding: 'base64',
          success: (fileRes) => {
            const base64 = 'data:image/jpeg;base64,' + fileRes.data;

            // 更新商品图片
            if (id) {
              productService.update(id, { image: base64 });
              util.showToast('图片上传成功', 'success');
              this.loadProducts();
            }
          },
          fail: () => {
            // 降级：直接存临时路径（仅本次运行有效）
            if (id) {
              productService.update(id, { image: tempPath });
              util.showToast('图片已添加（重启后需重新上传）', 'success');
              this.loadProducts();
            }
          }
        });
      }
    });
  },

  // ── 上下架 ──
  toggleOnSale(e) {
    const id = e.currentTarget.dataset.id;
    const newState = productService.toggleOnSale(id);
    if (newState !== null) {
      util.showToast(newState ? '已上架' : '已下架', 'success');
      this.loadProducts();
    }
  }
});
