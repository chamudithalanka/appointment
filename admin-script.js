document.addEventListener('DOMContentLoaded', function() {
    // Initialize FullCalendar
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: [], // Will be loaded from database
        eventClick: function(info) {
            // Handle event click
            showAppointmentDetails(info.event);
        }
    });
    calendar.render();

    // Navigation
    document.querySelectorAll('.sidebar a[data-view]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewId = link.dataset.view;
            showView(viewId);
        });
    });

    // Search Appointments
    document.getElementById('searchAppointments').addEventListener('input', function(e) {
        filterAppointments();
    });

    // Filter Status
    document.getElementById('filterStatus').addEventListener('change', function(e) {
        filterAppointments();
    });

    // Load initial data
    loadDashboardStats();
    loadAppointments();
});

function showView(viewId) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.add('hidden');
    });
    // Show selected view
    document.getElementById(`${viewId}View`).classList.remove('hidden');
    // Update active nav link
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`.sidebar a[data-view="${viewId}"]`).classList.add('active');
}

function loadDashboardStats() {
    // This would typically fetch from your backend
    document.getElementById('todayCount').textContent = '5';
    document.getElementById('pendingCount').textContent = '3';
    document.getElementById('completedCount').textContent = '2';
}

function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const tbody = document.getElementById('appointmentsBody');
    tbody.innerHTML = '';

    appointments.forEach(appointment => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${appointment.name}</td>
            <td>${appointment.phone}</td>
            <td>
                <span class="status-badge ${appointment.status}">
                    ${appointment.status}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    ${appointment.status !== 'cancelled' ? `
                        <button onclick="cancelAppointment('${appointment.id}')" 
                                class="action-btn cancel-btn" 
                                title="Cancel Appointment">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                    <button onclick="viewDetails('${appointment.id}')" 
                            class="action-btn view-btn" 
                            title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterAppointments() {
    const searchTerm = document.getElementById('searchAppointments').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    
    // Implement filtering logic here
}

function sendEmail(name) {
    document.getElementById('emailModal').style.display = 'block';
    // Implement email sending logic
}

async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }

    try {
        // Get appointments from localStorage
        let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        // Find and update the appointment status
        const appointmentIndex = appointments.findIndex(app => app.id === appointmentId);
        if (appointmentIndex !== -1) {
            appointments[appointmentIndex].status = 'cancelled';
            
            // Save back to localStorage
            localStorage.setItem('appointments', JSON.stringify(appointments));

            // Show success message
            Toastify({
                text: "Appointment cancelled successfully!",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
            }).showToast();

            // Refresh appointments table
            loadAppointments();
            
            // Update dashboard stats
            loadDashboardStats();
            
            // Send cancellation email to user (if implemented)
            sendCancellationEmail(appointments[appointmentIndex]);
        }
    } catch (error) {
        Toastify({
            text: "Error cancelling appointment!",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff416c, #ff4b2b)",
        }).showToast();
    }
}

// Function to send cancellation email
async function sendCancellationEmail(appointment) {
    // Implement your email sending logic here
    console.log('Sending cancellation email to:', appointment.name);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('emailModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Dashboard stats update function
function updateDashboardStats() {
    try {
        // Get all appointments from localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Calculate stats
        const stats = {
            today: appointments.filter(app => app.date === today).length,
            pending: appointments.filter(app => app.status === 'pending').length,
            completed: appointments.filter(app => app.status === 'completed').length
        };

        // Update the UI with animations
        updateStatWithAnimation('todayCount', stats.today);
        updateStatWithAnimation('pendingCount', stats.pending);
        updateStatWithAnimation('completedCount', stats.completed);

        // Update stat cards visibility
        document.querySelectorAll('.stat-card').forEach(card => {
            const countElement = card.querySelector('p');
            const count = parseInt(countElement.textContent);
            
            if (count === 0) {
                card.classList.add('empty-stat');
            } else {
                card.classList.remove('empty-stat');
            }
        });

    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

// Function to animate stat number updates
function updateStatWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent);
    
    if (currentValue !== newValue) {
        // Add animation class
        element.classList.add('stat-updating');
        
        // Animate the number
        let start = currentValue;
        const end = newValue;
        const duration = 1000; // 1 second
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.classList.remove('stat-updating');
            }
        }

        requestAnimationFrame(updateNumber);
    }
}

// Add this CSS for stat cards