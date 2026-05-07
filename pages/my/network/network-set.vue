<template>
	<view style="padding: 20rpx;">
		<!-- 提示信息 -->
		<view class="notice">
			<view class="notice-text" > *注：手机需开启WiFi功能，Android手机还需开启 定位 功能。</view>
			<view class="notice-text" > *注：仅支持连接2.4GHz频段的WiFi 。</view>
		</view>

		<view>
			<!-- 底部弹窗 -->
			<view class="popup-content">
				<!-- 配置WiFi名称 -->
				<view class="form-group-name">
					<label style="width: 100px;white-space: nowrap">
						<text class="form-group-name-xing">*</text>
						<text class="form-group-name-zi" style="white-space: nowrap">WiFi名称：</text>
					</label>
					<input class="form-group-name-hint" type="text" id="wifiName" v-model="wifiName" placeholder="请输入WiFi名称" />
					<view class="form-group-name-wifi" @click="getCurrentWiFi()">获取当前WiFi</view>
				</view>
				<!-- 配置WiFi密码 -->
				<view class="form-group-name">
					<label  style="width: 100px;white-space: nowrap">
						<text class="form-group-name-ps" style="white-space: nowrap">WiFi密码：</text>
					</label>
					<!-- <input class="form-group-name-hint" :type="showPassword ? 'text' : 'password'" id="wifiPassword" v-model="wifiPassword" placeholder="请输入密码" /> -->
					<input class="form-group-name-hint" type="text" v-show="showPassword" id="wifiPassword" v-model="wifiPassword" placeholder="请输入密码" />
					<input class="form-group-name-hint" type="password" v-show="!showPassword" id="wifiPassword" v-model="wifiPassword" placeholder="请输入密码" />
					<image class="form-group-name-eye"  :src="showPassword ? '../../static/eye-close.svg' : '../../static/eye.svg'" @click="togglePasswordVisibility"/>
				</view>
				<!-- WiFi配置 -->
				<view class="form-group-configuration" @click="useHistoryWifiInfo()" > 使用上次配置的WiFi名称和密码 </view>
			</view>
			
			<!-- 最后的确定 -->
			<view style="display: flex;margin-top: 20px;">
				<button style="width: 300rpx;white-space: nowrap;" type="warn" @click="reSetNetService()">重置设备网络</button>
				<button style="width: 300rpx;white-space: nowrap;" type="primary" @click="initWifiConfirmTwo()">确定</button>
			</view>
		</view>

	</view>
</template>

<script>
	import {getDeviceLists, addDevice} from '@/api/system/devicenew'
	import { deviceServiceDebug } from '@/api/system/controls.js'
	export default {
		data() {
			return {
				isUnloaded: false, // 新增卸载标志
				resresresTryCount: 1,
				wifiName: null, //wifi名字
				wifiPassword: null, //wifi密码
				loading: false,
				deviceInfo:null,
				deviceBSSID:'',//设备的8266名字
				addDeviceFlag:false,//添加设备处跳转的标志
				tcpFlag: false, //用于是否判断与设备建立tcp连接
				wifiFlag: false, //用于是否判断与设备建立wifi连接
				initWifiFlag: false,//初始化WiFi
				showPassword: false,  // 控制密码可见性的标志
				tcp:null,//tcp实例
				isWifiActive: true, // 用来控制是否继续重试连接wifi
				userPhoneOS: null,//用户手机的类型
				// 方案2：对象存储（推荐，便于命名管理）
				timers : {
				  timerA:null,//1
				  timerB:null,//2
				  timerC:null,//3
				  timerD:null,//4
				  timerE:null,//5
				  timerF:null,//6
				  timerG:null,//7
				  timerH:null,//8
				  timerI:null,//9
				  timerJ:null,//10
				}
				
			};
		},
		watch:{
			loading:{
				handler(newValue,oldValue){
					if(newValue){
						this.$modal.loading("请稍等...");
					}else{
						this.$modal.closeLoading();
					}
				}
			}
		},
		onLoad(param) {
			if(param.productKey!=null && param.deviceKey!=null){
				this.addDeviceFlag = !!param.show&&param.show=="a"?false:true;
				this.deviceBSSID = param.productKey + param.deviceKey;//新的wifi名
				console.log(this.deviceBSSID);
				getDeviceLists({productKey:param.productKey,deviceKey:param.deviceKey}).then(res=>{
					this.deviceInfo=res.rows[0];
				})
			}
			this.getUserPhoneOS();
		},
		onShow() {
			this.getUserPhoneOS();
			this.getAuthList();
			this.initWifiConfirm();
		},

		onPullDownRefresh(){
			// console.log('下拉刷新中...');
			this.$modal.loading("加载中...")
			this.getUserPhoneOS();
			this.timers.timerA = setTimeout(()=>{
				this.getAuthList();
				this.initWifiConfirm();
				this.$modal.closeLoading();
				uni.stopPullDownRefresh();
			},800)
		},
		methods: {
			
			/** 确定按钮前置操作  //连接wifi初始化wifi */
			initWifiConfirmTwo(){
				const _this = this;
				this.loading = true;
				this.wifiFlag = false;//重置连接wifi标志
				this.tcpFlag = false;//重置连接tcp标志
				if(!this.getsysStatus()) return; // 检查 Wi-Fi 和 定位状态
				
				wx.startWifi({
				  success (res) {
					_this.initWifiFlag = true;
					_this.loading = false;
					_this.confirmConnectWifi();
				  },
				  fail(err){
					  _this.loading = false;
					  _this.initWifiFlag = false;
				  }
				})
			},
			
			/**确定按钮真正操作  连接wifi */
			async confirmConnectWifi(){
				console.log("A1");
				this.loading = true;
				
				// 调用设备重新进行wifi的服务
				// await this.autoReSetNetService();
				
				console.log("A2");
				
				if(!this.wifiName){
					this.loading = false;
					this.showAlert("WiFi名称不能为空！");
					return;
				}
				
				uni.setStorageSync("historyWifiInfo",{'wifiName':this.wifiName,'wifiPassword':this.wifiPassword})//缓存上次的名称密码
				
				if(!this.wifiPassword){
					this.loading = false;
					const res = await this.showModalSc();
					if (res.confirm) {
						this.connects();// 执行tcp连接操作
					} else if (res.cancel) {
						this.loading = false;
					}
					
				}else{
					//如果 Wi-Fi 密码不为空，直接执行连接
					this.loading = false;
					this.connects();
				}
				
			},
			
			
			showModalSc(){
				return new Promise((resolve,reject) => {
					uni.showModal({
						title: '提示',
						content: `WiFi密码为空，是否继续`,
						cancelText: '取消',
						confirmText: '继续',
						success: function (res) {
							resolve(res)
						}
					});
				})
				
			},
			
			/** 连接设备 */
			async connects(attempt = 1){
				if (this.isUnloaded) return;
				console.log("B1",attempt);
				const _this = this;
				this.loading = true;
				
				if(this.wifiFlag == false){
					try{
						console.log("B2",attempt);
						const res = await this.connwifi(this.deviceBSSID);//页面退出前进入了这个方法
						console.log("B3",attempt);
						if (this.isUnloaded) return;
						console.log("B4",attempt);
						console.log('结果:',res);// {errCode:0,errMsg:"connectWifi:ok",errno:0}
						if((this.userPhoneOS == 'ios' || res.errCode==0) && res.errMsg == 'connectWifi:ok'){
							console.log("B5",attempt);
							this.wifiFlag=true;
							console.log("B6",attempt);
							// 连接成功后开始建立 TCP 连接
							this.timers.timerB = setTimeout(()=>{
								console.log("B7",attempt);
								try{
									this.loading = false;
									console.log("B8",attempt);
									if (this.isUnloaded) return;
									console.log("B9",attempt);
									this.createTcpEsp();
									console.log("B10",attempt);
								}catch(e){
									console.log("B11",attempt);
									this.loading = false;
									console.log("B12",attempt);
								}
							},500)
						}
						
					} catch(err){
						console.log("B101",attempt);
						console.log('catch结果:',err);
						console.log("B102",attempt);
						this.wifiFlag=false;
						console.log("B103",attempt);
						if (this.isWifiActive && attempt < 3) {
							console.log("B104",attempt);
							this.timers.timerC = setTimeout(() => {
								console.log("B105",attempt)
								if (this.isUnloaded) return;
								console.log("B106",attempt);
								this.connects(attempt + 1);
								console.log("B107",attempt);
							}, 2000 * attempt);
							console.log("B108",attempt);
						} else {
							console.log("B109",attempt);
							this.loading = false;
							console.log("B110",attempt);
							if (this.isUnloaded) return;
							console.log("B111",attempt);
							this.handleWifiConnectionError(err);//但是页面退出后这个方法依旧被执行了
							console.log("B112",attempt);
						}
						console.log("B113",attempt);
					}
				}else{
					console.log("B114",attempt);
					console.log("this.wifiFlag 为 true");
					this.loading = false;
					console.log("B115",attempt);
				}
				console.log("B116",attempt);
			},
			/** 连接设备wifi */
			connwifi(deviceBSSID){
				console.log("C1",deviceBSSID);
				return new Promise((resolve,reject) => {
					console.log("C2",deviceBSSID);
					wx.connectWifi({
						SSID: deviceBSSID,
						password:'88888888',
						forceNewApi: true,
						success(res) {
							console.log("C3",deviceBSSID);
							console.log('res:',res);
							resolve(res);
						},
						fail(err){
							console.log("C4",deviceBSSID);
							console.log('err:',err);
							reject(err)
						},
					})
					console.log("C5",deviceBSSID);
				})
				console.log("C6",deviceBSSID);
			},
			
			
			/** 建立手机与设备的TCP连接-创建tcp连接 */
			createTcpEsp(){
				if (this.isUnloaded) return;
				console.log("C tcp1");
				this.tcp = null;
				this.tcp = wx.createTCPSocket();
				
				
				
				if(!!this.tcp){
					this.tcp.onConnect((res) => this.chenggong(res,this.tcp));
					this.tcp.onError((err) => this.cuowu(err,this.tcp));
					this.tcp.onClose(() => this.guanbi(this.tcp));
					this.tcp.onMessage(() => this.xiaoxi(this.tcp));
					
					/* this.tcp.offConnect(() => this.chenggongOff(this.tcp));
					this.tcp.offError(() => this.cuowuOff(this.tcp));
					this.tcp.offClose(() => this.guanbiOff(this.tcp));
					this.tcp.offMessage(() => this.xiaoxiOff(this.tcp)); */
					
					this.lianjie(this.tcp);
				}
				
				
			},
			
			
			/** 建立tcp连接 */
			lianjie(tcp){
				if (this.isUnloaded) return;
				this.loading = true;
				tcp.connect({
					address: '192.168.4.1',
					port: 8120,
					timeout:3,
				})
			},
			chenggong(res,tcp){
				console.log("Chenggongf1:",this.isUnloaded);
				if (this.isUnloaded) return;
				console.log("resresres:",res);
				if(res.remoteInfo.port == -1 || !res.remoteInfo.address || !res.remoteInfo.family){
					if(!!tcp){
						console.log("resresres重连1:",this.resresresTryCount);
						this.tcp.close();
						console.log("resresres重连2:",this.resresresTryCount);
					}
					console.log("resresres重连3:",this.resresresTryCount);
					if(this.resresresTryCount <= 3){
						console.log("resresres重连4:",this.resresresTryCount);
						this.resresresTryCount += 1;
						console.log("resresres重连5:",this.resresresTryCount);
						this.createTcpEsp();
						console.log("resresres重连6:",this.resresresTryCount);
						return;
					}else{
						console.log("resresres重连7:",this.resresresTryCount);
						if (this.isUnloaded) return;
						console.log("resresres重连8:",this.resresresTryCount);
						this.showAlert("配置失败请重试！");
						return;
					}
					
				}
				console.log("L1");
				this.resresresTryCount = 0;
				console.log("L2");
				this.tcpFlag=true;
				console.log("L3");
				
				const msg = '$1$' + this.wifiName + (!!this.wifiPassword?',' +this.wifiPassword: ',') 
				console.log("L4");
				
				this.xieshuju(tcp,msg);
				
				this.loading=true;
				
				this.timerE = setTimeout(() => {
					
					this.xieshuju(tcp,'$9$');
					this.loading=true;
					
					// 执行完提交信息2秒之后再执行关闭连接
					this.timers.timerF = setTimeout(() => {
						this.tcp = null;
						this.loading = false;
						this.wifiName = null;
						this.wifiPassword = null;
						this.tcpFlag = false;
						
						if (this.isUnloaded) return;
						
						const _this = this;
						uni.showModal({
						  title: '提示',
						  content: '操作完成，请查看设备是否在线！',
						  showCancel: false,
						  confirmText: '确定',
						  success: function(res) {
							if (res.confirm) {
								if(_this.addDeviceFlag){
									let pages = getCurrentPages();
									let prevPage = pages[pages.length - 2];
									uni.navigateBack({
										delta: 1,
										success: () => {
											prevPage.$vm.setNetEndTip(_this.userPhoneOS);
										}
									});
								}else{
									_this.setNetEndTipp();
								}
							}

						  }
						});
					
					},2000);
					
				},2000);
				
			},
			cuowu(err,tcp){
				console.log("tcp错误",err);
			},
			guanbi(tcp){
				console.log("关闭",this.resresresTryCount);
				tcp = null;
				this.loading = false;
			},
			xiaoxi(tcp){},
			
			chenggongOff(tcp){},
			cuowuOff(tcp){},
			guanbiOff(tcp){},
			xiaoxiOff(tcp){},
			
			
			xieshuju(tcp,msg){
				if (this.isUnloaded) return;
				if(this.tcpFlag){
					try{
						tcp.write(msg);
						console.log("tcp写数据了",msg);
						this.loading = false;
					}catch(err){
						this.tcpFlag = false;
						this.loading = false;
					}
					console.log(msg);
				}
			},
			
			
			
			
			
			
			
			
			/** 处理wifi连接错误 */
			handleWifiConnectionError(err) {
				if (this.isUnloaded) return;
				this.loading = false;//可以去掉前边已经处理好了
				const errorMessages = {
				12000: "初始化WiFi失败，请重试！",
				12002: "密码错误，请重试！",
				12003: "连接超时，请重试！",
				12004: "请勿重复连接 WiFi！",
				12005: "请打开WiFi开关后进行重试！",
				12006: "请打开定位功能开关后进行重试！",
				12013: "系统保存的 WiFi 配置过期，建议忘记 WiFi 后重试！"
				};
				const errorMessage = errorMessages[err.errCode] || "设备WiFi连接失败请重试！";
				this.$modal.alert(errorMessage, "提示");
			},
			
			/** 用户点击确定时 自动 调用设备重新配网的服务 */
			async autoReSetNetService(){
				// if(this.userPhoneOS == 'ios') return;
				const ress = await getDeviceLists({productKey:this.deviceInfo.productKey,deviceKey:this.deviceInfo.deviceKey})
				this.deviceInfo=ress.rows[0];
				if(this.deviceInfo.onlien != true) return;//如果设备不在线就可以直接配置网络不用调用服务，即使调用也不会调用成功

				let query = {
				  productKey: this.deviceInfo.productKey,
				  deviceKey: this.deviceInfo.deviceKey,
				  ack: 1,
				  propertyValue: {configmode:1},
				  type: null,
				  address: null,
				  function: "configmode"
				}
				deviceServiceDebug(query)//调用重新配网的服务
				await this.sleep(1000);
			},
			
			/** 获取当前wifi信息 */
			getCurrentWiFi() {
				const _this = this;
				if(!this.getsysStatus()){
					return;
				}
				
				wx.getConnectedWifi({
					success(res) {
						// console.log("获取当前WiFi成功", res);
						_this.wifiName = res.wifi.SSID;
					},
					fail(err) {
						// console.log("获取当前WiFi失败", err);
						if(_this.userPhoneOS == 'ios'){
							_this.showAlert("请检查WiFi开关是否已打开！");//ios机获取不到正确的WiFi状态所以进行提示
						}
						if(err.errCode=12000){
							_this.initWifiConfirm();
						}else{
							_this.showAlert("无法获取当前WiFi，请手动输入！");
						}
					}
				});
			},
			
			/** 用户 点击按钮 调用的 调用设备重新配网的服务 */
			async reSetNetService(){
				const ress = await getDeviceLists({productKey:this.deviceInfo.productKey,deviceKey:this.deviceInfo.deviceKey})
				this.deviceInfo=ress.rows[0];
				if(this.deviceInfo.onlien != true){//如果设备不在线就可以直接配置网络不用调用服务，即使调用也不会调用成功
					this.$modal.msgSuccess("操作成功！")
					return;
				}
				let query = {
				  productKey: this.deviceInfo.productKey,
				  deviceKey: this.deviceInfo.deviceKey,
				  ack: 1,
				  propertyValue: {configmode:1},
				  type: null,
				  address: null,
				  function: "configmode"
				}
				//调用重新配网的服务
				const res = await deviceServiceDebug(query);
				if(res.code==200){
					this.$modal.msgSuccess("操作成功！")
				}else{
					this.$modal.msgError("操作失败，请再次尝试！")
				}
			},
			
			/** 初始化wifi */
			async initWifiConfirm(){
				const _this = this;
				if(!this.getsysStatus()) return;
				
				wx.startWifi({
				  success(res) {
				    // console.log("初始化wifi成功了",res);
					_this.initWifiFlag = true;
				  },
				  fail(err){
					  // console.log("初始化wifi失败了",err);
					  _this.loading = false;
					  _this.initWifiFlag = false;
				  }
				})
			},
			
			/** 查看用户的授权设置 */
			getAuthList(){
				const _this=this;
				if(this.userPhoneOS == 'ios') return;
				wx.getSetting({
					success(res){
						// console.log("查看用户的授权设置成功了",res);
						if(!res.authSetting['scope.userLocation']){//未授权则进行授权
							_this.getLocalAuth();//申请获取地理位置
						}else{//已授权
							_this.getUserLocal();//获取用户定位
						}
					},
					fail(err) {
						// console.log("查看用户的授权设置失败了",err);
						_this.loading = false;
					}
				})
			},
				
			/** 申请获取地理位置 */
			getLocalAuth(){
				const _this = this;
				wx.authorize({//授权
				  scope: 'scope.userLocation',
				  success () {//位置授权成功
				    _this.getUserLocal();//获取用户定位
				  },
				  fail() {//位置授权失败
					// console.log("位置授权失败");
					_this.loading = false;
					_this.showAlert("位置授权失败，请到设置中进行授权后重试！")
				  }
				})
			},
			
			/** 获取用户定位 */
			getUserLocal(){
				const _this = this;
				wx.getLocation({// 获取定位
					type:"wgs84",
					success(res) {//获取定位成功
						// console.log("获取定位成功");
					},
					fail() {//获取定位失败
						// console.log("获取定位失败")
						//提示请打开定位功能
						_this.loading = false;
						_this.getsysStatus();
					}
				});
			},
			
			/** 查看设备wifi蓝牙开关状态，并给出提示
			 * 都打开了返回true
			 */
			getsysStatus(){
				const res = uni.getSystemSetting();
				
				if(res.wifiEnabled==false && (res.locationEnabled==false && this.userPhoneOS != 'ios')){
					this.showAlert("请打开 WiFi 和 定位 开关后进行重试！");
					this.loading = false;
					return false;
				}else if(res.locationEnabled==false && this.userPhoneOS != 'ios'){
					this.showAlert("请打开 定位 开关后进行重试！");
					this.loading = false;
					return false;
				}else if(res.wifiEnabled==false){
					this.showAlert("请打开 WiFi 开关后进行重试！");
					this.loading = false;
					return false;
				}else{
					return true;
				}
			},
			
			/** 使用上一次的wifi名称密码 */
			useHistoryWifiInfo(){
				const historyWifiInfo = uni.getStorageSync("historyWifiInfo");//获取上次的wifi名称密码
				// console.log('上次的wifi名称密码:',historyWifiInfo)
				if(!historyWifiInfo.wifiName ){
					this.showAlert("暂无WiFi名称、密码信息，请输入！")
				}else{
					this.wifiName = historyWifiInfo.wifiName;//取出wifi名称
					this.wifiPassword = historyWifiInfo.wifiPassword;//取出wifi密码
				}
			},
			
			/** 报警设置对话框前的验证,配置网络页面的回调方法 */
			setNetEndTipp(){
				if (this.isUnloaded) return;
				// console.log("设备类型",this.userPhoneOS );
				if(this.userPhoneOS == 'ios'){
					uni.showModal({
						title:'提示',
						content:'请切换回您的WiFi网络后再进行其它操作！',
						confirmText:'确定',
						showCancel: false,
						success:function(res) {
							if(res.confirm){
								// console.log("ios用户点击了确定")
							}
						}
					})
				}else if(this.userPhoneOS  == 'android'){
				}
			},
			
			/** 等待函数 */
			sleep(milliseconds) {
			    return new Promise(resolve => this.timers.timerI = setTimeout(resolve, milliseconds));
			},
			
			/** 切换密码可见性 */
			togglePasswordVisibility() {
			  this.showPassword = !this.showPassword;
			},

			showAlert(message) {
				if (this.isUnloaded) return;
				this.$modal.alert(message, "提示");
			},
		
			/** 获取当前设备类型 */
			getUserPhoneOS(){
				let res = wx.getDeviceInfo();
				this.userPhoneOS = res.platform === 'ios' ? 'ios' : 'android';
			},
		},
		
		onUnload() {
		  this.isUnloaded = true; // 标记页面已卸载
		  // console.log("页面即将卸载，清理资源");
		  this.isWifiActive = false;
		  this.tcpFlag = false;
		  
		  // 清理逻辑
		  for (const key in this.timers) {
		    if (this.timers[key]) {
		      clearTimeout(this.timers[key]);
		      this.timers[key] = null;
		    }
		  }
		
		 // TCP连接清理
		   if (this.tcp) {
		     try {
		       // 强制关闭连接
		       if (typeof this.tcp.close === "function") {
		         this.tcp.close();
		       }
		     } catch (e) {
		       // console.error("TCP连接关闭异常:", e);
		     } finally {
		       this.tcp = null; // 确保释放
		     }
		   }
		}
	};
</script>

<style lang="scss" scoped>

	.notice {
		margin: 20rpx 0;
		text-align: left;
	}

	.notice-text {
		color: red;
		font-size: 28rpx;
	}

	/* ----------------------------------------------------------------------- */
	@mixin flex {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
	}

	@mixin height {
		/* #ifndef APP-NVUE */
		height: 100%;
		// height: 100px;
		/* #endif */
		/* #ifdef APP-NVUE */
		flex: 1;
		/* #endif */
	}

	/* // 整体弹窗 */
	.popup-content {
		display: flex;
		flex-direction: column;
		border-radius: 12px;
		background: #fff;
		box-shadow: $all-box-shadow;
	}

	/* // wifi名称/密码 */
	.form-group-name {
		width: 100%;
		height: 52px;
		display: flex;
		border-bottom: 1px solid #CCCCCC;
		padding: 12px 0px;
		align-items: center;
		/* // background-color: olive; //调试背景色 */
	}

	/* // 必填 * 星号符号 */
	.form-group-name-xing {
		font-size: 18px;
		color: #FF0033;
		margin-left: 10px;
		/* // padding:10px, 50px ; */
	}

	/* //wifi名称 */
	.form-group-name-zi {
		font-size: 15px;
		color: #000;
	}

	/* // wifi密码样式 */
	.form-group-name-ps {
		font-size: 15px;
		color: #000;
		margin-left: 15px;
	}

	/* // 提示 */
	.form-group-name-hint {
		font-size: 14px;
		/* background-color: rebeccapurple; */
	}

	/* // 获取当前WiFi */
	.form-group-name-wifi {
		font-size: 12px;
		color: #00c73c;
		border: 1.5px solid #2bd387;
		padding: 10px 5px;
		position: absolute;
		right: 30rpx;
		line-height: 5px;
	}
	
	.form-group-name-eye{
		/* font-size: 12px; */
		height: 30px;
		width: 30px;
		color: #00c73c;
		/* border: 1.5px solid #2bd387; */
		/* padding: 10px; */
		position: absolute;
		right: 15px;
		/* line-height: 5px; */
	}
		
	/* // wifi配置 */
	.form-group-configuration {
		width: 100%;
		height: 45px;
		font-size: 32rpx;
		text-align: center;
		line-height: 45px;
		color: #00c73c;
		&:active{
			transform: scale(0.98);
		}
		

	}

</style>