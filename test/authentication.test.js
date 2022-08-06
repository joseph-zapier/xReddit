const nock = require("nock");
const zapier = require("zapier-platform-core");

const App = require("../index");
const { AUTH_BASE_URL, API_BASE_URL } = require("../constants");

zapier.tools.env.inject();
const appTester = zapier.createAppTester(App);

const { authorizeUrl, getAccessToken, refreshAccessToken } =
  App.authentication.oauth2Config;

const CLIENT_ID = process.env.CLIENT_ID || "";
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";

// https://github.com/reddit-archive/reddit/wiki/OAuth2

describe("reddit auth", () => {
  const redirect_uri = "https://www.zapier.com/redirect";
  const basicAuth = `Basic ${Buffer(`${CLIENT_ID}:${CLIENT_SECRET}`).toString(
    "base64"
  )}`;

  beforeAll(() => {
    if (!(CLIENT_ID && CLIENT_SECRET)) {
      throw new Error(
        `Before running the tests, make sure CLIENT_ID and CLIENT_SECRET are available in the environment.`
      );
    }
  });

  it("generates an authorize URL", async () => {
    const state = "4444";

    const bundle = { inputData: { redirect_uri, state } };

    const url = await appTester(authorizeUrl, bundle);

    // BUG: if params order change test wont pass but it should pass!!!
    expect(url).toBe(
      `${AUTH_BASE_URL}/authorize?response_type=code&duration=permanent&scope=history%2Cidentity%2Cread%2Csubmit&state=4444&client_id=1234&redirect_uri=https%3A%2F%2Fwww.zapier.com%2Fredirect`
    );
  });

  it("can fetch an access token", async () => {
    const code = "one_time_code";

    const response = {
      access_token: "a_token",
      refresh_token: "a_refresh_token",
    };

    nock(AUTH_BASE_URL)
      .matchHeader("authorization", basicAuth)
      .post("/access_token", (body) => {
        return (
          body.code === code &&
          body.redirect_uri === redirect_uri &&
          body.grant_type === "authorization_code"
        );
      })
      .reply(200, response);

    const bundle = { inputData: { code, redirect_uri } };

    const result = await appTester(getAccessToken, bundle);

    expect(result.access_token).toBe(response.access_token);
    expect(result.refresh_token).toBe(response.refresh_token);
  });

  it("can refresh the access token", async () => {
    const refresh_token = "a_refresh_token";

    const response = { access_token: "a_token" };

    nock(AUTH_BASE_URL)
      .matchHeader("authorization", basicAuth)
      .post("/access_token", (body) => {
        return (
          body.refresh_token == refresh_token &&
          body.grant_type === "refresh_token"
        );
      })
      .reply(200, response);

    const bundle = { authData: { refresh_token } };

    const result = await appTester(refreshAccessToken, bundle);

    expect(result.access_token).toBe(response.access_token);
  });

  it("includes the access token in future requests", async () => {
    const username = "Bret";
    const response = { data: { username } };

    const access_token = "a_token";

    nock(API_BASE_URL)
      .matchHeader("authorization", `Bearer ${access_token}`)
      .get("/v1/me")
      .reply(200, response);

    const bundle = { authData: { access_token } };

    const { json } = await appTester(App.authentication.test, bundle);

    expect(json.data).toHaveProperty("username");
    expect(json.data.username).toBe(username);
  });
});
