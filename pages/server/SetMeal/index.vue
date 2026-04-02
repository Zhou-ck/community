<template>
  <view class="setmeal-container">

    <!-- Tab切换 -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'available' }" 
        @click="switchTab('available')"
      >
        <text>可购买套餐</text>
        <view class="tab-line" v-if="currentTab === 'available'"></view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 'my' }" 
        @click="switchTab('my')"
      >
        <text>我的套餐</text>
        <view class="tab-line" v-if="currentTab === 'my'"></view>
      </view>
    </view>

    <!-- 可购买套餐列表 -->
    <scroll-view
      v-show="currentTab === 'available'"
      class="package-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view 
        v-for="item in availablePackages" 
        :key="item.packageId" 
        class="package-card"
      >
        <!-- 套餐图片 -->
        <view class="package-image-wrap" @click="viewPackageDetail(item)">
          <image 
            v-if="item.icon" 
            :src="baseUrl + item.icon" 
            class="package-image" 
            mode="aspectFill"
          ></image>
          <view v-else class="package-image-placeholder">
            <text class="iconfont icon-tupian"></text>
          </view>
          
          <!-- 套餐标签 -->
          <view class="package-tag" v-if="item.isHot === '1' || item.isRecommend === '1'">
            <text v-if="item.isHot === '1'" class="tag hot">热门</text>
            <text v-if="item.isRecommend === '1'" class="tag recommend">推荐</text>
          </view>
        </view>
        
        <view class="package-content" @click="viewPackageDetail(item)">
          <view class="package-header">
            <view class="package-name">{{ item.packageName }}</view>
            <view class="package-price-wrap">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ item.price }}</text>
              <text class="original-price" v-if="item.originalPrice && item.originalPrice > item.price">¥{{ item.originalPrice }}</text>
            </view>
          </view>
          
          <view class="package-desc">{{ item.description || '暂无描述' }}</view>
          
          <view class="package-tags">
            <view class="info-tag">
              <text class="iconfont icon-shijian"></text>
              <text>{{ getValidityText(item) }}</text>
            </view>
            <view class="info-tag gift-tag" v-if="item.hasGiftRule === '1'">
              <text class="iconfont icon-liwu"></text>
              <text>连续购有赠</text>
            </view>
            <view class="info-tag" v-if="item.packageItems && item.packageItems.length > 0">
              <text class="iconfont icon-fuwu"></text>
              <text>{{ item.packageItems.length }}项服务</text>
            </view>
          </view>
        </view>
        
        <view class="package-footer">
          <view class="package-status" :class="item.status === '0' ? 'status-active' : 'status-inactive'">
            <text class="iconfont" :class="item.status === '0' ? 'icon-duihao' : 'icon-guanbi'"></text>
            {{ item.status === '0' ? '可购买' : '已下架' }}
          </view>
          <view class="buy-btn" @click.stop="buyPackage(item)" v-if="item.status === '0'">
            <text class="iconfont icon-gouwuche"></text>
            立即购买
          </view>
        </view>
      </view>

      <view v-if="availablePackages.length === 0" class="empty-data">
        <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无可购买套餐</text>
        <text class="empty-hint">社区暂未发布服务套餐，请稍后再来</text>
      </view>
    </scroll-view>

    <!-- 我的套餐列表 -->
    <scroll-view
      v-show="currentTab === 'my'"
      class="my-package-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <view 
        v-for="item in myPackages" 
        :key="item.instanceId" 
        class="my-package-card"
      >
        <!-- 状态角标 -->
        <view class="status-badge" :class="[getInstanceStatusClass(item.instanceStatus)]">
          {{ getInstanceStatusText(item.instanceStatus) }}
        </view>
        
        <view class="card-content" @click="viewMyPackageDetail(item)">
          <view class="my-package-header">
            <view class="header-left">
              <view class="package-name">{{ item.packageName }}</view>
              <view class="package-price" v-if="item.payAmount">
                <text class="price-symbol">¥</text>
                <text class="price-value">{{ item.payAmount }}</text>
              </view>
            </view>
          </view>
          
          <view class="my-package-info">
            <view class="info-grid">
              <view class="info-cell">
                <text class="cell-label">家庭人员</text>
                <text class="cell-value">{{ item.memberName || '-' }}</text>
              </view>
              <view class="info-cell">
                <text class="cell-label">连续期数</text>
                <text class="cell-value highlight">第{{ item.consecutiveCount || 1 }}期</text>
              </view>
              <view class="info-cell">
                <text class="cell-label">生效时间</text>
                <text class="cell-value">{{ formatDate(item.startTime) }}</text>
              </view>
              <view class="info-cell">
                <text class="cell-label">到期时间</text>
                <text class="cell-value">{{ formatDate(item.expireTime) }}</text>
              </view>
            </view>
          </view>
          
          <!-- 退订申请提示 -->
          <view class="refund-tip" v-if="item.instanceStatus === 'REFUND_PENDING'">
            <text class="iconfont icon-tishi"></text>
            <text>退订申请审核中...</text>
          </view>
        </view>
        
        <view class="my-package-footer">
          <view class="footer-left">
            <view class="view-detail" @click.stop="viewMyPackageDetail(item)">
              <text>查看详情</text>
              <text class="iconfont icon-youjiantou"></text>
            </view>
          </view>
          <view class="footer-right">
            <!-- 使用中状态，显示"申请退订"按钮 -->
            <view 
              v-if="item.instanceStatus === 'ACTIVE'" 
              class="action-btn refund-btn" 
              @click.stop="applyRefund(item)"
            >
              申请退订
            </view>
            <!-- 退订审核中状态，显示"撤销申请"按钮 -->
            <view 
              v-else-if="item.instanceStatus === 'REFUND_PENDING'" 
              class="action-btn cancel-btn" 
              @click.stop="cancelRefundApply(item)"
            >
              撤销申请
            </view>
          </view>
        </view>
      </view>

      <view v-if="myPackages.length === 0" class="empty-data">
        <image src="/static/images/empty.png" mode="aspectFit" class="empty-image"></image>
        <text class="empty-text">暂无套餐</text>
        <text class="empty-hint">您还没有购买任何服务套餐</text>
        <view class="empty-btn" @click="switchTab('available')">去选购套餐</view>
      </view>
    </scroll-view>

    <!-- 套餐详情弹窗 -->
    <uni-popup ref="packageDetailPopup" type="bottom" :safe-area="false">
      <view class="package-detail-popup">
        <view class="popup-header">
          <text class="popup-title">套餐详情</text>
          <text class="iconfont icon-guanbi" @click="closePackageDetail"></text>
        </view>
        <view class="popup-content">
          <!-- 套餐名称和价格 -->
          <view class="detail-header">
            <view class="detail-title">{{ selectedPackage.packageName }}</view>
            <view class="detail-price-wrap">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ selectedPackage.price }}</text>
              <text class="original-price" v-if="selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price">¥{{ selectedPackage.originalPrice }}</text>
            </view>
          </view>
          
          <!-- 套餐信息 -->
          <view class="detail-info-section">
            <view class="info-item">
              <text class="info-label">套餐描述：</text>
              <text class="info-value">{{ selectedPackage.description || '暂无描述' }}</text>
            </view>
            <view class="info-item">
              <text class="info-label">有效期：</text>
              <text class="info-value">{{ getValidityText(selectedPackage) }}</text>
            </view>
            <view class="info-item" v-if="selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price">
              <text class="info-label">原价：</text>
              <text class="info-value original">¥{{ selectedPackage.originalPrice }}</text>
            </view>
          </view>
          
          <!-- 服务项目 -->
          <view class="service-section" v-if="selectedPackage.packageItems && selectedPackage.packageItems.length > 0">
            <view class="section-title">服务项目</view>
            <view class="service-list">
              <view v-for="(service, index) in selectedPackage.packageItems" :key="index" class="service-item">
                <text class="service-name">{{ service.serviceName }}</text>
                <text class="service-count">{{ formatServiceCount(service) }}</text>
              </view>
            </view>
          </view>
          
          <!-- 赠送规则 -->
          <view class="gift-section" v-if="selectedPackage.giftRules && selectedPackage.giftRules.length > 0">
            <view class="section-title gift-title">
              <text class="iconfont icon-liwu"></text>
              <text>连续购买赠送</text>
            </view>
            <view class="gift-list">
              <view v-for="(rule, index) in selectedPackage.giftRules" :key="index" class="gift-rule-item">
                <view class="gift-rule-header">
                  <text class="gift-badge">{{ rule.consecutivePeriods }}期</text>
                  <text class="gift-desc">{{ rule.giftDescription }}</text>
                </view>
                <view class="gift-items" v-if="rule.giftItems && rule.giftItems.length > 0">
                  <view v-for="(item, idx) in rule.giftItems" :key="idx" class="gift-item">
                    <text class="gift-icon">🎁</text>
                    <text class="gift-name">{{ item.serviceName }}</text>
                    <text class="gift-count">+{{ item.giftCount }}次</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <view class="popup-footer">
          <view class="buy-btn-large" @click="confirmBuy">立即购买</view>
        </view>
      </view>
    </uni-popup>

    <!-- 申请退订弹窗 -->
    <uni-popup ref="refundApplyPopup" type="center">
      <view class="refund-apply-popup">
        <view class="refund-popup-header">
          <text class="refund-popup-title">申请退订套餐</text>
          <text class="iconfont icon-guanbi" @click="closeRefundPopup"></text>
        </view>
        <view class="refund-popup-content">
          <view class="refund-package-info">
            <text class="package-name">{{ refundingPackage.packageName }}</text>
          </view>
          <view class="refund-warning">
            <view class="warning-icon">
              <text class="iconfont icon-tishi"></text>
            </view>
            <view class="warning-text">
              <text class="warning-title">退订须知</text>
              <view class="warning-list">
                <text class="warning-item">• 提交退订申请后，需等待社区管理员审核</text>
                <text class="warning-item">• 审核通过后套餐余量将清零</text>
                <text class="warning-item">• 连续购买记录将中断</text>
                <text class="warning-item">• 赠送服务将被撤销</text>
              </view>
            </view>
          </view>
          <view class="refund-reason-section">
            <text class="reason-label">退订原因 <text class="required">*</text></text>
            <textarea 
              class="reason-input" 
              v-model="refundReason" 
              placeholder="请输入退订原因（必填）"
              maxlength="200"
              :auto-height="false"
            ></textarea>
            <text class="reason-count">{{ refundReason.length }}/200</text>
          </view>
        </view>
        <view class="refund-popup-footer">
          <view class="refund-cancel-btn" @click="closeRefundPopup">取消</view>
          <view class="refund-confirm-btn" @click="submitRefundApply">确认提交</view>
        </view>
      </view>
    </uni-popup>

    </view>
</template>

<script>
import config from '@/config.js'
import { listAvailablePackage, getAvailablePackageDetail } from '@/api/servicepackage'
import { listMyPackageInstance, myRefundApply, myCancelRefundApply } from '@/api/userpackage'
import {
  formatDate as _formatDate,
  getInstanceStatusText as _getInstanceStatusText,
  getInstanceStatusClass as _getInstanceStatusClass,
  getFrequencyTypeText as _getFrequencyTypeText,
  getFrequencyText as _getFrequencyText,
  getValidityText as _getValidityText,
  getProgressWidth as _getProgressWidth,
  getProgressPercent as _getProgressPercent,
  formatServiceCount as _formatServiceCount
} from '@/utils/service-helper'

export default {
  data() {
    return {
      baseUrl: config.baseUrl,
      statusBarHeight: 0,
      currentTab: 'available', // available: 可购买套餐, my: 我的套餐
      refreshing: false, // 下拉刷新状态
      
      // 可购买套餐
      availablePackages: [],
      
      // 我的套餐
      myPackages: [],
      
      // 选中的套餐
      selectedPackage: {},
      
      // 退订相关
      refundingPackage: {},
      refundReason: '',
    }
  },
  
  onLoad(options) {
    const systemInfo = uni.getSystemInfoSync()
    this.statusBarHeight = systemInfo.statusBarHeight
    
    if (options && options.tab === 'my') {
      this.currentTab = 'my'
      this.loadMyPackages()
    } else {
      this.loadAvailablePackages()
    }
  },
  
  methods: {
    // 下拉刷新
    async onRefresh() {
      this.refreshing = true
      try {
        if (this.currentTab === 'available') {
          await this.loadAvailablePackages(false)
        } else {
          await this.loadMyPackages(false)
        }
      } finally {
        this.refreshing = false
      }
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '-'
      // 如果是完整日期时间格式，只取日期部分
      if (dateStr.includes(' ')) {
        return dateStr.split(' ')[0]
      }
      return dateStr
    },
    
    // 切换Tab
    switchTab(tab) {
      this.currentTab = tab
      if (tab === 'available') {
        this.loadAvailablePackages()
      } else {
        this.loadMyPackages()
      }
    },
    
    // 加载可购买套餐列表
    async loadAvailablePackages() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await listAvailablePackage({})
        this.availablePackages = res.rows || []
      } catch (error) {
        console.error('加载套餐列表失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 加载我的套餐列表
    async loadMyPackages() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await listMyPackageInstance({})
        this.myPackages = res.rows || []
      } catch (error) {
        console.error('加载我的套餐失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 查看套餐详情
    async viewPackageDetail(item) {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await getAvailablePackageDetail(item.packageId)
        this.selectedPackage = res.data || item
        this.$refs.packageDetailPopup.open()
      } catch (error) {
        console.error('加载套餐详情失败:', error)
        this.selectedPackage = item
        this.$refs.packageDetailPopup.open()
      } finally {
        uni.hideLoading()
      }
    },
    
    // 关闭套餐详情
    closePackageDetail() {
      this.$refs.packageDetailPopup.close()
    },
    
    // 购买套餐
    async buyPackage(item) {
      try {
        uni.showLoading({ title: '加载中...' })
        // 调用接口获取套餐详情
        const res = await getAvailablePackageDetail(item.packageId)
        const packageDetail = res.data || item
        
        // 将套餐详情缓存，供购买页面使用
        uni.setStorageSync('purchaseDataCache', packageDetail)
        
        // 跳转到购买页面
        uni.navigateTo({
          url: '/pages/server/SetMeal/purchase'
        })
      } catch (error) {
        console.error('获取套餐详情失败:', error)
        uni.showToast({ 
          title: error.msg || '获取套餐详情失败', 
          icon: 'none' 
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 确认购买
    confirmBuy() {
      this.closePackageDetail()
      // 缓存套餐详情，供购买页面使用
      uni.setStorageSync('purchaseDataCache', this.selectedPackage)
      uni.navigateTo({
        url: '/pages/server/SetMeal/purchase'
      })
    },
    
    // 查看我的套餐详情
    viewMyPackageDetail(item) {
      uni.navigateTo({
        url: `/pages/server/SetMeal/detail?instanceId=${item.instanceId}`
      })
    },
    
    // 申请退订 - 打开弹窗
    applyRefund(item) {
      this.refundingPackage = item
      this.refundReason = ''
      this.$refs.refundApplyPopup.open()
    },
    
    // 关闭退订弹窗
    closeRefundPopup() {
      this.$refs.refundApplyPopup.close()
      this.refundingPackage = {}
      this.refundReason = ''
    },
    
    // 提交退订申请
    async submitRefundApply() {
      if (!this.refundReason.trim()) {
        uni.showToast({
          title: '请输入退订原因',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({ title: '提交中...' })
        await myRefundApply({
          instanceId: this.refundingPackage.instanceId,
          refundReason: this.refundReason
        })
        
        this.closeRefundPopup()
        
        uni.showToast({
          title: '申请已提交',
          icon: 'success'
        })
        
        // 刷新列表
        setTimeout(() => {
          this.loadMyPackages()
        }, 1500)
      } catch (error) {
        console.error('申请退订失败:', error)
        uni.showToast({
          title: error.msg || '申请失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 撤销退订申请
    cancelRefundApply(item) {
      uni.showModal({
        title: '撤销退订申请',
        content: '确定要撤销退订申请吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({ title: '处理中...' })
              await myCancelRefundApply({
                instanceId: item.instanceId
              })
              
              uni.showToast({
                title: '已撤销申请',
                icon: 'success'
              })
              
              // 刷新列表
              setTimeout(() => {
                this.loadMyPackages()
              }, 1500)
            } catch (error) {
              console.error('撤销失败:', error)
              uni.showToast({
                title: error.msg || '撤销失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },
    
    getInstanceStatusText(status) { return _getInstanceStatusText(status) },
    getInstanceStatusClass(status) { return _getInstanceStatusClass(status) },
    getValidityText(item) { return _getValidityText(item) },
    getFrequencyTypeText(frequencyType) { return _getFrequencyTypeText(frequencyType) },
    getFrequencyText(frequency) { return _getFrequencyText(frequency) },
    getProgressWidth(service) { return _getProgressWidth(service) },
    getProgressPercent(service) { return _getProgressPercent(service) },
    formatServiceCount(service) { return _formatServiceCount(service) },
    formatDate(dateStr) { return _formatDate(dateStr) }
  }
}
</script>

<style lang="scss" scoped>
.setmeal-container {
  height: 100vh;
  background: linear-gradient(180deg, #f8f9fc 0%, #f5f5f5 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// Tab栏
.tab-bar {
  display: flex;
  background-color: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
  
  .tab-item {
    flex: 1;
    height: 48px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    font-size: 15px;
    color: #666;
    transition: all 0.3s;
    
    &.active {
      color: #3ec6c6;
      font-weight: 600;
    }
    
    .tab-line {
      position: absolute;
      bottom: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
      border-radius: 2px;
    }
  }
}

// 可购买套餐列表
.package-list {
  flex: 1;
  height: calc(100vh - 48px - var(--status-bar-height, 0px));
  padding: 12px;
  
  .package-card {
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    
    // 套餐图片区域
    .package-image-wrap {
      position: relative;
      width: 100%;
      height: 180px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
      overflow: hidden;
      
      .package-image {
        width: 100%;
        height: 100%;
      }
      
      .package-image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #e8f5f5 0%, #d4eded 100%);
        
        .iconfont {
          font-size: 60px;
          color: #3ec6c6;
          opacity: 0.3;
        }
      }
      
      // 套餐标签
      .package-tag {
        position: absolute;
        top: 12px;
        right: 12px;
        display: flex;
        gap: 6px;
        
        .tag {
          padding: 4px 12px;
          font-size: 11px;
          color: #fff;
          font-weight: 600;
          backdrop-filter: blur(10px);
          
          &.hot {
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.9) 0%, rgba(255, 142, 83, 0.9) 100%);
            border-radius: 12px 12px 12px 0;
            box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
          }
          
          &.recommend {
            background: linear-gradient(135deg, rgba(62, 198, 198, 0.9) 0%, rgba(46, 181, 181, 0.9) 100%);
            border-radius: 12px 12px 12px 0;
            box-shadow: 0 2px 8px rgba(62, 198, 198, 0.4);
          }
          
          &.gift {
            background: linear-gradient(135deg, rgba(255, 165, 0, 0.9) 0%, rgba(255, 140, 0, 0.9) 100%);
            border-radius: 12px 12px 12px 0;
            box-shadow: 0 2px 8px rgba(255, 165, 0, 0.4);
          }
        }
      }
    }
    
    // 套餐内容区域
    .package-content {
      padding: 16px;
    }
    
    .package-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 10px;
      
      .package-name {
        font-size: 17px;
        font-weight: 600;
        color: #333;
        flex: 1;
        padding-right: 10px;
      }
      
      .package-price-wrap {
        display: flex;
        align-items: baseline;
        
        .price-symbol {
          font-size: 14px;
          color: #ff6b6b;
          font-weight: 500;
        }
        
        .price-value {
          font-size: 24px;
          font-weight: bold;
          color: #ff6b6b;
        }
        
        .original-price {
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
          margin-left: 6px;
        }
      }
    }
    
    .package-desc {
      font-size: 13px;
      color: #666;
      margin-bottom: 12px;
      line-height: 1.6;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      /* stylelint-disable-next-line property-no-vendor-prefix */
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-clamp: 2;
    }
    
    .package-tags {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      
      .info-tag {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #3ec6c6;
        background-color: #e8f5f5;
        padding: 4px 10px;
        border-radius: 12px;
        
        .iconfont {
          font-size: 12px;
        }
        
        &.gift-tag {
          color: #ff8c00;
          background-color: #fff4e6;
          font-weight: 600;
        }
      }
    }
    
    .package-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid #f5f5f5;
      
      .package-status {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 12px;
        
        .iconfont {
          font-size: 12px;
        }
        
        &.status-active {
          color: #52c41a;
          background-color: #f6ffed;
        }
        
        &.status-inactive {
          color: #999;
          background-color: #f5f5f5;
        }
      }
      
      .buy-btn {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 20px;
        background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
        color: #fff;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(62, 198, 198, 0.3);
        
        .iconfont {
          font-size: 14px;
        }
      }
    }
  }
}

// 我的套餐列表
.my-package-list {
  flex: 1;
  height: calc(100vh - 48px - var(--status-bar-height, 0px));
  padding: 12px;
  
  .my-package-card {
    background-color: #fff;
    border-radius: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
    position: relative;
    overflow: hidden;
    
    // 状态角标
    .status-badge {
      position: absolute;
      top: 0;
      right: 0;
      padding: 6px 16px;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      border-radius: 0 16px 0 16px;
      z-index: 1;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      
      &.status-pending {
        background: linear-gradient(135deg, #faad14 0%, #ffc53d 100%);
      }
      
      &.status-using {
        background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
      }
      
      &.status-refund-pending {
        background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
      }
      
      &.status-expired {
        background: linear-gradient(135deg, #8c8c8c 0%, #bfbfbf 100%);
      }
      
      &.status-refunded {
        background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
      }
      
      &.status-rejected {
        background: linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%);
      }
      
      &.status-cancelled {
        background: linear-gradient(135deg, #595959 0%, #8c8c8c 100%);
      }
    }
    
    .card-content {
      padding: 16px;
      padding-top: 20px;
    }
    
    .my-package-header {
      margin-bottom: 16px;
      
      .header-left {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        .package-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          padding-right: 80px;
        }
        
        .package-price {
          display: flex;
          align-items: baseline;
          gap: 2px;
          
          .price-symbol {
            font-size: 14px;
            color: #ff6b6b;
            font-weight: 600;
          }
          
          .price-value {
            font-size: 24px;
            font-weight: bold;
            color: #ff6b6b;
          }
        }
      }
    }
    
    .my-package-info {
      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        
        .info-cell {
          background: linear-gradient(135deg, #f8f9fc 0%, #f5f7fa 100%);
          border-radius: 10px;
          padding: 12px;
          border: 1px solid #e8ecf1;
          
          .cell-label {
            display: block;
            font-size: 12px;
            color: #999;
            margin-bottom: 6px;
          }
          
          .cell-value {
            display: block;
            font-size: 14px;
            color: #333;
            font-weight: 600;
            
            &.highlight {
              color: #3ec6c6;
            }
          }
        }
      }
    }
    
    // 退订申请提示
    .refund-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 10px 12px;
      background: linear-gradient(135deg, #fff7e6 0%, #fffaf0 100%);
      border-radius: 8px;
      border: 1px solid #ffd591;
      
      .iconfont {
        font-size: 14px;
        color: #fa8c16;
      }
      
      text {
        font-size: 13px;
        color: #fa8c16;
        font-weight: 500;
      }
    }
    
    .my-package-footer {
      margin-top: 0;
      padding: 14px 16px;
      background: linear-gradient(180deg, #fafbfc 0%, #f8f9fa 100%);
      border-top: 1px solid #e8ecf1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 0 0 16px 16px;
      
      .footer-left {
        .view-detail {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #3ec6c6;
          font-weight: 500;
          padding: 6px 12px;
          background-color: #e8f5f5;
          border-radius: 20px;
          transition: all 0.2s;
          
          &:active {
            background-color: #d4eded;
          }
          
          .iconfont {
            font-size: 12px;
          }
        }
      }
      
      .footer-right {
        display: flex;
        gap: 10px;
        
        .action-btn {
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          
          &:active {
            transform: scale(0.96);
          }
          
          &.refund-btn {
            background: linear-gradient(135deg, #fff1f0 0%, #ffe7e6 100%);
            color: #ff4d4f;
            border: 1px solid #ffccc7;
          }
          
          &.cancel-btn {
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            color: #666;
            border: 1px solid #d9d9d9;
          }
        }
      }
    }
  }
}

// 空数据
.empty-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  
  .empty-image {
    width: 160px;
    height: 160px;
    margin-bottom: 20px;
  }
  
  .iconfont {
    font-size: 80px;
    color: #ddd;
    margin-bottom: 15px;
  }
  
  .empty-text {
    font-size: 16px;
    color: #333;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .empty-hint {
    font-size: 13px;
    color: #999;
    margin-bottom: 20px;
  }
  
  .empty-btn {
    padding: 10px 30px;
    background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
    color: #fff;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
}

.empty-data-small {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

// 套餐详情弹窗
.package-detail-popup {
  background-color: #fff;
  border-radius: 16px 16px 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  
  .popup-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    flex-shrink: 0;
    position: relative;
    
    .popup-title {
      font-size: 17px;
      font-weight: 600;
      color: #333;
    }
    
    .iconfont {
      position: absolute;
      right: 20px;
      font-size: 20px;
      color: #999;
      padding: 5px;
    }
  }
  
  .popup-content {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 20px;
    
    // 套餐名称和价格
    .detail-header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #f5f5f5;
      margin-bottom: 20px;
      
      .detail-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
      }
      
      .detail-price-wrap {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 4px;
        
        .price-symbol {
          font-size: 18px;
          color: #ff6b6b;
          font-weight: 600;
        }
        
        .price-value {
          font-size: 32px;
          font-weight: bold;
          color: #ff6b6b;
        }
        
        .original-price {
          font-size: 14px;
          color: #999;
          text-decoration: line-through;
          margin-left: 8px;
        }
      }
    }
    
    // 套餐信息
    .detail-info-section {
      margin-bottom: 20px;
      
      .info-item {
        display: flex;
        padding: 12px 0;
        border-bottom: 1px dashed #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        .info-label {
          color: #999;
          font-size: 14px;
          min-width: 80px;
        }
        
        .info-value {
          flex: 1;
          color: #333;
          font-size: 14px;
          
          &.original {
            color: #999;
            text-decoration: line-through;
          }
        }
      }
    }
    
    // 服务项目
    .service-section {
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
        padding-left: 12px;
        border-left: 4px solid #3ec6c6;
      }
      
      .service-list {
        .service-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 8px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .service-name {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
          
          .service-count {
            font-size: 14px;
            color: #3ec6c6;
            font-weight: 600;
          }
        }
      }
    }
    
    // 赠送规则
    .gift-section {
      margin-top: 20px;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
        padding-left: 12px;
        border-left: 4px solid #ff8c00;
        display: flex;
        align-items: center;
        gap: 6px;
        
        &.gift-title {
          color: #ff8c00;
          
          .iconfont {
            font-size: 18px;
          }
        }
      }
      
      .gift-list {
        .gift-rule-item {
          background: linear-gradient(135deg, #fff4e6 0%, #fffaf0 100%);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 12px;
          border: 1px solid #ffe4b3;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .gift-rule-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
            
            .gift-badge {
              background: linear-gradient(135deg, #ff8c00 0%, #ff7700 100%);
              color: #fff;
              font-size: 12px;
              font-weight: 600;
              padding: 4px 12px;
              border-radius: 12px;
              box-shadow: 0 2px 6px rgba(255, 140, 0, 0.3);
            }
            
            .gift-desc {
              flex: 1;
              font-size: 14px;
              color: #d97706;
              font-weight: 500;
            }
          }
          
          .gift-items {
            .gift-item {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 8px 12px;
              background-color: #fff;
              border-radius: 8px;
              margin-bottom: 6px;
              
              &:last-child {
                margin-bottom: 0;
              }
              
              .gift-icon {
                font-size: 16px;
              }
              
              .gift-name {
                flex: 1;
                font-size: 13px;
                color: #333;
              }
              
              .gift-count {
                font-size: 13px;
                color: #ff8c00;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }
  
  .popup-footer {
    padding: 16px 20px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
    border-top: 1px solid #f0f0f0;
    flex-shrink: 0;
    background: #fff;
    
    .buy-btn-large {
      width: 100%;
      height: 48px;
      line-height: 48px;
      text-align: center;
      background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
      color: #fff;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 500;
    }
  }
}

// 退订申请弹窗
.refund-apply-popup {
  width: 85vw;
  max-width: 340px;
  background-color: #fff;
  border-radius: 16px;
  overflow: hidden;
  
  .refund-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
    
    .refund-popup-title {
      font-size: 17px;
      font-weight: 600;
      color: #333;
    }
    
    .iconfont {
      font-size: 20px;
      color: #999;
    }
  }
  
  .refund-popup-content {
    padding: 16px 20px;
    max-height: 60vh;
    overflow-y: auto;
    
    .refund-package-info {
      padding: 12px 16px;
      background-color: #f8f9fc;
      border-radius: 10px;
      margin-bottom: 16px;
      
      .package-name {
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }
    }
    
    .refund-warning {
      display: flex;
      gap: 12px;
      padding: 14px;
      background-color: #fff7e6;
      border-radius: 10px;
      border: 1px solid #ffd591;
      margin-bottom: 16px;
      
      .warning-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        
        .iconfont {
          font-size: 22px;
          color: #fa8c16;
        }
      }
      
      .warning-text {
        flex: 1;
        
        .warning-title {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #fa8c16;
          margin-bottom: 8px;
        }
        
        .warning-list {
          .warning-item {
            display: block;
            font-size: 13px;
            color: #666;
            line-height: 1.8;
          }
        }
      }
    }
    
    .refund-reason-section {
      position: relative;
      
      .reason-label {
        display: block;
        font-size: 14px;
        color: #333;
        font-weight: 500;
        margin-bottom: 10px;
        
        .required {
          color: #ff4d4f;
        }
      }
      
      .reason-input {
        width: 100%;
        height: 100px;
        padding: 12px;
        background-color: #f8f9fc;
        border: 1px solid #e5e5e5;
        border-radius: 10px;
        font-size: 14px;
        color: #333;
        box-sizing: border-box;
        
        &::placeholder {
          color: #999;
        }
      }
      
      .reason-count {
        position: absolute;
        right: 12px;
        bottom: 10px;
        font-size: 12px;
        color: #999;
      }
    }
  }
  
  .refund-popup-footer {
    display: flex;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #f0f0f0;
    
    .refund-cancel-btn, .refund-confirm-btn {
      flex: 1;
      height: 44px;
      line-height: 44px;
      text-align: center;
      border-radius: 22px;
      font-size: 15px;
      font-weight: 500;
    }
    
    .refund-cancel-btn {
      background-color: #f5f5f5;
      color: #666;
    }
    
    .refund-confirm-btn {
      background: linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%);
      color: #fff;
    }
  }
}
</style>
