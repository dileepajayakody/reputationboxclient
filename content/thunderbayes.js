/*
 ThunderBayes++ is licensed under the terms of the MIT License.
 Copyright (C) 2010 Arnaud Dovi <ad@heapoverflow.com>

 The original code is ThunderBayes.
 ThunderBayes is licensed under the terms of the MIT License.
 Copyright (C) 2006 Daniel Miller <millerdev@gmail.com>

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the "Software"), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 of the Software, and to permit persons to whom the Software is furnished to do
 so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
/*globals ThunderbayesExceptions,ThunderbayesCommon,ThunderbayesCommand,Components,nsMsgStatusFeedback,
 gFolderDisplay,messenger,MailUtils,msgWindow,top,gDBView,
 nsMsgViewCommandType,MailOfflineMgr,loadStartFolder:true*/
//noinspection JSUnusedLocalSymbols,JSUnusedGlobalSymbols
try {
    /**
     * This class handles all the core principal functions of the plugin
     *
     * @type {Object}
     */
    var ThunderbayesMain = {
        'Ci': Components.interfaces,
        'Cc': Components.classes,
        'Cu': Components.utils,
        'common': ThunderbayesCommon,
        'prefs': ThunderbayesCommon.prefs,
        'exception': ThunderbayesExceptions,
        sendFatal: function (flag) {
            "use strict";
            if (this.prefs.isDeveloperMode()) {
                try {
                    var j, p;
                    if (flag === 0) {
                        /*jslint undef:true*/
                        /*jshint latedef:false*/
                        /*jshint undef:false*/
                        j = jacobly;
                        return;
                    }
                    //noinspection JSUnusedAssignment
                    p = this.init(o);
                } catch (e) {
                    /**
                     * Unhandled exception handler for XUL element calls
                     */
                    this.exception.handleError(e);
                }
            }
        },
        /**
         * Class entry point
         */
        init: function () {
            "use strict";
            if (this.isInitialized === undefined) {
                this.isInitialized = true;
                /* sub-classes */
                this.command = ThunderbayesCommand;
                this.controller = new this.Controller(this);
                this.searchsessions = new this.SearchSessions(this);
                this.dbobserver = new this.DbObserver(this);
                this.offlineobserver = new this.OfflineObserver(this);
                this.colhandler = new this.SpamProbabilityColumnHandler(this);
                this.colhandler2 = new this.SpamStatusColumnHandler(this);
                var thunderbirdVersion, self = this, realLoadStartFolder = loadStartFolder, thunderbirdVersionInteger = 1;
                //noinspection JSUndeclaredVariable
                loadStartFolder = function () {
                    try {
                        //noinspection JSUndeclaredVariable
                        loadStartFolder = realLoadStartFolder;
                        realLoadStartFolder();
                        var prefs, prefsvc = self.Cc["@mozilla.org/preferences-service;1"].getService(self.Ci.nsIPrefService);
                        prefs = prefsvc.getBranch("extensions.thunderbayes.");
                        if (!prefs.prefHasUserValue("CurrentVersion") || prefs.getCharPref("CurrentVersion") !== self.common.extensionVersion) {
                            self.common.openTab("chrome://thunderbayes/content/firstrun.xul");
                            prefs.setCharPref("CurrentVersion", self.common.extensionVersion === undefined ? "" : self.common.extensionVersion);
                        }
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                };
                window.addEventListener("load", function () {
                    try {
                        self.onLoad();
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                }, false);
                window.addEventListener("unload", function () {
                    try {
                        self.onUnload();
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                }, false);
                this.registerCustomHeaders();
                // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
                // Custom column handlers
                thunderbirdVersion = this.Cc["@mozilla.org/xre/app-info;1"].getService(this.Ci.nsIXULAppInfo).version.substring(0, 3);
                try {
                    thunderbirdVersionInteger = parseInt(thunderbirdVersion, 10);
                } catch (ex) {
                    this.common.alert("Unsupported version string: " + thunderbirdVersion + "\n");
                }
                if (thunderbirdVersionInteger < 2) {
                    this.isThunderbirdOnline = this.isThunderbirdOnlineOldMethod;
                    // hide custom columns in pre-2.0 environment
                    //dump("hiding custom columns (not supported in this version of Thunderbird)\n");
                    // I don't know why this works, but just getting this element seems
                    // to prevent the columns from loading...scary!
                    document.getElementById("threadTree");
                } else {
                    //noinspection JSDuplicatedDeclaration
                    this.isThunderbirdOnline = this.isThunderbirdOnlineNewMethod;
                    // setup column handlers
                    window.addEventListener("load", function () {
                        try {
                            self.onceLoaded();
                        } catch (e) {
                            /**
                             * Unhandled exception handler for anonymous methods
                             */
                            self.exception.handleError(e);
                        }
                    }, false);
                }
            }
        },
        /**
         * Handles the onLoad event of the thunderbayes.xul overlay
         */
        onLoad: function () {
            "use strict";
            if (!this.loaded) {
                try {
                    if (this.common.isThunderbird3) {
                        /*If Thunderbird 3.x then don't provide this cosmetic feature*/
                        document.getElementById("thunderbayes-prefs-updates").hidden = true;
                        document.getElementById("thunderbayes-prefs-homepage").hidden = true;
                        document.getElementById("thunderbayes-prefs-updates").disabled = true;
                        document.getElementById("thunderbayes-prefs-homepage").disabled = true;
                    }
                    document.getElementById("menu_accountmgr").setAttribute("class", "menuitem-iconic");
                } catch (ex) {
                }
                if (this.prefs.isDeveloperMode()) {
                    // Developer mode tests
                    document.getElementById("thunderbayes-prefs-exceptions").hidden = false;
                    document.getElementById("thunderbayes-prefs-exceptions-test").hidden = false;
                    document.getElementById("thunderbayes-prefs-exceptions-test2").hidden = false;
                    document.getElementById("thunderbayes-prefs-exceptions").disabled = false;
                    document.getElementById("thunderbayes-prefs-exceptions-test").disabled = false;
                    document.getElementById("thunderbayes-prefs-exceptions-test2").disabled = false;
                }
                var button, folderTree, observerService, self = this;
                window.document.getElementById("threadTree").addEventListener("select", function () {
                    try {
                        self.updateSpamButton();
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                }, false);
                /*jslint newcap:true*/
                /*jshint newcap:false*/
                //noinspection JSPotentiallyInvalidConstructorUsage
                this.statusbar = new nsMsgStatusFeedback();
                /*jshint newcap:true*/
                /*jslint newcap:false*/
                top.controllers.appendController(this.controller);
                observerService = this.Cc["@mozilla.org/observer-service;1"].getService(this.Ci.nsIObserverService);
                observerService.addObserver(this.offlineobserver, "network:offline-status-changed", false);
                this.makeUnsureSpecialFolder();
                folderTree = document.getElementById("folderTree");
                if (folderTree) {
                    folderTree.addEventListener("select", function () {
                        try {
                            self.showColumns();
                        } catch (e) {
                            /**
                             * Unhandled exception handler for anonymous methods
                             */
                            self.exception.handleError(e);
                        }
                    }, false);
                }
                if (!document.getElementById("thunderbayes-button-spam")) {
                    if (document.getElementById("button-tag")) {
                        button = document.getElementById("button-tag");
                    } else if (document.getElementById("button-address")) {
                        button = document.getElementById("button-address");
                    } else if (document.getElementById("button-getmsg")) {
                        button = document.getElementById("button-getmsg");
                    }
                    if (button) {
                        document.getElementById("mail-bar3").insertItem("thunderbayes-button-spam", button, null, false);
                    }
                }
                this.loaded = true;
            }
        },
        /**
         * Handles the onUnload event of the thunderbayes.xul overlay
         */
        onUnload: function () {
            "use strict";
            if (this.loaded) {
                var observerService, self = this;
                window.document.getElementById("threadTree").removeEventListener("select", function () {
                    try {
                        return self.updateSpamButton();
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                }, false);
                //this.prefs = null;
                this.statusbar = null;
                top.controllers.removeController(this.controller);
                observerService = this.Cc["@mozilla.org/observer-service;1"].getService(this.Ci.nsIObserverService);
                observerService.removeObserver(this.offlineobserver, "network:offline-status-changed");
                this.loaded = false;
            }
        },
        /**
         * Attach the observer used to manage columns updates
         */
        onceLoaded: function () {
            "use strict";
            var ObserverService = this.Cc["@mozilla.org/observer-service;1"].getService(this.Ci.nsIObserverService);
            ObserverService.addObserver(this.dbobserver, "MsgCreateDBView", false);
        },
        /**
         * Check if Thunderbird is in online mode
         *
         * @return  {Boolean}
         *          true if yes, false otherwise
         */
        isThunderbirdOnlineNewMethod: function () {
            "use strict";
            return MailOfflineMgr.isOnline();
        },
        /**
         * Check if Thunderbird is in online mode (alternative method)
         *
         * @return  {Boolean}
         *          true if yes, false otherwise
         */
        isThunderbirdOnlineOldMethod: function () {
            "use strict";
            return !this.Cc["@mozilla.org/network/io-service;1"].getService(this.Ci.nsIIOService).offline;
        },
        /**
         * Matches a specific header
         *
         * @param   session
         *          A search session
         * @param   hdr
         *          Header to search for
         * @return  {*}
         *          true if yes, false otherwise
         */
        matchHdr: function (session, hdr) {
            "use strict";
            if (hdr.folder.getMsgDatabase) {
                session.clearScopes();
                session.addScopeTerm(this.Ci.nsMsgSearchScope.offlineMail, hdr.folder);
                return session.MatchHdr(hdr, hdr.folder.getMsgDatabase(msgWindow));
            }
            return null;
        },
        /**
         * Save custom SpamBayes header in the Thunderbird's preferences
         */
        registerCustomHeaders: function () {
            "use strict";
            var i, j, header, headers, prefs, customHeaders = "";
            headers = [
                "X-Spambayes-Classification", "X-Spambayes-Spam-Probability", "X-Spambayes-MailId"
            ];
            prefs = this.Cc["@mozilla.org/preferences-service;1"].getService(this.Ci.nsIPrefService).getBranch(null);
            try {
                customHeaders = prefs.getCharPref("mailnews.customDBHeaders");
            } catch (ex) {
                customHeaders = "";
            }
            for (i = 0, j = headers.length; i < j; i += 1) {
                header = headers[i];
                if (customHeaders.toLowerCase().indexOf(header.toLowerCase()) < 0) {
                    // WARNING this method of checking for a header in the
                    // pref-string will fail if another header exists
                    // whose name is a superset of this header name.
                    if (customHeaders.length > 0) {
                        customHeaders += " ";
                    }
                    customHeaders += header;
                }
            }
            prefs.setCharPref("mailnews.customDBHeaders", customHeaders);
        },
        /**
         * Changes the unsure folder to looks like a junk folder
         */
        makeUnsureSpecialFolder: function () {
            "use strict";
            try {
                var index, folderIndex, accountManager, allServers, numServers, rootFolder, allFolders, numFolders, folder;
                accountManager = this.Cc["@mozilla.org/messenger/account-manager;1"].getService(this.Ci.nsIMsgAccountManager);
                allServers = accountManager.allServers;
                numServers = allServers.Count();
                for (index = 0; index < numServers; index += 1) {
                    rootFolder = allServers.GetElementAt(index).QueryInterface(this.Ci.nsIMsgIncomingServer).rootFolder;
                    allFolders = this.Cc["@mozilla.org/supports-array;1"].createInstance(this.Ci.nsISupportsArray);
                    rootFolder.ListDescendents(allFolders);
                    numFolders = allFolders.Count();
                    for (folderIndex = 0; folderIndex < numFolders; folderIndex += 1) {
                        folder = allFolders.QueryElementAt(folderIndex, this.Ci.nsIMsgFolder);
                        if (folder.prettiestName === "Unsure" || folder.prettiestName === "Junk") {
                            if (this.prefs.getMakeUnsureSpecialFolder()) {
                                folder.setFlag(this.Ci.nsMsgFolderFlags.Junk);
                            } else {
                                folder.clearFlag(this.Ci.nsMsgFolderFlags.Junk);
                            }
                        }
                    }
                }
            } catch (ex) {
            }
        },
        /**
         * Get the spam status of en email message
         *
         * Try the easy way first
         * Note: hdr.getStringProperty() only works for headers listed in
         * user-pref 'customDBHeaders'. Furthermore, it can only get the
         * header if the header name was listed in customDBHeaders when the
         * message was received
         *
         * @param   hdr
         *          Email header
         * @return  {String}
         *          Classification category
         */
        getSpamStatus: function (hdr) {
            "use strict";
            var i, j, sessions, val = hdr.getStringProperty("x-spambayes-classification"); // Note lowercase header name
            if (val) {
                return val.toLowerCase();
            }
            sessions = this.searchsessions;
            // The easy way failed...try the hard way
            for (i = 0, j = sessions.length; i < j; i += 1) {
                val = sessions[i];
                if (sessions.hasOwnProperty(val)) {
                    if (this.matchHdr(sessions[val], hdr)) {
                        return val;
                    }
                }
            }
            // If we get this far the message has not been classified by SpamBayes
            return "unknown";
        },
        /**
         * Displays the plugin columns in a folder
         */
        showColumns: function () {
            "use strict";
            //if (!this.prefs.getShutdownPersistentCols()) {
            var cs, cp = document.getElementById("colSpamProbability");
            cs = document.getElementById("colSpamStatus");
            if (this.prefs.getPersistentCols()) {
                cp.hidden = false;
                cs.hidden = false;
                cp.ordinal = 200;
                cs.ordinal = 100;
                document.getElementById("junkStatusCol").ordinal = 99;
                cp.width = 35;
            } else {
                cp.hidden = true;
                cs.hidden = true;
            }
            //}
        },
        /**
         * Get the spam probability score of a message
         *
         * @param   hdr
         *          Email header
         * @return  {*}
         *          Probability score
         */
        getSpamProbabilities: function (hdr) {
            "use strict";
            var prob = hdr.getStringProperty("x-spambayes-spam-probability");
            prob = parseInt(parseFloat(prob) * 100, 10);
            return isNaN(prob) ? null : prob;
        },
        /**
         * Creates the search sessions
         *
         * @param   matchValue
         *          String to match
         * @return  {Object}
         *          Search session
         */
        createSearchSessions: function (matchValue) {
            "use strict";
            var term, tval, session = this.Cc["@mozilla.org/messenger/searchSession;1"].createInstance(this.Ci.nsIMsgSearchSession);
            term = session.createTerm();
            term.attrib = this.Ci.nsMsgSearchAttrib.OtherHeader;
            term.arbitraryHeader = "X-Spambayes-Classification";
            term.op = this.Ci.nsMsgSearchOp.Is;
            tval = term.value;
            tval.attrib = this.Ci.nsMsgSearchAttrib.OtherHeader;
            tval.str = matchValue;
            term.value = tval;
            session.appendTerm(term);
            return session;
        },
        /**
         * Trains a message as spam or ham
         *
         * @param  setAsSpam
         *         true if spam, false if ham
         */
        onSpamCommand: function (setAsSpam) {
            "use strict";
            try {
                // Mark selected messages as ham/spam
                //var messages = GetSelectedMessages();
                var i, j, callback, head, sbURL, command, self = this, messages = gFolderDisplay.selectedMessageUris;
                if (!messages || messages.length === 0) {
                    return;
                }
                command = new this.command(this, setAsSpam, messages);
                //if (command.isMove) {
                //SetNextMessageAfterDelete();
                //}
                sbURL = "http://" + this.prefs.getProxyHost() + ":" + this.prefs.getProxyPort();
                if (this.useREST || this.prefs.isThunderBayesProxyRunning()) {
                    this.useREST = true;
                    sbURL += "/thunderbayes.train";
                    head = "which=" + (setAsSpam ? "spam" : "ham") + "&text=";
                } else {
                    sbURL += "/train";
                    head = "which=" + encodeURIComponent("Train as " + (setAsSpam ? "Spam" : "Ham")) + "&file=&text=";
                }
                callback = function (msgURI, data) {
                    try {
                        self.sendMessage([msgURI], sbURL, head + encodeURIComponent(data), command);
                    } catch (ex) {
                        command.error([msgURI], "Error processing message data: " + ex);
                    }
                };
                for (i = 0, j = messages.length; i < j; i += 1) {
                    this.getMessageSrc(messages[i], callback, command);
                }
                this.updateSpamButton();
            } catch (e) {
                /**
                 * Unhandled exception handler for XUL element calls
                 */
                this.exception.handleError(e);
            }
        },
        /**
         * Get the source of an email message
         *
         * @param  msgURI
         *         Message uri
         * @param  callback
         *         Status callback
         * @param  command
         *         Error callback
         */
        getMessageSrc: function (msgURI, callback, command) {
            "use strict";
            //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
            var messageService, stream, self = this, streamListener = {
                QueryInterface: function (aIID) {
                    if (aIID.equals(self.Ci.nsISupports) || aIID.equals(self.Ci.nsIStreamListener)) {
                        return this;
                    }
                    throw Components.results.NS_NOINTERFACE;
                },
                data: "",
                onStartRequest: function (request, context) {
                },
                onDataAvailable: function (request, context, inputStream, offset, available) {
                    try {
                        var stream = self.Cc["@mozilla.org/scriptableinputstream;1"].createInstance(self.Ci.nsIScriptableInputStream);
                        stream.init(inputStream);
                        this.data += stream.read(available);
                        //noinspection ReuseOfLocalVariableJS
                        stream = null;
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                },
                onStopRequest: function (request, context, status) {
                    try {
                        if (Components.isSuccessCode(status)) {
                            callback(msgURI, this.data);
                        } else {
                            command.error([msgURI], "Cannot stream message: status=" + status);
                        }
                        this.data = "";
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                }
            };
            stream = this.Cc["@mozilla.org/network/sync-stream-listener;1"].createInstance().QueryInterface(this.Ci.nsIInputStream);
            messageService = messenger.messageServiceFromURI(msgURI);
            messageService.streamMessage(msgURI, streamListener, {}, null, false, null);
        },
        /**
         * Send a email message source with POST http request to the SpamBayes server
         *
         * @param  msgURIs
         *         Message uri
         * @param  sbURL
         *         SpamBayes url
         * @param  data
         *         Message source
         * @param  command
         *         Error callback
         */
        sendMessage: function (msgURIs, sbURL, data, command) {
            "use strict";
            var self = this, req = this.Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(this.Ci.nsIXMLHttpRequest);
            //noinspection JSUnusedLocalSymbols
            req.onreadystatechange = function (event) {
                try {
                    if (Number(req.readyState) === 4) {
                        self.onUploadResponse(req, msgURIs, command);
                    }
                } catch (e) {
                    /**
                     * Unhandled exception handler for anonymous methods
                     */
                    self.exception.handleError(e);
                }
            };
            try {
                req.open("POST", sbURL);
                req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                req.send(data);
            } catch (ex) {
                command.error(msgURIs, "Error sending data to SpamBayes: " + ex);
            }
        },
        /**
         * Callback method bound to the xmlhttprequest onreadystatechange
         *
         * @param  req
         *         XMLHttpRequest instance
         * @param  msgURIs
         *         Message uri
         * @param  command
         *         Error callback
         */
        onUploadResponse: function (req, msgURIs, command) {
            "use strict";
            var i, j, hdr, error = null;
            try {
                if (Number(req.status) === 200) {
                    // success!
                    for (i = 0, j = msgURIs.length; i < j; i += 1) {
                        hdr = messenger.msgHdrFromURI(msgURIs[i]);
                        hdr.setStringProperty("x-spambayes-classification", command.classification);
                        if (command.isSpam && !hdr.isRead) {
                            hdr.markRead(true);
                        }
                    }
                } else {
                    // training failed
                    error = "Training request error: " + req.status + " - " + req.statusText;
                    if (Number(req.status) === 500) {
                        this.common.alert("Server error response: " + req.responseText + "\n");
                    }
                }
            } catch (ex) {
                error = "Post-training update failed:\n" + ex;
            }
            if (error) {
                command.error(msgURIs, error);
            } else {
                command.updateProgress(msgURIs);
            }
        },
        /**
         * Moves an email message from a folder to another
         *
         * @param   msgURIs
         *          Message uri
         * @param   srcFolderURI
         *          Source folder
         * @param   dstFolderURI
         *          Destination folder
         * @return  {Array}
         *          An error array
         */
        moveMessages: function (msgURIs, srcFolderURI, dstFolderURI) {
            "use strict";
            var i, j, hdr, messages, dstFolder, srcFolder, errors = [], l = 0;
            // Move messages from one folder to another. Return a list of errors (may be empty).
            messages = this.Cc["@mozilla.org/array;1"].createInstance(this.Ci.nsIMutableArray);
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
        },
        /**
         * Updates the spam button appearance when selecting an email message
         */
        updateSpamButton: function () {
            "use strict";
            var i, stat, hdr, limit, messages, val = 0, hamCount = 0, spamCount = 0, spamDeck = document.getElementById("thunderbayes-spam-deck");
            //var messages = GetSelectedMessages();
            messages = gFolderDisplay.selectedMessageUris;
            if (messages && messages.length > 0) {
                limit = messages.length;
                if (limit <= 20) {
                    for (i = 0; i < limit; i += 1) {
                        hdr = messenger.msgHdrFromURI(messages[i]);
                        stat = this.getSpamStatus(hdr);
                        switch (stat) {
                        case "ham":
                            hamCount += 1;
                            break;
                        case "spam":
                            spamCount += 1;
                            break;
                        default:
                            spamCount += 1;
                            hamCount += 1;
                            break;
                        }
                        if (spamCount > 0 && hamCount > 0) {
                            break;
                        }
                    }
                } else {
                    // too many messages to check: automatic "unsure"
                    spamCount += 1;
                    hamCount += 1;
                }
                if (spamCount > 0) {
                    if (hamCount > 0) {
                        //noinspection ReuseOfLocalVariableJS
                        val = 2;
                    } else { // Activate "Unsure" button
                        //noinspection ReuseOfLocalVariableJS
                        val = 1;
                    } // Activate "Mark as Ham" button
                }
                spamDeck.selectedIndex = val;
            }
        },
        /**
         * Observer used to manage columns updates
         *
         * @param   self
         *          ThunderbayesMain instance
         * @return  {Object}
         *          A class exporting the observe() method
         * @constructor
         */
        DbObserver: function (self) {
            "use strict";
            //noinspection JSUnusedLocalSymbols
            return {
                observe: function (aMsgFolder, aTopic, aData) {
                    try {
                        if (gDBView) {
                            gDBView.addColumnHandler("colSpamStatus", self.colhandler2);
                            gDBView.addColumnHandler("colSpamProbability", self.colhandler);
                        }
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                }
            };
        },
        /**
         * Ranks mapping
         */
        StatusRankMap: {
            "spam": 3,
            "unsure": 2,
            "unknown": 1, // not filtered by SpamBayes
            "ham": 0
        },
        SpamStatusColumnHandler: function (self) {
            "use strict";
            //noinspection JSUnusedLocalSymbols
            return {
                isString: function () {
                    return false;
                },
                getImageSrc: function (row, col) {
                    try {
                        var hdr, stat, key = gDBView.getKeyAt(row);
                        hdr = gDBView.db.GetMsgHdrForKey(key);
                        stat = self.getSpamStatus(hdr);
                        if (stat) {
                            return "chrome://thunderbayes/skin/resources/thunderbayes_col_" + stat + ".png";
                        }
                        return null;
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                },
                getSortLongForRow: function (hdr) {
                    try {
                        return self.StatusRankMap[self.getSpamStatus(hdr)];
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                },
                getCellText: function (row, col) {
                    return null;
                },
                getSortStringForRow: function (hdr) {
                    return "";
                },
                getCellProperties: function (row, col, props) {
                },
                getRowProperties: function (row, col, props) {
                }
            };
        },
        /**
         * Handles the columns updates
         *
         * @param   self
         *          ThunderbayesMain instance
         * @return  {Object}
         *          A class exporting the isString(), getCellText(), getSortLongForRow()
         *          getSortStringForRow(), getCellProperties(), getRowProperties(), getImageSrc() methods
         * @constructor
         */
        SpamProbabilityColumnHandler: function (self) {
            "use strict";
            //noinspection JSUnusedLocalSymbols
            return {
                isString: function () {
                    return false;
                },
                getCellText: function (row, col) {
                    try {
                        var prob, hdr, key = gDBView.getKeyAt(row);
                        hdr = gDBView.db.GetMsgHdrForKey(key);
                        prob = self.getSpamProbabilities(hdr);
                        //noinspection JSValidateTypes
                        if (prob !== null) {
                            return prob + "%";
                        }
                        return "";
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                },
                getSortLongForRow: function (hdr) {
                    try {
                        var prob = self.getSpamProbabilities(hdr);
                        if (prob) {
                            return prob;
                        }
                        return 0;
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                },
                getSortStringForRow: function (hdr) {
                    return null;
                },
                getCellProperties: function (row, col, props) {
                },
                getRowProperties: function (row, props) {
                },
                getImageSrc: function (row, col) {
                    return null;
                }
            };
        },
        /**
         * Observer used to update the training button
         *
         * @param   self
         *          ThunderbayesMain instance
         * @return  {Object}
         *          A class exporting the observe() method
         * @constructor
         */
        OfflineObserver: function (self) {
            "use strict";
            //noinspection JSUnusedLocalSymbols
            return {
                observe: function (subject, topic, data) {
                    try {
                        var cmd = document.getElementById("cmd_thunderbayes_train");
                        if (cmd) {
                            cmd.setAttribute("disabled", String(!self.controller.isCommandEnabled("cmd_thunderbayes_train")));
                        }
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                }
            };
        },
        /**
         * Handles the traning button updates
         *
         * @param   self
         *          ThunderbayesMain instance
         * @return  {Object}
         *          A class exporting the supportsCommand(), isCommandEnabled(),
         *          doCommand() and onEvent() methods
         * @constructor
         */
        Controller: function (self) {
            "use strict";
            //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
            return {
                supportsCommand: function (cmd) {
                    return cmd === "cmd_thunderbayes_train";
                },
                isCommandEnabled: function (cmd) {
                    try {
                        if (!gDBView) {
                            return false;
                        }
                        var messages, enabled = {}, checkStatus = {};
                        enabled.value = false;
                        //var messages = GetSelectedMessages();
                        messages = gFolderDisplay.selectedMessageUris;
                        gDBView.getCommandStatus(nsMsgViewCommandType.junk, enabled, checkStatus);
                        //noinspection OverlyComplexBooleanExpressionJS
                        return enabled.value && messages && messages.length > 0 && self.isThunderbirdOnline();
                    } catch (ex) {
                        // catch 'gDBView is not defined' errors
                        return false;
                    }
                },
                doCommand: function (cmd) {
                },
                onEvent: function (evt) {
                }
            };
        },
        /**
         * Creates the search sessions
         *
         * @param   self
         *          ThunderbayesMain instance
         * @return  {Object}
         *          A class exporting ham(), spam() and unsure() methods
         * @constructor
         */
        SearchSessions: function (self) {
            "use strict";
            return {
                ham: function () {
                    try {
                        return self.createSearchSessions("ham");
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                },
                spam: function () {
                    try {
                        return self.createSearchSessions("spam");
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                },
                unsure: function () {
                    try {
                        return self.createSearchSessions("unsure");
                    } catch (e) {
                        /**
                         * Unhandled exception handler for anonymous methods
                         */
                        self.exception.handleError(e);
                    }
                    return null;
                }
            };
        }
    };
} catch (ex) {
    /**
     * Unhandled exception handler for named methods
     */
    ThunderbayesExceptions.handleError(ex);
}

/**
 * Handles button trainings
 *
 * @param  self
 *         ThunderbayesMain instance
 * @param  isSpam
 *         true if spam or false if ham
 * @param  messages
 *         Message object
 * @constructor
 */
function ThunderbayesCommand(self, isSpam, messages) {
    "use strict";
    try {
        var dst, src, statusMsg = "Marking " + messages.length + " messages as " + (isSpam ? "Spam" : "Ham");
        //dump(statusMsg + "\n");
        this.tb = self;
        /*jslint nomen:true*/
        /*jshint nomen:false*/
        self.statusbar._startMeteors();
        /*jshint nomen:true*/
        /*jslint nomen:false*/
        self.statusbar.showStatusString(statusMsg);
        this.isSpam = isSpam;
        this.classification = (isSpam ? "spam" : "ham");
        this.totalTasks = messages.length;
        this.moves = [];
        this.errors = [];
        src = messenger.msgHdrFromURI(messages[0]).folder.URI;
        dst = self.prefs.getDestinationFolder(isSpam);
        this.isMove = (src && dst && src !== dst);
        if (this.isMove) {
            this.srcFolderURI = src;
            this.dstFolderURI = dst;
        }
    } catch (ex) {
        /**
         * Unhandled exception handler for named methods
         */
        ThunderbayesExceptions.handleError(ex);
    }
}
try {
    /**
     * Prototype
     *
     * @type  {Object}
     */
    ThunderbayesCommand.prototype = {
        /**
         * Updates the progession while training many messages at once
         *
         * @param  msgURIs
         *         Message uri
         */
        updateProgress: function (msgURIs) {
            "use strict";
            var i, j, err, errors, ratio, text = [], moves = this.moves;
            if (moves.length < this.totalTasks) {
                // Updage status bar
                for (i = 0, j = msgURIs.length; i < j; i += 1) {
                    // Note: null elements in moves are for progress tracking
                    // they will be ignored during the actual move process
                    moves.push(msgURIs[i]); // is push() thread safe?
                }
                //dump("processed " + moves.length + " of " + this.totalTasks + " messages\n");
                if (this.totalTasks > 0) {
                    ratio = moves.length / (this.totalTasks);
                    this.tb.statusbar.showProgress(ratio * 100);
                }
            }
            if (moves.length >= this.totalTasks) {
                // Finish up
                /*jslint nomen:true*/
                /*jshint nomen:false*/
                this.tb.statusbar._stopMeteors();
                /*jshint nomen:true*/
                /*jslint nomen:false*/
                if (this.isMove) {
                    this.isMove = false; // Don't move more than once
                    errors = this.tb.moveMessages(moves, this.srcFolderURI, this.dstFolderURI);
                    for (i = 0, j = errors.length; i < j; i += 1) {
                        this.errors.push(errors[i]);
                    }
                }
                this.tb.updateSpamButton();
                if (this.errors.length) {
                    err = this.errors;
                    for (i = 0; i < 5; i += 1) {
                        // Grab a maximum of five errors
                        text.push(err.pop());
                        if (err.length === 0) {
                            break;
                        }
                    }
                    if (err.length) {
                        text.push("Displaying last " + text.length + " of " + (err.length + text.length) + " errors:");
                    }
                    text.push("SpamBayes training completed with errors");
                    text.reverse();
                    this.tb.common.alert(text.join("\n\n"));
                }
            }
        },
        /**
         * Handles the trainings failures
         *
         * @param  msgURIs
         *         Message uri
         * @param  text
         *         Error details
         */
        error: function (msgURIs, text) {
            "use strict";
            var i, j, progressInfo = [];
            if (msgURIs !== null) {
                if (msgURIs.length === 1) {
                    //noinspection AssignmentToFunctionParameterJS
                    text += "\nMessage URI: " + msgURIs[0];
                } else {
                    //noinspection AssignmentToFunctionParameterJS
                    text += "\nMessage URI(s):\n    " + msgURIs.join("\n    ");
                }
            }
            //dump(text + "\n");
            this.errors.push(text);
            if (msgURIs) {
                //noinspection JSUnusedLocalSymbols
                for (i = 0, j = msgURIs.length; i < j; i += 1) {
                    progressInfo.push(null);
                }
            }
            this.updateProgress(progressInfo);
        }
    };
    /**
     * Class instantiation
     */
    ThunderbayesMain.init();
} catch (ex) {
    /**
     * Unhandled exception handler for named methods
     */
    ThunderbayesExceptions.handleError(ex);
}
