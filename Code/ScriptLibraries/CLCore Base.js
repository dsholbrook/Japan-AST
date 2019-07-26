CLRoot = {};
/**
	Base setup for the CLCore namespace.
	<br />
	<br />This file is SHARED for all CLCore libraries
	<br />DO NOT put anything specific to an application in this library
 
	@module CLCore
	@main CLCore
	
*/
//CLCore = (function($, IBM) {

(function($, IBM, CLC) {

	var me = IBM.namespace(CLC, "core");

	var version = '1.0.0';
 
	//--- returns this library version	
	function getVersion(){
		return version;
	};
	me.getVersion = getVersion;

	function endsWith(theString, thePattern) {
	    var d = theString.length - thePattern.length;
	    return d >= 0 && theString.lastIndexOf(thePattern) === d;
	};
	me.endsWith = endsWith;

	//--- returns jQuery element by ID	
	function byId(theID) {
		try {
			return $('#' + theID)[0];		
		} catch(ex){
			return false;
		}
	};
	me.byId = byId;

    function replaceAll(theText, theFind, theReplace) {
        var target = ('' + theText);
        return target.replace(new RegExp(theFind, 'g'), theReplace);
    };
    me.replaceAll = replaceAll;
    
	//--- returns this library version	
	function trim(theValue){
		return $.trim(theValue);
	};
	me.trim = trim;
	

	function fromJson(theText) {
		return $.parseJSON(theText);
	};
	me.fromJson = fromJson;


	function mixin(theTarget, theSource) {
		$.extend(true, theTarget, theSource);
	};
	me.mixin = mixin;
	
	function removeClass(theElem, theClass){
		$(this.byId(theElem)).removeClass(theClass);
	}
	me.removeClass = removeClass;

	function addClass(theElem, theClass){
		$(this.byId(theElem)).addClass(theClass);
	}
	me.addClass = addClass;
	
	return this;
	
})(jQuery, IBMCore, CLRoot);


CLCore = CLRoot.core;


/** 
	Forms functionality
	@class CLCore.forms
	
**/

(function($, IBM, CLC) {
 
	var forms = IBM.namespace(CLC, "forms");

	var formProto = {
		_version: '2.00.002',
		getVersion: function(){
			return this._version;
		},
	    //--- Internally used
	    formName: "",
	    //--- Internally used, but can use to implement custom updates
	    updateFromFieldValue : function(theField, theFieldName, theUpdateIfSet, theForm) 
	    {
	    	var tmpForm = theForm || this;
			var tmpValue = tmpForm.getFieldValue( theField.fieldName );
			var tmpFieldName = theFieldName;
			if( tmpFieldName == '' || tmpFieldName == null ){return};
			
			if( theUpdateIfSet !== true ){
				if( '' != tmpForm.getFieldValue( tmpFieldName )){return};
			}
			tmpForm.setFieldValue(tmpFieldName, tmpValue);
	    },		   
	    //--- Stores common validations, such as CC validation
	    validations:{
	        //--- Simple e-mail validation. Return true for blank value, use required for that. 
	    	"email" : function(theField, theForm, theOptions){
				var tmpValue = theForm.getFieldValue(theField.fieldName) || '';
				if( !tmpValue ){return ""};
			    var re = /\S+@\S+\.\S+/;
	   			if (re.test(tmpValue)) {return ""};
	   			return "Invalid e-mail address";
			}
	    },
	    //--- Stores common translations, such as trim
	    translations: {
	        //--- Used to trim the field (automatic by default)
	    	"trim" :function(theField, theForm)
	    	{
			   var tmpValue = theForm.getFieldValue( theField.fieldName );
			   if (typeof(tmpValue) != 'string'){return tmpValue};
			   return CLC.trim(tmpValue);
	    	}
	    },
	    //--- Stores common updates that are made on the form when a field changes
	    updates:{
	        //--- Used to update another field when a value changes on the field
	        //--- Options: 
	    	//        fieldName - *required - Defines the field to be updated 
	    	//        evenIfSet - *optional - Set to true to replace even if field to be set has a value already (false by default) 
		    "updatefield": function(theField, theForm) 
		    {
				var tmpValue = theForm.getFieldValue( theField.fieldName );
				var tmpState = theField.updates;
				var tmpFieldName = tmpState.fieldName;
				var tmpEvenIfSet = (tmpState.evenIfSet === true);
				return theForm.updateFromFieldValue(theField,tmpFieldName,tmpEvenIfSet,theForm);
		    }
		    ,
	        //--- Used to show only certain areas based on the value of the field
		    //-- Example: Show the some_other field when the value is "Other"
		    //  {name: 'showif", fieldName: 'some_field', fieldValue: 'Other'}
	        // 
	        //--- Options: 
	    	//        fieldValue - The value of the related field that will make the items show (defaults to Other) 
	    	//        fieldName - The field name (or array of field names) to show when the value matches.  Can use with the targetIDs option. 
	    	//        targetIDs (An id (or array of ids) to show. Can use with the fieldName option. 
		    "showif": function(theField, theForm) 
		    {
		    	theForm.showHideState(theField, theForm,true);
		    }
		    ,
	        //--- Used to hide only certain areas based on the value of the field
		    //     (see showif)
		    "hideif": function(theField, theForm) 
		    {
		    	theForm.showHideState(theField, theForm,false);
		    }
		    ,
	        //--- Used to show the correct state or prov field based on country selection
	        // 
	        //--- Options: 
	    	//        stateFieldName - The name of the state field. (defaults to en_state) 
	    	//        provinceFieldName - The name of the state field. (defaults to en_province) 
		    "countryselect": function(theField, theForm) 
		    {
				var tmpValue = theForm.getFieldValue( theField.fieldName );
				var tmpState = theField.updates;
				var tmpShowState = false;
				var tmpShowProv = false;
				var tmpSFN = tmpState.stateFieldName || 'en_state';
				var tmpPFN = tmpState.provinceFieldName || 'en_province';
				var tmpOFN = tmpState.otherFieldName || '';
				tmpShowState = ( tmpValue == 'United States' || tmpValue == 'US');
				tmpShowProv = ( tmpValue == 'Canada' || tmpValue == 'CA');
				theForm.setFieldDisplay(tmpSFN, tmpShowState);
				theForm.setFieldDisplay(tmpPFN, tmpShowProv);
				if( tmpOFN ){
					theForm.setFieldDisplay(tmpOFN, (!tmpShowState && !tmpShowProv && tmpValue != ''));
				}
		    }
		    
	    },
	    //--- Internally used for number fields but can use as needed
	    isFieldNumeric: function(theField, theForm, theOptions){
		   var tmpOptions = theOptions || {};
		   var tmpValue = theForm.getFieldValue( theField.fieldName );
		   try {
		   	if (isNaN(tmpValue)){
		   		return 'A numeric value is needed for ' +  theField.fieldLabel;
		   	};
		   } catch(ex) {
		   	 alert( ex.toString() );
			 return '';	   
		   }
		   return '';
		},
		setFieldList: function(theFieldName, theList){
		   if( !theFieldName ){return false};
		   var tmpCurrValue = this.getFieldValue( theFieldName );   
		
		   var tmpField = this.formObj[theFieldName];
		   
		   if( !tmpField || tmpField == null || tmpField.type == 'hidden' ){
		   		return false;
		   }
		
		   //--- clear	   
		   tmpField.options.length = 0;
	
		   var tmpList = theList;
	
		   var tmpFoundVal = false;
		   var tmpCount = 0;
		   
		   if(!tmpList || typeof(theList.length) == 'undefined'){
			   tmpList = ''
		   } else {
			   //--- Set the length
			   var tmpLen = theList.length;
			   
			   var tmpFieldSpec = this.fields[theFieldName];
			   if( tmpFieldSpec.controlType == 'ComboBox'){
				   tmpLen++;
				   tmpCount=1;
				   tmpField.options[0] = new Option("Select one","",true, true);
			   }
			   
			   tmpField.options.length = tmpLen;
			   
			   
	/*
	 *     	   if( tmpFieldSpec.controlType == 'ComboBox'){
				   //tmpField.options[0] = new Option("Select","",true, true);
	    		   //Update from DH to account for alias values //1-4-16
	    		   if(tmpVal.indexOf('|') == -1) {
	    				tmpField.options[tmpCount] = new Option(tmpVal, tmpVal, true, true);
	    			} else {
	    				var tmpD = tmpVal.substring(0, tmpVal.indexOf('|'));
	    				var tmpV = tmpVal.substring(tmpVal.indexOf('|')+1, tmpVal.length);
	    				tmpField.options[tmpCount] = new Option(tmpD, tmpV, true, true);
	    			}
			   }
	
	*/
			   
	    	   for (var aVal in tmpList ){
				   var tmpVal = tmpList[aVal];
				   if( !tmpFoundVal && tmpVal == tmpCurrValue){					   
					   tmpFoundVal = true;
				   }
				   tmpField.options[tmpCount] = new Option(tmpVal, tmpVal, true, true);				   
				   tmpCount++;
			   }
		   }
		   if(!tmpFoundVal){			   
			   tmpCurrValue = '';
			   var tmpFieldNameString = "'" + theFieldName + "'";			   
			   core.form.setFieldValue(theFieldName,'');
		   }
		   this.setFieldValue('comment_category_other',tmpCurrValue);
		},
	    //--- Internally used to hold all field details
	    fields: {},
	    //--- Internally used, but can use to clear all fields to a blank value
	    // Note: Changing to a default value is normally better.
	    clearAllFields: function(){
	    	for (aField in this.fields){
	    		this.setFieldValue(aField, '')    		
	    	}
	    },
	    //--- Internally used by the showif and hideif updates
	    //--- State is a generic term for the updates made based on a field
	    showHideState: function(theField, theForm, theShow){
	    
				var tmpValue = theForm.getFieldValue( theField.fieldName );
				var tmpState = theField.updates;
				var tmpShowIfValue = tmpState.fieldValue || 'Other';
				 
				var tmpShow = theForm.containsFieldValue(theField.fieldName, tmpShowIfValue, theForm); //( tmpValue == tmpShowIfValue );
				if( !theShow ){
					tmpShow = !tmpShow;
				}
				var tmpFieldName = tmpState.fieldName || tmpState.fieldNames;
				var tmpShowIDs = tmpState.targetID || tmpState.targetIDs;
	
				if( tmpShowIDs ){
					theForm.setAreaDisplay(tmpShowIDs, tmpShow);
				}
				 
				if( tmpFieldName ){
					theForm.setFieldDisplay(tmpFieldName, tmpShow);
				}
	    
	    },
	    //--- Internally used but can be used to refresh the state of the form based
	    //     on the all of the fields related "updates"
	    //--- State is a generic term for the updates made based on a field
	    refreshState: function(){
	    	for (aField in this.fields){
	    		var tmpField = this.fields[aField];
				if( tmpField.updates ){
					this.runFieldState(tmpField.fieldName);
	    		}
	    	}
	    },
	    //--- Internally used to trim fields before saving
	    trimAllFields: function(theForm){
	    	var tmpForm = theForm || this;
	    	for (aField in tmpForm.fields){
	    		var tmpField = tmpForm.fields[aField];
	    		var tmpType = tmpField.controlType;
				if( (tmpType == 'Text' || tmpType == 'Number') && tmpField.disableTrim !== true ){
					var tmpFieldVal = tmpForm.getFieldValue(tmpField.fieldName);
					var tmpNewVal = CLC.trim(tmpFieldVal);
					if( tmpFieldVal != tmpNewVal ){
						tmpForm.setFieldValue(tmpField.fieldName, tmpNewVal, {ignoreStates: true})
					}
	    		}
	    	}
	    },
	    //--- Internally used to refresh translated related to all fields 
	    refreshTranslations: function(){
	    	for (aField in this.fields){
	    		var tmpField = this.fields[aField];
				if( tmpField.translations ){
					this.runFieldTranslation(tmpField.fieldName);
	    		}
	    	}
	    },
	    //--- Internally used to get the checked values of a field
	    getCheckedValues: function(theField){
	    	
	    	if( !theField[0] ){
	    		if (theField.checked){
	    			return theField.value
	    		}
	    		return '';
	    	}
	    	var tmpRet = '';
	    	for (i=0;i<theField.length;i++)
			  {
			  if (theField[i].checked)
			    {
			    if( tmpRet != '' ){tmpRet +=','};
			    tmpRet += theField[i].value;
			    
			    }
			  }
			  return tmpRet;
	    },
	    //--- Internally used to set the checked values of a field
	    setCheckedValues: function(theFormField, theValues){
	    	var tmpValues = theValues;
	    	if (typeof tmpValues == 'string'){
	    		tmpValues = [tmpValues]
	    	}
	    	var tmpValueCheck = {};
	    	for (var iValPos=0;iValPos<tmpValues.length;iValPos++){
	    		var tmpVal = tmpValues[iValPos];
	    		if( tmpVal != '' ) tmpValueCheck[tmpVal] = true;
	    	}
	    	for (var i=0;i<theFormField.length;i++)
			{
			    theFormField[i].checked = (tmpValueCheck[theFormField[i].value] === true)
			    
		    	try {
		    		var tmpCheckedVal = theFormField[i].checked ? 'check' : 'uncheck';
		    		jQuery( theFormField[i] ).iCheck(tmpCheckedVal).iCheck('update');
		    	} catch(ex){
		    		
		    	}
			}
	    },
	    //--- Returns true if the field contains theValueToCheck
	    //-- form is optional, will use (this)
	    containsFieldValue: function(theFieldName, theValueToCheck, theForm){
	    	var tmpForm = theForm || this;
	    	var tmpField = tmpForm.fields[theFieldName];
	    	var tmpValue = theForm.getFieldValue( theFieldName );
			var tmpHasValue = false;
			if (tmpField.controlType == 'Checkbox' && tmpValue != '' ){
				tmpValue = tmpValue.split(',');
			}
			
			if( $.isArray(tmpValue) ){
				for (var aEntry in tmpValue ){
					if( !tmpHasValue ){
						var tmpEntryVal = tmpValue[aEntry];
						tmpHasValue = ( tmpEntryVal == theValueToCheck )
					}
				}
			} else {
				tmpHasValue = ( tmpValue == theValueToCheck );
			}
	    	return tmpHasValue;
	
	    },
	    //--- Returns the field specs for the specified field
	    getField: function(theFieldName){
	    	return this.fields[theFieldName];
	    },
	    //--- Returns the field value for the specified field, regardless of control type
	    getFieldValue: function(theFieldName, theDefault){
	    	var tmpField = this.fields[theFieldName];
			var tmpFormField = this.formObj[theFieldName];
			
			if( (core.data.formInEditMode == false) && tmpFormField && typeof(tmpFormField.value) != 'undefined'){
				return tmpFormField.value;
			}
			if( !tmpFormField ) {
				var tmpField = CLC.byId('ff_' + theFieldName);
				if( tmpField ){
					return tmpField.value || '';
				}				
				return ''
			};
			var tmpValue = (tmpField.control && tmpField.control.getValue ) ? tmpField.control.getValue() : tmpFormField.value;
			if( tmpValue == null ) tmpValue = '';
			if( tmpField.controlType == 'Radio' || tmpField.controlType == 'Checkbox' ){
				tmpValue = this.getCheckedValues(tmpFormField);
			}
	    	return tmpValue;
	    },
	    //--- Sets the field value for the specified field, regardless of control type
	    setFieldValue: function(theFieldName, theValue, theOptions){

	    	var tmpOptions = theOptions || {};
	    	var tmpValue = theValue;
	    	var tmpField = this.fields[theFieldName];
	    	if( tmpField == null ){
	    		return true;
	    	}
			var tmpFormField = this.formObj[theFieldName];
	    	if( tmpFormField == null ){
	    		return true;
	    	}
			
	    	if( !tmpField ) return false;
			if( tmpField && tmpField.controlType == 'Hidden'){
				if( !tmpFormField ){return false};
				tmpFormField.value = tmpValue;
		    	return true;
			}

			if( tmpField && (core.data.formInEditMode == false || tmpField.controlType == 'Display Only') ){
				if( !tmpFormField ){return false};
				tmpFormField.value = tmpValue;
				CLC.site.setAreaHTML('fd_' + theFieldName , tmpValue);
		    	return true;
			}
			
	    	if( tmpField.isControl ){
		   		if( tmpField.isControl && !tmpField.control){
	    			tmpField.control = dijit.byId(tmpField.id);
	    		}
	    		if(tmpField.control && tmpField.control.setValue ){
	    			if (tmpField.controlType == 'DatePicker'){
	    				if( typeof tmpValue == 'string' ){
		    				try{
		    					tmpValue = new Date(tmpValue);
		    				} catch (ex) {
								//do anything?		 			
		    				}
	    				}
	    			}
	    			tmpField.control.setValue(tmpValue)
	    			return true;
	    		}
	    	}
	
			if( tmpField.controlType == 'Radio' || tmpField.controlType == 'Checkbox' ){
				this.setCheckedValues(tmpFormField,theValue);
				//--- set value
			} else {
				tmpFormField.value = theValue;
				if( tmpField.controlType == 'ComboBox' ){
					try {
						$(tmpFormField).trigger('change');	
					} catch(ex){
						
					}
				}
			}
			if( tmpField.updates && tmpOptions.ignoreStates !== true){
				this.runFieldState(tmpField.fieldName);
			}
	    	return true;
	    },
	    //--- Sets the content an area on the page based on ID with theHTML provided. Same as core.setAreaHTML
	    setAreaHTML: function(theArea, theHTML){
	    	return CLC.site.setAreaHTML(theArea, theHTML);
	    },
	    //--- Sets an area on the page to show or hide based on ID. Same as core.setAreaHTML
	    setAreaDisplay: function(theArea, theIsDisplayed){
	    	return core.setAreaDisplay(theArea, theIsDisplayed);
	    },
	    //--- Turns a field on or off, use this function to be able to see if a field is hidden
	    setFieldDisplay: function(theFieldName, theIsDisplayed){
	    	var tmpFieldName = theFieldName;
	    	var tmpShow = theIsDisplayed;
			if( typeof tmpFieldName == 'string' ){
				this.setAFieldDisplay(tmpFieldName, tmpShow);
			} else if(tmpFieldName.length) {
				var tmpLen = tmpFieldName.length;
				for( var i = 0 ; i < tmpLen ; i++ ){
					this.setAFieldDisplay(tmpFieldName[i], tmpShow);
				}
			}
	    },
	    //--- Internal use
	    setAFieldDisplay: function(theFieldName, theIsDisplayed){
	    	var tmpIsDisplayed = (theIsDisplayed != false);
	    	var tmpField = this.fields[theFieldName];
	    	if( tmpField ){
	        	tmpField.isHidden = !theIsDisplayed;
	        	this.setAreaDisplay('fldwrap-' + theFieldName, theIsDisplayed);
	    	} else {
	    		console.log( "Error: Field does not exist " + theFieldName);
	    	}
	    },
	    //--- Return the raw DOM object of the requsted field
	    getFieldDom: function(theFieldName){
	    	return this.formObj[theFieldName];
	    },
	    //--- Set focus to the specified field
	    gotoField: function(theFieldName){
	    	var tmpDom = this.getFieldDom(theFieldName);
	    	if( tmpDom && tmpDom.focus ){
	    		tmpDom.focus()
	    	} else {
	    		if( tmpDom.control && tmpDom.control.focus ){
	    			tmpDom.control.focus()
	    		}
	    	}
	    },
	    markFieldValid: function(theFieldName, theIsValid, theInvalidText){
	    	var tmpLabelID = 'ffl_' + theFieldName;
	    	var tmpErrorID = 'ffe_' + theFieldName;
	    	var tmpLabel = CLC.byId(tmpLabelID);
	    	var tmpErrDiv = CLC.byId(tmpErrorID);
	    	if( tmpLabel ){
	    		if( theIsValid ){
	    			CLC.removeClass(tmpLabelID, 'ibm-error')
	    		} else {
	    			CLC.addClass(tmpLabelID, 'ibm-error')
	    		}
	    	}
	    	core.setAreaDisplay(tmpErrorID, !theIsValid);
	    	var tmpInvalidText = theInvalidText || '';
	    	if( tmpErrDiv ){
	    		tmpErrDiv.innerHTML = (theIsValid & tmpInvalidText) ? '' : tmpInvalidText;
	    		this.setAreaDisplay(tmpErrDiv.id, (tmpErrDiv.innerHTML != ''));
	    	}
	    	
	    	
	    	
	    },
	    submitForm: function() {
	    	this.formObj.submit();
	    },
	    //--- Run all validations for all fields on the form
	    // Returns true if passed, false if not.  Shows the message
	    validate: function(theOptions) {	    
	    	var options = theOptions || {};
	    	var tmpOut = '';
	    	var isValid = true;
	    	var tmpGotoField = '';
	    	this.refreshTranslations();
	    	this.trimAllFields();
	    	this.invalidFieldList = [];

	    	var tmpThisFormSpecs = core.data.form.formSpecs[this.formName] || {};
	    	
	    	var tmpFieldClearDefault = false;
	    	if( 'Always' == tmpThisFormSpecs.autoClearBlankFields){
	    		tmpFieldClearDefault = true;
	    	}
	    	
	    	for (var i = 0 ; i < this.fieldNames.length ; i++){
		    	var tmpFN = this.fieldNames[i]
	    		var tmpField = this.fields[tmpFN];
		    	
		    	if(core.data.ibmVersion == 'v18'){
					this.markFieldValid(tmpFN, true)
				}
		    	
		    	var tmpAutoClear = tmpFieldClearDefault;
		    	if (tmpField.autoClearBlank == 'Always'){
		    		tmpAutoClear = true;
		    	} else if (tmpField.autoClearBlank == 'Never'){
		    		tmpAutoClear = false;
		    	}
		    	
		    	if( tmpAutoClear && tmpField.controlType != 'Hidden' && tmpField.controlType != 'Display Only'  && tmpField.controlType != 'Number' ){
		    		if( tmpField.isHidden === true){
		    			var tmpVal = this.getFieldValue(tmpField.fieldName);
		    			if( tmpVal ){
			    			this.setFieldValue(tmpField.fieldName, '', {ignoreStates: true});
		    			}
		    		}
		    	}

	    		if (tmpField ){
	    			var tmpIsValid = true;
	    			
		    		/*
					if( tmpField.isControl && !tmpField.control){
		    			if( dijit && dijit.byId ){
		    				tmpField.control = dijit.byId(tmpField.id);
		    			}
		    		}
		    		*/

		    		if( tmpField.validations || tmpField.controlType == 'Number' ){
		    			//--- convert to an array
		    			var tmpValidations = tmpField.validations || '';
		    			if( !$.isArray(tmpValidations)){
		    				tmpValidations = [tmpValidations];
		    			}
		    			if(tmpField.controlType == 'Number' ){
		    				
		    				if( tmpValidations[0] == '' ){
		    					tmpValidations[0] = 'isnumber'
		    				} else {
			    				tmpValidations.push('isnumber');
		    				}
		    			}
	
		    			var tmpVLen = tmpValidations.length;
	
		    			for( var iVLen = 0 ; iVLen < tmpVLen ; iVLen++){
		    				var tmpValidation = tmpValidations[iVLen];
		    				if( tmpValidation ){
				    			if( typeof tmpValidation == 'string' ){
				    				tmpValidation = {name:tmpValidation};
				    			}
				    			//var tmpFunc = ((tmpValidation.name) && this.validations.hasOwnProperty(tmpValidation.name)) ? this.validations[tmpValidation.name] : tmpValidation;
				    			//--- JF: Hotfix 4-4-2017
				    			// *** was looking for .name, but now functions have a (.name) many times, causing the failure, rewrote to check for type function else assume
				    			var tmpFunc = (typeof(tmpValidation) == 'function') ? tmpValidation : (tmpValidation.name ? this.validations[tmpValidation.name] : false);
				    			
				    			if( (typeof tmpFunc == 'function') ){
				    				var tmpResults = tmpFunc(tmpField,this);
				    				if (tmpResults != '' ){
				    					tmpIsValid = false;
										isValid = false;
										if( tmpOut != '' ){
											//tmpOut += '\n';
											tmpOut += '<br />';
										}
										tmpOut += tmpResults;
										if(core.data.ibmVersion == 'v18'){
											this.markFieldValid(tmpFN, false, tmpResults);
											this.invalidFieldList.push('' + (tmpField.fieldLabel || tmpField.fieldName))
										}
				    				}
				    			}
			    			}
		    			}
		    		}
		    		if (tmpIsValid && tmpField.isRequired  && (tmpField.isHidden !== true)){
		    			var tmpFormField = this.formObj[tmpField.fieldName];
			    		var tmpValue = (tmpField.control && tmpField.control.getValue ) ? tmpField.control.getValue() : tmpFormField.value;
			    		if( tmpValue == null ) tmpValue = '';
	
			    		if( tmpField.controlType == 'Radio' || tmpField.controlType == 'Checkbox' ){
			    			tmpValue = this.getCheckedValues(tmpFormField);
			    		}
	
			    		if( tmpValue == '' ){
							if( !tmpGotoField ){
								tmpGotoField = tmpField.fieldName;
							}
							isValid = false;
							if( tmpOut != '' ){
								//tmpOut += '\n';
								tmpOut += '<br />';
							}
							var tmpAlertReqMessage = tmpField.requiredMessage || tmpField.fieldLabel || '';
							tmpOut += tmpAlertReqMessage;

							if( !tmpField.requiredMessage ){
								var tmpDefaultRequired = 'Required';
								if( typeof(this.defaultRequiredText) == 'string' ){
									tmpDefaultRequired = this.defaultRequiredText;
								}
								if( tmpDefaultRequired ){
									tmpField.requiredMessage = tmpDefaultRequired;
								}
							}
							if(core.data.ibmVersion == 'v18'){
								this.markFieldValid(tmpFN, false, tmpField.requiredMessage);
							}
						}	
		    		}
		    		
	    		
	    		}
	    	}
			var tmpValidationOut = document.getElementById('core-form-validation-header');
			if (tmpValidationOut){
				tmpValidationOut.innerHTML = '';
			}

	    	if( !isValid ){
	    		if (tmpValidationOut && this.validationHeader){
	    			tmpValidationOut.innerHTML = '' + this.validationHeader + '<br /><br />' + core.replaceAll(tmpOut, '\n', '<br />');
				}
	    		if( options.quietMode !== true ){
	    			if( this.validationHeader ){
	    				//tmpOut = this.validationHeader + '\n\n' + tmpOut;
	    				tmpOut = this.validationHeader + '<br /><br />' + tmpOut;
	    			}
	        		//alert(tmpOut);
	        		showDialog("<p alight-'center' style='color:red'><b>" + core.form.getFieldValue('lc_ValidationMsg') + "</b></p>" + tmpOut);
	        		var tmpField = this.fields[tmpGotoField];
	        		if( tmpField && tmpField.control ){
	        			tmpField.control.focus();
	        			if( tmpField.control.toggleDropDown ){
	        				tmpField.control.toggleDropDown();
	        			}
	        		} else {
	    	    		var tmpGFObj = this.formObj[tmpGotoField];
	    	    		if( tmpGFObj && tmpGFObj.focus ){
	    	    			tmpGFObj.focus();
	    	    		} else if(tmpGFObj && tmpGFObj[0] && tmpGFObj[0].focus) {
	    	    			tmpGFObj[0].focus();
	    	    		} else {
	    	    			//not focused
	    	    		}
	        		
	        		}
	    		}
		    	return false;
	    	}
	    	if (tmpValidationOut){
	    		tmpValidationOut.innerHTML = '';
			}
	    	return true;
	    }
		,	 	
	    //--- Internally used to manually run the updates related to a field value
	    runFieldState: function(theFieldName) {		
			var tmpField = this.fields[theFieldName];
	    	if (!tmpField) return false;
	    	this.runFieldTranslation(theFieldName);
	    	var tmpState = tmpField.updates || false;
		    if(tmpState && (typeof tmpState == 'function')){
		    	tmpState(tmpField, this)
		    } else if(tmpState && (typeof tmpState == 'object')){
				this.runFormState(tmpField, this)		    
		    } else {
				if( CLC.site.form.hasBeenSubmitted === true ){
					CLC.site.form.validate({quietMode:true});
				}
		    };
	    	return true;
	    }
		,	 	
	    //--- Internally used to manually run the translations related to a field value
	    runFieldTranslation: function(theFieldName) {
			var tmpField = this.fields[theFieldName];
	    	if (!tmpField) return false;
	    	var tmpTrans = tmpField.translations || false;
			
		    if(tmpTrans && (typeof tmpTrans == 'function')){
				var tmpOrigResults = this.getFieldValue(theFieldName);
				var tmpResults = tmpOrigResults;
		    	tmpResults = tmpTrans(tmpField, this);
		    	if( tmpResults != tmpOrigResults ){
		    		this.setFieldValue(theFieldName, tmpResults, {ignoreStates: true})		
		    	}
		    } else if(tmpTrans && (typeof tmpTrans == 'object')){
		    	return this.runFormTranslation(tmpField, this)		    
		    };	    
	    	return true;
	    }
		,	 	
	    //--- Initialize form
		//  - updates, validations and translations - common routines called by name
		//  - fieldPlugins - Object that contains details about fields such as validations and other properties.  Object: fieldName: {details:'here'} format.
		
		//Note: Publishes /corelan/form/ + <formname> - when done 
	    init: function(theOptions) {
	    	var options = theOptions || {};
	    	//--- If we do not have specs, nothing to do
	    	if (!options.spec) return;
	    	
	    	//--- Get the specs for this form
	    	var tmpFormSpec = options.spec || false;
	
	    	//--- If there are common form level updates/valitations or translations, add them in
			if( tmpFormSpec.updates ){
				CLC.mixin(this.updates, tmpFormSpec.updates);
			}
			if( tmpFormSpec.validations ){
				CLC.mixin(this.validations, tmpFormSpec.validations);
			}	    	
			if( tmpFormSpec.translations ){
				CLC.mixin(this.translations, tmpFormSpec.translations);
			}	    	
	    	
	    	//--- If a list of fields was provided (not usually) use them
	    	var tmpFields = options.fields || false;
	
	    	//--- If a specific form name was provided, use that above all others
			var tmpFormName = tmpFormSpec.formName;
			this.formName = tmpFormName;
			
	    	var tmpFieldNames = options.fieldNames || false;
	
			if( tmpFields ){
				this.fields = tmpFields;
			}
	
			
	    	//--- Get the related <form> dom object and save it as formObj
			this.formObj = CLC.byId('form-' + tmpFormName);
			
	    	//--- Not usually used, but a list of field names can be provided
	    	//--- Normally it will do the routine below and determine the fields in the
			//      correct order (for valiation, etc).
			if( tmpFieldNames ){
				this.fieldNames = tmpFieldNames;
			} else {
				var tmpLen = this.formObj.length;
				var tmpFA = {};
				for (var i=0;i < tmpLen;i++)
				  {
				  	var tmpFFName = this.formObj.elements[i].name;
				  	if (tmpFFName && this.fields[tmpFFName]){
						if( !this.fieldNames ){
							this.fieldNames = [tmpFFName]
							tmpFA[tmpFFName] = true;
						} else {
							//--- first created, add if not added already
							if (!tmpFA[tmpFFName]){
								this.fieldNames.push(tmpFFName);
								tmpFA[tmpFFName] = true;
							}
						}
				  	}
				  }				
			}
	
	    	//--- If special details about the fields were passed in, grab that
	    	/*
	    	 * Example: tmpFormSetup.fieldPlugins = { 
	    	 * 			 fieldName1: {validations: 'trim'},
	    	 * 			 fieldName2: {updates: function(theField, theForm, theOptions){}},
	    	 *           fieldName3: {updates: {name:'showif', fieldName:'other_field'}
	    	 * 			}
	    	 * */
			//--- backward compatible name fieldTags can still be used * 
			if (options.fieldTags && !options.fieldPlugins){
				options.fieldPlugins = options.fieldTags
			}
	
			var fieldSpecs = options.fieldPlugins || tmpFormSpec.fieldPlugins || {};
	
	        //--- If special details about common attributes to set on many fields, use those
	    	/*
	    	 * Example: tmpFormSetup.fieldPlugins = { 
	    	 * 			 help: {
	    	 * 					fieldName1: 'help for field 1',
	    	 * 					fieldName2: 'help for field 2'
	    	 * 					},
	    	 *           validations: {
	    	 *           	fieldName1: 'ccard',
	    	 *           	fieldName2: 'ccard'
	    	 *           }
	    	 * 			}
	    	 * */
	        var listTags = options.listTags || tmpFormSpec.listTags || {};
	        if (listTags) {
	            for (aTagName in listTags) {
	                var myTagFields = listTags[aTagName];
	                for (aFieldName in myTagFields) {
	                    var mySpecField = fieldSpecs[aFieldName];
	                    if (!mySpecField) {
	                        mySpecField = {};
	                        fieldSpecs[aFieldName] = mySpecField;
	                    }
	                    fieldSpecs[aFieldName][aTagName] = myTagFields[aFieldName];
	                }
	            }
	        }
			
	    	//--- Loop through all the fields and prep the form
	    	for (aField in this.fields){
	    		var tmpField = this.fields[aField];
				if( fieldSpecs[tmpField.fieldName] ){
				    CLC.mixin(tmpField, fieldSpecs[tmpField.fieldName]);
				}
				if( tmpField.validations ){
					if (typeof tmpField.validations == 'string'){
						tmpField.validations = {'name':tmpField.validations}
					}
				}
	
				if( true ){ //tmpField.updates || tmpField.translations
					if( (typeof tmpField.updates) == 'string' ){ 
						tmpField.updates = {name:tmpField.updates}
					}
					if( (typeof tmpField.translations) == 'string' ){ 
						tmpField.translations = {name:tmpField.translations}
					}
					
					var tmpFF = CLC.byId(tmpField.id)
					
					if( tmpField.controlType == 'Radio' || tmpField.controlType == 'Checkbox'){
						var tmpWrap = CLC.byId('fldwrap-' + tmpField.fieldName );
	
						if( typeof tmpField.updates == 'function'){
							var tmpStateFunc = tmpField.updates;
							this.updates['update_for_' + tmpField.fieldName] = tmpStateFunc;
							tmpField.updates = {name:'update_for_' + tmpField.fieldName};
						}
						if( typeof tmpField.translations == 'function'){
							var tmpFunc = tmpField.translations;
							this.translations['translation_for_' + tmpField.fieldName] = tmpFunc;
							tmpField.translations = {name:'translation_for_' + tmpField.fieldName};
						}
						var tmpNodes = $('[name=' + tmpField.fieldName + ']');
						  
						tmpNodes.coreform = this;
						var tmpCoreForm = this;
						tmpNodes.each(function(){
							//--- new temp this
						    this.coreform = tmpCoreForm;
						});
						
						var tmpShowWidgets = (IBMCore.common.util.config.get("contentwidgets.enabled") === true); //core.data.formShowWidgets == true; //IBMCore.common.util.config.get('contentwidgets.enabled');
						
						//if( tmpShowWidgets == false ){
							tmpField.onClickEvent = tmpNodes.bind( "click", null, this.runFormState);
							tmpField.onChangeEvent = tmpNodes.bind( "change", null, this.runFormState);
						//}
						
					} else if( tmpFF ){
	
						
						if( (typeof(tmpField.updates)) == 'function'){
							var tmpStateFunc = tmpField.updates;
							this.updates['update_for_' + tmpField.fieldName] = tmpStateFunc;
							tmpField.updates = {name:'update_for_' + tmpField.fieldName};
						}
						if( (typeof(tmpField.translations)) == 'function'){
							var tmpFunc = tmpField.translations;
							this.translations['translation_for_' + tmpField.fieldName] = tmpFunc;
							tmpField.translations = {name:'translation_for_' + tmpField.fieldName};
						}
						
						tmpFF.coreform = this;
						tmpFF = $(tmpFF);
						
						if( tmpField.controlType != 'Text' ){
							tmpFF.bind("click", tmpFF, this.runFormState);
						}
						tmpFF.bind("blur", tmpFF, this.runFormState);
						tmpFF.bind("change", tmpFF, this.runFormState);
					}
		
				}
				
	    	}
	    	this.refreshState();
	    },
	    //--- Internally used to run a form state (update) when action take on form
	    runFormState: function(theField, theForm){
			var tmpField = theField;
			var tmpForm = theForm;
	    	if( !theForm){
	    		tmpForm = this.coreform;
	    		tmpField = tmpForm.fields[this.name];
	    	}
	    	if( tmpField.translations ){
	    		tmpForm.runFormTranslation(tmpField, tmpForm);
	    	}
	
	    	var tmpStates = tmpField.updates;
			if( tmpStates ){
				var tmpStateName = tmpStates.name;
				var tmpState = tmpForm.updates[tmpStateName];
		
				if( (typeof tmpState) == 'function'){
					tmpState(tmpField,tmpForm);
				}				
			};
			//JF 4-7-2016 - Moved call to validate to end
	    	if( CLC.site.form.hasBeenSubmitted === true ){
	    		CLC.site.form.validate({quietMode:true});
	    	}

			return true;
	    }
		,
	    //--- Internally used to run a form translation when needed
	    runFormTranslation: function(theField, theForm){
	
			var tmpField = theField;
			var tmpForm = theForm;
			
	    	if( !theForm){
	    		tmpForm = this.coreform;
	    		tmpField = tmpForm.fields[this.name];
	    	}
	    	
			var tmpTrans = tmpField.translations; 
			if( !tmpTrans ){return false };
			var tmpTran = false;
			if( (typeof tmpTrans) != 'function' && tmpTrans.name){
				var tmpTranName = tmpTrans.name;
				tmpTrans = tmpForm.translations[tmpTranName];
			}
			if( (typeof tmpTrans) == 'function'){
				var tmpOrig = theForm.getFieldValue(theField.fieldName);
				var tmpResults = tmpTrans(tmpField,tmpForm);
				if( tmpResults != tmpOrig){
					theForm.setFieldValue(theField.fieldName, tmpResults, {ignoreStates: true});
				}		
			}
		    
	    }
		,
	    setSubmitButtons: function(theIsBeingSubmitted) {
			var tmpBtnS = CLCore.byId('btn-submit');
			var tmpBtnC = CLCore.byId('btn-cancel');
			var tmpBtnSpinner = CLCore.byId('btn-submit-spinner');
			
			if( tmpBtnS ){
				$(tmpBtnS).attr('disabled',theIsBeingSubmitted);
			}
			if( tmpBtnC ){
				$(tmpBtnC).attr('disabled',theIsBeingSubmitted);
			}
			if( tmpBtnSpinner ){
				this.setAreaDisplay('btn-submit-spinner', theIsBeingSubmitted)
			}

	    }
		,		
	    //--- Link to this to submit the form with validation
		submit: function(theOptions){
			var tmpOptions = theOptions || {};
			
			if (tmpOptions.skipValidation === true){
				return this.formObj.submit();
			}
			
			this.setSubmitButtons(true);
			
			var tmpValid = this.validate();
			CLC.site.form.hasBeenSubmitted = true;
			
			if( tmpValid ){
				if( this.submitValidation && typeof(this.submitValidation) == 'function' ){
					var tmpSubmitValid = this.submitValidation();
					if( tmpSubmitValid === true || tmpSubmitValid === '' ){
						return this.formObj.submit();
					} else {
						if(tmpSubmitValid != false){
							//alert(tmpSubmitValid);
							showDialog('<p align="center" style="color:red"><b>Required fields must be completed</b></p>' + tmpSubmitValid);
						}
						return;
					};
				} else {
					return this.formObj.submit();	
				}
			}	
			this.setSubmitButtons(false);
			return false;
		}
		,
	    //--- Used to submit this form via ajax.  Run theReturnFunction when done.
		ajaxSubmit: function(theReturnFunction, theForm, theOptions){
			var tmpOptions = theOptions || {};
			tmpOptions.handleAs = tmpOptions.handleAs || "object";
			
			var tmpSpec = {
			  form: 'form-' + this.formName,
			  handle: theReturnFunction
			};
			tmpSpec = CLC.mixin(tmpSpec,tmpOptions);
		 	//WASDJ.xhrPost(tmpSpec);
		 	// TO DO AJAX		
		}
		,
		constructor: function(args) {
	    	
	    }
	};
   		


	forms.Form = function(args) {
		this.validations.isnumber = this.isFieldNumeric;
	    var options = args || {};
	    CLC.mixin(this,options);
	}
	forms.Form.prototype = formProto;
	

	
})(jQuery, IBMCore, CLCore);



/** 
	Core features needed for a site page
	* In previous version, this is called core.
	* For backward compatibility reasons, core is defined
	* as an instance of this object
	* 
	* Usage Examples: 
	*    core.setAreaDisplay('someid', true)
	*    
	*    console.log(core.data.anythingInData);
	*     .data loaded on the backend using XPage.addData  
	
	
	
	@class CLCore.site
	
**/
(function($, IBM, CLC) {
 
	var site = IBM.namespace(CLC, "site");

	var myEvents = IBM.common.util.eventCoordinator(site, 'site', ['ready', 'dataready','formsready']);
		

	$.extend(true, site, {
	_version: '2.00.002',
	getVersion: function(){
		return this._version;
	},
    formPlugins: {},
    forms:{},
    data: {},
    defaultForm:'',
    dialogs: {}
    ,

    //--- Internally used to load backend data to the front end using a textarea
    loadClientData: function(){
		try {
			var tmpData = CLC.byId('core-common-data-object') || {};
			if( tmpData.value ){tmpData = tmpData.value};

			var tmpDataObj = CLC.fromJson(tmpData);
			$.extend(true, this.data, tmpDataObj);
		} catch (ex) {
			//--> 'Error loading data ' + ex.toString();
		}
		myEvents.publish("dataready");
		
    }
    ,
    //--- Call to init all forms on this page
    //-- theFormsSetup is optional, pulling details from the forms and fields for setup needs

    initForms: function(theFormsSetup){


    	if (!( CLC.site.data.form && CLC.site.data.form.formNames && CLC.site.data.form.formNames.length )){
    		return;
    	};
    	var tmpFormsSetup = theFormsSetup || {};
    	
    	var tmpPlugins = false;
    	if( window.coreSetup ){
    		tmpPlugins = window.coreSetup.formPlugins || false;
    	}
    	//--- if we have plug ins - use them
    	if (tmpPlugins) {
    		for (var aPlugin in tmpPlugins){
    			var tmpPluginName = '' + aPlugin ;
    			if( tmpPluginName ){
        			var tmpFormConfig = {formName: tmpPluginName, fieldPlugins: tmpPlugins[aPlugin]};
        			if( tmpPluginName ){
        				if( tmpFormsSetup[tmpPluginName] ){
        					if( tmpFormsSetup[tmpPluginName].fieldPlugins ) {
        						CLC.mixin(tmpFormsSetup[tmpPluginName].fieldPlugins, tmpFormConfig.fieldPlugins);
        					} else {
        						tmpFormsSetup[tmpPluginName] = tmpFormConfig
        					}    					 
        				} else {
        					tmpFormsSetup[tmpPluginName] = tmpFormConfig;
        				}
        			}
    			}
    		}		
    	}	


    	
    	var tmpDefaultForm = '';
    	var tmpDefaultFormConfig = tmpFormsSetup.defaultForm;
    	var tmpLen = CLC.site.data.form.formNames.length;
    	var tmpDefaultName = '';
    	if(tmpLen == 1 && typeof(tmpDefaultFormConfig) == 'object') {
    		tmpFormsSetup = {};
			tmpDefaultName = CLC.site.data.form.formNames[0];
			tmpDefaultForm = tmpDefaultName;
			tmpFormsSetup[tmpDefaultName] = tmpDefaultFormConfig;
    	}
		
    	if( tmpLen > 0){
    		for (var i = 0 ;  i < tmpLen ; i++ ){
    			var tmpFormName = CLC.site.data.form.formNames[i];
				var tmpFormSpec = CLC.site.data.form.formSpecs[tmpFormName];
				var tmpFieldSpecs = CLC.site.data.form.fieldSpecs;
		
				var tmpSetup = tmpFormsSetup[tmpFormName] || {};
				if( tmpSetup.isDefault === true  || tmpDefaultForm == ''){
					tmpDefaultForm = tmpFormName; 
				}

				tmpSetup.formName = tmpFormName;
				tmpSetup.formFrameSpec = tmpFormSpec;
				tmpSetup.spec = tmpSetup.spec || {};
				if( tmpSetup.spec ){
					tmpSetup.spec.formName = tmpFormName;
					tmpSetup.fields = tmpFieldSpecs;
					CLC.site.initForm(tmpSetup);
				}
    		}

    		
    		if( !tmpDefaultForm  ){
    			tmpDefaultForm = CLC.site.data.form.formNames[0];
    		}
    		
    		CLC.site.defaultForm = tmpDefaultForm
    		if( typeof CLC.site.form == 'undefined'){
        		CLC.site.form = CLCore.site.forms[CLC.site.defaultForm];
    		}

    	}
    	myEvents.publish('formsready');
    	
    	
    }
    ,
    triggerReady: function(theOptions){
    	myEvents.publish('ready');
    }
    ,
    //-- Internal use only
    initForm: function(theOptions){
		if( !theOptions || !theOptions.spec){return};
		
		//var tmpForm = new corelan.site.form();
		var tmpForm = new CLC.forms.Form();
		CLC.site.form = tmpForm;
		tmpForm.init(theOptions);
		CLC.site.forms[theOptions.spec.formName] = tmpForm;		
	}
	,
    //-- Utility function to encode a URL
    encodeURL: function(theVal){
    	var tmpRet = encodeURI(theVal);
    	tmpRet = this.replaceAll(tmpRet, '&','%26');
    	return tmpRet;
    }
    ,
    replaceAll : CLCore.replaceAll
    ,
    byId : CLCore.byId
    ,
    //-- Show or hide an area on the page by id
    //-- theArea can be a single string ID or an array of IDs
    setAreaDisplay: function(theArea, theIsDisplayed){
    	if( !theArea ) return;
    	var tmpArea = false;
    	if( (typeof theArea) == 'string'){
    		tmpArea = CLC.byId(theArea);
    		if( tmpArea ){
				tmpArea.style.display = theIsDisplayed ? '' : 'none';	    		
    		}
    	} else if( theArea.length ){
			var tmpLen = theArea.length;
			for( var i = 0 ; i < tmpLen ; i++ ){
				tmpArea = CLC.byId(theArea[i]);
	    		if( tmpArea ){
					tmpArea.style.display = theIsDisplayed ? '' : 'none';	    		
	    		}
			}
    	}
    }
    ,
    //-- Set the HTML content of an area on the page by id
    //- theArea - the ID or object to set
    setAreaHTML: function(theArea, theHTML){
    	var tmpArea = theArea;
    	if( (typeof tmpArea) == 'string'){
    		tmpArea = CLC.byId(tmpArea);
    	}
		if( !tmpArea ) return;
		tmpArea = $(tmpArea);
		if( !tmpArea.html ) return;
	    tmpArea.html(theHTML);
    }
    ,
    //-- NO LONGER USED
    addDialog: function(theOptions){
    
    }
    ,
    //-- NO LONGER USED
    ibmUpdateAjaxPage: function(){
		
    }
    ,
    //-- TODO
    getDialog: function(theId){
    	if( !theId ){return false};
    	//return CLC.site.dialogs[theId];
    }
})
 
	site.byId = CLC.byId;

 	site.init = function(){
 		this.loadClientData();
 	}
 
	
})(jQuery, IBMCore, CLCore);