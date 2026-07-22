<template>
  <view class="page-container">
    <!-- 欢迎区 -->
    <home-header :user-name="userName" :community-name="communityName"></home-header>

    <!-- 健康监测模块 -->
    <view class="section">
      <view class="section-title-bar">
        <text class="section-title">健康监测</text>
      </view>
      <member-selector
        :current-name="currentMemberName"
        :members="members"
        @change="onMemberChange"
      ></member-selector>
    </view>

    <!-- 健康双卡片 -->
    <view class="card-row">
      <view class="card-col">
        <health-card :health="health" @click="openHealthModal"></health-card>
      </view>
      <view class="card-col">
        <sleep-card :sleep="health && health.sleep" @click="openHealthModal"></sleep-card>
      </view>
    </view>

    <!-- 公告栏（保留原有逻辑） -->
    <view class="notice-container">
      <view class="notice-header">
        <uni-icons type="sound" size="16" color="#ff6b35"></uni-icons>
        <text class="notice-title">公告</text>
      </view>
      <view class="notice-content">
        <swiper
          class="notice-swiper"
          :vertical="true"
          :autoplay="true"
          :interval="4000"
          :duration="300"
          :indicator-dots="false"
        >
          <swiper-item v-for="(notice, index) in noticeList" :key="index">
            <text class="notice-text" @click="handleNoticeClick(notice)">{{ notice.title }}</text>
          </swiper-item>
        </swiper>
      </view>
      <view class="notice-more" @click="handleMoreNotice">
        <uni-icons type="right" size="14" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 今日动态 -->
    <view class="section">
      <view class="section-title-bar">
        <text class="section-title">今日动态</text>
      </view>
    </view>

    <!-- 订单 / 套餐 双卡片 -->
    <view class="card-row">
      <view class="card-col">
        <today-order-card :summary="todayOrder" @click="goOrderList"></today-order-card>
      </view>
      <view class="card-col">
        <package-usage-card :packages="packages" @click="goPackage"></package-usage-card>
      </view>
    </view>

    <!-- 健康汇总弹窗 -->
    <health-detail-modal
      ref="healthModal"
      :health="health"
      :member-name="currentMemberName"
    ></health-detail-modal>
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { listNotice } from '@/api/notice.js'
import { listFamilymemberNoPage } from '@/api/familymember.js'
import { getHomeHealth } from '@/api/home/health.js'
import { getTodayOrder } from '@/api/home/todayOrder.js'
import { getHomePackages } from '@/api/home/package.js'
import { createPoll } from '@/utils/home-poll.js'

import HomeHeader from '@/components/home/header.vue'
import MemberSelector from '@/components/home/member-selector.vue'
import HealthCard from '@/components/home/health-card.vue'
import SleepCard from '@/components/home/sleep-card.vue'
import TodayOrderCard from '@/components/home/today-order-card.vue'
import PackageUsageCard from '@/components/home/package-usage-card.vue'
import HealthDetailModal from '@/components/home/health-detail-modal.vue'

const MEMBER_CACHE_KEY = 'home_selected_member'

export default {
  components: {
    HomeHeader,
    MemberSelector,
    HealthCard,
    SleepCard,
    TodayOrderCard,
    PackageUsageCard,
    HealthDetailModal
  },
  data() {
    return {
      noticeList: [],
      members: [],
      currentMember: null,
      health: {},
      todayOrder: {},
      packages: [],
      healthPoll: null
    }
  },
  computed: {
    ...mapState({
      userName: state => state.user.name,
      joinedCommunity: state => state.user.joinedCommunity
    }),
    communityName() {
      const c = this.joinedCommunity
      return (c && (c.name || c.communityName)) || ''
    },
    currentMemberId() {
      return this.currentMember ? this.currentMember.memberId : null
    },
    currentMemberName() {
      return this.currentMember ? this.currentMember.memberName : ''
    }
  },
  // 健康数据 30s 轮询：onShow 启动、onHide 停止，避免后台请求
  onLoad() {
    this.healthPoll = createPoll(() => this.fetchHealth(), 30000)
    this.getNoticeList()
    this.loadMembers()
  },
  onShow() {
    // 选中成员后才开始轮询
    if (this.currentMemberId) {
      this.healthPoll.start(true)
    }
  },
  onHide() {
    this.healthPoll.stop()
  },
  onUnload() {
    this.healthPoll.stop()
  },
  onPullDownRefresh() {
    this.refreshAll().finally(() => uni.stopPullDownRefresh())
  },
  methods: {
    // 公告
    async getNoticeList() {
      try {
        const res = await listNotice({ pageNum: 1, pageSize: 5 })
        if (res.code === 200 && res.rows) {
          this.noticeList = res.rows.map(item => ({
            id: item.noticeId,
            title: item.noticeTitle,
            content: item.noticeContent,
            time: item.createTime,
            important: item.noticeType === '1'
          }))
        }
      } catch (e) {
        console.error('获取公告列表失败:', e)
      }
    },
    handleNoticeClick(notice) {
      uni.navigateTo({
        url: `/pages/server/notice/detail?item=${encodeURIComponent(JSON.stringify(notice))}`
      })
    },
    handleMoreNotice() {
      uni.navigateTo({ url: '/pages/server/notice/index' })
    },

    // 家庭成员
    async loadMembers() {
      try {
        const res = await listFamilymemberNoPage()
        const list = (res && (res.rows || res.data)) || []
        this.members = list
        if (list.length === 0) {
          this.currentMember = null
          return
        }
        // 默认选中：缓存 > 第一个
        const cachedId = uni.getStorageSync(MEMBER_CACHE_KEY)
        const picked = (cachedId && list.find(m => m.memberId === cachedId)) || list[0]
        this.onMemberChange(picked)
      } catch (e) {
        console.error('获取家庭成员失败:', e)
      }
    },
    onMemberChange(member) {
      this.currentMember = member
      if (member && member.memberId) {
        uni.setStorageSync(MEMBER_CACHE_KEY, member.memberId)
        // 订单、套餐并行拉取；健康数据交给轮询 start(true) 立即拉一次，避免重复请求
        this.fetchOrder()
        this.fetchPackages()
        this.healthPoll.stop()
        this.healthPoll.start(true)
      }
    },

    // 健康数据
    async fetchHealth() {
      if (!this.currentMemberId) return
      try {
        const res = await getHomeHealth(this.currentMemberId)
        if (res.code === 200 && res.data) {
          this.health = res.data
        }
      } catch (e) {
        console.error('获取健康数据失败:', e)
      }
    },
    // 今日订单
    async fetchOrder() {
      if (!this.currentMemberId) return
      try {
        const res = await getTodayOrder(this.currentMemberId, this.formatToday())
        if (res.code === 200 && res.data) {
          this.todayOrder = res.data
        }
      } catch (e) {
        console.error('获取今日订单失败:', e)
      }
    },
    // 套餐
    async fetchPackages() {
      if (!this.currentMemberId) return
      try {
        const res = await getHomePackages(this.currentMemberId)
        const data = (res && res.data) || {}
        this.packages = data.list || []
      } catch (e) {
        console.error('获取套餐失败:', e)
      }
    },

    // 下拉刷新：公告 + 当前成员全部数据
    async refreshAll() {
      await Promise.all([
        this.getNoticeList(),
        this.fetchHealth(),
        this.fetchOrder(),
        this.fetchPackages()
      ])
    },

    // 跳转
    openHealthModal() {
      this.$refs.healthModal.open()
    },
    goOrderList() {
      uni.switchTab({ url: '/pages/order/index' })
    },
    goPackage() {
      if (this.packages && this.packages.length) {
        uni.navigateTo({ url: '/pages/my/balancePackage/index' })
      } else {
        uni.navigateTo({ url: '/pages/server/SetMeal/index' })
      }
    },

    formatToday() {
      const d = new Date()
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f2f4f8;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom)); /* 留出 tabBar 空间 */
}

/* 模块标题区 */
.section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx 16rpx;
}

.section-title-bar {
  position: relative;
  padding-left: 20rpx;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 34rpx;
    background: #5AAB7A;
    border-radius: 4rpx;
  }
}

.section-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #222;
}

/* 双卡片行 */
.card-row {
  display: flex;
  gap: 24rpx;
  padding: 8rpx 32rpx 0;

  .card-col {
    flex: 1;
    min-width: 0;
  }
}

/* 公告栏（保留原样式，略调间距） */
.notice-container {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 24rpx 24rpx 28rpx;
  margin: 28rpx 32rpx 0;
  display: flex;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  border-left: 6rpx solid #E07A4F;
}

.notice-header {
  display: flex;
  align-items: center;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #ff6b35;
  margin-left: 8rpx;
}

.notice-content {
  flex: 1;
  height: 40rpx;
  overflow: hidden;
}

.notice-swiper {
  height: 40rpx;
}

.notice-text {
  font-size: 26rpx;
  color: #666;
  line-height: 40rpx;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notice-more {
  margin-left: 20rpx;
  padding: 8rpx;
  flex-shrink: 0;
}
</style>
