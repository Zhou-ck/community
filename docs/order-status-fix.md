# 消费记录订单状态显示修复

## 问题描述
在套餐详情页面的"消费记录"标签中，订单状态显示为"-"，无法正确显示订单的实际状态。

## 问题原因
`pages/server/SetMeal/detail.vue` 中的 `getOrderStatusText` 方法缺少对 `orderStatus = '0'`（待接单）状态的映射，导致该状态显示为默认值"-"。

同时，该方法也缺少其他状态（已拒绝、已关闭、待派单、待核销）的映射。

## 解决方案

### 1. 导入统一的状态映射
从 `utils/service-helper.js` 导入已定义的状态映射常量：
```javascript
import {
  ORDER_STATUS_MAP,
  ORDER_STATUS_CODE_MAP
} from '@/utils/service-helper'
```

### 2. 更新状态文本获取方法
使用统一的状态映射来获取状态文本：
```javascript
getOrderStatusText(status) {
  const statusKey = ORDER_STATUS_CODE_MAP[status]
  if (statusKey && ORDER_STATUS_MAP[statusKey]) {
    return ORDER_STATUS_MAP[statusKey].text
  }
  return '-'
}
```

### 3. 更新状态样式类获取方法
使用统一的状态映射来获取样式类：
```javascript
getOrderStatusClass(status) {
  const statusKey = ORDER_STATUS_CODE_MAP[status]
  if (statusKey && ORDER_STATUS_MAP[statusKey]) {
    const classMap = {
      'pending': 'order-pending',
      'accepted': 'order-accepted',
      'serving': 'order-in-service',
      'completed': 'order-completed',
      'cancelled': 'order-cancelled',
      'rejected': 'order-rejected',
      'closed': 'order-closed',
      'dispatching': 'order-dispatching',
      'verifying': 'order-verifying'
    }
    return classMap[statusKey] || ''
  }
  return ''
}
```

### 4. 添加完整的状态样式
为所有订单状态添加对应的样式类：

| 状态代码 | 状态名称 | 样式类 | 背景色 | 文字色 |
|---------|---------|--------|--------|--------|
| 0 | 待接单 | order-pending | #fff7e6 | #ff9900 |
| 1 | 已接单 | order-accepted | #e6f7ff | #2979ff |
| 2 | 服务中 | order-in-service | #e6fff9 | #0ac160 |
| 3 | 已完成 | order-completed | #f6ffed | #52c41a |
| 4 | 已取消 | order-cancelled | #f5f5f5 | #999 |
| 5 | 已拒绝 | order-rejected | #fff1f0 | #ff5722 |
| 6 | 已关闭 | order-closed | #f5f5f5 | #999 |
| 7 | 待派单 | order-dispatching | #fff7e6 | #fa8c16 |
| 8 | 待核销 | order-verifying | #f6ffed | #52c41a |

## 优势

1. **统一管理**：所有订单状态映射集中在 `service-helper.js` 中管理
2. **避免重复**：不需要在每个页面重复定义状态映射
3. **易于维护**：修改状态定义只需更新一个地方
4. **完整覆盖**：支持所有订单状态的显示

## 测试验证

修复后，消费记录中的订单状态应该能够正确显示：
- 待接单订单显示"待接单"（橙色）
- 已接单订单显示"已接单"（蓝色）
- 服务中订单显示"服务中"（绿色）
- 已完成订单显示"已完成"（绿色）
- 其他状态也能正确显示对应的文本和颜色

## 相关文件

- `pages/server/SetMeal/detail.vue` - 套餐详情页面（消费记录）
- `utils/service-helper.js` - 统一的状态映射工具
