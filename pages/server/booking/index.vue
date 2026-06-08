<template>
  <view class="booking-page">
    <!-- 服务信息卡片 -->
    <view class="service-info-card">
      <view class="service-header">
        <view class="icon-wrapper">
          <image v-if="bookingData.icon" :src="getImageUrl(bookingData.icon)" class="service-icon" mode="aspectFill"></image>
          <view v-else class="icon-placeholder">
            <uni-icons type="shop" size="40" color="#E07A4F"></uni-icons>
          </view>
        </view>
        <view class="service-title-area">
          <text class="service-name">{{ bookingData.serviceName || '服务名称' }}</text>
          <view class="service-tags">
            <view class="duration-tag" v-if="bookingData.serviceDuration">
              <uni-icons type="clock" size="14" color="#E07A4F"></uni-icons>
              <text>{{ bookingData.serviceDuration }}分钟</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 价格信息 -->
      <view class="price-info">
        <view class="price-item">
          <text class="price-label">服务价格</text>
          <text class="price-value-text">¥{{ bookingData.price || 0 }}</text>
        </view>
        <view class="price-item discount" v-if="bookingData.useSubsidy === '1' && bookingData.subsidyAmount > 0">
          <text class="price-label">补贴金额</text>
          <text class="discount-value">-¥{{ bookingData.subsidyAmount || 0 }}</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-item total">
          <text class="price-label">实付金额</text>
          <view class="total-price">
            <text class="currency-sign">¥</text>
            <text class="total-value">{{ bookingData.actualAmount || 0 }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 预约信息表单 -->
    <view class="form-section">
      <view class="section-title">预约信息</view>

      <!-- 被服务人员 -->
      <view class="form-item">
        <view class="form-label required">被服务人员</view>
        <picker
          mode="selector"
          :range="familyMemberOptions"
          range-key="label"
          :value="selectedMemberIndex"
          @change="onMemberChange"
        >
          <view class="picker-input">
            <text :class="selectedMember ? '' : 'placeholder'">
              {{ selectedMember ? selectedMember.label : '请选择家庭成员' }}
            </text>
            <uni-icons type="down" size="16" color="#999"></uni-icons>
          </view>
        </picker>
      </view>

      <!-- 新增人员按钮 -->
      <view class="add-member-btn" @click="addNewMember">
        <uni-icons type="person-filled" size="18" color="#E07A4F"></uni-icons>
        <text class="add-member-text">新增人员</text>
      </view>

      <!-- 服务地址 -->
      <view class="form-item">
        <view class="form-label required">服务地址</view>
        <view class="address-selector" @click="selectAddress">
          <!-- 使用text显示地址,避免小程序input渲染问题 -->
          <text class="address-text" :class="{ 'placeholder': !bookingData.serviceAddress }">
            {{ bookingData.serviceAddress || '请选择服务地址' }}
          </text>
          <uni-icons type="right" size="18" color="#999"></uni-icons>
        </view>
      </view>

      <!-- 新增地址按钮 -->
      <view class="add-address-btn" @click="addNewAddress">
        <uni-icons type="plus-filled" size="20" color="#E07A4F"></uni-icons>
        <text class="add-address-text">新增地址</text>
      </view>

      <!-- 预约日期 -->
      <view class="form-item">
        <view class="form-label required">预约日期</view>
        <picker
          mode="date"
          :value="bookingData.appointmentDate"
          :start="minDate"
          :end="maxDate"
          @change="onDateChange"
        >
          <view class="picker-input">
            <text :class="bookingData.appointmentDate ? '' : 'placeholder'">
              {{ bookingData.appointmentDate || '请选择预约日期' }}
            </text>
            <uni-icons type="calendar" size="20" color="#999"></uni-icons>
          </view>
        </picker>
        <view class="form-tip">
          <uni-icons type="info" size="14" color="#999"></uni-icons>
          <text>只能预约一周之内的服务</text>
        </view>
      </view>

      <!-- 预约时段 -->
      <view class="form-item">
        <view class="form-label required">预约时段</view>
        <!-- 未选择日期时的提示 -->
        <view v-if="!bookingData.appointmentDate" class="time-slot-tip">
          <uni-icons type="info" size="16" color="#999"></uni-icons>
          <text class="tip-text">请先选择预约日期</text>
        </view>
        <!-- 已选择日期后显示时间段 -->
        <view v-else class="time-slots">
          <view
            class="time-slot"
            :class="{ active: bookingData.appointmentPeriod === slot, disabled: isTimeSlotDisabled(slot) }"
            v-for="slot in timeSlots"
            :key="slot"
            @click="selectTimeSlot(slot)"
          >
            {{ slot }}
          </view>
        </view>
      </view>

      <!-- 是否使用补贴 -->
      <view class="form-item" v-if="canUseSubsidy">
        <view class="form-label">使用补贴</view>
        <radio-group @change="toggleSubsidy" class="radio-group">
          <label class="radio-label">
            <radio value="1" :checked="bookingData.useSubsidy === '1'" color="#E07A4F" />
            <text class="radio-text">使用</text>
          </label>
          <label class="radio-label">
            <radio value="0" :checked="bookingData.useSubsidy === '0'" color="#E07A4F" />
            <text class="radio-text">不使用</text>
          </label>
        </radio-group>
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <view class="form-label">备注信息</view>
        <textarea
          class="form-textarea"
          v-model="bookingData.remark"
          placeholder="请输入备注信息(选填)"
          maxlength="200"
        />
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="bottom-bar">
      <view class="price-summary">
        <view class="price-main">
          <text class="summary-label">实付金额</text>
          <view class="price-value">
            <text class="currency">¥</text>
            <text class="summary-price">{{ bookingData.actualAmount || 0 }}</text>
          </view>
        </view>
        <view class="subsidy-info" v-if="bookingData.useSubsidy === '1' && bookingData.subsidyAmount > 0">
          <view class="subsidy-tag">优惠</view>
          <text class="subsidy-text">已补贴 ¥{{ bookingData.subsidyAmount }}</text>
        </view>
        <text class="subsidy-tip unused" v-else-if="canUseSubsidy && bookingData.useSubsidy === '0'">
          未使用补贴
        </text>
      </view>
      <button class="submit-btn" @click="submitOrder" :loading="submitting">
        {{ submitting ? '提交中...' : (isEditMode ? '保存修改' : '立即预约') }}
      </button>
    </view>
  </view>
</template>

<script>
import { addServiceorder, getServiceorder, updateServiceorder } from '@/api/service'
import { listServicesaddressNoPage } from '@/api/servicesaddress'
import { listFamilymemberNoPage } from '@/api/familymember'
import config from '@/config.js'

export default {
  data() {
    return {
      // 预约数据
      bookingData: {
        serviceId: null,
        serviceName: '',
        icon: '',
        price: 0,
        serviceDuration: null,
        subsidyRate: 0,
        subsidySupport: '0',
        userId: null,  // 用户ID(residentUserId与userId相同,提交时使用此字段)
        deptId: null,
        serviceAddress: '',
        servedMemberId: null,
        appointmentDate: '',
        appointmentPeriod: '',
        subsidyAmount: 0,
        actualAmount: 0,
        remark: '',
        useSubsidy: '1'
      },

      // 时间段选项
      timeSlots: [
        '08:00~10:00',
        '10:00~12:00',
        '12:00~14:00',
        '14:00~16:00',
        '16:00~18:00'
      ],

      // 家庭成员
      familyMembers: [],
      familyMemberOptions: [],
      selectedMember: null,
      selectedMemberIndex: -1,

      submitting: false,
      canUseSubsidy: false,
      minDate: '',
      maxDate: '', // 最大日期(一周后)
      selectedAddressId: null, // 选中的地址ID
      isEditMode: false, // 是否为编辑模式
      currentOrderId: null, // 当前编辑的订单ID
      originalBookingData: null // 保存原始数据用于对比
    }
  },

  methods: {
    // 加载家庭成员列表
    async loadFamilyMembers() {
      try {
        const response = await listFamilymemberNoPage()

        if (response.code === 200 && response.data) {
          this.familyMembers = response.data

          // 构建选项数组
          this.familyMemberOptions = this.familyMembers.map(member => ({
            label: `${member.memberName} (${member.relationship})`,
            value: member.memberId,
            phone: member.phone,
            name: member.memberName
          }))

          console.log('家庭成员列表已加载:', this.familyMemberOptions)

          // 如果之前选择过成员,恢复选择状态
          if (this.bookingData.servedMemberId) {
            const index = this.familyMemberOptions.findIndex(
              option => option.value === this.bookingData.servedMemberId
            )
            if (index !== -1) {
              this.selectedMemberIndex = index
              this.selectedMember = this.familyMemberOptions[index]
            }
          }
        }
      } catch (error) {
        console.error('加载家庭成员列表失败:', error)
      }
    },

    // 选择家庭成员
    onMemberChange(e) {
      const index = e.detail.value
      this.selectedMemberIndex = index
      this.selectedMember = this.familyMemberOptions[index]

      // 更新预约数据
      this.bookingData.servedMemberId = this.selectedMember.value

      console.log('已选择成员:', this.selectedMember)
    },

    // 新增家庭成员
    addNewMember() {
      uni.navigateTo({
        url: '/pages/my/family/index'
      })
    },

    // 选择服务地址
    selectAddress() {
      uni.navigateTo({
        url: '/pages/my/address/index?from=booking'
      })
    },

    // 新增地址
    addNewAddress() {
      uni.navigateTo({
        url: '/pages/my/address/index?from=booking&action=add'
      })
    },

    // 加载默认地址,如果没有默认地址则加载第一条
    async loadDefaultAddress() {
      try {
        // 如果已经有地址了,不自动加载
        if (this.bookingData.serviceAddress) {
          return
        }

        // 调用接口获取地址列表
        const response = await listServicesaddressNoPage({})

        if (response.code === 200 && response.data && response.data.length > 0) {
          const addresses = response.data

          // 查找默认地址
          let selectedAddress = addresses.find(addr => addr.isDefault === '1')

          // 如果没有默认地址,使用第一条
          if (!selectedAddress) {
            selectedAddress = addresses[0]
          }

          // 设置地址信息
          if (selectedAddress) {
            const fullAddress = `${selectedAddress.province || ''}${selectedAddress.city || ''}${selectedAddress.district || ''} ${selectedAddress.detailAddress || ''}`
            this.bookingData.serviceAddress = fullAddress.trim()
            this.selectedAddressId = selectedAddress.addressId

            // 保存当前选中的地址ID
            uni.setStorageSync('currentBookingAddressId', selectedAddress.addressId)

            console.log('已自动加载地址:', this.bookingData.serviceAddress)
          }
        } else {
          console.log('暂无地址数据')
        }
      } catch (error) {
        console.error('加载地址失败:', error)
      }
    },

    // 加载订单数据(编辑模式)
    async loadOrderData(orderId) {
      try {
        uni.showLoading({ title: '加载中...' })

        // 调用接口获取订单详情
        const response = await getServiceorder(orderId)

        uni.hideLoading()

        if (response.code === 200 && response.data) {
          const orderData = response.data

          // 填充预约数据
          this.bookingData = {
            serviceId: orderData.serviceId,
            serviceName: orderData.serviceName,
            icon: orderData.icon || '',
            price: orderData.price,
            serviceDuration: orderData.serviceDuration,
            subsidyRate: orderData.subsidyRate || 0,
            subsidySupport: orderData.subsidySupport || '0',
            // 优先使用订单数据中的userId,如果没有则使用已经加载的userId
            userId: orderData.residentUserId || orderData.userId || this.bookingData.userId,
            deptId: orderData.deptId,
            serviceAddress: orderData.serviceAddress,
            servedMemberId: orderData.servedMemberId,
            appointmentDate: orderData.appointmentDate,
            appointmentPeriod: orderData.appointmentPeriod,
            subsidyAmount: orderData.subsidyAmount || 0,
            actualAmount: orderData.actualAmount || 0,
            remark: orderData.remark || '',
            useSubsidy: orderData.useSubsidy || '1'
          }

          // 判断是否可以使用补贴
          this.canUseSubsidy = orderData.subsidySupport === '1' && orderData.subsidyRate > 0

          // 如果订单数据中有地址ID,设置选中的地址ID
          if (orderData.addressId) {
            this.selectedAddressId = orderData.addressId
            uni.setStorageSync('currentBookingAddressId', orderData.addressId)
          } else if (orderData.serviceAddress) {
            // 如果没有地址ID但有地址信息,尝试通过地址信息匹配地址ID
            this.findAddressIdByAddress(orderData.serviceAddress)
          }

          // 保存原始数据的深拷贝用于对比
          this.originalBookingData = JSON.parse(JSON.stringify(this.bookingData))

          console.log('编辑模式 - 订单数据已加载:', this.bookingData)
        } else {
          uni.showToast({
            title: response.msg || '加载订单数据失败',
            icon: 'none'
          })
          // 加载失败,返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        uni.hideLoading()
        console.error('加载订单数据失败:', error)
        uni.showToast({
          title: '加载订单数据失败',
          icon: 'none'
        })
        // 加载失败,返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    },

    // 通过地址信息查找地址ID
    async findAddressIdByAddress(serviceAddress) {
      try {
        const response = await listServicesaddressNoPage({})

        if (response.code === 200 && response.data && response.data.length > 0) {
          // 遍历地址列表,找到匹配的地址
          for (const address of response.data) {
            const fullAddress = `${address.province || ''}${address.city || ''}${address.district || ''} ${address.detailAddress || ''}`
            if (fullAddress.trim() === serviceAddress.trim()) {
              this.selectedAddressId = address.addressId
              uni.setStorageSync('currentBookingAddressId', address.addressId)
              console.log('通过地址匹配找到地址ID:', address.addressId)
              break
            }
          }
        }
      } catch (error) {
        console.error('查找地址ID失败:', error)
      }
    },

    // 选择时间段
    selectTimeSlot(slot) {
      // 检查是否已选择日期
      if (!this.bookingData.appointmentDate) {
        uni.showToast({
          title: '请先选择预约日期',
          icon: 'none'
        });
        return;
      }

      // 检查时间段是否已过期
      if (this.isTimeSlotDisabled(slot)) {
        uni.showToast({
          title: '该时间段已过期,请选择其他时间',
          icon: 'none'
        });
        return;
      }
      this.bookingData.appointmentPeriod = slot;
    },

    // 判断时间段是否已过期
    isTimeSlotDisabled(slot) {
      // 如果没有选择日期,默认不禁用
      if (!this.bookingData.appointmentDate) {
        return false;
      }

      const selectedDate = this.bookingData.appointmentDate;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // 如果选择的日期不是今天,所有时间段都可选
      if (selectedDate !== todayStr) {
        return false;
      }

      // 解析时间段的结束时间(格式:08:00~10:00)
      const endTime = slot.split('~')[1];
      const [endHour, endMinute] = endTime.split(':').map(Number);

      // 获取当前时间
      const currentHour = today.getHours();
      const currentMinute = today.getMinutes();

      // 如果当前时间已经超过了时间段的结束时间,则禁用
      if (currentHour > endHour || (currentHour === endHour && currentMinute >= endMinute)) {
        return true;
      }

      return false;
    },

    // 日期改变
    onDateChange(e) {
      const selectedDate = e.detail.value;

      // 验证日期是否在允许范围内
      if (selectedDate < this.minDate) {
        uni.showToast({
          title: '不能选择今天之前的日期',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (selectedDate > this.maxDate) {
        uni.showToast({
          title: '只能预约一周之内的服务',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      this.bookingData.appointmentDate = selectedDate;

      // 如果已选择的时间段在新日期下已过期,清空选择
      if (this.bookingData.appointmentPeriod && this.isTimeSlotDisabled(this.bookingData.appointmentPeriod)) {
        this.bookingData.appointmentPeriod = '';
        uni.showToast({
          title: '所选时间段已过期,请重新选择',
          icon: 'none'
        });
      }
    },

    // 切换补贴使用状态
    toggleSubsidy(e) {
      this.bookingData.useSubsidy = e.detail.value;
      this.calculateActualAmount();
    },

    // 计算实付金额
    calculateActualAmount() {
      const price = parseFloat(this.bookingData.price) || 0;
      let subsidyAmount = 0;

      if (this.bookingData.useSubsidy === '1' && this.bookingData.subsidyRate > 0) {
        subsidyAmount = (price * this.bookingData.subsidyRate / 100).toFixed(2);
        this.bookingData.subsidyAmount = parseFloat(subsidyAmount);
      } else {
        this.bookingData.subsidyAmount = 0;
      }

      this.bookingData.actualAmount = (price - this.bookingData.subsidyAmount).toFixed(2);
    },

    // 处理图片URL
    getImageUrl(iconPath) {
      if (!iconPath) return '/static/images/default-service.png';

      if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
        return iconPath;
      }

      if (iconPath.startsWith('/')) {
        return config.baseUrl + iconPath;
      }

      return '/static/images/default-service.png';
    },

    // 表单验证
    validateForm() {
      if (!this.bookingData.servedMemberId) {
        uni.showToast({
          title: '请选择被服务人员',
          icon: 'none'
        });
        return false;
      }

      if (!this.bookingData.serviceAddress || this.bookingData.serviceAddress.trim() === '') {
        uni.showToast({
          title: '请输入服务地址',
          icon: 'none'
        });
        return false;
      }

      if (!this.bookingData.appointmentDate) {
        uni.showToast({
          title: '请选择预约日期',
          icon: 'none'
        });
        return false;
      }

      if (!this.bookingData.appointmentPeriod) {
        uni.showToast({
          title: '请选择预约时段',
          icon: 'none'
        });
        return false;
      }

      return true;
    },

    // 提交订单
    async submitOrder() {
      // 检查数据是否有变更(仅在编辑模式下)
      if (this.isEditMode && this.originalBookingData) {
        const isDataChanged = JSON.stringify(this.bookingData) !== JSON.stringify(this.originalBookingData)
        if (!isDataChanged) {
          uni.showToast({
            title: '数据未更改',
            icon: 'none'
          })
          return
        }
      }

      if (!this.validateForm()) {
        return;
      }

      // 验证用户ID
      if (!this.bookingData.userId) {
        console.error('用户ID缺失:', this.bookingData.userId)

        // 尝试重新获取用户ID
        this.getUserId()

        if (!this.bookingData.userId) {
          uni.showToast({
            title: '用户信息获取失败,请重新登录',
            icon: 'none'
          })
          return
        }
      }

      try {
        this.submitting = true;

        // 准备提交的数据
        const submitData = {
          residentUserId: this.bookingData.userId,  // residentUserId 和 userId 是相同的
          userId: this.bookingData.userId,
          deptId: this.bookingData.deptId,
          serviceId: this.bookingData.serviceId,
          addressId: this.selectedAddressId,  // 地址ID
          serviceAddress: this.bookingData.serviceAddress,
          servedMemberId: this.bookingData.servedMemberId,
          appointmentDate: this.bookingData.appointmentDate,
          appointmentPeriod: this.bookingData.appointmentPeriod,
          price: this.bookingData.price,
          subsidyAmount: this.bookingData.subsidyAmount,
          actualAmount: this.bookingData.actualAmount,
          remark: this.bookingData.remark,
          useSubsidy: this.bookingData.useSubsidy,
          orderSource: '4'  // 订单来源:4表示预约服务
        };

        console.log('提交订单数据:', submitData);

        let response;

        // 根据模式调用不同的接口
        if (this.isEditMode && this.currentOrderId) {
          // 编辑模式:调用更新接口
          submitData.orderId = this.currentOrderId;
          console.log('编辑模式,调用更新接口');
          response = await updateServiceorder(submitData);
        } else {
          // 新增模式:调用新增接口
          console.log('新增模式,调用新增接口');
          response = await addServiceorder(submitData);
        }

        if (response.code === 200) {
          uni.showToast({
            title: this.isEditMode ? '修改成功' : '预约成功',
            icon: 'success',
            duration: 2000
          });

          // 清除缓存
          uni.removeStorageSync('bookingDataCache');

          // 延迟跳转到订单页面
          setTimeout(() => {
            // 跳转到订单页面,显示全部订单
            uni.reLaunch({
              url: '/pages/order/index?status=0'
            });
          }, 2000);
        } else {
          uni.showToast({
            title: response.msg || (this.isEditMode ? '修改失败' : '预约失败'),
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('提交订单失败:', error);
        uni.showToast({
          title: '网络错误,请重试',
          icon: 'none'
        });
      } finally {
        this.submitting = false;
      }
    },

    // 初始化数据
    initData() {
      try {
        // 从缓存读取数据
        const cacheData = uni.getStorageSync('bookingDataCache');

        if (cacheData) {
          console.log('从缓存加载的预约数据:', cacheData);

          this.bookingData = {
            ...this.bookingData,
            ...cacheData
          };

          // 判断是否支持补贴
          this.canUseSubsidy = this.bookingData.subsidySupport === '1' && this.bookingData.subsidyRate > 0;

          // 计算实付金额
          this.calculateActualAmount();
        } else {
          console.warn('缓存中没有预约数据');
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          });

          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
      }
    },

    // 获取用户ID
    getUserId() {
      try {
        // 从 storage_data 中读取用户信息
        const storageData = uni.getStorageSync('storage_data')

        if (storageData && storageData.user_id) {
          const userId = storageData.user_id

          // 设置用户ID(residentUserId 和 userId 是相同的)
          if (!this.bookingData.userId) {
            this.bookingData.userId = userId
          }

          console.log('用户ID已设置:', userId)
        } else {
          console.warn('storage_data 中未找到用户ID')
        }
      } catch (error) {
        console.error('读取用户ID失败:', error)
      }
    },

    // 获取最小日期(今天)和最大日期(一周后)并设置默认日期
    getMinDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      this.minDate = todayStr;

      // 计算一周后的日期
      const oneWeekLater = new Date(today);
      oneWeekLater.setDate(today.getDate() + 7);
      const maxYear = oneWeekLater.getFullYear();
      const maxMonth = String(oneWeekLater.getMonth() + 1).padStart(2, '0');
      const maxDay = String(oneWeekLater.getDate()).padStart(2, '0');
      this.maxDate = `${maxYear}-${maxMonth}-${maxDay}`;

      // 默认选择当天
      if (!this.bookingData.appointmentDate) {
        this.bookingData.appointmentDate = todayStr;
      }
    },


  },

  onLoad(options) {
    this.getMinDate();

    // 加载家庭成员列表
    this.loadFamilyMembers();

    // 检测是否为编辑模式
    if (options.orderId && options.mode === 'edit') {
      this.isEditMode = true;
      this.currentOrderId = options.orderId;
      // 编辑模式:不调用initData(不需要缓存数据),直接获取用户ID并加载订单数据
      this.getUserId();
      this.loadOrderData(options.orderId);
    } else {
      // 新增模式:需要缓存数据,调用initData
      this.initData();
      // 获取用户ID并加载默认地址
      this.getUserId();
      this.loadDefaultAddress();
    }
  },

  onShow() {
    // 重新加载家庭成员列表(从家庭成员页面返回后可能有更新)
    this.loadFamilyMembers();

    // 编辑模式下不处理地址选择,避免覆盖已加载的订单数据
    if (this.isEditMode) {
      return;
    }

    // 从地址管理页面返回时,接收选中的地址
    const selectedAddress = uni.getStorageSync('selectedAddressForBooking')
    console.log('onShow - 检查选中的地址缓存:', selectedAddress)
    console.log('onShow - 当前地址状态:', this.bookingData.serviceAddress)

    if (selectedAddress) {
      console.log('接收到选中的地址:', selectedAddress)

      // 组装完整地址字符串
      const fullAddress = `${selectedAddress.province || ''}${selectedAddress.city || ''}${selectedAddress.district || ''} ${selectedAddress.detailAddress || ''}`

      // 使用 $nextTick 确保数据更新
      this.$nextTick(() => {
        this.bookingData.serviceAddress = fullAddress.trim()
        this.selectedAddressId = selectedAddress.addressId

        console.log('地址已更新:', this.bookingData.serviceAddress)

        // ✅ 保存当前选中的地址ID,供下次进入地址页面时显示选中状态
        uni.setStorageSync('currentBookingAddressId', selectedAddress.addressId)

        // 强制更新视图(小程序兼容性)
        this.$forceUpdate()
      })

      // 清除缓存
      uni.removeStorageSync('selectedAddressForBooking')
    } else {
      // 如果没有新选择的地址,但已经有地址了,需要设置当前地址ID用于显示选中状态
      if (this.bookingData.serviceAddress && this.selectedAddressId) {
        uni.setStorageSync('currentBookingAddressId', this.selectedAddressId)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.booking-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 160rpx;
}

/* 服务信息卡片 */
.service-info-card {
  background: #fff;
  margin: 24rpx;
  border-radius: 20rpx;
  padding: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.service-header {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: linear-gradient(135deg, #f0fafa 0%, #e8f8f8 100%);
  border-bottom: 1rpx solid #e8f5f5;
}

.icon-wrapper {
  width: 100rpx;
  height: 100rpx;
  border-radius: 16rpx;
  margin-right: 24rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.15);
}

.service-icon {
  width: 100%;
  height: 100%;
}

.icon-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fafa;
}

.service-title-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.service-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.service-tags {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.duration-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: rgba(224, 122, 79, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;

  text {
    font-size: 24rpx;
    color: #E07A4F;
    font-weight: 500;
  }
}

/* 价格信息 */
.price-info {
  padding: 28rpx 32rpx;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.price-label {
  font-size: 28rpx;
  color: #666;
}

.price-value-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.price-item.discount {
  .discount-value {
    font-size: 28rpx;
    color: #5AAB7A;
    font-weight: 500;
  }
}

.price-divider {
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e8e8e8, transparent);
  margin: 20rpx 0;
}

.price-item.total {
  .price-label {
    font-size: 30rpx;
    color: #333;
    font-weight: 600;
  }

  .total-price {
    display: flex;
    align-items: baseline;
  }

  .currency-sign {
    font-size: 28rpx;
    color: #D95C5C;
    font-weight: 600;
  }

  .total-value {
    font-size: 40rpx;
    color: #D95C5C;
    font-weight: 700;
  }
}

/* 表单区域 */
.form-section {
  background: #fff;
  margin: 24rpx;
  border-radius: 20rpx;
  padding: 36rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 32rpx;
  position: relative;
  padding-left: 20rpx;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6rpx;
    height: 28rpx;
    background: #E07A4F;
    border-radius: 3rpx;
  }
}

.form-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
  font-weight: 500;

  &.required::before {
    content: '*';
    color: #D95C5C;
    margin-right: 4rpx;
  }
}

.form-input {
  background: #f8f9fc;
  border-radius: 10rpx;
  padding: 22rpx;
  font-size: 28rpx;
  color: #333;
  border: 1rpx solid #eee;
  width: 100%;
  box-sizing: border-box;
  height: auto;
  line-height: 1.5;
}

.picker-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fc;
  border-radius: 10rpx;
  padding: 22rpx;
  font-size: 28rpx;
  color: #333;
  border: 1rpx solid #eee;
  min-height: 84rpx;

  .placeholder {
    color: #bbb;
  }
}

.form-textarea {
  background: #f8f9fc;
  border-radius: 10rpx;
  padding: 22rpx;
  font-size: 28rpx;
  color: #333;
  min-height: 120rpx;
  border: 1rpx solid #eee;
  width: 100%;
  box-sizing: border-box;
  line-height: 1.5;
}

/* 表单提示 */
.form-tip {
  display: flex;
  align-items: center;
  gap: 6rpx;
  margin-top: 12rpx;
  padding-left: 4rpx;

  text {
    font-size: 24rpx;
    color: #999;
    line-height: 1.4;
  }
}

/* 单选框组 */
.radio-group {
  display: flex;
  align-items: center;
  gap: 40rpx;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8rpx;

  radio {
    transform: scale(0.85);
  }

  .radio-text {
    font-size: 28rpx;
    color: #333;
  }
}

/* 地址选择器 */
.address-selector {
  display: flex;
  align-items: center;
  background: #f8f9fc;
  border-radius: 10rpx;
  padding: 22rpx;
  border: 1rpx solid #eee;
  min-height: 84rpx;

  .address-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    line-height: 1.5;

    &.placeholder {
      color: #bbb;
    }
  }
}

/* 新增按钮样式 */
.add-member-btn,
.add-address-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 24rpx;
  margin: 20rpx 0;
  background: #f0f9f9;
  border: 1rpx dashed #E07A4F;
  border-radius: 10rpx;

  @include press(0.98, 0.95);
  
  &:active {
    background: #e6f7f7;
  }

  .add-member-text,
  .add-address-text {
    font-size: 28rpx;
    color: #E07A4F;
    font-weight: 500;
  }
}

/* 时间段提示 */
.time-slot-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 40rpx 20rpx;
  background: #f8f9fc;
  border-radius: 10rpx;
  margin-top: 16rpx;

  .tip-text {
    font-size: 26rpx;
    color: #999;
  }
}

/* 时间段选择 */
.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}

.time-slot {
  flex: 0 0 calc(50% - 8rpx);
  background: #f8f9fc;
  border: 1rpx solid #eee;
  border-radius: 10rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 26rpx;
  color: #666;

  &.active {
    background: #e6f7f7;
    border-color: #E07A4F;
    color: #E07A4F;
    font-weight: 500;
  }

  &.disabled {
    background: #f5f5f5;
    border-color: #e0e0e0;
    color: #bbb;
    opacity: 0.6;
  }
}

/* 底部操作栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx 30rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.price-summary {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.price-main {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.summary-label {
  font-size: 26rpx;
  color: #666;
}

.price-value {
  display: flex;
  align-items: baseline;
}

.currency {
  font-size: 28rpx;
  color: #D95C5C;
  font-weight: 600;
}

.summary-price {
  font-size: 44rpx;
  color: #D95C5C;
  font-weight: 700;
  line-height: 1;
}

.subsidy-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.subsidy-tag {
  font-size: 20rpx;
  color: #fff;
  background: linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%);
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.subsidy-text {
  font-size: 24rpx;
  color: #5AAB7A;
  font-weight: 500;
}

.subsidy-tip {
  font-size: 24rpx;
  line-height: 1;

  &.unused {
    color: #999;
  }
}

.submit-btn {
  flex: 1;
  max-width: 400rpx;
  margin-left: 50rpx;
  background: linear-gradient(135deg, #E07A4F 0%, #2bb5b5 100%);
  color: #fff;
  border-radius: 48rpx;
  padding: 15rpx 0;
  font-size: 36rpx;
  font-weight: 600;
  border: none;
  box-shadow: 0 6rpx 16rpx rgba(224, 122, 79, 0.35);
   
  @include press-btn();
  
  &:active {
    background: linear-gradient(135deg, #35b3b3 0%, #26a3a3 100%);
  }

  &[disabled] {
    background: #d9d9d9;
    box-shadow: none;
  }
}
</style>
