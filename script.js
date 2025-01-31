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
    showSaveIndicator(); // Zeige den "Gespeichert"-Hinweis
}

// Add/update these functions in script.js
function showSaveIndicator() {
    const saveIndicator = document.getElementById('saveIndicator');
    saveIndicator.style.backgroundColor = '#4CAF50'; // Green color
    setTimeout(() => {
        saveIndicator.style.backgroundColor = '#555555'; // Original color
    }, 1000);
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
    fragenElement.innerHTML = `<strong>Antworten zu:</strong> ${content.fragen}`;
    printDiv.appendChild(fragenElement);

    // Füge den Reflexionsfrage Inhalt hinzu
    const reflexionsfrageElement = document.createElement('div');
    reflexionsfrageElement.innerHTML = `<strong>Reflexion:</strong> ${content.reflexionsfrage}`;
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
        ? `${parentTitle}\nAntworten zu: ${assignmentSuffix}`
        : `Antworten zu: ${assignmentSuffix}`;
    
    // Anzeige der Fragen
    savedFragenTitle.textContent = `Antworten zu: ${assignmentSuffix}`;
    savedFragenAnswer.innerHTML = content.fragen;

    // Anzeige der Reflexionsfrage
    savedReflexionsfrageTitle.textContent = `Reflexion: ${assignmentSuffix}`;
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
            ? `${parentTitle} - Antworten zu: ${assignmentSuffix}`
            : `Antworten zu: ${assignmentSuffix}`;

        // Parse the saved JSON content
        const parsedContent = JSON.parse(savedText);

        // Nutze die vorhandene Funktion zum Drucken einer einzelnen Antwort
        printSingleAnswer(titleText, parsedContent);
    });
}

// Funktion zum Generieren und Exportieren einer einzelnen Antwort als HTML
// Removed as per the request

// Funktion zum Exportieren der aktuellen Antwort als HTML
// Removed as per the request

// Funktion zum Generieren und Exportieren aller Antworten als HTML
// Removed as per the request

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

// Optional: Log the initial state of localStorage for debugging
console.log("Initialer Zustand von localStorage:");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)}`);
}
