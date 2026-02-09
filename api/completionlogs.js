import request from '@/utils/request'

// 查询计划完成日志列表
export function listCompletionlogs(query) {
  return request({
    url: '/system/completionlogs/list',
    method: 'get',
    params: query
  })
}

// 查询计划完成日志详细
export function getCompletionlogs(completionLogId) {
  return request({
    url: '/system/completionlogs/' + completionLogId,
    method: 'get'
  })
}

// 新增计划完成日志
export function addCompletionlogs(data) {
  return request({
    url: '/system/completionlogs',
    method: 'post',
    data: data
  })
}

// 修改计划完成日志
export function updateCompletionlogs(data) {
  return request({
    url: '/system/completionlogs',
    method: 'put',
    data: data
  })
}

// 删除计划完成日志
export function delCompletionlogs(completionLogId) {
  return request({
    url: '/system/completionlogs/' + completionLogId,
    method: 'delete'
  })
}
