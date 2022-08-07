const nock = require("nock");
const zapier = require("zapier-platform-core");

const App = require("../../index");
const { API_BASE_URL } = require("../../constants");

zapier.tools.env.inject();
const appTester = zapier.createAppTester(App);

const { newCommentByUser } = App.triggers;

describe("newCommentByUser", () => {
  const username = "username";

  it("it should request and parse comments", async () => {
    const comment1 = { id: "ija3hwr" };
    const comment2 = { id: "ija05sw" };

    const response = {
      data: {
        children: [
          { kind: "t1", data: comment1 },
          { kind: "t1", data: comment2 },
        ],
      },
    };

    nock(API_BASE_URL)
      .get(`/user/${username}/comments`)
      .query({ sort: "new", type: "comments", limit: 100, t: "hour" })
      .reply(200, response);

    const bundle = { inputData: { username } };

    const result = await appTester(newCommentByUser.operation.perform, bundle);

    expect(result).toEqual([comment1, comment2]);
  });
});
