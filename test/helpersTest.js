const { assert } = require('chai');
const {databaseCheck} = require('../helpers');

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

describe('databaseCheck', () => {
  it('should return a user object with valid email', () => {
    const user = databaseCheck('user@example.com', testUsers);
    const expectedOutput = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(user, expectedOutput);
  })

  it('should return false when passing invalid email', () => {
    const user = databaseCheck('wrongmail@example.com', testUsers);
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput);
  })

  it('should return error if passing invalid database', () => {
    assert.throws(()=> {databaseCheck('user@example.com', users)}, Error);
  })

  it('should return user id string when calling the id property using the dot notation', () => {
    const userID = databaseCheck('user2@example.com', testUsers).id;
    const expectedOutput = "user2RandomID";
    assert.strictEqual(userID, expectedOutput);
  })

  it('should return user password string when calling the password property using the dot notation', () => {
    const userPassword = databaseCheck('user2@example.com', testUsers).password;
    const expectedOutput = "dishwasher-funk";
    assert.strictEqual(userPassword, expectedOutput);
  })
})