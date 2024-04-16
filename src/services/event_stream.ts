import * as AWS from 'aws-sdk';

const kinesis = new AWS.Kinesis({
  endpoint: process.env.LOCALSTACK_HOST ? `http://${process.env.LOCALSTACK_HOST}:4566` : undefined,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

async function sendToKinesis(streamName: string, data: string): Promise<void> {
  const params = {
    StreamName: streamName,
    Data: Buffer.from(data),
    PartitionKey: '1'
  };

  try {
    const response = await kinesis.putRecord(params).promise();
    console.log('Data sent to Kinesis:', response);
  } catch (error) {
    console.error('Error sending data to Kinesis:', error);
  }
}

export { sendToKinesis };
