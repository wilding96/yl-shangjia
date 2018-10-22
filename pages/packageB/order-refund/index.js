import config from '../../../config'

var app = getApp()
Page({

  // 初始化数据
  data: {
    note: '',
    payload: '',
    reason_list: [],
    uploadImg: [],
    index: 0,
    orderid: '',
    detailid: '',
    hash: ''
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      orderid: option.orderid,
      detailid: option.detailid,
      edit: option.edit,
      id: option.id
    })
    this.getData()
  },

  // getData
  getData () {

    let url = ''

    if(this.data.edit){
      url = `aftersales/refund_edit_page?id=${this.data.id}`
    }else{
      url = 'aftersales/refund_page?order_id=' + this.data.orderid + '&detail_id=' + this.data.detailid
    }
    app.req.get(url).then((response) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'ok') {
        let arr = []
        for(let i in res.payload.reason_list){
          arr.push(res.payload.reason_list[i])
        }
        this.setData({
          payload: res.payload,
          reason_list: arr,
          index: res.payload.reason_id-1 || 0,
        })
        if (this.data.edit) {
          this.setData({
            note: res.payload.note,
            uploadImg: res.payload.images,
          })
          for (let i of res.payload.images)
          {
            this.setData({
              hash: this.data.hash += ';' + i.hash
            })
          }
        }
      } else {
        wx.showToast({
          title: res.message,
          duration: 2000
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 2
          })
        }, 2000)
      }
    })
  },

  // 设置输入框的值
  noteInput: function(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 切换退款原因
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },

  // 删除图片
  deleteImg: function(e) {
    let hash = e.currentTarget.dataset.hash
    for(let i=0;i<this.data.uploadImg.length;i++)
    {
      if (hash == this.data.uploadImg[i].hash) {
        let arr = this.data.uploadImg
        arr.splice(i, 1)
        this.setData({
          uploadImg: arr
        })
      }
    }
  },

  // 上传售后图片
  uploadImage () {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        var tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths);
        wx.uploadFile({
          url: config.devDomain+'upload',
          filePath: tempFilePaths[0],
          name: 'image',
          header: {
            'token': wx.getStorageSync('token')
          },
          formData:{
            'type': 'aftersales'
          },
          success: (res) => {

            // 保存图片到数组
            let resp = JSON.parse(res.data)
            let array = []
            for(let i of this.data.uploadImg){
              array.push(i)
            }
            array.push(resp.payload)
            this.setData({
              uploadImg: array
            })

            // 保存图片hash
            this.setData({
              hash: this.data.hash += ';' + resp.payload.hash
            })
            console.log(this.data.uploadImg);
            console.log(this.data.uploadImg.length);
          }
        })

      }
    })
  },

  // 提交申请
  submitRefund: function () {

    if(!this.data.note){
      wx.showToast({
        title: '请填写退款说明'
      })
      return
    } else {
      let reason_id = parseInt(this.data.index) + 1
      let images = ''
      for (let i=0;i<this.data.uploadImg.length;i++)
      {
        images = images += this.data.uploadImg[i].hash += ';'
      }
      
      let url = ''
      let params = {}

      if(this.data.edit){
        url = `aftersales/refund_edit?id=${this.data.id}`
        params = {
          reason_id: reason_id,
          note: this.data.note,
          images: images
        }
      }else{
        url = 'aftersales/refund_new'
        params = {
          order_id: this.data.orderid,
          detail_id: this.data.detailid,
          reason_id: reason_id,
          note: this.data.note,
          images: images
        }
      }

      app.req.post(url, params).then((resp) => {
        var data = resp.data
        if (data.status == "ok") {
          wx.navigateTo({
            url: `/pages/packageB/order-refund-detail/index?detail_id=${data.payload.detailid}&order_id=${this.data.orderid}&id=${data.payload.id}`
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
    }

  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})