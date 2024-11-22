const cookieName = 'Soul'
const tokenKey = 'soul_token'
const atKey = 'soul_at'
const csKey = 'soul_cs'

!(async () => {
    try {
        const token = $persistentStore.read(tokenKey)
        const at = $persistentStore.read(atKey)
        const cs = $persistentStore.read(csKey)
        
        console.log('Token:', token)
        console.log('AT:', at)
        console.log('CS:', cs)
        
        if (!token || !at || !cs) {
            $notification.post(cookieName, '签到失败', '请先获取Cookie')
            $done({})
            return
        }

        // 设备和版本信息
        const deviceInfo = {
            os: 'iOS',
            osVersion: '17.6.1',
            model: 'iPhone 13 Pro',
            scale: '3',
            resolution: '390*844',
            appVersion: '5.11.0',
            buildVersion: '240122101600',
            deviceId: '7273B6A5-A2D7-4B92-B4EA-E832998EE844',
            source: 'AppStore',
            network: 'WiFi',
            language: 'zh'
        }

        // 生成bi参数
        const timestamp = (Date.now() + Math.floor(Math.random() * 1000)).toString(16)
        const biParams = [
            timestamp,
            "--",
            "Apple",
            deviceInfo.os,
            deviceInfo.osVersion,
            deviceInfo.osVersion,
            deviceInfo.model,
            deviceInfo.scale,
            deviceInfo.resolution,
            deviceInfo.source,
            deviceInfo.network,
            deviceInfo.language
        ]
        
        console.log('BI参数:', JSON.stringify(biParams))
        
        // 通用请求头
        const headers = {
            'Host': 'increase-openapi.soulapp.cn',
            'cs': cs,
            'tk': token,
            'at': at,
            'os': deviceInfo.os,
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Accept-Language': 'zh-Hans-US;q=1, en-US;q=0.9, zh-Hant-US;q=0.8',
            'User-Agent': `Soul_New/${deviceInfo.appVersion} (iPhone; iOS ${deviceInfo.osVersion}; Scale/${deviceInfo.scale}; CFNetwork; iPhone14,2) SoulBegin-iOS-${deviceInfo.appVersion}-${deviceInfo.network}-SoulEnd`,
            'Accept-Encoding': 'gzip, deflate, br',
            'avc': deviceInfo.buildVersion,
            'aid': '10000001',
            'av': deviceInfo.appVersion,
            'di': deviceInfo.deviceId,
            'srs': 'web',
            'clientTraceId': generateTraceId(),
            'slb': generateSlb(),
            'sdi': generateSdi()
        }
        
        console.log('请求头:', JSON.stringify(headers))
        
        // 1. 先查询今日签到状态
        console.log('开始查询签到状态...')
        const statusResult = await checkSignStatus(headers, biParams)
        console.log('签到状态查询结果：', JSON.stringify(statusResult))
        
        if (statusResult.todayIsSign) {
            $notification.post(cookieName, '今日已签到', '')
            $done({})
            return
        }

        // 2. 执行签到
        console.log('开始执行签到...')
        await doSign(headers, biParams)
        
    } catch (e) {
        console.log('脚本异常：', e)
        console.log('错误堆栈：', e.stack)
        $notification.post(cookieName, '签到异常', e.message)
        $done({})
    }
})()

// 检查签到状态
async function checkSignStatus(headers, biParams) {
    const params = {
        bi: JSON.stringify(biParams),
        bik: '32243',
        pageId: 'MSoulCoinNew_Mine'
    }
    
    const url = `https://increase-openapi.soulapp.cn/increase/sign/querySign?${formatParams(params)}`
    console.log('查询签到状态URL:', url)
    
    const myRequest = {
        url: url,
        headers: headers,
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        $httpClient.get(myRequest, (error, response, data) => {
            console.log('查询签到状态响应:', data)
            if (error) {
                console.log('查询签到状态错误:', error)
                reject(error)
                return
            }
            try {
                const result = JSON.parse(data)
                console.log('解析后的查询结果:', JSON.stringify(result))
                if (result.code === 10001) {
                    resolve(result.data)
                } else {
                    console.log('查询失败:', result.message)
                    reject(new Error(result.message || '查询签到状态失败'))
                }
            } catch (e) {
                console.log('解析查询结果失败:', e)
                reject(e)
            }
        })
    })
}

// 执行签到
async function doSign(headers, biParams) {
    const params = {
        bi: JSON.stringify(biParams),
        bik: '32243'
    }
    
    const url = `https://increase-openapi.soulapp.cn/increase/sign/sign?${formatParams(params)}`
    console.log('签到URL:', url)
    
    const myRequest = {
        url: url,
        headers: headers,
        method: 'POST',
        body: JSON.stringify({})  // 添加空的请求体
    }

    return new Promise((resolve, reject) => {
        $httpClient.post(myRequest, (error, response, data) => {
            console.log('签到响应:', data)
            if (error) {
                console.log('签到请求错误:', error)
                reject(error)
                return
            }
            try {
                const result = JSON.parse(data)
                console.log('解析后的签到结果:', JSON.stringify(result))
                if (result.code === 10001) {
                    $notification.post(cookieName, '签到成功', `获得${result.data.todayReward || 0}灵魂币`)
                    resolve(result.data)
                } else {
                    console.log('签到失败:', result.message)
                    reject(new Error(result.message || '签到失败'))
                }
            } catch (e) {
                console.log('解析签到结果失败:', e)
                reject(e)
            }
            $done({})
        })
    })
}

// 辅助函数
function formatParams(params) {
    return Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&')
}

function generateTraceId() {
    const timestamp = Date.now().toString()
    return `e${timestamp}QWlhOUhTT1BsY1Z1WUNwTVhMR0V3QT09`
}

function generateSlb() {
    return 'dE1vSGF4bzBvYWVyQkZZSzEvanZ0N3NoZmxPWEY4U1p0TW9IYXhvMG9hZUNPOXFJaWM2TEJRPT0='
}

function generateSdi() {
    return '622bb76e20d0d34c95d0da6a0ad399ed'
}