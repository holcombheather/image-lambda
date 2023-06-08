import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Response } from 'node-fetch';

export const handler = async(event) => {
  //create out s3 connection capability
  let s3Client = new S3Client({region: 'us-west-1'});


  let name = event.Records[0].s3.object.key;
  let size = event.Records[0].s3.object.size;
  let type = '.jpeg';
  let newImageDetails = { name, size, type };
  console.log('new image details', newImageDetails);

  let input = {
    Bucket: 'images-lab17-401d53',
    Key: 'images.json',
  };

  let imageDetails;
  try {
    let results = await s3Client.send(new GetObjectCommand(input));
    let response = new Response(results.Body); // satisfies the result "promise"
    let retrievedImageDetails = await response.json(); // converts response into usable array
    imageDetails = retrievedImageDetails; // at this point we have the array if the json exists
  } catch(e){
    console.log('get object error', e);
    imageDetails = [];
  }

  imageDetails.push(newImageDetails);
  console.log('our image details array', imageDetails, undefined, ' ');

  let strigifiedDetails = JSON.stringify(imageDetails);
  let putInput = {
    ...input,
    Body: strigifiedDetails,
    ContentType: 'application/json', //For JSON, it's always this
  };
  console.log('put input object', putInput);

  try {
    await s3Client.send(new PutObjectCommand(putInput));
  } catch(e){
    console.warn('Failed to PUT', e);
  }
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
