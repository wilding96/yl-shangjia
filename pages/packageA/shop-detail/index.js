import throttle from '../../../utils/throttle'

//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    p: [],
    autoplay: false,
    interval: 3000,
    duration: 300,
    circular:true,
    swiperCurrent: 0,
    info: [],
    images: [],
    sale_amount: 0,
    progress_amount: 0,
    activityNum: 0,
    propImg: '',
    targetel: {},
    skuMap: [],
    skuMapString: '',
    skuDefault: [],
    skuMapFake: '',
    mapPv: [],
    pvMapQuantityZero: [],
    skuMain: {
      quantity: 1,
      sku_id: '',
      sku_quantity: '',
      sku_price: ''
    },
    nowBuy: 0,
    largerVisible: false, //sku查看大图
    listData: {}, //优惠立减
    shop: {},
    routerParam: '',
    supplier_id: 0, //店铺ID
    product_id: 0, //商品ID
    sku_id: 0, //商品sku_id
    popupVisible1: false, // 首页引导层是否显示
    noticeTab: '1',
    scrollTop: 0,
    showVideo: 'false',
    bannerHeight: 320,
    activeIndex: 0,
    dialogvisible: false,
    skuModel: false,
    address_model: '',
    addressList: [],
    selectAddressIndex: 0,
    can_delivery: 0,
    address_text: '',
    videoShow: false,
    region: [],
    address_id: '',
    share_info: ''
  },
  onLoad: function (e) {
    console.log(e);
    var self =  this
    this.setData({
      'supplier_id': e.s || wx.getStorageSync('supplier_id'),
      'product_id': e.p,
      'sku_id': e.sku_id || ''
    })

    if (e.s) {
      wx.setStorageSync('supplier_id', e.s)
    }

    // this.coupon()
    var urlparam = ''
    if (typeof (self.data.supplier_id) != 'undefined') {
      urlparam += 's=' + self.data.supplier_id
    }
    this.setData({
      routerParam: urlparam
    })
  },
  onShow: function () {
    this.getProduct()
    this.setData({
      skuMap: [],
      skuMapString: ''
    })
  },
  // 视频图片切换
  showBanner: function(e) {
    this.setData({
      showVideo: e.target.dataset.type,
      activeIndex: e.target.dataset.type=='true' ? 0 : 1
    })
  },
  // 图片滑动点的位置
  swiperchange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  noticeChange: function(e) {
    this.setData({
      noticeTab: e.target.dataset.notice
    })
  },
  updateQuantity : function(e) {
    if (e.currentTarget.dataset.quantity=='add') {
      this.setData({
        ['skuMain.quantity']: this.data.skuMain.quantity + 1
      })
    } else {
      this.setData({
        ['skuMain.quantity']: this.data.skuMain.quantity - 1
      })
    }
  },
  openModel: function(op) {
    const panelname = op.currentTarget.dataset.panelname
    if (panelname == 'dialogvisible') {
      this.setData({
        dialogvisible: true
      })
    } else if (panelname == 'skuModel') {
      if (wx.getStorageSync('token')) {
        this.setData({
          skuModel: true
        })
      } else {
        app.login()
      }
      
    }
    
  },
  closeModel: function(options) {
    this.setData({
      dialogvisible: false,
      popupVisible1: false
    })
  },
  getProduct: function() {
    var self = this
    app.req.get('product/detail',{
      product_id: this.data.product_id,
      sku_id: this.data.sku_id,
      supplier_id: this.data.supplier_id,
      address_id: ''
    }).then((response) => {

      // 停止下拉刷新
      wx.stopPullDownRefresh()

      var res = response.data
      if (res.status === 'ok') {
        self.setData({
          p: res.payload,
          address_text: res.payload.address_text,
          info: res.payload.info,
          images: res.payload.info.images,
          ["skuMain.sku_price"]: res.payload.price_info.price,
          playerOptions: {
            poster: res.payload.info.images.length > 0 ? res.payload.info.images[0] : '',
          },
          can_delivery: res.payload.can_delivery,
          share_info: res.payload.share_info
        })
        if (res.payload.sku_info.sku_props_img.length > 0) {
          self.setData({
            propImg: res.payload.sku_info.sku_props_img[0].img
          })
        } else {
          self.setData({
            propImg: res.payload.info.images[0]
          })
        }
        wx.setStorageSync('is_shopkeeper', res.is_shopkeeper)
        if (res.payload.info.video_url!= '') {
          let first = this.data.images[0]
          this.data.images.unshift(first)
          self.setData({
            showVideo: 'true'
          })
        }
        if (this.data.p.info.sale_status!=0 && this.data.p.info.sale_status!=3) {
          self.targetMap('init')
          //  获取所有sku map pv
          self.data.mapPv = self.getSkuQuantity()
        }
        // 初始化库存为零的sku
        // self.getActive()
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    }).catch((response) => {
      wx.showToast({
        title: response.message,
        icon: 'none'
      })
    })
  },

  changeSku(option) {
    var selectPv = this.data.skuDefault
    // console.log(selectPv);
    var self = this
    var prop = option.currentTarget.dataset.propId
    var value = option.currentTarget.dataset.valueId
    var disabled1 = option.currentTarget.dataset.fake
    var disabled2 = option.currentTarget.dataset.zero
    //如果是无库存的商品不可点击
    if (disabled1 || disabled2) {
      return false;
    }
    var pv = String(prop + ':' + value)
    var propImg = this.data.p.sku_info.sku_props_img
    var pvMap = this.data.p.sku_info.sku_pv_map
    var stockInfo = this.data.p.stock_info
    var priceInfo = this.data.p.price_info
    var target = 'target' + prop

    // 选中sku img
    for (let img of propImg) {
      if (pv === img.pv) {
        this.setData({
          propImg: img.img
        })
      }
    }

    // sku 选择排序
    if (self.data.skuMap.length > 0) {
      for (let jmap = 0; jmap < self.data.skuMap.length; jmap++) {
        if (parseInt(self.data.skuMap[jmap].split(':')[0]) === parseInt(prop)) {
          self.data.skuMap.splice(jmap, 1)
          break
        }
        if (self.data.skuMap[jmap] === pv) {
          self.data.skuMap.splice(jmap, 1)
          break
        }
      }
    }
    self.data.skuMap.push(pv)
    self.bubbleSort(self.data.skuMap)
    // get sku_id
    self.setData({
      skuMapString: self.data.skuMap.join(',')
    })
    // console.log('选择的skumap',self.data.skuMap);
    // console.log('选择的skumapString',self.data.skuMapString);
    console.log(pvMap);
    let pvArr = selectPv.split(',')
    // console.log('默认的pvArr',pvArr);
    let thePvArr = self.data.skuMap
    var fanalPv
    for (let i=0;i<pvArr.length;i++) {
      // console.log('默认pv的值',pvArr[i]);
      for (let j=0;j<thePvArr.length;j++) {
        // console.log('选中的pv的值',thePvArr[j]);
        if (thePvArr[j].slice(0, 4) == pvArr[i].slice(0, 4)) {
          // console.log(j);
          // console.log(i);
          pvArr[i] = thePvArr[j]
          // console.log(pvArr);
          fanalPv = pvArr.join(',')
        }
      }
    }
    console.log(fanalPv);
    // 多选sku 改变某一个 其他规格继续使用默认选中的值
      for (let m of pvMap) {
        if (fanalPv === m.pv) {
          self.setData({
            ["skuMain.sku_id"]: m.sku_id
          })
          console.log(m.sku_id);
        }
      }
  console.log('sku id'+self.data.skuMain.sku_id);
    // sku quantity price
    if (self.data.skuMain.sku_id) {
      for (let quantity1 of stockInfo.sku_quantity) {
        if (quantity1.sku_id == self.data.skuMain.sku_id) {
          self.setData({
            ["skuMain.sku_quantity"]: (Number(quantity1.quantity) > Number(stockInfo.quantity)) ? stockInfo.quantity : quantity1.quantity
          })
        }
      }
      for (let skuPrice of priceInfo.sku_price) {
        if (skuPrice.sku_id === self.data.skuMain.sku_id) {
          self.setData({
            ["skuMain.sku_price"]: skuPrice.price
          })
        }
      }
      // console.log('price'+self.data.skuMain.sku_price)
    }
    if (self.data.targetel[target] === pv) {
      // delete self.targetel[target]
      self.setData({
        ["skuMain.sku_id"]: ''
      })
      //当sku匹配出现组合不可选择时，反选或者选择其他sku时，灰色sku变为可点击
      for (let toggle = 0; toggle < self.data.skuMap.length; toggle++) {
        if (self.data.skuMap[toggle] == pv) {
          self.data.skuMap.splice(toggle, 1)
        }
      }
    } else {
      self.setData({
        ["targetel.target" + prop]: pv
      })
    }

    self.getActive(pv, self.data.skuMap)
  },
  // 获得当前 选中元素和 其他元素组合产生的 数量为空的 数组
  getActive(pv, skuCheckMap) {
    // pv 当前选中sku的map
    // skuCheckMap  当前选中的sku map 组成的数组
    this.data.skuMapFake = []
    if (skuCheckMap) {
      for (let checkmap of skuCheckMap) {
        this.skuMapFakeEle(checkmap)
      }
    } else {
      this.skuMapFakeEle(pv)
    }
  },
  skuMapFakeEle(pv) {
    // pvMap sku 所有组合的map，可以得到sku_id
    // this.mapPv 由skuid 和数量组成的键值对数组
    // skuMapFake 所有库存为0 的sku键值对
    // this.pvMapQuantityZero  pvmap 组合为0的数据
    var pvMap = this.data.p.sku_info.sku_pv_map
    for (let map of pvMap) {
      var apiPv = map.pv
      var apiSkuId = map.sku_id
      if (pv) {
        var pvsplit = apiPv.split(',')
        // this.contains 数组中是否包含某个字符串
        if (apiSkuId > 0 && this.contains(pvsplit, pv)) {
          // 库存数量为0的sku，添加到skuMapFake
          if (this.data.mapPv[apiSkuId] <= 0) {
            for (let prop of pvsplit) {
              if (pv != prop && pv.split(':')[0] != prop.split(':')[0]) {
                this.data.skuMapFake.push(prop)
              }
            }
          }
        }
      } else {
        // 初始化时把所有sku库存为零的数据存储
        if (this.data.mapPv[apiSkuId] <= 0) {
          this.pvMapQuantityZero.push(apiPv)
        }
      }
    }

    for (let ii = 0; ii < this.data.skuMapFake.length; ii++) {
      // 当前首选的元素可以选中
      if (this.data.skuMapFake[ii] === pv) {
        this.setData({
          skuMapFake:{
            [ii]:  pv + ':tag'
          }
        })
      }
    }
  },
  contains(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) {
        return true;
      }
    }
    return false;
  },
  // 数量 与 sku_id 的 键值对
  getSkuQuantity() {
    var data = []
    var skuQuantity = this.data.p.stock_info.sku_quantity
    for (let quantity of skuQuantity) {
      var skuId = quantity.sku_id
      if (skuId) {
        data[skuId] = quantity.quantity
      }
    }
    return data
  },
  // 默认sku只有一个时，选中
  targetMap(type) {
    var skuProps = this.data.p.sku_info.sku_props
    var skuPvMap = this.data.p.sku_info.sku_pv_map
    var stockInfo = this.data.p.stock_info
    var self = this
    for (let p = 0; p < skuProps.length; p++) {
      if (skuProps[p].values.length === 1 && skuProps.length == 1) {
        var pv = String(skuProps[p].prop_id + ':' + skuProps[p].values[0].value_id)
        var target = 'target' + skuProps[p].prop_id
        self.setData({
          ["skuMain.sku_id"]: skuPvMap[0].sku_id,
          targetel: {
            [target]: pv
          }
        })
        // self.targetel[target] = pv
      }
      // todo sku默认选中
      if (type == 'init') {
        for (let m of skuPvMap) {
          if (m.is_selected == 1) {
            self.setData({
              ["skuMain.sku_id"]: m.sku_id,
              skuDefault: m.pv
            })
            var target = 'target' + skuProps[p].prop_id
            var key = 'targetel.'+target
            var list = m.pv.split(',')
            console.log(list);
            switch (p) { // 设置默认选中sq
              case 0:
              self.setData({
                ["skuMain.sku_id"]: m.sku_id,
                [key]: list[p]
              })
              break
              case 1:
              self.setData({
                ["skuMain.sku_id"]: m.sku_id,
                [key]: list[p]
              })
              break
              case 2:
              self.setData({
                ["skuMain.sku_id"]: m.sku_id,
                [key]: list[p]
              })
              break
              }
              console.log(key);
          }
        }
      }
      
      if (!self.data.targetel['target' + skuProps[p].prop_id]) {
        return skuProps[p].prop_name
      }
    }
    // 单个Sku选中时数量选中
    for (let quantity1 of Array.from(stockInfo.sku_quantity)) {
      if (quantity1.sku_id) {
        if (quantity1.sku_id === self.data.skuMain.sku_id) {
          self.setData({
              ["skuMain.sku_quantity"]: (Number(quantity1.quantity) > Number(stockInfo.quantity)) ? stockInfo.quantity : quantity1.quantity
          })
        }
      }
    }
    
  },
  bubbleSort(array) {
    var i = 0
    var len = array.length
    var j
    var d
    for (; i < len; i++) {
      for (j = 0; j < len; j++) {
        if (parseInt(array[i].split(':')[0]) < parseInt(array[j].split(':')[0])) {
          d = array[j]
          array[j] = array[i]
          array[i] = d
        }
      }
    }
    return array
  },
  // 获取确认购买页面的数据
  confirmBuy() {
    if (this.targetMap()) {
      wx.showToast({
        title: '请选择' + this.targetMap()
      })
      return false
    }
    if (!this.data.skuMain.sku_id) {
      console.log(this.data.skuMain.sku_id);
      wx.showToast({
        title: '请选择规格'
      })
      return false
    }
    if (this.data.skuMain.sku_quantity === '0') {
      wx.showToast({
        title: '该商品已售完',
        icon: 'none'
      })
      return
    }
    this.saveProductData()
  },
  
  // 立即购买时保存用户当前选项
  saveProductData: throttle(function() {
    wx.setStorageSync(
      '/order/shopping',
      JSON.stringify([{
        'product_id': this.data.product_id,
        'sku_id': this.data.skuMain.sku_id,
        'quantity': this.data.skuMain.quantity,
        'unit_price': this.data.skuMain.sku_price
      }])
    )
    wx.navigateTo({
      url: './../../packageA/order-verify/verify?' + this.data.routerParam +'&address_id=' + this.data.address_id
    })
  }),

  statistEvent(pagename) {
    var paramstring = {
      action_type: 'LOAD',
      v: JSON.stringify({ 'source': this.source }),
      page_name: pagename
    }
    window.$statistics.tongji(paramstring)
  },

  addressPanle () {

    app.req.get('user/address_list').then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        this.setData({
          addressList: res.payload
        })
      }
    })

    this.setData({
      address_model: true
    })
  },

  closeAddressPanle () {
    this.setData({
      address_model: false
    })
  },

  changeVideoSwiper () {
    this.setData({
      videoShow: !this.data.videoShow
    })
  },

  selectAddress (e) {
    let id = this.data.addressList[e.currentTarget.dataset.index].id
    this.setData({
      address_id: id
    })
    app.req.get('product/can_delivery?product_id='+this.data.product_id+'&address_id='+id).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        this.setData({
          selectAddressIndex: e.currentTarget.dataset.index,
          can_delivery: res.payload.can_delivery,
          address_model: false,
          address_text: res.payload.address_text
        })
      }
    })

  },

  bindRegionChange (e) {
    let province_name = e.detail.value[0]
    app.req.get('product/can_delivery?product_id='+this.data.product_id+'&province_name='+province_name).then((response) => {
      var res = response.data
      if (res.status === 'ok') {
        this.setData({
          can_delivery: res.payload.can_delivery,
          address_model: false,
          address_text: e.detail.value[0]+e.detail.value[1]+e.detail.value[2]
        })
      }
    })
  },

  onShareAppMessage: function () {
    let backToPath = '/pages/packageA/shop-detail/index?p=' + this.data.product_id + '&s=' + this.data.supplier_id
    let path = `/pages/tabbar/shop-list/index?backTo=${encodeURIComponent(backToPath)}`
    return {
      title: this.data.share_info.title,
      imageUrl: this.data.share_info.img,
      path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

  // 下拉刷新
  onPullDownRefresh () {
    this.getProduct()
  }
})
