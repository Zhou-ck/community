# WeChat Mini Program 包体积优化（uni-app）

诊断并解决 uni-app 构建的微信小程序上传时包体积超限问题。包括主包 > 1.5MB、分包 > 2MB、图片/音频资源 > 200KB 等常见违规。

## 触发场景

用户在以下场景应使用此技能：
- 用户说"上传失败""包太大""超限""vendor.js 太大""代码包超过限制"
- 微信开发者工具的"代码质量"面板显示未通过
- 用户需要打包上传但被阻止
- 用户提到主包/分包体积优化、拆分包、压缩代码

## 工作流程

### 第一步：了解项目结构与当前问题

先读以下文件了解全貌：
- `pages.json` — 主包页面、分包结构
- `manifest.json` — mp-weixin 配置（压缩设置、分包优化）
- 查看 `unpackage/dist/dev/mp-weixin/` 编译输出（如果有），计算各分包实际大小

向用户确认：
- 项目类型：uni-app / 原生小程序
- 当前错误信息（截图或文字）
- 是否有图片、图表、第三方组件库（如 uView、echarts、uCharts）

### 第二步：零成本优化（不改逻辑，只需改配置）

在 `manifest.json` 的 `mp-weixin` 节点中确认以下设置：

```json
{
  "mp-weixin": {
    "setting": {
      "minified": true,
      "es6": false,
      "postcss": true,
      "lazyCodeLoading": "requiredComponents"
    },
    "optimization": {
      "subPackages": true
    }
  }
}
```

`optimization.subPackages: true` 防止子包的组件/JS 被打包到主包的 vendor.js 中。

在微信开发者工具 → 详情 → 本地设置，确保开启了：
- [x] 上传时自动压缩 JS
- [x] 上传时自动压缩 WXML
- [x] 上传时自动压缩 WXSS

### 第三步：分析主包体积

查看 `pages.json` 的 `pages` 数组，区分哪些是 tabBar 页面（必须留主包）、哪些可以移到分包。

**原则**：
- tabBar 页面（底部导航）必须留在主包
- 登录、注册、忘记密码、通用协议页等非核心页面可以移出
- 主包页面越少，vendor.js 体积越小

如果主包超限，方案是**新建一个分包**，将非 tabBar 页面移进去。需要注意：
- 搜索项目中所有对该页面的路径引用（`navigateTo`、`redirectTo`、`reLaunch`、`switchTab` 等）
- 更新 `permission.js` 白名单（如果有）
- 物理移动文件并更新 pages.json

### 第四步：分析分包体积

检查 `subPackages` 中每个分包的编译后大小。找出最大贡献者：

1. **删除备份/未使用文件**：搜索目录中是否有 `- 副本`、`- Copy`、`- bak` 等后缀的冗余文件
2. **删除未引用组件**：检查组件目录，找哪些组件没有被任何页面 import
3. **压缩图片**：UI 图标用 PIL/Pillow 做量化压缩（256 色足够），大图移到 CDN 改为 URL 引用
4. **检查重复样式**：当多个组件通过 `@import` 导入同一个 SCSS 文件时，每个组件会生成独立的 WXSS 文件。可以通过共享样式（父组件 + styleIsolation: 'shared'）减少重复

### 第五步：合并样式减少重复（高风险操作）

当多个组件共享同一份样式文件（如 `formStyles.scss` 被 25 个表单组件导入），每个组件会重复生成该样式的 WXSS 文件。

**正确做法**：
1. 备份原目录
2. 在每个子组件中添加 `options: { styleIsolation: "shared" }`
3. 移除子组件中重复的 `<style scoped>`（如果有自定义样式则保留，只移除 import 行）
4. 在父组件中添加非 scoped `<style>` 块，包含完整的共享样式
5. 如果子组件完全没有 `<style>` 块，编译器可能不会生成 `.wxss` 文件，导致编译报错 `ENOENT: no such file or directory`

**关键教训**：每个组件必须至少有一个 `<style>` 标签（即使是空的）以确保 WXSS 文件被生成。如果移除了原有的 `<style>` 块，至少要加一个带占位规则的 `<style>.dummy{display:none}</style>`。

### 第六步：移动页面到新分包（结构性变更）

如果主包仍然超限，需要将非 tabBar 页面移到新建的分包。

**操作步骤**：
1. 在 pages.json 中新建 `subPackages` 条目（如 `subpackages/common`）
2. 将要移出的页面从 `pages` 数组移到新分包的 `pages` 数组中
3. 物理移动对应 .vue 文件到新分包根目录
4. 搜索项目中所有对旧路径的引用，替换为新路径

**路径引用搜索**：用 grep 搜索所有 .vue/.js 文件中包含旧路径的引用：
```javascript
uni.navigateTo({ url: '/pages/xxx' })
uni.redirectTo({ url: '/pages/xxx' })
uni.reLaunch({ url: '/pages/xxx' })
this.$tab.navigateTo('/pages/xxx')
```

以及 `permission.js` 中的白名单路径。

### 第七步：构建验证

修改后让用户重新编译：
- 通过 HBuilderX 重新运行到微信开发者工具
- 或通过微信开发者工具重新编译

检查"代码质量"面板的三个指标是否通过：
- 主包大小 < 1.5M
- 各分包大小 < 2M
- 图片/音频资源 < 200K

## 常见陷阱

### 陷阱 1：删除 `<style>` 块导致编译报错

在 uni-app 的 mp-weixin 构建中，每个 Vue 组件的 `<style>` 块会生成对应的 `.wxss` 文件。如果删除了 `<style>` 块，构建可能不会生成 `.wxss` 文件，导致：
```
[WXSS 文件编译错误]
ENOENT: no such file or directory, open '.../xxx.wxss'
```

**解决**：保留一个空 `<style>` 标签或带占位规则的 `<style>.dummy{display:none}</style>`。

### 陷阱 2：styleIsolation 在 WeChat 组件中的行为

`styleIsolation: 'shared'` 只影响组件是否能接受外部样式的透传，不会影响组件自身样式的生成。父组件的非 scoped 样式可以传入子组件，但父组件的 scoped 样式不会。

### 陷阱 3：缓存导致修改不生效

微信开发者工具会缓存编译产物。如果修改了源码但效果未反映：
1. 关闭微信开发者工具
2. 删除 `unpackage/dist/dev/mp-weixin/` 目录
3. 重新编译
4. 如果目录被进程锁定，检查任务管理器中的 `WechatDevTools` 或 `HBuilderX` 进程

### 陷阱 4：分包路径不能与主包重叠

在 uni-app 中，subPackages 的 root 不能与 pages 数组中的路径前缀重叠。如果主包已有 `pages/` 下的页面，分包 root 不能是 `pages/xxx` 作为空 root。

## 备份原则

任何结构性改动前必须备份：
```python
import shutil, pathlib
shutil.copytree(src_path, backup_path)
```

确保用户可以一键恢复。

## 文件命名约定

项目中可能存在的冗余文件模式：
- `xxx - 副本.vue`（Windows 复制产生的备份）
- `xxx-bak.vue`，`xxx_backup.vue`
- 未被任何页面 import 的组件（在 `pages/` 目录内但无页面引用）

## 相关限制参考

| 指标 | 限制 | 说明 |
|------|------|------|
| 主包（不含插件） | < 1.5MB | 检查警告线，硬限制约 2MB |
| 单个分包 | < 2MB | 硬限制，超过直接报错 |
| 总代码包 | < 20MB | 所有主包+分包合计 |
| 单张图片/音频 | < 200KB | 建议值，超过会被标记 |

## 工具链

- 图片压缩：Python Pillow (PIL)，量化到 256 色对 UI 图标视觉影响很小
- 文件搜索：grep / Python pathlib
- 批量修改：Python 脚本处理多文件替换

## 输出

向用户清晰报告：
1. 哪里超限了（主包/分包/图片）
2. 已做了什么改动（删除、压缩、合并等）
3. 预期节省多少体积（列出明细）
4. 备份位置（方便回滚）
5. 下一步建议
