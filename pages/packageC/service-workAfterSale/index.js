var app = getApp()
Page({

  // 初始化数据
  data: {
    order_id: '',
    detail_id: '',
    qa_id: '',
    message: ''
  },

  // 监听页面加载
  onLoad (option) {
    console.log(option)
    this.setData({
      order_id: option.order_id,
      detail_id: option.detail_id,
      qa_id: option.qa_id,
      message: option.message
    })
  },

  jump(e){
    let {order_id, detail_id, qa_id} = this.data
    let url = `/pages/packageC/service-submitWorkOrder/index?order_id=${order_id}&detail_id=${detail_id}&qa_id=${qa_id}`
    wx.navigateTo({
      url: url
    })
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})