<template>
  <view class="plan-detail-page">
    <!-- 标签页 -->
    <view class="tabs">
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 0 }" 
        @click="switchTab(0)"
      >
        <text>日计划</text>
        <view class="active-line" v-if="currentTab === 0"></view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 1 }" 
        @click="switchTab(1)"
      >
        <text>周计划</text>
        <view class="active-line" v-if="currentTab === 1"></view>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTab === 2 }" 
        @click="switchTab(2)"
      >
        <text>月计划</text>
        <view class="active-line" v-if="currentTab === 2"></view>
      </view>
    </view>

    <!-- 计划列表 -->
    <view class="plans-list">
      <view 
        class="plan-item" 
        v-for="(plan, index) in filteredPlans" 
        :key="plan.planId || index"
      >
        <view class="plan-number">{{ index + 1 }}</view>
        
        <view class="plan-info">
          <view class="plan-time">{{ getPlanTimeText(plan) }}</view>
          <view class="plan-content">{{ plan.content }}</view>
        </view>

        <view class="plan-status">
          <!-- 已完成：显示已完成标签 -->
          <text v-if="String(plan.isCompleted) === '1'" class="completed">
            {{ getStatusText(plan) }}
          </text>
          <!-- 未完成：只显示确认完成按钮 -->
          <button 
            v-else
            class="confirm-btn" 
            @click="handleConfirmComplete(plan)"
          >
            确认完成
          </button>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredPlans.length === 0 && !loading" class="empty-state">
        <image src="/static/empty.png" mode="aspectFit"></image>
        <text>{{ getEmptyText() }}</text>
      </view>
    </view>

    <!-- 右下角悬浮同步按钮 -->
    <view class="float-sync-container" @click="handleSync">
      <view class="float-sync-btn">
        <uni-icons type="refresh" size="24" color="#fff"></uni-icons>
      </view>
      <text class="float-sync-text">同步计划</text>
    </view>

    <!-- 底部新增计划按钮 -->
    <view class="add-btn-container">
      <button class="add-btn" @click="handleAddPlan">
        <uni-icons type="plus-filled" size="18" color="#fff"></uni-icons>
        <text>{{ getAddButtonText() }}</text>
      </button>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 新增计划弹窗 -->
    <uni-popup ref="addPlanPopup" type="center" :mask-click="false">
      <view class="add-plan-popup">
        <view class="popup-header">
          <text class="popup-title">{{ getAddButtonText() }}</text>
          <uni-icons type="close" size="24" color="#666" @click="closeAddPlanPopup"></uni-icons>
        </view>
        
        <scroll-view class="popup-content" scroll-y="true">
          <view class="form-item">
            <text class="form-label required">计划标题</text>
            <input 
              class="form-input" 
              v-model="newPlanForm.title" 
              placeholder="请输入计划标题"
              maxlength="50"
            />
          </view>

          <!-- 日计划 - 显示时间选择 -->
          <view class="form-item" v-if="currentTab === 0">
            <text class="form-label required">执行时间</text>
            <picker 
              class="picker-wrapper" 
              mode="time" 
              :value="newPlanForm.dayTime"
              @change="onNewTimeChange"
            >
              <view class="picker-input" :class="{ placeholder: !newPlanForm.dayTime }">
                <text>{{ newPlanForm.dayTime || '请选择时间' }}</text>
                <uni-icons type="calendar" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- 周计划 - 显示星期选择 -->
          <view class="form-item" v-if="currentTab === 1">
            <text class="form-label required">星期</text>
            <picker 
              class="picker-wrapper" 
              mode="selector" 
              :range="weekList"
              :value="weekPickerIndex"
              @change="onNewWeekChange"
            >
              <view class="picker-input" :class="{ placeholder: newPlanForm.weekIndex === null }">
                <text>{{ weekPickerText }}</text>
                <uni-icons type="down" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>

          <!-- 月计划 - 显示第几周选择 -->
          <view class="form-item" v-if="currentTab === 2">
            <text class="form-label required">第几周</text>
            <picker 
              class="picker-wrapper" 
              mode="selector" 
              :range="monthWeekList"
              :value="newPlanForm.monthIndex ? newPlanForm.monthIndex - 1 : 0"
              @change="onNewMonthWeekChange"
            >
              <view class="picker-input" :class="{ placeholder: !newPlanForm.monthIndex }">
                <text>{{ newPlanForm.monthIndex ? `第${newPlanForm.monthIndex}周` : '请选择第几周' }}</text>
                <uni-icons type="down" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>

          <view class="form-item-row">
            <view class="form-item half">
              <text class="form-label required">生效日期</text>
              <picker 
                class="picker-wrapper" 
                mode="date" 
                :value="newEffectiveDateStr"
                @change="onNewEffectiveDateChange"
              >
                <view class="picker-input" :class="{ placeholder: !newEffectiveDateStr }">
                  <text>{{ newEffectiveDateStr || '请选择生效日期' }}</text>
                  <uni-icons type="calendar" size="16" color="#999"></uni-icons>
                </view>
              </picker>
            </view>

            <view class="form-item half">
              <text class="form-label">终止日期</text>
              <picker 
                class="picker-wrapper" 
                mode="date" 
                :value="newEndDateStr"
                @change="onNewEndDateChange"
              >
                <view class="picker-input" :class="{ placeholder: !newEndDateStr }">
                  <text>{{ newEndDateStr || '请选择终止日期' }}</text>
                  <uni-icons type="calendar" size="16" color="#999"></uni-icons>
                </view>
              </picker>
              <text class="form-hint">注：不填代表长期有效</text>
            </view>
          </view>

          <view class="form-item">
            <text class="form-label required">计划内容</text>
            <textarea 
              class="form-textarea" 
              v-model="newPlanForm.content" 
              placeholder="请输入计划内容"
              maxlength="500"
            ></textarea>
            <text class="char-count">{{ newPlanForm.content.length }}/500</text>
          </view>

          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="newPlanForm.remark" 
              placeholder="请输入备注"
              maxlength="300"
            ></textarea>
            <text class="char-count">{{ newPlanForm.remark.length }}/300</text>
          </view>
        </scroll-view>
        
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeAddPlanPopup">取消</button>
          <button class="confirm-btn" @click="confirmAddPlan" :loading="submitting">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { listDevicePlanCurrent, addDevicePlan } from '@/api/deviceplan'
import { addCompletionlogs } from '@/api/completionlogs'
import { getDicts } from '@/api/system/dict/data'
import { resetDeviceNetwork } from '@/api/device'

export default {
  data() {
    return {
      productKey: '',
      device: '',
      deviceId: '',
      plansList: [], // 当前标签页的计划列表
      allPlans: {    // 存储所有计划
        daily: [],
        weekly: [],
        monthly: []
      },
      loading: false,
      currentTab: 0, // 0: 日计划, 1: 周计划, 2: 月计划
      // 字典数据
      dictData: {
        dev_plan_type: [],
        plan_is_completed: []
      },
      // 新增计划表单
      submitting: false,
      newPlanForm: {
        title: '',
        content: '',
        dayTime: '',
        weekIndex: null,
        monthIndex: null,
        effectiveDate: null,
        endDate: null,
        remark: ''
      },
      // 星期列表（显示顺序：星期一到星期日）
      weekList: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
      // 星期索引映射（选择器索引 -> 后端weekIndex值）
      weekIndexMap: [1, 2, 3, 4, 5, 6, 7], // 星期一=1, 星期二=2, ..., 星期日=7
      // 月份周数列表 第1-5周
      monthWeekList: Array.from({ length: 5 }, (_, i) => `第${i + 1}周`)
    }
  },
  
  computed: {
    // 根据当前标签页过滤计划
    filteredPlans() {
      // 确保 plansList 是数组
      if (!Array.isArray(this.plansList)) {
        return []
      }
      
      // 根据当前标签页返回对应的计划列表
      // currentTab: 0-日计划, 1-周计划, 2-月计划
      return this.plansList
    },
    // 生效日期字符串
    newEffectiveDateStr() {
      return this.newPlanForm.effectiveDate ? this.formatDate(this.newPlanForm.effectiveDate) : ''
    },
    // 终止日期字符串
    newEndDateStr() {
      return this.newPlanForm.endDate ? this.formatDate(this.newPlanForm.endDate) : ''
    },
    // 选择器显示的星期索引（后端weekIndex -> 选择器索引）
    weekPickerIndex() {
      if (this.newPlanForm.weekIndex === null) return null
      // 反向映射：1->0, 2->1, 3->2, 4->3, 5->4, 6->5, 7->6
      return Number(this.newPlanForm.weekIndex) - 1
    },
    // 选择器显示的星期文本
    weekPickerText() {
      if (this.newPlanForm.weekIndex === null) return '请选择星期'
      const pickerIndex = this.weekPickerIndex
      return this.weekList[pickerIndex]
    }
  },
  
  onLoad(options) {
    console.log('detail.vue onLoad options:', options)
    if (options.productKey && options.device) {
      this.productKey = options.productKey
      this.device = options.device
      this.deviceId = options.deviceId || ''
      
      console.log('deviceId:', this.deviceId, 'productKey:', this.productKey, 'device:', this.device)
      
      this.loadDictData()
      this.loadCurrentPlans()
    } else {
      uni.showToast({
        title: '缺少设备参数',
        icon: 'none'
      })
    }
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.loadCurrentPlans().then(() => {
      uni.stopPullDownRefresh()
    }).catch(() => {
      uni.stopPullDownRefresh()
    })
  },
  
  methods: {
    // 加载字典数据
    async loadDictData() {
      try {
        const [planType, isCompleted] = await Promise.all([
          getDicts('dev_plan_type'),
          getDicts('plan_is_completed')
        ])
        
        if (planType.code === 200 && planType.data) {
          this.dictData.dev_plan_type = planType.data
        }
        
        if (isCompleted.code === 200 && isCompleted.data) {
          this.dictData.plan_is_completed = isCompleted.data
        }
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },
    
    // 获取字典标签
    getDictLabel(dictType, dictValue) {
      if (dictValue === undefined || dictValue === null) {
        return ''
      }
      const dictList = this.dictData[dictType] || []
      const dictItem = dictList.find(item => String(item.dictValue) === String(dictValue))
      return dictItem ? dictItem.dictLabel : String(dictValue)
    },
    
    // 格式化日期
    formatDate(timestamp) {
      if (!timestamp) return '-'
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 加载当前生效的计划列表
    async loadCurrentPlans() {
      this.loading = true
      try {
        const res = await listDevicePlanCurrent({
          productKey: this.productKey,
          device: this.device
        })
        
        console.log('加载计划列表响应:', res)
        
        if (res.code === 200 && res.data) {
          const data = res.data
          
          console.log('计划数据:', data)
          console.log('日计划数量:', data.daily?.length, '周计划数量:', data.weekly?.length, '月计划数量:', data.monthly?.length)
          
          // 存储所有计划数据
          this.allPlans = {
            daily: Array.isArray(data.daily) ? data.daily : [],
            weekly: Array.isArray(data.weekly) ? data.weekly : [],
            monthly: Array.isArray(data.monthly) ? data.monthly : []
          }
          
          // 根据当前标签页设置显示的计划列表
          this.updatePlansList()
        } else {
          this.allPlans = { daily: [], weekly: [], monthly: [] }
          this.plansList = []
          uni.showToast({
            title: res.msg || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载计划列表失败:', error)
        this.allPlans = { daily: [], weekly: [], monthly: [] }
        this.plansList = []
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 根据当前标签页更新计划列表
    updatePlansList() {
      if (this.currentTab === 0) {
        this.plansList = this.allPlans.daily
      } else if (this.currentTab === 1) {
        this.plansList = this.allPlans.weekly
      } else if (this.currentTab === 2) {
        this.plansList = this.allPlans.monthly
      }
    },
    
    // 切换标签页
    switchTab(index) {
      this.currentTab = index
      this.updatePlansList()
    },
    
    // 获取计划时间文本
    getPlanTimeText(plan) {
      if (plan.planType === '1' || plan.planType === 1) {
        // 日计划，显示时间
        return plan.dayTime || '-'
      } else if (plan.planType === '2' || plan.planType === 2) {
        // 周计划，显示星期
        // weekIndex: 1=星期一, 2=星期二, ..., 7=星期日
        const weekMap = ['', '一', '二', '三', '四', '五', '六', '日']
        const weekIndex = Number(plan.weekIndex)
        return weekIndex >= 1 && weekIndex <= 7 ? `星期${weekMap[weekIndex]}` : '-'
      } else if (plan.planType === '3' || plan.planType === 3) {
        // 月计划，显示第几周
        return plan.monthIndex ? `第${plan.monthIndex}周` : '-'
      }
      return '-'
    },
    
    // 获取状态类名
    getStatusClass(plan) {
      const isCompleted = plan.isCompleted
      return String(isCompleted) === '1' ? 'completed' : 'incomplete'
    },
    
    // 获取状态文本
    getStatusText(plan) {
      return this.getDictLabel('plan_is_completed', plan.isCompleted)
    },
    
    // 获取空状态文本
    getEmptyText() {
      const typeMap = ['日计划', '周计划', '月计划']
      return `暂无${typeMap[this.currentTab]}`
    },
    
    // 获取新增按钮文本
    getAddButtonText() {
      const typeMap = ['新增日计划', '新增周计划', '新增月计划']
      return typeMap[this.currentTab]
    },
    
    // 同步/更新计划
    async handleSync() {
      try {
        uni.showLoading({ title: '同步中...' })
        
        // 1. 调用设备服务接口，通知设备同步计划
        try {
          await resetDeviceNetwork({
            productKey: this.productKey,
            deviceKey: this.device,
            ack: 1,
            function: 'plan',
            propertyValue: { plan: 1 },
            type: null,
            address: null
          })
          console.log('设备计划同步指令发送成功')
        } catch (syncError) {
          console.error('设备计划同步指令发送失败:', syncError)
        }
        
        // 2. 重新加载计划列表
        await this.loadCurrentPlans()
        
        uni.hideLoading()
        uni.showToast({
          title: '同步成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('同步失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '同步失败',
          icon: 'none'
        })
      }
    },
    // 新增计划
    handleAddPlan() {
      // 重置表单
      this.resetNewPlanForm()
      // 打开新增计划弹窗
      this.$refs.addPlanPopup.open()
    },
    
    // 重置新增计划表单
    resetNewPlanForm() {
      this.newPlanForm = {
        title: '',
        content: '',
        dayTime: '',
        weekIndex: null,
        monthIndex: null,
        effectiveDate: null,
        endDate: null,
        remark: ''
      }
    },
    
    // 关闭新增计划弹窗
    closeAddPlanPopup() {
      this.$refs.addPlanPopup.close()
    },
    
    // 时间变更（日计划）
    onNewTimeChange(e) {
      this.newPlanForm.dayTime = e.detail.value
    },
    
    // 星期变更（周计划）
    onNewWeekChange(e) {
      const pickerIndex = e.detail.value // 选择器的索引 0-6
      this.newPlanForm.weekIndex = this.weekIndexMap[pickerIndex] // 映射到后端的 weekIndex
    },
    
    // 月份周数变更（月计划）
    onNewMonthWeekChange(e) {
      this.newPlanForm.monthIndex = Number(e.detail.value) + 1
    },
    
    // 生效日期变更
    onNewEffectiveDateChange(e) {
      const dateStr = e.detail.value
      // 确保时间戳是当天的 00:00:00
      const date = new Date(dateStr)
      this.newPlanForm.effectiveDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    },
    
    // 终止日期变更
    onNewEndDateChange(e) {
      const dateStr = e.detail.value
      if (dateStr) {
        // 确保时间戳是当天的 00:00:00
        const date = new Date(dateStr)
        this.newPlanForm.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      } else {
        this.newPlanForm.endDate = null
      }
    },
    
    // 确认新增计划
    async confirmAddPlan() {
      // 表单验证
      if (!this.newPlanForm.title.trim()) {
        uni.showToast({ title: '请输入计划标题', icon: 'none' })
        return
      }
      
      if (!this.newPlanForm.content.trim()) {
        uni.showToast({ title: '请输入计划内容', icon: 'none' })
        return
      }
      
      // 根据计划类型验证规则
      const planType = String(this.currentTab + 1) // 0->1, 1->2, 2->3
      
      if (planType === '1' && !this.newPlanForm.dayTime) {
        uni.showToast({ title: '请选择执行时间', icon: 'none' })
        return
      }
      
      if (planType === '2' && this.newPlanForm.weekIndex === null) {
        uni.showToast({ title: '请选择星期', icon: 'none' })
        return
      }
      
      if (planType === '3' && !this.newPlanForm.monthIndex) {
        uni.showToast({ title: '请选择第几周', icon: 'none' })
        return
      }
      
      if (!this.newPlanForm.effectiveDate) {
        uni.showToast({ title: '请选择生效日期', icon: 'none' })
        return
      }
      
      this.submitting = true
      
      try {
        const data = {
          deviceId: Number(this.deviceId),
          deviceKey: this.device,
          productKey: this.productKey,
          deviceInfo: [this.deviceId + '-' + this.productKey + '-' + this.device],
          title: this.newPlanForm.title.trim(),
          planType: planType,
          dayTime: this.newPlanForm.dayTime || null,
          weekIndex: this.newPlanForm.weekIndex !== null ? String(this.newPlanForm.weekIndex) : null,
          monthIndex: this.newPlanForm.monthIndex !== null ? String(this.newPlanForm.monthIndex) : null,
          content: this.newPlanForm.content.trim(),
          effectiveDate: this.newPlanForm.effectiveDate,
          endDate: this.newPlanForm.endDate || '',
          remark: this.newPlanForm.remark.trim()
        }
        
        console.log('提交计划数据:', data)
        console.log('weekIndex 类型:', typeof data.weekIndex, 'weekIndex 值:', data.weekIndex)
        
        const res = await addDevicePlan(data)
        
        if (res.code === 200) {
          // 调用设备服务接口，同步计划到设备
          try {
            await resetDeviceNetwork({
              productKey: this.productKey,
              deviceKey: this.device,
              ack: 1,
              function: 'plan',
              propertyValue: { plan: 1 },
              type: null,
              address: null
            })
            console.log('设备计划同步成功')
          } catch (syncError) {
            console.error('设备计划同步失败:', syncError)
            // 同步失败不影响主流程，只记录日志
          }
          
          uni.showToast({
            title: '添加成功',
            icon: 'success'
          })
          
          this.closeAddPlanPopup()
          // 重新加载计划列表
          this.loadCurrentPlans()
        } else {
          uni.showToast({
            title: res.msg || '添加失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('添加计划失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    },
    
    // 确认完成
    async handleConfirmComplete(plan) {
      try {
        uni.showLoading({ title: '提交中...' })
        
        const res = await addCompletionlogs({
          planId: plan.planId,
          isCompleted: '1',
          completionTime: Date.now(),
          completionNotes: '手动确认完成'
        })
        
        if (res.code === 200) {
          uni.showToast({
            title: '确认成功',
            icon: 'success'
          })
          
          // 重新加载计划列表
          this.loadCurrentPlans()
        } else {
          uni.showToast({
            title: res.msg || '确认失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('确认完成失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.plan-detail-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f9f9 0%, #f5f7fa 100%);
  padding: 24rpx;
  padding-bottom: 180rpx;
}

/* 右下角悬浮同步按钮 */
.float-sync-container {
  position: fixed;
  right: 32rpx;
  bottom: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  z-index: 99;
}

.float-sync-btn {
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ec6c6 0%, #2da8a8 100%);
  box-shadow: 0 8rpx 24rpx rgba(62, 198, 198, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* 添加旋转动画 */
  animation: float 3s ease-in-out infinite;
}

.float-sync-text {
  font-size: 22rpx;
  color: #3ec6c6;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.95);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.float-sync-container:active .float-sync-btn {
  transform: scale(0.9) rotate(180deg);
  transition: all 0.3s ease;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8rpx);
  }
}

/* Tabs Styles */
.tabs {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 0;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
  
  .tab-item {
    flex: 1;
    padding: 32rpx 0;
    font-size: 30rpx;
    color: #999;
    position: relative;
    text-align: center;
    transition: all 0.3s ease;
    
    &.active {
      color: #3ec6c6;
      font-weight: 600;
      background: linear-gradient(180deg, rgba(62, 198, 198, 0.05) 0%, transparent 100%);
    }
    
    .active-line {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80rpx;
      height: 8rpx;
      background: linear-gradient(90deg, #3ec6c6 0%, #2da8a8 100%);
      border-radius: 4rpx 4rpx 0 0;
      box-shadow: 0 -2rpx 8rpx rgba(62, 198, 198, 0.3);
    }
  }
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.plan-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 24rpx;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
  
  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    border-color: rgba(62, 198, 198, 0.1);
  }
}

.plan-number {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3ec6c6 0%, #2da8a8 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
}

.plan-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  min-width: 0;
}

.plan-time {
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
  letter-spacing: 1rpx;
}

.plan-content {
  font-size: 26rpx;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plan-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12rpx;
  flex-shrink: 0;
  
  .completed {
    font-size: 24rpx;
    color: #fff;
    font-weight: 600;
    padding: 12rpx 24rpx;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border-radius: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.3);
    letter-spacing: 1rpx;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '✓ ';
      font-weight: bold;
      margin-right: 4rpx;
    }
    
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: rotate(45deg);
    }
  }
  
  .incomplete {
    font-size: 22rpx;
    color: #FF9800;
    font-weight: 500;
    padding: 6rpx 16rpx;
    background: rgba(255, 152, 0, 0.12);
    border-radius: 20rpx;
    border: 1rpx solid rgba(255, 152, 0, 0.2);
  }
}

.confirm-btn {
  padding: 10rpx 28rpx;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 24rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.25);
  min-width: 120rpx;
  
  &::after {
    border: none;
  }
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.25);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
  color: #999;
  font-size: 28rpx;
  
  image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
    opacity: 0.4;
  }
  
  text {
    color: #bbb;
    font-size: 30rpx;
  }
}

.sync-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20rpx 24rpx calc(20rpx + constant(safe-area-inset-bottom));
  padding: 20rpx 24rpx calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.sync-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2da8a8 100%);
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.8;
  }
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8rpx);
  
  .loading-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
  }
}

.add-btn-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx 32rpx calc(24rpx + constant(safe-area-inset-bottom));
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  z-index: 100;
}

.add-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2da8a8 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.9;
    transform: scale(0.98);
  }
}

/* 新增计划弹窗样式 */
.add-plan-popup {
  width: 680rpx;
  max-height: 85vh;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  background: #fafafa;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
  text-align: center;
  padding-left: 48rpx;
}

.popup-content {
  flex: 1;
  padding: 32rpx;
  max-height: 60vh;
}

.form-item {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &.half {
    flex: 1;
  }
}

.form-item-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
  
  &.required::before {
    content: '* ';
    color: #f44336;
    font-weight: bold;
  }
}

.form-hint {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  background: #fff;
  box-sizing: border-box;
  
  &:focus {
    border-color: #3ec6c6;
  }
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  background: #fff;
  box-sizing: border-box;
  resize: none;
  
  &:focus {
    border-color: #3ec6c6;
  }
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #999;
  margin-top: 8rpx;
}

.picker-wrapper {
  width: 100%;
}

.picker-input {
  width: 100%;
  height: 80rpx;
  background-color: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
  
  &.placeholder text {
    color: #999;
  }
}

.popup-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  border-top: 1rpx solid #f0f0f0;
  background: #fafafa;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  
  &::after {
    border: none;
  }
}

.confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  background: #3ec6c6;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  
  &::after {
    border: none;
  }
  
  &:active {
    opacity: 0.8;
  }
}
</style>
