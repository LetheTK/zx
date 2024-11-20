/*
知轩藏书签到脚本
说明：配合获取Cookie脚本使用

[Script]
知轩藏书签到 = type=cron,cronexp=0 9 * * *,script-path=zxcs_checkin.js,wake-system=1

[MITM]
hostname = %APPEND% zxcsol.com
*/

// 知轩藏书签到脚本 for Surge
const cookieKey = 'zxcsCookie'
const cookie = $persistentStore.read(cookieKey)

if (!cookie) {
    $notification.post('知轩藏书签到', '签到失败', '请先获取Cookie')
    $done()
} else {
    const url = 'https://zxcsol.com/wp-admin/admin-ajax.php'
    const headers = {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://zxcsol.com',
        'Referer': 'https://zxcsol.com',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookie
    }

    $httpClient.post({
        url: url,
        headers: headers,
        body: 'action=user_checkin'
    }, function(error, response, data) {
        if (error) {
            $notification.post('知轩藏书签到', '签到失败', '网络错误')
            $done()
            return
        }
        
        try {
            const result = JSON.parse(data)
            if (result.error) {
                $notification.post('知轩藏书签到', '签到失败', result.msg || '未知错误')
            } else {
                $notification.post('知轩藏书签到', '签到成功', result.msg || '签到成功')
            }
        } catch (e) {
            $notification.post('知轩藏书签到', '签到失败', '返回数据解析错误')
        }
        
        $done()
    })
}

// Env函数实现略 
