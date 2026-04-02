<template>
	<view class="review-modal" v-if="visible" @click="handleClose">
		<view class="review-content" :class="{ 'view-mode': mode === 'view' }" @click.stop>
			<view class="review-header">
				<text class="review-title">{{ getModalTitle }}</text>
				<view class="close-btn" @click="handleClose">
					<uni-icons type="close" size="24" color="#999"></uni-icons>
				</view>
			</view>
			
			<view class="review-body">
				<!-- 订单信息 -->
				<view class="review-order-info" v-if="orderInfo">
					<image :src="orderInfo.icon" class="order-icon" mode="aspectFill"></image>
					<view class="order-detail">
						<text class="order-service-name">{{ orderInfo.serviceName }}</text>
						<text class="order-provider" v-if="orderInfo.providerName">服务商：{{ orderInfo.providerName }}</text>
					</view>
				</view>
				
				<!-- 查看模式 -->
				<template v-if="mode === 'view'">
					<!-- 评分展示 -->
					<view class="review-item">
						<text class="review-label">服务评分</text>
						<view class="star-rating-wrapper">
							<view class="star-rating">
<uni-icons
                                    v-for="star in [1,2,3,4,5]"
                                    :key="star"
                                    :type="star <= rating ? 'star-filled' : 'star'"
                                    size="28"
                                    :color="star <= rating ? '#FFB400' : '#E0E0E0'"
                                ></uni-icons>
							</view>
							<text class="rating-desc">{{ getRatingDesc(rating) }}</text>
						</view>
					</view>
					
					<!-- 评价内容展示 -->
					<view class="review-item" v-if="content">
						<text class="review-label">评价内容</text>
						<view class="review-content-box">
							<text class="review-text">{{ content }}</text>
						</view>
					</view>
					
					<!-- 评价图片展示 -->
					<view class="review-item" v-if="localImages && localImages.length > 0">
						<text class="review-label">评价图片</text>
						<view class="image-grid">
							<image
								v-for="(img, index) in localImages"
								:key="index"
								:src="getImageUrl(img)"
								class="review-image"
								mode="aspectFill"
								@click="handlePreviewImage(index)"
							></image>
						</view>
					</view>
					
					<!-- 评价时间 -->
					<view class="review-time" v-if="createTime">
						<text>评价时间：{{ createTime }}</text>
					</view>
				</template>
				
				<!-- 编辑模式 -->
				<template v-else>
					<!-- 评分 -->
					<view class="review-item">
						<text class="review-label">服务评分</text>
						<view class="star-rating-wrapper">
							<view class="star-rating">
<uni-icons
                                    v-for="star in [1,2,3,4,5]"
                                    :key="star"
                                    :type="star <= rating ? 'star-filled' : 'star'"
                                    size="32"
                                    :color="star <= rating ? '#FFB400' : '#E0E0E0'"
                                    @click="handleSetRating(star)"
                                ></uni-icons>
							</view>
							<text class="rating-desc">{{ getRatingDesc(rating) }}</text>
						</view>
					</view>
					
					<!-- 评价内容 -->
					<view class="review-item">
						<text class="review-label">评价内容</text>
						<textarea
							:value="content"
							@input="handleContentInput"
							class="review-textarea"
							placeholder="请描述您对本次服务的评价（选填）"
							maxlength="200"
							:auto-height="true"
						></textarea>
						<text class="char-count">{{ content.length }}/200</text>
					</view>
					
					<!-- 上传图片 -->
					<view class="review-item">
						<text class="review-label">上传图片（选填）</text>
						<view class="image-upload-grid">
							<!-- 已上传的图片 -->
							<view
								v-for="(img, index) in localImages"
								:key="index"
								class="image-item"
							>
								<image :src="getImageUrl(img)" class="upload-image" mode="aspectFill" @click="handlePreviewImage(index)"></image>
								<view class="delete-btn" @click.stop="handleDeleteImage(index)">
									<uni-icons type="close" size="16" color="#fff"></uni-icons>
								</view>
							</view>
							
							<!-- 上传按钮 -->
							<view
								v-if="localImages.length < maxImages"
								class="image-item upload-btn"
								@click="handleChooseImage"
							>
								<uni-icons type="camera-filled" size="40" color="#ccc"></uni-icons>
								<text class="upload-text">{{ localImages.length }}/{{ maxImages }}</text>
							</view>
						</view>
					</view>
				</template>
			</view>
			
			<view class="review-footer">
				<template v-if="mode === 'view'">
					<button class="submit-btn full" @click="handleClose">关闭</button>
				</template>
				<template v-else>
					<button class="cancel-btn" @click="handleClose">取消</button>
					<button class="submit-btn" @click="handleSubmit" :loading="submitting">提交评价</button>
				</template>
			</view>
		</view>
	</view>
</template>

<script>
	import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'
	
	export default {
		name: 'ReviewModal',
		components: {
			'uni-icons': uniIcons
		},
		props: {
			visible: {
				type: Boolean,
				default: false
			},
			mode: {
				type: String,
				default: 'edit', // 'edit' 或 'view'
				validator: (value) => ['edit', 'view'].includes(value)
			},
			isAppend: {
				type: Boolean,
				default: false
			},
			orderInfo: {
				type: Object,
				default: null
			},
			rating: {
				type: Number,
				default: 0
			},
			content: {
				type: String,
				default: ''
			},
			createTime: {
				type: String,
				default: ''
			},
			images: {
				type: Array,
				default: () => []
			},
			submitting: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				baseUrl: require('@/config.js').baseUrl,
				maxImages: 5,
				localImages: []
			}
		},
		watch: {
			images: {
				handler(newVal) {
					console.log('images prop 变化:', newVal)
					this.localImages = newVal || []
				},
				immediate: true,
				deep: true
			},
			visible(newVal) {
				if (!newVal) {
					this.localImages = []
				}
			}
		},
		methods: {
			handleClose() {
				this.$emit('close')
			},
			
			handleSetRating(star) {
				this.$emit('update:rating', star)
			},
			
			handleContentInput(e) {
				this.$emit('update:content', e.detail.value)
			},
			
			handleSubmit() {
				if (!this.rating || this.rating < 1) {
					uni.showToast({
						title: '请先选择星级评分',
						icon: 'none'
					})
					return
				}
				this.$emit('submit')
			},
			
			handleChooseImage() {
				const remainCount = this.maxImages - this.localImages.length
				if (remainCount <= 0) {
					uni.showToast({
						title: `最多上传${this.maxImages}张图片`,
						icon: 'none'
					})
					return
				}
				
				uni.chooseImage({
					count: remainCount,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const newImages = this.localImages.concat(res.tempFilePaths)
						this.localImages = newImages
						this.$emit('update:images', newImages)
					},
					fail: (err) => {
						console.error('选择图片失败:', err)
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						})
					}
				})
			},
			
			handleDeleteImage(index) {
				uni.showModal({
					title: '提示',
					content: '确定删除这张图片吗？',
					success: (res) => {
						if (res.confirm) {
							const newImages = this.localImages.filter((_, i) => i !== index)
							this.localImages = newImages
							this.$emit('update:images', newImages)
						}
					}
				})
			},
			
			handlePreviewImage(index) {
				uni.previewImage({
					current: this.getImageUrl(this.localImages[index]),
					urls: this.localImages.map(img => this.getImageUrl(img))
				})
			},
			
			getImageUrl(img) {
				if (!img) return ''
				if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('wxfile://') || img.startsWith('blob:')) {
					return img
				}
				return this.baseUrl + img
			},
			
			getRatingDesc(rating) {
				const descMap = {
					1: '非常不满意',
					2: '不满意',
					3: '一般',
					4: '满意',
					5: '非常满意'
				}
				return descMap[rating] || ''
			}
		},
		computed: {
			getModalTitle() {
				if (this.mode === 'view') return '我的评价'
				return this.isAppend ? '再次评价' : '服务评价'
			}
		}
	}
</script>

<style lang="scss" scoped>
	.review-modal {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(4px);
		
		.review-content {
			width: 600rpx;
			max-height: 80vh;
			background: #fff;
			border-radius: 32rpx;
			overflow: hidden;
			box-shadow: 0 12rpx 48rpx rgba(0, 0, 0, 0.15);
			animation: modalShow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
			display: flex;
			flex-direction: column;
			
			&.view-mode {
				.review-body {
					max-height: none;
				}
			}
			
			@keyframes modalShow {
				from { transform: scale(0.9); opacity: 0; }
				to { transform: scale(1); opacity: 1; }
			}
			
			.review-header {
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 32rpx 40rpx;
				border-bottom: 2rpx solid #f7f8fa;
				flex-shrink: 0;
				position: relative;
				
				.review-title {
					font-size: 34rpx;
					font-weight: bold;
					color: #333;
				}
				
				.close-btn {
					position: absolute;
					right: 40rpx;
					top: 50%;
					transform: translateY(-50%);
					padding: 8rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
				}
			}
			
			.review-body {
				padding: 40rpx;
				overflow-y: auto;
				flex: 1;
				
				.review-order-info {
					display: flex;
					align-items: center;
					gap: 20rpx;
					padding: 24rpx;
					background: #f7f8fa;
					border-radius: 16rpx;
					margin-bottom: 32rpx;
					
					.order-icon {
						width: 80rpx;
						height: 80rpx;
						border-radius: 12rpx;
						flex-shrink: 0;
						background: #fff;
					}
					
					.order-detail {
						flex: 1;
						display: flex;
						flex-direction: column;
						gap: 8rpx;
						
						.order-service-name {
							font-size: 28rpx;
							font-weight: 600;
							color: #333;
						}
						
						.order-provider {
							font-size: 24rpx;
							color: #999;
						}
					}
				}
				
				.review-item {
					margin-bottom: 40rpx;
					
					&:last-child {
						margin-bottom: 0;
					}
					
					.review-label {
						display: block;
						font-size: 28rpx;
						color: #666;
						margin-bottom: 20rpx;
						font-weight: 500;
					}
					
					.star-rating-wrapper {
						display: flex;
						flex-direction: column;
						align-items: center;
						gap: 16rpx;
						
						.star-rating {
							display: flex;
							gap: 16rpx;
						}
						
						.rating-desc {
							font-size: 26rpx;
							color: #FFB400;
							font-weight: 600;
						}
					}
					
					
					.review-textarea {
						width: 100%;
						min-height: 200rpx;
						padding: 24rpx;
						border: none;
						background: #f7f8fa;
						border-radius: 16rpx;
						font-size: 28rpx;
						line-height: 1.6;
						box-sizing: border-box;
						color: #333;
						
						&::placeholder {
							color: #bbb;
						}
					}
					
					.char-count {
						display: block;
						font-size: 24rpx;
						color: #ccc;
						text-align: right;
						margin-top: 12rpx;
					}
					
					.review-content-box {
						background: #f7f8fa;
						padding: 24rpx;
						border-radius: 16rpx;
						
						.review-text {
							font-size: 28rpx;
							color: #333;
							line-height: 1.6;
							word-break: break-all;
						}
					}
				}
				
				.image-grid,
				.image-upload-grid {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					gap: 16rpx;
					
					.review-image {
						width: 100%;
						height: 160rpx;
						border-radius: 12rpx;
						object-fit: cover;
					}
					
					.image-item {
						position: relative;
						width: 100%;
						height: 160rpx;
						border-radius: 12rpx;
						overflow: hidden;
						
						.upload-image {
							width: 100%;
							height: 100%;
							object-fit: cover;
						}
						
						.delete-btn {
							position: absolute;
							top: 8rpx;
							right: 8rpx;
							width: 40rpx;
							height: 40rpx;
							background: rgba(0, 0, 0, 0.6);
							border-radius: 50%;
							display: flex;
							align-items: center;
							justify-content: center;
							z-index: 10;
						}
					}
					
					.upload-btn {
						background: #f7f8fa;
						border: 2rpx dashed #ddd;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						gap: 8rpx;
						
						.upload-text {
							font-size: 22rpx;
							color: #999;
						}
					}
				}
				
				.review-time {
					text-align: center;
					padding-top: 24rpx;
					margin-top: 24rpx;
					border-top: 1rpx dashed #e5e5e5;
					
					text {
						font-size: 24rpx;
						color: #999;
					}
				}
			}
			
			.review-footer {
				display: flex;
				gap: 24rpx;
				padding: 24rpx 40rpx 40rpx;
				flex-shrink: 0;
				
				button {
					flex: 1;
					height: 88rpx;
					line-height: 88rpx;
					border-radius: 100rpx;
					font-size: 30rpx;
					font-weight: 600;
					border: none;
					
					&::after { border: none; }
					
					&.cancel-btn {
						background: #f5f5f5;
						color: #666;
					}
					
					&.submit-btn {
						background: linear-gradient(135deg, #3ec6c6 0%, #2bb3b3 100%);
						color: #fff;
						box-shadow: 0 6rpx 16rpx rgba(62, 198, 198, 0.25);
						
						&.full {
							flex: 1;
						}
					}
				}
			}
		}
	}
</style>
