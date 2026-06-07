// utils/constants.js — 常量定义

module.exports = {
  // 订单状态
  ORDER_STATUS: {
    PENDING:   { value: 'pending',   label: '待支付' },
    PAID:      { value: 'paid',      label: '已支付' },
    CONFIRMED: { value: 'confirmed', label: '已接单' },
    SHIPPING:  { value: 'shipping',  label: '配送中' },
    COMPLETED: { value: 'completed', label: '已完成' },
    CANCELLED: { value: 'cancelled', label: '已取消' }
  },

  // 商品分类
  CATEGORIES: ['全部', '咖啡', '茶饮', '果茶', '甜品', '简餐'],

  // 支付方式
  PAY_METHODS: [
    { value: 'balance', label: '余额支付' },
    { value: 'wechat',  label: '微信支付' }
  ],

  // 每页数量
  PAGE_SIZE: 10
};
