import throttle from '../../../utils/throttle'

var wxpay = require('./../../../utils/pay.js')
var app = getApp()
Page({
  data:{
    statusType: {
      all: "全部",
      topay: "待付款",
      toship: "待发货", 
      shipping: "待收货",
      completed: "已完成"
    },
    tabClass: ["", "", "", "", ""],
    currentType:'all',
    lists: [],
    page_no: 1,
    message: '加载中...',
    loadMore: true,
    items: [],
    url: '',
    is_subscribe: 0,
    skeywords: '',
    is_b: 0,
    supplier_id: 0
  },
  statusTap:function(e){
     var curType =  e.currentTarget.dataset.index;
     this.setData({
       currentType: curType,
       loadMore: true,
       page_no: 1
     });
     this.getdata();
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    this.setData({ 
      currentType: options.state || 'all',
      supplier_id: options.s || wx.getStorageSync('supplier_id')
    })
    console.log(options);
  },
  onShow: function () {
    this.getdata()
  },
  wordChange (e) {
    this.setData({
      skeywords: e.detail.value
    })
  },

  getdata: function (){
    // 获取订单列表
    var _this = this
    // if (!this.data.loadMore) {
    //   return false
    // }
    app.req.get('order/list?state=' + _this.data.currentType + '&page_no=' + _this.data.page_no + '&supplier_id=' + _this.data.supplier_id).then((response) => {
      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'fail') {
        wx.showToast({
          title: res.message
        })
      } else if (res.status === 'ok') {
        wx.showLoading()
        var payload = res.payload.list
        if (payload.length > 0) {
          this.setData({
            loadMore: true,
            message: '小练正在努力加载中...',
          })
          if (this.data.page_no > 1) {
            this.setData({
              lists: _this.data.lists.concat(payload)
            })
          } else {
            this.setData({
              lists: payload
            })
          }
        } else {
          if (this.data.page_no > 1) {
            this.setData({
              lists: _this.data.lists.concat(payload),
              message: '没有更多了'
            })
          } else {
            this.setData({
              lists: payload,
              message: '暂无数据'
            })
          }
        }

        wx.hideLoading()
      }

     if (this.data.lists.length <10) {
      this.setData({
        message: '没有更多了',
        loadMore: false,
      })
     }
    })
  },
  onReachBottom: function () {
    if (this.data.loadMore) {
      this.data.page_no++
      this.getdata()
    }
  },
  onPullDownRefresh: function () {
    this.setData({
      loadMore: false
    })
    this.getdata()
  },
  showModel(e) {
    var _this = this
    var type = e.currentTarget.dataset.type
    var orderid = e.currentTarget.id
    if (type === 'cancel') {
      var params = { 'title': '取消订单', 'content': '确认关闭本订单吗？'}
      var url = 'order/cancel?order_id=' + orderid
    } else if (type === 'confirm') {
      var params = { 'title': '确认收货', 'content': '确认已经验收货物了吗？'}
      var url = 'order/confirm?order_id=' + orderid
    } else if (type === 'hide') {
      var params = { 'title': '删除订单', 'content': '确认删除该订单吗？'}
      var url = 'order/hide?order_id=' + orderid
    }
    wx.showModal({
      title: params.title,
      content: params.content,
      success:function(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          app.req.get(url).then((response) => {
            var res = response.data
            if (res.status === 'ok') {
              _this.getdata()
            } else {
              // Toast(res.message)
            }
          })
        }
      }
    })
  },
  orderPay: throttle(function (op) {
    wxpay.wxpay(app, op.target.id, "../order-list/index");
  }),

  jump (e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  }
})