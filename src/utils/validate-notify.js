import { Notification } from "element-ui";

let notificationInstance = null;
let notify = function doneNotify(object) {
  if (notificationInstance) notificationInstance.close();
  let arr = []
  for (let key in object) {
    if (object.hasOwnProperty(key)) {
      arr.push(object[key][0].message)
    }
  }
  let options = {
    title: '红框部分填写错误，请修改',
    message: Array.from(new Set(arr)).join('<br/>'),
    dangerouslyUseHTMLString: true,
    customClass: 'validate-notify',
    duration: 5000
  }
  notificationInstance = Notification(options)
  return notificationInstance
}

export default notify

