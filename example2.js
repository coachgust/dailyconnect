var DailyConnect = require('./index.js')
var async = require('async')
var dateformat = require('dateformat')

var user = process.argv[2]
var pass = process.argv[3]
var runDay = '2013-10-31' //process.argv[4]
var fileLocation = ''

var mydc = new DailyConnect(user, pass)

function gatherPhotosByDay (userInfo, cb) {
  async.each(userInfo.myKids, getPhotosByDay, function (err) {
    if (err) {
      return cb(err)
    }
    cb(null)
  })

  function getPhotosByDay (kid, cb) {
    mydc.getKidStatusByDay(kid.Id, runDay, function (err, kidStatus) {
      if (err) {
        return cb(err)
      }

      var photoId = ''

	  for (var i=0;i<kidStatus.list.length;i++){
		  var entry = kidStatus.list[i]
		  photoId = entry.Photo
		  if (photoId != undefined){
			downloadPhotos(photoId, cb)
		  }
	  }
      //cb(null)
    })
  }
}

function downloadPhotos(photoId, cb){
	mydc.getPhoto(photoId, function (err, photo) {
      if (err) {
        return cb(err)
      }
	  var fs = require("fs");
	  fs.writeFile(fileLocation+runDay+'_'+photoId+".jpg", new Buffer(photo, "base64"), function(err) {});
    })
}

function gatherKidsStatusByDay (userInfo, cb) {
  var latestKidEvents = []
  async.each(userInfo.myKids, getEventsByDay, function (err) {
    if (err) {
      return cb(err)
    }
    cb(null, latestKidEvents)
  })

  function getEventsByDay (kid, cb) {
    mydc.getKidStatusByDay(kid.Id, runDay, function (err, kidStatus) {
      if (err) {
        return cb(err)
      }

      var status = 'no activity'
      var ts = ''
	  for (var i=0;i<kidStatus.list.length;i++){
		  var entry = kidStatus.list[i]
		  status = entry.Txt
        ts = entry.e
		latestKidEvents.push(dateformat(ts, 'isoDateTime') + ': ' + kid.Name + ': ' + status)
	  }
      
      cb(null, userInfo)
    })
  }
}

/*function gatherKidsLatestStatus (userInfo, cb) {
  var latestKidEvents = []
  async.each(userInfo.myKids, getLatestEvent, function (err) {
    if (err) {
      return cb(err)
    }
    cb(null, latestKidEvents)
  })

  function getLatestEvent (kid, cb) {
    mydc.getKidStatus(kid.Id, function (err, kidStatus) {
      if (err) {
        return cb(err)
      }

      var status = 'no activity'
      var ts = ''
      if (kidStatus.list.length > 0) {
        var entry = kidStatus.list[kidStatus.list.length - 1]
        status = entry.Txt
        ts = entry.e
      }

      latestKidEvents.push(dateformat(ts, 'isoDateTime') + ': ' + kid.Name + ': ' + status)
      cb(null, userInfo)
    })
  }
}*/

/*function gatherLatestPhotos (userInfo, cb) {
  var latestKidPhotos = []
  async.each(userInfo.myKids, getLatestPhotos, function (err) {
    if (err) {
      return cb(err)
    }
    cb(null, latestKidPhotos)
  })

  function getLatestPhotos (kid, cb) {
    mydc.getKidStatus(kid.Id, function (err, kidStatus) {
      if (err) {
        return cb(err)
      }

      var photoId = ''

	  for (var i=0;i<kidStatus.list.length;i++){
		  var entry = kidStatus.list[i]
		  photoId = entry.Photo
		  if (photoId != undefined){
			//latestKidPhotos.push(photoId)
			getPhotos(photoId, cb)
		  }
	  }
      cb(null)
    })
  }
}*/

/*function getPhotoss (userInfo, cb) {
  var latestKidPhotos = []
  async.each(userInfo.myKids, getLatestEvent, function (err) {
    if (err) {
      return cb(err)
    }
    cb(null, latestKidPhotos)
  })

  function getLatestEvent (kid, cb) {
    mydc.getPhoto(7840091709, function (err, photo) {
      if (err) {
        return cb(err)
      }
	  var fs = require("fs");
	  fs.writeFile("arghhhh.jpg", new Buffer(photo, "base64"), function(err) {});
	  //latestKidPhotos.push(photo.toString('base64'))
      cb(null)
    })
  }
}*/

function completed (err, result) {
  if (err) {
    console.error(err)
  }
  console.log(result)
}

async.waterfall([
  mydc.login.bind(mydc),
  mydc.getUserInfo.bind(mydc),
  gatherPhotosByDay
], completed)
