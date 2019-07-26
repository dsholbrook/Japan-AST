viewScope.coreSiteFormList = {};


XPage = {
	listLookupViewName:'luSSKeywordLists',
	//forms: {},
	getDB: function(){
		return session.getCurrentDatabase();
	}
	,
	getView: function(theViewName){
		return this.getDB().getView(theViewName);
	}
	,
	fromJson: function(theString){
		return fromJson( theString )	
	}
	,
	setNoCache: function(){
		var exCon = facesContext.getExternalContext();
		var response = exCon.getResponse();
		response.setHeader("Cache-Control", "no-store");
	}
	,
	setNoForm: function(){
		getView().getAttributes().put("createForm",false);
	}
	,
	setNoRender: function(){
		getView().getAttributes().put("rendered",false);
	}
	,
	setBodyClass: function(theClassName){
		if( !theClassName ){
			return;
		}
		getView().getAttributes().put("styleClass",theClassName);
	}
	,
	getFieldValue: function(theFieldName, theOptions){
		if( !theFieldName ){
			return null;
		}
		var tmpOptions = theOptions || {
		};
		var tmpDoc = theOptions.doc;
		if( !tmpDoc ){
			return null;
		}
		var tmpDataType = tmpOptions.dataType || '';
		var tmpVal = tmpDoc.getItemValue(theFieldName);
		if( tmpDataType == 'Date'){
			return tmpDoc.getItemValueDate(theFieldName);
		}
		if( this.isArray(tmpVal) ){
			if (tmpVal.length == 1){
				return tmpVal[0];				
			} else if (tmpVal.length == 0){
				return '';				
			}
		}
		return tmpVal;
	}
	,
	debug: function(theValue){
		if( viewScope.debugOutput == null){
			viewScope.debugOutput = theValue
		} else {
			viewScope.debugOutput += '<br />'  + theValue	
		};
	}
	,
	isArray : function(theObject) {
		if( !theObject ) return false;
		return (theObject.constructor === Array)
	}
	,
	mixin : function(theTarget, theSource) {
	  if (!theSource && !theTarget) return {}
	  if (!theSource) return theTarget;
	  if (!theTarget) return theSource;
      
      for (var tmpName in theSource) {
	      var tmpSource = theSource[tmpName];
	      //if (!(tmpName in theTarget) || (theTarget[tmpName] !== tmpSource)) {
	         theTarget[tmpName] = tmpSource;
	      //}
	  }
	  return theTarget;
    }
    ,
	getDataItem: function(theKey){
		return viewScope.coreCommonDataObject[theKey];
    }
    ,
	addFieldSpec: function(theFieldSpec){
		var tmpFO = theFieldSpec;
		if( !tmpFO || !tmpFO.fieldName) return false;
		var tmpFN = tmpFO.fieldName;
		var tmpFormName = tmpFO.formName;
		if( !viewScope.coreSiteFormList ){viewScope.coreSiteFormList = {}}
		if( tmpFormName ){
			if (!viewScope.coreSiteFormList[tmpFormName].fieldNames){
				viewScope.coreSiteFormList[tmpFormName].fieldNames = [tmpFN]
			} else {
				viewScope.coreSiteFormList[tmpFormName].fieldNames.push(tmpFN)
			}
		}

		if( !viewScope.coreFieldSpecs ){
			viewScope.coreFieldSpecs = {};
		}
		viewScope.coreFieldSpecs[tmpFO.fieldName] = tmpFO
    }
    ,
	getFieldSpec: function(theKey){
		return viewScope.coreFieldSpecs[theKey] || false;
    }
    ,
	addForm: function(theForm){
		var tmpName = theForm.formName || 'default';
		if( !viewScope.coreSiteFormList ){viewScope.coreSiteFormList = {} }
		viewScope.coreSiteFormList[tmpName] = theForm;
    }
    ,
	getForm: function(theKey){
		var tmpKey = theKey;
		if( !tmpKey ) return false;
		return viewScope.coreSiteFormList[theKey] || false;
    }
    ,
	getForms: function(){
		return viewScope.coreSiteFormList;
    }
    ,
	addData: function(theKey,theValue,theOptions){
    	return this.addDataItem(theValue,theKey,theOptions);
    }
    ,
    //--- use addData
	addDataItem: function(theValue,theKey,theOptions){
		var tmpOptions = theOptions || {};

		if( !viewScope.coreCommonDataObject ){
			viewScope.coreCommonDataObject = {};
		}
		var tmpKey = theKey;

		var tmpReplace = (tmpOptions.replace === true);
		if( tmpKey ){
			if( !tmpReplace ){
				if (typeof(theValue)=='object' && !XPage.isArray(theValue)){
					viewScope.coreCommonDataObject[tmpKey] = this.mixin(viewScope.coreCommonDataObject[tmpKey],  theValue)
				} else {
					viewScope.coreCommonDataObject[tmpKey] = theValue;
				}
			} else {
				viewScope.coreCommonDataObject[tmpKey] = theValue;
			}
		} else {
			if (typeof(theValue)=='object'){
				viewScope.coreCommonDataObject = this.mixin(viewScope.coreCommonDataObject,theValue);
			}
			//else invalid to with no keys
		}
		return true;
	}
	,
	//--- get list if it exists, if not add it by keyword name
	getList: function(theKey, theOptionalViewName, theOptionalLookupField){
		if( !viewScope.coreCommonLists ){
			return this.addList(theKey,undefined,undefined,theOptionalViewName, theOptionalLookupField)
		};
		if( viewScope.coreCommonLists[theKey]){
			return viewScope.coreCommonLists[theKey]
		};
		
		return this.addList(theKey,undefined,undefined,theOptionalViewName, theOptionalLookupField);
	}
	,
	addList: function(theKey,theValue,theOptions, theOptionalViewName, theOptionalLookupField){
		var tmpViewName = theOptionalViewName || this.listLookupViewName;
		
		var tmpLUField = theOptionalLookupField || "kw_Keywords";

		var tmpOptions = theOptions || {};
		var tmpListVal = theValue || theKey;
		
		if( !viewScope.coreCommonLists ){
			viewScope.coreCommonLists = {};
		}
		var tmpKey = theKey;
		if ((typeof tmpListVal) == 'string'){
			var tmpView = this.getView(tmpViewName);
			var tmpDoc:NotesDocument = tmpView.getDocumentByKey(tmpListVal,true);
			
			if (tmpDoc && tmpDoc != null){
				tmpListVal = tmpDoc.getItemValue(tmpLUField);
				//has to be normal array to use in JSON 
				var tmpNewList = [];
				for( aVal in tmpListVal){
					tmpNewList.push(aVal);
				}
				tmpListVal = tmpNewList;
			} else {
				tmpListVal = [tmpListVal]
				              
			}
		}
		
		viewScope.coreCommonLists[tmpKey] = tmpListVal;
		return tmpListVal;
	}
	,
	getHeaderValue: function(theKey) {
	    var headerNames = facesContext.getExternalContext().getRequestHeaderMap().entrySet();
	    for (var v in headerNames) {
	    	var tmpKey = v.getKey();
	        var tmpValue = v.getValue();
	        if( theKey == tmpKey ){
	        	return tmpValue;
	        }
	    }
	    return '';
	}
	,
	getURLParam: function(theParam){
		context.getUrlParameter(theParam);
	}
	,
	getBaseURL: function() {
		return facesContext.getExternalContext().getRequestContextPath();
	}
	,
	replaceBaseURL: function(theString, theOptionalBaseURL) {
		//--- replaced [tmpBaseURL] with the current base URL in the string passed'
		//-- if nothing passed, a blank value will be returned
		if( !theString ){return ''};
		var tmpRet = '' + (theString || '');
		var tmpBase = theOptionalBaseURL || this.getBaseURL();
		if( tmpRet ){
			tmpRet = tmpRet.replace("[tmpBaseURL]", tmpBase);
			XPage.debug('set');
		}
		return tmpRet;
	}
	,
	findUNIDInView : function(theView, theKey){
		if( !theView || !theKey){
			return '';
		}
		var tmpView = theView;
		if( typeof(tmpView) == "string" ){
			tmpView = session.getCurrentDatabase().getView(theView)
		}
		if( !tmpView || tmpView == null ){
			return '';
		}
		var tmpDoc = tmpView.getDocumentByKey(theKey,true);
		if( !tmpDoc || tmpDoc == null ){return ''};
		return tmpDoc.getUniversalID();
	}	
	,
	toArray : function(input) {
	    try {
	       
	      if (typeof input === "undefined" || input === null) {
	        return [];  
	      }
	       
	      if (typeof input === "string") {
	        return ( input.length > 0 ? [input] : [] );
	      }
	         
	      if (typeof input === "java.util.Vector") {
	        var a = [];
	        var it = input.iterator();
	        while (it.hasNext() ) {
	          a.push( it.next() );
	        }
	        return a;
	      }
	       
	      if (typeof input.toArray !== "undefined") {
	        return input.toArray();
	      }
	       
	      if ( input.constructor === Array ) {
	        //return input if it's already an array
	        return input;
	      } 
	   
	      //return input as an array
	      return [ input ];
	       
	    } catch(e) {
	      return []
	    }
	  },
	  	
	assureParamIsObject: function(theParam, theObjectKey){
		if( !theParam ){return false};
		if( !theObjectKey ){return false};

		var tmpRet = theParam;

		var tmpType = typeof(theParam);
		if( tmpType != 'object' ){
			tmpRet = {};
			tmpRet[theObjectKey] = theParam;
		}
		return tmpRet;
	}
	,
	getNavConfig: function(theOptions){
		var tmpOptions = theOptions || {};
		tmpOptions = this.assureParamIsObject(theOptions,"id");
		var tmpNavID = tmpOptions.id;
		
		var tmpDB = this.getDB();
		var tmpView = tmpDB.getView("luContentNav");
		var tmpNavDoc = tmpView.getDocumentByKey(tmpNavID, true);

		var tmpPageImage = '';
		var tmpNavConfig = {};

		if (tmpNavDoc && tmpNavDoc != null){
			//--- load nav details
			tmpPageTitle = tmpNavDoc.getItemValueString("nav_page_title") || '';
			tmpPageSubTitle = tmpNavDoc.getItemValueString("nav_page_sub_title") || '';
			tmpPageSubText = tmpNavDoc.getItemValueString("nav_page_sub_text") || 'nav_page_sub_text';
			
			var tmpNavConfigText = tmpNavDoc.getItemValueString("nav_object");
			
			if (!tmpNavConfigText){
				tmpNavConfigText = '{}';
			}

			try {
				tmpNavConfig = XPage.fromJson(tmpNavConfigText);	
			} catch (ex) {
				XPage.debug("Error " + ex.toString());
			}

			
			
			var tmpNavMenuConfigText = '';//tmpNavDoc.getItemValueString("nav_object_menubar");
			if( tmpNavConfig && tmpNavConfig.isMenuNav === true){
				tmpNavMenuConfigText = tmpNavConfigText;
				tmpNavConfig = {};
			}
			if (!tmpNavMenuConfigText){
				tmpNavMenuConfigText = '{}';
			}

			var tmpPageImageType = tmpNavDoc.getItemValueString('nav_lead_image_type') || '';

			var tmpPageImage = tmpNavDoc.getItemValueString('nav_lead_img') || '';			
			var tmpPageImageID = tmpNavDoc.getItemValueString('nav_lead_img_id') || '';

			var tmpPageBGImage = tmpNavDoc.getItemValueString('nav_lead_bg_img') || '';			
			var tmpPageBGImageID = tmpNavDoc.getItemValueString('nav_lead_bg_img_id') || '';

			var tmpLeadStyle = tmpNavDoc.getItemValueString('nav_lead_style') || '';

			var tmpPageBGColor = tmpNavDoc.getItemValueString('nav_lead_bg_color') || '';			

			var tmpButtonText = tmpNavDoc.getItemValueString('nav_lead_btn_text') || '';			
			var tmpButtonColor = tmpNavDoc.getItemValueString('nav_lead_btn_color') || '';			
			var tmpButtonURL = tmpNavDoc.getItemValueString('nav_lead_btn_url') || '';			

			
			if( tmpPageImageType == 'None' ){
				tmpPageImage = ''
			} else if( tmpPageImageType == 'Database' && tmpPageImage){
				tmpPageImage = XPage.getBaseURL() + '/' + tmpPageImage;
				if( tmpPageBGImage ){
					tmpPageBGImage = XPage.getBaseURL() + '/' + tmpPageBGImage;	
				}
				
			} else if( tmpPageImageType == 'Single' && tmpPageImageID){
				var tmpURLs = @DbLookup("" , "webfile" , tmpPageImageID, 2 );
				tmpPageImage = @If( @IsError(tmpURLs) , "" , tmpURLs );
				if( tmpPageBGImageID ){
					var tmpBGURLs = @DbLookup("" , "webfile" , tmpPageBGImageID, 2 );
					tmpPageBGImage = @If( @IsError(tmpBGURLs) , "" , tmpBGURLs ); 
				}
			}
			
			var tmpLeadType = tmpNavDoc.getItemValueString('nav_lead_type') || '';


			XPage.loadViewScopeFromDoc({
				mapping: XPage.getVSMapForCoreSiteNav(),
				doc: tmpNavDoc
			})
		}


		try {
			tmpNavMenuConfig = XPage.fromJson(tmpNavMenuConfigText);	
		} catch (ex) {
			XPage.debug("Error parsing menubar " + ex.toString());
		}

		tmpNavConfig.menuBar = tmpNavMenuConfig;
		
		if( tmpPageImage ){
			tmpNavConfig.pageImage = tmpPageImage;
		} 
		if( tmpPageBGImage ){
			tmpNavConfig.pageBGImage = tmpPageBGImage;
		} 
		
		if( tmpPageBGColor ){
			tmpNavConfig.pageBGColor = tmpPageBGColor;
		}

		if( tmpButtonText && tmpButtonColor && tmpButtonURL ){
			tmpNavConfig.buttonText = tmpButtonText;
			tmpNavConfig.buttonColor = tmpButtonColor;
			tmpNavConfig.buttonURL = tmpButtonURL;
		}

		if( tmpLeadStyle ){
			tmpNavConfig.leadStyle = tmpLeadStyle;	
		}
		if( tmpPageTitle ){
			tmpNavConfig.pageTitle = tmpPageTitle;
		} 
		if( tmpPageSubTitle ){
			tmpNavConfig.pageSubTitle = tmpPageSubTitle;
		} 
		if( tmpPageSubText ){
			tmpNavConfig.pageSubText = tmpPageSubText;
		} 
		
		if( tmpLeadType ){
			tmpNavConfig.leadspaceType = tmpLeadType;
		} 
		
		
		return tmpNavConfig;
	}
	,
	getVSMapForCoreSiteNav: function(theOptions){
		return {
			"coreSiteID":"nav_wp_key",
			"sidebarType":"nav_sidebar_type",
			"sidebarContentTop":"nav_sidebar_content_top",
			"sidebarInclContact":"nav_sidebar_incl_contact",
			"sidebarContactName":"nav_sidebar_contact_name",
			"sidebarContactEMail":"nav_sidebar_contact_email",
			"sidebarContentBottom":"nav_sidebar_content_bottom",
			"sidebarContentInclude":"nav_sidebar_content_include"
		}
	}
	,
	loadViewScopeFromDoc: function(theOptions){
		
		var tmpOptions = theOptions || {};

		var tmpMapping = tmpOptions.mapping || '';
		if( !tmpMapping ){return false};
		var tmpDoc = tmpOptions.doc || '';
		if( !tmpDoc ){return false};
		
		for (var aVar in tmpMapping){
			var tmpFieldName = tmpMapping[aVar];
			var tmpVarName = aVar;
			var tmpVal = tmpDoc.getItemValueString(tmpFieldName);
			viewScope.put(tmpVarName,tmpVal);
			if( tmpOptions.debug === true){
				XPage.debug(tmpVarName + ' = ' + tmpVal)	
			}
		}
		
		
	}
	,
	/*
	* initApp: Call in before or after page load 
	*/
	initApp: function (theOptions){
		XPage.setNoCache();
		XPage.setNoForm();

		var options = theOptions || {};
		options.siteName = options.siteName || "NA"; 
		options.pageTitle = options.pageTitle || ""

		var tmpInit = {};

		var tmpSN = this.getDB().getServer();
		var tmpDBPath = XPage.getBaseURL();
		
		tmpNavConfig = options.navConfig 
		if( !tmpNavConfig ) return;
		
		tmpSiteNav = {
			'config' : tmpNavConfig,
			'siteName' : options.siteName
		};
		
		tmpSiteNav.pageTitle = tmpNavConfig.pageTitle || options.pageTitle || '';
		tmpSiteNav.pageSubTitle = tmpNavConfig.pageSubTitle || options.pageSubTitle || '';
		tmpSiteNav.pageSubText = tmpNavConfig.pageSubText || options.pageSubText || '';
		
		if (options.activeTab) tmpSiteNav.activeTab = options.activeTab;
		if (options.activeSubTab) tmpSiteNav.activeSubTab = options.activeSubTab;
		if (options.siteName) tmpSiteNav.siteName = options.siteName;
		viewScope.siteNav = tmpSiteNav;
	}	

}

