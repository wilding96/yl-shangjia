import config from '../../../config'

var app = getApp()
Page({
  data:{
    index: 0,
    payload: '',
    reason_list: [],
    refund_reason_list: [],
    aftersaleType: 2,
    note: '',
    uploadImg: [],
    hash: '',
    id: '', // 修改售后的id
    reason_id: 31
  },
  // 监听页面加载
  onLoad: function (option) {

    this.setData({
      orderid: option.orderid,
      detailid: option.detailid,
      edit: option.edit,
      id: option.id
    })

    this.getData()
  },

  getData () {
    let url = ''
    console.log(this.data.edit);
    if(this.data.edit){
      url = `aftersales/aftersales_edit_page?id=${this.data.id}`
    }else{
      url = 'aftersales/aftersales_page?order_id=' + this.data.orderid + '&detail_id=' + this.data.detailid
    }

    app.req.get(url).then((response) => {
      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'ok') {
        let arr = []
        let arrId = []
        let arr1 = []
        let arr1Id = []
        for(let i in res.payload.reason_list){
          arr.push(res.payload.reason_list[i].desc)
          arrId.push(i)
        }
        for(let i in res.payload.refund_reason_list){
          arr1.push(res.payload.refund_reason_list[i].desc)
          arr1Id.push(i)
        }
        this.setData({
          payload: res.payload,
          reason_list: arr,
          reason_list_id: arrId,
          refund_reason_list: arr1,
          refund_reason_list_id: arr1Id,
          refund_amount: res.payload.real_amount
        })
        console.log(this.data.reason_list);
        console.log(this.data.reason_list_id);
        console.log(this.data.refund_reason_list);
        console.log(this.data.refund_reason_list_id);
        if (this.data.edit) {
          this.setData({
            aftersaleType: res.payload.aftersales_type,
            note: res.payload.note,
            reason_id: res.payload.reason_id,
            uploadImg: res.payload.images
          })
          for (let i of res.payload.images)
          {
            this.setData({
              hash: this.data.hash += ';' + i.hash
            })
          }
          if (res.payload.aftersales_type === 2 || res.payload.aftersales_type === 3) {
            let id = res.payload.reason_id
            for (let i=0;i<this.data.reason_list.length;i++)
            {
              if(res.payload.reason_list[id].desc == this.data.reason_list[i])
              {
                this.setData({
                  index: i
                })
                console.log(i);
              }
            }
          } else if (res.payload.aftersales_type === 4) {
            let id = res.payload.reason_id
            for (let i=0;i<this.data.reason_list.length;i++)
            {
              if(res.payload.refund_reason_list[id].desc == this.data.refund_reason_list[i])
              {
                this.setData({
                  index: i
                })
                console.log(i);
              }
            }
          }
        }
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

  // 退款类型
  changeStyle(e){
    if(e.detail.value === '退货退款'){
      this.setData({
        aftersaleType: 2,
        reason_id: 31,
        index: 0
      })
    } else if(e.detail.value === '换货'){
      this.setData({
        aftersaleType: 3,
        reason_id: 31,
        index: 0
      })
    } else if(e.detail.value === '仅退款'){
      this.setData({
        aftersaleType: 4,
        reason_id: 41,
        index: 0
      })
    }
  },

  // 退货退款&换货 退款原因
  bindReasonListChange (e) {
    this.setData({
      index: e.detail.value,
      reason_id: this.data.reason_list_id[e.detail.value]
    })
  },

  // 仅退款
  bindRefundReasonListChange (e) {
    this.setData({
      index: e.detail.value,
      reason_id: this.data.refund_reason_list_id[e.detail.value]
    })
  },

  // 设置输入框的值
  noteInput: function(e) {
    this.setData({
      note: e.detail.value
    })
  },

  // 金额
  real_amountInput(e){
    this.setData({
      refund_amount: e.detail.value
    })
  },

  // 上传图片
  uploadImage () {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        var tempFilePaths = res.tempFilePaths
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

          }
        })

      }
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

  // 提交
  submitRefund () {
    // let images = this.data.hash.substr(1)
    let images = ''
    for (let i=0;i<this.data.uploadImg.length;i++)
    {
      images = images += this.data.uploadImg[i].hash += ';'
    }
    let param = {
      order_id: this.data.orderid,
      detail_id: this.data.detailid,
      reason_id: this.data.reason_id,
      note: this.data.note,
      images: images,
      aftersales_type: this.data.aftersaleType,
      refund_amount: this.data.refund_amount,
      id: this.data.id
    }
    console.log(param);
    if(this.data.note && this.data.aftersaleType && this.data.refund_amount){
      if (this.data.edit) {
        var url = 'aftersales/aftersales_edit'
      } else {
        var url = 'aftersales/aftersales_new'
      }
      app.req.post(url, param).then((resp) => {
        var data = resp.data
        if (data.status == "ok") {
          wx.navigateTo({
            url: `/pages/packageB/order-refund-detail/index?id=${data.payload.id}&order_id=${this.data.orderid}`
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
    } else {
      wx.showToast({
        title: '请正确填写信息'
      })
    }

  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})