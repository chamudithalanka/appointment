// When page loads, get and display appointment data
document.addEventListener('DOMContentLoaded', function() {
    // Get appointment data from localStorage
    const appointmentData = JSON.parse(localStorage.getItem('currentAppointment'));
    
    if (appointmentData) {
        // Update summary fields
        document.querySelector('#patientName').textContent = appointmentData.name;
        document.querySelector('#patientPhone').textContent = appointmentData.phone;
        document.querySelector('#appointmentDate').textContent = appointmentData.date;
        document.querySelector('#appointmentTime').textContent = appointmentData.time;
        
        // Store data for PDF generation
        window.appointmentData = appointmentData;
    } else {
        // If no appointment data, redirect to home
        window.location.href = 'index.html';
    }
});

// PDF generation function
function generatePDF() {
    // Get stored appointment data
    const appointmentData = window.appointmentData;
    
    if (!appointmentData) {
        console.error('No appointment data found');
        return;
    }

    // Create new jsPDF instance
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add clinic logo/header
    doc.setFontSize(20);
    doc.setTextColor(119, 75, 162);
    doc.text("Appointment Confirmation", 105, 20, { align: "center" });

    // Add appointment details
    doc.setFontSize(12);
    doc.setTextColor(33, 33, 33);

    const content = [
        ["Name:", appointmentData.name],
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

    // Save the PDF
    doc.save(`Appointment_${appointmentData.name}_${appointmentData.date}.pdf`);
} 