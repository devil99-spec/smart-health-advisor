// Nearby Health Facilities Locator

class NearbyLocator {
    constructor() {
        this.map = null;
        this.markers = [];
        this.currentLocation = null;
        this.facilities = [];
        this.selectedType = 'all';
        this.maxDistance = 5; // miles
        this.filters = {
            openNow: false,
            wheelchairAccessible: false,
            acceptsInsurance: false
        };
        
        // Sample data for facilities (in a real app, this would come from a database)
        this.sampleFacilities = [
            {
                id: 1,
                name: "City General Hospital",
                type: "hospital",
                lat: 0,
                lng: 0,
                rating: 4.5,
                reviews: 120,
                address: "123 Medical Center Dr",
                phone: "(555) 123-4567",
                hours: "Open 24/7",
                amenities: ["Wheelchair Accessible", "Parking Available", "Accepts Insurance"]
            },
            {
                id: 2,
                name: "Community Health Clinic",
                type: "clinic",
                lat: 0.01,
                lng: 0.01,
                rating: 4.2,
                reviews: 85,
                address: "456 Health St",
                phone: "(555) 234-5678",
                hours: "Mon-Fri: 8am-6pm",
                amenities: ["Wheelchair Accessible", "Accepts Insurance"]
            },
            {
                id: 3,
                name: "Downtown Pharmacy",
                type: "pharmacy",
                lat: -0.01,
                lng: -0.01,
                rating: 4.0,
                reviews: 65,
                address: "789 Medicine Ave",
                phone: "(555) 345-6789",
                hours: "Mon-Sat: 9am-9pm",
                amenities: ["Parking Available"]
            }
        ];
        
        this.initializeMap();
        this.setupEventListeners();
    }
    
    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map('map').setView([0, 0], 13);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Try to get user's location
        this.getCurrentLocation();
    }
    
    setupEventListeners() {
        // Location search
        const locationSearch = document.getElementById('locationSearch');
        locationSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchLocation(locationSearch.value);
            }
        });
        
        // Use current location button
        document.getElementById('useCurrentLocation').addEventListener('click', () => {
            this.getCurrentLocation();
        });
        
        // Facility type filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleFilterChange(btn.dataset.type);
            });
        });
        
        // Additional filters
        document.getElementById('openNow').addEventListener('change', (e) => {
            this.filters.openNow = e.target.checked;
            this.updateFacilities();
        });
        
        document.getElementById('wheelchairAccessible').addEventListener('change', (e) => {
            this.filters.wheelchairAccessible = e.target.checked;
            this.updateFacilities();
        });
        
        document.getElementById('acceptsInsurance').addEventListener('change', (e) => {
            this.filters.acceptsInsurance = e.target.checked;
            this.updateFacilities();
        });
        
        // Distance filter
        document.getElementById('maxDistance').addEventListener('change', (e) => {
            this.maxDistance = parseInt(e.target.value);
            this.updateFacilities();
        });
        
        // Sort options
        document.getElementById('sortFacilities').addEventListener('change', (e) => {
            this.sortFacilities(e.target.value);
        });
        
        // Map controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.map.zoomIn();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.map.zoomOut();
        });
        
        document.getElementById('centerMap').addEventListener('click', () => {
            if (this.currentLocation) {
                this.map.setView(this.currentLocation, 13);
            }
        });
        
        // Modal close button
        document.querySelector('.close-btn').addEventListener('click', () => {
            document.getElementById('facilityModal').classList.remove('active');
        });
    }
    
    async getCurrentLocation() {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });
            
            this.currentLocation = [position.coords.latitude, position.coords.longitude];
            this.map.setView(this.currentLocation, 13);
            
            // Add a marker for current location
            L.marker(this.currentLocation, {
                icon: L.divIcon({
                    className: 'current-location-marker',
                    html: '<i class="fas fa-location-arrow"></i>',
                    iconSize: [20, 20]
                })
            }).addTo(this.map);
            
            // Update facilities around current location
            this.updateFacilitiesAroundLocation();
            
        } catch (error) {
            console.error('Error getting location:', error);
            this.showError('Unable to get your location. Please enter a location manually.');
        }
    }
    
    async searchLocation(query) {
        try {
            // In a real app, you would use a geocoding service here
            // For demo purposes, we'll just use the sample location
            this.currentLocation = [0, 0];
            this.map.setView(this.currentLocation, 13);
            this.updateFacilitiesAroundLocation();
            
        } catch (error) {
            console.error('Error searching location:', error);
            this.showError('Location not found. Please try a different search term.');
        }
    }
    
    updateFacilitiesAroundLocation() {
        if (!this.currentLocation) return;
        
        // In a real app, you would fetch facilities from a database
        // For demo purposes, we'll use the sample data
        this.facilities = this.sampleFacilities.map(facility => ({
            ...facility,
            lat: this.currentLocation[0] + facility.lat,
            lng: this.currentLocation[1] + facility.lng
        }));
        
        this.updateFacilities();
    }
    
    updateFacilities() {
        // Clear existing markers
        this.clearMarkers();
        
        // Filter facilities based on selected type and filters
        const filteredFacilities = this.facilities.filter(facility => {
            if (this.selectedType !== 'all' && facility.type !== this.selectedType) {
                return false;
            }
            
            // Apply additional filters
            if (this.filters.wheelchairAccessible && !facility.amenities.includes('Wheelchair Accessible')) {
                return false;
            }
            
            if (this.filters.acceptsInsurance && !facility.amenities.includes('Accepts Insurance')) {
                return false;
            }
            
            return true;
        });
        
        // Add markers and update list
        this.addMarkers(filteredFacilities);
        this.updateFacilitiesList(filteredFacilities);
    }
    
    addMarkers(facilities) {
        facilities.forEach(facility => {
            const marker = L.marker([facility.lat, facility.lng], {
                icon: this.getMarkerIcon(facility)
            }).addTo(this.map);
            
            marker.bindPopup(this.createPopupContent(facility));
            marker.on('click', () => this.showFacilityDetails(facility));
            
            this.markers.push(marker);
        });
    }
    
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }
    
    getMarkerIcon(facility) {
        const color = facility.type === 'hospital' ? '#ea4335' :
                     facility.type === 'pharmacy' ? '#34a853' :
                     '#4285f4';
        
        return L.divIcon({
            className: 'facility-marker',
            html: `<i class="fas fa-${this.getFacilityIcon(facility.type)}" style="color: ${color}"></i>`,
            iconSize: [24, 24]
        });
    }
    
    getFacilityIcon(type) {
        switch (type) {
            case 'hospital': return 'hospital';
            case 'pharmacy': return 'prescription-bottle-medical';
            case 'clinic': return 'clinic-medical';
            default: return 'hospital';
        }
    }
    
    createPopupContent(facility) {
        return `
            <div class="facility-popup">
                <h4>${facility.name}</h4>
                <div class="rating">
                    ${this.getRatingStars(facility.rating)}
                    <span>(${facility.reviews} reviews)</span>
                </div>
                <div class="facility-type">${this.getFacilityType(facility.type)}</div>
            </div>
        `;
    }
    
    updateFacilitiesList(facilities) {
        const listContainer = document.getElementById('facilitiesList');
        listContainer.innerHTML = '';
        
        facilities.forEach(facility => {
            const card = this.createFacilityCard(facility);
            listContainer.appendChild(card);
        });
    }
    
    createFacilityCard(facility) {
        const card = document.createElement('div');
        card.className = 'facility-card';
        card.innerHTML = `
            <h4>${facility.name}</h4>
            <div class="distance">${this.getDistance(facility)} miles away</div>
            <div class="rating">
                ${this.getRatingStars(facility.rating)}
                <span>(${facility.reviews} reviews)</span>
            </div>
            <div class="facility-type">${this.getFacilityType(facility.type)}</div>
        `;
        
        card.addEventListener('click', () => {
            this.showFacilityDetails(facility);
        });
        
        return card;
    }
    
    showFacilityDetails(facility) {
        // Update modal content
        document.getElementById('facilityName').textContent = facility.name;
        document.getElementById('facilityAddress').textContent = facility.address;
        document.getElementById('facilityPhone').textContent = facility.phone;
        document.getElementById('facilityHours').textContent = facility.hours;
        document.getElementById('facilityRating').textContent = this.getRatingText(facility);
        
        // Update amenities
        const amenitiesList = document.getElementById('facilityAmenities');
        amenitiesList.innerHTML = this.getAmenitiesList(facility);
        
        // Show modal
        document.getElementById('facilityModal').classList.add('active');
        
        // Center map on facility
        this.map.setView([facility.lat, facility.lng], 15);
    }
    
    getFacilityType(type) {
        switch (type) {
            case 'hospital': return 'Hospital';
            case 'pharmacy': return 'Pharmacy';
            case 'clinic': return 'Clinic';
            default: return 'Medical Facility';
        }
    }
    
    getDistance(facility) {
        if (!this.currentLocation) return 'N/A';
        
        const lat1 = this.currentLocation[0];
        const lon1 = this.currentLocation[1];
        const lat2 = facility.lat;
        const lon2 = facility.lng;
        
        // Haversine formula to calculate distance
        const R = 3958.8; // Earth's radius in miles
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance.toFixed(1);
    }
    
    toRad(value) {
        return value * Math.PI / 180;
    }
    
    getRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        return `
            ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
            ${halfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
            ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
        `;
    }
    
    getRatingText(facility) {
        return `${facility.rating.toFixed(1)} (${facility.reviews} reviews)`;
    }
    
    getAmenitiesList(facility) {
        return facility.amenities.map(amenity => `
            <span class="amenity-tag">${amenity}</span>
        `).join('') || 'No amenities listed';
    }
    
    sortFacilities(sortBy) {
        const facilitiesList = document.getElementById('facilitiesList');
        const facilities = Array.from(facilitiesList.children);
        
        facilities.sort((a, b) => {
            const aValue = a.querySelector(`.${sortBy}`).textContent;
            const bValue = b.querySelector(`.${sortBy}`).textContent;
            
            if (sortBy === 'distance') {
                return parseFloat(aValue) - parseFloat(bValue);
            } else if (sortBy === 'rating') {
                return parseFloat(bValue) - parseFloat(aValue);
            } else {
                return aValue.localeCompare(bValue);
            }
        });
        
        facilities.forEach(facility => facilitiesList.appendChild(facility));
    }
    
    handleFilterChange(type) {
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        this.selectedType = type;
        this.updateFacilities();
    }
    
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.querySelector('.locator-container').insertBefore(
            errorDiv,
            document.querySelector('.search-panel')
        );
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize the locator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.nearbyLocator = new NearbyLocator();
}); 