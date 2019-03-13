//app.js
App({
  onLaunch: function () {

    var that = this;
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log(res.code)
        let openId = wx.getStorageSync('openId')

        //没有openid则获取保存本地

        wx.request({
          url: that.globalData.apiHost+'/getUserOpenId?code=' + res.code,
          success: function (res) {
            console.log(res)
            openId = res.data.msg.openid;
            var session_key = res.data.msg.session_key
            wx.setStorageSync('openId', openId);
            wx.setStorageSync('session_key', session_key);
            //openID获取成功则首次拉取用户信息 保存本地
            let userInfo = wx.getStorageSync('userInfo')
            if (!userInfo) {
              wx.getUserInfo({
                success: function (res2) {
                  var userInfo = res2.userInfo
                  userInfo.openId = openId
                  wx.setStorageSync('userInfo', res2.userInfo);
                  //用户信息获取成功 则开始首次用户注册
                  wx.request({
                    url: that.globalData.apiHost +'/register', //注册
                    method: 'POST',
                    data: userInfo,
                    dataType: 'json',
                    header: {
                      'content-type': 'application/json'
                    },
                    success: function (res) {
                      console.log(res.data)
                    }
                  })
                },
                fail: function (err) {
                  wx.showModal({
                    title: '一键注册',
                    content: '欢迎使用奈茶水峰自助点餐服务,请进入[个人中心]，完成一键注册',
                    showCancel: false,
                    success: function (res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: '../mine/mine'
                        })
                      }
                    }
                  })
                }
              })
            } else {
              wx.request({
                url: that.globalData.apiHost+'/login?openId=' + wx.getStorageSync('openId'), //登录
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  console.log(res.data)
                }
              })
            }

          }
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // console.log(this.globalData.userInfo)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  //浮点数的运算函数
  accAdd: function (arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2))
    return (arg1 * m + arg2 * m) / m
  },
  //浮点数减法运算
  accSubtr: function (arg1,arg2) {
    var r1, r2, m, n;
    try { r1 = arg1.toString().split(".")[1].length } catch (e) { r1 = 0 }
    try { r2 = arg2.toString().split(".")[1].length } catch (e) { r2 = 0 }
    m = Math.pow(10, Math.max(r1, r2));
    //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return (arg1 * m - arg2 * m) / m;
  },
  globalData: {
    userInfo: null,
    openId: null,
    apiHost: "http://127.0.0.1:8080",//电脑本地联调
    //手机预览 电脑手机需同网段
  }
})