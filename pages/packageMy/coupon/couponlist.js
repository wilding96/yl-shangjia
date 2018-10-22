var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nolist: false,
    lists: [],
    limit: 10,
    offset: 0,
    tabActive: 'touse',
    message: '加载中...',
    loadMore: true,
    shop_id: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      shop_id: options.s || wx.getStorageSync('c_shop_id')
    })
    // this.getdata()
  },
  getdata () {
    var self = this
    // 本次api处理没结束 禁止再次请求
    if (!self.data.loadMore) {
      return false
    }
    app.req.get('/promotion/coupon_list?state=' + self.data.tabActive + '&limit=' + self.data.limit + '&offset=' + self.data.offset).then(function (resp) {
      if (resp.data.status == "ok") {
        var payload = resp.data.payload
        
        if (payload.length > 0) {
          self.setData({
            lists: self.data.lists.concat(payload),
            offset: payload[payload.length - 1]['id'],
          })
          if (payload.length < 10) {
            self.setData({
              message: '没有更多了',
            })
          }
        } else {
          if (self.data.offset == 0) {
            this.setData({
              nolist: true,
              loadMore: false
            })
          } else {
            this.setData({
              message: '没有更多了',
              loadMore: false,
              nolist: true
            })
          }
        }
      }
    }).catch(function (resp) {
      return false;
    })
  },
  tabChange(e) {
    console.log(e)
    this.setData({
      tabActive: e.currentTarget.dataset.type,
      offset: 0,
      lists: [],
      nolist: false,
      message: '加载中...'
    })
    this.getdata()
  },
  jump(id, type) {
    if (typeof (this.shop_id) == 'undefined') {
      if (type == 1) {
        location.href = location.origin + '/m/transferpage?jumpUrl=' + location.origin + '/m/couponProduct/' + id + '?s=shop_id'
      } else {
        location.href = location.origin + '/m/transferpage?jumpUrl=' + location.origin + '/m/shoplist?s=shop_id'
      }
    } else {
      if (type == 1) {
        location.href = '/m/couponProduct/' + id + '?s=' + this.shop_id
      } else {
        location.href = '/m/shoplist?s=' + this.shop_id
      }
    }
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
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getdata()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})