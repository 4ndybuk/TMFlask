let currentPayload = null;

export function ticketFilters(attatch) {
    // Apply various and multiple filters to the database

    currentPayload = null;

    const token = document.querySelector('input[name="csrf_token"]').value;
    
    const modal = document.createElement('div');
    const container = document.createElement('div');
    modal.classList.add("modal-overlay");
    container.classList.add("modal");
    container.innerHTML = "<h3 style='margin-bottom: 20px;'>CHOOSE FILTERS</h3>";

    const elements = document.createElement("div");
    elements.style.cssText = `
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 8px 12px;
    `;

    const idLabel = document.createElement('label');
    const idInput = document.createElement('input');
    idLabel.innerHTML = "Ticket ID: ";
    idInput.type = "text";
    idInput.placeholder = " 6-digit ID";

    const creatorLabel = document.createElement('label');
    const creatorInput = document.createElement('input');
    creatorLabel.innerHTML = "Ticket Creator: ";
    creatorInput.type = "text";
    creatorInput.placeholder = " Username";

    const urgencyLabel = document.createElement("label");
    urgencyLabel.innerHTML = "Urgency: ";
    const urgencySelect = document.createElement("select");
    ["None", "Urgent", "Medium", "Low"].forEach(u => {
        const option = document.createElement("option");
        option.value = u;
        option.text = u;
        urgencySelect.appendChild(option);
    });

    const locationLabel = document.createElement("label");
    locationLabel.innerHTML = "Location: "
    const locationInput = document.createElement("input");
    locationInput.type = "text";

    const projectLabel = document.createElement('label');
    projectLabel.innerHTML = "Project: ";
    const projectSelect = document.createElement("select");
    const projects = ["None", "ATLAS Pixel", "ATLAS Strips", "ATLAS Staves",
        "ATLAS Pixel Mechanics", "DarkSide", "General Cleanroom",
        "Wirebonding", "Electronics", "Workshop"];
    projects.forEach(u => {
        const option = document.createElement('option');
        option.value = u;
        option.text = u;
        projectSelect.appendChild(option);
    });

    const applyButton = document.createElement("button");
    applyButton.classList.add("btn-login");
    applyButton.innerText = "APPLY";
    applyButton.style.marginRight = "20px";
    applyButton.style.marginTop = "20px";
    applyButton.addEventListener("click", () => {
        currentPayload = {
            ticketId: idInput.value === "" ? null : idInput.value,
            username: creatorInput.value === "" ? null : creatorInput.value,
            urgency: urgencySelect.value === "None" ? null : urgencySelect.value,
            location: locationInput.value === "" ? null : creatorInput.value,
            project: projectSelect.value === "None" ? null : projectSelect.value
        }
        fetch("/table", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token
            },
            body: JSON.stringify(currentPayload)
        })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                document.querySelector('.tabs').innerHTML = doc.querySelector('.tabs').innerHTML;
                attatch();
            })
            .catch(error => console.log("Error:", error))
        modal.classList.remove("active");
    });

    const closeButton = document.createElement("button");
    closeButton.classList.add("btn-login");
    closeButton.innerText = "CLOSE";
    closeButton.addEventListener("click", () => modal.classList.remove("active"));

    elements.append(idLabel, idInput, creatorLabel, creatorInput, urgencyLabel, urgencySelect, locationLabel, locationInput, projectLabel, projectSelect);

    container.appendChild(elements);
    container.append(applyButton, closeButton);

    modal.appendChild(container);
    document.body.appendChild(modal);
    modal.classList.add("active");
}

export function getPayload() {
    return currentPayload;
}
