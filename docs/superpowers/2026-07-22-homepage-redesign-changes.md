# 首页重构与联调改动总结

> **项目**：安特社区六助（微信小程序）  
> **日期**：2026-07-20 ~ 2026-07-24  
> **范围**：首页重构 + tabBar 改造 + 联调修复 + UI 优化

---

## 一、改动概览

本次改动分为 **5 个阶段**，涵盖：

| 阶段 | 内容 | 状态 |
|---|---|---|
| **阶段 1** | 设备页迁移 + tabBar 改造（服务分类 → 设备管理） | ✅ 已完成 |
| **阶段 2** | Mock 数据层 + 健康/订单 API + 30s 轮询工具 | ✅ 已完成 |
| **阶段 3** | 7 个首页子组件构建 | ✅ 已完成 |
| **阶段 4** | 首页组装 + 成员切换 + 下拉刷新 | ✅ 已完成 |
| **阶段 5** | 真实接口切换 + 联调修复 + UI 优化 | ✅ 已完成 |

---

## 二、核心改动详细说明

### 2.1 首页顶部区域改版

**文件**：`components/home/header.vue`、`pages/index.vue`、`pages.json`

**改动**：
- 原绿色渐变头部 → 深蓝渐变主题（`#1677FF → #4096FF`）
- 标题改为 `‹ 家庭守护 ›`（居中，与微信胶囊按钮同高）
- 显示用户名（如"张春家"）
- **当前时间**（实时时钟，每秒刷新）
- **所在社区**（如"海棠小镇"）
- 删除"当前状态良好"行
- 首页改为自定义导航（`navigationStyle: custom`）

**配色方案**：
| 用途 | 色值 |
|------|------|
| 主色 | `#1677FF`（医疗/信任/科技） |
| 辅助绿 | `#52C41A`（健康） |
| 提醒橙 | `#FAAD14`（警告） |
| 背景 | `#F5F7FA` |

### 2.2 TabBar 改造

**文件**：`pages.json`、`pages/device/index.vue`、`pages/mine/index.vue`

**改动**：
- **移除** tabBar "服务分类"入口
- **新增** tabBar "设备管理"入口（`pages/device/index`）
- 设备页从分包 `pages/my/device/` 迁移到主包 `pages/device/`
- 仅入口页 `index.vue` 迁主包（+45KB），详情页 `detail/fall/sleep/msg` 保留在分包（控制主包体积）
- 原 `pages/my/device/index` 改为重定向壳（兼容旧入口）
- "我的"页新增"服务分类"菜单项（补偿 tabBar 移除）

**TabBar 结构变更**：
```
原：首页 / 服务分类 / 订单 / 我的
新：首页 / 设备 / 订单 / 我的
```

### 2.3 三模块联调修复（核心）

**文件**：`pages/index.vue`、`api/home/package.js`、`components/home/package-usage-card.vue`

**问题**：首页今日订单、套餐、健康监测三个模块全不显示

**根因**：`listFamilymemberNoPage()` 返回空 → `members=[]` → `currentMember=null` → `fetchOrder/fetchPackages/fetchHealth` 全被 `if(!currentMemberId)return` 守卫挡住

**修复**：
1. `loadMembers` 加兜底逻辑：家庭成员为空时用当前登录用户作为"本人"
2. 移除 `onMemberChange`、`fetchOrder`、`fetchPackages`、`fetchHealth`、`onShow` 中的 `currentMemberId` 守卫
3. 套餐接口从 mock 切换到真实接口 `listMyPackageInstance`（`/services/userpackage/my/list`）
4. 套餐卡片去掉进度条（列表接口不返回次数数据），改为显示套餐名 + 状态标签

### 2.4 今日订单联调

**文件**：`api/home/todayOrder.js`

**改动**：
- 原接口传 `memberId` 参数 → 改为不传（订单按 token 查询，与订单页一致）
- 查询条件改为 `orderStatus: '3'`（已完成）
- 客户端按 `verificationTime` 过滤今日订单
- 添加诊断日志：输出已完成订单总数、今日核销数、样例字段

**订单状态码**：
| 码 | 含义 |
|---|---|
| 0 | 待接单 |
| 1 | 已接单 |
| 2 | 服务中 |
| 3 | 已完成 |
| 8 | 待核销 |

### 2.5 "我的"页布局调整

**文件**：`pages/mine/index.vue`

**改动**：
1. **删除"加入社区"按钮**：快捷操作从 5 项变为 4 项（服务地址、家庭成员、健康档案、使用记录）
2. **取消隐藏机制**：接警人、设备套餐菜单始终可见（移除 2 秒长按显示逻辑）
3. **服务分类加图标**：`shop-filled` 图标 + 蓝色背景
4. **移除设备管理入口**（已在 tabBar，避免重复）
5. **使用记录对齐**：统一为 `iconfontA` 字体图标 + 固定高度 `72rpx` + 行高居中，移除逐项 `margin-top` 补丁

### 2.6 服务分类页优化

**文件**：`pages/work/index.vue`（推测，实际改动在相关文件）

**改动**：
- 去除服务卡片图片，只保留文字
- 移除重复描述文字，标题直接做成卡片行
- 卡片仅显示标题 + 箭头，简洁清晰

### 2.7 服务套餐页优化

**文件**：`pages/server/SetMeal/index.vue`

**改动**：
- 去除卡片顶部空白图片，只保留文字内容

### 2.8 轮询工具

**文件**：`utils/home-poll.js`

**新增**：安全轮询工具 `createPoll(fn, interval)`
- `start(immediate)`：启动轮询，可选立即执行
- `stop()`：停止轮询，立即清除定时器
- 支持异步函数，完成后才安排下一次（避免请求堆积）
- `onShow` 启动、`onHide` 停止，避免后台请求

---

## 三、文件变更清单

### 新增文件

| 文件 | 说明 |
|---|---|
| `api/home/mock.js` | Mock 数据集中管理 |
| `api/home/health.js` | 健康数据 API（含 mock 开关） |
| `api/home/todayOrder.js` | 今日订单 API（含 mock 开关） |
| `api/home/package.js` | 套餐 API（含 mock 开关） |
| `utils/home-poll.js` | 30s 轮询工具 |
| `components/home/header.vue` | 欢迎区组件 |
| `components/home/member-selector.vue` | 家庭成员选择器 |
| `components/home/health-card.vue` | 心率体温卡片 |
| `components/home/sleep-card.vue` | 近7天睡眠柱状图卡片 |
| `components/home/today-order-card.vue` | 今日订单卡片 |
| `components/home/package-usage-card.vue` | 套餐使用卡片 |
| `components/home/health-detail-modal.vue` | 健康汇总弹窗 |
| `pages/device/index.vue` | 设备管理主包入口 |
| `static/images/tabbar/device.png` | 设备图标（普通态） |
| `static/images/tabbar/device_.png` | 设备图标（选中态） |

### 修改文件

| 文件 | 主要改动 |
|---|---|
| `pages/index.vue` | 完全重写，组装所有组件 |
| `pages.json` | tabBar 改造、自定义导航、下拉刷新 |
| `pages/mine/index.vue` | 删除加入社区、取消隐藏机制、使用记录对齐 |
| `pages/my/device/index.vue` | 改为重定向壳 |
| `pages/server/SetMeal/index.vue` | 去除顶部空白图片 |
| `components/home/header.vue` | 深蓝主题 + 实时时钟 |
| `api/home/todayOrder.js` | 真实接口 + 诊断日志 |
| `api/home/package.js` | 切换真实接口 |
| `utils/service-helper.js` | 套餐状态映射 |

---

## 四、关键技术决策

### 4.1 主包体积控制

**策略**：微信小程序主包 ≤2MB（推荐 ≤1.5MB）
- 仅迁移设备入口页 `index.vue`（+45KB）到主包
- 详情页 `detail/fall/sleep/msg` 保留在分包（跨包 `navigateTo` 正常工作）
- 主包预算：269KB + 46KB + 581KB(uCharts) + 40KB(首页组件) ≈ 936KB

### 4.2 数据查询维度

**家庭成员为空时**：
- `listFamilymemberNoPage()` 返回空 → 兜底"本人"（memberId=null）
- 订单、套餐按 token 查询（不依赖 memberId）
- 健康数据由后端按 token 兜底当前用户

### 4.3 Mock 开关机制

每个 API 文件有 `USE_MOCK` 开关：
- `USE_MOCK = true`：返回 mock 数据
- `USE_MOCK = false`：调用真实接口
- 当前状态：健康 `true`，订单 `false`，套餐 `false`

---

## 五、待确认事项

| 序号 | 事项 | 状态 |
|---|---|---|
| 1 | 健康接口 `/resident/home/health` 真实字段确认 | ⏳ 待后端 |
| 2 | 今日订单 `verificationTime` 是否正确写入 service_order 表 | ⏳ 待后端 |
| 3 | 套餐详情页是否需要显示次数（当前列表接口不返回） | ⏳ 待确认 |
| 4 | 服务分类页是否需要进一步优化布局 | ⏳ 待用户反馈 |

---

## 六、提交记录

| 提交 | 摘要 |
|---|---|
| `e883b9a` | 顶部最后更新改为实时时钟(当前时间 HH:MM:SS) |
| `f08580f` | 顶部区域改版为深蓝家庭守护主题 |
| `afce29c` | 快捷操作四项图标统一 iconfontA 并固定高度对齐文字 |
| `4f46344` | 删除加入社区入口，快捷操作调整为四项均分布局 |
| `53ca3f4` | 解耦成员守卫+套餐接真实接口+兜底本人 |
| `78a7503` | 今日订单改查已完成订单(orderStatus=3)并按核销时间过滤 |
| `c683193` | 今日订单去掉 memberId 参数 |
| `cde4e99` | 服务分类页移除重复描述文字 |
| `8ba78fd` | 服务分类页去除服务卡片图片 |
| `80c4c63` | 我的页取消隐藏机制+服务分类加图标+移除设备管理入口 |
| `90134c9` | 服务套餐页去除卡片顶部空白图片 |
| `a1dc2fa` | 重写首页组装7组件+30s轮询+下拉刷新 |
| `b3ef16a` | tabBar 将服务分类替换为设备管理 |
| `8b5f147` | 设备管理入口页迁至主包 |

---

## 七、运行验证步骤

1. **首页验证**：
   - 顶部深蓝主题显示 `‹ 家庭守护 ›`、用户名、当前时间、所在社区
   - 健康监测模块显示心率/体温卡片 + 近7天睡眠柱状图
   - 成员选择器可切换（至少显示"本人"）
   - 今日动态显示订单卡片 + 套餐卡片
   - 公告栏正常滚动

2. **TabBar 验证**：
   - 底部显示"首页 / 设备 / 订单 / 我的"
   - 点击"设备"切换到设备管理页

3. **"我的"页验证**：
   - 快捷操作 4 项图标对齐、文字齐平
   - 接警人、设备套餐菜单始终可见
   - 无设备管理入口（已在 tabBar）

4. **联调验证**：
   - 今日订单显示已完成订单（需后端写入 verificationTime）
   - 套餐卡片显示已购套餐及状态
   - 下拉刷新正常工作

---

*文档生成日期：2026-07-24*
