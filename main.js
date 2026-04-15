/**
 * おてんきログ - Application Logic
 */

// --- State ---
let currentTemp = 20;
let currentHum = 50;
let selectedWeather = 'sunny';
let logs = JSON.parse(localStorage.getItem('weatherLogs') || '[]');

// --- DOM Elements ---
const screens = {
    input: document.getElementById('input-screen'),
    graph: document.getElementById('graph-screen')
};

const tempDisplay = document.getElementById('temp-val');
const humDisplay = document.getElementById('hum-val');
const weatherBtns = document.querySelectorAll('.weather-btn');
const toast = document.getElementById('toast');
const listContainer = document.getElementById('list-container');
const statusCharImg = document.getElementById('status-char');
const statusSpeech = document.getElementById('character-speech');

// --- Initialization ---
function init() {
    updateDisplay();
    setupEventListeners();
    renderWeatherOptions();
}

// --- Comfort States Data ---
const comfortConfigs = {
    // T1: <0 (Very Cold)
    T1_H1: { name: "カラカラ極寒", msg: "カラカラで、すごく さむいよ！ びりびり するね。" },
    T1_H2: { name: "極寒", msg: "すごく さむいー！ おなかが すくくらい さむいね。" },
    T1_H3: { name: "底冷え・極寒", msg: "しんしんと ひえる……。すごく さむくて こおっちゃいそう。" },
    // T2: 0-10 (Cold)
    T2_H1: { name: "カサカサ寒い", msg: "おはだが カサカサするね。さむいよー。" },
    T2_H2: { name: "寒い", msg: "さむいね。ポケットに てを いれようかな。" },
    T2_H3: { name: "じめっと寒い", msg: "じめじめして、よけいに さむく かんじるね。" },
    // T3: 10-18 (Chilly)
    T3_H1: { name: "乾燥・肌寒い", msg: "ちょっと はださむいね。おめめが かわいちゃうかも。" },
    T3_H2: { name: "肌寒い", msg: "はださむいけど、ちょうどいい かもしれないね。" },
    T3_H3: { name: "少し冷える・多湿", msg: "すこし ひえるね。しめりけが おおいみたい。" },
    // T4: 18-25 (Comfortable)
    T4_H1: { name: "さわやか（乾燥注意）", msg: "さわやかだね！ でも、のどが かわくまえに おみずをのもうね。" },
    T4_H2: { name: "とても快適", msg: "とっても きもちいい！ さいこうの おてんきだね。" },
    T4_H3: { name: "やや蒸す", msg: "いいおてんきだけど、すこし ムシムシ するかな？" },
    // T5: 25-30 (Slightly Hot)
    T5_H1: { name: "カラッと少し暑い", msg: "すこし あついね。でも カラッとしていて きもちいいよ！" },
    T5_H2: { name: "少し暑い", msg: "すこし あつくなってきたね。パタパタしちゃう。" },
    T5_H3: { name: "ジメジメ少し暑い", msg: "ジメジメしていて あついよ……。むしあついね。" },
    // T6: 30-35 (Hot)
    T6_H1: { name: "日差しが痛い・暑い", msg: "ひざしが いたいくらい あつい！ おみずを のんでやすもうね。" },
    T6_H2: { name: "暑い", msg: "あー、あつい！ おそとに いるときは きをつけてね。" },
    T6_H3: { name: "蒸し暑い（不快）", msg: "ムシムシして すごく あつい！ はやく すずしいところへ いこう。" },
    // T7: >35 (Very Hot)
    T7_H1: { name: "危険な暑さ（熱風）", msg: "ねっぷうだ！ すごく あぶない あつさだよ。むりしないでね。" },
    T7_H2: { name: "猛暑（危険）", msg: "もうしょだ！ くるくるしちゃう。すぐに すずしくして！" },
    T7_H3: { name: "極めて危険な蒸し暑さ", msg: "すごく あぶないよ！ じょうきの中に いるみたい……たすけてー！" }
};

function getComfortState(temp, hum) {
    let t = "T4", h = "H2";
    if (temp < 0) t = "T1";
    else if (temp < 10) t = "T2";
    else if (temp < 18) t = "T3";
    else if (temp < 25) t = "T4";
    else if (temp < 30) t = "T5";
    else if (temp < 35) t = "T6";
    else t = "T7";

    if (hum < 40) h = "H1";
    else if (hum < 70) h = "H2";
    else h = "H3";

    return `${t}_${h}`;
}

function updateDisplay() {
    tempDisplay.textContent = currentTemp;
    humDisplay.textContent = currentHum;

    // Visual feedback for temperature
    const hue = 200 - (currentTemp + 10) * 4; 
    tempDisplay.style.color = `hsl(${Math.max(0, Math.min(200, hue))}, 70%, 50%)`;

    // Update Character and Message
    const state = getComfortState(currentTemp, currentHum);
    const config = comfortConfigs[state];
    
    if (config) {
        statusSpeech.textContent = config.msg;
        // Update image path - fallback to T4_H2 if not generated yet
        const imgPath = `assets/characters/status_${state}.png`;
        
        // Use an Image object to test if the specific image exists
        const testImg = new Image();
        testImg.onload = () => { statusCharImg.src = imgPath; };
        testImg.onerror = () => { statusCharImg.src = 'assets/characters/status_T4_H2.png'; };
        testImg.src = imgPath;
    }
}

function setupEventListeners() {
    // Steppers
    document.getElementById('temp-minus').onclick = () => { if(currentTemp > -10) { currentTemp--; updateDisplay(); } };
    document.getElementById('temp-plus').onclick = () => { if(currentTemp < 45) { currentTemp++; updateDisplay(); } };
    document.getElementById('hum-minus').onclick = () => { if(currentHum > 0) { currentHum -= 1; updateDisplay(); } };
    document.getElementById('hum-plus').onclick = () => { if(currentHum < 100) { currentHum += 1; updateDisplay(); } };

    // Weather Selection
    weatherBtns.forEach(btn => {
        btn.onclick = () => {
            selectedWeather = btn.dataset.weather;
            renderWeatherOptions();
        };
    });

    // Save Data
    document.getElementById('save-btn').onclick = saveData;

    // Data Management
    document.getElementById('reset-btn').addEventListener('click', resetData);

    // Navigation
    document.getElementById('go-to-graph').onclick = () => switchScreen('graph');
    document.getElementById('back-to-input').onclick = () => switchScreen('input');

    // Custom Confirmation Modal Event Listeners
    document.getElementById('confirm-yes').addEventListener('click', () => {
        hideConfirmModal();
        clearAllLogs(); // Call the actual log clearing function
    });
    document.getElementById('confirm-no').addEventListener('click', hideConfirmModal);
}

function renderWeatherOptions() {
    weatherBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.weather === selectedWeather);
    });
}

// Function to show the custom confirm modal
function showConfirmModal() {
    document.getElementById('custom-confirm-modal').classList.add('visible');
}

// Function to hide the custom confirm modal
function hideConfirmModal() {
    document.getElementById('custom-confirm-modal').classList.remove('visible');
}

// Actual function to clear all logs
function clearAllLogs() {
    logs = [];
    localStorage.removeItem('weatherLogs');
    renderGraph();
    renderHistoryList();
}

function resetData() {
    showConfirmModal(); // Show custom modal instead of native confirm
}

function deleteLog(id) {
    logs = logs.filter(log => log.id !== id);
    localStorage.setItem('weatherLogs', JSON.stringify(logs));
    renderGraph();
    renderHistoryList();
}

function saveData() {
    const newLog = {
        id: Date.now(),
        date: new Date().toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        temp: currentTemp,
        hum: currentHum,
        weather: selectedWeather,
        timestamp: Date.now()
    };

    logs.unshift(newLog);
    if (logs.length > 30) logs.pop(); // Keep last 30 entries

    localStorage.setItem('weatherLogs', JSON.stringify(logs));
    
    showToast();
}

function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');

    if (screenName === 'graph') {
        renderGraph();
        renderHistoryList();
    }
}

// --- Icons for Graph ---
const weatherIcons = {
    sunny: new Image(32, 32),
    cloudy: new Image(32, 32),
    rainy: new Image(32, 32),
    snowy: new Image(32, 32)
};

// SVG Data URIs for icons
weatherIcons.sunny.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80">☀️</text></svg>';
weatherIcons.cloudy.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80">☁️</text></svg>';
weatherIcons.rainy.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80">☔</text></svg>';
weatherIcons.snowy.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80">❄️</text></svg>';

// --- Visualization ---
let chartInstance = null;

function renderGraph() {
    const ctx = document.getElementById('weatherChart').getContext('2d');
    
    // Sort logs by time for graph (they are unshifted, so we reverse)
    const sortedLogs = [...logs].reverse();
    const labels = sortedLogs.map(log => log.date.split(' ')[0]); 
    const tempData = sortedLogs.map(log => log.temp);
    
    // Create point styles based on weather
    const pointStyles = sortedLogs.map(log => weatherIcons[log.weather] || 'circle');

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'きおん (℃)',
                data: tempData,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 4,
                tension: 0.4,
                pointStyle: pointStyles,
                pointRadius: 15, // Large icons
                pointHoverRadius: 18,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 16 / 9, // Force 16:9 as requested
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `きおん: ${context.parsed.y}℃`
                    }
                }
            },
            scales: {
                y: {
                    min: -15,
                    max: 50,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { size: 14, weight: 'bold' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 14, weight: 'bold' } }
                }
            }
        }
    });
}

function renderHistoryList() {
    const weatherMap = {
        sunny: '☀️ はれ',
        cloudy: '☁️ くもり',
        rainy: '☔ あめ',
        snowy: '❄️ ゆき'
    };

    listContainer.innerHTML = logs.map(log => `
        <div class="history-item">
            <div class="history-date">${log.date}</div>
            <div class="history-data">
                <span class="history-temp">${log.temp}℃</span>
                <span class="history-weather">${weatherMap[log.weather].split(' ')[0]}</span>
                <span class="history-hum">${log.hum}%</span>
                <button class="btn-delete" onclick="deleteLog(${log.id})" aria-label="けす">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Start
init();
