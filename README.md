cd D:\project

git clone http://192.168.1.211/mall/mall_web.git

此项目有两个分支,一个dev,一个master,克隆下来后需要切换分支,在项目根目录下,可执行如下命令

git branch -a //查看所有分支

git branch  //当前所处分支

git checkout master/dev  //切换至master或者dev分支

npm i 如有报错,若报错没有停止安装,则忽略报错

### 本地开发时

>如需修改端口,打开vue.config.js,找到devServer里面的port修改

>如需修改Key,修改.env.development里面的VUE_APP_KEY,同时后端也必须修改

>如需修改接口地址,修改.env.development里面的VUE_APP_BASE_API

>如需修改sw地址,修改.env.development里面的VUE_APP_SW_API

>如需修改版本号,打开utils/request.js,找到params['version'] = '1',修改1即可,同时后端也必须修改

>修改配置文件需要重启生效

>npm run dev或者npm run serve  具体查看package.json文件的scripts中


### 服务器部署时

>切换至master分支

>如需修改Key,修改.env.production里面的VUE_APP_KEY,同时后端也必须修改

>如需修改接口地址,修改.env.production里面的VUE_APP_BASE_API

>如需修改sw地址,修改.env.production里面的VUE_APP_SW_API

>如需修改版本号,打开utils/request.js,找到params['version'] = '1',修改1即可,同时后端也必须修改

>npm run build

>dist目录 上传至商城服务器

### 服务器部署需要 https 运行时需要调整, 强制要求回传是ssl, public/index.html加一行

`<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">`


> 这样在正式网站上才能启用https, 本地开发时删除这一行
