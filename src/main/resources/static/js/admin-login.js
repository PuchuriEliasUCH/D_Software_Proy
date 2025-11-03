/* admin-login.js - JavaScript para el login de administrador */

const LS_USER = 'stoqing_user_v2';

// Storage helpers for user
function saveUser(user) {
    localStorage.setItem(LS_USER, JSON.stringify(user));
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem(LS_USER) || 'null');
    } catch (e) {
        return null;
    }
}

// Setup admin login page
function setupAdminLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginMsg = document.getElementById('loginMsg');
    const loginContainer = document.querySelector('.login-container');

    if (!loginForm) return;

    // Check if already logged in
    const user = getUser();
    if (user && user.logged) {
        loginMsg.textContent = 'Ya tienes sesión activa. Redirigiendo...';
        loginMsg.style.color = 'green';
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1500);
        return;
    }

    // Clear any previous messages
    loginMsg.textContent = '';

    // Handle form submission
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;

        // Validate empty fields
        if (!username || !password) {
            showMessage('Por favor completa todos los campos.', 'error');
            return;
        }

        // Show loading state
        setLoadingState(true);

        // Simple authentication: admin/admin (simulate server delay)
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                saveUser({username: username, logged: true, loginTime: new Date().toISOString()});
                showMessage('Acceso correcto. Redirigiendo...', 'success');

                // Redirect to dashboard after delay
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1200);
            } else {
                showMessage('Credenciales inválidas. Intenta nuevamente.', 'error');
                document.getElementById('loginPass').value = '';
                document.getElementById('loginPass').focus();
                setLoadingState(false);
            }
        }, 800);
    });

    // Show message helper
    function showMessage(text, type) {
        loginMsg.textContent = text;
        loginMsg.style.color = type === 'success' ? '#28a745' : '#dc3545';
        loginMsg.style.fontWeight = '500';

        if (type === 'error') {
            loginMsg.style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                loginMsg.style.animation = '';
            }, 500);
        }
    }

    // Loading state helper
    function setLoadingState(loading) {
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const inputs = loginForm.querySelectorAll('input');

        if (loading) {
            if (loginContainer) loginContainer.classList.add('loading');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Ingresando...';
            inputs.forEach(input => input.disabled = true);
        } else {
            if (loginContainer) loginContainer.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Ingresar';
            inputs.forEach(input => input.disabled = false);
        }
    }

    // Add visual feedback to form inputs
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            this.style.borderColor = '#007bff';
            this.style.boxShadow = '0 0 5px rgba(0,123,255,0.25)';
            this.style.transform = 'translateY(-1px)';
        });

        input.addEventListener('blur', function () {
            this.style.borderColor = '';
            this.style.boxShadow = '';
            this.style.transform = '';
        });

        // Clear error message when typing
        input.addEventListener('input', function () {
            if (loginMsg.style.color === 'rgb(220, 53, 69)') {
                loginMsg.textContent = '';
            }
        });
    });

    // Handle enter key on password field
    const passwordField = document.getElementById('loginPass');
    if (passwordField) {
        passwordField.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    // Focus management
    setTimeout(() => {
        const usernameField = document.getElementById('loginUser');
        if (usernameField) {
            usernameField.focus();
        }
    }, 100);

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        const user = getUser();
        if (user && user.logged) {
            window.location.href = 'admin-dashboard.html';
        }
    });

    // Check for expired sessions
    function checkSessionExpiry() {
        const user = getUser();
        if (user && user.loginTime) {
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);

            // Session expires after 8 hours
            if (hoursDiff > 8) {
                saveUser({username: null, logged: false});
                showMessage('Sesión expirada. Ingresa nuevamente.', 'error');
            }
        }
    }

    checkSessionExpiry();
}

// CSS for shake animation
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    try {
        setupAdminLogin();
    } catch (error) {
        console.error('Error initializing admin login:', error);
    }
});