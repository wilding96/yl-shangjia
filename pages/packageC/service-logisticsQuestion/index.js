var app = getApp()
Page({

  // 初始化数据
  data: {
    listData: {},
    order_id: '',
    detail_id: '',
    qa_id: ''
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      order_id: option.order_id,
      detail_id: option.detail_id,
      qa_id: option.qa_id
    })

    this.getData('1')
  },

  getData (reqType) {
    app.req.get('/cs/qa?order_id='+this.data.order_id+'&detail_id='+this.data.detail_id+'&qa_id='+this.data.qa_id).then((response) => {
      var res = response.data
      if (res.status == 'ok') {
        if (reqType == '1') {
          this.setData({
            listData: res.payload
          })
        } else {
          // result_type 售后检查结果，1-可提交售后，2-已有售后，3-不可售后
          if (res.payload.result_type == 1) {
            location.href = '/m/apply/aftersale/' + this.data.order_id + '/' + this.data.detail_id
          } else if (res.payload.result_type == 2) {
            location.href = '/m/update/aftersale/' + res.payload.aftersales_id
          } else if (res.payload.result_type == 3) {
            location.href = '/m/workAftersale/' + this.data.order_id + '/' + this.data.detail_id + '/' + this.data.qa_id +'?message='+res.payload.reason
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
    let {detailType, qaId} = e.currentTarget.dataset

    this.setData({
      qa_id: qaId
    })

    //跳转类型，0-子列表，1-提交工单，2-提交售后
    if (detailType == 0) { //子列表
      let url = `/pages/packageC/service-logisticsQuestion/index?order_id=${this.data.order_id}&detail_id=${this.data.detail_id}&qa_id=${this.data.qa_id}`
      wx.navigateTo({
        url: url
      })
    } else if (detailType == 1) { //提交工单
      //检查是否有处理中工单
      this.orderCheck()
    } else if (detailType == 2) { //提交售后
      this.getData('2')
    }

  },

  orderCheck () {
    // 检查是否有处理中工单
    app.req.get('/cs/work_order_check?order_id='+this.data.order_id+'&detail_id='+this.data.detail_id+'&qa_id='+this.data.qa_id).then((response) => {
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
          let {order_id, detail_id, qa_id} = this.data
          let url = `/pages/packageC/service-submitWorkOrder/index?order_id=${order_id}&detail_id=${detail_id}&qa_id=${qa_id}`
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

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})