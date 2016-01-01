'use strict';

class VkAuthError extends Error {
  /**
   * Constructor.
   * @param {Object} error Vkontakte error object
   *   @property {String} error Error type
   *   ?@property {String} error_description Error message
   *   ?@property {String} captcha_sid Captcha SID
   *   ?@property {String} captcha_img Captcha Image URL
   *   ?@property {String} redirect_uri Validation URL
   *   ?@property {String} validation_type Validation type
   *   ?@property {Any} phone_mask Phone mask
   * @returns {this}
   *
   * https://vk.com/dev/auth_direct
   */
  constructor (error = {}) {
    super(error.error_description || error.error);

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.type = error.error;

    if (error.captcha_sid) {
      this.captchaSid = error.captcha_sid;
    }

    if (error.captcha_img) {
      this.captchaImg = error.captcha_img;
    }

    if (error.redirect_uri) {
      this.redirectUri = error.redirect_uri;
    }

    if (error.validation_type) {
      this.validationType = error.validation_type;
    }

    if (error.phone_mask) {
      this.phoneMask = error.phone_mask;
    }
  }
}

module.exports = VkAuthError;
