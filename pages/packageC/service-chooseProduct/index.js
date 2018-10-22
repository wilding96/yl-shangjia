var app = getApp()
Page({

  // 初始化数据
  data: {
    list: [],
    order_id: '',
    detail_id: 0
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      order_id: option.order_id
    })
    this.getData()
  },

  // getData
  getData () {
    app.req.get('/order/' + this.data.order_id).then((response) => {

      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'ok') {
        this.setData({
          list: res.payload
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'success',
          duration: 2000
        })
      }
    }).catch((response) => {
      wx.showToast({
        title: response.data.message,
        icon: 'success',
        duration: 2000
      })
    })
  },

  // 设置选中的商品
  setDetailId (e) {
    this.setData({
      detail_id: e.currentTarget.dataset.id
    })
  },

  // 点击下一步
  selectNext () {
    if (this.data.order_id==0 || this.data.detail_id==0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'success',
        duration: 2000
      })
      return false
    }

    let url = `/pages/packageC/service-chooseQuestion/index?order_id=${this.data.order_id}&detail_id=${this.data.detail_id}`
    wx.navigateTo({
      url: url
    })
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})