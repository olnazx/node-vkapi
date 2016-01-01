'use strict';

const fs = require('fs');
const path = require('path');
const vkapi = new (require('../src/vkapi'))({ accessToken: 'your_access_token' });

// Upload a photo, then post it to user's wall.

vkapi.upload(
  // type
  'photo_wall',

  // files
  fs.createReadStream(path.join(__dirname, './resources/dog.jpg')),

  // params
  {},

  // afterUploadParams
  {
    caption: 'VK Doge'
  }
)
  .then(response => {
    return vkapi.call('wall.post', {
      attachments: `photo${response[0].owner_id}_${response[0].id}`,
      message: 'Posting the dog.'
    });
  })
  .then(response => {
    console.log(`Post #${response.post_id} is on your wall!`);
  })
  .catch(error => console.log('Error occured', error));
