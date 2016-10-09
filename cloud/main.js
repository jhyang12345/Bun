require('cloud/app.js');
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});

//function to get number of comments of a post
Parse.Cloud.define("commentnumber", function(request, response) {
  var query = new Parse.Query("Post");
  query.equalTo("objectId", request.params.Post);
  query.find({
    success: function(results) {
      var commentquery = new Parse.Query("Comment");
      commentquery.equalTo("Post", results[0]);
      commentquery.find({
        success: function(results) {
          response.success({number: results.length, postid: request.params.Post});
        }, error: function(err) {
          response.error(0);
        }
      });

    }, error: function() {

    }
  });
});

//pass user and post object ids to check if a user has smiled
Parse.Cloud.define("hasSmiled", function(request, response) {
  var query = new Parse.Query("Post");
  query.equalTo("objectId", request.params.Post);
  query.find({
    success: function(results) {
      var checklist = results[0].get("UpvoteList");
      if (checklist.indexOf(request.params.User) != -1) {
        response.success(true);
      } else {
        response.success(false);
      }
    }, error: function(err) {
      response.error(false);
    }
  });

});

//hasSmiled with post id
Parse.Cloud.define("hasSmiledId", function(request, response) {
  var query = new Parse.Query("Post");
  query.equalTo("objectId", request.params.Post);
  query.find({
    success: function(results) {
      var checklist = results[0].get("UpvoteList");
      if (checklist.indexOf(request.params.User) != -1) {
        response.success({smiled:true, postid: request.params.Post});
      } else {
        response.success({smiled:false, postid: request.params.Post});
      }
    }, error: function(err) {
      response.error(false);
    }
  });

});

//get number of smiles
Parse.Cloud.define("Smiles", function(request, response) {
  var query = new Parse.Query("Post");
  query.equalTo("objectId", request.params.Post);
  query.find({
    success: function(results) {
      response.success(results[0].get("UpvoteList").length);
    }, error: function(err) {
      response.error(0);
    }
  });
});

//get number of smiles with Post id
Parse.Cloud.define("SmilesId", function(request, response) {
  var query = new Parse.Query("Post");
  query.equalTo("objectId", request.params.Post);
  query.find({
    success: function(results) {
      response.success({smiles: results[0].get("UpvoteList").length, postid: request.params.Post});
    }, error: function(err) {
      response.error(0);
    }
  });
});

//smile get the post and user id
Parse.Cloud.define("SmileAt", function(request, response) {
  var notification = Parse.Object.extend('Notifications');

  var query = new Parse.Query("Post");
  query.equalTo("objectId", request.params.Post);
  query.find({
    success: function(results) {
      var checklist = results[0].get("UpvoteList");
      if(checklist.indexOf(request.params.User) == -1) {
        results[0].addUnique('UpvoteList', request.params.User);
        results[0].save().then(function() {
          response.success({smiled:true, smiles:results[0].get('UpvoteList').length});
        });
        if(request.params.User != results[0].get("Author").id) {
          var newnotification = new notification();
          newnotification.set('postid', request.params.Post);
          newnotification.set('notificationTo', results[0].get("Author").id);
          newnotification.set('notificationFrom', request.params.User);
          newnotification.set("checked", false);
          newnotification.set("type", "smile");
          newnotification.save();
        }
      } else {
        results[0].remove('UpvoteList', request.params.User);
        results[0].save().then(function() {
          response.success({smiled:false, smiles:results[0].get("UpvoteList").length});
        });
      }

    }, error: function(err) {
      response.error('error');
    }
  });
});

Parse.Cloud.define("postCount", function(request, response) {
  var query = new Parse.Query("Post");
  query.equalTo('tag', request.params.tag);
  query.find({
    success: function(results) {
      response.success(results.length);
    }, error: function(err) {
      response.error('error');
    }
  });

});

Parse.Cloud.define("nameCount", function(request, response) {
  var userquery = new Parse.Query(Parse.User);
  userquery.equalTo('objectId', request.params.user);
  userquery.find({
    success: function(results) {
      var query = new Parse.Query("Post");
      query.equalTo('Author', results[0]);
      query.find({
        success: function(results) {
          response.success(results.length);
        }, error: function(err) {

        }
      });
    }, error: function(err) {

    }
  });

  var query = new Parse.Query("Post");

});

Parse.Cloud.define("deleteComment", function(request, response) {
  var commentquery = new Parse.Query('Comment');
  commentquery.equalTo('objectId', request.params.commentid);
  commentquery.first({
    success:function(result) {
      result.destroy({
        success:function(result) {
          response.success('destroyed ' + request.params.commentid);
        }, error: function(err) {
          response.error('Failed to destroy');
        }
      });
    }, error: function(err) {
      response.error('ERROR');
    }
  });
  //response.success(request.params.commentid);
});

Parse.Cloud.define('deletePost', function(request, response) {
  var postquery = new Parse.Query("Post");
  postquery.equalTo('objectId', request.params.Post);
  postquery.first({
    success: function(result) {
      var contents = result.get('contents');
      for(var x = 0; x < contents.length; ++x) {
        if(contents[x].className == 'Marker') {
          contents[x].remove("froms", request.params.Post);
          contents[x].save().then(function(obj) {
            if(obj.get("froms").length == 0) {
              contents[x].destroy();
            }
          });
        } else {
          contents[x].destroy();
        }
      }
    }, error: function(err) {
      response.error('Error deleting post');
    }
  }).then(function() {
    var postquery = new Parse.Query("Post");
    postquery.equalTo('objectId', request.params.Post);
    postquery.first({
      success: function(result) {
        result.destroy({
          success: function(result) {
            response.success('Successfully destroyed post');
          }, error: function(err) {
            response.error('Failed to destroy');
          }
        });
      }, error: function(err) {

      }
    })
  });
});

Parse.Cloud.define('getNotification', function(request, response) {
  var notificationquery = new Parse.Query("Notifications");
  notificationquery.equalTo('objectId', request.params.notificationId);
  notificationquery.first({
    success: function(obj) {
      var name;
      var message;
      var id = obj.id;
      var date = obj.createdAt;
      var postid = obj.get('postid');
      var userquery = new Parse.Query(Parse.User);
      userquery.equalTo('objectId', obj.get("notificationFrom"));
      userquery.first({
        success: function(obj) {
          name = obj.get("FirstName") + ' ' + obj.get("LastName");

        }, error: function(err) {

        }
      }).then(
          function(result) {
          if(obj.get('type') == 'comment') {
            message = 'has made a comment on your post.';
          } else if (obj.get('type') == 'smile') {
            message = 'has smiled at your post.';
          }
        }
      ).then(
        function(result) {
          if(obj.get('checked')) {
            response.success({Name: name, message: message, notificationId: id, date: date, postid: postid, checked: true});
          } else {
            obj.set('checked', true);
            obj.save();
            response.success({Name: name, message: message, notificationId: id, date: date, postid: postid, checked: false});
          }



        }
      );
    }, error: function(err) {
      response.error('Failed');
    }
  });
});

Parse.Cloud.define('getUncheckedNotifications', function(request, response) {
  var notificationquery = new Parse.Query('Notifications');
  notificationquery.equalTo('notificationTo', request.params.userid);
  var count = 0;
  notificationquery.find({
    success: function(results) {
      for(var i = 0; i < results.length; ++i) {
        if(!results[i].get('checked')) {
          count++;
        }
      }
    }, error: function(err) {

    }
  }).then(function() {
    response.success(count);
  });
});

Parse.Cloud.define('getMarkerAuthorName', function(request, response) {
  var markerquery = new Parse.Query('Marker');
  markerquery.equalTo('objectId', request.params.markerid);
  markerquery.include('Author');
  markerquery.first({
    success: function(result) {
      var author = result.get('Author');
      var name = author.get('FirstName') + ' ' + author.get('LastName');
      var url = "";
      if(author.get("ProfilePic") == undefined) {
        url = 'pictures/profile.png';
      } else {
        url = author.get("ProfilePic").url();
      }
      var authorid = author.id;
      response.success({name: name, url: url, authorid: authorid, markerid: request.params.markerid});
    }, error: function(err) {

    }
  });
});

Parse.Cloud.define('getPostInfo', function(request, response) {
  var postquery = new Parse.Query("Post");
  postquery.equalTo('objectId', request.params.postid);
  postquery.include('Author');
  postquery.first({
    success: function(result) {
      var createdAt = result.createdAt;
      var author = result.get("Author");
      var name = author.get("FirstName") + ' ' + author.get("LastName");
      var url = "";
      if(author.get("ProfilePic") == undefined) {
        url = 'pictures/profile.png';
      } else {
        url = author.get("ProfilePic").url();
      }
      var authorid = author.id;
      var commentquery = new Parse.Query('Post');
      commentquery.equalTo('Post', result);
      commentquery.find({
        success: function(results) {
          response.success({number: results.length, postid: request.params.Post});
        }, error: function(err) {
          response.error(0);
        }
      });

      response.success({name: name, url: url, authorid: authorid, postid: request.params.postid, createdAt: createdAt});
    }, error: function(err) {

    }
  });
});
