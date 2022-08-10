const { API_BASE_URL } = require('./constants');

const errors = [
  {
    regex: `${API_BASE_URL}/user/[^/]+/comments`,
    code: { 404: 'That Reddit username does not appear to exist.' },
  },
];

module.exports = (z, { status, request }) => {
  const url = new URL(request.url);
  const endpoint = `${url.origin}${url.pathname}`;

  errors.forEach(({ regex, code }) => {
    if (new RegExp(regex, 'i').test(endpoint) && code[status]) {
      throw new z.errors.Error(code[status]);
    }
  });

  throw new z.errors.Error(`unknown error, response status: ${status}`);
};
