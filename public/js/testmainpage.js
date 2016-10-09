Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");

var currentUser = Parse.User.current();
if(currentUser) {
  var TestNumber = Parse.Object.extend("TestNumber");
  var testnumber = new TestNumber();
  testnumber.set("number", 3);
  testnumber.save();

}
