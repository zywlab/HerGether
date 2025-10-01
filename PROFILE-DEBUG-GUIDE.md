# Profile 页面登录状态调试指南

## 🔧 问题修复

### 发现的问题
1. **导入不一致**: login页面使用`userManagerInstance`，profile页面使用`userManager`
2. **状态同步问题**: profile页面在登录后没有刷新状态
3. **缺少调试信息**: 无法追踪登录状态传递过程

### 修复措施
1. **统一导入**: 所有页面都使用`userManagerInstance`（默认导出）
2. **添加页面刷新**: 使用`Taro.useDidShow`监听页面显示事件
3. **增加调试日志**: 详细记录登录状态检查过程

## 📱 测试步骤

### 1. 完整登录测试流程

#### A. 清空状态测试
```bash
# 在微信开发者工具中
1. 清除所有存储数据 (Storage)
2. 刷新小程序
3. 点击底部导航"我的"
4. 应该看到"立即登录"界面
```

#### B. 登录流程测试
```bash
1. 点击"微信授权登录"
2. 在授权弹窗中点击"允许"
3. 观察控制台输出应该包含：
   🔥 开始微信登录流程
   📱 正在获取微信登录码...
   ✅ 微信登录结果: {code: "xxx"}
   👤 正在获取用户信息...
   ✅ 用户信息获取成功: {userInfo: {...}}
   💾 准备保存用户数据: {...}
   ✅ 用户信息保存成功!
   🔍 验证保存结果 - 用户信息: {...}
   🔍 验证保存结果 - 登录状态: true
```

#### C. 状态验证测试
```bash
1. 登录成功后自动跳转到首页
2. 点击底部导航"我的"
3. 观察控制台输出应该包含：
   📱 Profile页面 - 页面显示，重新检查登录状态
   🔍 Profile页面 - 检查登录状态...
   ✅ Profile页面 - 登录状态: true
   ✅ Profile页面 - 用户信息: {nickName: "xxx", ...}
4. 应该显示用户信息而不是"立即登录"按钮
```

### 2. 问题排查步骤

#### 情况1: 登录成功但Profile页面仍显示"立即登录"

**可能原因**:
- 数据保存失败
- Profile页面读取数据失败
- 导入的userManager实例不一致

**排查方法**:
```javascript
// 在微信开发者工具控制台中手动检查
console.log('=== 手动检查用户状态 ===')
console.log('存储的用户信息:', wx.getStorageSync('user_info'))
console.log('存储的登录状态:', wx.getStorageSync('is_logged_in'))
```

**期望结果**:
```javascript
// 应该看到类似输出
存储的用户信息: {nickName: "用户昵称", avatarUrl: "头像URL", ...}
存储的登录状态: true
```

#### 情况2: Profile页面没有调试日志输出

**可能原因**:
- useDidShow没有触发
- checkLoginAndLoadUser函数有错误

**排查方法**:
```javascript
// 检查函数是否被调用
1. 在Profile页面添加断点或console.log
2. 确认useDidShow是否正常工作
```

#### 情况3: 用户信息为空或undefined

**可能原因**:
- 存储数据格式不匹配
- userManager的getUserInfo方法返回空值

**排查方法**:
```javascript
// 检查存储的数据结构
const userInfo = wx.getStorageSync('user_info')
console.log('用户信息类型:', typeof userInfo)
console.log('用户信息内容:', userInfo)
console.log('是否有nickName:', userInfo?.nickName)
```

## 🔍 关键调试点

### 1. 存储检查
```javascript
// 在控制台运行检查存储状态
wx.getStorageInfo({
  success: function(res) {
    console.log('存储信息:', res)
    res.keys.forEach(key => {
      console.log(key + ':', wx.getStorageSync(key))
    })
  }
})
```

### 2. userManager状态检查
```javascript
// 检查userManager实例状态
import userManagerInstance from '../../utils/userManager'

userManagerInstance.isLoggedIn().then(result => {
  console.log('isLoggedIn结果:', result)
})

userManagerInstance.getUserInfo().then(result => {
  console.log('getUserInfo结果:', result)
})
```

### 3. 页面生命周期检查
```javascript
// 在Profile组件中添加更多生命周期日志
Taro.useDidShow(() => {
  console.log('=== useDidShow触发 ===')
})

useEffect(() => {
  console.log('=== useEffect触发 ===')
}, [])
```

## 💡 预期的完整日志流程

### 登录时的日志:
```
🔥 开始微信登录流程
📱 正在获取微信登录码...
✅ 微信登录结果: {code: "0213F7Fa1e4Q7G0qf8Ia1Uo6kU23F7F3"}
👤 正在获取用户信息...
✅ 用户信息获取成功: {userInfo: {nickName: "测试用户", avatarUrl: "..."}}
💾 准备保存用户数据: {id: "user_1696118400000", nickName: "测试用户", ...}
✅ 用户信息保存成功!
🔍 验证保存结果 - 用户信息: {nickName: "测试用户", isLogin: true, ...}
🔍 验证保存结果 - 登录状态: true
🔄 正在跳转到首页...
✅ 跳转成功
🏁 登录流程结束
```

### 访问Profile页面时的日志:
```
📱 Profile页面 - 页面显示，重新检查登录状态
🔍 Profile页面 - 检查登录状态...
✅ Profile页面 - 登录状态: true
✅ Profile页面 - 用户信息: {nickName: "测试用户", isLogin: true, ...}
```

### 如果看不到用户信息的错误日志:
```
📱 Profile页面 - 页面显示，重新检查登录状态
🔍 Profile页面 - 检查登录状态...
✅ Profile页面 - 登录状态: false
⚠️ Profile页面 - 用户未登录
```

或者:
```
📱 Profile页面 - 页面显示，重新检查登录状态
🔍 Profile页面 - 检查登录状态...
✅ Profile页面 - 登录状态: true
⚠️ Profile页面 - 用户信息为空
```

## 🚀 如果问题依然存在

如果按照以上步骤仍然无法看到用户信息，请：

1. **提供完整的控制台日志** - 从登录开始到访问Profile页面的所有日志
2. **检查存储状态** - 运行存储检查代码并提供结果
3. **确认微信开发者工具版本** - 确保使用最新版本的开发者工具
4. **尝试清除缓存** - 清除小程序缓存后重新测试

这样我就能更准确地定位问题所在。
