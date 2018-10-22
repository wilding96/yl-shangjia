var app = getApp()
Page({

  data:{
    payload: '',
    order_id: '',
    region: [],
    contactName: '',
    phone: '',
    address: '',
    identification: '',
    province_id: '',
    city_id: '',
    district_id: ''
  },

  onLoad(options){
    this.setData({
      order_id: options.order_id
    })

    this.getData()

  },

  getData () {
    app.req.get('/order/get_address?order_ids=' + this.data.order_id).then((response) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'ok') {
        this.setData({
          payload: res.payload,
          contactName: res.payload.address_info.contact_name,
          phone: res.payload.address_info.phone,
          identification: res.payload.address_info.identification || '',
          address: res.payload.address_info.address,
          region: [res.payload.address_info.province.name, res.payload.address_info.city.name, res.payload.address_info.district.name],
          province_id: res.payload.address_info.province.id,
          city_id: res.payload.address_info.city.id,
          district_id: res.payload.address_info.district.id
        })
      } else {
        wx.showToast({
          title: res.message
        })
        setTimeout(() => {
          wx.navigateBack()
        },2000)
      }
    })
  },

  changeLocation(e){
    let [province_name, city_name, district_name] = e.detail.value

    this.setData({
      region: [e.detail.value[0], e.detail.value[1], e.detail.value[2]]
    })

    // 获取省份ID
    let getProvinceId = (province_name) => {
      return new Promise((resolve, reject) => {
        app.req.get(`/areas`).then((res) => {
          res.data.payload.areas.map((i) => {
            if(i.name == province_name){
              this.setData({
                province_id: i.id
              })
              resolve(i.id)
            }
          })
        }).catch(() => {
          reject()
        })
      })
    }

    // 获取城市ID
    let getCityId = (id, city_name) => {
      return new Promise((resolve, reject) => {
        app.req.get(`/areas?area_type=1&area_id=${id}`).then((res) => {
          res.data.payload.areas.map((i) => {
            if(i.name == city_name){
              this.setData({
                city_id: i.id
              })
              resolve(i.id)
            }
          })
        }).catch(() => {
          reject()
        })
      })
    }

    // 获取区域ID
    let getDistrictId = (id, district_name) => {
      return new Promise((resolve, reject) => {
        app.req.get(`/areas?area_type=2&area_id=${id}`).then((res) => {
          res.data.payload.areas.map((i) => {
            if(i.name == district_name){
              this.setData({
                district_id: i.id
              })
              resolve(i.id)
            }
          })
        }).catch(() => {
          reject()
        })
      })
    }

    // 执行 promise
    getProvinceId(province_name)
    .then((data) => {
      return getCityId(data, city_name)
    })
    .then((data) => {
      return getDistrictId(data, district_name)
    })
  },

  contactNameInput(e){
    this.setData({
      contactName: e.detail.value
    })
  },

  phoneInput(e){
    this.setData({
      phone: e.detail.value
    })
  },

  identificationInput(e){
    this.setData({
      identification: e.detail.value
    })
  },
  
  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  save(){
    if(this.data.contactName && this.data.phone && this.data.identification){
      let params = {
        order_id: this.data.order_id,
        name: this.data.contactName,
        contact: this.data.phone,
        province_id: this.data.province_id,
        city_id: this.data.city_id,
        district_id: this.data.district_id,
        detail_address: this.data.identification
      }
      app.req.post('/order/edit_address', params).then((res) => {
        var res = res.data
        if (res.status === 'ok') {
          wx.showToast({
            title: res.payload.message,
            success: (res) => {
              setTimeout(() => {
                wx.navigateTo({
                  url: `../order-details/index?order_id=${this.data.order_id}`
                })
              }, 1500)
            }
          })
        } else {
          wx.showToast({
            title: res.message,
            icon: 'success',
            duration: 2000
          })
        }
      })
    }else{
      wx.showToast({
        title: '请正确填写地址信息'
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }

})