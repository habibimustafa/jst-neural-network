angular.module('jst', ['ngRoute', 'ui.bootstrap', 'ngAnimate'])

.controller('process', function($scope){
	$scope.sets = {

		//deklarasi & inisiasi layer input huruf
		layer_input: [
			[ 1, 1,-1,  1,-1, 1,  1, 1,-1,  1,-1, 1,  1, 1,-1], // b
			[ 1, 1,-1,  1,-1, 1,  1,-1, 1,  1,-1, 1,  1, 1,-1], // d
			[ 1, 1, 1,  1,-1,-1,  1, 1,-1,  1,-1,-1,  1,-1,-1], // f
			[ 1,-1, 1,  1,-1, 1,  1, 1, 1,  1,-1, 1,  1,-1, 1]  // h
		],
		
		// deklarasi & inisiasi target
		target: [
			[-1, -1],
			[-1,  1],
			[ 1, -1],
			[ 1,  1]
		],

		// deklarasi hidden layer z_net dan z aktivasi
		layer_hidden_net : [0, 0, 0, 0, 0],
		layer_hidden 	 : [0, 0, 0, 0, 0],
		bias_hidden		 : [0, 0, 0, 0, 0],
		bobot_hidden	 : [],

		// deklarasi output layer y_net dan y aktivasi
		layer_output_net : [0, 0],
		layer_output 	 : [0, 0],
		bias_output		 : [0, 0],
		bobot_output	 : [],

		// deklarasi & inisiasi alpha (learning rate) dan tetha (treshold)
		alpha: 0.5,
		teta : 0.01,
		mse  : 0,
		epoch: 0,

		// pola huruf & hasil testing
		pola_biner: [  0,  0,  0,   0,  0,  0,   0,  0,  0,   0,  0,  0,   0,  0,  0],
		pola_huruf: [ -1, -1, -1,  -1, -1, -1,  -1, -1, -1,  -1, -1, -1,  -1, -1, -1],
		result_test: "-"
	};

	// aktivasi
	$scope.akt = {
		sigmoid_biner: function(x) {
	        return (1.0 / (1.0 + Math.exp(-x)));
	    },
	    sigmoid_bipolar: function(x) {
	        return (2 * this.sigmoid_biner(x))-1;
	    },
	    turunan_sigmoid_bipolar: function(x) {
	        return 0.5 * (1 + this.sigmoid_bipolar(x)) * (1 - this.sigmoid_bipolar(x));
	    }
	};

	$scope.run = {
		v_rand: function(){
			var arr = [-1, 0, 1];
			return Math.floor(Math.random() * arr.length) - 1;
		},

		init_hidden: function(){
			//inisialisasi bias hidden
		    for (i=0; i < $scope.sets.layer_hidden.length; i++) { 
		    	$scope.sets.bias_hidden[i] = this.v_rand();
		    }
	
			// inisiasi bobot pada input-hidden layer
	    	for (j=0; j < $scope.sets.layer_input[0].length; j++) { 
	    		$scope.sets.bobot_hidden[j] = [];
	    	}
		    for (i=0; i < $scope.sets.layer_hidden.length; i++) { 
		    	for (j=0; j < $scope.sets.layer_input[0].length; j++) { 
		    		$scope.sets.bobot_hidden[j][i] = this.v_rand();
		    	}
		    }
		},

		init_output: function(){
			//inisialisasi bias hidden
		    for (i=0; i < $scope.sets.layer_output.length; i++) { 
		    	$scope.sets.bias_output[i] = this.v_rand();
		    }
	
			// inisiasi bobot pada input-hidden layer
	    	for (j=0; j < $scope.sets.layer_hidden.length; j++) { 
	    		$scope.sets.bobot_output[j] = [];
	    	}
		    for (i=0; i < $scope.sets.layer_output.length; i++) { 
		    	for (j=0; j < $scope.sets.layer_hidden.length; j++) { 
		    		$scope.sets.bobot_output[j][i] = this.v_rand();
		    	}
		    }
		},

		learn: function(){
			var audio = new Audio('audio/tahap_pembelajaran.mp3'); audio.play();

			this.init_hidden();
			this.init_output();

			var err = 0, 
				mse = 0,
				epc = 1,
				max_epc = 1000;

			// looping epoch
			do {
			
				mse = 0;

				// looping pattern
				for (i=0; i<$scope.sets.layer_input.length; i++){

					//feed-forward layer input - hidden :
					for (j=0; j<$scope.sets.layer_hidden.length; j++) { 
						$scope.sets.layer_hidden_net[j] = 0;
						for (k=0; k<$scope.sets.layer_input[i].length; k++) { 
							$scope.sets.layer_hidden_net[j] 
								+= ($scope.sets.layer_input[i][k] 
									* $scope.sets.bobot_hidden[k][j]); 
						}
						$scope.sets.layer_hidden_net[j] += $scope.sets.bias_hidden[j];

						// proses aktivasi
						$scope.sets.layer_hidden[j] = 
							$scope.akt.sigmoid_bipolar($scope.sets.layer_hidden_net[j]);
					}

					//feed-forwared layer hidden - output :
					for (j=0; j<$scope.sets.layer_output.length; j++) { 
						$scope.sets.layer_output_net[j] = 0;
						for (k=0; k<$scope.sets.layer_hidden.length; k++) { 
							$scope.sets.layer_output_net[j] 
								+= ($scope.sets.layer_hidden[k] 
									* $scope.sets.bobot_output[k][j]);
						}
						$scope.sets.layer_output_net[j] += $scope.sets.bias_output[j];

						// proses aktivasi
						$scope.sets.layer_output[j] = 
							$scope.akt.sigmoid_bipolar($scope.sets.layer_output_net[j]);
					}

					//menghitung nilai error
					//hitung koreksi bobot hidden-output

					err = 0;
					var delta = [];
					for (j=0; j<$scope.sets.layer_output.length; j++) { 
						var ee = $scope.sets.target[i][j] - $scope.sets.layer_output[j];
						err  += Math.pow(ee, 2);
						delta[j] = ee * $scope.akt.turunan_sigmoid_bipolar($scope.sets.layer_output_net[j]);
					}

					err *= 0.5;
					mse += err;

					//update bobot dan bias dari hidden-output
					for (j=0; j<$scope.sets.layer_output.length; j++) { 
						for (k=0; k<$scope.sets.layer_hidden.length; k++) { 
							$scope.sets.bobot_output[k][j] += 
								($scope.sets.alpha * delta[j] * $scope.sets.layer_hidden[k]);
						}
						$scope.sets.bias_output[j] += ($scope.sets.alpha * delta[j]);
					}

					//hitung koreksi bobot input-hidden
					delta2 = [];
					for (j=0; j<$scope.sets.layer_hidden.length; j++) {
						err_hidden = 0;
						for (k=0; k<$scope.sets.layer_output.length; k++) { 
							err_hidden += (delta[k] * $scope.sets.bobot_output[j][k]);
						}
						delta2[j] = err_hidden * 
							$scope.akt.turunan_sigmoid_bipolar($scope.sets.layer_hidden_net[j]);
					}

					//update bobot dan bias layer input-hidden :
					for (j=0; j<$scope.sets.layer_hidden.length; j++) { 
						for (k=0; k<$scope.sets.layer_input[i].length; k++) {
							$scope.sets.bobot_hidden[k][j] 
								+= ($scope.sets.alpha * delta2[j] 
									* $scope.sets.layer_input[i][k]);
						}
						$scope.sets.bias_hidden[j] += ($scope.sets.alpha * delta2[j]);
					}

				} // end of pattern loop

				mse /= 4;
				epc++;

				$scope.sets.mse   = mse;
				$scope.sets.epoch = epc;
				// console.log($scope.sets.epoch+" "+$scope.sets.mse);
			
			} while ((mse > $scope.sets.teta) && (epc < max_epc)); // end of epoch loop

		}, // end of learn function

		test: function(pola_huruf){

			for (i=0; i<$scope.sets.layer_hidden.length ; i++) { 
				$scope.sets.layer_hidden_net[i] = 0;
				for (j=0; j<pola_huruf.length; j++) { 
					$scope.sets.layer_hidden_net[i] 
						+= (pola_huruf[j] * $scope.sets.bobot_hidden[j][i]);
				}
				$scope.sets.layer_hidden_net[i] += $scope.sets.bias_hidden[i];
				$scope.sets.layer_hidden[i] = $scope.akt.sigmoid_bipolar($scope.sets.layer_hidden_net[i]);
			}

			for (i=0; i < $scope.sets.layer_output.length; i++) { 
				$scope.sets.layer_output_net[i] = 0;
				for (j=0; j < $scope.sets.layer_hidden.length; j++) { 
					$scope.sets.layer_output_net[i] 
						+= ($scope.sets.layer_hidden[j] * $scope.sets.bobot_output[j][i]);
				}
				$scope.sets.layer_output_net[i] += $scope.sets.bias_output[i];
				$scope.sets.layer_output[i] = $scope.akt.sigmoid_bipolar($scope.sets.layer_output_net[i]);
			}

			if ($scope.sets.layer_output[0] <= 0 && $scope.sets.layer_output[1] <= 0) {
		        $scope.sets.result_test = "B";
		        var audio = new Audio('audio/huruf_b.mp3'); audio.play();
		    } else if ($scope.sets.layer_output[0] <= 0 && $scope.sets.layer_output[1] > 0) {
		        $scope.sets.result_test = "D";
		        var audio = new Audio('audio/huruf_d.mp3'); audio.play();
		    } else if ($scope.sets.layer_output[0] > 0 && $scope.sets.layer_output[1] <= 0) {
		        $scope.sets.result_test = "F";
		        var audio = new Audio('audio/huruf_f.mp3'); audio.play();
		    } else if ($scope.sets.layer_output[0] > 0 && $scope.sets.layer_output[1] > 0) {
		        $scope.sets.result_test = "H";
		        var audio = new Audio('audio/huruf_h.mp3'); audio.play();
		    } else {
		    	$scope.sets.result_test = "-";
		    }

		},

		btn_toggle: function(indeks){
			$scope.sets.pola_biner[indeks] = !$scope.sets.pola_biner[indeks];
			if($scope.sets.pola_biner[indeks])
				$scope.sets.pola_huruf[indeks] = 1;
			else
				$scope.sets.pola_huruf[indeks] = -1;

			console.log($scope.sets.pola_huruf);
		}
	}

})