var app = getApp();
var wxpay = require('./../../../utils/pay.js')
Page({
  data:{
    order: [],
    orderid: 0,
    shop_id: 0,
    showShop: true,
    // isCopy: Clipboard.isSupported(),  //检查浏览器是否支持一键复制
    random: parseInt(Math.random() * 100000),
    reload: false
  },
  onLoad: function (options){
    console.log(options)
    if (options) {
      if (options.scene === 'reload') {
        this.setData({
          reload: true
        })
      }
    }
    this.setData({
      orderid: options.order_id
    })
    this.getdata()
  },

  updateData () {
    this.setData({
      showShop: !this.data.showShop
    })
  },
  updateAddress() {
    var self = this
    app.req.get('order/check_delivery_status?order_ids=' + self.data.orderid).then((response) => {
      var res = response.data
      if (res.status === 'fail') {
        wx.showToast({
          title: res.message,
        })
      } else if (res.status === 'ok') {
        wx.navigateTo({
          url: `/pages/packageB/order-changeLocation/index?order_id=${self.data.orderid}`
        })
      }
    })
  },

  // 联系客服
  contactService () {
    let url = `/pages/packageC/service-chooseProduct/index?order_id=${this.data.orderid}`
    wx.navigateTo({
      url: url
    })
  },

  getdata() {
    var self = this
    app.req.get('order/detail?order_id=' + self.data.orderid).then((response) => {
      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'error') {
        wx.showToast({
          title: res.message,
        })
      } else if (res.status === 'ok') {
        var payload = res.payload;
        this.setData({
          order: payload
        })
      }
    })
  },
  showModel(op) {
    var self = this
    var type = op.currentTarget.dataset.type
    var orderid = op.currentTarget.dataset.orderId
    var detail_id = op.currentTarget.dataset.detailId
    if (type === 'confirm') {
      var items = { 'title': '确认收货', 'content': '确认已经验收货物了吗', 'confirmText': '确认', 'cancelText': '取消' }
      var url = 'order/confirm?order_id=' + orderid
    } else if (type === 'refund') {
      var items = { 'title': '申请退款', 'content': '请问是否已收到货？', 'confirmText': '已收货', 'cancelText': '未收货' }
      var url = 'order/confirm?order_id=' + orderid
    }
    wx.showModal({
      title: items.title,
      content: items.content,
      cancelText: items.cancelText,
      confirmText: items.confirmText,
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          app.req.get(url).then((response) => {
            var res = response.data
            if (res.status === 'ok') {
              wx.showToast({
                title: res.payload.message,
              })
              setTimeout(function () {
                if (type === 'refund') {
                  self.applyAftersale('model',orderid, detail_id)
                } else {
                  self.getdata()
                }
              }, 1000)
            } else {
              wx.showToast({
                title: res.message,
              })
            }
          })
        } else if (res.cancel) {
          if (type === 'refund') {
            wx.showModal({
              title: '请先联系客服',
              content: '请收到货后再申请哦，如有疑问，请先联系客服（搜公众号“有练优品”即可联系）',
            })
          }
        }
      }
    })
  },
  applyAftersale(op,orderid, detailid) {
    var self = this;
    if (op == 'model') {
      var orderid = orderid
      var detailid = detailid
    } else {
      var orderid = op.currentTarget.dataset.orderId
      var detailid = op.currentTarget.dataset.detailId
    }
      app.req.get('aftersales/aftersales_page?order_id=' + orderid + '&detail_id=' + detailid).then((response) => {
        var res = response.data
        if (res.status === 'error') {
          wx.showToast({
            title: res.message,
          })
        } else if (res.status === 'ok') {
          wx.navigateTo({
            url: "/pages/packageB/order-afterSale/index?orderid=" + orderid + '&detailid=' + detailid
          })
        }
      })
  },
  orderPay(op) {
    wxpay.wxpay(app, op.target.id, "/pages/order-list/index");
  },
  applyRefund(op) {
    var self = this;
    var orderid = op.currentTarget.dataset.orderId
    var detailid = op.currentTarget.dataset.detailId
    wx.navigateTo({
      url: "/pages/packageB/order-refund/index?orderid=" + orderid + '&detailid=' + detailid
    })
  },
  jump (e) {
    let url = e.currentTarget.dataset.url
    if (this.data.reload) {
      wx.redirectTo({
        url: url
      })
    } else {
      wx.navigateTo({
        url: url
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getdata()
  }
})