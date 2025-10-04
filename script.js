// 全局变量
let beadGenerator = null;
let weightTracker = null;
let travelPlanner = null;
const CORRECT_PASSWORD = '0258747';

// 页面切换函数
function showApp(appName) {
    // 检查登录状态
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        // 如果未登录，强制返回登录页面
        showLoginPage();
        return;
    }
    
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示目标页面
    const targetPage = document.getElementById(appName + 'Page');
    if (targetPage) {
        targetPage.classList.add('active');
        
        // 初始化对应的应用
        if (appName === 'bead' && !beadGenerator) {
            beadGenerator = new BeadPatternGenerator();
        } else if (appName === 'weight' && !weightTracker) {
            weightTracker = new WeightTracker();
        } else if (appName === 'travel' && !travelPlanner) {
            travelPlanner = new TravelPlanner();
        }
    }
}

// 显示登录页面
function showLoginPage() {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('loginPage').classList.add('active');
}

// 全局退出登录函数
function logout() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        localStorage.removeItem('isLoggedIn');
        showLoginPage();
        document.getElementById('passwordInput').value = '';
    }
}

// 登录功能
class LoginManager {
    constructor() {
        this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        this.initializeLogin();
    }

    initializeLogin() {
        const passwordInput = document.getElementById('passwordInput');
        const loginBtn = document.getElementById('loginBtn');
        const loginMessage = document.getElementById('loginMessage');

        // 登录按钮事件
        loginBtn.addEventListener('click', () => {
            this.handleLogin();
        });

        // 回车键登录
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        // 如果已经登录，直接进入主页
        if (this.isLoggedIn) {
            this.showHomePage();
        }
    }

    handleLogin() {
        const passwordInput = document.getElementById('passwordInput');
        const loginMessage = document.getElementById('loginMessage');
        const password = passwordInput.value.trim();

        if (password === CORRECT_PASSWORD) {
            this.isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            this.showMessage('登录成功！', 'success');
            setTimeout(() => {
                this.showHomePage();
            }, 1000);
        } else {
            this.showMessage('密码错误，请重新输入！', 'error');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    showMessage(message, type) {
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = message;
        loginMessage.className = `login-message ${type} show`;
        
        setTimeout(() => {
            loginMessage.classList.remove('show');
        }, 3000);
    }

    showHomePage() {
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('homePage').classList.add('active');
    }

    logout() {
        this.isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        showLoginPage();
        document.getElementById('passwordInput').value = '';
    }
}

// 拼豆画生成器
class BeadPatternGenerator {
    constructor() {
        this.originalImage = null;
        this.previewCanvas = document.getElementById('previewCanvas');
        this.resultCanvas = document.getElementById('resultCanvas');
        this.previewCtx = this.previewCanvas.getContext('2d');
        this.resultCtx = this.resultCanvas.getContext('2d');
        
        this.width = 20;
        this.height = 20;
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 文件上传
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        
        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        imageInput.addEventListener('change', this.handleFileSelect.bind(this));

        // 控制参数
        document.getElementById('widthInput').addEventListener('input', this.updateWidth.bind(this));
        document.getElementById('heightInput').addEventListener('input', this.updateHeight.bind(this));
        document.getElementById('offsetX').addEventListener('input', this.updateOffsetX.bind(this));
        document.getElementById('offsetY').addEventListener('input', this.updateOffsetY.bind(this));
        document.getElementById('scaleInput').addEventListener('input', this.updateScale.bind(this));

        // 生成按钮
        document.getElementById('generateBtn').addEventListener('click', this.generatePattern.bind(this));
        
        // 下载和打印按钮
        document.getElementById('downloadBtn').addEventListener('click', this.downloadPattern.bind(this));
        document.getElementById('printBtn').addEventListener('click', this.printPattern.bind(this));
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.loadImage(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateWidth(e) {
        this.width = parseInt(e.target.value);
        this.updatePreview();
    }

    updateHeight(e) {
        this.height = parseInt(e.target.value);
        this.updatePreview();
    }

    updateOffsetX(e) {
        this.offsetX = parseInt(e.target.value);
        document.getElementById('offsetXValue').textContent = this.offsetX;
        this.updatePreview();
    }

    updateOffsetY(e) {
        this.offsetY = parseInt(e.target.value);
        document.getElementById('offsetYValue').textContent = this.offsetY;
        this.updatePreview();
    }

    updateScale(e) {
        this.scale = parseFloat(e.target.value);
        document.getElementById('scaleValue').textContent = this.scale.toFixed(1);
        this.updatePreview();
    }

    updatePreview() {
        if (!this.originalImage) return;

        const canvas = this.previewCanvas;
        const ctx = this.previewCtx;
        
        // 设置画布大小
        const maxSize = 400;
        const aspectRatio = this.originalImage.width / this.originalImage.height;
        let canvasWidth, canvasHeight;
        
        if (aspectRatio > 1) {
            canvasWidth = maxSize;
            canvasHeight = maxSize / aspectRatio;
        } else {
            canvasHeight = maxSize;
            canvasWidth = maxSize * aspectRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // 绘制原图
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(this.originalImage, 0, 0, canvasWidth, canvasHeight);
        
        // 绘制网格预览
        this.drawGridPreview(ctx, canvasWidth, canvasHeight);
    }

    drawGridPreview(ctx, canvasWidth, canvasHeight) {
        const cellWidth = canvasWidth / this.width;
        const cellHeight = canvasHeight / this.height;
        
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 1;
        
        // 绘制网格线
        for (let i = 0; i <= this.width; i++) {
            const x = i * cellWidth;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
        }
        
        for (let i = 0; i <= this.height; i++) {
            const y = i * cellHeight;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
        }
    }

    generatePattern() {
        if (!this.originalImage) {
            alert('请先上传图片！');
            return;
        }

        const canvas = this.resultCanvas;
        const ctx = this.resultCtx;
        
        // 设置画布大小（每个豆子20x20像素）
        const beadSize = 20;
        canvas.width = this.width * beadSize;
        canvas.height = this.height * beadSize;
        
        // 创建临时画布来处理图片
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 计算缩放后的图片尺寸
        const scaledWidth = this.originalImage.width * this.scale;
        const scaledHeight = this.originalImage.height * this.scale;
        
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        
        // 绘制缩放后的图片
        tempCtx.drawImage(this.originalImage, 0, 0, scaledWidth, scaledHeight);
        
        // 获取图片数据
        const imageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight);
        const data = imageData.data;
        
        // 清空结果画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 生成拼豆图案
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // 计算在缩放图片中的采样位置
                const sampleX = Math.floor((x / this.width) * scaledWidth + this.offsetX);
                const sampleY = Math.floor((y / this.height) * scaledHeight + this.offsetY);
                
                // 确保采样位置在图片范围内
                if (sampleX >= 0 && sampleX < scaledWidth && sampleY >= 0 && sampleY < scaledHeight) {
                    const pixelIndex = (sampleY * scaledWidth + sampleX) * 4;
                    const r = data[pixelIndex];
                    const g = data[pixelIndex + 1];
                    const b = data[pixelIndex + 2];
                    const a = data[pixelIndex + 3];
                    
                    if (a > 128) { // 只处理不透明的像素
                        // 绘制豆子
                        const beadX = x * beadSize;
                        const beadY = y * beadSize;
                        
                        // 绘制豆子的圆形效果
                        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                        ctx.fillRect(beadX, beadY, beadSize, beadSize);
                        
                        // 添加高光效果
                        const gradient = ctx.createRadialGradient(
                            beadX + beadSize * 0.3, beadY + beadSize * 0.3, 0,
                            beadX + beadSize * 0.3, beadY + beadSize * 0.3, beadSize * 0.5
                        );
                        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
                        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(beadX, beadY, beadSize, beadSize);
                        
                        // 绘制边框
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(beadX, beadY, beadSize, beadSize);
                    }
                }
            }
        }
        
        // 显示结果区域
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    }

    downloadPattern() {
        const canvas = this.resultCanvas;
        const link = document.createElement('a');
        link.download = '拼豆图纸.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    printPattern() {
        const canvas = this.resultCanvas;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>拼豆图纸</title>
                    <style>
                        body { margin: 0; padding: 20px; text-align: center; }
                        img { max-width: 100%; height: auto; }
                        @media print {
                            body { margin: 0; padding: 0; }
                        }
                    </style>
                </head>
                <body>
                    <h2>拼豆图纸</h2>
                    <p>尺寸: ${this.width} × ${this.height} 豆子</p>
                    <img src="${canvas.toDataURL()}" alt="拼豆图纸">
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

// 减肥日历表
class WeightTracker {
    constructor() {
        this.currentMonth = new Date().toISOString().slice(0, 7);
        this.weightData = this.loadWeightData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateMonthSelector();
        this.renderCalendar();
        this.updateStats();
        this.renderChart();
    }

    setupEventListeners() {
        // 月份选择器
        document.getElementById('month-select').addEventListener('change', (e) => {
            this.currentMonth = e.target.value;
            this.renderCalendar();
            this.updateStats();
            this.renderChart();
        });

        // 保存体重按钮
        document.getElementById('save-weight').addEventListener('click', () => {
            this.saveWeight();
        });

        // 体重输入框回车键
        document.getElementById('weight').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveWeight();
            }
        });

        // 添加触摸事件支持
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        // 为日历添加触摸反馈
        const calendar = document.getElementById('calendar');
        let touchStartY = 0;
        let touchStartX = 0;

        calendar.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        calendar.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = touchStartX - touchEndX;

            // 检测滑动切换月份
            if (Math.abs(deltaY) < 50 && Math.abs(deltaX) > 100) {
                if (deltaX > 0) {
                    this.switchMonth(1); // 向右滑动，下个月
                } else {
                    this.switchMonth(-1); // 向左滑动，上个月
                }
            }
        }, { passive: true });

        // 为按钮添加触摸反馈
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            }, { passive: true });

            button.addEventListener('touchend', () => {
                button.style.transform = 'scale(1)';
            }, { passive: true });
        });
    }

    switchMonth(direction) {
        const currentDate = new Date(this.currentMonth + '-01');
        currentDate.setMonth(currentDate.getMonth() + direction);
        const newMonth = currentDate.toISOString().slice(0, 7);
        
        this.currentMonth = newMonth;
        document.getElementById('month-select').value = newMonth;
        this.renderCalendar();
        this.updateStats();
        this.renderChart();
    }

    updateMonthSelector() {
        const monthSelect = document.getElementById('month-select');
        monthSelect.value = this.currentMonth;
    }

    saveWeight() {
        const weightInput = document.getElementById('weight');
        const weight = parseFloat(weightInput.value);

        if (!weight || weight <= 0 || weight > 300) {
            this.showMessage('请输入有效的体重值（0-300kg）', 'error');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const month = today.slice(0, 7);

        if (month !== this.currentMonth) {
            this.showMessage('请选择当前月份来记录体重', 'error');
            return;
        }

        this.weightData[today] = weight;
        this.saveWeightData();
        
        weightInput.value = '';
        this.showMessage('体重记录成功！', 'success');
        
        this.renderCalendar();
        this.updateStats();
        this.renderChart();
    }

    showMessage(message, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建新消息
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        // 插入到控制区域
        const controls = document.querySelector('.controls');
        controls.appendChild(messageDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    renderCalendar() {
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';

        const [year, month] = this.currentMonth.split('-').map(Number);
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay();

        // 添加上个月的日期
        const prevMonth = new Date(year, month - 2, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = this.createDayElement(day, true);
            calendar.appendChild(dayElement);
        }

        // 添加当前月的日期
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day, false);
            calendar.appendChild(dayElement);
        }

        // 添加下个月的日期
        const remainingCells = 42 - (startDayOfWeek + daysInMonth);
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, true);
            calendar.appendChild(dayElement);
        }
    }

    createDayElement(day, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }

        // 检查是否是今天
        const today = new Date();
        const currentDate = new Date(this.currentMonth + '-' + day.toString().padStart(2, '0'));
        if (!isOtherMonth && this.isSameDay(today, currentDate)) {
            dayElement.classList.add('today');
        }

        // 添加日期数字
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // 添加体重数据
        if (!isOtherMonth) {
            const dateStr = this.currentMonth + '-' + day.toString().padStart(2, '0');
            const weight = this.weightData[dateStr];
            
            if (weight) {
                dayElement.classList.add('has-weight');
                const dayWeight = document.createElement('div');
                dayWeight.className = 'day-weight';
                dayWeight.textContent = weight + 'kg';
                dayElement.appendChild(dayWeight);
            }
        }

        // 点击事件
        dayElement.addEventListener('click', () => {
            if (!isOtherMonth) {
                this.editWeight(day);
            }
        });

        return dayElement;
    }

    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    editWeight(day) {
        const dateStr = this.currentMonth + '-' + day.toString().padStart(2, '0');
        const currentWeight = this.weightData[dateStr];
        
        const weight = prompt(`请输入 ${dateStr} 的体重（kg）:`, currentWeight || '');
        
        if (weight !== null) {
            const weightValue = parseFloat(weight);
            if (weightValue && weightValue > 0 && weightValue <= 300) {
                this.weightData[dateStr] = weightValue;
                this.saveWeightData();
                this.renderCalendar();
                this.updateStats();
                this.renderChart();
                this.showMessage('体重更新成功！', 'success');
            } else if (weight === '') {
                // 删除记录
                delete this.weightData[dateStr];
                this.saveWeightData();
                this.renderCalendar();
                this.updateStats();
                this.renderChart();
                this.showMessage('体重记录已删除！', 'success');
            } else {
                this.showMessage('请输入有效的体重值', 'error');
            }
        }
    }

    updateStats() {
        const monthData = this.getMonthData();
        const recordedDays = monthData.length;
        const initialWeight = monthData.length > 0 ? monthData[0].weight : null;
        const currentWeight = monthData.length > 0 ? monthData[monthData.length - 1].weight : null;
        const weightChange = initialWeight && currentWeight ? (currentWeight - initialWeight).toFixed(1) : null;

        document.getElementById('recorded-days').textContent = recordedDays;
        document.getElementById('initial-weight').textContent = initialWeight ? initialWeight + 'kg' : '--';
        document.getElementById('current-weight').textContent = currentWeight ? currentWeight + 'kg' : '--';
        
        const changeElement = document.getElementById('weight-change');
        if (weightChange !== null) {
            changeElement.textContent = (weightChange > 0 ? '+' : '') + weightChange + 'kg';
            changeElement.style.color = weightChange > 0 ? '#f44336' : '#4caf50';
        } else {
            changeElement.textContent = '--';
            changeElement.style.color = '#666';
        }
    }

    getMonthData() {
        const monthData = [];
        const [year, month] = this.currentMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = this.currentMonth + '-' + day.toString().padStart(2, '0');
            if (this.weightData[dateStr]) {
                monthData.push({
                    date: dateStr,
                    weight: this.weightData[dateStr]
                });
            }
        }

        return monthData;
    }

    renderChart() {
        const canvas = document.getElementById('weight-chart');
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const monthData = this.getMonthData();
        
        if (monthData.length < 2) {
            ctx.fillStyle = '#999';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('需要至少2个数据点才能显示趋势图', canvas.width / 2, canvas.height / 2);
            return;
        }

        const padding = 40;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;
        
        // 计算数据范围
        const weights = monthData.map(d => d.weight);
        const minWeight = Math.min(...weights);
        const maxWeight = Math.max(...weights);
        const weightRange = maxWeight - minWeight;
        const weightPadding = weightRange * 0.1;
        
        // 绘制坐标轴
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // 绘制网格线
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        
        // 绘制数据点
        ctx.strokeStyle = '#667eea';
        ctx.fillStyle = '#667eea';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        monthData.forEach((point, index) => {
            const x = padding + (chartWidth / (monthData.length - 1)) * index;
            const y = canvas.height - padding - ((point.weight - (minWeight - weightPadding)) / (weightRange + 2 * weightPadding)) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        
        // 绘制数据点
        monthData.forEach((point, index) => {
            const x = padding + (chartWidth / (monthData.length - 1)) * index;
            const y = canvas.height - padding - ((point.weight - (minWeight - weightPadding)) / (weightRange + 2 * weightPadding)) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // 绘制标签
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // Y轴标签
        for (let i = 0; i <= 4; i++) {
            const weight = minWeight - weightPadding + (weightRange + 2 * weightPadding) * (4 - i) / 4;
            const y = padding + (chartHeight / 4) * i;
            ctx.fillText(weight.toFixed(1), padding - 10, y + 4);
        }
        
        // X轴标签（日期）
        monthData.forEach((point, index) => {
            const x = padding + (chartWidth / (monthData.length - 1)) * index;
            const day = point.date.split('-')[2];
            ctx.fillText(day, x, canvas.height - padding + 20);
        });
    }

    loadWeightData() {
        const data = localStorage.getItem('weightTrackerData');
        return data ? JSON.parse(data) : {};
    }

    saveWeightData() {
        localStorage.setItem('weightTrackerData', JSON.stringify(this.weightData));
    }
}

// 旅行规划器
class TravelPlanner {
    constructor() {
        this.tripLocations = [];
        this.map = null;
        this.markers = [];
        this.routeControl = null;
        this.isSatelliteView = false;
        this.mapInitialized = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTripData();
        this.initializeMap();
        this.updateTripList();
        this.updateRouteInfo();
    }

    setupEventListeners() {
        // 添加地点按钮
        document.getElementById('addLocationBtn').addEventListener('click', () => {
            this.addLocation();
        });

        // 回车键添加地点
        document.getElementById('locationInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addLocation();
            }
        });

        // 清空行程按钮
        document.getElementById('clearTripBtn').addEventListener('click', () => {
            this.clearTrip();
        });

        // 优化路线按钮
        document.getElementById('optimizeRouteBtn').addEventListener('click', () => {
            this.optimizeRoute();
        });

        // 地图控制按钮
        document.getElementById('centerMapBtn').addEventListener('click', () => {
            this.centerMap();
        });

        document.getElementById('toggleSatelliteBtn').addEventListener('click', () => {
            this.toggleSatelliteView();
        });

        document.getElementById('fitBoundsBtn').addEventListener('click', () => {
            this.fitBounds();
        });

        // 设置默认日期为今天
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dateInput').value = today;
    }

    addLocation() {
        const locationInput = document.getElementById('locationInput');
        const dateInput = document.getElementById('dateInput');
        const timeInput = document.getElementById('timeInput');
        const notesInput = document.getElementById('notesInput');

        const location = locationInput.value.trim();
        const date = dateInput.value;
        const time = timeInput.value;
        const notes = notesInput.value.trim();

        if (!location) {
            this.showMessage('请输入地点名称！', 'error');
            return;
        }

        if (!date) {
            this.showMessage('请选择到达日期！', 'error');
            return;
        }

        // 创建地点对象
        const tripLocation = {
            id: Date.now(),
            location: location,
            date: date,
            time: time || '12:00',
            notes: notes,
            coordinates: null // 将在获取地理编码后填充
        };

        this.tripLocations.push(tripLocation);
        this.saveTripData();
        this.updateTripList();
        this.updateRouteInfo();

        // 清空输入框
        locationInput.value = '';
        notesInput.value = '';

        // 获取地理编码
        this.geocodeLocation(tripLocation);
    }

    async geocodeLocation(tripLocation) {
        try {
            // 使用Nominatim API进行地理编码（免费）
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(tripLocation.location)}&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                tripLocation.coordinates = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                this.saveTripData();
                this.updateMap();
            } else {
                this.showMessage(`无法找到地点：${tripLocation.location}`, 'error');
            }
        } catch (error) {
            console.error('地理编码错误:', error);
            this.showMessage('获取地点坐标失败，请检查网络连接', 'error');
        }
    }

    updateTripList() {
        const tripList = document.getElementById('tripList');
        
        if (this.tripLocations.length === 0) {
            tripList.innerHTML = `
                <div class="empty-trip">
                    <p>还没有添加任何行程</p>
                    <p>请在上方添加您要访问的地点</p>
                </div>
            `;
            return;
        }

        tripList.innerHTML = this.tripLocations.map((location, index) => `
            <div class="trip-item" data-id="${location.id}">
                <div class="trip-item-header">
                    <span class="trip-location">${location.location}</span>
                    <span class="trip-order">${index + 1}</span>
                </div>
                <div class="trip-datetime">${location.date} ${location.time}</div>
                ${location.notes ? `<div class="trip-notes">${location.notes}</div>` : ''}
            </div>
        `).join('');
    }

    initializeMap() {
        const mapContainer = document.getElementById('map');
        
        // 显示地图加载提示
        mapContainer.innerHTML = `
            <div style="text-align: center; color: #666; padding: 50px;">
                <div style="font-size: 24px; margin-bottom: 10px;">🗺️</div>
                <div>正在加载地图...</div>
                <div style="font-size: 12px; margin-top: 5px;">请稍候</div>
            </div>
        `;

        // 延迟初始化地图，确保DOM完全加载
        setTimeout(() => {
            this.initLeafletMap();
        }, 500);
    }

    initLeafletMap() {
        try {
            // 初始化地图，默认中心点为中国
            this.map = L.map('map', {
                center: [39.9042, 116.4074], // 北京坐标
                zoom: 4,
                zoomControl: true,
                attributionControl: true
            });

            // 添加地图图层
            this.addMapLayers();
            
            this.mapInitialized = true;
            this.updateMap();
            
            // 添加地图加载完成事件
            this.map.whenReady(() => {
                console.log('地图加载完成');
            });

        } catch (error) {
            console.error('地图初始化失败:', error);
            this.showMapError();
        }
    }

    addMapLayers() {
        // 标准地图图层
        this.standardLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        });

        // 卫星图层（使用Esri的卫星图）
        this.satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© <a href="https://www.esri.com/">Esri</a>',
            maxZoom: 19
        });

        // 默认添加标准图层
        this.standardLayer.addTo(this.map);
    }

    showMapError() {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = `
            <div style="text-align: center; color: #f44336; padding: 50px;">
                <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
                <div>地图加载失败</div>
                <div style="font-size: 12px; margin-top: 5px;">请检查网络连接</div>
            </div>
        `;
    }

    updateMap() {
        if (!this.mapInitialized || !this.map) {
            return;
        }

        // 清除现有标记和路线
        this.clearMapMarkers();
        this.clearRoute();

        // 过滤出有坐标的地点
        const locationsWithCoords = this.tripLocations.filter(loc => loc.coordinates);
        
        if (locationsWithCoords.length === 0) {
            return;
        }

        // 添加地点标记
        this.addMarkersToMap(locationsWithCoords);

        // 添加路线
        if (locationsWithCoords.length > 1) {
            this.addRouteToMap(locationsWithCoords);
        }

        // 调整地图视图
        this.fitMapToLocations(locationsWithCoords);
    }

    clearMapMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];
    }

    clearRoute() {
        if (this.routeControl) {
            this.map.removeControl(this.routeControl);
            this.routeControl = null;
        }
    }

    addMarkersToMap(locations) {
        locations.forEach((location, index) => {
            // 创建自定义图标
            const icon = L.divIcon({
                className: 'custom-marker',
                html: `
                    <div style="
                        background: #667eea; 
                        color: white; 
                        padding: 8px 12px; 
                        border-radius: 20px; 
                        font-size: 12px; 
                        font-weight: bold; 
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        white-space: nowrap;
                        border: 2px solid white;
                        position: relative;
                    ">
                        ${index + 1}. ${location.location}
                        <div style="
                            position: absolute;
                            bottom: -8px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 0;
                            height: 0;
                            border-left: 8px solid transparent;
                            border-right: 8px solid transparent;
                            border-top: 8px solid #667eea;
                        "></div>
                    </div>
                `,
                iconSize: [120, 40],
                iconAnchor: [60, 40]
            });

            // 创建标记
            const marker = L.marker([location.coordinates.lat, location.coordinates.lng], { icon: icon });
            
            // 添加弹出窗口
            const popupContent = `
                <div style="min-width: 200px;">
                    <h4 style="margin: 0 0 8px 0; color: #333;">${location.location}</h4>
                    <p style="margin: 4px 0; color: #666; font-size: 14px;">
                        <strong>日期：</strong>${location.date}
                    </p>
                    <p style="margin: 4px 0; color: #666; font-size: 14px;">
                        <strong>时间：</strong>${location.time}
                    </p>
                    ${location.notes ? `<p style="margin: 4px 0; color: #555; font-size: 13px; font-style: italic;">${location.notes}</p>` : ''}
                    <p style="margin: 4px 0; color: #999; font-size: 12px;">
                        坐标：${location.coordinates.lat.toFixed(4)}, ${location.coordinates.lng.toFixed(4)}
                    </p>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            marker.addTo(this.map);
            this.markers.push(marker);
        });
    }

    addRouteToMap(locations) {
        // 准备路线点
        const waypoints = locations.map(location => 
            L.latLng(location.coordinates.lat, location.coordinates.lng)
        );

        // 创建路线控制
        this.routeControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: false,
            addWaypoints: false,
            createMarker: function() { return null; }, // 不创建默认标记
            lineOptions: {
                styles: [
                    {
                        color: '#667eea',
                        weight: 4,
                        opacity: 0.8
                    }
                ]
            },
            show: false, // 隐藏路线详情面板
            collapsible: false
        }).addTo(this.map);

        // 监听路线计算完成事件
        this.routeControl.on('routesfound', (e) => {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const route = routes[0];
                this.updateRouteInfo(route);
            }
        });
    }

    fitMapToLocations(locations) {
        if (locations.length === 0) return;

        if (locations.length === 1) {
            // 只有一个地点，居中显示
            this.map.setView([locations[0].coordinates.lat, locations[0].coordinates.lng], 10);
        } else {
            // 多个地点，适应范围显示
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    centerMap() {
        if (!this.mapInitialized || !this.map) {
            this.showMessage('地图未初始化！', 'error');
            return;
        }

        const locationsWithCoords = this.tripLocations.filter(loc => loc.coordinates);
        if (locationsWithCoords.length === 0) {
            this.showMessage('请先添加地点！', 'error');
            return;
        }

        this.fitMapToLocations(locationsWithCoords);
        this.showMessage('地图已居中显示', 'success');
    }

    toggleSatelliteView() {
        if (!this.mapInitialized || !this.map) {
            this.showMessage('地图未初始化！', 'error');
            return;
        }

        this.isSatelliteView = !this.isSatelliteView;
        
        // 清除当前图层
        this.map.eachLayer(layer => {
            if (layer instanceof L.TileLayer) {
                this.map.removeLayer(layer);
            }
        });

        // 添加新图层
        if (this.isSatelliteView) {
            this.satelliteLayer.addTo(this.map);
        } else {
            this.standardLayer.addTo(this.map);
        }

        this.showMessage(`已切换到${this.isSatelliteView ? '卫星' : '地图'}视图`, 'success');
    }

    fitBounds() {
        if (!this.mapInitialized || !this.map) {
            this.showMessage('地图未初始化！', 'error');
            return;
        }

        const locationsWithCoords = this.tripLocations.filter(loc => loc.coordinates);
        if (locationsWithCoords.length === 0) {
            this.showMessage('请先添加地点！', 'error');
            return;
        }

        this.fitMapToLocations(locationsWithCoords);
        this.showMessage('地图已适应范围显示', 'success');
    }

    optimizeRoute() {
        if (this.tripLocations.length < 2) {
            this.showMessage('至少需要2个地点才能优化路线！', 'error');
            return;
        }

        // 简单的路线优化：按日期排序
        this.tripLocations.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateA - dateB;
        });

        this.saveTripData();
        this.updateTripList();
        this.updateMap();
        this.showMessage('路线已优化！', 'success');
    }

    clearTrip() {
        if (this.tripLocations.length === 0) {
            this.showMessage('行程列表已经是空的！', 'error');
            return;
        }

        if (confirm('确定要清空所有行程吗？')) {
            this.tripLocations = [];
            this.saveTripData();
            this.updateTripList();
            this.updateMap();
            this.updateRouteInfo();
            this.showMessage('行程已清空！', 'success');
        }
    }

    updateRouteInfo(route = null) {
        const locationCount = this.tripLocations.length;
        const locationsWithCoords = this.tripLocations.filter(loc => loc.coordinates);
        
        document.getElementById('locationCount').textContent = locationCount;
        
        if (locationsWithCoords.length < 2) {
            document.getElementById('totalDistance').textContent = '--';
            document.getElementById('totalTime').textContent = '--';
            document.getElementById('routeDetails').innerHTML = '<p>请添加至少2个地点来查看路线</p>';
            return;
        }

        if (route) {
            // 使用真实路线数据
            const totalDistance = (route.summary.totalDistance / 1000).toFixed(1); // 转换为公里
            const totalTime = Math.round(route.summary.totalTime / 60); // 转换为分钟
            
            document.getElementById('totalDistance').textContent = `${totalDistance} km`;
            document.getElementById('totalTime').textContent = `${totalTime} 分钟`;
        } else {
            // 使用简化计算
            let totalDistance = 0;
            for (let i = 0; i < locationsWithCoords.length - 1; i++) {
                const distance = this.calculateDistance(
                    locationsWithCoords[i].coordinates,
                    locationsWithCoords[i + 1].coordinates
                );
                totalDistance += distance;
            }

            // 估算时间（假设平均速度50km/h）
            const estimatedTime = Math.round(totalDistance / 50 * 60); // 分钟

            document.getElementById('totalDistance').textContent = `${totalDistance.toFixed(1)} km`;
            document.getElementById('totalTime').textContent = `${estimatedTime} 分钟`;
        }

        // 显示详细路线
        const routeDetails = locationsWithCoords.map((location, index) => 
            `${index + 1}. ${location.location} (${location.date} ${location.time})`
        ).join('<br>');
        
        document.getElementById('routeDetails').innerHTML = routeDetails;
    }

    calculateDistance(coord1, coord2) {
        // 使用Haversine公式计算两点间距离
        const R = 6371; // 地球半径（公里）
        const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
        const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    showMessage(message, type) {
        // 移除现有消息
        const existingMessage = document.querySelector('.success-message, .error-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // 创建新消息
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        // 插入到控制区域
        const controls = document.querySelector('.travel-controls');
        controls.appendChild(messageDiv);

        // 3秒后自动移除
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }

    loadTripData() {
        const data = localStorage.getItem('travelPlannerData');
        this.tripLocations = data ? JSON.parse(data) : [];
    }

    saveTripData() {
        localStorage.setItem('travelPlannerData', JSON.stringify(this.tripLocations));
    }
}

// 注册Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    // 首先检查登录状态
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    // 强制检查：无论什么情况，如果未登录就显示登录页面
    if (!isLoggedIn) {
        showLoginPage();
    }
    
    // 初始化登录管理器
    const loginManager = new LoginManager();
    
    // 添加定期检查登录状态的机制
    setInterval(() => {
        const currentLoginState = localStorage.getItem('isLoggedIn') === 'true';
        if (!currentLoginState) {
            showLoginPage();
        }
    }, 1000); // 每秒检查一次
});