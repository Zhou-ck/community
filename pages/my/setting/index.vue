<template>
  <view class="page-container">
    <!-- 内容区域 -->
    <view class="content-section">
      <!-- 设置卡片列表 -->
      <view class="setting-cards">
        <!-- 修改密码 -->
        <view class="setting-card clickable-card" @click="handleToPwd">
          <view class="card-icon password-icon">
            <uni-icons type="locked-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">账户安全</text>
            <text class="card-value">修改密码</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
          </view>
        </view>

        <!-- 检查更新 -->
        <view class="setting-card clickable-card" @click="handleToUpgrade">
          <view class="card-icon update-icon">
            <uni-icons type="refresh-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">应用管理</text>
            <text class="card-value">检查更新</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
          </view>
        </view>

        <!-- 清理缓存 -->
        <view class="setting-card clickable-card" @click="handleCleanTmp">
          <view class="card-icon clean-icon">
            <uni-icons type="trash-filled" size="24" color="#fff"></uni-icons>
          </view>
          <view class="card-content">
            <text class="card-label">存储管理</text>
            <text class="card-value">清理缓存</text>
          </view>
          <view class="card-arrow">
            <uni-icons type="arrowright" size="16" color="#ccc"></uni-icons>
          </view>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <view class="logout-card" @click="handleLogout">
          <view class="logout-content">
            <text class="logout-text">退出登录</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
  export default {
    data() {
      return {}
    },
    methods: {
      handleToPwd() {
        this.$tab.navigateTo('/pages/my/pwd/index')
      },
      handleToUpgrade() {
        this.$modal.showToast('模块建设中~')
      },
      handleCleanTmp() {
        this.$modal.confirm('确定要清理缓存吗？\n将保留登录信息，清理其他临时数据').then(() => {
          this.cleanCache()
        })
      },
      
      // 清理缓存方法
      cleanCache() {
        this.$modal.loading('正在清理缓存...')
        
        try {
          // 需要保留的重要缓存键名
          const preserveKeys = [
            'App-Token',           // 用户token
            'user_password_cache',    // 用户密码缓存
            'user_username',         // 用户名缓存
            'user_info',              // 用户信息
            'storage_data',           // 存储数据
          ]
          
          // 获取所有存储的数据
          const storageInfo = uni.getStorageInfoSync()
          const allKeys = storageInfo.keys || []
          
          // 备份需要保留的数据
          const preserveData = {}
          preserveKeys.forEach(key => {
            try {
              const value = uni.getStorageSync(key)
              if (value) {
                preserveData[key] = value
              }
            } catch (e) {
              console.log(`备份缓存 ${key} 失败:`, e)
            }
          })
          
          // 清理所有缓存
          uni.clearStorageSync()
          
          // 恢复重要数据
          Object.keys(preserveData).forEach(key => {
            try {
              uni.setStorageSync(key, preserveData[key])
            } catch (e) {
              console.log(`恢复缓存 ${key} 失败:`, e)
            }
          })
          
          // 计算清理的缓存数量
          const cleanedCount = allKeys.length - Object.keys(preserveData).length
          
          this.$modal.closeLoading()
          this.$modal.msgSuccess(`缓存清理完成！\n清理了 ${cleanedCount} 项临时数据`)
          
        } catch (error) {
          this.$modal.closeLoading()
          console.error('清理缓存失败:', error)
          this.$modal.msgError('缓存清理失败，请稍后重试')
        }
      },
      handleLogout() {
        this.$modal.confirm('确定注销并退出系统吗？').then(() => {
          this.$store.dispatch('LogOut').then(() => {}).finally(()=>{
            this.$tab.reLaunch('/pages/index')
          })
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
page {
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
}

/* 内容区域 */
.content-section {
  padding: 30rpx;
}

/* 设置卡片 */
.setting-cards {
  margin-bottom: 40rpx;
}

.setting-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
}

.clickable-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.clickable-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.card-value {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
}

.card-arrow {
  margin-left: auto;
  padding-left: 20rpx;
}

/* 退出登录区域 */
.logout-section {
  margin-top: 100rpx;
}

.logout-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  cursor: pointer;
}

.logout-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.12);
}

.logout-content {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logout-text {
  font-size: 36rpx;
  color: #ff4757;
  font-weight: 500;
 
}

/* 图标主题色 */
.password-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
}

.update-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.clean-icon {
  background: linear-gradient(135deg, #A8E6CF 0%, #88D8A3 100%);
}
</style>
