<template>
	<view class="protocol-content">
		<view class="protocol-title">安特社区六助隐私政策</view>
		
		<!-- SDK 列表 -->
		<view class="section-title">第三方 SDK 列表</view>
		<scroll-view scroll-x class="sdk-wrap">
			<view class="sdk-table">
				<view class="sdk-row sdk-header">
					<view class="sdk-cell">SDK 名称</view>
					<view class="sdk-cell">开发者</view>
					<view class="sdk-cell">功能</view>
					<view class="sdk-cell">收集个人信息</view>
					<view class="sdk-cell">使用目的</view>
					<view class="sdk-cell">隐私政策链接</view>
				</view>
				<view class="sdk-row">
					<view class="sdk-cell">移动智能终端补充设备标识体系统一调用SDK</view>
					<view class="sdk-cell">中国信息通信研究院</view>
					<view class="sdk-cell">补充设备标识获取</view>
					<view class="sdk-cell">OAID、VAID、AAID</view>
					<view class="sdk-cell">广告归因、异常设备识别</view>
					<view class="sdk-cell link" @click="openLink('https://www.msa-alliance.cn/col.jsp?id=122')">查看</view>
				</view>
			</view>
		</scroll-view>
		
		<!-- 协议正文 -->
		<view class="protocol-text">
			<view class="paragraph">生效日期：2025-06-30</view>
			<view class="paragraph">山东坤安特智能科技股份有限公司及其附属公司和子公司(下文简称为"我们"、"我们的"、"我司")致力于保护您的隐私。本隐私声明(下文简称"声明")阐述了在您使用下列服务、产品和相关移动应用程序(统称为"产品")期间，我们如何处理个人数据并保障信息隐私。</view>
			<view class="paragraph">我们深知个人信息对您的重要性，致力于保护您的个人信息安全与隐私。本隐私政策旨在向您说明，在使用我们的安特社区六助服务时，我们如何收集、使用、存储、共享您的个人信息，以及您享有的权利。</view>
			<view class="paragraph">请在使用我们的服务前，仔细阅读并理解本隐私政策的全部内容。若您使用我们的服务，即表示您已充分理解并同意本隐私政策的所有条款。</view>
			
			<view class="section-title">一、我们如何收集您的个人信息</view>
			<view class="paragraph">我们仅会出于本隐私政策所述的以下目的，收集和使用您的个人信息：</view>
			<view class="paragraph bold">必要信息收集</view>
			<view class="paragraph">账号信息：在您注册/登录社区六助账号时，我们会收集您的手机号码、短信验证码；如您使用第三方登录（微信、Apple ID等），我们将获取您的昵称、头像、OpenID。</view>
			<view class="paragraph">服务基础数据：当您使用"助餐、助行、助医、助洁、助浴、助急"各项功能时，我们会收集与服务相关的必要信息，例如：</view>
			<view class="paragraph">- 位置信息：用于推荐附近服务网点，仅在获得您的授权后收集GPS、WLAN接入点、基站信息；</view>
			<view class="paragraph">- 健康/需求描述：您主动填写的年龄、性别、症状、需求描述等，用于匹配更精准的服务资源；</view>
			<view class="paragraph">- 设备信息：设备型号、操作系统版本、IMEI、MAC、Android ID、IDFA、OAID，用于兼容性判断、故障排查、安全风控；</view>
			<view class="paragraph">- 图片/音频：经您授权后调用相机、相册、麦克风上传的图像、语音，用于订单确认、售后沟通、服务评价。</view>
			
			<view class="section-title">二、我们如何使用您的个人信息</view>
			<view class="paragraph">提供社区六助各项服务：助餐订餐与派送、助行出行规划、助医挂号与问诊、助洁上门清洁、助浴预约照护、助急紧急救援等。</view>
			<view class="paragraph">安全保障：防范欺诈、账号被盗、恶意登录，保障交易和支付安全。</view>
			<view class="paragraph">服务优化：基于匿名化数据进行统计分析，改进功能与用户体验。</view>
			<view class="paragraph">消息通知：向您发送订单状态、服务提醒、安全公告、营销活动（仅在您同意接收后）。</view>
			
			<view class="section-title">三、我们如何存储您的个人信息</view>
			<view class="paragraph">存储位置：我们在中华人民共和国境内收集和产生的个人信息，将存储在中华人民共和国境内。</view>
			<view class="paragraph">存储期限：我们仅在为实现本隐私政策所述目的所必需的最短时间内保留您的个人信息。在您主动注销账户、超出存储期限或实现相关目的后，我们将对您的个人信息进行删除或匿名化处理。法律法规另有规定的，从其规定。</view>
			
			<view class="section-title">四、我们如何共享、转让、公开披露您的个人信息</view>
			<view class="paragraph">共享：我们不会向第三方共享您的个人信息，除非获得您的明确同意，或基于法律法规、司法机关或行政机关的强制性要求。在涉及合并、收购或破产清算等情形时，如涉及个人信息转让，我们将要求新的持有您个人信息的公司、组织继续受本隐私政策的约束，否则我们将要求该公司、组织重新向您征求授权同意。</view>
			<view class="paragraph">转让：我们不会将您的个人信息转让给任何第三方，除非满足法律法规规定的转让条件，并事先获得您的明确同意。</view>
			<view class="paragraph">公开披露：我们仅会在以下情况下公开披露您的个人信息：获得您明确同意；基于法律法规、司法机关或行政机关的强制性要求；为维护社会公共利益。在公开披露前，我们会评估该行为的必要性和合法性，并采取技术和管理措施对敏感信息进行去标识化处理。</view>
			
			<view class="section-title">五、您的权利</view>
			<view class="paragraph">查阅、复制个人信息：您有权通过我们的服务平台或联系我们的客服，查阅、复制您的个人信息。</view>
			<view class="paragraph">更正个人信息：若您发现我们处理的关于您的个人信息存在错误，您有权要求我们进行更正。您可以自行在服务平台上进行修改，或通过客服向我们提出更正申请。</view>
			<view class="paragraph">删除个人信息：在以下情形下，您可以向我们提出删除个人信息的请求：处理目的已实现、无法实现或为实现处理目的不再必要；您撤回同意；个人信息被非法处理；法律法规规定的其他情形。我们将在收到您的请求并核实相关信息后，及时进行处理，并在法律法规及监管要求允许的范围内尽快删除或匿名化处理您的个人信息。</view>
			<view class="paragraph">撤回同意：您可以通过我们提供的功能设置或联系客服，撤回之前对我们收集、使用您个人信息的同意授权。但撤回同意不影响撤回前基于您同意已进行的个人信息处理活动。</view>
			<view class="paragraph">注销账户：您可以通过服务平台的账户注销功能或联系客服申请注销账户。注销账户后，我们将删除或匿名化处理与该账户相关的个人信息，法律法规另有规定的除外。</view>
			
			<view class="section-title">六、我们如何保护您的个人信息</view>
			<view class="paragraph">技术措施：我们采用加密技术（如 SSL）对传输和存储的个人信息进行加密保护，防止信息泄露、损毁和丢失；使用访问控制机制，限制对个人信息的访问权限；定期对系统进行安全漏洞检测和修复，保障系统安全稳定运行。</view>
			<view class="paragraph">管理措施：我们建立了严格的个人信息保护管理制度，对员工进行信息安全培训，明确各岗位的个人信息保护职责；与合作伙伴签订保密协议，要求其遵守严格的个人信息保护标准。</view>
			<view class="paragraph">应急响应：我们制定了个人信息安全事件应急预案，若发生个人信息泄露等安全事件，我们将立即启动应急预案，采取补救措施，按照法律法规的要求及时向您告知事件相关情况，并配合监管部门进行调查处理。</view>
			
			<view class="section-title">七、未成年人个人信息保护</view>
			<view class="paragraph">我们非常重视未成年人的个人信息保护。若您是 14 周岁以下的未成年人，在使用我们的服务前，应事先取得您的家长或法定监护人的同意。我们仅在法律法规允许、家长或法定监护人明确同意或保护未成年人所必要的情况下收集、使用、存储、共享未成年人的个人信息。如我们发现自己未经事先可验证的家长或法定监护人同意收集了未成年人的个人信息，我们会尽快删除相关数据。</view>
			
			<view class="section-title">八、如何联系我们</view>
			<view class="paragraph">如果您对本隐私政策或我们处理您个人信息的行为有任何疑问、意见或建议，您可以通过以下方式联系我们：</view>
			<view class="paragraph">客服邮箱：15005460333@163.com</view>
			<view class="paragraph">客服电话：0546-8080588</view>
			<view class="paragraph">通讯地址：山东省东营市东城区徐州路99号</view>
			<view class="paragraph">我们将在收到您的反馈后，尽快在 15 个工作日内予以回复。</view>
			<view class="paragraph">请您妥善保管您的个人信息，并在使用完服务后及时退出登录。感谢您对我们安特社区六助服务的信任与支持！</view>
		</view>
	</view>
</template>

<script>
export default {
	methods: {
		openLink(url) {
			// #ifdef H5
			window.open(url, '_blank')
			// #endif
			// #ifndef H5
			uni.navigateTo({
				url: `/pages/common/webview/index?url=${encodeURIComponent(url)}`
			})
			// #endif
		}
	}
}
</script>

<style scoped>
.protocol-content {
	padding: 30rpx;
	background: #fff;
	min-height: 100vh;
}
.protocol-title {
	font-size: 44rpx;
	font-weight: bold;
	text-align: center;
	margin-bottom: 40rpx;
}
.section-title {
	font-size: 36rpx;
	font-weight: 600;
	margin: 30rpx 0 16rpx;
}
.paragraph {
	font-size: 32rpx;
	color: #333;
	line-height: 1.7;
	margin: 16rpx 0;
}
.paragraph.bold {
	font-weight: 600;
}
.sdk-wrap {
	margin: 20rpx 0;
	white-space: nowrap;
}
.sdk-table {
	display: inline-block;
	min-width: 100%;
	font-size: 28rpx;
}
.sdk-row {
	display: flex;
}
.sdk-header {
	background: #fafafa;
	font-weight: 600;
}
.sdk-cell {
	flex-shrink: 0;
	width: 200rpx;
	padding: 16rpx 12rpx;
	border: 1rpx solid #e0e0e0;
	word-break: break-all;
	white-space: normal;
}
.sdk-cell.link {
	color: #06c;
}
.protocol-text {
	margin-top: 30rpx;
}
</style>
