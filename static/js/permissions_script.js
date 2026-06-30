// Function to adjust user permissions to access the ticket
export function openPermissions(token, id) {
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

    const innerNames = document.createElement("div");
    innerNames.style.borderRadius = "10px";
    innerNames.style.padding = "10px 10px";
    innerNames.style.backgroundColor = "#f0f0f0";
    inner.appendChild(innerNames);

    // Declare permissions outside of fetch for further use
    let fetchPerms;

    // Fetch permissions dynamically
    fetch(`/grab_permissions/${id}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': token
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.permissions) {
                alert("Error in fetching ticket permissions");
                return;
            } else {
                fetchPerms = JSON.parse(data.permissions) || "[]"
                if (fetchPerms) {
                    const seen = new Set();
                    fetchPerms.forEach(entry => {
                        const key = `${entry.allowed_name}-${entry.allowed_user}`;
                        if (seen.has(key)) return;
                        seen.add(key);

                        const line = document.createElement("p");
                        line.innerHTML = `★ ${entry.allowed_name} → ${entry.allowed_user} (${entry.allowed_role})`;
                        innerNames.appendChild(line);
                    });
                };
            }
        });

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
    add.style.margin = "10px";
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
                            console.error('Request failed:', data);
                        } else {
                            if (fetchPerms.some(entry => entry.allowed_user === permi_load.allowed_user)) {
                                alert("The user has already been added!")
                            } else {
                                const new_line = document.createElement("p");
                                new_line.innerHTML = `★ ${permi_load.allowed_name} → ${permi_load.allowed_user} (${permi_load.allowed_role})`;
                                innerNames.appendChild(new_line);
                                input.value = "";
                            }
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