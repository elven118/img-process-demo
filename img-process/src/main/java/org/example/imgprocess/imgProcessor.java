package org.example.imgprocess;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
import org.im4java.core.ConvertCmd;
import org.im4java.core.IMOperation;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeoutException;

public class imgProcessor {

    public static void main(String[] args) {
        final String BUCKET_NAME = "Images";
        final String QUEUE_NAME = "Inbox";
        final String RETURN_NAME = "Outbox";

        BasicAWSCredentials awsCreds = new BasicAWSCredentials("", "");
        AmazonS3 s3 = AmazonS3ClientBuilder.standard()
                .withCredentials(new AWSStaticCredentialsProvider(awsCreds))
                .withRegion("us-west-2")
                .build();

        try {
            ConnectionFactory factory = new ConnectionFactory();
            factory.setHost("localhost");
            Connection connection = factory.newConnection();
            Channel channel = connection.createChannel();

            channel.queueDeclare(QUEUE_NAME, false, false, false, null);
            System.out.println(" [*] Waiting for messages. To exit press CTRL+C");

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                String imageKey = new String(delivery.getBody(), StandardCharsets.UTF_8);
                System.out.println("Received '" + imageKey + "'");

                //Download image
                System.out.println("Downloading an object");
                S3Object object = s3.getObject(new GetObjectRequest(BUCKET_NAME, imageKey));
                InputStream reader = new BufferedInputStream(object.getObjectContent());
                File file = new File(imageKey+".jpg");
                OutputStream writer = new BufferedOutputStream(new FileOutputStream(file));
                int read = -1;
                while ( ( read = reader.read() ) != -1 ) {
                    writer.write(read);
                }
                writer.flush();
                writer.close();
                reader.close();

                try {
                    //process image
                    ConvertCmd cmd = new ConvertCmd();
                    IMOperation op = new IMOperation();
                    op.addImage(imageKey+".jpg");
                    op.resize(100,100).rotate(90d);
                    op.addImage("New_"+ imageKey +".jpg");
                    cmd.run(op);
                } catch (Exception e) {

                }

                File uploadFile = new File("New_"+ imageKey +".jpg");

                //uploadImage
                System.out.println("Uploading a new object to S3 from a file\n");
                s3.putObject(new PutObjectRequest(BUCKET_NAME, "New_"+imageKey, uploadFile));
            };

            channel.basicConsume(QUEUE_NAME, true, deliverCallback, consumerTag -> {});
        } catch (IOException e) {

        } catch (TimeoutException e) {

        }
    }
}
