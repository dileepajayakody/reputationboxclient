var Application = Components.classes["@mozilla.org/steel/application;1"].getService(Components.interfaces.steelIApplication);

//sending msgKey and whether important or unimportant
var directReadThreshold = 0.3;
var directReplyThreshold = 0.3;
var listReadThreshold = 0.3;
var listReplyThreshold = 0.3;


var importantEmailHandler = {
		sendImportantRequest : function(){
		try{
			//need to get the selected message key and whether its an important email	
			var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
			//getting the selected row's msgKey
			var msgKey = gDBView.keyForFirstSelectedMessage;
			alert('sending mark Important message key:' + msgKey);
			req.open('POST', "http://localhost:8080/restful/services/EmailService/actions/markMailImportant/invoke?long="+msgKey, false, "sven", "pass");
			//req.open('POST', "http://localhost:8080/restful/services/EmailService/actions/getReputationForEmail/invoke?long="+msgKey, true, "sven", "pass");
			//req.send('{"string": {"value":"hello"}}');
//			req.onreadystatechange = function (aEvt) {
//			    if (req.readyState == 4) {
//			        if(req.status == 200){
//			        	Application.console.log("Got response for request: " + req.responseText);
//			            // since the element is an HTML element, you can use HTML DOM methods
//			            //document.getElementById("container").innerHTML = req.responseText;
//			        }else{
//			        	Application.console.log("Got error response for request : " + req.responseText); 
//			        }    
//			    }
//			 };
			req.send(null);
			//var status = req.statusText;
			//var responseText = req.responseText;
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
	        var isList = hdr.getStringProperty("x-is-list");
	           
	        var replyScore = parseFloat(replyValue);
	        var seeScore = parseFloat(seeValue);
	        var flagScore = parseFloat(flagValue);
	        
	        var readString = "";
	        var replyString = "";
	        var flagString = "";
	        
	        //list emails logic
	        if(isList == "1"){
	        	 if(!isNaN(seeScore)){
		 	        	if(seeScore > listReadThreshold){
		 	        		readString = "[Read]";
		 	        	}
		 	        }
		 	        
		 	        if(!isNaN(replyScore)){
		 	      	    if(replyScore > listReplyThreshold){
		 	      	    	readString = "";
		 	        		replyString = "[Reply]";
		 	        	}	
		 	        }
		 	        
		 	        if(!isNaN(flagScore)){
		 	        	if(flagScore > 0.4){
		 	        		flagString = "[Important]";
		 	        	}
		 	        }
	        }else{
	        	//direct emails
	        	 if(!isNaN(seeScore)){
	 	        	if(seeScore > directReadThreshold){
	 	        		readString = "[Read]";
	 	        	}
	 	        }
	 	        
	 	        if(!isNaN(replyScore)){
	 	      	    if(replyScore > directReplyThreshold){
	 	      	    	readString = "";
	 	        		replyString = "[Reply]";
	 	        	}	
	 	        }
	 	        
	 	        if(!isNaN(flagScore)){
	 	        	if(flagScore > 0.4){
	 	        		flagString = "[Important]";
	 	        	}
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

//
var recommendedImageColumnHandler = {
		getCellText : function(row, col) {
		   return null;
		},
		
		isString : function() {
			return false;
		},
		
		getImageSrc : function(row, col) {
			// get the message's header so that we can extract the reply to field
			var key = gDBView.getKeyAt(row);
	        var hdr = gDBView.db.GetMsgHdrForKey(key);			
	      
	        var replyValue = hdr.getStringProperty("x-reply-score");
	        var seeValue = hdr.getStringProperty("x-see-score");
	        var flagValue = hdr.getStringProperty("x-flag-score");
	        var isList = hdr.getStringProperty("x-is-list");
	           
	        var replyScore = parseFloat(replyValue);
	        var seeScore = parseFloat(seeValue);
	        var flagScore = parseFloat(flagValue);
	        
	        var readString = "";
	        var replyString = "";
	        var flagString = "";
	        var from = hdr.author;
	        
	        //list emails logic
	        if(isList == "1"){
	        	 if(!isNaN(seeScore)){
		 	        	if(seeScore > listReadThreshold){
		 	        		 return "chrome://demo/skin/important.png"; 
		 	        	}
		 	        }
	        }else{
	        	//direct emails
	        	 if(!isNaN(seeScore)){
	 	        	if(seeScore > directReadThreshold){
	 	        		var imgSrc = "chrome://demo/skin/important.png";
	 	        		if(!from.contains('noreply') && !from.contains('info') && !from.contains('newsletter') && !from.contains('no-reply') && !from.contains('job-listing')){
	 	        			//check for requests, meetings, proposals in the email intent string
	 	        			var emailIntentString = hdr.getStringProperty("x-email-intent");
	 	        			if(emailIntentString.contains('request') | emailIntentString.contains('delivery')){
	 	        				imgSrc = "chrome://demo/skin/reply.png";
	 	        			}
	 	        		}
	 	        		return imgSrc;
	 	        	}
	 	        }
	 	        
	 	        if(!isNaN(replyScore)){
	 	      	    if(replyScore > directReplyThreshold){
	 	      	    	var imgSrc = "chrome://demo/skin/important.png";
	 	      	    	if(!from.contains('noreply') && !from.contains('info') && !from.contains('newsletter') && !from.contains('no-reply') && !from.contains('job-listing')){
	 	        			//check for requests, meetings, proposals in the email intent string
	 	        			var emailIntentString = hdr.getStringProperty("x-email-intent");
	 	        			if(emailIntentString.contains('request') | emailIntentString.contains('delivery')){
	 	        				imgSrc = "chrome://demo/skin/reply.png";
	 	        			}
	 	        		}
	 	        		return imgSrc;
	 	        	}	
	 	        }
//	 	        
//	 	        if(!isNaN(flagScore)){
//	 	        	if(flagScore > 0.4){
//	 	        		flagString = "[Important]";
//	 	        	}
//	 	        }
	        }

	        return null;
		},
		
		getSortStringForRow : function(hdr) {
			var seeScore = hdr.getStringProperty("x-see-score");  
			return seeScore;
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
	   //gDBView.addColumnHandler("colReputationPriority", priorityColumnHandler);
	   gDBView.addColumnHandler("colEmailIntent", emailIntentColumnHandler);
	   //gDBView.addColumnHandler("colKeywords", keywordsColumnHandler);
	   
	   gDBView.addColumnHandler("colReplyScore", replyScoreColumnHandler);
	   gDBView.addColumnHandler("colFlagScore", flagScoreColumnHandler);
	   gDBView.addColumnHandler("colSeeScore", seeScoreColumnHandler);
	   //gDBView.addColumnHandler("spamScore", spamScoreColumnHandler);
	   gDBView.addColumnHandler("recommendedAction", recommendedImageColumnHandler);
	   
}

var count = 0;
var newMailCount = 1;
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
//			    try{
//			    	count++;
//					var shouldProcess = true;
//					let uri = aMsgHdr.folder.getUriForMsg(aMsgHdr);
//		    		let key = aMsgHdr.messageKey;
//		    		let messageid = aMsgHdr.messageId;
//					//alert("got a reputation message");
//				    Application.console.log('Got a reputation message :' + count + " messagekey : " + key);
//					
//		    		repboxsqlite.dbConnection.executeSimpleSQL("INSERT INTO messages VALUES ('" + key + "' , '0', '" + messageid + "')");
//		    		msgDB = aMsgHdr.folder.msgDatabase;
//		    		
////		    		//for moving the reputation message to junk
////		    		if(inboxFolder == null){
////		    			if(aMsgHdr.folder.getFlag(Components.interfaces.nsMsgFolderFlags.Inbox)){
////			    			 inboxFolder = aMsgHdr.folder;
////			    		}
////		    		}
//		    		
//		    		//marking message as read
//		    		var fromDBHdr = messenger.msgHdrFromURI(uri);
//		    		//reputationMessages.push(aMsgHdr);					
//		    		fromDBHdr.markRead(true);
//		    		
//		    		Application.console.log("Ended processing reputation message by the mail listener");
//
//					} catch (e) {
//						//alert("error occured :" + e);
//						Application.console.log('Error occured while inserting repumsg keys to db in the newMailListener : ' + e);
//					}
			    } else{
			    	//other new emails
			    	try{
			    		newMailCount++;
				    	let uri = aMsgHdr.folder.getUriForMsg(aMsgHdr);
			    		let key = aMsgHdr.messageKey;
			    		//let messageid = aMsgHdr.messageId;
						//alert("got a reputation message");
					    Application.console.log('Got a new message :' + newMailCount + " messagekey : " + key);		
			    		repboxsqlite.dbConnection.executeSimpleSQL("INSERT INTO messages VALUES ('" + key + "' , '0', '0')");
			    		msgDB = aMsgHdr.folder.msgDatabase;
			    			
			    	}catch(e){
			    		Application.console.log('Error occured while processing new email in the newMailListener : ' + e);
			    	}

			    	
			    }
		    }
	    }
	};
  
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


function getPredictions(){
	Application.console.log('getPredictions method is called to retrieve predicted email results');	

	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
	req.open('POST', "http://localhost:8080/restful/services/EmailService/actions/receivePredictedEmails/invoke", true, "sven", "pass");
	req.onreadystatechange = function (aEvt) {
		//req.onload = function (aEvt) {
		    if (req.readyState == 4) {
		        if(req.status == 200){
		        	
		        try{
		        	let responseBody = req.responseText;
		        	Application.console.log("Got response for getPredictions request: " + responseBody);
		        	//process the response
		        	// parsing the json
			    	let jsonInput = responseBody; 
			    	let rootObject = JSON.parse(jsonInput);
			    	let resultObject = rootObject.result;
			    	Application.console.log("Parsed result Object string: " + resultObject);
			    	let valueObject = resultObject.value;
			    	
			    	// array of reputation objects
			    	//let reputationArrayObject = JSON.parse(responseBody);
			    	let reputationArrayObject = JSON.parse(valueObject);
			    	
			    	for(var x = 0; x < reputationArrayObject.reputation.length; x++){
			    		try{
			    			let reputationObject = reputationArrayObject.reputation[x];
			    			let uID = reputationObject.uid;
			    			let isPredicted = reputationObject.is_predicted;
			    			
			    				//let messageID = reputationObject.id;
					    		let isListMail = reputationObject.is_list;
					    		let contentscore = reputationObject.contentscore;
					    		let contentclusterid = reputationObject.contentclusterid;
					    		let peoplescore = reputationObject.peoplescore;
					    		let peopleclusterid = reputationObject.peopleclusterid;
					    		
					    		//new headers
					    		let emailintent = reputationObject.emailintent;
					    		//let nlpkeywords = reputationObject.nlpkeywords;
					    		let replyScore = reputationObject.replyscore;
					    		let flagScore = reputationObject.flagscore;
					    		let seeScore = reputationObject.seescore;
						    		
					    		var focusMsgHdr = gDBView.db.GetMsgHdrForKey(uID);
					    		let msguri = focusMsgHdr.folder.getUriForMsg(focusMsgHdr);
					    		var dbMsgHdr = messenger.msgHdrFromURI(msguri);
					    		
					    		//cluster based results
					    		dbMsgHdr.setStringProperty("x-content-cluster-id", contentclusterid);
					    		dbMsgHdr.setStringProperty("x-is-list", isListMail);	    		
					    		dbMsgHdr.setStringProperty("x-people-cluster-id", peopleclusterid);
					    		dbMsgHdr.setStringProperty("x-content-score", contentscore);
					    		dbMsgHdr.setStringProperty("x-people-score", peoplescore);
					    		
					    		//profile/ combined profile based results
					    		dbMsgHdr.setStringProperty("x-reply-score", replyScore);
					    		dbMsgHdr.setStringProperty("x-flag-score", flagScore);
					    		dbMsgHdr.setStringProperty("x-see-score", seeScore);
					    		
					    		dbMsgHdr.setStringProperty("x-email-intent", emailintent);
					    		 		
					    		Application.console.log("Processing predicted reputation for email UID : " + focusMsgHdr.messageKey + ", content cluster id :" 
					    				+ dbMsgHdr.getStringProperty("x-content-cluster-id")
					    				+" people cluster ID: " + dbMsgHdr.getStringProperty("x-people-cluster-id")
					    				+" content score: " + dbMsgHdr.getStringProperty("x-content-score")
					    				+" people score: " + dbMsgHdr.getStringProperty("x-people-score")
					    				+" email intent: " + dbMsgHdr.getStringProperty("x-email-intent")
					    				);		
				    	
			    		}catch(err){
			    			Application.console.log("error processing reputation data for email UID [" + uID + "] : " + err);
			    		}	
			    	}
		          }catch(err){
		    		Application.console.log("Error processing root result json " + err);
		    	  }
		       }else{
		       	Application.console.log("Got error response for msgkey request : " + req.responseText); 
		       }    
		    }
		 };
		req.send(null);
	
}

//getting the rep.data from backend
function getReputationForEmails(){
	
	Application.console.log('getReputationForEmails method is called');	
	var results = [];
	var msgFolder = null;
	var statement = repboxsqlite.dbConnection.createStatement("SELECT * FROM messages WHERE isprocessed = 0");
	var msgKeyString = "";
	
	while (statement.executeStep()) {
		    let msgKey = statement.row.messagekey;
			results.push(msgKey);		
			//msgKeyString += "M"+msgKey;
	}
	
	var msgLimit = 20;
	//only add 20mailkeys per request
	if(results.length < 20){
		msgLimit = results.length;
	}
	var i = 0;
	for(i = 0; i < msgLimit; i++){
		msgKeyString += "M"+results[i];
	}
	
	statement.finalize();	
	if(msgKeyString.length > 1){
		Application.console.log('There are new emails arrived. the query string : ' + msgKeyString);	
		
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
		req.open('POST', "http://localhost:8080/restful/services/EmailService/actions/getReputationForMessages/invoke?string="+msgKeyString, true, "sven", "pass");
		//req.open('POST', "http://localhost:8080/restful/services/EmailService/actions/getReputationForMessages/invoke?string=M165320M165321M165322", true, "sven", "pass");
		
		req.onreadystatechange = function (aEvt) {
		//req.onload = function (aEvt) {
		    if (req.readyState == 4) {
		        if(req.status == 200){
		        	
		        try{
		        	let responseBody = req.responseText;
		        	Application.console.log("Got response for msgkey request: " + responseBody);
		        	//process the response
		        	// parsing the json
			    	let jsonInput = responseBody; 
			    	
			    	let rootObject = JSON.parse(jsonInput);
			    	let resultObject = rootObject.result;
			    	Application.console.log("Parsed result Object string: " + resultObject);
			    	let valueObject = resultObject.value;
			    	//Application.console.log("Parsed value Object : " + valueObject);
		        	
			    	
			    	// array of reputation objects
			    	//let reputationArrayObject = JSON.parse(responseBody);
			    	let reputationArrayObject = JSON.parse(valueObject);
			    	
			    	for(var x = 0; x < reputationArrayObject.reputation.length; x++){
			    		try{
			    			let reputationObject = reputationArrayObject.reputation[x];
			    			let uID = reputationObject.uid;
			    			let isPredicted = reputationObject.is_predicted;
			    			if(isPredicted == 1){
			    				//let messageID = reputationObject.id;
					    		let isListMail = reputationObject.is_list;
					    		let contentscore = reputationObject.contentscore;
					    		let contentclusterid = reputationObject.contentclusterid;
					    		let peoplescore = reputationObject.peoplescore;
					    		let peopleclusterid = reputationObject.peopleclusterid;
					    		
					    		//new headers
					    		let emailintent = reputationObject.emailintent;
					    		//let nlpkeywords = reputationObject.nlpkeywords;
					    		let replyScore = reputationObject.replyscore;
					    		let flagScore = reputationObject.flagscore;
					    		let seeScore = reputationObject.seescore;
					    		
					    		//let spamContentScore = reputationObject.spamcontentscore;
					    		//let spamPeopleScore = reputationObject.spampeoplescore;
					    		//let spamKeywordScore = reputationObject.spamkeywordscore;
					    		
					    		
					    		var focusMsgHdr = gDBView.db.GetMsgHdrForKey(uID);
					    		let msguri = focusMsgHdr.folder.getUriForMsg(focusMsgHdr);
					    		var dbMsgHdr = messenger.msgHdrFromURI(msguri);
					    		
					    		dbMsgHdr.setStringProperty("x-content-cluster-id", contentclusterid);
					    		dbMsgHdr.setStringProperty("x-is-list", isListMail);
					    		
					    		dbMsgHdr.setStringProperty("x-people-cluster-id", peopleclusterid);
					    		dbMsgHdr.setStringProperty("x-content-score", contentscore);
					    		dbMsgHdr.setStringProperty("x-people-score", peoplescore);
					    		
					    		dbMsgHdr.setStringProperty("x-reply-score", replyScore);
					    		dbMsgHdr.setStringProperty("x-flag-score", flagScore);
					    		dbMsgHdr.setStringProperty("x-see-score", seeScore);
					    		
					    		dbMsgHdr.setStringProperty("x-email-intent", emailintent);
					    		//dbMsgHdr.setStringProperty("x-nlp-keywords", nlpkeywords);
					    		
					    		//spam scores
					    		//dbMsgHdr.setStringProperty("x-spam-content-score", spamContentScore);
					    		//dbMsgHdr.setStringProperty("x-spam-people-score", spamPeopleScore);
					    		//dbMsgHdr.setStringProperty("x-spam-keyword-score", spamKeywordScore);
					    		//let spamTotalScore = parseFloat(spamContentScore) + parseFloat(spamPeopleScore) + parseFloat(spamKeywordScore);
					    		//dbMsgHdr.setStringProperty("x-spam-total-score", spamTotalScore);
					    		
					    		
					    		
					    		Application.console.log("Processing predicted reputation for email UID : " + focusMsgHdr.messageKey + ", content cluster id :" 
					    				+ dbMsgHdr.getStringProperty("x-content-cluster-id")
					    				+" people cluster ID: " + dbMsgHdr.getStringProperty("x-people-cluster-id")
					    				+" content score: " + dbMsgHdr.getStringProperty("x-content-score")
					    				+" people score: " + dbMsgHdr.getStringProperty("x-people-score")
					    				+" email intent: " + dbMsgHdr.getStringProperty("x-email-intent")
					    				//+" nlp keywords : " + dbMsgHdr.getStringProperty("x-nlp-keywords")
					    				//+" spam content scores : " + dbMsgHdr.getStringProperty("x-spam-content-score")
					    				//+" spam people scores : " + dbMsgHdr.getStringProperty("x-spam-people-score")
					    				//+" spam keyword scores : " + dbMsgHdr.getStringProperty("x-spam-keyword-score")
					    				);
			    			}else{
			    				//message is not a predicted message
			    				
			    			}    		
				    		//setting the repmessage state as read
				        	repboxsqlite.dbConnection.executeSimpleSQL("UPDATE messages SET isprocessed=1,ispredicted="+isPredicted+" WHERE messagekey=" + uID);
				        	
			    		}catch(err){
			    			Application.console.log("error processing reputation data for email UID [" + uID + "] : " + err);
			    		}	
			    	}
		          }catch(err){
		    		Application.console.log("Error processing root result json " + err);
		    	  }
		       }else{
		       	Application.console.log("Got error response for msgkey request : " + req.responseText); 
		       }    
		    }
		 };
		req.send(null);
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
				         ispredicted      INTEGER" 	         
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


var ValueHandler = {
		changeDirectReadVal : function(value){
			directReadThreshold = value;
			Application.console.log('direct read value changed = ' + directReadThreshold);
			
		},
		changeDirectReplyVal : function(value){
			directReplyThreshold = value;
			Application.console.log('direct reply value changed = ' + directReplyThreshold);	
		},
		changeListReadVal : function(value){
			listReadThreshold = value;
			Application.console.log('list read value changed = ' + listReadThreshold);	
		},
		changeListReplyVal : function(value){
			listReplyThreshold = value;
			Application.console.log('list reply value changed = ' + listReplyThreshold);	
		}
}

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
		  Application.console.log('ReputationBox is loaded with database');
		 
	}catch(e){
		Application.console.log("Error in intial loading of the plugin  : " + e);
	}
}

function newLoadFunc(){
	var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);	  	  
    Application.console.log('ReputationBox is loaded..');
}
window.addEventListener("load", newLoadFunc, false);
window.setInterval(  
	    function() {  
	    	//processReputationMessages();
	    	//getReputationForEmails();
	    	getPredictions();
	    }, 120000); // update every 2 minutes
	  
