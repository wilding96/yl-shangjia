import req from './request'
// 获取UUId
const uuidV4 = require('../node/uuid/v4')
import config from '../config'
try {
  var uuid = wx.getStorageSync('uuid')
  if (!uuid) {
    wx.setStorageSync('uuid', uuidV4())
  }
} catch (e) {
}
function soj (params) {
  if (typeof(params) == 'undefined') return false
  //获取店铺信息
  var getShopInfo = new Promise((resolve, reject) => {
    if (!wx.getStorageSync('c_shop_id')) {
      wx.setStorageSync('c_shop_id', -1) // 默认 c_shop_id = -1
    }
    if (wx.getStorageSync('token') && params.s != 0 && typeof(params.s)!='undefined'){
      req.get('/shop/info?shop_id=' + params.s).then((response) => {
        if (response.data.status === 'ok') {
          let res = response.data.payload
          wx.setStorageSync('c_icon',res.icon)
          wx.setStorageSync('c_intro',res.intro)
          wx.setStorageSync('c_name',res.name)
          wx.setStorageSync('c_shop_id',res.shop_id)
          wx.setStorageSync('c_shopkeeper_user_id',res.shopkeeper_user_id)
          wx.setStorageSync('c_wechat_card',res.wechat_card)
        } else {
          wx.setStorageSync('c_shop_id',-1)
        }
        resolve()
      }).catch((response) => {
        window.$toast.toast(response.message)
        reject()
      })
    } else {
      resolve()
    }
  })
  // 获取user_id
  var getUserInfo = new Promise((resolve, reject) => {
    if (wx.getStorageSync('token')) {
      req.get('/my').then((response) => {
        var res = response.data
        if (res.status === 'ok') {
          wx.setStorageSync('user_id',res.payload.user_id)
        } else {
          wx.setStorageSync('user_id', -1)
        }
        resolve()
      }).catch((response) => {
        // window.$toast.toast(response.message)
        reject()
      })
    } else {
      resolve()
    }
  })
  Promise.all([getShopInfo, getUserInfo])
  .then(function(){
    // var params={
    //   'page_name': 'wolaishishi',
    //   'uid': wx.getStorageSync('uuid'),
    //   'action_type': 'LOAD',
    //   'v':  encodeURIComponent('')
    // }
    wx.request({
      url: config.baseDomain+'log/wxa',
      data: {
        'page_name': params.page_name,
        'uid': wx.getStorageSync('uuid'),
        'action_type': params.action_type || 'LOAD',
        'v': encodeURIComponent(params.v)
      },
      header: {
        'cookie': 'c_icon='+escape(wx.getStorageSync('c_icon'))+';'+
        'c_intro='+escape(wx.getStorageSync('c_intro'))+';'+
        'c_name='+escape(wx.getStorageSync('c_name'))+';'+
        'c_shop_id='+escape(wx.getStorageSync('c_shop_id'))+';'+
        'c_shopkeeper_user_id='+escape(wx.getStorageSync('c_shopkeeper_user_id'))+';'+
        'c_wechat_card='+escape(wx.getStorageSync('c_wechat_card'))+';'+
        'user_id='+escape(wx.getStorageSync('user_id'))+';'
      },
      success: function(res){

      }
    })
  })
}
module.exports =  soj
