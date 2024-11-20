const $ = new Env('知轩藏书签到');
const notify = $.isNode() ? require('./sendNotify') : '';

// 配置
const DOMAIN = 'zxcsol.com';
const URL = `https://${DOMAIN}/wp-admin/admin-ajax.php`;

// 请求头
const headers = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'zh-CN,zh;q=0.9',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Origin': `https://${DOMAIN}`,
    'Referer': `https://${DOMAIN}`,
    'X-Requested-With': 'XMLHttpRequest'
}

// 签到函数
async function checkin() {
    try {
        const options = {
            url: URL,
            headers: headers,
            body: 'action=user_checkin'
        }
        
        const result = await $.http.post(options);
        const response = JSON.parse(result.body);
        
        if (response.error) {
            $.msg($.name, '❌ 签到失败', response.msg || '未知错误');
            return;
        }
        
        // 签到成功
        const msg = response.msg || '签到成功';
        $.msg($.name, '✅ 签到成功', msg);
        
    } catch (e) {
        $.log(`❌ ${$.name}, 失败! 原因: ${e}!`);
        $.msg($.name, '❌ 签到失败', '请检查网络或重新登录');
    }
}

// 脚本入口
!(async () => {
    if (!$.isLogin) {
        $.msg($.name, '❌ 失败', '请先登录知轩藏书');
        return;
    }
    
    await checkin();
})()
.catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
})
.finally(() => {
    $.done();
});

// Env函数实现略 
