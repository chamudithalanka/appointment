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

document.getElementById('appointmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        const appointmentData = {
            id: generateUniqueId(),
            name: document.getElementById('name').value,
            phone: document.getElementById('countryCode').value + document.getElementById('phone').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('currentAppointment', JSON.stringify(appointmentData));
        
        // Create WhatsApp message
        const message = createWhatsAppMessage(appointmentData);
        
        // Open WhatsApp
        const whatsappWindow = openWhatsApp(message);

        if (whatsappWindow) {
            // Save to appointments list
            let appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
            appointments.push(appointmentData);
            localStorage.setItem('appointments', JSON.stringify(appointments));

            // Redirect to confirmation page
            window.location.href = 'confirmation.html';
        }

    } catch (error) {
        console.error('Error:', error);
        // Show error toast
    }
});

function createWhatsAppMessage(appointmentData) {
    let message = `🎉 *New Appointment Request*

*Name:* ${appointmentData.name}
*Phone:* ${appointmentData.phone}

*Appointment Details:*
📅 Date: ${appointmentData.date}
⏰ Time: ${appointmentData.time}

*Status:* Pending Confirmation`;

    return message;
}

function openWhatsApp(message) {
    const whatsappNumber = "94781132477";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Try to open in new window
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    
    if (whatsappWindow) {
        return whatsappWindow; // Window opened successfully
    } else {
        // If popup was blocked, try opening in same window
        window.location.href = whatsappUrl;
        return true;
    }
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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