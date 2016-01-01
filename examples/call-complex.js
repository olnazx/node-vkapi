'use strict';

const fs = require('fs');
const fetch = require('../src/lib/fetch');
const vkapi = new (require('../src/vkapi'))({ accessToken: 'your_access_token' });

// Download an image from a message.

const messageIdWithAnImageAttached = 66975;

return vkapi.call('messages.getById', {
    message_ids: messageIdWithAnImageAttached
  })
  .then(response => {
    const photo = response.items[0].attachments[0].photo;

    return vkapi.call('photos.getById', {
      photos: `${photo.owner_id}_${photo.id}_${photo.access_key}`
    });
  })
  .then(response => {
    const photoUrl = response[0].photo_604;

    return fetch(photoUrl);
  })
  .then(image => {
    const writableStream = fs.createWriteStream('./image.jpg');

    image.body.pipe(writableStream);

    writableStream.once('finish', () => {
      console.log('Image downloaded and saved as "image.jpg".');
    });
  });
