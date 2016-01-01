# node-vkapi &middot; [![npm](https://img.shields.io/npm/v/node-vkapi.svg)](http://npmjs.org/node-vkapi) [![npm](https://img.shields.io/npm/dt/node-vkapi.svg)](http://npmjs.org/node-vkapi)

```sh
$ npm install node-vkapi --only=prod
```

## Features

* Call all Vkontakte API methods
* Authorize user and get an `access_token`
  1. *Direct authorization* via official application (Android, iPhone)
  2. Authorization via m.vk.com website
* Upload files of any type
* Recognize captcha

## Example

```js
const vkapi = new (require('node-vkapi'))();

// Getting some info about user id1

vkapi.call('users.get', {
  user_ids: '1',
  fields: 'verified,sex'
})
  .then(users => console.dir(users[0]))
  .catch(error => console.error(error));
```

## Documentation

### new VkApi([options])
* `options<Object>` [Options](#options) of *VkApi* instance

#### Options
Properties of the *options* object and their defaults.

```js
{
  // <String> User access token
  accessToken: null,

  // <String> API version
  apiVersion: '5.68',

  // <Number> ID of your Vkontakte application
  appId: null,

  // <String> Secret key of your Vkontakte application
  appSecret: null,

  // <String> API key of captcha recognizing service
  captchaApiKey: null,

  // <String> Captcha recognizing service (anti-captcha, antigate, rucaptcha)
  captchaService: 'anti-captcha',

  // <String> User login
  userLogin: null,

  // <String> User password
  userPassword: null,

  // <Number> Base delay between API calls (334 is ~1/3 of a second and it's used in an authorization via an user token)
  baseDelay: 334
}
```

### vkapi.authorize(params)
* `params<Object>` [Request parameters](#params)
* Returns [`Promise<AuthResponseObject>`](#response-to-authorization-request)

Performs the *Direct Authorization*, i.e. authorizes a user in one of official Vkontakte applications using user's login and password.

#### Params
Parameters for a direct authorization request and their defaults.

```js
{
  // <String> Client (android, iphone)
  client: 'android',

  // <String> User login
  login: vkapi.options.userLogin,

  // <String> User password
  password: vkapi.options.userPassword,

  // <String> Permissions scope. Maximum permissions by default
  scope: MAX_SCOPE
}
```

### vkapi.call(method[, params])
* `method<String>` Method name
* `params<Object>` Method parameters
* Returns `Promise<Any>`

Calls Vkontakte API methods.

> A full response object will be returned if `execute` method was called.

### vkapi.logIn(params)
* `params<Object>` [Request parameters](#params-1)
* Returns [`Promise<AuthResponseObject>`](#response-to-authorization-request)

Authorizes a user via m.vk.com website.  
Herewith, you have the ability to use ID of **unofficial** Vkontakte application.

#### Params
Parameters for an authorization request and their defaults.

```js
{
  // <Number> Vkontakte application ID
  appId: vkapi.options.appId,

  // <String> User login
  login: vkapi.options.userLogin,

  // <String> User password
  password: vkapi.options.userPassword,

  // <String> Permissions scope. Maximum permissions by default
  scope: MAX_SCOPE
}
```

### vkapi.upload(type, files[, params[, afterUploadParams]])
* `type<String>` [Type of upload](#upload-types)
* `files<Any>` [File(s)](#files) to upload
* `params<Object>` Parameters for an upload URL getting request. [More info](https://vk.com/dev/upload_files)
* `afterUploadParams<Object>` Parameters for an upload finishing request. [More info](https://vk.com/dev/upload_files)
* Returns `Promise<Any>`

Uploads files to Vkontakte. 

> Keep in mind, that you must have appropriate permissions to upload files.

#### Upload types
* `audio` [Audio file](https://vk.com/dev/upload_files_2?f=8.%2BUploading%2BAudio%2BFiles)
* `cover` [Community cover](https://vk.com/dev/upload_files_2?f=11.%20Uploading%20Community%20Cover)
* `document` [Document](https://vk.com/dev/upload_files_2?f=10.%20Uploading%20Documents)
* `document_pm` Document into a private message
* `document_wall` Document onto a wall
* `photo_album` [Photos into user album](https://vk.com/dev/upload_files?f=1.%2BUploading%2BPhotos%2Binto%2BUser%2BAlbum)
* `photo_main` [Main photo into user profile or community](https://vk.com/dev/upload_files?f=3.%20Uploading%20Photos%20into%20User%20Profile%20or%20Community)
* `photo_market` [Market item photo](https://vk.com/dev/upload_files_2?f=6.%2BUploading%2Ba%2BMarket%2BItem%2BPhoto)
* `photo_market_album` [Market collection photo](https://vk.com/dev/upload_files_2?f=7.%20Uploading%20a%20Market%20Collection%20Photo)
* `photo_pm` [Photo into a private message](https://vk.com/dev/upload_files?f=4.%2BUploading%2BPhotos%2Binto%2Ba%2BPrivate%2BMessage)
* `photo_wall` [Photo onto a user's wall](https://vk.com/dev/upload_files?f=2.%20Uploading%20Photos%20on%20User%20Wall)
* `video` [Video file](https://vk.com/dev/upload_files_2?f=9.%2BUploading%2BVideo%2BFiles)

#### Files
**files** variable may be a single file to upload, or an array of files (for *photo_album* type). Every single file must be an *FS Stream* or an object containing these properties:

| Property | Type   |                  |
|----------|:-------|------------------|
| content  | Buffer | File content     |
| name     | String | File name        |

#### How to upload graffiti and audio messages?
To upload graffiti or an audio message you must set `document` as an upload type and specify type of document in the `params` object: for graffiti — `graffiti`, for audio messages — `audio_message`.

```js
// Example of an audio message uploading

const fs = require('fs');
const vkapi = new (require('node-vkapi'))({ accessToken: 'your_access_token' });

vkapi.upload('document', fs.createReadStream('./path/to/audiofile.mp3'), { type: 'audio_message' })
  .then(response => console.dir(response))
  .catch(error => console.error(error));
```

#### Examples of uploading files
Examples of uploading files can be found in the [examples](examples) folder.

#### Response to authorization request
Methods `vkapi.authorize()` and `vkapi.logIn()` return response in the same format.

```js
{
  // <String> Access token
  access_token,

  // <Number> Access token time to live in seconds
  expires_in,

  // <Number> User ID
  user_id,

  // <String> User email. Will be included, if it was requested in the "scope"
  ?email
}
```
