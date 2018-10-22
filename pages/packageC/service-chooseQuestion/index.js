var app = getApp()
Page({

  // 初始化数据
  data: {
    listData: {},
    order_id: '',
    detail_id: '',
    qa_id: 0
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      order_id: option.order_id,
      detail_id: option.detail_id
    })
    this.getData('1')
    console.log(this.data)
  },

  getData (reqType) {
    var self = this
    app.req.get('/cs/qa?order_id='+self.data.order_id+'&detail_id='+self.data.detail_id+'&qa_id='+self.data.qa_id).then((response) => {
      var res = response.data
      if (res.status == 'ok') {
        if (reqType == '1') {
          this.setData({
            listData: res.payload
          })
        } else {

          // result_type 售后检查结果，1-可提交售后，2-已有售后，3-不可售后
          if (res.payload.result_type == 1) {
            let url = `/pages/packageB/order-refund/index?orderid=${this.data.order_id}&detailid=${this.data.detail_id}`
            wx.navigateTo({
              url: url
            })
          } else if (res.payload.result_type == 2) {
            let url = `/pages/packageB/order-refund-detail/index?id=${res.payload.aftersales_id}&order_id=${this.data.order_id}`
            wx.navigateTo({
              url: url
            })
          } else if (res.payload.result_type == 3) {
            let url = `/pages/packageC/service-workAfterSale/index?order_id=${this.data.order_id}&detail_id=${this.data.detail_id}&qa_id=${this.data.qa_id}&message=${res.payload.reason}`
            wx.navigateTo({
              url: url
            })
          }
        }
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

  jumpPage (e) {

    let type = e.currentTarget.dataset.type

    this.setData({
      qa_id: e.currentTarget.dataset.id
    })

    //跳转类型，0-子列表，1-提交工单，2-提交售后
    if (type == 0) { //子列表
      if (this.data.listData.current_work_order.length>0) {
        let url = `/pages/packageC/service-workOrderDetail/index?work_order_id=${this.data.listData.current_work_order[0].work_order_id}`
        wx.navigateTo({
          url: url
        })
      } else {
        let url = `/pages/packageC/service-logisticsQuestion/index?order_id=${this.data.order_id}&detail_id=${this.data.detail_id}&qa_id=${this.data.qa_id}`
        wx.navigateTo({
          url: url
        })
      }
    } else if (type == 1) { //提交工单
      //检查是否有处理中工单
      this.orderCheck()
    } else if (type == 2) { //提交售后
      this.getData('2')
    }  else if (type == 4) { //提交退款
      wx.navigateTo({
        url: "/pages/packageB/order-refund/index?orderid=" + this.data.order_id + '&detailid=' + this.data.detail_id
      })
    }  else if (type == 5) { //修改收货地址
      wx.navigateTo({
        url: `/pages/packageB/order-changeLocation/index?order_id=${this.data.order_id}`
      })
    }
  },

  orderCheck () {
    // 检查是否有处理中工单
    var self = this

    app.req.get('/cs/work_order_check?order_id='+self.data.order_id+'&detail_id='+self.data.detail_id+'&qa_id='+self.data.qa_id).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        if (res.payload.work_order_id!=0) {
          //todo 跳转到工单详情页
          let url = `/pages/packageC/service-workOrderDetail/index?work_order_id=${res.payload.work_order_id}`
          wx.navigateTo({
            url: url
          })
        } else {
          // 跳转到申请工单
          let url = `/pages/packageC/service-submitWorkOrder/index?order_id=${this.data.order_id}&detail_id=${this.data.detail_id}&qa_id=${this.data.qa_id}`
          wx.navigateTo({
            url: url
          })
        }
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

  jump(e){
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})