# 首页重构设计文档

> 项目名称：安特社区六助  
> 日期：2026-07-22  
> 范围：重构 `pages/index.vue` 首页，同步调整 tabBar 结构

---

## 一、背景与目标

当前首页包含轮播图、公告栏、服务中心网格、居家养老模块。经讨论，除公告栏外其余模块使用率较低，需重构为以"老人健康数据 + 今日动态"为核心的新首页。

**目标**：
- 首页第一眼呈现老人核心健康指标与今日服务动态
- 支持多家庭成员切换查看
- 保留公告栏位置与现有交互
- 同步调整 tabBar，将"服务分类"替换为"设备管理"

---

## 二、整体布局

```
┌─────────────────────────────┐
│  欢迎，{用户名}              │
│  {社区名}                    │
├─────────────────────────────┤
│  健康监测        [张爷爷 ▼]  │
├──────────────┬──────────────┤
│  ┌────────┐  │  ┌────────┐  │
│  │ ❤️ 心率 │  │  │ 睡眠   │  │
│  │   72   │  │  │ 近7天  │  │
│  │ 体温   │  │  │ 柱状图 │  │
│  └────────┘  │  └────────┘  │
├──────────────┴──────────────┤
│  📢 公告栏（保留现有）        │
├─────────────────────────────┤
│  今日动态                    │
├──────────────┬──────────────┤
│  今日订单完成 │  套餐使用     │
│  情况        │  情况         │
│  · 早餐 ✅   │  助餐 3/10    │
│  · 助洁 ✅   │  助洁 1/5     │
│  · 午餐 ⏳   │               │
└──────────────┴──────────────┘
```

**变更项**：
- 删除：轮播图、服务中心网格、居家养老模块
- 保留：公告栏位置与交互不变
- 新增：欢迎区、家庭成员切换、健康双卡片、今日订单卡片、套餐使用卡片

---

## 三、模块详细设计

### 3.1 欢迎区

**内容**：
- 第一行：`欢迎，{userName}`（Vuex `name`）
- 第二行：`{joinedCommunity.communityName}`（Vuex `joinedCommunity.communityName`）

**空状态**：
- 未加入社区：显示 `"您尚未加入社区，点击加入"`，点击跳转 `pages/my/joincommunity/index`
- 未登录：由 `permission.js` 拦截，实际不会出现

**视觉**：
- 左对齐，白色背景
- 用户名：`--text-xl`（36rpx）
- 社区名：`--text-sm`（24rpx），灰色 `#666`

### 3.2 健康监测模块

#### 标题栏
- 左侧：绿色竖线 + `健康监测`
- 右侧：家庭成员选择器 `{currentMember.name} ▼`

#### 家庭成员选择器
- 点击弹出底部选择列表（`uni-popup`）
- 数据来源：`api/familymember.js`
- 默认选中第一个成员；上次选择缓存到 `storage`（key: `home_selected_member`）
- 切换后刷新健康区、订单区、套餐区数据

#### 左侧卡片：心率 + 体温
- 正方形，背景色 `#FFF5F0`
- 顶部：心跳图标 + `心率`
- 中间大号数字：`{heartRate}`，单位 `次/分`
- 底部：`体温 {temperature}℃`
- 无数据：显示 `"暂无设备数据，去绑定设备"`，点击跳转 `pages/device/index`（迁移后的主包路径）

#### 右侧卡片：近7天睡眠柱状图
- 正方形，背景色 `#F0F8FF`
- 展示近 7 天睡眠时长柱状图
- 数据字段：`sleep.last7Days: [6.5, 7.0, 7.5, 6.0, 8.0, 7.2, 7.5]`
- X 轴显示日期（昨6天至今天）
- 无数据：显示 `"暂无睡眠数据"`

#### 点击行为
- 点击任一健康卡片 → 弹出健康汇总弹窗

### 3.3 公告栏

- 保留现有 `pages/index.vue` 中的公告 swiper 逻辑
- 继续调用 `api/notice.js`
- 点击跳转 `pages/server/notice/detail`

### 3.4 今日订单完成卡片

**内容**：
- 标题：`今日订单`
- 子标题：`已完成 {completedCount} 项 / 共 {totalCount} 项`
- 列表：今天所有服务订单（不限于助餐）
- 每条显示：服务名称 + 状态标签
  - 已完成：绿色 ✓
  - 进行中：橙色
  - 待服务：灰色

**排序与截断**：
- 按完成时间倒序
- 最多显示 4 条，超出显示 `+N`

**空状态**：`"今日暂无已完成订单"`

**点击行为**：跳转 `pages/order/index`

### 3.5 套餐使用卡片

**内容**：
- 标题：`我的套餐`
- 列表：当前老人已购服务套餐及剩余次数
  - 示例：`助餐套餐 剩余 3/10 次`
- 用进度条展示剩余比例

**空状态**：
- `"你还未订购套餐，请前去订购"`
- 点击跳转 `pages/server/SetMeal/index`

**点击行为**：
- 有套餐：跳转 `pages/my/balancePackage/index`
- 无套餐：跳转 `pages/server/SetMeal/index`

---

## 四、健康汇总弹窗

**弹窗形态**：`uni-popup` 全屏弹层（高度 90%），顶部有关闭按钮

**内容布局**：

```
┌─────────────────────────────┐
│  ×  张爷爷的健康数据          │
├─────────────────────────────┤
│  实时数据（30s刷新）          │
│  ┌─────┬─────┬─────┐        │
│  │心率 │体温 │呼吸 │        │
│  │ 72  │36.5 │ 18  │        │
│  └─────┴─────┴─────┘        │
│  ┌─────┬─────┬─────┐        │
│  │血氧 │血压 │血糖 │        │
│  │ 98  │120/80│ 5.6│        │
│  └─────┴─────┴─────┘        │
├─────────────────────────────┤
│  在床状态：在床 / 离床        │
├─────────────────────────────┤
│  睡眠概览                     │
│  [睡眠时长] [入睡时间] [起床] │
├─────────────────────────────┤
│  查看完整睡眠报告 →           │
└─────────────────────────────┘
```

**行为**：
- 弹窗内数据与首页健康区共用同一套接口
- 30s 轮询只在弹窗打开时执行，关闭后停止
- 点击"查看完整睡眠报告"跳转 `pages/my/sleep-report/sleep-report`

---

## 五、tabBar 改造

### 当前 tabBar

`首页 / 服务分类 / 我的订单 / 我的`

### 新 tabBar

`首页 / 设备 / 订单 / 我的`

### 改造内容

1. **移除 `pages/work/index` 的 tabBar 入口**
2. **新增 `pages/device/index` 为 tabBar 入口**
   - 当前 `pages/my/device/` 在分包中，不能直接作为 tabBar 页面
   - 需将 `pages/my/device/` 迁移到主包 `pages/device/`
   - 原 `pages/my/device/` 路径保留，内部重定向到 `pages/device/index`，避免历史入口失效
3. **在 `pages/mine/index.vue` 个人中心列表新增"服务分类"入口**
   - 点击跳转 `pages/work/index`

### 迁移影响

| 原路径 | 新路径 | 处理 |
|---|---|---|
| `pages/my/device/index.vue` | `pages/device/index.vue` | 迁移到主包 |
| `pages/my/device/detail.vue` | `pages/device/detail.vue` | 迁移到主包 |
| `pages/my/device/fall.vue` | `pages/device/fall.vue` | 迁移到主包 |
| `pages/my/device/sleep.vue` | `pages/device/sleep.vue` | 迁移到主包 |
| `pages/my/device/msg.vue` | `pages/device/msg.vue` | 迁移到主包 |

**引用更新**：
- `pages.json` 中的 `subPackages` 移除设备相关页面
- `pages.json` 中的 `pages` 数组新增 `pages/device/*`
- 所有代码中 `pages/my/device/...` 的跳转路径需替换为 `pages/device/...`
- 原 `pages/my/device/` 下保留一个重定向页，兼容旧入口

---

## 六、数据流与接口

### 6.1 数据流

```
pages/index.vue
├── 调用 familymember API 获取家庭成员列表
├── 默认/缓存选中成员
├── 并行拉取：
│   ├── health API（健康数据，30s 轮询）
│   ├── todayOrder API（今日订单）
│   ├── userpackage API（套餐使用）
│   └── notice API（公告）
└── 数据分发到各子组件
```

### 6.2 接口清单

| 数据 | 接口文件 | 类型 | 说明 |
|---|---|---|---|
| 家庭成员列表 | `api/familymember.js` | 已有 | 获取当前用户家庭成员 |
| 健康数据 | `api/home/health.js` | **新增** | 按成员 ID 查询 |
| 今日订单汇总 | `api/home/todayOrder.js` | **新增** | 按成员 ID + 日期查询 |
| 套餐使用情况 | `api/userpackage.js` | 已有 | 按成员 ID 查询 |
| 公告列表 | `api/notice.js` | 已有 | 首页公告 |

### 6.3 新增接口字段

#### 健康数据接口

```http
GET /resident/home/health?memberId=123
```

返回：

```json
{
  "code": 200,
  "msg": "ok",
  "data": {
    "heartRate": 72,
    "temperature": 36.5,
    "respiratoryRate": 18,
    "bloodOxygen": 98,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "bloodSugar": 5.6,
    "inBedStatus": 1,
    "inBedStatusName": "在床",
    "sleep": {
      "lastNightDuration": 7.5,
      "fallAsleepTime": "22:30",
      "wakeUpTime": "06:00",
      "last7Days": [6.5, 7.0, 7.5, 6.0, 8.0, 7.2, 7.5]
    },
    "updateTime": "2026-07-22 09:30:00"
  }
}
```

#### 今日订单汇总接口

```http
GET /services/order/today?memberId=123&date=2026-07-22
```

返回：

```json
{
  "code": 200,
  "msg": "ok",
  "data": {
    "total": 5,
    "completed": 3,
    "list": [
      { "name": "早餐配送", "status": "2", "statusName": "已完成" },
      { "name": "居室清洁", "status": "2", "statusName": "已完成" },
      { "name": "午餐配送", "status": "1", "statusName": "待服务" }
    ]
  }
}
```

---

## 七、组件拆分

为避免 `pages/index.vue` 过大，拆出以下组件：

| 组件 | 路径 | 职责 |
|---|---|---|
| `home-header` | `components/home/header.vue` | 欢迎区 |
| `member-selector` | `components/home/member-selector.vue` | 家庭成员选择器 |
| `health-card` | `components/home/health-card.vue` | 心率体温卡片 |
| `sleep-card` | `components/home/sleep-card.vue` | 近7天睡眠柱状图卡片 |
| `today-order-card` | `components/home/today-order-card.vue` | 今日订单卡片 |
| `package-usage-card` | `components/home/package-usage-card.vue` | 套餐使用卡片 |
| `health-detail-modal` | `components/home/health-detail-modal.vue` | 健康汇总弹窗 |

`pages/index.vue` 只负责：
- 页面生命周期
- 数据拉取与分发
- 家庭成员状态管理
- 30s 轮询控制
- 下拉刷新

---

## 八、空状态与错误处理

| 场景 | 处理 |
|---|---|
| 未加入社区 | 欢迎区第二行显示 `"您尚未加入社区，点击加入"`，点击跳转 `pages/my/joincommunity/index` |
| 当前成员无设备 | 健康卡片显示 `"暂无设备数据，去绑定设备"`，点击跳转 `pages/device/index` |
| 当前成员无睡眠数据 | 睡眠卡片显示 `"暂无睡眠数据"` |
| 当前成员无今日订单 | 订单卡片显示 `"今日暂无已完成订单"` |
| 当前成员无套餐 | 套餐卡片显示 `"你还未订购套餐，请前去订购"`，点击跳转 `pages/server/SetMeal/index` |
| 健康接口失败 | toast 提示，卡片显示 `"--"` |
| 订单/套餐接口失败 | toast 提示，显示重试按钮 |

---

## 九、性能与体验

1. **30s 轮询**：首页 `onShow` 启动，`onHide` 清除，避免后台请求
2. **下拉刷新**：首页开启 `enablePullDownRefresh`，下拉刷新健康/订单/套餐/公告
3. **加载态**：首次进入显示 skeleton，轮询期间不显示全屏 loading
4. **弹窗内轮询**：弹窗打开时启动 30s 轮询，关闭时停止
5. **老人友好设计**：
   - 数字字号偏大
   - 卡片间距宽松
   - 状态用颜色 + 文字双重标识
   - 点击区域足够大

---

## 十、待后端确认事项

1. 健康数据接口 `/resident/home/health` 字段是否满足？是否需要增加/删除指标？
2. 今日订单接口 `/services/order/today` 的 `status` 字段值与现有订单状态是否一致？
3. 睡眠近 7 天数据单位是"小时"还是"分钟"？
4. 家庭成员 ID 字段命名是 `memberId` 还是 `residentId` 或其他？

---

## 十一、后续步骤

1. 用户 review 本设计文档
2. 调用 `writing-plans` 生成详细实施计划
3. 按实施计划分阶段开发
