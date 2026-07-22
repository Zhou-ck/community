<template>
  <view></view>
</template>

<script>
// 兼容旧入口：重定向到主包新路径 pages/device/index
export default {
  onLoad(options) {
    const query = Object.keys(options).map(k => `${k}=${encodeURIComponent(options[k])}`).join('&')
    uni.redirectTo({ url: '/pages/device/index' + (query ? '?' + query : '') })
  }
}
</script>
