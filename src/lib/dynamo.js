import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const dynamo = new DynamoDBClient({
    region: process.env.MY_AWS_REGION,
    credentials: {
        accessKeyId: process.env.MY_AWS_ACCESS_KEY,
        secretAccessKey: process.env.MY_AWS_SECRET_KEY,
    },
});