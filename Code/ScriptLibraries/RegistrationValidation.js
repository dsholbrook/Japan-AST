function validateAll() {
	var frm = document.getElementById('form-xp_v18enrollall');
	var sFailed = "";
   	var oGoto = "";
   	var temp;
   	var validateDoubleByte;
   	var validateSingleByte;
   	var tmpValue = '';
   	var numChars = 0;
   	var tmpLabel = '';
   	var stringSize = 0;
   	var rp_SessionButtonType = '';
   	
	if (frm.validateSessions.value == 'true') {
		validateSessions = true;
	} else {
		validateSessions = false;
	}
	
	rp_SessionButtonType = frm.rp_SessionButtonType.value;
	
	if (frm.validateDoubleByteFields.value == 'true') {
		validateDoubleByte = true;
	} else {
		validateDoubleByte = false;
	}
	
	if (frm.validateSingleByteFields.value == 'true') {
		validateSingleByte = true;
	} else {
		validateSingleByte = false;
	}
	
	// Validate the sessions and tracks. Ensure only 1 session is picked per time slot.
	if (validateSessions) {
		temp = sessionValidation(sFailed, oGoto, rp_SessionButtonType);
		sFailed += temp[0];
		oGoto = temp[1];
	}
	
	if (validateDoubleByte) {
		temp = doubleByteValidation(sFailed, oGoto, frm)
		sFailed += temp[0];
		oGoto = temp[1];
	}
	
	if (validateSingleByte) {
		temp = singleByteValidation(sFailed, oGoto, frm)
		sFailed += temp[0];
		oGoto = temp[1];
	}
	
	if(!clc_isTextEmpty("en_email")) {
		var evalid = clc_checkEmail(clc_getTextValue("en_email"));
		if(evalid != "yes") {
			tmpLabel = $("label[for='en_email']").text();
			sFailed += tmpLabel + "\n";
			if(oGoto == ""){
				oGoto = clc_getElementByFieldName("en_email");
			}
		}
	} else {
		tmpLabel = $("label[for='en_email']").text();
		sFailed += tmpLabel + "\n";
		if(oGoto == ""){
			oGoto = clc_getElementByFieldName("en_email");
		}
	}
	
	if(sFailed != ""){
		sFailed = sFailed.replace(/\n/g,"<br />");
		sFailed = frm.lc_ValidationMsg.value + "<br /><br />" + sFailed;
		// Show the errors
		document.getElementById('errorMsgs').innerHTML = '<p class="ibm-error"><strong>' + sFailed + '</strong></p>';			
		document.getElementById('errorMsgs').style.display = 'block';
		document.anchors.item('showErrors').scrollIntoView();
		showDialog(sFailed);
		//alert('return false');
		return false;
	} else {
		// The form passed validation so continue with submit.
		document.getElementById('errorMsgs').style.display = 'none';
		//alert('return true');
		return true;
	}
}

function sessionValidation(sFailed, oGoto, rp_SessionButtonType) {
	
	int_ctrTotalSessions = 0;
	
	// Day 1
	for (var s=1; s <= 10; s++) {
		int_ctr = 0;
		var str_s = String(s);
		if(clc_isAvailable("en_d1numTracks")){
			if (rp_SessionButtonType != 'Radio button') {
				for (var x=1; x <= clc_getTextValue("en_d1numTracks"); x++){
					var str_x = String(x);
					if (clc_getCheckValue("en_d1t" + str_x + "s" + str_s + "tc") != "") {
						int_ctr += 1;
						int_ctrTotalSessions += 1;
					}
				}
			} else {
				if (clc_getRadioValue("en_d1" + "s" + str_s + "tc") != "") {
					int_ctr += 1;
					int_ctrTotalSessions += 1;
				}
			}
			
			if (int_ctr > 1) {
				sFailed += clc_getTextValue('SVMsg')+" ("+clc_getTextValue('DayTxt')+" 1, "+clc_getTextValue('SessionTxt')+" "+str_s+")\n";
				if (oGoto == "") {
					if (rp_SessionButtonType != 'Radio button') {
						oGoto = clc_getElementByFieldName("en_d1t1s1tc");
					} else {
						oGoto = clc_getElementByFieldName("en_d1s1tc");
					}					
				}
			}
		}
	}
	
	// Day 2
	for (var s=1; s <= 10; s++) {
		int_ctr = 0;
		var str_s = String(s);
		if(clc_isAvailable("en_d2numTracks")){
			if (rp_SessionButtonType != 'Radio button') {
				for (var x=1; x <= clc_getTextValue("en_d2numTracks"); x++){
					var str_x = String(x);
					if (clc_getCheckValue("en_d2t" + str_x + "s" + str_s + "tc") != "") {
						int_ctr += 1;
						int_ctrTotalSessions += 1;
					}
				}
			} else {
				if (clc_getRadioValue("en_d2" + "s" + str_s + "tc") != "") {
					int_ctr += 1;
					int_ctrTotalSessions += 1;
				}
			}
			
			if (int_ctr > 1) {
				sFailed += clc_getTextValue('SVMsg')+" ("+clc_getTextValue('DayTxt')+" 2, "+clc_getTextValue('SessionTxt')+" "+str_s+")\n";
				if (oGoto == "") {
					if (rp_SessionButtonType != 'Radio button') {
						oGoto = clc_getElementByFieldName("en_d2t1s1tc");
					} else {
						oGoto = clc_getElementByFieldName("en_d2s1tc");
					}					
				}
			}
		}
	}
	
	// Day 3
	for (var s=1; s <= 10; s++) {
		int_ctr = 0;
		var str_s = String(s);
		if(clc_isAvailable("en_d3numTracks")){
			if (rp_SessionButtonType != 'Radio button') {
				for (var x=1; x <= clc_getTextValue("en_d3numTracks"); x++){
					var str_x = String(x);
					if (clc_getCheckValue("en_d3t" + str_x + "s" + str_s + "tc") != "") {
						int_ctr += 1;
						int_ctrTotalSessions += 1;
					}
				}
			} else {
				if (clc_getRadioValue("en_d3" + "s" + str_s + "tc") != "") {
					int_ctr += 1;
					int_ctrTotalSessions += 1;
				}
			}
			
			if (int_ctr > 1) {
				sFailed += clc_getTextValue('SVMsg')+" ("+clc_getTextValue('DayTxt')+" 3, "+clc_getTextValue('SessionTxt')+" "+str_s+")\n";
				if (oGoto == "") {
					if (rp_SessionButtonType != 'Radio button') {
						oGoto = clc_getElementByFieldName("en_d3t1s1tc");
					} else {
						oGoto = clc_getElementByFieldName("en_d3s1tc");
					}					
				}
			}
		}
	}
	
	// Day 4
	for (var s=1; s <= 10; s++) {
		int_ctr = 0;
		var str_s = String(s);
		if(clc_isAvailable("en_d4numTracks")){
			if (rp_SessionButtonType != 'Radio button') {
				for (var x=1; x <= clc_getTextValue("en_d4numTracks"); x++){
					var str_x = String(x);
					if (clc_getCheckValue("en_d4t" + str_x + "s" + str_s + "tc") != "") {
						int_ctr += 1;
						int_ctrTotalSessions += 1;
					}
				}
			} else {
				if (clc_getRadioValue("en_d4" + "s" + str_s + "tc") != "") {
					int_ctr += 1;
					int_ctrTotalSessions += 1;
				}
			}
			
			if (int_ctr > 1) {
				sFailed += clc_getTextValue('SVMsg')+" ("+clc_getTextValue('DayTxt')+" 4, "+clc_getTextValue('SessionTxt')+" "+str_s+")\n";
				if (oGoto == "") {
					if (rp_SessionButtonType != 'Radio button') {
						oGoto = clc_getElementByFieldName("en_d4t1s1tc");
					} else {
						oGoto = clc_getElementByFieldName("en_d4s1tc");
					}					
				}
			}
		}
	}
	
	// Also check that the user selected at least one session
	if(clc_isAvailable("rp_RequireSession")){
		if (clc_getTextValue("rp_RequireSession") == "Yes") {
			if (int_ctrTotalSessions == 0) {
				sFailed += clc_getTextValue('SMissingMsg') + "\n";
				if (oGoto == "") {
					oGoto = clc_getElementByFieldName("en_d1t1s1tcS");
				}
			}
		}
	}
	
	sFailedoGoto = new Array(1);
	sFailedoGoto[0] = sFailed;
	sFailedoGoto[1] = oGoto;
	
	return sFailedoGoto;
}

function clc_isAvailable(strFieldName) {
	if (clc_getElementByID(strFieldName) === undefined || clc_getElementByID(strFieldName) === null) {
		if (clc_getElementByID('ff_'+ strFieldName) === undefined || clc_getElementByID('ff_' + strFieldName) === null) {
			return false;
		} else {
			return true;
		}
	} else {
		return true;
	}
}

function clc_getElementByID(strFieldName) {
	var name = document.getElementById(strFieldName);
	return name;
}

function clc_getTextValue(strFieldName){
	strValue = "";
	var elm = clc_getElementByFieldName(strFieldName);
	if (elm) {
		strValue = elm.value;
	}
	return strValue;
}

function clc_getElementByFieldName(strFieldName) {
	var name = document.getElementsByName(strFieldName)[0];
	return name;
}

function clc_getElementsByFieldName(strFieldName)
{
	var name = document.getElementsByName(strFieldName);
	return name;
}

function clc_getCheckValue(strFieldName) {
	var elm = document.getElementsByName(strFieldName)
	
	var strarrValues = new Array();
	var i
	var j = 0

	for(i = 0; i < elm.length; i++)
	{
		if (elm[i].checked)
		{
			strarrValues[j] = elm[i].value
			j++;
		}
	}
	
	return strarrValues;
}

function getByteLength(normal_val) {
	// Force string type
	normal_val = String(normal_val);

	var byteLen = 0;
	for (var i = 0; i < normal_val.length; i++) {
		var c = normal_val.charCodeAt(i);
		byteLen += 	c < (1 <<  7) ? 1 :
					c < (1 << 11) ? 2 :
					c < (1 << 16) ? 3 :
					c < (1 << 21) ? 4 :
					c < (1 << 26) ? 5 :
					c < (1 << 31) ? 6 : Number.NaN;
    }
	return byteLen;
}

function doubleByteValidation(sFailed, oGoto, frm) {
	
	// Note: It can be triple byte also
	tmpValue = frm.en_last.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if((stringSize/numChars != 3) && (stringSize/numChars != 2)) {
			tmpLabel = $("label[for='en_last']").text();
			sFailed += clc_getTextValue('DBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_last");
			}				
		}
	}
	tmpValue = frm.en_first.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if((stringSize/numChars != 3) && (stringSize/numChars != 2)) {
			tmpLabel = $("label[for='en_first']").text();
			sFailed += clc_getTextValue('DBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_first");
			}				
		}
	}
	tmpValue = frm.en_pronunciation.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if((stringSize/numChars != 3) && (stringSize/numChars != 2)) {
			tmpLabel = $("label[for='en_pronunciation']").text();
			sFailed += clc_getTextValue('DBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_pronunciation");
			}				
		}
	}
	tmpValue = frm.en_title.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if((stringSize/numChars != 3) && (stringSize/numChars != 2)) {
			tmpLabel = $("label[for='en_title']").text();
			sFailed += clc_getTextValue('DBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_title");
			}				
		}
	}
	tmpValue = frm.en_companyname.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if((stringSize/numChars != 3) && (stringSize/numChars != 2)) {
			tmpLabel = $("label[for='en_companyname']").text();
			sFailed += clc_getTextValue('DBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_companyname");
			}				
		}
	}
	tmpValue = frm.en_mailstreet1.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if((stringSize/numChars != 3) && (stringSize/numChars != 2)) {
			tmpLabel = $("label[for='en_mailstreet1']").text();
			sFailed += clc_getTextValue('DBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_mailstreet1");
			}				
		}
	}
	
	sFailedoGoto = new Array(1);
	sFailedoGoto[0] = sFailed;
	sFailedoGoto[1] = oGoto;
	
	return sFailedoGoto;
	
}

function singleByteValidation(sFailed, oGoto, frm) {
	
	tmpValue = frm.en_phone.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if(stringSize/numChars != 1) {
			tmpLabel = $("label[for='en_phone']").text();
			sFailed += clc_getTextValue('SBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_phone");
			}				
		}
	}
	tmpValue = frm.en_zip.value;
	numChars = tmpValue.length;
	stringSize = parseInt(getByteLength(tmpValue));
	if(numChars > 0) {
		if(stringSize/numChars != 1) {
			tmpLabel = $("label[for='en_zip']").text();
			sFailed += clc_getTextValue('SBVMsg') + ': (' + tmpLabel + ')\n';
			if (oGoto == "") {
				oGoto = clc_getElementByFieldName("en_zip");
			}				
		}
	}
	
	sFailedoGoto = new Array(1);
	sFailedoGoto[0] = sFailed;
	sFailedoGoto[1] = oGoto;
	
	return sFailedoGoto;
	
}

function clc_checkEmail(emailStr) {

	/* The following variable tells the rest of the function whether or not
	to verify that the address ends in a two-letter country or well-known
	TLD.  1 means check it, 0 means don't. */

	var checkTLD=1;
	var knownDomsPat=/^(COM|NET|ORG|EDU|GOV|com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum|komatsu|canon)$/;
	var emailPat=/^(.+)@(.+)$/;
	var emailPat2=/^(.+)＠(.+)$/;
	var specialChars="\\(\\)><@,;:\\\\\\\"\\.\\[\\]";
	var validChars="\[^\\s" + specialChars + "\]";
	var quotedUser="(\"[^\"]*\")";
	var ipDomainPat=/^\[(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\]$/;
	var atom=validChars + '+';
	var word="(" + atom + "|" + quotedUser + ")";
	var userPat=new RegExp("^" + word + "(\\." + word + ")*$");
	var domainPat=new RegExp("^" + atom + "(\\." + atom +")*$");
	var matchArray=emailStr.match(emailPat);
	var matchArray2=emailStr.match(emailPat2);
	var value="";

	if (matchArray==null && matchArray2==null) {
		value = "Email address seems incorrect (check @ and .'s)";
		return value;
	}
	var user=(matchArray!=null) ? matchArray[1] : matchArray2[1];
	var domain=(matchArray!=null) ? matchArray[2] : matchArray2[2];

	// Start by checking that only basic ASCII characters are in the strings (0-127).

	for (i=0; i<user.length; i++) {
		if (user.charCodeAt(i)>127) {
			value = "The username contains invalid characters.";
			return value;
	    }	
	}
	for (i=0; i<domain.length; i++) {
		if (domain.charCodeAt(i)>127) {
			value = "The domain name contains invalid characters.";
			return value;
   		}
	}

	// See if "user" is valid 
	if (user.match(userPat)==null) {
		// user is not valid
		value = "The username doesn't seem to be valid.";
		return value;
	}

	/* if the e-mail address is at an IP address (as opposed to a symbolic
	host name) make sure the IP address is valid. */
	var IPArray=domain.match(ipDomainPat);
	if (IPArray!=null) {
		// this is an IP address
		for (var i=1;i<=4;i++) {
			if (IPArray[i]>255) {
				value = "Destination IP address is invalid!";
				return value;
		   }
		}
		value = "yes";
		return value;
	}

	// Domain is symbolic name.  Check if it's valid.
 	var atomPat=new RegExp("^" + atom + "$");
	var domArr=domain.split(".");
	var len=domArr.length;
	for (i=0;i<len;i++) {
		if (domArr[i].search(atomPat)==-1) {
			value = "The domain name does not seem to be valid.";
			return value;
   		}
	}

	/* domain name seems valid, but now make sure that it ends in a
	known top-level domain (like com, edu, gov) or a two-letter word,
	representing country (uk, nl), and that there's a hostname preceding 
	the domain or country. */

	if (checkTLD && domArr[domArr.length-1].length!=2 && 
		domArr[domArr.length-1].search(knownDomsPat)==-1) {
		value = "The address must end in a well-known domain or two letter " + "country.";
		return value;
	}

	// Make sure there's a host name preceding the domain.
	if (len<2) {
		value = "This address is missing a hostname!";
		return value;
	}

	// If we've gotten this far, everything's valid!
	value = "yes";
	return value;
}

function clc_isTextEmpty(strFieldName) {
	if(clc_trim(clc_getElementByFieldName(strFieldName).value) == "") {
		return true;
	} else {
		return false;
	}
}

function clc_ltrim(str) {
	for (var i = 0; i < str.length && (str.charAt(i) == ' ' || str.charAt(i) == '　'); i++);
    return str.substring(i);
}

function clc_rtrim(str){
	for (var i = str.length; i > 0 && (str.charAt(i - 1) == ' ' || str.charAt(i) == '　'); i--);
    return str.substring(0, i);
}

function clc_trim(str){
	return clc_ltrim(clc_rtrim(str));
}

function setField(strField) {
	fldObj = document.getElementById(strField);
	fldDomObj = document.getElementById(strField+'S');
	if (fldObj) {
		if (fldObj.checked==true) {
			if (fldDomObj) {
				fldDomObj.value = fldObj.value;
			}
		} else {
			if (fldDomObj) {
				fldDomObj.value='';
			}
		}
	}
}

function onchangeField(strField) {
	fldObj = document.getElementById(strField);
	fldDomObj = document.getElementById('ff_' + strField+'S');
	if (fldObj) {
		if (fldObj.checked==true) {
			if (fldDomObj) {
				fldDomObj.value = fldObj.value;
			}
		} else {
			if (fldDomObj) {
				fldDomObj.value='';
			}
		}
	}
	fldObjName = fldObj.name;
	elm = clc_getElementsByFieldName(fldObjName)
	for (var i = 0; i < elm.length; i++) {
		if (!elm[i].checked) {
			strElmField = elm[i].id;
			fldDomObj = document.getElementById('ff_' + strElmField+'S');
			fldDomObj.value = '';
		}
	}
}

function clc_getRadioValue(strFieldName) {
	strValue = "";
	
	var elm = document.getElementsByName(strFieldName);
	
	for (i = 0; i < elm.length; i++) 
	{		
		if(elm[i].checked) 
		{
			strValue = elm[i].value;
			break;
		}
	}
	return strValue;
}