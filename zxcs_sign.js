const cookieName = '知轩藏书'
const cookieKey = 'zxcs_cookie'
const $ = new Env(cookieName)

sign()

async function sign() {
    try {
        const cookie = $.getdata(cookieKey)
        if (!cookie) {
            $.msg(cookieName, '未获取Cookie', '请先获取Cookie')
            return
        }

        const url = 'https://zxcsol.com/user-sign'
        const headers = {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }

        const myRequest = {
            url: url,
            headers: headers
        }

        $.get(myRequest, (error, response, data) => {
            if (error) {
                $.msg(cookieName, '签到失败', error)
                return
            }
            if (data.indexOf('今日已签到') !== -1) {
                $.msg(cookieName, '签到失败', '今日已签到')
            } else if (data.indexOf('签到成功') !== -1) {
                $.msg(cookieName, '签到成功', '')
            } else {
                $.msg(cookieName, '签到失败', '未知错误')
            }
        })
    } catch (e) {
        $.msg(cookieName, '签到异常', e.message)
        $.logErr(e)
    }
}

function Env(t){
    this.name=t;
    this.logs=[];
    this.getdata=(k)=>$.read(k);
    this.msg=(title,subtitle,body)=>{
        $.notify(title,subtitle,body);
    };
    this.get=(opts,cb)=>{
        $.http.get(opts,(err,resp,body)=>cb(err,resp,body));
    };
    this.logErr=(e)=>{
        $.log('', `❗️${this.name}, 错误!`, e);
    };
}

$done()