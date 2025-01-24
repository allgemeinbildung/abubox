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
const assignmentInfoAuftrag = document.getElementById('auftragAssignmentId');
const assignmentInfoReflexion = document.getElementById('reflexionsfrageAssignmentId');

// Setze die Assignment IDs in den Titeln
if (assignmentInfoAuftrag) {
    assignmentInfoAuftrag.textContent = assignmentSuffix || 'defaultAssignment';
}
if (assignmentInfoReflexion) {
    assignmentInfoReflexion.textContent = assignmentSuffix || 'defaultAssignment';
}

// Initialisiere die Quill-Editoren, falls die Elemente existieren
let quillAuftrag, quillReflexion;
if (document.getElementById('auftragBox')) {
    quillAuftrag = new Quill('#auftragBox', {
        theme: 'snow',
        placeholder: 'Gib hier deinen Auftrag ein...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['clean']
            ]
        }
    });

    // Blockiere das Einfügen von Inhalten
    quillAuftrag.root.addEventListener('paste', function(e) {
        e.preventDefault();
        alert("Einfügen von Inhalten ist in diesem Editor deaktiviert.");
    });
}

if (document.getElementById('reflexionsfrageBox')) {
    quillReflexion = new Quill('#reflexionsfrageBox', {
        theme: 'snow',
        placeholder: 'Gib hier deine Reflexionsfrage ein...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
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
const savedAuftragTitle = document.getElementById('savedAuftragTitle');
const savedAuftragAnswer = document.getElementById('savedAuftragAnswer');
const savedReflexionsfrageTitle = document.getElementById('savedReflexionsfrageTitle');
const savedReflexionsfrageAnswer = document.getElementById('savedReflexionsfrageAnswer');
const saveIndicator = document.getElementById('saveIndicator'); // Save Indicator Element

// Funktion zur Anzeige des gespeicherten Textes
function displaySavedAnswer(content) {
    if (!savedAuftragTitle || !savedAuftragAnswer || !savedReflexionsfrageTitle || !savedReflexionsfrageAnswer || !savedAnswerContainer) return;
    // Kombiniere parentTitle und assignmentSuffix, falls verfügbar
    const titleText = parentTitle
        ? `${parentTitle}\nAufgabe: ${assignmentSuffix}`
        : `Aufgabe: ${assignmentSuffix}`;
    
    // Anzeige der Auftrag
    savedAuftragTitle.textContent = `Auftrag: ${assignmentSuffix}`;
    savedAuftragAnswer.innerHTML = content.auftrag;

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
    if (!quillAuftrag || !quillReflexion) return;
    const auftragContent = quillAuftrag.root.innerHTML;
    const reflexionContent = quillReflexion.root.innerHTML;
    const auftragText = quillAuftrag.getText().trim();
    const reflexionText = quillReflexion.getText().trim();

    if (auftragText === "" && reflexionText === "") {
        console.log("Versuch, mit leerem Textfeld zu speichern");
        return;
    }

    const storageKey = STORAGE_PREFIX + assignmentId;
    const contentToSave = {
        auftrag: auftragText ? auftragContent : "",
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
    if (quillAuftrag) quillAuftrag.setText(''); // Leere den Auftrag-Editor
    if (quillReflexion) quillReflexion.setText(''); // Leere den Reflexionsfrage-Editor
    if (savedAnswerContainer) savedAnswerContainer.style.display = 'none';
    console.log("Alle gespeicherten boxsuk-Texte wurden gelöscht");
    loadAllAnswers(); // Aktualisiere die Liste aller gespeicherten Antworten
}

// Funktion zum Löschen aller Antworten (Bulk)
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

    // Füge den Auftrag Inhalt hinzu
    const auftragElement = document.createElement('div');
    auftragElement.innerHTML = `<strong>Auftrag:</strong> ${content.auftrag}`;
    printDiv.appendChild(auftragElement);

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

// Funktion zum Anzeigen des "Gespeichert"-Hinweises
function showSaveIndicator() {
    if (!saveIndicator) return;
    saveIndicator.style.display = 'block';
    saveIndicator.style.backgroundColor = 'green'; // Set background color to green
    saveIndicator.style.color = 'white'; // Set text color to white for better contrast
    setTimeout(() => {
        saveIndicator.style.display = 'none';
    }, 2000); // Verstecken nach 2 Sekunden
}

// Debounce-Funktion zur Begrenzung der Ausführungsrate
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
if (quillAuftrag && quillReflexion) {
    quillAuftrag.on('text-change', function(delta, oldDelta, source) {
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
if (quillAuftrag && quillReflexion) {
    const savedText = localStorage.getItem(STORAGE_PREFIX + assignmentId);
    if (savedText) {
        const parsedSavedText = JSON.parse(savedText);
        if (parsedSavedText.auftrag) {
            quillAuftrag.root.innerHTML = parsedSavedText.auftrag;
            console.log(`Gespeicherten Auftrag für ${STORAGE_PREFIX + assignmentId} geladen`);
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

            // Auftrag Inhalt
            const auftragDiv = document.createElement("div");
            auftragDiv.className = "answerText";
            auftragDiv.innerHTML = `<strong>Auftrag:</strong> ${parsedContent.auftrag}`;
            auftragDiv.style.marginLeft = "30px"; // Platz für die Checkbox schaffen
            draftDiv.appendChild(auftragDiv);

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
            ? `${parentTitle} - Aufgabe: ${assignmentSuffix}`
            : `Aufgabe: ${assignmentSuffix}`;

        // Parse the saved JSON content
        const parsedContent = JSON.parse(savedText);

        // Nutze die vorhandene Funktion zum Drucken einer einzelnen Antwort
        printSingleAnswer(titleText, parsedContent);
    });
}

// Event Listener für die "Alle Antworten drucken / Als PDF speichern" Schaltfläche
if (document.getElementById("printAllBtn")) {
    document.getElementById("printAllBtn").addEventListener('click', function() {
        const storageKeys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX));

        if(storageKeys.length === 0) {
            alert("Keine gespeicherten Antworten zum Drucken oder Speichern als PDF vorhanden.");
            console.log("Versuch, alle Antworten zu drucken, aber keine sind gespeichert");
            return;
        }

        console.log("Drucken aller gespeicherten Antworten wird initiiert");

        // Kombiniere alle gespeicherten Antworten
        let allContent = '';
        storageKeys.sort((a, b) => {
            const suffixA = a.replace(STORAGE_PREFIX, '');
            const suffixB = b.replace(STORAGE_PREFIX, '');
            return suffixB.localeCompare(suffixA, undefined, {numeric: true, sensitivity: 'base'});
        });

        storageKeys.forEach(assignmentIdKey => {
            const text = localStorage.getItem(assignmentIdKey);
            if(text) {
                const parsedContent = JSON.parse(text);
                const assignmentIdMatch = assignmentIdKey.match(/^boxsuk-assignment[_-]?(.+)$/);
                const assignmentIdClean = assignmentIdMatch ? assignmentIdMatch[1] : assignmentIdKey;
                const title = `Aufgabe ${assignmentIdClean}`;
                allContent += `<h3>${title}</h3>`;
                allContent += `<div><strong>Auftrag:</strong> ${parsedContent.auftrag}</div>`;
                allContent += `<div><strong>Reflexionsfrage:</strong> ${parsedContent.reflexionsfrage}</div>`;
                allContent += `<hr>`;
            }
        });

        // Drucken aller Antworten
        printAllAnswers(allContent);
    });
}

// Event Listener für die "Alle auswählen" Checkbox
const selectAllCheckbox = document.getElementById("selectAll");
if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll(".select-answer");
        checkboxes.forEach(cb => cb.checked = this.checked);
        toggleBulkDeleteButton();
    });
}

// Event Listener für die "Ausgewählte löschen" Schaltfläche
if (document.getElementById("bulkDeleteBtn")) {
    document.getElementById("bulkDeleteBtn").addEventListener('click', bulkDeleteAnswers);
}

// Funktion zum Kopieren als Fallback
function fallbackCopyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Verstecke das textarea Element
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
            throw new Error("Fallback copy unsuccessful");
        }
    } catch (err) {
        console.error('Fehler beim Kopieren der Antwort (Fallback): ', err);
    }

    document.body.removeChild(textarea);
}

// Funktion zum Kopieren einer einzelnen Antwort (falls benötigt in anderen Seiten)
function copyAnswer(assignmentId) {
    const content = localStorage.getItem(assignmentId);
    if (content) {
        const parsedContent = JSON.parse(content);
        const combinedText = `Auftrag: ${stripHtml(parsedContent.auftrag)}\nReflexionsfrage: ${stripHtml(parsedContent.reflexionsfrage)}`;
        copyTextToClipboard(combinedText);
    }
}

// Utility function to strip HTML tags
function stripHtml(html) {
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
}

// Funktion zum Kopieren des Textes aus beiden Quill-Editoren
function copyBothAnswers() {
    const currentStorageKey = STORAGE_PREFIX + assignmentId;
    const savedText = localStorage.getItem(currentStorageKey);

    if (!savedText) {
        alert("Keine gespeicherten Antworten zum Kopieren vorhanden.");
        console.log("Versuch, Antworten zu kopieren, aber keine sind gespeichert");
        return;
    }

    const parsedContent = JSON.parse(savedText);
    const combinedText = `Auftrag: ${stripHtml(parsedContent.auftrag)}\nReflexionsfrage: ${stripHtml(parsedContent.reflexionsfrage)}`;

    copyTextToClipboard(combinedText);
}

// Optional: Log the initial state of localStorage for debugging
console.log("Initialer Zustand von localStorage:");
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    console.log(`${key}: ${localStorage.getItem(key)}`);
}

// Event Listener für den neuen "Export als TXT" Button
const exportTxtBtn = document.getElementById("exportTxtBtn");
if (exportTxtBtn) {
    exportTxtBtn.addEventListener('click', function() {
        const currentStorageKey = STORAGE_PREFIX + assignmentId;
        const savedHtml = localStorage.getItem(currentStorageKey);

        if (!savedHtml) {
            alert("Keine gespeicherte Antwort zum Exportieren vorhanden.");
            console.log("Versuch, die Antwort zu exportieren, aber keine ist gespeichert");
            return;
        }

        // Parse the saved JSON content
        const parsedContent = JSON.parse(savedHtml);

        // HTML zu Text mit korrekten Zeilenumbrüchen konvertieren
        const auftragText = stripHtml(parsedContent.auftrag);
        const reflexionText = stripHtml(parsedContent.reflexionsfrage);

        // Füge URL und AssignmentId hinzu
        let plainText = `Auftrag:\n${auftragText}\n\nReflexionsfrage:\n${reflexionText}\n\nURL: ${window.location.href}\nAssignment ID: ${assignmentId}`;

        // Blob und Download
        const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
    
        if ('download' in link) {
            link.download = `${assignmentSuffix || 'antwort'}.txt`;
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100); // Clean up
        } else {
            window.open(url); // Fallback for unsupported browsers
        }

        alert("Alle Antworten wurden als TXT exportiert.");
    });
}
