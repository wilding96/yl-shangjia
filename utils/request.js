import config from '../config'

const METHOD={
  GET:'GET',
  POST:'POST',
  PUT:'PUT',
  DELETE:'DELETE'
}
function Request(_header, _baseUrl, interceptors){
  this._header={
    'token': wx.getStorageSync('token')
  }
  this._baseUrl= null
  this.interceptors = []
  Request.prototype.constructor= function(){
    const token=wx.getStorageSync('token')
    if(token){
      this._header['token']=token
    }
  }
  Request.prototype.baseUrl=function(baseUrl){
    this._baseUrl=baseUrl
    return this
  }
  Request.prototype.intercept= function(res){
    return this.interceptors
    .filter(f=> typeof f === 'function')
    .every(f=> f(res))
  }
  Request.prototype.request = function({url,method,header={},data}){

    this._header = {
      'token': wx.getStorageSync('token')
    }
    return new Promise((resolve,reject)=>{
      wx.request({
        url: this._baseUrl + url,
        method: method || METHOD.GET,
        data: data,
        header: {
          ...this._header,
          ...header
        },
        success: res=> {
          this.intercept(res) && resolve(res)
        },
        fail:res=> {
          console.log('fail');
          reject
        }
      })
    })
  }
  Request.prototype.get= function(url,data,header){

    return this.request({url,method:METHOD.GET,header,data})
  }
  Request.prototype.post=function(url,data,header){
    return this.request({url,method:METHOD.POST,header,data})
  }
  Request.prototype.put=function(url,data,header){
    return this.request({url,method:METHOD.PUT,header,data})
  }
  Request.prototype.delete=function(url,data,header){
    return this.request({url,method:METHOD.DELETE,header,data})
  }
  Request.prototype.token=function(token){
    this._header.token=token
    return this
  }
  Request.prototype.header=function(header){
    this._header=header
    return this
  }

  Request.prototype.interceptor=function(f){
    if(typeof f === 'function'){
      this.interceptors.push(f)
    }
  }
}

module.exports = new Request()
