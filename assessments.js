// Assessments Scripts for Smart Health Advisor

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
    
    // Load assessments
    loadAssessments(userData);
    
    // Setup filter functionality
    setupFilters();
    
    // Setup search functionality
    setupSearch();
    
    // Setup pagination
    setupPagination();
    
    // Setup assessment actions
    setupAssessmentActions();
    
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

// Function to load assessments
function loadAssessments(userData) {
    const assessmentGrid = document.querySelector('.assessment-grid');
    
    if (assessmentGrid) {
        // Clear existing assessments
        assessmentGrid.innerHTML = '';
        
        // Load recommended assessments
        if (userData.healthData.assessments.recommended && userData.healthData.assessments.recommended.length > 0) {
            userData.healthData.assessments.recommended.forEach(assessment => {
                const assessmentHTML = createAssessmentCard(assessment, 'recommended');
                assessmentGrid.insertAdjacentHTML('beforeend', assessmentHTML);
            });
        }
        
        // Load completed assessments
        if (userData.healthData.assessments.completed && userData.healthData.assessments.completed.length > 0) {
            userData.healthData.assessments.completed.forEach(assessment => {
                const assessmentHTML = createAssessmentCard(assessment, 'completed');
                assessmentGrid.insertAdjacentHTML('beforeend', assessmentHTML);
            });
        }
        
        // Load available assessments (static for demo)
        const availableAssessments = [
            {
                id: 'assessment_5',
                title: 'Fitness Level Test',
                description: 'Determine your current fitness level and get personalized workout recommendations.',
                category: 'fitness',
                duration: '15-20',
                questions: 'Physical activities'
            },
            {
                id: 'assessment_6',
                title: 'Sleep Quality Assessment',
                description: 'Analyze your sleep patterns and get tips for better rest.',
                category: 'sleep',
                duration: '5-10',
                questions: '15'
            },
            {
                id: 'assessment_7',
                title: 'Smoking Cessation Readiness',
                description: 'Assess your readiness to quit smoking and get a personalized plan.',
                category: 'lifestyle',
                duration: '5-10',
                questions: '12'
            },
            {
                id: 'assessment_8',
                title: 'Allergy Risk Assessment',
                description: 'Identify potential allergies and get recommendations for management.',
                category: 'health',
                duration: '10-15',
                questions: '20'
            }
        ];
        
        availableAssessments.forEach(assessment => {
            const assessmentHTML = createAssessmentCard(assessment, 'available');
            assessmentGrid.insertAdjacentHTML('beforeend', assessmentHTML);
        });
    }
}

// Function to create assessment card HTML
function createAssessmentCard(assessment, type) {
    let iconClass, buttonText, metaHTML;
    
    // Set icon based on assessment category or title
    iconClass = getAssessmentIcon(assessment.category || assessment.title);
    
    // Set button text based on type
    buttonText = type === 'completed' ? 'View Results' : 'Start Assessment';
    
    // Set meta information based on type
    if (type === 'completed') {
        const date = new Date(assessment.date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        metaHTML = `<span><i class="fas fa-calendar-check"></i> Completed ${formattedDate}</span>`;
    } else {
        metaHTML = `
            <span><i class="fas fa-clock"></i> ${assessment.duration || '10-15'} minutes</span>
            <span><i class="fas fa-chart-bar"></i> ${assessment.questions || '20'} questions</span>
        `;
    }
    
    // Create tag text
    const tagText = type === 'recommended' ? 'Recommended' : 
                   type === 'completed' ? 'Completed' : 
                   assessment.category ? assessment.category.charAt(0).toUpperCase() + assessment.category.slice(1) : 'Health';
    
    return `
        <div class="assessment-card ${type}" data-id="${assessment.id}" data-category="${assessment.category || ''}" data-status="${type}">
            <div class="assessment-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="assessment-content">
                <div class="assessment-tag">${tagText}</div>
                <h3>${assessment.title}</h3>
                <p>${assessment.description || 'Take this assessment to get personalized health insights and recommendations.'}</p>
                <div class="assessment-meta">
                    ${metaHTML}
                </div>
            </div>
            <div class="assessment-action">
                <button class="btn ${type === 'completed' ? 'btn-secondary' : 'btn-primary'}">${buttonText}</button>
            </div>
        </div>
    `;
}

// Function to get assessment icon
function getAssessmentIcon(category) {
    const categoryLower = (category || '').toLowerCase();
    
    if (categoryLower.includes('heart') || categoryLower.includes('cardio')) return 'fas fa-heart';
    if (categoryLower.includes('mental') || categoryLower.includes('brain')) return 'fas fa-brain';
    if (categoryLower.includes('body') || categoryLower.includes('weight')) return 'fas fa-weight';
    if (categoryLower.includes('nutrition') || categoryLower.includes('diet')) return 'fas fa-utensils';
    if (categoryLower.includes('fitness') || categoryLower.includes('exercise')) return 'fas fa-running';
    if (categoryLower.includes('sleep')) return 'fas fa-moon';
    if (categoryLower.includes('smoking')) return 'fas fa-smoking-ban';
    if (categoryLower.includes('allergy')) return 'fas fa-allergies';
    
    // Default icon
    return 'fas fa-clipboard-check';
}

// Function to setup filters
function setupFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const assessmentCards = document.querySelectorAll('.assessment-card');
    
    // Function to filter assessments
    function filterAssessments() {
        const categoryValue = categoryFilter.value;
        const statusValue = statusFilter.value;
        
        assessmentCards.forEach(card => {
            let showCard = true;
            
            // Category filter
            if (categoryValue !== 'all') {
                const cardCategory = card.dataset.category.toLowerCase();
                if (!cardCategory.includes(categoryValue.toLowerCase())) {
                    showCard = false;
                }
            }
            
            // Status filter
            if (statusValue !== 'all') {
                const cardStatus = card.dataset.status;
                if (cardStatus !== statusValue) {
                    showCard = false;
                }
            }
            
            // Show or hide card
            card.style.display = showCard ? 'flex' : 'none';
        });
        
        // Update pagination after filtering
        updatePagination();
    }
    
    // Add event listeners to filters
    if (categoryFilter && statusFilter) {
        categoryFilter.addEventListener('change', filterAssessments);
        statusFilter.addEventListener('change', filterAssessments);
    }
}

// Function to setup search
function setupSearch() {
    const searchInput = document.querySelector('.filter-group.search input');
    const searchButton = document.querySelector('.filter-group.search button');
    const assessmentCards = document.querySelectorAll('.assessment-card');
    
    function searchAssessments() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm) {
            assessmentCards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                const description = card.querySelector('p').textContent.toLowerCase();
                const tag = card.querySelector('.assessment-tag').textContent.toLowerCase();
                
                const matchesSearch = title.includes(searchTerm) || 
                                     description.includes(searchTerm) || 
                                     tag.includes(searchTerm);
                
                card.style.display = matchesSearch ? 'flex' : 'none';
            });
        } else {
            // If search is empty, reset to current filter state
            const categoryFilter = document.getElementById('categoryFilter');
            const statusFilter = document.getElementById('statusFilter');
            
            if (categoryFilter && statusFilter) {
                const categoryValue = categoryFilter.value;
                const statusValue = statusFilter.value;
                
                assessmentCards.forEach(card => {
                    let showCard = true;
                    
                    // Category filter
                    if (categoryValue !== 'all') {
                        const cardCategory = card.dataset.category.toLowerCase();
                        if (!cardCategory.includes(categoryValue.toLowerCase())) {
                            showCard = false;
                        }
                    }
                    
                    // Status filter
                    if (statusValue !== 'all') {
                        const cardStatus = card.dataset.status;
                        if (cardStatus !== statusValue) {
                            showCard = false;
                        }
                    }
                    
                    // Show or hide card
                    card.style.display = showCard ? 'flex' : 'none';
                });
            } else {
                // If filters not available, show all cards
                assessmentCards.forEach(card => {
                    card.style.display = 'flex';
                });
            }
        }
        
        // Update pagination after searching
        updatePagination();
    }
    
    // Add event listeners for search
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', searchAssessments);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAssessments();
            }
        });
    }
}

// Function to setup pagination
function setupPagination() {
    const assessmentGrid = document.querySelector('.assessment-grid');
    const paginationContainer = document.querySelector('.assessment-pagination');
    const itemsPerPage = 6;
    
    if (assessmentGrid && paginationContainer) {
        updatePagination();
        
        // Add event listeners to pagination buttons
        paginationContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('pagination-btn')) {
                const pageButtons = document.querySelectorAll('.pagination-btn:not(.next)');
                
                // Remove active class from all buttons
                pageButtons.forEach(btn => btn.classList.remove('active'));
                
                if (e.target.classList.contains('next')) {
                    // Handle next button
                    const activePage = document.querySelector('.pagination-btn.active');
                    const nextPage = activePage.nextElementSibling;
                    
                    if (nextPage && !nextPage.classList.contains('pagination-ellipsis') && !nextPage.classList.contains('next')) {
                        nextPage.classList.add('active');
                        showPage(parseInt(nextPage.textContent));
                    }
                } else {
                    // Handle number buttons
                    e.target.classList.add('active');
                    showPage(parseInt(e.target.textContent));
                }
                
                // Scroll to top of assessment grid
                assessmentGrid.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Function to update pagination based on visible cards
    function updatePagination() {
        const visibleCards = Array.from(document.querySelectorAll('.assessment-card')).filter(card => {
            return card.style.display !== 'none';
        });
        
        const totalPages = Math.ceil(visibleCards.length / itemsPerPage);
        
        // Update pagination buttons
        paginationContainer.innerHTML = '';
        
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        } else {
            paginationContainer.style.display = 'flex';
        }
        
        // Create pagination buttons
        for (let i = 1; i <= totalPages; i++) {
            if (i <= 3 || i === totalPages) {
                const pageButton = document.createElement('button');
                pageButton.className = `pagination-btn ${i === 1 ? 'active' : ''}`;
                pageButton.textContent = i;
                paginationContainer.appendChild(pageButton);
            } else if (i === 4 && totalPages > 5) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
        }
        
        // Add next button
        if (totalPages > 1) {
            const nextButton = document.createElement('button');
            nextButton.className = 'pagination-btn next';
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
            paginationContainer.appendChild(nextButton);
        }
        
        // Show first page
        showPage(1);
    }
    
    // Function to show specific page
    function showPage(pageNumber) {
        const visibleCards = Array.from(document.querySelectorAll('.assessment-card')).filter(card => {
            return card.style.display !== 'none';
        });
        
        const startIndex = (pageNumber - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        visibleCards.forEach((card, index) => {
            if (index >= startIndex && index < endIndex) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }
}

// Function to setup assessment actions
function setupAssessmentActions() {
    const assessmentGrid = document.querySelector('.assessment-grid');
    
    if (assessmentGrid) {
        assessmentGrid.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn')) {
                const assessmentCard = e.target.closest('.assessment-card');
                const assessmentId = assessmentCard.dataset.id;
                const assessmentTitle = assessmentCard.querySelector('h3').textContent;
                const isCompleted = assessmentCard.classList.contains('completed');
                
                if (isCompleted) {
                    // Show assessment results
                    showAssessmentResults(assessmentId, assessmentTitle);
                } else {
                    // Start assessment
                    startAssessment(assessmentId, assessmentTitle);
                }
            }
        });
    }
    
    // Function to show assessment results
    function showAssessmentResults(assessmentId, assessmentTitle) {
        // In a real app, this would navigate to a results page
        // For demo, we'll show a modal with sample results
        
        // Create modal HTML
        const modalHTML = `
            <div class="assessment-modal" id="assessmentResultsModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${assessmentTitle} Results</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="results-summary">
                            <div class="result-score">
                                <svg viewBox="0 0 36 36" class="circular-chart">
                                    <path class="circle-bg" d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <path class="circle" stroke-dasharray="72, 100" d="M18 2.0845
                                        a 15.9155 15.9155 0 0 1 0 31.831
                                        a 15.9155 15.9155 0 0 1 0 -31.831" />
                                    <text x="18" y="20.35" class="percentage">72</text>
                                </svg>
                                <p>Your Score</p>
                            </div>
                            <div class="result-details">
                                <h3>Summary</h3>
                                <p>Your assessment results indicate that you have a good foundation in this area of health, but there are opportunities for improvement.</p>
                                <div class="result-categories">
                                    <div class="result-category">
                                        <h4>Strengths</h4>
                                        <ul>
                                            <li>Regular physical activity</li>
                                            <li>Balanced diet with adequate protein</li>
                                            <li>Good stress management techniques</li>
                                        </ul>
                                    </div>
                                    <div class="result-category">
                                        <h4>Areas for Improvement</h4>
                                        <ul>
                                            <li>Increase water intake</li>
                                            <li>Improve sleep consistency</li>
                                            <li>Add more variety to exercise routine</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="results-recommendations">
                            <h3>Personalized Recommendations</h3>
                            <div class="recommendation-list">
                                <div class="recommendation-item">
                                    <div class="recommendation-icon">
                                        <i class="fas fa-glass-water"></i>
                                    </div>
                                    <div class="recommendation-content">
                                        <h4>Increase Hydration</h4>
                                        <p>Aim for 8-10 glasses of water daily. Set reminders throughout the day to help you remember to drink water regularly.</p>
                                    </div>
                                </div>
                                <div class="recommendation-item">
                                    <div class="recommendation-icon">
                                        <i class="fas fa-bed"></i>
                                    </div>
                                    <div class="recommendation-content">
                                        <h4>Improve Sleep Routine</h4>
                                        <p>Establish a consistent sleep schedule by going to bed and waking up at the same time each day, even on weekends.</p>
                                    </div>
                                </div>
                                <div class="recommendation-item">
                                    <div class="recommendation-icon">
                                        <i class="fas fa-dumbbell"></i>
                                    </div>
                                    <div class="recommendation-content">
                                        <h4>Diversify Exercise</h4>
                                        <p>Add variety to your workout routine by incorporating different types of exercises, such as strength training, cardio, and flexibility work.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary">Download Report</button>
                        <button class="btn btn-secondary modal-close-btn">Close</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add modal styles if not already added
        if (!document.getElementById('modalStyles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'modalStyles';
            modalStyles.textContent = `
                .assessment-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background-color: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #dadce0;
                }
                
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #5f6368;
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #dadce0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                }
                
                .results-summary {
                    display: flex;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .result-score {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .result-score svg {
                    width: 150px;
                    height: 150px;
                }
                
                .result-score p {
                    margin-top: 0.5rem;
                    font-weight: 500;
                }
                
                .result-details {
                    flex: 1;
                }
                
                .result-categories {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-top: 1rem;
                }
                
                .result-category h4 {
                    margin-bottom: 0.75rem;
                }
                
                .result-category ul {
                    padding-left: 1.5rem;
                }
                
                .result-category li {
                    margin-bottom: 0.5rem;
                }
                
                .results-recommendations h3 {
                    margin-bottom: 1.5rem;
                }
                
                .recommendation-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                
                .recommendation-item {
                    display: flex;
                    gap: 1rem;
                    background-color: #f8f9fa;
                    padding: 1.5rem;
                    border-radius: 8px;
                }
                
                .recommendation-icon {
                    width: 40px;
                    height: 40px;
                    background-color: #a8c7fa;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                
                .recommendation-icon i {
                    color: #4285f4;
                    font-size: 1.2rem;
                }
                
                .recommendation-content h4 {
                    margin-bottom: 0.5rem;
                }
                
                .recommendation-content p {
                    margin: 0;
                    color: #5f6368;
                }
                
                @media (max-width: 768px) {
                    .results-summary {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .result-categories {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(modalStyles);
        }
        
        // Add event listeners to close modal
        const modal = document.getElementById('assessmentResultsModal');
        const closeButtons = modal.querySelectorAll('.modal-close, .modal-close-btn');
        
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                modal.remove();
            });
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Handle download report button
        const downloadButton = modal.querySelector('.btn-primary');
        downloadButton.addEventListener('click', function() {
            alert('Report download functionality would be implemented here.');
        });
    }
    
    // Function to start assessment
    function startAssessment(assessmentId, assessmentTitle) {
        // In a real app, this would navigate to the assessment page
        // For demo, we'll show a modal with sample questions
        
        // Create modal HTML
        const modalHTML = `
            <div class="assessment-modal" id="assessmentModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${assessmentTitle}</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="assessment-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: 20%"></div>
                            </div>
                            <span class="progress-text">Question 1 of 5</span>
                        </div>
                        <div class="assessment-question">
                            <h3>How would you rate your overall energy levels throughout the day?</h3>
                            <div class="question-options">
                                <label class="option">
                                    <input type="radio" name="q1" value="1">
                                    <span class="option-text">Very low - I feel tired most of the day</span>
                                </label>
                                <label class="option">
                                    <input type="radio" name="q1" value="2">
                                    <span class="option-text">Low - I often feel tired and need to rest</span>
                                </label>
                                <label class="option">
                                    <input type="radio" name="q1" value="3">
                                    <span class="option-text">Moderate - I have adequate energy for most activities</span>
                                </label>
                                <label class="option">
                                    <input type="radio" name="q1" value="4">
                                    <span class="option-text">High - I have good energy throughout the day</span>
                                </label>
                                <label class="option">
                                    <input type="radio" name="q1" value="5">
                                    <span class="option-text">Very high - I feel energetic all day long</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" disabled>Previous</button>
                        <button class="btn btn-primary">Next</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add modal styles if not already added
        if (!document.getElementById('assessmentModalStyles')) {
            const modalStyles = document.createElement('style');
            modalStyles.id = 'assessmentModalStyles';
            modalStyles.textContent = `
                .assessment-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background-color: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #dadce0;
                }
                
                .modal-header h2 {
                    margin: 0;
                    font-size: 1.5rem;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #5f6368;
                }
                
                .modal-body {
                    padding: 1.5rem;
                }
                
                .modal-footer {
                    padding: 1.5rem;
                    border-top: 1px solid #dadce0;
                    display: flex;
                    justify-content: space-between;
                }
                
                .assessment-progress {
                    margin-bottom: 2rem;
                }
                
                .progress-bar {
                    height: 8px;
                    background-color: #f1f3f4;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .progress {
                    height: 100%;
                    background-color: #4285f4;
                    border-radius: 4px;
                }
                
                .progress-text {
                    font-size: 0.9rem;
                    color: #5f6368;
                }
                
                .assessment-question h3 {
                    margin-bottom: 1.5rem;
                }
                
                .question-options {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .option {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    border: 1px solid #dadce0;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .option:hover {
                    background-color: #f8f9fa;
                }
                
                .option input {
                    margin-right: 1rem;
                    width: 20px;
                    height: 20px;
                    accent-color: #4285f4;
                }
                
                .option-text {
                    font-size: 1rem;
                }
                
                .btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `;
            document.head.appendChild(modalStyles);
        }
        
        // Add event listeners to close modal
        const modal = document.getElementById('assessmentModal');
        const closeButton = modal.querySelector('.modal-close');
        
        closeButton.addEventListener('click', function() {
            modal.remove();
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Sample questions for the assessment
        const questions = [
            {
                question: "How would you rate your overall energy levels throughout the day?",
                options: [
                    "Very low - I feel tired most of the day",
                    "Low - I often feel tired and need to rest",
                    "Moderate - I have adequate energy for most activities",
                    "High - I have good energy throughout the day",
                    "Very high - I feel energetic all day long"
                ]
            },
            {
                question: "How many servings of fruits and vegetables do you consume daily?",
                options: [
                    "0-1 servings",
                    "2-3 servings",
                    "4-5 servings",
                    "6-7 servings",
                    "8+ servings"
                ]
            },
            {
                question: "How would you describe your sleep quality?",
                options: [
                    "Very poor - I rarely feel rested",
                    "Poor - I often wake up feeling tired",
                    "Fair - I sometimes feel rested",
                    "Good - I usually feel rested",
                    "Excellent - I consistently wake up feeling refreshed"
                ]
            },
            {
                question: "How often do you engage in physical activity that elevates your heart rate?",
                options: [
                    "Rarely or never",
                    "1-2 times per month",
                    "1-2 times per week",
                    "3-4 times per week",
                    "5+ times per week"
                ]
            },
            {
                question: "How would you rate your stress levels on a typical day?",
                options: [
                    "Very high - I feel overwhelmed most of the time",
                    "High - I often feel stressed",
                    "Moderate - I experience some stress but can manage it",
                    "Low - I rarely feel stressed",
                    "Very low - I almost never feel stressed"
                ]
            }
        ];
        
        // Track current question and answers
        let currentQuestion = 0;
        const answers = [];
        
        // Get elements
        const questionTitle = modal.querySelector('.assessment-question h3');
        const questionOptions = modal.querySelector('.question-options');
        const progressBar = modal.querySelector('.progress');
        const progressText = modal.querySelector('.progress-text');
        const prevButton = modal.querySelector('.btn-outline');
        const nextButton = modal.querySelector('.btn-primary');
        
        // Function to update question
        function updateQuestion() {
            // Update progress
            const progress = ((currentQuestion + 1) / questions.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
            
            // Update question
            questionTitle.textContent = questions[currentQuestion].question;
            
            // Update options
            questionOptions.innerHTML = '';
            questions[currentQuestion].options.forEach((option, index) => {
                const optionHTML = `
                    <label class="option">
                        <input type="radio" name="q${currentQuestion + 1}" value="${index + 1}" ${answers[currentQuestion] === index + 1 ? 'checked' : ''}>
                        <span class="option-text">${option}</span>
                    </label>
                `;
                questionOptions.insertAdjacentHTML('beforeend', optionHTML);
            });
            
            // Update buttons
            prevButton.disabled = currentQuestion === 0;
            nextButton.textContent = currentQuestion === questions.length - 1 ? 'Submit' : 'Next';
        }
        
        // Initialize first question
        updateQuestion();
        
        // Add event listeners to buttons
        prevButton.addEventListener('click', function() {
            if (currentQuestion > 0) {
                currentQuestion--;
                updateQuestion();
            }
        });
        
        nextButton.addEventListener('click', function() {
            // Save current answer
            const selectedOption = modal.querySelector(`input[name="q${currentQuestion + 1}"]:checked`);
            if (selectedOption) {
                answers[currentQuestion] = parseInt(selectedOption.value);
            }
            
            if (currentQuestion < questions.length - 1) {
                // Go to next question
                currentQuestion++;
                updateQuestion();
            } else {
                // Submit assessment
                modal.remove();
                
                // Calculate score (simple average for demo)
                const score = Math.round(answers.reduce((sum, val) => sum + val, 0) / answers.length * 20);
                
                // Show completion message
                alert(`Assessment completed! Your score is ${score}/100. In a real application, this would save your results and provide detailed recommendations.`);
            }
        });
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