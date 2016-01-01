'use strict';

/**
 * CaptchaRecognizer is used to recognize VK captcha via one of supported services.
 *
 * Supported services:
 *   anti-captcha
 *   antigate
 *   rucaptcha
 */

/**
 * Module dependencies.
 * @private
 */
const querystring = require('querystring');
const fetch = require('./fetch');

class CaptchaRecognizer {
  /**
   * Constructor.
   * @param {String} service Service name
   * @param {String} apiKey Service API key
   * @returns {this}
   */
  constructor (service, apiKey) {
    /**
     * Service API key.
     * @type {String}
     */
    this.apiKey = apiKey;

    /**
     * Urls to upload captcha and check
     * its recognizing completion.
     * @type {String}
     */
    this.checkUrl = `http://${service}.com/res.php`;
    this.uploadUrl = `http://${service}.com/in.php`;

    /**
     * How many times we have waited for captcha recognizing.
     * @type {Number}
     */
    this._waitsCount = 0;
  }

  /**
   * Recognizes a captcha image by an URL.
   * @param {String} url Image URL
   * @returns {Promise => String} Captcha key recognized
   * @public
   */
  recognize (url) {
    return fetch(url)
      .then(image => image.buffer())
      .then(imageBuffer => imageBuffer.toString('base64'))
      .then(imageBase64 => fetch(this.uploadUrl, {
        body: querystring.stringify({
          body: imageBase64,
          key: this.apiKey,
          method: 'base64'
        }),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        method: 'POST'
      }))
      .then(response => response.text())
      .then(response => {
        if (response.startsWith('OK')) {
          return response.slice(3);
        }

        throw response;
      })
      .then(captchaId => this._wait(captchaId))
      .then(captchaId => this._check(captchaId));
  }

  /**
   * Checks for completion of recognizing.
   * @param {String} captchaId Captcha ID
   * @returns {Promise => String} Captcha key recognized
   * @private
   */
  _check (captchaId) {
    return fetch(this.checkUrl, {
      qs: {
        action: 'get',
        id: captchaId,
        key: this.apiKey
      }
    })
      .then(response => response.text())
      .then(response => {
        if (response.startsWith('ERROR')) {
          throw response;
        }

        if (~response.indexOf('NOT_READY')) {
          return this._wait(captchaId, true);
        }

        return response.split('|')[1];
      });
  }

  /**
   * Waits until captcha gets recognized.
   * @param {String} captchaId Captcha ID
   * @param {Boolean} fromChecking Is this function was called from "check"-function?
   * @returns {Promise}
   * @private
   */
  _wait (captchaId, fromChecking) {
    return new Promise(resolve => setTimeout(() => resolve(), this._waitsCount === 0 ? 10000 : 5000))
      .then(() => {
        this._waitsCount++;

        return fromChecking ? this._check(captchaId) : captchaId;
      });
  }
}

module.exports = CaptchaRecognizer;
