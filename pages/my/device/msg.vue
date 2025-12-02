<template>
  <view class="msg-page">
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
    <view class="content-area">
      <!-- 消息列表 -->
      <view v-if="currentTab === 0">
        <view class="list-item" v-for="(item, index) in msgList" :key="item._key" @click="showDetail(item)" @longpress="handleDelete(item)">
          <view class="item-header">
            <view class="header-left">
              <text class="item-time">{{ item.createTime }}</text>
            </view>
            <view class="header-right" v-if="item.sendMessageUserName">
              <text class="item-user">发送人: {{ item.sendMessageUserName }}</text>
            </view>
            <uni-icons type="trash" size="18" color="#999" @click.stop="handleDelete(item)" class="delete-icon"></uni-icons>
          </view>
          <view class="item-content">
            <!-- 只有当有文字内容，或者既没有文字也不是音频/文件时（纯文本空消息），才显示文本行 -->
            <view class="msg-text-row" v-if="(item.messageContent || item.content) || (!isAudio(item) && !item.filename)">
              <text class="msg-label">文本内容：</text>
              <text class="content-text" :class="{ 'empty-text': !item.messageContent && !item.content }">{{ item.messageContent || item.content || '无文字内容' }}</text>
            </view>
            
            <!-- 音频播放器 -->
            <view class="audio-player" v-if="isAudio(item)" @click.stop="playAudio(item)">
              <view class="play-icon-box">
                <uni-icons :type="isPlaying(item) ? 'videocam-filled' : 'videocam'" size="24" color="#3ec6c6"></uni-icons>
              </view>
              <view class="audio-info">
                <text class="audio-name">{{ item.filename || '音频消息' }}</text>
                <text class="audio-status">{{ isPlaying(item) ? '播放中...' : '点击播放' }}</text>
              </view>
            </view>

            <!-- 普通文件 -->
            <view class="file-info" v-else-if="item.filename">
              <uni-icons type="paperclip" size="16" color="#3ec6c6"></uni-icons>
              <text class="file-name">{{ item.filename }}</text>
            </view>
            
            <view class="address-info" v-if="item.deviceAddress">
               <uni-icons type="location" size="14" color="#999"></uni-icons>
               <text class="address-text">{{ item.deviceAddress }}</text>
            </view>
          </view>
        </view>
        <!-- 空状态 -->
        <view v-if="msgList.length === 0 && !loading" class="empty-state">
          <uni-icons type="chatbubbles" size="50" color="#ccc"></uni-icons>
          <text class="empty-text">暂无消息数据</text>
        </view>
      </view>

      <!-- 需求列表 -->
      <view v-if="currentTab === 1">
        <view class="list-item demand-item" v-for="(item, index) in demandList" :key="item._key" @click="showDetail(item)" @longpress="handleDelete(item)">
          <view class="item-header">
             <view class="header-left">
              <text class="item-time">{{ item.createTime }}</text>
            </view>
            <view class="header-right" v-if="item.sendMessageUserName">
              <text class="item-user">发送人: {{ item.sendMessageUserName }}</text>
            </view>
            <uni-icons type="trash" size="18" color="#999" @click.stop="handleDelete(item)" class="delete-icon"></uni-icons>
          </view>
          <view class="item-content">
            <view class="demand-row">
              <view class="demand-tag">需求</view>
              <text class="content-text demand-text" :class="{ 'empty-text': !item.demandContent && !item.content }">{{ item.demandContent || item.content || '无文字内容' }}</text>
            </view>
            
            <!-- 音频播放器 -->
            <view class="audio-player" v-if="isAudio(item)" @click.stop="playAudio(item)">
              <view class="play-icon-box">
                <uni-icons :type="isPlaying(item) ? 'videocam-filled' : 'videocam'" size="24" color="#3ec6c6"></uni-icons>
              </view>
              <view class="audio-info">
                <text class="audio-name">{{ item.filename || '音频消息' }}</text>
                <text class="audio-status">{{ isPlaying(item) ? '播放中...' : '点击播放' }}</text>
              </view>
            </view>

             <!-- 普通文件 -->
            <view class="file-info" v-else-if="item.filename">
              <uni-icons type="paperclip" size="16" color="#3ec6c6"></uni-icons>
              <text class="file-name">{{ item.filename }}</text>
            </view>

            <view class="address-info" v-if="item.deviceAddress">
               <uni-icons type="location" size="14" color="#999"></uni-icons>
               <text class="address-text">{{ item.deviceAddress }}</text>
            </view>
          </view>
        </view>
        <!-- 空状态 -->
        <view v-if="demandList.length === 0 && !loading" class="empty-state">
          <uni-icons type="list" size="50" color="#ccc"></uni-icons>
          <text class="empty-text">暂无需求数据</text>
        </view>
      </view>
      
      <!-- 加载更多 loading -->
      <view class="loading-more" v-if="loading">
        <uni-icons type="spinner-cycle" size="24" color="#999"></uni-icons>
        <text>加载中...</text>
      </view>
      <view class="no-more" v-if="!loading && isEnd">
        <text>没有更多数据了</text>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab-btn" v-if="currentTab === 0" @click="openAddPopup">
      <uni-icons type="plusempty" size="26" color="#fff"></uni-icons>
    </view>
    
    <!-- ... (后续代码保持结构但会通过 edit 更新颜色) ... -->

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
                <radio value="1" :checked="formData.contentType === '1'" color="#3ec6c6" />
                <text>文本</text>
              </label>
              <label class="radio-item">
                <radio value="2" :checked="formData.contentType === '2'" color="#3ec6c6" />
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
               <button class="action-btn play-btn" @click="playTempAudio">
                 <uni-icons :type="isPlayingTemp ? 'videocam-filled' : 'videocam'" size="20" color="#3ec6c6"></uni-icons>
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
        <scroll-view scroll-y class="popup-body detail-body">
          <view class="detail-item" v-for="(value, key) in currentDetail" :key="key">
             <text class="detail-label">{{ getFieldLabel(key) }}</text>
             <text class="detail-value">{{ formatValue(key, value) }}</text>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

  </view>
</template>

<script>
import { listSleepmessage, addSleepmessage, delSleepmessage } from '@/api/sleepmessage.js'
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
        filename: '' // 音频文件名
      },
      submitting: false,
      
      // 录音相关
      recorderManager: null,
      recording: false,
      recordDuration: 0,
      audioTempPath: '',
      recordTimer: null,
      isPlayingTemp: false, // 试听播放状态
      
      // 详情
      currentDetail: {},
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
        isCurrent: '是否当前',
        sendMessageUserId: '发送人ID',
        sendDemandUserName: '发送人',
        title: '标题'
      },
      
      // 音频播放
      innerAudioContext: null,
      currentPlayingItem: null
    }
  },
  onLoad(options) {
    if (options.deviceId) this.queryParams.deviceId = options.deviceId;
    if (options.deviceKey) this.queryParams.deviceKey = options.deviceKey;
    if (options.productKey) this.queryParams.productKey = options.productKey;
    
    this.loadDictData();
    this.loadData();
    this.initAudio();
    this.initRecorder();
  },
  onUnload() {
    // 清理音频播放器
    if (this.innerAudioContext) {
      this.innerAudioContext.destroy();
    }
    // 清理录音资源
    if (this.recordTimer) {
      clearInterval(this.recordTimer);
    }
    if (this.recorderManager) {
      this.recorderManager.stop();
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
        // 自动上传
        this.uploadAudio(res.tempFilePath);
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
        console.error('音频播放错误', res);
        this.currentPlayingItem = null;
        this.isPlayingTemp = false; // 试听出错
        uni.showToast({ title: '播放失败，请检查网络或文件', icon: 'none' });
      });
    },
    
    // 判断是否为音频
    isAudio(item) {
      if (String(item.contentType) === '2') return true;
      if (item.filename && /\.(mp3|wav|aac|m4a|audio)$/i.test(item.filename)) return true;
      return false;
    },
    
    // 播放音频
    playAudio(item) {
      if (this.currentPlayingItem === item) {
        // 暂停/停止
        this.innerAudioContext.stop();
        this.currentPlayingItem = null;
        return;
      }
      
      // 构造 URL
      let url = '';
      if (item.audioData) {
        // 如果有 base64 数据或完整 URL
        url = item.audioData;
      } else if (item.filename) {
        if (item.filename.startsWith('http')) {
          url = item.filename;
        } else {
          // 使用 config.baseUrl 拼接
          // 假设文件存储在 /profile/upload/ 目录下
          url = config.baseUrl + '/profile/upload/' + item.filename;
        }
      }
      
      if (!url) {
        uni.showToast({ title: '无效的音频地址', icon: 'none' });
        return;
      }
      
      this.innerAudioContext.stop();
      this.innerAudioContext.src = url;
      this.innerAudioContext.play();
      this.currentPlayingItem = item;
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
      // 不需要显示的字段
      const excludeFields = ['createBy', 'messageId', 'demandId', 'userId', 'deptId', 'deviceId', 'productKey', 'messageType', 'timeStamp', '_key','audioMime'];
      
      // 过滤空值
      const detail = {};
      for (const key in item) {
        if (item[key] !== null && item[key] !== '' && item[key] !== undefined && !excludeFields.includes(key)) {
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
      this.loading = true;
      try {
        let res;
        if (this.currentTab === 0) {
          res = await listSleepmessage(this.queryParams);
        } else {
          res = await listSleepdemand(this.queryParams);
        }

        if (res.code === 200) {
          const list = res.rows || [];
          this.total = res.total || 0;
          
          // 为每条数据添加唯一的 _key 字段
          const processedList = list.map((item, index) => {
            if (this.currentTab === 0) {
              item._key = item.messageId ? 'msg_' + item.messageId : 'temp_msg_' + Date.now() + '_' + index;
            } else {
              item._key = item.demandId ? 'demand_' + item.demandId : 'temp_demand_' + Date.now() + '_' + index;
            }
            return item;
          });
          
          if (this.queryParams.pageNum === 1) {
            if (this.currentTab === 0) this.msgList = processedList;
            else this.demandList = processedList;
          } else {
            if (this.currentTab === 0) this.msgList = [...this.msgList, ...processedList];
            else this.demandList = [...this.demandList, ...processedList];
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
        filename: ''
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
      
      this.innerAudioContext.src = this.audioTempPath;
      this.innerAudioContext.play();
      this.isPlayingTemp = true;
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
       
       // 开始新录音
       this.startRecord();
    },
    
    // 上传音频文件
    async uploadAudio(filePath) {
      uni.showLoading({ title: '上传中...' });
      
      try {
        const uploadRes = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: config.baseUrl + '/common/upload',
            filePath: filePath,
            name: 'file',
            header: {
              // 如果需要 token，在这里添加
              // 'Authorization': 'Bearer ' + token
            },
            success: (res) => {
              if (res.statusCode === 200) {
                try {
                  const data = JSON.parse(res.data);
                  resolve(data);
                } catch (e) {
                  reject(new Error('解析响应失败'));
                }
              } else {
                reject(new Error('上传失败，状态码：' + res.statusCode));
              }
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
        
        if (uploadRes.code === 200) {
          // 保存文件名到表单数据
          this.formData.filename = uploadRes.fileName;
          uni.showToast({ title: '录音上传成功', icon: 'success' });
        } else {
          uni.showToast({ title: uploadRes.msg || '上传失败', icon: 'none' });
        }
      } catch (e) {
        console.error('上传音频失败', e);
        uni.showToast({ title: '上传失败：' + e.message, icon: 'none' });
      } finally {
        uni.hideLoading();
      }
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
        if (!this.audioTempPath && !this.formData.filename) {
          uni.showToast({ title: '请先录制音频', icon: 'none' });
          return;
        }
        // 如果有临时路径但上传失败，生成自定义文件名
        if (this.audioTempPath && !this.formData.filename) {
          this.formData.filename = `audio_${Date.now()}.mp3`;
          console.log('上传失败，使用自定义文件名:', this.formData.filename);
        }
      }
      
      if (!this.formData.sendMessageUserName.trim()) {
        uni.showToast({ title: '请输入发布者姓名', icon: 'none' });
        return;
      }
      
      this.submitting = true;
      try {
        const data = {
          deviceKey: this.queryParams.deviceKey,
          productKey: this.queryParams.productKey,
          deviceId: this.queryParams.deviceId,
          contentType: this.formData.contentType,
          sendMessageUserName: this.formData.sendMessageUserName
        };
        
        // 根据内容类型添加不同字段
        if (this.formData.contentType === '1') {
          // 文本模式
          data.content = this.formData.content;
        } else {
          // 音频模式
          data.filename = this.formData.filename;
          if (this.formData.title) {
            data.title = this.formData.title;
          }
        }

        const res = await addSleepmessage(data);

        if (res.code === 200) {
          uni.showToast({ title: '发布成功', icon: 'success' });
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

    // 删除条目
    handleDelete(item) {
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
}

/* 顶部 Tabs */
.tabs-header {
  display: flex;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
  
  .tab-item {
    flex: 1;
    height: 88rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    color: #666;
    position: relative;
    
    &.active {
      color: #3ec6c6;
      font-weight: bold;
      font-size: 30rpx;
    }
    
    .active-line {
      width: 40rpx;
      height: 4rpx;
      background-color: #3ec6c6;
      border-radius: 2rpx;
      position: absolute;
      bottom: 10rpx;
    }
  }
}

/* 内容区域 */
.content-area {
  padding: 20rpx;
}

.list-item {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.04);
  border: 1rpx solid rgba(0,0,0,0.02);
  
  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f8f8f8;
    
    .header-left {
      flex: 1;
      
      .item-time {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .header-right {
      margin-right: 10rpx;
      
      .item-user {
        font-size: 24rpx;
        color: #3ec6c6;
        background-color: rgba(62, 198, 198, 0.1);
        padding: 6rpx 16rpx;
        border-radius: 30rpx;
        font-weight: 500;
      }
    }
    
    .delete-icon {
      padding: 10rpx;
      margin: -10rpx;
    }
  }
  
  .item-content {
    padding-top: 10rpx;

    .msg-text-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16rpx;
      
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
      color: #303133;
      font-weight: 500;
      line-height: 1.6;
      word-break: break-all;
      /* margin-bottom: 16rpx; 移除这里的 margin，由 row 控制 */
      
      &.empty-text {
        color: #c0c4cc;
        font-weight: normal;
        font-style: normal;
        font-size: 28rpx;
      }
    }
    
    /* 需求列表特定样式 */
    .demand-row {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10rpx;
      
      .demand-tag {
        background-color: #e0f7f5;
        color: #3ec6c6;
        font-size: 22rpx;
        padding: 2rpx 12rpx;
        border-radius: 8rpx;
        margin-right: 16rpx;
        margin-top: 4rpx;
        font-weight: bold;
        flex-shrink: 0;
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
      margin-top: 16rpx;
      margin-bottom: 16rpx;
      background: linear-gradient(to right, #e6fbfb, #f4fcfc);
      border-radius: 12rpx;
      padding: 16rpx 24rpx;
      display: flex;
      align-items: center;
      border-left: 6rpx solid #3ec6c6;
      max-width: 100%;
      box-sizing: border-box;
      
      .play-icon-box {
        width: 64rpx;
        height: 64rpx;
        background-color: #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        flex-shrink: 0;
        box-shadow: 0 2rpx 8rpx rgba(62, 198, 198, 0.2);
        
        uni-icons {
           margin-left: 4rpx; /* 视觉修正播放图标位置 */
        }
      }
      
      .audio-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        overflow: hidden;
        justify-content: center;
        
        .audio-name {
          font-size: 26rpx;
          color: #333;
          margin-bottom: 6rpx;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .audio-status {
          font-size: 22rpx;
          color: #3ec6c6;
        }
      }
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
      margin-top: 20rpx;
      background-color: #f2fcfb;
      padding: 16rpx 20rpx;
      border-radius: 12rpx;
      
      uni-icons {
        margin-top: 4rpx;
      }
      
      .address-text {
        font-size: 24rpx;
        color: #606266;
        margin-left: 12rpx;
        flex: 1;
        line-height: 1.5;
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 100rpx;
  
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
  background-color: #3ec6c6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(62, 198, 198, 0.4);
  z-index: 100;
  
  &:active {
    transform: scale(0.95);
  }
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
        background-color: #3ec6c6;
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
            background-color: #e6fbfb;
            color: #3ec6c6;
            border: 1rpx solid #3ec6c6;
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
        background-color: #f0fcfa;
        border-radius: 8rpx;
        display: flex;
        align-items: center;
        font-size: 24rpx;
        color: #3ec6c6;
        
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
        color: #3ec6c6;
      }
    }
  }
}

/* 详情弹窗样式 */
.detail-popup-box {
  height: 70vh;
  display: flex;
  flex-direction: column;
  
  .detail-body {
    flex: 1;
    padding: 30rpx;
    box-sizing: border-box;
    overflow-y: auto;
    
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
      }
    }
  }
}
</style>