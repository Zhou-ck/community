# 安特社区六助 前端知识档案

> 项目基于 uni-app (Vue 2) 构建，编译为微信小程序。
> 定位：面向社区老年人的智慧养老服务小程序，提供"六助"系列服务（助洁、助行、助医、助浴、助餐、助急）。

---

## 一、技术栈

| 层 | 技术 |
|---|---|
| 框架 | uni-app (Vue 2) |
| UI | uView 2.x + uni-ui |
| 状态管理 | Vuex |
| 构建 | Sass/SCSS |
| 图表 | @qiun/ucharts + 自研 Canvas 图表组件 |
| 二维码 | weapp-qrcode |
| 后端地址 | `https://community.katlot.cn` (config.js 中配置) |

---

## 二、目录结构

```
own.community/
├── App.vue                   # 应用入口：初始化、token检查
├── main.js                   # Vue 注册：store、plugins、uView、mixins
├── manifest.json             # uni-app 配置（多平台）
├── pages.json                # 页面路由 + tabBar + subPackages
├── config.js                 # 全局配置（baseUrl、appInfo）
├── permission.js             # 路由拦截：白名单、登录校验
├── pages/                    # 主包页面
│   ├── index.vue             # 首页（轮播图、服务中心、居家养老）
│   ├── login.vue             # 登录（手机号/账号/密码/验证码）
│   ├── register.vue          # 注册
│   ├── forget.vue            # 忘记密码
│   ├── work/index.vue        # 服务分类（左侧分类＋右侧服务网格）
│   ├── order/index.vue       # 我的订单（多tab筛选）
│   ├── order/detail.vue      # 订单详情
│   ├── evaluation/list.vue   # 评价记录
│   ├── mine/index.vue        # 我的（个人中心入口）
│   ├── common/               # 通用：隐私协议、用户协议、图片裁剪
│   ├── server/               # 子包：服务端模块
│   │   ├── index.vue         # 服务列表
│   │   ├── booking/index.vue # 预约服务
│   │   ├── serviceDetail/    # 服务详情
│   │   ├── notice/           # 公告
│   │   ├── volunteer/        # 志愿服务
│   │   ├── institution/      # 养老机构
│   │   └── SetMeal/          # 服务套餐
│   └── my/                   # 子包：个人中心模块
│       ├── avatar/           # 修改头像
│       ├── info/             # 个人信息
│       ├── pwd/              # 修改密码
│       ├── setting/          # 应用设置
│       ├── help/             # 常见问题
│       ├── about/            # 关于我们
│       ├── joincommunity/    # 加入社区/申请
│       ├── address/          # 服务地址
│       ├── family/           # 家庭成员
│       ├── health/           # 健康档案
│       ├── device/           # 设备管理 + 数据监测（跌倒/睡眠/需求消息）
│       ├── plan/detail       # 设备计划查看
│       ├── alarmreceiver/    # 接警人管理
│       ├── network/          # 网络配置（蓝牙配网）
│       ├── balancePackage/   # 套餐充值 + 历史订单
│       ├── balanceRecord/    # 余量消费记录
│       ├── sleep-report/     # 睡眠报告
│       ├── day-report/       # 日报告
│       ├── week-report/      # 周报告
│       ├── month-report/     # 月报告
│       ├── content/          # 内容设置
│       └── watch/            # 手表相关（实时数据/健康/通话/配置/睡眠报告）
├── components/               # 通用组件
│   ├── charts/               # 30+ 种图表组件（心率、呼吸、睡眠周期...）
│   ├── review-modal/         # 审核弹窗
│   └── verification-modal/   # 验证码弹窗
├── api/                      # API 接口层（40+ 模块）
│   ├── login.js              # 登录/注册/退出/验证码
│   ├── service.js            # 服务类型 + 服务项 + 订单 CRUD + 评价
│   ├── serviceorder.js       # 按需服务申请
│   ├── servicepackage.js     # 服务套餐
│   ├── userpackage.js        # 用户套餐（购买/退订/扣减/套餐实例）
│   ├── balancePackage.js     # 设备套餐包
│   ├── payment.js            # 支付（扫码支付/小程序支付）
│   ├── device.js             # 设备管理（CRUD + 实时数据 + 指令发送）
│   ├── iwownDevice.js        # 埃微手表设备
│   ├── iwownHealthyData.js   # 健康数据（心率/呼吸等）
│   ├── iwownSleep.js         # 睡眠数据 + 报告
│   ├── deviceplan.js         # 设备计划
│   ├── profiles.js           # 设备资料
│   ├── joinCommunity.js      # 社区申请（CRUD + 楼栋/门牌查询）
│   ├── familymember.js       # 家庭成员
│   ├── residenthealthrecord.js # 健康档案
│   ├── servicesaddress.js    # 服务地址
│   ├── notice.js             # 公告
│   ├── monitorApply.js       # 设备监控申请/审批
│   ├── alarmreceiver.js      # 接警人
│   ├── verification.js       # 验证
│   ├── tensleep.js           # 睡眠相关
│   ├── reportsleep.js        # 报告睡眠相关
│   ├── aepcommandlog.js      # AEP 设备指令日志
│   ├── sleepdemand.js        # 睡眠需求
│   ├── sleepmessage.js       # 睡眠消息
│   ├── completionlogs.js     # 完成日志
│   └── ...                   # 其他辅助模块
├── store/                    # Vuex 状态管理
│   ├── index.js              # 注册 user 模块
│   ├── getters.js            # 通用 getter（token/avatar/name/community 等）
│   └── modules/user.js       # 用户模块（登录/信息/退出/社区刷新）
├── utils/                    # 工具层
│   ├── request.js            # HTTP 请求封装（token 注入、错误码处理、401 拦截）
│   ├── upload.js             # 文件上传封装
│   ├── auth.js               # Token/用户名/密码的 storage 读写
│   ├── storage.js            # 结构化 storage 管理
│   ├── common.js             # toast/confirm/参数序列化
│   ├── constant.js           # storage key 常量
│   ├── errorCode.js          # HTTP 错误码映射
│   ├── validate.js           # 校验工具（空值/URL/邮箱/格式）
│   ├── share.js              # 微信分享 mixin
│   ├── websocket.js          # WebSocket 管理（心跳/重连/订阅分发）
│   ├── bluetooth-config.js   # 蓝牙配网 UUID 配置
│   ├── getdate.js            # 日期工具
│   └── handleSleepReport.js  # 睡眠报告数据处理
├── mixins/
│   └── verification-mixin.js # 验证码逻辑 mixin
├── plugins/                  # Vue 插件
│   ├── index.js              # 注册 $tab / $auth / $modal
│   ├── tab.js                # 页面导航封装
│   ├── auth.js               # 权限/角色校验（permissions/roles）
│   └── modal.js              # 模态框工具
├── uni_modules/              # uni-app 插件模块
├── static/                   # 静态资源（图片、字体图标、scss）
└── uni.scss                  # 全局 scss 变量
```

---

## 三、路由与 TabBar

### TabBar（4 个主页面）
1. **首页** (`pages/index`) — 轮播图、公告、服务中心网格、居家养老推荐
2. **服务分类** (`pages/work/index`) — 左侧分类导航 + 右侧服务卡片
3. **我的订单** (`pages/order/index`) — 订单列表（全部/待服务/进行中/已完成/已取消）
4. **我的** (`pages/mine/index`) — 个人中心入口

### 子包
- **`pages/my/`** — 个人中心全部子页面（22+ 页面）
- **`pages/server/`** — 服务相关子页面（9 个页面）

### 路由拦截（permission.js）
- 白名单页面（`/pages/login`, `/pages/index`, `/pages/work/index` 等）无需登录
- `/pages/my/` 下页面和订单详情需登录
- 已登录访问登录页 → 重定向到首页
- 未登录访问受限页面 → 提示后跳转登录页

---

## 四、数据流

### 请求流程
```
Page.vue → api/xxx.js → utils/request.js → uni.request → 后端
                  ↑                      ↓
              store/actions          token注入 + 401拦截
```

### 状态管理
- **Vuex user 模块** — `token` / `id` / `name` / `avatar` / `roles` / `permissions` / `joinedCommunity` / `sleepReportItem`
- **Storage 缓存** — Token (`App-Token`)、用户名、密码、用户信息 (`storage_data`)

### 认证机制
1. 登录 → `/login` 获取 token → `setToken` → 注入后续请求 Header
2. 401 响应 → 清除 token → 跳转登录页
3. WebSocket 连接时也将 token 作为 URL 参数传递

### WebSocket
- 单例模式，支持心跳（30s）、断线重连（指数退避，最多10次）
- 消息订阅/分发机制（`subscribe` / `unsubscribe`）
- 用户 ID 作为连接标识

---

## 五、核心业务模块

### 1. 用户体系
- **登录**：手机号 + 账号 + 密码 + 验证码（可选），微信 openid 关联
- **注册**：基本信息录入
- **忘记密码**：通过手机号/验证码重置

### 2. 六助服务（核心）
- **助洁** / **助行** / **助医** / **助浴** / **助餐** / **助急**
- 流程：选择分类 → 选择服务项 → 预约（选择时间/地址/联系人）→ 支付 → 服务完成 → 评价
- 支持服务套餐购买（社区可购买的套餐列表）
- 支持按需服务申请

### 3. 社区管理
- 申请加入社区（选择社区→楼栋→门牌号→提交申请→审批）
- 查看/编辑申请状态，退出社区

### 4. 设备管理
- **智能设备**：添加/删除/查看设备，实时数据监测
- **埃微手表（iwown）**：心率/呼吸/睡眠监测，通话记录，配置
- **AEP 设备**：基于 telecom AEP 平台的设备指令下发
- **设备计划**：定时任务管理（如定时测量）
- **接警人**：管理紧急联系人

### 5. 健康监测
- **健康档案**：家庭成员的健康信息记录（从属于家庭成员）
- **实时数据**：心率、呼吸、血氧、体温等
- **睡眠报告**：日/周/月报告，睡眠阶段图表，详细分析
- **跌倒监测**：设备报警数据展示
- **图表组件**：30+ 种图表覆盖心率曲线、呼吸曲线、睡眠周期环形图等

### 6. 套餐与支付
- **服务套餐**：社区发布的可购买套餐（服务次数包）
- **设备套餐**：通话分钟 + 短信条数套餐
- **支付**：扫码支付 / 小程序支付（微信支付）
- **订单**：购买记录、消费流水、退订申请

### 7. 社区公告
- 滚动公告栏（首页），公告列表/详情页

---

## 六、API 风格

- 基地址：`config.baseUrl`（当前为 `https://community.katlot.cn`）
- 统一封装：`utils/request.js`
  - Token 自动注入 Header
  - 401 → 清除登录状态 → 跳转登录页
  - 500 / 业务错误 → toast 提示
  - 支持 `isToken: false` 跳过 token 注入
- 所有 API 返回格式：`{ code: 200, msg: "...", data: {...} }`

### 后端 API 前缀
| 前缀 | 功能 |
|---|---|
| `/login`, `/register`, `/getInfo`, `/logout` | 认证 |
| `/services/*` | 服务模块 |
| `/resident/*` | 居民模块（社区申请、地址、家庭成员、健康档案等）|
| `/devices/*` | 设备模块 |
| `/system/*` | 系统模块（公告、字典数据、套餐等）|
| `/api/iwown/*` | 埃微手表 |
| `/api/payment/*` | 支付 |
| `/system/iwown/sleep/*` | 睡眠数据 |

---

## 七、关键 UI 组件

| 组件 | 位置 | 说明 |
|---|---|---|
| 图表组件 | `components/charts/` | 30+ 种，覆盖心率/呼吸/睡眠数据可视化 |
| 验证码弹窗 | `components/verification-modal/` | 验证码输入弹窗 |
| 审核弹窗 | `components/review-modal/` | 审核操作弹窗 |
| 验证码 mixin | `mixins/verification-mixin.js` | 验证码逻辑复用 |

---

## 八、注意事项

1. **子包分包**：`pages/my/` 和 `pages/server/` 是分包，manifest.json 已配置 `subPackages: true`
2. **服务类型映射**：首页"服务中心"6个图标（助洁→助洁服务/助行→助行服务/助医→助医服务/护理→助浴服务/助餐→助餐服务/紧急求助→助急服务），通过 `uni.setStorageSync('targetCategory', ...)` 传递到服务分类页面
3. **社区依赖**：部分高级功能（服务套餐、志愿服务、设备套餐）需要先登录且加入社区
4. **DEBUG 模式**：request.js 中 `DEBUG = true`，控制台输出详细请求/响应日志
5. **密码缓存**：退出登录时会保留缓存的用户名和密码，下次登录自动填充
6. **蓝牙配网**：通过 BLE 写入 WiFi SSID/密码到设备（`bluetooth-config.js` 中定义 UUID）
