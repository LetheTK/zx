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
                $notification.post(cookieName, '签到失败', '请求异常')
                console.log('签到请求失败:', error)
            } else {
                try {
                    const result = JSON.parse(data)
                    if (result.status === 1) {
                        $notification.post(cookieName, '签到成功', result.msg || '获得积分')
                    } else {
                        $notification.post(cookieName, '签到失败', result.msg || '未知原因')
                    }
                    console.log('签到结果:', data)
                } catch (e) {
                    $notification.post(cookieName, '签到失败', '解析响应失败')
                    console.log('解析响应失败:', e)
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