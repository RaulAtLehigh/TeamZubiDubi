package com.TeamZubiDubi.Parser;

import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.ContentBlock;
import software.amazon.awssdk.services.bedrockruntime.model.ConversationRole;
import software.amazon.awssdk.services.bedrockruntime.model.ConverseResponse;
import software.amazon.awssdk.services.bedrockruntime.model.Message;

public class App {
    public static void main(String[] args) {
        BedrockRuntimeClient client = BedrockRuntimeClient.builder()
                .credentialsProvider(DefaultCredentialsProvider.create())
                .region(Region.US_EAST_1)
                .build();

        String modelId = "anthropic.claude-3-haiku-20240307-v1:0";

        String inputText = "Explain 'rubber duck debugging' in one line.";

        Message message = Message.builder() //Building message to send to model
                .content(ContentBlock.fromText(inputText))
                .role(ConversationRole.USER)
                .build();

        ConverseResponse response = client.converse(
                request -> request.modelId(modelId).messages(message)
        );

        String responseText = response.output().message().content().get(0).text();
        System.out.println(responseText);
    }
}