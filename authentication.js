"use strict";

const { AUTH_BASE_URL, API_BASE_URL } = require("./constants");

const getHeaders = () => ({
  "content-type": "application/x-www-form-urlencoded",
  authorization: `Basic ${Buffer(
    `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
  ).toString("base64")}`,
});

const getAccessToken = async (z, bundle) => {
  const response = await z.request({
    url: `${AUTH_BASE_URL}/access_token`,
    method: "POST",
    body: {
      code: bundle.inputData.code,
      grant_type: "authorization_code",
      redirect_uri: bundle.inputData.redirect_uri,
    },
    headers: getHeaders(),
  });

  // If you're using core v9.x or older, you should call response.throwForStatus()
  // or verify response.status === 200 before you continue.

  return {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
  };
};

const refreshAccessToken = async (z, bundle) => {
  const response = await z.request({
    url: `${AUTH_BASE_URL}/access_token`,
    method: "POST",
    body: {
      grant_type: "refresh_token",
      refresh_token: bundle.authData.refresh_token,
    },
    headers: getHeaders(),
  });

  // If you're using core v9.x or older, you should call response.throwForStatus()
  // or verify response.status === 200 before you continue.

  return {
    access_token: response.data.access_token,
  };
};

// This function runs before every outbound request. You can have as many as you
// need. They'll need to each be registered in your index.js file.
const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData.access_token) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }

  return request;
};

// You want to make a request to an endpoint that is either specifically designed
// to test auth, or one that every user will have access to. eg: `/me`.
// By returning the entire request object, you have access to the request and
// response data for testing purposes. Your connection label can access any data
// from the returned response using the `json.` prefix. eg: `{{json.username}}`.
const test = (z, bundle) => z.request({ url: `${API_BASE_URL}/v1/me` });

module.exports = {
  config: {
    type: "oauth2",
    oauth2Config: {
      authorizeUrl: {
        url: `${AUTH_BASE_URL}/authorize`,
        params: {
          response_type: "code",
          duration: "permanent",
          scope: "history,identity,read,submit",

          state: "{{bundle.inputData.state}}",
          client_id: "{{process.env.CLIENT_ID}}",
          redirect_uri: "{{bundle.inputData.redirect_uri}}",
        },
      },
      getAccessToken,
      refreshAccessToken,
      autoRefresh: true,
    },

    // Define any input app's auth requires here. The user will be prompted to enter
    // this info when they connect their account.
    fields: [],

    // The test method allows Zapier to verify that the credentials a user provides
    // are valid. We'll execute this method whenever a user connects their account for
    // the first time.
    test,

    // This template string can access all the data returned from the auth test. If
    // you return the test object, you'll access the returned data with a label like
    // `{{json.X}}`. If you return `response.data` from your test, then your label can
    // be `{{X}}`. This can also be a function that returns a label. That function has
    // the standard args `(z, bundle)` and data returned from the test can be accessed
    // in `bundle.inputData.X`.
    connectionLabel: "{{json.username}}",
  },
  befores: [includeBearerToken],
  afters: [],
};