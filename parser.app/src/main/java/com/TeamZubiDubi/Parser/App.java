package com.TeamZubiDubi.Parser;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.*;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;

public class App {
    public static void main(String[] args) {
        BedrockRuntimeClient client = BedrockRuntimeClient.builder()
                .credentialsProvider(DefaultCredentialsProvider.create())
                .region(Region.US_WEST_2)
                .build();

        String modelId = "anthropic.claude-3-haiku-20240307-v1:0";

        // Step 1: Load the PDF file
        String pdfFilePath = "/Users/vickianaramirez/Downloads/TeamZubiDubi/parser.app/src/main/java/com/TeamZubiDubi/Parser/CSE303Syllabus.pdf";
        byte[] pdfData = loadPdfFile(pdfFilePath);

        if (pdfData.length == 0) {
            System.err.println("Error loading PDF. Exiting...");
            return;
        }

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
        String responseText = response.output().message().content().get(0).text();
        System.out.println(responseText);
    }

    /**
     * Loads a PDF file into a byte array.
     *
     * @param filePath The path to the PDF file.
     * @return The binary content of the PDF.
     */
    public static byte[] loadPdfFile(String filePath) {
        try {
            return Files.readAllBytes(new File(filePath).toPath());
        } catch (IOException e) {
            System.err.println("Error reading PDF file: " + e.getMessage());
            return new byte[0];
        }
    }
}