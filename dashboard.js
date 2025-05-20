// Dashboard Scripts for Smart Health Advisor

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('healthAdvisorCurrentUser'));
    if (!currentUser || !currentUser.isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get user data
    const users = JSON.parse(localStorage.getItem('healthAdvisorUsers') || '[]');
    const userData = users.find(user => user.id === currentUser.id);
    
    if (!userData) {
        console.error('User data not found');
        return;
    }
    
    // Update user profile information
    updateUserProfile(currentUser);
    
    // Update welcome message
    updateWelcomeMessage(currentUser);
    
    // Update health score
    updateHealthScore(userData.healthData.healthScore);
    
    // Update activity tracking
    updateActivityTracking(userData.healthData.activity);
    
    // Update AI recommendations
    updateRecommendations(userData);
    
    // Update appointments
    updateAppointments(userData.healthData.appointments);
    
    // Update medications
    updateMedications(userData.healthData.medications);
    
    // Update goals
    updateGoals(userData.healthData.goals);
    
    // Setup chat assistant
    setupChatAssistant();
    
    // Setup logout functionality
    setupLogout();
    
    // Setup medication tracking
    setupMedicationTracking();
    
    // Setup appointment management
    setupAppointmentManagement();
    
    // Setup mobile sidebar toggle
    setupMobileSidebar();
});

// Function to update user profile
function updateUserProfile(user) {
    const userProfileName = document.querySelector('.user-profile h3');
    const userProfileImage = document.querySelector('.user-profile img');
    
    if (userProfileName) {
        userProfileName.textContent = `${user.firstName} ${user.lastName}`;
    }
    
    // Set default profile image if not available
    if (userProfileImage && !userProfileImage.src) {
        userProfileImage.src = `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=4285f4&color=fff`;
    }
}

// Function to update welcome message
function updateWelcomeMessage(user) {
    const welcomeMessage = document.querySelector('.welcome-message h1');
    const welcomeDate = document.querySelector('.welcome-message p');
    
    if (welcomeMessage) {
        const greeting = getGreeting();
        welcomeMessage.textContent = `${greeting}, ${user.firstName}!`;
    }
    
    if (welcomeDate) {
        const today = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        welcomeDate.textContent = `Here's your health summary for today, ${today.toLocaleDateString('en-US', options)}`;
    }
}

// Function to get appropriate greeting based on time of day
function getGreeting() {
    const hour = new Date().getHours();
    
    if (hour < 12) {
        return 'Good morning';
    } else if (hour < 18) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
}

// Function to update health score
function updateHealthScore(healthScore) {
    const scoreCircle = document.querySelector('.circle');
    const scoreText = document.querySelector('.percentage');
    const physicalProgress = document.querySelector('.score-item:nth-child(1) .progress');
    const mentalProgress = document.querySelector('.score-item:nth-child(2) .progress');
    const nutritionProgress = document.querySelector('.score-item:nth-child(3) .progress');
    
    if (scoreCircle && scoreText) {
        scoreCircle.setAttribute('stroke-dasharray', `${healthScore.overall}, 100`);
        scoreText.textContent = healthScore.overall;
    }
    
    if (physicalProgress) {
        physicalProgress.style.width = `${healthScore.physical}%`;
    }
    
    if (mentalProgress) {
        mentalProgress.style.width = `${healthScore.mental}%`;
    }
    
    if (nutritionProgress) {
        nutritionProgress.style.width = `${healthScore.nutrition}%`;
    }
}

// Function to update activity tracking
function updateActivityTracking(activityData) {
    // Update activity metrics
    const stepsMetric = document.querySelector('.metric:nth-child(1) .metric-data h4');
    const caloriesMetric = document.querySelector('.metric:nth-child(2) .metric-data h4');
    const heartRateMetric = document.querySelector('.metric:nth-child(3) .metric-data h4');
    
    if (stepsMetric && activityData.steps.length > 0) {
        stepsMetric.textContent = activityData.steps[activityData.steps.length - 1].toLocaleString();
    }
    
    if (caloriesMetric && activityData.calories.length > 0) {
        caloriesMetric.textContent = activityData.calories[activityData.calories.length - 1].toLocaleString();
    }
    
    if (heartRateMetric && activityData.heartRate.length > 0) {
        heartRateMetric.textContent = activityData.heartRate[activityData.heartRate.length - 1];
    }
    
    // Update activity chart
    const activityChartCanvas = document.getElementById('activityChart');
    
    if (activityChartCanvas) {
        const ctx = activityChartCanvas.getContext('2d');
        
        // Generate labels for the last 7 days
        const labels = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        
        // Chart data
        const activityChartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Steps',
                    data: activityData.steps,
                    borderColor: '#4285f4',
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        };
        
        // Chart configuration
        const activityChart = new Chart(ctx, {
            type: 'line',
            data: activityChartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            drawBorder: false,
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }
}

// Function to update AI recommendations
function updateRecommendations(userData) {
    // This would typically be generated by an AI based on user data
    // For now, we'll use static recommendations
    const recommendations = [
        {
            icon: 'fas fa-bed',
            title: 'Improve Sleep Quality',
            description: 'Your sleep patterns show inconsistency. Try to maintain a regular sleep schedule.'
        },
        {
            icon: 'fas fa-apple-alt',
            title: 'Increase Fiber Intake',
            description: 'Based on your nutrition logs, we recommend adding more fiber-rich foods to your diet.'
        },
        {
            icon: 'fas fa-dumbbell',
            title: 'Add Strength Training',
            description: 'Your fitness routine could benefit from 2-3 strength training sessions per week.'
        }
    ];
    
    const recommendationsContainer = document.querySelector('.recommendations-content');
    
    if (recommendationsContainer) {
        recommendationsContainer.innerHTML = '';
        
        recommendations.forEach(rec => {
            const recHTML = `
                <div class="recommendation">
                    <div class="recommendation-icon">
                        <i class="${rec.icon}"></i>
                    </div>
                    <div class="recommendation-text">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                    </div>
                    <button class="btn btn-small">View Plan</button>
                </div>
            `;
            
            recommendationsContainer.insertAdjacentHTML('beforeend', recHTML);
        });
        
        // Add event listeners to recommendation buttons
        const viewPlanButtons = recommendationsContainer.querySelectorAll('.btn');
        viewPlanButtons.forEach(button => {
            button.addEventListener('click', function() {
                const recTitle = this.closest('.recommendation').querySelector('h4').textContent;
                alert(`Viewing plan for: ${recTitle}`);
                // In a real app, this would navigate to a detailed plan page
            });
        });
    }
}

// Function to update appointments
function updateAppointments(appointments) {
    const appointmentsContainer = document.querySelector('.appointments-content');
    
    if (appointmentsContainer && appointments.length > 0) {
        appointmentsContainer.innerHTML = '';
        
        appointments.forEach(appt => {
            const apptDate = new Date(appt.date);
            const day = apptDate.getDate();
            const month = apptDate.toLocaleString('en-US', { month: 'short' });
            
            const apptHTML = `
                <div class="appointment" data-id="${appt.id}">
                    <div class="appointment-date">
                        <span class="day">${day}</span>
                        <span class="month">${month}</span>
                    </div>
                    <div class="appointment-details">
                        <h4>${appt.doctor}</h4>
                        <p>${appt.purpose}</p>
                        <span class="time">${formatTime(appt.time)} - ${formatEndTime(appt.time, appt.duration)}</span>
                    </div>
                    <div class="appointment-actions">
                        <button class="btn btn-outline btn-small reschedule-btn">Reschedule</button>
                    </div>
                </div>
            `;
            
            appointmentsContainer.insertAdjacentHTML('beforeend', apptHTML);
        });
    }
}

// Function to update medications
function updateMedications(medications) {
    const medicationsContainer = document.querySelector('.medications-content');
    
    if (medicationsContainer && medications.length > 0) {
        medicationsContainer.innerHTML = '';
        
        medications.forEach(med => {
            const medHTML = `
                <div class="medication" data-id="${med.id}">
                    <div class="medication-icon">
                        <i class="fas fa-${getMedicationIcon(med.name)}"></i>
                    </div>
                    <div class="medication-details">
                        <h4>${med.name}</h4>
                        <p>${med.dosage}, ${med.frequency}</p>
                        <span class="time">${formatTime(med.time)}</span>
                    </div>
                    <div class="medication-status">
                        <button class="btn ${med.taken ? 'btn-success' : 'btn-outline'} btn-small medication-btn">
                            ${med.taken ? 'Taken' : 'Take'}
                        </button>
                    </div>
                </div>
            `;
            
            medicationsContainer.insertAdjacentHTML('beforeend', medHTML);
        });
    }
}

// Function to update goals
function updateGoals(goals) {
    const goalsContainer = document.querySelector('.goals-content');
    
    if (goalsContainer && goals.length > 0) {
        goalsContainer.innerHTML = '';
        
        goals.forEach(goal => {
            const startDate = new Date(goal.startDate);
            const formattedDate = startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            const progressPercentage = (goal.currentValue / goal.targetValue) * 100;
            
            const goalHTML = `
                <div class="goal" data-id="${goal.id}">
                    <div class="goal-info">
                        <h4>${goal.title}</h4>
                        <p>Started: ${formattedDate}</p>
                    </div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress" style="width: ${progressPercentage}%"></div>
                        </div>
                        <span>${goal.currentValue}/${goal.targetValue} ${goal.unit}</span>
                    </div>
                </div>
            `;
            
            goalsContainer.insertAdjacentHTML('beforeend', goalHTML);
        });
    }
}

// Function to setup chat assistant
function setupChatAssistant() {
    const chatAssistant = document.getElementById('chatAssistant');
    const chatBtn = document.querySelector('.chat-btn');
    const chatClose = document.getElementById('chatClose');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendMessage = document.getElementById('sendMessage');
    
    if (chatBtn && chatAssistant) {
        // Toggle chat assistant
        chatBtn.addEventListener('click', function() {
            chatAssistant.style.display = chatAssistant.style.display === 'flex' ? 'none' : 'flex';
            if (chatAssistant.style.display === 'flex') {
                chatInput.focus();
            }
        });
        
        // Close chat assistant
        if (chatClose) {
            chatClose.addEventListener('click', function() {
                chatAssistant.style.display = 'none';
            });
        }
        
        // Send message
        if (sendMessage && chatInput && chatMessages) {
            sendMessage.addEventListener('click', sendChatMessage);
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendChatMessage();
                }
            });
        }
    }
    
    // Function to send chat message
    function sendChatMessage() {
        const message = chatInput.value.trim();
        
        if (message) {
            // Add user message
            const userMessageHTML = `
                <div class="message user">
                    <div class="message-content">
                        <p>${message}</p>
                    </div>
                    <span class="message-time">${getCurrentTime()}</span>
                </div>
            `;
            
            chatMessages.insertAdjacentHTML('beforeend', userMessageHTML);
            chatInput.value = '';
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Show typing indicator
            const typingIndicatorHTML = `
                <div class="message assistant typing-indicator">
                    <div class="message-content">
                        <p>Typing<span class="typing-dots">...</span></p>
                    </div>
                </div>
            `;
            
            chatMessages.insertAdjacentHTML('beforeend', typingIndicatorHTML);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate assistant response after a short delay
            setTimeout(() => {
                // Remove typing indicator
                const typingIndicator = document.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.remove();
                }
                
                const assistantResponse = getAssistantResponse(message);
                const assistantMessageHTML = `
                    <div class="message assistant">
                        <div class="message-content">
                            <p>${assistantResponse}</p>
                        </div>
                        <span class="message-time">${getCurrentTime()}</span>
                    </div>
                `;
                
                chatMessages.insertAdjacentHTML('beforeend', assistantMessageHTML);
                
                // Scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1500);
        }
    }
}

// Function to setup logout functionality
function setupLogout() {
    const logoutLink = document.querySelector('.sidebar-footer a[href="logout.html"]');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update current user
            const currentUser = JSON.parse(localStorage.getItem('healthAdvisorCurrentUser'));
            if (currentUser) {
                currentUser.isLoggedIn = false;
                localStorage.setItem('healthAdvisorCurrentUser', JSON.stringify(currentUser));
            }
            
            // Redirect to login page
            window.location.href = 'login.html';
        });
    }
}

// Function to setup medication tracking
function setupMedicationTracking() {
    const medicationButtons = document.querySelectorAll('.medication-btn');
    
    medicationButtons.forEach(button => {
        button.addEventListener('click', function() {
            const medicationElement = this.closest('.medication');
            const medicationId = medicationElement.dataset.id;
            
            // Get current user data
            const currentUser = JSON.parse(localStorage.getItem('healthAdvisorCurrentUser'));
            const users = JSON.parse(localStorage.getItem('healthAdvisorUsers') || '[]');
            const userIndex = users.findIndex(user => user.id === currentUser.id);
            
            if (userIndex !== -1) {
                const medicationIndex = users[userIndex].healthData.medications.findIndex(med => med.id === medicationId);
                
                if (medicationIndex !== -1) {
                    // Toggle taken status
                    const isTaken = users[userIndex].healthData.medications[medicationIndex].taken;
                    users[userIndex].healthData.medications[medicationIndex].taken = !isTaken;
                    
                    // Update localStorage
                    localStorage.setItem('healthAdvisorUsers', JSON.stringify(users));
                    
                    // Update UI
                    if (isTaken) {
                        this.textContent = 'Take';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-outline');
                    } else {
                        this.textContent = 'Taken';
                        this.classList.remove('btn-outline');
                        this.classList.add('btn-success');
                    }
                }
            }
        });
    });
}

// Function to setup appointment management
function setupAppointmentManagement() {
    const rescheduleButtons = document.querySelectorAll('.reschedule-btn');
    
    rescheduleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const appointmentElement = this.closest('.appointment');
            const appointmentId = appointmentElement.dataset.id;
            
            // In a real app, this would open a modal for rescheduling
            alert(`Reschedule appointment: ${appointmentId}`);
        });
    });
}

// Function to setup mobile sidebar
function setupMobileSidebar() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

// Helper function to get current time
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    
    return `${hours}:${minutes} ${ampm}`;
}

// Helper function to format time (24h to 12h)
function formatTime(time24h) {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
}

// Helper function to calculate end time
function formatEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    
    let endTimeDate = new Date();
    endTimeDate.setHours(hours, minutes + durationMinutes, 0);
    
    const endHour = endTimeDate.getHours();
    const endMinutes = endTimeDate.getMinutes().toString().padStart(2, '0');
    const ampm = endHour >= 12 ? 'PM' : 'AM';
    const hour12 = endHour % 12 || 12;
    
    return `${hour12}:${endMinutes} ${ampm}`;
}

// Helper function to get medication icon
function getMedicationIcon(medicationName) {
    const name = medicationName.toLowerCase();
    
    if (name.includes('vitamin')) return 'capsules';
    if (name.includes('omega')) return 'tablets';
    
    // Default icon
    return 'pills';
}

// Helper function to generate assistant responses
function getAssistantResponse(message) {
    message = message.toLowerCase();
    
    if (message.includes('hello') || message.includes('hi')) {
        return "Hello! How can I help you with your health today?";
    } else if (message.includes('health score')) {
        return "Your current health score is 75/100. Your physical health metrics are good, but there's room for improvement in your sleep patterns and stress levels.";
    } else if (message.includes('sleep') || message.includes('insomnia')) {
        return "Based on your sleep data, you've been averaging 6.2 hours per night. For optimal health, aim for 7-8 hours. Try establishing a regular sleep schedule and avoiding screens an hour before bedtime.";
    } else if (message.includes('exercise') || message.includes('workout')) {
        return "Based on your goals and fitness level, I recommend a mix of cardio (3 days/week) and strength training (2 days/week). Would you like me to suggest a specific workout plan?";
    } else if (message.includes('diet') || message.includes('nutrition') || message.includes('food')) {
        return "Your nutrition logs show you're consuming adequate protein but could increase your fiber intake. Try adding more fruits, vegetables, and whole grains to your diet.";
    } else if (message.includes('stress') || message.includes('anxiety')) {
        return "I notice your stress levels have been elevated recently. Have you tried the guided meditation sessions in our app? Just 10 minutes daily can significantly reduce stress.";
    } else if (message.includes('headache') || message.includes('pain')) {
        return "I'm sorry to hear you're experiencing discomfort. Based on your symptoms, it could be tension-related. Try staying hydrated and taking short breaks from screen time. If it persists, please consult with a healthcare provider.";
    } else if (message.includes('thank')) {
        return "You're welcome! Is there anything else I can help you with?";
    } else {
        return "I understand you're asking about " + message.split(' ').slice(0, 3).join(' ') + "... To give you the most accurate advice, could you provide more details about your specific concern?";
    }
}