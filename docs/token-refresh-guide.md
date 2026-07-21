# Token 自动续期机制

## 功能说明

本机制通过在 token 即将过期时自动刷新，延长用户的登录状态，避免频繁重新登录。

## 工作原理

1. **时间戳记录**：登录成功后记录 token 的获取时间
2. **定期检查**：每 30 分钟检查一次 token 是否需要刷新
3. **提前刷新**：在 token 过期前 5 分钟自动尝试刷新
4. **无缝续期**：刷新成功后自动重试失败的请求

## 配置选项

### 前端配置

在 `utils/token-refresh.js` 中可以调整：

```javascript
// Token 刷新间隔（毫秒）- 默认每30分钟刷新一次
const REFRESH_INTERVAL = 30 * 60 * 1000

// Token 过期前多久开始刷新（毫秒）- 默认提前5分钟
const REFRESH_BEFORE_EXPIRE = 5 * 60 * 1000
```

### 后端配置（重要）

**Token 的有效期由后端控制**，需要在后端项目中配置：

#### Spring Boot + JWT 配置

在 `application.yml` 或 `application.properties` 中：

```yaml
# application.yml
token:
  # Token 有效期（秒）- 默认7天
  expireTime: 604800
  # 或者使用更长的有效期
  # expireTime: 2592000  # 30天
```

```properties
# application.properties
token.expireTime=604800
```

#### 若依框架配置

在 `ruoyi-admin/src/main/resources/application.yml` 中：

```yaml
# Token 配置
token:
  # 令牌自定义标识
  header: Authorization
  # 令牌密钥
  secret: abcdefghijklmnopqrstuvwxyz
  # 令牌有效期（默认30分钟）
  expireTime: 30
```

**建议将 `expireTime` 设置为更长的时间，例如：**
- `1440` = 1天
- `10080` = 7天
- `43200` = 30天

## 后端刷新接口

如果后端支持 token 刷新，需要提供 `/refreshToken` 接口：

```java
/**
 * 刷新 Token
 */
@PostMapping("/refreshToken")
public AjaxResult refreshToken(HttpServletRequest request) {
    // 从请求头获取当前 token
    String token = getToken(request);
    
    // 验证 token 并生成新 token
    String newToken = tokenService.refreshToken(token);
    
    return AjaxResult.success().put("token", newToken);
}
```

## 前端使用

### 自动刷新（已集成）

App.vue 中已自动启动 token 刷新机制，无需额外操作。

### 手动刷新

```javascript
import { refreshToken } from '@/utils/token-refresh'

// 手动刷新 token
refreshToken().then(success => {
  if (success) {
    console.log('刷新成功')
  }
})
```

## 调试信息

开启调试模式后，控制台会输出：
- `[Token刷新] 自动刷新已启动`
- `[Token刷新] 刷新成功` / `[Token刷新] 已续期`
- `[Token刷新] 刷新失败`

## 注意事项

1. **后端必须支持**：如果后端没有 `/refreshToken` 接口，前端只能更新时间戳，无法真正刷新 token
2. **网络问题**：刷新失败不会导致退出登录，会在下次请求时重试
3. **兼容性**：如果后端不支持刷新，会保持原有逻辑（401 时跳转登录页）

## 推荐配置

| 场景 | 后端 Token 有效期 | 前端刷新间隔 | 提前刷新时间 |
|------|-------------------|--------------|--------------|
| 开发测试 | 30分钟 | 10分钟 | 5分钟 |
| 生产环境（短） | 1天 | 2小时 | 30分钟 |
| 生产环境（长） | 7天 | 12小时 | 2小时 |
| 长期登录 | 30天 | 24小时 | 4小时 |
