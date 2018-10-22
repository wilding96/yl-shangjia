var app = getApp()
Page({
  data:{
    index: 0,
    company_id: 1,
    shipping_code: '',
    note: '',
    shipping_cost: '',
    account: '',
    real_name: ''
  },
  onLoad(options){

    this.setData({
      id: options.id
    })
    this.getData();
  },

  getData () {
    app.req.get(`aftersales/return_page?id=${this.data.id}`).then((res) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      if(res.data.status === 'ok'){

        let shipping_company_arr = []
        let shipping_company_arr_id = []

        for(let i in res.data.payload.shipping_companies){
          shipping_company_arr.push(res.data.payload.shipping_companies[i])
          shipping_company_arr_id.push(i)
        }

        this.setData({
          shipping_company: shipping_company_arr,
          shipping_company_arr_id: shipping_company_arr_id
        })

      }else{
        wx.showToast({
          title: data.message
        })
      }
    })
  },

  shippingCompanyChange(e){
    this.setData({
      company_id: this.data.shipping_company_arr_id[e.detail.value]
    })
  },

  numberInput(e){
    this.setData({
      shipping_code: e.detail.value
    })
  },

  noteInput(e){
    this.setData({
      note: e.detail.value
    })
  },

  shopcostInput(e){
    this.setData({
      shipping_cost: e.detail.value
    })
  },

  accountInput(e){
    this.setData({
      account: e.detail.value
    })
  },

  nameInput(e){
    this.setData({
      real_name: e.detail.value
    })
  },

  submitAftersales(){

    if(!this.data.company_id){
      wx.showToast({
        title: '物流信息有误'
      })
      return
    }else if(!this.data.shipping_code){
      wx.showToast({
        title: '请填写物流单号'
      })
      return
    }else if(!this.data.note){
      wx.showToast({
        title: '请填写物流说明'
      })
      return
    }else if(!this.data.shipping_cost){
      wx.showToast({
        title: '请填写运费'
      })
      return
    }else if(!this.data.account){
      wx.showToast({
        title: '请填写支付宝账号'
      })
      return
    }else if(!this.data.real_name){
      wx.showToast({
        title: '请填写支付宝姓名'
      })
      return
    }else{
      let url = `aftersales/submit_return?id=${this.data.id}`
      let params = {
        company_id: this.data.company_id,
        shipping_code: this.data.shipping_code,
        note: this.data.note,
        shipping_cost: this.data.shipping_cost,
        account: this.data.account,
        real_name: this.data.real_name,
      }
      app.req.post(url, params).then((resp) => {
        if(resp.data.status === 'ok'){
          wx.showToast({
            title: '提交成功'
          })
          setTimeout(() => {
            wx.navigateBack()
          },2000)
        } else {
          wx.showToast({
            title: resp.data.message
          })
        }
      }).catch(function (resp) {
        wx.showToast({
          title: resp
        })
      })
    }

  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})