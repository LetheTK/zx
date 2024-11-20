const cookieName = 'Soul'
const tokenKey = 'soul_token'
const atKey = 'soul_at'
const csKey = 'soul_cs'

!(async () => {
    try {
        const token = $persistentStore.read(tokenKey)
        const at = $persistentStore.read(atKey)
        const cs = $persistentStore.read(csKey)
        
        console.log('获取到的信息：', {token, at, cs})
        
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
            'Connection': 'keep-alive',
            'aid': '10000001',
            'av': '5.11.0'
        }
        
        console.log('请求URL:', url)
        console.log('请求头:', JSON.stringify(headers))
        
        $httpClient.post({
            url: url,
            headers: headers
        }, (error, response, data) => {
            if (error) {
                console.log('请求错误:', error)
                $notification.post(cookieName, '签到失败', `请求错误: ${error}`)
            } else {
                console.log('响应状态码:', response.status)
                console.log('响应数据:', data)
                try {
                    const result = JSON.parse(data)
                    console.log('解析后的结果:', JSON.stringify(result))
                    
                    if (result.status === 1) {
                        $notification.post(cookieName, '签到成功', `响应: ${JSON.stringify(result)}`)
                    } else {
                        $notification.post(cookieName, '签到失败', `错误信息: ${JSON.stringify(result)}`)
                    }
                } catch (e) {
                    console.log('解析响应失败:', e)
                    console.log('原始响应:', data)
                    $notification.post(cookieName, '签到失败', `解析响应失败: ${e.message}, 原始响应: ${data}`)
                }
            }
            $done({})
        })
        
    } catch (e) {
        console.log('执行异常:', e)
        $notification.post(cookieName, '签到异常', `详细错误: ${e.message}`)
        $done({})
    }
})()