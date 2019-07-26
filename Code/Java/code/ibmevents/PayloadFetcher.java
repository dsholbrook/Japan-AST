package code.ibmevents;

/**
* PayloadFetcher is a generic server to server process for 
* accessing XML or JSON data
* 
* The process handles
* <ul>
* <li>SSL and non-SSL connections
* <li>Optional Authentication
* <li>SSL Cert *Spoofing to allow non-certified SSL certiicates on targets (i.e. internal IBM)
* </ul>
* <p>

* @author      Joseph Francis
* @author      Code based on code by Deirdre Donnelly
*/

import java.io.InputStream;
import java.io.OutputStreamWriter;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Hashtable;
import java.util.Iterator;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLSession;

public class PayloadFetcher {
	
	public String results = "";
	public String error = "";
	public String log = "";
	
    public String username = "";
    public String password = "";

	public String contentType = "application/json";

	private Hashtable requestProperties = new Hashtable();

	public Hashtable requestFields = new Hashtable();


	/**
	 * Set header properties specific to this request.
	 *  
	 * @param  theName  the name of the header
	 * @param  theValue the value of the header
	 */
	public void addHeaderValue(String theName, String theValue){
		requestProperties.put(theName, theValue);
	}
	
	private void addFieldValue(String theName, String theValue){
		requestFields.put(theName, theValue);
	}
	
	
	private String requestMethod = "POST";
	
	public String getRequestMethod() {
		return requestMethod;
	}
	public void setRequestMethod(String theRequestMethod) {
		this.requestMethod = theRequestMethod;
	}

	public int statusCode = 0;

	public boolean useAuthentication = false;
	
	public void setPayload( String theValue){	
		this.payload = theValue; 
	}
	public void setURL( String theValue){	
		this.url = theValue; 
	}

	public void init(String theURL, String theContentType){
		this.init(theURL, theContentType, false, "", "", null);
	}
	public void init(String theURL, String theContentType, Hashtable theRequestProperties ){
		this.init(theURL, theContentType, false, "", "", theRequestProperties);
	}
	public void init(String theURL, String theContentType, boolean theUseAuth, String theUserName, String thePassword){
		this.init(theURL, theContentType, theUseAuth, theUserName, thePassword, null);
	}
	public void init(String theURL, String theContentType, boolean theUseAuth, String theUserName, String thePassword, Hashtable theRequestProperties ){
		this.setURL(theURL);
		
		this.contentType = theContentType;
		this.useAuthentication = theUseAuth;
		this.username = theUserName;
		this.password = thePassword;
		if( theRequestProperties != null){
			
			for (Iterator itObj = theRequestProperties.keySet().iterator(); itObj.hasNext();) {
				String tmpKey = (String)itObj.next();
				this.requestProperties.put(tmpKey, theRequestProperties.get(tmpKey));
			}
		}	
	}
	
	private String payload = "";
	private String url = "";

	public String getURL(){
		return this.url;
	}

	private void debug(String theText){
		this.log += theText + "\n";
	}
	
	private void trustAllHttpsCertificates() throws Exception 
	{

    //  Create a trust manager that does not validate certificate chains:

    javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[1]; 

    javax.net.ssl.TrustManager tm = new miTM();

    trustAllCerts[0] = tm;

    javax.net.ssl.SSLContext sc =

    javax.net.ssl.SSLContext.getInstance("SSL");

    sc.init(null, trustAllCerts, null);

    javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(

    sc.getSocketFactory());

}


	class miTM implements javax.net.ssl.TrustManager,
        javax.net.ssl.X509TrustManager
{
    public java.security.cert.X509Certificate[] getAcceptedIssuers()
    {
        return null;
    }

    public boolean isServerTrusted(
            java.security.cert.X509Certificate[] certs)
    {
        return true;
    }

    public boolean isClientTrusted(
            java.security.cert.X509Certificate[] certs)
    {
        return true;
    }

    public void checkServerTrusted(
            java.security.cert.X509Certificate[] certs, String authType)
            throws java.security.cert.CertificateException
    {
        return;
    }

    public void checkClientTrusted(
            java.security.cert.X509Certificate[] certs, String authType)
            throws java.security.cert.CertificateException
    {
        return;
    }
}	


	public void sendPayload(String thePayload){
		if( thePayload != null){
			this.payload = thePayload;
		}
		sendPayload();
	}	
	
	public void sendPayload(){

		this.results = "";
		
		try {
			
			
			HostnameVerifier hv = new HostnameVerifier() {
            		public boolean verify(String urlHostName, SSLSession session)            {
            			return true;
            		}
			};
		
	        try {
	            trustAllHttpsCertificates();
	        }catch(Exception e1){
	            e1.printStackTrace();
	        }
	        
	        if( url.startsWith("https")){
		        HttpsURLConnection.setDefaultHostnameVerifier(hv);
		    }
	        URL u = new URL(this.url);
	        java.net.URLConnection conn = null;
	        conn = u.openConnection(); 
	        
        
	        HttpURLConnection connection = null;
	        if( url.startsWith("https")){
	        	connection = (HttpsURLConnection) conn;
	        } else {
	        	connection = (HttpURLConnection) conn;
	        }

	        
			connection.setRequestProperty("Content-type", this.contentType);
			
	        if (this.useAuthentication){
	        	if( this.username == null){this.username = "";}
	        	if( this.password == null){this.password = "";}
	        	
		        String authString = this.username + ":" + this.password;		        
		        com.ibm.misc.BASE64Encoder ec = new com.ibm.misc.BASE64Encoder();
		        String authStringEnc = new String(ec.encode(authString.getBytes()));
		        
				connection.setRequestProperty("Authorization", "Basic " + authStringEnc);
	        }
	        
	        for (Iterator itObj = this.requestProperties.keySet().iterator(); itObj.hasNext();) {
				String tmpKey = (String)itObj.next();
				connection.setRequestProperty(tmpKey, (String)this.requestProperties.get(tmpKey));
			}
	        
	        

        	if( this.payload == null){this.payload = "";}

			connection.setRequestMethod(this.requestMethod);

        	if( !this.requestMethod.equalsIgnoreCase("get")){
    	        connection.setDoOutput(true);

    			java.io.OutputStream out = connection.getOutputStream();
    			OutputStreamWriter wout = new OutputStreamWriter(out);
    			wout.write(this.payload);		
    			wout.flush();
        	}
			
			this.statusCode = connection.getResponseCode();
			
			this.debug("HTTP Status Code : " + this.statusCode);
	        
			InputStream in = connection.getInputStream();
			StringBuffer xmlResponseBuffer = new StringBuffer(); // 6k buffer 6144
			int c;
			
			while ((c = in.read()) != -1)
				xmlResponseBuffer.append((char) c);
			
			in.close();
			this.results = xmlResponseBuffer.toString();
	        
			conn = null;
			connection = null;
				

		} catch(Exception e) {
			this.debug("Got Error " + e.getMessage());
			
			String faultstring = "";
			
			this.error = faultstring;
				
			e.printStackTrace();
		}
	}

	
}


