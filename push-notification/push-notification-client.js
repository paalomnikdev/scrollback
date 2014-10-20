/* jshint browser:true */
/* global libsb, device */

/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

document.addEventListener('deviceready', registerPushNotification, false);

var pushNotification, regId;

window.onNotificationGCM = function (e) {
	// handler for push notifications.
	console.log("Got notification", e.event);

	switch (e.event) {
	case 'registered':
		if (e.regid.length > 0) {
			// Storing regId to be used by GCM to make push notifications.
			console.log("regID = " + e.regid);
			localStorage.phonegapRegId = e.regid;
			console.log("Stored regid to localStorage ", localStorage.phonegapRegId);
		}
		break;

	case 'message':
		console.log(e);
		// e.foreground is true if the notification came in when the user is in the foreground.
		if (e.foreground) {
			console.log(e.payload.message);
		}
		break;

	case 'error':
		console.log(e.msg);
		break;

	default:
		console.log(e);
		break;
	}
};

function registerPushNotification() {
	console.log('inside push notification client , got device ready');
	pushNotification = window.plugins && window.plugins.pushNotification;
	if (!pushNotification) {
		console.log("pushNotification isn't ready.");
		return;
	}

	if (device.platform == 'android' || device.platform == 'Android') {
		console.log('device ready; android ' + device.platform + " " + pushNotification);
		pushNotification.register(successHandler, errorHandler, {
			"senderID": "73969137499",
			"ecb": "onNotificationGCM"
		});
	}
}

// result contains any message sent from the plugin call
function successHandler(result) {
	console.log('registration success result = ' + result);
	regId = localStorage.phonegapRegId;
	console.log("Mapping " + regId + "to user " + libsb.user.id);
	mapDevicetoUser(regId);
}

// result contains any error description text returned from the plugin call
function errorHandler(error) {
	console.log('registration error = ' + error);
}

libsb.on('init-dn', function () {
	console.log("got init-dn mapping to user ", localStorage.phonegapRegId, libsb.user.id);
	mapDevicetoUser(localStorage.phonegapRegId);
}, 100);

function mapDevicetoUser(regId) {
	if (typeof regId === "undefined") return;
	/* Checks if device is registered to User for push notification, if not adds it */
	var user = libsb.user;
	var deviceRegistered = false;
	if (typeof user.params.pushNotifications === "undefined") {
		user.params.pushNotifications = {
			devices: []
		};
	}

	var devices = [];

	devices = user.params.pushNotifications &&
		user.params.pushNotifications.devices ? user.params.pushNotifications.devices : devices;

	devices.forEach(function (device) {
		if (device && device.hasOwnProperty('registrationId')) {
			if (device.registrationId === regId) {
				deviceRegistered = true;
			}
		}
	});
	console.log("Devices, deviceRegistered", devices, deviceRegistered);
	var newDevice = {
		deviceName: device.model,
		registrationId: regId,
		enabled: true
	};
	console.log("New Device is ", newDevice);
	if (deviceRegistered === false) {
		devices.push(newDevice);
		user.params.pushNotifications.devices = devices;
		console.log("Emitting user-up", user);
		libsb.emit('user-up', user);
	}
}

console.log("window.phonegap ", window.phonegap);

//if (window.phonegap) {
//	// add the device registration id to the users params.
//	
//}



//libsb.on('pref-show', function(tabs, next) {
//	var $div = $('<div>');
//	var user = tabs.user;
//	
//	var devices = user.params.pushNotifications && 
//        user.params.pushNotifications.devices ? user.params.pushNotifications.devices : [];
/*
		Structure of user.params.pushNotifications
		
		user.params.pushNotifications = {
			devices : [ 
				{platform: "Android", deviceId: "adsfaf32r23sdf21e123", enabled: true}, 
				{platform: "iOS", deviceId: "234jkidksf9325pi23d2sdf", enabled: false}
			]
		}
	
	*/

//	tabs.pushnotification = {
//		text: "Your Devices",
//		html: $div,
//		prio: 1000
//	};
//	
//	next();
//});