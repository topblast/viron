angular.module('starter.services', [])

.factory('Users', function($firebaseAuth){
  
  var ref = new Firebase('https://environ-test.firebaseio.com/');
  var userRef = ref.child('users');
  var _users = $firebaseAuth(ref);
  
  return {
    login: function(obj, callback, errorCallback) {
      ref.authWithPassword(obj, function(error, authData){
        if (error){
          errorCallback(error);
        }
        else{
          userRef.child(authData.uid).child('face').set(authData.password.profileImageURL);
          callback(authData);
        }
      });
    },
    signup: function(obj, callback, errorCallback){
      ref.createUser(obj, function(error, userData){
        if (error){
          errorCallback(error);
        }
        else{
          userRef.child(userData.uid).set({
            community_points: 0
          });
          callback(userData);
        }
      });
    },
    resetPassword: function(email, callback, errorCallback){
      ref.resetPassword(email, function(error){
        if (error){
          errorCallback(error);
        }
        else{
          callback();
        }
      });
    },
    getLogin: function (){
      return ref.getAuth();
    },
    logout: function(){
      ref.unauth();
    },
    getUser: function(){
      var auth = ref.getAuth();
      if (!auth)
        return null;
      
      return userRef.child(auth.uid);
    }
   
  };
})

.factory('Posts', function ($firebaseArray, Users) {
  var postsRef = new Firebase('https://environ-test.firebaseio.com/posts');
  var _posts = $firebaseArray(postsRef.orderByChild('date_created'));
  return {
    all: function(){
      return _posts;
    },
    push: function(post){
      var user = User.getUser();
      if (!user)
        return false;
        
      post.userid = user.$id;
      postsRef.push().set(post);
      user.child('community_points').transaction(function(community_points) {
        return community_points+5;
      });
      return true;
    },
    pushComment: function(id, comment){
      var user = User.getUser();
      if (!user)
        return false;
        
      comment.userid = user.$id;
      postsRef.child(id).child('comments').push().set(comment);
      user.child('community_points').transaction(function(community_points) {
        return community_points+1;
      });
      return true;
    }
  }
});