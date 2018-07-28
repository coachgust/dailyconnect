var DailyConnect = require('./index.js')
var async = require('async')
var dateformat = require('dateformat')

var user = process.argv[2]
var pass = process.argv[3]
var startDay = process.argv[4] != null ? new Date(process.argv[4] + ' 23:59:59 GMT') : new Date()
var endDay = process.argv[5] != null ? new Date(process.argv[5] + ' 23:59:59 GMT') : new Date()
var fileLocation = 'C:/DailyConnect/'

var mydc = new DailyConnect(user, pass)

function getAllSinceDate(userInfo, cb){
	var daysOfYear = [];
	for (var d = startDay; d <= endDay; d.setDate(d.getDate() + 1)) {
		console.log(d)
		gatherPhotosByDay(userInfo, d, cb)
		gatherKidsStatusByDay(userInfo, d, cb)
	}
}

function gatherPhotosByDay (userInfo, date, cb) {
	async.each(userInfo.myKids, getPhotosByDay.bind(null, date), function (err) {
		if (err) {
			return cb(err)
		}
		cb(null)
	})
	
	function getPhotosByDay (date, kid, cb) {
		var displayDate = dateformat(date, 'yyyy-mm-dd') // For some reason function call changes date returned so add display date for file
		mydc.getKidStatusByDay(kid.Id, date, function (err, kidStatus) {
			if (err) {
				return cb(err)
			}
			
			var photoId = ''
			
			for (var i=0;i<kidStatus.list.length;i++){
				var entry = kidStatus.list[i]
				photoId = entry.Photo
				if (photoId != undefined){
					downloadPhotoByKidAndId(kid, photoId, displayDate, cb)
				}
			}
			//cb(null)
		})
	}
}

function downloadPhotoByKidAndId(kid, photoId, date, cb){
	mydc.getPhoto(photoId, function (err, photo) {
		if (err) {
			return cb(err)
		}
		var fs = require("fs");
		fs.writeFile(fileLocation+kid.Name+'_'+date+'_'+photoId+".jpg", new Buffer(photo, "base64"), function(err) {});
    })
}

function gatherKidsStatusByDay (userInfo, date, cb) {
	var latestKidEvents = []
	async.each(userInfo.myKids, getEventsByDay.bind(null, date), function (err) {
		if (err) {
			return cb(err)
		}
		cb(null, latestKidEvents)
	})
	
	function getEventsByDay (date, kid, cb) {
		var displayDate = dateformat(date, 'yyyy-mm-dd') // For some reason function call changes date returned so add display date for file
		mydc.getKidStatusByDay(kid.Id, date, function (err, kidStatus) {
			if (err) {
				return cb(err)
			}
			
			var status = 'no activity'
			var ts = ''
			for (var i=0;i<kidStatus.list.length;i++){
				var entry = kidStatus.list[i]
				status = entry.Txt
				ts = entry.e
				latestKidEvents.push(entry)
			}
			var fs = require("fs");
			fs.writeFile(fileLocation+kid.Name+'_'+displayDate+"_Status_"+".txt", JSON.stringify(latestKidEvents), function(err) {});
      
			//cb(null, userInfo)
		})
	}
}

function completed (err, result) {
	if (err) {
		console.error(err)
	}
	console.log(result)
}

async.waterfall([
  mydc.login.bind(mydc),
  mydc.getUserInfo.bind(mydc),
  //getAllPhotosSinceDate
  //gatherKidsStatusByDay
  getAllSinceDate
], completed)
