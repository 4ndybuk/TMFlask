// Viewing the tabs
export function openTab(evt, tabId) {
    let contents = document.querySelectorAll(".tab-content");
    let buttons = document.querySelectorAll(".tab-btn");

    // Hide all the tab content
    contents.forEach(c => c.classList.remove("active"));
    // Remove active from all buttons
    buttons.forEach(b => b.classList.remove("active"));

    // Show selected tab
    document.getElementById(tabId).classList.add("active");
    // Activate clicked button
    evt.currentTarget.classList.add("active");
    // Save last active tab
    localStorage.setItem("activeTab", tabId);
};
