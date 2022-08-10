const nock = require('nock');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const { API_BASE_URL } = require('../../constants');

zapier.tools.env.inject();
const appTester = zapier.createAppTester(App);

const {
  newLinkPost: {
    operation: { perform },
  },
} = App.creates;

describe('newLinkPost', () => {
  const title = 'a tittle';
  const sr = 'a subreddit';
  const url = 'https://www.zapier.com';

  it('should submit a new link post', async () => {
    const response = {
      success: true,
      jquery: [
        [0, 1, 'call', ['#newlink']],
        [1, 2, 'attr', 'find'],
        [2, 3, 'call', ['.status']],
        [3, 4, 'attr', 'hide'],
        [4, 5, 'call', []],
        [5, 6, 'attr', 'html'],
        [6, 7, 'call', ['']],
        [7, 8, 'attr', 'end'],
        [8, 9, 'call', []],
        [1, 10, 'attr', 'captcha'],
        [10, 11, 'call', ['f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0']],
        [1, 12, 'attr', 'find'],
        [12, 13, 'call', ['*[name=url]']],
        [13, 14, 'attr', 'attr'],
        [14, 15, 'call', ['value', 'HTTP://URL.URL']],
        [15, 16, 'attr', 'end'],
        [16, 17, 'call', []],
        [1, 18, 'attr', 'redirect'],
        [18, 19, 'call', ['http://www.reddit.com/r/test/comments/it3f3/test/']],
      ],
    };

    nock(API_BASE_URL)
      .post(`/api/submit`, (body) => body.sr === sr && body.title === title && body.url === url)
      .query(true)
      .reply(200, response);

    const bundle = { inputData: { title, sr, url } };

    const result = await appTester(perform, bundle);

    expect(result).toEqual({
      success: true,
      message: 'http://www.reddit.com/r/test/comments/it3f3/test/',
    });
  });

  it('should catch any error', async () => {
    const response = {
      success: false,
      jquery: [
        [0, 1, 'call', ['#newlink']],
        [1, 2, 'attr', 'find'],
        [2, 3, 'call', ['.status']],
        [3, 4, 'attr', 'hide'],
        [4, 5, 'call', []],
        [5, 6, 'attr', 'html'],
        [6, 7, 'call', ['']],
        [7, 8, 'attr', 'end'],
        [8, 9, 'call', []],
        [1, 10, 'attr', 'captcha'],
        [10, 11, 'call', ['f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0']],
        [1, 12, 'attr', 'find'],
        [12, 13, 'call', ['*[name=url]']],
        [13, 14, 'attr', 'attr'],
        [14, 15, 'call', ['value', 'http://www.example.com/']],
        [15, 16, 'attr', 'end'],
        [16, 17, 'call', []],
        [1, 18, 'attr', 'find'],
        [18, 19, 'call', ['.error.RATELIMIT.field-ratelimit']],
        [19, 20, 'attr', 'show'],
        [20, 21, 'call', []],
        [21, 22, 'attr', 'text'],
        [22, 23, 'call', ['you are doing that too much. try again in 9 minutes.']],
        [23, 24, 'attr', 'end'],
        [24, 25, 'call', []],
      ],
    };

    nock(API_BASE_URL)
      .post(`/api/submit`, (body) => body.sr === sr && body.title === title && body.url === url)
      .query(true)
      .reply(200, response);

    const bundle = { inputData: { title, sr, url } };

    const result = await appTester(perform, bundle);

    expect(result).toEqual({
      success: false,
      message: 'you are doing that too much. try again in 9 minutes.',
    });
  });
});
