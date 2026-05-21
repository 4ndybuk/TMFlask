export function archiveTicket() {
    const dbId = document.getElementById("viewDbId").value;
    const token = document.querySelector('meta[name="update-csrf-token"]').content;
    const prompt = confirm("Would you like to archive this ticket?")
    if (prompt) {
        fetch(`/add_update/${dbId}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token
            },
            body: JSON.stringify({ category: "Archived"})
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {alert("Failed to archive the ticket!")} 
        })
        .catch(error => console.log("Error:", error));
        document.getElementById("viewModal").classList.remove("active")
        location.reload()
    } else {
        return; 
    }
}