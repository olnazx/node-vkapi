'use strict';

class VkUploadError extends Error {
  /**
   * Constructor.
   * @param {Object} error Vkontakte error object
   *   @property {String} error Error
   * @returns {this}
   */
  constructor (error = {}) {
    super(error.error);

    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
  }
}

module.exports = VkUploadError;
