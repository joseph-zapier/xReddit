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
  const access_token = "a_token";
  const refresh_token = "a_refresh_token";
  const redirect_uri = "https://www.zapier.com/redirect";

  const basicAuth = `Basic ${Buffer.from(
    `${CLIENT_ID}:${CLIENT_SECRET}`
  ).toString("base64")}`;

  beforeAll(() => {
    if (!(CLIENT_ID && CLIENT_SECRET)) {
      throw new Error(
        `Before running the tests, make sure CLIENT_ID and CLIENT_SECRET are available in the environment.`
      );
    }
  });

  it("generates an authorize URL", async () => {
    const state = "1234";

    const bundle = { inputData: { redirect_uri, state } };

    const raw_url = await appTester(authorizeUrl, bundle);

    const url = new URL(raw_url);

    expect(`${url.origin}${url.pathname}`).toBe(
      "https://www.reddit.com/api/v1/authorize"
    );
    expect(url.searchParams.get("state")).toBe(state);
    expect(url.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("duration")).toBe("permanent");
    expect(url.searchParams.get("redirect_uri")).toBe(redirect_uri);
    expect(url.searchParams.get("scope")).toBe("history,identity,read,submit");
  });

  it("can fetch an access token", async () => {
    const code = "one_time_code";

    const response = { access_token, refresh_token };

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
    const response = { access_token };

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
    nock(API_BASE_URL)
      .matchHeader("authorization", `Bearer ${access_token}`)
      .get("/api/v1/me")
      .reply(200);

    const bundle = { authData: { access_token } };

    const response = await appTester(App.authentication.test, bundle);

    expect(response.status).toBe(200);
  });
});
