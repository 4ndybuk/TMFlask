// Function to adjust user permissions to access the ticket
export function openPermissions(permissions, token, id) {
    const outer = document.getElementById("permissionsModal");
    outer.classList.add("active")

    // Clear previous content
    outer.innerHTML = "";

    // Inner modal
    const inner = document.createElement("div");
    inner.classList.add("modal");
    inner.innerText = "TICKET PERMISSIONS";
    inner.style.gap = "10px"

    const heading = document.createElement("p");
    heading.textContent = "Allowed Users:"
    inner.appendChild(heading);

    if (permissions) {
        const seen = new Set();
        permissions.forEach(entry => {
            const key = `${entry.allowed_name}-${entry.allowed_user}`;
            if (seen.has(key)) return;
            seen.add(key);

            const line = document.createElement("p");
            line.innerHTML = `★ ${entry.allowed_name} → ${entry.allowed_user} (${entry.allowed_role})`;
            inner.appendChild(line);
        });
    };

    inner.appendChild(document.createElement("br"));
    const label = document.createElement("label");
    label.innerHTML = "Add user permission"
    const input = document.createElement("input");
    // input.classList.add("input-modal");
    input.type = "text";
    input.required = true;
    input.classList.add("input-modal");
    input.style.width = "auto";
    input.style.display = "block";
    input.style.margin = " 8px auto";
    input.style.padding = "5px";
    input.placeholder = "Username";
    inner.appendChild(label);
    inner.appendChild(input);
    inner.appendChild(document.createElement("br"));

    const add = document.createElement("button");
    add.type = "button";
    add.innerText = "ADD USER";
    add.classList.add("btn-login");
    add.style.margin = "15px";
    add.addEventListener("click", function () {

        // Verify user first
        fetch(`/verify_user/${input.value}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
                'X-CSRFToken': token
            }
        })
            .then(response => response.json())
            .then(data => {
                if (!data.exists) {
                    alert("User does not exist in the database!")
                    return;
                }

                const permi_load = {
                    allowed_name: data.name,
                    allowed_user: input.value,
                    allowed_role: "User"
                }

                // After user verified
                fetch(`/add_update/${id}`, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': token
                    },
                    // Send the new history entry for updating database in the backend
                    body: JSON.stringify(permi_load)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (!data.success) {
                            alert("Failed to save update!");
                        } else {
                            permissions.push(permi_load);
                            openPermissions(permissions, token, id);
                        }
                    })
                    .catch(error => console.error("Error:", error));
            })
            .catch(error => console.error("Error:", error));
    });

    inner.appendChild(add);

    const close = document.createElement("button");
    close.type = "button";
    close.innerText = "CLOSE";
    close.classList.add("btn-login");
    close.addEventListener("click", () => outer.classList.remove("active"));
    inner.appendChild(close);

    outer.appendChild(inner);
}