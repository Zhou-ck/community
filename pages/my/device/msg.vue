<template>
  <view class="msg-page">
    <!-- 顶部装饰背景 -->
    <view class="top-decoration"></view>
    
    <!-- 顶部 Tabs -->
    <view class="tabs-header">
      <view class="tab-item" :class="{ active: currentTab === 0 }" @click="switchTab(0)">
        <text>消息列表</text>
        <view class="active-line" v-if="currentTab === 0"></view>
      </view>
      <view class="tab-item" :class="{ active: currentTab === 1 }" @click="switchTab(1)">
        <text>需求列表</text>
        <view class="active-line" v-if="currentTab === 1"></view>
      </view>
    </view>

    <!-- 列表区域 -->
    <scroll-view 
      class="content-area"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 消息列表 -->
      <view v-if="currentTab === 0">
        <view class="list-item" v-for="item in msgList" :key="item._key" @click="showDetail(item)">
          <view class="item-header">
            <view class="header-left">
              <text class="item-time">{{ item.createTime }}</text>
            </view>
            <view class="header-right" v-if="item.sendMessageUserName">
              <text class="item-user">发送人: {{ item.sendMessageUserName }}</text>
            </view>
            <view class="delete-icon" @click.stop="handleDelete(item, $event)">
              <uni-icons type="trash" size="18" color="#999"></uni-icons>
            </view>
          </view>
          <view class="item-content">
            <!-- 只有当有文字内容，或者既没有文字也不是音频/文件时（纯文本空消息），才显示文本行 -->
            <view class="msg-text-row" v-if="(item.messageContent || item.content) || (!isAudio(item) && !item.filename)">
              <text class="msg-label">文本内容：</text>
              <text class="content-text" :class="{ 'empty-text': !item.messageContent && !item.content }">{{ item.messageContent || item.content || '无文字内容' }}</text>
            </view>
            
            <!-- 音频播放器 -->
            <view class="audio-player" v-if="isAudio(item)" @click.stop="playAudio(item)">
              <view class="play-icon-box" :class="{ playing: isPlaying(item) }">
                <uni-icons :type="isPlaying(item) ? 'sound-filled' : 'sound'" size="22" :color="isPlaying(item) ? '#fff' : '#E07A4F'"></uni-icons>
              </view>
              <view class="audio-info">
                <text class="audio-name">{{ item.title || '语音消息' }}</text>
                <text class="audio-status">{{ isPlaying(item) ? '播放中...' : '点击播放' }}</text>
              </view>
              <view class="audio-wave" v-if="isPlaying(item)">
                <view class="bar bar1"></view>
                <view class="bar bar2"></view>
                <view class="bar bar3"></view>
              </view>
            </view>

            <!-- 普通文件 -->
            <view class="file-info" v-else-if="item.filename">
              <uni-icons type="paperclip" size="16" color="#E07A4F"></uni-icons>
              <text class="file-name">{{ item.filename }}</text>
            </view>
            
            <view class="address-info" v-if="item.deviceAddress">
               <uni-icons type="location" size="14" color="#999"></uni-icons>
               <text class="address-text">{{ item.deviceAddress }}</text>
            </view>
          </view>
          <!-- 底部操作栏 -->
          <view class="item-footer">
            <view class="resend-btn" @click.stop="handleResend(item)">
              <uni-icons type="redo" size="16" color="#E07A4F"></uni-icons>
              <text>再次发送</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 需求列表 -->
      <view v-if="currentTab === 1">
        <view class="list-item demand-item" v-for="item in demandList" :key="item._key" @click="showDetail(item)">
          <view class="item-header">
             <view class="header-left">
              <text class="item-time">{{ item.createTime }}</text>
            </view>
            <view class="header-right" v-if="item.sendDemandUserName">
              <text class="item-user">发送人: {{ item.sendDemandUserName }}</text>
            </view>
            <view class="delete-icon" @click.stop="handleDelete(item, $event)">
              <uni-icons type="trash" size="18" color="#999"></uni-icons>
            </view>
          </view>
          <view class="item-content">
            <view class="demand-row">
              <view class="demand-tag">需求</view>
              <text class="content-text demand-text" :class="{ 'empty-text': !item.demandContent && !item.content }">{{ item.demandContent || item.content || '无文字内容' }}</text>
            </view>
            
            <!-- 音频播放器 -->
            <view class="audio-player" v-if="isAudio(item)" @click.stop="playAudio(item)">
              <view class="play-icon-box" :class="{ playing: isPlaying(item) }">
                <uni-icons :type="isPlaying(item) ? 'sound-filled' : 'sound'" size="22" :color="isPlaying(item) ? '#fff' : '#E07A4F'"></uni-icons>
              </view>
              <view class="audio-info">
                <text class="audio-name">{{ item.title || '语音消息' }}</text>
                <text class="audio-status">{{ isPlaying(item) ? '播放中...' : '点击播放' }}</text>
              </view>
              <view class="audio-wave" v-if="isPlaying(item)">
                <view class="bar bar1"></view>
                <view class="bar bar2"></view>
                <view class="bar bar3"></view>
              </view>
            </view>

             <!-- 普通文件 -->
            <view class="file-info" v-else-if="item.filename">
              <uni-icons type="paperclip" size="16" color="#E07A4F"></uni-icons>
              <text class="file-name">{{ item.filename }}</text>
            </view>

            <view class="address-info" v-if="item.deviceAddress">
               <uni-icons type="location" size="14" color="#999"></uni-icons>
               <text class="address-text">{{ item.deviceAddress }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 公用空状态 -->
      <view v-if="showEmptyState" class="empty-state">
        <view class="empty-icon-wrapper">
          <uni-icons type="chatboxes" size="80" color="#d4d4d4"></uni-icons>
        </view>
        <text class="empty-title">{{ emptyTitle }}</text>
        <text class="empty-subtitle">还没有更多数据哦~</text>
      </view>
      
      <!-- 加载更多 loading -->
      <view class="loading-more" v-if="loading">
        <uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!loading && isEnd && ((currentTab === 0 && msgList.length > 0) || (currentTab === 1 && demandList.length > 0))">
        <text>没有更多数据了</text>
      </view>
    </scroll-view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-btn" v-if="currentTab === 0" @click="openAddPopup">
      <uni-icons type="plusempty" size="26" color="#fff"></uni-icons>
    </view>
    
    <!-- 添加弹窗 -->
    <uni-popup ref="addPopup" type="center" :mask-click="false">
      <view class="popup-box add-msg-popup">
        <view class="popup-header">
          <text class="popup-title">发布消息</text>
          <uni-icons class="close-icon" type="closeempty" size="20" color="#666" @click="closeAddPopup"></uni-icons>
        </view>
        <view class="popup-body">
          <!-- 内容类型选择 -->
          <view class="form-item">
            <text class="form-label">内容类型</text>
            <radio-group @change="onContentTypeChange" class="radio-group-inline">
              <label class="radio-item">
                <radio value="1" :checked="formData.contentType === '1'" color="#E07A4F" />
                <text>文本</text>
              </label>
              <label class="radio-item">
                <radio value="2" :checked="formData.contentType === '2'" color="#E07A4F" />
                <text>音频</text>
              </label>
            </radio-group>
          </view>
          
          <!-- 文本输入 -->
          <view class="form-item" v-if="formData.contentType === '1'">
            <text class="form-label">需求内容</text>
            <textarea 
              class="popup-textarea" 
              v-model="formData.content" 
              placeholder="请输入内容（如：按时喝水）" 
              maxlength="200"
            ></textarea>
            <view class="char-count">{{ formData.content.length }} / 200</view>
          </view>
          
          <!-- 音频录制 -->
          <view class="form-item" v-if="formData.contentType === '2'">
            <text class="form-label">音频录制</text>
            
            <!-- 未录制或正在录制状态 -->
            <button v-if="!audioTempPath || recording" class="record-btn" :class="{ recording: recording }" @click="startRecord">
              <uni-icons :type="recording ? 'mic-filled' : 'mic'" size="20" color="#fff"></uni-icons>
              <text v-if="recording">停止录音 ({{ recordDuration }}s)</text>
              <text v-else>开始录音</text>
            </button>
            
            <!-- 录制完成状态：显示试听和重录 -->
            <view v-else class="record-actions">
               <!-- iOS 不支持试听，只显示重录按钮 -->
               <button v-if="!isIOS" class="action-btn play-btn" @click="playTempAudio">
                 <uni-icons :type="isPlayingTemp ? 'videocam-filled' : 'videocam'" size="20" color="#E07A4F"></uni-icons>
                 <text>{{ isPlayingTemp ? '停止播放' : '试听录音' }} ({{ recordDuration }}s)</text>
               </button>
               <button class="action-btn retry-btn" @click="reRecord">
                 <uni-icons type="refresh" size="20" color="#666"></uni-icons>
                 <text>重新录制</text>
               </button>
            </view>
          </view>
          
          <!-- 音频标题 -->
          <view class="form-item" v-if="formData.contentType === '2'">
            <text class="form-label">音频标题</text>
            <input 
              class="popup-input" 
              v-model="formData.title" 
              placeholder="请输入音频标题（可选）"
            />
          </view>
          
          <!-- 发布者姓名 -->
          <view class="form-item">
            <text class="form-label">发布者姓名</text>
            <input 
              class="popup-input" 
              v-model="formData.sendMessageUserName" 
              placeholder="请输入姓名"
            />
          </view>
        </view>
        <view class="popup-footer">
          <button class="btn cancel" @click="closeAddPopup">取消</button>
          <button class="btn confirm" @click="submitAdd" :loading="submitting">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="popup-box detail-popup-box">
        <view class="popup-header">
          <text class="popup-title">详细信息</text>
          <uni-icons class="close-icon" type="closeempty" size="20" color="#666" @click="closeDetailPopup"></uni-icons>
        </view>
        <view class="popup-body detail-body">
          <view class="detail-item" v-for="(value, key) in currentDetail" :key="key">
             <text class="detail-label">{{ getFieldLabel(key) }}</text>
             <text class="detail-value" :class="{ 'highlight-current': key === 'isCurrent' && value == 1 }">{{ formatValue(key, value) }}</text>
          </view>
        </view>
      </view>
    </uni-popup>

  </view>
</template>

<script>
import { listSleepmessage, addSleepmessage, delSleepmessage, setcurrentMsg } from '@/api/sleepmessage.js'
import { resetDeviceNetwork } from '@/api/device.js'
import { listSleepdemand, addSleepdemand, delSleepdemand } from '@/api/sleepdemand.js'
import { getDicts } from '@/api/system/dict/data'
import config from '@/config'

export default {
  data() {
    return {
      currentTab: 0, // 0: 消息, 1: 需求
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        deviceKey: '',
        productKey: '',
        deviceId: ''
      },
      msgList: [],
      demandList: [],
      loading: false,
      refreshing: false, // 下拉刷新状态
      isEnd: false, // 是否加载完所有数据
      total: 0,
      
      // 字典
      contentTypeOptions: [],
      demandTypeOptions: [],
      
      // 表单
      formData: {
        contentType: '1', // 1:文本, 2:音频
        content: '',
        title: '',
        sendMessageUserName: '',
        filename: '', // 音频文件名
        audioData: '' // 音频 base64 数据
      },
      submitting: false,
      
      // 录音相关
      recorderManager: null,
      recording: false,
      recordDuration: 0,
      audioTempPath: '',
      recordTimer: null,
      isPlayingTemp: false, // 试听播放状态
      isIOS: false, // 是否是 iOS 系统
      
      // 详情
      currentDetail: {},
      currentDetailItem: null,
      fieldMap: {
        messageId: '消息ID',
        demandId: '需求ID',
        content: '内容',
        messageContent: '消息内容',
        demandContent: '需求内容',
        createTime: '创建时间',
        sendMessageUserName: '发送人',
        deviceAddress: '设备地址',
        deviceKey: '设备编号',
        contentType: '内容类型',
        demandType: '需求类型',
        audioMime: '音频类型',
        filename: '文件名',
        messageType: '消息类型',
        productKey: '产品Key',
        deviceId: '设备ID',
        deptId: '部门ID',
        updateTime: '更新时间',
        createBy: '创建者',
        updateBy: '更新者',
        remark: '备注',
        userId: '用户ID',
        audioData: '音频数据',
        timeStamp: '时间戳',
        deviceAlias: '设备别名',

        sendMessageUserId: '发送人ID',
        sendDemandUserName: '发送人',
        title: '标题'
      },
      
      // 音频播放
      innerAudioContext: null,
      currentPlayingItem: null
    }
  },
  computed: {
    // 是否显示空状态
    showEmptyState() {
      if (this.loading) return false
      return this.currentTab === 0 ? this.msgList.length === 0 : this.demandList.length === 0
    },
    // 空状态标题
    emptyTitle() {
      return this.currentTab === 0 ? '暂无消息数据' : '暂无需求数据'
    }
  },
  onLoad(options) {
    if (options.deviceId) this.queryParams.deviceId = options.deviceId;
    if (options.deviceKey) this.queryParams.deviceKey = options.deviceKey;
    if (options.productKey) this.queryParams.productKey = options.productKey;
    
    // 判断是否是 iOS 系统
    const systemInfo = uni.getSystemInfoSync();
    this.isIOS = systemInfo.platform === 'ios';
    
    this.loadDictData();
    this.loadData();
    this.initAudio();
    this.initRecorder();
  },
  onUnload() {
    try {
      // 清理音频播放器
      if (this.innerAudioContext && typeof this.innerAudioContext.destroy === 'function') {
        this.innerAudioContext.stop();
        this.innerAudioContext.destroy();
      }
    } catch (e) {
      console.error('清理音频播放器失败', e);
    }
    
    try {
      // 清理录音资源
      if (this.recordTimer) {
        clearInterval(this.recordTimer);
        this.recordTimer = null;
      }
    } catch (e) {
      console.error('清理计时器失败', e);
    }
    
    try {
      // 只有在录音中才停止录音
      if (this.recorderManager && this.recording) {
        this.recorderManager.stop();
      }
    } catch (e) {
      console.error('清理录音管理器失败', e);
    }
  },
  onPullDownRefresh() {
    this.queryParams.pageNum = 1;
    this.isEnd = false;
    this.loadData(() => {
      uni.stopPullDownRefresh();
    });
  },
  onReachBottom() {
    if (!this.isEnd && !this.loading) {
      this.queryParams.pageNum++;
      this.loadData();
    }
  },
  methods: {
    // 下拉刷新
    onRefresh() {
      this.refreshing = true;
      this.queryParams.pageNum = 1;
      this.isEnd = false;
      this.loadData(() => {
        this.refreshing = false;
      });
    },
    
    // 上拉加载更多
    onLoadMore() {
      if (!this.isEnd && !this.loading) {
        this.queryParams.pageNum++;
        this.loadData();
      }
    },
    
    // 初始化录音管理器
    initRecorder() {
      this.recorderManager = uni.getRecorderManager();
      
      // 录音开始事件
      this.recorderManager.onStart(() => {
        console.log('录音开始');
        this.recording = true;
        this.recordDuration = 0;
        // 开始计时
        this.recordTimer = setInterval(() => {
          this.recordDuration++;
          if (this.recordDuration >= 60) {
            this.recorderManager.stop();
          }
        }, 1000);
      });
      
      // 录音结束事件
      this.recorderManager.onStop((res) => {
        console.log('录音结束', res);
        this.recording = false;
        if (this.recordTimer) {
          clearInterval(this.recordTimer);
          this.recordTimer = null;
        }
        this.audioTempPath = res.tempFilePath;
        // 将音频转为 base64
        this.convertAudioToBase64(res.tempFilePath);
      });
      
      // 录音错误事件
      this.recorderManager.onError((err) => {
        console.error('录音错误', err);
        this.recording = false;
        if (this.recordTimer) {
          clearInterval(this.recordTimer);
          this.recordTimer = null;
        }
        uni.showToast({ title: '录音失败，请重试', icon: 'none' });
      });
    },
    
    // 初始化音频
    initAudio() {
      this.innerAudioContext = uni.createInnerAudioContext();
      this.innerAudioContext.onEnded(() => {
        this.currentPlayingItem = null;
        this.isPlayingTemp = false; // 试听结束
      });
      this.innerAudioContext.onError((res) => {
        console.error('音频播放错误详情:', {
          errMsg: res ? res.errMsg : '未知错误',
          errCode: res ? res.errCode : '无错误码',
          src: this.innerAudioContext.src
        });
        this.currentPlayingItem = null;
        this.isPlayingTemp = false; // 试听出错
        
        let errorMsg = '播放失败';
        if (res && res.errMsg) {
          if (res.errMsg.indexOf('NotSupportedError') > -1) {
            errorMsg = '不支持的音频格式或文件不可访问';
          } else if (res.errMsg.indexOf('NetworkError') > -1) {
            errorMsg = '网络错误，请检查连接';
          }
        }
        // iOS 静音开关提示
        // #ifdef APP-IOS || MP-WEIXIN
        if (this.isIOS) {
          errorMsg += '，请检查静音开关是否关闭';
        }
        // #endif
        uni.showToast({ title: errorMsg, icon: 'none' });
      });
    },
    
    // 判断是否为音频
    isAudio(item) {
      if (String(item.contentType) === '2') return true;
      if (item.filename && /\.(mp3|wav|aac|m4a|audio)$/i.test(item.filename)) return true;
      return false;
    },
    
    // 播放音频
    async playAudio(item) {
      if (this.currentPlayingItem === item) {
        // 暂停/停止
        if (this.innerAudioContext) {
          this.innerAudioContext.stop();
        }
        this.currentPlayingItem = null;
        return;
      }
      
      // 构造 URL
      let url = '';
      
      // 需求列表的音频（有 demandId），直接用 filename 拼接 URL，不调用接口
      console.log('playAudio item:', item.demandId, item.messageId, item.filename);
      if (item.demandId && item.filename) {
        url = config.baseUrl + (item.baseUrl || '/api/demand/audio') + '/' + item.filename;
        console.log('需求音频URL:', url);
      }
      // 消息列表：使用 URL 方式播放
      else if (this.isAudio(item) && item.filename) {
        url = config.baseUrl + (item.baseUrl || '/api/sleepmessage/audio') + '/' + item.filename;
        console.log('消息音频URL:', url);
      }
      
      if (!url) {
        uni.showToast({ title: '无效的音频地址', icon: 'none' });
        return;
      }
      
      console.log('准备播放音频，URL长度:', url.length, 'URL前50个字符:', url.substring(0, 50));
      
      try {
        // 确保音频实例存在
        if (!this.innerAudioContext) {
          this.initAudio();
        }
        this.innerAudioContext.stop();
        this.innerAudioContext.src = url;
        this.innerAudioContext.play();
        this.currentPlayingItem = item;
      } catch (e) {
        console.error('播放音频异常:', e);
        uni.showToast({ title: '播放失败: ' + e.message, icon: 'none' });
      }
    },
    
    isPlaying(item) {
      return this.currentPlayingItem === item;
    },

    // 加载字典
    async loadDictData() {
      try {
        const [contentRes, demandRes] = await Promise.all([
          getDicts('sleep_content_type'),
          getDicts('dev_demand_type')
        ]);
        
        if (contentRes.code === 200) {
          this.contentTypeOptions = contentRes.data || [];
        }
        if (demandRes.code === 200) {
          this.demandTypeOptions = demandRes.data || [];
        }
      } catch (e) {
        console.error('加载字典失败', e);
      }
    },

    // 显示详情
    showDetail(item) {
      // 保存完整的 item 对象，用于后续操作
      this.currentDetailItem = item;
      
      // 需要显示的字段（白名单）
      const showFields = ['content', 'messageContent', 'demandContent', 'createTime', 'sendMessageUserName', 'sendDemandUserName', 'deviceAddress', 'deviceKey', 'contentType', 'demandType', 'filename', 'remark', 'title'];
      
      // 只显示白名单中的非空字段
      const detail = {};
      for (const key of showFields) {
        if (item[key] !== null && item[key] !== '' && item[key] !== undefined) {
          detail[key] = item[key];
        }
      }
      this.currentDetail = detail;
      this.$refs.detailPopup.open();
    },
    
    // 关闭详情
    closeDetailPopup() {
      this.$refs.detailPopup.close();
    },
    
    // 获取字段标签
    getFieldLabel(key) {
      return this.fieldMap[key] || key;
    },
    
    // 格式化值
    formatValue(key, value) {
      if (key === 'contentType') {
        const found = this.contentTypeOptions.find(opt => String(opt.dictValue) === String(value));
        return found ? found.dictLabel : value;
      }
      if (key === 'demandType') {
        const found = this.demandTypeOptions.find(opt => String(opt.dictValue) === String(value));
        return found ? found.dictLabel : value;
      }
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    },
    
    // 切换 Tab
    switchTab(index) {
      if (this.currentTab === index) return;
      this.currentTab = index;
      // 重置列表状态
      this.queryParams.pageNum = 1;
      this.msgList = [];
      this.demandList = [];
      this.isEnd = false;
      this.loadData();
    },

    // 加载数据
    async loadData(callback) {
      // 记录请求发起时的 Tab，防止切换 Tab 后数据错乱
      const requestTab = this.currentTab;
      
      this.loading = true;
      try {
        let res;
        if (requestTab === 0) {
          res = await listSleepmessage(this.queryParams);
        } else {
          res = await listSleepdemand(this.queryParams);
        }

        // 如果请求返回时 Tab 已经切换，丢弃这次请求的数据
        if (this.currentTab !== requestTab) {
          console.log('Tab 已切换，丢弃旧数据');
          return;
        }

        if (res.code === 200) {
          const list = res.rows || [];
          this.total = res.total || 0;
          
          // 为每条数据添加唯一的 _key 字段
          const processedList = list.map((item, index) => {
            if (requestTab === 0) {
              item._key = item.messageId ? 'msg_' + item.messageId : 'temp_msg_' + Date.now() + '_' + index;
            } else {
              item._key = item.demandId ? 'demand_' + item.demandId : 'temp_demand_' + Date.now() + '_' + index;
            }
            return item;
          });
          
          if (this.queryParams.pageNum === 1) {
            if (requestTab === 0) this.msgList = processedList;
            else this.demandList = processedList;
          } else {
            // 追加时过滤掉已存在的数据，避免重复 key
            if (requestTab === 0) {
              const existingKeys = new Set(this.msgList.map(item => item._key));
              const newItems = processedList.filter(item => !existingKeys.has(item._key));
              this.msgList = [...this.msgList, ...newItems];
            } else {
              const existingKeys = new Set(this.demandList.map(item => item._key));
              const newItems = processedList.filter(item => !existingKeys.has(item._key));
              this.demandList = [...this.demandList, ...newItems];
            }
          }

          // 判断是否加载完毕
          if (list.length < this.queryParams.pageSize) {
            this.isEnd = true;
          }
        }
      } catch (e) {
        console.error(e);
        uni.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        this.loading = false;
        if (callback) callback();
      }
    },

    // 打开添加弹窗
    openAddPopup() {
      this.formData = {
        contentType: '1',
        content: '',
        title: '',
        sendMessageUserName: '',
        filename: '',
        audioData: ''
      };
      // 重置录音状态
      this.recording = false;
      this.recordDuration = 0;
      this.audioTempPath = '';
      this.isPlayingTemp = false; // 重置试听状态
      if (this.recordTimer) {
        clearInterval(this.recordTimer);
        this.recordTimer = null;
      }
      this.$refs.addPopup.open();
    },
    
    // 关闭添加弹窗
    closeAddPopup() {
      // 如果正在录音，先停止
      if (this.recording && this.recorderManager) {
        this.recorderManager.stop();
      }
      // 如果正在试听，停止试听
      if (this.isPlayingTemp && this.innerAudioContext) {
        this.innerAudioContext.stop();
        this.isPlayingTemp = false;
      }
      this.$refs.addPopup.close();
    },
    
    // 内容类型切换
    onContentTypeChange(e) {
      this.formData.contentType = e.detail.value;
      // 切换类型时清空不相关的字段
      if (this.formData.contentType === '1') {
        this.formData.title = '';
        this.formData.filename = '';
        this.formData.audioData = '';
        this.audioTempPath = '';
        // 停止可能的试听
        if (this.isPlayingTemp) {
            this.innerAudioContext.stop();
            this.isPlayingTemp = false;
        }
      } else {
        this.formData.content = '';
      }
    },
    
    // 开始/停止录音
    startRecord() {
      if (this.recording) {
        // 正在录音，停止录音
        this.recorderManager.stop();
      } else {
        // 如果正在试听，先停止
        if (this.isPlayingTemp) {
          this.innerAudioContext.stop();
          this.isPlayingTemp = false;
        }
        
        // 开始录音
        this.recorderManager.start({
          format: 'mp3',
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 48000
        });
      }
    },
    
    // 试听/停止试听录音
    playTempAudio() {
      if (!this.audioTempPath) return;
      
      if (this.isPlayingTemp) {
        this.innerAudioContext.stop();
        this.isPlayingTemp = false;
        return;
      }
      
      // 停止列表中的播放
      if (this.currentPlayingItem) {
        this.currentPlayingItem = null;
        this.innerAudioContext.stop();
      }
      
      console.log('试听临时录音:', this.audioTempPath);
      
      // #ifdef H5
      if (this.audioTempPath.startsWith('wxfile://')) {
        uni.showToast({ 
          title: '浏览器环境无法试听，请在小程序中使用', 
          icon: 'none',
          duration: 3000 
        });
        console.warn('H5环境无法播放微信临时文件');
        return;
      }
      // #endif
      
      try {
        this.innerAudioContext.src = this.audioTempPath;
        this.innerAudioContext.play();
        this.isPlayingTemp = true;
      } catch (e) {
        console.error('试听录音异常:', e);
        uni.showToast({ title: '试听失败: ' + e.message, icon: 'none' });
      }
    },
    
    // 重新录制
    reRecord() {
       // 停止试听
       if (this.isPlayingTemp) {
         this.innerAudioContext.stop();
         this.isPlayingTemp = false;
       }
       
       // 清除当前录音
       this.audioTempPath = '';
       this.recordDuration = 0;
       this.formData.filename = '';
       this.formData.audioData = '';
       
       // 开始新录音
       this.startRecord();
    },
    
    // 将音频文件转为 base64
    convertAudioToBase64(filePath) {
      uni.showLoading({ title: '处理中...' });
      
      // #ifdef MP-WEIXIN
      // 微信小程序使用 FileSystemManager
      const fs = uni.getFileSystemManager();
      fs.readFile({
        filePath: filePath,
        encoding: 'base64',
        success: (res) => {
          this.formData.audioData = res.data;
          this.formData.filename = `audio_${Date.now()}.mp3`;
          uni.hideLoading();
          uni.showToast({ title: '录音处理成功', icon: 'success' });
        },
        fail: (err) => {
          console.error('读取音频文件失败', err);
          uni.hideLoading();
          uni.showToast({ title: '处理失败，请重试', icon: 'none' });
        }
      });
      // #endif
      
      // #ifdef H5
      // H5 环境使用 fetch + FileReader
      fetch(filePath)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // 去掉 data:audio/xxx;base64, 前缀
            const base64 = reader.result.split(',')[1];
            this.formData.audioData = base64;
            this.formData.filename = `audio_${Date.now()}.mp3`;
            uni.hideLoading();
            uni.showToast({ title: '录音处理成功', icon: 'success' });
          };
          reader.onerror = () => {
            uni.hideLoading();
            uni.showToast({ title: '处理失败，请重试', icon: 'none' });
          };
          reader.readAsDataURL(blob);
        })
        .catch(err => {
          console.error('读取音频文件失败', err);
          uni.hideLoading();
          uni.showToast({ title: '处理失败，请重试', icon: 'none' });
        });
      // #endif
      
      // #ifdef APP-PLUS
      // APP 环境
      plus.io.resolveLocalFileSystemURL(filePath, (entry) => {
        entry.file((file) => {
          const reader = new plus.io.FileReader();
          reader.onloadend = (e) => {
            // 去掉 data:audio/xxx;base64, 前缀
            const base64 = e.target.result.split(',')[1];
            this.formData.audioData = base64;
            this.formData.filename = `audio_${Date.now()}.mp3`;
            uni.hideLoading();
            uni.showToast({ title: '录音处理成功', icon: 'success' });
          };
          reader.onerror = () => {
            uni.hideLoading();
            uni.showToast({ title: '处理失败，请重试', icon: 'none' });
          };
          reader.readAsDataURL(file);
        });
      }, (err) => {
        console.error('读取音频文件失败', err);
        uni.hideLoading();
        uni.showToast({ title: '处理失败，请重试', icon: 'none' });
      });
      // #endif
    },
    
    // 提交添加
    async submitAdd() {
      // 验证
      if (this.formData.contentType === '1') {
        // 文本模式
        if (!this.formData.content.trim()) {
          uni.showToast({ title: '请输入内容', icon: 'none' });
          return;
        }
      } else {
        // 音频模式
        if (!this.audioTempPath || !this.formData.audioData) {
          uni.showToast({ title: '请先录制音频', icon: 'none' });
          return;
        }
      }
      
      this.submitting = true;
      try {
        // 构造完整的消息数据，包含 isCurrent: 1
        const data = {
          audioData: this.formData.contentType === '2' ? this.formData.audioData : null,
          audioMime: this.formData.contentType === '2' ? 'audio/mp3' : null,
          content: this.formData.contentType === '1' ? this.formData.content : null,
          contentType: this.formData.contentType,
          createBy: null,
          createTime: null,
          deptId: null,
          deviceAddress: null,
          deviceId: this.queryParams.deviceId,
          deviceKey: this.queryParams.deviceKey,
          filename: this.formData.contentType === '2' ? this.formData.filename : null,
          isCurrent: 1,
          messageId: null,
          messageType: null,
          productKey: this.queryParams.productKey,
          remark: null,
          sendMessageUserId: null,
          sendMessageUserName: this.formData.sendMessageUserName || null,
          timeStamp: null,
          title: this.formData.title || null,
          updateBy: null,
          updateTime: null,
          userId: null
        };

        console.log('addSleepmessage 传递参数:', data);
        const res = await addSleepmessage(data);

        if (res.code === 200) {
          // 消息保存成功后，调用服务接口发送指令
          try {
            // contentType: 1=文本传0, 2=音频传1
            const msgVoiceValue = this.formData.contentType === '2' ? 1 : 0;
            const invokeRes = await resetDeviceNetwork({
              ack: 1,
              address: null,
              deviceKey: this.queryParams.deviceKey,
              function: 'msgVoice',
              productKey: this.queryParams.productKey,
              propertyValue: { msgVoice: msgVoiceValue },
              type: null
            });
            
            if (invokeRes.code === 200) {
              uni.showToast({ title: '发布成功', icon: 'success' });
            } else {
              uni.showToast({ title: '消息已保存，发送指令失败', icon: 'none' });
            }
          } catch (invokeErr) {
            console.error('调用服务接口失败', invokeErr);
            uni.showToast({ title: '消息已保存，发送指令失败', icon: 'none' });
          }
          
          this.closeAddPopup();
          // 刷新列表
          this.queryParams.pageNum = 1;
          this.isEnd = false;
          this.loadData();
        } else {
          uni.showToast({ title: res.msg || '发布失败', icon: 'none' });
        }
      } catch (e) {
        console.error(e);
        // 请求超时或网络错误时，也刷新列表（因为数据可能已经保存成功）
        uni.showToast({ 
          title: '网络响应超时，正在刷新列表...', 
          icon: 'none',
          duration: 2000
        });
        this.closeAddPopup();
        // 延迟刷新列表，给用户看到提示
        setTimeout(() => {
          this.queryParams.pageNum = 1;
          this.isEnd = false;
          this.loadData();
        }, 500);
      } finally {
        this.submitting = false;
      }
    },

    // 再次发送
    async handleResend(item) {
      if (!item.messageId) {
        uni.showToast({ title: '无效的消息', icon: 'none' });
        return;
      }
      
      uni.showLoading({ title: '发送中...' });
      try {
        // 1. 先调用 setcurrent 接口，传递完整消息对象
        const msgData = {
          audioData: item.audioData || null,
          audioFile: item.audioFile || null,
          audioMime: item.audioMime || null,
          content: item.content || item.messageContent || null,
          contentType: item.contentType || null,
          createBy: item.createBy || null,
          createTime: item.createTime || null,
          deptId: item.deptId || null,
          deviceAddress: item.deviceAddress || null,
          deviceAlias: item.deviceAlias || null,
          deviceId: item.deviceId || this.queryParams.deviceId,
          deviceKey: item.deviceKey || this.queryParams.deviceKey,
          filename: item.filename || null,
          isCurrent: 1,
          messageId: item.messageId,
          messageType: item.messageType || null,
          productKey: item.productKey || this.queryParams.productKey,
          remark: item.remark || null,
          sendMessageUserId: item.sendMessageUserId || null,
          sendMessageUserName: item.sendMessageUserName || null,
          timeStamp: item.timeStamp || null,
          title: item.title || null,
          updateBy: item.updateBy || null,
          updateTime: item.updateTime || null,
          userId: item.userId || null
        };
        
        const setRes = await setcurrentMsg(msgData);
        if (setRes.code !== 200) {
          uni.hideLoading();
          uni.showToast({ title: setRes.msg || '设置当前消息失败', icon: 'none' });
          return;
        }
        
        // 2. 调用 invoke/service 接口发送指令
        // contentType: 1=文本传0, 2=音频传1
        const msgVoiceValue = String(item.contentType) === '2' ? 1 : 0;
        const invokeRes = await resetDeviceNetwork({
          ack: 1,
          address: null,
          deviceKey: item.deviceKey || this.queryParams.deviceKey,
          function: 'msgVoice',
          productKey: item.productKey || this.queryParams.productKey,
          propertyValue: { msgVoice: msgVoiceValue },
          type: null
        });
        
        uni.hideLoading();
        if (invokeRes.code === 200) {
          uni.showToast({ title: '发送成功', icon: 'success' });
          // 刷新列表
          this.queryParams.pageNum = 1;
          this.isEnd = false;
          this.loadData();
        } else {
          uni.showToast({ title: invokeRes.msg || '发送失败', icon: 'none' });
        }
      } catch (e) {
        console.error('再次发送失败', e);
        uni.hideLoading();
        uni.showToast({ title: '发送失败', icon: 'none' });
      }
    },

    // 删除条目
    handleDelete(item, event) {
      // 确保阻止事件冒泡
      if (event) {
        event.stopPropagation();
      }
      uni.showModal({
        title: '提示',
        content: '确定要删除这条记录吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              let apiRes;
              if (this.currentTab === 0) {
                apiRes = await delSleepmessage(item.messageId);
              } else {
                apiRes = await delSleepdemand(item.demandId);
              }

              if (apiRes.code === 200) {
                uni.showToast({ title: '删除成功', icon: 'success' });
                // 刷新列表
                this.queryParams.pageNum = 1;
                this.isEnd = false;
                this.loadData();
              } else {
                uni.showToast({ title: apiRes.msg || '删除失败', icon: 'none' });
              }
            } catch (e) {
              uni.showToast({ title: '操作失败', icon: 'none' });
            }
          }
        }
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.msg-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 120rpx;
  position: relative;
}

.top-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 400rpx;
  background: linear-gradient(180deg, #dcfce7 0%, #f5f6f7 100%);
  background: linear-gradient(180deg, #e0f7f5 0%, #f5f6f7 100%); /* 使用主题色系的淡色 */
  z-index: 0;
}

/* 顶部 Tabs */
.tabs-header {
  display: flex;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.03);
  
  .tab-item {
    flex: 1;
    height: 96rpx; /* 稍微增高 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #606266;
    position: relative;
    transition: all 0.3s;
    
    &.active {
      color: #E07A4F;
      font-weight: bold;
      font-size: 32rpx;
      transform: scale(1.02);
    }
    
    .active-line {
      width: 48rpx;
      height: 6rpx;
      background: linear-gradient(90deg, #E07A4F, #2bb5b5);
      border-radius: 4rpx;
      position: absolute;
      bottom: 12rpx;
      box-shadow: 0 2rpx 6rpx rgba(224, 122, 79, 0.3);
    }
  }
}

/* 内容区域 */
.content-area {
  padding: 24rpx;
  position: relative;
  z-index: 1;
  height: calc(100vh - 96rpx); /* 减去 tabs 的高度 */
  box-sizing: border-box;
}

.list-item {
  background-color: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04), 0 2rpx 8rpx rgba(0,0,0,0.02);
  border: none;
  transition: transform 0.1s ease;
  animation: slideIn 0.4s ease-out backwards;
  
  /* 列表项依次进场动画延迟 */
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
  
  @include press-card();
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(30rpx);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f5f7fa;
    
    .header-left {
      flex: 1;
      
      .item-time {
        font-size: 26rpx;
        color: #999;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      }
    }
    
    .header-right {
      margin-right: 12rpx;
      
      .item-user {
        font-size: 22rpx;
        color: #E07A4F;
        background-color: rgba(224, 122, 79, 0.08);
        padding: 8rpx 20rpx;
        border-radius: 30rpx;
        font-weight: 600;
        letter-spacing: 1rpx;
      }
    }
    
    .delete-icon {
      padding: 16rpx;
      margin: -16rpx -16rpx -16rpx 6rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.6;
      @include press(0.95, 0.7);
    }
  }
  
  .item-content {
    padding-top: 4rpx;

    .msg-text-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .msg-label {
        font-size: 28rpx;
        color: #909399;
        font-weight: normal;
        flex-shrink: 0;
        line-height: 1.6;
        margin-top: 2rpx;
      }
    }

    .content-text {
      font-size: 30rpx;
      color: #333;
      font-weight: 500;
      line-height: 1.6;
      word-break: break-all;
      
      &.empty-text {
        color: #c0c4cc;
        font-weight: normal;
        font-style: italic;
        font-size: 28rpx;
      }
    }
    
    /* 需求列表特定样式 */
    .demand-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
      .demand-tag {
        background: linear-gradient(135deg, #E07A4F, #2bb5b5);
        color: #fff;
        font-size: 20rpx;
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        margin-right: 16rpx;
        margin-top: 6rpx;
        font-weight: 600;
        flex-shrink: 0;
        box-shadow: 0 4rpx 10rpx rgba(224, 122, 79, 0.25);
      }
      
      .demand-text {
        font-size: 30rpx;
        font-weight: 500;
        color: #333;
        line-height: 1.5;
      }
    }
    
    /* 音频播放器样式 */
    .audio-player {
      margin-top: 20rpx;
      margin-bottom: 20rpx;
      background: #f8fcfc;
      border-radius: 50rpx; /* 更圆润的形状 */
      padding: 12rpx 20rpx;
      display: flex;
      align-items: center;
      border: 1rpx solid #e0f2f2;
      max-width: 85%; /* 限制宽度更像气泡 */
      box-sizing: border-box;
      @include press-card();
      
      .play-icon-box {
        width: 70rpx;
        height: 70rpx;
        background-color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20rpx;
        flex-shrink: 0;
        box-shadow: 0 4rpx 12rpx rgba(224, 122, 79, 0.15);
        transition: all 0.3s;
        
        &.playing {
          background-color: #E07A4F;
          box-shadow: 0 4rpx 16rpx rgba(224, 122, 79, 0.4);
        }
        
        uni-icons {
           margin-left: 0; 
        }
      }
      
      .audio-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        justify-content: center;
        
        .audio-name {
          font-size: 28rpx;
          color: #333;
          margin-bottom: 4rpx;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .audio-status {
          font-size: 20rpx;
          color: #999;
        }
      }
      
      .audio-wave {
        display: flex;
        align-items: center;
        margin-left: 20rpx;
        height: 24rpx;
        margin-right: 10rpx;
        
        .bar {
          width: 4rpx;
          background-color: #E07A4F;
          margin: 0 2rpx;
          border-radius: 2rpx;
          animation: wave 1s infinite ease-in-out;
          
          &.bar1 { animation-delay: 0s; height: 12rpx; }
          &.bar2 { animation-delay: 0.2s; height: 20rpx; }
          &.bar3 { animation-delay: 0.4s; height: 16rpx; }
        }
      }
    }
    
    @keyframes wave {
      0%, 100% { transform: scaleY(1); opacity: 0.8; }
      50% { transform: scaleY(1.5); opacity: 1; }
    }
    
    .file-info {
      display: flex;
      align-items: center;
      margin-top: 16rpx;
      background-color: #f8f9fa;
      padding: 16rpx;
      border-radius: 8rpx;
      
      .file-name {
         font-size: 26rpx;
         color: #333;
         margin-left: 16rpx;
         flex: 1;
         overflow: hidden;
         text-overflow: ellipsis;
         white-space: nowrap;
      }
    }

    .address-info {
      display: flex;
      align-items: flex-start;
      margin-top: 24rpx;
      background-color: #f7f8fa;
      padding: 16rpx 20rpx;
      border-radius: 12rpx;
      border: 1rpx solid #f0f0f0;
      
      uni-icons {
        margin-top: 2rpx;
        margin-right: 8rpx;
      }
      
      .address-text {
        font-size: 24rpx;
        color: #909399;
        flex: 1;
        line-height: 1.5;
        text-align: justify;
      }
    }
  }
  
  .item-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f7fa;
    
    .resend-btn {
      display: flex;
      align-items: center;
      padding: 12rpx 24rpx;
      background-color: rgba(224, 122, 79, 0.08);
      border-radius: 30rpx;
      @include press-btn();
      
      text {
        font-size: 24rpx;
        color: #E07A4F;
        margin-left: 8rpx;
        font-weight: 500;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  min-height: 500rpx;
  
  .empty-icon-wrapper {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
  }
  
  .empty-title {
    font-size: 32rpx;
    color: #666;
    font-weight: 500;
    margin-bottom: 16rpx;
  }
  
  .empty-subtitle {
    font-size: 26rpx;
    color: #999;
    line-height: 1.6;
  }
  
  .empty-text {
    font-size: 28rpx;
    color: #999;
    margin-top: 20rpx;
  }
}

.loading-more, .no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  text {
    margin-left: 10rpx;
  }
}

/* 悬浮按钮 */
.fab-btn {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #E07A4F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(224, 122, 79, 0.4);
  z-index: 100;
  
  @include press-btn();
}

/* 弹窗样式 */
.popup-box {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  &.add-msg-popup {
    width: 650rpx;
  }
  
  .popup-header {
    padding: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1rpx solid #eee;
    position: relative;
    flex-shrink: 0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
    }
    
    .close-icon {
      position: absolute;
      right: 30rpx;
    }
  }
  
  .popup-body {
    padding: 30rpx;
    max-height: 60vh;
    overflow-y: auto;
    
    .form-item {
      margin-bottom: 30rpx;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .form-label {
        display: block;
        font-size: 28rpx;
        color: #333;
        margin-bottom: 16rpx;
        font-weight: 500;
      }
      
      .radio-group-inline {
        display: flex;
        align-items: center;
        
        .radio-item {
          display: flex;
          align-items: center;
          margin-right: 40rpx;
          
          radio {
            margin-right: 8rpx;
          }
          
          text {
            font-size: 28rpx;
            color: #666;
          }
        }
      }
      
      .record-btn {
        width: 100%;
        height: 80rpx;
        background-color: #E07A4F;
        color: #fff;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28rpx;
        border: none;
        transition: all 0.3s;
        
        &::after {
          border: none;
        }
        
        &.recording {
          background-color: #ff6b6b;
          animation: pulse 1.5s infinite;
        }
        
        uni-icons {
          margin-right: 10rpx;
        }
      }
      
      .record-actions {
        display: flex;
        gap: 20rpx;
        
        .action-btn {
          flex: 1;
          height: 80rpx;
          border-radius: 8rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28rpx;
          border: none;
          
          &::after { border: none; }
          
          uni-icons { margin-right: 8rpx; }
          
          &.play-btn {
            background-color: #FFF0E8;
            color: #E07A4F;
            border: 1rpx solid #E07A4F;
          }
          
          &.retry-btn {
            background-color: #f5f7fa;
            color: #666;
            border: 1rpx solid #dcdfe6;
          }
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
      
      .audio-preview {
        margin-top: 16rpx;
        padding: 16rpx;
        background-color: #FFF0E8;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #E07A4F;
        
        uni-icons {
          margin-right: 8rpx;
        }
      }
      
      .char-count {
        text-align: right;
        font-size: 24rpx;
        color: #999;
        margin-top: 8rpx;
      }
    }
    
    .popup-textarea {
      width: 100%;
      height: 200rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      padding: 20rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
    
    .popup-input {
      width: 100%;
      height: 80rpx;
      background-color: #f8f8f8;
      border-radius: 8rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      box-sizing: border-box;
    }
  }
  
  .popup-footer {
    display: flex;
    border-top: 1rpx solid #eee;
    
    .btn {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      font-size: 30rpx;
      background-color: #fff;
      border-radius: 0;
      
      &::after {
        border: none;
      }
      
      &.cancel {
        color: #666;
        border-right: 1rpx solid #eee;
      }
      
      &.confirm {
        color: #E07A4F;
      }
    }
  }
}

/* 详情弹窗样式 */
.detail-popup-box {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  
  .detail-body {
    flex: 1 1 auto;
    padding: 30rpx;
    box-sizing: border-box;
    overflow-y: auto;
    max-height: none;
    
    .detail-item {
      margin-bottom: 24rpx;
      border-bottom: 1rpx solid #f5f5f5;
      padding-bottom: 24rpx;
      
      &:last-child {
        border-bottom: none;
      }
      
      .detail-label {
        font-size: 26rpx;
        color: #999;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .detail-value {
        font-size: 28rpx;
        color: #333;
        line-height: 1.5;
        display: block;
        word-break: break-all;
        
        &.highlight-current {
          color: #E07A4F;
          font-weight: bold;
        }
      }
    }
  }
  
  .popup-footer {
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #eee;
    flex-shrink: 0;
    
    .btn {
      width: 100%;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 8rpx;
      
      &.confirm {
        background-color: #E07A4F;
        color: #fff;
      }
    }
  }
}
</style>