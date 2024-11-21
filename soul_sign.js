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
            $notification.post(cookieName, '签到失败', '请先获取Cookie')
            $done({})
            return
        }

        // 生成bi参数
        const biParams = [
            (Date.now() + Math.floor(Math.random() * 1000)).toString(16),  // 时间戳
            "--",
            "Apple",
            "iOS",
            "17.6.1",
            "17.6.1",
            "iPhone 13 Pro",
            "3",
            "390*844",
            "AppStore",
            "Unknown",
            "zh"
        ]
        
        // 1. 先查询今日签到状态
        const statusResult = await checkSignStatus(token, at, cs, biParams)
        console.log('签到状态：', statusResult)
        
        if (statusResult.todaySignStatus) {
            $notification.post(cookieName, '今日已签到', '')
            $done({})
            return
        }

        // 2. 执行签到
        await doSign(token, at, cs, biParams)
        
    } catch (e) {
        console.log('脚本异常：', e)
        $notification.post(cookieName, '签到异常', e.message)
        $done({})
    }
})()

// 检查签到状态
function checkSignStatus(token, at, cs, biParams) {
    return new Promise((resolve, reject) => {
        const bi = encodeURIComponent(JSON.stringify(biParams))
        const url = `https://increase-openapi.soulapp.cn/increase/sign/getTodaySignStatus?bi=${bi}&bik=32243&pageId=MSoulCoinNew_Mine`
        
        // 生成设备相关的ID
        const deviceId = '7273B6A5-A2D7-4B92-B4EA-E832998EE844'  // 这个需要保持固定
        const sdi = '622bb76e20d0d34c95d0da6a0ad399ed'  // 这个也需要保持固定
        
        const headers = {
            'Host': 'increase-openapi.soulapp.cn',
            'cs': cs,
            'tk': token,
            'Accept': '*/*',
            'clientTraceId': `b${Date.now()}QWlhOUhTT1BsY1Z1WUNwTVhMR0V3QT09`,
            'os': 'iOS',
            'slb': 'dE1vSGF4bzBvYWVyQkZZSzEvanZ0N3NoZmxPWEY4U1p0TW9IYXhvMG9hZUNPOXFJaWM2TEJRPT0=',
            'at': at,
            'Accept-Language': 'zh-Hans-US;q=1, en-US;q=0.9, zh-Hant-US;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Soul_New/5.11.0 (iPhone; iOS 17.6.1; Scale/3.00; CFNetwork; iPhone14,2)',
            'Connection': 'keep-alive',
            'avc': '240122101600',
            'aid': '10000001',
            'av': '5.11.0',
            'di': deviceId,
            'sdi': sdi
        }
        
        console.log('请求签到状态URL:', url)
        console.log('请求头:', headers)
        
        $httpClient.get({url, headers}, (error, response, data) => {
            if (error) {
                console.log('请求失败:', error)
                reject(error)
                return
            }
            try {
                console.log('原始响应:', data)
                const result = JSON.parse(data)
                console.log('解析后的响应:', result)
                
                if (result.code === 10001) {
                    resolve(result.data || {})
                } else {
                    console.log('获取签到状态失败:', result)
                    reject(new Error(result.message || '获取签到状态失败'))
                }
            } catch (e) {
                console.log('解析响应失败:', e)
                reject(e)
            }
        })
    })
}

// 执行签到
function doSign(token, at, cs, biParams) {
    return new Promise((resolve, reject) => {
        const bi = encodeURIComponent(JSON.stringify(biParams))
        const url = `https://increase-openapi.soulapp.cn/increase/sign/sign?bi=${bi}&bik=32243&pageId=MSoulCoinNew_Mine`
        
        // 生成设备相关的ID
        const deviceId = '7273B6A5-A2D7-4B92-B4EA-E832998EE844'
        const sdi = '622bb76e20d0d34c95d0da6a0ad399ed'
        
        const headers = {
            'Host': 'increase-openapi.soulapp.cn',
            'cs': cs,
            'tk': token,
            'Accept': '*/*',
            'clientTraceId': `b${Date.now()}QWlhOUhTT1BsY1Z1WUNwTVhMR0V3QT09`,
            'os': 'iOS',
            'slb': 'dE1vSGF4bzBvYWVyQkZZSzEvanZ0N3NoZmxPWEY4U1p0TW9IYXhvMG9hZUNPOXFJaWM2TEJRPT0=',
            'at': at,
            'Accept-Language': 'zh-Hans-US;q=1, en-US;q=0.9, zh-Hant-US;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Soul_New/5.11.0 (iPhone; iOS 17.6.1; Scale/3.00; CFNetwork; iPhone14,2)',
            'Connection': 'keep-alive',
            'avc': '240122101600',
            'aid': '10000001',
            'av': '5.11.0',
            'di': deviceId,
            'sdi': sdi,
            'Content-Type': 'application/json; charset=utf-8'
        }
        
        console.log('请求签到URL:', url)
        console.log('请求头:', headers)
        
        $httpClient.post({
            url: url,
            headers: headers,
            body: JSON.stringify({})
        }, (error, response, data) => {
            if (error) {
                console.log('签到请求失败:', error)
                $notification.post(cookieName, '签到失败', `请求错误: ${error}`)
                reject(error)
                return
            }
            
            try {
                console.log('原始响应:', data)
                const result = JSON.parse(data)
                console.log('解析后的响应:', result)
                
                if (result.code === 10001) {
                    let msg = '签到成功'
                    if (result.data?.rewards) {
                        msg += '，获得奖励：'
                        msg += result.data.rewards.map(r => `${r.name}x${r.num}`).join('、')
                    }
                    $notification.post(cookieName, '签到成功', msg)
                    resolve(result)
                } else {
                    console.log('签到失败:', result)
                    $notification.post(cookieName, '签到失败', result.message || '未知错误')
                    reject(new Error(result.message))
                }
            } catch (e) {
                console.log('解析签到结果失败:', e)
                $notification.post(cookieName, '签到失败', `解析失败: ${data}`)
                reject(e)
            }
        })
    })
}