// File: allgemeinbildung-textbox/script.js

// Funktion zum Abrufen eines Abfrageparameters nach Name
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Funktion zum Extrahieren des Seitentitels aus der Referrer-URL
function getParentPageTitle() {
    const referrer = document.referrer;
    if (!referrer) {
        console.warn('Kein Referrer gefunden. Der übergeordnete Seitentitel kann nicht abgerufen werden.');
        return '';
    }

    try {
        const url = new URL(referrer);
        const pathSegments = url.pathname.split('/').filter(segment => segment.length > 0);

        // Suche nach dem Segment 'allgemeinbildung'
        const targetSegment = 'allgemeinbildung';
        const targetIndex = pathSegments.indexOf(targetSegment);

        if (targetIndex === -1) {
            console.warn(`Segment '${targetSegment}' wurde im Pfad der Referrer-URL nicht gefunden.`);
            return '';
        }

        // Extrahiere alle Segmente nach 'allgemeinbildung'
        const relevantSegments = pathSegments.slice(targetIndex + 1);

        if (relevantSegments.length === 0) {
            console.warn('Keine Pfadsegmente nach dem Zielsegment gefunden.');
            return '';
        }

        // Ersetze '+', '-', '_' durch Leerzeichen und dekodiere URI-Komponenten
        const formattedSegments = relevantSegments.map(segment => {
            return decodeURIComponent(segment.replace(/[-_+]/g, ' ')).replace(/\b\w/g, char => char.toUpperCase());
        });

        // Verbinde die Segmente mit ' - ' als Trenner
        const formattedTitle = formattedSegments.join(' - ');

        return formattedTitle;
    } catch (e) {
        console.error('Fehler beim Parsen der Referrer-URL:', e);
        return '';
    }
}

const STORAGE_PREFIX = 'boxsuk-assignment_'; // Eindeutiger Präfix für boxsuk
const assignmentId = getQueryParam('assignmentId') || 'defaultAssignment';
const parentTitle = getParentPageTitle();

// Entferne das Präfix 'assignment', um das Suffix zu erhalten
// Anpassung: Verwende einen case-insensitive regulären Ausdruck
const assignmentSuffix = assignmentId.replace(/^assignment[_-]?/i, '');

// Anzeigeelemente
const assignmentInfoFragen = document.getElementById('fragenAssignmentId');
const assignmentInfoReflexion = document.getElementById('reflexionsfrageAssignmentId');

// Setze die Assignment IDs in den Titeln
if (assignmentInfoFragen) {
    assignmentInfoFragen.textContent = assignmentSuffix || 'defaultAssignment';
}
if (assignmentInfoReflexion) {
    assignmentInfoReflexion.textContent = assignmentSuffix || 'defaultAssignment';
}

// Initialisiere die Quill-Editoren, falls die Elemente existieren
let quillFragen, quillReflexion;
if (document.getElementById('fragenBox')) {
    quillFragen = new Quill('#fragenBox', {
        theme: 'snow',
        placeholder: 'Gib hier deine Antwort ein...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
            ]
        }
    });

    // Set initial content with a numbered list
    quillFragen.clipboard.dangerouslyPasteHTML('<ol><li></li></ol>');

    // Blockiere das Einfügen von Inhalten
    quillFragen.root.addEventListener('paste', function(e) {
        e.preventDefault();
        alert("Einfügen von Inhalten ist in diesem Editor deaktiviert.");
    });
}

if (document.getElementById('reflexionsfrageBox')) {
    quillReflexion = new Quill('#reflexionsfrageBox', {
        theme: 'snow',
        placeholder: 'Gib hier deine Antwort ein...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['clean']
            ]
        }
    });

    // Blockiere das Einfügen von Inhalten
    quillReflexion.root.addEventListener('paste', function(e) {
        e.preventDefault();
        alert("Einfügen von Inhalten ist in diesem Editor deaktiviert.");
    });
}

// Anzeigeelemente für gespeicherte Antworten
const savedAnswerContainer = document.getElementById('savedAnswerContainer');
const savedFragenTitle = document.getElementById('savedFragenTitle');
const savedFragenAnswer = document.getElementById('savedFragenAnswer');
const savedReflexionsfrageTitle = document.getElementById('savedReflexionsfrageTitle');
const savedReflexionsfrageAnswer = document.getElementById('savedReflexionsfrageAnswer');
const saveIndicator = document.getElementById('saveIndicator'); // Save Indicator Element

// Funktion zur Anzeige des gespeicherten Textes
function displaySavedAnswer(content) {
    if (!savedFragenTitle || !savedFragenAnswer || !savedReflexionsfrageTitle || !savedReflexionsfrageAnswer || !savedAnswerContainer) return;
    // Kombiniere parentTitle und assignmentSuffix, falls verfügbar
    const titleText = parentTitle
        ? `${parentTitle}\nFragen: ${assignmentSuffix}`
        : `Fragen: ${assignmentSuffix}`;
    
    // Anzeige der Fragen
    savedFragenTitle.textContent = `Fragen: ${assignmentSuffix}`;
    savedFragenAnswer.innerHTML = content.fragen;

    // Anzeige der Reflexionsfrage
    savedReflexionsfrageTitle.textContent = `Reflexionsfrage: ${assignmentSuffix}`;
    savedReflexionsfrageAnswer.innerHTML = content.reflexionsfrage;

    savedAnswerContainer.style.display = 'block';
}

// Funktion zum Kopieren von Text in die Zwischenablage
function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function() {
            console.log("Text erfolgreich kopiert");
        }, function(err) {
            console.error('Fehler beim Kopieren des Textes: ', err);
            fallbackCopyTextToClipboard(text);
        });
    } else {
        // Fallback zu execCommand
        fallbackCopyTextToClipboard(text);
    }
}

// Funktion zum Kopieren von Text in die Zwischenablage (Fallback)
function fallbackCopyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Verstecke das Textarea-Element
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log("Text erfolgreich kopiert (Fallback)");
        } else {
            throw new Error("Fallback-Kopieren nicht erfolgreich");
        }
    } catch (err) {
        console.error('Fehler beim Kopieren des Textes (Fallback): ', err);
    }

    document.body.removeChild(textarea);
}

// Funktion zum Speichern des Textes in localStorage
function saveToLocal() {
    if (!quillFragen || !quillReflexion) return;
    const fragenContent = quillFragen.root.innerHTML;
    const reflexionContent = quillReflexion.root.innerHTML;
    const fragenText = quillFragen.getText().trim();
    const reflexionText = quillReflexion.getText().trim();

    if (fragenText === "" && reflexionText === "") {
        console.log("Versuch, mit leerem Textfeld zu speichern");
        return;
    }

    const storageKey = STORAGE_PREFIX + assignmentId;
    const contentToSave = {
        fragen: fragenText ? fragenContent : "",
        reflexionsfrage: reflexionText ? reflexionContent : ""
    };
    localStorage.setItem(storageKey, JSON.stringify(contentToSave));
    console.log(`Text für ${storageKey} gespeichert`);
    displaySavedAnswer(contentToSave); // Aktualisiere die Anzeige des gespeicherten Textes
    showSaveIndicator(); // Zeige den "Gespeichert"-Hinweis
    loadAllAnswers(); // Aktualisiere die Liste aller gespeicherten Antworten
}

// Funktion zum Löschen aller gespeicherten Texte aus localStorage
function clearLocalStorage() {
    // Entferne nur Schlüssel mit dem boxsuk-Präfix
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    if (quillFragen) quillFragen.setText(''); // Leere den Fragen-Editor
    if (quillReflexion) quillReflexion.setText(''); // Leere den Reflexionsfrage-Editor
    if (savedAnswerContainer) savedAnswerContainer.style.display = 'none';
    console.log("Alle gespeicherten boxsuk-Texte wurden gelöscht");
    showSaveIndicator(); // Zeige den "Gespeichert"-Hinweis
    loadAllAnswers(); // Aktualisiere die Liste aller gespeicherten Antworten
}

// Funktion zum Löschen ausgewählter Antworten (Bulk)
function bulkDeleteAnswers() {
    const selectedCheckboxes = document.querySelectorAll(".select-answer:checked");
    if(selectedCheckboxes.length === 0) {
        alert("Bitte wählen Sie mindestens eine Antwort zum Löschen aus.");
        return;
    }

    if(!confirm(`Sind Sie sicher, dass Sie ${selectedCheckboxes.length} ausgewählte Antwort(en) löschen möchten?`)) {
        return;
    }

    selectedCheckboxes.forEach(cb => {
        const assignmentId = cb.value;
        localStorage.removeItem(assignmentId);
        console.log(`Antwort für ${assignmentId} gelöscht.`);
    });

    alert(`${selectedCheckboxes.length} Antwort(en) wurden gelöscht.`);
    loadAllAnswers(); // Aktualisiere die Liste der gespeicherten Antworten
}

// Funktion zum Drucken einer einzelnen Antwort
function printSingleAnswer(title, content) {
    // Erstelle ein temporäres Div
    const printDiv = document.createElement('div');
    printDiv.id = 'printSingleContent';

    // Füge den Titel hinzu
    const titleElement = document.createElement('h2');
    titleElement.textContent = title;
    printDiv.appendChild(titleElement);

    // Füge den Fragen Inhalt hinzu
    const fragenElement = document.createElement('div');
    fragenElement.innerHTML = `<strong>Fragen:</strong> ${content.fragen}`;
    printDiv.appendChild(fragenElement);

    // Füge den Reflexionsfrage Inhalt hinzu
    const reflexionsfrageElement = document.createElement('div');
    reflexionsfrageElement.innerHTML = `<strong>Reflexionsfrage:</strong> ${content.reflexionsfrage}`;
    printDiv.appendChild(reflexionsfrageElement);

    // Füge einen Trenner hinzu
    printDiv.appendChild(document.createElement('hr'));

    // Füge das Div zum Body hinzu
    document.body.appendChild(printDiv);

    // Füge die Klasse 'print-single' zum Body hinzu
    document.body.classList.add('print-single');

    // Definiere die Handler-Funktion
    function handleAfterPrint() {
        document.body.classList.remove('print-single');
        const printDivAfter = document.getElementById('printSingleContent');
        if (printDivAfter) {
            document.body.removeChild(printDivAfter);
        }
        // Entferne den Event Listener
        window.removeEventListener('afterprint', handleAfterPrint);
    }

    // Füge den Event Listener hinzu
    window.addEventListener('afterprint', handleAfterPrint);

    // Trigger den Druck
    window.print();
}

// Funktion zur Anzeige des gespeicherten Textes
function displaySavedAnswer(content) {
    if (!savedFragenTitle || !savedFragenAnswer || !savedReflexionsfrageTitle || !savedReflexionsfrageAnswer || !savedAnswerContainer) return;
    // Kombiniere parentTitle und assignmentSuffix, falls verfügbar
    const titleText = parentTitle
        ? `${parentTitle}\nFragen: ${assignmentSuffix}`
        : `Fragen: ${assignmentSuffix}`;
    
    // Anzeige der Fragen
    savedFragenTitle.textContent = `Fragen: ${assignmentSuffix}`;
    savedFragenAnswer.innerHTML = content.fragen;

    // Anzeige der Reflexionsfrage
    savedReflexionsfrageTitle.textContent = `Reflexionsfrage: ${assignmentSuffix}`;
    savedReflexionsfrageAnswer.innerHTML = content.reflexionsfrage;

    savedAnswerContainer.style.display = 'block';
}

// Funktion zum Speichern des Textes in localStorage (Debounced)
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Debounced-Version von saveToLocal (z.B. speichert 2 Sekunden nachdem der Benutzer aufgehört hat zu tippen)
const debouncedSave = debounce(saveToLocal, 2000);

// Event Listener für Textänderungen zur automatischen Speicherung
if (quillFragen && quillReflexion) {
    quillFragen.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user') { // Stelle sicher, dass die Änderung vom Benutzer stammt
            debouncedSave();
        }
    });

    quillReflexion.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user') { // Stelle sicher, dass die Änderung vom Benutzer stammt
            debouncedSave();
        }
    });
}

// Lade gespeicherten Inhalt und setze ihn im Quill-Editor
if (quillFragen && quillReflexion) {
    const savedText = localStorage.getItem(STORAGE_PREFIX + assignmentId);
    if (savedText) {
        const parsedSavedText = JSON.parse(savedText);
        if (parsedSavedText.fragen) {
            quillFragen.root.innerHTML = parsedSavedText.fragen;
            console.log(`Gespeicherten Fragen für ${STORAGE_PREFIX + assignmentId} geladen`);
        }
        if (parsedSavedText.reflexionsfrage) {
            quillReflexion.root.innerHTML = parsedSavedText.reflexionsfrage;
            console.log(`Gespeicherten Reflexionsfrage für ${STORAGE_PREFIX + assignmentId} geladen`);
        }
        displaySavedAnswer(parsedSavedText);
    } else {
        console.log(`Kein gespeicherter Text für ${STORAGE_PREFIX + assignmentId} gefunden`);
    }
}

// Funktion zum Laden und Anzeigen aller gespeicherten Antworten
function loadAllAnswers() {
    const draftContainer = document.getElementById("draftContainer");
    if (!draftContainer) return;
    draftContainer.innerHTML = ""; // Container leeren

    const currentStorageKey = STORAGE_PREFIX + assignmentId;
    const storageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_PREFIX) && key !== currentStorageKey
    );

    console.log(`Gefundene ${storageKeys.length} gespeicherte boxsuk-Assignments`);

    if(storageKeys.length === 0) {
        draftContainer.innerHTML = "<p>Keine gespeicherten Antworten gefunden.</p>";
        return;
    }

    // Sortieren der storageKeys basierend auf dem Suffix in absteigender Reihenfolge (neueste zuerst)
    storageKeys.sort((a, b) => {
        const suffixA = a.replace(STORAGE_PREFIX, '');
        const suffixB = b.replace(STORAGE_PREFIX, '');
        return suffixB.localeCompare(suffixA, undefined, {numeric: true, sensitivity: 'base'});
    });

    console.log("Sortierte Assignment-IDs:", storageKeys);

    storageKeys.forEach(assignmentIdKey => {
        const text = localStorage.getItem(assignmentIdKey);
        if(text) {
            const parsedContent = JSON.parse(text);
            console.log(`Lade Assignment: ${assignmentIdKey}`);
            const draftDiv = document.createElement("div");
            draftDiv.className = "draft";

            // Erstellen einer Checkbox
            const checkboxDiv = document.createElement("div");
            checkboxDiv.style.position = "absolute";
            checkboxDiv.style.top = "10px";
            checkboxDiv.style.left = "10px";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "select-answer";
            checkbox.value = assignmentIdKey; // assignmentId als Wert verwenden
            checkbox.addEventListener('change', toggleBulkDeleteButton);

            const checkboxLabel = document.createElement("label");
            checkboxLabel.textContent = " Auswählen";

            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(checkboxLabel);
            draftDiv.appendChild(checkboxDiv);

            const assignmentIdMatch = assignmentIdKey.match(/^boxsuk-assignment[_-]?(.+)$/);
            const assignmentIdClean = assignmentIdMatch ? assignmentIdMatch[1] : assignmentIdKey;

            const title = document.createElement("h3");
            title.textContent = `Aufgabe ${assignmentIdClean}`;
            draftDiv.appendChild(title);

            // Fragen Inhalt
            const fragenDiv = document.createElement("div");
            fragenDiv.className = "answerText";
            fragenDiv.innerHTML = `<strong>Fragen:</strong> ${parsedContent.fragen}`;
            fragenDiv.style.marginLeft = "30px"; // Platz für die Checkbox schaffen
            draftDiv.appendChild(fragenDiv);

            // Reflexionsfrage Inhalt
            const reflexionsfrageDiv = document.createElement("div");
            reflexionsfrageDiv.className = "answerText";
            reflexionsfrageDiv.innerHTML = `<strong>Reflexionsfrage:</strong> ${parsedContent.reflexionsfrage}`;
            reflexionsfrageDiv.style.marginLeft = "30px"; // Platz für die Checkbox schaffen
            draftDiv.appendChild(reflexionsfrageDiv);

            // Erstellen der Button-Gruppe
            const buttonGroup = document.createElement("div");
            buttonGroup.className = "button-group";

            // Löschen-Schaltfläche
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Antwort löschen";
            deleteBtn.className = "deleteAnswerBtn";
            deleteBtn.addEventListener('click', function() {
                deleteAnswer(assignmentIdKey);
            });
            buttonGroup.appendChild(deleteBtn);
            
            // Neuer Druck-Button
            const printBtn = document.createElement("button");
            printBtn.textContent = "Diese Antwort drucken / Als PDF speichern";
            printBtn.className = "printAnswerBtn";
            printBtn.addEventListener('click', function() {
                printSingleAnswer(`Aufgabe ${assignmentIdClean}`, parsedContent);
            });
            buttonGroup.appendChild(printBtn);
            // Ende Druck-Button

            draftDiv.appendChild(buttonGroup);

            draftContainer.appendChild(draftDiv);
        }
    });

    // Nach dem Laden der Antworten:
    toggleBulkDeleteButton();
}

// Event Listener für den Button "Text drucken / Als PDF speichern" (nun beide Antworten)
if (document.getElementById("downloadAllBtn")) {
    document.getElementById("downloadAllBtn").addEventListener('click', function() {
        const currentStorageKey = STORAGE_PREFIX + assignmentId;
        const savedText = localStorage.getItem(currentStorageKey);

        if (!savedText) {
            alert("Keine gespeicherte Antwort zum Drucken oder Speichern als PDF vorhanden.");
            console.log("Versuch, die aktuelle Antwort zu drucken, aber keine ist gespeichert");
            return;
        }

        console.log("Drucken der aktuellen Antwort wird initiiert");

        // Kombiniere parentTitle und assignmentSuffix für den Titel
        const titleText = parentTitle
            ? `${parentTitle} - Fragen: ${assignmentSuffix}`
            : `Fragen: ${assignmentSuffix}`;

        // Parse the saved JSON content
        const parsedContent = JSON.parse(savedText);

        // Nutze die vorhandene Funktion zum Drucken einer einzelnen Antwort
        printSingleAnswer(titleText, parsedContent);
    });
}

// Funktion zum Generieren und Exportieren einer einzelnen Antwort als HTML
function exportAnswerAsHtml(content, assignmentId) {
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Antwort - Aufgabe ${assignmentId}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #003f5c; }
                hr { border: 0; border-top: 1px solid #ccc; margin: 20px 0; }
                div { margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <h2>Aufgabe ${assignmentId}</h2>
            <div><strong>Fragen:</strong> ${content.fragen}</div>
            <div><strong>Reflexionsfrage:</strong> ${content.reflexionsfrage}</div>
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Feature detection for download attribute
    if (typeof link.download !== 'undefined') {
        link.download = `antwort_${assignmentId}.html`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
        // Fallback for browsers without download support
        window.open(url);
    }
}

// Funktion zum Exportieren der aktuellen Antwort als HTML
function exportAnswerAsHtmlHandler() {
    const savedText = localStorage.getItem(STORAGE_PREFIX + assignmentId);

    if (!savedText) {
        alert("Keine gespeicherte Antwort zum Exportieren vorhanden.");
        console.log("Versuch, die Antwort zu exportieren, aber keine ist gespeichert");
        return;
    }

    const parsedContent = JSON.parse(savedText);
    exportAnswerAsHtml(parsedContent, assignmentSuffix || 'defaultAssignment');
}

// Funktion zum Generieren und Exportieren aller Antworten als HTML
function downloadAllAnswersAsHtml() {
    const answers = getAllSavedAnswers();
    const messageEl = document.getElementById('message');

    if (answers.length === 0) {
        messageEl.textContent = "Keine gespeicherten Antworten gefunden.";
        return;
    }

    let allContent = '';
    answers.forEach(answer => {
        allContent += `<h2>Aufgabe ${answer.id}</h2>`;
        allContent += `<div><strong>Fragen:</strong> ${answer.fragen}</div>`;
        allContent += `<div><strong>Reflexionsfrage:</strong> ${answer.reflexionsfrage}</div>`;
        allContent += `<hr>`;
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Alle Antworten</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #003f5c; }
                hr { border: 0; border-top: 1px solid #ccc; margin: 20px 0; }
                div { margin-bottom: 10px; }
            </style>
        </head>
        <body>
            ${allContent}
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Feature detection for download attribute
    if (typeof link.download !== 'undefined') {
        link.download = 'alle_antworten.html';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        messageEl.textContent = "Alle Antworten wurden als HTML exportiert.";
    } else {
        // Fallback for browsers without download support
        window.open(url);
        messageEl.textContent = "Browser unterstützt den Download nicht. Datei wurde in einem neuen Tab geöffnet.";
    }
}

// Event Listener für den "Alle auswählen" Checkbox
function toggleBulkDeleteButton() {
    const selected = document.querySelectorAll(".select-answer:checked").length;
    const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
    bulkDeleteBtn.disabled = selected === 0;
}

// Event Listener für die "Alle auswählen" Checkbox
document.getElementById("selectAll").addEventListener('change', function() {
    const checkboxes = document.querySelectorAll(".select-answer");
    checkboxes.forEach(cb => cb.checked = this.checked);
    toggleBulkDeleteButton();
});

// Event Listener für den Bulk Delete Button
document.getElementById("bulkDeleteBtn").addEventListener('click', bulkDeleteAnswers);

// Event Listener für den Export als HTML Button (in answers.html)
const exportHtmlBtn = document.getElementById("exportHtmlBtn");
if (exportHtmlBtn) {
    exportHtmlBtn.addEventListener('click', exportAnswerAsHtmlHandler);
}

// Funktion zum Drucken aller Antworten
function printAllAnswers(allContent) {
    // Erstelle ein temporäres Div
    const printDiv = document.createElement('div');
    printDiv.id = 'printAllContent';

    // Füge den kombinierten Inhalt hinzu
    printDiv.innerHTML = allContent;

    // Füge das Div zum Body hinzu
    document.body.appendChild(printDiv);

    // Füge die Klasse 'print-all' zum Body hinzu
    document.body.classList.add('print-all');

    // Definiere die Handler-Funktion
    function handleAfterPrint() {
        document.body.classList.remove('print-all');
        const printDivAfter = document.getElementById('printAllContent');
        if (printDivAfter) {
            document.body.removeChild(printDivAfter);
        }
        // Entferne den Event Listener
        window.removeEventListener('afterprint', handleAfterPrint);
    }

    // Füge den Event Listener hinzu
    window.addEventListener('afterprint', handleAfterPrint);

    // Trigger den Druck
    window.print();
}

// Funktion zum Generieren und Exportieren aller Antworten als HTML (für print_page.html)
function downloadAllAnswersAsHtmlFromPrintPage() {
    const answers = getAllSavedAnswers();
    const messageEl = document.getElementById('message');

    if (answers.length === 0) {
        messageEl.textContent = "Keine gespeicherten Antworten gefunden.";
        return;
    }

    let allContent = '';
    answers.forEach(answer => {
        allContent += `<h2>Aufgabe ${answer.id}</h2>`;
        allContent += `<div><strong>Fragen:</strong> ${answer.fragen}</div>`;
        allContent += `<div><strong>Reflexionsfrage:</strong> ${answer.reflexionsfrage}</div>`;
        allContent += `<hr>`;
    });

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Alle Antworten</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h2 { color: #003f5c; }
                hr { border: 0; border-top: 1px solid #ccc; margin: 20px 0; }
                div { margin-bottom: 10px; }
            </style>
        </head>
        <body>
            ${allContent}
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Feature detection for download attribute
    if (typeof link.download !== 'undefined') {
        link.download = 'alle_antworten.html';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        messageEl.textContent = "Alle Antworten wurden als HTML exportiert.";
    } else {
        // Fallback for browsers without download support
        window.open(url);
        messageEl.textContent = "Browser unterstützt den Download nicht. Datei wurde in einem neuen Tab geöffnet.";
    }
}

// Event Listener für den "Alle Antworten als HTML exportieren" Button (in print_page.html)
const downloadAllHtmlBtn = document.getElementById("downloadAllHtmlBtn");
if (downloadAllHtmlBtn) {
    downloadAllHtmlBtn.addEventListener('click', downloadAllAnswersAsHtml);
}

// Optional: Log the initial state of localStorage for debugging
console.log("Initialer Zustand von localStorage:");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)}`);
}
