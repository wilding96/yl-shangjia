//app.js
import config from './config'
var req = require('./utils/request')
// var soj = require('./utils/soj')
App({
  onLaunch: function (options) {
    let query = options.query
    let backTo = query.backTo || ''
    req.baseUrl(config.devDomain)
    req.interceptor(res=>{
      switch(res.data.code){
        case 40301:
          let path = `/pages/tabbar/login/login?backTo=${backTo}`
          wx.navigateTo({
            url: path,
          })
          return false;
        default:
          return res.data
      }
    })
    wx.setEnableDebug({
      enableDebug: false,
    })

    function compareVersion(v1, v2) {
      v1 = v1.split('.')
      v2 = v2.split('.')
      var len = Math.max(v1.length, v2.length)

      while (v1.length < len) {
        v1.push('0')
      }
      while (v2.length < len) {
        v2.push('0')
      }

      for (var i = 0; i < len; i++) {
        var num1 = parseInt(v1[i])
        var num2 = parseInt(v2[i])

        if (num1 > num2) {
          return 1
        } else if (num1 < num2) {
          return -1
        }
      }

      return 0
    }

    let SDKVersion = wx.getSystemInfoSync().SDKVersion
    let isSDKVersion = compareVersion(SDKVersion, '1.9.9')

    if (isSDKVersion > 0) {
      const updateManager = wx.getUpdateManager()
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })
      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
        wx.showToast({
          title: '新版本下载失败',
          icon: 'success',
          duration: 2000
        })
      })
    }

  },

  globalData:{
    userInfo:null,
    version: "0.1",
    supplier_id: 0,
    shareProfile: '有练过 更懂生活' // 首页转发的时候话术
  },
  req,
  // soj

  onShow: function(options) {
  }
})
