// QuizMaster Complete - Production Configuration
// Replace with your actual URLs after deployment

window.CONFIG = {
    API_URL: 'https://your-railway-url-here.railway.app/api',
    SUPABASE_URL: 'https://your-project-id.supabase.co',
    SUPABASE_ANON_KEY: 'your_anon_key_from_supabase'
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

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
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

    async joinQuiz(code, participantData) {
        return this.request(`/quiz/${code}/join`, {
            method: 'POST',
            body: participantData
        });
    },

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
