document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');

    // Show loading
    loginBtn.querySelector('.btn-text').classList.add('hidden');
    loginBtn.querySelector('.btn-loader').classList.remove('hidden');

    try {
        // Check credentials (Replace with your actual authentication logic)
        if (username === 'admin' && password === 'admin123') {
            // Set session
            sessionStorage.setItem('adminLoggedIn', 'true');
            
            // Redirect to admin dashboard
            window.location.href = 'admin-dashboard.html';
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        showError('Invalid username or password');
    } finally {
        // Hide loading
        loginBtn.querySelector('.btn-text').classList.remove('hidden');
        loginBtn.querySelector('.btn-loader').classList.add('hidden');
    }
});

// Show/Hide password
document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Check if user is already logged in
function checkAuth() {
    if (!sessionStorage.getItem('adminLoggedIn')) {
        window.location.href = 'admin-login.html';
    }
} 