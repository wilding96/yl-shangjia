const app = getApp()

Page({
	data: {
    listData: [],
    shop_id: 0,
    auto_notice: false,
    supplier_id: ''
  },
	onLoad (e) {
    if (e.s) {
      this.setData({
        supplier_id: e.s
      })
    } else {
      this.setData({
        supplier_id: wx.getStorageSync('supplier_id')
      })
    }
	},	
  onShow () {
    this.getData()
  },

  getData () {
    app.req.get('user/my?supplier_id=' + this.data.supplier_id)
      .then(res => res.data)
      .then(res => {
        // 停止当前页面下拉刷新
        wx.stopPullDownRefresh()
        this.setData({ listData: res.payload })
      })
  },

  onPullDownRefresh () {
    this.getData()
  },
  jump (e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  }
})