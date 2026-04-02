# 评价弹窗组件化重构

## 概述
将订单评价弹窗从订单列表页面提取为独立的可复用组件，使其可以在订单列表页和订单详情页中共同使用。

## 文件变更

### 新增文件
- `components/review-modal/review-modal.vue` - 评价弹窗组件

### 修改文件
- `pages/order/index.vue` - 订单列表页，使用新的评价组件
- `pages/order/detail.vue` - 订单详情页，集成评价组件

## 组件功能

### ReviewModal 组件

#### Props
- `visible` (Boolean) - 控制弹窗显示/隐藏
- `mode` (String) - 模式：'edit' 编辑模式 / 'view' 查看模式
- `orderInfo` (Object) - 订单信息（服务名称、服务商、图标）
- `rating` (Number) - 评分（1-5星）
- `content` (String) - 评价内容
- `selectedTags` (Array) - 已选择的快捷评价标签
- `createTime` (String) - 评价时间（仅查看模式）
- `submitting` (Boolean) - 提交中状态

#### Events
- `close` - 关闭弹窗
- `update:rating` - 更新评分
- `update:content` - 更新评价内容
- `toggle-tag` - 切换标签选择
- `submit` - 提交评价

#### 特性
- 支持编辑和查看两种模式
- 星级评分（1-5星）
- 快捷评价标签
- 自定义评价内容（最多200字）
- 响应式设计，优雅的动画效果

## 使用示例

### 在订单列表页使用
```vue
<ReviewModal
  :visible="showReviewModal"
  :mode="reviewMode"
  :orderInfo="reviewData.orderInfo"
  :rating.sync="reviewData.rating"
  :content.sync="reviewData.content"
  :selectedTags="reviewData.selectedTags"
  :createTime="reviewData.createTime"
  :submitting="submittingReview"
  @close="closeReviewModal"
  @toggle-tag="handleToggleTag"
  @submit="submitReview"
/>
```

### 在订单详情页使用
```vue
<ReviewModal
  :visible="showReviewModal"
  :mode="reviewMode"
  :orderInfo="reviewData.orderInfo"
  :rating.sync="reviewData.rating"
  :content.sync="reviewData.content"
  :selectedTags="reviewData.selectedTags"
  :createTime="reviewData.createTime"
  :submitting="submittingReview"
  @close="closeReviewModal"
  @toggle-tag="handleToggleTag"
  @submit="submitReview"
/>
```

## 优势

1. **代码复用** - 避免在多个页面重复相同的评价弹窗代码
2. **统一体验** - 确保所有页面的评价功能保持一致的UI和交互
3. **易于维护** - 修改评价功能只需更新一个组件文件
4. **职责分离** - 组件专注于UI展示，业务逻辑由父组件处理
5. **灵活扩展** - 支持编辑和查看两种模式，可轻松添加新功能

## 注意事项

1. 使用 `.sync` 修饰符实现双向绑定（rating 和 content）
2. 标签选择通过 `toggle-tag` 事件处理，由父组件管理状态
3. 提交评价的业务逻辑在父组件中实现，组件只负责触发事件
4. 图标需要通过 `getServiceIcon` 工具函数处理后传入
