/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; 

let Issues;
let db;

//CRUD
function createIssue(project, issue, res){
  // console.log("trying to create issue:", issue, " at project:", project)
  let toInsert = {
    ...issue,
    created_on: new Date(),
    updated_on: new Date(),
    open: true,
    _id: new ObjectId()
  };
  Issues.insertOne( toInsert, (err, doc) => {
      if(err) return console.error(err)
      res.send(toInsert)
  })
}

function updateIssue(project, issue, res){
  let toUpdate= {};
  for (var key in issue) {
    var obj = issue[key];
    if(key !== "_id" && issue[key] !== "")toUpdate[key] = issue[key]
  }
  toUpdate.updated_on = new Date()
  // console.log("toupdate", toUpdate)
  // console.log("trying to update issue:", issue, " at project:", project)
  Issues.findOneAndUpdate({ _id: new ObjectId(issue._id)}, {$set: toUpdate}, (err, doc) => {
    if (err) return console.log(err)
    res.send('successfully updated')
  })
  
}

function deleteIssue(project, issue, res){
  // console.log("trying to delete issue with id: ", issue._id)
  Issues.findAndRemove({_id: ObjectId(issue._id)}, (err, doc) => {
    if(err) console.error(err)
    res.send("deleted " + issue._id)
  })
}

function getIssues(project, query, res){
  // console.log("getting issues from project:", project)
  // console.log(query)/
  Issues.find(query).toArray(function(err, docs) {
    if(err) console.error(err)
    res.send(docs)
  })
}

//Connect to database
MongoClient.connect(CONNECTION_STRING, function(err, database) {
  if(err){ 
    console.error(err)
  }else{ 
    console.log("Connected to database")
    db = database.db("IssueTracker")
    Issues = db.collection("Issues")
  }
});

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      var project = req.params.project;
      var query = req.query
      getIssues(project, query, res)
    })

    .post(function (req, res){
      var project = req.params.project;
      var issue = req.body
      if(!issue.issue_title || !issue.issue_text || !issue.created_by) return res.send('missing inputs')
      createIssue(project, issue, res)
    })

    .put(function (req, res){
      var project = req.params.project;
      var issue = req.body
      if(Object.keys(issue).length === 1 && issue._id) return res.send('no updated field sent')
      updateIssue(project, issue, res)
    })

    .delete(function (req, res){
      var project = req.params.project;
      var issue = req.body
      !issue._id ? res.send("_id error") : deleteIssue(project, issue, res)
    });

};

