var app = getApp()
Page({

  // 初始化数据
  data: {
    listData: {},
    work_order_id: '',
    work_text: '催处理',
    submitDisabled: 0
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      work_order_id: option.work_order_id
    })
    this.getData()
  },

  getData() {
    app.req.get('/cs/work_order_detail?id='+this.data.work_order_id).then((response) => {
      var res = response.data
      if (res.status == 'ok') {
        this.setData({
          listData: res.payload
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
        title: response.message,
        icon: 'success',
        duration: 2000
      })
    })
  },

  orderUrge () {
    this.data.work_text = '已催'
    if (this.data.submitDisabled == 1) {
      wx.showToast({
        title: '正在催处理，请勿重复申请',
        icon: 'success',
        duration: 2000
      })
    }
    this.data.submitDisabled = 1
    app.req.get('/cs/work_order_urge?id='+this.data.work_order_id).then((response) => {
      var res = response.data
      if (res.status == 'ok') {
        this.data.submitDisabled = 0
        wx.showToast({
          title: res.payload.message,
          icon: 'success',
          duration: 2000
        })
      } else {
        Toast(res.message)
      }
    }).catch((response) => {
      wx.showToast({
        title: response.message,
        icon: 'success',
        duration: 2000
      })
    })
  },

  jump(e){
    let url = e.currentTarget.dataset.url
    console.log(url)
    wx.navigateTo({
      url: url
    })
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})