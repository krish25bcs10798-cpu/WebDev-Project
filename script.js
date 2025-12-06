const navAddTab = document.getElementById('tabAdd');
const navListTab = document.getElementById('tabList');

const paneAddQuote = document.getElementById('paneAdd');
const paneSavedQuotes = document.getElementById('paneList');

const fieldAuthor = document.getElementById('inputAuthor');
const fieldQuote = document.getElementById('inputQuote');

const btnAddQuote = document.getElementById('btnSave');
const btnClearForm = document.getElementById('btnClearForm');
const btnRemoveAll = document.getElementById('btnDeleteAll');
const btnExportQuotes = document.getElementById('btnExport');

const quoteList = document.getElementById('quoteList');
const emptyMessage = document.getElementById('emptyHint');

const toastBox = document.getElementById('toast');

const modalEdit = document.getElementById('editModal');
const modalEditInput = document.getElementById('editTextarea');
const btnEditSave = document.getElementById('btnSaveEdit');
const btnEditCancel = document.getElementById('btnCancelEdit');


// ======================
// DATA STORAGE
// ======================
const STORAGE_KEY = "quotes_v3";
let quotesData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editIndex = null;


// ======================
// UI HELPERS
// ======================

function switchPane(showList) {
    if (showList) {
        paneAddQuote.classList.add("qa__pane--hidden");
        paneSavedQuotes.classList.remove("qa__pane--hidden");

        navAddTab.classList.remove("qa__tab--active");
        navListTab.classList.add("qa__tab--active");

        renderQuotes();
    } else {
        paneAddQuote.classList.remove("qa__pane--hidden");
        paneSavedQuotes.classList.add("qa__pane--hidden");

        navAddTab.classList.add("qa__tab--active");
        navListTab.classList.remove("qa__tab--active");
    }
}


// Save to localStorage
function storeQuotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotesData));
}


// Clean toast popup
function showToast(message) {
    toastBox.textContent = message;
    toastBox.classList.add("show");
    setTimeout(() => toastBox.classList.remove("show"), 1500);
}


// ======================
// MAIN LOGIC
// ======================

function addQuoteToList() {
    const author = fieldAuthor.value.trim() || "Unknown";
    const text = fieldQuote.value.trim();

    if (!text) {
        showToast("Please write a quote");
        return;
    }

    quotesData.push({ author, text });
    storeQuotes();

    fieldAuthor.value = "";
    fieldQuote.value = "";

    showToast("Quote Saved");
}


function renderQuotes() {
    quoteList.innerHTML = "";

    if (quotesData.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    quotesData.forEach((quote, index) => {
        const item = document.createElement("li");
        item.className = "qa__item";

        item.innerHTML = `
            <div class="qa__meta">${quote.author}</div>
            <div class="qa__text">"${quote.text}"</div>

            <div class="qa__actions-inline">
                <button class="qa__small-btn qa__small-copy" data-id="${index}">Copy</button>
                <button class="qa__small-btn qa__small-edit" data-id="${index}">Edit</button>
                <button class="qa__small-btn qa__small-delete" data-id="${index}">Delete</button>
            </div>
        `;

        quoteList.appendChild(item);
    });
}


function deleteSingleQuote(id) {
    quotesData.splice(id, 1);
    storeQuotes();
    renderQuotes();
    showToast("Deleted");
}


function startEditQuote(id) {
    editIndex = id;
    modalEditInput.value = quotesData[id].text;
    modalEdit.classList.remove("qa__modal--hidden");
}


function saveEditedQuote() {
    const updated = modalEditInput.value.trim();
    if (!updated) {
        showToast("Quote cannot be empty");
        return;
    }

    quotesData[editIndex].text = updated;
    storeQuotes();
    modalEdit.classList.add("qa__modal--hidden");
    renderQuotes();
    showToast("Updated");
}


function copyQuoteText(id) {
    navigator.clipboard.writeText(quotesData[id].text);
    showToast("Copied");
}


function clearAll() {
    if (!confirm("Delete all quotes?")) return;

    quotesData = [];
    storeQuotes();
    renderQuotes();
    showToast("All Deleted");
}


function exportQuotes() {
    const file = new Blob([JSON.stringify(quotesData, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "quotes.json";
    link.click();
}


// ======================
// EVENT LISTENERS
// ======================

// Tabs
navAddTab.addEventListener("click", () => switchPane(false));
navListTab.addEventListener("click", () => switchPane(true));

// Add quote
btnAddQuote.addEventListener("click", addQuoteToList);

// Clear form
btnClearForm.addEventListener("click", () => {
    fieldAuthor.value = "";
    fieldQuote.value = "";
});

// Delete all
btnRemoveAll.addEventListener("click", clearAll);

// Export
btnExportQuotes.addEventListener("click", exportQuotes);

// Modal handlers
btnEditSave.addEventListener("click", saveEditedQuote);
btnEditCancel.addEventListener("click", () => modalEdit.classList.add("qa__modal--hidden"));

// Escape key closes modal
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modalEdit.classList.add("qa__modal--hidden");
});

// Event delegation for copy/edit/delete
quoteList.addEventListener("click", (e) => {
    const target = e.target.closest("button");
    if (!target) return;

    const id = Number(target.dataset.id);

    if (target.classList.contains("qa__small-copy")) {
        copyQuoteText(id);
    } else if (target.classList.contains("qa__small-edit")) {
        startEditQuote(id);
    } else if (target.classList.contains("qa__small-delete")) {
        deleteSingleQuote(id);
    }
});


// Load initial state
switchPane(false);
renderQuotes();
