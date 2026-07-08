<template>
  <view class="page">
    <scroll-view scroll-y class="list" @scrolltolower="loadMore" refresher-enabled
      :refresher-triggered="refreshing" @refresherrefresh="onRefresh">
      <view class="card" v-for="item in list" :key="item.logId">
        <!-- 照片 -->
        <swiper v-if="parsePhotos(item.photoUrls).length" class="photo-swiper"
          indicator-dots :indicator-color="'rgba(255,255,255,0.6)'" :indicator-active-color="'#fff'">
          <swiper-item v-for="(url, i) in parsePhotos(item.photoUrls)" :key="i">
            <image :src="url" mode="aspectFill" class="photo" @click="previewPhoto(parsePhotos(item.photoUrls), i)"></image>
          </swiper-item>
        </swiper>

        <view class="info">
          <view class="row main-row">
            <text class="service-name">{{ item.serviceName || '服务项目' }}</text>
            <text class="time">{{ formatTime(item.createTime) }}</text>
          </view>
          <view class="row" v-if="item.packageName">
            <text class="label">套餐</text>
            <text class="value">{{ item.packageName }}</text>
          </view>
          <view class="row" v-if="item.memberName">
            <text class="label">使用人</text>
            <text class="value">{{ item.memberName }}</text>
          </view>
          <view class="row" v-if="item.staffName">
            <text class="label">配送人</text>
            <text class="value">{{ item.staffName }}</text>
          </view>
          <view class="row">
            <text class="label">订单编号</text>
            <text class="value mono">{{ item.orderNo }}</text>
          </view>
        </view>
      </view>

      <view class="bottom-tip" v-if="!hasMore && list.length > 0">没有更多了</view>
      <view class="empty" v-if="!loading && list.length === 0">
        <uni-icons type="info" size="40" color="#ccc"></uni-icons>
        <text>暂无使用记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false,
      refreshing: false
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    async loadData(reset = false) {
      if (this.loading) return
      if (reset) { this.page = 1; this.list = []; this.hasMore = true }
      if (!this.hasMore) return
      this.loading = true
      try {
        const res = await request({
          url: '/xcx/orderApi/logsWithPhotos',
          method: 'get',
          params: { pageNum: this.page, pageSize: this.pageSize }
        })
        const rows = res.rows || []
        this.list = this.page === 1 ? rows : this.list.concat(rows)
        this.hasMore = rows.length === this.pageSize
        if (this.hasMore) this.page++
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
        this.refreshing = false
      }
    },
    loadMore() { this.loadData() },
    async onRefresh() {
      this.refreshing = true
      await this.loadData(true)
    },
    parsePhotos(str) {
      if (!str) return []
      try { return JSON.parse(str).filter(Boolean) } catch { return [] }
    },
    formatTime(t) {
      if (!t) return ''
      return String(t).replace('T', ' ').slice(0, 16)
    },
    previewPhoto(urls, current) {
      uni.previewImage({ urls, current: urls[current] })
    }
  }
}
</script>

<style scoped lang="scss">
.page { background: #f5f5f5; min-height: 100vh; }
.list { height: 100vh; }

.card {
  background: #fff;
  border-radius: 16rpx;
  margin: 20rpx 24rpx 0;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.photo-swiper { width: 100%; height: 360rpx; }
.photo { width: 100%; height: 100%; }

.info { padding: 24rpx; }
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  &:last-child { margin-bottom: 0; }
}
.main-row { margin-bottom: 16rpx; }
.service-name { font-size: 30rpx; font-weight: 600; color: #1e293b; flex: 1; }
.time { font-size: 24rpx; color: #94a3b8; flex-shrink: 0; margin-left: 16rpx; }
.label { font-size: 26rpx; color: #94a3b8; }
.value { font-size: 26rpx; color: #475569; }
.mono { font-family: monospace; }

.bottom-tip { text-align: center; padding: 30rpx; font-size: 24rpx; color: #ccc; }
.empty {
  display: flex; flex-direction: column; align-items: center;
  padding-top: 200rpx; gap: 20rpx;
  text { font-size: 28rpx; color: #ccc; }
}
</style>
