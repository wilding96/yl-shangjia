function wxpay(app, orderId, redirectUrl) {
  let remark = "在线充值";
  if (orderId != 0) {
    remark = "支付订单 ：" + orderId;
  }
  app.req.post( 'payment/pay', {
      order_id: orderId,
      payment_method: 1,
    }).then(function(res){
      if (res.data.status == 'ok') {
        var params = res.data.payload
        // 发起支付
        console.log(params)
        wx.requestPayment({
          timeStamp: params.timeStamp,
          nonceStr: params.nonceStr,
          signType: 'MD5',
          paySign: params.paySign,
          appId: params.appId,
          package: params.package,
          fail: function (aaa) {
            wx.showToast({ title: '支付失败' })
            wx.redirectTo({
              url: '../../packageB/order-list/index'
            });
          },
          success: function () {
            wx.showToast({ title: '支付成功' })
            wx.redirectTo({
              url: redirectUrl
            });
          }
        })
      } else {
        wx.showToast({ title: '服务器忙' + res.data.code + res.data.msg })
      }
    })
}

module.exports = {
  wxpay: wxpay
}
