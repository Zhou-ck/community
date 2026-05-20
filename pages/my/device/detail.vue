<template>
  <view class="device-detail-page">

    <!-- 设备基本信息 -->
    <view class="device-info-card" v-if="deviceInfo">
      <view class="info-header">
        <view class="device-avatar" :class="{'has-icon': getDeviceIcon(deviceInfo.deviceType)}">
          <image 
            v-if="getDeviceIcon(deviceInfo.deviceType)" 
            :src="getDeviceIcon(deviceInfo.deviceType)" 
            class="avatar-img"
            mode="aspectFit"
          ></image>
          <text v-else class="avatar-text">{{ (deviceInfo.deviceAlias || deviceInfo.deviceKey).charAt(0) }}</text>
        </view>
        <view class="device-basic">
          <view class="name-row">
             <text class="device-name">{{ deviceInfo.deviceAlias || deviceInfo.deviceKey }}</text>
          </view>
          <view class="tags-row">
            <view class="device-tag type-tag">{{ getDeviceTypeName(deviceInfo.deviceType) }}</view>
            <view class="device-tag status-tag" :class="deviceInfo.onlineStatus === '1' ? 'online' : 'offline'">
              <view class="status-dot"></view>
              <text>{{ getDictLabel('dev_online_status', deviceInfo.onlineStatus) }}</text>
            </view>
            <!-- 社区监控状态标签 -->
            <view class="device-tag monitor-tag" 
              :class="{
                'not-monitored': String(deviceInfo.communityMonitorStatus) === '0',
                'package-monitoring': String(deviceInfo.communityMonitorStatus) === '1',
                'apply-monitoring': String(deviceInfo.communityMonitorStatus) === '2',
                'apply-reviewing': String(deviceInfo.communityMonitorStatus) === '3'
              }"
              v-if="deviceInfo.communityMonitorStatus !== undefined && deviceInfo.communityMonitorStatus !== null">
              <text>{{ getMonitorStatusText(deviceInfo.communityMonitorStatus) }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 设备Key信息 -->
      <view class="info-list">
        <view class="info-item">
          <text class="info-label">设备Key:</text>
          <text class="info-value">{{ deviceInfo.deviceKey }}</text>
        </view>
        <view class="info-item">
          <text class="info-label">设备编号:</text>
          <text class="info-value">{{ deviceInfo.productKey + deviceInfo.deviceKey }}</text>
        </view>
        <!-- 最近在线时间 -->
        <view class="info-item" v-if="deviceInfo.onlineTime">
          <text class="info-label">最近在线:</text>
          <text class="info-value">{{ deviceInfo.onlineTime }}</text>
        </view>
        <!-- 最近离线时间 -->
        <view class="info-item" v-if="deviceInfo.offlineTime">
          <text class="info-label">最近离线:</text>
          <text class="info-value">{{ deviceInfo.offlineTime }}</text>
        </view>
      </view>
    </view>

    <!-- 设备控制 -->
    <view class="section-card">
      <view class="section-header">
        <view class="section-title-bar"></view>
        <text class="section-title">设备控制</text>
      </view>
      
      <view class="control-row">
        <view class="control-left">
          <text class="control-title">设备布防</text>
          <text class="control-subtitle">事件发生时将通知绑定的联系人</text>
        </view>
        <switch 
          :checked="deviceInfo && deviceInfo.defenseStatus === '1'" 
          @change="toggleDefenseStatus"
          color="#3ec6c6"
          class="defense-switch"
        />
      </view>
    </view>

    <!-- 功能卡片网格 -->
    <view class="function-grid">
      <!-- 报警设置 -->
      <view class="function-card" @click="handleAlarmSettingsClick">
        <view class="card-content">
          <text class="card-title">报警设置</text>
          <text class="card-subtitle">配置设备报警开关</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="sound" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 参数设置 - 根据设备类型决定是否显示参数设置模块 -->
      <view class="function-card" @click="handleParamSettingsClick" v-if="showParamsSetting">
        <view class="card-content">
          <text class="card-title">参数设置</text>
          <text class="card-subtitle">调整设备运行参数</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="gear" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 绑定家人 - 根据设备类型和绑定限制显示 -->
      <view class="function-card" @click="handleBindFamilyClick" v-if="showBindFamily">
        <view class="card-content">
          <text class="card-title">绑定家人</text>
          <text class="card-subtitle">{{ bindFamilySubtitle }}</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="person" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 手表实时数据 -->
      <view class="function-card" @click="handleWatchRealTimeDataClick" v-if="showWatchRealTimeData">
        <view class="card-content">
          <text class="card-title">实时数据</text>
          <text class="card-subtitle">查看实时健康数据</text>
        </view>
        <view class="card-icon cyan-bg">
          <text class="iconfontA icon-shishijianceshuju" style="font-size: 20px; color: #3ec6c6;"></text>
        </view>
      </view>
      
      <!-- 健康数据总览 -->
      <view class="function-card" @click="handleWatchHealthOverviewClick" v-if="showWatchHealthOverview">
        <view class="card-content">
          <text class="card-title">健康数据总览</text>
          <text class="card-subtitle">查看历史健康数据</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="heart" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 睡眠报告 -->
      <view class="function-card" @click="handleWatchSleepReportClick" v-if="showWatchSleepReport">
        <view class="card-content">
          <text class="card-title">睡眠报告</text>
          <text class="card-subtitle">查看睡眠数据分析</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="bars" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 通话记录 -->
      <view class="function-card" @click="handleWatchCallHistoryClick" v-if="showWatchCallHistory">
        <view class="card-content">
          <text class="card-title">通话记录</text>
          <text class="card-subtitle">查看手表通话记录</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="phone-filled" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 配置手表 -->
      <view class="function-card" @click="handleWatchConfigClick" v-if="showWatchConfig">
        <view class="card-content">
          <text class="card-title">配置手表</text>
          <text class="card-subtitle">设置手表参数</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="gear" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 绑定接警人 -->
      <view class="function-card" @click="handleBindReceiverClick">
        <view class="card-content">
          <text class="card-title">绑定接警人</text>
          <text class="card-subtitle">已绑定 {{ boundReceivers.length }} 人</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="phone" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>

      <!-- 配置网络 - 根据设备类型决定是否需要配网 -->
      <view class="function-card" @click="handleConfigNetwork" v-if="showNetworkConfig">
        <view class="card-content">
          <text class="card-title">配置网络</text>
          <text class="card-subtitle">设备网络配置</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="tune" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      <!-- 实时检测 - AEP设备（水浸/门磁/烟感/燃气/红外/温湿度/一氧化碳/SOS拉绳） -->
      <view class="function-card" @click="handleAepRealTimeClick" v-if="showAepRealTimeMonitor">
        <view class="card-content">
          <text class="card-title">实时检测</text>
          <text class="card-subtitle">查看设备状态信息</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="eye" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      <!-- 实时检测 -->
      <view class="function-card" @click="handleRealTimeCheckClick" v-if="showRealTimeMonitor">
        <view class="card-content">
          <text class="card-title">实时监测</text>
          <text class="card-subtitle">查看设备实时状态</text>
        </view>
        <view class="card-icon cyan-bg">
          <text class="iconfontA icon-shishijianceshuju" style="font-size: 20px; color: #3ec6c6;"></text>
        </view>
      </view>
      <!-- 睡眠报告 -->
      <view class="function-card" @click="handleSleepReportClick" v-if="showSleepReport">
        <view class="card-content">
          <text class="card-title">睡眠报告</text>
          <text class="card-subtitle">查看睡眠数据分析</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="bars" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>   

      <!-- 需求消息 -->
      <view class="function-card" @click="handleSleepDemandClick" v-if="showDemandMessage">
        <view class="card-content">
          <text class="card-title">需求消息</text>
          <text class="card-subtitle">查看需求消息列表</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="chat" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>

      <!-- 计划管理 -->
      <view class="function-card" @click="handlePlanManagementClick" v-if="showPlanManagement">
        <view class="card-content">
          <text class="card-title">查看计划</text>
          <text class="card-subtitle">查看设备运行计划</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="calendar" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>

      <!-- 内容设置 -->
      <view class="function-card" @click="handleContentSettingClick" v-if="showContentSetting">
        <view class="card-content">
          <text class="card-title">内容设置</text>
          <text class="card-subtitle">设置设备显示内容</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="images" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>

      <!-- 申请监控 - 当sourceType为1且communityMonitorStatus为0时显示 -->
      <view class="function-card" @click="handleApplyMonitorClick" v-if="showApplyMonitor">
        <view class="card-content">
          <text class="card-title">申请监控</text>
          <text class="card-subtitle">申请社区监控服务</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="eye" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>

      <!-- 撤销监控 - 当sourceType为1且communityMonitorStatus为3时显示 -->
      <view class="function-card" @click="handleCancelMonitorClick" v-if="showCancelMonitor">
        <view class="card-content">
          <text class="card-title danger-text">撤销申请</text>
          <text class="card-subtitle">撤销监控申请</text>
        </view>
        <view class="card-icon red-bg">
          <uni-icons type="closeempty" size="20" color="#f56c6c"></uni-icons>
        </view>
      </view>

      <!-- 编辑设备 -->
      <view class="function-card" @click="editDevice(deviceInfo)">
        <view class="card-content">
          <text class="card-title">编辑设备</text>
          <text class="card-subtitle">修改设备信息</text>
        </view>
        <view class="card-icon cyan-bg">
          <uni-icons type="compose" size="20" color="#3ec6c6"></uni-icons>
        </view>
      </view>
      
      <!-- 删除设备 -->
      <view class="function-card" @click="deleteDevice">
        <view class="card-content">
          <text class="card-title danger-text">删除设备</text>
          <text class="card-subtitle">解除设备绑定</text>
        </view>
        <view class="card-icon red-bg">
          <uni-icons type="trash" size="20" color="#f56c6c"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 统一设置弹窗 -->
    <uni-popup ref="settingsPopup" type="bottom" :mask-click="false">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ currentPopupTitle }}</text>
          <uni-icons type="clear" size="24" color="#666" @click="closeSettingsPopup"></uni-icons>
        </view>
        
        <!-- 设置内容 -->
        <scroll-view v-if="popupType === 'alarm'" 
                     class="setting-scroll" 
                     scroll-y="true"
                     :style="'max-height: ' + scrollViewHeight + 'px;'">
          <!-- 报警逻辑说明 -->
          <view class="alarm-logic-tip">
            <view class="tip-header">
              <uni-icons type="info-filled" size="16" color="#ff9800"></uni-icons>
              <text class="tip-title">报警规则说明</text>
            </view>
            <view class="tip-content">
              <text class="tip-item">每项报警可独立配置通知方式</text>
              <text class="tip-item">实际发送 = 设备配置 ∩ 接警人设置（取交集）</text>
              <text class="tip-item">只有设备和接警人都开启的方式才会发送</text>
            </view>
          </view>
          
          <view class="setting-list">
            <view v-for="alarm in alarmSwitches" :key="alarm.identifier" class="alarm-item-wrapper">
              <view class="setting-item">
                <view class="setting-info">
                  <text class="setting-label">{{ alarm.name }}</text>
                  <text class="setting-desc">{{ alarm.desc }}</text>
                </view>
                <switch 
                  :checked="alarm.open" 
                  @change="toggleAlarm(alarm)"
                  color="#3ec6c6"
                  class="setting-switch"
                />
              </view>
              
              <!-- 报警方式按钮组 -->
              <view class="alarm-methods" v-if="alarm.open">
                <view class="method-label">报警方式:</view>
                <view class="method-buttons">
                  <view 
                    class="method-btn" 
                    :class="{ active: alarm.callOpen }"
                    @click="toggleAlarmMethod(alarm, 'callOpen')"
                  >
                    <uni-icons type="phone" size="16" :color="alarm.callOpen ? '#3ec6c6' : '#999'"></uni-icons>
                    <text>电话</text>
                  </view>
                  <view 
                    class="method-btn" 
                    :class="{ active: alarm.smsOpen }"
                    @click="toggleAlarmMethod(alarm, 'smsOpen')"
                  >
                    <uni-icons type="chatbubble" size="16" :color="alarm.smsOpen ? '#3ec6c6' : '#999'"></uni-icons>
                    <text>短信</text>
                  </view>
                  <view 
                    class="method-btn" 
                    :class="{ active: alarm.wxOpen }"
                    @click="toggleAlarmMethod(alarm, 'wxOpen')"
                  >
                    <uni-icons type="chat" size="16" :color="alarm.wxOpen ? '#3ec6c6' : '#999'"></uni-icons>
                    <text>微信</text>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 如果没有数据，显示提示 -->
            <view v-if="alarmSwitches.length === 0" style="padding: 40rpx; text-align: center; color: #999;">
              <text>暂无报警设置数据</text>
            </view>
          </view>
        </scroll-view>
        
        <!-- 参数设置内容 -->
        <scroll-view v-if="popupType === 'param'" 
                     class="param-setting-scroll" 
                     scroll-y="true"
                     :style="'max-height: ' + scrollViewHeight + 'px;'">
          <view class="param-setting-list">
            <!-- 业务配置模块（仅跌倒检测设备） -->
            <view v-if="deviceInfo && String(deviceInfo.deviceType) === '2'" class="business-config-section">
              <view class="business-config-header">
                <text class="business-config-title">业务参数</text>
              </view>
              <text class="business-config-desc">业务参数由后端业务逻辑使用，不会下发到硬件</text>
              <view class="business-config-item">
                <text class="business-config-label">跌倒误报缓冲时长(秒):</text>
                <view class="business-stepper-wrap">
                  <view class="biz-stepper">
                    <view class="biz-stepper-btn" :class="{ disabled: fallFalseAlarmBufferSec <= 0 }" @click="fallFalseAlarmBufferSec = Math.max(0, Number(fallFalseAlarmBufferSec) - 1)">
                      <text>-</text>
                    </view>
                    <input class="biz-stepper-input" type="number" v-model="fallFalseAlarmBufferSec" />
                    <view class="biz-stepper-btn" @click="fallFalseAlarmBufferSec = Number(fallFalseAlarmBufferSec) + 1">
                      <text>+</text>
                    </view>
                  </view>
                  <text class="business-config-hint" @click="showFallBufferTip">?</text>
                </view>
              </view>
              <button class="business-save-btn" @click="saveBusinessParams" :loading="businessParamsSaving">保存业务参数</button>
            </view>

            <view v-for="prop in visibleParamProps" :key="prop.identifier" class="param-setting-item">
              <view class="param-info">
                <view class="param-name-container">
                  <text class="param-name">{{ prop.name }}</text>
                  <text v-if="prop.unit" class="param-unit">({{ prop.unit }})</text>
                </view>
                <view class="param-value-container">
                  <!-- 布尔开关 -->
                  <switch v-if="prop.uiType === 'bool'"
                    :checked="!!prop.tempValue"
                    @change="prop.identifier === 'pageRotation' ? onPageRotationSwitchChange(prop, $event) : onParamSwitchChange(prop, $event)"
                    color="#3ec6c6"
                    class="param-switch"
                  />
                  <!-- 数值输入 -->
                  <input v-else-if="prop.uiType === 'number'"
                    class="param-value-input"
                    type="number"
                    v-model="prop.tempValue"
                    :min="prop.numberMin"
                    :max="prop.numberMax"
                    placeholder="请输入数值" />
                  <!-- 枚举选择 -->
                  <picker v-else-if="prop.uiType === 'enum'" mode="selector" :range="prop.enumLabels" @change="onParamPickerChange(prop, $event)">
                    <view class="param-value-picker">{{ prop.tempEnumDisplay || '请选择' }}</view>
                  </picker>
                  <!-- 步进器（加减按钮） -->
                  <view v-else-if="prop.uiType === 'stepper'" class="stepper-container">
                    <view class="stepper-btn minus" :class="{ disabled: prop.tempValue <= prop.stepperMin }" @click="onStepperChange(prop, -1)">
                      <text>-</text>
                    </view>
                    <text class="stepper-value">{{ prop.tempValue }}</text>
                    <view class="stepper-btn plus" :class="{ disabled: prop.tempValue >= prop.stepperMax }" @click="onStepperChange(prop, 1)">
                      <text>+</text>
                    </view>
                  </view>
                  <!-- 字符串输入（兜底） -->
                  <input v-else
                    class="param-value-input"
                    type="text"
                    v-model="prop.tempValue"
                    placeholder="请输入" />
                  
                  <!-- 设置按钮（开关类型和步进器不显示，noButton 标记的也不显示） -->
                  <button v-if="prop.uiType !== 'bool' && prop.uiType !== 'stepper' && !prop.noButton" class="param-set-btn" @click="applyParamSetting(prop)">设置</button>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>
    </uni-popup>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-mask">
      <uni-icons type="spinner-cycle" size="40" color="#3ec6c6"></uni-icons>
      <text class="loading-text">加载中...</text>
    </view>
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

    <!-- AEP实时检测弹窗 -->
    <uni-popup ref="aepRealtimePopup" type="center" :mask-click="true">
      <view class="aep-realtime-popup">
        <view class="popup-header">
          <text class="popup-title">实时检测</text>
          <uni-icons type="close" size="24" color="#666" @click="$refs.aepRealtimePopup.close()"></uni-icons>
        </view>
        <view class="aep-realtime-body">
          <view v-if="aepRealtimeLoading" class="aep-realtime-loading">
            <uni-icons type="spinner-cycle" size="32" color="#3ec6c6"></uni-icons>
            <text>加载中...</text>
          </view>
          <view v-else class="aep-realtime-content">
            <view class="aep-realtime-item">
              <text class="aep-realtime-label">IMEI</text>
              <text class="aep-realtime-value">{{ aepRealtimeData.imei || '-' }}</text>
            </view>
            <view class="aep-realtime-item">
              <text class="aep-realtime-label">电量</text>
              <view class="aep-battery-row">
                <view class="aep-battery-bar">
                  <view class="aep-battery-fill" :style="{ width: (aepRealtimeData.batteryPercentage || 0) + '%', background: getBatteryColor(aepRealtimeData.batteryPercentage) }"></view>
                </view>
                <text class="aep-realtime-value">{{ aepRealtimeData.batteryPercentage !== undefined ? aepRealtimeData.batteryPercentage + '%' : '-' }}</text>
              </view>
            </view>
            <view class="aep-realtime-item">
              <text class="aep-realtime-label">信号强度(RSSI)</text>
              <text class="aep-realtime-value">{{ aepRealtimeData.rssi !== undefined ? aepRealtimeData.rssi + ' dBm' : '-' }}</text>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 申请监控弹窗 -->
    <uni-popup ref="applyMonitorPopup" type="center" :mask-click="false">
      <view class="apply-monitor-popup">
        <view class="popup-header">
          <text class="popup-title">申请社区监控</text>
          <uni-icons type="clear" size="24" color="#666" @click="closeApplyMonitorPopup"></uni-icons>
        </view>
        
        <view class="popup-body">
          <view class="form-item">
            <text class="form-label">设备</text>
            <input 
              class="form-input disabled" 
              :value="applyMonitorDeviceDisplay"
              disabled
            />
          </view>
          
          <view class="form-item">
            <text class="form-label required">申请原因</text>
            <textarea 
              class="form-textarea" 
              v-model="applyMonitorForm.applyReason" 
              placeholder="请输入申请原因"
              maxlength="500"
            ></textarea>
          </view>
        </view>
        
        <view class="popup-footer">
          <button class="confirm-btn" @click="submitApplyMonitor" :loading="applyMonitorSubmitting">提交</button>
          <button class="cancel-btn" @click="closeApplyMonitorPopup">取消</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { getDevice, updateDevice, delDevice, sendOneCommand, getRealTimeData, getAepDeviceInfo, deviceCommandLwm2mProfile, getIwownDeviceByImei, sendPageSwitch, sendPageRotationSwitch, sendPageRotationTime } from '@/api/device'
import { submitMonitorApply, cancelMonitorApplyByDeviceId } from '@/api/monitorApply'
import { queryParamsStatusByDpIdAndImei, saveAepCommandLog } from '@/api/aepcommandlog'
import { getDicts } from '@/api/system/dict/data'
import { getMemberIdsByDeviceId } from '@/api/familyMemberDevice'
import { getAlarmReceiverIdsByDeviceId } from '@/api/devicereceiver'
import { 
  needsNetworkConfig, 
  hasParamsSetting, 
  isAepDevice, 
  isWatchDevice, 
  isKatDevice,
  isAepWithParams,
  watchSupportsRealTimeData, 
  watchSupportsHealthOverview, 
  watchSupportsCallHistory, 
  watchSupportsConfig, 
  canBindFamily, 
  getDeviceMaxBindCount, 
  isBindFamilyLimitReached, 
  getBindFamilyTip 
} from '@/utils/parseDevNumber'

export default {
  data() {
    return {
      deviceId: '',
      deviceKey: '',
      deviceInfo: null,
      loading: false,
      // AEP设备信息
      aepDeviceId: '',
      aepProductId: '',
      dictData: {
        dev_device_type: [],
        dev_online_status: [],
        dev_property_lamp: []
      },
      // 报警开关设置
      alarmSwitches: [],
      // 参数设置（从 thingModel 中提取可写属性）
      paramProps: [],
      // 弹窗状态管理
      popupType: '', // 'alarm' | 'param' | ''
      // 编辑设备表单
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
      // 提交状态
      submitting: false,
      // 绑定的家人列表
      boundFamilyMembers: [],
      // 绑定的接警人列表
      boundReceivers: [],
      // 参数设置弹窗滚动区域高度
      scrollViewHeight: 400,
      // 申请监控表单
      applyMonitorForm: {
        applyReason: ''
      },
      // 申请监控提交状态
      applyMonitorSubmitting: false,
      // 跌倒误报缓冲时长（秒）
      fallFalseAlarmBufferSec: 0,
      // 业务参数保存状态
      businessParamsSaving: false,
      // AEP实时检测数据
      aepRealtimeData: {},
      aepRealtimeLoading: false
    }
  },
  
  computed: {
    // 动态弹窗标题
    currentPopupTitle() {
      return this.popupType === 'alarm' ? '报警设置' : 
             this.popupType === 'param' ? '参数设置' : '设置'
    },
    // 是否显示实时监测模块
    showRealTimeMonitor() {
      if (!this.deviceInfo) return false
      // 1: 呼吸睡眠, 2: 跌倒检测
      const type = String(this.deviceInfo.deviceType)
      return type === '1' || type === '2'
    },
    // 是否显示睡眠报告模块（仅呼吸睡眠设备）
    showSleepReport() {
      if (!this.deviceInfo) return false
      // 1: 呼吸睡眠
      const type = String(this.deviceInfo.deviceType)
      return type === '1'
    },
    // 是否显示需求消息模块（仅呼吸睡眠-L2设备）
    showDemandMessage() {
      if (!this.deviceInfo) return false
      // 4: 呼吸睡眠-L2 (根据 parseDevNumber.js 中 'La' → '4' 映射)
      const type = String(this.deviceInfo.deviceType)
      return type === '4'
    },
    // 是否显示内容设置模块（仅呼吸睡眠-L2设备）
    showContentSetting() {
      if (!this.deviceInfo) return false
      // 4: 呼吸睡眠-L2 (第二代睡眠雷达)
      const type = String(this.deviceInfo.deviceType)
      return type === '4'
    },
    // 是否显示计划管理模块（仅呼吸睡眠-L2设备）
    showPlanManagement() {
      if (!this.deviceInfo) return false
      // 4: 呼吸睡眠-L2 (第二代睡眠雷达)
      const type = String(this.deviceInfo.deviceType)
      return type === '4'
    },
    // 是否显示配置网络模块 - 只有呼吸睡眠(1)、跌倒监测(2)、呼吸睡眠-L2(4) 需要配网
    showNetworkConfig() {
      if (!this.deviceInfo) return false
      return needsNetworkConfig(String(this.deviceInfo.deviceType))
    },
    // 是否显示参数设置模块 - 门磁(14)、水浸(13)、红外(17) 没有参数设置
    showParamsSetting() {
      if (!this.deviceInfo) return false
      return hasParamsSetting(String(this.deviceInfo.deviceType))
    },
    // 是否为AEP设备 - 烟感(15)、可燃气体(16)、一氧化碳(19)
    isAepDevice() {
      if (!this.deviceInfo) return false
      return isAepDevice(String(this.deviceInfo.deviceType))
    },
    // 是否为手表设备
    isWatchDevice() {
      if (!this.deviceInfo) return false
      return isWatchDevice(String(this.deviceInfo.deviceType))
    },
    // 手表是否支持实时数据
    showWatchRealTimeData() {
      if (!this.deviceInfo) return false
      return watchSupportsRealTimeData(String(this.deviceInfo.deviceType))
    },
    // 手表是否支持健康数据总览
    showWatchHealthOverview() {
      if (!this.deviceInfo) return false
      return watchSupportsHealthOverview(String(this.deviceInfo.deviceType))
    },
    // 手表是否支持通话记录
    showWatchCallHistory() {
      if (!this.deviceInfo) return false
      return watchSupportsCallHistory(String(this.deviceInfo.deviceType))
    },
    // 手表是否支持配置
    showWatchConfig() {
      if (!this.deviceInfo) return false
      return watchSupportsConfig(String(this.deviceInfo.deviceType))
    },
    // 手表是否支持睡眠报告
    showWatchSleepReport() {
      if (!this.deviceInfo) return false
      // 所有手表设备都支持睡眠报告
      return this.isWatchDevice
    },
    
    // 是否为KAT设备
    isKatDevice() {
      if (!this.deviceInfo) return false
      return isKatDevice(String(this.deviceInfo.deviceType))
    },

    // 可见参数列表（过滤 hidden=true 的项）
    visibleParamProps() {
      if (!this.paramProps) return []
      return this.paramProps.filter(p => !p.hidden)
    },
    
    // 是否为有参数设置的AEP设备
    isAepWithParams() {
      if (!this.deviceInfo) return false
      return isAepWithParams(String(this.deviceInfo.deviceType))
    },
    
    // 是否显示绑定家人功能
    showBindFamily() {
      if (!this.deviceInfo) return false
      return canBindFamily(String(this.deviceInfo.deviceType))
    },
    
    // 绑定家人副标题
    bindFamilySubtitle() {
      if (!this.deviceInfo) return '已绑定 0 人'
      
      const deviceType = String(this.deviceInfo.deviceType)
      const currentCount = this.boundFamilyMembers.length
      const maxCount = getDeviceMaxBindCount(deviceType)
      
      if (maxCount === 0) {
        return `已绑定 ${currentCount} 人`
      } else {
        return `已绑定 ${currentCount}/${maxCount} 人`
      }
    },
    
    // 绑定家人提示信息
    bindFamilyTip() {
      if (!this.deviceInfo) return ''
      
      const deviceType = String(this.deviceInfo.deviceType)
      const currentCount = this.boundFamilyMembers.length
      return getBindFamilyTip(deviceType, currentCount)
    },
    
    // 是否显示申请监控功能（sourceType为1且communityMonitorStatus为0时显示）
    showApplyMonitor() {
      if (!this.deviceInfo) return false
      return String(this.deviceInfo.sourceType) === '1' && String(this.deviceInfo.communityMonitorStatus) === '0'
    },
    
    // 申请监控弹窗中显示的设备信息
    applyMonitorDeviceDisplay() {
      if (!this.deviceInfo) return ''
      const deviceName = this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey
      const deviceNumber = (this.deviceInfo.productKey || '') + this.deviceInfo.deviceKey
      return `${deviceName} (${deviceNumber})`
    },
    
    // 是否显示撤销监控功能（sourceType为1且communityMonitorStatus为3时显示）
    showCancelMonitor() {
      if (!this.deviceInfo) return false
      return String(this.deviceInfo.sourceType) === '1' && String(this.deviceInfo.communityMonitorStatus) === '3'
    },
    
    // 是否显示AEP设备实时检测（水浸/门磁/烟感/燃气/红外/温湿度/一氧化碳/SOS拉绳）
    showAepRealTimeMonitor() {
      if (!this.deviceInfo) return false
      const type = String(this.deviceInfo.deviceType)
      return ['13', '14', '15', '16', '17', '18', '19', '23'].includes(type)
    }
  },
  
  onLoad(options) {
    if (options.deviceId) {
      this.deviceId = options.deviceId
    }
    if (options.deviceKey) {
      this.deviceKey = options.deviceKey
    }
    
    // 计算滚动区域高度
    this.calculateScrollHeight()
    
    this.loadDictData()
    this.loadDeviceDetail()
  },
  onShow() {
    // 返回本页时刷新绑定家人和接警人数
    if (this.deviceId) {
      this.loadBoundFamilyMembers()
      this.loadBoundReceivers()
    }
  },
  
  methods: {
    // 计算参数设置弹窗滚动区域高度
    calculateScrollHeight() {
      try {
        const systemInfo = uni.getSystemInfoSync()
        const windowHeight = systemInfo.windowHeight
        
        // 弹窗标题高度约80rpx，底部安全区域约40rpx，其他边距约60rpx（减少边距预留）
        // 转换为px：rpx转px的系数约为 windowWidth / 750
        const rpxToPx = systemInfo.windowWidth / 750
        const headerHeight = 80 * rpxToPx
        const bottomHeight = 40 * rpxToPx
        const otherPadding = 60 * rpxToPx  // 减少边距预留
        
        // 可用高度 = 窗口高度的75% - 标题高度 - 底部高度 - 其他边距（提升比例到75%）
        this.scrollViewHeight = Math.floor(windowHeight * 0.75 - headerHeight - bottomHeight - otherPadding)
        
        // 确保最小高度
        if (this.scrollViewHeight < 300) {
          this.scrollViewHeight = 300
        }
      } catch (e) {
        // 异常时使用默认高度
        this.scrollViewHeight = 500
      }
    },
    
    // 加载已绑定的家人数量
    async loadBoundFamilyMembers() {
      try {
        const res = await getMemberIdsByDeviceId(this.deviceId)
        if (res.code === 200) {
          const ids = res.data || []
          this.boundFamilyMembers = ids.map(id => ({ memberId: id }))
        }
      } catch (e) {
        // 忽略错误，保持现有显示
      } 
    },
    // 加载已绑定的接警人数量
    async loadBoundReceivers() {
      try {
        const res = await getAlarmReceiverIdsByDeviceId(this.deviceId)
        if (res.code === 200) {
          const ids = res.data || []
          this.boundReceivers = ids.map(id => ({ receiverId: id }))
        }
      } catch (e) {
        // 忽略错误，保持现有显示
      }
    },
    // 加载字典数据
    async loadDictData() {
      try {
        const [deviceType, onlineStatus, lampProperty] = await Promise.all([
          getDicts('dev_device_type'),
          getDicts('dev_online_status'),
          getDicts('dev_property_lamp')
        ])
        
        if (deviceType.code === 200 && deviceType.data) {
          this.dictData.dev_device_type = deviceType.data
        }
        
        if (onlineStatus.code === 200 && onlineStatus.data) {
          this.dictData.dev_online_status = onlineStatus.data
        }
        
        if (lampProperty.code === 200 && lampProperty.data) {
          this.dictData.dev_property_lamp = lampProperty.data
        }
        
      } catch (error) {
        console.error('加载字典数据失败:', error)
      }
    },
    
    // 加载设备详情
    async loadDeviceDetail() {
      if (!this.deviceId) {
        uni.showToast({
          title: '设备ID不能为空',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      try {
        const response = await getDevice(this.deviceId)
        if (response.code === 200) {
          this.deviceInfo = response.data
          // 初始化跌倒误报缓冲时长
          if (String(response.data.deviceType) === '2' && response.data.businessParams) {
            try {
              const bp = typeof response.data.businessParams === 'string'
                ? JSON.parse(response.data.businessParams)
                : response.data.businessParams
              this.fallFalseAlarmBufferSec = bp.fallFalseAlarmBufferSec !== undefined ? Number(bp.fallFalseAlarmBufferSec) : 0
            } catch (e) {
              this.fallFalseAlarmBufferSec = 0
            }
          } else {
            this.fallFalseAlarmBufferSec = 0
          }
          this.loadAlarmSwitches()
          // 参数设置将在打开弹窗时动态加载
          // 同步加载已绑定的家人和接警人数量
          this.loadBoundFamilyMembers()
          this.loadBoundReceivers()
        } else {
          uni.showToast({
            title: response.msg || '获取设备信息失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取设备详情失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 加载报警开关设置
    loadAlarmSwitches() {
      if (!this.deviceInfo || !this.deviceInfo.alarmSwitch) {
        this.setDefaultAlarmSwitches()
        return
      }
      
      try {
        const parsedData = JSON.parse(this.deviceInfo.alarmSwitch)

        // 检查解析后的数据是否为数组
        if (Array.isArray(parsedData)) {
          // 过滤出有效的报警开关配置项
          const filteredSwitches = parsedData.filter(item => {
            const isValid = item && 
                   typeof item === 'object' && 
                   item.identifier && 
                   item.name && 
                   typeof item.open === 'boolean'
            if (!isValid) {
              console.log('过滤掉无效项:', item)
            }
            return isValid
          }).map(item => ({
            identifier: item.identifier,
            name: item.name,
            desc: item.desc || `${item.name}功能开关`,
            open: item.open,
            callOpen: item.callOpen !== undefined ? item.callOpen : (item.phoneAlarm || false),
            smsOpen: item.smsOpen !== undefined ? item.smsOpen : (item.smsAlarm || false),
            wxOpen: item.wxOpen !== undefined ? item.wxOpen : (item.wechatAlarm || false)
          }))
          
          // 使用 $set 确保响应式更新
          this.$set(this, 'alarmSwitches', filteredSwitches)
          
          console.log('最终解析的报警开关配置:', this.alarmSwitches)
          console.log('alarmSwitches 数组长度:', this.alarmSwitches.length)
          
          // 如果没有有效的配置项，使用默认配置
          if (this.alarmSwitches.length === 0) {
            console.log('没有有效配置项，使用默认配置')
            this.setDefaultAlarmSwitches()
          }
        } else {
          console.warn('alarmSwitch 数据格式不正确，不是数组格式:', typeof parsedData)
          this.setDefaultAlarmSwitches()
        }
      } catch (error) {
        console.error('解析报警开关失败:', error)
        console.error('原始数据:', this.deviceInfo.alarmSwitch)
        this.setDefaultAlarmSwitches()
      }
    },
    
    // 设置默认报警开关配置
    setDefaultAlarmSwitches() {
      const defaultSwitches = [
       
      ]
      
      // 使用 $set 确保响应式更新
      this.$set(this, 'alarmSwitches', defaultSwitches)
      console.log('设置默认报警开关配置完成，长度:', this.alarmSwitches.length)
    },
    
    // 切换报警方式
    toggleAlarmMethod(alarm, method) {
      // 如果报警开关未开启，不允许设置报警方式
      if (!alarm.open) {
        uni.showToast({
          title: '请先开启报警功能',
          icon: 'none'
        })
        return
      }
      
      // 切换报警方式状态
      alarm[method] = !alarm[method]
      
      // 提示用户设备优先逻辑
      const methodName = method === 'callOpen' ? '电话' : method === 'smsOpen' ? '短信' : '微信'
      const status = alarm[method] ? '开启' : '关闭'
      
      uni.showToast({
        title: `${alarm.name}${methodName}通知已${status}`,
        icon: 'none',
        duration: 1500
      })
      
      // 保存设置
      this.saveAlarmSettings()
    },
    
    // 获取设备图标
    getDeviceIcon(deviceType) {
      const type = String(deviceType)
      try {
        const iconMap = {
          '1': '../../my/static/breath.png',        // 呼吸睡眠(Ld)
          '2': '../../my/static/tumble.png',        // 跌倒监测(Ed)
          '4': '../../my/static/keranqiti.png',     // 呼吸睡眠-L2(La)
          '13': '../../my/static/shuijin.png',      // 水浸(Sd)
          '14': '../../my/static/menci.png',        // 门磁(Md)
          '15': '../../my/static/yangan.png',       // 烟感(Yd)
          '16': '../../my/static/keranqiti.png',    // 可燃气体(Rd)
          '17': '../../my/static/hongwai.png',      // 红外(Hd)
          '18': '../../my/static/wenshidu.png',     // 温湿度(Wd)
          '19': '../../my/static/yiyanghuatan.png', // 一氧化碳(Td)
          '20': '../../my/static/breath.png',       // 其它设备(Od)，暂用呼吸图标
          '21': '../../my/static/watch.png',        // 手表(Za)
          '22': '../../my/static/watch.png',        // 手表(Zb)
          '23': '../../my/static/sos.png'         // 拉绳(Ls)
        }
        return iconMap[type] || ''
      } catch (e) {
        return ''
      }
    },
    
    // 获取设备类型名称
    getDeviceTypeName(type) {
      const deviceType = this.dictData.dev_device_type.find(item => item.dictValue === type)
      return deviceType ? deviceType.dictLabel : '未知设备'
    },
    
    // 获取字典标签
    getDictLabel(dictType, dictValue) {
      const dictList = this.dictData[dictType] || []
      const dictItem = dictList.find(item => String(item.dictValue) === String(dictValue))
      return dictItem ? dictItem.dictLabel : dictValue
    },
    
    // 获取社区监控状态文本
    getMonitorStatusText(status) {
      const statusMap = {
        '0': '未监控',
        '1': '套餐服务监控中',
        '2': '申请监控中',
        '3': '申请审核中'
      }
      return statusMap[String(status)] || '未知状态'
    },
    
    // 获取社区监控状态样式类
    getMonitorStatusClass(status) {
      const classMap = {
        '0': 'not-monitored',
        '1': 'package-monitoring',
        '2': 'apply-monitoring',
        '3': 'apply-reviewing'
      }
      return classMap[String(status)] || 'not-monitored'
    },
    
    // 处理AEP设备实时检测点击
    async handleAepRealTimeClick() {
      if (!this.deviceInfo) return
      this.aepRealtimeData = {}
      this.aepRealtimeLoading = true
      this.$refs.aepRealtimePopup.open()
      try {
        const res = await getDevice(this.deviceId)
        if (res.code === 200 && res.data) {
          this.aepRealtimeData = {
            imei: res.data.imei,
            batteryPercentage: res.data.batteryPercentage,
            rssi: res.data.rssi
          }
        } else {
          this.aepRealtimeData = { imei: this.deviceInfo.imei }
        }
      } catch (e) {
        this.aepRealtimeData = { imei: this.deviceInfo.imei }
      } finally {
        this.aepRealtimeLoading = false
      }
    },
    
    // 根据电量返回颜色
    getBatteryColor(val) {
      if (val === undefined || val === null) return '#3ec6c6'
      if (val <= 20) return '#f44336'
      if (val <= 50) return '#ff9800'
      return '#4caf50'
    },
    
    // 处理申请监控点击
    handleApplyMonitorClick() {
      // 重置表单
      this.applyMonitorForm.applyReason = ''
      this.$refs.applyMonitorPopup.open()
    },
    
    // 关闭申请监控弹窗
    closeApplyMonitorPopup() {
      this.$refs.applyMonitorPopup.close()
    },
    
    // 提交申请监控
    async submitApplyMonitor() {
      // 验证申请原因
      if (!this.applyMonitorForm.applyReason || !this.applyMonitorForm.applyReason.trim()) {
        uni.showToast({
          title: '请填写申请原因',
          icon: 'none'
        })
        return
      }
      
      this.applyMonitorSubmitting = true
      try {
        const params = {
          deviceId: this.deviceInfo.deviceId,
          applyReason: this.applyMonitorForm.applyReason.trim()
        }
        
        const response = await submitMonitorApply(params)
        
        if (response.code === 200) {
          uni.showToast({
            title: '申请提交成功',
            icon: 'success'
          })
          this.closeApplyMonitorPopup()
          // 刷新设备详情，更新监控状态
          this.loadDeviceDetail()
        } else {
          uni.showToast({
            title: response.msg || '申请提交失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('提交申请监控失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        this.applyMonitorSubmitting = false
      }
    },
    
    // 处理撤销监控点击
    handleCancelMonitorClick() {
      uni.showModal({
        title: '确认撤销',
        content: '确定要撤销监控申请吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            await this.cancelMonitorApply()
          }
        }
      })
    },
    
    // 撤销监控申请
    async cancelMonitorApply() {
      try {
        uni.showLoading({ title: '撤销中...' })
        
        const response = await cancelMonitorApplyByDeviceId(this.deviceInfo.deviceId)
        
        if (response.code === 200) {
          uni.showToast({
            title: '撤销成功',
            icon: 'success'
          })
          // 刷新设备详情，更新监控状态
          this.loadDeviceDetail()
        } else {
          uni.showToast({
            title: response.msg || '撤销失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('撤销监控申请失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 切换设备布防状态
    async toggleDefenseStatus() {
      const newDefenseStatus = this.deviceInfo.defenseStatus === '1' ? '2' : '1'
      
      // 构建提交参数
      const params = {
        defenseStatus: newDefenseStatus,
        enableStatus: this.deviceInfo.enableStatus // 保持原有enableStatus
      }
      
      await this.updateDeviceStatus(params)
    },
    
    // 更新设备状态
    async updateDeviceStatus(params) {
      try {
        uni.showLoading({ title: '更新中...' })
        
        const updateParams = {
          deviceId: this.deviceInfo.deviceId,
          deviceKey: this.deviceInfo.deviceKey,
          deviceAlias: this.deviceInfo.deviceAlias,
          remark: this.deviceInfo.remark || '',
          enableStatus: this.deviceInfo.enableStatus, // 使用当前的 enableStatus
          defenseStatus: this.deviceInfo.defenseStatus, // 默认使用当前的 defenseStatus
          onlineStatus: this.deviceInfo.onlineStatus, // 确保传递 onlineStatus
          ...params // 覆盖传入的参数
        }
        
        const response = await updateDevice(updateParams)
        
        if (response.code === 200) {
          // 更新本地数据
          Object.assign(this.deviceInfo, params)
          
          const statusText = params.defenseStatus ? (params.defenseStatus === '1' ? '已开启布防' : '已关闭布防') : '更新成功'
          uni.showToast({
            title: statusText,
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.msg || '更新失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('更新设备状态失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 处理报警设置点击事件
    handleAlarmSettingsClick() {
      this.openSettingsPopup('alarm')
    },
    
    // 处理参数设置点击事件
    handleParamSettingsClick() {
      this.openSettingsPopup('param')
    },
    
    // 处理实时检测点击事件
    handleRealTimeCheckClick() {
      if (!this.deviceInfo) return
      
      // 检查设备是否在线
      if (this.deviceInfo.onlineStatus !== '1') {
        uni.showToast({
          title: '当前设备不在线',
          icon: 'none'
        })
        return
      }

      const deviceType = String(this.deviceInfo.deviceType)
      let targetPage = ''
      
      // 根据设备类型跳转到对应的实时监测页面
      if (deviceType === '1') {
        targetPage = '/pages/my/device/sleep'  // 呼吸睡眠
      } else if (deviceType === '2') {
        targetPage = '/pages/my/device/fall'   // 跌倒监测
      }
      
      if (targetPage) {
        uni.navigateTo({
          url: `${targetPage}?productKey=${this.deviceInfo.productKey}&deviceKey=${this.deviceInfo.deviceKey}&deviceId=${this.deviceInfo.deviceId}`
        })
      }
    },
    
    // 处理睡眠报告点击事件
    handleSleepReportClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/sleep-report/sleep-report?productKey=${this.deviceInfo.productKey}&deviceKey=${this.deviceInfo.deviceKey}&deviceId=${this.deviceInfo.deviceId}&deviceAlias=${encodeURIComponent(this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey)}`
      })
    },

    // 处理需求消息点击事件
    handleSleepDemandClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/device/msg?productKey=${this.deviceInfo.productKey}&deviceKey=${this.deviceInfo.deviceKey}&deviceId=${this.deviceInfo.deviceId}`
      })
    },
    
    // 处理内容设置点击事件
    handleContentSettingClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/content/index?productKey=${this.deviceInfo.productKey}&deviceKey=${this.deviceInfo.deviceKey}&deviceId=${this.deviceInfo.deviceId}`
      })
    },
    
    // 处理计划管理点击事件
    handlePlanManagementClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/plan/detail?productKey=${this.deviceInfo.productKey}&device=${this.deviceInfo.deviceKey}&deviceId=${this.deviceId}`
      })
    },
    
    // 处理绑定家人点击事件
    handleBindFamilyClick() {
      if (!this.deviceInfo) return
      
      const deviceType = String(this.deviceInfo.deviceType)
      const currentCount = this.boundFamilyMembers.length
      const maxCount = getDeviceMaxBindCount(deviceType)
      
      // 检查是否已达到绑定上限
      if (isBindFamilyLimitReached(deviceType, currentCount)) {
        // 显示已达上限的弹窗
        const familyNames = this.boundFamilyMembers.map(member => member.memberName || `家人${member.memberId}`).join('、')
        
        uni.showModal({
          title: '绑定家人',
          content: `该设备最多绑定${maxCount}个家人，是否要更换绑定人？`,
          confirmText: '更换绑定',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              // 跳转到绑定家人页面进行更换，传递设备类型、productKey 和 deviceKey
              uni.navigateTo({
                url: `/pages/my/family/index?deviceId=${this.deviceId}&mode=replace&deviceType=${deviceType}&productKey=${this.deviceInfo.productKey}&deviceKey=${this.deviceInfo.deviceKey}`
              })
            }
          }
        })
      } else {
        // 未达上限，正常跳转到绑定页面，传递设备类型、productKey 和 deviceKey
        uni.navigateTo({
          url: `/pages/my/family/index?deviceId=${this.deviceId}&deviceType=${deviceType}&productKey=${this.deviceInfo.productKey}&deviceKey=${this.deviceInfo.deviceKey}`
        })
      }
    },
    
    // 处理绑定接警人点击事件
    handleBindReceiverClick() {
      const params = {
        deviceId: this.deviceId,
        deviceKey: this.deviceInfo.deviceKey,
        productKey: this.deviceInfo.productKey
      }
      const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
      uni.navigateTo({
        url: '/pages/my/alarmreceiver/index?' + query
      })
    },
    
    // 处理配置网络点击事件
    handleConfigNetwork() {
      uni.showModal({
        title: '配置网络',
        content: '是否对设备进行配网操作，配网前请确保设备通电？',
        confirmText: '开始配置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            const params = {
              deviceId: this.deviceId,
              productKey: this.deviceInfo.productKey,
              deviceKey: this.deviceInfo.deviceKey
            }
            const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&')
            
            // 根据设备类型决定跳转页面
            const deviceType = String(this.deviceInfo.deviceType)
            let targetUrl = ''
            
            if (deviceType === '4') {
              // 呼吸睡眠-L2设备，跳转到蓝牙配网页面
              targetUrl = '/pages/my/network/bluetooth?' + query
            } else {
              // 其他设备类型，跳转到普通网络配置页面
              targetUrl = '/pages/my/network/index?' + query
            }
            
            uni.navigateTo({
              url: targetUrl
            })
          }
        }
      })
    },
    
    // 处理手表实时数据点击事件
    handleWatchRealTimeDataClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/watch/realtime?imei=${this.deviceInfo.imei}&deviceId=${this.deviceInfo.deviceId}&deviceAlias=${encodeURIComponent(this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey)}`
      })
    },
    
    // 处理健康数据总览点击事件
    handleWatchHealthOverviewClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/watch/health?imei=${this.deviceInfo.imei}&deviceId=${this.deviceInfo.deviceId}&deviceAlias=${encodeURIComponent(this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey)}`
      })
    },
    
    // 处理通话记录点击事件
    handleWatchCallHistoryClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/watch/callhistory?imei=${this.deviceInfo.imei}&deviceId=${this.deviceInfo.deviceId}&deviceAlias=${encodeURIComponent(this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey)}`
      })
    },
    
    // 处理配置手表点击事件
    handleWatchConfigClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/watch/config?imei=${this.deviceInfo.imei}&deviceId=${this.deviceInfo.deviceId}&deviceAlias=${encodeURIComponent(this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey)}`
      })
    },
    
    // 处理手表睡眠报告点击事件
    handleWatchSleepReportClick() {
      if (!this.deviceInfo) return
      
      uni.navigateTo({
        url: `/pages/my/watch/Sleep-index?imei=${this.deviceInfo.imei}&deviceId=${this.deviceInfo.deviceId}&deviceAlias=${encodeURIComponent(this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey)}`
      })
    },
    
    // 打开设置弹窗
    async openSettingsPopup(type) {
      
      // 设置弹窗类型
      this.popupType = type
      
      try {
        // 根据类型加载对应数据
        if (type === 'alarm') {
          // 确保报警数据已加载
          if (!this.alarmSwitches || this.alarmSwitches.length === 0) {
            this.loadAlarmSwitches()
          }
        } else if (type === 'param') {
          // 加载参数设置数据（异步等待）
          uni.showLoading({ title: '加载参数中...' })
          
          // 根据设备类型选择不同的加载方式
          if (this.isAepWithParams) {
            await this.loadAepParamSettings()
          } else if (this.isKatDevice) {
            await this.loadParamSettings()
          } else {
            // 其他设备类型可能没有参数设置
            this.$set(this, 'paramProps', [])
          }
          
          uni.hideLoading()
        }
        
        // 使用 nextTick 确保数据更新后再打开弹窗
        this.$nextTick(() => {
          if (this.$refs.settingsPopup) {
            this.$refs.settingsPopup.open()
          }
        })
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      }
    },
    
    // 关闭设置弹窗
    closeSettingsPopup() {
      if (this.$refs.settingsPopup) {
        this.$refs.settingsPopup.close()
      }
      // 清空弹窗类型
      this.popupType = ''
    },

    // 开关切换并立即保存
    async onParamSwitchChange(prop, e) {
      const newValue = !!e.detail.value
      prop.tempValue = newValue
      
      // 对于布尔类型的参数，需要转换为数字格式发送给设备
      let deviceValue = newValue ? 1 : 0
      
      try {
        uni.showLoading({ title: '设置中...' })
        
        let res
        // AEP设备使用专门的接口下发指令
        if (this.isAepDevice) {
          // 指令名称
          const commandName = `${prop.name}${newValue ? prop.specs['1'] : prop.specs['0']}`
          
          const setParams = {
            productId: this.aepProductId,
            deviceId: this.aepDeviceId,
            imei: this.deviceInfo.imei,
            deviceVersion: `${this.deviceInfo.deviceVersion || ''}`,
            dpId: prop.dpId,
            dpValType: prop.dpType || 'int',
            dpVal: `${deviceValue}`,
            masterKey: this.deviceInfo.apiKey || ''
          }
          
          // 下发指令
          res = await deviceCommandLwm2mProfile(setParams)
          
          if (res.code === 200) {
            // 保存指令记录
            const saveParams = {
              command: res.data.command,
              commandId: res.data.commandId,
              commandStatus: res.data.commandStatus,
              createBy: res.data.createBy,
              createTime: res.data.createTime,
              deviceId: res.data.deviceId,
              imei: res.data.imei,
              productId: res.data.productId,
              ttl: res.data.ttl,
              deviceVersion: `${this.deviceInfo.deviceVersion || ''}`,
              dpId: prop.dpId,
              dpType: prop.dpType || 'int',
              dpVal: `${deviceValue}`,
              apiKey: this.deviceInfo.apiKey || '',
              commandName: commandName
            }
            await saveAepCommandLog(saveParams)
            
            prop.value = newValue
            uni.showToast({ title: '设置成功', icon: 'success' })
          } else {
            prop.tempValue = prop.value
            uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
          }
        } else {
          // 普通设备使用 sendOneCommand
          res = await sendOneCommand({
            ack: 0,
            address: null,
            deviceId: this.deviceInfo.deviceId,
            deviceKey: this.deviceInfo.deviceKey,
            productKey: this.deviceInfo.productKey,
            propertyValue: {
              [prop.identifier]: deviceValue
            },
            type: null
          })
          
          if (res.code === 200) {
            prop.value = newValue
            uni.showToast({ title: '设置成功', icon: 'success' })
          } else {
            prop.tempValue = prop.value
            uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
          }
        }
      } catch (err) {
        // 出错，恢复原值
        prop.tempValue = prop.value
        console.error('设置参数失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // 步进器值变更（点击加减按钮）
    async onStepperChange(prop, direction) {
      const step = prop.stepperStep || 1
      const min = prop.stepperMin || 0
      const max = prop.stepperMax || 100
      let newValue = Number(prop.tempValue) + (direction * step)
      
      // 边界检查
      if (newValue < min) newValue = min
      if (newValue > max) newValue = max
      
      // 如果值没变化，不执行
      if (newValue === Number(prop.tempValue)) return
      
      prop.tempValue = newValue
      
      // 立即发送设置命令
      try {
        uni.showLoading({ title: '设置中...' })
        const res = await sendOneCommand({
          ack: 0,
          address: null,
          deviceId: this.deviceInfo.deviceId,
          deviceKey: this.deviceInfo.deviceKey,
          productKey: this.deviceInfo.productKey,
          propertyValue: {
            [prop.identifier]: newValue
          },
          type: null
        })
        
        if (res.code === 200) {
          prop.value = newValue
          uni.showToast({ title: '设置成功', icon: 'success' })
        } else {
          // 设置失败，恢复原值
          prop.tempValue = prop.value
          uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
        }
      } catch (err) {
        prop.tempValue = prop.value
        console.error('设置参数失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // 参数枚举选择变更
    onParamPickerChange(prop, e) {
      const idx = Number(e.detail.value)
      prop.tempValue = prop.enumValues[idx]
      prop.tempEnumDisplay = prop.enumLabels[idx]
    },

    // 页面轮换开关变更（发送后端 + 持久化 + 显隐控制）
    async onPageRotationSwitchChange(prop, e) {
      const enabled = !!e.detail.value
      const prevValue = prop.tempValue

      try {
        uni.showLoading({ title: '设置中...' })

        const res = await sendPageRotationSwitch({
          deviceKey: this.deviceInfo.deviceKey,
          productKey: this.deviceInfo.productKey,
          enabled
        })

        if (res.code === 200) {
          prop.value = enabled
          prop.tempValue = enabled

          // 更新5个停留时间输入框的显示状态
          if (this.paramProps) {
            this.paramProps.forEach(p => {
              if (p.identifier && p.identifier.startsWith('pageRotationTime_')) {
                p.hidden = !enabled
              }
            })
          }

          // 持久化开关状态（按设备隔离）
          const rotationStorageKey = 'pageRotationState_' + (this.deviceInfo && this.deviceInfo.deviceKey || '')
          try {
            uni.setStorageSync(rotationStorageKey, { enabled })
          } catch (err) {
            console.error('页面轮换状态保存失败', err)
          }

          uni.showToast({ title: enabled ? '页面轮换已开启' : '页面轮换已关闭', icon: 'success' })
        } else {
          // 恢复原值
          prop.tempValue = prevValue
          uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
        }
      } catch (err) {
        prop.tempValue = prevValue
        console.error('页面轮换设置失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },

    // 应用参数设置（点击设置按钮时调用）
    async applyParamSetting(prop) {
      try {
        let value = prop.tempValue

        // 页面轮换停留时间设置（5个独立接口）
        if (prop.identifier && prop.identifier.startsWith('pageRotationTime_')) {
          const pageId = parseInt(prop.identifier.replace('pageRotationTime_', ''))
          const duration = parseInt(value)
          if (isNaN(duration) || duration < 1 || duration > 120) {
            uni.showToast({ title: '请输入1-120秒', icon: 'none' })
            return
          }
          uni.showLoading({ title: '设置中...' })
          const res = await sendPageRotationTime({
            deviceKey: this.deviceInfo.deviceKey,
            productKey: this.deviceInfo.productKey,
            pageId,
            duration
          })
          uni.hideLoading()
          if (res.code === 200) {
            prop.value = value
            uni.showToast({ title: '设置成功', icon: 'success' })
          } else {
            uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
          }
          return
        }
        
        // 数值类型验证
        if (prop.uiType === 'number') {
          if (value === '' || value === null || value === undefined) {
            uni.showToast({ title: '请输入数值', icon: 'none' })
            return
          }
          value = Number(value)
          if (Number.isNaN(value)) {
            uni.showToast({ title: '请输入有效数字', icon: 'none' })
            return
          }
        }
        
        // 对于布尔类型和灯属性枚举，确保发送数字格式
        if (prop.uiType === 'bool' || (prop.identifier === 'lamp' && prop.uiType === 'enum')) {
          value = typeof value === 'boolean' ? (value ? 1 : 0) : Number(value)
        }
        
        uni.showLoading({ title: '设置中...' })
        
        let res
        // 页面切换指令（KAT设备service调用）
        if (prop.identifier === 'pageSwitch') {
          const tgt = parseInt(prop.tempValue)
          if (isNaN(tgt) || tgt < 1 || tgt > 5) {
            uni.hideLoading()
            uni.showToast({ title: '请选择切换页面', icon: 'none' })
            return
          }
          res = await sendPageSwitch({
            deviceKey: this.deviceInfo.deviceKey,
            productKey: this.deviceInfo.productKey,
            tgt: tgt
          })
        } else if (this.isAepDevice) {
          // AEP设备使用专门的接口，需要传递dpId
          res = await deviceCommandLwm2mProfile({
            deviceId: this.aepDeviceId,
            productId: this.aepProductId,
            dpId: prop.dpId,
            value: value
          })
        } else {
          // KAT设备使用原有接口
          res = await sendOneCommand({
            ack: 0,
            address: null,
            deviceId: this.deviceInfo.deviceId,
            deviceKey: this.deviceInfo.deviceKey,
            productKey: this.deviceInfo.productKey,
            propertyValue: {
              [prop.identifier]: value
            },
            type: null
          })
        }
        
        if (res.code === 200) {
          // 更新实际值
          prop.value = value
          if (prop.uiType === 'enum') {
            prop.enumDisplay = prop.tempEnumDisplay
          }
          uni.showToast({ title: '设置成功', icon: 'success' })
        } else {
          uni.showToast({ title: res.msg || '设置失败', icon: 'none' })
        }
      } catch (err) {
        console.error('设置参数失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    
    // 获取设备实时数据
    async loadRealTimeData() {
      try {
        const response = await getRealTimeData({
          productKey: this.deviceInfo.productKey,
          deviceKey: this.deviceInfo.deviceKey
        })
        
        if (response.code === 200) {
          let realTimeParams = {}
          
          // 首先检查response.data是否是字符串
          if (typeof response.data === 'string') {
            try {
              const parsedData = JSON.parse(response.data)
              
              // 从解析后的数据中提取params
              if (parsedData.params && typeof parsedData.params === 'string') {
                realTimeParams = JSON.parse(parsedData.params)
              } else if (parsedData.params) {
                realTimeParams = parsedData.params
              }
            } catch (e) {
              // 解析失败，返回空对象
            }
          }
          // 处理response.data是对象的情况
          else if (response.data && typeof response.data === 'object') {
            // 检查是否有params字段
            if ('params' in response.data) {
              if (typeof response.data.params === 'string') {
                if (response.data.params.trim() !== '') {
                  try {
                    realTimeParams = JSON.parse(response.data.params)
                  } catch (e) {
                    realTimeParams = {}
                  }
                }
              } else {
                realTimeParams = response.data.params
              }
            } 
            // 检查是否有data.params结构
            else if (response.data.data && response.data.data.params) {
              if (typeof response.data.data.params === 'string') {
                try {
                  realTimeParams = JSON.parse(response.data.data.params)
                } catch (e) {
                  realTimeParams = {}
                }
              } else {
                realTimeParams = response.data.data.params
              }
            }
            // 检查response.data本身是否就是参数数据
            else if (Object.keys(response.data).some(key => 
              ['height', 'unmanned', 'DWT', 'FRT', 'threshold', 'lamp', 'buz'].includes(key))) {
              realTimeParams = response.data
            }
            // 尝试寻找包含参数的对象
            else {
              const dataKeys = Object.keys(response.data)
              const targetFields = ['height', 'unmanned', 'DWT', 'FRT', 'threshold', 'lamp', 'buz']
              for (let di = 0; di < dataKeys.length; di++) {
                const value = response.data[dataKeys[di]]
                if (value && typeof value === 'object' &&
                    Object.keys(value).some(function(k) { return targetFields.indexOf(k) >= 0 })) {
                  realTimeParams = value
                  break
                }
              }
            }
          }
          
          return realTimeParams
        }
      } catch (error) {
        // 获取失败，返回空对象
      }
      return {}
    },

    // 解析参数设置（thingModel.properties 中 accessMode === 'w'）
    async loadParamSettings() {
      try {
        let tm = this.deviceInfo && this.deviceInfo.thingModel
        if (tm && typeof tm === 'string') {
          try { tm = JSON.parse(tm) } catch (e) { tm = null }
        }
        const props = (tm && Array.isArray(tm.properties)) ? tm.properties
                   : (tm && tm.model && Array.isArray(tm.model.properties)) ? tm.model.properties
                   : []
        const writables = props.filter(p => p && p.accessMode === 'w')
        
        // 获取实时数据（失败不影响后续流程）
        let realTimeData = {}
        try {
          realTimeData = await this.loadRealTimeData() || {}
        } catch (e) {
          // 实时数据获取失败，使用空对象继续
        }
        
        const mapped = writables.map(p => {
          const type = (p && p.dataType && p.dataType.type) ? p.dataType.type : 'string'
          const specs = (p && p.dataType && p.dataType.specs) ? p.dataType.specs : {}
          let uiType = type === 'bool' || type === 'boolean' ? 'bool'
                         : type === 'int' || type === 'float' || type === 'double' || type === 'long' || type === 'number' ? 'number'
                         : type === 'enum' ? 'enum' : 'string'
          let enumLabels = []
          let enumValues = []
          let enumDisplay = ''
          if (uiType === 'enum') {
            // 特殊处理灯属性，使用字典数据
            if (p.identifier === 'lamp') {
              if (this.dictData.dev_property_lamp && this.dictData.dev_property_lamp.length > 0) {
                enumValues = this.dictData.dev_property_lamp.map(item => item.dictValue)
                enumLabels = this.dictData.dev_property_lamp.map(item => item.dictLabel)
              } else {
                // 备用方案，使用默认的开关选项
                enumValues = ['0', '1']
                enumLabels = ['关闭', '打开']
              }
            } else {
              // specs 可能是对象映射或数组
              if (Array.isArray(specs)) {
                enumValues = specs.map(i => i.value)
                enumLabels = specs.map(i => i.text || i.name || String(i.value))
              } else if (specs && typeof specs === 'object') {
                enumValues = Object.keys(specs)
                enumLabels = Object.values(specs).map(function(v) { return typeof v === 'string' ? v : (v && v.text ? v.text : '') })
              }
            }
          }
          
          // 智能匹配实时数据字段
          const findRealTimeValue = (identifier, name, realTimeData) => {
            // 1. 直接匹配identifier
            if (realTimeData[identifier] !== undefined) {
              return realTimeData[identifier]
            }
            
            // 2. 匹配name
            if (realTimeData[name] !== undefined) {
              return realTimeData[name]
            }
            
            // 3. 常见字段映射
            const fieldMapping = {
              'height': ['height', '安装高度', 'installHeight'],
              'unmanned': ['unmanned', '无人时间', 'noPersonTime'],
              'threshold': ['threshold', '跌倒静态高度阈值', 'fallThreshold'],
              'DWT': ['DWT', '静止驻留时长'],
              'FRT': ['FRT', '跌倒时长'],
              'lamp': ['lamp', '灯', 'light'],
              'buz': ['buz', '蜂鸣器开关', 'buzzer']
            }
            
            // 4. 通过映射查找
            const fieldMappingKeys = Object.keys(fieldMapping)
            for (let fi = 0; fi < fieldMappingKeys.length; fi++) {
              const fKey = fieldMappingKeys[fi]
              const aliases = fieldMapping[fKey]
              if (aliases.indexOf(identifier) >= 0 || aliases.indexOf(name) >= 0) {
                if (realTimeData[fKey] !== undefined) {
                  return realTimeData[fKey]
                }
              }
            }
            
            // 5. 模糊匹配（包含关系）
            const keys = Object.keys(realTimeData)
            for (const key of keys) {
              if (key.toLowerCase().includes(identifier.toLowerCase()) || 
                  identifier.toLowerCase().includes(key.toLowerCase()) ||
                  (name && (key.toLowerCase().includes(name.toLowerCase()) || 
                           name.toLowerCase().includes(key.toLowerCase())))) {
                return realTimeData[key]
              }
            }
            
            return undefined
          }
          
          // 使用智能匹配获取实时数据值
          let realTimeValue = findRealTimeValue(p.identifier, p.name, realTimeData)
          
          // 处理布尔类型的数据转换
          if (uiType === 'bool' && realTimeValue !== undefined) {
            // 将 0/1 转换为 false/true
            realTimeValue = realTimeValue === 1 || realTimeValue === '1' || realTimeValue === true
          }
          
          // 对于灯属性，使用布尔开关类型
          if (p.identifier === 'lamp') {
            uiType = 'bool'
            // 将 0/1 转换为 false/true
            if (realTimeValue !== undefined) {
              realTimeValue = realTimeValue === 1 || realTimeValue === '1' || realTimeValue === true
            }
          }
          
          // 声音调节：0-100，每次增加10，使用步进器
          if (p.identifier === 'volume' || p.name === '声音调节') {
            uiType = 'stepper'
            if (realTimeValue !== undefined) {
              realTimeValue = Number(realTimeValue)
            }
          }
          
          // 屏幕亮度调节：0-5，每次增加1，使用步进器
          if (p.identifier === 'brightness' || p.identifier === 'screenBrightness' || p.name === '屏幕亮度调节') {
            uiType = 'stepper'
            if (realTimeValue !== undefined) {
              realTimeValue = Number(realTimeValue)
            }
          }
          
          const initVal = realTimeValue !== undefined ? realTimeValue 
                         : p.value !== undefined ? p.value 
                         : (uiType === 'bool' ? false : (uiType === 'number' ? '' : ''))
          
          
          if (uiType === 'enum') {
            const idx = enumValues.indexOf(initVal)
            enumDisplay = idx >= 0 ? enumLabels[idx] : (enumLabels[0] || '')
          }
          // 提取单位信息
          const unit = (specs && specs.unit) ? specs.unit : ''
          
          // 步进器配置
          let stepperConfig = { min: 0, max: 100, step: 1 }
          if (p.identifier === 'volume' || p.name === '声音调节') {
            stepperConfig = { min: 0, max: 100, step: 10 }
          } else if (p.identifier === 'brightness' || p.identifier === 'screenBrightness' || p.name === '屏幕亮度调节') {
            stepperConfig = { min: 0, max: 4, step: 1 }
          }
          
          return {
            identifier: p.identifier,
            name: p.name || p.identifier,
            desc: p.desc || '',
            unit: unit, // 单位信息
            uiType,
            value: initVal,
            tempValue: initVal, // 临时值，用于用户输入
            enumLabels,
            enumValues,
            enumDisplay: uiType === 'enum' ? enumDisplay : '',
            tempEnumDisplay: uiType === 'enum' ? enumDisplay : '', // 临时枚举显示值
            // 步进器配置
            stepperMin: stepperConfig.min,
            stepperMax: stepperConfig.max,
            stepperStep: stepperConfig.step
          }
        })
        
        // 注入页面切换参数（仅KAT设备：类型1/2/4）
        if (this.isKatDevice) {
          mapped.push({
            identifier: 'pageSwitch',
            name: '页面切换',
            desc: '切换设备端显示页面',
            uiType: 'enum',
            unit: '',
            value: '1',
            tempValue: '1',
            enumLabels: ['首页', '日记', '周记', '月记', '个人信息'],
            enumValues: ['1', '2', '3', '4', '5'],
            enumDisplay: '首页',
            tempEnumDisplay: '首页',
            stepperMin: 0,
            stepperMax: 0,
            stepperStep: 1
          })
        }

        // 注入页面轮换开关（仅KAT设备）
        if (this.isKatDevice) {
          const rotationStorageKey = 'pageRotationState_' + (this.deviceInfo && this.deviceInfo.deviceKey || '')
          let rotationEnabled = false
          try {
            const stored = uni.getStorageSync(rotationStorageKey)
            if (stored && typeof stored === 'object') {
              rotationEnabled = !!stored.enabled
            }
          } catch (e) {}

          mapped.push({
            identifier: 'pageRotation',
            name: '页面轮换',
            desc: '开启后设备将自动轮换显示页面',
            uiType: 'bool',
            unit: '',
            value: rotationEnabled,
            tempValue: rotationEnabled,
            hidden: false,
            enumLabels: [],
            enumValues: [],
            enumDisplay: '',
            tempEnumDisplay: '',
            stepperMin: 0,
            stepperMax: 0,
            stepperStep: 1
          })

          // 注入5个页面停留时间输入框（默认隐藏）
          const pageNames = [
            { id: '1', name: '首页' },
            { id: '2', name: '日记' },
            { id: '3', name: '周记' },
            { id: '4', name: '月记' },
            { id: '5', name: '个人信息' }
          ]
          pageNames.forEach(page => {
            mapped.push({
              identifier: 'pageRotationTime_' + page.id,
              name: page.name + '停留时间',
              desc: '',
              uiType: 'number',
              unit: '秒',
              value: '',
              tempValue: '',
              hidden: !rotationEnabled,
              enumLabels: [],
              enumValues: [],
              enumDisplay: '',
              tempEnumDisplay: '',
              numberMin: 1,
              numberMax: 120,
              stepperMin: 1,
              stepperMax: 120,
              stepperStep: 1
            })
          })
        }

        this.$set(this, 'paramProps', mapped)
      } catch (e) {
        // 异常时至少保留KAT设备的页面切换+页面轮换参数
        if (this.isKatDevice) {
          const rotationStorageKey = 'pageRotationState_' + (this.deviceInfo && this.deviceInfo.deviceKey || '')
          let rotationEnabled = false
          try {
            const stored = uni.getStorageSync(rotationStorageKey)
            if (stored && typeof stored === 'object') {
              rotationEnabled = !!stored.enabled
            }
          } catch (e) {}

          const pageNames = [
            { id: '1', name: '首页' },
            { id: '2', name: '日记' },
            { id: '3', name: '周记' },
            { id: '4', name: '月记' },
            { id: '5', name: '个人信息' }
          ]
          const pageSwitchParam = {
            identifier: 'pageSwitch',
            name: '页面切换',
            desc: '切换设备端显示页面',
            uiType: 'enum',
            unit: '',
            value: '1',
            tempValue: '1',
            enumLabels: ['首页', '日记', '周记', '月记', '个人信息'],
            enumValues: ['1', '2', '3', '4', '5'],
            enumDisplay: '首页',
            tempEnumDisplay: '首页',
            stepperMin: 0,
            stepperMax: 0,
            stepperStep: 1
          }
          const rotationSwitchParam = {
            identifier: 'pageRotation',
            name: '页面轮换',
            desc: '开启后设备将自动轮换显示页面',
            uiType: 'bool',
            unit: '',
            value: rotationEnabled,
            tempValue: rotationEnabled,
            hidden: false,
            enumLabels: [],
            enumValues: [],
            enumDisplay: '',
            tempEnumDisplay: '',
            stepperMin: 0,
            stepperMax: 0,
            stepperStep: 1
          }
          const durationParams = pageNames.map(page => ({
            identifier: 'pageRotationTime_' + page.id,
            name: page.name + '停留时间',
            desc: '',
            uiType: 'number',
            unit: '秒',
            value: '',
            tempValue: '',
            hidden: !rotationEnabled,
            enumLabels: [],
            enumValues: [],
            enumDisplay: '',
            tempEnumDisplay: '',
            numberMin: 1,
            numberMax: 120,
            stepperMin: 1,
            stepperMax: 120,
            stepperStep: 1
          }))
          this.$set(this, 'paramProps', [pageSwitchParam, rotationSwitchParam, ...durationParams])
        } else {
          this.$set(this, 'paramProps', [])
        }
      }
    },
    
    // 加载AEP设备参数设置
    async loadAepParamSettings() {
      try {
        // 1. 先获取AEP设备信息
        const aepRes = await getAepDeviceInfo({
          productKey: this.deviceInfo.productKey,
          deviceKey: this.deviceInfo.deviceKey,
          imei: this.deviceInfo.imei
        })
        
        if (aepRes.code !== 200 || !aepRes.data) {
          this.$set(this, 'paramProps', [])
          return
        }
        
        this.aepDeviceId = aepRes.data.deviceId
        this.aepProductId = aepRes.data.productId
        
        // 2. 根据设备类型定义参数配置（参考 ParamAepSetDialog.vue）
        const deviceType = String(this.deviceInfo.deviceType)
        let paramConfigs = []
        
        // AEP设备参数配置（bool开关类型）
        if (deviceType === '15') {
          // 烟感设备参数
          paramConfigs = [
            { dpId: 1006, identifier: '报警消音', name: '报警消音', dpType: 'int', specs: { '0': '关闭', '1': '打开' } },
            { dpId: 1020, identifier: 'LED灯状态', name: 'LED灯状态', dpType: 'int', specs: { '0': '关闭', '1': '打开' } }
          ]
        } else if (deviceType === '16') {
          // 可燃气体设备参数
          paramConfigs = [
            { dpId: 1005, identifier: '报警', name: '报警', dpType: 'int', specs: { '0': '关', '1': '开' } },
            { dpId: 1006, identifier: '消音', name: '消音', dpType: 'int', specs: { '0': '关', '1': '开' } }
          ]
        } else if (deviceType === '19') {
          // 一氧化碳设备参数
          paramConfigs = [
            { dpId: 1005, identifier: '报警', name: '报警', dpType: 'int', specs: { '0': '关', '1': '开' } },
            { dpId: 1006, identifier: '消音', name: '消音', dpType: 'int', specs: { '0': '关', '1': '开' } }
          ]
        }
        
        // 3. 查询每个参数的当前值
        const paramList = []
        for (const config of paramConfigs) {
          let currentValue = false
          
          try {
            // 查询参数当前状态（指令已完成的）
            const statusRes = await queryParamsStatusByDpIdAndImei({
              dpId: config.dpId,
              imei: this.deviceInfo.imei,
              commandStatus: '指令已完成'
            })
            
            if (statusRes.code === 200 && statusRes.data) {
              // dpVal 为 1 表示开启
              currentValue = statusRes.data.dpVal == 1
            }
          } catch (err) {
            console.warn(`查询参数${config.identifier}失败:`, err)
          }
          
          paramList.push({
            identifier: config.identifier,
            dpId: config.dpId,
            name: config.name,
            desc: `${config.name}功能开关`,
            uiType: 'bool',
            dpType: config.dpType,
            specs: config.specs,
            value: currentValue,
            tempValue: currentValue
          })
        }
        
        this.$set(this, 'paramProps', paramList)
      } catch (e) {
        console.error('加载AEP设备参数失败:', e)
        this.$set(this, 'paramProps', [])
      }
    },
    
    // 切换报警设置
    toggleAlarm(alarm) {
      alarm.open = !alarm.open
      this.saveAlarmSettings()
    },
    
    // 保存报警设置
    async saveAlarmSettings() {
      try {
        const alarmSwitchStr = JSON.stringify(this.alarmSwitches)
        
        const response = await updateDevice({
          deviceId: this.deviceInfo.deviceId,
          deviceKey: this.deviceInfo.deviceKey,
          deviceAlias: this.deviceInfo.deviceAlias,
          remark: this.deviceInfo.remark || '',
          enableStatus: this.deviceInfo.enableStatus,
          defenseStatus: this.deviceInfo.defenseStatus,
          alarmSwitch: alarmSwitchStr
        })
        
        if (response.code === 200) {
          this.deviceInfo.alarmSwitch = alarmSwitchStr
          uni.showToast({
            title: '设置已保存',
            icon: 'success'
          })
        } else {
          uni.showToast({
            title: response.msg || '保存失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('保存报警设置失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
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
          this.loadDeviceDetail() // 重新加载设备详情
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
    },
    
    // 显示跌倒缓冲时长说明
    showFallBufferTip() {
      uni.showModal({
        title: '跌倒误报缓冲时长',
        content: '设备检测到跌倒事件后，将等待该时长再判断是否真实跌倒，以减少误报。设为 0 表示不缓冲、立即上报报警。',
        showCancel: false,
        confirmText: '知道了'
      })
    },

    // 保存业务参数
    async saveBusinessParams() {
      const sec = Number(this.fallFalseAlarmBufferSec)
      if (isNaN(sec) || sec < 0) {
        uni.showToast({ title: '请输入有效的缓冲时长', icon: 'none' })
        return
      }
      this.businessParamsSaving = true
      try {
        const response = await updateDevice({
          deviceId: this.deviceInfo.deviceId,
          productKey: this.deviceInfo.productKey,
          deviceKey: this.deviceInfo.deviceKey,
          businessParams: JSON.stringify({ fallFalseAlarmBufferSec: sec })
        })
        if (response.code === 200) {
          this.deviceInfo.businessParams = JSON.stringify({ fallFalseAlarmBufferSec: sec })
          uni.showToast({ title: '业务参数已保存', icon: 'success' })
        } else {
          uni.showToast({ title: response.msg || '保存失败', icon: 'none' })
        }
      } catch (e) {
        uni.showToast({ title: '网络错误', icon: 'none' })
      } finally {
        this.businessParamsSaving = false
      }
    },

    // 删除设备
    deleteDevice() {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除设备"${this.deviceInfo.deviceAlias || this.deviceInfo.deviceKey}"吗？删除后无法恢复。`,
        success: async (res) => {
          if (res.confirm) {
            await this.performDeleteDevice()
          }
        }
      })
    },
    
    // 执行删除设备
    async performDeleteDevice() {
      try {
        uni.showLoading({ title: '删除中...' })
        
        const response = await delDevice(this.deviceId)
        
        if (response.code === 200) {
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } else {
          uni.showToast({
            title: response.msg || '删除失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('删除设备失败:', error)
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
@import '@/static/fontA/iconfont.css';

.device-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24rpx;
}

/* Device Info Card */
.device-info-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 24rpx;
}

.info-header {
  display: flex;
  align-items: flex-start;
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.device-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  background: #3ec6c6;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 16rpx rgba(62, 198, 198, 0.2);
  overflow: hidden;
  flex-shrink: 0;
  
  &.has-icon {
    background: transparent;
    box-shadow: none;
    border: none;
  }
  
  .avatar-img {
    width: 120rpx;
    height: 120rpx;
  }
  
  .avatar-text {
    font-size: 48rpx;
    color: #fff;
    font-weight: 600;
  }
}

.device-basic {
  flex: 1;
}

.name-row {
  margin-bottom: 12rpx;
}

.device-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.tags-row {
  display: flex;
  gap: 12rpx;
}

.device-tag {
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  font-weight: 500;
  
  &.type-tag {
    background: rgba(62, 198, 198, 0.1);
    color: #3ec6c6;
  }
  
  &.status-tag {
    display: flex;
    align-items: center;
    gap: 8rpx;
    
    .status-dot {
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
    }
    
    &.online {
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
      .status-dot { background: #4CAF50; }
    }
    
    &.offline {
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
      .status-dot { background: #f44336; }
    }
  }
  
  &.monitor-tag {
    &.not-monitored {
      background: rgba(158, 158, 158, 0.1);
      color: #9e9e9e;
    }
    
    &.package-monitoring {
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
    }
    
    &.apply-monitoring {
      background: rgba(33, 150, 243, 0.1);
      color: #2196F3;
    }
    
    &.apply-reviewing {
      background: rgba(255, 152, 0, 0.1);
      color: #FF9800;
    }
  }
}

.info-list {
  padding-top: 24rpx;
  border-top: 2rpx dashed #f0f0f0;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .info-label {
    font-size: 26rpx;
    color: #999;
  }
  
  .info-value {
    font-size: 26rpx;
    color: #333;
    font-family: monospace;
  }
}

/* Control Section */
.section-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 32rpx;
}

.section-title-bar {
  width: 6rpx;
  height: 28rpx;
  background: #3ec6c6;
  border-radius: 4rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.control-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.control-left {
  flex: 1;
}

.defense-switch {
  transform: scale(0.9);
}

.control-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.control-subtitle {
  font-size: 24rpx;
  color: #999;
}

/* Function Grid */
.function-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.function-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  
  &:active {
    transform: scale(0.98);
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  
  &.danger-text {
    color: #f56c6c;
  }
}

.card-subtitle {
  font-size: 22rpx;
  color: #999;
}

.card-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  &.cyan-bg {
    background: rgba(62, 198, 198, 0.08);
  }
  
  &.red-bg {
    background: rgba(245, 108, 108, 0.08);
  }
}

/* Popup Styles (Preserved) */
.popup-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  align-items: center;
  padding: 0 0 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  flex: 1;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  /* 为了视觉绝对居中，添加左内边距抵消右侧图标宽度 */
  padding-left: 48rpx;
}

.setting-scroll {
  width: 100%;
}

/* 报警逻辑说明 */
.alarm-logic-tip {
  background: linear-gradient(135deg, #fff7e6 0%, #fffbf0 100%);
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid #ffe7ba;
  
  .tip-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 16rpx;
    
    .tip-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #ff9800;
    }
  }
  
  .tip-content {
    display: flex;
    flex-direction: column;
    gap: 8rpx;
    
    .tip-item {
      font-size: 24rpx;
      color: #d68910;
      line-height: 1.6;
      padding-left: 16rpx;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: 4rpx;
        top: 10rpx;
        width: 6rpx;
        height: 6rpx;
        background: #ff9800;
        border-radius: 50%;
      }
    }
  }
}

.setting-list {
  padding-top: 16rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.alarm-item-wrapper {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16rpx;
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.setting-desc {
  font-size: 22rpx;
  color: #999;
}

.setting-switch {
  transform: scale(0.9);
}

/* 报警方式按钮组 */
.alarm-methods {
  padding-top: 16rpx;
  border-top: 1rpx dashed #e0e0e0;
}

.method-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.method-buttons {
  display: flex;
  gap: 16rpx;
}

.method-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 16rpx 8rpx;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  transition: all 0.3s;
  
  text {
    font-size: 22rpx;
    color: #666;
  }
  
  &.active {
    background: rgba(62, 198, 198, 0.08);
    border-color: #3ec6c6;
    
    text {
      color: #3ec6c6;
      font-weight: 500;
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
}

/* Setting List Styles */
.setting-scroll {
  width: 100%;
}

/* Param Settings Styles */
.param-setting-scroll {
  width: 100%;
}

.param-setting-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  padding: 32rpx 0;
}

.param-setting-item {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
}

.param-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.param-name-container {
  display: flex;
  align-items: center;
  gap: 4rpx;
  white-space: nowrap;
}

.param-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.param-unit {
  font-size: 24rpx;
  color: #666;
}

.param-value-container {
  display: flex;
  align-items: center;
  gap: 16rpx;
  justify-content: flex-end;
}

.param-value-input {
  width: 200rpx;
  height: 64rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  background: #fff;
  box-sizing: border-box;
  flex-shrink: 0;
}

.param-value-picker {
  width: 200rpx;
  height: 64rpx;
  line-height: 64rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 0 16rpx;
  font-size: 26rpx;
  background: #fff;
  color: #333;
  flex-shrink: 0;
}

.param-switch {
  transform: scale(1.1);
}

/* 步进器样式 */
.stepper-container {
  display: flex;
  align-items: center;
  background: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  overflow: hidden;
  
  .stepper-btn {
    width: 64rpx;
    height: 64rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    
    text {
      font-size: 36rpx;
      color: #333;
      font-weight: bold;
    }
    
    &.minus {
      border-right: 2rpx solid #e0e0e0;
    }
    
    &.plus {
      border-left: 2rpx solid #e0e0e0;
    }
    
    &.disabled {
      opacity: 0.4;
      
      text {
        color: #999;
      }
    }
    
    &:active:not(.disabled) {
      background: #e8e8e8;
    }
  }
  
  .stepper-value {
    min-width: 80rpx;
    text-align: center;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    padding: 0 16rpx;
  }
}

.param-set-btn {
  background: #3ec6c6;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  height: 64rpx;
  line-height: 64rpx;
}

/* Edit Device Popup */
.add-device-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .popup-header {
    background: #fafafa;
    padding: 32rpx;
  }
  
  .popup-content {
    padding: 32rpx;
  }
}

.form-item {
  margin-bottom: 32rpx;
  &:last-child { margin-bottom: 0; }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
  
  &.required::after {
    content: '*';
    color: #f44336;
    margin-left: 4rpx;
  }
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
  
  &.disabled {
    background: #f5f5f5;
    color: #999;
  }
  
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
}

/* 业务配置模块 */
.business-config-section {
  background: #f0f9ff;
  border: 2rpx solid #bae6fd;
  border-radius: 16rpx;
  padding: 28rpx 24rpx 20rpx;
  margin-bottom: 8rpx;
}

.business-config-header {
  margin-bottom: 6rpx;
}

.business-config-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #0369a1;
}

.business-config-desc {
  font-size: 22rpx;
  color: #94a3b8;
  display: block;
  margin-bottom: 20rpx;
}

.business-config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.business-config-label {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.business-stepper-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-shrink: 0;
}

/* 紧凑步进器 */
.biz-stepper {
  display: flex;
  align-items: center;
  border: 2rpx solid #bae6fd;
  border-radius: 8rpx;
  overflow: hidden;
  background: #fff;
  height: 56rpx;
}

.biz-stepper-btn {
  width: 48rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0f2fe;

  text {
    font-size: 30rpx;
    color: #0369a1;
    font-weight: 600;
    line-height: 1;
  }

  &.disabled {
    opacity: 0.35;
  }

  &:active:not(.disabled) {
    background: #bae6fd;
  }
}

.biz-stepper-input {
  width: 80rpx;
  height: 56rpx;
  text-align: center;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  border: none;
  background: #fff;
  padding: 0;
}

.business-config-hint {
  font-size: 22rpx;
  color: #94a3b8;
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 50%;
  text-align: center;
  line-height: 36rpx;
}

.business-save-btn {
  width: 100%;
  height: 72rpx;
  line-height: 72rpx;
  background: #3ec6c6;
  color: #fff;
  border: none;
  border-radius: 8rpx;
  font-size: 26rpx;
}

/* Loading Mask */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  
  .loading-text {
    margin-top: 16rpx;
    font-size: 24rpx;
    color: #666;
  }
}

/* 申请监控弹窗 */
.apply-monitor-popup {
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }
  
  .popup-body {
    padding: 32rpx;
  }
  
  .popup-footer {
    flex-direction: row-reverse;
  }
}

/* AEP实时检测弹窗 */
.aep-realtime-popup {
  width: 560rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }
  }
}

.aep-realtime-body {
  padding: 32rpx;
  min-height: 200rpx;
}

.aep-realtime-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 40rpx 0;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}

.aep-realtime-content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.aep-realtime-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }
}

.aep-realtime-label {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.aep-realtime-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
}

.aep-battery-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.aep-battery-bar {
  width: 120rpx;
  height: 20rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
  position: relative;
}

.aep-battery-fill {
  height: 100%;
  border-radius: 10rpx;
  transition: width 0.3s ease;
}

</style>