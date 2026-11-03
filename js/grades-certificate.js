const gradesCertificateTemplates = {
    gold: 'images/grades-certificate-gold.png',
    silver: 'images/grades-certificate-silver.png',
    bronze: 'images/grades-certificate-bronze.png'
};
const gradesCertificateMaximumRows = 10;
const gradesCertificateTableStyle = {
    position: { x: 32.5, y: 60, width: 145, height: 125 },
    canvas: { width: 1650, height: 1195 },
    fontFamily: 'MS Uighur',
    fontWeight: 'bold',
    title: 'كشف العلامات',
    titleFontSize: 130,
    titleY: 110,
    titleGradient: ['#9a682c', '#e9bf68'],
    textColor: '#000000',
    borderColor: '#9a682c',
    borderWidth: 2,
    headerBackground: '#f2e6d0',
    oddRowBackground: 'rgb(255, 255, 255)',
    evenRowBackground: '#fffcf2',
    averageBackground: '#f2e6d0',
    gradeColumnRatio: 0.34,
    topPadding: 195,
    bottomPadding: 12,
    maxRowHeight: 86,
    maxFontSize: 78,
    minFontSize: 26,
    rowFontScale: 1.1,
    horizontalPadding: 18,
    subjectTextPadding: 36
};
let gradesCertificateRows = [];
let gradesCertificateCache = null;

function addGradesRow(focusInput = true) {
    const tableBody = document.getElementById('grades-table-body');
    if (tableBody.rows.length >= gradesCertificateMaximumRows) {
        setGradesMessage(`يمكن إضافة ${gradesCertificateMaximumRows} مادة كحد أقصى`, 'error');
        return;
    }

    const row = tableBody.insertRow();
    const subjectCell = row.insertCell();
    const subjectInput = document.createElement('input');
    subjectInput.type = 'text';
    subjectInput.name = 'subject';
    subjectInput.setAttribute('aria-label', 'اسم المعيار');
    subjectInput.required = true;
    subjectCell.appendChild(subjectInput);

    const gradeCell = row.insertCell();
    const gradeInput = document.createElement('input');
    gradeInput.type = 'number';
    gradeInput.name = 'grade';
    gradeInput.min = '0';
    gradeInput.max = '100';
    gradeInput.step = '0.5';
    gradeInput.setAttribute('aria-label', 'علامة المعيار من 100');
    gradeInput.required = true;
    gradeCell.appendChild(gradeInput);

    const actionCell = row.insertCell();
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'grades-remove-row';
    removeButton.textContent = 'حذف';
    removeButton.setAttribute('aria-label', 'حذف المعيار');
    removeButton.addEventListener('click', () => {
        row.remove();
        document.getElementById('add-grades-row-button').disabled = false;
        updateGradesAverage();
    });
    actionCell.appendChild(removeButton);

    row.addEventListener('input', updateGradesAverage);
    document.getElementById('add-grades-row-button').disabled = tableBody.rows.length >= gradesCertificateMaximumRows;
    updateGradesAverage();
    if (focusInput) {
        subjectInput.focus();
    }
}

function getGradesCertificateData() {
    const studentName = document.getElementById('grades-student-name').value.trim();
    const rows = [...document.querySelectorAll('#grades-table-body tr')].map((row) => ({
        subject: row.querySelector('[name="subject"]').value.trim(),
        grade: row.querySelector('[name="grade"]').value
    }));

    if (!studentName) {
        throw new Error('يرجى إدخال اسم الطالب');
    }
    if (rows.length === 0) {
        throw new Error('أضف مادة واحدة على الأقل');
    }
    if (rows.some(({ subject, grade }) => !subject || grade === '')) {
        throw new Error('يرجى إدخال اسم المعيار وعلامته لكل صف');
    }
    if (rows.some(({ grade }) => !Number.isFinite(Number(grade)) || Number(grade) < 0 || Number(grade) > 100)) {
        throw new Error('يجب أن تكون كل علامة بين 0 و100');
    }

    const average = rows.reduce((total, row) => total + Number(row.grade), 0) / rows.length;
    return { studentName, rows: rows.map((row) => ({ ...row, grade: Number(row.grade) })), average };
}

function updateGradesAverage() {
    const averageCell = document.getElementById('grades-average');
    document.getElementById('grades-certificate-preview').classList.add('hidden');
    document.getElementById('grades-pdf-button').disabled = true;
    document.getElementById('grades-png-button').disabled = true;
    try {
        const { average } = getGradesCertificateData();
        averageCell.textContent = average.toFixed(1);
    } catch (error) {
        averageCell.textContent = '-';
    }
}

function setGradesMessage(message, type) {
    document.getElementById('grades-message').innerHTML = `<div class="${type}-message">${message}</div>`;
}

function setGradesPreviewGenerating(isGenerating) {
    const section = document.querySelector('.grades-certificate-section');
    const previewButton = document.getElementById('grades-preview-button');
    section.inert = isGenerating;
    section.setAttribute('aria-busy', String(isGenerating));
    previewButton.disabled = isGenerating;
    previewButton.textContent = isGenerating ? 'جارٍ إنشاء المعاينة...' : 'معاينة الشهادة';
}

function getGradesCertificateFileName(extension) {
    const studentName = document.getElementById('grades-student-name').value.trim();
    const cleanName = studentName.replace(/[^\w\u0600-\u06FF]/g, '_');
    return `Grades_Certificate_${cleanName}.${extension}`;
}

function getGradesCertificateMedal(average) {
    if (average >= 80) {
        return 'gold';
    }
    if (average >= 50) {
        return 'silver';
    }
    return 'bronze';
}

function drawGradesTable(context, studentName, rows, average, width, height) {
    const style = gradesCertificateTableStyle;
    const availableHeight = height - style.topPadding - style.bottomPadding;
    const rowHeight = Math.min(style.maxRowHeight, availableHeight / (rows.length + 2));
    const tableTop = style.topPadding;
    const dividerX = width * style.gradeColumnRatio;
    const fontSize = Math.min(style.maxFontSize, rowHeight * style.rowFontScale);
    const tableBottom = tableTop + rowHeight * (rows.length + 2);
    const tableFont = (size) => `${style.fontWeight} ${size}px "${style.fontFamily}"`;

    context.direction = 'rtl';
    context.textBaseline = 'middle';
    context.font = tableFont(fontSize);
    context.lineWidth = style.borderWidth;
    context.strokeStyle = style.borderColor;
    context.fillStyle = style.textColor;
    context.textAlign = 'center';
    const titleText = `${style.title} - ${studentName}`;
    const titleFontSize = fitGradesText(context, titleText, style.titleFontSize, width - style.horizontalPadding * 2, style);
    context.font = tableFont(titleFontSize);
    const titleWidth = context.measureText(titleText).width;
    const titleGradient = context.createLinearGradient(
        (width + titleWidth) / 2,
        0,
        (width - titleWidth) / 2,
        0
    );
    titleGradient.addColorStop(0, style.titleGradient[0]);
    titleGradient.addColorStop(1, style.titleGradient[1]);
    context.fillStyle = titleGradient;
    context.fillText(titleText, width / 2, style.titleY);
    context.font = tableFont(fontSize);

    context.fillStyle = style.headerBackground;
    context.fillRect(0, tableTop, width, rowHeight);
    rows.forEach((row, index) => {
        context.fillStyle = index % 2 === 0 ? style.oddRowBackground : style.evenRowBackground;
        context.fillRect(0, tableTop + rowHeight * (index + 1), width, rowHeight);
    });
    context.fillStyle = style.averageBackground;
    context.fillRect(0, tableTop + rowHeight * (rows.length + 1), width, rowHeight);
    context.fillStyle = style.textColor;

    context.beginPath();
    context.rect(0, tableTop, width, tableBottom - tableTop);
    context.moveTo(0, tableTop);
    context.lineTo(width, tableTop);
    context.moveTo(0, tableBottom);
    context.lineTo(width, tableBottom);
    context.moveTo(dividerX, tableTop);
    context.lineTo(dividerX, tableBottom);
    for (let index = 1; index <= rows.length + 1; index++) {
        const y = tableTop + rowHeight * index;
        context.moveTo(0, y);
        context.lineTo(width, y);
    }
    context.stroke();

    context.textAlign = 'center';
    context.fillText('المعيار', (width + dividerX) / 2, tableTop + rowHeight / 2);
    context.textAlign = 'center';
    context.fillText('العلامة', dividerX / 2, tableTop + rowHeight / 2);

    rows.forEach(({ subject, grade }, index) => {
        const centerY = tableTop + rowHeight * (index + 1.5);
        const subjectFontSize = fitGradesText(context, subject, fontSize, width - dividerX - style.subjectTextPadding, style);
        context.font = tableFont(subjectFontSize);
        context.textAlign = 'center';
        context.fillText(subject, (width + dividerX) / 2, centerY);
        context.font = tableFont(fontSize);
        context.textAlign = 'center';
        context.fillText(String(grade), dividerX / 2, centerY);
    });

    const averageY = tableTop + rowHeight * (rows.length + 1.5);
    context.font = tableFont(fontSize);
    context.textAlign = 'center';
    context.fillText('المعدل', (width + dividerX) / 2, averageY);
    context.textAlign = 'center';
    context.fillText(average.toFixed(1), dividerX / 2, averageY);
}

function fitGradesText(context, text, initialSize, maxWidth, style) {
    let fontSize = initialSize;
    while (fontSize > style.minFontSize) {
        context.font = `${style.fontWeight} ${fontSize}px "${style.fontFamily}"`;
        if (context.measureText(text).width <= maxWidth) {
            break;
        }
        fontSize -= 1;
    }
    return fontSize;
}

function getGradesCertificateCache() {
    const data = getGradesCertificateData();
    const cacheKey = JSON.stringify(data);
    if (gradesCertificateCache?.key === cacheKey) {
        return gradesCertificateCache;
    }

    const cache = { key: cacheKey, renderedCanvases: new Map() };
    cache.documentPromise = buildGradesCertificate(data).catch((error) => {
        if (gradesCertificateCache === cache) {
            gradesCertificateCache = null;
        }
        throw error;
    });
    gradesCertificateCache = cache;
    return cache;
}

async function createGradesCertificate() {
    return getGradesCertificateCache().documentPromise;
}

async function buildGradesCertificate(data) {
    gradesCertificateRows = data.rows;
    const medalType = getGradesCertificateMedal(data.average);
    const response = await fetch(gradesCertificateTemplates[medalType]);
    if (!response.ok) {
        throw new Error('تعذر تحميل قالب شهادة العلامات');
    }

    const templateBlob = await response.blob();
    const templateData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('تعذر قراءة قالب شهادة العلامات'));
        reader.readAsDataURL(templateBlob);
    });

    const canvas = document.createElement('canvas');
    canvas.width = gradesCertificateTableStyle.canvas.width;
    canvas.height = gradesCertificateTableStyle.canvas.height;
    const context = canvas.getContext('2d');
    await document.fonts.load(`${gradesCertificateTableStyle.fontWeight} ${gradesCertificateTableStyle.maxFontSize}px "${gradesCertificateTableStyle.fontFamily}"`);
    drawGradesTable(context, data.studentName, data.rows, data.average, canvas.width, canvas.height);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, precision: 16 });
    doc.addImage(templateData, 'PNG', 0, 0, 210, 297);
    const position = gradesCertificateTableStyle.position;
    doc.addImage(canvas, 'PNG', position.x, position.y, position.width, position.height);
    return doc;
}

async function renderGradesCertificate(scale) {
    const cache = getGradesCertificateCache();
    if (!cache.renderedCanvases.has(scale)) {
        const renderPromise = cache.documentPromise.then(async (doc) => {
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
        }).catch((error) => {
            cache.renderedCanvases.delete(scale);
            throw error;
        });
        cache.renderedCanvases.set(scale, renderPromise);
    }
    return cache.renderedCanvases.get(scale);
}

async function generateGradesPreview() {
    setGradesPreviewGenerating(true);
    try {
        const { canvas } = await renderGradesCertificate(1);
        const preview = document.getElementById('grades-certificate-preview');
        preview.style.backgroundImage = `url("${canvas.toDataURL('image/png')}")`;
        preview.classList.remove('hidden');
        document.getElementById('grades-pdf-button').disabled = false;
        document.getElementById('grades-png-button').disabled = false;
        setGradesMessage('تم إنشاء معاينة شهادة العلامات بنجاح', 'success');
    } catch (error) {
        setGradesMessage(error.message, 'error');
    } finally {
        setGradesPreviewGenerating(false);
    }
}

async function exportGradesAsPDF() {
    try {
        const doc = await createGradesCertificate();
        doc.save(getGradesCertificateFileName('pdf'));
        setGradesMessage('تم تحميل الشهادة بنجاح!', 'success');
    } catch (error) {
        setGradesMessage(error.message, 'error');
    }
}

async function exportGradesAsPNG() {
    try {
        const { canvas } = await renderGradesCertificate(3);
        const link = document.createElement('a');
        link.download = getGradesCertificateFileName('png');
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        setGradesMessage(error.message, 'error');
    }
}

function resetGradesCertificateForm() {
    const tableBody = document.getElementById('grades-table-body');
    document.getElementById('grades-certificate-form').reset();
    tableBody.replaceChildren();
    addGradesRow(false);
    document.getElementById('grades-certificate-preview').classList.add('hidden');
    document.getElementById('grades-pdf-button').disabled = true;
    document.getElementById('grades-png-button').disabled = true;
    document.getElementById('grades-message').innerHTML = '';
}

addGradesRow();