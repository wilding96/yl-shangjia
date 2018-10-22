import throttle from '../../../utils/throttle'

var app = getApp()
var wxpay = require('./../../../utils/pay.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_type: '', //如果是1，则为开店订单 0非开店订单. 开店订单无法看到购物车和
    supplier_id: 0,
    pin_id: 0,
    temp_order_id: 0, // 临时订单号
    order_id: 0,  // 用户确认后先下单获得的订单id
    isSelectCoupon: false, // 内部的变量
    api_data: null,
    address_id: '',
    coupon_id: '', // 优惠券
    promotion_id: 0,// 促销活动
    isFirstRequest: true,
    isSubmitting: true,
    payText: '立即支付',
    message: '获取验证码',
    phone: '',
    phone_code: '',
    ylcoin_check: false,
    use_ylcoin: 0,
    liandouPanel: false,
    routerParam: '',
    note: '',  //备注
    product_ids: [],
    need_notify: true,
    shipcostPanel: false,
    disabledBuy: 0,
    real_name: '',
    identification: '',
    switchAddressPanel: false,
    couponShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    this.setData({
      supplier_id: options.s || wx.getStorageSync('supplier_id'),
      address_id: options.address_id || ''
    })
    var urlparam = ''
    if (typeof (self.data.supplier_id) != 'undefined') {
      urlparam += '&s=' + self.data.supplier_id
    }
    urlparam = urlparam.replace('&', '')
    this.setData({
      routerParam: urlparam
    })

    // app.soj({ 'page_name': 'orderVerify', 's': this.data.supplier_id })
  },
  onShow: function () {
    this.getData()
  },
  disbaleBuy() {
    wx.showToast({
      title: '订单中包含不合格产品，请返回删除后再次购买',
    })
  },
  // 开店订单获取验证码
  getMessage() {
    var i = 60, self = this
    if (!/^1\d{10}$/.test(self.data.phone.replace(/(^\s+)|(\s+$)/g, ""))) {
      wx.showToast({
        title: '请输入正确手机号',
      })
      return false
    }
    var interval = setInterval(function () {
      i = i - 1
      self.setData({
        message: i + '秒后重发'
      })
      if (i == 0) {
        self.setData({
          message: '获取短信'
        })
        clearInterval(interval)
      }
    }, 1000);

    app.req.get('/phone/code?phone=' + self.data.phone).then(function (resp) {
      var data = resp.data
      if (data.status === "ok") {
        wx.showToast({
          title: data.payload.msg,
        })
      } else {
        wx.showToast({
          title: data.payload.message,
        })
      }
    }).catch(function (resp) {
      wx.showToast({
        title: '出错了',
      })
      return false;
    })
  },
  // 获取确认购买页面的数据
  getData: throttle(function () {
    console.log(this.coupon_id);
    var self = this
    var shoppingData = {
      'products': JSON.parse(wx.getStorageSync('/order/shopping')),
      'supplier_id': self.data.supplier_id,
      'address_id': self.data.address_id,
      'coupon_id': self.data.coupon_id
    }
    app.req.post('order/shopping', shoppingData).then((response) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var ret = response.data
      if (ret && ret.status) {
        switch (ret.status) {
          case 'ok':
            if (ret.payload) {
              for (var pid of ret.payload.blocks) {
                self.data.product_ids.push(pid.product_id)
              }
              self.setData({
                api_data: ret.payload,
                isFirstRequest: false,
                address_id: ret.payload.address ? ret.payload.address.id : ''
              })
              if (ret.payload.discount) {
                this.setData({
                  coupon_id: ret.payload.discount.coupons.id
                })
              }
            }
            break
          case 'fail':
            wx.showToast({
              title: ret.message,
            })
            break
          default:
            console.log('未知状态：' + ret.status)
            break
        }
      }
    }).catch(err => {
      console.log(err.message);
      wx.showToast({
        title: err.message,
      })
    })
  }),
  // 选择地址
  edt_address() {
    let url = "/pages/packageB/address/index/index"
    let returnUrl = "/pages/packageA/order-verify/verify"
    if (this.data.address_id) {
      wx.redirectTo({
        url: `${url}?returnUrl=${returnUrl}&type=change`
      })
    } else {
      wx.redirectTo({
        url: `${url}?returnUrl=${returnUrl}`
      })
    }
  },

  // 提交立即结算
  _go_finish: function (check) {
    this.setData({
      isSubmitting: false
    })
    // 检查用户是否选择了收货地址
    if (!this.data.address_id) {
      wx.showToast({
        title: '请选择收货地址',
      })
      return
    }
    var orderInfo = {
      // 欲购买的商品
      'products': JSON.parse(wx.getStorageSync('/order/shopping')),
      'address_id': this.data.address_id, // 地址
      'check': check == 'no' ? 0 : 1,
      'supplier_id': wx.getStorageSync('supplier_id'),
      'coupon_id': this.data.coupon_id
    }
    // 先访问下单接口 POST /api/app/order/place
    var apiUrl = 'order/place'
    var self = this
      app.req.post(apiUrl, orderInfo).then((response) => {
        this.setData({
          isSubmitting: false
        })
        var ret = response.data
        switch (ret.status) {
          case 'ok':
            // 如果有相同订单号，直接跳转到订单详情页下单
            if (ret.payload.check_order_id) {
              wx.showModal({
                title: "提示",
                content: '该商品有笔订单尚未支付，是否继续支付？',
                cancelText: '继续下单',
                confirmText: '前往支付',
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: './../../packageB/order-details/index?order_id=' + ret.payload.check_order_id + '&' + self.data.routerParam,
                      success: function (res) { },
                      fail: function (res) { },
                      complete: function (res) { },
                    })
                  } else if (res.cancel) {
                    // 再次请求下单，不需要检查
                    self._go_finish('no')
                    self.setData({
                      isSubmitting: true
                    })
                  }
                }
              })
            } else {
              if (ret.message) {
                wx.showToast({
                  title: ret.message + '请返回重新下单',
                })
              }
              // 得到订单id
              if (ret.payload && ret.payload.order_id > 0) {
                self.setData({
                  order_ids: [ret.payload.order_id],
                  temp_order_id: ret.payload.order_id
                })
                // 开始查询下单结果
                this.checkStatus()
              }
            }
            break
          case 'fail':
            if (ret.message && ret.message !== '') {
              wx.showToast({
                title: ret.message,
                icon: 'none'
              })
            }
        }
      }, (response) => {
        self.setData({
          isSubmitting: false
        })
      })
  },
  // 查询下单情况
  checkStatus() {
    // temp_order_id
    var apiUrl = 'order/check_create?order_id=' + this.data.temp_order_id
    var that = this
    app.req.get(apiUrl).then((response) => {
      var ret = response.data
      switch (ret.status) {
        case 'ok':
          // 得到订单 状态
          if (ret.payload) {
            switch (ret.payload.status) {
              case 0: // 正在处理
                console.log(111);
                that.setData({
                  payText: '提交中...'
                })
                var thatThat = that
                setTimeout(function () {
                  thatThat.checkStatus()
                }, 400)
                break
              case 1: // 成功 转到支付页面
                that.setData({
                  payText: '立即支付'
                })
                // 调用支付
                wxpay.wxpay(app, ret.payload.order_id, "../../packageB/order-details/index?order_id=" + ret.payload.order_id);
                break
              case 2: // 失败
                if (ret.payload.message && ret.payload.message !== '') {
                  wx.showToast({
                    title: ret.payload.message,
                  })
                }
                that.setData({
                  payText: '提交失败'
                })
                break
              default:
                wx.showToast({
                  title: '参数错误'
                })
            }
          }
          break
        case 'fail':
          switch (ret.code) {
            case 40400: // 未找到订单
              if (ret.message && ret.message !== '') {
                wx.showToast({
                  title: ret.message,
                })
              }
              break
          }
          break
      }
    }, (response) => {

    })
  },

  panelStatus (e) {
    console.log(e);
    let itemList = ['不使用优惠券']

    for(let i of this.data.api_data.coupons){
      switch (Number(i.coupon_type)) 
      {
        case 1:
        itemList.push(`满${i.least_pay}元减${i.free_pay}元 ${i.title}`)
        break
        case 2:
        itemList.push(`${i.pay_money}元券 ${i.title}`)
        break
        case 3:
        itemList.push(`${i.discount_rate}折券 ${i.title}`)
        break
      }
      if (itemList.length > 5) {break}
    }
    wx.showActionSheet({
      itemList: itemList,
      success: (res) => {
        this.chooseCoupon(res.tapIndex)
      },
      fail: (res) => {
        console.log(res.errMsg)
      }
    })
  },

  // 选择优惠券
  chooseCoupon(id){
    let needReloadApi = this.data.coupon_id !== id
    if (id == 0) {
      this.setData({
        coupon_id: 0
      })
    } else {
      this.setData({
        coupon_id: this.data.api_data.coupons[id-1].id
      })
    }
    if (needReloadApi) {
      this.getData()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})