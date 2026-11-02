const completionCertificateTemplatePath = 'images/completion-certificate.png';
let completionCertificateName = '';
const completionCertificateYearsStorageKey = 'darAlarkamCompletionCertificateYears';
const defaultCompletionCertificateYears = { start: '1444', finish: '1448' };
let completionCertificateYears = { ...defaultCompletionCertificateYears };

function saveCompletionCertificateYears() {
    completionCertificateYears = {
        start: document.getElementById('completion-start-year').value,
        finish: document.getElementById('completion-finish-year').value
    };
    localStorage.setItem(completionCertificateYearsStorageKey, JSON.stringify(completionCertificateYears));
    updateCompletionCertificateYearsDisplay();
    closeCompletionYearsDialog();
}

function restoreCompletionCertificateYears() {
    let savedYears = {};
    try {
        savedYears = JSON.parse(localStorage.getItem(completionCertificateYearsStorageKey) || '{}');
    } catch (error) {
        savedYears = {};
    }

    const isValidHijriYear = (year) => Number.isInteger(Number(year)) && Number(year) >= 1300 && Number(year) <= 1500;
    completionCertificateYears = {
        start: isValidHijriYear(savedYears.start) ? String(savedYears.start) : defaultCompletionCertificateYears.start,
        finish: isValidHijriYear(savedYears.finish) ? String(savedYears.finish) : defaultCompletionCertificateYears.finish
    };
    document.getElementById('completion-start-year').value = completionCertificateYears.start;
    document.getElementById('completion-finish-year').value = completionCertificateYears.finish;
    localStorage.setItem(completionCertificateYearsStorageKey, JSON.stringify(completionCertificateYears));
    updateCompletionCertificateYearsDisplay();
}

function initializeCompletionCertificateYears() {
    const startYear = document.getElementById('completion-start-year');
    const finishYear = document.getElementById('completion-finish-year');

    [startYear, finishYear].forEach((selector) => {
        for (let year = 1442; year <= 1460; year++) {
            selector.add(new Option(`${year} هـ`, String(year)));
        }
    });

    restoreCompletionCertificateYears();
}

function updateCompletionCertificateYearsDisplay() {
    document.getElementById('completion-years-display').textContent =
        `${completionCertificateYears.start} - ${completionCertificateYears.finish} هـ`;
}

function openCompletionYearsDialog() {
    restoreCompletionCertificateYears();
    document.getElementById('completion-years-dialog').showModal();
}

function closeCompletionYearsDialog() {
    document.getElementById('completion-years-dialog').close();
}

function setCompletionMessage(message, type) {
    document.getElementById('completion-message').innerHTML = `<div class="${type}-message">${message}</div>`;
}

async function createGradientNameCanvas(name, maxFontSize = 80, gradientColors = ['#9a682c', '#e9bf68']) {
    const canvas = document.createElement('canvas');
    canvas.width = 1650;
    canvas.height = 300;
    const context = canvas.getContext('2d');
    await document.fonts.load(`${maxFontSize * 3.5278}px "MS Uighur"`, name);

    let fontSize = maxFontSize;
    context.direction = 'rtl';
    context.textAlign = 'center';
    context.textBaseline = 'alphabetic';
    context.font = `${fontSize * 3.5278}px "MS Uighur"`;

    while (context.measureText(name).width > canvas.width && fontSize > 20) {
        fontSize -= 0.5;
        context.font = `${fontSize * 3.5278}px "MS Uighur"`;
    }

    const textWidth = context.measureText(name).width;
    const gradient = context.createLinearGradient(
        (canvas.width + textWidth) / 2,
        0,
        (canvas.width - textWidth) / 2,
        0
    );
    gradient.addColorStop(0, gradientColors[0]);
    gradient.addColorStop(1, gradientColors[1]);
    context.fillStyle = gradient;
    context.fillText(name, canvas.width / 2, 210);
    return canvas;
}

async function createCompletionCertificate() {
    if (!completionCertificateName) {
        throw new Error('يرجى إدخال الاسم الكامل أولاً');
    }
    if (!completionCertificateTemplatePath) {
        throw new Error('أضف مسار قالب الشهادة في completionCertificateTemplatePath');
    }

    const response = await fetch(completionCertificateTemplatePath);
    if (!response.ok) {
        throw new Error('تعذر تحميل قالب الشهادة');
    }

    const templateBlob = await response.blob();
    const templateData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('تعذر قراءة قالب الشهادة'));
        reader.readAsDataURL(templateBlob);
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        compress: true,
        precision: 16
    });

    doc.addImage(templateData, 0, 0, 210, 297);
    const nameCanvas = await createGradientNameCanvas(completionCertificateName);
    doc.addImage(nameCanvas, 'PNG', 22.5, 129, 165, 30);
    const yearsFontSize = 45;
    const yearsColors = ['#58595b', '#58595b'];
    const startYearText = `${completionCertificateYears.start}`;
    const finishYearText = `${completionCertificateYears.finish}`;

    const startYearCanvas = await createGradientNameCanvas(startYearText, yearsFontSize, yearsColors);
    const finishYearCanvas = await createGradientNameCanvas(finishYearText, yearsFontSize, yearsColors);

    doc.addImage(startYearCanvas, 'PNG', 61, 167, 165, 30);
    doc.addImage(finishYearCanvas, 'PNG', -19, 167, 165, 30);

    return doc;
}

async function renderCompletionCertificate(scale) {
    const doc = await createCompletionCertificate();
    const pdfUrl = URL.createObjectURL(doc.output('blob'));

    try {
        const pdfjsLib = window['pdfjs-dist/build/pdf'];
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context, viewport }).promise;
        return { canvas, doc };
    } finally {
        URL.revokeObjectURL(pdfUrl);
    }
}

async function generateCompletionPreview() {
    completionCertificateName = document.getElementById('completion-student-name').value.trim();
    if (!completionCertificateName) {
        setCompletionMessage('يرجى إدخال الاسم الكامل', 'error');
        return;
    }

    try {
        const { canvas } = await renderCompletionCertificate(1);
        const preview = document.getElementById('completion-certificate-preview');
        preview.style.backgroundImage = `url("${canvas.toDataURL('image/png')}")`;
        preview.classList.remove('hidden');
        document.getElementById('completion-pdf-button').disabled = false;
        document.getElementById('completion-png-button').disabled = false;
        setCompletionMessage('تم إنشاء معاينة الشهادة بنجاح', 'success');
    } catch (error) {
        setCompletionMessage(error.message, 'error');
    }
}

async function exportCompletionAsPDF() {
    try {
        completionCertificateName = document.getElementById('completion-student-name').value.trim();
        const doc = await createCompletionCertificate();
        const cleanName = completionCertificateName.replace(/[^\w\u0600-\u06FF]/g, '_');
        doc.save(`Completion_Certificate_${cleanName}.pdf`);
        setCompletionMessage('تم تحميل الشهادة بنجاح!', 'success');
    } catch (error) {
        setCompletionMessage(error.message, 'error');
    }
}

async function exportCompletionAsPNG() {
    try {
        completionCertificateName = document.getElementById('completion-student-name').value.trim();
        const { canvas } = await renderCompletionCertificate(3);
        const cleanName = completionCertificateName.replace(/[^\w\u0600-\u06FF]/g, '_');
        const link = document.createElement('a');
        link.download = `Completion_Certificate_${cleanName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        setCompletionMessage(error.message, 'error');
    }
}

initializeCompletionCertificateYears();