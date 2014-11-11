var voteApp = angular.module('voteApp', []);

voteApp.controller('VoteAppCandidatesCtrl', function($scope, $http, $filter) {
	
	// Flags
	$scope.showHttpError = false;
	$scope.voteSelected = true;
	$scope.votingView = true;
	$scope.chartView = false;
	$scope.allowVote = true; 
	$scope.voteOnlyOnceFlag = false;
	$scope.loading = true;
	
	// Global variables
	$scope.xhrError = "";
	$scope.chart = {};
	
	// Loads candidates data
	$http.get('../service/candidates/get').success(function(data) {
		$scope.loading = true;
		$scope.showHttpError = false;
		$scope.candidates = data;
		$scope.setChartData(data);
	}).error(function(data, status, headers) {
		$scope.xhrError = "Pri získavaní dát nastala chyba, kód chyby: " + status;
		$scope.showHttpError = true;
	});
	
	/**
	 * Chart data variable 
	 */
	$scope.chartData = {
		labels: [],
        datasets: [{
			label: "Výsledky",
			fillColor: "rgba(38, 115, 219, 0.8)",
			strokeColor: "rgba(0,0,0,0)",
			highlightFill: "rgba(214, 86, 75, 0.8)",
			highlightStroke: "rgba(0,0,0,0)",
			data: []
        }]
     };
	 
	 /**
	  * Sets the chart data
	  * @return void
	  */
	 $scope.setChartData = function (rawData) {
		var labels = []
			data = [],
			i = 0,
			length = 0;
		if (typeof rawData !== "undefined" && typeof rawData.length !== 0) {
			length = rawData.length;
			while (i < length) {
				labels.push(rawData[i].name);
				data.push(parseInt(rawData[i].votes));
				i += 1;
			}
		}
		$scope.chartData.labels = labels;
		$scope.chartData.datasets[0].data = data;
	 };
	
	
	/**
	 * Chart options
	 */
	$scope.chartOptions = {
		showScale : true,
		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : true,
		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,
		//String - Colour of the grid lines
		scaleGridLineColor : "#333",
		//Number - Width of the grid lines
		scaleGridLineWidth : 1,
		//Boolean - If there is a stroke on each bar
		barShowStroke : true,
		//Number - Pixel width of the bar stroke
		barStrokeWidth : 2,
		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,
		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,
		scaleFontFamily: "'Open Sans'",
		scaleFontSize: 12,
		scaleFontColor: "#333",
		scaleFontStyle: "bold",
		animationSteps: 60,
		scaleStepWidth : 30,
		maintainAspectRatio: true
    };
	
	/**
	 * Shows the voting view
	 * @return void
	 */
	$scope.showVoting = function () {
		$scope.votingView = true;
		$scope.chartView = false;
	};

	/**
	 * Shows the chart view
	 * @param string wrapperId
	 * @return void
	 */
	$scope.showChart = function (wrapperId) {
		var chartWrapper = document.getElementById(wrapperId).getContext("2d");
		$scope.votingView = false;
		$scope.chartView = true;
		$scope.chart = new Chart(chartWrapper).Bar($scope.chartData, $scope.chartOptions);
	};	
	
	/**
	 * Vote method used for sending the vote to service
	 * @param int candidateId
	 * @return void
	 */
	$scope.vote = function (candidateId) {
		if (typeof candidateId !== "undefined") {
			var fbUserId = 0,
				fbUserName = "",
				fbGender = "",
				genderString = "";
			$scope.voteSelected = true;
			if (typeof FbUserData.id !== "undefined" && FbUserData.first_name !== "undefined") {
				fbUserId = FbUserData.id;
				fbUserName = FbUserData.first_name;
			}
			if (typeof FbUserData.gender !== "undefined") {
				fbGender = FbUserData.gender;
			}
			genderString = fbGender === "female" ? "hlasovala" : "hlasoval";
			// Post the data to the service
			$http.post('../service/candidates/put', {
				'candidateId' : candidateId,
				'fbUserId' : fbUserId,
				'gender' : fbGender
			// Success
			}).success(function(data, status) {
				$scope.showHttpError = false;			
				$scope.voteOnlyOnceFlag = false;
				if (status === 206) {
					$scope.xhrError = "Hlasovať môžete iba raz...";
					$scope.showHttpError = true;
				}
				$scope.voteOnlyOnceFlag = true;
				$scope.candidates = data;
				$scope.setChartData(data);
				$scope.showChart('vote-results');
				// Show facebook share dialog
				FB.ui({
				  method: 'feed',  
				  link: 'http://apps.facebook.com/prieskum-moldava',
				  name: 'Predvolebný prieskum Moldava nad Bodvou',
				  picture : 'http://gigup-server-prod.eu/vote/front-end/img/app-icon-big.png',
				  description: fbUserName + ' práve ' + genderString + ' v predvolebnom prieskume komunálnych volieb v Moldave n/B. Urobte tak aj Vy!'
				});
				console.log($scope.getSharingList());
			// Error
			}).error(function(data, status, headers) {
				ctx.xhrError = "Váš hlas nie je momentálne možné odoslať skúste proím neskôr...";
				ctx.showHttpError = true;
			});
		} else {
			$scope.voteSelected = false;
		}
	};
	
});