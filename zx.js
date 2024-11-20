// 知轩藏书签到脚本 for Surge
const url = 'https://zxcsol.com/wp-admin/admin-ajax.php';

const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': 'https://zxcsol.com',
    'Referer': 'https://zxcsol.com',
    'X-Requested-With': 'XMLHttpRequest',
    'Cookie': $persistentStore.read('zxcsCookie') // 从 Surge 存储中读取 Cookie
}

function notify(title, subtitle, message) {
    $notification.post(title, subtitle, message);
}

$httpClient.post({
    url: url,
    headers: headers,
    body: 'action=user_checkin'
}, function(error, response, data) {
    if (error) {
        notify('知轩藏书签到', '签到失败', '网络错误');
        $done();
        return;
    }
    
    try {
        const result = JSON.parse(data);
        if (result.error) {
            notify('知轩藏书签到', '签到失败', result.msg || '未知错误');
        } else {
            notify('知轩藏书签到', '签到成功', result.msg || '签到成功');
        }
    } catch (e) {
        notify('知轩藏书签到', '签到失败', '返回数据解析错误');
    }
    
    $done();
});

// Env函数实现略 
