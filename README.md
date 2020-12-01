# one-app

网站示例 [https://oneapp.top](https://oneapp.top)

[图片预览](./preview/README.md)

## before

修改 `/src/api.js` 中的 `DO_MAIN`

```js
const DO_MAIN = 'https://your.domain';
```

## build

```bash
npm install
npm run build
```

下面是我的 `nginx` 配置，需配合[另一个项目](https://github.com/gene9831/one-app-api)使用

```nginx
# /etc/nginx/sites-enabled/default -> /etc/nginx/sites-available/default

# http redirect
server {
    listen 80;
    server_name oneapp.top;
    return 301 https://$server_name$request_uri;
}

server {
    # SSL configuration
    listen 443 ssl;
    listen [::]:443 ssl;

    root /var/www/one-app;

    server_name oneapp.top;

    ssl_certificate /etc/nginx/oneapp.top_bundle.crt;
    ssl_certificate_key /etc/nginx/oneapp.top.key;
    ssl_session_timeout 5m;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;
    ssl_prefer_server_ciphers on;

    location / {
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location ~ /(api/|file/.*) {
        proxy_set_header        X-Real-IP       $remote_addr;
        proxy_set_header        Host            $http_host;
        set $sub_url            $1;
        # 直接使用 $1, url 中包含空格会出错
        proxy_pass              http://127.0.0.1:5000/$sub_url;
    }

    gzip on;
    gzip_static on; # 响应静态gz文件（如果存在的话）
    gzip_min_length 1k;
    gzip_buffers 32 4k;
    gzip_comp_level 4;
    gzip_types text/css application/javascript application/json;
    gzip_vary on;
}
```
