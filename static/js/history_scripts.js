// Function for adding new history comments to the ticket
export function appendHistory() {
    // CSRF Token for the history update form
    const csrfUpdateToken = document.querySelector('meta[name="update-csrf-token"]').content;
    const input = document.getElementById("historyInput");
    const dbId = document.getElementById("viewDbId").value;
    const creator = document.getElementById("viewCreator").innerText;
    const timestamp = new Date().toLocaleString();
    const newEntry = input.value.trim();
    if (!newEntry) return;

    // Create a new box elements to display your new input in the modal
    const block = document.createElement("div");
    block.classList.add("history-block");
    block.innerText = `[${timestamp}]\nSubmitted by: ${creator}\n${input.value}`;
    block.style.backgroundColor = "#f0f0f0";
    block.style.padding = "8px";
    block.style.marginBottom = "4px";
    block.style.whiteSpace = "pre-wrap";

    // Append the new element to the history container
    document.getElementById("historyContainer").appendChild(block);
    input.value = "";

    // AJAX POST to backend using DbId
    fetch(`/add_update/${dbId}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfUpdateToken
        },
        // Send the new history entry for updating database in the backend
        body: JSON.stringify({ history: newEntry })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) { alert("Failed to save update!"); }
        })
        .catch(error => console.error("Error:", error));
};