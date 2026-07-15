// Function for adding new history comments to the ticket
export async function appendHistory() {
    // CSRF Token for the history update form
    const token = document.querySelector('meta[name="update-csrf-token"]').content;
    const input = document.getElementById("historyInput");
    const dbId = document.getElementById("viewDbId").value;
    const timestamp = new Date().toLocaleString();
    const newEntry = input.value.trim();
    if (!newEntry) return;

	try {
		const getUser = await fetch("/confirm_user", {
	    	method: "GET",
	    	credentials: 'same-origin',
	    	headers: {
	    		'X-CSRFToken': token
	    	}
	    });
	    if (!getUser.ok) throw new Error(`Confirm user failed: ${getUser.status}`);
	    const getUserResponse = await getUser.json();
	
	    // Create a new box elements to display your new input in the modal
	    const block = document.createElement("div");
	    block.classList.add("history-block");
		const historyBlock = `[${timestamp}]\nSubmitted by: ${getUserResponse.logged_name}\n${input.value}`;
	    block.innerText = historyBlock;
	    block.style.backgroundColor = "#f0f0f0";
	    block.style.padding = "8px";
	    block.style.marginBottom = "4px";
	    block.style.whiteSpace = "pre-wrap";
	
	    // AJAX POST to backend using DbId
	    const addUpdate = await fetch(`/add_update/${dbId}`, {
	        method: 'POST',
	        credentials: 'same-origin',
	        headers: {
	            'Content-Type': 'application/json',
	            'X-CSRFToken': token
	        },
	        // Send the new history entry for updating database in the backend
	        body: JSON.stringify({ history: newEntry })
	    });
	    if (!addUpdate.ok) throw new Error(`Add update failed: ${addUpdate.status}`)
	    const addUpdateResponse = await addUpdate.json()
	
		// Append the new element to the history container
	    document.getElementById("historyContainer").appendChild(block);
	    input.value = "";

		// Notify relevant people in the permissions of ticket update
        const notifyResp = await fetch(`/mail_notify/${dbId}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token
            },
            body: JSON.stringify({ history: historyBlock })
        });
        if (!notifyResp.ok) throw new Error(`Notification fetch failed: ${notifyResp.status}`);
        const notifyResult = await notifyResp.json();

	} catch(error) {
		console.error("Fetch chain failed:", error);
		throw error;
	};
};
    
    
