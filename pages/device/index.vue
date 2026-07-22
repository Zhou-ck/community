<template>
  <view class="page-wrapper">
    <scroll-view 
      class="device-container"
      scroll-y
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
    <!-- 顶部统计 -->
    <view class="stats-section">
      <view class="stat-card">
        <view class="stat-icon">
          <uni-icons type="home-filled" size="24" color="#E07A4F"></uni-icons>
        </view>
        <view class="stat-info">
          <text class="stat-value">{{ totalCount }}</text>
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
        v-for="device in deviceList" 
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
              <view class="device-badges">
                <view class="device-type-badge">
                  <text>{{ getDictLabel('dev_device_type', device.deviceType) }}</text>
                </view>
                <view class="source-type-badge" :class="{ 'self-purchased': device.sourceType === '1', 'community-assigned': device.sourceType === '2' }">
                  <text>{{ getSourceTypeLabel(device.sourceType) }}</text>
                </view>
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
              <uni-icons type="compose" size="16" color="#E07A4F"></uni-icons>
              <text>修改</text>
            </button>
            <button class="action-btn danger" @click="unbindDevice(device)">
              <uni-icons type="trash" size="16" color="#D95C5C"></uni-icons>
              <text>解绑</text>
            </button>
          </view>
        </view>
      </view>
      
      <!-- 加载更多提示 -->
      <view v-if="deviceList.length > 0" class="load-more-tip">
        <text v-if="loadingMore">加载中...</text>
        <text v-else-if="!hasMore">没有更多设备了</text>
        <text v-else>上拉加载更多</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="deviceList.length === 0 && !loading" class="empty-box">
        <view class="empty-icon-wrapper">
          <uni-icons type="gear" size="80" color="#E07A4F"></uni-icons>
        </view>
        <text class="empty-text">还没有添加设备</text>
        <text class="empty-tip">点击下方按钮添加您的第一台智能设备</text>
        <view class="empty-features">
          <view class="feature-item">
            <uni-icons type="checkmarkempty" size="16" color="#E07A4F"></uni-icons>
            <text>实时监控设备状态</text>
          </view>
          <view class="feature-item">
            <uni-icons type="checkmarkempty" size="16" color="#E07A4F"></uni-icons>
            <text>远程控制管理</text>
          </view>
          <view class="feature-item">
            <uni-icons type="checkmarkempty" size="16" color="#E07A4F"></uni-icons>
            <text>异常告警通知</text>
          </view>
        </view>
      </view>
    </view>

    </scroll-view>

    <!-- 添加设备按钮（右上角圆形 FAB） -->
    <view class="add-fab press-card" @click="addDevice">
      <uni-icons type="plusempty" size="24" color="#fff"></uni-icons>
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
            <text class="form-label required">设备类型</text>
            <picker 
              mode="selector" 
              :range="deviceTypeOptions" 
              range-key="dictLabel"
              :value="deviceTypeIndex"
              @change="onDeviceTypeChange"
            >
              <view class="form-picker">
                <text :class="{'placeholder': !addForm.deviceType}">
                  {{ addForm.deviceType ? getDeviceTypeName(addForm.deviceType) : '请选择设备类型' }}
                </text>
                <uni-icons type="arrowdown" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>
          
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
            <text class="form-label">安装位置</text>
            <input 
              class="form-input" 
              v-model="editForm.installAddress" 
              placeholder="请输入安装位置（选填）"
              maxlength="100"
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
    <view v-if="loading && !isRefreshing" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#5AAB7A"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import { listDevice, delDevice, addDevice, updateDevice, getAepDevice, getIwownDeviceByImei } from '@/api/device'
import { getDicts } from '@/api/system/dict/data'
import { parseDeviceNumber } from '@/utils/parseDevNumber'
import SkeletonLoader from '@/components/skeleton/index.vue'

export default {
  components: { SkeletonLoader },
  data() {
    return {
      deviceList: [],
      loading: false,
      submitting: false,
      // 分页相关
      pageNum: 1,
      pageSize: 10,
      totalCount: 0,
      onlineCount: 0,
      offlineCount: 0,
      hasMore: true,
      loadingMore: false,
      isRefreshing: false,
      addForm: {
        deviceType: '',
        deviceKey: '',
        deviceAlias: '',
        installAddress: '',
        remark: ''
      },
      deviceTypeIndex: 0,
      editForm: {
        deviceId: '',
        deviceKey: '',
        deviceAlias: '',
        installAddress: '',
        remark: ''
      },
      // 保存原始的编辑表单数据用于对比
      originalEditForm: {
        deviceAlias: '',
        installAddress: '',
        remark: ''
      },
      // 本地设备类型配置
      localDeviceTypes: [
        { dictValue: '1', dictLabel: '睡眠-L1' },
        { dictValue: '2', dictLabel: '跌倒' },
        { dictValue: '4', dictLabel: '睡眠-L2' },
        { dictValue: '13', dictLabel: '水浸' },
        { dictValue: '14', dictLabel: '门磁' },
        { dictValue: '15', dictLabel: '烟感' },
        { dictValue: '16', dictLabel: '燃气' },
        { dictValue: '17', dictLabel: '红外' },
        { dictValue: '18', dictLabel: '温湿度' },
        { dictValue: '19', dictLabel: '一氧化碳' },
        { dictValue: '21', dictLabel: '手表(H102C)' },
        { dictValue: '22', dictLabel: '手表(AB型)' },
        { dictValue: '23', dictLabel: 'SOS拉绳紧急按钮' }
      ],
      // 字典数据
      dictData: {
        dev_device_type: [],
        dev_online_status: []
      }
    }
  },
  
  computed: {
    // 移除原有的 onlineCount 和 offlineCount 计算属性，改为从接口获取
    // 设备类型选项 - 优先使用本地配置
    deviceTypeOptions() {
      return this.localDeviceTypes
    }
  },
  
  async onLoad() {
    await this.loadDictData()
    this.loadDeviceList(true)
  },
  
  onShow() {
    // onShow时刷新数据
    this.refreshData()
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
    async loadDeviceList(isInit = false) {
      if (isInit) {
        this.loading = true
        this.pageNum = 1
        this.deviceList = []
        this.hasMore = true
      }
      
      try {
        // 构建请求
        const requests = [
          listDevice({
            pageNum: this.pageNum,
            pageSize: this.pageSize
          })
        ]
        
        // 初始化时额外请求在线数量
        if (isInit) {
          requests.push(listDevice({ onlineStatus: '1', pageNum: 1, pageSize: 1 }))
        }
        
        const results = await Promise.all(requests)
        const response = results[0]
        
        if (response.code === 200) {
          const rows = response.rows || []
          
          // 更新总数
          this.totalCount = response.total || 0
          
          if (isInit) {
            this.deviceList = rows
            // 在线数量从统计请求获取，离线 = 总数 - 在线
            this.onlineCount = (results[1] && results[1].code === 200) ? (results[1].total || 0) : 0
            this.offlineCount = this.totalCount - this.onlineCount
          } else {
            this.deviceList = [...this.deviceList, ...rows]
          }
          
          // 判断是否还有更多数据
          this.hasMore = this.deviceList.length < this.totalCount
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
        this.loadingMore = false
        this.isRefreshing = false
      }
    },
    
    // 下拉刷新
    async onRefresh() {
      this.isRefreshing = true
      await this.loadDeviceList(true)
    },
    
    // 上拉加载更多
    async onLoadMore() {
      if (this.loadingMore || !this.hasMore || this.loading) return
      
      this.loadingMore = true
      this.pageNum++
      await this.loadDeviceList(false)
    },
    
    // 刷新数据（用于onShow等场景）
    refreshData() {
      this.loadDeviceList(true)
    },
    
    // 获取设备图标
    getDeviceIcon(deviceType) {
      const type = String(deviceType)
      try {
        const iconMap = {
          '1': '/static/device/breath.png',      // 呼吸睡眠 Ld
          '2': '/static/device/tumble.png',      // 跌倒监测 Ed
          '4': '/static/device/sleep-l2.jpg',      // 二代睡眠
          '13': '/static/device/shuijin.png',    // 水浸 Sd
          '14': '/static/device/menci.png',      // 门磁 Md
          '15': '/static/device/yangan.png',     // 烟感 Yd
          '16': '/static/device/keranqiti.png',  // 可燃气体 Rd
          '17': '/static/device/hongwai.png',    // 红外 Hd
          '18': '/static/device/wenshidu.png',   // 温湿度 Wd
          '19': '/static/device/yiyanghuatan.png', // 一氧化碳 Td
          '21': '/static/device/watch.png',   // 手表(AA型) Za - 待添加图标
          '22': '/static/device/watch.png',   // 手表(AB型) Zb - 待添加图标
          '23': '/static/device/sos.png'    // 拉绳 - Ls
        }
        return iconMap[type] || ''
      } catch (e) {
        console.warn('Device icon not found:', e)
        return ''
      }
    },
    
    // 获取设备类型名称
    getDeviceTypeName(deviceType) {
      // 优先从本地配置获取
      const localType = this.localDeviceTypes.find(item => String(item.dictValue) === String(deviceType))
      if (localType) {
        return localType.dictLabel
      }
      // 降级到字典数据
      return this.getDictLabel('dev_device_type', deviceType)
    },
    
    // 获取字典标签
    getDictLabel(dictType, dictValue) {
      const dictList = this.dictData[dictType] || []
      // 确保数据类型一致，将dictValue转为字符串进行比较
      const dictItem = dictList.find(item => String(item.dictValue) === String(dictValue))
      return dictItem ? dictItem.dictLabel : dictValue
    },
    
    // 获取设备来源标签
    getSourceTypeLabel(sourceType) {
      const sourceTypeMap = {
        '1': '自购',
        '2': '分配'
      }
      return sourceTypeMap[sourceType] || '未知'
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
          this.refreshData()
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
        deviceType: '',
        deviceKey: '',
        deviceAlias: '',
        installAddress: '',
        remark: ''
      }
      this.deviceTypeIndex = 0
    },
    
    // 设备类型选择变化
    onDeviceTypeChange(e) {
      const index = e.detail.value
      this.deviceTypeIndex = index
      if (this.deviceTypeOptions[index]) {
        this.addForm.deviceType = this.deviceTypeOptions[index].dictValue
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
      if (!this.addForm.deviceType) {
        uni.showToast({
          title: '请选择设备类型',
          icon: 'none'
        })
        return
      }
      
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
        
        // 判断是否是IMEI（纯数字且长度为15位）
        const isImei = /^\d{15}$/.test(deviceNumBering)
        
        let productKey, deviceKey
        // 使用用户选择的设备类型
        const deviceType = this.addForm.deviceType
        
        // 判断用户选择的设备类型
        const isWatchType = ['21', '22'].includes(deviceType)
        const isAepType = ['13', '14', '15', '16', '17', '18', '19'].includes(deviceType)
        
        if (isImei) {
          // 是IMEI，根据用户选择的设备类型调用不同接口
          if (isWatchType) {
            // 手表设备，调用 iwown 接口
            const watchRes = await getIwownDeviceByImei(deviceNumBering)
            
            if (watchRes.code !== 200 || !watchRes.data) {
              uni.showToast({
                title: watchRes.msg || '查询手表设备信息失败',
                icon: 'none'
              })
              return
            }
            
            productKey = watchRes.data.productKey
            deviceKey = watchRes.data.deviceKey
          } else if (isAepType) {
            // AEP设备，调用 AEP 接口
            const aepRes = await getAepDevice({ imei: deviceNumBering })
            
            if (aepRes.code !== 200 || !aepRes.data) {
              uni.showToast({
                title: aepRes.msg || '查询AEP设备信息失败',
                icon: 'none'
              })
              return
            }
            
            productKey = aepRes.data.productKey
            deviceKey = aepRes.data.deviceKey
            
            if (!productKey || !deviceKey) {
              uni.showToast({
                title: '未找到对应的设备信息',
                icon: 'none'
              })
              return
            }
          } else {
            // KAT设备不支持IMEI格式
            uni.showToast({
              title: 'KAT设备不支持IMEI格式，请输入完整设备编号',
              icon: 'none'
            })
            return
          }
        } else {
          // 不是IMEI，使用工具类解析设备编号
          const parseResult = parseDeviceNumber(deviceNumBering)
          
          if (parseResult === -1) {
            uni.showToast({
              title: '设备编号格式有误',
              icon: 'none'
            })
            return
          }
          
          productKey = parseResult.productKey
          deviceKey = parseResult.deviceKey
        }
        
        const response = await addDevice({
          deviceNumBering: isImei ? (productKey + deviceKey) : deviceNumBering,
          productKey: productKey,
          deviceKey: deviceKey,
          deviceType: deviceType,
          imei: isImei ? deviceNumBering : null,
          deviceAlias: this.addForm.deviceAlias.trim(),
          installAddress: this.addForm.installAddress.trim() || null,
          remark: this.addForm.remark.trim() || null,
          sourceType: '1' // 设备来源：1-居民自购，2-社区分配，默认为居民自购
        })
        
        if (response.code === 200) {
          this.closeAddDevice()
          
          // 只有KAT设备才需要配网（呼吸睡眠1、跌倒监测2、呼吸睡眠-L2 4）
          const katDeviceTypes = ['1', '2', '4']
          if (katDeviceTypes.includes(deviceType)) {
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
                    productKey: productKey,
                    deviceKey: deviceKey
                  }
                  const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
                  
                  // 根据设备类型决定跳转页面
                  let targetUrl = ''
                  if (deviceType === '4') {
                    // 呼吸睡眠-L2设备，跳转到蓝牙配网页面
                    targetUrl = '/pages/my/network/bluetooth?' + query
                  } else {
                    // 其他KAT设备，跳转到普通网络配置页面
                    targetUrl = '/pages/my/network/index?' + query
                  }
                  
                  uni.navigateTo({
                    url: targetUrl
                  })
                } else {
                  // 用户选择稍后配置，刷新设备列表
                  this.refreshData()
                }
              }
            })
          } else {
            // AEP设备不需要配网，直接提示成功并刷新列表
            uni.showToast({
              title: '添加成功',
              icon: 'success'
            })
            this.refreshData()
          }
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
        installAddress: device.installAddress || '',
        remark: device.remark || ''
      }
      // 保存原始数据用于对比
      this.originalEditForm = {
        deviceAlias: device.deviceAlias || '',
        installAddress: device.installAddress || '',
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
        installAddress: '',
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
      const currentAddress = this.editForm.installAddress.trim()
      const currentRemark = this.editForm.remark.trim()
      const originalAlias = this.originalEditForm.deviceAlias.trim()
      const originalAddress = this.originalEditForm.installAddress.trim()
      const originalRemark = this.originalEditForm.remark.trim()
      
      if (currentAlias === originalAlias && currentAddress === originalAddress && currentRemark === originalRemark) {
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
          installAddress: currentAddress,
          remark: currentRemark
        })
        
        if (response.code === 200) {
          uni.showToast({
            title: '修改成功',
            icon: 'success'
          })
          
          this.closeEditDevice()
          this.refreshData() // 重新加载设备列表
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
.page-wrapper {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.device-container {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
}

/* 加载更多提示 */
.load-more-tip {
  width: 100%;
  text-align: center;
  padding: 24rpx 0;
  font-size: 26rpx;
  color: #999;
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
    background: linear-gradient(135deg, #E07A4F 0%, #36b3b3 100%);
  }
  
  &.offline {
    width: 48rpx;
    height: 48rpx;
    background: linear-gradient(135deg, #D95C5C 0%, #ff4444 100%);
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
  padding-bottom: 140rpx; /* 留出 tabBar 空间，避免最后一张设备卡被底部 tab 遮挡 */
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
    box-shadow: 0 16rpx 48rpx rgba(224, 122, 79, 0.08);
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
    color: #E07A4F;
    background: rgba(224, 122, 79, 0.12);
    .status-dot { background: #E07A4F; }
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

// 设备标签容器
.device-badges {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 8rpx;
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

// 设备来源标签
.source-type-badge {
  align-self: flex-start;
  font-size: 18rpx;
  padding: 3rpx 8rpx;
  border-radius: 6rpx;
  display: inline-block;
  font-weight: 600;
  
  // 居民自购样式
  &.self-purchased {
    color: #E07A4F;
    background: rgba(224, 122, 79, 0.1);
    border: 1rpx solid rgba(224, 122, 79, 0.3);
  }
  
  // 社区分配样式
  &.community-assigned {
    color: #ff8c00;
    background: rgba(255, 140, 0, 0.1);
    border: 1rpx solid rgba(255, 140, 0, 0.3);
  }
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
  background: linear-gradient(135deg, #E07A4F 0%, #2eb8b8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6rpx 16rpx rgba(224, 122, 79, 0.15);
  overflow: hidden;

  &.has-icon {
    background: #f8fdfd; /* 给图片加一个极淡的背景 */
    box-shadow: none;
    border: 1rpx solid rgba(224, 122, 79, 0.05);
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
    color: #E07A4F;
    border: none;
    box-shadow: none;
    
    @include press(0.98, 0.95);
    
    &:active {
      background: #dcf5f5;
    }
  }
  
  &.danger {
    background: #fff0f0; /* 纯色背景 */
    color: #D95C5C;
    border: none;
    box-shadow: none;
    
    @include press(0.98, 0.95);
    
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
      background: rgba(224, 122, 79, 0.1);
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
          background: linear-gradient(135deg, #5AAB7A 0%, #45a049 100%);
          box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
        }
        
        &.offline {
          color: #fff;
          background: linear-gradient(135deg, #D95C5C 0%, #ff4444 100%);
          box-shadow: 0 2rpx 8rpx rgba(255, 85, 85, 0.3);
        }
      }
      
      &.device-key,
      &.product-key {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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
    background: linear-gradient(135deg, rgba(224, 122, 79, 0.1) 0%, rgba(224, 122, 79, 0.05) 100%);
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
      border: 2rpx dashed rgba(224, 122, 79, 0.3);
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

/* 右下角圆形添加按钮 FAB（半透明，固定屏幕） */
.add-fab {
  position: fixed;
  right: 32rpx;
  bottom: calc(env(safe-area-inset-bottom) + 120rpx); /* 抬高到 tabBar 上方，避免被底部 tab 遮挡 */
  z-index: 50;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #E07A4F 0%, #36b3b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.35);
  opacity: 0.5;
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
    background: #E07A4F;
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
  background: linear-gradient(135deg, #E07A4F 0%, #36b3b3 100%);
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
    border-color: #E07A4F;
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

.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  
  .placeholder {
    color: #999;
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
  background: linear-gradient(135deg, #E07A4F 0%, #36b3b3 100%);
  border: none;
  border-radius: 12rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.3);
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
  
  @include press-btn();
  
  &:active {
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
    border-color: #E07A4F;
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
  background: linear-gradient(135deg, #E07A4F 0%, #36b3b3 100%);
  color: #fff;
}
</style>
