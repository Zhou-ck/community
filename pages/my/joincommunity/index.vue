<template>
  <view class="join-community-container">
    <!-- 用户当前状态 -->
    <view class="status-section">
      <view class="status-card">
        <view class="status-header">
          <view class="status-icon-wrapper">
            <uni-icons type="home-filled" size="28" color="#4CAF50"></uni-icons>
          </view>
          <text class="status-title">我的社区状态</text>
        </view>
        <view class="status-content">
          <view v-if="userStatus.hasCommunity" class="current-community">
            <view class="status-info">
              <text class="community-name">{{ userStatus.communityName }}</text>
              <text class="community-desc">已加入社区，享受智慧养老服务</text>
            </view>
            <view class="status-badge success" @click="handleJoinedStatus">
              <uni-icons type="checkmarkempty" size="16" color="#fff"></uni-icons>
              <text>已加入</text>
            </view>
          </view>
          <view v-else-if="userStatus.hasApplied" class="pending-status">
            <view class="status-info">
              <text class="pending-text">申请审核中</text>
              <text class="pending-desc">我们正在审核您的申请，请耐心等待</text>
            </view>
            <view class="status-badge pending" @click="handlePendingStatus">
              <uni-icons type="loop" size="16" color="#fff"></uni-icons>
              <text>审核中</text>
            </view>
          </view>
          <view v-else class="no-community">
            <view class="status-info">
              <text class="no-community-text">暂未加入任何社区</text>
              <text class="no-community-desc">选择一个社区开始您的智慧养老生活</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 可加入的社区列表 -->
    <view class="community-section">
      <view class="section-header">
        <view class="header-content">
          <view class="header-left">
            <text class="section-title">可加入的社区</text>
            <text class="section-desc">选择适合您的社区</text>
          </view>
        </view>
      </view>
      
      <view class="community-list">
        <view 
          class="community-item" 
          v-for="(community, index) in communityList" 
          :key="community.id"
          @click="handleCommunityDetail(community)"
        >
          <view class="community-card">
            <view class="community-avatar">
              <image v-if="community.avatar" :src="community.avatar" class="avatar-img" mode="aspectFill"></image>
              <view v-else class="default-avatar">
                <uni-icons type="home-filled" size="36" color="#4CAF50"></uni-icons>
              </view>
            </view>
            
            <view class="community-info">
              <view class="community-header">
                <text class="community-name">{{ community.deptName }}</text>
                <view class="community-tag">智慧社区</view>
              </view>
              <view class="community-details">
                <view class="detail-item">
                  <uni-icons type="location" size="14" color="#999"></uni-icons>
                  <text class="community-address">{{ community.address || '地址待完善' }}</text>
                </view>
                <view class="detail-item">
                  <uni-icons type="person" size="14" color="#999"></uni-icons>
                  <text class="member-count">专业养老服务</text>
                </view>
              </view>
            </view>
            
            <view class="community-action">
              <view 
                v-if="community.applyStatus === 0 && !userStatus.hasCommunity && !userStatus.hasApplied"
                class="apply-btn modern" 
                :data-index="index"
                @click.stop="handleApplyClick"
              >
                <uni-icons type="plus" size="16" color="#fff"></uni-icons>
                <text class="apply-text">申请加入</text>
              </view>
              <view 
                v-else-if="community.applyStatus === 0 && (userStatus.hasCommunity || userStatus.hasApplied)"
                class="status-badge disabled modern"
              >
                <uni-icons type="locked" size="14" color="#fff"></uni-icons>
                <text>不可申请</text>
              </view>
              <view v-else-if="community.applyStatus === 1" class="status-badge pending modern" @click.stop="handlePendingStatus">
                <uni-icons type="loop" size="14" color="#fff"></uni-icons>
                <text>审核中</text>
              </view>
              <view v-else-if="community.applyStatus === 2" class="status-badge success modern" @click.stop="handleJoinedStatus">
                <uni-icons type="checkmarkempty" size="14" color="#fff"></uni-icons>
                <text>已加入</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 温馨提示 -->
    <view v-if="userStatus.hasCommunity || userStatus.hasApplied" class="tip-section">
      <view class="tip-card">
        <view class="tip-icon">
          <uni-icons type="info" size="20" color="#ff9800"></uni-icons>
        </view>
        <view class="tip-content">
          <text class="tip-title">温馨提示</text>
          <text class="tip-desc">{{ userStatus.hasCommunity ? '您已加入社区，一个账号只能加入一个社区' : '您有申请正在审核中，请耐心等待审核结果' }}</text>
        </view>
      </view>
    </view>

    <!-- 申请表单弹窗 -->
    <uni-popup ref="applyPopup" type="bottom" :safe-area="false">
      <view class="apply-form">
        <view class="form-header">
          <view class="header-placeholder"></view>
          <text class="form-title">{{ isModifyMode ? '修改申请加入' : '申请加入' }}</text>
          <uni-icons type="close" size="20" color="#999" @click="closeApplyForm"></uni-icons>
        </view>
        
        <view class="form-content">
          <view class="form-item">
            <text class="form-label"><text class="required">*</text>所属社区</text>
            <view class="form-picker disabled">
              <text class="picker-text">
                {{ getCommunityName() || '请选择所属社区' }}
              </text>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">所属片区</text>
            <picker 
              mode="selector" 
              :range="areaList" 
              range-key="deptName"
              :value="selectedAreaIndex"
              @change="onAreaChange"
              :disabled="!applyForm.communityDeptId"
            >
              <view class="form-picker">
                <text :class="applyForm.areaDeptId ? 'picker-text' : 'picker-placeholder'">
                  {{ getAreaName() || '请选择所属片区' }}
                </text>
                <uni-icons type="arrowright" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label"><text class="required">*</text>所属楼栋</text>
            <picker 
              mode="selector" 
              :range="buildingList" 
              range-key="deptName"
              :value="selectedBuildingIndex"
              @change="onBuildingChange"
              :disabled="!applyForm.communityDeptId"
            >
              <view class="form-picker">
                <text :class="applyForm.buildingDeptId ? 'picker-text' : 'picker-placeholder'">
                  {{ getBuildingName() || '请选择所属楼栋' }}
                </text>
                <uni-icons type="arrowright" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label"><text class="required">*</text>所属单元</text>
            <picker 
              mode="selector" 
              :range="unitList" 
              range-key="deptName"
              :value="selectedUnitIndex"
              @change="onUnitChange"
              :disabled="!applyForm.buildingDeptId"
            >
              <view class="form-picker">
                <text :class="applyForm.unitDeptId ? 'picker-text' : 'picker-placeholder'">
                  {{ getUnitName() || '请选择所属单元' }}
                </text>
                <uni-icons type="arrowright" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label"><text class="required">*</text>门牌号</text>
            <picker 
              mode="selector" 
              :range="householdList" 
              range-key="displayName"
              :value="selectedHouseholdIndex"
              @change="onHouseholdChange"
              :disabled="!applyForm.unitDeptId"
            >
              <view class="form-picker">
                <text :class="applyForm.householdId ? 'picker-text' : 'picker-placeholder'">
                  {{ getHouseholdName() || '请选择门牌号' }}
                </text>
                <uni-icons type="arrowright" size="16" color="#999"></uni-icons>
              </view>
            </picker>
          </view>
          
          <view class="form-item">
            <text class="form-label"><text class="required">*</text>姓名</text>
            <input 
              class="form-input" 
              v-model="applyForm.applicantName" 
              placeholder="请输入您的姓名"
              maxlength="20"
              :focus="false"
              confirm-type="next"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label"><text class="required">*</text>联系电话</text>
            <input 
              class="form-input" 
              v-model="applyForm.applicantPhone" 
              placeholder="请输入联系电话"
              type="number"
              maxlength="11"
              :focus="false"
              confirm-type="done"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">证明材料图片</text>
            <view class="upload-section">
              <!-- 已上传的图片列表 -->
              <view v-if="applyForm.proofPhotoUrls.length > 0" class="uploaded-images">
                <view 
                  v-for="(imageUrl, index) in applyForm.proofPhotoUrls" 
                  :key="index" 
                  class="uploaded-image"
                >
                  <image 
                    :src="imageUrl" 
                    class="proof-image" 
                    mode="aspectFill" 
                    @click="previewImages(index)"
                  ></image>
                  <view class="delete-btn" @click.stop="deleteImage(index)">
                    <uni-icons type="close" size="16" color="#fff"></uni-icons>
                  </view>
                </view>
                <!-- 添加更多图片按钮 -->
                <view v-if="applyForm.proofPhotoUrls.length < 3" class="add-more-btn" @click="chooseImage">
                  <uni-icons type="plus" size="32" color="#999"></uni-icons>
                </view>
              </view>
              <!-- 初始上传按钮 -->
              <view v-else class="upload-btn" @click="chooseImage">
                <uni-icons type="camera" size="32" color="#999"></uni-icons>
                <text class="upload-text">点击上传证明材料</text>
                <text class="upload-tip">最多可上传3张图片</text>
              </view>
            </view>
          </view>
          
          <view class="form-item">
            <text class="form-label">申请理由</text>
            <textarea 
              class="form-textarea" 
              v-model="applyForm.communityDescription" 
              placeholder="请简述您申请加入社区的理由（选填）"
              maxlength="200"
            ></textarea>
          </view>
        </view>
        
        <view class="form-footer">
          <button class="cancel-btn" @click="closeApplyForm">取消</button>
          <button class="submit-btn" @click="submitApply" :loading="submitting">{{ isModifyMode ? '保存修改' : '提交申请' }}</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 审核中状态弹窗 -->
    <uni-popup ref="pendingPopup" type="center" :mask-click="false">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">申请管理</text>
          <view class="close-btn" @click="closePendingPopup">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>
        <view class="popup-content">
          <text class="popup-desc">您的申请正在审核中，您可以选择以下操作：</text>
        </view>
        <view class="popup-footer">
          <button class="popup-btn secondary" @click="handleModifyApply">修改申请</button>
          <button class="popup-btn danger" @click="handleCancelApply">撤销申请</button>
        </view>
      </view>
    </uni-popup>
    
    <!-- 已加入状态弹窗 -->
    <uni-popup ref="joinedPopup" type="center" :mask-click="false">
      <view class="popup-container">
        <view class="popup-header">
          <text class="popup-title">退出社区</text>
          <view class="close-btn" @click="closeJoinedPopup">
            <uni-icons type="close" size="20" color="#666"></uni-icons>
          </view>
        </view>
        <view class="popup-content">
          <text class="popup-desc">确定要退出当前社区吗？退出后将无法享受社区提供的智慧养老服务。</text>
        </view>
        <view class="popup-footer">
          <button class="popup-btn secondary" @click="closeJoinedPopup">取消</button>
          <button class="popup-btn danger" @click="handleLeaveCommunity">退出社区</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { 
  listDeptCommunity, 
  optionslist,
  listHousehold,
  getApplyjoin,
  addApplyjoin,
  updateApplyjoin,
  cancelApplyjoin,
  leaveJoinCommunity
} from '@/api/joinCommunity'
import config from '@/config'
import { getToken } from '@/utils/auth'

export default {
  data() {
    return {
      userStatus: {
        hasCommunity: false,
        hasApplied: false,
        communityName: '',
        applyId: null,
        deptId: null
      },
      communityList: [],
      selectedCommunity: {},
      applyForm: {
        applyId: '',
        communityDeptId: '', // 社区ID
        areaDeptId: '', // 片区ID
        buildingDeptId: '', // 楼栋ID
        unitDeptId: '', // 单元ID
        householdId: '', // 住户ID(楼层门牌号)
        applicantName: '',
        applicantPhone: '',
        communityDescription: '',
        proofPhotoUrls: []
      },
      // 选项列表数据
      allOptionsData: [], // 存储所有选项数据，用于级联筛选
      areaList: [], // 片区列表
      buildingList: [], // 楼栋列表
      unitList: [], // 单元列表
      householdList: [], // 住户列表
      submitting: false,
      loading: false,
      isModifyMode: false // 是否为修改模式
    }
  },
  
  computed: {
    // 获取当前选中的社区索引
    selectedCommunityIndex() {
      if (!this.applyForm.communityDeptId) return 0
      const index = this.communityList.findIndex(item => item.deptId == this.applyForm.communityDeptId)
      return index >= 0 ? index : 0
    },
    // 获取当前选中的片区索引
    selectedAreaIndex() {
      if (!this.applyForm.areaDeptId) return 0
      const index = this.areaList.findIndex(item => item.deptId == this.applyForm.areaDeptId)
      return index >= 0 ? index : 0
    },
    // 获取当前选中的楼栋索引
    selectedBuildingIndex() {
      if (!this.applyForm.buildingDeptId) return 0
      const index = this.buildingList.findIndex(item => item.deptId == this.applyForm.buildingDeptId)
      return index >= 0 ? index : 0
    },
    // 获取当前选中的单元索引
    selectedUnitIndex() {
      if (!this.applyForm.unitDeptId) return 0
      const index = this.unitList.findIndex(item => item.deptId == this.applyForm.unitDeptId)
      return index >= 0 ? index : 0
    },
    // 获取当前选中的住户索引
    selectedHouseholdIndex() {
      if (!this.applyForm.householdId) return 0
      const index = this.householdList.findIndex(item => item.householdId == this.applyForm.householdId)
      return index >= 0 ? index : 0
    }
  },
  
  onLoad() {
    this.initPage()
  },
  
  onShow() {
    this.getUserStatus()
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    this.refreshData()
  },
  
  // 拦截返回按钮
  onBackPress() {
    // 检查是否来自服务分类页面且用户未加入社区
    if (!this.userStatus.hasCommunity) {
      // 检查页面栈，判断上一页是否是服务分类页面
      const pages = getCurrentPages();
      if (pages.length >= 2) {
        const prevPage = pages[pages.length - 2];
        if (prevPage.route === 'pages/server/index') {
          // 如果来自服务分类页面且未加入社区，直接返回到首页
          uni.reLaunch({
            url: '/pages/index'
          });
          return true; // 阻止默认返回行为
        }
      }
    }
    // 其他情况使用默认返回行为
    return false;
  },
  
  methods: {
    // 初始化页面
    async initPage() {
      this.loading = true
      try {
        await Promise.all([
          this.getUserStatus(),
          this.getCommunityList()
        ])
      } catch (error) {
        console.error('初始化页面失败:', error)
        uni.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 下拉刷新数据
    async refreshData() {
      try {
        await Promise.all([
          this.getCommunityList(),
          this.getUserStatus()
        ])
        uni.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1500
        })
      } catch (error) {
        console.error('刷新失败:', error)
        uni.showToast({
          title: '刷新失败，请重试',
          icon: 'none'
        })
      } finally {
        // 停止下拉刷新动画
        uni.stopPullDownRefresh()
      }
    },
    
    // 获取用户社区状态
    async getUserStatus() {
      try {
        // TODO: 调用后端接口获取用户社区状态
        // 暂时根据社区列表中的申请状态来判断
        const appliedCommunity = this.communityList.find(community => 
          community.throughStatus === "0" || community.throughStatus === "1"
        )
        
        const hasAppliedCommunity = !!appliedCommunity
        const hasCommunity = this.communityList.some(community => community.throughStatus === "1")
        
        this.userStatus = {
          hasCommunity: hasCommunity,
          hasApplied: hasAppliedCommunity && !hasCommunity, // 只有在未加入社区但有申请时才显示审核中
          communityName: appliedCommunity ? appliedCommunity.deptName || appliedCommunity.name : '',
          applyId: appliedCommunity ? appliedCommunity.applyId || appliedCommunity.id : null, // 使用社区的申请ID
          deptId: appliedCommunity ? appliedCommunity.deptId || appliedCommunity.id : null
        }
        
        // 如果用户已加入社区，保存社区信息到本地存储
        if (hasCommunity && appliedCommunity) {
          uni.setStorageSync('joined_community', {
            name: appliedCommunity.deptName || appliedCommunity.name,
            communityName: appliedCommunity.deptName || appliedCommunity.name,
            deptId: appliedCommunity.deptId || appliedCommunity.id,
            applyId: appliedCommunity.applyId || appliedCommunity.id
          })
        } else {
          // 如果未加入社区，清除本地存储
          uni.removeStorageSync('joined_community')
        }
      } catch (error) {
        console.error('获取用户状态失败:', error)
      }
    },
    
    // 获取可加入的社区列表
    async getCommunityList() {
      try {
        const response = await listDeptCommunity({
          pageNum: 1,
          pageSize: 20
        })
        if (response.code === 200) {
          this.communityList = response.rows || []
          // 处理社区申请状态
          this.communityList.forEach(community => {
            // 如果有throughStatus字段，根据其值设置applyStatus
            if (community.throughStatus !== undefined) {
              // throughStatus: 0-待审核，1-通过，2-未通过，3-已撤销，4-已退出
              // 转换为数字进行比较，兼容字符串和数字类型
              const status = parseInt(community.throughStatus)
              switch (status) {
                case 0:
                  community.applyStatus = 1 // 审核中
                  break
                case 1:
                  community.applyStatus = 2 // 已加入
                  break
                case 2:
                case 3:
                case 4:
                  community.applyStatus = 0 // 可申请（未通过、已撤销、已退出都可以重新申请）
                  break
                default:
                  community.applyStatus = 0 // 默认可申请
              }
            } else {
              community.applyStatus = 0 // 默认可申请
            }
          })
          
          // 获取社区列表后，更新用户状态
          this.getUserStatus()
        }
      } catch (error) {
        console.error('获取社区列表失败:', error)
        this.communityList = []
      }
    },
    
    // 查看社区详情
    handleCommunityDetail(community) {
      uni.showModal({
        title: community.deptName || community.name,
        content: `地址: ${community.address || '地址待完善'}\n\n${community.description || '专业的智慧养老社区，提供全方位的养老服务'}`,
        showCancel: false
      })
    },
    
    // 处理申请按钮点击（从事件对象获取数据）
    handleApplyClick(e) {
      const index = e.currentTarget.dataset.index
      
      if (index !== undefined && this.communityList[index]) {
        const community = this.communityList[index]
        this.handleApply(community)
      } else {
        console.error('无法获取社区数据, index:', index)
        uni.showToast({
          title: '获取社区信息失败，请刷新页面重试',
          icon: 'none'
        })
      }
    },
    
    // 申请加入社区
    async handleApply(community) {
      // 参数校验
      if (!community || !community.deptId) {
        console.error('社区参数无效:', community)
        uni.showToast({
          title: '社区信息无效，请重试',
          icon: 'none'
        })
        return
      }
      
      if (this.userStatus.hasCommunity) {
        uni.showToast({
          title: '您已加入其他社区，一个账号只能加入一个社区',
          icon: 'none'
        })
        return
      }
      
      if (this.userStatus.hasApplied) {
        uni.showToast({
          title: '您有申请正在审核中，请等待审核结果',
          icon: 'none'
        })
        return
      }
      
      this.selectedCommunity = community
      this.resetApplyForm()
      // 设置社区ID
      this.applyForm.communityDeptId = community.deptId
      
      try {
        uni.showLoading({
          title: '加载中...'
        })
        
        // 调用optionslist接口获取社区的选项数据
        const response = await optionslist(community.deptId)
        
        if (response.code === 200 && response.data) {
          const allData = Array.isArray(response.data) ? response.data : []
          
          // 存储所有数据，用于后续级联筛选
          this.allOptionsData = allData
          
          // 根据 deptType 区分：deptType=5为片区，deptType=6为楼栋
          // 筛选片区：parentId=社区ID 且 deptType=5
          this.areaList = allData.filter(item => 
            item.parentId == community.deptId && item.deptType == '5'
          )
          
          // 筛选楼栋：parentId=社区ID 且 deptType=6
          this.buildingList = allData.filter(item => 
            item.parentId == community.deptId && item.deptType == '6'
          )
          
          console.log('加载成功 - 片区数量:', this.areaList.length, '楼栋数量:', this.buildingList.length)
        } else {
          // 如果接口失败，使用原来的加载方式
          await this.loadAreaList(community.deptId)
        }
        
        uni.hideLoading()
        this.isModifyMode = false // 设置为新增模式
        this.$nextTick(() => {
          this.$refs.applyPopup.open()
        })
      } catch (error) {
        console.error('获取社区选项失败:', error)
        uni.hideLoading()
        // 如果接口失败，使用原来的加载方式
        this.loadAreaList(community.deptId)
        this.isModifyMode = false
        this.$nextTick(() => {
          this.$refs.applyPopup.open()
        })
      }
    },
    
    // 重置申请表单
    resetApplyForm() {
      this.applyForm = {
        applyId: '',
        communityDeptId: '',
        areaDeptId: '',
        buildingDeptId: '',
        unitDeptId: '',
        householdId: '',
        applicantName: '',
        applicantPhone: '',
        communityDescription: '',
        proofPhotoUrls: []
      }
      // 清空级联选择列表
      this.areaList = []
      this.buildingList = []
      this.unitList = []
      this.householdList = []
      this.isModifyMode = false // 重置为新增模式
    },
    
    // 选择图片
    chooseImage() {
      const remainingCount = 3 - this.applyForm.proofPhotoUrls.length
      if (remainingCount <= 0) {
        uni.showToast({
          title: '最多只能上传3张图片',
          icon: 'none'
        })
        return
      }
      
      uni.chooseImage({
        count: remainingCount,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
        success: (res) => {
          res.tempFilePaths.forEach(tempFilePath => {
            this.uploadImage(tempFilePath)
          })
        },
        fail: (error) => {
          console.error('选择图片失败:', error)
          uni.showToast({
            title: '选择图片失败',
            icon: 'none'
          })
        }
      })
    },
    
    // 上传图片
    uploadImage(filePath) {
      uni.showLoading({
        title: '上传中...'
      })
      
      // 使用通用上传接口上传图片
      uni.uploadFile({
        url: config.baseUrl + '/common/upload',
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': 'Bearer ' + getToken()
        },
        success: (uploadRes) => {
          try {
            const result = JSON.parse(uploadRes.data)
            
            if (result.code === 200) {
              // 优先从 result.fileName 或 result.url 获取
              let imageUrl = result.fileName || result.url || (result.data && result.data.url)
              
              // 如果是相对路径，拼接完整的服务器地址
              if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                imageUrl = config.baseUrl + imageUrl
              }
              
              if (imageUrl) {
                this.applyForm.proofPhotoUrls.push(imageUrl)
                uni.showToast({
                  title: '上传成功',
                  icon: 'success'
                })
              } else {
                uni.showToast({
                  title: '图片URL获取失败',
                  icon: 'none'
                })
              }
            } else {
              uni.showToast({
                title: result.msg || '上传失败',
                icon: 'none'
              })
            }
          } catch (error) {
            console.error('解析上传结果失败:', error)
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        },
        fail: (error) => {
          console.error('上传图片失败:', error)
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },
    
    // 预览图片
    previewImages(currentIndex) {
      uni.previewImage({
        urls: this.applyForm.proofPhotoUrls,
        current: currentIndex
      })
    },
    
    // 删除图片
    deleteImage(index) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这张证明材料图片吗？',
        success: (res) => {
          if (res.confirm) {
            this.applyForm.proofPhotoUrls.splice(index, 1)
          }
        }
      })
    },
    
    // 社区选择变化
    onCommunityChange(e) {
      const index = e.detail.value
      const community = this.communityList[index]
      if (community) {
        this.applyForm.communityDeptId = community.deptId
        // 清空下级选择
        this.applyForm.areaDeptId = ''
        this.applyForm.buildingDeptId = ''
        this.applyForm.unitDeptId = ''
        this.applyForm.householdId = ''
        this.areaList = []
        this.buildingList = []
        this.unitList = []
        this.householdList = []
        // 加载片区列表（非必选）
        this.loadAreaList(community.deptId)
        // 加载楼栋列表（从社区直接加载）
        this.loadBuildingList(community.deptId)
      }
    },
    
    // 片区选择变化
    onAreaChange(e) {
      const index = e.detail.value
      const area = this.areaList[index]
      
      // 清空下级选择
      this.applyForm.buildingDeptId = ''
      this.applyForm.unitDeptId = ''
      this.applyForm.householdId = ''
      this.unitList = []
      this.householdList = []
      
      if (area) {
        this.applyForm.areaDeptId = area.deptId
        // 如果选了片区，楼栋过滤 parentId = 片区ID
        this.buildingList = this.allOptionsData.filter(item => 
          item.parentId == area.deptId && item.deptType == '6'
        )
      } else {
        this.applyForm.areaDeptId = ''
        // 如果没选片区，楼栋过滤 parentId = 社区ID
        if (this.applyForm.communityDeptId) {
          this.buildingList = this.allOptionsData.filter(item => 
            item.parentId == this.applyForm.communityDeptId && item.deptType == '6'
          )
        } else {
          this.buildingList = []
        }
      }
    },
    
    // 楼栋选择变化
    onBuildingChange(e) {
      const index = e.detail.value
      const building = this.buildingList[index]
      if (building) {
        this.applyForm.buildingDeptId = building.deptId
        // 清空下级选择
        this.applyForm.unitDeptId = ''
        this.applyForm.householdId = ''
        this.householdList = []
        // 从所有数据中筛选单元列表，deptType='7'
        this.unitList = this.allOptionsData.filter(item => 
          item.parentId == building.deptId && item.deptType == '7'
        )
      }
    },
    
    // 单元选择变化
    async onUnitChange(e) {
      const index = e.detail.value
      const unit = this.unitList[index]
      if (unit) {
        this.applyForm.unitDeptId = unit.deptId
        // 清空下级选择
        this.applyForm.householdId = ''
        
        try {
          // 调用接口获取住户列表
          const response = await listHousehold(unit.deptId)
          if (response.code === 200 && response.data) {
            // 为每个住户添加displayName用于显示
            this.householdList = response.data.map(item => ({
              ...item,
              displayName: `${item.floorNo}层-${item.roomNo}`
            }))
          } else {
            this.householdList = []
          }
        } catch (error) {
          console.error('获取住户列表失败:', error)
          this.householdList = []
        }
      }
    },
    
    // 住户选择变化
    onHouseholdChange(e) {
      const index = e.detail.value
      const household = this.householdList[index]
      if (household) {
        this.applyForm.householdId = household.householdId
      }
    },
    
    // 获取社区名称
    getCommunityName() {
      if (!this.applyForm.communityDeptId) return ''
      const community = this.communityList.find(item => item.deptId == this.applyForm.communityDeptId)
      return community ? community.deptName : ''
    },
    
    // 获取片区名称
    getAreaName() {
      if (!this.applyForm.areaDeptId) return ''
      const area = this.areaList.find(item => item.deptId == this.applyForm.areaDeptId)
      return area ? area.deptName : ''
    },
    
    // 获取楼栋名称
    getBuildingName() {
      if (!this.applyForm.buildingDeptId) return ''
      const building = this.buildingList.find(item => item.deptId == this.applyForm.buildingDeptId)
      return building ? building.deptName : ''
    },
    
    // 获取单元名称
    getUnitName() {
      if (!this.applyForm.unitDeptId) return ''
      const unit = this.unitList.find(item => item.deptId == this.applyForm.unitDeptId)
      return unit ? unit.deptName : ''
    },
    
    // 获取住户门牌号
    getHouseholdName() {
      if (!this.applyForm.householdId) return ''
      const household = this.householdList.find(item => item.householdId == this.applyForm.householdId)
      return household ? household.displayName : ''
    },
    
    // 加载片区列表
    async loadAreaList(communityDeptId) {
      try {
        const response = await listDeptCommunity({
          parentId: communityDeptId
        })
        if (response.code === 200) {
          this.areaList = response.rows || []
        }
      } catch (error) {
        console.error('加载片区列表失败:', error)
        this.areaList = []
      }
    },
    
    // 加载楼栋列表
    async loadBuildingList(areaDeptId) {
      try {
        const response = await listDeptCommunity({
          parentId: areaDeptId
        })
        if (response.code === 200) {
          this.buildingList = response.rows || []
        }
      } catch (error) {
        console.error('加载楼栋列表失败:', error)
        this.buildingList = []
      }
    },
    
    // 加载单元列表
    async loadUnitList(buildingDeptId) {
      try {
        const response = await listDeptCommunity({
          parentId: buildingDeptId
        })
        if (response.code === 200) {
          this.unitList = response.rows || []
        }
      } catch (error) {
        console.error('加载单元列表失败:', error)
        this.unitList = []
      }
    },
    
    // 加载住户列表
    async loadHouseholdList(unitDeptId) {
      try {
        // 假设有获取住户列表的接口，这里暂时使用部门接口
        const response = await listDeptCommunity({
          parentId: unitDeptId
        })
        if (response.code === 200) {
          this.householdList = response.rows || []
        }
      } catch (error) {
        console.error('加载住户列表失败:', error)
        this.householdList = []
      }
    },
    
    // 关闭申请表单
    closeApplyForm() {
      this.$refs.applyPopup.close()
    },
    
    // 提交申请
    async submitApply() {
      // 表单验证
      if (!this.applyForm.communityDeptId) {
        uni.showToast({
          title: '请选择所属社区',
          icon: 'none'
        })
        return
      }
      
      // 片区为非必填项，跳过验证
      
      if (!this.applyForm.buildingDeptId) {
        uni.showToast({
          title: '请选择所属楼栋',
          icon: 'none'
        })
        return
      }
      
      if (!this.applyForm.unitDeptId) {
        uni.showToast({
          title: '请选择所属单元',
          icon: 'none'
        })
        return
      }
      
      if (!this.applyForm.householdId) {
        uni.showToast({
          title: '请选择门牌号',
          icon: 'none'
        })
        return
      }
      
      if (!this.applyForm.applicantName.trim()) {
        uni.showToast({
          title: '请输入姓名',
          icon: 'none'
        })
        return
      }
      
      if (!this.applyForm.applicantPhone.trim()) {
        uni.showToast({
          title: '请输入联系电话',
          icon: 'none'
        })
        return
      }
      
      if (!/^1[3-9]\d{9}$/.test(this.applyForm.applicantPhone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      
      // 证明材料图片改为非必填项
      // if (this.applyForm.proofPhotoUrls.length === 0) {
      //   uni.showToast({
      //     title: '请上传证明材料图片',
      //     icon: 'none'
      //   })
      //   return
      // }
      
      this.submitting = true
      
      try {
        const requestData = {
          communityDeptId: this.applyForm.communityDeptId,
          areaDeptId: this.applyForm.areaDeptId,
          buildingDeptId: this.applyForm.buildingDeptId,
          unitDeptId: this.applyForm.unitDeptId,
          householdId: this.applyForm.householdId,
          applicantName: this.applyForm.applicantName.trim(),
          applicantPhone: this.applyForm.applicantPhone.trim(),
          communityDescription: this.applyForm.communityDescription.trim(),
          proofPhotoUrl: this.applyForm.proofPhotoUrls.join(','),
          throughStatus: '0' // 申请状态，默认为待审核
        }
        
        let response
        let successMessage
        
        // 判断是新增还是修改
        if (this.applyForm.applyId) {
          // 修改申请
          requestData.applyId = this.applyForm.applyId
          response = await updateApplyjoin(requestData)
          successMessage = '申请修改成功'
        } else {
          // 新增申请
          response = await addApplyjoin(requestData)
          successMessage = '申请提交成功'
        }
        
        if (response.code === 200) {
          uni.showToast({
            title: successMessage,
            icon: 'success'
          })
          
          this.closeApplyForm()
          
          // 更新状态
          this.selectedCommunity.applyStatus = 1
          this.userStatus.hasApplied = true
          
          // 重新获取用户状态和社区列表
          this.getUserStatus()
          this.getCommunityList()
          
        } else {
          uni.showToast({
            title: response.msg || '操作失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交申请失败:', error)
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    },
    
    // 处理审核中状态点击
    handlePendingStatus() {
      this.$refs.pendingPopup.open()
    },
    
    // 关闭审核中弹窗
    closePendingPopup() {
      this.$refs.pendingPopup.close()
    },
    
    // 处理已加入状态点击
    handleJoinedStatus() {
      this.$refs.joinedPopup.open()
    },
    
    // 关闭已加入弹窗
    closeJoinedPopup() {
      this.$refs.joinedPopup.close()
    },
    
    // 修改申请
    async handleModifyApply() {
      // 先尝试从社区列表中找到申请ID
      const appliedCommunity = this.communityList.find(community => 
        community.applyStatus === 1 || community.applyStatus === 2
      )
      
      const applyId = this.userStatus.applyId || appliedCommunity?.applyId || appliedCommunity?.id
      
      if (!applyId) {
        uni.showToast({
          title: '未找到申请记录，请重新申请',
          icon: 'none'
        })
        return
      }
      
      this.closePendingPopup()
      
      try {
        uni.showLoading({
          title: '加载申请信息...'
        })
        
        // 获取申请详情
        const response = await getApplyjoin(applyId)
        if (response.code === 200) {
          const applyData = response.data
          
          // 设置社区信息
          this.selectedCommunity = { 
            deptId: applyData.deptId || this.userStatus.deptId,
            deptName: applyData.deptName || this.userStatus.communityName 
          }
          
          // 填充表单数据
          this.applyForm = {
            applyId: applyData.applyId || applyId,
            communityDeptId: applyData.communityDeptId || '',
            areaDeptId: applyData.areaDeptId || '',
            buildingDeptId: applyData.buildingDeptId || '',
            unitDeptId: applyData.unitDeptId || '',
            householdId: applyData.householdId || '',
            applicantName: applyData.applicantName || '',
            applicantPhone: applyData.applicantPhone || '',
            communityDescription: applyData.communityDescription || '',
            proofPhotoUrls: applyData.proofPhotoUrl ? applyData.proofPhotoUrl.split(',').filter(url => url.trim()).map(url => {
              // 如果是相对路径，拼接完整的服务器地址
              if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                return config.baseUrl + url
              }
              return url
            }) : []
          }
          
          // 加载级联数据
          if (applyData.communityDeptId) {
            // 调用optionslist接口获取所有数据
            const optionsRes = await optionslist(applyData.communityDeptId)
            if (optionsRes.code === 200 && optionsRes.data) {
              const allData = Array.isArray(optionsRes.data) ? optionsRes.data : []
              this.allOptionsData = allData
              
              // 加载片区列表：deptType=5
              this.areaList = allData.filter(item => 
                item.parentId == applyData.communityDeptId && item.deptType == '5'
              )
              
              // 加载楼栋列表：根据是否选了片区来决定
              if (applyData.areaDeptId) {
                // 如果选了片区，楼栋的 parentId = 片区ID
                this.buildingList = allData.filter(item => 
                  item.parentId == applyData.areaDeptId && item.deptType == '6'
                )
              } else {
                // 如果没选片区，楼栋的 parentId = 社区ID
                this.buildingList = allData.filter(item => 
                  item.parentId == applyData.communityDeptId && item.deptType == '6'
                )
              }
              
              // 如果有选中的楼栋，加载单元列表：deptType='7'
              if (applyData.buildingDeptId) {
                this.unitList = allData.filter(item => 
                  item.parentId == applyData.buildingDeptId && item.deptType == '7'
                )
              }
              
              // 如果有选中的单元，调用接口加载住户列表
              if (applyData.unitDeptId) {
                const householdRes = await listHousehold(applyData.unitDeptId)
                if (householdRes.code === 200 && householdRes.data) {
                  this.householdList = householdRes.data.map(item => ({
                    ...item,
                    displayName: `${item.floorNo}层-${item.roomNo}`
                  }))
                }
              }
            }
          }
          
          // 设置为修改模式并打开申请表单
          this.isModifyMode = true
          this.$nextTick(() => {
            this.$refs.applyPopup.open()
          })
        } else {
          uni.showToast({
            title: response.msg || '获取申请信息失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取申请信息失败:', error)
        uni.showToast({
          title: '获取申请信息失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 撤销申请
    async handleCancelApply() {
      // 先尝试从社区列表中找到申请ID
      const appliedCommunity = this.communityList.find(community => 
        community.applyStatus === 1 || community.applyStatus === 2
      )
      
      const applyId = this.userStatus.applyId || appliedCommunity?.applyId || appliedCommunity?.id
      
      if (!applyId) {
        uni.showToast({
          title: '未找到申请记录',
          icon: 'none'
        })
        return
      }
      
      uni.showModal({
        title: '确认撤销',
        content: '确定要撤销申请吗？撤销后需要重新申请。',
        success: async (res) => {
          if (res.confirm) {
            try {
              uni.showLoading({
                title: '撤销申请中...'
              })
              
              const response = await cancelApplyjoin(applyId)
              if (response.code === 200) {
                uni.showToast({
                  title: '申请已撤销',
                  icon: 'success'
                })
                this.closePendingPopup()
                
                // 先刷新社区列表，再刷新用户状态
                await this.getCommunityList()
                this.getUserStatus()
              } else {
                uni.showToast({
                  title: response.msg || '撤销失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('撤销申请失败:', error)
              uni.showToast({
                title: '撤销申请失败',
                icon: 'none'
              })
            } finally {
              uni.hideLoading()
            }
          }
        }
      })
    },
    
    // 退出社区
    async handleLeaveCommunity() {
      try {
        uni.showLoading({
          title: '退出社区中...'
        })
        
        const response = await leaveJoinCommunity({
          applyId: this.userStatus.applyId
        })
        
        if (response.code === 200) {
          uni.showToast({
            title: '已退出社区',
            icon: 'success'
          })
          this.closeJoinedPopup()
          // 先刷新社区列表，再刷新用户状态
          await this.getCommunityList()
          this.getUserStatus()
        } else {
          uni.showToast({
            title: response.msg || '退出失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('退出社区失败:', error)
        uni.showToast({
          title: '退出社区失败',
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
.join-community-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20rpx;
}

/* 状态区域 */
.status-section {
  margin-bottom: 30rpx;
}

.status-card {
  background: linear-gradient(135deg, #fff 0%, #f8fffe 100%);
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(76, 175, 80, 0.1);
  position: relative;
  overflow: hidden;
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background: linear-gradient(90deg, #4CAF50, #81C784);
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.status-icon-wrapper {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.status-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2e7d32;
}

.status-content {
  padding: 24rpx;
  background: linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%);
  border-radius: 16rpx;
  position: relative;
  border: 1rpx solid rgba(76, 175, 80, 0.1);
}

.current-community, .pending-status, .no-community {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-info {
  flex: 1;
}

.community-name, .pending-text, .no-community-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 8rpx;
  display: block;
}

.community-desc, .pending-desc, .no-community-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 20rpx;
  border-radius: 50rpx;
  font-size: 24rpx;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.3s ease;
}

.status-badge:active {
  transform: scale(0.95);
  opacity: 0.8;
}

.status-badge.success {
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: #fff;
}

.status-badge.pending {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  color: #fff;
}

.status-badge.disabled {
  background: #bcbcbc;
  // color: #ff6b6b;
  border: 1rpx solid #bab8b8;
  font-weight: 500;
}

.apply-actions {
  margin-top: 12rpx;
}

.view-apply-btn {
  display: inline-block;
  padding: 8rpx 16rpx;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  color: #fff;
  font-size: 24rpx;
  border-radius: 16rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-apply-btn:active {
  transform: scale(0.95);
  opacity: 0.8;
}



/* 社区列表区域 */
.community-section {
  margin-bottom: 30rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx;
}

.header-left {
  flex: 1;
}

.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2e7d32;
  display: block;
  margin-bottom: 8rpx;
}

.section-desc {
  font-size: 26rpx;
  color: #666;
}


.community-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.community-item {
  transition: all 0.3s ease;
}

.community-item:active {
  transform: translateY(-4rpx);
}

.community-card {
  background: linear-gradient(135deg, #fff 0%, #fafffe 100%);
  border-radius: 20rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid rgba(76, 175, 80, 0.1);
  position: relative;
  overflow: hidden;
}

.community-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4rpx;
  height: 100%;
  background: linear-gradient(180deg, #4CAF50, #81C784);
}

.community-avatar {
  width: 120rpx;
  height: 120rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  position: relative;
}

.avatar-img, .default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}

.default-avatar {
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(76, 175, 80, 0.2);
}


.community-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.community-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.community-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #2e7d32;
  margin-right: 12rpx;
}

.community-tag {
  padding: 4rpx 12rpx;
  background: linear-gradient(135deg, #e8f5e8, #f1f8e9);
  color: #4CAF50;
  font-size: 20rpx;
  border-radius: 12rpx;
  font-weight: 500;
}

.community-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.community-address, .member-count {
  font-size: 24rpx;
  color: #666;
  line-height: 1.2;
}

.community-action {
  flex-shrink: 0;
  margin-left: 20rpx;
}

.apply-btn.modern {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, #4CAF50, #66BB6A);
  border-radius: 28rpx;
  box-shadow: 0 6rpx 20rpx rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
}

.apply-btn.modern:active {
  transform: scale(0.95);
  box-shadow: 0 4rpx 12rpx rgba(76, 175, 80, 0.4);
}

.apply-text {
  color: #fff;
  font-size: 26rpx;
  font-weight: 500;
}

.status-badge.modern {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 20rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #fff;
  font-weight: 500;
}

/* 申请表单 */
.apply-form {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
  flex-shrink: 0;
}

.header-placeholder {
  width: 40rpx;
  height: 40rpx;
}

.form-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 40rpx 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 12rpx;
  font-weight: 500;
}

.required {
  color: #ff4d4f;
  font-size: 28rpx;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  background: #fff;
  box-sizing: border-box;
  min-height: 80rpx;
  line-height: 1.4;
}

.form-input:focus, .form-textarea:focus {
  border-color: #4CAF50;
  outline: none;
}

.form-input {
  height: 80rpx;
}

.form-textarea {
  height: 120rpx;
  resize: none;
}

/* Picker选择器样式 */
.form-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  background: #fff;
  box-sizing: border-box;
  min-height: 80rpx;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.picker-placeholder {
  font-size: 28rpx;
  color: #999;
  flex: 1;
}

.form-picker.disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  cursor: not-allowed;
}

.form-picker.disabled .picker-text {
  color: #999;
}

/* 图片上传样式 */
.upload-section {
  margin-top: 12rpx;
}

.upload-btn {
  width: 100%;
  height: 200rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  transition: all 0.3s ease;
}

.upload-btn:active {
  border-color: #4CAF50;
  background: #f6ffed;
}

.upload-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 12rpx;
}

.upload-tip {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

/* 多张图片上传样式 */
.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  min-height: 160rpx;
}

.uploaded-image {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  overflow: hidden;
  background: #f5f5f5;
  border: 2rpx solid #e0e0e0;
}

.proof-image {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  display: block;
  object-fit: cover;
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
}

.add-more-btn {
  width: 160rpx;
  height: 160rpx;
  border: 2rpx dashed #d9d9d9;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  transition: all 0.3s ease;
}

.add-more-btn:active {
  border-color: #4CAF50;
  background: #f6ffed;
}


.form-footer {
  display: flex;
  gap: 20rpx;
  padding: 20rpx 30rpx 40rpx;
  flex-shrink: 0;
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn, .submit-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.submit-btn {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: #fff;
}

.submit-btn[disabled] {
  opacity: 0.6;
}

/* 弹窗样式 */
.popup-container {
  background: #fff;
  border-radius: 24rpx;
  width: 600rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 40rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  position: absolute;
  right: 40rpx;
  top: 50%;
  transform: translateY(-50%);
  padding: 10rpx;
  cursor: pointer;
}

.popup-content {
  padding: 40rpx;
  text-align: center;
}

.popup-desc {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

.popup-footer {
  display: flex;
  gap: 20rpx;
  padding: 0 40rpx 40rpx;
}

.popup-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 24rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.popup-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.popup-btn.danger {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: #fff;
}

.popup-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

/* 温馨提示样式 */
.tip-section {
  margin: 30rpx 0;
  padding: 0 20rpx;
}

.tip-card {
  background: #fff9e6;
  border: 1rpx solid #ffe7ba;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.tip-icon {
  flex-shrink: 0;
  margin-top: 2rpx;
}

.tip-content {
  flex: 1;
}

.tip-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff9800;
  display: block;
  margin-bottom: 8rpx;
}

.tip-desc {
  font-size: 26rpx;
  color: #e65100;
  line-height: 1.5;
}
</style>
