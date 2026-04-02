# 核销功能重构说明

## 概述

将订单核销功能从单个页面提取为可复用的混入(mixin)和组件，实现代码复用和统一管理。

## 重构内容

### 1. 创建核销功能混入 (`mixins/verification-mixin.js`)

**功能：**
- 核销码获取和显示
- 手动确认服务（拍照上传）
- 二维码生成和错误处理
- 照片上传和重试机制

**数据：**
```javascript
{
  showVerificationModal: false,      // 是否显示核销码弹窗
  verificationCode: null,            // 核销码数据
  verificationCodeLoading: false,    // 加载状态
  currentVerificationOrder: null,    // 当前核销的订单
  qrcodeFallbackAttempted: false,   // 二维码降级尝试标记
  cachedPhotoPath: null,             // 缓存的照片路径
  uploadRetryCount: 0                // 上传重试次数
}
```

**计算属性：**
- `qrcodeImageUrl` - 自动生成二维码图片URL

**方法：**
- `showVerificationCode(order)` - 显示核销码
- `closeVerificationModal()` - 关闭核销码弹窗
- `handleManualConfirm()` - 手动确认服务
- `captureServicePhoto()` - 拍摄服务照片
- `showPhotoPreview(photoPath)` - 显示照片预览
- `submitManualConfirm(photoPath)` - 提交手动确认
- `uploadServicePhoto(filePath)` - 上传服务照片
- `handleQrcodeLoad()` - 二维码加载成功
- `handleQrcodeError(e)` - 二维码加载失败

**回调钩子：**
- `onVerificationSuccess()` - 核销成功后的回调（需在使用页面中实现）

### 2. 创建核销码弹窗组件 (`components/verification-modal/verification-modal.vue`)

**Props：**
```javascript
{
  visible: Boolean,      // 是否显示弹窗
  code: Object,         // 核销码数据
  loading: Boolean,     // 加载状态
  qrcodeUrl: String     // 二维码URL
}
```

**Events：**
```javascript
{
  'close': 关闭弹窗,
  'manual-confirm': 手动确认,
  'qrcode-load': 二维码加载成功,
  'qrcode-error': 二维码加载失败
}
```

**功能：**
- 显示核销码（纯数字）
- 显示二维码
- 显示有效期
- 提供手动确认按钮
- 加载状态和空状态处理

### 3. 更新订单列表页 (`pages/order/index.vue`)

**改动：**
1. 引入 `verification-mixin` 混入
2. 引入 `VerificationModal` 组件
3. 删除重复的核销相关方法（约200行代码）
4. 删除核销码弹窗的样式（约150行代码）
5. 实现 `onVerificationSuccess()` 回调

**使用示例：**
```vue
<template>
  <!-- 核销码弹窗组件 -->
  <VerificationModal
    :visible="showVerificationModal"
    :code="verificationCode"
    :loading="verificationCodeLoading"
    :qrcodeUrl="qrcodeImageUrl"
    @close="closeVerificationModal"
    @manual-confirm="handleManualConfirm"
    @qrcode-load="handleQrcodeLoad"
    @qrcode-error="handleQrcodeError"
  />
</template>

<script>
import verificationMixin from '@/mixins/verification-mixin.js'
import VerificationModal from '@/components/verification-modal/verification-modal.vue'

export default {
  mixins: [verificationMixin],
  components: { VerificationModal },
  methods: {
    // 核销成功回调
    onVerificationSuccess() {
      this.refreshOrders()
    }
  }
}
</script>
```

### 4. 更新订单详情页 (`pages/order/detail.vue`)

**改动：**
1. 引入 `verification-mixin` 混入
2. 引入 `VerificationModal` 组件
3. 添加"查看核销码"按钮（服务中状态）
4. 实现 `onVerificationSuccess()` 回调

**新增功能：**
- 在详情页也可以查看核销码
- 在详情页也可以手动确认服务完成
- 核销成功后自动刷新订单详情

## 核销方式说明

系统支持三种核销方式：

1. **扫码核销 (SCAN)**
   - 服务人员使用扫码设备扫描二维码
   - 图标：scan
   - 颜色：绿色渐变

2. **手动核销 (MANUAL)**
   - 服务人员手动输入核销码
   - 图标：hand-up
   - 颜色：蓝色渐变

3. **居民确认 (RESIDENT)**
   - 居民拍摄服务人员照片后手动确认
   - 图标：person-filled
   - 颜色：橙色渐变

## 优势

### 代码复用
- 核销功能在列表页和详情页共享
- 减少约350行重复代码
- 统一的业务逻辑和错误处理

### 易于维护
- 核销逻辑集中在混入中
- UI组件独立，样式统一
- 修改一处，所有页面生效

### 功能增强
- 添加照片缓存机制
- 添加上传重试功能
- 添加二维码降级处理
- 统一的错误提示

### 扩展性好
- 新页面只需引入混入和组件
- 可以轻松添加新的核销方式
- 回调机制支持自定义处理

## 使用指南

### 在新页面中使用核销功能

1. **引入混入和组件：**
```javascript
import verificationMixin from '@/mixins/verification-mixin.js'
import VerificationModal from '@/components/verification-modal/verification-modal.vue'

export default {
  mixins: [verificationMixin],
  components: { VerificationModal }
}
```

2. **添加核销码弹窗：**
```vue
<VerificationModal
  :visible="showVerificationModal"
  :code="verificationCode"
  :loading="verificationCodeLoading"
  :qrcodeUrl="qrcodeImageUrl"
  @close="closeVerificationModal"
  @manual-confirm="handleManualConfirm"
  @qrcode-load="handleQrcodeLoad"
  @qrcode-error="handleQrcodeError"
/>
```

3. **调用核销功能：**
```javascript
// 显示核销码
this.showVerificationCode(order)

// 实现成功回调
onVerificationSuccess() {
  // 刷新数据或其他操作
  this.loadData()
}
```

## 注意事项

1. **订单对象要求：**
   - 必须包含 `id` 字段（订单ID）
   - 必须包含 `userId` 和 `deptId` 字段（用于手动确认）

2. **照片上传：**
   - 只允许拍照，不允许从相册选择
   - 自动压缩图片
   - 支持最多2次重试
   - 失败后可重新拍摄

3. **二维码生成：**
   - 使用在线API生成（https://api.qrserver.com）
   - 如果加载失败，提示用户使用纯数字核销码
   - 二维码内容为JSON格式：`{orderId, code}`

4. **回调实现：**
   - 必须在使用页面中实现 `onVerificationSuccess()` 方法
   - 用于核销成功后的数据刷新或其他操作

## 文件清单

```
mixins/
  └── verification-mixin.js          # 核销功能混入

components/
  └── verification-modal/
      └── verification-modal.vue     # 核销码弹窗组件

pages/
  └── order/
      ├── index.vue                  # 订单列表页（已更新）
      └── detail.vue                 # 订单详情页（已更新）

docs/
  └── verification-refactor.md       # 本文档
```

## 测试建议

1. **功能测试：**
   - 在列表页点击"查看核销码"
   - 在详情页点击"查看核销码"
   - 测试手动确认流程（拍照、上传、确认）
   - 测试二维码加载失败的降级处理

2. **边界测试：**
   - 网络异常时的错误处理
   - 照片上传失败的重试机制
   - 快速连续点击的防抖处理

3. **兼容性测试：**
   - 不同机型的拍照功能
   - 不同网络环境的二维码加载
   - 不同订单状态的按钮显示

## 后续优化建议

1. **性能优化：**
   - 考虑使用本地二维码生成库（如 uQRCode）
   - 添加二维码缓存机制
   - 优化照片压缩算法

2. **功能增强：**
   - 支持从相册选择照片（可选）
   - 添加照片预览功能
   - 支持多张照片上传

3. **用户体验：**
   - 添加核销成功的动画效果
   - 优化加载状态的提示
   - 添加操作引导提示

## 更新日志

- 2026-03-10: 初始版本，完成核销功能重构
