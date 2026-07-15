// JS scripts for the table page HTML
// Running the function after HTML has been fully loaded and parsed

import { openTab } from "./tab_scripts.js";
import { deleteTicket } from "./delete_sript.js";
function attatchTableListeners() {
    // Selecting all status buttons in the table
    document.querySelectorAll(".status-btn").forEach(btn => {
        btn.addEventListener("click", function (event) {
            event.preventDefault(); //Stop form submission

            // extract ID and status
            const button = event.target;
            const dbId = button.dataset.dbId;
            const perms = JSON.parse(button.dataset.permissions) || "[]"
            let status = button.dataset.status;

            // Retrieve CSRF token
            const csrf = button.closest("form").querySelector('input[name="csrf_token"]').value;

            fetch("/confirm_user", {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'X-CSRFToken': csrf
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (!data.logged_user) {
                        alert("Error in fetching logged user!");
                        return;
                    } else {
                        const loggedUser = data.logged_user;
                        if (perms.some(entry => entry.allowed_user === loggedUser)) {
                            // Toggling status locally
                            const newStatus = status === "Active" ? "Completed" : "Active";

                            // Update UI instantly
                            button.dataset.status = newStatus;
                            button.value = newStatus;

                            // Update CSS class based on newStatus
                            if (newStatus === "Active") {
                                button.classList.add("btn-active");
                                button.classList.remove("btn-inactive");
                            } else {
                                button.classList.add("btn-inactive");
                                button.classList.remove("btn-active");
                            }

                            // Send to backend for database udpate
                            fetch(`/update_status/${dbId}`, {
                                method: 'POST',
                                credentials: 'same-origin',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRFToken': csrf
                                },
                                body: JSON.stringify({ status: newStatus })
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (!data.success) { alert("Database update failed!"); }
                                })
                                .catch(error => console.error("Error:", error));
                        } else {
                            alert("You don't have permissions to change the status!")
                        }
                    }    
                });
    });
    });

    // All View buttons for the ticket history with information
    document.querySelectorAll(".view-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            openViewModal(btn.dataset);
        });
    });

    // All delete buttons for the tickets
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            deleteTicket(
                btn.dataset.dbId,
                JSON.parse(btn.dataset.permissions || "[]")
            );
        });
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", (event) => {
            openTab(event, btn.dataset.tab)
        });
    });

    // Restoring last tab on page reload
    const savedTab = localStorage.getItem("activeTab");
    if (savedTab) {
        const btn = document.querySelector(`[data-tab="${savedTab}"]`);
        if (btn) btn.click();
    };
};

document.addEventListener("DOMContentLoaded", function () {
    attatchTableListeners();
});

// Opening a modal for ticket creation
function openCreateModal() {
    document.getElementById("createModal").classList.add("active");
}
const addTicket = document.getElementById("add-ticket-btn");
addTicket.addEventListener("click", openCreateModal);

// Closing the modal for ticket creation
function closeCreateModal() {
    document.getElementById("createModal").classList.remove("active");
}
const closeTicket = document.getElementById("close-ticket-btn");
closeTicket.addEventListener("click", closeCreateModal)

// Opening and closing the view modal
import { openViewModal, closeViewModal } from "./view_scripts.js";
const closeView = document.getElementById("close-view-modal");
closeView.addEventListener("click", closeViewModal);

// Append history in view
import { appendHistory } from "./history_scripts.js";
const saveHistory = document.getElementById("save-history-btn");
saveHistory.addEventListener("click", () => {
    appendHistory().catch(error => {
        alert("Failed to save the comment. Please try again.")
    });
});

// View file upload
import { uploadFile } from "./upload_scripts.js";
const uploadButton = document.getElementById("upload-file-btn");
uploadButton.style.padding = "5px";
uploadButton.addEventListener("click", uploadFile);

// Archive ticket button
import { archiveTicket } from "./archive_scripts.js";
const archiveButton = document.getElementById("archive-view-modal");
archiveButton.addEventListener("click", archiveTicket)

// Save current filters to storage, or clear if there are none
function savePayload() {
    const payload = getPayload();
    if (payload) {
        localStorage.setItem('payload', JSON.stringify(payload));
    } else {
        localStorage.removeItem('payload');
    }
}

// Refresh function
function refreshReset() {
    const token = document.querySelector('input[name="csrf_token"]').value;
    const stored = localStorage.getItem('payload');
    const payload = stored ? JSON.parse(stored) : null;

    fetch("/table", {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': token
        },
        body: JSON.stringify(payload)
    })
        .then(response => {
                // Check if redirected to login (usually 401 or redirect)
                console.log('Status:', response.status);
                console.log('Redirected:', response.redirected);
                return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            document.querySelector('.tabs').innerHTML = doc.querySelector('.tabs').innerHTML;
            attatchTableListeners();
            const savedTab = localStorage.getItem("activeTab");
            if (savedTab) {
                const btn = document.querySelector(`[data-tab="${savedTab}"]`);
                if (btn) btn.click();
            }
        })
        .catch(error => console.log("Error:", error))
}

// Filter button - apply filters, then persist them
import { ticketFilters, getPayload } from "./filter_scripts.js";
document.getElementById("filterButton").addEventListener("click", () => {
    ticketFilters(() => {
        savePayload();
        attatchTableListeners();
    });
});

const resetButton = document.getElementById("resetButton");
resetButton.style.minWidth = "150px";
resetButton.addEventListener("click", () => {
    localStorage.removeItem('payload');
    refreshReset();
});

document.getElementById('logoutButton').style.color = "red";
document.getElementById('add-ticket-btn').style.color = "#0310cb";

// Refresh button
document.getElementById("refreshButton").addEventListener("click", () => {
    refreshReset();
});