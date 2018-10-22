var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    ylcoin: 0,
    last_id: 0,
    nolist: false,
    loadMore: true,
    message: '加载中...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },

  getData() {
    var self = this
    wx.showLoading()
    // 本次api处理没结束 禁止再次请求
    if (!self.data.loadMore) {
      return false
    }
    app.req.get('/my/ylcoin_asset_log?last_id=' + self.data.last_id).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        var payload = res.payload
        wx.hideLoading()
        if (payload.recode.length > 0) {
          this.setData({
            list: this.data.list.concat(payload.recode),
            last_id: payload.recode[payload.recode.length - 1]['id'],
            ylcoin: payload.ylcoin,
            // loading: false
          })
        } else {
          if (self.data.last_id == 0) {
            this.setData({
              nolist: true,
              loadMore: false,
            })
          } else {
            this.setData({
              loadMore: false,
              nolist: true,
              message: '没有更多了'
            })
          }
        }
        // this.setData({
        //   isLoading: false
        // })
      } else {
      }
    }).catch(function (resp) {
      return false;
    })
  },
  onReachBottom: function () {
    this.getData()
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})