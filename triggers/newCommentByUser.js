const sample = require("../samples/user-username-comments.json");

const { API_BASE_URL } = require("../constants");

const parseResponse = (response) => {
  const comments = response.json.data.children;

  return comments.map((comment) => comment.data);
};

// https://www.reddit.com/dev/api/oauth#GET_user_{username}_{where}

const getNewCommentsByUser = async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE_URL}/user/${bundle.inputData.username}/comments`,
    params: {
      sort: "new",
      type: "comments",
      limit: 100,
      t: "hour",
    },
  });

  // TODO: 404 User not found

  return parseResponse(response);
};

module.exports = {
  key: "newCommentByUser",
  noun: "Comment",

  display: {
    label: "New Comment by User",
    description: "Triggers when a new comment is created by a certain user.",
  },

  operation: {
    inputFields: [
      {
        key: "username",
        label: "Username",
        type: "string",
        required: true,
        helpText:
          "The username you want to watch for new comments. **Note**: Do **not** include /u/.", // TODO: /u/ should print with blue font on zapier web
      },
    ],

    sample,
    perform: getNewCommentsByUser,
  },
};
