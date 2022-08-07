const nock = require('nock');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const { API_BASE_URL } = require('../../constants');

zapier.tools.env.inject();
const appTester = zapier.createAppTester(App);

const {
  newCommentByUser: {
    operation: { perform },
  },
} = App.triggers;

describe('newCommentByUser', () => {
  const username = 'username';

  it('it should request and parse comments', async () => {
    const comment1 = { id: 'ija3hwr' };
    const comment2 = { id: 'ija05sw' };

    const response = {
      data: {
        children: [
          { kind: 't1', data: comment1 },
          { kind: 't1', data: comment2 },
        ],
      },
    };

    nock(API_BASE_URL)
      .get(`/user/${username}/comments`)
      // eslint-disable-next-line id-length
      .query({ sort: 'new', type: 'comments', limit: 100, t: 'hour' })
      .reply(200, response);

    const bundle = { inputData: { username } };

    const result = await appTester(perform, bundle);

    expect(result).toEqual([comment1, comment2]);
  });

  it('should throw a user-friendly error message on 404 (user not found)', async () => {
    nock(API_BASE_URL).get(`/user/${username}/comments`).query(true).reply(404, {});

    const bundle = { inputData: { username } };

    await expect(() => appTester(perform, bundle)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"{\\"message\\":\\"That Reddit username does not appear to exist.\\"}"`,
    );
  });

  it('should throw a generic error on any unknow error', async () => {
    nock(API_BASE_URL).get(`/user/${username}/comments`).query(true).reply(500, {});

    const bundle = { inputData: { username } };

    await expect(() => appTester(perform, bundle)).rejects.toThrowErrorMatchingInlineSnapshot(
      `"{\\"message\\":\\"unknown error, response status: 500\\"}"`,
    );
  });
});
