const { assert } = require('chai');

const { getUserByEmail, getUserByID, getUrlsForUser, } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: 'user2RandomID'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: 'userRandomID'
  },
};

describe("getUserByEmail", () => {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});

describe("getUserByEmail", () => {
  it("should return undefined when searching for an email that doesn't exist", () => {
    const user = getUserByEmail("random@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

describe("getUserByID", () => {
  it("should return the user ID when searching with a user email", () => {
    const user = getUserByID("user2@example.com", testUsers);
    const expectedOutput = "user2RandomID";
    assert.equal(user, expectedOutput);
  });
});

describe("getUserByID", () => {
  it("should return the user ID when searching with a user email", () => {
    const user = getUrlsForUser("userRandomID", urlDatabase);
    const expectedOutput = { "9sm5xK": {
      "longURL": "http://www.google.com",
      "userID": "userRandomID"} };
    assert.deepEqual(user, expectedOutput);
  });

});
