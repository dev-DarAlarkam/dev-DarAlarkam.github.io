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

document.getElementById('certificate-type').addEventListener('change', function() {
    const selectedValue = this.value;
    const dynamicFields = document.getElementById('dynamic-fields');
    
    // Clear existing dynamic fields
    dynamicFields.innerHTML = '';
    
    if (selectedValue === '1') {
        // Show selector for single part (جزء واحد)
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="part-selector">اختر الجزء:</label>
                <select id="part-selector" name="partNumber" required>
                    <option value="">اختر الجزء</option>
                    <option value="1">الجزء الأول</option>
                    <option value="2">الجزء الثاني</option>
                    <option value="3">الجزء الثالث</option>
                    <option value="4">الجزء الرابع</option>
                    <option value="5">الجزء الخامس</option>
                    <option value="6">الجزء السادس</option>
                    <option value="7">الجزء السابع</option>
                    <option value="8">الجزء الثامن</option>
                    <option value="9">الجزء التاسع</option>
                    <option value="10">الجزء العاشر</option>
                    <option value="11">الجزء الحادي عشر</option>
                    <option value="12">الجزء الثاني عشر</option>
                    <option value="13">الجزء الثالث عشر</option>
                    <option value="14">الجزء الرابع عشر</option>
                    <option value="15">الجزء الخامس عشر</option>
                    <option value="16">الجزء السادس عشر</option>
                    <option value="17">الجزء السابع عشر</option>
                    <option value="18">الجزء الثامن عشر</option>
                    <option value="19">الجزء التاسع عشر</option>
                    <option value="20">الجزء العشرون</option>
                    <option value="21">الجزء الحادي والعشرون</option>
                    <option value="22">الجزء الثاني والعشرون</option>
                    <option value="23">الجزء الثالث والعشرون</option>
                    <option value="24">الجزء الرابع والعشرون</option>
                    <option value="25">الجزء الخامس والعشرون</option>
                    <option value="26">الجزء السادس والعشرون</option>
                    <option value="27">الجزء السابع والعشرون</option>
                    <option value="28">الجزء الثامن والعشرون</option>
                    <option value="29">الجزء التاسع والعشرون</option>
                    <option value="30">الجزء الثلاثون</option>
                </select>
            </div>
        `;
    } else if (selectedValue === '5') {
        // Show from-to text fields for 5 parts
        dynamicFields.innerHTML = `
            <div class="form-group">
                <label for="parts-from">من الجزء:</label>
                <input type="number" id="parts-from" name="partsFrom" min="1" max="30" required>
            </div>
            <div class="form-group">
                <label for="parts-to">إلى الجزء:</label>
                <input type="number" id="parts-to" name="partsTo" min="1" max="30" required>
            </div>
        `;
        
    }
});

const parts = {
    "1":"الجزء الأول",
    "2":"الجزء الثاني",
    "3":"الجزء الثالث",
    "4":"الجزء الرابع",
    "5":"الجزء الخامس",
    "6":"الجزء السادس",
    "7":"الجزء السابع",
    "8":"الجزء الثامن",
    "9":"الجزء التاسع",
    "10":"الجزء العاشر",
    "11":"الجزء الحادي عشر",
    "12":"الجزء الثاني عشر",
    "13":"الجزء الثالث عشر",
    "14":"الجزء الرابع عشر",
    "15":"الجزء الخامس عشر",
    "16":"الجزء السادس عشر",
    "17":"الجزء السابع عشر",
    "18":"الجزء الثامن عشر",
    "19":"الجزء التاسع عشر",
    "20":"الجزء العشرون",
    "21":"الجزء الحادي والعشرون",
    "22":"الجزء الثاني والعشرون",
    "23":"الجزء الثالث والعشرون",
    "24":"الجزء الرابع والعشرون",
    "25":"الجزء الخامس والعشرون",
    "26":"الجزء السادس والعشرون",
    "27":"الجزء السابع والعشرون",
    "28":"الجزء الثامن والعشرون",
    "29":"جزء تبارك",
    "30":"جزء عمّ",
}