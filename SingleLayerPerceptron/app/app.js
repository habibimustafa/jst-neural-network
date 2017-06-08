angular.module('jst', ['ngRoute', 'ui.bootstrap', 'ngAnimate'])

.controller('process', function($scope){
	$scope.sets  = {
		inputs: 2, 	
		label: function(count){
  			var lb = []; 
			for (var i = 0; i < count; i++) 
				lb.push("x"+(i+1));
			lb.push("Target");
			return lb;
		},
		bobot: {w1:0, w2:0},
		table: [
			{x1: 1, x2:1, Target:1},
			{x1: 1, x2:0, Target:1},
			{x1: 0, x2:1, Target:1},
			{x1: 0, x2:0, Target:-1}
		], 
		kondisi: [false, false, false, false],
		baru: {},
		bias: 0,
		alpha: 1,
		teta: 0.1,
		epoch: [],
		hasil: null
	};

	$scope.tbl = {
		add: function(){
			$scope.sets.table.push($scope.sets.baru);
			$scope.sets.kondisi.push(false);
			$scope.sets.baru = {};
		},
		rem: function(id){
			$scope.sets.table.splice(id, 1);
			$scope.sets.kondisi.splice(id, 1);
		}
	}

	$scope.kelas = {
		aktivasi: function(yIn){
        	var teta = $scope.sets.teta;
        	if(yIn<-teta) return -1;
        	else if(yIn>teta)  return  1;
        	else return 0;
		},
		perbarui: function(pola){
			var databaru = {bobot:{}, bias:null};
			for(var i=0; i<$scope.sets.inputs; i++) {
				databaru.bobot['w'+(i+1)] = $scope.sets.bobot['w'+(i+1)] + 
					( $scope.sets.alpha * $scope.sets.table[pola].Target * $scope.sets.table[pola]['x'+(i+1)] );
			}
	        databaru.bias = $scope.sets.bias + $scope.sets.alpha * $scope.sets.table[pola].Target;
	        return databaru;
		},
		sigmaIn: function(pola){
			var ret=0;
			for (var i=0; i<$scope.sets.inputs; i++) {
				ret += $scope.sets.table[pola]['x'+(i+1)] * $scope.sets.bobot['w'+(i+1)];
			}
			return ret;
		},
		cekKondisi: function(arr){
			var ret = true;
			arr.forEach(function(elm){
        		if(!elm) ret = false;
			});
        	return ret;
		},
		training: function(){
			var train=0, loop=true;
			do {
				train++; 
				var epoch = {
					epoch: train,
					alpha: $scope.sets.alpha,
					teta: $scope.sets.teta,
					pola: []
				};
				for(var pola=0; pola<$scope.sets.table.length; pola++){
					var yIn  = $scope.sets.bias + this.sigmaIn(pola);
					var yOut = this.aktivasi(yIn);
	
					if(yOut != $scope.sets.table[pola].Target){
						$scope.sets.kondisi[pola] = false;
						var dbaru = this.perbarui(pola);
						epoch.pola.push({
							bobot: 		$scope.sets.bobot,
							bias: 		$scope.sets.bias,
							data: 		$scope.sets.table[pola],
							kondisi: 	{yIn: yIn, yOut: yOut},
							perbarui: {
								status: true,
								bobot: dbaru.bobot,
								bias: dbaru.bias
							}
						});
						$scope.sets.bobot = dbaru.bobot; 
						$scope.sets.bias  = dbaru.bias;
					} else {
						$scope.sets.kondisi[pola] = true;
						epoch.pola.push({
							bobot: 		$scope.sets.bobot,
							bias: 		$scope.sets.bias,
							data: $scope.sets.table[pola],
							kondisi: {yIn: yIn, yOut: yOut},
							perbarui: false
						});
					}
				}
				$scope.sets.epoch.push(epoch);
				if(this.cekKondisi($scope.sets.kondisi)) loop=false;
				if(train>=1000) {
					loop=false;
					$scope.sets.hasil='Training gagal dilakukan';
				} else $scope.sets.hasil='Training sukses dilakukan sampai Epoch ke-'+train;
			} while(loop==true);
		}
	}

	$scope.step = 1;
	$scope.hitung = function(){
		$scope.kelas.training();
		$scope.step=2;
	};

	$scope.test = {
		label: function(count){
  			var lb = []; 
			for (var i = 0; i < count; i++) 
				lb.push("x"+(i+1));
			return lb;
		},
		inputs: {},
		hasil: null,
		sigmaInput: function(inputs){
			var ret=0;
			for (var i=0; i<$scope.sets.inputs; i++) {
				ret += this.inputs['x'+(i+1)] * $scope.sets.bobot['w'+(i+1)];
			}		
			return ret;	
		},
		run: function(){
			var yIn  = $scope.sets.bias + this.sigmaInput(this.inputs);
			var yOut = $scope.kelas.aktivasi(yIn);
			// hasil
			this.hasil = yOut;			
		}
	};
})