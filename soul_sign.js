const cookieName = 'Soul'
const tokenKey = 'soul_token'
const atKey = 'soul_at'
const csKey = 'soul_cs'

!(async () => {
    try {
        const token = $persistentStore.read(tokenKey)
        const at = $persistentStore.read(atKey)
        const cs = $persistentStore.read(csKey)
        
        let logMsg = '================================\n'
        logMsg += `token: ${token}\n`
        logMsg += `at: ${at}\n`
        logMsg += `cs: ${cs}\n`
        logMsg += '================================\n'
        console.log(logMsg)
        
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
            'av': '5.11.0',
            'sdi': '622bb76e20d0d34c95d0da6a0ad399ed',
            'avc': '240122101600',
            'Content-Type': 'application/json'
        }
        
        // 打印请求信息
        console.log('请求信息：', {
            url: url,
            headers: headers
        })

        $httpClient.post({
            url: url,
            headers: headers,
            body: JSON.stringify({})  // 添加空的请求体
        }, (error, response, data) => {
            console.log('响应信息：', {
                error: error,
                statusCode: response?.statusCode,
                headers: response?.headers,
                data: data
            })

            if (error) {
                $notification.post(cookieName, '签到失败', `请求错误: ${error}`)
            } else {
                try {
                    const result = JSON.parse(data)
                    console.log('解析结果：', result)
                    
                    if (result.status === 1) {
                        $notification.post(cookieName, '签到成功', JSON.stringify(result))
                    } else {
                        $notification.post(cookieName, '签到失败', JSON.stringify(result))
                    }
                } catch (e) {
                    console.log('解析失败：', e)
                    $notification.post(cookieName, '签到失败', `解析失败: ${data}`)
                }
            }
            $done({})
        })
        
    } catch (e) {
        console.log('脚本异常：', e)
        $notification.post(cookieName, '签到异常', e.message)
        $done({})
    }
})()