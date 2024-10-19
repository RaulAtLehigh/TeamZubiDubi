document.addEventListener('DOMContentLoaded', () => {
    // Get references to the relevant HTML elements
    const dropArea = document.getElementById('drop-area'); // Drag and drop area
    const uploadButton = document.getElementById('uploadButton'); // Upload button
    const fileInfo = document.getElementById('file-info'); // File information display area
    const fileNameDisplay = document.getElementById('file-name'); // Displays the name of the uploaded file
    const fileStatusDisplay = document.getElementById('file-status'); // Displays the status of the uploaded file
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
        const formData = new FormData(); // Create a FormData object to send the file as form data
        formData.append('file', file); // Append the file to the form data

        // BACKEND INSTRUCTIONS:
        // This fetch call sends the PDF file to the backend (in this case, AWS) for processing.
        // The backend can use the file to:
        // 1. Upload the file to an S3 bucket (using AWS SDK or pre-signed URLs).
        // 2. Trigger an AWS Lambda function to process the PDF.
        // 3. Use Amazon Textract or other services to extract text or structured data from the PDF.
        // 4. Return the scraped information (e.g., dates, assignment names) as a response.

        try {
            const response = await fetch('YOUR_API_GATEWAY_ENDPOINT', {
                method: 'POST',
                body: formData // Send the form data (including the file) to the backend
            });

            const result = await response.json(); // Parse the backend's response

            // Display the resulting scraped information on the frontend (e.g., Google Calendar link)
            document.getElementById('result').innerText = result.calendarLink;
        } catch (error) {
            console.error('Error uploading or processing the file:', error); // Log any errors in the console
            fileStatusDisplay.textContent = 'Error processing the file. Please try again.'; // Display an error message to the user
        }
    });
});

