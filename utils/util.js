// utils/util.js — 通用工具函数

/**
 * 格式化金额（分转元）
 * @param {number} cents - 金额（分）
 * @returns {string}
 */
function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}

/**
 * 格式化日期
 * @param {Date|string|number} date
 * @param {string} fmt - 默认 YYYY-MM-DD HH:mm
 * @returns {string}
 */
function formatDate(date, fmt) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  fmt = fmt || 'YYYY-MM-DD HH:mm';
  const o = {
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'H+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  };
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, String(d.getFullYear()).substr(4 - RegExp.$1.length));
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(String(o[k]).length));
    }
  }
  return fmt;
}

/**
 * 防抖
 * @param {Function} fn
 * @param {number} delay - 毫秒
 */
function debounce(fn, delay) {
  let timer = null;
  return function () {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, arguments), delay);
  };
}

/**
 * 节流
 * @param {Function} fn
 * @param {number} interval - 毫秒
 */
function throttle(fn, interval) {
  let last = 0;
  return function () {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, arguments);
    }
  };
}

/**
 * 手机号脱敏
 * @param {string} phone
 * @returns {string}
 */
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone || '';
  return phone.substr(0, 3) + '****' + phone.substr(7);
}

/**
 * 生成唯一ID
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
}

/**
 * Toast 提示
 */
function showToast(title, icon) {
  wx.showToast({ title: title, icon: icon || 'none', duration: 2000 });
}

/**
 * Loading 控制
 */
function showLoading(title) {
  wx.showLoading({ title: title || '加载中…', mask: true });
}

function hideLoading() {
  wx.hideLoading();
}

/**
 * 确认弹窗
 * @param {string} content
 * @returns {Promise<boolean>}
 */
function showConfirm(content, title) {
  return new Promise((resolve) => {
    wx.showModal({
      title: title || '提示',
      content: content,
      success: (res) => resolve(res.confirm)
    });
  });
}

module.exports = {
  formatPrice,
  formatDate,
  debounce,
  throttle,
  maskPhone,
  generateId,
  showToast,
  showLoading,
  hideLoading,
  showConfirm
};
