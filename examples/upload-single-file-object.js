'use strict';

const fetch = require('../src/lib/fetch');
const vkapi = new (require('../src/vkapi'))({ accessToken: 'your_access_token' });

// Download a photo, then upload it, then post it to user's wall.

fetch('https://vk.com/images/stickers/4133/256.png')
  .then(image => image.buffer())
  .then(imageBuffer => {
    return vkapi.upload(
      // type
      'photo_wall',

      // files
      {
        content: imageBuffer,
        name:    'image.png'
      },

      // params
      {},

      // afterUploadParams
      {
        caption: 'VK Sticker'
      }
    );
  })
  .then(response => {
    return vkapi.call('wall.post', {
      attachments: `photo${response[0].owner_id}_${response[0].id}`,
      message: 'Posting the sticker.'
    });
  })
  .then(response => {
    console.log(`Post #${response.post_id} is on your wall!`);
  })
  .catch(error => console.log('Error occured', error));
