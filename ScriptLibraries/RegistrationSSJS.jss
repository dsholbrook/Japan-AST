var XReg = {};
XReg = {
		
	dbGetReferenceDb: function () {
		/*
		'------------------------------------------------------------------------------------------------------
		'Description
		'------------------
		'Return a handle to the AST Reference database.  The location of the
		'database is defined in the Database Profile.
		'
		'Parameters
		'----------------
		'None.
		'
		'Return Values
		'-------------------
		'A handle to the database if the database could be found and opened successfully,
		'Otherwise Nothing is returned.
		'------------------------------------------------------------------------------------------------------   
		 */
		//	Const STR_MODULE_NAME = |dbGetReferenceDb|

		var dbReference: NotesDatabase = session.getDatabase(null, null);
		var strReferenceReplicaID = '';
		var tmpProfileDoc: NotesDocument;

		//dbReference = session.getDatabase(null, "events\\wwe\\asref.nsf", false);
		//return dbReference;

		//Get a handle to the Reference database
		tmpProfileDoc = database.getProfileDocument("fProfile", "");
		if (tmpProfileDoc != null) {
			strReferenceReplicaID = tmpProfileDoc.getItemValueString('dp_ReferenceDbReplicaID_NoColon');
			if (dbReference.openByReplicaID(null, strReferenceReplicaID)) {
				return dbReference;
			} else {
				dbReference = session.getDatabase(null, "events\\wwe\\asref.nsf", false);
				return dbReference;
			}
		}

		//Set the return values
		return dbReference;
	},
	
	dbGetReferenceDbGRP: function () {
		/*
		'------------------------------------------------------------------------------------------------------
		'Description
		'------------------
		'Return a handle to the GRP Reference database.  The location of the
		'database is defined in the Database Profile.
		'
		'Parameters
		'----------------
		'None.
		'
		'Return Values
		'-------------------
		'A handle to the database if the database could be found and opened successfully,
		'Otherwise Nothing is returned.
		'------------------------------------------------------------------------------------------------------   
		 */
		//	Const STR_MODULE_NAME = |dbGRPGetReferenceDb|

		var dbReferenceGRP: NotesDatabase = session.getDatabase(null, null);
		//var strReferenceReplicaIDGRP = '';
		var tmpProfileDoc: NotesDocument;

		dbReferenceGRP = session.getDatabase(null, "events\\wwe\\grp\\grpref.nsf", false);
		return dbReferenceGRP;
		
		/*
		var dbdir:NotesDbDirectory = session.getDbDirectory(null);
		tmpProfileDoc = database.getProfileDocument("fProfile", "");
		var str_ReferenceFilename:string = tmpProfileDoc.getItemValueString('dp_ReferenceFilename');
		db_ReferenceGRP = dbdir.openDatabase(str_ReferenceFilename.replace(/\\/g, '/'));
		if(dbReferenceGRP.isOpen()) {
			return dbReferenceGRP;
		} else {
			dbReferenceGRP = session.getDatabase(null, "events\\wwe\\grpref.nsf", false);
			return dbReferenceGRP;
		}

		//Set the return values
		return dbReferenceGRP;
		*/
	},

	strValidateLocale: function (theDoc, tmpLocale) {
		var tmpRet = 'ja_JP';
		try {
			var tmpDoc = theDoc;
			if (tmpDoc) {
				if (tmpDoc.hasItem('ep_Locales')) {
					var itemvalues: java.util.Vector = tmpDoc.getItemValue('ep_Locales');
					var iterator = itemvalues.iterator();
					while (iterator.hasNext()) {
						var itemvalue = iterator.next();
						if (itemvalue === tmpLocale) {
							return tmpLocale;
						}
					}
					return tmpDoc.getItemValueString('ep_DefaultLocale')
				}
			}
		} catch (ex) {
			print(ex.toString());
		}
		return tmpRet;
	},

	docGetEventProfile: function (strEventID) {
		try {
			var profVu: NotesView = database.getView('vLookupEventsByKey');
			return profVu.getDocumentByKey(strEventID);
		} catch (ex) {
			print(ex.toString());
		}
	},

	docGetLocaleProfile: function (strLocale) {
		/*
	'------------------------------------------------------------------------------------------------------
	'Description
	'------------------
	'Given a locale, try to find the locale profile in the reference database for the
	'specified locale.
	'
	'Parameters
	'----------------
	'strLocale						The locale
	'
	'Return Values
	'-------------------
	'If a locale profile is found, it is returned.
	'Otherwise Nothing is returned.
	'------------------------------------------------------------------------------------------------------   
		 */

		var STR_LOOKUP_VIEW_ALIAS = 'vLookupLocaleProfiles';
		var lkupView: NotesView;
		var docLocaleProfile: NotesDocument;
		var strKey = strLocale;
		var lkupDb = session.getDatabase(null, null);
		//context.redirectToPage('/testanil2.xsp');
		try {
			//		Find the lookup view
			lkupDb = this.dbGetReferenceDb();
			lkupView = lkupDb.getView(STR_LOOKUP_VIEW_ALIAS);
			//		Attempt to find the document in the view
			docLocaleProfile = lkupView.getDocumentByKey(strKey, true);
		} catch (ex) {
			print(ex.toString());
		}

		return docLocaleProfile;
	},
	
	docGetLocaleProfileGRP: function (strLocale) {
	/*
	'------------------------------------------------------------------------------------------------------
	'Description
	'------------------
	'Given a locale, try to find the locale profile in the GRP reference database for the
	'specified locale.
	'
	'Parameters
	'----------------
	'strLocale						The locale
	'
	'Return Values
	'-------------------
	'If a locale profile is found, it is returned.
	'Otherwise Nothing is returned.
	'------------------------------------------------------------------------------------------------------   
	*/

		var STR_LOOKUP_VIEW_ALIAS = 'vLookupLocaleProfiles';
		var lkupView: NotesView;
		var docLocaleProfile: NotesDocument;
		var strKey = strLocale;
		var lkupDb = session.getDatabase(null, null);
		try {
			//		Find the lookup view
			lkupDb = this.dbGetReferenceDbGRP();
			//context.redirectToPage('/testanil2.xsp');
			lkupView = lkupDb.getView(STR_LOOKUP_VIEW_ALIAS);
			//		Attempt to find the document in the view
			docLocaleProfile = lkupView.getDocumentByKey(strKey, true);
		} catch (ex) {
			print(ex.toString());
		}

		return docLocaleProfile;
	},

	docGetRegProfileByBriefIDAndLocale: function (strEpId, strLocale) {
		/*
		 '------------------------------------------------------------------------------------------------------
	     'Description
	     '------------------
	     'Given an event profile and a locale, check whether a registration profile exists for the
		'event and locale.
		'If one does, return a handle to it, otherwise return Nothing.
	     '
	     'Parameters
	     '----------------
	     '//docEventProfile				The event profile to check.
	     'strEpId						The event profile to check - by ID
		'strLocale						The locale to check.
		'
	     'Return Value
	     '-------------------
	     'If a registration profile exists for the event and locale return a handle to it.
		'Otherwise retun Nothing.
	     '------------------------------------------------------------------------------------------------------   
		*/
		var lkupView: NotesView = database.getView('vLookupRegistrationProfilesByIDLocale');
		var strKey = strEpId + strLocale;
		var tmpRegistrationProfile: NotesDocument;
		try {
			tmpRegistrationProfile = lkupView.getDocumentByKey(strKey, true);
		} catch (ex) {
			print(ex.toString());
		}
		return tmpRegistrationProfile;
	},
	
	docGetLocaleSettings: function (strLocale) {
		/*
	
	'------------------------------------------------------------------------------------------------------
     'Description
     '------------------
     'Given a locale, try to find the locale settings document  in the current database for the
	'specified locale.
     '
     'Parameters
     '----------------
	'strLocale						The locale
	'
     'Return Values
     '-------------------
     'If a locale settings document is found, it is returned.
	'Otherwise Nothing is returned.
     '------------------------------------------------------------------------------------------------------   
	*/
		//context.redirectToPage('test');
		var STR_LOOKUP_VIEW_ALIAS = 'vLookupLocaleSettings';
		var docLocaleSettings: NotesDocument;
		try {
			var lkupView = database.getView(STR_LOOKUP_VIEW_ALIAS);
			docLocaleSettings = lkupView.getDocumentByKey(strLocale, true);
		} catch (ex) {
			print(ex.toString());
		}
		return docLocaleSettings;
	}


}