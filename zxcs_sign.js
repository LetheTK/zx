const cookieName = '知轩藏书'
const cookieKey = 'zxcs_cookie'
const signUrl = 'https://zxcsol.com/wp-admin/admin-ajax.php'

!(async () => {
    try {
        const cookie = $persistentStore.read(cookieKey)
        if (!cookie) {
            throw new Error('Cookie不存在，请先获取Cookie')
        }

        const headers = {
            'Host': 'zxcsol.com',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Origin': 'https://zxcsol.com',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1',
            'Connection': 'keep-alive',
            'Referer': 'https://zxcsol.com/',
            'Cookie': cookie
        }

        const body = 'action=user_checkin'

        const myRequest = {
            url: signUrl,
            method: 'POST',
            headers: headers,
            body: body
        }

        $httpClient.post(myRequest, (error, response, data) => {
            if (error) {
                $notification.post(cookieName, '签到失败 ❌', '请求异常：' + error)
                console.log('签到请求失败:', error)
            } else {
                try {
                    console.log('签到返回数据:', data)
                    const result = JSON.parse(data)
                    
                    // 构建详细的签到结果
                    let subtitle = ''
                    let body = ''
                    
                    if (result.status === 1) {
                        subtitle = '签到成功 🎉'
                        body = result.msg || '获得积分'
                        
                        // 尝试解析更多信息
                        if (result.msg) {
                            if (result.msg.includes('已签到')) {
                                subtitle = '今日已签到 ⚠️'
                            }
                            // 提取签到获得的积分（如果有）
                            const pointsMatch = result.msg.match(/\d+/)
                            if (pointsMatch) {
                                body = `获得${pointsMatch[0]}积分 🎁`
                            }
                        }
                    } else {
                        subtitle = '签到失败 ❌'
                        body = result.msg || '未知原因'
                        
                        // 检查常见错误
                        if (result.msg && result.msg.includes('登录')) {
                            body += '\n请重新获取Cookie'
                        }
                    }
                    
                    // 添加时间戳
                    const now = new Date()
                    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                    body += `\n${timeStr}`
                    
                    $notification.post(cookieName, subtitle, body)
                    
                    // 输出详细日志
                    console.log('================')
                    console.log('签到时间:', timeStr)
                    console.log('签到状态:', subtitle)
                    console.log('详细信息:', body)
                    console.log('原始返回:', data)
                    console.log('================')
                    
                } catch (e) {
                    $notification.post(cookieName, '签到失败 ❌', '解析响应失败：' + e.message)
                    console.log('解析响应失败:', e)
                    console.log('原始响应:', data)
                }
            }
            $done({})
        })
    } catch (e) {
        console.log('执行异常:', e)
        $notification.post(cookieName, '签到异常 ❌', e.message)
        $done({})
    }
})()