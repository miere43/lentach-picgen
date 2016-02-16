/*
	Creates UI to control render canvas.
	------------------------------------

	onchange() default serialization struct:
	{
		image: null,
		grayscale: true,
		offset: {
			x: 0,
			y: 0
		},
		scale: {
			x: 1.0,
			y: 1.0
		}
	}
 */

function UIManager() {
	this.controls = null;
}

UIManager.prototype.onchange = null;

UIManager.prototype.createControls = function(left, center, right) {
	this.controls = {
		'left': {
			element: left
		},
		'center': {
			element: center
		},
		'right': {
			element: right
		}
	};

	this.createControl('left');
	this.createControl('center');
	this.createControl('right');
}

UIManager.prototype.createControl = function(control) {
	var element = this.controls[control].element;
	var self = this;

	function callbackCreateElement(type) {
		var e = document.createElement(type);
		e.onchange = function() {
			if (self.onchange !== null)
				self.onchange();
		}
		return e;
	}

	{
		var p = document.createElement('p');
		p.innerHTML = 'С компьютера: ';
		var file = callbackCreateElement('input');
		file.type = 'file';
		p.appendChild(file);

		this.controls[control].localFileControl = file;
		// file.onchange = function(evt) {
		// 	this.handleFileSelect(control, evt);
		// }

		element.appendChild(p);
	}

	{
		var p = document.createElement('p');
		p.innerHTML = 'Или по ссылке: ';
		var url = callbackCreateElement('input');
		url.type = 'text';
		p.appendChild(url);

		this.controls[control].urlFileControl = url;

		element.appendChild(p);
	}

	{
		var load = callbackCreateElement('input');
		load.type = 'button';
		load.value = 'Загрузить';
		var self = this;
		load.addEventListener('click', function() {
			self.loadControlImage(control);
		});

		element.appendChild(load);
	}

	{
		var div = document.createElement('div');
		div.className = 'pic-control';

		{
			var p = document.createElement('p');
			p.innerHTML = 'Смещение:';

			div.appendChild(p);
		}

		{
			var x = callbackCreateElement('input');
			x.type = 'number';
			x.value = '0';

			this.controls[control].offsetXControl = x;

			div.appendChild(x);
		}

		{
			var y = callbackCreateElement('input');
			y.type = 'number';
			y.value = '0';

			this.controls[control].offsetYControl = y;

			div.appendChild(y);
		}

		{
			var p = document.createElement('p');
			p.innerHTML = 'Масштаб:';



			div.appendChild(p);
		}

		{
			var x = callbackCreateElement('input');
			x.type = 'number';
			x.value = '1.0';

			this.controls[control].scaleXControl = x;

			div.appendChild(x);
		}

		{
			var y = callbackCreateElement('input');
			y.type = 'number';
			y.value = '1.0';

			this.controls[control].scaleYControl = y;


			div.appendChild(y);
		}

		div.appendChild(document.createElement('br'))

		{
			var check = callbackCreateElement('input');
			check.type = 'checkbox';
			check.id = control + 'GrayscaleControl';
			check.checked = true;

			this.controls[control].grayscaleControl = check;

			div.appendChild(check);
		}

		{
			var label = document.createElement('label');
			label.htmlFor = control + 'GrayscaleControl';
			label.innerHTML = 'Чернобелый';

			div.appendChild(label);
		}

		element.appendChild(div);
	}
}

UIManager.prototype.serializeControl = function(control) {
	var elems = this.controls[control];

	return {
		image: this.getControlImage(control),
		grayscale: elems.grayscaleControl.checked,
		offset: {
			x: parseFloat(elems.offsetXControl.value),
			y: parseFloat(elems.offsetYControl.value)
		},
		scale: {
			x: parseFloat(elems.scaleXControl.value),
			y: parseFloat(elems.scaleYControl.value),
		}
	}
}

UIManager.prototype.getControlImage = function(control) {
	return this.controls[control].image || null;
}

UIManager.prototype.loadControlImage = function(control) {
	var fromLocal = this.controls[control].localFileControl;
	var fromUrl   = this.controls[control].urlFileControl;

	var hasLocal = fromLocal.files.length > 0;
	var hasUrl   = fromUrl.value !== "";

	var self = this;

	if (hasUrl) {
		var image = new Image();
		image.crossOrigin = "Anonymous";
		image.onload = function() {
			self.controls[control].image = image;
			self.onchange();
		}
		image.onerror = function() {
			alert('Невозможно установить картинку по ссылке. Скорее всего ' +
				  'файл не является картинкой или заблокирован по cross-origin policy ' + 
				  '(то есть сайт запрещает использовать картинки со своего сервера, см. консоль).');
		}
		image.src = fromUrl.value;
	} else if (hasLocal) {
		var file = fromLocal.files[0];
		var reader = new FileReader();
		reader.onload = function(f) {
			var image = new Image();
			image.src = reader.result;
			self.controls[control].image = image;
			self.onchange();
		};
		reader.readAsDataURL(file);
	} else {
		return;
	}
}