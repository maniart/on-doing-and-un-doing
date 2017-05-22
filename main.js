function createOnceLog() {
  var counter = 0;
  return function() {
    var args = arguments;
    if (counter > 0) { return; }
    console.log.apply(console, args);
    return counter ++;
  }
}

var slices = [];
var logger = createOnceLog();
var logger2 = createOnceLog();
var video = document.querySelector('#video');
var source = document.querySelector('#source');
var sourceCtx = source.getContext('2d');
var output = document.querySelector('#output');
var outputCtx = output.getContext('2d');

var sourceWidth = source.width;
var sourceHeight = source.height;

var outputWidth = output.width;
var outputHeight = output.height;

var THRESHOLD = 100;
var SLICE_COUNT = 400;
var SLICE_HEIGHT = outputHeight;
var SLICE_WIDTH = outputWidth / SLICE_COUNT;


function snapshot() {
  sourceCtx.drawImage(video, 0, 0, source.width, source.height);
}

function foo() {
  outputCtx.drawImage(source, 0, 0, output.width, output.height);
}

video.addEventListener('canplay', function() {
  video.play();
}, false);

function loop() {
  snapshot();
  // foo();
  window.requestAnimationFrame(loop);
}

function init() {
  loop();
}

function Slice(x, y, w, h) {
  this.timer = null;
  this.active = false;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
}

Slice.prototype.setActive = function(isActive) {
  this.active = isActive;
  return this;
}

Slice.prototype.source = source;
Slice.prototype.ctx = outputCtx;

Slice.prototype.react = function() {
  // console.debug('_react_');
  var reset = function() {
    // console.warn('_reset_');
    this.setActive(false);
    window.clearTimeout(this.timer);
    this.timer = null;
  }.bind(this);

  if (this.active) {
    // console.warn('__ is active');
    return this.draw();
  }
  this.timer = window.setTimeout(reset, 3000);
  this.setActive(true);
  return this;
};

Slice.prototype.draw = function() {
    // console.warn('__ is drawing');
   this.ctx.drawImage(
    source,
    this.x,
    this.y,
    this.w,
    this.h,
    this.x,
    this.y,
    this.w,
    this.h
  );
   return this;
}

for(var i = 0; i < SLICE_COUNT; i ++) {
  var posX = SLICE_WIDTH * i
  var posY = 0;
  slices.push(
    new Slice(posX, posY, SLICE_WIDTH, SLICE_HEIGHT)
  );
}

var diffy = Diffy.create({
  resolution: { x: SLICE_COUNT, y: 1 },
  sensitivity: .4,
  threshold: 7,
  debug: true,
  containerClassName: 'my-diffy-container',
  sourceDimensions: { w: 130, h: 100 },
  onFrame: function (matrix) {
    var slice;
    for(var i = 0; i < matrix.length; i++) {
      if(matrix[i][0] < 230) {
        slice = slices[i];
        slice.react();
      }
    }
  }
});

window.addEventListener('load', init);
