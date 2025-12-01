import request from '@/utils/request'

// 查询睡眠报告列表
export function listReportsleep(query) {
  return request({
    url: '/devices/reportsleep/list',
    method: 'get',
    params: query
  })
}

// 查询睡眠报告详细
export function getReportsleep(reportId) {
  return request({
    url: '/devices/reportsleep/' + reportId,
    method: 'get'
  })
}

// 新增睡眠报告
export function addReportsleep(data) {
  return request({
    url: '/devices/reportsleep',
    method: 'post',
    data: data
  })
}

// 修改睡眠报告
export function updateReportsleep(data) {
  return request({
    url: '/devices/reportsleep',
    method: 'put',
    data: data
  })
}

// 删除睡眠报告
export function delReportsleep(reportId) {
  return request({
    url: '/devices/reportsleep/' + reportId,
    method: 'delete'
  })
}