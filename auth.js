// Authentication Scripts for Smart Health Advisor

document.addEventListener('DOMContentLoaded', function() {
    // Login Form Handling
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const remember = document.getElementById('remember').checked;
            
            // Simple validation
            if (!email || !password) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Check if user exists in localStorage
            const users = JSON.parse(localStorage.getItem('healthAdvisorUsers') || '[]');
            const user = users.find(u => u.email === email);
            
            if (!user) {
                showNotification('User not found. Please check your email or sign up.', 'error');
                return;
            }
            
            if (user.password !== password) {
                showNotification('Incorrect password. Please try again.', 'error');
                return;
            }
            
            // Login successful
            const currentUser = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isLoggedIn: true
            };
            
            localStorage.setItem('healthAdvisorCurrentUser', JSON.stringify(currentUser));
            
            if (remember) {
                localStorage.setItem('healthAdvisorRememberUser', JSON.stringify({
                    email: email,
                    remember: true
                }));
            } else {
                localStorage.removeItem('healthAdvisorRememberUser');
            }
            
            showNotification('Login successful! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
        
        // Check if user should be remembered
        const rememberedUser = JSON.parse(localStorage.getItem('healthAdvisorRememberUser'));
        if (rememberedUser && rememberedUser.remember) {
            document.getElementById('email').value = rememberedUser.email;
            document.getElementById('remember').checked = true;
        }
    }
    
    // Signup Form Handling
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const strengthSegments = document.querySelectorAll('.strength-segment');
        const strengthText = document.querySelector('.strength-text');
        
        // Password strength checker
        if (passwordInput) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = checkPasswordStrength(password);
                
                // Update strength meter
                strengthSegments.forEach((segment, index) => {
                    segment.className = 'strength-segment';
                    if (index < strength.score) {
                        segment.classList.add(strength.class);
                    }
                });
                
                strengthText.textContent = strength.message;
            });
        }
        
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const termsAccepted = document.getElementById('terms').checked;
            
            // Simple validation
            if (!firstName || !lastName || !email || !password) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            if (!termsAccepted) {
                showNotification('You must accept the Terms of Service and Privacy Policy', 'error');
                return;
            }
            
            // Check if user already exists
            const users = JSON.parse(localStorage.getItem('healthAdvisorUsers') || '[]');
            if (users.some(user => user.email === email)) {
                showNotification('An account with this email already exists', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: generateUserId(),
                firstName,
                lastName,
                email,
                password,
                dateJoined: new Date().toISOString(),
                healthData: initializeHealthData()
            };
            
            users.push(newUser);
            localStorage.setItem('healthAdvisorUsers', JSON.stringify(users));
            
            // Set as current user
            const currentUser = {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                isLoggedIn: true
            };
            
            localStorage.setItem('healthAdvisorCurrentUser', JSON.stringify(currentUser));
            
            showNotification('Account created successfully! Redirecting to dashboard...', 'success');
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
    
    // Helper function to check password strength
    function checkPasswordStrength(password) {
        if (!password) {
            return { score: 0, message: 'Password strength', class: '' };
        }
        
        let score = 0;
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Complexity checks
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        
        let message, strengthClass;
        
        if (score <= 1) {
            message = 'Weak password';
            strengthClass = 'weak';
        } else if (score <= 3) {
            message = 'Medium strength';
            strengthClass = 'medium';
        } else {
            message = 'Strong password';
            strengthClass = 'strong';
        }
        
        return {
            score: Math.min(score, 4),
            message,
            class: strengthClass
        };
    }
    
    // Helper function to generate user ID
    function generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Helper function to initialize health data
    function initializeHealthData() {
        return {
            healthScore: {
                overall: 75,
                physical: 80,
                mental: 65,
                nutrition: 70,
                sleep: 60
            },
            activity: {
                steps: [7500, 8200, 6800, 9100, 8456, 10200, 7800],
                calories: [1650, 1720, 1580, 1850, 1842, 2100, 1750],
                heartRate: [68, 72, 70, 65, 68, 75, 69]
            },
            sleep: {
                duration: [6.5, 7.2, 6.8, 6.1, 7.5, 8.2, 6.7],
                quality: [65, 80, 70, 60, 85, 90, 75]
            },
            weight: {
                current: 70.5,
                target: 68,
                history: [71.2, 71.0, 70.8, 70.5]
            },
            goals: [
                {
                    id: 'goal_1',
                    title: 'Lose 10 pounds',
                    startDate: '2023-04-01',
                    targetValue: 10,
                    currentValue: 6,
                    unit: 'lbs'
                },
                {
                    id: 'goal_2',
                    title: 'Run 5K',
                    startDate: '2023-05-01',
                    targetValue: 5,
                    currentValue: 2,
                    unit: 'km'
                },
                {
                    id: 'goal_3',
                    title: 'Meditate Daily',
                    startDate: '2023-05-10',
                    targetValue: 7,
                    currentValue: 6,
                    unit: 'days'
                }
            ],
            medications: [
                {
                    id: 'med_1',
                    name: 'Vitamin D3',
                    dosage: '1000 IU',
                    frequency: 'Once daily',
                    time: '08:00',
                    taken: true
                },
                {
                    id: 'med_2',
                    name: 'Multivitamin',
                    dosage: '1 tablet',
                    frequency: 'Once daily',
                    time: '08:00',
                    taken: true
                },
                {
                    id: 'med_3',
                    name: 'Omega-3',
                    dosage: '1000mg',
                    frequency: 'Once daily',
                    time: '20:00',
                    taken: false
                }
            ],
            appointments: [
                {
                    id: 'appt_1',
                    doctor: 'Dr. Sarah Johnson',
                    purpose: 'Annual Physical Checkup',
                    date: '2023-05-24',
                    time: '10:30',
                    duration: 60
                },
                {
                    id: 'appt_2',
                    doctor: 'Dr. Michael Chen',
                    purpose: 'Dental Cleaning',
                    date: '2023-06-02',
                    time: '14:00',
                    duration: 60
                }
            ],
            assessments: {
                completed: [
                    {
                        id: 'assessment_1',
                        title: 'Body Composition Analysis',
                        date: '2023-05-10',
                        score: 72
                    },
                    {
                        id: 'assessment_2',
                        title: 'Nutrition Habits Assessment',
                        date: '2023-05-05',
                        score: 68
                    }
                ],
                recommended: [
                    {
                        id: 'assessment_3',
                        title: 'Heart Health Risk Assessment',
                        category: 'physical'
                    },
                    {
                        id: 'assessment_4',
                        title: 'Mental Wellness Check',
                        category: 'mental'
                    }
                ]
            }
        };
    }
    
    // Helper function to show notifications
    function showNotification(message, type = 'info') {
        // Check if notification container exists, if not create it
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
            
            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 1000;
                }
                
                .notification {
                    padding: 15px 20px;
                    margin-bottom: 10px;
                    border-radius: 4px;
                    color: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    min-width: 300px;
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out forwards;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .notification.info {
                    background-color: #4285f4;
                }
                
                .notification.success {
                    background-color: #34a853;
                }
                
                .notification.warning {
                    background-color: #fbbc05;
                }
                
                .notification.error {
                    background-color: #ea4335;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    margin-left: 10px;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const content = document.createElement('div');
        content.textContent = message;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        notification.appendChild(content);
        notification.appendChild(closeButton);
        notificationContainer.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
});