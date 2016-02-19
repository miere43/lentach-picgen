/*
	Glue for UI and canvas.
*/

(function appInit() {
	var placeholder = new Image();
	placeholder.src = 'assets/putin.jpg';

	var pcanvas = new PCanvas();
	var ui = new UIManager();

	var usePlaceholder = true;
	var doAutoRedraw = true;

	var canvasBlendMode = null;
	var rasterFallback = false;

	function putError(message) {
		var error = document.createElement('div');
		var errormsg = document.createElement('span');
		error.className = 'error';
		errormsg.innerHTML = message;
		error.appendChild(errormsg);
		document.getElementById('error-panel').appendChild(error);
	}

	(function capabilityCheck() {
		var isie = navigator.userAgent.indexOf(' Edge/') !== -1 ||
		           navigator.userAgent.indexOf(' MSIE ') !== -1 ||
		           navigator.userAgent.indexOf(' Trident/') !== -1;

		var somecanvas = null;
		var somectx = null;
		try {
			somecanvas = document.createElement('canvas');
			somectx = somecanvas.getContext('2d');
		} catch (e) {
			putError('Динамическая отрисовка картинок невозможна в этом браузере: ' + e.message);
			return;
		}

		if (isie) {
			putError('Internet Explorer/Edge плохо рендерит пикчу, лучше зайти с другого браузера.');
		}

		try {
			somectx.globalCompositeOperation = 'source-over';
			somectx.globalCompositeOperation = 'multiply';
			if (somectx.globalCompositeOperation !== 'multiply') {
				rasterFallback = true;
			}
		} catch (ex) {
			putError(ex);
			rasterFallback = true;
		}

		if (!(window.File && window.FileReader && window.FileList)) {
			putError('Ваш браузер не поддерживает загрузку с компьютера. =\\');
		}
	})();

	// Init UI when placeholder image loaded.
	placeholder.onload = function(loadedCount) {
		function doRedraw(fillBackground) {
			var leftImageData = ui.serializeControl('left');
			var centerImageData = ui.serializeControl('center');
			var rightImageData = ui.serializeControl('right');

			if (usePlaceholder) {
				if (leftImageData.image === null)
					leftImageData.image = placeholder;
				if (centerImageData.image === null)
					centerImageData.image = placeholder;
				if (rightImageData.image === null)
					rightImageData.image = placeholder;
			}

			if (fillBackground) {
				pcanvas.context.fillStyle = '#fff';
				pcanvas.context.rect(0, 0, pcanvas.canvas.width, pcanvas.canvas.height);
				pcanvas.context.fill();
			} else {
				pcanvas.context.clearRect(0, 0, pcanvas.canvas.width, pcanvas.canvas.height);
			}
			pcanvas.mainDraw(leftImageData, centerImageData, rightImageData);
		}

		pcanvas.setOverlayBlendMode(canvasBlendMode);
		pcanvas.setTargetCanvas(document.getElementById("piccanvas"));
		if (rasterFallback == true) {
			var left = new Image();
			var right = new Image();
			var loaded = 0;
			function rasterOnload() {
				loaded++;
				if (loaded == 2)  {
					pcanvas.enableRasterFallback(left, right);
					doRedraw();
				}
			}
			left.onload = rasterOnload;
			right.onload = rasterOnload;
			left.src = 'assets/raster-fallback-left.png';
			right.src = 'assets/raster-fallback-right.png';
		}

		ui.createControls(
			document.getElementById("leftPic"),
			document.getElementById("centerPic"),
			document.getElementById("rightPic"));

		doRedraw();

		var autoredrawControl = document.getElementById("autoredraw");
		doAutoRedraw = autoredrawControl.checked;

		autoredrawControl.addEventListener('click', function() {
			doAutoRedraw = autoredrawControl.checked;
		});

		ui.onchange = function() {
			if (doAutoRedraw) {
				doRedraw();
			}
		};

		document.getElementById("redraw").addEventListener('click', function() {
			doRedraw();
		}, false);

		document.getElementById("useplaceholder").addEventListener('click', function() {
			usePlaceholder = document.getElementById("useplaceholder").checked;
			if (doAutoRedraw) doRedraw();
		}, false);

		document.getElementById("download").addEventListener('click', function() {
			doRedraw(true);
			var dataUrl = pcanvas.canvas.toDataURL('image/jpeg');
			this.href = dataUrl;
		}, false);
	}
})();

// spoiler
(function() {
	window.onload = function() {
		var spoilers = Array.prototype.slice.call(
			document.getElementsByClassName('spoiler'));

		spoilers.forEach(function(spoiler) {
			spoiler.addEventListener('click', function() {
				var target = document.getElementById(spoiler.getAttribute('data-target'));
				if (target.style.display === 'none') {
					spoiler.innerHTML = '(скрыть)';
					target.style.display = '';
				} else {
					spoiler.innerHTML = '(показать)';
					target.style.display = 'none';
				}
			});
		});
	}
})();
