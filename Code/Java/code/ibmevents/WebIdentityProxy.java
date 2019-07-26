package code.ibmevents;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
/**
* IBMEventsWebIdentity is a common access point for IBM ID Profile Details 
* 
* @author      Joseph Francis
*/
import java.nio.charset.Charset;
import java.util.Hashtable;
import java.util.Iterator;

import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.commons.util.io.json.JsonParser;

public class WebIdentityProxy {

	private PayloadFetcher fetcher = new PayloadFetcher();
	
	//--- Start with defaults for common IBM ID Profile Boarding for IBM Events
	private String prodUrl 		= "https://w3-gz.ieb.ibm.com/mapi/profilemgmt/run/ibmidprofile/v2/users";
	private String devUrl 		= "https://w3-dev.api.ibm.com/profilemgmt/test/ibmidprofileait/v2/users";

	private String devClientID 	= "9ae6d969-f50a-4c39-a323-d10123ec254c";
	private String devSecret 	= "M0nX3mK0hR3sT0qW8aP3lN0xS8sJ1hB7hE2bY0gB8hM6wC7xP4";

	private String prodClientID = "8480da8a-6494-4663-82ef-4d764c258111";
	private String prodSecret	= "W3iD6vN6aW7mC2rX8mF8nO4fB5bU4eT7xU7rV2jG6iY6sM4xV2";
	
	/**
	 * Set configuration if not using the event defaults
	 *  
	 * @param  theEnv the name of the environment to set
	 * @param  theURL the url to use for this environment
	 * @param  theClientID the clientid to use for this environment
	 * @param  theSecret the secret key to use for this environment
	 */
	public void setConfig(String theEnv,String theURL,String theClientID,String theSecret){
		if( "development".equalsIgnoreCase(theEnv)){
			devUrl = theURL;
			devClientID = theClientID;
			devSecret = theSecret;
		} else {
			prodUrl = theURL;
			prodClientID = theClientID;
			prodSecret = theSecret;
		}
	}
	
	private String envName = "production";

	public WebIdentityProxy(){
		fetcher.init(prodUrl, "application/json" ,false,"","");
		fetcher.setRequestMethod("GET");
	}

	private String getURLForUsername(String theUsername){
		String tmpRet = "";
		if( theUsername.indexOf('@') > -1 ){ 
			if( "development".equalsIgnoreCase(envName)){
				tmpRet = devUrl + "?username=" + theUsername;
			} else {
				tmpRet = prodUrl + "?username=" + theUsername;
			}
		} else {
			if( "development".equalsIgnoreCase(envName)){
				tmpRet = devUrl + "?ibmUniqueID=" + theUsername;
			} else {
				tmpRet = prodUrl + "?ibmUniqueID=" + theUsername;
			}
		}
		
		return tmpRet;
	}
	
	public boolean setEnvironment(String theEnvName){
		if( "production".equalsIgnoreCase(theEnvName) ){
			envName = theEnvName;
		} else if( "development".equalsIgnoreCase(theEnvName) ){
			envName = theEnvName;
		} else {
			return false;
		}
		return true;
	}

	public boolean sendPayload(String thePayload){
		boolean tmpRet = false;
		if( thePayload != null ){
			fetcher.sendPayload(thePayload);
			if( fetcher.statusCode == 200 || fetcher.statusCode == 201){
				tmpRet = true;
			}
		}
		return tmpRet;
	}

	public Hashtable getIBMUserProfile(String theKey){
		
		Hashtable tmpFields = new Hashtable();
		
		String tmpPayload = theKey;
		//--- Assuming username for now, update to use the ID 
		//ToDo: Change to use ID by default / create option for by ID 
		String tmpURL = getURLForUsername(theKey);
		
		if( tmpPayload != null ){
			fetcher.setURL(tmpURL);
			
			fetcher.addHeaderValue("Accept", "application/json");
			fetcher.addHeaderValue("isuserauthenticated", "true");
			
			if( "development".equalsIgnoreCase(envName)){
				fetcher.addHeaderValue("x-ibm-client-id", devClientID);
				fetcher.addHeaderValue("x-ibm-client-secret", devSecret);
			} else {
				fetcher.addHeaderValue("x-ibm-client-id", prodClientID);
				fetcher.addHeaderValue("x-ibm-client-secret", prodSecret);
			}
			
			//=== To the request process
			fetcher.sendPayload(tmpPayload);

			//=== Store the results and the status, etc
			tmpFields.put("status","" + fetcher.statusCode);
			tmpFields.put("results", (fetcher.results));
			tmpFields.put("url","" + tmpURL);
			tmpFields.put("error","" + fetcher.error);
			
			//=== Sample data to use for testing and problem solving
			String tmpJson = "{\"schemas\":[\"urn:ietf:params:scim:schemas:core:2.0:User\",\"urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User\"],\"id\":\"1e535254135f11dc8ed6f1124129b9f4\",\"userName\":\"joefran@us.ibm.com\",\"externalId\":\"383001125377312\",\"userType\":\"Customer\",\"meta\":{\"resourceType\":\"User\",\"created\":\"2015-09-30T07:39:21Z\",\"modificationCount\":\"1\",\"lastModified\":\"2017-12-20T14:47:57Z\",\"userLastModified\":\"2017-12-20T14:47:57Z\",\"visitCount\":\"110\",\"lastVisitTS\":\"2018-04-26T14:32:51Z\",\"lastRetrievalTS\":\"2018-04-26T15:53:03Z\",\"lastLoginTS\":\"2016-10-21T20:28:40Z\"},\"name\":{\"honorificPrefix\": \"Mr.\",\"familyName\":\"Francis\",\"givenName\":\"Joseph\",\"middleName\":\"J\"},\"displayName\":\"8GKD_William_Francis\",\"locale\":\"US\",\"preferredLanguage\":\"en-US\",\"emails\":[{\"value\":\"joefran@us.ibm.com\",\"type\":\"work\",\"primary\":true,\"meta\":{\"created\":\"2016-07-27T10:45:45Z\",\"lastModified\":\"2016-07-27T10:45:45Z\",\"change\":\"C\"}}],\"addresses\":[{\"type\":\"PERSONAL\",\"streetAddress\":\"1302 N N St\",\"locality\":\"Lake Worth\",\"region\":\"USFL\",\"postalCode\":\"33460\",\"country\":\"US\",\"primary\":false},{\"type\":\"PRIMARY\",\"streetAddress\":\"1302 N N St\",\"locality\":\"Lake Worth\",\"region\":\"USFL\",\"postalCode\":\"33460\",\"country\":\"US\",\"primary\":true}],\"phoneNumbers\":[{\"value\":\"561 547 0729\",\"type\":\"work\",\"primary\":true},{\"value\":\"561 547 0729\",\"type\":\"home\",\"primary\":false},{\"value\":\"1469616345857\",\"type\":\"pager\",\"primary\":false,\"meta\":{\"created\":\"2016-07-27T10:45:45Z\",\"lastModified\":\"2016-07-27T10:45:45Z\",\"change\":\"C\"}}],\"urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User\":{\"identity\":{\"provider\":\"IBM w3id\",\"statusCode\":\"U\",\"userNameFormat\":\"email\",\"passwordLastModified\":\"2015-10-26T13:02:21Z\",\"ibmUniqueID\":\"2700008GKD\",\"registrationTS\":\"2015-09-30T07:39:21Z\"},\"business\":{\"profession\": { \"professionalIndustry\": \"MFG\",\"jobTitle\": \"Accountant\"},\"companies\":[{\"companyName\":\"Omnience\",\"primary\":true}]},\"cookies\":[{\"name\":\"IBMISP\",\"value\":\"1e535254135f11dc8ed6f1124129b9f4-1e535254135f11dc8ed6f1124129b9f4-c6759443a575b5f5c60d669771654741\",\"domain\":\".ibm.com\",\"maxAge\":31536000,\"path\":\"/\",\"secure\":false,\"version\":0,\"isHttpOnly\":false}]}}";

			JsonJavaFactory factory = JsonJavaFactory.instanceEx;
			
			try {
				
				//--- Read fetcher.results really
				//--- ** fetcher.results - for actual data
				//--- ** tmpJson - for testing / chopping issues in half
				InputStream stream = new ByteArrayInputStream(fetcher.results.getBytes());
				InputStreamReader r = new InputStreamReader(stream, Charset.forName("UTF-8"));
				
				JsonJavaObject json = (JsonJavaObject) JsonParser.fromJson(factory, r);
				String strUN = json.getString("userName");
				tmpFields.put("userName","" + strUN);
				
				String strID = json.getString("id");
				tmpFields.put("ibmPermRegistrationId","" + strID);
				
				String tmpLang = json.getString("preferredLanguage");
				if( tmpLang != null && !tmpLang.isEmpty()){
					tmpFields.put("preferredLanguage","" + tmpLang);	
				} else {
					tmpFields.put("preferredLanguage","" );
				}

				JsonJavaObject tmpNameObj = (JsonJavaObject)json.getAsObject("name");
				String tmpFN = tmpNameObj.getString("givenName");
				String tmpLN = tmpNameObj.getString("familyName");
				
				if( tmpFN != null && !tmpFN.isEmpty() ){
					tmpFields.put("firstName","" + tmpFN);
				} else {
					tmpFields.put("firstName","");
				}
				if( tmpLN != null && !tmpLN.isEmpty() ){
					tmpFields.put("lastName","" + tmpLN);
				} else {
					tmpFields.put("lastName","");
				}
				String tmpSalutation = tmpNameObj.getString("honorificPrefix");
				if( tmpSalutation != null && !tmpSalutation.isEmpty() ){
					tmpFields.put("salutation","" + tmpSalutation);
				} else {
					tmpFields.put("salutation","");
				}
				String tmpSuffix = tmpNameObj.getString("honorificSuffix");
				if( tmpSuffix != null && !tmpSuffix.isEmpty() ){
					tmpFields.put("suffix","" + tmpSuffix);
				} else {
					tmpFields.put("suffix","");
				}
				
				
				Object arrNames = factory.getProperty(json, "emails");
				String tmpEMailPrimary = "";
				String tmpEMailWork = "";
				String tmpEMailAny = "";
				
				for (Iterator itObj = factory.iterateArrayValues(arrNames); itObj.hasNext();) {
					JsonJavaObject jsObj = (JsonJavaObject)itObj.next();
					String tmpValue = jsObj.getString("value");
					if( jsObj.getBoolean("primary")){
						tmpEMailPrimary = tmpValue;
					} else if( jsObj.getString("type").equalsIgnoreCase("work")){
						tmpEMailWork = tmpValue;
					} else {
						tmpEMailAny = tmpValue;
					}
				}
				String tmpFinalEMail = tmpEMailPrimary;
				if( tmpFinalEMail == null || tmpFinalEMail.isEmpty() ){
					tmpFinalEMail = tmpEMailWork;
				}
				if( tmpFinalEMail == null || tmpFinalEMail.isEmpty() ){
					tmpFinalEMail = tmpEMailAny;
				}
				if (!( tmpFinalEMail == null || tmpFinalEMail.isEmpty()) ){
					//=== We have an e-mail
					tmpFields.put("email","" + tmpFinalEMail);
				}
				
				//--- Business
				JsonJavaObject tmpUserProfileObj = (JsonJavaObject)json.getAsObject("urn:ietf:params:scim:schemas:extension:ibmstandardprofile:2.0:User");
				JsonJavaObject tmpBusObj = tmpUserProfileObj.getAsObject("business");
				if( tmpBusObj != null){
					// Job Title
					String tmpTitle = "";
					JsonJavaObject jsProf = (JsonJavaObject)tmpBusObj.getJsonProperty("profession");
					if( jsProf != null ){
						//=== We have a jobTitle
						tmpTitle = jsProf.getAsString("jobTitle");						
					}
					if( !(tmpTitle != null && !tmpTitle.isEmpty())){
						//=== We do not, set to blank always to have valid / non-null value
						tmpTitle = "";
					}
					tmpFields.put("jobTitle",tmpTitle);
					// Company Name
					Object arrComps = tmpBusObj.getJsonProperty("companies");
					String tmpCompPrimary = "";
					String tmpCompAny = "";
					String tmpFinalCompName = "";
					for (Iterator itObj = factory.iterateArrayValues(arrComps); itObj.hasNext();) {
						JsonJavaObject jsObj = (JsonJavaObject)itObj.next();
						
						String tmpValue = jsObj.getString("companyName");
						if( jsObj.getBoolean("primary")){
							tmpCompPrimary = tmpValue;
						} else {
							tmpCompAny = tmpValue;
						}
					}
					tmpFinalCompName = tmpCompPrimary;
					if( tmpFinalCompName == null || tmpFinalCompName.isEmpty() ){
						//=== We have a companyName
						tmpFinalCompName = tmpCompAny;
					}
					//--- Assure no null value
					if (( tmpFinalCompName == null || tmpFinalCompName.isEmpty()) ){
						tmpFinalCompName = "";
					}
					tmpFields.put("companyName","" + tmpFinalCompName);
				}
				
				//--- Phone Numbers
				Object arrPhones = factory.getProperty(json, "phoneNumbers");
				
				if( arrPhones != null){
					String tmpPhonePrimary = "";
					String tmpPhoneWork = "";
					String tmpPhoneMobile = "";
					String tmpPhoneAny = "";
					
					for (Iterator itObj = factory.iterateArrayValues(arrPhones); itObj.hasNext();) {
						JsonJavaObject jsObj = (JsonJavaObject)itObj.next();
						String tmpValue = jsObj.getString("value");
						if( jsObj.getBoolean("primary")){
							tmpPhonePrimary = tmpValue;
						}
						if( jsObj.getString("type").equalsIgnoreCase("work")){
							tmpPhoneWork = tmpValue;
						} else if( jsObj.getString("type").equalsIgnoreCase("mobile")){
							tmpPhoneMobile = tmpValue;
						} else {
							tmpPhoneAny = tmpValue;
						}
					}
					String tmpDaytimePhone = tmpPhonePrimary;
					if( tmpDaytimePhone == null || tmpDaytimePhone.isEmpty() ){
						tmpDaytimePhone = tmpPhoneWork;
					}
					if( tmpDaytimePhone == null || tmpDaytimePhone.isEmpty() ){
						tmpDaytimePhone = tmpPhoneMobile;
					}
					if( tmpDaytimePhone == null || tmpDaytimePhone.isEmpty() ){
						tmpDaytimePhone = tmpPhoneAny;
					}				
					if (!( tmpDaytimePhone == null || tmpDaytimePhone.isEmpty()) ){
						tmpFields.put("daytimePhoneNumber","" + tmpDaytimePhone);
					}
					if (!( tmpPhoneWork == null || tmpPhoneWork.isEmpty()) ){
						tmpFields.put("workPhoneNumber","" + tmpPhoneWork);
					}
					if (!( tmpPhoneMobile == null || tmpPhoneMobile.isEmpty()) ){
						tmpFields.put("mobilePhoneNumber","" + tmpPhoneMobile);
					}
					//--- Backward Compat - in case used - no longer exists?
					tmpFields.put("daytimeFaxPhoneNumber","");
				}
				
				
				
				
				//--- Address Details
				Object arrAddresses = factory.getProperty(json, "addresses");
				if( arrAddresses != null){
					JsonJavaObject tmpAddressObj = null;
					
					//--- Get Primary or other if primary does not exist but any other does (Personal only)
					for (Iterator itObj = factory.iterateArrayValues(arrAddresses); itObj.hasNext();) {
						JsonJavaObject jsObj = (JsonJavaObject)itObj.next();
						if( jsObj.getString("type").equalsIgnoreCase("PRIMARY")){
							tmpAddressObj = jsObj;
						} else {
							if( tmpAddressObj == null ){
								tmpAddressObj = jsObj;
							}
						}
					}

					String tmpAddress1 = "";
					String tmpAddress2 = "";
					String tmpCity = "";
					String tmpCountry = "";
					String tmpState = "";
					String tmpPostal = "";

					if( tmpAddressObj != null ){
						//--- Get details from address object
						String tmpVal = tmpAddressObj.getAsString("streetAddress");
						if (!( tmpVal == null || tmpVal.isEmpty()) ){
							tmpAddress1 = tmpVal;
						}
						tmpVal = tmpAddressObj.getAsString("locality");
						if (!( tmpVal == null || tmpVal.isEmpty()) ){
							tmpCity = tmpVal;
						}
						tmpVal = tmpAddressObj.getAsString("postalCode");
						if (!( tmpVal == null || tmpVal.isEmpty()) ){
							tmpPostal = tmpVal;
						}
						tmpVal = tmpAddressObj.getAsString("region");
						if (!( tmpVal == null || tmpVal.isEmpty()) ){
							tmpState = tmpVal;
							if( tmpState.length() == 4 && tmpState.startsWith("US")){
								tmpState = tmpState.substring(2, 4);
							}
						}
						tmpVal = tmpAddressObj.getAsString("country");
						if (!( tmpVal == null || tmpVal.isEmpty()) ){
							tmpCountry = tmpVal;
						}
						
					}
					

					tmpFields.put("addressLine1",tmpAddress1);
					//-- No address line 2 in data schema (? verify ?)
					tmpFields.put("addressLine2",tmpAddress2);
					tmpFields.put("city",tmpCity);
					tmpFields.put("stateCode",tmpState);
					tmpFields.put("country",tmpCountry);
					tmpFields.put("postalCode",tmpPostal);


					
				}

				
				
			} catch(Exception ex){
				tmpFields.put("debugError","" + ex.toString());	
			}
			
			if( fetcher.statusCode == 200 || fetcher.statusCode == 201){
				tmpFields.put("success", "true");				
			} else {
				tmpFields.put("success", "false");
			}
		}
		
		return tmpFields;
	}

	public String getLog(){
		return fetcher.log;
	}
	public String getResults(){
		return fetcher.results;
	}
	public String getError(){
		return fetcher.error;
	}
	public String getURL(){
		return fetcher.getURL();
	}
	

}


