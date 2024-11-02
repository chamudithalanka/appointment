function updateLocalTime() {
    const now = new Date();
    const options = {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const localTimeStr = now.toLocaleTimeString('en-US', options);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryName = timeZone.split('/')[1] || timeZone;
    
    const localTimeElement = document.getElementById('localTimeText');
    localTimeElement.textContent = `${countryName}: ${localTimeStr}`;
}

const inputs = document.querySelectorAll('input, select');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.classList.add('animate__animated', 'animate__pulse');
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.classList.remove('animate__animated', 'animate__pulse');
    });
});

setInterval(updateLocalTime, 1000);
updateLocalTime();

// Initialize EmailJS
emailjs.init("eUS4hyFkK3IagJ29o");

function handleSubmit(event) {
    event.preventDefault();
    
    // Quick validation check
    console.log('Form Submission Started');
    console.log('Checking form data...');
    
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const countryCodeInput = document.getElementById('countryCode');

    // Log all form values
    console.log('Form Values:', {
        name: nameInput?.value,
        phone: phoneInput?.value,
        countryCode: countryCodeInput?.value,
        date: dateInput?.value,
        time: timeInput?.value
    });

    // Check if any field is empty
    if (!nameInput?.value || !phoneInput?.value || !dateInput?.value || !timeInput?.value) {
        Swal.fire({
            title: 'Warning!',
            text: 'Please fill in all required fields',
            icon: 'warning'
        });
        return;
    }

    // Check if date is not in the past
    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        Swal.fire({
            title: 'Invalid Date',
            text: 'Please select a future date',
            icon: 'warning'
        });
        return;
    }

    console.log('Validation passed, proceeding with email sending...');
    
    // Show loading animation
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-spinner';
    document.body.appendChild(loadingDiv);
    
    // Get form data
    const templateParams = {
        name: nameInput.value,
        phone: `${countryCodeInput.value} ${phoneInput.value}`,
        date: new Date(dateInput.value).toLocaleDateString(),
        time: timeInput.value
    };
    
    // Enhanced debug logging
    console.log('Sending email with the following data:', {
        Name: templateParams.name,
        'Phone Number': templateParams.phone,
        'Appointment Date': templateParams.date,
        'Appointment Time': templateParams.time
    });
    
    // Add SweetAlert2 loading state
    Swal.fire({
        title: 'Sending...',
        html: 'Please wait...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // Send email using EmailJS
    emailjs.send(
        "service_0yti8r8",
        "template_55owkah",
        templateParams
    )
    .then(function(response) {
        // Remove loading animation
        loadingDiv.remove();
        
        // Store appointment data in localStorage
        const appointmentData = {
            name: nameInput.value,
            phone: `${countryCodeInput.value} ${phoneInput.value}`,
            date: new Date(dateInput.value).toLocaleDateString(),
            time: timeInput.value,
            id: 'APT' + Date.now() // Generate unique appointment ID
        };
        localStorage.setItem('appointmentData', JSON.stringify(appointmentData));
        
        // Show success message
        Swal.fire({
            title: 'Success!',
            text: 'Your appointment has been booked successfully!',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
        }).then(() => {
            // Redirect to confirmation page
            window.location.href = 'confirmation.html';
        });
    })
    .catch(function(error) {
        // Remove loading animation
        loadingDiv.remove();
        
        // Show error message
        Swal.fire({
            title: 'Error!',
            text: 'Something went wrong. Please try again.',
            icon: 'error'
        });
        console.error('EmailJS Error:', error);
    });
}

// Add form submit event listener
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    } else {
        console.error("Form not found!");
    }
});

document.querySelector('.title-icon').addEventListener('mouseenter', function() {
    this.style.animationPlayState = 'paused';
});

document.querySelector('.title-icon').addEventListener('mouseleave', function() {
    this.style.animationPlayState = 'running';
});

const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.min = today;

// Add PDF generation function
function generatePDF(appointmentData) {
    // Create new jsPDF instance
    const doc = new jsPDF();

    // Add clinic logo/header
    doc.setFontSize(20);
    doc.setTextColor(119, 75, 162); // Purple color
    doc.text("Appointment Confirmation", 105, 20, { align: "center" });

    // Add appointment details
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    const content = [
        ["Patient Name:", appointmentData.name],
        ["Phone Number:", appointmentData.phone],
        ["Appointment Date:", appointmentData.date],
        ["Appointment Time:", appointmentData.time],
        ["Appointment ID:", appointmentData.id],
        ["Status:", "Pending Confirmation"]
    ];

    // Add content using autoTable
    doc.autoTable({
        startY: 40,
        head: [],
        body: content,
        theme: 'plain',
        styles: {
            cellPadding: 5,
            fontSize: 12
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 100 }
        }
    });

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text("Please keep this confirmation for your records.", 105, doc.autoTable.previous.finalY + 20, { align: "center" });
    doc.text("For any changes, please contact us.", 105, doc.autoTable.previous.finalY + 30, { align: "center" });

    // Add QR code or barcode if needed
    // doc.addImage(qrCodeData, 'PNG', 20, doc.autoTable.previous.finalY + 40, 50, 50);

    // Save the PDF
    doc.save(`Appointment_${appointmentData.name}_${appointmentData.date}.pdf`);
}