<template>
  <view class="detail-page">
    <!-- 顶部大图 -->
    <view class="header-image-box">
      <image :src="activity.image" mode="aspectFill" class="header-image"></image>
      <view class="status-tag" :class="activity.status === 1 ? 'status-active' : 'status-end'">
        {{ getStatusText(activity.status) }}
      </view>
    </view>

    <!-- 内容区域 -->
    <view class="content-wrapper">
      <!-- 活动标题 -->
      <view class="title-section">
        <text class="title">{{ activity.title }}</text>
      </view>

      <!-- 活动信息卡片 -->
      <view class="info-card">
        <view class="info-item">
          <view class="info-icon-box">
            <uni-icons type="calendar" size="20" color="#E07A4F"></uni-icons>
          </view>
          <view class="info-content">
            <text class="info-label">活动时间</text>
            <text class="info-value">{{ activity.time }}</text>
          </view>
        </view>

        <view class="info-item">
          <view class="info-icon-box">
            <uni-icons type="location" size="20" color="#E07A4F"></uni-icons>
          </view>
          <view class="info-content">
            <text class="info-label">活动地点</text>
            <text class="info-value">{{ activity.address }}</text>
          </view>
        </view>

        <view class="info-item">
          <view class="info-icon-box">
            <uni-icons type="person" size="20" color="#E07A4F"></uni-icons>
          </view>
          <view class="info-content">
            <text class="info-label">招募人数</text>
            <text class="info-value">{{ activity.joined }}/{{ activity.total }}人</text>
          </view>
        </view>
      </view>

      <!-- 活动详情 -->
      <view class="section-card">
        <view class="section-title">
          <view class="title-line"></view>
          <text>活动详情</text>
        </view>
        <view class="section-content">
          <text class="description-text">{{ activity.description }}</text>
        </view>
      </view>

      <!-- 活动要求 -->
      <view class="section-card">
        <view class="section-title">
          <view class="title-line"></view>
          <text>活动要求</text>
        </view>
        <view class="section-content">
          <view class="requirement-item" v-for="(req, index) in activity.requirements" :key="index">
            <view class="requirement-dot"></view>
            <text class="requirement-text">{{ req }}</text>
          </view>
        </view>
      </view>

      <!-- 组织方信息 -->
      <view class="organizer-card">
        <view class="section-title">
          <view class="title-line"></view>
          <text>组织方信息</text>
        </view>
        <view class="organizer-info">
          <view class="organizer-item">
            <text class="organizer-label">组织单位：</text>
            <text class="organizer-value">{{ activity.organizer }}</text>
          </view>
          <view class="organizer-item">
            <text class="organizer-label">联系电话：</text>
            <text class="organizer-value phone" @click="makeCall">{{ activity.phone }}</text>
          </view>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="collect-btn" @click="toggleCollect">
        <uni-icons :type="isCollected ? 'heart-filled' : 'heart'" size="24" :color="isCollected ? '#ff6b6b' : '#666'"></uni-icons>
        <text :class="{ collected: isCollected }">{{ isCollected ? '已收藏' : '收藏' }}</text>
      </view>
      <button 
        class="sign-up-btn" 
        :class="{ disabled: activity.status !== 1 || isJoined }" 
        @click="handleSignUp"
        :disabled="activity.status !== 1 || isJoined"
      >
        {{ getBtnText() }}
      </button>
    </view>

    <!-- 报名弹窗 -->
    <view v-if="showSignUpModal" class="modal-overlay" @click="closeSignUpModal">
      <view class="modal-container" @click.stop>
        <view class="modal-header">
          <text class="modal-title">报名信息填写</text>
          <uni-icons type="closeempty" size="20" color="#999" @click="closeSignUpModal"></uni-icons>
        </view>
        <view class="modal-content">
          <view class="form-item">
            <text class="label">姓名</text>
            <input class="input" type="text" v-model="signUpForm.name" placeholder="请输入您的姓名" />
          </view>
          <view class="form-item">
            <text class="label">联系电话</text>
            <input class="input" type="number" v-model="signUpForm.phone" placeholder="请输入您的联系电话" maxlength="11" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeSignUpModal">取消</button>
          <button class="confirm-btn" @click="submitSignUp">确认报名</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      activityId: '',
      isCollected: false,
      isJoined: false, // 是否已报名状态
      showSignUpModal: false,
      signUpForm: {
        name: '',
        phone: ''
      },
      // 模拟活动数据
      activity: {
        id: 1,
        title: '社区环境美化志愿活动',
        image: 'https://www.aigather.katlot.cn/sourcePic/photo/5.jpg',
        status: 1, // 1: 招募中, 2: 已结束
        address: '幸福社区中心广场',
        time: '2024-11-25 09:00-11:00',
        joined: 15,
        total: 30,
        type: 'community',
        description: '为了营造更加美好的社区环境，提升居民生活质量，特组织此次社区环境美化志愿活动。我们将一起清理社区公共区域，美化绿化带，为社区增添一份绿色和温馨。期待您的参与，让我们的家园更加美丽！',
        requirements: [
          '年满18周岁，身体健康',
          '能够准时参加活动，遵守活动纪律',
          '自备手套、垃圾袋等清洁工具',
          '服从组织方安排，注意安全'
        ],
        organizer: '幸福社区居委会',
        phone: '0571-12345678'
      },
      // 模拟所有活动数据
      activityData: {
        1: {
          id: 1,
          title: '社区环境美化志愿活动',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/5.jpg',
          status: 1,
          address: '幸福社区中心广场',
          time: '2024-11-25 09:00-11:00',
          joined: 15,
          total: 30,
          type: 'community',
          description: '为了营造更加美好的社区环境,提升居民生活质量，特组织此次社区环境美化志愿活动。我们将一起清理社区公共区域，美化绿化带，为社区增添一份绿色和温馨。期待您的参与，让我们的家园更加美丽！',
          requirements: [
            '年满18周岁，身体健康',
            '能够准时参加活动，遵守活动纪律',
            '自备手套、垃圾袋等清洁工具',
            '服从组织方安排，注意安全'
          ],
          organizer: '幸福社区居委会',
          phone: '0571-12345678'
        },
        2: {
          id: 2,
          title: '关爱独居老人温暖行动',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/7.jpg',
          status: 1,
          address: '社区养老服务中心',
          time: '2024-11-26 14:00-16:00',
          joined: 8,
          total: 10,
          type: 'elder',
          description: '关爱独居老人，传递社会温暖。本次活动将组织志愿者走访社区独居老人，陪伴聊天，帮助解决日常生活中的小困难，让老人感受到社区的关怀和温暖。',
          requirements: [
            '有爱心、耐心，善于与老人沟通',
            '能够准时参加活动',
            '遵守老人隐私，尊重老人意愿',
            '服从组织方统一安排'
          ],
          organizer: '社区养老服务中心',
          phone: '0571-87654321'
        },
        3: {
          id: 3,
          title: '垃圾分类宣传指导',
          image: 'https://www.aigather.katlot.cn/sourcePic/photo/3.jpg',
          status: 2,
          address: '社区各主要路口',
          time: '2024-11-20 08:00-10:00',
          joined: 20,
          total: 20,
          type: 'environment',
          description: '为提高社区居民垃圾分类意识，推动垃圾分类工作深入开展，组织此次宣传指导活动。志愿者将在社区主要路口设置宣传点，向居民讲解垃圾分类知识，指导正确投放。',
          requirements: [
            '了解垃圾分类基本知识',
            '善于沟通，有耐心',
            '能够站立工作2小时',
            '服从组织方安排'
          ],
          organizer: '社区环保志愿服务队',
          phone: '0571-23456789'
        }
      }
    }
  },
  onLoad(options) {
    if (options.id) {
      this.activityId = options.id;
      this.loadActivityData(options.id);
    }
  },
  methods: {
    // 加载活动数据
    loadActivityData(id) {
      // 实际应用中，这里应该调用API获取数据
      const data = this.activityData[id];
      if (data) {
        this.activity = data;
      } else {
        uni.showToast({
          title: '活动不存在',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      return status === 1 ? '招募中' : '已结束';
    },
    
    // 获取按钮文本
    getBtnText() {
      if (this.isJoined) {
        return '已报名';
      }
      if (this.activity.status !== 1) {
        return '活动已结束';
      }
      if (this.activity.joined >= this.activity.total) {
        return '名额已满';
      }
      return '立即报名';
    },
    
    // 切换收藏状态
    toggleCollect() {
      this.isCollected = !this.isCollected;
      uni.showToast({
        title: this.isCollected ? '收藏成功' : '取消收藏',
        icon: 'success'
      });
    },
    
    // 拨打电话
    makeCall() {
      uni.makePhoneCall({
        phoneNumber: this.activity.phone
      });
    },
    
    // 处理报名点击
    handleSignUp() {
      if (this.isJoined) {
        return;
      }
      
      if (this.activity.status !== 1) {
        uni.showToast({
          title: '活动已结束',
          icon: 'none'
        });
        return;
      }
      
      if (this.activity.joined >= this.activity.total) {
        uni.showToast({
          title: '名额已满',
          icon: 'none'
        });
        return;
      }
      
      // 打开报名弹窗
      this.showSignUpModal = true;
    },

    // 关闭报名弹窗
    closeSignUpModal() {
      this.showSignUpModal = false;
    },

    // 提交报名
    submitSignUp() {
      // 验证姓名
      if (!this.signUpForm.name.trim()) {
        uni.showToast({
          title: '请输入您的姓名',
          icon: 'none'
        });
        return;
      }

      // 验证电话
      if (!this.signUpForm.phone.trim()) {
        uni.showToast({
          title: '请输入您的联系电话',
          icon: 'none'
        });
        return;
      }

      // 简单的手机号格式验证
      if (!/^1[3-9]\d{9}$/.test(this.signUpForm.phone)) {
        uni.showToast({
          title: '请输入正确的手机号码',
          icon: 'none'
        });
        return;
      }

      // 模拟提交请求
      uni.showLoading({
        title: '正在报名...'
      });

      // 模拟延迟
      setTimeout(() => {
        uni.hideLoading();
        
        uni.showToast({
          title: '报名成功',
          icon: 'success'
        });
        
        // 更新已报名人数
        this.activity.joined += 1;
        
        // 设置已报名状态
        this.isJoined = true;
        
        // 关闭弹窗并清空表单
        this.closeSignUpModal();
        this.signUpForm.name = '';
        this.signUpForm.phone = '';
        
      }, 1000);
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-bottom: env(safe-area-inset-bottom);
}

// 顶部大图
.header-image-box {
  position: relative;
  width: 100%;
  height: 500rpx;
  
  .header-image {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  .status-tag {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    font-size: 24rpx;
    font-weight: 600;
    
    &.status-active {
      background: linear-gradient(135deg, #E07A4F 0%, #2ea8a8 100%);
      color: #fff;
      box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.4);
    }
    
    &.status-end {
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
    }
  }
}

// 内容区域
.content-wrapper {
  padding: 0 30rpx;
}

// 标题区域
.title-section {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 30rpx;
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    line-height: 1.5;
    display: block;
  }
}

// 信息卡片
.info-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .info-item {
    display: flex;
    align-items: flex-start;
    padding: 20rpx 0;
    
    &:not(:last-child) {
      border-bottom: 1rpx solid #f0f0f0;
    }
    
    .info-icon-box {
      width: 44rpx;
      height: 44rpx;
      background: linear-gradient(135deg, #e8f8f8 0%, #d0f2f2 100%);
      border-radius: 10rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;
      flex-shrink: 0;
    }
    
    .info-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
      
      .info-label {
        font-size: 24rpx;
        color: #999;
      }
      
      .info-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

// 通用卡片样式
.section-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    
    .title-line {
      width: 6rpx;
      height: 28rpx;
      background: linear-gradient(180deg, #E07A4F 0%, #2ea8a8 100%);
      border-radius: 3rpx;
      margin-right: 12rpx;
    }
  }
  
  .section-content {
    .description-text {
      font-size: 28rpx;
      color: #666;
      line-height: 1.8;
      display: block;
    }
    
    .requirement-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      .requirement-dot {
        width: 10rpx;
        height: 10rpx;
        background: #E07A4F;
        border-radius: 50%;
        margin-top: 12rpx;
        margin-right: 16rpx;
        flex-shrink: 0;
      }
      
      .requirement-text {
        flex: 1;
        font-size: 28rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

// 组织方信息
.organizer-card {
  background: linear-gradient(135deg, #f8fdfd 0%, #eef9f9 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-top: 20rpx;
  border: 1rpx solid #d0f2f2;
  
  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    
    .title-line {
      width: 6rpx;
      height: 28rpx;
      background: linear-gradient(180deg, #E07A4F 0%, #2ea8a8 100%);
      border-radius: 3rpx;
      margin-right: 12rpx;
    }
  }
  
  .organizer-info {
    .organizer-item {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .organizer-label {
        font-size: 28rpx;
        color: #666;
        min-width: 140rpx;
      }
      
      .organizer-value {
        font-size: 28rpx;
        color: #333;
        font-weight: 500;
        
        &.phone {
          color: #E07A4F;
          text-decoration: underline;
        }
      }
    }
  }
}

// 底部占位
.bottom-placeholder {
  height: 120rpx;
}

// 底部操作栏
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  gap: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
  
  .collect-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rpx;
    padding: 10rpx;
    
    text {
      font-size: 22rpx;
      color: #666;
      
      &.collected {
        color: #ff6b6b;
      }
    }
  }
  
  .sign-up-btn {
    flex: 1;
    height: 80rpx;
    background: linear-gradient(135deg, #E07A4F 0%, #2ea8a8 100%);
    color: #fff;
    border: none;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 20rpx rgba(224, 122, 79, 0.3);
    transition: all 0.3s ease;
    
    @include press(0.98, 0.95);
    
    &:active:not(.disabled) {
      transform: translateY(2rpx);
      box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.3);
    }
    
    &.disabled {
      background: linear-gradient(135deg, #ccc 0%, #aaa 100%);
      box-shadow: none;
      color: #fff;
    }
    
    &::after {
      border: none;
    }
  }
}

// 弹窗样式
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .modal-container {
    width: 600rpx;
    background-color: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    animation: modalFadeIn 0.3s ease;
    
    .modal-header {
      padding: 30rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1rpx solid #f0f0f0;
      
      .modal-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
    }
    
    .modal-content {
      padding: 40rpx 30rpx;
      
      .form-item {
        margin-bottom: 30rpx;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        .label {
          display: block;
          font-size: 28rpx;
          color: #666;
          margin-bottom: 16rpx;
        }
        
        .input {
          width: 100%;
          height: 80rpx;
          background-color: #f5f7fa;
          border-radius: 12rpx;
          padding: 0 24rpx;
          font-size: 28rpx;
          color: #333;
          box-sizing: border-box;
          border: 2rpx solid transparent;
          transition: all 0.3s;
          
          &:focus {
            background-color: #fff;
            border-color: #E07A4F;
          }
        }
      }
    }
    
    .modal-footer {
      display: flex;
      border-top: 1rpx solid #f0f0f0;
      
      button {
        flex: 1;
        height: 100rpx;
        line-height: 100rpx;
        text-align: center;
        font-size: 32rpx;
        background-color: #fff;
        border-radius: 0;
        margin: 0;
        
        &::after {
          border: none;
        }
        
        &.cancel-btn {
          color: #999;
          border-right: 1rpx solid #f0f0f0;
        }
        
        &.confirm-btn {
          color: #E07A4F;
          font-weight: 600;
        }
        
        @include press-card();
      }
    }
  }
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

</style>