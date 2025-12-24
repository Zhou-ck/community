<template>
  <view class="content-setting-page">
    <!-- 顶部选项卡 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 0 }" 
        @click="switchTab(0)"
      >
        <text>背景图</text>
        <view class="active-line" v-if="currentTab === 0"></view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 1 }" 
        @click="switchTab(1)"
      >
        <text>卡片信息</text>
        <view class="active-line" v-if="currentTab === 1"></view>
      </view>
    </view>

    <!-- 背景图内容 -->
    <view class="tab-content" v-if="currentTab === 0" style="padding-bottom: 140rpx;">
      <view class="background-grid">
        <view 
          class="background-item" 
          v-for="(item, index) in backgroundList" 
          :key="index"
          :class="{ active: item.isCurrent }"
          @click="handleSetBackground(item)"
        >
          <image :src="getImageUrl(item.url)" mode="aspectFill" class="bg-image"></image>
          <view class="current-tag" v-if="item.isCurrent">当前使用</view>
          <view class="file-size">{{ item.size || '0 KB' }}</view>
        </view>
      </view>
      
      <view v-if="backgroundList.length === 0" class="empty-state">
        <image src="/static/empty.png" mode="aspectFit"></image>
        <text>暂无背景图</text>
      </view>

      <!-- 固定底部上传按钮 -->
      <view class="fixed-bottom-action">
        <view class="upload-btn" @click="handleUploadBackground">
          <uni-icons type="upload" size="18" color="#fff"></uni-icons>
          <text>上传背景图</text>
        </view>
      </view>
    </view>

    <!-- 卡片信息内容 -->
    <view class="tab-content" v-if="currentTab === 1">
      <view class="profile-container">
        <!-- 左侧照片 -->
        <view class="profile-photo-section">
          <view class="section-title">设备照片</view>
          <view class="photo-wrapper" @click="handleUploadProfilePhoto">
            <image 
              v-if="profileForm.photoUrl" 
              :src="getImageUrl(profileForm.photoUrl)" 
              mode="aspectFill" 
              class="profile-photo"
            ></image>
            <view v-else class="photo-placeholder">
              <uni-icons type="camera-filled" size="40" color="#ccc"></uni-icons>
              <text>点击上传</text>
            </view>
          </view>
        </view>

        <!-- 右侧表单 -->
        <view class="profile-form-section">
          <view class="form-item">
            <text class="label required">显示名称</text>
            <input 
              class="input" 
              v-model="profileForm.displayName" 
              placeholder="请输入" 
            />
          </view>

          <view class="form-item">
            <text class="label">年龄</text>
            <input 
              class="input" 
              type="number" 
              v-model="profileForm.age" 
              placeholder="请输入" 
            />
          </view>

          <view class="form-item">
            <text class="label">生日</text>
            <picker class="picker-wrapper" mode="date" :value="profileForm.birthday" @change="bindDateChange">
              <view class="picker-input" :class="{ placeholder: !profileForm.birthday }">
                <text>{{ profileForm.birthday || '请选择生日' }}</text>
                <uni-icons type="calendar" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>

          <view class="form-item align-top">
            <text class="label">喜好</text>
            <view class="tags-wrapper">
              <view class="tag" v-for="(tag, index) in profileForm.preferences" :key="index">
                <text>{{ tag }}</text>
                <view class="close-icon" @click="removeTag(index)">×</view>
              </view>
              <input 
                class="tag-input"
                v-model="newTagValue"
                placeholder="添加喜好"
                @confirm="confirmAddTag"
                @blur="confirmAddTag"
              />
            </view>
          </view>

          <view class="action-buttons">
            <button class="btn secondary" @click="handleCancel">取消</button>
            <button class="btn primary" @click="handleSubmitProfile">确认更新</button>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
import { listBackgrounds, uploadBackground, setCurrentBackground } from '@/api/background'
import { listProfiles, updateProfiles, addProfiles, uploadPhoto } from '@/api/profiles'
import { resetDeviceNetwork } from '@/api/device'
import config from '@/config'

export default {
  data() {
    return {
      baseUrl: config.baseUrl,
      currentTab: 0,
      deviceId: '',
      deviceKey: '',
      productKey: '',
      
      // 背景图数据
      backgroundList: [],
      
      // 卡片信息数据
      profileId: null, // 用于记录是否存在已有资料
      newTagValue: '', // 新标签输入值
      profileForm: {
        photoUrl: '',
        displayName: '',
        age: '',
        birthday: '',
        preferences: [] // 喜好数组
      }
    }
  },
  onLoad(options) {
    if (options.deviceId) {
      this.deviceId = options.deviceId
      this.deviceKey = options.deviceKey
      this.productKey = options.productKey
      
      this.loadBackgrounds()
      this.loadProfileData()
    } else {
      uni.showToast({
        title: '缺少设备参数',
        icon: 'none'
      })
    }
  },
  onPullDownRefresh() {
    if (this.currentTab === 0) {
      this.loadBackgrounds().finally(() => {
        uni.stopPullDownRefresh()
      })
    } else {
      this.loadProfileData().finally(() => {
        uni.stopPullDownRefresh()
      })
    }
  },

  methods: {
    // 切换标签页
    switchTab(index) {
      this.currentTab = index
    },

    // 处理图片URL
    getImageUrl(url) {
      if (!url) return ''
      // 如果是Base64图片（/9j/ 开头通常是 JPEG 的 Base64）或者已经是 http 开头，或者是 data:image 开头，则不加前缀
      if (url.startsWith('http') || url.startsWith('data:image') || url.startsWith('/9j/')) {
        // 如果是纯 Base64 字符串（如 /9j/...），需要加上 data:image/jpeg;base64, 前缀才能正常显示
        if (url.startsWith('/9j/')) {
          return 'data:image/jpeg;base64,' + url
        }
        return url
      }
      return this.baseUrl + url
    },

    // --- 背景图相关方法 ---

    // 加载背景图列表
    async loadBackgrounds() {
      try {
        const res = await listBackgrounds({
          deviceId: this.deviceId,
          productKey: this.productKey,
          deviceKey: this.deviceKey
        })
        if (res.code === 200) {
          // 假设后端返回的数据结构，需要根据实际接口调整
          // 模拟图片大小显示，实际需根据后端字段
          this.backgroundList = (res.rows || res.data || []).map(item => ({
            ...item,
            // 兼容 imageData 字段，如果有 imageData 则优先使用
            url: item.imageData ? `data:${item.imageMime || 'image/png'};base64,${item.imageData}` : item.url || item.imgUrl,
            // 假设 item.active 或 item.isCurrent 标识当前选中
            isCurrent: item.isCurrent,
            size: item.fileSize ? (item.fileSize / 1024).toFixed(1) + ' KB' : '0 KB'
            // 如果后端没有返回标识，可能需要另外逻辑判断
          }))
        }
      } catch (e) {
        console.error('获取背景图列表失败', e)
      }
    },

    // 上传背景图
    handleUploadBackground() {
      uni.chooseImage({
        count: 1,
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths
          uni.showLoading({ title: '上传中...' })
          
          uni.uploadFile({
            url: this.baseUrl + '/api/backgrounds/upload',
            filePath: tempFilePaths[0],
            name: 'image',
            header: {
              'Authorization': 'Bearer ' + uni.getStorageSync('App-Token')
            },
            formData: {
              deviceId: this.deviceId,
              productKey: this.productKey,
              deviceKey: this.deviceKey
            },
            success: (uploadFileRes) => {
              uni.hideLoading()
              const data = JSON.parse(uploadFileRes.data)
              if (data.code === 200) {
                uni.showToast({ title: '上传成功', icon: 'success' })
                this.loadBackgrounds()
              } else {
                uni.showToast({ title: data.msg || '上传失败', icon: 'none' })
              }
            },
            fail: () => {
              uni.hideLoading()
              uni.showToast({ title: '上传失败', icon: 'none' })
            }
          })
        }
      })
    },

    // 设置当前背景图
    async handleSetBackground(item) {
      try {
        uni.showLoading({ title: '设置中...' })
        const res = await setCurrentBackground({
          devBgId: item.devBgId,
          deviceId: this.deviceId,
          productKey: this.productKey,
          deviceKey: this.deviceKey
        })
        
        if (res.code === 200) {
          // 调用 invoke/service 接口通知设备背景已更改
          await resetDeviceNetwork({
            ack: 1,
            address: null,
            deviceKey: this.deviceKey,
            function: 'bgChanged',
            productKey: this.productKey,
            propertyValue: { bgChanged: 1 },
            type: null
          })
          
          uni.showToast({ title: '设置成功', icon: 'success' })
          // 更新本地状态
          this.backgroundList.forEach(bg => {
            bg.isCurrent = (bg.devBgId === item.devBgId)
          })
          // 重新加载列表
          this.loadBackgrounds()
        } else {
          uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
        }
      } catch (e) {
        console.error('设置背景图失败', e)
        uni.hideLoading()
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // --- 卡片信息相关方法 ---

    // 加载卡片资料
    async loadProfileData() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await listProfiles({
          deviceId: this.deviceId,
          productKey: this.productKey,
          deviceKey: this.deviceKey
        })
        
        if (res.code === 200) {
          const list = res.rows || res.data || []
          if (list.length > 0) {
            const profile = list[0]
            this.profileId = profile.profilesId || profile.id // 或 profileId，视接口返回而定
            this.profileForm = {
              photoUrl: profile.photoUrl || profile.photo || '',
              displayName: profile.displayName || profile.name || '',
              age: profile.age || '',
              birthday: profile.birthdate || profile.birthday || '', // 兼容 birthdate 字段
              // 兼容 likes 和 preferences 字段
              preferences: this.parsePreferences(profile.likes || profile.preferences)
            }
          } else {
            // 无数据，重置表单
            this.profileId = null
            this.profileForm = {
              photoUrl: '',
              displayName: '',
              age: '',
              birthday: '',
              preferences: []
            }
          }
        }
      } catch (e) {
        console.error('加载卡片资料失败', e)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 解析喜好字段
    parsePreferences(pref) {
      if (!pref) return []
      if (Array.isArray(pref)) return pref
      try {
        // 尝试 JSON 解析
        return JSON.parse(pref)
      } catch (e) {
        // 尝试按逗号分隔
        return pref.split(/[,，]/).filter(s => s.trim())
      }
    },

    // 上传设备照片
    handleUploadProfilePhoto() {
      uni.chooseImage({
        count: 1,
        success: (chooseImageRes) => {
          const tempFilePaths = chooseImageRes.tempFilePaths
          uni.showLoading({ title: '上传中...' })
          
          uni.uploadFile({
            url: this.baseUrl + '/devices/profiles/photo',
            filePath: tempFilePaths[0],
            name: 'photo',
            header: {
              'Authorization': 'Bearer ' + uni.getStorageSync('App-Token')
            },
            formData: {
              deviceId: this.deviceId,
              productKey: this.productKey,
              device: this.deviceKey
            },
            success: (uploadFileRes) => {
              uni.hideLoading()
              try {
                const data = JSON.parse(uploadFileRes.data)
                if (data.code === 200) {
                  // 假设返回的是图片路径
                  this.profileForm.photoUrl = data.url || data.fileName || data.data
                  uni.showToast({ title: '上传成功', icon: 'success' })
                } else {
                  uni.showToast({ title: data.msg || '上传失败', icon: 'none' })
                }
              } catch (e) {
                console.error(e)
                uni.showToast({ title: '解析响应失败', icon: 'none' })
              }
            },
            fail: () => {
              uni.hideLoading()
              uni.showToast({ title: '上传失败', icon: 'none' })
            }
          })
        }
      })
    },

    // 生日选择
    bindDateChange(e) {
      this.profileForm.birthday = e.target.value
    },

    // 移除喜好标签
    removeTag(index) {
      this.profileForm.preferences.splice(index, 1)
    },

    // 确认添加标签
    confirmAddTag() {
      const value = this.newTagValue.trim()
      if (!value) return
      
      if (this.profileForm.preferences.includes(value)) {
        uni.showToast({ title: '该喜好已存在', icon: 'none' })
        this.newTagValue = ''
        return
      }
      this.profileForm.preferences.push(value)
      this.newTagValue = ''
    },

    // 取消编辑
    handleCancel() {
      uni.navigateBack()
    },

    // 提交更新
    async handleSubmitProfile() {
      if (!this.profileForm.displayName) {
        uni.showToast({ title: '请输入显示名称', icon: 'none' })
        return
      }

      const data = {
        deviceId: this.deviceId,
        productKey: this.productKey,
        deviceKey: this.deviceKey,
        displayName: this.profileForm.displayName,
        age: this.profileForm.age,
        birthdate: this.profileForm.birthday, // 后端使用 birthdate 字段
        photo: this.profileForm.photoUrl,
        // 将数组转换为字符串存储，后端使用 likes 字段
        likes: JSON.stringify(this.profileForm.preferences)
      }

      try {
        uni.showLoading({ title: '保存中...' })
        let res
        if (this.profileId) {
          // 更新
          data.profilesId = this.profileId
          res = await updateProfiles(data)
        } else {
          // 新增
          res = await addProfiles(data)
        }

        if (res.code === 200) {
          uni.showToast({ title: '保存成功', icon: 'success' })
          this.loadProfileData() // 重新加载以获取最新状态（如ID）
        } else {
          uni.showToast({ title: res.msg || '保存失败', icon: 'none' })
        }
      } catch (e) {
        console.error('保存失败', e)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.content-setting-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding-bottom: 40rpx;
}

/* Tabs Styles */
.tabs {
  display: flex;
  justify-content: space-around; /* 均匀分布 */
  background-color: #fff;
  padding: 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20rpx;
  
  .tab-item {
    flex: 1; /* 均分宽度 */
    padding: 30rpx 0; /* 调整内边距 */
    font-size: 32rpx; /* 增大字体 */
    color: #666;
    position: relative;
    text-align: center; /* 居中对齐 */
    
    &.active {
      color: #3ec6c6; 
      font-weight: 600; /* 加粗 */
    }
    
    .active-line {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx; /* 增加线条宽度 */
      height: 6rpx; /* 增加线条高度 */
      background-color: #3ec6c6;
      border-radius: 3rpx;
    }
  }
}

.tab-content {
  padding: 20rpx;
}

/* Background Tab Styles */
.fixed-bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 40rpx calc(20rpx + constant(safe-area-inset-bottom));
  padding: 20rpx 40rpx calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  z-index: 99;
  display: flex;
  justify-content: center;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: #3ec6c6; /* 使用主题色 */
  color: #fff;
  padding: 24rpx 100rpx; /* 增加宽度 */
  border-radius: 44rpx; /* 圆角更大 */
  font-size: 32rpx;
  box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.4);
  transition: all 0.3s;
  width: 80%; /* 占据大部分宽度 */
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 6rpx rgba(62, 198, 198, 0.4);
  }
  
  uni-icons {
    margin-right: 12rpx;
  }
}

.background-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 10rpx;
  
  .background-item {
    width: 48%;
    height: 0;
    padding-bottom: 48%;
    margin-bottom: 24rpx;
    position: relative;
    background: #fff;
    border-radius: 16rpx;
    overflow: hidden;
    border: 4rpx solid transparent;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);
    transition: all 0.3s;
    
    &.active {
      border-color: #3ec6c6; /* 主题色边框 */
      box-shadow: 0 0 0 2rpx rgba(62, 198, 198, 0.2);
    }
    
    .bg-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
    }
    
    .current-tag {
      position: absolute;
      top: 0;
      right: 0;
      background: linear-gradient(135deg, #3ec6c6, #2da8a8);
      color: #fff;
      font-size: 20rpx;
      padding: 4rpx 12rpx;
      border-bottom-left-radius: 16rpx;
      z-index: 1;
    }
    
    .file-size {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0,0,0,0.5);
      color: #fff;
      font-size: 20rpx;
      padding: 4rpx 0;
      text-align: center;
      backdrop-filter: blur(2px);
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
  
  image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
    opacity: 0.5;
  }
}

/* Profile Tab Styles */
.profile-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx 60rpx;
  margin: 20rpx;
  box-shadow: 0 2rpx 20rpx rgba(0,0,0,0.06);
}

.profile-photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
  
  .section-title {
    display: none;
  }
  
  .photo-wrapper {
    width: 160rpx;
    height: 160rpx;
    border: 6rpx solid #f8f9fa;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    cursor: pointer;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    position: relative;
    box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 12rpx 32rpx rgba(0,0,0,0.12);
    }
    
    .profile-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .photo-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #adb5bd;
      
      text {
        font-size: 20rpx;
        margin-top: 6rpx;
        font-weight: 500;
      }
    }
  }
}

.profile-form-section {
  padding: 0 20rpx;
}

.form-item {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  
  &.align-top {
    align-items: flex-start;
    
    .label {
      margin-top: 18rpx;
    }
  }
  
  .label {
    width: 130rpx;
    font-size: 28rpx;
    color: #495057;
    font-weight: 600;
    text-align: right;
    margin-right: 24rpx;
    margin-bottom: 0;
    line-height: 1.2;
    
    &.required::before {
      content: '* ';
      color: #dc3545;
      font-weight: bold;
    }
    &.required::after {
      content: '';
    }
  }
  
  .input {
    flex: 1;
    height: 76rpx;
    background-color: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #212529;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #007bff;
      background-color: #fff;
      box-shadow: 0 0 0 6rpx rgba(0, 123, 255, 0.1);
    }
  }
  
  .picker-wrapper {
    flex: 1;
  }
  
  .picker-input {
    width: 100%;
    height: 76rpx;
    background-color: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 28rpx;
    color: #212529;
    transition: all 0.3s ease;
    box-sizing: border-box;
    
    &:active {
      background-color: #fff;
      border-color: #007bff;
    }
    
    &.placeholder text {
      color: #6c757d;
    }
  }
}

.tags-wrapper {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16rpx;
    min-height: 76rpx;
    background-color: #f8f9fa;
    border: 2rpx solid #e9ecef;
    border-radius: 12rpx;
    padding: 12rpx 16rpx;
    transition: all 0.3s ease;
    
    &:focus-within {
      background-color: #fff;
      border-color: #007bff;
      box-shadow: 0 0 0 6rpx rgba(0, 123, 255, 0.1);
    }
    
    .tag {
      background: #e7f5ff;
      color: #007bff;
      padding: 6rpx 20rpx;
      border-radius: 30rpx;
      font-size: 26rpx;
      font-weight: 500;
      display: flex;
      align-items: center;
      border: 1px solid rgba(0, 123, 255, 0.1);
      
      .close-icon {
        margin-left: 10rpx;
        color: #007bff;
        font-size: 28rpx;
        line-height: 1;
        width: 28rpx;
        height: 28rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        transition: all 0.2s;
        
        &:hover {
          opacity: 1;
          color: #d32f2f;
        }
      }
    }
    
    .tag-input {
      flex: 1;
      min-width: 120rpx;
      height: 60rpx;
      border: none;
      background: transparent;
      font-size: 28rpx;
      color: #495057;
      padding: 0 10rpx;
      
      &:focus {
        outline: none;
      }
    }
  }

.action-buttons {
  margin-top: 60rpx;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 24rpx;
  padding: 0 20rpx;
  
  .btn {
    flex: 1;
    margin: 0;
    height: 88rpx;
    line-height: 88rpx;
    border-radius: 12rpx;
    font-size: 32rpx;
    font-weight: 500;
    padding: 0;
    transition: all 0.3s ease;
    
    &.primary {
      background: #3ec6c6;
      color: #fff;
      border: none;
      
      &:active {
        opacity: 0.8;
      }
    }
    
    &.secondary {
      background: #f5f5f5;
      color: #666;
      border: none;
      
      &:active {
        background: #e8e8e8;
      }
    }
    
    &::after {
      border: none;
    }
  }
}
</style>
