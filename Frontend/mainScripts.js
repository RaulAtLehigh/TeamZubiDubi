document.addEventListener('DOMContentLoaded', () => {
    // Get references to the relevant HTML elements
    const dropArea = document.getElementById('drop-area'); // Drag and drop area
    const uploadButton = document.getElementById('uploadButton'); // Upload button
    const fileInfo = document.getElementById('file-info'); // File information display area
    const fileNameDisplay = document.getElementById('file-name'); // Displays the name of the uploaded file
    const fileStatusDisplay = document.getElementById('file-status'); // Displays the status of the uploaded file
    const downloadButton = document.getElementById('download-btn'); // Download button
    let file; // Variable to hold the file data

    // Event listener for dragging the file over the drop area
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault(); // Prevent default browser behavior
        dropArea.classList.add('dragover'); // Add a class for visual feedback
    });

    // Event listener for when the user drags the file out of the drop area
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover'); // Remove visual feedback
    });

    // Event listener for when the file is dropped into the drop area
    dropArea.addEventListener('drop', (event) => {
        event.preventDefault(); // Prevent default behavior (e.g., opening the file)
        dropArea.classList.remove('dragover'); // Remove hover effect after file is dropped
        file = event.dataTransfer.files[0]; // Get the dropped file

        // Check if the file is a valid PDF
        if (file && file.type === 'application/pdf') {
            uploadButton.disabled = false; // Enable the upload button for a valid PDF
            fileInfo.style.display = 'block'; // Show file info section
            fileNameDisplay.textContent = `Selected file: ${file.name}`; // Display the selected file name
            fileStatusDisplay.textContent = 'File ready for upload!'; // Success message

            // BACKEND INSTRUCTIONS:
            // Once the PDF is uploaded, AWS Lambda or Amazon Textract can be used
            // to process the file and extract the required information (e.g., assignments and due dates).
            // Amazon Textract is useful for extracting structured data (text, forms, etc.) from the PDF.
            // The file can be uploaded to an S3 bucket, and then triggered for processing via Lambda.
            // The resulting scraped information can then be returned to the frontend.

        } else {
            // If the file is not a PDF, show an error message
            uploadButton.disabled = true; // Disable the upload button
            fileInfo.style.display = 'block'; // Show file info section
            fileNameDisplay.textContent = `Invalid file: ${file.name}`; // Display the invalid file name
            fileStatusDisplay.textContent = 'Please upload a .PDF file format.'; // Error message for invalid file

            // BACKEND INSTRUCTIONS:
            // No need to process invalid files. The user will be prompted to upload a valid PDF format.
        }
    });

    // Event listener for when the upload button is clicked
    uploadButton.addEventListener('click', async () => {
        if (file) {
            const reader = new FileReader();

            reader.onload = async (event) => {
                const arrayBuffer = event.target.result;

                // Convert ArrayBuffer to Uint8Array (byte array)
                const byteArray = new Uint8Array(arrayBuffer);

                // Convert byte array to a JSON-compatible array (Array of numbers)
                const byteArrayForJson = Array.from(byteArray);

                // Prepare your JSON object
                const jsonPayload = {
                    fileName: file.name,
                    fileBytes: byteArrayForJson
                };
                console.log('Payload being sent to backend:', jsonPayload);
                // Now, submit this JSON object via fetch or AJAX
                sendJsonPayload(jsonPayload);
            };

            reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
        } else {
            console.log("No file selected");
        }
    });
    
     // Example function to send JSON payload
    async function sendJsonPayload(payload) {
        try {
            const response = await fetch('http://localhost:4567/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json(); // Parse the backend's response

            if (result.status === 'ok') {
                csvData = result.info; // Store the CSV data
                fileStatusDisplay.textContent = 'File processed successfully. You can now download the CSV.'; // Success message
            } else {
                fileStatusDisplay.textContent = 'Error processing the file. Please try again.'; // Error message
            }
        } catch (error) {
            console.error('Error uploading or processing the file:', error); // Log any errors in the console
            fileStatusDisplay.textContent = 'Error processing the file. Please try again.'; // Display an error message to the user
        }
    }
    // Function to create a downloadable CSV file
    function downloadCsv(csvData, filename) {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    // Event listener for when the download button is clicked
    downloadButton.addEventListener('click', () => {
        if (csvData) {
            downloadCsv(csvData, 'events.csv');
        } else {
            fileStatusDisplay.textContent = 'No CSV data available. Please upload and process a file first.'; // Error message if no CSV data
        }
    });
});
