var app = getApp()
Page({
  
  data: {
    logistics:'',
    order_info: '',
    packages: [],
    currentType: 1,
    statusType: {
      1: "包裹1",
      2: "退款包裹",
      3: "换货包裹"
    },
  },

  // 监听页面加载
  onLoad (options) {
    this.setData({
      order_id: options.order_id
    })

    this.getData()
  },

  getData (code) {
    let url
    if (code) {
      url = `order/logistics?order_id=${this.data.order_id}&shipping_code=${code}`
    } else {
      url = `order/logistics?order_id=${this.data.order_id}`
    }
    app.req.get(url).then((res) => {
      
      // 停止下拉刷新
      wx.stopPullDownRefresh()

      if(res.data.status === 'ok'){
        this.setData({
          logistics: res.data.payload,
          order_info: res.data.payload.order_info,
          packages: res.data.payload.packages
        })
      }else{
        wx.showToast({
          title: data.message
        })
      }
    })
  },

  statusTap:function(e){
    var code =  e.currentTarget.dataset.code;
    console.log(code);
    this.getData(code);
 },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
    this.setData({
      currentType: 1
    })
  }

})