// utils/storage.js — 本地存储操作封装

/**
 * 读取存储
 * @param {string} key
 * @param {*} defaultValue
 */
function get(key, defaultValue) {
  try {
    const value = wx.getStorageSync(key);
    return value !== '' ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * 写入存储
 * @param {string} key
 * @param {*} value
 */
function set(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error('Storage set error:', e);
  }
}

/**
 * 删除存储
 * @param {string} key
 */
function remove(key) {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('Storage remove error:', e);
  }
}

/**
 * 清空全部存储
 */
function clear() {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('Storage clear error:', e);
  }
}

module.exports = {
  get,
  set,
  remove,
  clear
};
