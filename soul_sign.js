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

        // 1. 先查询今日签到状态
        const statusResult = await checkSignStatus(token, at, cs)
        if (statusResult.signed) {
            $notification.post(cookieName, '今日已签到', '')
            $done({})
            return
        }

        // 2. 执行签到
        await doSign(token, at, cs)
        
    } catch (e) {
        console.log('脚本异常：', e)
        $notification.post(cookieName, '签到异常', e.message)
        $done({})
    }
})()

// 检查签到状态
function checkSignStatus(token, at, cs) {
    return new Promise((resolve, reject) => {
        const url = 'https://increase-openapi.soulapp.cn/increase/sign/getTodaySignStatus'
        const headers = {
            'tk': token,
            'at': at,
            'cs': cs
        }
        
        $httpClient.get({url, headers}, (error, response, data) => {
            if (error) {
                reject(error)
                return
            }
            try {
                const result = JSON.parse(data)
                console.log('签到状态返回：', result)
                
                // 根据实际返回结构判断是否已签到
                if (result.status === 1) {
                    resolve({
                        signed: result.data?.todaySign || false,
                        data: result.data
                    })
                } else {
                    reject(new Error(result.msg || '获取签到状态失败'))
                }
            } catch (e) {
                reject(e)
            }
        })
    })
}

// 执行签到
function doSign(token, at, cs) {
    return new Promise((resolve, reject) => {
        const url = 'https://increase-openapi.soulapp.cn/increase/sign/sign'
        const headers = {
            'tk': token,
            'at': at,
            'cs': cs,
            'Content-Type': 'application/json'
        }
        
        $httpClient.post({
            url: url,
            headers: headers,
            body: JSON.stringify({})
        }, (error, response, data) => {
            if (error) {
                $notification.post(cookieName, '签到失败', `请求错误: ${error}`)
                reject(error)
                return
            }
            
            try {
                const result = JSON.parse(data)
                console.log('签到结果：', result)
                
                if (result.status === 1) {
                    let msg = '获得奖励：'
                    if (result.data?.rewards) {
                        msg += result.data.rewards.map(r => `${r.name}x${r.num}`).join('、')
                    }
                    $notification.post(cookieName, '签到成功', msg)
                    resolve(result)
                } else {
                    $notification.post(cookieName, '签到失败', result.msg || '未知错误')
                    reject(new Error(result.msg))
                }
            } catch (e) {
                console.log('解析签到结果失败：', e)
                $notification.post(cookieName, '签到失败', `解析失败: ${data}`)
                reject(e)
            }
        })
    })
}