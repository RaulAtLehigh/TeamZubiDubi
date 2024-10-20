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

        // POST route to handle the incoming byte array
        Spark.get("/upload", (request, response) -> handleUpload(request, response));

        System.out.println("Server is running on http://localhost:4567");
    }

    public static String handleUpload(Request req, Response res) {
        Gson gson = new Gson();
        
        // Parse the byte array from the request body (assumed to be in JSON format)
        byte[] fileBytes = gson.fromJson(req.body(), byte[].class);
        String csvResponse = converseWithBedrock(fileBytes);

        // Create a JSON response
        res.type("application/json");
        return gson.toJson(new ResponseData("ok", csvResponse));
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
        String inputText = "Without any preliminary text, Please return a csv file in the form...";
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
}