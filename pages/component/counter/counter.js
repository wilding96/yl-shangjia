// pages/component/counter/counter.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    nextTime: {
      type: Number,
      value: ''
    },
    counterClass: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hour: '',
    mins: '',
    ss: '',
    timeinterval: 0
  },

  ready: function() {
    var self = this
    this.data.timeinterval = setInterval(function () {
      self.timeCountDown()
    }, 1000)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    timeCountDown() {
      var residue = parseInt(this.data.nextTime)
      var hour = parseInt(residue / 3600)  //剩余小时
      var mins = parseInt((residue % 3600) / 60) //剩余分钟
      var ss = parseInt(residue % 60)  //剩余秒数
      var hsp, msp, ssp
      if (hour < 10) {
        hour = '0' + hour
      }
      if (mins < 10) {
        mins = '0' + mins
      }
      if (ss < 10) {
        ss = '0' + ss
      }

      if (this.data.nextTime === 0) {
        clearInterval(this.timeinterval)
      } else {
        this.data.nextTime--
      }
      this.setData({
        hour: hour,
        mins: mins,
        ss: ss
      })
    }
  }
})
