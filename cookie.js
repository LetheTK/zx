const cookieName = '知轩藏书'
const cookieKey = 'zxcsCookie'
const cookieVal = $request.headers['Cookie']

if (cookieVal) {
    if ($persistentStore.write(cookieVal, cookieKey)) {
        $notification.post(cookieName, '获取Cookie: 成功', '')
    }
}

$done({}) 
