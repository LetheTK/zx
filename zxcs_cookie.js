const cookieName = '知轩藏书'
const cookieKey = 'zxcs_cookie'
const $ = new Env(cookieName)

const cookieVal = $request.headers['Cookie'] || $request.headers['cookie']
console.log('获取到的Cookie:', cookieVal)

if (cookieVal) {
    if ($.setdata(cookieVal, cookieKey)) {
        $.msg(cookieName, '获取Cookie: 成功', cookieVal)
    } else {
        $.msg(cookieName, '获取Cookie: 失败', '写入失败')
    }
} else {
    $.msg(cookieName, '获取Cookie: 失败', '未找到Cookie')
}

function Env(t){
    this.name=t;
    this.logs=[];
    this.setdata=(k,v)=>{
        try {
            $.write(v,k);
            return true;
        } catch(e) {
            console.log('写入失败:', e)
            return false;
        }
    };
    this.msg=(title,subtitle,body)=>{
        $.notify(title,subtitle,body);
    };
}

$done({})