var osc;
var osc_type = "triangle";
var rifts = [];

//var frequencies = [24-108] //C1 to C8
//midiToFreq(midiNote) [-10,-8,-5,-3,0, 2, 4, 7, 9,12]
var twelve_tones = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
var scale_holder = {};
var current_scale = 'Pentatonic';
var cur_index = 0;


var root = 60;
var bpm = 300;
var amp = .1;
var rftl = 10;
var oscOn = false;


function setup() {
  noCanvas();

  //Create Scales
  addScales();

  //Create Buttons 
  start_stop_button = createButton('sound on',100,100);
  start_stop_button.addClass('middle');
  start_stop_button.mousePressed(toggleOsc);

  new_riff_button = createButton('new riff',100,100);
  new_riff_button.addClass('middle');
  new_riff_button.mousePressed(makeRift);

  //Create Sliders
  root_label = createP('Root Note: C2');
  root_label.addClass('middle');
  root_slider = createSlider(36, 96, root);
  root_slider.addClass('middle');

  bpm_label = createP('Beats Per Minute: ' + bpm);
  bpm_label.addClass('middle');
  bpm_slider = createSlider(40, 800, bpm);
  bpm_slider.addClass('middle');

  amp_label = createP('Volume: ' + amp * 100);
  amp_label.addClass('middle');
  amp_slider = createSlider(0, 100, amp * 100);
  amp_slider.addClass('middle');

  rift_length_label = createP('Approximate Rift Length: ' + rftl);
  rift_length_label.addClass('middle');
  rift_length_slider = createSlider(5, 18, rftl);
  rift_length_slider.addClass('middle');

  // Scale Select box
  scale_label = createP('Scale');
  scale_label.addClass('middle');
  scale = createSelect();
  scale.addClass('middle');
  for(var i=0; i<Object.keys(scale_holder).length; i++)
  scale.option('' + Object.keys(scale_holder)[i]);
  scale.changed(scaleChanged);
  
  

  // Info 
  $('body').append('<h3 id="info" class="middle"> 0 represents the root note (e.g. 2 = major 2nd) </h3>');


  // Make first riff
  rifts.push(new Rift());

  // Oscillator
  osc = new p5.SinOsc();
  osc.amp(amp);
  osc.setType(osc_type);
  osc.freq(midiToFreq(root));

  if(oscOn)
    osc.start();
}

function addScales() {
  scale_holder['Major'] = [-12,-10,-8,-7,-5,-3,-1,0,2,4,5,7,9,11,12];
  scale_holder['Pentatonic'] = [-12,-10,-8,-5,-3,0,2,4,7,9,12];
  scale_holder['Harmonic Minor'] = [-12,-10,-9,-7,-5,-4,-1,0,2,3,5,7,8,11,12];
  scale_holder['Natural Minor'] = [-12,-10,-9,-7,-5,-4,-2,0,2,3,5,7,8,10,12];
  scale_holder['Dorian'] = [-12,-10,-9,-7,-5,-3,-2,0,2,3,5,7,9,10,12];
}

function draw() {
  update_sliders();
  change_note();
}

function update_sliders() {
  root = root_slider.value();
  bpm  = bpm_slider.value();
  amp  = amp_slider.value()/100.0;
  rftl = rift_length_slider.value();

  bpm_label.html('Beats Per Minute: ' + bpm);
  root_label.html('Root Note: ' +twelve_tones[root%12] +''+(floor(root/12)-1));
  amp_label.html('Volume: ' + floor(amp*100));
  rift_length_label.html('Approximate Rift Length: '+rftl);
  osc.amp(amp);
}

var pastMillis = 0;
var rift_index = 0;
function change_note() {
  if(millis()-pastMillis>60000.0/bpm) {
    pastMillis = millis();
    cur_rift = rifts[rifts.length-1];
    cur_rift_length = cur_rift.rift_size;
    rift_index = rift_index%cur_rift_length;

    $('#note-container .note').removeClass("orange_red");
    $('#note-container .note:eq(' + rift_index +')').addClass('orange_red');
    osc.freq(midiToFreq(root + cur_rift.notes[rift_index]));

    rift_index++;
  }
}

// Trying to fix mobile bug where toggle is to quick
var since_toggle = 0;
function toggleOsc() {
  console.log(millis());
  if (millis() - since_toggle > 500) {
    if (oscOn) {
      osc.stop();
      start_stop_button.html('sound on');
    } else {
      osc.start();
      start_stop_button.html('sound off');
    }
    oscOn = !oscOn;
    since_toggle = millis();
  }
}

function keyPressed() {
  makeRift();
}

function makeRift() {
  rifts.push(new Rift());
}

function scaleChanged() {
  current_scale = scale.value();
  rifts.push(new Rift());
}

function Rift() {
  this.rift_size = rftl + round(random(-3,3));
  this.notes = [];
  this.make_rift();
  this.set_rift_in_dom();
}

Rift.prototype.make_rift = function() {
  good_riff = false;

  while(!good_riff) {
    this.notes = [];
    cur_index = scale_holder[current_scale].indexOf(0);
    for (var i=0; i<this.rift_size; i++) {
      var temp_cur_index = cur_index;
      do {
        cur_index = temp_cur_index + round(random(-4, 4));
      }
      while(cur_index < 0 || cur_index>=scale_holder[current_scale].length) 
        this.notes.push(scale_holder[current_scale][cur_index]);
    }

    if(abs(this.notes[0] - this.notes[this.rift_size-1]) < 12) { //<12
      good_riff=true;
    }
  }
}

Rift.prototype.set_rift_in_dom = function() {
  $('#note-container').empty();
  for (var i=0; i<this.rift_size; i++) {
    $('#note-container').append('<span class="note">' + this.notes[i] + '</span>');
  }
};


