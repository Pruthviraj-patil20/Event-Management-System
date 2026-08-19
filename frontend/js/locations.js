/**
 * EventSphere — Indian States & Cities Location Data & Cascading Dropdown Helper
 */

const Locations = {
  data: null,

  // Embedded default dataset covering all 28 Indian States and 8 Union Territories
  fallbackData: {
    country: 'India',
    countryCode: 'IN',
    states: [
      { code: 'AP', name: 'Andhra Pradesh', type: 'State', cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Tirupati', 'Kakinada', 'Rajahmundry', 'Kadapa', 'Anantapur'] },
      { code: 'AR', name: 'Arunachal Pradesh', type: 'State', cities: ['Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila'] },
      { code: 'AS', name: 'Assam', type: 'State', cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur'] },
      { code: 'BR', name: 'Bihar', type: 'State', cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah'] },
      { code: 'CG', name: 'Chhattisgarh', type: 'State', cities: ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon', 'Jagdalpur'] },
      { code: 'GA', name: 'Goa', type: 'State', cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Calangute', 'Candolim'] },
      { code: 'GJ', name: 'Gujarat', type: 'State', cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand'] },
      { code: 'HR', name: 'Haryana', type: 'State', cities: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Karnal', 'Hisar', 'Rohtak', 'Sonipat', 'Panchkula'] },
      { code: 'HP', name: 'Himachal Pradesh', type: 'State', cities: ['Shimla', 'Dharamshala', 'Manali', 'Solan', 'Mandi', 'Kullu', 'Kasauli', 'Bilaspur'] },
      { code: 'JH', name: 'Jharkhand', type: 'State', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh'] },
      { code: 'KA', name: 'Karnataka', type: 'State', cities: ['Bangalore', 'Mysore', 'Mangalore', 'Hubli-Dharwad', 'Belgaum', 'Manipal', 'Udupi', 'Gulbarga', 'Davangere', 'Shimoga'] },
      { code: 'KL', name: 'Kerala', type: 'State', cities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Alappuzha', 'Palakkad', 'Kottayam', 'Kannur'] },
      { code: 'MP', name: 'Madhya Pradesh', type: 'State', cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna'] },
      { code: 'MH', name: 'Maharashtra', type: 'State', cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai', 'Aurangabad', 'Kolhapur', 'Solapur', 'Amravati', 'Nanded', 'Jalgaon', 'Akola'] },
      { code: 'MN', name: 'Manipur', type: 'State', cities: ['Imphal', 'Churachandpur', 'Thoubal', 'Kakching'] },
      { code: 'ML', name: 'Meghalaya', type: 'State', cities: ['Shillong', 'Tura', 'Cherrapunji', 'Jowai'] },
      { code: 'MZ', name: 'Mizoram', type: 'State', cities: ['Aizawl', 'Lunglei', 'Champhai', 'Serchhip'] },
      { code: 'NL', name: 'Nagaland', type: 'State', cities: ['Kohima', 'Dimapur', 'Mokokchung', 'Tuensang'] },
      { code: 'OD', name: 'Odisha', type: 'State', cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri', 'Sambalpur', 'Berhampur', 'Balasore'] },
      { code: 'PB', name: 'Punjab', type: 'State', cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Pathankot'] },
      { code: 'RJ', name: 'Rajasthan', type: 'State', cities: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer', 'Bikaner', 'Jaisalmer', 'Alwar', 'Pushkar', 'Mount Abu'] },
      { code: 'SK', name: 'Sikkim', type: 'State', cities: ['Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Pelling'] },
      { code: 'TN', name: 'Tamil Nadu', type: 'State', cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Kanchipuram'] },
      { code: 'TS', name: 'Telangana', type: 'State', cities: ['Hyderabad', 'Secunderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam', 'Ramagundam'] },
      { code: 'TR', name: 'Tripura', type: 'State', cities: ['Agartala', 'Udaipur', 'Dharmanagar', 'Kailashahar'] },
      { code: 'UP', name: 'Uttar Pradesh', type: 'State', cities: ['Noida', 'Greater Noida', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj', 'Ghaziabad', 'Meerut', 'Bareilly', 'Aligarh', 'Mathura', 'Ayodhya'] },
      { code: 'UK', name: 'Uttarakhand', type: 'State', cities: ['Dehradun', 'Haridwar', 'Rishikesh', 'Roorkee', 'Haldwani', 'Nainital', 'Mussoorie', 'Rudrapur'] },
      { code: 'WB', name: 'West Bengal', type: 'State', cities: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol', 'Kharagpur', 'Darjeeling', 'Bardhaman'] },
      { code: 'AN', name: 'Andaman and Nicobar Islands', type: 'Union Territory', cities: ['Port Blair', 'Havelock Island', 'Neil Island'] },
      { code: 'CH', name: 'Chandigarh', type: 'Union Territory', cities: ['Chandigarh'] },
      { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'Union Territory', cities: ['Daman', 'Diu', 'Silvassa'] },
      { code: 'DL', name: 'Delhi', type: 'Union Territory', cities: ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Central Delhi', 'Dwarka', 'Rohini', 'Connaught Place', 'Saket'] },
      { code: 'JK', name: 'Jammu and Kashmir', type: 'Union Territory', cities: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Gulmarg', 'Pahalgam', 'Udhampur'] },
      { code: 'LA', name: 'Ladakh', type: 'Union Territory', cities: ['Leh', 'Kargil', 'Nubra'] },
      { code: 'LD', name: 'Lakshadweep', type: 'Union Territory', cities: ['Kavaratti', 'Agatti', 'Minicoy'] },
      { code: 'PY', name: 'Puducherry', type: 'Union Territory', cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'] }
    ]
  },

  async init() {
    if (!this.data) {
      try {
        const res = await fetch('/data/locations.json');
        if (res.ok) {
          this.data = await res.json();
        } else {
          this.data = this.fallbackData;
        }
      } catch (err) {
        this.data = this.fallbackData;
      }
    }
    return this.data;
  },

  getDataset() {
    return this.data || this.fallbackData;
  },

  /**
   * Get list of state objects or state names sorted alphabetically
   */
  getStates() {
    const list = (this.getDataset().states || []).slice();
    return list.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Get cities list for a given state name
   */
  getCitiesForState(stateName) {
    if (!stateName || stateName === 'All' || stateName === 'all') {
      return [];
    }
    const match = this.getStates().find(s => s.name.toLowerCase() === stateName.toLowerCase());
    return match ? [...match.cities].sort((a, b) => a.localeCompare(b)) : [];
  },

  /**
   * Find state name for a given city
   */
  findStateForCity(cityName) {
    if (!cityName || cityName === 'All' || cityName === 'all') return null;
    const lowerCity = cityName.toLowerCase().trim();
    for (const s of this.getStates()) {
      if (s.cities.some(c => c.toLowerCase() === lowerCity)) {
        return s.name;
      }
    }
    return null;
  },

  /**
   * Initialize a two-level cascading selector pair
   * @param {Object} config
   * @param {HTMLSelectElement|string} config.stateSelect - State select element or selector
   * @param {HTMLSelectElement|string} config.citySelect - City select element or selector
   * @param {string} [config.defaultState='All'] - Initial state value
   * @param {string} [config.defaultCity='All'] - Initial city value
   * @param {string} [config.statePlaceholder='All States'] - Option label for default state
   * @param {string} [config.cityPlaceholder='All Cities'] - Option label for default city
   * @param {Function} [config.onStateChange] - Callback when state changes
   * @param {Function} [config.onCityChange] - Callback when city changes
   */
  setupCascadingDropdown(config) {
    const stateEl = typeof config.stateSelect === 'string' ? document.querySelector(config.stateSelect) : config.stateSelect;
    const cityEl = typeof config.citySelect === 'string' ? document.querySelector(config.citySelect) : config.citySelect;

    if (!stateEl || !cityEl) return null;

    const statePlaceholder = config.statePlaceholder || 'All States';
    const cityPlaceholder = config.cityPlaceholder || 'All Cities';

    // Populate State Select
    const states = this.getStates();
    stateEl.innerHTML = `<option value="All">${statePlaceholder}</option>` +
      states.map(s => `<option value="${s.name}">${s.name}</option>`).join('');

    const populateCities = (selectedState, targetCity = 'All') => {
      if (!selectedState || selectedState === 'All') {
        cityEl.innerHTML = `<option value="All">${cityPlaceholder}</option>`;
        cityEl.value = 'All';
        cityEl.disabled = false;
        return;
      }

      const cities = this.getCitiesForState(selectedState);
      cityEl.innerHTML = `<option value="All">${cityPlaceholder}</option>` +
        cities.map(c => `<option value="${c}">${c}</option>`).join('');

      if (targetCity && (targetCity === 'All' || cities.includes(targetCity))) {
        cityEl.value = targetCity;
      } else {
        cityEl.value = 'All';
      }
      cityEl.disabled = false;
    };

    // Initial values
    let initialState = config.defaultState || 'All';
    let initialCity = config.defaultCity || 'All';

    // If city is specified but state is not, auto-detect state
    if (initialCity && initialCity !== 'All' && (!initialState || initialState === 'All')) {
      const detectedState = this.findStateForCity(initialCity);
      if (detectedState) {
        initialState = detectedState;
      }
    }

    if (initialState && initialState !== 'All') {
      stateEl.value = initialState;
    } else {
      stateEl.value = 'All';
    }

    populateCities(initialState, initialCity);

    // Event listener for State change
    stateEl.addEventListener('change', (e) => {
      const val = e.target.value;
      populateCities(val, 'All');
      if (typeof config.onStateChange === 'function') {
        config.onStateChange(val, stateEl, cityEl);
      }
    });

    // Event listener for City change
    cityEl.addEventListener('change', (e) => {
      const val = e.target.value;
      if (typeof config.onCityChange === 'function') {
        config.onCityChange(val, cityEl, stateEl);
      }
    });

    return {
      setState: (stateName, cityName = 'All') => {
        stateEl.value = stateName || 'All';
        populateCities(stateName, cityName);
      },
      setCity: (cityName) => {
        if (cityName && cityName !== 'All') {
          const matchedState = Locations.findStateForCity(cityName);
          if (matchedState && stateEl.value !== matchedState) {
            stateEl.value = matchedState;
            populateCities(matchedState, cityName);
            return;
          }
        }
        cityEl.value = cityName || 'All';
      },
      reset: () => {
        stateEl.value = 'All';
        populateCities('All', 'All');
      }
    };
  }
};

// Auto-initialize on script load
Locations.init();
