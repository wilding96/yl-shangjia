var app = getApp()
Page({

  // 初始化数据
  data: {
    addresses: '',
    type: '',
    returnUrl: ''
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      type: option.type,
      returnUrl: option.returnUrl || '/pages/packageA/order-verify/verify'
    })
    this.getData()
  },

  // getData
  getData () {

    // 设置title
    if (this.data.type === 'change') {
      wx.setNavigationBarTitle({
        title: '选择收货地址'
      })
    }

    app.req.get(`user/address_list`).then((res) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      if(res.data.status === 'ok'){
        this.setData({
          addresses: res.data.payload
        })
      }else{
        wx.showToast({
          title: data.message
        })
      }
    })
  },

  // 删除地址
  deleteAddress (e) {
    let id = e.currentTarget.dataset.id;
    let url = '/my/address/remove';
    let params = {
      ids: [id]
    }
    let self = this

    app.req.post(url, params).then((resp) => {
      var data = resp.data
      if (data.status == "ok") {
        wx.showToast({
          title: '删除成功',
          success: () => {
            setTimeout(() => {
              self.getData()
            }, 1500)
          }
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

  // 修改地址
  changeLocation (e) {
      let id = e.currentTarget.dataset.id
      if (this.data.type === 'manage') {
        return
      } else {
      wx.redirectTo({
          url: `${this.data.returnUrl}?address_id=${id}`
      })
      }

  },

  // 编辑地址
  editAddress (e) {
    let id = e.currentTarget.dataset.id;
    wx.redirectTo({
      url: `../add/index?id=${id}`
    })
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})