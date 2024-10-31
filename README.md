# 7dmap

7日杀地图查看器（桌面版）

### 这是什么？
这是一款为游戏《7日杀》(7 Days to Die)开发的地图建筑查看工具，弥补了游戏中无法随时查看地图的缺点。  
![界面图片](https://s21.ax1x.com/2024/10/31/pABOngA.png)

### 在哪下载&如何使用？
这里👇👇  
[下载地址（可能不是最新版的，看简介或置顶评论）](https://www.bilibili.com/video/BV1ofaUezE5b/) 

### 如何自己打包？
项目使用 **electron** + **vue3** 构建
1. 克隆/下载项目
2. 安装node.js、pnpm
3. 在项目根目录：
    ```sh
    pnpm i
    ```
   > 此操作可能会遇到 **electron** 下载失败的问题，自行解决
4. 打包vue项目
    ```sh
    pnpm build
    ```
5. electron 打包
    ```sh
    pnpm elec-build
    ```
   > 输出目录：build。更多打包配置项在**package.json**中配置

### 如何调试？
1. 执行上面👆步骤**1-3**
2. 安装nodemon(热更新插件)
3. 启动vue项目
    ```sh
    pnpm dev
    ```
4. 启动electron
    ```sh
    pnpm start
    ```


