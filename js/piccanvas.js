function PCanvas() {
	this.canvas = null;
	this.context = null;
	this.overlayBlendMode = 'multiply';
}

PCanvas.prototype._drawCircleClippedImage = function(pos, imageData) {
	if (imageData.image == null)
		return;

	var c = this.context;
	var image = imageData.image;

	var x = pos.x - (image.width) / 2 + imageData.offset.x;
	var y = pos.y - (image.height) / 2 + imageData.offset.y;

	c.drawImage(image, x, y, 
		image.width * imageData.scale.x, image.height * imageData.scale.y);
}

PCanvas.prototype._beginCircleClip = function(pos, radius) {
	var c = this.context;

	c.save()

	c.beginPath();
	c.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
	c.clip();
}

PCanvas.prototype._endCircleClip = function(pos, radius) {
	var c = this.context;

	c.restore();

	// fix for rough edges
	c.beginPath();
	c.strokeStyle = '#fff';
	c.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
	c.stroke();
}

PCanvas.prototype._setRectGrayscale = function(pos, radius) {
	var x = pos.x - radius;
	var y = pos.y - radius;
	var width = pos.x + radius;
	var height = pos.y + radius;

	var imageData = this.context.getImageData(x, y, width, height);
	var data = imageData.data;

	var length = data.length;
	for (var i = 0; i < length; i += 4) {
		var brightness = 0.34 * data[i] + 
						 0.5  * data[i + 1] +
						 0.16 * data[i + 2];
		data[i] = brightness;
		data[i + 1] = brightness;
		data[i + 2] = brightness;
	}

	this.context.putImageData(imageData, x, y);
}

PCanvas.prototype._overlayDraw = function(id) {
	var c = this.context;

	c.fillStyle = '#432559';
	c.globalCompositeOperation = this.overlayBlendMode;
	c.beginPath();
	if (id === 'left') {
		c.moveTo(59, 47);
		c.lineTo(124, 222);
		c.lineTo(0, 269);
		c.lineTo(0, 0);
	} else if (id === 'right') {
		c.moveTo(473, 49);
		c.lineTo(552, 218);
		c.lineTo(604, 218);
		c.lineTo(604, 0);
	}
	c.closePath();
	c.fill();
}

PCanvas.prototype.mainDraw = function(mainLeftData, mainCenterData, mainRightData) {
	var canvasCenter = {
		x: this.canvas.width / 2,
		y: this.canvas.height / 2
	};

	var radius = 187 / 2;

	var leftPos = {x: radius, y: 134.5};
	var rightPos = {x: this.canvas.width - radius, y: 134.5};
	var centerPos = {x: this.canvas.width / 2, y: this.canvas.height / 2};

	var self = this;
	function draw(pos, data, id) {
		self._beginCircleClip(pos, radius);

		self._drawCircleClippedImage(pos, data);
		if (data.grayscale)
			self._setRectGrayscale(pos, radius);

		if (id === 'left')
			self._overlayDraw('left');
		else if (id === 'right')
			self._overlayDraw('right');

		self._endCircleClip(pos, radius);
	}

	draw(leftPos, mainLeftData, 'left');
	draw(centerPos, mainCenterData);
	draw(rightPos, mainRightData, 'right');
}

PCanvas.prototype.setTargetCanvas = function(canvas) {
	this.canvas = canvas;
	this.context = canvas.getContext('2d');

	this.context.fillStyle = '#fff';
	this.context.fillRect(0, 0, canvas.width, canvas.height);
}

PCanvas.prototype.setOverlayBlendMode = function(blendMode) {
	this.overlayBlendMode = blendMode || 'multiply';
}