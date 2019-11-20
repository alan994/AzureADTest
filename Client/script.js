// Init

// Call API 1
// - Pozovi metodu za dohvat tokena sa scopeom za API 1
// Call API 2
// - Pozovi metodu za dohvat tokena sa scopeom za API 2
// Call Graph API
// - Pozovi metodu za dohvat tokena sa scopeom za Graph API
// SignIn
// - Provjeri radi li se o Internet Exploreru ako da napravi login redirect ako ne napravi login popup.
// SignOut

// Call get request

var msalConfig = {
	auth: {
		clientId: 'c878d507-0666-4b02-aacb-46ec8b0d8506',
		authority: 'https://login.microsoftonline.com/common',		
		redirectURI: 'http://localhost:5500'
	},
	cache: {
		cacheLocation: 'localStorage',
		storeAuthStateIncookie: true
	}
};

var graphConfig = {
	graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
	webApi1endpoint: 'https://localhost:5001/WeatherForecast/token',
	webApi2endpoint: 'https://localhost:5011/WeatherForecast/token',
	requests: {
		graphApi: {
			scopes: ['user.read'],
		},
		api1: {
			scopes: ['api://c878d507-0666-4b02-aacb-46ec8b0d8506/internal-api'],
		},
		api2: {
			scopes: ['api://c878d507-0666-4b02-aacb-46ec8b0d8506/internal-api'],
		}
	}
};

var msalApplication = new Msal.UserAgentApplication(msalConfig);

initPage();

msalApplication.handleRedirectCallback(authRedirectCallBack);

function authRedirectCallBack(error, response) {
	if (error) {
		console.log('Greška prilikom povratka s Azure AD login ekrana.', error);
	}
	else {
		if (response.tokenType == 'access_token') {
			getUserFromMSGraph(graphConfig.graphMeEndpoint, response.accessToken, grapAPICallback);
		}
		else {
			consoel.log('Token type is: ' + response.tokenType, response);
		}
	}
}

function callGraphApi() {
	clearGraphApiResponse();
	acquireTokenForScope(graphConfig.requests.graphApi, function(token){
		callGetRequest(graphConfig.graphMeEndpoint, token, fillGraphApiResponse);
	});
}

function callApi1() {
	clearApi1Response();
	acquireTokenForScope(graphConfig.requests.api1, function(token){
		callGetRequest(graphConfig.webApi1endpoint, token, fillApi1Response);
	});
}

function callApi2() {
	clearApi2Response();
	acquireTokenForScope(graphConfig.requests.api2, function(token){
		callGetRequest(graphConfig.webApi2endpoint, token, fillApi2Response);
	});
}

function acquireTokenForScope(scope, callback) {
	if (isIE()) {
		acquireTokenRedirectForScope(scope, callback);
	}
	else {
		acquireTokenPopupForScope(scope, callback);
	}
}

function acquireTokenRedirectForScope(scope, callback) {
	msalApplication.acquireTokenSilent(scope)
		.then(function (tokenResponse) {
			callback(tokenResponse.accessToken);
		}).catch(function (error) {
			console.log(error);
			if (requiresInteraction(error.errorCode)) {
				msalApplication.acquireTokenRedirect(scope);
			}
		});
}

function acquireTokenPopupForScope(scope, callback) {
	msalApplication.acquireTokenSilent(scope)
		.then(function (tokenResponse) {
			callback(tokenResponse.accessToken);
		}).catch(function (error) {
			console.log(error);
			if (requiresInteraction(error.errorCode)) {
				msalApplication.acquireTokenPopup(scope).then(function (tokenResponse) {
					callback(tokenResponse.accessToken);
				}).catch(function (error) {
					console.log('Generalni error', error);
				});
			}
		});
}

function isIE() {
	return navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof $.browser !== "undefined" && $.browser.msie == 1);
}

function callGetRequest(endpoint, accessToken, callback) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function () {
		if (this.readyState === 4 && this.status === 200) {
			callback(JSON.parse(this.responseText));
		}
	};
	xmlhttp.open('GET', endpoint, true);
	xmlhttp.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xmlhttp.send();
}

function fillGraphApiResponse(data) {
	document.getElementById('graphApi').innerHTML = JSON.stringify(data, null, 2);
}

function fillApi2Response(data) {
	document.getElementById('api2').innerHTML = JSON.stringify(data, null, 2);
}

function fillApi1Response(data) {
	document.getElementById('api1').innerHTML = JSON.stringify(data, null, 2);
}

function clearGraphApiResponse(data) {
	document.getElementById('graphApi').innerHTML = '';
}

function clearApi2Response(data) {
	document.getElementById('api2').innerHTML = '';
}

function clearApi1Response(data) {
	document.getElementById('api1').innerHTML = '';
}

function callAllApis(){
	clearGraphApiResponse();
	clearApi1Response();
	clearApi2Response();

	setTimeout(function(){
		callGraphApi();
		setTimeout(function(){
			callApi1();
			setTimeout(function(){
				callApi2();
			}, 1000);
		}, 1000);		
	}, 1000);
}

function singIn(){
	if(isIE()){
		msalApplication.loginRedirect(graphConfig.requestObj);
	}
	else{
		msalApplication.loginPopup(graphConfig.requestObj)
				.then(function (loginResponse) {
					updateUserInterface();
				}).catch(function (error) {
					console.log(error);
				});
	}
}

function signOut() {
	msalApplication.logout();
}

function updateUserInterface() {
	var divWelcome = document.getElementById('WelcomeMessage');
	divWelcome.innerHTML = `Welcome <strong>${msalApplication.getAccount().userName}</strong> to Microsoft Graph API`;

	var idToken = document.getElementById('idToken').innerHTML = JSON.stringify(msalApplication.getAccount(), null, 2);
	var loginButton = document.getElementById('SignIn');
	loginButton.innerHTML = 'Sign out';
	loginButton.setAttribute('onClick', 'signOut();');

	callAllApis();
}
function requiresInteraction(errorCode) {
	if (!errorCode || !errorCode.length) {
		return false;
	}
	return errorCode === 'consent_required' || errorCode === 'interaction_required' || errorCode === 'login_required';
}

function initPage() {
	switch (isIE()) {
		case true:
			document.getElementById("SignIn").onclick = function () {
				msalApplication.loginRedirect(graphConfig.requestObj);
			};

			if (msalApplication.getAccount() && !msalApplication.isCallback(window.location.hash)) {
				updateUserInterface();
			}
			break;
		case false:
			if (msalApplication.getAccount()) {
				updateUserInterface();
			}
			break;
		default:
			console.error('Please set a valid login type');
			break;
	}
}