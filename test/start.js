const expect = require("chai").expect;
const authMiddleware = require("../middleware/is-auth");

it("should throw an error when is not authorized", function() {
  const req = {
    get: function() {
      return null;
    }
  };
  // we need to bind some props to the fnction and allow mocha to fire the function by itself
  expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
    "Not authenticated"
  );
});
