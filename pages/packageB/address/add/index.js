import throttle from '../../../../utils/throttle'

var app = getApp()
Page({

  // 初始化数据
  data: {
    address_id: '',
    name: '',
    phone: '',
    location: '',
    detail_address: '',
    default: 0,
    region: '',
    province_id: '',
    city_id: '',
    district_id: ''
  },

  // 监听页面加载
  onLoad (options) {
    if (options.id) {
    	this.setData({
    	  address_id: options.id
    	})
      this.getData()
      
    }
  },

  // getData
  getData () {
    app.req.get(`user/get_one_address?address_id=${this.data.address_id}`).then((res) => {
      
      // 停止当前页面下拉刷新
      wx.stopPullDownRefresh()

      let resp = res.data.payload
      this.setData({
        name: resp.name,
        phone: resp.phone,
        region: [resp.province.name, resp.city.name, resp.district.name],
        detail_address: resp.detail_address,
        default: resp.is_default,
        province_id: resp.province.id,
        city_id: resp.city.id,
        district_id: resp.district.id
      })
    })
  },

  // 保存名称
  inputName (e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 保存手机号
  inputPhone (e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 保存详细地址
  inputAddress (e) {
    this.setData({
      detail_address: e.detail.value
    })
  },

  // 设置为默认
  setDefault (e) {
    let val = ''
    e.detail.value ? val = '1' : val = '0'
    this.setData({
      default: val
    })
  },

  // 地区选择
  bindRegionChange: function (e) {
    let province_id = e.detail.value[0]
    let city_id = e.detail.value[1]
    let district_id = e.detail.value[2]
    this.setData({
      region: e.detail.value,
      province_id: province_id,
      city_id: city_id,
      district_id: district_id
    })
  },

  // 保存地址
  saveAddress () {
    let reg = /^\d{11}$/
    if (!this.data.name) {
      wx.showToast({
        title: '收货人不能为空',
        icon: 'none'
      })
      return
    } else if (!reg.test(this.data.phone)) {
      wx.showToast({
        title: '填写正确手机号',
        icon: 'none'
      })
      return
    } else if (!this.data.province_id || !this.data.city_id || !this.data.district_id) {
      wx.showToast({
        title: '地址不能为空',
        icon: 'none'
      })
      return
    } else if (!this.data.detail_address) {
      wx.showToast({
        title: '详细地址不能为空',
        icon: 'none'
      })
      return
    } else {
      if (Number(this.data.province_id) && Number(this.data.city_id) && Number(this.data.district_id)) {
        this.ajaxSave()
      } else {
        /* 重设省份id
        **
        */
        app.req.get(`get_area`).then((res) => {
          console.log(this.data.province_id);
          if(res.data.status === 'ok'){
            for (var i of res.data.payload.areas) {
              if (this.data.province_id.includes(i.name)) {
                this.setData({
                  province_id: i.id
                })
                /* 重设城市id
                **
                */
                app.req.get(`get_area?area_type=1&area_id=${this.data.province_id}`).then((res_city) => {
                  console.log(res_city);
                  res_city.data.payload.areas.map((k) => {
                    if (this.data.city_id.includes(k.name)) {
                      this.setData({
                        city_id: k.id
                      })
                      /* 重设区域id
                      **
                      */
                      app.req.get(`get_area?area_type=2&area_id=${this.data.city_id}`).then((res_district) => {
                        console.log(res_district);
                        res_district.data.payload.areas.map((j) => {
                          if (this.data.district_id.includes(j.name)) {
                            this.setData({
                              district_id: j.id
                            })
                            this.ajaxSave()
                          }
                        })
                      })

                    }
                  })
                })
              }
            }
            // res.data.payload.areas.map((i) => {
              
            // })
          }else{
            wx.showToast({
              title: data.message
            })
            return
          }
        })
      }

    }

  },

  ajaxSave: throttle(function() {
    /* 
    ** 发送请求，保存地址
    */
    let url = 'user/save_address'
    let params = {
      name: this.data.name,
      phone: this.data.phone,
      province_id: this.data.province_id,
      city_id: this.data.city_id,
      district_id: this.data.district_id,
      detail_address: this.data.detail_address,
      is_default: this.data.default,
      address_id: this.data.address_id
    }
    app.req.post(url, params).then((resp) => {
      var data = resp.data
      if (data.status == "ok") {
        let title = this.data.address_id ? '编辑成功' : '创建成功'
        wx.showToast({
          title: title,
          success: (res) => {
            setTimeout(() => {
              wx.redirectTo({
                url: '../index/index'
              })
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
  }),

  onPullDownRefresh () {
    this.getData()
  }

})