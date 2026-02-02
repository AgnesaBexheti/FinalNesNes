// Authentication utilities

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        // Update UI for logged in user
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'inline';

        const userInfo = document.getElementById('user-info');
        if (userInfo) {
            userInfo.textContent = `Hello, ${user.username} (${user.roleName})`;
            userInfo.style.display = 'inline';
        }

        // Show dashboard link for all logged-in users
        const dashboardLink = document.getElementById('dashboard-link');
        if (dashboardLink) {
            dashboardLink.style.display = 'inline';
        }

        return { token, user };
    }

    return null;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Add logout event listener
document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    checkAuth();
});
