var app = getApp()
Page({

  // 初始化数据
  data: {
    refundedit:{
      content:'',
      images:[]
    },
    images: [],
    uploadTip:false,
    submitDisabled: 0,
    list: {},
    work_order_id: '',
    hash: ''
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      work_order_id: option.work_order_id
    })
  },

  refundeditInput(e){
    let refundedit_res = 'refundedit.content'
    this.setData({
      [refundedit_res]: e.detail.value
    })
  },
  
  submit() {

    console.log(this.data)

    this.data.refundedit.images = ''
    // for (let i=0; i < this.data.images.length; i++) {
    //   this.data.refundedit.images += this.data.images[i].hash+';'
    // }
    let refundedit_images = 'refundedit.images'
    this.setData({
      [refundedit_images]: this.data.hash
    })
    if(this.data.refundedit.content==0){
      wx.showToast({
        title: '请描述详细情况',
        icon: 'success',
        duration: 2000
      })
      return false;
    }
    this.data.refundedit.work_order_id = this.data.work_order_id
    this.data.submitDisabled = 1

    app.req.post('/cs/work_order_edit', this.data.refundedit).then((response) => {
      var res = response.data
      this.data.submitDisabled = 0
      if (res.status === 'ok') {
        let url = `/pages/packageC/service-workOrderDetail/index?work_order_id=${this.data.work_order_id}`
        wx.navigateTo({
          url: url
        })
      } else  {
        wx.showToast({
          title: res.message,
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  uploadImage(){
    wx.chooseImage({
      count: 1,
      success: (res) => {
        var tempFilePaths = res.tempFilePaths[0]
        wx.uploadFile({
          url: 'http://wxtest.youlianyc.com/api/web/image/upload/aftersales',
          filePath: tempFilePaths,
          name: 'image_file',
          header: {
            'X-CP-TOKEN': wx.getStorageSync('token')
          },
          formData:{
            'is_base64': '0'
          },
          success: (res) => {
            // 保存图片到数组
            let resp = JSON.parse(res.data)
            let array = []
            for(let i of this.data.images){
              array.push(i)
            }
            array.push(resp.payload.url)
            this.setData({
              images: array
            })

            // 保存图片hash
            this.setData({
              hash: this.data.hash += ';' + resp.payload.hash
            })

          }
        })
      }
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