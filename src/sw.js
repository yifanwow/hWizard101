// 极简版 Service Worker，仅用于满足浏览器 PWA 安装条件
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // 暂不进行离线缓存拦截，所有请求正常放行
});