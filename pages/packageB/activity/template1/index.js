var app = getApp()
Page({

  // 初始化数据
  data: {
    payload: '',
    categorySwiper: {
      slidesPerView: 'auto',
      freeMode: true
    },
    cart: ''
  },

  // 监听页面加载
  onLoad (options) {
    this.setData({
      id: options.id
    })
    this.getData(this.data.id)
  },

  // 获取数据
  getData (id) {
    let url = '/shop/entry_detail?id=' + id
    app.req.get(url).then((res) => {

      // 停止当前页面下拉刷新
      wx.stopPullDownRefresh()

      this.setData({
        payload: res.data.payload
      })
    })

    let cart_url = '/cart/count'
    app.req.get(cart_url).then((res) => {
      this.setData({
        cart: res.data.payload
      })
    })

  },

  // goHome
  goHome (e) {
    wx.switchTab({
      url: '/pages/tabbar/shop-list/index?s=' + e.currentTarget.dataset.shopId
    })
  },

  // goCart
  goCart (e) {
    wx.switchTab({
      url: '/pages/tabbar/cart/index?s=' + e.currentTarget.dataset.shopId
    })
  },

  // pageScrollTop
  pageScrollTop (e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    })
  },

  // goDetail
  goDetail (e) {
    wx.navigateTo({
      url:"/pages/packageA/shop-detail/index?p="+e.currentTarget.dataset.shopId
    })
  },

  // 获取优惠券
  getCoupons (e) {
    let id = e.currentTarget.dataset.id
    let url = `/coupon/${id}/receive`
    app.req.get(url).then(res => {
      if (res.data.status === 'ok') {
        wx.showModal({
          title: '领取成功',
          content: '查看优惠券？',
          success: function(res) {
            if (res.confirm) {
              console.log('用户点击确定')
            }
          }
        })
      } else {
        wx.showToast({
          title: res.data.message,
          icon: 'success',
          duration: 2000
        })
      }
    })
  },

  // addToCart
  addToCart (e) {

    let params = {
      'sku_id': e.currentTarget.dataset.skuId,
      'quantity': 1,
      'product_id': e.currentTarget.dataset.productId,
      'delta': 1,
      'is_selected': 1,
      'shop_id': this.data.payload.shop_info.shop_id
    }

    app.req.post('/edit_cart', {
      products: [params]
    }).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        debugger
        this.cart = res.payload.quantity
      } else {
        wx.showToast({
          title: res.message,
          icon: 'success',
          duration: 2000
        })
      }
    }).catch((response) => {
      wx.showToast({
        title: response,
        icon: 'success',
        duration: 2000
      })
    })

  },
  onPullDownRefresh () {
    this.getData(this.data.id)
  }

})