console.log("🟢 app.js 核心逻辑已加载！");

const startBtn = document.getElementById('startBtn');
const statusDiv = document.getElementById('status');
const meterBar = document.getElementById('meter-bar');

let isListening = false;

// 注册 Service Worker (PWA 安装的必要条件)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
        console.log("🟢 Service Worker 注册成功");
    }).catch(err => {
        console.log("🔴 Service Worker 注册失败:", err);
    });
}

if (startBtn) {
    startBtn.addEventListener('click', async () => {
        if (isListening) return; // 防止重复启动

        try {
            console.log("⏳ 正在请求麦克风...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("✅ 麦克风已就绪！");
            
            isListening = true;
            startBtn.textContent = "监听中...";
            startBtn.style.background = "#4fb1c2";
            if(statusDiv) statusDiv.textContent = "请打个响指测试";
            
            initAudio(stream); 
            
        } catch (err) {
            console.error("🔴 获取麦克风失败:", err);
            if(statusDiv) statusDiv.innerHTML = "获取麦克风失败，请检查权限。<br>确保处于 HTTPS 或 localhost 环境。";
        }
    });
}

function initAudio(stream) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    
    analyser.fftSize = 256; 
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    let lastTrigger = 0;
    let previousHighEnergy = 0;

    // 【新增：状态机变量】
    let isVerifying = false; // 是否正在验证“极速衰减”
    let verifyFrames = 0;    // 验证阶段经过了多少帧
    let peakEnergy = 0;      // 记录爆发那一瞬间的最高能量

    function analyze() {
        analyser.getByteFrequencyData(dataArray);
        
        let lowBandEnergy = 0;
        let highBandEnergy = 0;
        
        for (let i = 0; i < 6; i++) { lowBandEnergy += dataArray[i]; }
        lowBandEnergy /= 6;

        for (let i = 12; i < 45; i++) { highBandEnergy += dataArray[i]; }
        highBandEnergy /= 33;

        let highVolumeDelta = highBandEnergy - previousHighEnergy;
        previousHighEnergy = highBandEnergy;

        if (meterBar) {
            meterBar.style.width = (highBandEnergy / 255 * 100) + '%';
            // 验证中途，让进度条变黄提示正在识别
            if (isVerifying) meterBar.style.background = "#FFCC00"; 
            else if (meterBar.style.background !== "rgb(255, 59, 48)") meterBar.style.background = "#4CD964";
        }

        // ==========================================
        // 核心逻辑：带有“包络线(ADSR)”验证的检测
        // ==========================================

        if (isVerifying) {
            // 1. 验证阶段：我们观察接下来的几帧（网页渲染通常1秒60帧，12帧大约是 0.2 秒）
            verifyFrames++;

            // 如果能量迅速下跌（跌到最高峰的 40% 以下，或者直接低于绝对安静值 30）
            if (highBandEnergy < peakEnergy * 0.5 || highBandEnergy < 30) {
                // ✅ 验证成功：声音极速衰减，确认为短促响指！
                isVerifying = false;
                if (Date.now() - lastTrigger > 1500) {
                    lastTrigger = Date.now();
                    console.log(`💥 验证通过：短促响指！爆发:${peakEnergy.toFixed(1)}`);
                    triggerWebhook(peakEnergy.toFixed(0));
                }
            } else if (verifyFrames > 40) {
                // ❌ 验证失败：过了 0.2 秒声音还是很大，说明是持续的说话声或长音
                isVerifying = false;
                console.log(`🚫 拦截持续长音/说话，当前能量: ${highBandEnergy.toFixed(1)}`);
            }
        } else {
            // 2. 监听阶段：寻找瞬间爆发点
            // highVolumeDelta > 30 保证了打响指前一瞬间是安静的
            if (highVolumeDelta > 30 && highBandEnergy > (lowBandEnergy * 1.5) && highBandEnergy > 60) {
                // 找到爆发点，但不立刻触发！进入验证状态
                isVerifying = true;
                verifyFrames = 0;
                peakEnergy = highBandEnergy;
            }
        }
        
        requestAnimationFrame(analyze);
    }
    analyze();
}

async function triggerWebhook(vol) {
    // 1. 触发页面发光效果！
    document.body.classList.add('glow-active');
    
    if(statusDiv) statusDiv.innerHTML = `✨ 魔法触发！(能量: ${vol})<br>正在召唤 Home Assistant...`;
    if(meterBar) meterBar.style.background = "#51b9d3"; 

    try {
        await fetch('https://ha.yifanovo.com/api/webhook/scene_cycles', {
            method: 'POST',
            mode: 'no-cors' 
        });
        console.log("🚀 Webhook 请求已发射！");
    } catch (e) {
        console.error("❌ Webhook 发送失败", e);
        if(statusDiv) statusDiv.textContent = "发送失败，请检查网络。";
    }

    // 2. 300毫秒后撤销发光效果，形成“闪烁”感
    setTimeout(() => {
        document.body.classList.remove('glow-active');
        if(meterBar) meterBar.style.background = "#4CD964"; 
    }, 1000);

    // 3. 1.5秒后恢复文字提示
    setTimeout(() => {
        if(statusDiv) statusDiv.textContent = "继续监听中...";
    }, 1500);
}