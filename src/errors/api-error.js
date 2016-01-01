'use strict';

class VkApiError extends Error {
  /**
   * Constructor.
   * @param {Object} error Vkontakte error object
   *   @property {Number} error_code Error code
   *   @property {String} error_msg Error message
   *   @property {Array of Object} request_params Request params
   *   ?@property {String} captcha_sid Captcha SID
   *   ?@property {String} captcha_img Captcha Image URL [https://vk.com/dev/captcha_error]
   *   ?@property {String} redirect_uri Validation URL [https://vk.com/dev/need_validation]
   *   ?@property {String} confirmation_text Confirmation text [https://vk.com/dev/need_confirmation]
   * @returns {this}
   *
   * https://vk.com/dev/errors
   */
  constructor (error = {}) {
    super(error.error_msg);

    Error.captureStackTrace(this, this.constructor);

    this.code = error.error_code;
    this.name = this.constructor.name;
    this.requestParams = error.request_params;

    if (error.captcha_sid) {
      this.captchaSid = error.captcha_sid;
    }

    if (error.captcha_img) {
      this.captchaImg = error.captcha_img;
    }

    if (error.redirect_uri) {
      this.redirectUri = error.redirect_uri;
    }

    if (error.confirmation_text) {
      this.confirmationText = error.confirmation_text;
    }
  }
}

module.exports = VkApiError;
