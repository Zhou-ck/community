# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 UniApp 框架开发的"社区六助"智慧养老移动应用，名为"安特社区六助"（长者乐）。项目支持多端部署（APP、小程序、H5），为老年人提供社区服务。

## 关键架构信息

### 技术栈
- **框架**: UniApp (Vue 2)
- **UI组件库**: uView UI 2.0.38
- **状态管理**: Vuex
- **样式**: SCSS
- **小程序平台**: 微信小程序 (appid: wxd23bf25b9e1a1620)
- **H5开发端口**: 9090

### 项目结构
```
community/
├── api/                    # API接口定义
│   ├── login.js           # 登录相关API
│   ├── service.js         # 服务相关API
│   └── system/            # 系统相关API
├── pages/                  # 主要页面
│   ├── index.vue          # 首页
│   ├── login.vue          # 登录页
│   ├── work/              # 服务分类
│   ├── order/             # 订单管理
│   └── mine/              # 个人中心
├── pages/my/              # 个人中心子页面（分包）
├── pages/server/          # 服务相关页面（分包）
├── components/            # 公共组件
├── store/                 # Vuex状态管理
│   └── modules/user.js    # 用户状态模块
├── utils/                 # 工具函数
│   ├── request.js         # 网络请求封装
│   ├── auth.js            # 认证相关
│   └── storage.js         # 本地存储
├── static/                # 静态资源
└── uni_modules/           # UniApp模块
```

### 核心功能模块
1. **用户系统**: 登录、注册、个人信息管理
2. **服务系统**: 服务分类、预约、详情查看
3. **订单系统**: 订单管理和查看
4. **社区功能**: 加入社区、服务地址管理
5. **健康管理**: 健康档案、家庭成员管理

## 开发配置

### 环境配置
- **生产环境API地址**: `https://www.community.katlot.cn`
- **开发环境配置**: 在 `config.js` 中可切换不同的API地址
- **应用信息**: 配置在 `config.js` 的 `appInfo` 中

### 权限系统
- 实现了基于token的认证拦截
- 路由权限控制：`permission.js` 文件包含页面跳转验证逻辑
- 白名单页面：`/pages/login`, `/pages/register`, `/pages/forget`, `/pages/common/webview/index`

### API配置
- 所有API请求通过 `utils/request.js` 统一处理
- 认证token存储在本地，通过 `utils/auth.js` 管理
- API模块化组织，按功能区分文件

## 开发命令

由于这是UniApp项目，通常使用HBuilderX进行开发，也可以使用CLI：

```bash
# 安装依赖
npm install

# 开发模式（H5）
npm run dev:h5

# 构建生产版本
npm run build:h5

# 小程序开发
npm run dev:mp-weixin

# APP开发需要使用HBuilderX
```

## 重要配置文件

- **`manifest.json`**: UniApp应用配置，包含平台特定设置
- **`pages.json`**: 页面路由和tabBar配置
- **`config.js`**: 应用全局配置和API地址
- **`permission.js`**: 权限控制逻辑
- **`uni.scss`**: 全局样式变量

## 注意事项

1. **多端兼容**: 代码需要考虑APP、小程序、H5的兼容性
2. **分包加载**: pages/my 和 pages/server 使用分包机制
3. **UI组件**: 主要使用uView UI组件库，easycom已配置
4. **权限管理**: 所有页面访问都经过权限验证
5. **网络请求**: 统一使用request.js封装，包含错误处理

## 业务逻辑

### 服务流程
1. 用户登录后可选择服务分类
2. 查看服务详情并预约
3. 在订单页面查看预约状态
4. 管理个人信息和服务地址

### 社区集成
应用与社区系统集成，支持：
- 加入社区管理
- 服务地址设置
- 家庭成员管理
- 健康档案记录