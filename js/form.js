// Global variables
let certificateData = {};
let selectedGenderTemplate = 'cert-male';

function handleClick(radioButton) {
    selectedGenderTemplate = radioButton.value;
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

