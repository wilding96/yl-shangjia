var app = getApp()
Page({

  // 初始化数据
  data: {
    list: [], //购物车中商品
    invalidItems: [], //失效商品
    totalPrice: 0,  //总价格
    totalReward: 0, //奖励价格
    is_all_selected: 0,  //全选反选
    selectParams: [],
    delectSkuPanel: false,
    backup: '', //即将删除元素店铺集合
    delectInvitePanel: false,
    shop_id: '',
    shipTitle: '',
    editCart: 0,
    isCart: 0,
    iphonex: false,
    tag_518: 0,
    year_desc: {},
    discount_flag:0,
    intro_518_url: ''
  },

  // 监听页面加载
  onShow (options) {
    this.getData()
  },


  // 获得购物车数据
  getData () {
    var self = this
    if (this.data.isCart == 1) {
      return false
    }
    app.req.get('/cart').then((response) => {

      // 停止当前页面下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
  
      this.setData({
        isCart: 1,
        tag_518: res.flag_518,
        shop_id: res.payload.blocks.length>0 ? res.payload.blocks[0].shop_id : 0
      })

      if (res.status === 'ok') {
        wx.setStorageSync('is_shopkeeper', res.is_shopkeeper)
        this.setData({
          discount_flag: res.payload.discount_flag,
          list: res.payload.blocks,
          totalPrice: res.payload.all_sub_total_price,
          totalReward: res.payload.all_sub_total_reward,
          invalidItems: res.payload.invalid_items,
          is_all_selected: res.payload.is_all_selected,
          shipTitle: res.payload.shipping_cost_title,
          year_desc: res.payload.year_desc,
          intro_518_url: res.payload.intro_518_url,
        })
        setTimeout(() => {
          this.setData({
            isCart: 0
          })
        }, 600);

      } else {
        wx.showToast({
          title: res.message,
          icon: 'success',
          duration: 2000
        })
      }
    }).catch((response) => {
      console.log(response)
      wx.showToast({
        title: response.message,
        icon: 'success',
        duration: 2000
      })
    })
  },
  // 单个小店的全选/反选、sku的单选/反选 index店铺索引  i店铺中单个sku索引
  // selectShopOrSku (index, i, pt,pindex) {
  selectShopOrSku (e) {

    let index = e.currentTarget.dataset.index
    let i = e.currentTarget.dataset.i
    var pt = e.currentTarget.dataset.pt
    let pindex = e.currentTarget.dataset.pindex

    var self = this
    this.setData({
      selectParams: []
    })

    // 操作子元素选中/反选
    if (i != undefined) {
      if (pt == 'promotion') {
        var params = [{
          'sku_iid': this.data.list[index][pt][pindex].product[i].sku_iid,
          'quantity': this.data.list[index][pt][pindex].product[i].quantity,
          'is_selected': this.data.list[index][pt][pindex].product[i].is_selected==1?0:1,
          'shop_id': this.data.list[index][pt][pindex].product[i].shop_id
        }]
        let resSelectParams = this.data.selectParams.concat(params)

        this.setData({
          selectParams: resSelectParams
        })
      } else {
        var params = [{
          'sku_iid': this.data.list[index][pt][i].sku_iid,
          'quantity': this.data.list[index][pt][i].quantity,
          'is_selected': this.data.list[index][pt][i].is_selected==1?0:1,
          'shop_id': this.data.list[index][pt][i].shop_id
        }]
        let resSelectParams = this.data.selectParams.concat(params)

        this.setData({
          selectParams: resSelectParams
        })
      }
      this.selectAjax()

    } else {
      // 小店的选中/反选
      this.data.list[index].is_selected = !this.data.list[index].is_selected
      var setListSelected = "list[" + index + "].is_selected"
      this.setData({
        setListSelected: !setListSelected
      })
      for (var pt of ['products','promotion']) {
        for (var p of this.data.list[index][pt]) {
          if (p.is_selected != this.data.list[index].is_selected) {
            if (pt == 'promotion') {
              for (var motion of p.product) {
                var params = [{
                  'sku_iid': motion.sku_iid,
                  'quantity': motion.quantity,
                  'is_selected': this.data.list[index].is_selected,
                  'shop_id': motion.shop_id
                }]
                let resSelectParams = this.data.selectParams.concat(params)

                this.setData({
                  selectParams: resSelectParams
                })
              }
            } else {
              var params = [{
                'sku_iid': p.sku_iid,
                'quantity': p.quantity,
                'is_selected': this.data.list[index].is_selected,
                'shop_id': p.shop_id
              }]

              let resSelectParams = this.data.selectParams.concat(params)

              this.setData({
                selectParams: resSelectParams
              })
            }
          }
        }
      }
      self.selectAjax()
    }
  },
  // 购物车的 全选/反选
  checkAll () {
    var self = this
    this.is_all_selected = !this.is_all_selected
    for (var i of this.data.list) {
      for (var pt of ['products','promotion']) {
        for (var p of i[pt]) {
          if (pt == 'promotion') {
            for (var motion of p.product) {
              var params = {
                'sku_iid': motion.sku_iid,
                'quantity': motion.quantity,
                'is_selected': self.is_all_selected,
                'shop_id': motion.shop_id
              }
              self.data.selectParams.push(params)
            }
          } else {
            var params = {
              'sku_iid': p.sku_iid,
              'quantity': p.quantity,
              'is_selected': self.is_all_selected,
              'shop_id': p.shop_id
            }
            self.data.selectParams.push(params)
          }
        }
      }
    }
    this.selectAjax()
  },

  // sku 数量增减 blocks位置
  // pindex 正常为商品的位置 ,
  // 促销为促销活动下标(promotion)
  quantityAjax (e) {

    let index = e.currentTarget.dataset.index
    let pindex = e.currentTarget.dataset.pindex
    let i = e.currentTarget.dataset.i
    let type = e.currentTarget.dataset.type
    let pt = e.currentTarget.dataset.pt

    var params = {}
    // 活动商品数据
    if (pt == 'promotion') {
      var rulePromotion = this.data.list[index].promotion[pindex]
      var motion = rulePromotion.product[i]
      if (type == 'add') {
        rulePromotion.promotion_amount = Number(rulePromotion.promotion_amount) - 1
        motion.quantity+=1
      } else {
        rulePromotion.promotion_amount = Number(rulePromotion.promotion_amount) + 1
        motion.quantity-=1
      }
      params = {
        'sku_iid': motion.sku_iid,
        'quantity': motion.quantity,
        'is_selected': motion.is_selected,
        'shop_id': motion.shop_id
      }
    } else {
      // 非促销商品消息
      var normalProduct = this.data.list[index][pt][i]
      if (type == 'add') {
        normalProduct.quantity+=1
      } else {
        normalProduct.quantity-=1
      }
      params = {
        'sku_iid': normalProduct.sku_iid,
        'quantity': normalProduct.quantity,
        'is_selected': normalProduct.is_selected,
        'shop_id': normalProduct.shop_id
      }
    }
    this.data.selectParams.push(params)
    this.selectAjax()
  },
  // 选中/反选 数量增减 api
  selectAjax () {
    var self = this


    app.req.post('/edit_cart',{
      products: this.data.selectParams
    }).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        self.getData()
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
  deleteSku (e) {
    let id = e.currentTarget.dataset.id
  
    wx.showModal({
      title: '删除提示',
      content: '真的要把我从购物车删除吗?',
      success: (res) => {
        if (res.confirm) {
          this.delectAjax()
        }
      }
    })
    this.setData({
      backup: id
    })
  },
  delectAjax (ids) {
    var self = this
    var idss = ids ? ids : this.data.backup
    app.req.get('/remove_from_cart?ids='+idss).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000
        })
        self.getData()
      } else {
        wx.showToast({
          title: res.payload.message,
          icon: 'success',
          duration: 2000
        })
      }
    }).catch((response) => {
      // Toast(response)
    })
  },

  // 清空失效商品
  delectInvite () {
    wx.showModal({
      title: '删除提示',
      content: '确认清空失效宝贝?',
      success: (res) => {
        if (res.confirm) {
          var ids = ''
          for (var i of this.data.invalidItems) {
            ids += i.id+','
          }
          this.delectAjax(ids.substring(0,ids.length-1))
        }
      }
    })
  },
  // 购物车立即结算获取有效商品和选中的商品
  confirmBuy () {
    var products = []
    for (var l of this.data.list) {
      if (l.products.length>0) {
        for (var b of l.products) {
          if (b.is_selected==1 && b.is_invalid==0) {
            products.push({
              'product_id': b.product_id,
              'sku_iid': b.sku_iid,
              'shop_id': b.shop_id, //理解购买时店铺id可以是URL上
              'quantity': b.quantity,
              'unit_price': b.unit_price
            })
          }
        }
      }
    }
    for (var l of this.data.list) {
      if (l.promotion.length>0) {
        for (var b of l.promotion) {
          for (var s of b.product) {
            if (s.is_selected==1 && s.is_invalid==0) {
              products.push({
                'product_id': s.product_id,
                'sku_iid': s.sku_iid,
                'shop_id': s.shop_id, //理解购买时店铺id可以是URL上
                'quantity': s.quantity,
                'unit_price': s.unit_price
              })
            }
          }
        }
      }
    }
    if (products.length == 0) {
      wx.showToast({
        title: '请选择您要购买的商品',
        icon: 'success',
        duration: 2000
      })
      return false
    }
    var shopMark = products[0].shop_id
    for (var p of products) {
      if (p.shop_id!=shopMark) {
        wx.showToast({
          title: '不可同时在多个店铺下单',
          icon: 'success',
          duration: 2000
        })
        return false
      }
    }
    wx.setStorageSync('/order/verify',JSON.stringify(products))
    wx.navigateTo({
      url: './../../packageA/order-verify/verify?s=' + this.data.shop_id + '&orderSource=1'
    })
  },
  jumpPopupSale (id, shop_id) {
    this.$router.push(`/nOptinal/${id}/${shop_id}`)
  },
  // 判断是否为iphoneX
  isIphoneX () {
    this.iphonex = /iphone/gi.test(navigator.userAgent) && (screen.height == 812 && screen.width == 375)
  },
  jumpCdetail (e) {
    wx.navigateTo({
      url:"/pages/packageA/shop-detail/index?p="+e.currentTarget.dataset.productId
    })
  },
  jump (e) {
    let url = e.currentTarget.dataset.url
    wx.switchTab({
      url: url
    })
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }

})