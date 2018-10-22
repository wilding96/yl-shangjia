var app = getApp()
Page({
  data:{
    reviews: [],
    tags: [],
    product_id: '',
    page_no: 1,
    message: '',
    loading: true,
    tag_id: '',
    review_id: '',
    dataLoading: true,
    couponSwiper: {
      slidesPerView: 'auto',
      freeMode: true,
      spaceBetween: 10
    },
    largerVisible: false,
    swiperOption: {
      pagination: '.swiper-pagination',
      autoplayDisableOnInteraction: false,
      loop: 1,
      lazyLoading: true,
      paginationType: 'fraction',
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev'
    },
    imgs: [],
    isLoading: false
  },
  onLoad(options){
    this.setData({
      product_id: options.product_id,
      tag_id: options.tag_id || 1,
      review_id: options.review_id || 0
    })
    this.getData()
  },
  getData (isTabClick) {
    var self = this
    // 本次api处理没结束 禁止再次请求
    if (this.data.isLoading) {
      return false
    }

    this.setData({
      isLoading: true,
      dataLoading: false
    })

    if (this.data.tag_id != (this.data.tag_id || 1)) {
      this.setData({
        reviews: [],
        page_no: 1
      })
    }
    app.req.get('/review?product_id=' + this.data.product_id + '&page_no=' + this.data.page_no + '&tag_id=' + (this.data.tag_id || 1) + '&review_id=' + this.data.review_id).then((response) => {
      var res = response.data
      if (res.status === 'ok') {

        // 停止当前页面下拉刷新
        wx.stopPullDownRefresh()

        var payload = res.payload
        this.setData({
          tag_id: this.data.tag_id || 1,
          tags: payload.tags,
          dataLoading: true,
          isLoading: false
        })

        if (payload.reviews.length > 0) {
          this.setData({
            page_no: this.data.page_no+1,
            reviews: this.data.reviews.concat(payload.reviews),
            loading: false
          })
        } else {
          this.setData({
            loading: true,
            message: '没有更多了'
          })
        }

        this.setData({
          isLoading: false
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'success',
          duration: 2000
        })
      }
    }).catch((response) => {
      wx.showToast({
        title: response.data.message,
        icon: 'success',
        duration: 2000
      })
    })
  },

  tabClick (e) {
    this.setData({
      tag_id: e.currentTarget.dataset.id,
      reviews: []
    })
    app.req.get('/review?product_id=' + this.data.product_id + '&page_no=1&tag_id=' + (this.data.tag_id || 1) + '&review_id=' + this.data.review_id).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        var payload = res.payload
        this.setData({
          tag_id: this.data.tag_id || 1,
          tags: payload.tags
        })
        if (payload.reviews.length > 0) {
          this.setData({
            reviews: payload.reviews
          })
        } else {
          this.setData({
            loading: true,
            message: '没有更多了'
          })
        }
        this.setData({
          isLoading: false
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'success',
          duration: 2000
        })
      }
    }).catch((response) => {
      wx.showToast({
        title: response.data.message,
        icon: 'success',
        duration: 2000
      })
    })
  },
  loadMore () {
    if (this.data.dataLoading) {
      this.getData()
    }
  },
  showLarge (e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      imgs: this.data.reviews[index].images,
      largerVisible: true
    })
    console.log(this.data.imgs)
  },
  closeLargerVisible(){
    this.setData({
      largerVisible: false
    })
    console.log(this.data.largerVisible)
  },
  // 下拉刷新
  onPullDownRefresh () {
    this.getData()
  }
})