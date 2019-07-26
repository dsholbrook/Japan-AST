/* There are two elements that are a required at minimum
 to enable the DBDM common library, the primaryCategory and the siteID */
digitalData = {
	page: {
		category: {
			primaryCategory: 'Events'
		},
		pageInfo: {
			effectiveDate: '2018-01-01',
			expiryDate: '2030-12-31',
			language: 'ja-JP',
			publishDate: '2018-01-01',
			publisher: 'IBM Corporation',
			version: 'v18',
			ibm: {
				contentDelivery: 'Hand coded',
				contentProducer: '',
				country: 'US',
				ibmDynamicCm: false,
				industry: 'ZZ',
				owner: 'James Lowes/Armonk/Contr/IBM',
				siteID: 'IBM_EVENTS',
				subject: '',
				type: ''
			},
			maxymiser: {
				synchronous: false
			},
			hotjar: {
				enabled: true
			}
		}
	}
}