// pages/login/login.js
import config from '../../../config'
var app = getApp()
Page({
  data: {
    backTo: ''
  },
  onLoad: function (query) {
    this.setData({
      backTo: decodeURIComponent(query.backTo)
    })
  },
  bindGetUserInfo: function (e) {
    if (e.detail.errMsg === 'getUserInfo:ok') {
      app.globalData.userInfo = e.detail.userInfo
      this.login();
    }
  },
  // 登陆
  login: function () {
    var that = this;
    wx.login({
      success: function (res) {
        wx.request({
          url: config.devDomain + 'login',
          method: 'POST',
          data: {code: res.code},
          success: function(resp){
            if (resp.data.status == 'ok') {
              wx.setStorageSync('session', resp.data.payload.session)
              // token是否失效
              if (resp.data.payload.token) {
                wx.setStorageSync('token', resp.data.payload.token)
                if (!wx.getStorageSync('supplier_id')) {
                  that.getDefaultShop()
                } else {
                  if (that.data.backTo) {
                    that.backTo()
                    return
                  }
                  wx.switchTab({
                    url: '/pages/tabbar/shop-list/index'
                  })
                }
              } else {
                // 去更新token
                that.updateUserInfo();
              }
            } else {
              // 登录错误
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel: false
              })
            }
          }
        })
      }
    })
  },
  // 更新登陆用户信息
  updateUserInfo: function () {
    var that = this;
    wx.getUserInfo({
      success: function (res) {
        var iv = res.iv;
        var encryptedData = res.encryptedData;
        // 下面开始调用更新接口
        wx.request({
          url: config.devDomain+'updateWeixin',
          method: 'POST',
          data: {
            session: wx.getStorageSync('session'),
            encrypted_data: encryptedData,
            iv: iv
          },
          success: function (resp) {
            if (resp.data.status == 'ok') {
              wx.setStorageSync('token', resp.data.payload.token)
              that.getDefaultShop()
            }
          }
        })
      },
      fail: function (fail) {
        //获取用户信息失败后。请跳转授权页面
      }
    })
  },
  getDefaultShop: function() {
    var that = this
    wx.request({
      url: config.devDomain + 'get_default_supplier',
      method: 'GET',
      header: {
        'token': wx.getStorageSync('token')
      },
      success: (resp) => {
        if (resp.data.status == 'ok') {
          app.globalData.supplier_id = resp.data.payload.supplier_id
          wx.setStorageSync('supplier_id', resp.data.payload.supplier_id)
          if (that.data.backTo) {
            that.backTo()
            return
          }
          wx.navigateBack({
            delta: 1
          })
        }
      }
    })
  },
  backTo () {
    let rootPath = getCurrentPages()[getCurrentPages().length - 2].route
    if (this.data.backTo.indexOf(rootPath) > -1) {
      wx.reLaunch({
        url: this.data.backTo,
        success: (result)=>{
        },
        fail: ()=>{},
        complete: ()=>{}
      });
      return
    }
    wx.redirectTo({
      url: this.data.backTo,
      success: (result)=>{
        this.setData({
          backTo: ''
        })
      },
      fail: ()=>{},
      complete: ()=>{}
    })
  }
})