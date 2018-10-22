var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    skeywords: '', //搜素关键词
    data: [],
    hotWords: [],
    lastWords: [],
    showHot: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHotWords()
  },
  selectWord(e) {
    this.setData({
      skeywords: e.target.dataset.word
    })
    this.serachProduct()
  },
  getHotWords() {
    var self = this
    app.req.get('/product/search/top').then(function (resp) {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var data = resp.data
      if (data.status == "ok") {
        self.setData({
          hotWords: data.payload.top,
          lastWords: data.payload.recently
        })
      } else {
        wx.showToast({
          title: data.message
        })
      }
    }).catch(function (resp) {
      wx.showToast({
        title: resp
      })
    })
  },
  // 搜索商品
  serachProduct(e) {
    var self = this
    if (e) {
      this.setData({
        skeywords: e.detail.value
      })
    }
    if (self.data.skeywords == '') {
      return false
    }
    app.req.get('/product/search?kw=' + self.data.skeywords + '&limit=50').then(function (resp) {
      var data = resp.data
      if (data.status == "ok") {
        self.setData({
          data: data.payload,
          showHot: false
        })
      } else {
        wx.showToast({
          title: data.message,
        })
      }
    }).catch(function (resp) {
      wx.showToast({
        title: resp
      })
    })
  },
  openPage: function (e) {
    wx.navigateTo({
      url: "/pages/packageA/shop-detail/index?p=" + e.currentTarget.dataset.productId
    })
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
  onPullDownRefresh () {
    this.getHotWords()
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