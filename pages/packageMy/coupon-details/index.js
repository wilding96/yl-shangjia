var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nolist: false,
    message: '加载中...',
    suppiler_id: 0,
    coupon_id: '',
    sy_id: '',
    receive_status: 0,
    supplier_info: '',
    coupon_info: '',
    product_info: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      suppiler_id: options.s || wx.getStorageSync('suppiler_id'),
      coupon_id: options.coupon_id,
      sy_id: options.sy_id
    })
    this.getdata(options.coupon_id, options.sy_id)
  },
  getdata (cid, syid) {
    wx.stopPullDownRefresh()
    var self = this
    app.req.get('coupon/detail', {
      coupon_id: cid || this.data.coupon_id,
      sy_id: syid || this.data.sy_id
    }).then((res) => {
      if (res.data.status === 'ok') {
        this.setData({
          receive_status: res.data.payload.coupon.status,
          supplier_info: res.data.payload.supplier_info,
          coupon_info: res.data.payload.coupon,
          product_info: res.data.payload.product_info
        })
      } else {
        wx.showToast({
          title: res.data.message
        })
        wx.navigateBack({
          delta: 1
        })
      }
    })
  },

  // 领券
  receiveNow: function() {
    let cid = this.data.coupon_id
    let sid = this.data.sy_id
    app.req.post('coupon/receive', {
      coupon_id: cid,
      sy_id: sid
    }).then((res) => {
      if (res.data.status === 'ok') {
        wx.stopPullDownRefresh()
        wx.showToast({
          title: res.data.payload.msg
        })
        this.getdata()
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        })
      }
    })
  },

  // 用券
  useNow: function() {
    let pid = this.data.product_info.product_id
    wx.navigateTo({
      url: `../../packageA/shop-detail/index?s=${this.data.suppiler_id}&p=${pid}`
    })
  },

  jump(id, type) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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
    this.getdata()
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