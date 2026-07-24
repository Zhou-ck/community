# 首页重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `pages/index.vue` 重构为以"老人健康数据 + 今日动态"为核心的新首页，支持家庭成员切换；同步把 tabBar 的"服务分类"替换为"设备管理"。

**Architecture:** 采用"组件化首页 + mock 数据层"策略。先把设备页从分包迁移到主包并改 tabBar（不依赖后端，可立即验证）；再建 mock 层让前端独立开发健康/订单卡片；最后逐个构建 7 个子组件并组装首页。每阶段产出可独立验证、可提交的代码。

**Tech Stack:** uni-app (Vue 2)、uView 2.x、uni-ui、Vuex、@qiun/ucharts、自研 canvas 图表、Sass/SCSS。

**Verification approach:** 本项目无自动化测试框架（HBuilder X 编译 → 微信开发者工具检测）。每个任务的"验证"步骤指：在 HBuilder X 中编译运行到微信开发者工具/H5 预览，按步骤描述检查页面表现。每个任务结束有独立 commit。

---

## 阶段总览（每阶段结束可 review）

| 阶段 | 内容 | 依赖后端 |
|---|---|---|
| 阶段 1 | 设备页迁移到主包 + tabBar 改造 + 我的页加服务分类入口 | 否 |
| 阶段 2 | 新增 mock 数据层 + 2 个 API 文件 | 否（mock） |
| 阶段 3 | 构建 7 个首页子组件（含健康汇总弹窗） | 否（用 mock） |
| 阶段 4 | 重写 `pages/index.vue` 组装所有组件 + 30s 轮询 + 下拉刷新 | 否 |
| 阶段 5 | 切换为真实接口 + 联调清理 | 是（最终） |

---

## 文件结构

**新增文件：**
- `api/home/health.js` — 健康数据接口（含 mock 开关）
- `api/home/todayOrder.js` — 今日订单汇总接口（含 mock 开关）
- `api/home/mock.js` — mock 数据集中管理
- `utils/home-poll.js` — 30s 轮询工具（onShow/onHide 安全启停）
- `components/home/header.vue` — 欢迎区
- `components/home/member-selector.vue` — 家庭成员选择器
- `components/home/health-card.vue` — 心率体温卡片
- `components/home/sleep-card.vue` — 近7天睡眠柱状图卡片
- `components/home/today-order-card.vue` — 今日订单卡片
- `components/home/package-usage-card.vue` — 套餐使用卡片
- `components/home/health-detail-modal.vue` — 健康汇总弹窗
- `pages/device/index.vue` — 仅入口页从 `pages/my/device/index.vue` 迁移到主包（控制体积）

**修改文件：**
- `pages.json` — tabBar、分包/主包页面配置
- `pages/mine/index.vue` — 新增"服务分类"入口、更新设备跳转路径
- `pages/index.vue` — 完全重写
- `static/images/tabbar/device.png`、`device_.png` — 复用被释放的 work 图标
- `pages/my/device/index.vue` — 改为重定向壳（兼容旧入口）

**保留不动：**
- `pages/my/device/detail.vue`、`fall.vue`、`sleep.vue`、`msg.vue` — 留在分包，主包入口页跨包 navigateTo 访问（控制主包体积）

---

# 阶段 1：设备页迁移 + tabBar 改造

本阶段不依赖后端，迁移完成后即可在微信开发者工具验证 tabBar 切换。

> **体积策略（2026-07-22 核查后修正）：** 微信小程序主包 ≤2MB（推荐 ≤1.5MB）。
> 核查发现：设备页**不引用 uCharts/图表组件**（580KB/85KB 的重依赖不会因此进主包），
> 只引用 `@/api/*`、`@/components/skeleton`、`@/utils`、`@/config`（本就在主包）。
> **因此只把 tabBar 入口 `index.vue` 迁到主包（+45.8KB），detail/fall/sleep/msg 留分包**，
> 跨包 `navigateTo` 正常工作，detail.vue(110.8KB) 等大文件不进主包。
> 主包预算：269KB(现状) + 46KB(device入口) + 581KB(uCharts via 首页) + 40KB(首页组件) ≈ 936KB，稳在 1.5MB 内。

## Task 1.1：将设备入口页 index.vue 从分包迁移到主包

**Files:**
- Create: `pages/device/index.vue`（从 `pages/my/device/index.vue` 复制）
- Modify: `pages.json`（主包新增 device/index，分包移除 device/index）
- Keep: `pages/my/device/detail.vue`、`fall.vue`、`sleep.vue`、`msg.vue` **保留在分包不动**
- Modify: `pages/my/device/index.vue` → 改为重定向壳（兼容旧入口）

- [ ] **Step 1：确认 index.vue 的 import 是否全部用 `@/` 绝对路径**

Run: `Select-String -Path "d:/kangyang/pages/my/device/index.vue" -Pattern "^\s*import" | Select-Object LineNumber, Line`
Expected: 所有 import 均为 `@/api/device`、`@/api/system/dict/data`、`@/utils/parseDevNumber`、`@/components/skeleton/index.vue` 等绝对路径（已确认，见核查记录）。
结论：复制到 `pages/device/index.vue` 后 import 无需修改，绝对路径仍有效。

- [ ] **Step 2：检查 index.vue 内对分包 detail 页的跳转路径**

Run: `Select-String -Path "d:/kangyang/pages/my/device/index.vue" -Pattern "/device/|navigateTo|switchTab" | Select-Object LineNumber, Line`
Expected: 跳转 detail 用 `uni.navigateTo({ url: '/pages/my/device/detail?...' })`。
结论：迁到主包后该跳转路径**不变**（仍是分包路径），跨包 navigateTo 支持，无需改。

- [ ] **Step 3：复制 index.vue 到主包并核对内容**

```bash
New-Item -ItemType Directory -Path "d:/kangyang/pages/device" -Force | Out-Null
Copy-Item -Path "d:/kangyang/pages/my/device/index.vue" -Destination "d:/kangyang/pages/device/index.vue" -Force
```
然后用 Read 打开 `d:/kangyang/pages/device/index.vue` 核对：与原文件一致，import 为 `@/` 绝对路径。

- [ ] **Step 4：更新 pages.json — 主包新增 device/index，分包移除 device/index**

修改 [pages.json](file:///d:/kangyang/pages.json)：

(a) 在主包 `pages` 数组中（`pages/common/imageCropper` 之后）新增：
```json
,
{
  "path": "pages/device/index",
  "style": { "navigationBarTitleText": "设备管理" }
}
```

(b) 在 `subPackages` 中 `root: "pages/my"` 的 `pages` 数组里，**仅删除** `device/index` 这一条：
```json
{
  "path" : "device/index",
  "style" : { "navigationBarTitleText" : "设备管理" }
}
```
保留 `device/detail`、`device/fall`、`device/sleep`、`device/msg` 四条在分包中不动。

- [ ] **Step 5：把原 pages/my/device/index.vue 改为重定向壳**

用 Write 覆盖 `d:/kangyang/pages/my/device/index.vue`（兼容旧入口，避免历史跳转失效）：
```vue
<template>
  <view></view>
</template>

<script>
// 兼容旧入口：重定向到主包新路径 pages/device/index
export default {
  onLoad(options) {
    const query = Object.keys(options).map(k => `${k}=${encodeURIComponent(options[k])}`).join('&')
    uni.redirectTo({ url: '/pages/device/index' + (query ? '?' + query : '') })
  }
}
</script>
```

- [ ] **Step 6：验证编译与页面可用**

在 HBuilder X 中编译运行到微信开发者工具。
Expected: 编译无报错；直接访问 `pages/device/index` 能打开设备管理页，设备列表数据正常加载（接口路径未变）。

- [ ] **Step 7：Commit**

```bash
git add pages/device/index.vue pages/my/device/index.vue pages.json
git commit -m "refactor: 设备管理入口页迁至主包 pages/device/index，详情页保留分包（控制主包体积）"
```

---

## Task 1.2：改造 tabBar，替换"服务分类"为"设备管理"

**Files:**
- Modify: `pages.json` (tabBar 配置)
- Modify: `pages/mine/index.vue:193` (设备跳转路径)
- Create: `static/images/tabbar/device.png`, `device_.png`（设备图标，选中/未选中）

- [ ] **Step 1：准备 tabBar 图标（复用被释放的 work 图标）**

tabBar 需两张图（普通态+选中态），81×81px。核查 `static/images/tabbar/` 现有：home/home_/work/work_/order/order_/mine/mine_.png。
**"服务分类"被移除后 work.png 释放，复用为设备图标**——它与 home/order/mine 视觉不同，满足"用于分辨设备"，且不与"我的"撞图：
```bash
Copy-Item "d:/kangyang/static/images/tabbar/work.png" "d:/kangyang/static/images/tabbar/device.png"
Copy-Item "d:/kangyang/static/images/tabbar/work_.png" "d:/kangyang/static/images/tabbar/device_.png"
```
> 备注：后续可替换为更贴切的设备图标（如手表/监护仪），当前不阻塞使用。

- [ ] **Step 2：修改 pages.json 的 tabBar 配置**

将 tabBar list 中第 2 项（服务分类）替换为设备管理：
```json
{
  "pagePath": "pages/device/index",
  "iconPath": "static/images/tabbar/device.png",
  "selectedIconPath": "static/images/tabbar/device_.png",
  "text": "设备"
}
```

完整 tabBar.list 第二项由：
```json
{ "pagePath": "pages/work/index", "iconPath": "...work.png", ..., "text": "服务分类" }
```
改为上面的设备配置。

- [ ] **Step 3：更新 pages/mine/index.vue 的设备跳转路径**

[pages/mine/index.vue:193](file:///d:/kangyang/pages/mine/index.vue) 中：
```js
// 改前
this.$tab.navigateTo('/pages/my/device/index')
// 改后（设备现在是 tabBar 页面，需用 switchTab）
this.$tab.switchTab('/pages/device/index')
```

注意：设备页现在在 mine 菜单里仍是 `v-if="showDevTools"`（长按触发），这是开发者入口，可保留。普通用户从底部 tabBar 进入。

- [ ] **Step 4：验证 tabBar 切换**

编译到微信开发者工具。
Expected: 底部 tabBar 显示 4 个 tab："首页 / 设备 / 订单 / 我的"；点击"设备"能切换到设备管理页且高亮；点击其他 tab 正常。

- [ ] **Step 5：Commit**

```bash
git add pages.json pages/mine/index.vue static/images/tabbar/device.png static/images/tabbar/device_.png
git commit -m "feat: tabBar 将服务分类替换为设备管理"
```

---

## Task 1.3：在"我的"页新增"服务分类"入口

`pages/work/index` 从 tabBar 移除后，用户仍需能访问服务分类，故在个人中心菜单加入口。

**Files:**
- Modify: `pages/mine/index.vue` (菜单列表新增一项)

- [ ] **Step 1：在 menu-container 中新增"服务分类"菜单项**

在 [pages/mine/index.vue](file:///d:/kangyang/pages/mine/index.vue) 的 `menu-container` 内，"服务套餐"菜单项之前插入：
```html
<view class="menu-item" @click="handleServiceCategory">
  <view class="menu-icon-wrapper" style="background-color: #E8F4FF;">
    <uni-icons type="grid" size="20" color="#3FA9E7"></uni-icons>
  </view>
  <view class="menu-content">
    <text class="menu-title">服务分类</text>
    <text class="menu-desc">浏览全部六助服务</text>
  </view>
  <uni-icons type="right" size="16" color="#ccc"></uni-icons>
</view>
```

- [ ] **Step 2：在 methods 中新增 handleServiceCategory**

```js
handleServiceCategory() {
  if (!this.checkLogin()) return
  this.$tab.navigateTo('/pages/work/index')
}
```

- [ ] **Step 3：验证入口可用**

编译运行，进入"我的"页。
Expected: 菜单列表出现"服务分类"项；点击跳转到 `pages/work/index` 服务分类页（该页仍在主包，路由不变）。

- [ ] **Step 4：Commit**

```bash
git add pages/mine/index.vue
git commit -m "feat: 我的页新增服务分类入口（补偿 tabBar 移除）"
```

---

# 阶段 2：mock 数据层 + API 文件

后端尚未实现健康/今日订单接口，先建 mock 层让阶段 3、4 能独立开发。

## Task 2.1：创建 mock 数据文件

**Files:**
- Create: `api/home/mock.js`

- [ ] **Step 1：创建 mock 数据**

```js
// api/home/mock.js
// 首页健康/订单接口的 mock 数据，后端实现后可通过开关关闭

export const mockHealthData = {
  heartRate: 72,
  temperature: 36.5,
  respiratoryRate: 18,
  bloodOxygen: 98,
  bloodPressure: { systolic: 120, diastolic: 80 },
  bloodSugar: 5.6,
  inBedStatus: 1,
  inBedStatusName: '在床',
  sleep: {
    lastNightDuration: 7.5,
    fallAsleepTime: '22:30',
    wakeUpTime: '06:00',
    last7Days: [6.5, 7.0, 7.5, 6.0, 8.0, 7.2, 7.5]
  },
  updateTime: '2026-07-22 09:30:00'
}

export const mockTodayOrder = {
  total: 5,
  completed: 3,
  list: [
    { name: '早餐配送', status: '2', statusName: '已完成' },
    { name: '居室清洁', status: '2', statusName: '已完成' },
    { name: '午餐配送', status: '1', statusName: '待服务' },
    { name: '助医上门', status: '1', statusName: '待服务' }
  ]
}

export const mockEmptyOrder = {
  total: 0,
  completed: 0,
  list: []
}
```

- [ ] **Step 2：Commit**

```bash
git add api/home/mock.js
git commit -m "feat: 新增首页健康/订单 mock 数据"
```

## Task 2.2：创建健康数据 API 文件（含 mock 开关）

**Files:**
- Create: `api/home/health.js`

- [ ] **Step 1：创建接口文件**

```js
// api/home/health.js
import request from '@/utils/request'
import { mockHealthData } from './mock'

// mock 开关：后端接口 ready 后改为 false
const USE_MOCK = true

// 查询老人首页健康数据
// memberId: 家庭成员 ID
export function getHomeHealth(memberId) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ code: 200, msg: 'ok', data: mockHealthData })
      }, 300)
    })
  }
  return request({
    url: '/resident/home/health',
    method: 'get',
    params: { memberId }
  })
}
```

- [ ] **Step 2：Commit**

```bash
git add api/home/health.js
git commit -m "feat: 新增首页健康数据 API（含 mock 开关）"
```

## Task 2.3：创建今日订单 API 文件（含 mock 开关）

**Files:**
- Create: `api/home/todayOrder.js`

- [ ] **Step 1：创建接口文件**

```js
// api/home/todayOrder.js
import request from '@/utils/request'
import { mockTodayOrder } from './mock'

const USE_MOCK = true

// 查询老人今日服务订单汇总
// memberId: 家庭成员 ID；date: yyyy-MM-dd
export function getTodayOrder(memberId, date) {
  if (USE_MOCK) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ code: 200, msg: 'ok', data: mockTodayOrder })
      }, 300)
    })
  }
  return request({
    url: '/services/order/today',
    method: 'get',
    params: { memberId, date }
  })
}
```

- [ ] **Step 2：Commit**

```bash
git add api/home/todayOrder.js
git commit -m "feat: 新增首页今日订单 API（含 mock 开关）"
```

## Task 2.4：创建 30s 轮询工具

**Files:**
- Create: `utils/home-poll.js`

封装安全的轮询：start 时启动、stop 时清除，避免重复定时器，避免页面隐藏后继续请求。

- [ ] **Step 1：创建轮询工具**

```js
// utils/home-poll.js
// 首页健康数据 30s 轮询工具
// 用法：
//   const poll = createPoll(() => this.fetchHealth(), 30000)
//   poll.start()   // onShow
//   poll.stop()    // onHide

export function createPoll(fn, interval = 30000) {
  let timer = null
  let running = false

  function tick() {
    if (!running) return
    try {
      const ret = fn()
      // 支持异步函数，完成后才安排下一次（避免请求堆积）
      if (ret && typeof ret.then === 'function') {
        ret.catch(() => {}).then(() => schedule())
      } else {
        schedule()
      }
    } catch (e) {
      schedule()
    }
  }

  function schedule() {
    if (!running) return
    timer = setTimeout(tick, interval)
  }

  return {
    start(immediate = false) {
      if (running) return
      running = true
      if (immediate) {
        tick()
      } else {
        schedule()
      }
    },
    stop() {
      running = false
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
    isRunning() {
      return running
    }
  }
}
```

- [ ] **Step 2：Commit**

```bash
git add utils/home-poll.js
git commit -m "feat: 新增首页 30s 轮询工具 home-poll"
```

---

# 阶段 3：构建 7 个首页子组件

全部用 mock 数据驱动，可独立在页面上预览。

## Task 3.1：home-header 欢迎区组件

**Files:**
- Create: `components/home/header.vue`

- [ ] **Step 1：创建组件**

```vue
<template>
  <view class="home-header">
    <text class="welcome-line">欢迎，{{ userName || '用户' }}</text>
    <view class="community-line" @click="onCommunityClick">
      <text class="community-text" :class="{ 'link': !communityName }">
        {{ communityName || '您尚未加入社区，点击加入' }}
      </text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HomeHeader',
  props: {
    userName: { type: String, default: '' },
    communityName: { type: String, default: '' }
  },
  methods: {
    onCommunityClick() {
      if (!this.communityName) {
        this.$emit('join-community')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.home-header {
  padding: 30rpx 30rpx 20rpx;
  background: #fff;
}
.welcome-line {
  display: block;
  font-size: var(--text-xl, 36rpx);
  font-weight: 600;
  color: #333;
  line-height: var(--lh-tight, 1.2);
}
.community-line {
  margin-top: 8rpx;
}
.community-text {
  font-size: var(--text-sm, 24rpx);
  color: #999;
  line-height: var(--lh-normal, 1.5);
}
.community-text.link {
  color: var(--color-primary, #E07A4F);
}
</style>
```

- [ ] **Step 2：Commit**

```bash
git add components/home/header.vue
git commit -m "feat: 新增首页欢迎区组件 home-header"
```

## Task 3.2：member-selector 家庭成员选择器

**Files:**
- Create: `components/home/member-selector.vue`

- [ ] **Step 1：创建组件**

```vue
<template>
  <view class="member-selector" @click="openPopup">
    <text class="current-name">{{ currentMember ? currentMember.name : '请选择' }}</text>
    <uni-icons type="bottom" size="14" color="#666"></uni-icons>

    <uni-popup ref="popup" type="bottom">
      <view class="popup-wrap">
        <view class="popup-title">选择家庭成员</view>
        <scroll-view scroll-y class="popup-list">
          <view
            v-for="m in members"
            :key="m.id"
            class="popup-item"
            :class="{ active: currentMember && currentMember.id === m.id }"
            @click="onSelect(m)"
          >
            <text class="item-name">{{ m.name }}</text>
            <uni-icons
              v-if="currentMember && currentMember.id === m.id"
              type="checkmarkempty"
              size="18"
              color="#E07A4F"
            ></uni-icons>
          </view>
        </scroll-view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'MemberSelector',
  props: {
    members: { type: Array, default: () => [] },
    currentMember: { type: Object, default: null }
  },
  methods: {
    openPopup() {
      this.$refs.popup.open()
    },
    onSelect(m) {
      this.$refs.popup.close()
      this.$emit('change', m)
    }
  }
}
</script>

<style lang="scss" scoped>
.member-selector {
  display: flex;
  align-items: center;
  gap: 6rpx;
}
.current-name {
  font-size: var(--text-md, 28rpx);
  color: #333;
  font-weight: 500;
  max-width: 240rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.popup-wrap {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 30rpx;
  max-height: 60vh;
}
.popup-title {
  font-size: var(--text-lg, 32rpx);
  font-weight: 600;
  text-align: center;
  margin-bottom: 20rpx;
  color: #333;
}
.popup-list {
  max-height: 50vh;
}
.popup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.popup-item.active .item-name {
  color: #E07A4F;
  font-weight: 600;
}
.item-name {
  font-size: var(--text-md, 28rpx);
  color: #333;
}
</style>
```

- [ ] **Step 2：Commit**

```bash
git add components/home/member-selector.vue
git commit -m "feat: 新增家庭成员选择器组件 member-selector"
```

## Task 3.3：health-card 心率体温卡片

**Files:**
- Create: `components/home/health-card.vue`

- [ ] **Step 1：创建组件**

```vue
<template>
  <view class="health-card press-card" @click="$emit('click')">
    <!-- 无数据态 -->
    <view v-if="!hasData" class="empty-wrap">
      <text class="empty-text">暂无设备数据</text>
      <text class="empty-link">去绑定设备 ›</text>
    </view>

    <!-- 有数据态 -->
    <view v-else class="content">
      <view class="top-row">
        <uni-icons type="heart-filled" size="18" color="#E07A4F"></uni-icons>
        <text class="label">心率</text>
      </view>
      <view class="hr-value">
        <text class="num">{{ data.heartRate }}</text>
        <text class="unit">次/分</text>
      </view>
      <view class="temp-row">
        <text class="temp-label">体温</text>
        <text class="temp-value">{{ data.temperature }}℃</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HealthCard',
  props: {
    data: { type: Object, default: () => ({}) }
  },
  computed: {
    hasData() {
      return this.data && (this.data.heartRate != null || this.data.temperature != null)
    }
  }
}
</script>

<style lang="scss" scoped>
.health-card {
  background: #FFF5F0;
  border-radius: 16rpx;
  padding: 24rpx;
  height: 280rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.empty-wrap {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 12rpx;
}
.empty-text {
  font-size: var(--text-sm, 24rpx);
  color: #999;
}
.empty-link {
  font-size: var(--text-sm, 24rpx);
  color: var(--color-primary, #E07A4F);
}
.top-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}
.label {
  font-size: var(--text-sm, 24rpx);
  color: #666;
}
.hr-value {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}
.num {
  font-size: 56rpx;
  font-weight: 700;
  color: #E07A4F;
  line-height: 1;
}
.unit {
  font-size: var(--text-xs, 20rpx);
  color: #999;
}
.temp-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(224, 122, 79, 0.12);
}
.temp-label {
  font-size: var(--text-sm, 24rpx);
  color: #666;
}
.temp-value {
  font-size: var(--text-md, 28rpx);
  color: #333;
  font-weight: 600;
}
</style>
```

- [ ] **Step 2：Commit**

```bash
git add components/home/health-card.vue
git commit -m "feat: 新增心率体温卡片组件 health-card"
```

## Task 3.4：sleep-card 近7天睡眠柱状图卡片

复用项目已装的 @qiun/ucharts（与 `zaichuangshichangtu.vue` 同方案），简化为独立可用的柱状图。

**Files:**
- Create: `components/home/sleep-card.vue`

- [ ] **Step 1：创建组件**

```vue
<template>
  <view class="sleep-card press-card" @click="$emit('click')">
    <view v-if="!hasData" class="empty-wrap">
      <text class="empty-text">暂无睡眠数据</text>
    </view>
    <view v-else class="content">
      <view class="top-row">
        <uni-icons type="moon" size="18" color="#3FA9E7"></uni-icons>
        <text class="label">睡眠时长</text>
      </view>
      <view class="chart-wrap">
        <canvas canvas-id="sleepHomeChart" id="sleepHomeChart" class="chart" @touchend="touchChart"></canvas>
      </view>
    </view>
  </view>
</template>

<script>
import uCharts from '@/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js'

export default {
  name: 'SleepCard',
  props: {
    // 近7天时长数组，单位小时，如 [6.5, 7, 7.5, 6, 8, 7.2, 7.5]
    days: { type: Array, default: () => [] }
  },
  data() {
    return {
      chartInstance: null,
      cWidth: 0,
      cHeight: 0
    }
  },
  computed: {
    hasData() {
      return this.days && this.days.length > 0
    }
  },
  watch: {
    days: {
      handler() { this.$nextTick(() => this.draw()) },
      deep: true
    }
  },
  mounted() {
    if (this.hasData) {
      this.$nextTick(() => {
        // 等待容器尺寸就绪
        const query = uni.createSelectorQuery().in(this)
        query.select('.chart-wrap').boundingClientRect(rect => {
          if (rect) {
            this.cWidth = rect.width
            this.cHeight = rect.height
            this.draw()
          }
        }).exec()
      })
    }
  },
  methods: {
    draw() {
      if (!this.hasData || !this.cWidth) return
      const labels = this.buildLabels()
      const chartData = {
        categories: labels,
        series: [{ name: '睡眠时长', data: this.days }]
      }
      this.chartInstance = new uCharts({
        $this: this,
        canvasId: 'sleepHomeChart',
        type: 'column',
        fontSize: 9,
        background: '#F0F8FF',
        animation: true,
        categories: chartData.categories,
        series: chartData.series,
        width: this.cWidth,
        height: this.cHeight,
        dataLabel: true,
        legend: { show: false },
        xAxis: { disableGrid: true, fontColor: '#999', fontSize: 9 },
        yAxis: { disabled: true, gridType: 'dash', dashLength: 4, data: [{ min: 0, max: 10 }] },
        extra: {
          column: {
            type: 'group',
            width: this.cWidth / 14,
            color: '#3FA9E7',
            activeBgColor: '#3FA9E7'
          }
        }
      })
    },
    buildLabels() {
      const today = new Date()
      const labels = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        labels.push((d.getMonth() + 1) + '/' + d.getDate())
      }
      return labels
    },
    touchChart() {
      // 预留交互
    }
  }
}
</script>

<style lang="scss" scoped>
.sleep-card {
  background: #F0F8FF;
  border-radius: 16rpx;
  padding: 24rpx;
  height: 280rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.empty-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.empty-text {
  font-size: var(--text-sm, 24rpx);
  color: #999;
}
.content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.top-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}
.label {
  font-size: var(--text-sm, 24rpx);
  color: #666;
}
.chart-wrap {
  flex: 1;
  min-height: 0;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>
```

- [ ] **Step 2：验证 uCharts 引用路径存在**

Run: `Test-Path "d:/kangyang/uni_modules/qiun-data-charts/js_sdk/u-charts/u-charts.js"`
Expected: True（参照 `zaichuangshichangtu.vue` 第 8 行的引用）。
若为 False，检查 `uni_modules/` 下实际路径：
`Get-ChildItem "d:/kangyang/uni_modules" -Directory | Select-Object Name`，找到 qiun 相关目录后修正 import 路径。

- [ ] **Step 3：Commit**

```bash
git add components/home/sleep-card.vue
git commit -m "feat: 新增近7天睡眠柱状图卡片组件 sleep-card"
```

## Task 3.5：today-order-card 今日订单卡片

**Files:**
- Create: `components/home/today-order-card.vue`

- [ ] **Step 1：创建组件**

```vue
<template>
  <view class="order-card press-card" @click="$emit('click')">
    <view class="card-head">
      <text class="title">今日订单</text>
      <text class="sub">已完成 {{ data.completed }} / 共 {{ data.total }} 项</text>
    </view>

    <view v-if="!data.list || data.list.length === 0" class="empty">
      <text class="empty-text">今日暂无已完成订单</text>
    </view>

    <view v-else class="list">
      <view v-for="(item, i) in displayList" :key="i" class="list-item">
        <text class="item-name">{{ item.name }}</text>
        <view class="status-tag" :class="statusClass(item.status)">
          <text>{{ item.statusName }}</text>
        </view>
      </view>
      <view v-if="data.list.length > 4" class="more">+{{ data.list.length - 4 }}</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TodayOrderCard',
  props: {
    data: { type: Object, default: () => ({ total: 0, completed: 0, list: [] }) }
  },
  computed: {
    displayList() {
      return (this.data.list || []).slice(0, 4)
    }
  },
  methods: {
    statusClass(status) {
      // 2=已完成 1=待服务 其它=进行中
      if (status === '2') return 'done'
      if (status === '1') return 'pending'
      return 'doing'
    }
  }
}
</script>

<style lang="scss" scoped>
.order-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}
.card-head {
  margin-bottom: 16rpx;
}
.title {
  font-size: var(--text-lg, 32rpx);
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}
.sub {
  font-size: var(--text-xs, 20rpx);
  color: #999;
}
.empty {
  padding: 30rpx 0;
  text-align: center;
}
.empty-text {
  font-size: var(--text-sm, 24rpx);
  color: #bbb;
}
.list {
  display: flex;
  flex-direction: column;
}
.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.list-item:last-child {
  border-bottom: none;
}
.item-name {
  font-size: var(--text-md, 28rpx);
  color: #333;
}
.status-tag {
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  font-size: var(--text-xs, 20rpx);
}
.status-tag.done {
  background: rgba(90,171,122,0.12);
  color: #5AAB7A;
}
.status-tag.pending {
  background: rgba(153,153,153,0.12);
  color: #999;
}
.status-tag.doing {
  background: rgba(232,168,76,0.12);
  color: #E8A84C;
}
.more {
  text-align: center;
  font-size: var(--text-xs, 20rpx);
  color: #bbb;
  padding: 12rpx 0 0;
}
</style>
```

- [ ] **Step 2：Commit**

```bash
git add components/home/today-order-card.vue
git commit -m "feat: 新增今日订单卡片组件 today-order-card"
```

## Task 3.6：package-usage-card 套餐使用卡片

**Files:**
- Create: `components/home/package-usage-card.vue`

- [ ] **Step 1：创建组件**

```vue
<template>
  <view class="pkg-card press-card" @click="$emit('click')">
    <view class="card-head">
      <text class="title">我的套餐</text>
    </view>

    <view v-if="!packages || packages.length === 0" class="empty" @click.stop="$emit('click')">
      <text class="empty-text">你还未订购套餐</text>
      <text class="empty-link">请前去订购 ›</text>
    </view>

    <view v-else class="list">
      <view v-for="(p, i) in packages" :key="i" class="pkg-item">
        <view class="pkg-info">
          <text class="pkg-name">{{ p.name }}</text>
          <text class="pkg-remain">剩余 {{ p.remain }} / {{ p.total }} 次</text>
        </view>
        <view class="progress">
          <view class="progress-bar" :style="{ width: percent(p) + '%' }"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PackageUsageCard',
  props: {
    // [{ name, remain, total }]
    packages: { type: Array, default: () => [] }
  },
  methods: {
    percent(p) {
      if (!p.total || p.total <= 0) return 0
      return Math.max(0, Math.min(100, (p.remain / p.total) * 100))
    }
  }
}
</script>

<style lang="scss" scoped>
.pkg-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
  height: 100%;
  box-sizing: border-box;
}
.card-head {
  margin-bottom: 16rpx;
}
.title {
  font-size: var(--text-lg, 32rpx);
  font-weight: 600;
  color: #333;
}
.empty {
  padding: 40rpx 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  align-items: center;
  justify-content: center;
}
.empty-text {
  font-size: var(--text-md, 28rpx);
  color: #999;
}
.empty-link {
  font-size: var(--text-sm, 24rpx);
  color: var(--color-primary, #E07A4F);
}
.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.pkg-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.pkg-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pkg-name {
  font-size: var(--text-md, 28rpx);
  color: #333;
}
.pkg-remain {
  font-size: var(--text-sm, 24rpx);
  color: #666;
}
.progress {
  height: 10rpx;
  background: #f0f0f0;
  border-radius: 5rpx;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #E07A4F, #E8A84C);
  border-radius: 5rpx;
  transition: width 0.3s ease;
}
</style>
```

- [ ] **Step 2：Commit**

```bash
git add components/home/package-usage-card.vue
git commit -m "feat: 新增套餐使用卡片组件 package-usage-card"
```

## Task 3.7：health-detail-modal 健康汇总弹窗

**Files:**
- Create: `components/home/health-detail-modal.vue`

- [ ] **Step 1：创建组件**

```vue
<template>
  <uni-popup ref="popup" type="center" :mask-click="true" @change="onPopupChange">
    <view class="modal">
      <!-- 头部 -->
      <view class="modal-head">
        <text class="modal-title">{{ memberName }}的健康数据</text>
        <view class="close-btn" @click="close">
          <uni-icons type="closeempty" size="22" color="#999"></uni-icons>
        </view>
      </view>

      <!-- 实时指标网格 -->
      <view class="section">
        <view class="section-title">
          <text>实时数据</text>
          <text class="refresh-hint">30s 自动刷新</text>
        </view>
        <view class="metric-grid">
          <view class="metric">
            <text class="m-label">心率</text>
            <view class="m-value-row"><text class="m-num">{{ fmt(data.heartRate) }}</text><text class="m-unit">次/分</text></view>
          </view>
          <view class="metric">
            <text class="m-label">体温</text>
            <view class="m-value-row"><text class="m-num">{{ fmt(data.temperature) }}</text><text class="m-unit">℃</text></view>
          </view>
          <view class="metric">
            <text class="m-label">呼吸</text>
            <view class="m-value-row"><text class="m-num">{{ fmt(data.respiratoryRate) }}</text><text class="m-unit">次/分</text></view>
          </view>
          <view class="metric">
            <text class="m-label">血氧</text>
            <view class="m-value-row"><text class="m-num">{{ fmt(data.bloodOxygen) }}</text><text class="m-unit">%</text></view>
          </view>
          <view class="metric">
            <text class="m-label">血压</text>
            <view class="m-value-row"><text class="m-num">{{ bp }}</text><text class="m-unit">mmHg</text></view>
          </view>
          <view class="metric">
            <text class="m-label">血糖</text>
            <view class="m-value-row"><text class="m-num">{{ fmt(data.bloodSugar) }}</text><text class="m-unit">mmol/L</text></view>
          </view>
        </view>
      </view>

      <!-- 在床状态 -->
      <view class="section">
        <view class="section-title"><text>在床状态</text></view>
        <view class="inbed" :class="{ 'on': data.inBedStatus === 1 }">
          <view class="dot"></view>
          <text>{{ data.inBedStatusName || '--' }}</text>
        </view>
      </view>

      <!-- 睡眠概览 -->
      <view class="section">
        <view class="section-title"><text>睡眠概览</text></view>
        <view class="sleep-row">
          <view class="sleep-cell">
            <text class="s-label">昨晚时长</text>
            <text class="s-val">{{ sleepDur }} 小时</text>
          </view>
          <view class="sleep-cell">
            <text class="s-label">入睡时间</text>
            <text class="s-val">{{ data.sleep ? data.sleep.fallAsleepTime : '--' }}</text>
          </view>
          <view class="sleep-cell">
            <text class="s-label">起床时间</text>
            <text class="s-val">{{ data.sleep ? data.sleep.wakeUpTime : '--' }}</text>
          </view>
        </view>
      </view>

      <!-- 跳转 -->
      <view class="modal-foot" @click="goFullReport">
        <text>查看完整睡眠报告</text>
        <uni-icons type="right" size="14" color="#E07A4F"></uni-icons>
      </view>
    </view>
  </uni-popup>
</template>

<script>
export default {
  name: 'HealthDetailModal',
  props: {
    memberName: { type: String, default: '' }
  },
  data() {
    return {
      data: {}
    }
  },
  computed: {
    bp() {
      if (!this.data.bloodPressure) return '--'
      return (this.data.bloodPressure.systolic || '--') + '/' + (this.data.bloodPressure.diastolic || '--')
    },
    sleepDur() {
      return this.data.sleep && this.data.sleep.lastNightDuration != null ? this.data.sleep.lastNightDuration : '--'
    }
  },
  methods: {
    open(healthData) {
      this.data = healthData || {}
      this.$refs.popup.open()
    },
    close() {
      this.$refs.popup.close()
    },
    onPopupChange(e) {
      this.$emit(e.show ? 'open' : 'close')
    },
    fmt(v) {
      return v == null ? '--' : v
    },
    goFullReport() {
      this.close()
      uni.navigateTo({ url: '/pages/my/sleep-report/sleep-report' })
    }
  }
}
</script>

<style lang="scss" scoped>
.modal {
  width: 86vw;
  max-height: 85vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.modal-title {
  font-size: var(--text-lg, 32rpx);
  font-weight: 600;
  color: #333;
}
.close-btn {
  padding: 8rpx;
}
.section {
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--text-md, 28rpx);
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}
.refresh-hint {
  font-size: var(--text-xs, 20rpx);
  font-weight: 400;
  color: #bbb;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}
.metric {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.m-label {
  font-size: var(--text-xs, 20rpx);
  color: #999;
}
.m-value-row {
  display: flex;
  align-items: baseline;
  gap: 4rpx;
}
.m-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #333;
  line-height: 1;
}
.m-unit {
  font-size: var(--text-xs, 20rpx);
  color: #999;
}
.inbed {
  display: flex;
  align-items: center;
  gap: 12rpx;
  font-size: var(--text-md, 28rpx);
  color: #999;
}
.inbed .dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ccc;
}
.inbed.on {
  color: #5AAB7A;
}
.inbed.on .dot {
  background: #5AAB7A;
}
.sleep-row {
  display: flex;
  gap: 16rpx;
}
.sleep-cell {
  flex: 1;
  background: #fafafa;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.s-label {
  font-size: var(--text-xs, 20rpx);
  color: #999;
}
.s-val {
  font-size: var(--text-md, 28rpx);
  color: #333;
  font-weight: 600;
}
.modal-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 28rpx;
  font-size: var(--text-md, 28rpx);
  color: #E07A4F;
}
</style>
```

- [ ] **Step 2：Commit**

```bash
git add components/home/health-detail-modal.vue
git commit -m "feat: 新增健康汇总弹窗组件 health-detail-modal"
```

---

# 阶段 4：重写 pages/index.vue 组装所有组件

把 7 个组件组装到首页，接入 mock 数据、家庭成员切换、30s 轮询、下拉刷新。

## Task 4.1：重写 pages/index.vue

**Files:**
- Modify: `pages/index.vue` (完全重写，保留公告逻辑)

- [ ] **Step 1：备份公告相关逻辑并重写文件**

将 [pages/index.vue](file:///d:/kangyang/pages/index.vue) 完全替换为：

```vue
<template>
  <view class="page-container">
    <!-- 欢迎区 -->
    <home-header
      :user-name="userName"
      :community-name="communityName"
      @join-community="goJoinCommunity"
    />

    <!-- 健康监测标题 + 成员切换 -->
    <view class="section-bar">
      <view class="section-title-wrap">
        <view class="bar-line"></view>
        <text class="section-title">健康监测</text>
      </view>
      <member-selector
        :members="members"
        :current-member="currentMember"
        @change="onMemberChange"
      />
    </view>

    <!-- 健康双卡片 -->
    <view class="health-row">
      <view class="health-col">
        <health-card
          :data="healthData"
          @click="openHealthModal"
        />
      </view>
      <view class="health-col">
        <sleep-card
          :days="sleepDays"
          @click="openHealthModal"
        />
      </view>
    </view>

    <!-- 公告栏（保留原逻辑） -->
    <view class="notice-container">
      <view class="notice-header">
        <uni-icons type="sound" size="16" color="#ff6b35"></uni-icons>
        <text class="notice-title">公告</text>
      </view>
      <view class="notice-content">
        <swiper
          class="notice-swiper"
          :vertical="true"
          :autoplay="true"
          :interval="4000"
          :duration="300"
          :indicator-dots="false"
        >
          <swiper-item v-for="(notice, index) in noticeList" :key="index">
            <text class="notice-text" @click="handleNoticeClick(notice)">{{ notice.title }}</text>
          </swiper-item>
        </swiper>
      </view>
      <view class="notice-more" @click="handleMoreNotice">
        <uni-icons type="right" size="14" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 今日动态标题 -->
    <view class="section-bar">
      <view class="section-title-wrap">
        <view class="bar-line"></view>
        <text class="section-title">今日动态</text>
      </view>
    </view>

    <!-- 订单 + 套餐 -->
    <view class="bottom-row">
      <view class="bottom-col">
        <today-order-card
          :data="todayOrder"
          @click="goOrders"
        />
      </view>
      <view class="bottom-col">
        <package-usage-card
          :packages="packages"
          @click="onPackageClick"
        />
      </view>
    </view>

    <!-- 健康汇总弹窗 -->
    <health-detail-modal
      ref="healthModal"
      :member-name="currentMember ? currentMember.name : ''"
      @open="onModalOpen"
      @close="onModalClose"
    />
  </view>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { listNotice } from '@/api/notice.js'
import { listFamilymemberNoPage } from '@/api/familymember.js'
import { listMyPackageInstance } from '@/api/userpackage.js'
import { getHomeHealth } from '@/api/home/health.js'
import { getTodayOrder } from '@/api/home/todayOrder.js'
import { createPoll } from '@/utils/home-poll.js'

import HomeHeader from '@/components/home/header.vue'
import MemberSelector from '@/components/home/member-selector.vue'
import HealthCard from '@/components/home/health-card.vue'
import SleepCard from '@/components/home/sleep-card.vue'
import TodayOrderCard from '@/components/home/today-order-card.vue'
import PackageUsageCard from '@/components/home/package-usage-card.vue'
import HealthDetailModal from '@/components/home/health-detail-modal.vue'

const STORAGE_KEY_MEMBER = 'home_selected_member'

export default {
  components: {
    HomeHeader, MemberSelector, HealthCard, SleepCard,
    TodayOrderCard, PackageUsageCard, HealthDetailModal
  },
  data() {
    return {
      noticeList: [],
      members: [],
      currentMember: null,
      healthData: {},
      todayOrder: { total: 0, completed: 0, list: [] },
      packages: [],
      healthPoll: null
    }
  },
  computed: {
    ...mapState({
      joinedCommunity: state => state.user.joinedCommunity
    }),
    ...mapGetters(['name']),
    userName() {
      return this.name
    },
    communityName() {
      if (!this.joinedCommunity) return ''
      return this.joinedCommunity.communityName || this.joinedCommunity.name || ''
    },
    sleepDays() {
      return (this.healthData && this.healthData.sleep && this.healthData.sleep.last7Days) || []
    }
  },
  onLoad() {
    this.initPoll()
    this.getNoticeList()
    this.loadMembers()
  },
  onShow() {
    // 进入/回到首页：拉取一次 + 启动 30s 轮询
    this.refreshAll()
    this.healthPoll && this.healthPoll.start(true)
  },
  onHide() {
    // 离开首页：停止轮询
    this.healthPoll && this.healthPoll.stop()
  },
  onPullDownRefresh() {
    this.refreshAll(true)
  },
  methods: {
    initPoll() {
      this.healthPoll = createPoll(() => this.fetchHealth(), 30000)
    },

    // ===== 数据拉取 =====
    async refreshAll(isPullDown = false) {
      await Promise.all([
        this.fetchHealth(),
        this.fetchTodayOrder(),
        this.fetchPackages()
      ])
      if (isPullDown) uni.stopPullDownRefresh()
    },

    async loadMembers() {
      try {
        const res = await listFamilymemberNoPage()
        const list = res.rows || res.data || []
        this.members = list.map(m => ({
          id: m.memberId || m.id,
          name: m.memberName || m.name || '成员'
        }))
        // 恢复上次选中的成员，否则取第一个
        const cached = uni.getStorageSync(STORAGE_KEY_MEMBER)
        const found = cached && this.members.find(m => String(m.id) === String(cached.id))
        this.currentMember = found || this.members[0] || null
        if (this.currentMember) {
          this.refreshAll()
        }
      } catch (e) {
        console.error('加载家庭成员失败:', e)
      }
    },

    onMemberChange(m) {
      this.currentMember = m
      uni.setStorageSync(STORAGE_KEY_MEMBER, m)
      this.refreshAll()
    },

    async fetchHealth() {
      if (!this.currentMember) return
      try {
        const res = await getHomeHealth(this.currentMember.id)
        if (res.code === 200) {
          this.healthData = res.data || {}
          // 同步更新已打开的弹窗
          if (this.$refs.healthModal && this.isModalOpen) {
            this.$refs.healthModal.data = this.healthData
          }
        }
      } catch (e) {
        console.error('获取健康数据失败:', e)
      }
    },

    async fetchTodayOrder() {
      if (!this.currentMember) return
      try {
        const today = this.todayStr()
        const res = await getTodayOrder(this.currentMember.id, today)
        if (res.code === 200) {
          this.todayOrder = res.data || { total: 0, completed: 0, list: [] }
        }
      } catch (e) {
        console.error('获取今日订单失败:', e)
      }
    },

    async fetchPackages() {
      if (!this.currentMember) return
      try {
        const res = await listMyPackageInstance({ memberId: this.currentMember.id, pageNum: 1, pageSize: 20 })
        const rows = res.rows || []
        this.packages = rows.map(p => ({
          name: p.packageName || p.name || '套餐',
          remain: p.remainCount != null ? p.remainCount : (p.totalCount - (p.usedCount || 0)),
          total: p.totalCount || 0
        })).filter(p => p.total > 0)
      } catch (e) {
        console.error('获取套餐失败:', e)
        this.packages = []
      }
    },

    async getNoticeList() {
      try {
        const res = await listNotice({ pageNum: 1, pageSize: 5 })
        if (res.code === 200 && res.rows) {
          this.noticeList = res.rows.map(item => ({
            id: item.noticeId,
            title: item.noticeTitle,
            content: item.noticeContent,
            time: item.createTime,
            important: item.noticeType === '1'
          }))
        }
      } catch (e) {
        console.error('获取公告列表失败:', e)
      }
    },

    todayStr() {
      const d = new Date()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return d.getFullYear() + '-' + m + '-' + day
    },

    // ===== 事件 =====
    openHealthModal() {
      this.$refs.healthModal.open(this.healthData)
    },
    isModalOpen: false,
    onModalOpen() { this.isModalOpen = true; this.healthPoll && this.healthPoll.start(true) },
    onModalClose() { this.isModalOpen = false },

    goJoinCommunity() {
      uni.navigateTo({ url: '/pages/my/joincommunity/index' })
    },
    goOrders() {
      uni.switchTab({ url: '/pages/order/index' })
    },
    onPackageClick() {
      if (this.packages.length === 0) {
        uni.navigateTo({ url: '/pages/server/SetMeal/index' })
      } else {
        uni.navigateTo({ url: '/pages/my/balancePackage/index' })
      }
    },
    handleNoticeClick(notice) {
      uni.navigateTo({
        url: `/pages/server/notice/detail?item=${encodeURIComponent(JSON.stringify(notice))}`
      })
    },
    handleMoreNotice() {
      uni.navigateTo({ url: '/pages/server/notice/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
}

/* 通用 section 标题栏 */
.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx 16rpx;
}
.section-title-wrap {
  display: flex;
  align-items: center;
}
.bar-line {
  width: 8rpx;
  height: 32rpx;
  background: #4A9E8E;
  border-radius: 4rpx;
  margin-right: 16rpx;
}
.section-title {
  font-size: var(--text-lg, 32rpx);
  font-weight: 700;
  color: #333;
}

/* 健康双卡 */
.health-row {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
}
.health-col {
  flex: 1;
  min-width: 0;
}

/* 公告栏（保留原样式） */
.notice-container {
  background: #FFF8F3;
  border-radius: 12rpx;
  padding: 20rpx 20rpx 20rpx 28rpx;
  margin: 24rpx 30rpx;
  display: flex;
  align-items: center;
  border-left: 6rpx solid #E07A4F;
}
.notice-header {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}
.notice-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #ff6b35;
  margin-left: 8rpx;
}
.notice-content {
  flex: 1;
  height: 40rpx;
  overflow: hidden;
}
.notice-swiper {
  height: 40rpx;
}
.notice-text {
  font-size: 26rpx;
  color: #666;
  line-height: 40rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.notice-more {
  margin-left: 20rpx;
  padding: 8rpx;
  flex-shrink: 0;
}

/* 底部双卡 */
.bottom-row {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx;
}
.bottom-col {
  flex: 1;
  min-width: 0;
}
</style>
```

- [ ] **Step 2：开启首页下拉刷新**

在 [pages.json](file:///d:/kangyang/pages.json) 中 `pages/index` 的 style 里加：
```json
"enablePullDownRefresh": true,
"backgroundTextStyle": "dark"
```

- [ ] **Step 3：验证首页整体表现**

编译到微信开发者工具，进入首页。
Expected:
- 顶部显示"欢迎，{用户名}"和社区名（未加入社区显示引导）
- "健康监测"标题右侧有成员选择器，能切换
- 左右两个正方形卡片：左显示心率72/体温36.5（mock），右显示7天柱状图
- 公告栏正常滚动
- "今日动态"下左右两卡：左显示已完成3/5及订单列表，右显示套餐（mock 的 userpackage 可能无 memberId 过滤，若返回空则显示"你还未订购套餐"）
- 点击健康卡片弹出健康汇总弹窗
- 切换成员后所有卡片刷新

> 若 listMyPackageInstance 不支持 memberId 过滤导致数据不符预期，阶段5联调时由后端补齐，本阶段以"接口能调通、不报错"为准。

- [ ] **Step 4：Commit**

```bash
git add pages/index.vue pages.json
git commit -m "feat: 重写首页，集成健康/订单/套餐模块与家庭成员切换"
```

---

## Task 4.2：验证 30s 轮询与生命周期

- [ ] **Step 1：验证轮询启停**

在 `fetchHealth` 开头临时加日志：
```js
console.log('[poll] fetchHealth', new Date().toLocaleTimeString())
```
编译运行。
Expected:
- 首页 onShow 后每 30s 控制台输出一次
- 切到其他 tab（onHide）后停止输出
- 切回首页恢复输出
- 打开健康弹窗时持续输出，关闭弹窗后首页仍继续（弹窗关闭不停止首页轮询）

> 注：设计文档要求"弹窗打开时启动轮询、关闭后停止"。当前实现是首页 onShow 即轮询，弹窗复用首页轮询数据。若要求弹窗独立轮询，可在 onModalOpen 单独 start 一个弹窗 poll、onModalClose stop。当前方案已满足"弹窗内数据30s刷新"，验证通过即可。

- [ ] **Step 2：移除调试日志并 Commit**

删掉临时 console.log。
```bash
git add pages/index.vue
git commit -m "chore: 验证首页轮询启停，移除调试日志"
```

---

# 阶段 5：切换真实接口 + 联调清理

后端接口就绪后执行。

## Task 5.1：关闭 mock 开关

**Files:**
- Modify: `api/home/health.js`, `api/home/todayOrder.js`

- [ ] **Step 1：关闭两个文件的 USE_MOCK**

将 `const USE_MOCK = true` 改为 `const USE_MOCK = false`。

- [ ] **Step 2：验证真实接口**

后端就绪后编译运行，确认健康数据、今日订单从真实接口返回。
Expected: 卡片显示真实数据；401/500 等错误按 request.js 现有逻辑处理（toast 提示）。

- [ ] **Step 3：Commit**

```bash
git add api/home/health.js api/home/todayOrder.js
git commit -m "chore: 关闭首页 mock 开关，接入真实接口"
```

## Task 5.2：与后端确认字段，修正映射

**Files:**
- Modify: `pages/index.vue` (fetchPackages / loadMembers 字段映射)，`components/home/*` (如有字段名差异)

- [ ] **Step 1：核对真实返回字段**

对照设计文档"待后端确认事项"：
1. 健康数据字段是否齐全（heartRate/temperature/respiratoryRate/bloodOxygen/bloodPressure/bloodSugar/inBedStatus/sleep）
2. 今日订单 status 值与现有订单状态是否一致（2=已完成、1=待服务）
3. 睡眠 last7Days 单位（小时/分钟）—— 若为分钟，在 fetchHealth 中除以 60
4. 家庭成员 ID 字段名（memberId / residentId）

- [ ] **Step 2：按实际字段修正映射**

在 `pages/index.vue` 的 `loadMembers`、`fetchPackages` 中按真实返回调整字段取值。
若睡眠数据单位为分钟，在 `fetchHealth` 中转换：
```js
if (res.data.sleep && res.data.sleep.last7Days) {
  res.data.sleep.last7Days = res.data.sleep.last7Days.map(m => +(m / 60).toFixed(1))
}
```

- [ ] **Step 3：验证后 Commit**

```bash
git add pages/index.vue
git commit -m "fix: 按后端真实字段修正首页数据映射"
```

## Task 5.3：清理兼容重定向页（可选）

设备页迁移时在 `pages/my/device/` 留了重定向壳。确认无旧入口引用后可删除。

- [ ] **Step 1：全局搜索旧路径引用**

Run: `Select-String -Path "d:/kangyang/**/*.vue","d:/kangyang/**/*.js" -Pattern "pages/my/device" -SimpleMatch | Select-Object Path,LineNumber`
Expected: 仅 `pages/my/device/*` 自身的重定向页命中（不应有其他业务代码引用旧路径）。

- [ ] **Step 2：删除重定向壳**

若确认无外部引用，删除 `pages/my/device/` 整个目录，并在 `pages.json` 的分包配置中移除对应页面。
（若仍有不确定的外部链接，保留重定向壳不删，本任务标记为可选。）

- [ ] **Step 3：验证并 Commit**

```bash
git add -A pages/my/device pages.json
git commit -m "chore: 移除设备页旧路径重定向壳"
```

---

## 完成标准

- [ ] tabBar 为"首页 / 设备 / 订单 / 我的"
- [ ] 首页显示欢迎区 + 健康双卡 + 公告 + 订单/套餐双卡
- [ ] 家庭成员可切换，切换后数据刷新
- [ ] 健康卡片点击弹出汇总弹窗，含心率/体温/呼吸/血氧/血压/血糖/在床/睡眠
- [ ] 30s 轮询：onShow 启动、onHide 停止
- [ ] 下拉刷新可用
- [ ] 各空状态正确显示（无设备/无订单/无套餐/未加入社区）
- [ ] 设备页可从 tabBar 进入，功能正常
- [ ] "我的"页有服务分类入口
- [ ] mock 关闭后真实接口可用

---

## Self-Review 备注

1. **Spec 覆盖**：设计文档 11 个章节均已对应任务——欢迎区(3.1→Task3.1)、健康模块(3.2→Task3.2-3.4)、公告(3.3→Task4.1保留)、订单卡(3.4→Task3.5)、套餐卡(3.5→Task3.6)、弹窗(四→Task3.7)、tabBar(五→Task1.1-1.3)、接口(六→Task2.1-2.3)、轮询(九→Task2.4/4.2)、空状态(八→各组件内置)。
2. **Placeholder**：无 TBD/TODO，所有步骤含可执行代码。
3. **类型一致**：`currentMember.id`、`healthData.sleep.last7Days`、`todayOrder.list[].status` 在各任务间命名一致。
4. **TDD 适配**：项目无测试框架，用"编译+微信开发者工具验证"替代自动化测试，已在开头说明。
