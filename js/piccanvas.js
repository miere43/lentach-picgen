function PCanvas() {
	this.canvas = null;
	this.context = null;
	this.overlayBlendMode = 'multiply';
	this.rasterFallback = false;
	this.leftOverlay = null;
	this.rightOverlay = null;
}

PCanvas.prototype._drawCircleClippedImage = function(pos, imageData) {
	if (imageData.image == null)
		return;

	var c = this.context;
	var image = imageData.image;

	var x = pos.x - (image.width * imageData.scale.x) / 2 + imageData.offset.x;
	var y = pos.y - (image.height * imageData.scale.y) / 2 + imageData.offset.y;

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
		var brightness = 0.2126 * data[i] + 
						 0.7152 * data[i + 1] +
						 0.0722 * data[i + 2];
		data[i] = brightness;
		data[i + 1] = brightness;
		data[i + 2] = brightness;
	}

	this.context.putImageData(imageData, x, y);
}

/*
	Software implementation of multiply blend mode.

	pos: {x, y}
	topLayer: ImageData
 */
PCanvas.prototype._softwareMultiply = function(pos, topLayer) {
	var baseLayer = this.context.getImageData(pos.x, pos.y, topLayer.width, topLayer.height);
	var dstData = baseLayer.data;
	var srcData = topLayer.data;
	var length = srcData.length;
	for (var i = 0; i < length; i += 4) {
		var src_r = srcData[i] / 255;
		var src_g = srcData[i + 1] / 255;
		var src_b = srcData[i + 2] / 255;
		var src_a = srcData[i + 3] / 255;
		var dst_r = dstData[i] / 255;
		var dst_g = dstData[i + 1] / 255;
		var dst_b = dstData[i + 2] / 255;
		// var dst_a = data[i + 3];
		dstData[i] = (src_r * dst_r * src_a) * 255
		dstData[i + 1] = (src_g * dst_g * src_a) * 255
		dstData[i + 2] = (src_b * dst_b * src_a) * 255
	}
	this.context.putImageData(baseLayer, pos.x, pos.y);
}
PCanvas.prototype._overlayDraw = function(id) {
	var c = this.context;
	if (this.rasterFallback) {
		if (id === 'left') {
			this._softwareMultiply(
			{
				x: 0, y: 48, 
			}, this.leftOverlay);
		} else if (id === 'right') {
			this._softwareMultiply({
				x: this.canvas.width - this.rightOverlay.width,
				y: 40,
			}, this.rightOverlay);
		}
		// c.drawImage(this.leftOverlay, 0, 48,
		// 	this.leftOverlay.width, this.leftOverlay.height);
		// c.drawImage(this.rightOverlay, this.canvas.width - this.rightOverlay.width, 40,
		// 	this.rightOverlay.width, this.rightOverlay.height);
	} else {
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

PCanvas.prototype.enableRasterFallback = function(leftOverlayImage, rightOverlayImage) {
	function getImageData(image) {
	    var canvas = document.createElement('canvas');
	    canvas.width = image.width;
	    canvas.height = image.height;

	    var context = canvas.getContext('2d');
	    context.drawImage(image, 0, 0);

	    return context.getImageData(0, 0, image.width, image.height);
	};
	this.leftOverlay = getImageData(leftOverlayImage);
	this.rightOverlay = getImageData(rightOverlayImage);
	this.rasterFallback = true;
}
