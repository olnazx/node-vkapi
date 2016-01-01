'use strict';

const fs = require('fs');
const path = require('path');
const VkApi = require('../src/vkapi');
const VkApiError = require('../src/errors/api-error');
const VkAuthError = require('../src/errors/auth-error');
const VkUploadError = require('../src/errors/upload-error');
const constants = require('../src/constants');

describe('VkApi', () => {
  let vkapiDefault = new VkApi();
  const vkapiWithToken = new VkApi({ accessToken: 'USER_ACCESS_TOKEN' });
  const logInDetails = {
    login: 'USER_LOGIN',
    password: 'USER_PASSWORD'
  };
  const appIdToLogIn = 6121396; // VK Admin

  beforeEach(() => {
    vkapiDefault = new VkApi();
  });

  test('should correctly merge objects', () => {
    expect(vkapiDefault.options.appSecret).toBeNull();
    expect((new VkApi({ appSecret: 'appSecretKey' })).options.appSecret).toBe('appSecretKey');
  });

  test('should has a correct base delay', () => {
    expect(vkapiDefault.options.baseDelay).toBe(334);
    // 50 is 1/20 of a second and it's used in an authorization via a community token
    expect((new VkApi({ baseDelay: 50 })).options.baseDelay).toBe(50);
  });

  test('should correctly initialize CaptchaRecognizer', () => {
    const vkapiWithCaptchaRecognizer = new VkApi({ captchaApiKey: 'captchaServiceApiKey' });

    expect(vkapiDefault.captchaRecognizer).toBeNull();
    expect(vkapiWithCaptchaRecognizer.captchaRecognizer.constructor.name).toBe('CaptchaRecognizer');
    expect(vkapiWithCaptchaRecognizer.captchaRecognizer.apiKey).toBe('captchaServiceApiKey');
  });

  describe('authorize()', () => {
    test('should perform a successful direct authorization', () => {
      expect.assertions(4);

      return vkapiDefault.authorize(logInDetails)
        .then(response => {
          expect(typeof response).toBe('object');
          expect(typeof response.access_token).toBe('string');
          expect(typeof response.user_id).toBe('number');
          expect(typeof response.expires_in).toBe('number');
        });
    });

    test('should throw an error if no correct params provided', () => {
      expect.assertions(4);

      return Promise.all([
        expect(vkapiDefault.authorize()).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.authorize({ client: 'unknown_client' })).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.authorize({ login: 'userlogin@mail.ru' })).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.authorize({ password: 'pass12345' })).rejects.toBeInstanceOf(Error)
      ]);
    });

    test('should throw an error if password or login is incorrect', () => {
      expect.assertions(1);

      return expect(
        vkapiDefault.authorize({
          login: 'userlogin@vk.com',
          password: 'mypassword123'
        })
      )
        .rejects.toBeInstanceOf(VkAuthError);
    });
  });

  describe('call()', () => {
    test('should perform a successful API request', () => {
      expect.assertions(3);

      return vkapiDefault.call('users.get', {
        user_ids: '1'
      })
        .then(response => {
          expect(Array.isArray(response)).toBeTruthy();
          expect(response).toHaveLength(1);
          expect(response[0].id).toBe(1);
        });
    });

    test('should throw an error if no correct method provided', () => {
      expect.assertions(1);

      return expect(vkapiDefault.call()).rejects.toBeInstanceOf(Error);
    });

    test('should throw an error if unknown method called', () => {
      expect.assertions(3);

      return vkapiWithToken.call('unknown_method')
        .catch(error => {
          expect(error instanceof VkApiError).toBeTruthy();
          expect(typeof error.code).toBe('number');
          expect(typeof error.message).toBe('string');
        });
    });

    test.skip('should throw "Captcha Needed" error instead of "Too many requests"', done => {
      expect.assertions(2);

      function postToWall (message) {
        vkapiWithToken.call('wall.post', { message })
          .catch(error => {
            expect(error).toBeInstanceOf(VkApiError);
            expect(error.code).toBe(14);
            done();
          });
      }

      for (let i = 0; i < 20; i++) {
        postToWall(`message ${i}`);
      }
    });

    test('should return full response object for "execute" method', () => {
      expect.assertions(5);

      return vkapiWithToken.call('execute', {
        // Calling this method without any params
        // will throw an "in-execute" error
        code: 'return [API.docs.search()];'
      })
        .then(response => {
          expect(typeof response).toBe('object');
          expect(response).toHaveProperty('response');
          expect(response).toHaveProperty('execute_errors');
          expect(Array.isArray(response.response)).toBeTruthy();
          expect(Array.isArray(response.execute_errors)).toBeTruthy();
        });
    });
  });

  describe('logIn()', () => {
    test('should perform a successful authorization through web-version of VK', () => {
      expect.assertions(4);

      return vkapiDefault.logIn(Object.assign(logInDetails, {
        appId: appIdToLogIn
      }))
        .then(response => {
          expect(typeof response).toBe('object');
          expect(typeof response.access_token).toBe('string');
          expect(typeof response.user_id).toBe('number');
          expect(typeof response.expires_in).toBe('number');
        });
    });

    test('should throw an error if no correct params provided', () => {
      expect.assertions(4);

      return Promise.all([
        expect(vkapiDefault.logIn()).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.logIn({ appId: 123456789 })).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.logIn({ appId: 123456789, login: 'olgdfgma@mail.ru' })).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.logIn({ appId: 123456789, password: 'pass1234' })).rejects.toBeInstanceOf(Error)
      ]);
    });

    test('should throw an error if password or login is incorrect', () => {
      expect.assertions(1);

      return expect(
        vkapiDefault.logIn({
          appId: appIdToLogIn,
          login: 'userlogin@vk.com',
          password: 'mypassword123'
        })
      )
        .rejects.toBeInstanceOf(VkAuthError);
    });

    test('should throw an error if user trying to use implicit flow auth in the official app', () => {
      expect.assertions(1);

      return expect(
        vkapiDefault.logIn(Object.assign(logInDetails, {
          appId: constants.CLIENT_ANDROID[0]
        }))
      )
        .rejects.toBeInstanceOf(VkAuthError);
    });
  });

  describe('upload()', () => {
    test('should perform a successful photo_wall uploading (FS Stream)', () => {
      expect.assertions(3);

      return vkapiWithToken.upload('photo_wall', fs.createReadStream(path.join(__dirname, '../examples/resources/dog.jpg')))
        .then(response => {
          expect(Array.isArray(response)).toBeTruthy();
          expect(response).toHaveLength(1);
          expect(response[0]).toHaveProperty('id');
        });
    });

    test('should perform a successful photo_wall uploading (Buffer)', done => {
      expect.assertions(3);

      fs.readFile(path.join(__dirname, '../examples/resources/dog.jpg'), (err, data) => {
        if (err) {
          return done();
        }

        vkapiWithToken.upload('photo_wall', {
          content: data,
          name: 'image.jpg'
        })
          .then(response => {
            expect(Array.isArray(response)).toBeTruthy();
            expect(response).toHaveLength(1);
            expect(response[0]).toHaveProperty('id');
            done();
          })
          .catch(error => {
            done();
          });
      });
    });

    test('should throw an error if no correct params provided', () => {
      expect.assertions(7);

      return Promise.all([
        expect(vkapiDefault.upload()).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.upload('unknown_type')).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.upload('audio')).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.upload('audio', [])).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.upload('audio', ['file1', 'file2'])).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.upload('photo_album', ['file1', 'file2', 'file3', 'file4', 'file5', 'file6'])).rejects.toBeInstanceOf(Error),
        expect(vkapiDefault.upload('audio', ['file1', 'file2'])).rejects.toBeInstanceOf(Error)
      ]);
    });

    test('should throw an error if file type is not compatible with upload type provided', () => {
      expect.assertions(1);

      return expect(
        vkapiWithToken.upload(
          'document',
          fs.createReadStream(path.join(__dirname, '../examples/resources/dog.jpg')),
          { type: 'audio_message' }
        )
      )
        .rejects.toBeInstanceOf(VkUploadError);
    });
  });
});
