package com.TeamZubiDubi.Parser;

import com.google.gson.Gson;
import spark.Request;
import spark.Response;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.*;
import java.util.Arrays;

import spark.Spark;

public class App {

    public static void main(String[] args) {
        // Set up Spark routes
        Spark.port(4567); // You can specify the port number
        enableCORS("*", "GET,POST,OPTIONS", "Content-Type,Authorization");
        // POST route to handle the incoming byte array
        Spark.post("/upload", (request, response) -> handleUpload(request, response));

        System.out.println("Server is running on http://localhost:4567");
    }

    public static String handleUpload(Request req, Response res) {
        Gson gson = new Gson();
    
        // Parse the JSON request as an object (FileUploadPayload)
        FileUploadPayload payload = gson.fromJson(req.body(), FileUploadPayload.class);
    
        // Convert the Integer array (fileBytes) to a byte array
        byte[] fileBytes = new byte[payload.fileBytes.length];
        for (int i = 0; i < payload.fileBytes.length; i++) {
            fileBytes[i] = payload.fileBytes[i].byteValue(); // Convert Integer to byte
        }
    
        // Call the Bedrock API with the byte array
        String csvResponse = converseWithBedrock(fileBytes);
    
        // Create a JSON response
        res.type("application/json");
        return gson.toJson(new ResponseData("ok", csvResponse));
    }
    
    // Helper class to deserialize the JSON payload
    static class FileUploadPayload {
        String fileName;
        Integer[] fileBytes; // JSON will deserialize byte arrays as Integer[] by default
    }

    /**
     * Calls the Bedrock API with the byte array.
     *
     * @param pdfData The byte array representing the PDF file.
     * @return The response from the Bedrock API.
     */
    public static String converseWithBedrock(byte[] pdfData) {
        BedrockRuntimeClient client = BedrockRuntimeClient.builder()
                .credentialsProvider(DefaultCredentialsProvider.create())
                .region(Region.US_WEST_2)
                .build();

        String modelId = "anthropic.claude-3-haiku-20240307-v1:0";

        // Convert byte[] to SdkBytes
        SdkBytes sdkPdfData = SdkBytes.fromByteArray(pdfData);

        // Step 2: Create a text content block
        String inputText = "Without any preliminary text, Please return a csv file in the form Subject\n" + //
        "(Required) The name of the event\n" + //
        "Example: Final exam\n" + //
        "Start Date\n" + //
        "(Required) The first day of the event\n" + //
        "Example: 05/30/2020\n" + //
        "Start Time\n" + //
        "The time the event begins\n" + //
        "Example: 10:00 AM\n" + //
        "End Date\n" + //
        "The last day of the event\n" + //
        "Example: 05/30/2020\n" + //
        "End Time\n" + //
        "The time the event ends\n" + //
        "Example: 1:00 PM\n" + //
        "All Day Event\n" + //
        "Whether the event is an all-day event. \n" + //
        "If its an all-day event, enter True. \n" + //
        "If it isnt an all-day event, enter False.\n" + //
        "Example: False\n" + //
        "Description\n" + //
        "Description or notes about the event\n" + //
        "Example: \"50 multiple choice questions and two essay questions\"\n" + //
        "Location\n" + //
        "The location for the event\n" + //
        "Example: \"Columbia, Schermerhorn 614\"\n" + //
        "Private\n" + //
        "Whether the event should be marked private.\n" + //
        "If its private, enter True.\n" + //
        "If it isnt private, enter False.\n" + //
        "Example: True. for assignment due dates, insert them as all day events on the date theyre due and for the time of class, just insert them at the time they take place";
        ContentBlock textBlock = ContentBlock.builder()
                .text(inputText)
                .build();

        // Step 3: Create a DocumentBlock for the PDF
        DocumentSource documentSource = DocumentSource.builder()
                .bytes(sdkPdfData)
                .build();

        ContentBlock documentBlock = ContentBlock.builder()
                .document(DocumentBlock.builder()
                        .format("pdf")
                        .name("syllabus")
                        .source(documentSource)
                        .build())
                .build();

        // Step 4: Pass both content blocks into the Message builder
        Message message = Message.builder()
                .content(Arrays.asList(textBlock, documentBlock))
                .role(ConversationRole.USER)
                .build();

        // Converse with the Bedrock model
        ConverseResponse response = client.converse(
                request -> request.modelId(modelId).messages(message)
        );

        // Output the response
        return response.output().message().content().get(0).text();
    }

    // Helper class for returning JSON data
    static class ResponseData {
        String status;
        String info;

        ResponseData(String status, String info) {
            this.status = status;
            this.info = info;
        }
    }
    // CORS enabling method
    private static void enableCORS(final String origin, final String methods, final String headers) {
        Spark.options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }

            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }

            return "OK";
        });

        Spark.before((request, response) -> {
            response.header("Access-Control-Allow-Origin", origin);
            response.header("Access-Control-Request-Method", methods);
            response.header("Access-Control-Allow-Headers", headers);
            // Allow credentials if needed
            response.header("Access-Control-Allow-Credentials", "true");
            // Note: You can also specify "Access-Control-Allow-Methods" to restrict HTTP methods allowed.
        });
    }

}