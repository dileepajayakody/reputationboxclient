var Application = Components.classes["@mozilla.org/steel/application;1"].getService(Components.interfaces.steelIApplication);

//sending msgKey and whether important or unimportant
var importantEmailHandler = {
		sendImportantRequest : function(){
		try{
			//need to get the selected message key and whether its an important email	
			var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
			//getting the selected row's msgKey
			var msgKey = gDBView.keyForFirstSelectedMessage;
			alert('sending mark Important message key:' + msgKey);
			req.open('POST', "http://localhost:8080/restful/services/EmailService/actions/markMailImportant/invoke?long="+msgKey, false, "sven", "pass");
			//req.send('{"string": {"value":"hello"}}');
			req.send(null);
			//var status = req.statusText;
			//var responseText = req.responseText;
			//var readyState = req.readyState;			 
			//Application.console.log('Response for the post request responseText : ' + responseText);
			 
			//setting this message as a flagged message;
			var selectedMsgHdr = gDBView.hdrForFirstSelectedMessage;
			selectedMsgHdr.setStringProperty("x-flag-score", "0.99");
			selectedMsgHdr.setStringProperty("x-spam-total-score", "0");
			
		} catch (e) {
			Application.console.log('Error occured in the importantEmailHandler : ' + e);
		}		
	},
	sendSpamRequest : function(){
		try{
			//need to get the selected message key and whether its an important email	
			var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
			//getting the selected row's msgKey
			var msgKey = gDBView.keyForFirstSelectedMessage;
			alert('sending mark Spam message key :' + msgKey);
			req.open('POST', "http://localhost:8080/restful/services/EmailService/actions/markMailSpam/invoke?long="+msgKey, false, "sven", "pass");
			//req.send('{"string": {"value":"hello"}}');
			req.send(null);	 
			var selectedMsgHdr = gDBView.hdrForFirstSelectedMessage;
			selectedMsgHdr.setStringProperty("x-see-score", "0");
			selectedMsgHdr.setStringProperty("x-flag-score", "0");
			selectedMsgHdr.setStringProperty("x-reply-score", "0");
			selectedMsgHdr.setStringProperty("x-spam-total-score", "0.99");
			
			
		} catch (e) {
			Application.console.log('Error occured in the importantEmailHandler : ' + e);
		}
	}
}

var contentRepColumnHandler = {
   getCellText: function(row, col) {
      // get the message's header so that we can extract the reply to field
	   
	   var key = gDBView.getKeyAt(row);
       var hdr = gDBView.db.GetMsgHdrForKey(key);			
       var colvalue = hdr.getStringProperty("x-content-score");
       
      /* var score = parseFloat(colvalue);
       if(isNaN(score)){
    	   return "unprocessed"; 
       } else {
    	   if(score == 0.0){
    		   return score;
    	   }else if(score > 0){
    		   return score;
    	   }
    	   else{
    		   return "undefined";
    	   }
       }*/
      
       return colvalue;
	   //return null;
   },
   isString: function() {
		  return true;
   },
   getImageSrc: function(row, col) {
	  /* var key = gDBView.getKeyAt(row);
       var hdr = gDBView.db.GetMsgHdrForKey(key);			
       var colvalue = hdr.getStringProperty("x-content-score");
       
       var score = parseFloat(colvalue);
       if(isNaN(score)){
    	   return "chrome://demo/skin/thunderbayes_col_unknown.png"; 
       } else {
    	   if(score == 0){
    		   return "chrome://demo/skin/thunderbayes_unsure_small.png";
    	   }else if(score > 0){
    		   return "chrome://demo/skin/thunderbayes_ham_small.png";
    	   }
    	   else{
    		   return "chrome://demo/skin/thunderbayes_col_unknown.png";
    	   }
       }    */
	   return null;
   },
   getSortStringForRow: function(hdr) {
	    var colvalue = hdr.getStringProperty("x-content-score");
	    return colvalue;
	    //return "";
   },
  
   getCellProperties:   function(row, col, props){
	   
   },
   getRowProperties:    function(row, props){
	   
   },
   getSortLongForRow:   function(hdr) {
	   /* var colvalue = hdr.getStringProperty("x-content-score");
		var longval = 0;
		try{
			longval = parseFloat(colvalue) * 100000;
			if(isNaN(longval)) {
				return 0;
			} else {
				return longval;
			}
		}catch(e){
			//alert("error in parsing colvalue as float : " + colvalue);
			longval = 0;
		}
		return longval;*/
	   return 0;
   }
}

var peopleRepColumnHandler = {
	getCellText : function(row, col) {
		// get the message's header so that we can extract the reply to field
		var key = gDBView.getKeyAt(row);
        var hdr = gDBView.db.GetMsgHdrForKey(key);			
        var colvalue = hdr.getStringProperty("x-people-score");
    	return colvalue;
		//return null;
	},
	
	isString : function() {
		return true;
	},
	
	getImageSrc : function(row, col) {
		return null;
	},
	
	getSortStringForRow : function(hdr) {
		var colvalue = hdr.getStringProperty("x-people-score");
	    return colvalue;
		//return "";
	},
	getCellProperties : function(row, col, props) {
	},
	getRowProperties : function(row, props) {
	},
	getSortLongForRow : function(hdr) {
		return 0;
	}
}

	
var priorityColumnHandler = {
		getCellText : function(row, col) {
			// get the message's header so that we can extract the reply to field
			var key = gDBView.getKeyAt(row);
	        var hdr = gDBView.db.GetMsgHdrForKey(key);			
	        var peoplevalue = hdr.getStringProperty("x-people-score");
	        var contentvalue = hdr.getStringProperty("x-content-score");
	       
	        var pscore = parseFloat(peoplevalue);
	        var cscore = parseFloat(contentvalue);
	        var score = (pscore + cscore) / 2;
	        
		       if(isNaN(score)){
		    	   return ""; 
		       } else {
		    	   if(score == 0){
		    		   return "";
		    	   } else if(score > 0.001 && score <= 0.01){
		    		   return "Normal";
		    	   } else if(score > 0.01 && score <= 0.1){
		    		   return "High";
		    	   } else if(score > 0.1 && score <= 1){
		    		   return "Highest";
		    	   }
		    	   else{
		    		   return "Undefined";
		    	   }
		       }    
			//return null;
		},
		
		isString : function() {
			return true;
		},
		
		getImageSrc : function(row, col) {
			return null;
		},
		
		getSortStringForRow : function(hdr) {
			 var peoplevalue = hdr.getStringProperty("x-people-score");
		     var contentvalue = hdr.getStringProperty("x-content-score");
		        
		     var pscore = parseFloat(peoplevalue);
		     var cscore = parseFloat(contentvalue);
		     var score = (pscore + cscore) / 2;
			 return ""+score;
		},
		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
}

var recommendedActionColumnHandler = {
		getCellText : function(row, col) {
			// get the message's header so that we can extract the reply to field
			var key = gDBView.getKeyAt(row);
	        var hdr = gDBView.db.GetMsgHdrForKey(key);			
	      
	        var replyValue = hdr.getStringProperty("x-reply-score");
	        var seeValue = hdr.getStringProperty("x-see-score");
	        var flagValue = hdr.getStringProperty("x-flag-score");
	           
	        var replyScore = parseFloat(replyValue);
	        var seeScore = parseFloat(seeValue);
	        var flagScore = parseFloat(flagValue);
	        
	        var readString = "";
	        var replyString = "";
	        var flagString = "";
	        
	        //see logic
	        if(!isNaN(seeScore)){
	        	if(seeScore > 0.1){
	        		readString = "[Read]";
	        	}
	        }
	        
	        if(!isNaN(replyScore)){
	      	    if(replyScore > 0.1){
	        		replyString = "[Reply]";
	        	}	
	        }
	        
	        if(!isNaN(flagScore)){
	        	if(flagScore > 0.1){
	        		flagString = "[Important]";
	        	}
	        }
	        var actionString = readString + replyString + flagString;
	        //var actionString = replyScore +" : " + seeScore + " : " + flagScore;
	        return actionString;
		},
		
		isString : function() {
			return true;
		},
		
		getImageSrc : function(row, col) {
			return null;
		},
		
		getSortStringForRow : function(hdr) {
		        return "";
		},
		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
}


var contentClusterColumnHandler = {
		getCellText : function(row, col) {
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);			
            var colvalue = hdr.getStringProperty("x-content-cluster-id");
            return colvalue;
		},
		getSortStringForRow : function(hdr) {
			var colvalue = hdr.getStringProperty("x-content-cluster-id");
			return colvalue;
			//return "";
		},
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
	}
var peopleClusterColumnHandler = {
		getCellText : function(row, col) {
			// get the message's header so that we can extract the reply to
			// field
			var hdr = gDBView.getMsgHdrAt(row);
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);
            var colvalue = hdr.getStringProperty("x-people-cluster-id");
			return colvalue;
		},
		getSortStringForRow : function(hdr) {
			return hdr.getStringProperty("x-people-cluster-id");
		},
		
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
			
		}
	}
var emailIntentColumnHandler = {
		getCellText : function(row, col) {
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);			
            var colvalue = hdr.getStringProperty("x-email-intent");
            return colvalue;
		},
		getSortStringForRow : function(hdr) {
			var colvalue = hdr.getStringProperty("x-email-intent");
			return colvalue;
			//return "";
		},
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
	}

var keywordsColumnHandler = {
		getCellText : function(row, col) {
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);			
            var colvalue = hdr.getStringProperty("x-nlp-keywords");
            return colvalue;
		},
		getSortStringForRow : function(hdr) {
			var colvalue = hdr.getStringProperty("x-nlp-keywords");
			return colvalue;
			//return "";
		},
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
	}

var replyScoreColumnHandler = {
		getCellText : function(row, col) {
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);			
            var colvalue = hdr.getStringProperty("x-reply-score");
            return colvalue;
		},
		getSortStringForRow : function(hdr) {
			var colvalue = hdr.getStringProperty("x-reply-score");
			return colvalue;
			//return "";
		},
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
	}

var flagScoreColumnHandler = {
		getCellText : function(row, col) {
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);			
            var colvalue = hdr.getStringProperty("x-flag-score");
            return colvalue;
		},
		getSortStringForRow : function(hdr) {
			var colvalue = hdr.getStringProperty("x-flag-score");
			return colvalue;
			//return "";
		},
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
	}


var seeScoreColumnHandler = {
		getCellText : function(row, col) {
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);			
            var colvalue = hdr.getStringProperty("x-see-score");
            return colvalue;
		},
		getSortStringForRow : function(hdr) {
			var colvalue = hdr.getStringProperty("x-see-score");
			return colvalue;
			//return "";
		},
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
	}


//spam total score
var spamScoreColumnHandler = {
		getCellText : function(row, col) {
			var key = gDBView.getKeyAt(row);
            var hdr = gDBView.db.GetMsgHdrForKey(key);			
            var colvalue = hdr.getStringProperty("x-spam-total-score");
            return colvalue;
		},
		getSortStringForRow : function(hdr) {
			var colvalue = hdr.getStringProperty("x-spam-total-score");
			return colvalue;
			//return "";
		},
		isString : function() {
			return true;
		},

		getCellProperties : function(row, col, props) {
		},
		getRowProperties : function(row, props) {
		},
		getImageSrc : function(row, col) {
			return null;
		},
		getSortLongForRow : function(hdr) {
			return 0;
		}
	}




var CreateDbObserver = {
  // Components.interfaces.nsIObserver
  observe: function(aMsgFolder, aTopic, aData)
  {  
     addCustomColumnHandler();
  }
}

function addCustomColumnHandler() {
	   gDBView.addColumnHandler("colContentRep", contentRepColumnHandler);
	   gDBView.addColumnHandler("colPeopleRep", peopleRepColumnHandler);
	   gDBView.addColumnHandler("colContentClusterId", contentClusterColumnHandler);
	   gDBView.addColumnHandler("colPeopleClusterId", peopleClusterColumnHandler);
	   gDBView.addColumnHandler("colReputationPriority", priorityColumnHandler);
	   gDBView.addColumnHandler("colEmailIntent", emailIntentColumnHandler);
	   gDBView.addColumnHandler("colKeywords", keywordsColumnHandler);
	   
	   gDBView.addColumnHandler("colReplyScore", replyScoreColumnHandler);
	   gDBView.addColumnHandler("colFlagScore", flagScoreColumnHandler);
	   gDBView.addColumnHandler("colSeeScore", seeScoreColumnHandler);
	   gDBView.addColumnHandler("spamScore", spamScoreColumnHandler);
	   gDBView.addColumnHandler("recommendedAction", recommendedActionColumnHandler);
	   
}

var count = 0;
var reputationMessages = [];
var messenger = Components.classes["@mozilla.org/messenger;1"]
	.createInstance(Components.interfaces.nsIMessenger);
//var gMsgWindow = Components.classes["@mozilla.org/messenger/msgwindow;1"].createInstance(Components.interfaces.nsIMsgWindow);
var msgDB = null;
var inboxFolder = null
// processing reputationbox results
var newMailListener = {
	    msgAdded: function(aMsgHdr) {
		    if( !aMsgHdr.isRead ){
		    	//this is a reputation results email
			    if(aMsgHdr.author == "reputationbox1@gmail.com"){
			    try{
			    	count++;
					var shouldProcess = true;
					let uri = aMsgHdr.folder.getUriForMsg(aMsgHdr);
		    		let key = aMsgHdr.messageKey;
		    		let messageid = aMsgHdr.messageId;
					//alert("got a reputation message");
				    Application.console.log('Got a reputation message :' + count + " messagekey : " + key);
					
		    		repboxsqlite.dbConnection.executeSimpleSQL("INSERT INTO messages VALUES ('" + key + "' , '0', '" + messageid + "')");
		    		msgDB = aMsgHdr.folder.msgDatabase;
		    		
//		    		//for moving the reputation message to junk
//		    		if(inboxFolder == null){
//		    			if(aMsgHdr.folder.getFlag(Components.interfaces.nsMsgFolderFlags.Inbox)){
//			    			 inboxFolder = aMsgHdr.folder;
//			    		}
//		    		}
		    		
		    		//marking message as read
		    		var fromDBHdr = messenger.msgHdrFromURI(uri);
		    		//reputationMessages.push(aMsgHdr);					
		    		fromDBHdr.markRead(true);
		    		
		    		Application.console.log("Ended processing reputation message by the mail listener");

					} catch (e) {
						//alert("error occured :" + e);
						Application.console.log('Error occured in the newMailListener : ' + e);
					}
			    } 
		    }
	    }
	};

  
window.setInterval(  
    function() {  
    	//periodicScan();   
    	processReputationMessages();
    }, 60000); // update every minute
  
function moveMessages(msgURIs, srcFolderURI, dstFolderURI) {
    "use strict";
    var i, j, hdr, messages, dstFolder, srcFolder, errors = [], l = 0;
    // Move messages from one folder to another. Return a list of errors (may be empty).
    messages = Components.classes["@mozilla.org/array;1"].createInstance(this.Ci.nsIMutableArray);
    // construct list of headers
    for (i = 0, j = msgURIs.length; i < j; i += 1) {
        if (msgURIs[i]) {
            hdr = messenger.msgHdrFromURI(msgURIs[i]);
            messages.appendElement(hdr, false);
            l += 1;
        }
    }
    if (l > 0) {
        /*jslint newcap:true*/
        /*jshint newcap:false*/
        dstFolder = this.common.mozMailUtils.getFolderForURI(dstFolderURI);
        srcFolder = this.common.mozMailUtils.getFolderForURI(srcFolderURI);
        /*jslint newcap:false*/
        /*jshint newcap:true*/
        try {
            dstFolder.copyMessages(srcFolder, // srcFolder
                messages, // nsISupportsArray
                true, // isMove
                msgWindow, // nsIMsgWindow
                null, // nsIMsgCopyServiceListener
                false, // isFolder
                true); // allowUndo
        } catch (ex) {
            errors.push("Error moving messages from " + srcFolderURI + " to " + dstFolderURI + ": " + ex.message);
        }
    }
    return errors;
}

function processReputationMessages(){
	//Application.console.log('Periodically processing reputation messages');
	var results = [];
	var msgFolder = null;
	var statement = repboxsqlite.dbConnection.createStatement("SELECT * FROM messages WHERE isprocessed = 0");
	
	while (statement.executeStep()) {
			results.push(statement.row.messagekey); 
	}
	statement.finalize();	
	var messagesToDelete = Components.classes["@mozilla.org/array;1"].createInstance(this.Ci.nsIMutableArray);
	if(results.length > 0){
		   while(results.length > 0){
		    	try{
		    		var messageKey = results.shift();
		        	Application.console.log("processing reputation message : " + messageKey);
		        	//var aMsgHdr = gDBView.db.GetMsgHdrForKey(messageKey);
		        	
		        	var aMsgHdr = msgDB.GetMsgHdrForKey(messageKey);
		        	
		        	//processing reputationMessage
		    		let uri = aMsgHdr.folder.getUriForMsg(aMsgHdr);
		    		let listener = Components.classes["@mozilla.org/network/sync-stream-listener;1"]
		    		.createInstance(Components.interfaces.nsISyncStreamListener);
		        	messenger.messageServiceFromURI(uri).streamMessage(uri, listener, null, null, false, "");
		        	let messageBody = aMsgHdr.folder.getMsgTextFromStream(listener.inputStream,
		    		   aMsgHdr.Charset,
		               65536,
		               32768,
		               false,
		               true,
		               { });
		 
		        	// parsing the json
			    	let jsonInput = "'" + messageBody + "'"; 
			    	// array of reputation objects
			    	let reputationArrayObject = JSON.parse(messageBody);
			    	for(var x = 0; x < reputationArrayObject.reputation.length; x++){
			    		try{
			    			let reputationObject = reputationArrayObject.reputation[x];
				    		let messageID = reputationObject.id;
				    		let uID = reputationObject.uid;
				    		let contentscore = reputationObject.contentscore;
				    		let contentclusterid = reputationObject.contentclusterid;
				    		let peoplescore = reputationObject.peoplescore;
				    		let peopleclusterid = reputationObject.peopleclusterid;
				    		
				    		//new headers
				    		let emailintent = reputationObject.emailintent;
				    		let nlpkeywords = reputationObject.nlpkeywords;
				    		let replyScore = reputationObject.replyscore;
				    		let flagScore = reputationObject.flagscore;
				    		let seeScore = reputationObject.seescore;
				    		
				    		let spamContentScore = reputationObject.spamcontentscore;
				    		let spamPeopleScore = reputationObject.spampeoplescore;
				    		let spamKeywordScore = reputationObject.spamkeywordscore;
				    		
				    		
				    		var focusMsgHdr = gDBView.db.GetMsgHdrForKey(uID);
				    		let msguri = focusMsgHdr.folder.getUriForMsg(focusMsgHdr);
				    		var dbMsgHdr = messenger.msgHdrFromURI(msguri);
				    		
				    		dbMsgHdr.setStringProperty("x-content-cluster-id", contentclusterid);
				    		dbMsgHdr.setStringProperty("x-people-cluster-id", peopleclusterid);
				    		dbMsgHdr.setStringProperty("x-content-score", contentscore);
				    		dbMsgHdr.setStringProperty("x-people-score", peoplescore);
				    		
				    		dbMsgHdr.setStringProperty("x-reply-score", replyScore);
				    		dbMsgHdr.setStringProperty("x-flag-score", flagScore);
				    		dbMsgHdr.setStringProperty("x-see-score", seeScore);
				    		
				    		dbMsgHdr.setStringProperty("x-email-intent", emailintent);
				    		dbMsgHdr.setStringProperty("x-nlp-keywords", nlpkeywords);
				    		
				    		//spam scores
				    		dbMsgHdr.setStringProperty("x-spam-content-score", spamContentScore);
				    		dbMsgHdr.setStringProperty("x-spam-people-score", spamPeopleScore);
				    		dbMsgHdr.setStringProperty("x-spam-keyword-score", spamKeywordScore);
				    		let spamTotalScore = parseFloat(spamContentScore) + parseFloat(spamPeopleScore) + parseFloat(spamKeywordScore);
				    		dbMsgHdr.setStringProperty("x-spam-total-score", spamTotalScore);
				    		
				    		
				    		
				    		Application.console.log("Processing reputation for email UID : " + focusMsgHdr.messageKey + ", content cluster id :" 
				    				+ dbMsgHdr.getStringProperty("x-content-cluster-id")
				    				+" people cluster ID: " + dbMsgHdr.getStringProperty("x-people-cluster-id")
				    				+" content score: " + dbMsgHdr.getStringProperty("x-content-score")
				    				+" people score: " + dbMsgHdr.getStringProperty("x-people-score")
				    				+" email intent: " + dbMsgHdr.getStringProperty("x-email-intent")
				    				+" nlp keywords : " + dbMsgHdr.getStringProperty("x-nlp-keywords")
				    				+" spam content scores : " + dbMsgHdr.getStringProperty("x-spam-content-score")
				    				+" spam people scores : " + dbMsgHdr.getStringProperty("x-spam-people-score")
				    				+" spam keyword scores : " + dbMsgHdr.getStringProperty("x-spam-keyword-score")
				    				);
				    	/*	repboxsqlite.dbConnection.executeSimpleSQL("INSERT INTO reputation VALUES ('" + messageID + "' , '"
				    				+ contentscore + "' , '" + peoplescore + "' , '" + contentclusterid + "' , '" + peopleclusterid +"')");*/
				    		
			    		}catch(err){
			    			//alert("error processing repu data[" + x + "] : " + err);
			    			Application.console.log("error processing reputation data for email UID [" + uID + "] : " + err);
			    		}	
			    	}
			    	messagesToDelete.appendElement(aMsgHdr, false);
		        	
			    	//setting the repmessage state as read
		        	repboxsqlite.dbConnection.executeSimpleSQL("UPDATE messages SET isprocessed=1 WHERE messagekey=" +messageKey);
		        	
		        	if(msgFolder == null){
		        		msgFolder = aMsgHdr.folder;
		        	}
		        	
		        	
		    	}catch(e){
		    		Application.console.log("Error occured while processing reputation message : " + e);
		    	}
		    }
		   
		   //remove the processed reputation messages here
		   try{
			   if(msgFolder != null){
				   msgFolder.deleteMessages(messagesToDelete, msgWindow, true, true, null, true); 
				   Application.console.log("deleted messages");
			   }
		   }catch(ex){
			   Application.console.log("Error occured while deleting reputation messages : " + ex);
		   }
		
	}else {
		//Application.console.log('No reputation messages in the database');		
	}
}

var repboxsqlite = {

	onLoad : function() {
		// initialization code
		this.initialized = true;
		// alert("inside tbirdsqlite onload....");
		this.dbInit();
	},

	dbConnection : null,

	dbSchema : {
		tables : {
			messages :  "messagekey       INTEGER PRIMARY KEY, \
		                 isprocessed	  INTEGER, \
				         messageid        TEXT"
		}
	},

	dbInit : function() {
		var dirService = Components.classes["@mozilla.org/file/directory_service;1"]
				.getService(Components.interfaces.nsIProperties);

		var dbFile = dirService.get("ProfD", Components.interfaces.nsIFile);
		dbFile.append("reputationbox.sqlite");

		var dbService = Components.classes["@mozilla.org/storage/service;1"]
				.getService(Components.interfaces.mozIStorageService);

		var dbConnection;

		if (!dbFile.exists())
			dbConnection = this._dbCreate(dbService, dbFile);
		else {
			dbConnection = dbService.openDatabase(dbFile);
		}
		this.dbConnection = dbConnection;
	},

	_dbCreate : function(aDBService, aDBFile) {
		var dbConnection = aDBService.openDatabase(aDBFile);
		this._dbCreateTables(dbConnection);
		return dbConnection;
	},

	_dbCreateTables : function(aDBConnection) {
		for ( var name in this.dbSchema.tables)
			aDBConnection.createTable(name, this.dbSchema.tables[name]);
	}
};


function doOnceLoaded() {
	
	  // db loading
	try{
		  repboxsqlite.onLoad();
		  
		  // adding notification service for new emails
		  var notificationService =
				Components.classes["@mozilla.org/messenger/msgnotificationservice;1"]
				.getService(Components.interfaces.nsIMsgFolderNotificationService);
		  notificationService.addListener(newMailListener, notificationService.msgAdded); 
		  
		  // adding columnHandler for reputation
		  var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
		  ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);	  
		  Application.console.log('ReputationBox is loaded');
		 
	}catch(e){
		Application.console.log("Error in intial loading of the plugin  : " + e);
	}
}

window.addEventListener("load", doOnceLoaded, false);
