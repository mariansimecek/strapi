'use strict';

const { signEntityMedia } = require('../entity-manager');

const { getService } = require('../../../../utils');

jest.mock('../../../../utils');

describe('Upload | extensions | entity-manager', () => {
  const modelUID = 'model';
  const componentUID = 'component';

  const models = {
    [modelUID]: {
      attributes: {
        media: {
          type: 'media',
          multiple: false,
        },
        media_repeatable: {
          type: 'media',
          multiple: true,
        },
        compo_media_repeatable: {
          type: 'component',
          repeatable: true,
          component: componentUID,
        },
        compo_media: {
          type: 'component',
          component: componentUID,
        },
      },
    },
    [componentUID]: {
      attributes: {
        media_repeatable: {
          type: 'media',
          multiple: true,
        },
        media: {
          type: 'media',
          multiple: false,
        },
      },
    },
  };

  const media = ['media', 'media_1'].map((entry) => ({
    formats: {
      thumbnail: {
        url: `${entry}_thumb`,
      },
      large: {
        url: `${entry}_large`,
      },
      small: {
        url: `${entry}_small`,
      },
      medium: {
        url: `${entry}_medium`,
      },
    },
    url: `${entry}_url`,
  }));

  describe('signEntityMedia', () => {
    let spySignFileUrls;
    beforeEach(() => {
      spySignFileUrls = jest.fn();
      getService.mockImplementation(() => ({
        signFileUrls: spySignFileUrls,
      }));

      global.strapi = {
        plugins: {
          upload: {},
        },
        getModel: jest.fn((uid) => models[uid]),
      };
    });

    test('makes correct calls for media attribute', async () => {
      const entity = {
        media: media[0],
      };

      await signEntityMedia(entity, modelUID);
      expect(getService).toBeCalledWith('file');
      expect(spySignFileUrls).toBeCalledWith(entity.media);
    });

    test('makes correct calls for repeatable media', async () => {
      const entity = {
        media_repeatable: media,
      };

      await signEntityMedia(entity, modelUID);
      expect(getService).toBeCalledWith('file');
      expect(spySignFileUrls).toBeCalledTimes(2);
      expect(spySignFileUrls.mock.calls).toEqual([
        [media[0], 0],
        [media[1], 1],
      ]);
    });

    test('makes correct calls for components', async () => {
      const entity = {
        compo_media: {
          media: media[0],
          media_repeatable: media,
        },
      };

      await signEntityMedia(entity, modelUID);
      expect(getService).toBeCalledWith('file');
      expect(spySignFileUrls).toBeCalledTimes(3);
      expect(spySignFileUrls.mock.calls).toEqual([[media[0]], [media[0], 0], [media[1], 1]]);
    });

    test('makes correct calls for repeatable components', async () => {
      const entity = {
        compo_media_repeatable: [
          {
            media: media[0],
            media_repeatable: media,
          },
          {
            media: media[1],
            media_repeatable: media,
          },
        ],
      };

      await signEntityMedia(entity, modelUID);
      expect(getService).toBeCalledWith('file');
      expect(spySignFileUrls).toBeCalledTimes(6);
      expect(spySignFileUrls.mock.calls).toEqual([
        [media[0]],
        [media[1]],
        [media[0], 0],
        [media[1], 1],
        [media[0], 0],
        [media[1], 1],
      ]);
    });
  });
});
