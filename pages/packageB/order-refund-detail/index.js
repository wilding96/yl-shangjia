var app = getApp()
Page({

  // 初始化数据
  data: {
    payload: '',
  	list: [],
  	order_id:'',
    detail_id: '',
    id: '',
    type: ''
  },
  // 监听页面加载
  onLoad (options) {
  	this.setData({
  		order_id: options.order_id,
      detail_id: options.detail_id,
      id: options.id
  	})

    this.getData()
  },

  // getData
  getData () {
    app.req.get(`aftersales/detail?id=${this.data.id}`).then((res) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      if(res.data.status === 'ok'){
        this.setData({
          payload: res.data.payload,
          list: res.data.payload.logs,
          type: res.data.payload.logs[res.data.payload.logs.length-1].action_type || 0
        })
      }else{
        wx.showToast({
          title: res.data.message
        })
      }
    })
  },

  // 跳转到订单详情
  jumpDetail () {
  	wx.redirectTo({
  		url: `/pages/packageB/order-details/index?order_id=${this.data.order_id}&scene=reload`
  	})
  },

  jumpEdit (e) {
    let type = e.currentTarget.dataset.type
    let aftersales_type = e.currentTarget.dataset.aftersales_type

    if(aftersales_type===1){
      // 修改退款
      let url =  `/pages/packageB/order-refund/index?orderid=${this.data.order_id}&detailid=${this.data.detail_id}&edit=true&id=${this.data.id}`
      wx.navigateTo({
        url: url
      })
    } else {
      // 填写寄回单号
      if (type === 10) {
        let url = `/pages/packageB/order-sendback-number/index?id=${this.data.id}`
        wx.navigateTo({
          url: url
        })
      }

      // 查看物流
      if (type === 5 || type === 6 || type === 11 || type === 12 || type === 13 || type === 14 || type === 15) {
        let url = `/pages/packageB/order-logistics/index?order_id=${this.data.order_id}`
        wx.navigateTo({
          url: url
        })
      }

    }

    // 修改售后
    if (type === 1 || type === 2 || type === 3) {
      let url =  `/pages/packageB/order-afterSale/index?orderid=${this.data.order_id}&detailid=${this.data.detail_id}&edit=true&id=${this.data.id}`
      wx.navigateTo({
        url: url
      })
    }

  },

  jumpEditxs: function (e) {
    let type = e.currentTarget.dataset.type
    // 确认收货
    if (type === 13 || type === 15) {
      wx.showModal({
        title: '确认收货',
        content: '是否确认收货',
        showCancel: true,
        cancelText: '取消',
        confirmText: '确认',
        success: (res) => {
          console.log(res);
          if (res.confirm) {
            app.req.get(`aftersales/aftersales_confirm?id=${this.data.id}`).then((res) => {

              // 停止下拉刷新
              wx.stopPullDownRefresh()
        
              if(res.data.status === 'ok'){
                wx.showToast({
                  title: res.data.payload.message
                })
              }else{
                wx.showToast({
                  title: res.data.message
                })
              }
            })
          }
        }
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }

})