# hWizard101 - Snap Trigger PWA 🪄

[English](#english) | [中文](#中文)

---

## 中文

### 项目简介
hWizard101 是一个轻量级的渐进式 Web 应用 (PWA)，旨在通过声音交互控制智能家居。它能够实时监听麦克风，当检测到类似“打响指”的高频脉冲声音时，会自动向指定的 Webhook 发送 POST 请求。

目前该项目配置为触发 Home Assistant 的自动化场景。

### 核心功能
* **实时音频分析**：利用 Web Audio API 捕捉特定频率的声音特征。
* **PWA 支持**：可安装至 iOS/Android 主屏幕，像原生 App 一样启动。
* **智能家居联动**：检测到响指后，触发 `ha.yifanovo.com` 的 Webhook。

### 快速开始
1.  **克隆仓库**：`git clone https://github.com/yifanwow/hWizard101.git`
2.  **本地运行**：使用 VS Code Live Server 或任何静态服务器运行 `index.html`。
3.  **部署**：建议部署在支持 HTTPS 的环境（如群晖 Web Station），以获得麦克风授权。

---

## English

### Project Overview
hWizard101 is a lightweight Progressive Web App (PWA) designed to control smart home devices through acoustic interaction. It monitors the microphone in real-time and automatically sends a POST request to a pre-defined Webhook when it detects a "snap" (high-frequency pulse) sound.

The current configuration is tailored to trigger a scene cycle automation in Home Assistant.

### Key Features
* **Real-time Audio Analysis**: Uses Web Audio API to capture specific frequency signatures.
* **PWA Support**: Can be installed on iOS/Android home screens for a native app experience.
* **Smart Home Integration**: Triggers a Webhook at `ha.yifanovo.com` upon detection.

### Quick Start
1.  **Clone the Repo**: `git clone https://github.com/yifanwow/hWizard101.git`
2.  **Local Development**: Run `index.html` using VS Code Live Server or any static web server.
3.  **Deployment**: HTTPS is required for microphone access. Deployment via Synology Web Station with an SSL certificate is recommended.

---