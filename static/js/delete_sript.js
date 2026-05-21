export function deleteTicket(id, permissions) {

    // CSRF Token
    const token = document.querySelector('meta[name="stage-csrf-token"]').content;

    fetch("/confirm_user", {
        method: 'GET',
        credentials: 'same-origin',
        headers: { 'X-CSRFToken': token }
    })
        .then(response => response.json())
        .then(data => {
            const currentUser = data.logged_user
            if (permissions.some(entry => entry.allowed_user === currentUser)) {
                const prompt = confirm("Are you sure you want to permanently delete this ticket?")
                if (prompt) {
                    fetch(`/delete/${id}`, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'X-CSRFToken': token }
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Success", data);
                        location.reload()
                    })
                    .catch(error => console.error("Error", error))
                } else {
                    return;
                }

            } else {    
                alert("Ticket can be deleted only by the creator.");
                return;
            }
        });
}


