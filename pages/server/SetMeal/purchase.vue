<template>
  <view class="purchase-page">
    <!-- 套餐信息卡片 -->
    <view class="package-info-card">
      <view class="package-header">
        <view class="package-title-area">
          <text class="package-name">{{ packageData.packageName || '套餐名称' }}</text>
          <view class="package-tags">
            <view class="validity-tag" v-if="packageData.validityPeriod">
              <uni-icons type="calendar" size="20" color="#3ec6c6"></uni-icons>
              <text>{{ getValidityText(packageData) }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 价格信息 -->
      <view class="price-info">
        <view class="price-item">
          <text class="price-label">套餐价格</text>
          <text class="price-value-text">¥{{ packageData.price || 0 }}</text>
        </view>
        <view class="price-item" v-if="packageData.originalPrice && packageData.originalPrice > packageData.price">
          <text class="price-label">原价</text>
          <text class="original-price-text">¥{{ packageData.originalPrice }}</text>
        </view>
        <view class="price-divider"></view>
        <view class="price-item total">
          <text class="price-label">实付金额</text>
          <view class="total-price">
            <text class="currency-sign">¥</text>
            <text class="total-value">{{ packageData.price || 0 }}</text>
          </view>
        </view>
      </view>
      
      <!-- 生效时间信息 -->
      <view class="validity-info">
        <view class="validity-item">
          <text class="validity-label">生效时间</text>
          <text class="validity-value">{{ getEffectiveDate() }}</text>
        </view>
        <view class="validity-divider">至</view>
        <view class="validity-item">
          <text class="validity-label">到期时间</text>
          <text class="validity-value">{{ getExpiryDate() }}</text>
        </view>
        <view class="validity-note">({{ getEffectiveModeText() }})</view>
      </view>
    </view>
    
    <!-- 购买信息表单 -->
    <view class="form-section">
      <view class="section-title">购买信息</view>
      
      <!-- 被服务人员 -->
      <view class="form-item">
        <view class="form-label required">被服务人员<text class="member-count-tip" v-if="maxMemberCount > 1">（最多选择{{ maxMemberCount }}人）</text></view>
        <view class="picker-input" @click="showMemberPicker">
          <text :class="selectedMembers.length > 0 ? '' : 'placeholder'">
            {{ selectedMembersText || '请选择家庭成员' }}
          </text>
          <text class="iconfont icon-xiala"></text>
        </view>
      </view>
      
      <!-- 家庭成员选择弹窗 -->
      <view class="member-picker-mask" v-if="memberPickerVisible" @click="closeMemberPicker">
        <view class="member-picker-popup" @click.stop>
          <view class="picker-header">
            <text class="picker-title">选择家庭成员<text class="picker-count">（{{ selectedMembers.length }}/{{ maxMemberCount }}）</text></text>
            <text class="iconfont icon-guanbi" @click="closeMemberPicker"></text>
          </view>
          <scroll-view class="picker-content" scroll-y>
            <view 
              v-for="(member, index) in familyMemberOptions" 
              :key="index"
              class="member-option"
              :class="{ 
                'disabled': member.disabled || (isMaxSelected && !isMemberSelected(index)),
                'selected': isMemberSelected(index)
              }"
              @click="toggleMemberSelect(index)"
            >
              <view class="member-checkbox" :class="{ 'checked': isMemberSelected(index) }">
                <uni-icons v-if="isMemberSelected(index)" type="checkmarkempty" size="14" color="#fff"></uni-icons>
              </view>
              <text class="member-name">{{ member.label }}</text>
            </view>
            <view v-if="familyMemberOptions.length === 0" class="empty-tip">
              暂无家庭成员
            </view>
          </scroll-view>
          <view class="picker-footer">
            <button class="confirm-select-btn" @click="confirmMemberSelect">确定</button>
          </view>
        </view>
      </view>
      
      <!-- 新增人员按钮 -->
      <view class="add-member-btn" @click="addNewMember">
        <text class="iconfont icon-tianjia"></text>
        <text class="add-member-text">新增人员</text>
      </view>
      
      <!-- 被服务地址 -->
      <view class="form-item">
        <view class="form-label required">被服务地址</view>
        <view class="address-selector" @click="selectAddress">
          <text class="address-text" :class="{ 'placeholder': !purchaseData.serviceAddress }">
            {{ purchaseData.serviceAddress || '请选择服务地址' }}
          </text>
          <text class="iconfont icon-youjiantou"></text>
        </view>
      </view>
      
      <!-- 新增地址按钮 -->
      <view class="add-address-btn" @click="addNewAddress">
        <text class="iconfont icon-tianjia"></text>
        <text class="add-address-text">新增地址</text>
      </view>
      
      <!-- 服务时间配置区域（模式2） -->
      <template v-if="hasResidentSelectItems">
        <view class="schedule-section">
          <view class="schedule-section-header">
            <view class="schedule-title-row">
            
              <text class="schedule-title">服务时间配置</text>
            </view>
            <view class="schedule-tip">
              <text>以下服务项需要您选择服务日期和时段</text>
            </view>
          </view>
          <view 
            v-for="(item, index) in residentSelectItems" 
            :key="index" 
            class="schedule-item"
            :class="{ 'schedule-item-configured': getScheduleCount(item.serviceId) > 0 }"
          >
            <view class="schedule-item-left">
              <view class="schedule-item-icon">
                <uni-icons type="calendar" size="24" color="#3ec6c6"></uni-icons>
              </view>
              <view class="schedule-item-info">
                <text class="service-name">{{ item.serviceName }}</text>
                <text class="service-info">{{ getServiceInfoText(item) }}</text>
              </view>
            </view>
            <view class="schedule-item-right">
              <view class="schedule-progress" v-if="getScheduleCount(item.serviceId) > 0">
                <text class="progress-text">{{ getScheduleCount(item.serviceId) }}/{{ getScheduleLimit(item) }}</text>
              </view>
              <view 
                class="schedule-config-btn" 
                :class="{ 'configured': getScheduleCount(item.serviceId) > 0 }"
                @click="openScheduleConfig(index)"
              >
                <uni-icons :type="getScheduleCount(item.serviceId) > 0 ? 'compose' : 'plusempty'" size="16" :color="getScheduleCount(item.serviceId) > 0 ? '#3ec6c6' : '#fff'"></uni-icons>
                <text>{{ getScheduleCount(item.serviceId) > 0 ? '修改' : '配置' }}</text>
              </view>
            </view>
          </view>
        </view>
      </template>
      
      <!-- 时间配置弹窗 -->
      <view class="schedule-picker-mask" v-if="scheduleVisible" @click="closeScheduleConfig">
        <view class="schedule-picker-popup" @click.stop>
          <view class="picker-header">
            <text class="picker-title">配置服务时间</text>
            <view class="close-btn" @click="closeScheduleConfig">
              <uni-icons type="closeempty" size="20" color="#999"></uni-icons>
            </view>
          </view>
          <scroll-view class="schedule-picker-body" scroll-y v-if="currentScheduleItem">
            <view class="schedule-info">
              <view class="schedule-info-name">
                <uni-icons type="calendar" size="22" color="#3ec6c6"></uni-icons>
                <text>{{ currentScheduleItem.serviceName }}</text>
              </view>
              <view class="schedule-info-tags">
                <view class="info-tag">
                  <text>{{ freqMap[currentScheduleItem.frequencyType] }}上限{{ currentScheduleItem.frequencyLimit }}次</text>
                </view>
                <view class="info-tag">
                  <text>共需{{ currentScheduleItem.totalCount }}次</text>
                </view>
                <view class="info-tag progress-tag" v-if="currentScheduleItem.frequencyType !== 'DAILY'">
                  <text>已配置{{ getScheduleCount(currentScheduleItem.serviceId) }}次</text>
                </view>
              </view>
            </view>
            
            <!-- DAILY: 只选预约时段 -->
            <template v-if="currentScheduleItem.frequencyType === 'DAILY'">
              <view class="daily-config">
                <text class="config-label">请选择每天的预约时段：</text>
                <picker 
                  mode="selector" 
                  :range="periodOptions" 
                  :value="periodOptions.indexOf(dailyPeriod)"
                  @change="e => dailyPeriod = periodOptions[e.detail.value]"
                >
                  <view class="period-picker-single">
                    <uni-icons type="notification" size="20" color="#3ec6c6"></uni-icons>
                    <text :class="['picker-value', dailyPeriod ? '' : 'placeholder']">
                      {{ dailyPeriod || '选择时段' }}
                    </text>
                    <uni-icons type="arrowdown" size="16" color="#ccc"></uni-icons>
                  </view>
                </picker>
              </view>
            </template>
            
            <!-- WEEKLY: 选周几 + 预约时段 -->
            <template v-else-if="currentScheduleItem.frequencyType === 'WEEKLY'">
              <text class="config-label">请选择每周的服务日和时段（最多{{ currentScheduleItem.frequencyLimit }}个）：</text>
              <view class="schedule-dates-list">
                <view v-if="currentScheduleDates.length === 0" class="schedule-empty">
                  <uni-icons type="calendar" size="48" color="#ddd"></uni-icons>
                  <text>暂未配置，请点击下方按钮添加</text>
                </view>
                <view 
                  v-for="(date, index) in currentScheduleDates" 
                  :key="index" 
                  class="schedule-date-item"
                >
                  <view class="date-item-header">
                    <text class="date-index">{{ index + 1 }}</text>
                  </view>
                  <view class="date-item-content">
                    <picker 
                      mode="selector" 
                      :range="weekdayLabels" 
                      :value="date.weekday ? date.weekday - 1 : 0"
                      @change="e => date.weekday = e.detail.value + 1"
                    >
                      <view class="date-picker">
                        <uni-icons type="calendar" size="20" color="#3ec6c6"></uni-icons>
                        <view class="picker-value-wrap">
                          <text class="picker-label">星期</text>
                          <text :class="['picker-value', date.weekday ? '' : 'placeholder']">
                            {{ date.weekday ? weekdayLabels[date.weekday - 1] : '选择星期' }}
                          </text>
                        </view>
                        <uni-icons type="arrowdown" size="16" color="#ccc"></uni-icons>
                      </view>
                    </picker>
                    <picker 
                      mode="selector" 
                      :range="periodOptions" 
                      :value="periodOptions.indexOf(date.appointmentPeriod)"
                      @change="e => date.appointmentPeriod = periodOptions[e.detail.value]"
                    >
                      <view class="period-picker">
                        <uni-icons type="notification" size="20" color="#3ec6c6"></uni-icons>
                        <view class="picker-value-wrap">
                          <text class="picker-label">时段</text>
                          <text :class="['picker-value', date.appointmentPeriod ? '' : 'placeholder']">
                            {{ date.appointmentPeriod || '选择时段' }}
                          </text>
                        </view>
                        <uni-icons type="arrowdown" size="16" color="#ccc"></uni-icons>
                      </view>
                    </picker>
                  </view>
                  <view class="date-item-action" @click="removeScheduleDate(index)">
                    <uni-icons type="trash" size="20" color="#ff4d4f"></uni-icons>
                  </view>
                </view>
              </view>
              <view class="add-date-btn" @click="addScheduleDate" v-if="currentScheduleDates.length < currentScheduleItem.frequencyLimit">
                <uni-icons type="plusempty" size="20" color="#3ec6c6"></uni-icons>
                <text>添加 ({{ currentScheduleDates.length }}/{{ currentScheduleItem.frequencyLimit }})</text>
              </view>
            </template>
            
            <!-- MONTHLY: 选几号 + 预约时段 -->
            <template v-else-if="currentScheduleItem.frequencyType === 'MONTHLY'">
              <view class="monthly-tip-card">
                <view class="tip-icon">
                  <uni-icons type="info-filled" size="24" color="#fa8c16"></uni-icons>
                </view>
                <view class="tip-content">
                  <view class="tip-title">套餐有效期</view>
                  <view class="tip-date-range">
                    <text class="date-start">{{ getEffectiveDate() }}</text>
                    <text class="date-separator">至</text>
                    <text class="date-end">{{ getExpiryDate() }}</text>
                  </view>
                  <view class="tip-description">
                    <text>可选日期范围为</text>
                    <text class="date-range-highlight">1~{{ getMinDayInRange() }}号</text>
                    
                  </view>
                </view>
              </view>
              <text class="config-label">请选择每月的服务日和时段（最多{{ currentScheduleItem.frequencyLimit }}个）：</text>
              <view class="schedule-dates-list">
                <view v-if="currentScheduleDates.length === 0" class="schedule-empty">
                  <uni-icons type="calendar" size="48" color="#ddd"></uni-icons>
                  <text>暂未配置，请点击下方按钮添加</text>
                </view>
                <view 
                  v-for="(date, index) in currentScheduleDates" 
                  :key="index" 
                  class="schedule-date-item"
                >
                  <view class="date-item-header">
                    <text class="date-index">{{ index + 1 }}</text>
                  </view>
                  <view class="date-item-content">
                    <picker 
                      mode="selector" 
                      :range="Array.from({length: getMinDayInRange()}, (_, i) => (i + 1) + '号')" 
                      :value="date.monthDay ? date.monthDay - 1 : 0"
                      @change="e => date.monthDay = e.detail.value + 1"
                    >
                      <view class="date-picker">
                        <uni-icons type="calendar" size="20" color="#3ec6c6"></uni-icons>
                        <view class="picker-value-wrap">
                          <text class="picker-label">日期</text>
                          <text :class="['picker-value', date.monthDay ? '' : 'placeholder']">
                            {{ date.monthDay ? date.monthDay + '号' : '选择日期' }}
                          </text>
                        </view>
                        <uni-icons type="arrowdown" size="16" color="#ccc"></uni-icons>
                      </view>
                    </picker>
                    <picker 
                      mode="selector" 
                      :range="periodOptions" 
                      :value="periodOptions.indexOf(date.appointmentPeriod)"
                      @change="e => date.appointmentPeriod = periodOptions[e.detail.value]"
                    >
                      <view class="period-picker">
                        <uni-icons type="notification" size="20" color="#3ec6c6"></uni-icons>
                        <view class="picker-value-wrap">
                          <text class="picker-label">时段</text>
                          <text :class="['picker-value', date.appointmentPeriod ? '' : 'placeholder']">
                            {{ date.appointmentPeriod || '选择时段' }}
                          </text>
                        </view>
                        <uni-icons type="arrowdown" size="16" color="#ccc"></uni-icons>
                      </view>
                    </picker>
                  </view>
                  <view class="date-item-action" @click="removeScheduleDate(index)">
                    <uni-icons type="trash" size="20" color="#ff4d4f"></uni-icons>
                  </view>
                </view>
              </view>
              <view class="add-date-btn" @click="addScheduleDate" v-if="currentScheduleDates.length < currentScheduleItem.frequencyLimit">
                <uni-icons type="plusempty" size="20" color="#3ec6c6"></uni-icons>
                <text>添加 ({{ currentScheduleDates.length }}/{{ currentScheduleItem.frequencyLimit }})</text>
              </view>
            </template>
            
            <!-- TOTAL: 选第几天 + 预约时段 -->
            <template v-else>
              <text class="config-label">请选择套餐生效后的第几天进行服务（共{{ currentScheduleItem.totalCount }}次）：</text>
              <view class="validity-tip">
                <uni-icons type="info" size="16" color="#3ec6c6"></uni-icons>
                <text>套餐有效期{{ getPackageMaxDays() }}天，请在有效期内安排服务</text>
              </view>
              <view class="schedule-dates-list">
                <view v-if="currentScheduleDates.length === 0" class="schedule-empty">
                  <uni-icons type="calendar" size="48" color="#ddd"></uni-icons>
                  <text>暂未配置，请点击下方按钮添加</text>
                </view>
                <view 
                  v-for="(date, index) in currentScheduleDates" 
                  :key="index" 
                  class="schedule-date-item"
                >
                  <view class="date-item-header">
                    <text class="date-index">{{ index + 1 }}</text>
                  </view>
                  <view class="date-item-content">
                    <view class="date-picker">
                      <uni-icons type="calendar" size="20" color="#3ec6c6"></uni-icons>
                      <view class="picker-value-wrap">
                        <text class="picker-label">第</text>
                        <view class="stepper-wrapper">
                          <view class="stepper-btn" @click="decrementDay(date)">
                            <uni-icons type="minus" size="16" color="#3ec6c6"></uni-icons>
                          </view>
                          <input 
                            type="number" 
                            v-model.number="date.dayOffset" 
                            class="stepper-input"
                            @blur="validateDayOffset(date)"
                          />
                          <view class="stepper-btn" @click="incrementDay(date)">
                            <uni-icons type="plus" size="16" color="#3ec6c6"></uni-icons>
                          </view>
                        </view>
                        <text class="picker-label">天</text>
                      </view>
                    </view>
                    <picker 
                      mode="selector" 
                      :range="periodOptions" 
                      :value="periodOptions.indexOf(date.appointmentPeriod)"
                      @change="e => date.appointmentPeriod = periodOptions[e.detail.value]"
                    >
                      <view class="period-picker">
                        <uni-icons type="notification" size="20" color="#3ec6c6"></uni-icons>
                        <view class="picker-value-wrap">
                          <text class="picker-label">时段</text>
                          <text :class="['picker-value', date.appointmentPeriod ? '' : 'placeholder']">
                            {{ date.appointmentPeriod || '选择时段' }}
                          </text>
                        </view>
                        <uni-icons type="arrowdown" size="16" color="#ccc"></uni-icons>
                      </view>
                    </picker>
                  </view>
                  <view class="date-item-action" @click="removeScheduleDate(index)">
                    <uni-icons type="trash" size="20" color="#ff4d4f"></uni-icons>
                  </view>
                </view>
              </view>
              <view class="add-date-btn" @click="addScheduleDate" v-if="currentScheduleDates.length < currentScheduleItem.totalCount">
                <uni-icons type="plusempty" size="20" color="#3ec6c6"></uni-icons>
                <text>添加 ({{ currentScheduleDates.length }}/{{ currentScheduleItem.totalCount }})</text>
              </view>
              <view class="schedule-full-tip" v-if="currentScheduleDates.length >= currentScheduleItem.totalCount">
                <uni-icons type="info" size="20" color="#52c41a"></uni-icons>
                <text>已配置全部{{ currentScheduleItem.totalCount }}次服务时间</text>
              </view>
            </template>
          </scroll-view>
          <view class="picker-footer">
            <view class="cancel-btn" @click="closeScheduleConfig">取消</view>
            <view class="confirm-btn" @click="saveScheduleConfig">确定</view>
          </view>
        </view>
      </view>
      
      <!-- 证明材料 -->
      <view class="form-item">
        <view class="form-label">证明材料</view>
        <view class="upload-section">
          <!-- 已上传的文件列表 -->
          <view v-if="uploadedFiles.length > 0" class="uploaded-files-container">
            <!-- 图片列表 -->
            <view v-if="imageFiles.length > 0" class="file-group">
              <text class="group-title">图片文件</text>
              <view class="uploaded-files">
                <view 
                  v-for="(file, index) in imageFiles" 
                  :key="index" 
                  class="uploaded-file-item"
                >
                  <view class="file-preview image-preview">
                    <image 
                      :src="file.path" 
                      class="preview-image" 
                      mode="aspectFill"
                      @click="previewFile(file, index)"
                    ></image>
                    <view class="delete-btn" @click.stop="removeFile(file)">
                      <uni-icons type="close" size="16" color="#fff"></uni-icons>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 文档列表 -->
            <view v-if="documentFiles.length > 0" class="file-group">
              <text class="group-title">文档文件</text>
              <view class="document-list">
                <view 
                  v-for="(file, index) in documentFiles" 
                  :key="index" 
                  class="document-item"
                >
                  <view class="document-icon">
                    <uni-icons type="document-filled" size="32" color="#3ec6c6"></uni-icons>
                    <text class="file-extension">{{ getFileExtension(file.name) }}</text>
                  </view>
                  <text class="document-name">{{ file.name }}</text>
                  <view class="delete-btn-doc" @click="removeFile(file)">
                    <uni-icons type="trash" size="20" color="#ff4d4f"></uni-icons>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 添加更多文件按钮 -->
            <view v-if="uploadedFiles.length < 5" class="add-more-section">
              <view class="add-more-btn" @click="chooseFile">
                <uni-icons type="plus" size="32" color="#3ec6c6"></uni-icons>
                <text>继续添加</text>
              </view>
            </view>
          </view>
          <!-- 初始上传按钮 -->
          <view v-else class="upload-btn" @click="chooseFile">
            <text class="iconfont icon-shangchuan"></text>
            <text>选取文件</text>
          </view>
          <view class="upload-tip">
            请上传 大小不超过 10MB 格式为 jpg/jpeg/png/pdf 的文件
          </view>
        </view>
        <view class="form-tip">
          请上传政府消费券截图、合同材料等证明文件，支持jpg/png/pdf格式，最多5个文件
        </view>
      </view>
    </view>
    
    <!-- 说明信息 -->
    <view class="notice-section">
      <view class="notice-title">
        <text class="iconfont icon-tishi"></text>
        <text>购买说明</text>
      </view>
      <view class="notice-content">
        购买套餐后需等待社区管理员审核，审核通过后套餐生效并自动生成服务订单。请确保已完成支付。
      </view>
    </view>
    
    <!-- 底部提交按钮 -->
    <view class="bottom-bar">
      <view class="price-summary">
        <text class="summary-label">实付金额</text>
        <view class="price-value">
          <text class="currency">¥</text>
          <text class="summary-price">{{ packageData.price || 0 }}</text>
        </view>
      </view>
      <button class="submit-btn" @click="submitPurchase" :loading="submitting">
        {{ submitting ? '提交中...' : '确认购买' }}
      </button>
    </view>
  </view>
</template>

<script>
import { myPurchasePackage, listMyPackageInstance } from '@/api/userpackage'
import { listServicesaddressNoPage } from '@/api/servicesaddress'
import { listFamilymemberNoPage } from '@/api/familymember'
import config from '@/config'
import { getToken } from '@/utils/auth'

export default {
  computed: {
    // 图片文件列表
    imageFiles() {
      return this.uploadedFiles.filter(file => this.isImageFile(file))
    },
    
    // 文档文件列表
    documentFiles() {
      return this.uploadedFiles.filter(file => !this.isImageFile(file))
    },
    
    // 最大可选成员数量（根据memberCount字段）
    maxMemberCount() {
      return this.packageData.memberCount || 1
    },
    
    // 是否已达到最大选择数量
    isMaxSelected() {
      return this.selectedMembers.length >= this.maxMemberCount
    },
    
    // 已选成员的显示文本
    selectedMembersText() {
      if (this.selectedMembers.length === 0) return ''
      return this.selectedMembers.map(m => m.name).join('、')
    }
  },
  data() {
    return {
      // 套餐数据
      packageData: {
        packageId: null,
        packageName: '',
        price: 0,
        originalPrice: 0,
        validityPeriod: null,
        validityUnit: '',
        description: ''
      },
      
      // 购买数据
      purchaseData: {
        packageId: null,
        memberId: null,
        serviceAddress: '',
        proofFiles: []
      },
      
      // 家庭成员
      familyMembers: [],
      familyMemberOptions: [],
      selectedMember: null,
      selectedMemberIndex: -1,
      selectedMembers: [], // 多选的成员列表
      selectedMemberIndices: [], // 多选的成员索引列表
      purchasedMemberIds: [], // 已购买该套餐的成员ID列表
      memberPickerVisible: false, // 成员选择器显示状态
      
      // 服务时间配置（模式2）
      residentSelectItems: [], // 需要居民自选时间的服务项列表
      hasResidentSelectItems: false,
      scheduleConfigMap: {}, // { serviceId: 配置数据(格式因频率类型而异) }
      scheduleVisible: false,
      currentScheduleItem: null,
      currentScheduleItemIndex: -1,
      currentScheduleDates: [], // WEEKLY/MONTHLY/TOTAL用的列表
      dailyPeriod: '', // DAILY用的单一时段
      periodOptions: ['8:00~10:00', '10:00~12:00', '12:00~14:00', '14:00~16:00', '16:00~18:00'],
      weekdayLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      freqMap: { TOTAL: '整期', DAILY: '每天', WEEKLY: '每周', MONTHLY: '每月' },
      
      // 上传的文件
      uploadedFiles: [],
      
      submitting: false,
      selectedAddressId: null
    }
  },
  
  methods: {
    // 检查已购买该套餐的成员（使用中 + 待审核状态都不允许重复购买）
    async checkPurchasedMembers() {
      if (!this.purchaseData.packageId) return
      
      try {
        // 查询使用中和待审核的套餐
        const [activeRes, pendingRes] = await Promise.all([
          listMyPackageInstance({
            packageId: this.purchaseData.packageId,
            instanceStatus: 'ACTIVE'
          }),
          listMyPackageInstance({
            packageId: this.purchaseData.packageId,
            instanceStatus: 'PENDING_REVIEW'
          })
        ])
        
        const activeIds = (activeRes.rows || []).map(pkg => pkg.memberId)
        const pendingIds = (pendingRes.rows || []).map(pkg => pkg.memberId)
        // 合并去重
        this.purchasedMemberIds = [...new Set([...activeIds, ...pendingIds])]
        console.log('已购买/待审核该套餐的成员ID:', this.purchasedMemberIds)
      } catch (error) {
        console.error('检查已购买成员失败:', error)
      }
    },
    
    // 加载家庭成员列表
    async loadFamilyMembers() {
      try {
        const response = await listFamilymemberNoPage()
        
        if (response.code === 200 && response.data) {
          this.familyMembers = response.data
          
          // 先检查已购买的成员
          await this.checkPurchasedMembers()
          
          this.familyMemberOptions = this.familyMembers.map(member => {
            const isPurchased = this.purchasedMemberIds.includes(member.memberId)
            return {
              label: isPurchased 
                ? `${member.memberName} (${member.relationship}) - 已购买/审核中` 
                : `${member.memberName} (${member.relationship})`,
              value: member.memberId,
              name: member.memberName,
              disabled: isPurchased
            }
          })
          
          console.log('家庭成员列表已加载:', this.familyMemberOptions)
        }
      } catch (error) {
        console.error('加载家庭成员列表失败:', error)
      }
    },
    
    // 选择家庭成员
    onMemberChange(e) {
      const index = e.detail.value
      const selectedOption = this.familyMemberOptions[index]
      
      // 检查是否选择了已购买的成员
      if (selectedOption.disabled) {
        uni.showToast({
          title: '该成员已购买此套餐',
          icon: 'none'
        })
        return
      }
      
      this.selectedMemberIndex = index
      this.selectedMember = selectedOption
      this.purchaseData.memberId = this.selectedMember.value
      
      console.log('已选择成员:', this.selectedMember)
    },
    
    // 显示成员选择器
    showMemberPicker() {
      // 打开弹窗时，将已选成员同步到临时选择列表
      this.selectedMemberIndices = this.selectedMembers.map(m => 
        this.familyMemberOptions.findIndex(opt => opt.value === m.value)
      ).filter(i => i >= 0)
      this.memberPickerVisible = true
    },
    
    // 关闭成员选择器
    closeMemberPicker() {
      this.memberPickerVisible = false
    },
    
    // 判断成员是否已选中
    isMemberSelected(index) {
      return this.selectedMemberIndices.includes(index)
    },
    
    // 切换成员选择状态
    toggleMemberSelect(index) {
      const selectedOption = this.familyMemberOptions[index]
      
      // 检查是否选择了已购买的成员
      if (selectedOption.disabled) {
        uni.showToast({
          title: '该成员已购买此套餐',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      const idx = this.selectedMemberIndices.indexOf(index)
      if (idx >= 0) {
        // 已选中，取消选择
        this.selectedMemberIndices.splice(idx, 1)
      } else {
        // 未选中，检查是否达到上限
        if (this.selectedMemberIndices.length >= this.maxMemberCount) {
          uni.showToast({
            title: `最多只能选择${this.maxMemberCount}人`,
            icon: 'none'
          })
          return
        }
        this.selectedMemberIndices.push(index)
      }
    },
    
    // 确认成员选择
    confirmMemberSelect() {
      this.selectedMembers = this.selectedMemberIndices.map(index => this.familyMemberOptions[index])
      // 更新purchaseData中的memberId（多个用逗号分隔）
      this.purchaseData.memberId = this.selectedMembers.map(m => m.value).join(',')
      // 兼容单选逻辑
      if (this.selectedMembers.length > 0) {
        this.selectedMember = this.selectedMembers[0]
        this.selectedMemberIndex = this.selectedMemberIndices[0]
      } else {
        this.selectedMember = null
        this.selectedMemberIndex = -1
      }
      this.closeMemberPicker()
      console.log('已选择成员:', this.selectedMembers)
    },
    
    // 选择成员（保留兼容旧逻辑）
    selectMember(index) {
      const selectedOption = this.familyMemberOptions[index]
      
      // 检查是否选择了已购买的成员
      if (selectedOption.disabled) {
        uni.showToast({
          title: '该成员已购买此套餐',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      this.selectedMemberIndex = index
      this.selectedMember = selectedOption
      this.purchaseData.memberId = this.selectedMember.value
      this.closeMemberPicker()
      
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
        url: '/pages/my/address/index?from=purchase'
      })
    },
    
    // 新增地址
    addNewAddress() {
      uni.navigateTo({
        url: '/pages/my/address/index?from=purchase&action=add'
      })
    },
    
    // 加载默认地址
    async loadDefaultAddress() {
      try {
        if (this.purchaseData.serviceAddress) {
          return
        }
        
        const response = await listServicesaddressNoPage({})
        
        if (response.code === 200 && response.data && response.data.length > 0) {
          const addresses = response.data
          let selectedAddress = addresses.find(addr => addr.isDefault === '1')
          
          if (!selectedAddress) {
            selectedAddress = addresses[0]
          }
          
          if (selectedAddress) {
            const fullAddress = `${selectedAddress.province || ''}${selectedAddress.city || ''}${selectedAddress.district || ''} ${selectedAddress.detailAddress || ''}`
            this.purchaseData.serviceAddress = fullAddress.trim()
            this.selectedAddressId = selectedAddress.addressId
            
            uni.setStorageSync('currentPurchaseAddressId', selectedAddress.addressId)
            
            console.log('已自动加载地址:', this.purchaseData.serviceAddress)
          }
        }
      } catch (error) {
        console.error('加载地址失败:', error)
      }
    },
    
    // 选择文件
    chooseFile() {
      if (this.uploadedFiles.length >= 5) {
        uni.showToast({
          title: '最多上传5个文件',
          icon: 'none'
        })
        return
      }
      
      // 显示选择文件类型的弹窗
      uni.showActionSheet({
        itemList: ['选择图片', '选择文档（PDF/DOC）'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 选择图片
            this.chooseImageFile()
          } else if (res.tapIndex === 1) {
            // 选择文档
            this.chooseDocumentFile()
          }
        }
      })
    },
    
    // 选择图片文件
    chooseImageFile() {
      // #ifdef MP-WEIXIN
      // 微信小程序可以使用 wx.chooseMessageFile 获取原始文件名
      wx.chooseMessageFile({
        count: 5 - this.uploadedFiles.length,
        type: 'image',
        success: (res) => {
          res.tempFiles.forEach((file) => {
            console.log('选择图片:', file.name, 'path:', file.path)
            
            this.uploadedFiles.push({
              name: file.name,  // 原始文件名
              path: file.path,
              isImage: true
            })
          })
        },
        fail: () => {
          // 如果失败，降级使用 uni.chooseImage
          this.chooseImageFallback()
        }
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      // 非微信小程序使用标准方法
      this.chooseImageFallback()
      // #endif
    },
    
    // 降级方案：使用 uni.chooseImage
    chooseImageFallback() {
      uni.chooseImage({
        count: 5 - this.uploadedFiles.length,
        sizeType: ['original'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          res.tempFilePaths.forEach((path, index) => {
            // 从路径中提取文件名
            let fileName = path.split('/').pop() || path.split('\\').pop()
            
            // 如果文件名是临时文件名（包含 tmp_ 或很长的随机字符），生成友好的名称
            if (!fileName || fileName.startsWith('tmp_') || fileName.length > 50) {
              const timestamp = new Date().getTime()
              fileName = `图片_${timestamp + index}.jpg`
            }
            
            // 确保有扩展名
            if (!fileName.includes('.')) {
              fileName = fileName + '.jpg'
            }
            
            console.log('选择图片:', fileName, 'path:', path)
            
            this.uploadedFiles.push({
              name: fileName,
              path: path,
              isImage: true
            })
          })
        }
      })
    },
    
    // 选择文档文件（PDF/DOC）
    chooseDocumentFile() {
      // #ifdef MP-WEIXIN
      // 微信小程序使用 wx.chooseMessageFile
      wx.chooseMessageFile({
        count: 5 - this.uploadedFiles.length,
        type: 'file',
        extension: ['pdf', 'doc', 'docx'],
        success: (res) => {
          res.tempFiles.forEach((file) => {
            console.log('上传文档:', file.name, 'path:', file.path)
            
            this.uploadedFiles.push({
              name: file.name,
              path: file.path,
              isImage: false // 标记为非图片类型
            })
          })
        },
        fail: (error) => {
          console.error('选择文档失败:', error)
          uni.showToast({
            title: '选择文档失败',
            icon: 'none'
          })
        }
      })
      // #endif
      
      // #ifndef MP-WEIXIN
      // 其他平台暂不支持
      uni.showToast({
        title: '当前平台暂不支持选择文档',
        icon: 'none'
      })
      // #endif
    },
    
    // 移除文件
    removeFile(file) {
      const index = this.uploadedFiles.findIndex(f => f.path === file.path)
      if (index !== -1) {
        this.uploadedFiles.splice(index, 1)
      }
    },
    
    // 判断是否为图片文件
    isImageFile(file) {
      // 如果有 isImage 标记，直接返回
      if (file.isImage === true) {
        return true
      }
      
      const imageSuffixes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
      const fileName = file.name.toLowerCase()
      const isImage = imageSuffixes.some(suffix => fileName.endsWith(suffix))
      
      console.log('判断文件类型:', file.name, 'isImage:', isImage)
      
      return isImage
    },
    
    // 获取文件扩展名
    getFileExtension(fileName) {
      const parts = fileName.split('.')
      return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE'
    },
    
    // 预览文件
    previewFile(file, index) {
      if (this.isImageFile(file)) {
        // 图片文件使用uni.previewImage预览
        const imageFiles = this.uploadedFiles.filter(f => this.isImageFile(f))
        const imagePaths = imageFiles.map(f => f.path)
        const currentIndex = imageFiles.findIndex(f => f.path === file.path)
        
        uni.previewImage({
          urls: imagePaths,
          current: currentIndex
        })
      } else {
        // PDF等其他文件提示用户
        uni.showToast({
          title: '暂不支持预览此类型文件',
          icon: 'none'
        })
      }
    },
    
    // 获取有效期文本（兼容validityPeriod/validityUnit和validityValue/validityType两种字段名）
    getValidityText(pkg) {
      const period = pkg.validityPeriod || pkg.validityValue
      const unit = pkg.validityUnit || pkg.validityType
      if (!period) return ''
      const unitMap = {
        'DAY': '天',
        'WEEK': '周',
        'MONTH': '个月',
        'YEAR': '年'
      }
      return `${period}${unitMap[unit] || unit}`
    },
    
    // 获取生效日期
    getEffectiveDate() {
      // 如果后端已经返回了 startTime，直接使用
      if (this.packageData.startTime) {
        return this.packageData.startTime.split(' ')[0]
      }
      
      // 否则根据生效模式计算
      const effectiveMode = this.packageData.effectiveMode
      const now = new Date()
      let start = new Date()
      
      if (effectiveMode === 'CURRENT_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
      } else if (effectiveMode === 'NEXT_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      } else {
        // IMMEDIATE 或默认
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      }
      
      const year = start.getFullYear()
      const month = String(start.getMonth() + 1).padStart(2, '0')
      const day = String(start.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 获取到期日期
    getExpiryDate() {
      // 如果后端已经返回了 expireTime，直接使用
      if (this.packageData.expireTime) {
        return this.packageData.expireTime.split(' ')[0]
      }
      
      // 否则根据生效日期和有效期计算
      const period = this.packageData.validityPeriod || this.packageData.validityValue
      const unit = this.packageData.validityUnit || this.packageData.validityType
      const effectiveMode = this.packageData.effectiveMode
      
      if (!period || !unit) return '-'
      
      const now = new Date()
      let start = new Date()
      
      // 根据生效模式确定开始日期
      if (effectiveMode === 'CURRENT_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
      } else if (effectiveMode === 'NEXT_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      }
      
      // 计算结束日期
      const end = new Date(start)
      
      switch (unit) {
        case 'DAY':
          end.setDate(end.getDate() + parseInt(period) - 1)
          break
        case 'WEEK':
          end.setDate(end.getDate() + parseInt(period) * 7 - 1)
          break
        case 'MONTH':
          end.setMonth(end.getMonth() + parseInt(period))
          end.setDate(end.getDate() - 1)
          break
        case 'YEAR':
          end.setFullYear(end.getFullYear() + parseInt(period))
          end.setDate(end.getDate() - 1)
          break
        default:
          return '-'
      }
      
      const year = end.getFullYear()
      const month = String(end.getMonth() + 1).padStart(2, '0')
      const day = String(end.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 获取生效模式文本
    getEffectiveModeText() {
      const effectiveMode = this.packageData.effectiveMode
      const modeMap = {
        'IMMEDIATE': '立即生效',
        'CURRENT_MONTH': '本月生效',
        'NEXT_MONTH': '下月生效'
      }
      return modeMap[effectiveMode] || '立即生效'
    },
    
    // 计算套餐有效期内所有月份的最小天数（用于安全选择上限）
    getMinDayInRange() {
      const effectiveMode = this.packageData.effectiveMode
      const period = this.packageData.validityPeriod || this.packageData.validityValue
      const unit = this.packageData.validityUnit || this.packageData.validityType
      
      if (!period || !unit) return 28
      
      const now = new Date()
      let start = new Date()
      
      // 根据生效模式确定开始日期
      if (effectiveMode === 'CURRENT_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth(), 1)
      } else if (effectiveMode === 'NEXT_MONTH') {
        start = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      } else {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      }
      
      // 计算结束日期
      const end = new Date(start)
      switch (unit) {
        case 'DAY':
          end.setDate(end.getDate() + parseInt(period) - 1)
          break
        case 'WEEK':
          end.setDate(end.getDate() + parseInt(period) * 7 - 1)
          break
        case 'MONTH':
          end.setMonth(end.getMonth() + parseInt(period))
          end.setDate(end.getDate() - 1)
          break
        case 'YEAR':
          end.setFullYear(end.getFullYear() + parseInt(period))
          end.setDate(end.getDate() - 1)
          break
        default:
          return 28
      }
      
      // 计算有效期内所有月份的最小天数
      let minDay = 31
      const cur = new Date(start.getFullYear(), start.getMonth(), 1)
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1)
      
      while (cur <= endMonth) {
        const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate()
        if (daysInMonth < minDay) {
          minDay = daysInMonth
        }
        cur.setMonth(cur.getMonth() + 1)
      }
      
      return minDay
    },
    
    // 表单验证
    validateForm() {
      if (!this.purchaseData.memberId) {
        uni.showToast({
          title: '请选择被服务人员',
          icon: 'none'
        })
        return false
      }
      
      if (!this.purchaseData.serviceAddress || this.purchaseData.serviceAddress.trim() === '') {
        uni.showToast({
          title: '请选择服务地址',
          icon: 'none'
        })
        return false
      }
      
      // 证明材料改为非必填项
      // if (this.uploadedFiles.length === 0) {
      //   uni.showToast({
      //     title: '请上传证明材料',
      //     icon: 'none'
      //   })
      //   return
      // }
      
      return true
    },
    
    // 上传文件到服务器
    async uploadFilesToServer() {
      if (this.uploadedFiles.length === 0) {
        return []
      }
      
      const uploadedPaths = []
      
      for (let i = 0; i < this.uploadedFiles.length; i++) {
        const file = this.uploadedFiles[i]
        
        try {
          uni.showLoading({
            title: `上传中 ${i + 1}/${this.uploadedFiles.length}`,
            mask: true
          })
          
          const result = await new Promise((resolve, reject) => {
            uni.uploadFile({
              url: config.baseUrl + '/common/upload',
              filePath: file.path,
              name: 'file',
              formData: {
                originalFileName: file.name  // 传递原始文件名给服务器
              },
              header: {
                'Authorization': 'Bearer ' + getToken()
              },
              success: (res) => {
                try {
                  const data = JSON.parse(res.data)
                  if (data.code === 200) {
                    resolve(data)
                  } else {
                    reject(new Error(data.msg || '上传失败'))
                  }
                } catch (e) {
                  reject(new Error('解析响应失败'))
                }
              },
              fail: (err) => {
                reject(err)
              }
            })
          })
          
          // 假设返回的数据结构是 { code: 200, fileName: "xxx", url: "/profile/upload/..." }
          if (result.url) {
            uploadedPaths.push(result.url)
          } else if (result.fileName) {
            uploadedPaths.push(result.fileName)
          }
          
        } catch (error) {
          uni.hideLoading()
          console.error('文件上传失败:', file.name, error)
          throw new Error(`文件 ${file.name} 上传失败: ${error.message}`)
        }
      }
      
      uni.hideLoading()
      return uploadedPaths
    },
    
    // 提交购买
    async submitPurchase() {
      if (!this.validateForm()) {
        return
      }
      
      // 校验模式2的服务项是否都已配置时间
      if (this.hasResidentSelectItems) {
        for (const item of this.residentSelectItems) {
          const cfg = this.scheduleConfigMap[item.serviceId]
          if (!cfg) {
            uni.showToast({
              title: `请为「${item.serviceName}」配置服务时间`,
              icon: 'none'
            })
            return
          }
          // DAILY模式只需检查是否有配置
          if (item.frequencyType === 'DAILY') {
            if (!cfg.appointmentPeriod) {
              uni.showToast({
                title: `请为「${item.serviceName}」配置服务时间`,
                icon: 'none'
              })
              return
            }
          } else {
            // 其他模式检查数组
            if (!Array.isArray(cfg) || cfg.length === 0) {
              uni.showToast({
                title: `请为「${item.serviceName}」配置服务时间`,
                icon: 'none'
              })
              return
            }
            // TOTAL模式需要配满次数
            if (item.frequencyType === 'TOTAL' && cfg.length < item.totalCount) {
              const confirmResult = await new Promise(resolve => {
                uni.showModal({
                  title: '提示',
                  content: `「${item.serviceName}」已配置${cfg.length}次，总共需要${item.totalCount}次，确认继续？`,
                  success: (res) => resolve(res.confirm)
                })
              })
              if (!confirmResult) return
            }
          }
        }
      }
      
      // 二次确认
      const confirmed = await new Promise(resolve => {
        uni.showModal({
          title: '确认购买',
          content: '确认为该家庭成员购买此套餐？提交后需等待社区审核。',
          confirmText: '确认购买',
          cancelText: '再想想',
          success: (res) => resolve(res.confirm)
        })
      })
      if (!confirmed) return
      
      try {
        this.submitting = true
        
        // 先上传文件到服务器
        let uploadedPaths = []
        if (this.uploadedFiles.length > 0) {
          try {
            uploadedPaths = await this.uploadFilesToServer()
            console.log('文件上传成功，路径:', uploadedPaths)
          } catch (error) {
            uni.showToast({
              title: error.message || '文件上传失败',
              icon: 'none'
            })
            this.submitting = false
            return
          }
        }
        
        // 构建居民自选日期配置JSON（新格式，按频率类型区分）
        let scheduleConfig = null
        if (this.hasResidentSelectItems) {
          const items = []
          for (const item of this.residentSelectItems) {
            const cfg = this.scheduleConfigMap[item.serviceId]
            if (!cfg) continue
            const entry = { serviceId: item.serviceId, frequencyType: item.frequencyType }
            if (item.frequencyType === 'DAILY') {
              // DAILY: { appointmentPeriod: 'xxx' }
              entry.appointmentPeriod = cfg.appointmentPeriod
            } else if (item.frequencyType === 'WEEKLY') {
              // WEEKLY: [{ weekday: 1, appointmentPeriod: 'xxx' }]
              entry.dates = cfg
            } else if (item.frequencyType === 'MONTHLY') {
              // MONTHLY: [{ monthDay: 5, appointmentPeriod: 'xxx' }]
              entry.dates = cfg
            } else {
              // TOTAL: [{ dayOffset: 3, appointmentPeriod: 'xxx' }]
              entry.dates = cfg
            }
            items.push(entry)
          }
          if (items.length > 0) {
            scheduleConfig = JSON.stringify({ items: items })
          }
        }
        
        // 准备提交的数据
        const submitData = {
          packageId: this.purchaseData.packageId,
          memberId: this.purchaseData.memberId,
          addressId: this.selectedAddressId,
          serviceAddress: this.purchaseData.serviceAddress,
          proofMaterials: uploadedPaths.length > 0 ? JSON.stringify(uploadedPaths) : null,
          scheduleConfig: scheduleConfig
        }
        
        console.log('提交购买数据:', submitData)
        
        const response = await myPurchasePackage(submitData)
        
        if (response.code === 200) {
          uni.showToast({
            title: '购买申请已提交',
            icon: 'success',
            duration: 2000
          })
          
          // 清除缓存
          uni.removeStorageSync('purchaseDataCache')
          
          setTimeout(() => {
            // 跳转到我的套餐页面
            uni.redirectTo({
              url: '/pages/server/SetMeal/index?tab=my'
            })
          }, 2000)
        } else {
          uni.showToast({
            title: response.msg || '购买失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交购买失败:', error)
        uni.showToast({
          title: error.msg || '网络错误，请重试',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    },
    
    // 初始化数据
    initData() {
      try {
        const cacheData = uni.getStorageSync('purchaseDataCache')
        
        if (cacheData) {
          console.log('从缓存加载的购买数据:', cacheData)
          
          this.packageData = {
            ...this.packageData,
            ...cacheData
          }
          
          this.purchaseData.packageId = cacheData.packageId
          
          // 识别模式2的服务项
          if (cacheData.packageItems && cacheData.packageItems.length > 0) {
            const mode2Items = cacheData.packageItems.filter(item => item.dateConfigMode === '2')
            this.residentSelectItems = mode2Items
            this.hasResidentSelectItems = mode2Items.length > 0
            console.log('需要配置时间的服务项:', mode2Items)
          }
        } else {
          console.warn('缓存中没有购买数据')
          uni.showToast({
            title: '数据加载失败',
            icon: 'none'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        }
      } catch (error) {
        console.error('初始化数据失败:', error)
      }
    },
    
    // 获取已配置的时间次数
    getScheduleCount(serviceId) {
      const cfg = this.scheduleConfigMap[serviceId]
      if (!cfg) return 0
      // DAILY模式存的是 { appointmentPeriod: 'xxx' }
      if (cfg.appointmentPeriod && !Array.isArray(cfg)) return 1
      // 其他模式存的是数组
      if (Array.isArray(cfg)) return cfg.length
      return 0
    },
    
    // 获取配置上限（根据频率类型返回不同的上限）
    getScheduleLimit(item) {
      // DAILY: 只需配置1次（每天的时段）
      if (item.frequencyType === 'DAILY') {
        return 1
      }
      // WEEKLY: 配置每周的几天（上限是 frequencyLimit）
      else if (item.frequencyType === 'WEEKLY') {
        return item.frequencyLimit
      }
      // MONTHLY: 配置每月的几天（上限是 frequencyLimit）
      else if (item.frequencyType === 'MONTHLY') {
        return item.frequencyLimit
      }
      // TOTAL: 需要配置所有次数
      else {
        return item.totalCount
      }
    },
    
    // 获取服务信息文本
    getServiceInfoText(item) {
      if (item.frequencyType === 'DAILY') {
        return `每天服务`
      } else if (item.frequencyType === 'WEEKLY') {
        return `每周上限${item.frequencyLimit}次 | 共${item.totalCount}次`
      } else if (item.frequencyType === 'MONTHLY') {
        return `每月上限${item.frequencyLimit}次 | 共${item.totalCount}次`
      } else {
        return `整期${item.totalCount}次`
      }
    },
    
    // 打开时间配置弹窗
    openScheduleConfig(index) {
      const item = this.residentSelectItems[index]
      this.currentScheduleItem = item
      this.currentScheduleItemIndex = index
      const existing = this.scheduleConfigMap[item.serviceId]
      
      if (item.frequencyType === 'DAILY') {
        // DAILY: 只需选一个时段
        this.dailyPeriod = (existing && existing.appointmentPeriod) ? existing.appointmentPeriod : ''
        this.currentScheduleDates = []
      } else if (item.frequencyType === 'WEEKLY') {
        // WEEKLY: [{weekday, appointmentPeriod}]
        this.currentScheduleDates = (Array.isArray(existing) && existing.length > 0)
          ? existing.map(d => ({ weekday: d.weekday, appointmentPeriod: d.appointmentPeriod }))
          : []
        this.dailyPeriod = ''
      } else if (item.frequencyType === 'MONTHLY') {
        // MONTHLY: [{monthDay, appointmentPeriod}]
        this.currentScheduleDates = (Array.isArray(existing) && existing.length > 0)
          ? existing.map(d => ({ monthDay: d.monthDay, appointmentPeriod: d.appointmentPeriod }))
          : []
        this.dailyPeriod = ''
      } else {
        // TOTAL: [{dayOffset, appointmentPeriod}]
        this.currentScheduleDates = (Array.isArray(existing) && existing.length > 0)
          ? existing.map(d => ({ dayOffset: d.dayOffset, appointmentPeriod: d.appointmentPeriod }))
          : []
        this.dailyPeriod = ''
      }
      this.scheduleVisible = true
    },
    
    // 添加日期行
    addScheduleDate() {
      const item = this.currentScheduleItem
      if (item.frequencyType === 'WEEKLY') {
        this.currentScheduleDates.push({ weekday: null, appointmentPeriod: '' })
      } else if (item.frequencyType === 'MONTHLY') {
        this.currentScheduleDates.push({ monthDay: null, appointmentPeriod: '' })
      } else {
        // TOTAL
        this.currentScheduleDates.push({ dayOffset: 1, appointmentPeriod: '' })
      }
    },
    
    // 删除日期行
    removeScheduleDate(index) {
      this.currentScheduleDates.splice(index, 1)
    },
    
    // 步数器：减少天数
    decrementDay(date) {
      if (!date.dayOffset || date.dayOffset <= 1) {
        date.dayOffset = 1
      } else {
        date.dayOffset--
      }
    },
    
    // 步数器：增加天数
    incrementDay(date) {
      const maxDays = this.getPackageMaxDays()
      
      if (!date.dayOffset) {
        date.dayOffset = 1
      } else if (date.dayOffset >= maxDays) {
        uni.showToast({
          title: `天数不能超过套餐有效期${maxDays}天`,
          icon: 'none',
          duration: 2000
        })
      } else {
        date.dayOffset++
      }
    },
    
    // 验证天数输入
    validateDayOffset(date) {
      const maxDays = this.getPackageMaxDays()
      
      if (!date.dayOffset || date.dayOffset < 1 || isNaN(date.dayOffset)) {
        date.dayOffset = 1
        uni.showToast({
          title: '天数最小为1',
          icon: 'none',
          duration: 1500
        })
      } else if (date.dayOffset > maxDays) {
        date.dayOffset = maxDays
        uni.showToast({
          title: `天数不能超过套餐有效期${maxDays}天`,
          icon: 'none',
          duration: 2000
        })
      } else {
        // 确保是整数
        date.dayOffset = Math.floor(date.dayOffset)
      }
    },
    
    // 获取套餐的最大天数（有效期）
    getPackageMaxDays() {
      const period = this.packageData.validityPeriod || this.packageData.validityValue
      const unit = this.packageData.validityUnit || this.packageData.validityType
      
      if (!period || !unit) return 365 // 默认最大365天
      
      const periodNum = parseInt(period)
      
      switch (unit) {
        case 'DAY':
          return periodNum
        case 'WEEK':
          return periodNum * 7
        case 'MONTH':
          return periodNum * 30 // 按30天计算
        case 'YEAR':
          return periodNum * 365
        default:
          return 365
      }
    },
    
    // 保存时间配置
    saveScheduleConfig() {
      const item = this.currentScheduleItem
      const freqType = item.frequencyType
      
      if (freqType === 'DAILY') {
        if (!this.dailyPeriod) {
          uni.showToast({
            title: '请选择预约时段',
            icon: 'none'
          })
          return
        }
        this.scheduleConfigMap[item.serviceId] = { appointmentPeriod: this.dailyPeriod }
      } else if (freqType === 'WEEKLY') {
        if (this.currentScheduleDates.length === 0) {
          uni.showToast({
            title: '请至少添加一条配置',
            icon: 'none'
          })
          return
        }
        if (this.currentScheduleDates.length > item.frequencyLimit) {
          uni.showToast({
            title: `每周最多配置${item.frequencyLimit}条`,
            icon: 'none'
          })
          return
        }
        for (const row of this.currentScheduleDates) {
          if (!row.weekday || !row.appointmentPeriod) {
            uni.showToast({
              title: '请完整填写星期和时段',
              icon: 'none'
            })
            return
          }
        }
        // 检查重复的星期
        const weekdays = this.currentScheduleDates.map(r => r.weekday)
        if (new Set(weekdays).size !== weekdays.length) {
          uni.showToast({
            title: '不能选择重复的星期',
            icon: 'none'
          })
          return
        }
        this.scheduleConfigMap[item.serviceId] = this.currentScheduleDates.map(d => ({ ...d }))
      } else if (freqType === 'MONTHLY') {
        if (this.currentScheduleDates.length === 0) {
          uni.showToast({
            title: '请至少添加一条配置',
            icon: 'none'
          })
          return
        }
        if (this.currentScheduleDates.length > item.frequencyLimit) {
          uni.showToast({
            title: `每月最多配置${item.frequencyLimit}条`,
            icon: 'none'
          })
          return
        }
        for (const row of this.currentScheduleDates) {
          if (!row.monthDay || !row.appointmentPeriod) {
            uni.showToast({
              title: '请完整填写日期和时段',
              icon: 'none'
            })
            return
          }
        }
        const days = this.currentScheduleDates.map(r => r.monthDay)
        if (new Set(days).size !== days.length) {
          uni.showToast({
            title: '不能选择重复的日期',
            icon: 'none'
          })
          return
        }
        this.scheduleConfigMap[item.serviceId] = this.currentScheduleDates.map(d => ({ ...d }))
      } else {
        // TOTAL
        if (this.currentScheduleDates.length < item.totalCount) {
          uni.showToast({
            title: `需要配置${item.totalCount}次，当前只配置了${this.currentScheduleDates.length}次`,
            icon: 'none'
          })
          return
        }
        for (const row of this.currentScheduleDates) {
          if (!row.dayOffset || !row.appointmentPeriod) {
            uni.showToast({
              title: '请完整填写天数和时段',
              icon: 'none'
            })
            return
          }
        }
        const offsets = this.currentScheduleDates.map(r => r.dayOffset)
        if (new Set(offsets).size !== offsets.length) {
          uni.showToast({
            title: '不能选择重复的天数',
            icon: 'none'
          })
          return
        }
        this.scheduleConfigMap[item.serviceId] = this.currentScheduleDates.map(d => ({ ...d }))
      }
      this.scheduleVisible = false
      this.$forceUpdate()
    },
    
    // 关闭时间配置弹窗
    closeScheduleConfig() {
      this.scheduleVisible = false
    }
  },
  
  onLoad(options) {
    this.initData()
    this.loadFamilyMembers()
    this.loadDefaultAddress()
  },
  
  onShow() {
    this.loadFamilyMembers()
    
    // 从地址管理页面返回时，接收选中的地址
    const selectedAddress = uni.getStorageSync('selectedAddressForPurchase')
    
    if (selectedAddress) {
      console.log('接收到选中的地址:', selectedAddress)
      
      const fullAddress = `${selectedAddress.province || ''}${selectedAddress.city || ''}${selectedAddress.district || ''} ${selectedAddress.detailAddress || ''}`
      
      this.$nextTick(() => {
        this.purchaseData.serviceAddress = fullAddress.trim()
        this.selectedAddressId = selectedAddress.addressId
        
        uni.setStorageSync('currentPurchaseAddressId', selectedAddress.addressId)
        this.$forceUpdate()
      })
      
      uni.removeStorageSync('selectedAddressForPurchase')
    }
  }
}
</script>

<style lang="scss" scoped>
.purchase-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 160rpx;
}

.package-info-card {
  background: #fff;
  margin: 24rpx;
  border-radius: 20rpx;
  padding: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.package-header {
  padding: 32rpx;
  background: linear-gradient(135deg, #f0fafa 0%, #e8f8f8 100%);
  border-bottom: 1rpx solid #e8f5f5;
}

.package-title-area {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.package-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.package-tags {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.validity-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background: rgba(62, 198, 198, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  
  .iconfont {
    font-size: 24rpx;
    color: #3ec6c6;
  }
  
  text {
    font-size: 24rpx;
    color: #3ec6c6;
    font-weight: 500;
  }
}

.price-info {
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
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

.original-price-text {
  font-size: 24rpx;
  color: #999;
  text-decoration: line-through;
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
    color: #ff4d4f;
    font-weight: 600;
  }
  
  .total-value {
    font-size: 40rpx;
    color: #ff4d4f;
    font-weight: 700;
  }
}

// 生效时间信息
.validity-info {
  padding: 32rpx;
  padding-right: 180rpx; // 为右上角标签留出空间
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
  position: relative;
  border-top: 2rpx solid #ffe7ba;
  min-height: 120rpx;
}

.validity-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  flex: 1;
  
  .validity-label {
    font-size: 24rpx;
    color: #999;
    font-weight: 500;
  }
  
  .validity-value {
    font-size: 32rpx;
    color: #fa8c16;
    font-weight: 700;
    letter-spacing: 1rpx;
  }
}

.validity-divider {
  font-size: 28rpx;
  color: #fa8c16;
  font-weight: 600;
  padding: 0 8rpx;
}

.validity-note {
  position: absolute;
  right: 32rpx;
  top: 32rpx;
  font-size: 24rpx;
  color: #52c41a;
  background: rgba(82, 196, 26, 0.15);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-weight: 600;
  border: 1rpx solid rgba(82, 196, 26, 0.3);
}

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
    background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
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
  font-weight: 500;
  
  &.required::before {
    content: '*';
    color: #ff4d4f;
    margin-right: 6rpx;
  }
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e8e8e8;
  
  text {
    font-size: 28rpx;
    color: #333;
    
    &.placeholder {
      color: #999;
    }
  }
  
  .iconfont {
    font-size: 24rpx;
    color: #999;
  }
}

.add-member-btn,
.add-address-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx;
  background: #f0fafa;
  border-radius: 12rpx;
  margin-bottom: 32rpx;
  border: 2rpx dashed #3ec6c6;
  
  .iconfont {
    font-size: 32rpx;
    color: #3ec6c6;
  }
  
  text {
    font-size: 28rpx;
    color: #3ec6c6;
    font-weight: 500;
  }
}

.address-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 28rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e8e8e8;
  
  .address-text {
    flex: 1;
    font-size: 28rpx;
    color: #333;
    
    &.placeholder {
      color: #999;
    }
  }
  
  .iconfont {
    font-size: 24rpx;
    color: #999;
    margin-left: 12rpx;
  }
}

.upload-section {
  .upload-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 28rpx;
    background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
    border-radius: 12rpx;
    color: #fff;
    
    .iconfont {
      font-size: 32rpx;
    }
    
    text {
      font-size: 28rpx;
      font-weight: 500;
    }
  }
  
  .upload-tip {
    font-size: 24rpx;
    color: #999;
    margin-top: 16rpx;
    text-align: center;
  }
  
  // 已上传文件容器
  .uploaded-files-container {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  
  // 文件分组
  .file-group {
    .group-title {
      display: block;
      font-size: 26rpx;
      color: #666;
      font-weight: 500;
      margin-bottom: 16rpx;
      padding-left: 4rpx;
    }
  }
  
  // 图片列表
  .uploaded-files {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }
  
  .uploaded-file-item {
    position: relative;
    width: 200rpx;
    height: 200rpx;
  }
  
  .file-preview {
    width: 100%;
    height: 100%;
    border-radius: 12rpx;
    overflow: hidden;
    position: relative;
    background: #f5f5f5;
    border: 2rpx solid #e8e8e8;
  }
  
  // 图片预览样式
  .image-preview {
    .preview-image {
      width: 100%;
      height: 100%;
      display: block;
    }
  }
  
  .delete-btn {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 32rpx;
    height: 32rpx;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  
  // 文档列表
  .document-list {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
  
  .document-item {
    display: flex;
    align-items: center;
    padding: 20rpx 24rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border: 2rpx solid #e8e8e8;
    gap: 16rpx;
    
    .document-icon {
      position: relative;
      flex-shrink: 0;
      
      .file-extension {
        position: absolute;
        bottom: -4rpx;
        left: 50%;
        transform: translateX(-50%);
        font-size: 16rpx;
        color: #3ec6c6;
        font-weight: 600;
        background: #fff;
        padding: 2rpx 6rpx;
        border-radius: 4rpx;
      }
    }
    
    .document-name {
      flex: 1;
      font-size: 26rpx;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .delete-btn-doc {
      flex-shrink: 0;
      padding: 8rpx;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  // 添加更多按钮区域
  .add-more-section {
    margin-top: 8rpx;
  }
  
  .add-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 20rpx;
    border: 2rpx dashed #3ec6c6;
    border-radius: 12rpx;
    background: #f0fafa;
    transition: all 0.3s ease;
    
    &:active {
      background: #e0f5f5;
    }
    
    text {
      font-size: 26rpx;
      color: #3ec6c6;
      font-weight: 500;
    }
  }
}

.form-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
  line-height: 1.6;
}

.notice-section {
  background: #fff7e6;
  margin: 24rpx;
  border-radius: 12rpx;
  padding: 24rpx;
  border: 1rpx solid #ffd591;
  
  .notice-title {
    display: flex;
    align-items: center;
    gap: 8rpx;
    margin-bottom: 12rpx;
    
    .iconfont {
      font-size: 28rpx;
      color: #fa8c16;
    }
    
    text {
      font-size: 28rpx;
      font-weight: 600;
      color: #fa8c16;
    }
  }
  
  .notice-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 28rpx;
  z-index: 100;
}

.price-summary {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  flex-shrink: 0;
  
  .summary-label {
    font-size: 24rpx;
    color: #999;
  }
  
  .price-value {
    display: flex;
    align-items: baseline;
    
    .currency {
      font-size: 28rpx;
      color: #ff4d4f;
      font-weight: 600;
    }
    
    .summary-price {
      font-size: 40rpx;
      color: #ff4d4f;
      font-weight: 700;
    }
  }
}

.submit-btn {
  flex: 1;
  height: 88rpx;
  line-height: 88rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
  border-radius: 44rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(62, 198, 198, 0.4);
  
  &::after {
    border: none;
  }
}

// 成员选择器弹窗
.member-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.member-picker-popup {
  width: 100%;
  max-height: 70vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
  
  .picker-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .close-btn {
    position: absolute;
    right: 32rpx;
    padding: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.picker-content {
  flex: 1;
  overflow-y: auto;
  padding: 16rpx 0;
}

.member-option {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;
  transition: background 0.2s;
  position: relative;
  
  &:active:not(.disabled) {
    background: #f8f9fa;
  }
  
  &.selected {
    background: #f0fafa;
    
    .member-name {
      color: #3ec6c6;
      font-weight: 600;
    }
  }
  
  &.disabled {
    opacity: 0.4;
    
    .member-name {
      color: #999;
      text-decoration: line-through;
    }
  }
  
  .member-checkbox {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ddd;
    border-radius: 6rpx;
    margin-right: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    &.checked {
      background: #3ec6c6;
      border-color: #3ec6c6;
    }
  }
  
  .member-name {
    font-size: 28rpx;
    color: #333;
    flex: 1;
  }
}

.picker-footer {
  padding: 24rpx 32rpx;
  border-top: 1rpx solid #f0f0f0;
  
  .confirm-select-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    background: #3ec6c6;
    color: #fff;
    border: none;
    border-radius: 12rpx;
    font-size: 30rpx;
  }
}

.picker-count {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
}

.member-count-tip {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 32rpx;
  font-size: 28rpx;
  color: #999;
}

// 服务时间配置区域
.schedule-section {
  margin-top: 36rpx;
  padding-top: 36rpx;
  border-top: 2rpx solid #f0f0f0;
}

.schedule-section-header {
  margin-bottom: 24rpx;
}

.schedule-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.schedule-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.schedule-tip {
  text {
    font-size: 24rpx;
    color: #999;
    line-height: 1.6;
  }
}

.schedule-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  border: 2rpx solid #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  
  &.schedule-item-configured {
    border-color: #3ec6c6;
    background: linear-gradient(135deg, #f0fafa 0%, #fff 100%);
    box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.12);
  }
}

.schedule-item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
  min-width: 0;
}

.schedule-item-icon {
  flex-shrink: 0;
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #e8f8f8 0%, #d4f0f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.schedule-item-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  min-width: 0;
  
  .service-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .service-info {
    font-size: 22rpx;
    color: #999;
  }
}

.schedule-item-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.schedule-progress {
  .progress-text {
    font-size: 24rpx;
    color: #3ec6c6;
    font-weight: 600;
  }
}

.schedule-config-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
  border-radius: 32rpx;
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(62, 198, 198, 0.3);
  
  &.configured {
    background: #fff;
    border: 2rpx solid #3ec6c6;
    box-shadow: none;
    
    text {
      color: #3ec6c6;
    }
  }
  
  text {
    font-size: 24rpx;
    font-weight: 500;
  }
}

// 时间配置弹窗
.schedule-picker-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.schedule-picker-popup {
  width: 100%;
  max-height: 85vh;
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

.schedule-picker-body {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx 32rpx;
}

.schedule-info {
  padding: 24rpx;
  background: linear-gradient(135deg, #f0fafa 0%, #e8f8f8 100%);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.schedule-info-name {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
  
  text {
    font-size: 30rpx;
    color: #333;
    font-weight: 600;
  }
}

.schedule-info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.info-tag {
  padding: 6rpx 16rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20rpx;
  border: 1rpx solid #e0e0e0;
  
  text {
    font-size: 22rpx;
    color: #666;
  }
  
  &.progress-tag {
    background: rgba(62, 198, 198, 0.15);
    border-color: rgba(62, 198, 198, 0.3);
    
    text {
      color: #2eb5b5;
      font-weight: 600;
    }
  }
}

// DAILY 配置样式
.daily-config {
  padding: 24rpx;
  
  .config-label {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
  }
  
  .period-picker-single {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 24rpx;
    background: #fff;
    border-radius: 12rpx;
    border: 2rpx solid #e0e0e0;
    
    .picker-value {
      flex: 1;
      font-size: 28rpx;
      color: #333;
      
      &.placeholder {
        color: #999;
      }
    }
  }
}

// 配置标签
.config-label {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin: 0 24rpx 16rpx;
}

// 有效期提示
.validity-tip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #e8f5f5 0%, #f0f9f9 100%);
  border-radius: 12rpx;
  margin: 0 24rpx 20rpx;
  border: 2rpx solid #b8e5e5;
  
  text {
    font-size: 24rpx;
    color: #2eb5b5;
    line-height: 1.5;
  }
}

// 月度配置提示卡片
.monthly-tip-card {
  display: flex;
  gap: 20rpx;
  padding: 28rpx 24rpx;
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border-radius: 16rpx;
  margin: 0 24rpx 24rpx;
  border: 2rpx solid #ffe7ba;
  box-shadow: 0 4rpx 12rpx rgba(250, 140, 22, 0.08);
  
  .tip-icon {
    flex-shrink: 0;
    width: 56rpx;
    height: 56rpx;
    background: rgba(250, 140, 22, 0.15);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .tip-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12rpx;
  }
  
  .tip-title {
    font-size: 26rpx;
    color: #999;
    font-weight: 500;
  }
  
  .tip-date-range {
    display: flex;
    align-items: center;
    gap: 12rpx;
    
    .date-start,
    .date-end {
      font-size: 28rpx;
      color: #fa8c16;
      font-weight: 700;
      padding: 4rpx 12rpx;
      background: rgba(250, 140, 22, 0.1);
      border-radius: 8rpx;
    }
    
    .date-separator {
      font-size: 24rpx;
      color: #fa8c16;
      font-weight: 600;
    }
  }
  
  .tip-description {
    font-size: 24rpx;
    color: #666;
    line-height: 1.6;
    
    .date-range-highlight {
      color: #fa8c16;
      font-weight: 700;
      font-size: 26rpx;
      padding: 0 8rpx;
    }
  }
}

// 步数器样式
.stepper-wrapper {
  display: flex;
  align-items: center;
  gap: 12rpx;
  
  .stepper-btn {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f0f9f9;
    border-radius: 8rpx;
    border: 2rpx solid #d4eded;
    transition: all 0.2s;
    
    &:active {
      background: #e8f5f5;
      border-color: #3ec6c6;
      transform: scale(0.95);
    }
  }
  
  .stepper-input {
    min-width: 80rpx;
    height: 48rpx;
    text-align: center;
    font-size: 32rpx;
    color: #333;
    font-weight: 700;
    font-family: DIN, -apple-system, Helvetica, sans-serif;
    background: #fff;
    border: 2rpx solid #e8e8e8;
    border-radius: 8rpx;
    padding: 0 8rpx;
    
    &:focus {
      border-color: #3ec6c6;
      background: #f8fdfd;
    }
  }
}

.schedule-dates-list {
  margin-bottom: 16rpx;
}

.schedule-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  padding: 60rpx 32rpx;
  
  text {
    font-size: 26rpx;
    color: #999;
  }
}

.schedule-date-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.date-item-header {
  flex-shrink: 0;
  width: 52rpx;
  height: 52rpx;
  background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 8rpx rgba(62, 198, 198, 0.3);
  
  .date-index {
    font-size: 24rpx;
    color: #fff;
    font-weight: 700;
  }
}

.date-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.date-picker,
.period-picker {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 16rpx;
  border: 2rpx solid #e8ecf0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 6rpx;
    background: linear-gradient(180deg, #3ec6c6 0%, #2eb5b5 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &:active {
    border-color: #3ec6c6;
    background: linear-gradient(135deg, #f8fdfd 0%, #f0f9f9 100%);
    box-shadow: 0 4rpx 16rpx rgba(62, 198, 198, 0.15);
    transform: translateY(-2rpx);
    
    &::before {
      opacity: 1;
    }
  }
  
  .picker-value-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }
  
  .picker-label {
    font-size: 22rpx;
    color: #999;
    font-weight: 500;
    letter-spacing: 0.5rpx;
  }
  
  .picker-value {
    font-size: 30rpx;
    color: #333;
    font-weight: 700;
    font-family: DIN, -apple-system, Helvetica, sans-serif;
    letter-spacing: 1rpx;
    
    &.placeholder {
      color: #bbb;
      font-weight: 400;
      font-size: 28rpx;
    }
  }
}

// 日期选择器特殊样式
.date-picker {
  .picker-value-wrap {
    flex-direction: row;
    align-items: center;
    gap: 8rpx;
  }
  
  .picker-label {
    font-size: 26rpx;
    color: #666;
  }
}

// 时段选择器特殊样式
.period-picker {
  background: linear-gradient(135deg, #f8fdfd 0%, #f0f9f9 100%);
  border-color: #d4eded;
  
  &::before {
    background: linear-gradient(180deg, #52c41a 0%, #3ec6c6 100%);
  }
  
  .picker-value {
    color: #2eb5b5;
  }
  
  &:active {
    background: linear-gradient(135deg, #e8f5f5 0%, #d4eded 100%);
    border-color: #3ec6c6;
  }
}

.date-item-action {
  flex-shrink: 0;
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fff5f5;
  transition: all 0.2s;
  
  &:active {
    background: #ffe7e7;
  }
}

.add-date-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx;
  background: #f0fafa;
  border-radius: 12rpx;
  margin-top: 8rpx;
  border: 2rpx dashed #3ec6c6;
  transition: all 0.2s;
  
  &:active {
    background: #e0f5f5;
  }
  
  text {
    font-size: 26rpx;
    color: #3ec6c6;
    font-weight: 500;
  }
}

.schedule-full-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx;
  background: #f6ffed;
  border-radius: 12rpx;
  margin-top: 8rpx;
  border: 1rpx solid #b7eb8f;
  
  text {
    font-size: 26rpx;
    color: #52c41a;
    font-weight: 500;
  }
}

.picker-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #f0f0f0;
  
  .cancel-btn,
  .confirm-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    border-radius: 40rpx;
    font-size: 30rpx;
    font-weight: 500;
  }
  
  .cancel-btn {
    background: #f5f5f5;
    color: #666;
  }
  
  .confirm-btn {
    background: linear-gradient(135deg, #3ec6c6 0%, #2eb5b5 100%);
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(62, 198, 198, 0.3);
  }
}
</style>
