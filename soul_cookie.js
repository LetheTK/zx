const cookieName = 'Soul'
const tokenKey = 'soul_token'
const atKey = 'soul_at'
const csKey = 'soul_cs'

const headers = $request.headers

console.log('开始获取Soul签到信息')

if (headers) {
    try {
        const tokenVal = headers['tk']
        const atVal = headers['at']
        const csVal = headers['cs']
        
        if (tokenVal && atVal && csVal) {
            const result1 = $persistentStore.write(tokenVal, tokenKey)
            const result2 = $persistentStore.write(atVal, atKey)
            const result3 = $persistentStore.write(csVal, csKey)
            
            if (result1 && result2 && result3) {
                $notification.post(cookieName, '获取签到信息成功', '')
            } else {
                $notification.post(cookieName, '获取签到信息失败', '写入失败')
            }
        } else {
            $notification.post(cookieName, '获取签到信息失败', '未找到所需信息')
        }
    } catch(e) {
        console.log('写入失败:', e)
        $notification.post(cookieName, '获取签到信息失败', e.message)
    }
}

$done({})