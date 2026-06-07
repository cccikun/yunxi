// utils/api.js — 接口请求封装（预留，后续对接后端）

const BASE_URL = ''; // 后端接口地址

/**
 * 通用请求
 * @param {string} url
 * @param {object} options
 * @returns {Promise}
 */
function request(url, options = {}) {
  const { method = 'GET', data = {}, header = {} } = options;

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: reject
    });
  });
}

/**
 * GET 请求
 */
function get(url, data = {}) {
  return request(url, { method: 'GET', data });
}

/**
 * POST 请求
 */
function post(url, data = {}) {
  return request(url, { method: 'POST', data });
}

module.exports = {
  request,
  get,
  post
};
