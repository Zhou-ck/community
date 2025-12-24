<template>
  <view class="device-container">
    <!-- 顶部统计 -->
    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-icon">
          <uni-icons type="home-filled" size="24" color="#3ec6c6"></uni-icons>
        </view>
        <view class="stat-info">
          <text class="stat-value">{{ deviceList.length }}</text>
          <text class="stat-label">设备总数</text>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-icon online">
          <uni-icons type="checkmarkempty" size="18" color="#fff"></uni-icons>
        </view>
        <view class="stat-info">
          <text class="stat-value">{{ onlineCount }}</text>
          <text class="stat-label">在线设备</text>
        </view>
      </view>
      <view class="stat-card">
        <view class="stat-icon offline">
          <uni-icons type="close" size="24" color="#fff"></uni-icons>
        </view>
        <view class="stat-info">
          <text class="stat-value">{{ offlineCount }}</text>
          <text class="stat-label">离线设备</text>
        </view>
      </view>
    </view>

    <!-- 设备列表 -->
    <view class="device-grid">
      <view 
        v-for="(device, index) in deviceList" 
        :key="device.deviceId"
        class="device-card"
        @click="goToDeviceDetail(device)"
      >
        <!-- 设备头部信息 -->
        <view class="card-header">
          <!-- 第一行：设备名称 + 在线状态 -->
          <view class="header-top-row">
            <text class="device-name">{{ device.deviceAlias || device.deviceKey }}</text>
            <view class="status-tag" :class="{ 'online': device.onlineStatus === '1', 'offline': device.onlineStatus !== '1' }">
              <text class="status-dot"></text>
              <text>{{ getDictLabel('dev_online_status', device.onlineStatus) }}</text>
            </view>
          </view>
          
          <!-- 第二行：图标 + 信息 -->
          <view class="header-main-content">
            <view class="device-avatar" :class="{'has-icon': getDeviceIcon(device.deviceType)}">
              <image 
                v-if="getDeviceIcon(device.deviceType)" 
                :src="getDeviceIcon(device.deviceType)" 
                class="avatar-img"
                mode="aspectFit"
              ></image>
              <text v-else class="avatar-text">{{ (device.deviceAlias || device.deviceKey).charAt(0) }}</text>
            </view>
            
            <view class="header-info-col">
              <view class="device-type-badge">
                <text>{{ getDictLabel('dev_device_type', device.deviceType) }}</text>
              </view>
              <view class="mini-info-row">
                <uni-icons type="location" size="12" color="#999"></uni-icons>
                <text class="info-text text-ellipsis">{{ device.installAddress || '暂无位置' }}</text>
              </view>
              <view class="mini-info-row">
                <uni-icons type="info" size="12" color="#999"></uni-icons>
                <text class="info-text text-ellipsis">Key: {{ device.deviceKey }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 操作按钮 -->
        <view class="card-actions" @click.stop>
          <view class="action-row">
            <button class="action-btn secondary" @click="editDevice(device)">
              <uni-icons type="compose" size="16" color="#3ec6c6"></uni-icons>
              <text>修改</text>
            </button>
            <button class="action-btn danger" @click="unbindDevice(device)">
              <uni-icons type="trash" size="16" color="#ff5555"></uni-icons>
              <text>解绑</text>
            </button>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="deviceList.length === 0 && !loading" class="empty-box">
        <view class="empty-icon-wrapper">
          <uni-icons type="gear" size="80" color="#3ec6c6"></uni-icons>
        </view>
        <text class="empty-text">还没有添加设备</text>
        <text class="empty-tip">点击下方按钮添加您的第一台智能设备</text>
        <view class="empty-features">
          <view class="feature-item">
            <uni-icons type="checkmarkempty" size="16" color="#3ec6c6"></uni-icons>
            <text>实时监控设备状态</text>
          </view>
          <view class="feature-item">
            <uni-icons type="checkmarkempty" size="16" color="#3ec6c6"></uni-icons>
            <text>远程控制管理</text>
          </view>
          <view class="feature-item">
            <uni-icons type="checkmarkempty" size="16" color="#3ec6c6"></uni-icons>
            <text>异常告警通知</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加设备按钮 -->
    <view class="add-btn-box">
      <button class="add-btn" @click="addDevice">
        <uni-icons type="plusempty" size="20" color="#fff"></uni-icons>
        <text class="add-btn-text">添加设备</text>
      </button>
    </view>


    <!-- 添加设备弹窗 -->
    <uni-popup ref="addDevicePopup" type="center" :mask-click="false">
      <view class="add-device-popup">
        <view class="popup-header">
          <text class="popup-title">添加设备管理</text>
          <uni-icons type="close" size="24" color="#666" @click="closeAddDevice"></uni-icons>
        </view>
        
        <view class="popup-content">
          <view class="form-item">
            <text class="form-label required">设备编号</text>
            <view class="input-with-scan">
              <input 
                class="form-input scan-input" 
                v-model="addForm.deviceKey" 
                placeholder="请输入设备编号"
                maxlength="50"
              />
              <button class="scan-btn" @click="scanQRCode">
                <uni-icons type="scan" size="20" color="#fff"></uni-icons>
                <text>扫码</text>
              </button>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label required">设备别名</text>
            <input 
              class="form-input" 
              v-model="addForm.deviceAlias" 
              placeholder="请输入设备别名"
              maxlength="50"
            />
          </view>

          <view class="form-item">
            <text class="form-label">安装位置</text>
            <input 
              class="form-input" 
              v-model="addForm.installAddress" 
              placeholder="请输入安装位置（选填）"
              maxlength="100"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="addForm.remark" 
              placeholder="请输入内容"
              maxlength="300"
            ></textarea>
            <text class="char-count">{{ addForm.remark.length }}/300</text>
          </view>
        </view>
        
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeAddDevice">取消</button>
          <button class="confirm-btn" @click="confirmAddDevice" :loading="submitting">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 修改设备弹窗 -->
    <uni-popup ref="editDevicePopup" type="center" :mask-click="false">
      <view class="add-device-popup">
        <view class="popup-header">
          <text class="popup-title">修改设备管理</text>
          <uni-icons type="close" size="24" color="#666" @click="closeEditDevice"></uni-icons>
        </view>
        
        <view class="popup-content">
          <view class="form-item">
            <text class="form-label">设备编号</text>
            <input 
              class="form-input disabled" 
              v-model="editForm.deviceKey" 
              placeholder="设备编号"
              disabled
            />
          </view>
          
          <view class="form-item">
            <text class="form-label required">设备别名</text>
            <input 
              class="form-input" 
              v-model="editForm.deviceAlias" 
              placeholder="请输入设备别名"
              maxlength="50"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">备注</text>
            <textarea 
              class="form-textarea" 
              v-model="editForm.remark" 
              placeholder="请输入内容"
              maxlength="300"
            ></textarea>
            <text class="char-count">{{ editForm.remark.length }}/300</text>
          </view>
        </view>
        
        <view class="popup-footer">
          <button class="cancel-btn" @click="closeEditDevice">取消</button>
          <button class="confirm-btn" @click="confirmEditDevice" :loading="submitting">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#4CAF50"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { listDevice, delDevice, addDevice, updateDevice } from '@/api/device'
import { getDicts } from '@/api/system/dict/data'
import { parseDeviceNumber } from '@/utils/parseDevNumber'

export default {
  data() {
    return {
      deviceList: [],
      loading: false,
      submitting: false,
      addForm: {
        deviceKey: '',
        deviceAlias: '',
        installAddress: '',
        remark: ''
      },
      editForm: {
        deviceId: '',
        deviceKey: '',
        deviceAlias: '',
        remark: ''
      },
      // 保存原始的编辑表单数据用于对比
      originalEditForm: {
        deviceAlias: '',
        remark: ''
      },
      // 字典数据
      dictData: {
        dev_device_type: [],
        dev_online_status: []
      }
    }
  },
  
  computed: {
    onlineCount() {
      return this.deviceList.filter(d => d.onlineStatus === '1').length
    },
    offlineCount() {
      return this.deviceList.filter(d => d.onlineStatus !== '1').length
    }
  },
  
  async onLoad() {
    await this.loadDictData()
    this.loadDeviceList()
  },
  
  onShow() {
    this.loadDeviceList()
  },
  
  methods: {
    // 加载字典数据
    async loadDictData() {
      try {
        const [deviceType, onlineStatus] = await Promise.all([
          getDicts('dev_device_type'),
          getDicts('dev_online_status')
        ])
        
        if (deviceType.code === 200 && deviceType.data) {
          this.dictData.dev_device_type = deviceType.data
        }
        
        if (onlineStatus.code === 200 && onlineStatus.data) {
          this.dictData.dev_online_status = onlineStatus.data
        }
        
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },
    
    // 加载设备列表
    async loadDeviceList() {
      this.loading = true
      try {
        const response = await listDevice({
          pageNum: 1,
          pageSize: 100
        })
        
        if (response.code === 200) {
          this.deviceList = response.rows || []
        } else {
          uni.showToast({
            title: response.msg || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载设备列表失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 获取设备图标
    getDeviceIcon(deviceType) {
      const type = String(deviceType)
      try {
        const iconMap = {
          '1': require('@/pages/my/static/breath.png'),      // 呼吸睡眠 Ld
          '2': require('@/pages/my/static/tumble.png'),      // 跌倒监测 Ed
          '4': require('@/pages/my/static/breath.png'),      // 呼吸睡眠-L2 La
          '13': require('@/pages/my/static/shuijin.png'),    // 水浸 Sd
          '14': require('@/pages/my/static/menci.png'),      // 门磁 Md
          '15': require('@/pages/my/static/yangan.png'),     // 烟感 Yd
          '16': require('@/pages/my/static/keranqiti.png'),  // 可燃气体 Rd
          '17': require('@/pages/my/static/hongwai.png'),    // 红外 Hd
          '18': require('@/pages/my/static/wenshidu.png'),   // 温湿度 Wd
          '19': require('@/pages/my/static/yiyanghuatan.png') // 一氧化碳 Td
        }
        return iconMap[type] || ''
      } catch (e) {
        console.warn('Device icon not found:', e)
        return ''
      }
    },
    
    // 获取设备类型名称
    getDeviceTypeName(deviceType) {
      return this.getDictLabel('dev_device_type', deviceType)
    },
    
    // 获取字典标签
    getDictLabel(dictType, dictValue) {
      const dictList = this.dictData[dictType] || []
      // 确保数据类型一致，将dictValue转为字符串进行比较
      const dictItem = dictList.find(item => String(item.dictValue) === String(dictValue))
      return dictItem ? dictItem.dictLabel : dictValue
    },
    
    
    
    
    
    
    // 解绑设备
    unbindDevice(device) {
      uni.showModal({
        title: '确认解绑',
        content: `确定要解绑设备"${device.deviceAlias || device.deviceKey}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            await this.deleteDevice(device.deviceId)
          }
        }
      })
    },
    
    // 删除设备
    async deleteDevice(deviceId) {
      try {
        uni.showLoading({ title: '解绑中...' })
        
        const response = await delDevice(deviceId)
        
        if (response.code === 200) {
          uni.showToast({
            title: '解绑成功',
            icon: 'success'
          })
          this.loadDeviceList()
        } else {
          uni.showToast({
            title: response.msg || '解绑失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('解绑设备失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 添加设备
    addDevice() {
      this.resetAddForm()
      this.$refs.addDevicePopup.open()
    },
    
    // 重置添加表单
    resetAddForm() {
      this.addForm = {
        deviceKey: '',
        deviceAlias: '',
        installAddress: '',
        remark: ''
      }
    },
    
    // 关闭添加设备弹窗
    closeAddDevice() {
      this.$refs.addDevicePopup.close()
      this.resetAddForm()
    },
    
    // 扫描二维码
    scanQRCode() {
      // 检查相机权限
      uni.authorize({
        scope: 'scope.camera',
        success: () => {
          this.performScan()
        },
        fail: () => {
          uni.showModal({
            title: '权限申请',
            content: '需要相机权限才能扫描二维码，请在设置中开启',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) {
                uni.openSetting()
              }
            }
          })
        }
      })
    },
    
    // 执行扫码
    performScan() {
      uni.scanCode({
        onlyFromCamera: true, // 只允许从相机扫码
        success: (res) => {
          console.log('扫码结果:', res.result)
          
          // 验证扫码结果是否为有效的设备编号
          if (res.result && res.result.length > 5) {
            this.addForm.deviceKey = res.result
            uni.showToast({
              title: '扫码成功',
              icon: 'success',
              duration: 1500
            })
          } else {
            uni.showToast({
              title: '无效的设备编号',
              icon: 'none'
            })
          }
        },
        fail: (err) => {
          console.error('扫码失败:', err)
          if (err.errMsg && err.errMsg.includes('cancel')) {
            // 用户取消扫码，不显示错误提示
            return
          }
          
          let errorMsg = '扫码失败'
          if (err.errMsg && err.errMsg.includes('permission')) {
            errorMsg = '相机权限被拒绝'
          } else if (err.errMsg && err.errMsg.includes('system')) {
            errorMsg = '系统错误，请重试'
          }
          
          uni.showToast({
            title: errorMsg,
            icon: 'none'
          })
        }
      })
    },
    
    // 跳转到设备详情页
    goToDeviceDetail(device) {
      uni.navigateTo({
        url: `/pages/my/device/detail?deviceId=${device.deviceId}&deviceKey=${device.deviceKey}`
      })
    },
    
    // 确认添加设备
    async confirmAddDevice() {
      // 表单验证
      if (!this.addForm.deviceKey.trim()) {
        uni.showToast({
          title: '请输入设备编号',
          icon: 'none'
        })
        return
      }
      
      if (!this.addForm.deviceAlias.trim()) {
        uni.showToast({
          title: '请输入设备别名',
          icon: 'none'
        })
        return
      }
      
      this.submitting = true
      
      try {
        const deviceNumBering = this.addForm.deviceKey.trim()
        
        // 使用工具类解析设备编号
        const parseResult = parseDeviceNumber(deviceNumBering)
        
        if (parseResult === -1) {
          uni.showToast({
            title: '设备编号格式有误',
            icon: 'none'
          })
          return
        }
        
        const response = await addDevice({
          deviceNumBering: deviceNumBering,
          productKey: parseResult.productKey,
          deviceKey: parseResult.deviceKey,
          deviceType: parseResult.deviceType,
          deviceAlias: this.addForm.deviceAlias.trim(),
          installAddress: this.addForm.installAddress.trim() || null,
          remark: this.addForm.remark.trim() || null
        })
        
        if (response.code === 200) {
          this.closeAddDevice()
          
          // 弹窗提示并询问是否配置网络
          uni.showModal({
            title: '添加成功',
            content: '设备添加成功，是否立即配置设备网络？',
            confirmText: '立即配置',
            cancelText: '稍后配置',
            success: (modalRes) => {
              if (modalRes.confirm) {
                // 跳转到配网页面
                const deviceInfo = response.data || response.rows || {}
                const params = {
                  deviceId: deviceInfo.deviceId || '',
                  productKey: parseResult.productKey,
                  deviceKey: parseResult.deviceKey
                }
                const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
                uni.navigateTo({
                  url: '/pages/my/network/index?' + query
                })
              } else {
                // 用户选择稍后配置，刷新设备列表
                this.loadDeviceList()
              }
            }
          })
        } else {
          uni.showToast({
            title: response.msg || '添加失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('添加设备失败:', error)
       
      } finally {
        this.submitting = false
      }
    },
    
    // 编辑设备
    editDevice(device) {
      // 填充编辑表单数据
      this.editForm = {
        deviceId: device.deviceId,
        deviceKey: device.deviceKey,
        deviceAlias: device.deviceAlias || '',
        remark: device.remark || ''
      }
      // 保存原始数据用于对比
      this.originalEditForm = {
        deviceAlias: device.deviceAlias || '',
        remark: device.remark || ''
      }
      // 打开编辑弹窗
      this.$refs.editDevicePopup.open()
    },
    
    // 重置修改表单
    resetEditForm() {
      this.editForm = {
        deviceId: '',
        deviceKey: '',
        deviceAlias: '',
        remark: ''
      }
    },
    
    // 关闭修改设备弹窗
    closeEditDevice() {
      this.$refs.editDevicePopup.close()
    },
    
    // 确认修改设备
    async confirmEditDevice() {
      // 表单验证
      if (!this.editForm.deviceAlias.trim()) {
        uni.showToast({
          title: '请输入设备别名',
          icon: 'none'
        })
        return
      }
      
      // 对比数据是否发生变化
      const currentAlias = this.editForm.deviceAlias.trim()
      const currentRemark = this.editForm.remark.trim()
      const originalAlias = this.originalEditForm.deviceAlias.trim()
      const originalRemark = this.originalEditForm.remark.trim()
      
      if (currentAlias === originalAlias && currentRemark === originalRemark) {
        uni.showToast({
          title: '数据未发生变化,无需提交',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      this.submitting = true
      
      try {
        const response = await updateDevice({
          deviceId: this.editForm.deviceId,
          deviceKey: this.editForm.deviceKey,
          deviceAlias: currentAlias,
          remark: currentRemark
        })
        
        if (response.code === 200) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          })
          
          this.closeEditDevice()
          this.loadDeviceList() // 重新加载设备列表
        } else {
          uni.showToast({
            title: response.msg || '修改失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('修改设备失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.device-container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

/* 统计卡片 */
.stats-section {
  display: flex;
  gap: 16rpx;
  margin: 24rpx;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.online {
    width: 48rpx;
    height: 48rpx;
    background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
  }
  
  &.offline {
    width: 48rpx;
    height: 48rpx;
    background: linear-gradient(135deg, #ff5555 0%, #ff4444 100%);
  }
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

/* 设备网格布局 */
.device-grid {
  padding: 24rpx;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20rpx;
}

.device-card {
  width: calc(50% - 12rpx); /* 稍微调整宽度计算 */
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.03);
  border: 1rpx solid rgba(0, 0, 0, 0.01);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4rpx);
    box-shadow: 0 16rpx 48rpx rgba(62, 198, 198, 0.08);
  }
}

.card-header {
  margin-bottom: 24rpx;
}

.header-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  gap: 16rpx;
}

.device-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #1a1a1a;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.5rpx;
}

.status-tag {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: 600;
  background: #f5f7fa;
  
  .status-dot {
    width: 10rpx;
    height: 10rpx;
    border-radius: 50%;
  }
  
  &.online {
    color: #3ec6c6;
    background: rgba(62, 198, 198, 0.12);
    .status-dot { background: #3ec6c6; }
  }
  
  &.offline {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.12);
    .status-dot { background: #ff6b6b; }
  }
}

.header-main-content {
  display: flex;
  gap: 24rpx;
  align-items: center;
}

.header-info-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  overflow: hidden;
  justify-content: center;
}

.device-type-badge {
  align-self: flex-start;
  font-size: 20rpx;
  color: #666;
  background: #f0f2f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  display: inline-block;
  font-weight: 500;
}

.mini-info-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
  
  .info-text {
    font-size: 22rpx;
    color: #909399;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.device-avatar {
  width: 108rpx;
  height: 108rpx;
  border-radius: 28rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2eb8b8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6rpx 16rpx rgba(62, 198, 198, 0.15);
  overflow: hidden;

  &.has-icon {
    background: #f8fdfd; /* 给图片加一个极淡的背景 */
    box-shadow: none;
    border: 1rpx solid rgba(62, 198, 198, 0.05);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
  }

  .avatar-text {
    font-size: 44rpx;
    color: #fff;
    font-weight: 600;
  }
}

.card-actions {
  margin-top: 16rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f9f9f9;
}

.action-row {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  border-radius: 30rpx; /* 更圆润的按钮 */
  font-size: 24rpx;
  border: none;
  transition: all 0.3s ease;
  font-weight: 600;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  &:active::before {
    left: 100%;
  }
  
  &.secondary {
    background: #eefbfb; /* 纯色背景 */
    color: #3ec6c6;
    border: none;
    box-shadow: none;
    
    &:active {
      background: #dcf5f5;
    }
  }
  
  &.danger {
    background: #fff0f0; /* 纯色背景 */
    color: #ff5555;
    border: none;
    box-shadow: none;
    
    &:active {
      background: #ffe0e0;
    }
  }
  
  text {
    font-size: 24rpx;
    line-height: 1;
  }
}

.device-body {
  background: #fafafa;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-top: 16rpx;
  
  .info-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }

    .info-icon {
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background: rgba(62, 198, 198, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-label {
      font-size: 28rpx;
      color: #666;
      font-weight: 500;
      min-width: 120rpx;
      text-align: left;
    }

    .info-value {
      font-size: 28rpx;
      color: #333;
      font-weight: 600;
      flex: 1;
      text-align: left;
      
      &.status-text {
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        font-weight: bold;
        display: inline-block;
        
        &.online {
          color: #fff;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
        }
        
        &.offline {
          color: #fff;
          background: linear-gradient(135deg, #ff5555 0%, #ff4444 100%);
          box-shadow: 0 2rpx 8rpx rgba(255, 85, 85, 0.3);
        }
      }
      
      &.device-key,
      &.product-key {
        font-family: 'Courier New', monospace;
        font-size: 24rpx;
        color: #666;
        background: #f8f9fa;
        padding: 8rpx 12rpx;
        border-radius: 8rpx;
        border: 1rpx solid #e9ecef;
        word-break: break-all;
      }
    }
    
    .defense-switch {
      transform: scale(0.8);
      margin-left: auto;
    }
  }
}

/* 空状态 */
.empty-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.03);

  .empty-icon-wrapper {
    width: 180rpx;
    height: 180rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(62, 198, 198, 0.1) 0%, rgba(62, 198, 198, 0.05) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40rpx;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      width: 220rpx;
      height: 220rpx;
      border-radius: 50%;
      border: 2rpx dashed rgba(62, 198, 198, 0.3);
      animation: rotate 20s linear infinite;
    }
  }

  .empty-text {
    font-size: 34rpx;
    color: #333;
    font-weight: 600;
    margin-bottom: 16rpx;
  }

  .empty-tip {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 40rpx;
  }
  
  .empty-features {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding: 32rpx 50rpx;
    background: #f8fdfd;
    border-radius: 16rpx;
    align-self: center;
    
    .feature-item {
      display: flex;
      align-items: center;
      gap: 16rpx;
      
      text {
        font-size: 26rpx;
        color: #666;
      }
    }
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 底部添加按钮 */
.add-btn-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx;
  background: #fff;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

  .add-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
    color: #fff;
    border: none;
    border-radius: 44rpx;
    font-size: 32rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);

    .add-btn-text {
      color: #fff;
    }
  }
}

/* 弹窗样式 */
.detail-popup,
.setting-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.add-device-popup {
  background: #fff;
  border-radius: 16rpx;
  width: 600rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #e0e0e0;
  position: relative;
}

.popup-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}

.popup-header .uni-icons {
  flex-shrink: 0;
}

.popup-content {
  flex: 1;
  padding: 24rpx;
  overflow-y: auto;
  background: #f8f9fa;
}

.detail-section,
.setting-section {
  padding: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
  
  .defense-switch {
    transform: scale(0.8);
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin: 0 0 24rpx 0;
  padding: 0 0 16rpx 0;
  border-bottom: 2rpx solid #f0f0f0;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -2rpx;
    width: 60rpx;
    height: 2rpx;
    background: #667eea;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #fafafa;
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 400;
  min-width: 160rpx;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  text-align: right;
  flex: 1;
  word-break: break-all;
}


.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.setting-label {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.setting-desc {
  font-size: 22rpx;
  color: #999;
}

.setting-tip {
  font-size: 24rpx;
  color: #999;
  margin-left: 16rpx;
}

.popup-footer {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #e0e0e0;
}

.save-btn {
  width: 100%;
  background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
  color: #fff;
  border: none;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: bold;
}

/* 加载状态 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-text {
  font-size: 28rpx;
  color: #fff;
  margin-top: 20rpx;
}

/* 添加设备弹窗样式 */
.form-item {
  margin-bottom: 32rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  
  &.required::before {
    content: '*';
    color: #f44336;
    margin-right: 4rpx;
  }
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  
  &:focus {
    border-color: #667eea;
  }
  
  &.disabled {
    background: #f5f5f5;
    color: #999;
    border-color: #ddd;
  }
  
  &.scan-input {
    flex: 1;
    margin-right: 16rpx;
  }
}

.input-with-scan {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.scan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  padding: 0 24rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
  border: none;
  border-radius: 12rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 2rpx 8rpx rgba(62, 198, 198, 0.4);
    
    &::before {
      left: 100%;
    }
  }
  
  &:hover::before {
    left: 100%;
  }
  
  text {
    margin: 0;
    position: relative;
    z-index: 1;
  }
}

.form-textarea {
  width: 100%;
  min-height: 120rpx;
  padding: 16rpx 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  resize: none;
  
  &:focus {
    border-color: #667eea;
  }
}

.char-count {
  display: block;
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.popup-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #e0e0e0;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  line-height: 80rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 30rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.cancel-btn::after,
.confirm-btn::after {
  border: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #3ec6c6 0%, #36b3b3 100%);
  color: #fff;
}
</style>
