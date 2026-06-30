import { openPermissions } from "./permissions_script.js";
// Opening a modal with retrieved information and History and File Upload inputs
export function openViewModal(data) {

    // CSRF Token
    const csrfStageToken = document.querySelector('meta[name="stage-csrf-token"]').content;
    // Retrieve ticket row data
    const dbId = data.dbId
    const ticketId = data.ticketId
    const name = data.name
    const type = data.type
    const creator = data.creator
    const project = data.project
    const processData = JSON.parse(data.processData || "[]")
    const uploads = JSON.parse(data.uploads || "[]")
    const permissions = JSON.parse(data.permissions || "[]")
    const visibility = data.visibility
    const category = data.category

    fetch("/confirm_user", {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrfStageToken
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.logged_user) {
                alert("Error in fetching logged user!");
                return;
            } else {
                const loggedUser = data.logged_user;
                if ((visibility == "Private" && permissions.some(entry => entry.allowed_user === loggedUser)) || visibility == "Everyone") {

                    // Assign data to the modal labels
                    document.getElementById("viewDbId").value = dbId;
                    document.getElementById("viewTicketId").innerText = ticketId;
                    document.getElementById("viewTitle").innerText = name;
                    document.getElementById("viewCreator").innerText = creator;
                    document.getElementById("viewProject").innerText = project;

                    const permissionButton = document.getElementById("permissionBtn");

                    const newButton = permissionButton.cloneNode(true);
                    permissionButton.parentNode.replaceChild(newButton, permissionButton);
                    // Permissions button
                    if (visibility == "Private") {
                        newButton.classList.add("btn-login");
                        newButton.style.padding = "5px";
                        newButton.addEventListener("click", () => openPermissions(csrfStageToken, dbId));
                    }
                    if (visibility == "Everyone") {
                        newButton.innerText = "Everyone"
                        newButton.style.color = "grey"
                        newButton.classList.remove("btn-login");
                    }

                    function fetchAndRender(dbId, token, hist_container, upl_container) {
                        fetch(`/grab_data/${dbId}`, {
                            method: 'GET',
                            credentials: 'same-origin',
                            headers: {
                                'X-CSRFToken': token
                            }
                        })
                            .then(response => response.json())
                            .then(data => {
                                const history = typeof data.history === "string" ? JSON.parse(data.history) : data.history
                                const uploads = typeof data.uploads === "string" ? JSON.parse(data.uploads) : data.uploads;
                                // Uploading history inputs to the container
                                if (history) {
                                    hist_container.innerHTML = "";
                                    history.forEach(entry => {
                                        const initialBlock = document.createElement("div");
                                        initialBlock.classList.add("history-block");
                                        initialBlock.innerText = `[${entry.timestamp}]\nSubmitted by: ${entry.appender}\n${entry.entry}`;
                                        initialBlock.style.backgroundColor = "#f0f0f0";
                                        initialBlock.style.padding = "8px";
                                        initialBlock.style.marginBottom = "4px";
                                        initialBlock.style.whiteSpace = "pre-wrap";
                                        hist_container.appendChild(initialBlock);
                                    });
                                };
                                if (uploads) {
                                    upl_container.innerHTML = "";
                                    uploads.forEach(file => {
                                        const link = document.createElement("a");
                                        link.href = "/" + encodeURIComponent(file.path);
                                        link.innerText = file.filename;
                                        link.target = "_blank";
                                        upl_container.appendChild(link);
                                        upl_container.appendChild(document.createElement("br"));
                                    });
                                };
                            })
                            .catch(error => console.error("History fetch error:", error));
                    }

                    // Create a display container for history
                    const hist_container = document.getElementById("historyContainer");
                    hist_container.innerHTML = ""; // clear old content

                    // Display container for file uploads
                    const upl_container = document.getElementById("uploadContainer");
                    upl_container.innerHTML = "";

                    fetchAndRender(dbId, csrfStageToken, hist_container, upl_container);

                    document.getElementById("historyInput").value = ""; // clear input for new updates

                    // Disable interaction for archived ticket
                    if (category === "Archived") {
                        document.getElementById("viewModal").style.opacity = "0.8";
                        document.getElementById("uploadFileForm").setAttribute("inert", "");
                        document.getElementById("updateHistoryForm").setAttribute("inert", "");
                        document.getElementById("permissionBtn").setAttribute("inert", "");
                        document.getElementById("archive-view-modal").setAttribute("inert", "");
                    }

                    if (type === "Simple") {
                        document.getElementById("viewModal").classList.add("active");
                    } else {
                        // loadProcess(processData, dbId, csrfStageToken);
                        // const processModal = document.getElementById("processModal");
                        // processModal.classList.add("active"); //Open the process modal for display
                        // const heading = document.getElementById("processHeader");
                        // heading.textContent = `PROCESS #${ticketId}`;
                        // // Assign fucntions and style to the process modal buttons
                        // const closeProcess = document.getElementById("closeProcess");
                        // closeProcess.innerText = "CLOSE";
                        // closeProcess.classList.add("btn-login");
                        // closeProcess.addEventListener("click", function() {
                        //     document.getElementById("processModal").classList.remove("active");
                        // });
                        // const addStageButton = document.getElementById("addStageBtn");
                        // addStageButton.classList.add("btn-login");
                        // addStageButton.type = "button"
                        // addStageButton.addEventListener("click", addStage);
                        console.log("Due in updates")
                    };
                } else {
                    alert("You don't have permissions to view this ticket!")
                    return;
                }
            }
        })
        .catch(error => console.error("Error:", error));
};

// Close the View modal
export function closeViewModal() {
    document.getElementById("viewModal").classList.remove("active");
    // document.getElementById("processModal").classList.remove("active")
};

