var newMailListener = {
	    msgAdded: function(aMsgHdr) {
		    if( !aMsgHdr.isRead ){
		    	alert("Got mail. Look at aMsgHdr's properties for more details.");
			    if(aMsgHdr.folder == "REPUTATIONBOX"){
			    	//process the json and insert into the db
			    }
		    }
	    }
	}

	function init() {
	alert("init method is called,,,,...");
	    var notificationService =
		Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
		.getService(Components.interfaces.nsIMsgFolderNotificationService);
	    notificationService.addListener(newMailListener, notificationService.msgAdded); 
	}
//adding the msgListener to the window onload
//window.addEventListener("load", init, true);
init();