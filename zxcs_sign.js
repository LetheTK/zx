const cookieName = '知轩藏书'
const cookieKey = 'zxcs_cookie'

!(async () => {
    try {
        const cookie = $persistentStore.read(cookieKey)
        console.log('读取到的Cookie:', cookie)
        
        if (!cookie) {
            $notification.post(cookieName, '未获取Cookie', '请先获取Cookie')
            $done({})
            return
        }

        const url = 'https://zxcsol.com/user-sign'
        const headers = {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh-Hans;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
        
        $httpClient.get({url, headers}, (error, response, data) => {
            console.log('响应数据:', data)
            console.log('错误信息:', error)
            
            if (error) {
                $notification.post(cookieName, '签到失败', error)
            } else if (!data) {
                $notification.post(cookieName, '签到失败', '返回数据为空')
            } else if (data.indexOf('今日已签到') !== -1) {
                $notification.post(cookieName, '签到失败', '今日已签到')
            } else if (data.indexOf('签到成功') !== -1) {
                $notification.post(cookieName, '签到成功', '')
            } else {
                $notification.post(cookieName, '签到失败', '未知错误: ' + data)
            }
            $done({})
        })
    } catch (e) {
        console.log('执行异常:', e)
        $notification.post(cookieName, '签到异常', e.message)
        $done({})
    }
})()