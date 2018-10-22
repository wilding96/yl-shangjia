//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    page_no: 1,
    toView: 0,
    loadMore: false,
    scrollTop: 0,
    entrys: [],
    tab_btn: 1,
    // new 1.0
    newList: [],
    supplier_info: '',
    message: '',
    salesVolume: 0, // 销量排序方式 0 1 2
    newProduct: 3, // 新品 3
    priceRank: 4, // 价格排序方式 4 5 6
    hasHotsell: false,
    supplier_id: 0,
    order: '', // 排序
    toDetail: false
  },
  openPage:function(e){
    this.setData({'toDetail': true})
    wx.navigateTo({
      url:`/pages/packageA/shop-detail/index?p=${e.currentTarget.dataset.productId}&s=${this.data.supplier_id}`
    })
  },
  onLoad: function (e) {
    let backTo = decodeURIComponent(e.backTo || '')
    // 已登陆直接跳转
    if (backTo && wx.getStorageSync('session') && wx.getStorageSync('token')) {
      wx.navigateTo({
        url: backTo,
        success: (result)=>{
        },
        fail: ()=>{},
        complete: ()=>{}
      });
      return
    }
    this.setData({
      'supplier_id': e.s || wx.getStorageSync('supplier_id')
    })
    if (e.s) {
      wx.setStorageSync('supplier_id', e.s)
      app.globalData.supplier_id = e.s
      if (e.p && wx.getStorageSync('token')) {
        wx.navigateTo({
          url:`/pages/packageA/shop-detail/index?p=${e.p}&s=${e.s}`
        })
      }
    }
    if (e.scene) {
      this.getScene(e.scene)
    }
  },
  onShow: function (e) {
    this.setData({
      'supplier_id': wx.getStorageSync('supplier_id')
    })
    this.changeFilter()
  },
  getScene: function(e) {
    app.req.get('parse/scene', {
      scene: e
    })
    .then((res) => {
      console.log(res);
      if (res.data.status === 'ok') {
        let data = res.data.payload
        wx.setStorageSync('supplier_id', data.supplier_id)
        wx.navigateTo({
          url: data.jump_path
        })
      } else {
        wx.showToast({
          title: res.message
        })
      }
    })
  },
  defaultShop: function() {
    app.globalData.shop_id = this.data.supplier_id
    this.shopHot()
  },

  onReachBottom: function() {
    if (this.data.loadMore) {
      this.data.page_no++
      this.getGoodsList(this.data.order)
    }
  },
  onPullDownRefresh () {
    this.onShow()
    setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 1000)
  },
  onPageScroll: function(e) {
    this.setData({
      'scrollTop': e.scrollTop
    })
  },
  goTop: function () {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    }
  },
  onShareAppMessage: function () {
    console.log(this.data.supplier_id);
    return {
      title: this.data.supplier_info.name,
      imageUrl: this.data.shop_icon,
      path: 'pages/tabbar/shop-list/index?s=' + this.data.supplier_id,
      success: function (res) {
        console.log(this.path);
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  getGoodsList: function(order) {
    if (!this.data.loadMore) {
      return false
    }
    this.setData({
      order: order
    })
    // new 1.0
    let self = this
    app.req.get('home',{
      order: self.data.order,
      supplier_id: self.data.supplier_id,
      page_no: self.data.page_no
    }).then((response) => {
      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'ok') {
        var payload = res.payload.list
        if (payload.length > 0) {
          self.setData({
            entrys: res.payload.hot,
            supplier_info: res.payload.supplier_info,
            message: '小练正在努力加载中...'
          })
          if (self.data.page_no > 1) {
            this.setData({
              loadMore: true,
              newList: self.data.newList.concat(payload)
            })
          } else {
            this.setData({
              loadMore: true,
              page_no: self.data.page_no,
              newList: payload
            })
          }
        } else {
          this.setData({
            loadMore: false,
            message: '没有更多了~'
          })
        }
      } else {
        wx.showToast({
          title: '请求失败'
        })
      }
    }).catch(function (resp) {
      console.log(resp)
      wx.showToast({
        title: resp
      })
    })
  },

  changeFilter: function (e) {
    let type = ''
    if (e) {
      type = e.currentTarget.dataset.filterType
    } else if (this.data.toDetail) {
      return
    }
    this.setData({
      loadMore: true
    })
    // console.log(type);
    switch(type)
    {
      case 0:
        this.setData({
          'salesVolume': 2,
          'tab_btn': 1,
          'priceRank': 4,
          'page_no': 1
        })
        console.log('销量默认=>销量递增')
        this.getGoodsList(0)
        break
      case 1:
        this.setData({
          'salesVolume': 2,
          'tab_btn': 1,
          'priceRank': 4,
          'page_no': 1
        })
        console.log('销量递增=>销量递减')
        this.getGoodsList(1)
        break
      case 2:
        this.setData({
          'salesVolume': 1,
          'tab_btn': 1,
          'priceRank': 4,
          'page_no': 1
        })
        console.log('销量递减=>销量递增')
        this.getGoodsList(0)
        break
      case 3:
        this.setData({
          'salesVolume': 0,
          'tab_btn': 2,
          'priceRank': 4,
          'page_no': 1
        })
        console.log('新品')
        this.getGoodsList(2)
        break
      case 4:
        this.setData({
          'salesVolume': 0,
          'tab_btn': 3,
          'priceRank': 5,
          'page_no': 1
        })
        console.log('价格默认=>价格递增')
        this.getGoodsList(4)
        break
      case 5:
        this.setData({
          'salesVolume': 0,
          'tab_btn': 3,
          'priceRank': 6,
          'page_no': 1
        })
        console.log('价格递增=>价格递减')
        this.getGoodsList(3)
        break
      case 6:
        this.setData({
          'salesVolume': 0,
          'tab_btn': 3,
          'priceRank': 5,
          'page_no': 1
        })
        console.log('价格递减=>价格递增')
        this.getGoodsList(4)
        break
      default:
      this.setData({
        'salesVolume': 2,
        'tab_btn': 1,
        'priceRank': 4,
        'page_no': 1
      })
        this.getGoodsList(0)
    }
  }
})
