/**
 * 小数点截取 直接切割
 * @param {string} value
 * @param {number} decimal 需要精确小数点后几位
 */
let cutPoint = (value, decimal) => {
  let num = Number(value).toFixed(decimal + 1)
  return parseFloat(num.substring(0, num.toString().length - 1));
}

/**
 *  时间戳转换成指定格式日期
 *@param {string|number} time
 *@param {string} cFormat
 */
let parseTime = (time, cFormat) => {
  if (arguments.length === 0 || !time) {
    return null
  }
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
  return format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
}

/**
 *  1000.00 => 1,000.00
 *@param {string|number} num
 */
let toThousandFilter = (num) => {
  if (!num) return 0.00
  let intPart = parseInt(num)  //获取整数部分
  let intPartFormat = intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') //将整数部分逢三一断
  let floatPart = ".00" //预定义小数部分
  let value2Array = num.toString().split(".")
  if (value2Array.length === 2) {  //数据可能有小数位
    floatPart = value2Array[1].toString(); //拿到小数部分
    return intPartFormat + "." + floatPart;
  } else {
    return intPartFormat + floatPart
  }
}

export default {
  cutPoint,
  parseTime,
  toThousandFilter,
}
