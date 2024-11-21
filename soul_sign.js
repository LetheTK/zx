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
            "Unknown",  // 网络状态可能是 Unknown
            "zh"
        ]
        
        // 1. 先查询今日签到状态
        const statusResult = await checkSignStatus(token, at, cs, biParams)
        console.log('签到状态：', statusResult)
        
        if (statusResult.todaySign) {
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
        
        const headers = {
            'tk': token,
            'at': at,
            'cs': cs,
            'User-Agent': 'Soul iOS 5.11.0',
            'Accept': 'application/json',
            'Accept-Language': 'zh-Hans-CN;q=1',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
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
                
                if (result.status === 1) {
                    resolve(result.data || {})
                } else {
                    console.log('获取签到状态失败:', result)
                    reject(new Error(result.msg || '获取签到状态失败'))
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
        
        const headers = {
            'tk': token,
            'at': at,
            'cs': cs,
            'User-Agent': 'Soul iOS 5.11.0',
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Accept-Language': 'zh-Hans-CN;q=1',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
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
                
                if (result.status === 1) {
                    let msg = '获得奖励：'
                    if (result.data?.rewards) {
                        msg += result.data.rewards.map(r => `${r.name}x${r.num}`).join('、')
                    }
                    $notification.post(cookieName, '签到成功', msg)
                    resolve(result)
                } else {
                    console.log('签到失败:', result)
                    $notification.post(cookieName, '签到失败', result.msg || '未知错误')
                    reject(new Error(result.msg))
                }
            } catch (e) {
                console.log('解析签到结果失败:', e)
                $notification.post(cookieName, '签到失败', `解析失败: ${data}`)
                reject(e)
            }
        })
    })
}