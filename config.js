// QuizMaster Complete - Production Configuration
window.CONFIG = {
    API_URL: 'https://beaconiq.up.railway.app/api',
    SUPABASE_URL: 'https://kuofkxkeueylcwvoccwu.supabase.co',  // Replace with your Supabase URL
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1b2ZreGtldWV5bGN3dm9jY3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3Nzk4MTUsImV4cCI6MjA3MTM1NTgxNX0.dGaDw56rttHU9JPRGVLg34kQ_SQnR2bMnE2wfdWt7J0'          // Replace with your anon key
};

// API Helper Functions
window.api = {
    async request(endpoint, options = {}) {
        const url = `${window.CONFIG.API_URL}${endpoint}`;
        const token = localStorage.getItem('auth_token');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    // Authentication
    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
        
        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('current_user', JSON.stringify(response.admin));
        }
        
        return response;
    },

    async register(email, password, name, organization) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { email, password, name, organization }
        });
    },

    // Quiz management
    async getQuizzes() {
        return this.request('/quizzes');
    },

    async createQuiz(quizData) {
        return this.request('/quizzes', {
            method: 'POST',
            body: quizData
        });
    },

    async updateQuiz(id, quizData) {
        return this.request(`/quizzes/${id}`, {
            method: 'PUT',
            body: quizData
        });
    },

    async deleteQuiz(id) {
        return this.request(`/quizzes/${id}`, {
            method: 'DELETE'
        });
    },

    // Quiz participation
    async joinQuiz(code, participantData) {
        return this.request(`/quiz/${code}/join`, {
            method: 'POST',
            body: participantData
        });
    },

    // Export functionality
    async exportQuizData(quizId) {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${window.CONFIG.API_URL}/quiz/${quizId}/export`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Export failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'quiz_results.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};

// Initialize API on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔗 QuizMaster API initialized');
    console.log('Backend URL:', window.CONFIG.API_URL);
});
