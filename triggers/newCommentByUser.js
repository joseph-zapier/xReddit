const sample = require("../samples/user-username-comments.json");

const { API_BASE_URL } = require("../constants");

const parseResponse = (response) => {
  const data = response.json.data.children;

  return data.map((item) => item.data);
};

const newCommentByUser = async (z, bundle) => {
  const response = await z.request({
    url: `${API_BASE_URL}/user/${bundle.inputData.username}/comments`,
    params: {
      sort: "new",
    },
  });

  // TOD0: 404 User not found

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
          "The username you want to watch for new comments. **Note**: Do **not** include /u/.", // TODO: /u/ should show with blue font on zapier web
      },
    ],

    sample,
    perform: newCommentByUser,
  },
};
