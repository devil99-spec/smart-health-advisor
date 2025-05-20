// Health Metrics Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadMetricsData();
});

// Dashboard Initialization
function initializeDashboard() {
    console.log('Initializing Health Metrics Dashboard...');
    
    // Validate required elements
    if (!validateRequiredElements()) {
        showErrorMessage('Some required elements are missing. Please refresh the page.');
        return;
    }
    
    // Set default date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    document.getElementById('startDate').value = formatDate(startDate);
    document.getElementById('endDate').value = formatDate(endDate);
    
    // Initialize charts
    try {
        initializeCharts();
        console.log('Charts initialized successfully');
    } catch (error) {
        console.error('Error initializing charts:', error);
        showErrorMessage('Failed to initialize charts');
    }
    
    // Update progress circles
    try {
        updateProgressCircles();
        console.log('Progress circles updated successfully');
    } catch (error) {
        console.error('Error updating progress circles:', error);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Date range changes
    document.getElementById('startDate').addEventListener('change', handleDateRangeChange);
    document.getElementById('endDate').addEventListener('change', handleDateRangeChange);
    
    // View options
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', handleViewChange);
    });
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', handleTabChange);
    });
    
    // Add metric button
    document.getElementById('addMetricBtn').addEventListener('click', showAddMetricModal);
    
    // Export data button
    document.getElementById('exportDataBtn').addEventListener('click', exportMetricsData);
    
    // Modal close button
    document.querySelector('.close-btn').addEventListener('click', hideAddMetricModal);
    
    // Add metric form submission
    document.getElementById('addMetricForm').addEventListener('submit', handleAddMetric);
    
    // Compare metrics button
    document.getElementById('compareMetricsBtn').addEventListener('click', showCompareMetricsModal);
    
    // Set goals button
    document.getElementById('setGoalsBtn').addEventListener('click', showSetGoalsModal);
}

// Chart Initialization
function initializeCharts() {
    // Vital Signs Chart
    const vitalsCtx = document.getElementById('vitalsChart').getContext('2d');
    window.vitalsChart = new Chart(vitalsCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Heart Rate',
                    data: [],
                    borderColor: '#4285f4',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Blood Pressure (Systolic)',
                    data: [],
                    borderColor: '#34a853',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Temperature',
                    data: [],
                    borderColor: '#fbbc04',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });
    
    // Initialize other charts as needed
}

// Data Loading and Management
async function loadMetricsData() {
    console.log('Starting to load metrics data...');
    
    try {
        // Show loading state
        document.querySelectorAll('.metrics-section').forEach(section => {
            section.classList.add('loading');
        });
        
        // Get date range
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        console.log('Loading data for date range:', { startDate, endDate });
        
        // Get stored metrics first
        const storedMetrics = JSON.parse(localStorage.getItem('healthMetrics')) || {
            vitals: [],
            activity: [],
            sleep: [],
            nutrition: [],
            mental: []
        };
        
        console.log('Retrieved stored metrics:', storedMetrics);
        
        // Generate sample data for empty categories
        const data = {
            vitals: storedMetrics.vitals.length > 0 ? storedMetrics.vitals : generateSampleVitalsData(startDate, endDate),
            activity: storedMetrics.activity.length > 0 ? storedMetrics.activity : generateSampleActivityData(startDate, endDate),
            sleep: storedMetrics.sleep.length > 0 ? storedMetrics.sleep : generateSampleSleepData(startDate, endDate),
            nutrition: storedMetrics.nutrition.length > 0 ? storedMetrics.nutrition : generateSampleNutritionData(startDate, endDate),
            mental: storedMetrics.mental.length > 0 ? storedMetrics.mental : generateSampleMentalHealthData(startDate, endDate)
        };
        
        console.log('Combined data ready for display:', data);
        
        // Update UI with data
        try {
            updateMetricsDisplay(data);
            console.log('Metrics display updated successfully');
        } catch (displayError) {
            console.error('Error updating metrics display:', displayError);
            throw new Error('Failed to update metrics display');
        }
        
        // Update charts
        try {
            updateCharts(data);
            console.log('Charts updated successfully');
        } catch (chartError) {
            console.error('Error updating charts:', chartError);
            throw new Error('Failed to update charts');
        }
        
        // Update insights
        try {
            generateInsights(data);
            console.log('Insights generated successfully');
        } catch (insightError) {
            console.error('Error generating insights:', insightError);
            // Don't throw error for insights, as it's not critical
        }
        
    } catch (error) {
        console.error('Error in loadMetricsData:', error);
        showErrorMessage('Failed to load metrics data: ' + error.message);
    } finally {
        // Remove loading state
        document.querySelectorAll('.metrics-section').forEach(section => {
            section.classList.remove('loading');
        });
    }
}

// Simulated data fetch - replace with actual API call
async function fetchMetricsData(startDate, endDate) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate sample data
    return {
        vitals: generateSampleVitalsData(startDate, endDate),
        activity: generateSampleActivityData(startDate, endDate),
        sleep: generateSampleSleepData(startDate, endDate),
        nutrition: generateSampleNutritionData(startDate, endDate),
        mental: generateSampleMentalHealthData(startDate, endDate)
    };
}

// Sample Data Generation
function generateSampleVitalsData(startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        data.push({
            date: formatDate(date),
            heartRate: Math.floor(Math.random() * 20) + 60, // 60-80 bpm
            bloodPressure: {
                systolic: Math.floor(Math.random() * 20) + 110, // 110-130 mmHg
                diastolic: Math.floor(Math.random() * 10) + 70 // 70-80 mmHg
            },
            temperature: (Math.random() * 0.5 + 98.0).toFixed(1), // 98.0-98.5 °F
            oxygenLevel: Math.floor(Math.random() * 3) + 97 // 97-99%
        });
    }
    
    return data;
}

// Similar functions for other metric types...

// UI Updates
function updateMetricsDisplay(data) {
    // Update vital signs
    updateVitalSigns(data.vitals);
    
    // Update activity metrics
    updateActivityMetrics(data.activity);
    
    // Update sleep metrics
    updateSleepMetrics(data.sleep);
    
    // Update nutrition metrics
    updateNutritionMetrics(data.nutrition);
    
    // Update mental health metrics
    updateMentalHealthMetrics(data.mental);
    
    // Update overall health score
    updateHealthScore(data);
}

function updateVitalSigns(vitalsData) {
    const latest = vitalsData[vitalsData.length - 1];
    
    // Update current values
    document.getElementById('heartRate').textContent = `${latest.heartRate} bpm`;
    document.getElementById('bloodPressure').textContent = 
        `${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic} mmHg`;
    document.getElementById('temperature').textContent = `${latest.temperature} °F`;
    
    // Update trends
    updateTrendIndicator('heartRateTrend', calculateTrend(vitalsData, 'heartRate'));
    updateTrendIndicator('bloodPressureTrend', calculateTrend(vitalsData, 'bloodPressure.systolic'));
    updateTrendIndicator('temperatureTrend', calculateTrend(vitalsData, 'temperature'));
    
    // Update table
    updateVitalsTable(vitalsData);
}

// Chart Updates
function updateCharts(data) {
    // Update vital signs chart
    updateVitalsChart(data.vitals);
    
    // Update other charts as needed
}

function updateVitalsChart(vitalsData) {
    const chart = window.vitalsChart;
    
    chart.data.labels = vitalsData.map(d => d.date);
    chart.data.datasets[0].data = vitalsData.map(d => d.heartRate);
    chart.data.datasets[1].data = vitalsData.map(d => d.bloodPressure.systolic);
    chart.data.datasets[2].data = vitalsData.map(d => d.temperature);
    
    chart.update();
}

// Progress Circle Updates
function updateProgressCircles() {
    document.querySelectorAll('.progress-circle').forEach(circle => {
        const progress = circle.dataset.progress;
        circle.style.setProperty('--progress', `${progress}%`);
    });
}

// Modal Handling
function showAddMetricModal() {
    document.getElementById('addMetricModal').classList.add('active');
}

function hideAddMetricModal() {
    document.getElementById('addMetricModal').classList.remove('active');
}

// Form Handling
async function handleAddMetric(event) {
    event.preventDefault();
    console.log('Handling metric addition...');
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        // Get form data
        const formData = {
            type: document.getElementById('metricType').value,
            value: document.getElementById('metricValue').value,
            date: document.getElementById('metricDate').value,
            notes: document.getElementById('metricNotes').value
        };
        
        console.log('Form data collected:', formData);
        
        // Add metric to data
        await addMetricToData(formData);
        
        // Show success message
        showSuccessMessage('Metric added successfully');
        
        // Close modal
        hideAddMetricModal();
        
        // Reset form
        event.target.reset();
        
        // Reload data to update UI
        await loadMetricsData();
        
    } catch (error) {
        console.error('Error in handleAddMetric:', error);
        showErrorMessage(error.message || 'Failed to add metric. Please try again.');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Metric';
    }
}

// Utility Functions
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function calculateTrend(data, metric) {
    if (data.length < 2) return { value: 0, direction: 'neutral' };
    
    const first = data[0][metric];
    const last = data[data.length - 1][metric];
    const change = ((last - first) / first) * 100;
    
    return {
        value: Math.abs(change).toFixed(1),
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
}

function updateTrendIndicator(elementId, trend) {
    const element = document.getElementById(elementId);
    element.className = `trend ${trend.direction}`;
    element.innerHTML = `
        <i class="fas fa-arrow-${trend.direction}"></i>
        ${trend.value}%
    `;
}

// Error and Success Messages
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    document.querySelector('.metrics-page').insertBefore(
        errorDiv,
        document.querySelector('.metrics-grid')
    );
    
    setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    document.querySelector('.metrics-page').insertBefore(
        successDiv,
        document.querySelector('.metrics-grid')
    );
    
    setTimeout(() => successDiv.remove(), 5000);
}

// Export Functionality
function exportMetricsData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Generate CSV content
    const csvContent = generateCSV(startDate, endDate);
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-metrics-${startDate}-to-${endDate}.csv`;
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Event Handlers
function handleDateRangeChange() {
    loadMetricsData();
}

function handleViewChange(event) {
    // Remove active class from all buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Update view
    loadMetricsData();
}

function handleTabChange(event) {
    // Remove active class from all tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked tab
    const tabId = event.target.dataset.tab;
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// Add missing functions for metric management
function addMetricToData(formData) {
    console.log('Adding new metric:', formData);
    
    try {
        // Validate form data
        if (!formData.type || !formData.value || !formData.date) {
            throw new Error('Missing required fields');
        }
        
        // Get existing metrics or initialize empty object
        let metrics;
        try {
            metrics = JSON.parse(localStorage.getItem('healthMetrics')) || {
                vitals: [],
                activity: [],
                sleep: [],
                nutrition: [],
                mental: []
            };
        } catch (parseError) {
            console.error('Error parsing stored metrics:', parseError);
            metrics = {
                vitals: [],
                activity: [],
                sleep: [],
                nutrition: [],
                mental: []
            };
        }
        
        // Create new metric entry
        const newMetric = {
            id: Date.now(),
            value: parseFloat(formData.value),
            date: formData.date,
            notes: formData.notes || '',
            timestamp: new Date().toISOString()
        };
        
        console.log('Created new metric entry:', newMetric);
        
        // Add to appropriate category
        switch(formData.type) {
            case 'vital':
                metrics.vitals.push({
                    ...newMetric,
                    type: 'vital',
                    category: determineVitalCategory(formData.value)
                });
                break;
            case 'activity':
                metrics.activity.push({
                    ...newMetric,
                    type: 'activity',
                    category: 'steps'
                });
                break;
            case 'sleep':
                metrics.sleep.push({
                    ...newMetric,
                    type: 'sleep',
                    category: 'duration'
                });
                break;
            case 'nutrition':
                metrics.nutrition.push({
                    ...newMetric,
                    type: 'nutrition',
                    category: 'calories'
                });
                break;
            case 'mental':
                metrics.mental.push({
                    ...newMetric,
                    type: 'mental',
                    category: 'mood'
                });
                break;
            default:
                throw new Error('Invalid metric type');
        }
        
        console.log('Updated metrics object:', metrics);
        
        // Save to localStorage
        try {
            localStorage.setItem('healthMetrics', JSON.stringify(metrics));
            console.log('Metrics saved to localStorage successfully');
        } catch (storageError) {
            console.error('Error saving to localStorage:', storageError);
            throw new Error('Failed to save metric data');
        }
        
        return true;
        
    } catch (error) {
        console.error('Error in addMetricToData:', error);
        throw error; // Re-throw to be handled by the calling function
    }
}

function determineVitalCategory(value) {
    const numValue = parseFloat(value);
    if (numValue >= 60 && numValue <= 100) return 'heartRate';
    if (numValue >= 90 && numValue <= 140) return 'bloodPressure';
    if (numValue >= 97 && numValue <= 99) return 'temperature';
    return 'other';
}

function generateCSV(startDate, endDate) {
    const metrics = JSON.parse(localStorage.getItem('healthMetrics')) || {
        vitals: [],
        activity: [],
        sleep: [],
        nutrition: [],
        mental: []
    };
    
    // Create CSV header
    let csv = 'Date,Type,Category,Value,Notes\n';
    
    // Combine all metrics
    const allMetrics = [
        ...metrics.vitals,
        ...metrics.activity,
        ...metrics.sleep,
        ...metrics.nutrition,
        ...metrics.mental
    ];
    
    // Filter by date range and add to CSV
    allMetrics
        .filter(metric => {
            const metricDate = new Date(metric.date);
            return metricDate >= new Date(startDate) && metricDate <= new Date(endDate);
        })
        .forEach(metric => {
            csv += `${metric.date},${metric.type},${metric.category},${metric.value},"${metric.notes}"\n`;
        });
    
    return csv;
}

// Add missing sample data generation functions
function generateSampleActivityData(startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        data.push({
            date: formatDate(date),
            steps: Math.floor(Math.random() * 5000) + 5000, // 5000-10000 steps
            caloriesBurned: Math.floor(Math.random() * 500) + 1500, // 1500-2000 calories
            activeMinutes: Math.floor(Math.random() * 60) + 30 // 30-90 minutes
        });
    }
    
    return data;
}

function generateSampleSleepData(startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        data.push({
            date: formatDate(date),
            duration: (Math.random() * 2 + 6).toFixed(1), // 6-8 hours
            quality: Math.floor(Math.random() * 3) + 3, // 3-5 (scale of 1-5)
            deepSleep: (Math.random() * 2 + 1).toFixed(1) // 1-3 hours
        });
    }
    
    return data;
}

function generateSampleNutritionData(startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        data.push({
            date: formatDate(date),
            calories: Math.floor(Math.random() * 500) + 1500, // 1500-2000 calories
            water: Math.floor(Math.random() * 4) + 6, // 6-10 glasses
            protein: Math.floor(Math.random() * 20) + 60, // 60-80g
            carbs: Math.floor(Math.random() * 50) + 150, // 150-200g
            fat: Math.floor(Math.random() * 15) + 45 // 45-60g
        });
    }
    
    return data;
}

function generateSampleMentalHealthData(startDate, endDate) {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        data.push({
            date: formatDate(date),
            mood: Math.floor(Math.random() * 3) + 3, // 3-5 (scale of 1-5)
            stress: Math.floor(Math.random() * 3) + 1, // 1-3 (scale of 1-5)
            energy: Math.floor(Math.random() * 3) + 3 // 3-5 (scale of 1-5)
        });
    }
    
    return data;
}

// Add missing UI update functions
function updateActivityMetrics(activityData) {
    if (!activityData || !activityData.length) return;
    
    const latest = activityData[activityData.length - 1];
    
    // Update daily steps
    const stepsElement = document.querySelector('.metric-item:nth-child(2) .value');
    if (stepsElement) {
        stepsElement.textContent = latest.steps.toLocaleString();
    }
    
    // Update trends
    updateTrendIndicator('stepsTrend', calculateTrend(activityData, 'steps'));
    
    // Update activity table if it exists
    const activityTableBody = document.getElementById('activityTableBody');
    if (activityTableBody) {
        activityTableBody.innerHTML = activityData.map(activity => `
            <tr>
                <td>${activity.date}</td>
                <td>${activity.steps.toLocaleString()}</td>
                <td>${activity.caloriesBurned}</td>
                <td>${activity.activeMinutes}</td>
            </tr>
        `).join('');
    }
}

function updateSleepMetrics(sleepData) {
    if (!sleepData || !sleepData.length) return;
    
    const latest = sleepData[sleepData.length - 1];
    
    // Update sleep duration
    const sleepElement = document.querySelector('.metric-item:nth-child(3) .value');
    if (sleepElement) {
        sleepElement.textContent = `${latest.duration} hrs`;
    }
    
    // Update trends
    updateTrendIndicator('sleepTrend', calculateTrend(sleepData, 'duration'));
    
    // Update sleep table if it exists
    const sleepTableBody = document.getElementById('sleepTableBody');
    if (sleepTableBody) {
        sleepTableBody.innerHTML = sleepData.map(sleep => `
            <tr>
                <td>${sleep.date}</td>
                <td>${sleep.duration} hrs</td>
                <td>${sleep.quality}/5</td>
                <td>${sleep.deepSleep} hrs</td>
            </tr>
        `).join('');
    }
}

function updateNutritionMetrics(nutritionData) {
    if (!nutritionData || !nutritionData.length) return;
    
    const latest = nutritionData[nutritionData.length - 1];
    
    // Update nutrition table if it exists
    const nutritionTableBody = document.getElementById('nutritionTableBody');
    if (nutritionTableBody) {
        nutritionTableBody.innerHTML = nutritionData.map(nutrition => `
            <tr>
                <td>${nutrition.date}</td>
                <td>${nutrition.calories}</td>
                <td>${nutrition.water} glasses</td>
                <td>${nutrition.protein}g</td>
                <td>${nutrition.carbs}g</td>
                <td>${nutrition.fat}g</td>
            </tr>
        `).join('');
    }
}

function updateMentalHealthMetrics(mentalData) {
    if (!mentalData || !mentalData.length) return;
    
    const latest = mentalData[mentalData.length - 1];
    
    // Update mental health table if it exists
    const mentalTableBody = document.getElementById('mentalTableBody');
    if (mentalTableBody) {
        mentalTableBody.innerHTML = mentalData.map(mental => `
            <tr>
                <td>${mental.date}</td>
                <td>${mental.mood}/5</td>
                <td>${mental.stress}/5</td>
                <td>${mental.energy}/5</td>
            </tr>
        `).join('');
    }
}

function updateHealthScore(data) {
    // Calculate overall health score based on all metrics
    const score = calculateHealthScore(data);
    
    // Update score display
    const scoreElement = document.querySelector('#overallScore .score');
    if (scoreElement) {
        scoreElement.textContent = Math.round(score.overall);
    }
    
    // Update breakdown
    updateScoreBreakdown(score);
}

function calculateHealthScore(data) {
    // Simple scoring algorithm - can be made more sophisticated
    const scores = {
        physical: 0,
        mental: 0,
        lifestyle: 0
    };
    
    // Calculate physical score from vitals and activity
    if (data.vitals && data.vitals.length) {
        const latestVitals = data.vitals[data.vitals.length - 1];
        scores.physical += calculateVitalScore(latestVitals);
    }
    
    if (data.activity && data.activity.length) {
        const latestActivity = data.activity[data.activity.length - 1];
        scores.physical += calculateActivityScore(latestActivity);
    }
    
    // Calculate mental score
    if (data.mental && data.mental.length) {
        const latestMental = data.mental[data.mental.length - 1];
        scores.mental = calculateMentalScore(latestMental);
    }
    
    // Calculate lifestyle score from sleep and nutrition
    if (data.sleep && data.sleep.length) {
        const latestSleep = data.sleep[data.sleep.length - 1];
        scores.lifestyle += calculateSleepScore(latestSleep);
    }
    
    if (data.nutrition && data.nutrition.length) {
        const latestNutrition = data.nutrition[data.nutrition.length - 1];
        scores.lifestyle += calculateNutritionScore(latestNutrition);
    }
    
    // Normalize scores to 0-100 range
    scores.physical = Math.min(100, Math.max(0, scores.physical / 2));
    scores.mental = Math.min(100, Math.max(0, scores.mental));
    scores.lifestyle = Math.min(100, Math.max(0, scores.lifestyle / 2));
    
    // Calculate overall score
    scores.overall = (scores.physical + scores.mental + scores.lifestyle) / 3;
    
    return scores;
}

function calculateVitalScore(vitals) {
    let score = 0;
    
    // Heart rate score (60-100 bpm is optimal)
    if (vitals.heartRate >= 60 && vitals.heartRate <= 100) {
        score += 50;
    } else if (vitals.heartRate >= 50 && vitals.heartRate <= 110) {
        score += 30;
    } else {
        score += 10;
    }
    
    // Blood pressure score
    if (vitals.bloodPressure.systolic >= 90 && vitals.bloodPressure.systolic <= 140) {
        score += 50;
    } else if (vitals.bloodPressure.systolic >= 80 && vitals.bloodPressure.systolic <= 150) {
        score += 30;
    } else {
        score += 10;
    }
    
    return score;
}

function calculateActivityScore(activity) {
    let score = 0;
    
    // Steps score (10,000 steps is optimal)
    if (activity.steps >= 10000) {
        score += 50;
    } else if (activity.steps >= 7500) {
        score += 40;
    } else if (activity.steps >= 5000) {
        score += 30;
    } else {
        score += 20;
    }
    
    // Active minutes score
    if (activity.activeMinutes >= 60) {
        score += 50;
    } else if (activity.activeMinutes >= 30) {
        score += 40;
    } else {
        score += 20;
    }
    
    return score;
}

function calculateMentalScore(mental) {
    // Convert 1-5 scale to 0-100
    return (mental.mood * 20) + (mental.energy * 20) + ((6 - mental.stress) * 20);
}

function calculateSleepScore(sleep) {
    let score = 0;
    
    // Duration score (7-9 hours is optimal)
    if (sleep.duration >= 7 && sleep.duration <= 9) {
        score += 50;
    } else if (sleep.duration >= 6 && sleep.duration <= 10) {
        score += 30;
    } else {
        score += 10;
    }
    
    // Quality score
    score += sleep.quality * 10;
    
    return score;
}

function calculateNutritionScore(nutrition) {
    let score = 0;
    
    // Calories score (1500-2500 is optimal)
    if (nutrition.calories >= 1500 && nutrition.calories <= 2500) {
        score += 30;
    } else if (nutrition.calories >= 1200 && nutrition.calories <= 3000) {
        score += 20;
    } else {
        score += 10;
    }
    
    // Water intake score
    if (nutrition.water >= 8) {
        score += 20;
    } else if (nutrition.water >= 6) {
        score += 15;
    } else {
        score += 10;
    }
    
    return score;
}

function updateScoreBreakdown(score) {
    // Update physical score
    const physicalProgress = document.querySelector('.breakdown-item:nth-child(1) .progress');
    if (physicalProgress) {
        physicalProgress.style.width = `${score.physical}%`;
    }
    
    // Update mental score
    const mentalProgress = document.querySelector('.breakdown-item:nth-child(2) .progress');
    if (mentalProgress) {
        mentalProgress.style.width = `${score.mental}%`;
    }
    
    // Update lifestyle score
    const lifestyleProgress = document.querySelector('.breakdown-item:nth-child(3) .progress');
    if (lifestyleProgress) {
        lifestyleProgress.style.width = `${score.lifestyle}%`;
    }
}

function updateVitalsTable(vitalsData) {
    const tableBody = document.getElementById('vitalsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = vitalsData.map(vital => `
        <tr>
            <td>${vital.date}</td>
            <td>${vital.heartRate} bpm</td>
            <td>${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic} mmHg</td>
            <td>${vital.temperature} °F</td>
            <td>${vital.oxygenLevel}%</td>
            <td>${vital.notes || '-'}</td>
        </tr>
    `).join('');
}

// Add a function to check if the required HTML elements exist
function validateRequiredElements() {
    const requiredElements = [
        'startDate',
        'endDate',
        'metricType',
        'metricValue',
        'metricDate',
        'vitalsTableBody'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('Missing required HTML elements:', missingElements);
        return false;
    }
    
    return true;
}

// Initialize the dashboard when the page loads
window.addEventListener('load', initializeDashboard); 