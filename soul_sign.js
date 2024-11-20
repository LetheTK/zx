const cookieName = 'Soul'
const tokenKey = 'soul_token'
const atKey = 'soul_at'
const csKey = 'soul_cs'

!(async () => {
    try {
        const token = $persistentStore.read(tokenKey)
        const at = $persistentStore.read(atKey)
        const cs = $persistentStore.read(csKey)
        
        if (!token || !at || !cs) {
            $notification.post(cookieName, '签到失败', '请先获取签到信息')
            $done({})
            return
        }

        const url = 'https://increase-openapi.soulapp.cn/increase/sign/sign'
        const headers = {
            'Host': 'increase-openapi.soulapp.cn',
            'tk': token,
            'at': at,
            'cs': cs,
            'User-Agent': 'Soul_New/5.11.0 (iPhone; iOS 17.6.1; Scale/3.00)',
            'os': 'iOS',
            'srs': 'web',
            'Accept': '*/*',
            'Accept-Language': 'zh-Hans-US;q=1',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
        
        $httpClient.post({
            url: url,
            headers: headers
        }, (error, response, data) => {
            if (error) {
                $notification.post(cookieName, '签到失败', error)
            } else {
                try {
                    const result = JSON.parse(data)
                    if (result.status === 1) {
                        $notification.post(cookieName, '签到成功', '')
                    } else {
                        $notification.post(cookieName, '签到失败', result.msg || '未知错误')
                    }
                } catch (e) {
                    $notification.post(cookieName, '签到失败', '解析响应失败')
                }
            }
            $done({})
        })
        
    } catch (e) {
        console.log('执行异常:', e)
        $notification.post(cookieName, '签到异常', e.message)
        $done({})
    }
})()