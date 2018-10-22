var app = getApp()
Page({

  // 初始化数据
  data: {
    refundedit:{
      content:'',
      images:[],
      mobile: ''
    },
    images: [],
    uploadTip:false,
    isiOS: true,
    submitDisabled: 0,
    list: {},
    order_id: '',
    detail_id: '',
    qa_id: '',
    hash: ''
  },

  // 监听页面加载
  onLoad (option) {
    this.setData({
      order_id: option.order_id,
      detail_id: option.detail_id,
      qa_id: option.qa_id
    })

    this.getData()
  },

  getData() {
    app.req.get('/cs/qa?order_id='+this.data.order_id+'&detail_id='+this.data.detail_id+'&qa_id='+this.data.qa_id).then((response) => {
      var res = response.data
      if (res.status == 'ok') {
        let refundedit_res = 'refundedit.mobile'
        this.setData({
          list: res.payload,
          [refundedit_res]: res.payload.mobile
        })
        console.log(this.data)
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
  refundChange(e){
    let str = 'refundedit.content'
    this.setData({
      [str]: e.detail.value
    })
  },
  mobileInput(e){
    let mobile = 'refundedit.mobile'
    this.setData({
      [mobile]: e.detail.value
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

            console.dir(this.data)
          }
        })
      }
    })
  },
  submit() {
    this.data.refundedit.images = ''
    // for (var i=0; i < this.data.images.length; i++) {
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
    } else if (this.data.list.image_necessary==1 && this.data.refundedit.images=='') {
      wx.showToast({
        title: '请输入上传图片',
        icon: 'success',
        duration: 2000
      })
      return false;
    }
    this.data.refundedit.detail_id = this.data.detail_id
    this.data.refundedit.qa_id = this.data.qa_id
    this.data.submitDisabled = 1
    app.req.post('/cs/work_order_submit', this.data.refundedit).then((response) => {
      var res = response.data
      this.data.submitDisabled = 0
      if (res.status === 'ok') {
        let url = `/pages/packageC/service-workOrderDetail/index?work_order_id=${res.payload.work_order_id}`
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

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})