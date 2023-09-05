import request from '@/utils/request'
import {parseTime} from "@/utils/index";
import store from '../store'
export default {
    //把时间戳转换为 展示时间 2020-1-1
    parseTime(time, cFormat) {
        if (arguments.length === 0 || !time) return null

        const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
        let date
        if (typeof time === 'object') {
            date = time
        } else {
            if ((typeof time === 'string')) {
                if ((/^[0-9]+$/.test(time))) {
                    // support "1548221490638"
                    time = parseInt(time)
                } else {
                    // support safari
                    // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
                    time = time.replace(new RegExp(/-/gm), '/')
                }
            }

            if ((typeof time === 'number') && (time.toString().length === 10)) {
                time = time * 1000
            }
            date = new Date(time)
        }
        const formatObj = {
            y: date.getFullYear(),
            m: date.getMonth() + 1,
            d: date.getDate(),
            h: date.getHours(),
            i: date.getMinutes(),
            s: date.getSeconds(),
            a: date.getDay()
        }
        const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
            const value = formatObj[key]
            // Note: getDay() returns 0 on Sunday
            if (key === 'a') {
                return ['日', '一', '二', '三', '四', '五', '六'][value]
            }
            return value.toString().padStart(2, '0')
        })
        return time_str
    },

    // 把时间戳转换为 展示时间 2020年1月1日
    formatTime(time, option) {
        if (('' + time).length === 10) {
            time = parseInt(time) * 1000
        } else {
            time = +time
        }
        const d = new Date(time)
        const now = Date.now()

        const diff = (now - d) / 1000

        if (diff < 30) {
            return '刚刚'
        } else if (diff < 3600) {
            // less 1 hour
            return Math.ceil(diff / 60) + '分钟前'
        } else if (diff < 3600 * 24) {
            return Math.ceil(diff / 3600) + '小时前'
        } else if (diff < 3600 * 24 * 2) {
            return '1天前'
        }
        if (option) {
            return parseTime(time, option)
        } else {
            return (
                d.getMonth() +
                1 +
                '月' +
                d.getDate() +
                '日' +
                d.getHours() +
                '时' +
                d.getMinutes() +
                '分'
            )
        }
    },

    /**
     * 截取小数点，不够的补0
     *@param {number/string} num
     *@param {number} len
     */

    cutRadixPoint(num, len) {
        let numStr = num.toString();
        if (len == null) {
            len = numStr.length;
        }
        let index = numStr.indexOf('.');
        if (index === -1) {
            index = numStr.length;
            numStr += ".0000000000000";
        } else {
            numStr += "0000000000000";
        }
        return numStr.substring(0, index + len + 1);
    },

    //获取汇率
    exchangeRate(type) {
        let params = {
            symbol: 'otc.web_site.get_exchange_rate',
            currency_id: type
        }
        return new Promise((resolve => {
            request({method: 'get', params}).then(res => {
                console.log(res)
                console.log('1')
                if (res) resolve(res)
            })
        }))
    },
    /**
     * @author penny 2698324951@qq.com
     * @date 2020/11/5 15:00
     * @Description: 小数点截取
     * @param value 输入
     * @param decimal 小数点精确度,默认2位小数
     */
    cutPoint(value, decimal) {
        value = String(value)
        if (!decimal) decimal = 2
        value = value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
        value = value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
        value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        value = value.replace(new RegExp("^(\\-)*(\\d+)\\.(\\d{" + decimal + "}).*$"), '$1$2.$3');//只能输入?个小数
        //如果没有小数点，不能为类似 01、02的金额
        if (value.indexOf(".") < 0 && value !== "") {
            return parseFloat(value);
        }
        //如果有小数点，不能为类似 1.10的金额
        if (value.indexOf(".") > 0 && value.indexOf("0") > 2) {
            return parseFloat(value);
        }
        return value
    },

    // 删除数字右边多余的'0'
    trimNum: (num) => {
        num = (num + '').split('.')
        if (num.length > 1) {
            num[1] = num[1].replace(/0+?$/g, '')
            if (num[1]) num[0] += '.' + num[1]
        }
        return num[0]
    },

    //封装的get
    get: async function get(url, params = {}) {
        return await new Promise((resolve, reject) => {
            request.get(url, {
                params: params
            }).then(response => {
                resolve(response);
            }).catch(err => {
                reject(err)
            })
        })
    },
    //封装的post
    post: async function (url, params = {}) {
        return await new Promise((resolve, reject) => {
            request.post(url, params).then(response => {
                resolve(response);
            }).catch(err => {
                reject(err)
            })
        })
    },

    // websocket 发送消息，并取得结果
    WsSend: (data, callback) => {
        //生成不重复字符串
        data['async'] = new Date().getTime() + parseInt(Math.random() * 1000000)
        //保存回调函数，websocket返回消息后调用
        window['WsSendCallback' + data['async']] = (data) => {
            callback(data)
        }
        //websocket发送消息
        window.$socket.emit('msg', data)
    },
    //处理图片链接
    getImg(path) {
        return (process.env.VUE_APP_BASE_API).slice(0, 20) + path
    },
    //通知对方的订单即时更新
    noticeOpposite(key, receiver,val='') {
        window.$socket.emit('msg', {
            recv_uid: receiver,//接收者
            type: 7,//消息类型
            content: {type:key,v:val},
        })
    },
    //打开聊天窗口方法
    async openChat(active, send_uid, toUid, is) {
        if (active) {
            let res = await this.get('WebOnlineMsg/update', {send_uid: send_uid})
            if (res) {
                store.commit('home/showChat', {show: is, toUid: toUid})
                store.dispatch('unread/getUnreadChatMessage').then(r => {
                })
            }
        } else store.commit('home/showChat', {show: !is, toUid: toUid})
    },

        // 防抖
    debounce(fn, delay) {
        let deLay = delay || 200;
        let timer;
        return function () {
            let th = this;
            let args = arguments;
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(function () {
                timer = null;
                fn.apply(th, args);
            }, deLay);
        };
    },
        // 节流
    throttle(fn, interval) {
        let last;
        let timer;
        const inter = interval || 200;
        return function () {
            let th = this;
            let args = arguments;
            let now = +new Date();
            if (last && now - last < interval) {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    last = now;
                    fn.apply(th, args);
                }, inter);
            } else {
                last = now;
                fn.apply(th, args);
            }
        }
    },

    // indexOf()  判断一个值 是否在数组中
    IsInArray(arr,val){
        var testStr=','+arr.join(",")+",";
        return testStr.indexOf(","+val+",")!=-1;
    }
}

