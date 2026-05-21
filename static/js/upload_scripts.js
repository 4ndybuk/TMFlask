// Function to upload files to the database per unique ticket
export function uploadFile() {
    // CSRF token for the file uploads
    const csrfUploadToken = document.querySelector('meta[name="upload-csrf-token"]').content;
    const form = document.getElementById('uploadFileForm');
    const fileInput = form.querySelector('input[type="file"]');
    const dbId = document.getElementById("viewDbId").value;
    const formData = new FormData(form);

    if (!fileInput.files.length) return;

    // AJAX POST method to pass the files to the database backend
    fetch(`/upload/${encodeURIComponent(dbId)}`, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
        headers: {
            'X-CSRFToken': csrfUploadToken
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert("Upload failed: " + (data.error || "unknown error"));
                return;
            }
            // Preapre modal conatiner for file link display in View
            const upl_container = document.getElementById("uploadContainer");
            const file = data.file;

            if (!file) {
                console.error("Backend did not return file object");
                return;
            }

            // Creating a link element and passing it as a filename to the container
            const link = document.createElement("a");
            link.href = "/" + encodeURIComponent(file.path);
            link.innerText = file.filename;
            link.target = "_blank";
            upl_container.appendChild(link);
            upl_container.appendChild(document.createElement("br"));
            fileInput.value = "";
        })
        .catch(err => console.error(err));
};