const { API_BASE_URL } = require('../constants');

// https://github.com/reddit-archive/reddit/wiki/API:-submit

const parseResponse = ({ json: { success, jquery } }) => {
  let message = jquery;

  jquery.forEach((row, index) => {
    if (row.length === 4 && (row[3] === 'text' || row[3] === 'redirect')) {
      // eslint-disable-next-line prefer-destructuring
      message = jquery[index + 1][3][0];
    }
  });

  return { success, message };
};

// https://www.reddit.com/dev/api/oauth#POST_api_submit

const newLinkPost = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: `${API_BASE_URL}/api/submit`,
    body: {
      kind: 'link',
      title: bundle.inputData.title,
      sr: bundle.inputData.sr,
      url: bundle.inputData.url,
    },
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  });

  return parseResponse(response);
};

module.exports = {
  key: 'newLinkPost',
  noun: 'Link',

  display: {
    label: 'New Link Post',
    description: 'Submit a new link post to a subreddit.',
  },

  operation: {
    inputFields: [
      {
        key: 'title',
        label: 'Title',
        type: 'string',
        required: true,
        helpText: 'Title of the new post. Must not be longer than 300 characters.',
      },
      {
        key: 'sr',
        label: 'Subreddit',
        type: 'string',
        required: true,
        helpText: 'Subreddit to submit the post to. **Note**: Do **not** include /r/.', // TODO: /u/ should print with blue font on zapier web
      },
      {
        key: 'url',
        label: 'Url',
        type: 'string',
        required: true,
      },
    ],

    sample: {
      success: true,
      message: 'http://www.reddit.com/r/test/comments/it3f3/test/',
    },
    perform: newLinkPost,
  },
};
