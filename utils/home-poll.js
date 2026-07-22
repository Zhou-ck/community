// utils/home-poll.js
// 首页健康数据 30s 轮询工具
//
// 设计要点：
// - start/stop 幂等，重复 start 不会创建多个定时器
// - 支持异步任务：上一次请求完成后才安排下一次，避免请求堆积
// - stop 立即清除定时器，页面 onHide 时调用，避免后台继续请求
//
// 用法：
//   const poll = createPoll(() => this.fetchHealth(), 30000)
//   poll.start(true)  // onShow，立即执行一次再开始轮询
//   poll.stop()       // onHide

export function createPoll(fn, interval = 30000) {
  let timer = null
  let running = false

  // 执行一次任务，完成后（异步则等其 settle）安排下一次
  function tick() {
    if (!running) return
    try {
      const ret = fn()
      if (ret && typeof ret.then === 'function') {
        // 异步：等完成后才调度下一次，避免并发堆积
        ret.catch(() => {}).then(() => schedule())
      } else {
        schedule()
      }
    } catch (e) {
      // 同步异常不中断轮询
      schedule()
    }
  }

  function schedule() {
    if (!running) return
    timer = setTimeout(tick, interval)
  }

  return {
    // immediate=true 时立即执行一次，否则等待一个 interval 后再执行
    start(immediate = false) {
      if (running) return
      running = true
      if (immediate) {
        tick()
      } else {
        schedule()
      }
    },
    stop() {
      running = false
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    },
    isRunning() {
      return running
    }
  }
}
