'use strict';

module.exports = {
  /**
   * Client ID and secret key of official
   * applications for Android and iPhone.
   * @type {Array}
   */
  CLIENT_ANDROID: [2274003, 'hHbZxrka2uZ6jB1inYsH'],
  CLIENT_IPHONE: [3140623, 'VeWdmVclDCtn6ihuP1nt'],

  /**
   * The maximum permission scope.
   * @type {String}
   *
   * https://vk.com/dev/permissions
   */
  MAX_SCOPE: 'notify,friends,photos,audio,video,pages,status,notes,messages,wall,ads,offline,docs,groups,notifications,stats,email,market',

  /**
   * Upload file types.
   * @type {Array of String} [upload_field_name, step_one_method_name, step_two_method_name]
   */
  UFT_AUDIO: ['file', 'audio.getUploadServer', 'audio.save'],
  UFT_COVER: ['photo', 'photos.getOwnerCoverPhotoUploadServer', 'photos.saveOwnerCoverPhoto'],
  UFT_DOCUMENT: ['file', 'docs.getUploadServer', 'docs.save'],
  UFT_DOCUMENT_PM: ['file', 'docs.getMessagesUploadServer', 'docs.save'],
  UFT_DOCUMENT_WALL: ['file', 'docs.getWallUploadServer', 'docs.save'],
  UFT_PHOTO_ALBUM: ['file', 'photos.getUploadServer', 'photos.save'],
  UFT_PHOTO_MAIN: ['photo', 'photos.getOwnerPhotoUploadServer', 'photos.saveOwnerPhoto'],
  UFT_PHOTO_MARKET: ['file', 'photos.getMarketUploadServer', 'photos.saveMarketPhoto'],
  UFT_PHOTO_MARKET_ALBUM: ['file', 'photos.getMarketAlbumUploadServer', 'photos.saveMarketAlbumPhoto'],
  UFT_PHOTO_PM: ['photo', 'photos.getMessagesUploadServer', 'photos.saveMessagesPhoto'],
  UFT_PHOTO_WALL: ['photo', 'photos.getWallUploadServer', 'photos.saveWallPhoto'],
  UFT_VIDEO: ['video_file', 'video.save']
}
