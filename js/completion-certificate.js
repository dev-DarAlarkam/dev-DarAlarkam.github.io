const completionCertificateTemplatePath = 'images/completion-certificate.png';
let completionCertificateCache = null;
let completionPreviewRequestId = 0;
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
    invalidateCompletionPreview();
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

function invalidateCompletionPreview() {
    completionPreviewRequestId += 1;
    setCompletionPreviewGenerating(false);
    document.getElementById('completion-certificate-preview').classList.add('hidden');
    document.getElementById('completion-pdf-button').disabled = true;
    document.getElementById('completion-png-button').disabled = true;
}

function setCompletionPreviewGenerating(isGenerating) {
    const workflow = document.getElementById('completion-certificate-workflow');
    const previewButton = document.getElementById('completion-preview-button');
    previewButton.disabled = isGenerating;
    previewButton.textContent = isGenerating ? 'جارٍ إنشاء المعاينة...' : 'معاينة الشهادة';
    workflow.inert = isGenerating;
    workflow.setAttribute('aria-busy', String(isGenerating));
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

function getCompletionCertificateCache() {
    const data = {
        name: document.getElementById('completion-student-name').value.trim(),
        years: { ...completionCertificateYears }
    };
    if (!data.name) {
        throw new Error('يرجى إدخال الاسم الكامل أولاً');
    }
    if (!completionCertificateTemplatePath) {
        throw new Error('أضف مسار قالب الشهادة في completionCertificateTemplatePath');
    }

    const cacheKey = JSON.stringify(data);
    if (completionCertificateCache?.key === cacheKey) {
        return completionCertificateCache;
    }

    const cache = { key: cacheKey, name: data.name, renderedCanvases: new Map() };
    cache.documentPromise = buildCompletionCertificate(data).catch((error) => {
        if (completionCertificateCache === cache) {
            completionCertificateCache = null;
        }
        throw error;
    });
    completionCertificateCache = cache;
    return cache;
}

async function createCompletionCertificate() {
    return getCompletionCertificateCache().documentPromise;
}

async function buildCompletionCertificate(data) {

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
    const nameCanvas = await createGradientNameCanvas(data.name);
    doc.addImage(nameCanvas, 'PNG', 22.5, 129, 165, 30);
    const yearsFontSize = 40;
    const yearsColors = ['#000000', '#000000'];
    const startYearText = `${data.years.start}`;
    const finishYearText = `${data.years.finish}`;

    const startYearCanvas = await createGradientNameCanvas(startYearText, yearsFontSize, yearsColors);
    const finishYearCanvas = await createGradientNameCanvas(finishYearText, yearsFontSize, yearsColors);

    doc.addImage(startYearCanvas, 'PNG', 55, 163, 165, 30);
    doc.addImage(finishYearCanvas, 'PNG', -12, 163, 165, 30);

    return doc;
}

async function renderCompletionCertificate(scale) {
    const cache = getCompletionCertificateCache();
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
                return { canvas, doc, name: cache.name };
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

async function generateCompletionPreview() {
    const requestId = ++completionPreviewRequestId;
    setCompletionPreviewGenerating(true);
    try {
        const { canvas } = await renderCompletionCertificate(1);
        if (requestId !== completionPreviewRequestId) {
            return;
        }
        const preview = document.getElementById('completion-certificate-preview');
        preview.style.backgroundImage = `url("${canvas.toDataURL('image/png')}")`;
        preview.classList.remove('hidden');
        document.getElementById('completion-pdf-button').disabled = false;
        document.getElementById('completion-png-button').disabled = false;
        setCompletionMessage('تم إنشاء معاينة الشهادة بنجاح', 'success');
    } catch (error) {
        if (requestId === completionPreviewRequestId) {
            setCompletionMessage(error.message, 'error');
        }
    } finally {
        if (requestId === completionPreviewRequestId) {
            setCompletionPreviewGenerating(false);
        }
    }
}

async function exportCompletionAsPDF() {
    try {
        const cache = getCompletionCertificateCache();
        const doc = await cache.documentPromise;
        const cleanName = cache.name.replace(/[^\w\u0600-\u06FF]/g, '_');
        doc.save(`Completion_Certificate_${cleanName}.pdf`);
        setCompletionMessage('تم تحميل الشهادة بنجاح!', 'success');
    } catch (error) {
        setCompletionMessage(error.message, 'error');
    }
}

async function exportCompletionAsPNG() {
    try {
        const { canvas, name } = await renderCompletionCertificate(3);
        const cleanName = name.replace(/[^\w\u0600-\u06FF]/g, '_');
        const link = document.createElement('a');
        link.download = `Completion_Certificate_${cleanName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        setCompletionMessage(error.message, 'error');
    }
}

document.getElementById('completion-student-name').addEventListener('input', invalidateCompletionPreview);
initializeCompletionCertificateYears();