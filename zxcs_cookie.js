const cookieName = '知轩藏书'
const cookieKey = 'zxcs_cookie'
const $ = new Env(cookieName)

const cookieVal = $request.headers['Cookie']
if (cookieVal) {
    if ($.setdata(cookieVal, cookieKey)) {
        $.msg(cookieName, '获取Cookie: 成功', '')
    }
}

function Env(t){
    this.name=t;
    this.logs=[];
    this.setdata=(k,v)=>{
        $.write(v,k);
        return true;
    };
    this.msg=(title,subtitle,body)=>{
        $.notify(title,subtitle,body);
    };
}

$done({})