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
            const response = await fetch('YOUR_API_GATEWAY_ENDPOINT', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json(); // Parse the backend's response

            // Display the resulting scraped information on the frontend (e.g., Google Calendar link)
            document.getElementById('result').innerText = result.calendarLink;
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
        // Assuming the result contains the CSV lines as a string
        const csvLines = `Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private
        Final exam,12/10/2024,12:00 AM,12/18/2024,11:59 PM,True,"Final exam period",Lehigh University,False
        CSE303: Operating Systems Design,08/26/2024,1:35 PM,08/26/2024,2:50 PM,False,"CSE303: Operating Systems Design",NV001,False
        PA0,08/26/2024,12:00 AM,09/06/2024,11:59 PM,True,Programming Assignment 0,Lehigh University,False
        PA1,09/16/2024,12:00 AM,10/04/2024,11:59 PM,True,Programming Assignment 1,Lehigh University,False
        PA2,09/30/2024,12:00 AM,10/11/2024,11:59 PM,True,Programming Assignment 2,Lehigh University,False
        PA3,10/28/2024,12:00 AM,11/08/2024,11:59 PM,True,Programming Assignment 3,Lehigh University,False
        PA4,11/11/2024,12:00 AM,11/22/2024,11:59 PM,True,Programming Assignment 4,Lehigh University,False
        PA5,12/02/2024,12:00 AM,12/10/2024,11:59 PM,True,Programming Assignment 5,Lehigh University,False
        Quiz 1,09/11/2024,1:35 PM,09/11/2024,2:50 PM,False,In person Quiz 1,NV001,False
        Quiz 2,09/25/2024,1:35 PM,09/25/2024,2:50 PM,False,In person Quiz 2,NV001,False
        Quiz 3,10/16/2024,1:35 PM,10/16/2024,2:50 PM,False,In person Quiz 3,NV001,False
        Quiz 4,11/06/2024,1:35 PM,11/06/2024,2:50 PM,False,In person Quiz 4,NV001,False
        Quiz 5,11/13/2024,1:35 PM,11/13/2024,2:50 PM,False,In person Quiz 5,NV001,False
        Quiz 6,12/04/2024,1:35 PM,12/04/2024,2:50 PM,False,In person Quiz 6,NV001,False`;

        downloadCsv(csvLines, 'events.csv');
    });
});
