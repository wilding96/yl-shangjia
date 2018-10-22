var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    wholeData: [],
    list: [],
    categoryId: 0,
    subCategoryId: 0,
    message: '',
    page_no: 1,
    loadMore: true,
    random: parseInt(Math.random() * 100000)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      categoryId: options.category,
      subCategoryId: options.scateId,
      shop_id: options.s,
      list: [],
      page_no: 1
    });
    this.getSecond()
  },
  openPage: function (e) {
    console.log(e)
    wx.navigateTo({
      url: "/pages/packageA/shop-detail/index?p=" + e.currentTarget.dataset.productId + '&s=' + this.data.shop_id
    })
  },
  tabClick: function (e) {
    this.setData({
      subCategoryId: e.target.id,
      list: [],
      page_no: 1
    });
    console.log(this.data.list);
    this.getSecond();
  },
  getSecond: function () {
    var self = this
    if (!this.data.loadMore) {
      return false
    }
    
    app.req.get('/category_product_list',{
      category_id: self.data.categoryId,
      sub_category_id: self.data.subCategoryId,
      page_no: self.data.page_no
    }).then((response) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      self.setData({
        wholeData: res.payload
      })
      if (res.status === 'ok') {
        var payload = res.payload.products
        if (payload.length > 0) {
          this.setData({
            loadMore: true,
            page_no: self.data.page_no + 1,
            list: self.data.list.concat(payload)
          })
        } else {
          this.setData({
            loadMore: true,
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
  onReachBottom: function () {
    this.getSecond();
  },
  // 下拉刷新
  onPullDownRefresh () {
    this.getSecond()
  },
  jumpDetail(productId) {
    location.href = "/m/d?s=" + this.$route.query.s + '&p=' + productId
  },
  
})