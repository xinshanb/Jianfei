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
    new WeightTracker();
});
