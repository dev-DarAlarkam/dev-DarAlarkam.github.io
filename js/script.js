// Global variables
let certificateData = {};
let selectedGenderTemplate = 'cert-male';

function handleClick(radioButton) {
    selectedGenderTemplate = radioButton.value;
}

// Function to add Arabic font to jsPDF
function SetArabicFontToDoc(doc) {
    try {
        doc.setFont('Amiri-Bold', 'bold');
        return true;

    } catch (error) {
        console.error('Failed to add Arabic font:', error);
        return false;
    }
}

function getCleanName() {
    const cleanName = certificateData.studentName.replace(/[^\w\u0600-\u06FF]/g, '_');
    return `Certificate_${cleanName}_${certificateData.year}`;
}

function validateInput() {

    const studentName = document.getElementById('student-name').value;
    const certificateType = document.getElementById('certificate-type').value;
    let certificateText;    

    if (!studentName || !certificateType) {

        document.getElementById('message').innerHTML = '<div class="error-message">يرجى ملء جميع الحقول المطلوبة</div>';
        return false;

    } else if (certificateType == '1') {
        // Add validation to ensure there's a selected part
        const selectedPart = document.getElementById('part-selector').value;
        if(!selectedPart) {
            document.getElementById('message').innerHTML = '<div class="error-message">يجب أن تختار جزء من القائمة</div>';
            return false;
        }
        certificateText = parts[selectedPart];
        
    } else {
        // Add validation to ensure "to" is greater than "from" and difference is exactly 4
        const fromInput = document.getElementById('parts-from').value;
        const toInput = document.getElementById('parts-to').value;
        const from = parseInt(fromInput);
        const to = parseInt(toInput);
        
        if (from && to) {
            if (to < 1) {
                document.getElementById('message').innerHTML = '<div class="error-message">الجزء الأول لا يمكن أن يكون أقل من 1</div>';
                return false;
            } else if (to - from !== 4) {
                document.getElementById('message').innerHTML = '<div class="error-message">يجب أن يكون الفرق بين الجزأين 4 أجزاء بالضبط</div>';
                return false;
            } else if (to > 30) {
                document.getElementById('message').innerHTML = '<div class="error-message">الجزء الأخير لا يمكن أن يتجاوز 30</div>';
                return false;
            } else {}
        }

        certificateText = "من " + parts[fromInput] + ' إلى ' + parts[toInput];
    }

    // Store data for PDF generation
    certificateData = {
        studentName,
        certificateType,
        certificateText
    };

    return true;
}

// Certificate generation functions
async function generatePreview() {

    if (!validateInput()) {
        return;
    }

    const container = document.getElementById('certificate-preview');
    const backgroundImage = await generatePreviewPNG();


    // Show preview and enable download buttons
    container.style.backgroundImage = `url("${backgroundImage}"`;
    document.getElementById('pdf-button').disabled = false;
    document.getElementById('png-button').disabled = false;
    document.getElementById('message').innerHTML = '<div class="success-message">تم إنشاء معاينة الشهادة بنجاح</div>';
}

function createCertificateWithJsPDF() {

    if (!certificateData.studentName) {
        document.getElementById('message').innerHTML = '<div class="error-message">يرجى إنشاء معاينة الشهادة أولاً</div>';
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        
        // Create new PDF document with higher resolution
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            putOnlyUsedFonts: true,
            compress: false,      // Disable compression for higher quality
            precision: 16  
        });

        doc.addImage(images[selectedGenderTemplate], 'PNG', 0, 0, 210, 297);
        // Add Arabic font support
        SetArabicFontToDoc(doc);
        doc.setFontSize(38);
        doc.setTextColor(13, 148, 71);


        doc.setFontSize(setOptimalFontSize(doc, certificateData.studentName));
        doc.text(certificateData.studentName, 105, 170, { align: 'center' });
        doc.setFontSize(setOptimalFontSize(doc, certificateData.certificateText));
        doc.text(certificateData.certificateText, 105, 210, { align: 'center' });

        // const yearText = " / " + "هـ" + currentYear['hijri'] + " م " + currentYear['georgian'] ;
        const yearText = "م 2025 / ـه 1446";
        
        doc.setFontSize(38);
        doc.setTextColor(13, 148, 71);
        doc.text(yearText, 105, 266, { align: 'center' });
        
        return doc;
    } catch (error) {
        console.error('Error generating PDF:', error);
        document.getElementById('message').innerHTML = '<div class="error-message">حدث خطأ في إنشاء الملف: ' + error.message + '</div>';
    }
}

// Export as PDF
function exportAsPDF() {
    try {
        const doc = createCertificateWithJsPDF();
        doc.save(`${getCleanName()}.pdf`);

        document.getElementById('message').innerHTML = '<div class="success-message">تم تحميل الشهادة بنجاح!</div>';

    } catch (error) {
        console.error('Error generating PDF:', error);
        document.getElementById('message').innerHTML = '<div class="error-message">حدث خطأ في إنشاء ملف PDF: ' + error.message + '</div>';
    }
}

// Export as PNG from PDF
async function exportAsPNG() {
    try {
        const doc = createCertificateWithJsPDF();
        
        // Convert jsPDF to blob
        const pdfBlob = doc.output('blob');
        
        // Create object URL
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Load PDF.js
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        
        // Load the PDF
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1); // First page
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set scale for quality (higher = better quality)
        const scale = 3;
        const viewport = page.getViewport({ scale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render PDF page to canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        // Convert canvas to PNG blob
        canvas.toBlob((blob) => {
            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${getCleanName()}.png`;
            a.click();

            // Cleanup
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(pdfUrl);
        }, 'image/png');
        
    } catch (error) {
        console.error('PNG from PDF export failed:', error);
    }
}

async function generatePreviewPNG() {
    try {
        const doc = createCertificateWithJsPDF();
                
        // Convert jsPDF to blob
        const pdfBlob = doc.output('blob');
        
        // Create object URL
        const pdfUrl = URL.createObjectURL(pdfBlob);
        
        // Load PDF.js
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        
        // Load the PDF
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1); // First page
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Set scale for quality (higher = better quality)
        const scale = 1;
        const viewport = page.getViewport({ scale });
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Render PDF page to canvas
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;
        
        // Convert canvas to base64 PNG
        const base64 = canvas.toDataURL('image/png');
        
        // Cleanup
        URL.revokeObjectURL(pdfUrl);
        
        return base64;
        
    } catch (error) {
        console.error('PNG from PDF preview failed:', error);
    }
}

function setOptimalFontSize(doc, text, maxFontSize = 38, minFontSize = 20) {
    const maxWidth = 165
    let fontSize = maxFontSize;
    
    doc.setFontSize(fontSize);
    let textWidth = doc.getTextWidth(text);
    
    // Reduce font size until text fits
    while (textWidth > maxWidth && fontSize > minFontSize) {
        fontSize -= 0.5;
        doc.setFontSize(fontSize);
        textWidth = doc.getTextWidth(text);
    }
    
    console.log(fontSize);
    return fontSize;
}
