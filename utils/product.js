// utils/product.js — 商品数据服务（本地存储版）

const STORAGE_KEY = 'yunxi_products';

// 种子数据
const SEED_PRODUCTS = [
  { _id: 'p001', name: '云溪拿铁',       desc: '意式浓缩+鲜牛乳+云溪秘制糖浆',       price: 2600, originalPrice: 3200, category: '咖啡',  image: '', stock: 99,  sales: 1256, isOnSale: true,  sort: 100, createdAt: Date.now() - 86400000 * 10 },
  { _id: 'p002', name: '山茶花美式',     desc: '埃塞SOE+山茶花提取液，清新花香',      price: 2200, originalPrice: 2800, category: '咖啡',  image: '', stock: 80,  sales: 892,  isOnSale: true,  sort: 99,  createdAt: Date.now() - 86400000 * 9 },
  { _id: 'p003', name: '桂花乌龙拿铁',   desc: '桂花乌龙茶底+拿铁，秋季限定',          price: 2800, originalPrice: 0,    category: '咖啡',  image: '', stock: 50,  sales: 456,  isOnSale: true,  sort: 98,  createdAt: Date.now() - 86400000 * 8 },
  { _id: 'p004', name: '栀香绿茶的茶',   desc: '栀子花+茉莉绿茶，清香回甘',            price: 1800, originalPrice: 2200, category: '茶饮',  image: '', stock: 120, sales: 2100, isOnSale: true,  sort: 97,  createdAt: Date.now() - 86400000 * 7 },
  { _id: 'p005', name: '白桃乌龙茶',     desc: '蜜桃果肉+台湾乌龙，果香浓郁',          price: 2000, originalPrice: 0,    category: '茶饮',  image: '', stock: 60,  sales: 678,  isOnSale: true,  sort: 96,  createdAt: Date.now() - 86400000 * 6 },
  { _id: 'p006', name: '杨梅爆柠茶',     desc: '东魁杨梅+香水柠檬，酸甜暴击',          price: 2400, originalPrice: 2800, category: '果茶',  image: '', stock: 40,  sales: 345,  isOnSale: true,  sort: 95,  createdAt: Date.now() - 86400000 * 5 },
  { _id: 'p007', name: '芒果百香果茶',   desc: '台农芒果+百香果+茉莉绿茶底',          price: 2200, originalPrice: 0,    category: '果茶',  image: '', stock: 70,  sales: 1890, isOnSale: true,  sort: 94,  createdAt: Date.now() - 86400000 * 4 },
  { _id: 'p008', name: '草莓芝士奶盖',   desc: '新鲜草莓冰沙+芝士奶盖，招牌推荐',      price: 3000, originalPrice: 3600, category: '果茶',  image: '', stock: 30,  sales: 2345, isOnSale: true,  sort: 93,  createdAt: Date.now() - 86400000 * 3 },
  { _id: 'p009', name: '提拉米苏盒',     desc: '马斯卡彭芝士+咖啡手指饼干，意式经典',  price: 3200, originalPrice: 3800, category: '甜品',  image: '', stock: 25,  sales: 567,  isOnSale: true,  sort: 92,  createdAt: Date.now() - 86400000 * 2 },
  { _id: 'p010', name: '抹茶千层蛋糕',   desc: '日式宇治抹茶+手工千层饼皮',            price: 2800, originalPrice: 0,    category: '甜品',  image: '', stock: 20,  sales: 432,  isOnSale: true,  sort: 91,  createdAt: Date.now() - 86400000 * 1 },
  { _id: 'p011', name: '黑椒牛柳意面',   desc: '澳洲牛柳+黑椒酱汁，意面Q弹爽滑',      price: 3600, originalPrice: 4200, category: '简餐',  image: '', stock: 15,  sales: 234,  isOnSale: true,  sort: 90,  createdAt: Date.now() },
  { _id: 'p012', name: '烟熏三文鱼沙拉', desc: '挪威三文鱼+混合生菜+油醋汁',          price: 3200, originalPrice: 0,    category: '简餐',  image: '', stock: 18,  sales: 189,  isOnSale: true,  sort: 89,  createdAt: Date.now() },
];

// 分类列表
const CATEGORIES = ['全部', '咖啡', '茶饮', '果茶', '甜品', '简餐'];

/**
 * 读取全部商品
 */
function getAll() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (_) {}
  // 首次使用写入种子数据
  wx.setStorageSync(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
  return SEED_PRODUCTS;
}

/**
 * 保存商品数据
 */
function saveAll(products) {
  wx.setStorageSync(STORAGE_KEY, JSON.stringify(products));
}

/**
 * 获取上架商品（按分类+搜索+分页）
 */
function getOnSale({ category, keyword, page, pageSize } = {}) {
  let list = getAll().filter(p => p.isOnSale);
  if (category && category !== '全部') {
    list = list.filter(p => p.category === category);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(kw) || p.desc.toLowerCase().includes(kw));
  }
  list.sort((a, b) => (b.sort || 0) - (a.sort || 0));

  const p = page || 1;
  const size = Math.min(pageSize || 10, 50);
  const total = list.length;
  const start = (p - 1) * size;
  return {
    list: list.slice(start, start + size),
    total,
    page: p,
    hasMore: start + size < total
  };
}

/**
 * 获取单个商品
 */
function getById(id) {
  return getAll().find(p => p._id === id) || null;
}

/**
 * 新增商品
 */
function add(data) {
  const products = getAll();
  const product = {
    _id: 'p' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: data.name || '',
    desc: data.desc || '',
    price: data.price || 0,
    originalPrice: data.originalPrice || 0,
    category: data.category || '其他',
    image: data.image || '',
    stock: data.stock || 0,
    sales: 0,
    isOnSale: true,
    sort: data.sort || 0,
    createdAt: Date.now()
  };
  products.push(product);
  saveAll(products);
  return product;
}

/**
 * 更新商品
 */
function update(id, data) {
  const products = getAll();
  const idx = products.findIndex(p => p._id === id);
  if (idx === -1) return null;
  Object.assign(products[idx], data);
  saveAll(products);
  return products[idx];
}

/**
 * 删除商品
 */
function remove(id) {
  const products = getAll().filter(p => p._id !== id);
  saveAll(products);
}

/**
 * 切换上下架
 */
function toggleOnSale(id) {
  const product = getById(id);
  if (product) {
    update(id, { isOnSale: !product.isOnSale });
    return !product.isOnSale;
  }
  return null;
}

/**
 * 获取分类列表
 */
function getCategories() {
  return CATEGORIES;
}

module.exports = {
  getAll,
  getOnSale,
  getById,
  add,
  update,
  remove,
  toggleOnSale,
  getCategories,
  SEED_PRODUCTS
};
