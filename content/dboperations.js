const Cc = Components.classes;
const Ci = Components.interfaces;

alert("its working...!");
var tbirdsqlite = {

  onLoad: function() {
    // initialization code
    this.initialized = true;
    alert("inside tbirdsqlite onload....");
    this.dbInit();
  },

  dbConnection: null,

  dbSchema: {
     tables: {
       attachments:"id           INTEGER PRIMARY KEY, \
                    name         TEXT \
                    encoded      TEXT NOT NULL"
    }
  },

  dbInit: function() {
    var dirService = Components.classes["@mozilla.org/file/directory_service;1"].
      getService(Components.interfaces.nsIProperties);

    var dbFile = dirService.get("ProfD", Components.interfaces.nsIFile);
    dbFile.append("tbird.sqlite");

    var dbService = Components.classes["@mozilla.org/storage/service;1"].
      getService(Components.interfaces.mozIStorageService);

    var dbConnection;

    if (!dbFile.exists())
      dbConnection = this._dbCreate(dbService, dbFile);
    else {
      dbConnection = dbService.openDatabase(dbFile);
    }
    this.dbConnection = dbConnection;
  },

  _dbCreate: function(aDBService, aDBFile) {
    var dbConnection = aDBService.openDatabase(aDBFile);
    this._dbCreateTables(dbConnection);
    return dbConnection;
  },

  _dbCreateTables: function(aDBConnection) {
    for(var name in this.dbSchema.tables)
      aDBConnection.createTable(name, this.dbSchema.tables[name]);
  },
};
window.addEventListener("load", function(e) { tbirdsqlite.onLoad(e); }, false);