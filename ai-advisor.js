// AI Advisor Scripts for Smart Health Advisor

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Starting AI Advisor initialization...');
    
    try {
        // Check if user is logged in
        console.log('Checking login status...');
        const currentUser = JSON.parse(localStorage.getItem('healthAdvisorCurrentUser'));
        console.log('Current user data:', currentUser);
        
        if (!currentUser || !currentUser.isLoggedIn) {
            console.log('User not logged in, redirecting to login page...');
            window.location.href = 'login.html';
            return;
        }
        
        // Get user data
        console.log('Fetching user data...');
        const users = JSON.parse(localStorage.getItem('healthAdvisorUsers') || '[]');
        console.log('Available users:', users);
        const userData = users.find(user => user.id === currentUser.id);
        console.log('Found user data:', userData);
        
        if (!userData) {
            console.error('User data not found for ID:', currentUser.id);
            alert('Error: User data not found. Please try logging in again.');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if required elements exist
        console.log('Checking for required DOM elements...');
        const requiredElements = {
            aiChatMessages: document.getElementById('aiChatMessages'),
            aiChatInput: document.getElementById('aiChatInput'),
            aiSendMessage: document.getElementById('aiSendMessage'),
            chatForm: document.getElementById('chatForm')
        };
        
        console.log('Required elements status:', Object.entries(requiredElements).map(([key, element]) => ({
            element: key,
            exists: !!element
        })));
        
        // Update user profile information
        console.log('Updating user profile...');
        updateUserProfile(currentUser);
        
        // Setup AI chat functionality
        console.log('Setting up AI chat...');
        setupAIChat(userData);
        
        // Setup quick prompts
        console.log('Setting up quick prompts...');
        setupQuickPrompts();
        
        // Load conversation history
        console.log('Loading conversation history...');
        loadConversationHistory();
        
        // Setup mobile sidebar toggle
        console.log('Setting up mobile sidebar...');
        setupMobileSidebar();

        // Initialize advanced features
        console.log('Initializing advanced features...');
        initializeAdvancedFeatures();

        // Add form submit handler
        console.log('Setting up form submit handler...');
        const chatForm = document.getElementById('chatForm');
        if (chatForm) {
            chatForm.addEventListener('submit', function(e) {
                console.log('Form submitted...');
                e.preventDefault();
                const input = document.getElementById('aiChatInput');
                if (input && input.value.trim()) {
                    console.log('Sending message:', input.value.trim());
                    sendAiMessage(input.value.trim());
                }
            });
        } else {
            console.error('Chat form not found!');
        }

        console.log('AI Advisor initialized successfully');
    } catch (error) {
        console.error('Error initializing AI Advisor:', error);
        console.error('Error stack:', error.stack);
        alert('There was an error initializing the AI Advisor. Please check the console for details and try refreshing the page.');
    }
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

// Function to setup AI chat
function setupAIChat(userData) {
    try {
        console.log('Setting up chat interface...');
        const aiChatMessages = document.getElementById('aiChatMessages');
        const aiChatInput = document.getElementById('aiChatInput');
        const aiSendMessage = document.getElementById('aiSendMessage');
        const chatForm = document.getElementById('chatForm');
        
        if (!aiChatMessages || !aiChatInput || !aiSendMessage || !chatForm) {
            console.error('Missing required chat elements:', {
                aiChatMessages: !!aiChatMessages,
                aiChatInput: !!aiChatInput,
                aiSendMessage: !!aiSendMessage,
                chatForm: !!chatForm
            });
            return;
        }

        // Handle form submission
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            const message = aiChatInput.value.trim();
            if (message) {
                console.log('Sending message from form:', message);
                sendAiMessage(message);
            }
        });

        // Handle send button click
        aiSendMessage.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Send button clicked');
            const message = aiChatInput.value.trim();
            if (message) {
                console.log('Sending message from button:', message);
                sendAiMessage(message);
            }
        });

        // Handle Enter key in input
        aiChatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('Enter key pressed');
                const message = aiChatInput.value.trim();
                if (message) {
                    console.log('Sending message from Enter key:', message);
                    sendAiMessage(message);
                }
            }
        });

        // Make sendAiMessage available globally
        window.sendAiMessage = function(message) {
            console.log('sendAiMessage called with:', message);
            if (!message.trim()) {
                console.log('Empty message, ignoring');
                return;
            }
            
            try {
                // Clear input immediately
                aiChatInput.value = '';
                
                // Add user message
                console.log('Adding user message to chat');
                const userMessageHTML = `
                    <div class="message user-message">
                        <div class="message-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="message-content">
                            <p>${message}</p>
                            <span class="message-time">${getCurrentTime()}</span>
                        </div>
                    </div>
                `;
                aiChatMessages.insertAdjacentHTML('beforeend', userMessageHTML);
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

                // Show typing indicator
                console.log('Showing typing indicator');
                const typingIndicatorHTML = `
                    <div class="message ai-message" id="typingIndicator">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>Typing<span class="typing-dots">...</span></p>
                        </div>
                    </div>
                `;
                aiChatMessages.insertAdjacentHTML('beforeend', typingIndicatorHTML);
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

                // Get AI response
                console.log('Getting AI response');
                const aiResponse = getAiResponse(message, userData);
                console.log('AI response:', aiResponse);

                // Remove typing indicator
                const typingIndicator = document.getElementById('typingIndicator');
                if (typingIndicator) {
                    typingIndicator.remove();
                }

                // Add AI response
                console.log('Adding AI response to chat');
                const aiMessageHTML = `
                    <div class="message ai-message">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>${aiResponse}</p>
                            <span class="message-time">${getCurrentTime()}</span>
                        </div>
                    </div>
                `;
                aiChatMessages.insertAdjacentHTML('beforeend', aiMessageHTML);
                aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

                // Save conversation
                console.log('Saving conversation');
                saveConversation(message, aiResponse);

            } catch (error) {
                console.error('Error in sendAiMessage:', error);
                const errorMessage = `
                    <div class="message ai-message error">
                        <div class="message-avatar">
                            <i class="fas fa-robot"></i>
                        </div>
                        <div class="message-content">
                            <p>I apologize, but I encountered an error. Please try again.</p>
                            <span class="message-time">${getCurrentTime()}</span>
                        </div>
                    </div>
                `;
                aiChatMessages.insertAdjacentHTML('beforeend', errorMessage);
            }
        };

        console.log('Chat interface setup complete');
    } catch (error) {
        console.error('Error setting up chat:', error);
        alert('There was an error setting up the chat interface. Please refresh the page.');
    }
}

// Function to setup quick prompts
function setupQuickPrompts() {
    const promptButtons = document.querySelectorAll('.prompt-btn');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiSendMessage = document.getElementById('aiSendMessage');
    
    if (promptButtons.length > 0) {
        promptButtons.forEach(button => {
            button.addEventListener('click', function() {
                const promptText = this.textContent;
                aiChatInput.value = promptText;
                aiSendMessage.click();
            });
        });
    }
}

// Function to load conversation history
function loadConversationHistory() {
    const conversationList = document.querySelector('.conversation-list');
    const currentUser = JSON.parse(localStorage.getItem('healthAdvisorCurrentUser'));
    
    if (conversationList && currentUser) {
        // Get conversation history from localStorage
        const conversations = JSON.parse(localStorage.getItem(`healthAdvisor_conversations_${currentUser.id}`) || '[]');
        
        // Clear existing list
        conversationList.innerHTML = '';
        
        // Add conversations to list (most recent first)
        conversations.slice(0, 5).forEach(convo => {
            const convoDate = new Date(convo.timestamp);
            const formattedDate = convoDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });
            
            const convoHTML = `
                <li data-id="${convo.id}">
                    <span class="conversation-title">${convo.title}</span>
                    <span class="conversation-date">${formattedDate}</span>
                </li>
            `;
            
            conversationList.insertAdjacentHTML('beforeend', convoHTML);
        });
        
        // Add click event to conversation items
        const conversationItems = conversationList.querySelectorAll('li');
        conversationItems.forEach(item => {
            item.addEventListener('click', function() {
                const convoId = this.dataset.id;
                const conversations = JSON.parse(localStorage.getItem(`healthAdvisor_conversations_${currentUser.id}`) || '[]');
                const conversation = conversations.find(c => c.id === convoId);
                
                if (conversation) {
                    // In a real app, this would load the full conversation
                    alert(`Loading conversation: ${conversation.title}`);
                }
            });
        });
    }
}

// Function to save conversation
function saveConversation(userMessage, aiResponse) {
    const currentUser = JSON.parse(localStorage.getItem('healthAdvisorCurrentUser'));
    
    if (currentUser) {
        // Get existing conversations
        const conversations = JSON.parse(localStorage.getItem(`healthAdvisor_conversations_${currentUser.id}`) || '[]');
        
        // Create a title from the user message (first 30 chars)
        const title = userMessage.length > 30 ? userMessage.substring(0, 30) + '...' : userMessage;
        
        // Create new conversation
        const newConversation = {
            id: 'conv_' + Date.now(),
            title: title,
            timestamp: new Date().toISOString(),
            messages: [
                {
                    sender: 'user',
                    content: userMessage,
                    timestamp: new Date().toISOString()
                },
                {
                    sender: 'ai',
                    content: aiResponse,
                    timestamp: new Date().toISOString()
                }
            ]
        };
        
        // Add to beginning of array (most recent first)
        conversations.unshift(newConversation);
        
        // Limit to 20 conversations
        const limitedConversations = conversations.slice(0, 20);
        
        // Save to localStorage
        localStorage.setItem(`healthAdvisor_conversations_${currentUser.id}`, JSON.stringify(limitedConversations));
        
        // Update conversation list
        loadConversationHistory();
    }
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

// Advanced Features Initialization
function initializeAdvancedFeatures() {
    // Initialize symptom tracking
    initializeSymptomTracking();
    
    // Initialize health trend analysis
    initializeHealthTrends();
    
    // Initialize sentiment analysis
    initializeSentimentAnalysis();
    
    // Initialize medical knowledge base
    initializeMedicalKnowledgeBase();
    
    // Initialize predictive health analysis
    initializePredictiveAnalysis();
}

// Enhanced Medical Knowledge Base
const medicalKnowledgeBase = {
    // General Health Categories
    categories: {
        nutrition: {
            keywords: ['diet', 'food', 'nutrition', 'eating', 'meal', 'dietary', 'vitamin', 'mineral', 'protein', 'carb', 'fat'],
            topics: {
                'general': {
                    response: "A balanced diet should include:\n• Fruits and vegetables (5+ servings daily)\n• Whole grains\n• Lean proteins\n• Healthy fats\n• Limited processed foods and sugars",
                    followUp: "Would you like specific meal plans or nutritional advice for your goals?"
                },
                'weight_management': {
                    response: "For healthy weight management:\n• Create a caloric deficit of 500-750 calories daily\n• Focus on nutrient-dense foods\n• Stay hydrated\n• Regular exercise\n• Get adequate sleep",
                    followUp: "What are your specific weight management goals?"
                },
                'special_diets': {
                    response: "Common special diets include:\n• Mediterranean\n• Keto\n• Vegetarian/Vegan\n• Gluten-free\n• Low-carb\n• DASH diet",
                    followUp: "Which special diet are you interested in learning about?"
                }
            }
        },
        exercise: {
            keywords: ['exercise', 'workout', 'fitness', 'training', 'physical activity', 'sport', 'cardio', 'strength'],
            topics: {
                'general': {
                    response: "General exercise guidelines:\n• 150 minutes moderate activity weekly\n• 2+ days strength training\n• Include flexibility exercises\n• Stay hydrated\n• Proper warm-up and cool-down",
                    followUp: "What type of exercise are you most interested in?"
                },
                'beginner': {
                    response: "For beginners:\n• Start with 10-15 minute sessions\n• Focus on form over intensity\n• Include walking, bodyweight exercises\n• Gradually increase duration and intensity\n• Rest days are important",
                    followUp: "Would you like a beginner-friendly workout plan?"
                },
                'advanced': {
                    response: "Advanced training considerations:\n• Periodization\n• Progressive overload\n• Recovery strategies\n• Sport-specific training\n• Performance nutrition",
                    followUp: "What are your specific fitness goals?"
                }
            }
        },
        mental_health: {
            keywords: ['mental', 'stress', 'anxiety', 'depression', 'mood', 'emotional', 'psychological', 'mind'],
            topics: {
                'stress_management': {
                    response: "Effective stress management techniques:\n• Regular exercise\n• Mindfulness meditation\n• Deep breathing exercises\n• Adequate sleep\n• Social support\n• Time management",
                    followUp: "Which stress management technique would you like to learn more about?"
                },
                'anxiety': {
                    response: "Managing anxiety:\n• Practice relaxation techniques\n• Regular exercise\n• Limit caffeine and alcohol\n• Maintain regular sleep schedule\n• Consider professional help if needed",
                    followUp: "Would you like specific techniques for managing anxiety?"
                },
                'depression': {
                    response: "Important: If you're experiencing depression, please consult a healthcare professional. General support strategies:\n• Regular exercise\n• Social connection\n• Healthy sleep habits\n• Professional therapy\n• Medication if prescribed",
                    followUp: "Would you like information about professional resources?"
                }
            }
        },
        sleep: {
            keywords: ['sleep', 'insomnia', 'rest', 'tired', 'fatigue', 'drowsy', 'nap'],
            topics: {
                'improvement': {
                    response: "Sleep improvement strategies:\n• Consistent sleep schedule\n• Dark, quiet, cool bedroom\n• Limit screen time before bed\n• Avoid caffeine and alcohol\n• Regular exercise (not before bed)",
                    followUp: "Which sleep issue are you experiencing?"
                },
                'disorders': {
                    response: "Common sleep disorders include:\n• Insomnia\n• Sleep apnea\n• Restless leg syndrome\n• Narcolepsy\n• Circadian rhythm disorders",
                    followUp: "Would you like information about specific sleep disorders?"
                }
            }
        },
        symptoms: {
            keywords: ['symptom', 'pain', 'ache', 'fever', 'cough', 'headache', 'nausea', 'dizziness'],
            patterns: {
                'headache': {
                    types: ['tension', 'migraine', 'cluster', 'sinus'],
                    severity: {
                        mild: "For mild headaches:\n• Rest in a quiet, dark room\n• Stay hydrated\n• Over-the-counter pain relievers\n• Stress management",
                        moderate: "For moderate headaches:\n• Prescription medication if available\n• Rest and relaxation\n• Avoid triggers\n• Consider medical consultation",
                        severe: "For severe headaches:\n• Seek medical attention\n• Emergency care if sudden and severe\n• Monitor for other symptoms"
                    }
                },
                'fever': {
                    levels: {
                        low: "For low-grade fever (99-100.4°F):\n• Rest\n• Stay hydrated\n• Monitor temperature\n• Over-the-counter fever reducers",
                        moderate: "For moderate fever (100.4-102.2°F):\n• Medical consultation recommended\n• Rest and hydration\n• Fever reducers as directed\n• Monitor for other symptoms",
                        high: "For high fever (102.2°F+):\n• Seek medical attention\n• Emergency care if with severe symptoms\n• Keep cool\n• Stay hydrated"
                    }
                }
            }
        }
    },

    // Emergency Response System
    emergency: {
        keywords: ['emergency', 'severe', 'sudden', 'unbearable', 'extreme', 'worst'],
        conditions: {
            'chest_pain': "EMERGENCY: Chest pain could indicate a heart attack. Please:\n1. Call emergency services (911) immediately\n2. Stay calm\n3. Sit or lie down\n4. Take prescribed medication if available",
            'breathing': "EMERGENCY: Difficulty breathing requires immediate attention. Please:\n1. Call emergency services (911)\n2. Stay calm\n3. Sit upright\n4. Use rescue inhaler if prescribed",
            'stroke': "EMERGENCY: Signs of stroke (FAST):\n• Face drooping\n• Arm weakness\n• Speech difficulty\n• Time to call 911\nPlease seek immediate medical attention",
            'severe_bleeding': "EMERGENCY: For severe bleeding:\n1. Call emergency services\n2. Apply direct pressure\n3. Elevate the wound\n4. Keep the person warm"
        }
    }
};

// Enhanced AI Response Generation
function getAdvancedAIResponse(message, userData) {
    try {
        console.log('Processing advanced response for:', message);
        const lowerMessage = message.toLowerCase();
        
        // Check for emergency conditions first
        for (const [condition, response] of Object.entries(medicalKnowledgeBase.emergency.conditions)) {
            if (lowerMessage.includes(condition.replace('_', ' '))) {
                console.log('Emergency condition detected:', condition);
                return {
                    message: response,
                    urgency: 'high',
                    type: 'emergency'
                };
            }
        }

        // Check for emergency keywords
        if (medicalKnowledgeBase.emergency.keywords.some(keyword => lowerMessage.includes(keyword))) {
            console.log('Emergency keywords detected');
            return {
                message: "I've detected potential emergency indicators in your message. While I can provide general health information, please seek immediate medical attention if you're experiencing a medical emergency. Would you like to describe your symptoms in more detail?",
                urgency: 'high',
                type: 'emergency_warning'
            };
        }

        // Analyze message for health categories
        const matchedCategories = [];
        for (const [category, data] of Object.entries(medicalKnowledgeBase.categories)) {
            if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
                matchedCategories.push(category);
            }
        }

        // Generate response based on matched categories
        if (matchedCategories.length > 0) {
            console.log('Matched categories:', matchedCategories);
            const primaryCategory = matchedCategories[0];
            const categoryData = medicalKnowledgeBase.categories[primaryCategory];

            // Find specific topic within category
            for (const [topic, data] of Object.entries(categoryData.topics)) {
                if (lowerMessage.includes(topic.replace('_', ' '))) {
                    console.log('Matched topic:', topic);
                    return {
                        message: data.response,
                        followUp: data.followUp,
                        type: 'category_topic'
                    };
                }
            }

            // If no specific topic matched, use general category response
            return {
                message: categoryData.topics.general.response,
                followUp: categoryData.topics.general.followUp,
                type: 'category_general'
            };
        }

        // Check for symptom patterns
        for (const [symptom, data] of Object.entries(medicalKnowledgeBase.categories.symptoms.patterns)) {
            if (lowerMessage.includes(symptom)) {
                console.log('Matched symptom:', symptom);
                // Determine severity based on message content
                let severity = 'mild';
                if (lowerMessage.includes('severe') || lowerMessage.includes('extreme')) {
                    severity = 'severe';
                } else if (lowerMessage.includes('moderate') || lowerMessage.includes('bad')) {
                    severity = 'moderate';
                }
                return {
                    message: data.severity[severity],
                    type: 'symptom',
                    severity: severity
                };
            }
        }

        // If no specific matches, provide general health guidance
        return {
            message: "I understand you're asking about health. I can help with:\n• Nutrition and diet\n• Exercise and fitness\n• Mental health and stress management\n• Sleep improvement\n• Symptom assessment\n\nCould you please provide more specific details about what you'd like to know?",
            type: 'general_guidance'
        };

    } catch (error) {
        console.error('Error in advanced response generation:', error);
        return {
            message: "I apologize, but I encountered an error while processing your request. Could you please rephrase your question?",
            type: 'error'
        };
    }
}

// Update the main getAiResponse function to use the enhanced system
function getAiResponse(message, userData) {
    try {
        console.log('Getting AI response for:', message);
        
        // Basic validation
        if (!message || typeof message !== 'string') {
            return "I'm sorry, I couldn't understand your message. Please try again.";
        }

        if (!userData) {
            return "I'm sorry, I couldn't access your user data. Please try logging in again.";
        }

        // Get advanced response
        const response = getAdvancedAIResponse(message, userData);
        
        // Format the response based on type
        let formattedResponse = response.message;
        
        if (response.followUp) {
            formattedResponse += "\n\n" + response.followUp;
        }
        
        if (response.urgency === 'high') {
            formattedResponse = "⚠️ " + formattedResponse;
        }

        return formattedResponse;

    } catch (error) {
        console.error('Error in getAiResponse:', error);
        return "I apologize, but I encountered an error while processing your request. Please try rephrasing your question.";
    }
}