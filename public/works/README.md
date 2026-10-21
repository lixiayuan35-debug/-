# 网站作品静态资源目录 (Public Assets)

放入此目录下的所有作品图片与视频文件，将直接以**相对网站根路径**访问：

- `public/works/the-cubo/cover.jpg` -> 网页中直接引用：`/works/the-cubo/cover.jpg`
- `public/works/the-cubo/cubo-1.jpg` -> 网页中直接引用：`/works/the-cubo/cubo-1.jpg`
- `public/videos/space-walkthrough.mp4` -> 网页中直接引用：`/videos/space-walkthrough.mp4`
- `public/contact/wechat-qr.png` -> 网页中直接引用：`/contact/wechat-qr.png`

无论在本地开发、打包发布还是分享链接给其他人，**相对网站根路径**（以 `/` 开头）均能被浏览器直接、高速、永久加载！
