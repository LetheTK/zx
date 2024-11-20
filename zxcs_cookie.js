const cookieName = '知轩藏书'
const cookieKey = 'zxcs_cookie'

const cookieVal = $request.headers['Cookie'] || $request.headers['cookie']
console.log('获取到的Cookie:', cookieVal)

if (cookieVal) {
    try {
        $persistentStore.write(cookieVal, cookieKey)
        $notification.post(cookieName, '获取Cookie: 成功', cookieVal)
    } catch(e) {
        console.log('写入失败:', e)
        $notification.post(cookieName, '获取Cookie: 失败', '写入失败')
    }
} else {
    $notification.post(cookieName, '获取Cookie: 失败', '未找到Cookie')
}

$done({})