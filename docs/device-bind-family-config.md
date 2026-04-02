# 设备绑定家人配置说明

## 概述
在 `utils/parseDevNumber.js` 中添加了设备绑定家人相关的配置和工具函数，用于控制不同设备类型的家人绑定规则。

## 配置项

### 1. deviceTypeMaxBindCountMap
设备类型可绑定的最大家人数映射表。

```javascript
export const deviceTypeMaxBindCountMap = {
    '0': 0,   // 人体存在 - 不限制
    '1': 1,   // 呼吸睡眠 - 最多1个
    '2': 0,   // 跌倒监测 - 不限制
    '4': 1,   // 呼吸睡眠-L2 - 最多1个
    '13': 0,  // 水浸 - 不限制
    '14': 0,  // 门磁 - 不限制
    '15': 0,  // 烟感 - 不限制
    '16': 0,  // 可燃气体 - 不限制
    '17': 0,  // 红外 - 不限制
    '18': 0,  // 温湿度 - 不限制
    '19': 0,  // 一氧化碳 - 不限制
    '20': 0,  // 其它 - 不限制
    '21': 0,  // 手表(H102C) - 不限制
    '22': 0,  // 手表(BP100C) - 不限制
    '23': 0   // 手表(AC型) - 不限制
};
```

**说明**：
- `0` 表示不限制绑定人数
- 其他数字表示最多可绑定的家人数量
- 目前只有呼吸睡眠类设备（类型1和4）限制为最多绑定1个家人

### 2. deviceTypesDisableBindFamily
不支持绑定家人的设备类型列表。

```javascript
export const deviceTypesDisableBindFamily = [
    '0',   // 人体存在
    '2',   // 跌倒监测
    '13',  // 水浸
    '14',  // 门磁
    '15',  // 烟感
    '16',  // 可燃气体
    '17',  // 红外
    '18',  // 温湿度
    '19',  // 一氧化碳
    '20',  // 其它
    '21',  // 手表(H102C)
    '22',  // 手表(BP100C)
    '23'   // 手表(AC型)
];
```

**说明**：
- 列表中的设备类型不支持绑定家人功能
- 前端会根据此配置隐藏或禁用"绑定家人"入口
- 目前只有呼吸睡眠类设备（类型1和4）支持绑定家人

## 工具函数

### 1. getDeviceMaxBindCount(deviceType)
获取设备类型可绑定的最大家人数。

**参数**：
- `deviceType` (string) - 设备类型值

**返回值**：
- (number) - 最大可绑定家人数，0表示不限制

**示例**：
```javascript
import { getDeviceMaxBindCount } from '@/utils/parseDevNumber'

const maxCount = getDeviceMaxBindCount('1') // 返回 1
const maxCount2 = getDeviceMaxBindCount('2') // 返回 0（不限制）
```

### 2. canBindFamily(deviceType)
判断设备类型是否支持绑定家人。

**参数**：
- `deviceType` (string) - 设备类型值

**返回值**：
- (boolean) - true表示支持绑定家人，false表示不支持

**示例**：
```javascript
import { canBindFamily } from '@/utils/parseDevNumber'

const canBind = canBindFamily('1')  // 返回 true（呼吸睡眠支持）
const canBind2 = canBindFamily('2') // 返回 false（跌倒监测不支持）
```

### 3. isBindFamilyLimitReached(deviceType, currentBindCount)
判断设备是否已达到绑定家人上限。

**参数**：
- `deviceType` (string) - 设备类型值
- `currentBindCount` (number) - 当前已绑定的家人数

**返回值**：
- (boolean) - true表示已达上限，false表示未达上限

**示例**：
```javascript
import { isBindFamilyLimitReached } from '@/utils/parseDevNumber'

const isLimit = isBindFamilyLimitReached('1', 1) // 返回 true（已达上限）
const isLimit2 = isBindFamilyLimitReached('1', 0) // 返回 false（未达上限）
const isLimit3 = isBindFamilyLimitReached('2', 5) // 返回 false（不限制）
```

### 4. getBindFamilyTip(deviceType, currentBindCount)
获取设备绑定家人的提示信息。

**参数**：
- `deviceType` (string) - 设备类型值
- `currentBindCount` (number) - 当前已绑定的家人数（可选，默认为0）

**返回值**：
- (string) - 提示信息

**示例**：
```javascript
import { getBindFamilyTip } from '@/utils/parseDevNumber'

const tip1 = getBindFamilyTip('1', 0) 
// 返回: "该设备最多可绑定1个家人，当前已绑定0个"

const tip2 = getBindFamilyTip('1', 1) 
// 返回: "该设备最多绑定1个家人，已达上限"

const tip3 = getBindFamilyTip('2', 0) 
// 返回: "该设备类型不支持绑定家人"

const tip4 = getBindFamilyTip('4', 0) 
// 返回: "该设备最多可绑定1个家人，当前已绑定0个"
```

## 使用场景

### 1. 设备详情页面
在设备详情页面中，根据设备类型判断是否显示"绑定家人"按钮：

```javascript
import { canBindFamily } from '@/utils/parseDevNumber'

// 在页面中
if (canBindFamily(this.deviceInfo.deviceType)) {
    // 显示绑定家人按钮
} else {
    // 隐藏绑定家人按钮
}
```

### 2. 绑定家人页面
在绑定家人页面中，检查是否已达到绑定上限：

```javascript
import { isBindFamilyLimitReached, getBindFamilyTip } from '@/utils/parseDevNumber'

// 检查是否已达上限
if (isBindFamilyLimitReached(deviceType, currentBindCount)) {
    uni.showToast({
        title: getBindFamilyTip(deviceType, currentBindCount),
        icon: 'none'
    })
    return
}

// 继续绑定操作...
```

### 3. 家人列表页面
在家人列表页面中，显示绑定提示信息：

```javascript
import { getBindFamilyTip } from '@/utils/parseDevNumber'

// 显示提示
const tip = getBindFamilyTip(deviceType, bindedFamilyList.length)
```

## 设备类型说明

| 设备类型 | 类型值 | 支持绑定家人 | 最大绑定数 | 说明 |
|---------|--------|------------|-----------|------|
| 人体存在 | 0 | ❌ | - | 环境监测设备 |
| 呼吸睡眠 | 1 | ✅ | 1 | 个人健康监测设备 |
| 跌倒监测 | 2 | ❌ | - | 环境监测设备 |
| 呼吸睡眠-L2 | 4 | ✅ | 1 | 个人健康监测设备 |
| 水浸 | 13 | ❌ | - | 环境监测设备 |
| 门磁 | 14 | ❌ | - | 环境监测设备 |
| 烟感 | 15 | ❌ | - | 环境监测设备 |
| 可燃气体 | 16 | ❌ | - | 环境监测设备 |
| 红外 | 17 | ❌ | - | 环境监测设备 |
| 温湿度 | 18 | ❌ | - | 环境监测设备 |
| 一氧化碳 | 19 | ❌ | - | 环境监测设备 |
| 其它 | 20 | ❌ | - | 其他设备 |
| 手表(H102C) | 21 | ❌ | - | 可穿戴设备 |
| 手表(BP100C) | 22 | ❌ | - | 可穿戴设备 |
| 手表(AC型) | 23 | ❌ | - | 可穿戴设备 |

## 注意事项

1. **设备类型值格式**：所有设备类型值都使用字符串格式（如 `'1'`, `'2'`），确保在使用时类型一致

2. **配置修改**：如需修改设备绑定规则，只需修改 `deviceTypeMaxBindCountMap` 和 `deviceTypesDisableBindFamily` 两个配置项

3. **业务逻辑**：
   - 环境监测类设备（水浸、门磁、烟感等）不支持绑定家人
   - 个人健康监测设备（呼吸睡眠类）支持绑定家人，但限制为1个
   - 可穿戴设备（手表）暂不支持绑定家人

4. **扩展性**：如需添加新的设备类型，需要同时更新：
   - `parseDeviceNumber` 函数中的设备类型解析逻辑
   - `deviceTypeMaxBindCountMap` 配置
   - `deviceTypesDisableBindFamily` 配置（如果不支持绑定）

## 相关文件

- `utils/parseDevNumber.js` - 设备编号解析和配置工具
- `pages/my/device/index.vue` - 设备列表页面（可能需要使用）
- `pages/my/device/detail.vue` - 设备详情页面（可能需要使用）
- `pages/my/family/index.vue` - 家人管理页面（可能需要使用）
