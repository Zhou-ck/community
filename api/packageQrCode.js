import request from '@/utils/request'

// 居民端：查看套餐的核销二维码
export function viewPackageQrCode(memberId, communityDeptId) {
  return request({
    url: '/services/memberQrCode/active',
    method: 'get',
    params: {
      memberId: memberId,
      communityDeptId: communityDeptId
    }
  })
}

// 居民端：挂失二维码
export function reportLostQrCode(memberId, communityDeptId) {
  return request({
    url: '/services/memberQrCode/reportLost',
    method: 'post',
    params: {
      memberId,
      communityDeptId
    }
  })
}

// 社区端：查看套餐的核销二维码（补打前预览）
export function adminViewPackageQrCode(instanceId) {
  return request({
    url: '/services/package/qrcode/admin/view/' + instanceId,
    method: 'get'
  })
}

// 社区端：补打二维码
export function reprintPackageQrCode(instanceId, reuseOld) {
  return request({
    url: '/services/package/qrcode/admin/reprint/' + instanceId,
    method: 'post',
    params: { reuseOld }
  })
}

// 社区端：检查二维码状态
export function checkQrCodeStatus(instanceId) {
  return request({
    url: '/services/package/qrcode/admin/status/' + instanceId,
    method: 'get'
  })
}
