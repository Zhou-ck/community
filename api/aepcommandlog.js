import request from '@/utils/request'


// 查询已发送的指令 
export function queryAepCommandLog(data) {
	return request({
		url: '/api/command/log/query',
		method: 'get',
		params: data
	})
}

// 保存下发的指令
export function saveAepCommandLog(data) {
	return request({
		url: '/api/command/log/save',
		method: 'get',
		params: data
	})
}

// 保存下发的指令
export function queryParamsStatusByDpIdAndImei(data) {
	return request({
		url: '/api/command/log/query/dpidimei',
		method: 'get',
		params: data
	})
}

