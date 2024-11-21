const cookieName = '知轩藏书'
const cookieKey = 'zxcs_cookie'

// 添加需要获取Cookie的URL匹配规则
const regex = /^https:\/\/zxcsol\.com\//

const url = $request.url
if (!regex.test(url)) {
    $done({})
    return
}

const cookieVal = $request.headers['Cookie'] || $request.headers['cookie']
console.log('获取到的Cookie:', cookieVal)

if (cookieVal) {
    // 检查Cookie是否包含必要的登录信息
    if (cookieVal.indexOf('wordpress_logged_in') !== -1) {
        try {
            const oldCookie = $persistentStore.read(cookieKey)
            if (oldCookie !== cookieVal) {
                $persistentStore.write(cookieVal, cookieKey)
                $notification.post(cookieName, 'Cookie更新成功 🎉', '')
            } else {
                $notification.post(cookieName, 'Cookie没有变化 ⚠️', '')
            }
        } catch(e) {
            console.log('写入失败:', e)
            $notification.post(cookieName, 'Cookie保存失败 ❌', e.message || '未知错误')
        }
    } else {
        $notification.post(cookieName, 'Cookie获取失败 ❌', '请先登录网站')
    }
} else {
    $notification.post(cookieName, 'Cookie获取失败 ❌', '未找到Cookie')
}

$done({})