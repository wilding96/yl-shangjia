var app = getApp()
Page({

  // 初始化数据
  data: {
    list: [],
    state: 1,
    loading: false,
    message: '加载中',
    last_id: 0
  },

  // 监听页面加载
  onLoad (option) {
    this.getData(this.data.state)
  },

  
  // getData
  getData(state, last_id) {

    let url

    if (last_id) {
      url = `/cs/work_order_list?state=${state}&last_id=${last_id}`
    } else {
      url = `/cs/work_order_list?state=${state}&last_id=${this.data.last_id}`
    }

    if (!this.data.loading) {
      this.setData({
        loading: true
      })
      app.req.get(url).then(res => {

        let payload = res.data.payload

        if(res.data.payload.work_orders.length){
          this.setData({
            loading: false,
            list: this.data.list.concat(payload.work_orders),
            last_id: payload.work_orders[payload.work_orders.length - 1].id
          })
        }else{
          this.setData({
            loading: true,
            message: '暂无更多'
          })
        }

      })
    }

  },

  changeTab (e) {
    let state = e.currentTarget.dataset.state
    this.setData({
      list: [],
      state: state,
      last_id: 0,
      loading: false
    })
    this.getData(state)
  },

  jump(e){
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  },

  // 滚动到底部
  scrollFooter (e) {
    this.getData(this.data.last_id)
  }
})