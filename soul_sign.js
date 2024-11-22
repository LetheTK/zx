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

        // 设备和版本信息
        const deviceInfo = {
            os: 'iOS',
            osVersion: '17.6.1',
            model: 'iPhone 13 Pro',
            scale: '3',
            resolution: '390*844',
            appVersion: '5.11.0',
            buildVersion: '240122101600',
            deviceId: '7273B6A5-A2D7-4B92-B4EA-E832998EE844',  // 这个应该是动态的
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
        
        // 1. 先查询今日签到状态
        const statusResult = await checkSignStatus(headers, biParams)
        console.log('签到状态：', statusResult)
        
        if (statusResult.todaySignStatus) {
            $notification.post(cookieName, '今日已签到', '')
            $done({})
            return
        }

        // 2. 执行签到
        await doSign(headers, biParams)
        
    } catch (e) {
        console.log('脚本异常：', e)
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
    
    const myRequest = {
        url: url,
        headers: headers,
        method: 'GET'
    }

    return new Promise((resolve, reject) => {
        $httpClient.get(myRequest, (error, response, data) => {
            if (error) {
                reject(error)
                return
            }
            const result = JSON.parse(data)
            if (result.code === 10001) {
                resolve(result.data)
            } else {
                reject(new Error(result.message || '查询签到状态失败'))
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
    
    const myRequest = {
        url: url,
        headers: headers,
        method: 'POST'
    }

    return new Promise((resolve, reject) => {
        $httpClient.post(myRequest, (error, response, data) => {
            if (error) {
                reject(error)
                return
            }
            const result = JSON.parse(data)
            if (result.code === 10001) {
                $notification.post(cookieName, '签到成功', `获得${result.data.todayReward || 0}灵魂币`)
                resolve(result.data)
            } else {
                reject(new Error(result.message || '签到失败'))
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
    return 'e17322057451850156QWlhOUhTT1BsY1Z1WUNwTVhMR0V3QT09'  // 实际应该动态生成
}

function generateSlb() {
    return 'dE1vSGF4bzBvYWVyQkZZSzEvanZ0N3NoZmxPWEY4U1p0TW9IYXhvMG9hZUNPOXFJaWM2TEJRPT0='  // 实际应该动态生成
}

function generateSdi() {
    return '622bb76e20d0d34c95d0da6a0ad399ed'  // 实际应该动态生成
}