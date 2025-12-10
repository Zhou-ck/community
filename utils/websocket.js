/**
 * WebSocket 管理类
 * 功能：连接管理、心跳机制、消息订阅/分发、断线重连
 */
import config from '@/config.js'
import { getToken } from '@/utils/auth.js'

class WebSocketManager {
	constructor() {
		this.ws = null // WebSocket 实例
		this.isConnected = false // 连接状态
		this.reconnectTimer = null // 重连定时器
		this.heartbeatTimer = null // 心跳定时器
		this.reconnectAttempts = 0 // 重连尝试次数
		this.maxReconnectAttempts = 10 // 最大重连次数
		this.heartbeatInterval = 30000 // 心跳间隔 30秒（保持连接活跃，防止超时断开）
		this.reconnectDelay = 5000 // 重连延迟 5秒（避免频繁重连给服务器带来压力）
		this.listeners = {} // 消息监听器
		this.userId = null // 用户ID
		this.manualClose = false // 是否手动关闭
	}

	/**
	 * 连接 WebSocket
	 * @param {String} userId - 用户ID
	 */
	connect(userId) {
		if (!userId) {
			console.error('[WebSocket] 用户ID不能为空')
			return
		}

		// 如果已连接，先关闭
		if (this.ws) {
			this.close()
		}

		this.userId = userId
		this.manualClose = false

		// 构建 WebSocket URL
		const wsUrl = this.getWebSocketUrl(userId)
		console.log('[WebSocket] 开始连接:', wsUrl)

		try {
			// 创建 WebSocket 连接
			this.ws = uni.connectSocket({
				url: wsUrl,
				success: () => {
					console.log('[WebSocket] ✅ 连接请求已发出')
				},
				fail: (err) => {
					console.error('[WebSocket] ❌ 连接请求失败:', JSON.stringify(err))
					this.handleReconnect()
				}
			})

			// 监听连接打开
			this.ws.onOpen(() => {
				console.log('[WebSocket] ✅ 连接已成功建立')
				this.isConnected = true
				this.reconnectAttempts = 0
				
				// 发送初始化消息（如果后端需要）
				const token = getToken()
				if (token) {
					const authMessage = {
						type: 'ping',
						token: token,
						userId: this.userId,
						timestamp: Date.now()
					}
					console.log('[WebSocket] 发送认证消息:', authMessage)
					this.send(authMessage)
				}
				
				this.startHeartbeat()
				this.notifyStatusChange('connected')
			})

			// 监听消息接收
			this.ws.onMessage((res) => {
				this.handleMessage(res.data)
			})

			// 监听连接错误
			this.ws.onError((err) => {
				console.error('[WebSocket] ❌ 连接发生错误:', JSON.stringify(err))
				this.isConnected = false
				this.notifyStatusChange('error')
			})

			// 监听连接关闭
			this.ws.onClose((res) => {
				console.log('[WebSocket] ⚫ 连接已关闭')
				console.log('[WebSocket] 关闭码:', res.code)
				console.log('[WebSocket] 关闭原因:', res.reason || '未提供')
				
				// 常见关闭码说明
				const closeCodeMap = {
					1000: '正常关闭',
					1001: '端点离开',
					1002: '协议错误',
					1003: '不支持的数据类型',
					1006: '连接异常关闭（通常是网络问题或服务器未响应）',
					1011: '服务器错误',
					1012: '服务重启',
					1013: '稍后重试',
					1014: '网关错误',
					1015: 'TLS握手失败'
				}
				
				if (closeCodeMap[res.code]) {
					console.log('[WebSocket] 关闭说明:', closeCodeMap[res.code])
				}
				
				this.isConnected = false
				this.stopHeartbeat()
				this.notifyStatusChange('closed')

				// 如果不是手动关闭，尝试重连
				if (!this.manualClose) {
					this.handleReconnect()
				}
			})
		} catch (error) {
			console.error('[WebSocket] 连接异常:', error)
			this.handleReconnect()
		}
	}

	/**
	 * 构建 WebSocket URL
	 * @param {String} userId - 用户ID
	 * @returns {String} WebSocket URL
	 */
	getWebSocketUrl(userId) {
		let baseUrl = config.baseUrl
		
		// 将 http/https 转换为 ws/wss
		if (baseUrl.startsWith('https://')) {
			baseUrl = baseUrl.replace('https://', 'wss://')
		} else if (baseUrl.startsWith('http://')) {
			baseUrl = baseUrl.replace('http://', 'ws://')
		}

		// 获取 token
		const token = getToken()
		
		// 构建基础 URL
		let wsUrl = `${baseUrl}/websocket/message/${userId}`
		
		// 如果有 token，添加到 URL 参数中
		if (token) {
			wsUrl += `?token=${encodeURIComponent(token)}`
			console.log('[WebSocket] 已添加 token 到连接 URL')
		} else {
			console.warn('[WebSocket] ⚠️ 未找到 token，可能导致连接被拒绝')
		}

		return wsUrl
	}

	/**
	 * 发送消息
	 * @param {Object} message - 消息对象
	 */
	send(message) {
		if (!this.isConnected) {
			console.warn('[WebSocket] 未连接，无法发送消息')
			return false
		}

		try {
			const data = typeof message === 'string' ? message : JSON.stringify(message)
			this.ws.send({
				data,
				success: () => {
					console.log('[WebSocket] 消息发送成功:', data)
				},
				fail: (err) => {
					console.error('[WebSocket] 消息发送失败:', err)
				}
			})
			return true
		} catch (error) {
			console.error('[WebSocket] 发送消息异常:', error)
			return false
		}
	}

	/**
	 * 处理接收到的消息
	 * @param {String} data - 消息数据
	 */
	handleMessage(data) {
		try {
			const message = typeof data === 'string' ? JSON.parse(data) : data
			console.log('[WebSocket] 收到消息:', message)

			// 处理心跳响应
			if (message.type === 'pong') {
				console.log('[WebSocket] 收到心跳响应')
				return
			}

			// 分发消息给监听器
			this.notifyListeners(message)
		} catch (error) {
			console.error('[WebSocket] 消息解析失败:', error, data)
		}
	}

	/**
	 * 启动心跳
	 */
	startHeartbeat() {
		this.stopHeartbeat()
		
		this.heartbeatTimer = setInterval(() => {
			if (this.isConnected) {
				console.log('[WebSocket] 发送心跳')
				this.send({ type: 'ping' })
			}
		}, this.heartbeatInterval)
	}

	/**
	 * 停止心跳
	 */
	stopHeartbeat() {
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer)
			this.heartbeatTimer = null
		}
	}

	/**
	 * 处理重连
	 */
	handleReconnect() {
		// 清除之前的重连定时器
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}

		// 超过最大重连次数，停止重连
		if (this.reconnectAttempts >= this.maxReconnectAttempts) {
			console.error('[WebSocket] 达到最大重连次数，停止重连')
			this.notifyStatusChange('failed')
			return
		}

		this.reconnectAttempts++
		
		// 指数退避算法：2^n * reconnectDelay，最长30秒
		const delay = Math.min(
			this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
			30000
		)

		console.log(`[WebSocket] ${delay}ms 后进行第 ${this.reconnectAttempts} 次重连`)
		this.notifyStatusChange('reconnecting')

		this.reconnectTimer = setTimeout(() => {
			if (this.userId && !this.manualClose) {
				this.connect(this.userId)
			}
		}, delay)
	}

	/**
	 * 订阅消息
	 * @param {String} type - 消息类型
	 * @param {Function} callback - 回调函数
	 * @returns {Function} 取消订阅函数
	 */
	subscribe(type, callback) {
		if (!this.listeners[type]) {
			this.listeners[type] = []
		}
		
		this.listeners[type].push(callback)
		console.log(`[WebSocket] 订阅消息类型: ${type}`)

		// 返回取消订阅函数
		return () => {
			this.unsubscribe(type, callback)
		}
	}

	/**
	 * 取消订阅
	 * @param {String} type - 消息类型
	 * @param {Function} callback - 回调函数
	 */
	unsubscribe(type, callback) {
		if (!this.listeners[type]) return

		const index = this.listeners[type].indexOf(callback)
		if (index > -1) {
			this.listeners[type].splice(index, 1)
			console.log(`[WebSocket] 取消订阅消息类型: ${type}`)
		}
	}

	/**
	 * 通知监听器
	 * @param {Object} message - 消息对象
	 */
	notifyListeners(message) {
		const { type } = message
		
		// 通知特定类型的监听器
		if (this.listeners[type]) {
			this.listeners[type].forEach(callback => {
				try {
					callback(message)
				} catch (error) {
					console.error('[WebSocket] 监听器执行出错:', error)
				}
			})
		}

		// 通知所有消息监听器
		if (this.listeners['*']) {
			this.listeners['*'].forEach(callback => {
				try {
					callback(message)
				} catch (error) {
					console.error('[WebSocket] 全局监听器执行出错:', error)
				}
			})
		}
	}

	/**
	 * 通知连接状态变化
	 * @param {String} status - 连接状态
	 */
	notifyStatusChange(status) {
		if (this.listeners['status']) {
			this.listeners['status'].forEach(callback => {
				try {
					callback(status)
				} catch (error) {
					console.error('[WebSocket] 状态监听器执行出错:', error)
				}
			})
		}
	}

	/**
	 * 关闭连接
	 */
	close() {
		this.manualClose = true
		this.stopHeartbeat()

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
		}

		if (this.ws) {
			try {
				this.ws.close()
			} catch (error) {
				console.error('[WebSocket] 关闭连接异常:', error)
			}
			this.ws = null
		}

		// 清空所有监听器，防止内存泄漏和消息误触发
		this.listeners = {}

		this.isConnected = false
		this.reconnectAttempts = 0
		console.log('[WebSocket] 连接已手动关闭，所有监听器已清空')
	}

	/**
	 * 获取连接状态
	 * @returns {Boolean} 是否已连接
	 */
	getStatus() {
		return this.isConnected
	}
}

// 导出单例
export default new WebSocketManager()
