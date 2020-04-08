// https://kylemcdonald.github.io/cv-examples/

const FlowCalculator = require("./flow");
const Graph = require("./Graph");
const p5 = require("p5");
const Particles = require("./particle");
const Triangles = require("./triangles");


var capture;
var previousPixels;
var flow;
var w = 640,
    h = 480;
var step = 10;
var rows, cols;
rows = cols = 0; //initialize at 1;
var num_zones;


let particles =[];
let triangles;
let triangleStoredValues;

var uMotionGraph, vMotionGraph;

function calculateMaxZones(){
    var wMax = w - step - 1;
    var hMax = h - step - 1;
    var winStep = step * 2 + 1;
    var globalY, globalX;
    var i,j;
    i = j = 0;
    for (globalY = step + 1; globalY < hMax; globalY += winStep) {
        i = 0
        for (globalX = step + 1; globalX < wMax; globalX += winStep) {
            i++;
        }
        j++;
    }
    rows = j;
    cols = i;  
    console.log(`Rows: ${rows} and Columns: ${cols}`);
    return rows * cols;
}

 

function hsbGradient(steps, colours) {
  var parts = colours.length - 1;
  var gradient = new Array(steps);
  var gradientIndex = 0;
  var partSteps = Math.floor(steps / parts);
  var remainder = steps - (partSteps * parts);
  for (var col = 0; col < parts; col++) {
    // get colours
    var c1 = colours[col], 
        c2 = colours[col + 1];
    // determine clockwise and counter-clockwise distance between hues
    var distCCW = (c1.h >= c2.h) ? c1.h - c2.h : 1 + c1.h - c2.h;
        distCW = (c1.h >= c2.h) ? 1 + c2.h - c1.h : c2.h - c1.h;
     // ensure we get the right number of steps by adding remainder to final part
    if (col == parts - 1) partSteps += remainder; 
    // make gradient for this part
    for (var step = 0; step < partSteps; step ++) {
      var p = step / partSteps;
      // interpolate h, s, b
      var h = (distCW <= distCCW) ? c1.h + (distCW * p) : c1.h - (distCCW * p);
      if (h < 0) h = 1 + h;
      if (h > 1) h = h - 1;
      var s = (1 - p) * c1.s + p * c2.s;
      var b = (1 - p) * c1.b + p * c2.b;
      // add to gradient array
      gradient[gradientIndex] = {h:h, s:s, b:b};
      gradientIndex ++;
    }
  }
  return gradient;
}


const p5Flow = (p) => {

    p.setup = () => {
        p.createCanvas(w, h);
        capture = p.createCapture({
            audio: false,
            video: {
                width: w,
                height: h
            }
        }, function() {
            console.log('capture ready.')
        });
        capture.elt.setAttribute('playsinline', '');
        capture.hide();
        flow = new FlowCalculator(step);
        uMotionGraph = new Graph(100, -step / 2, +step / 2);
        vMotionGraph = new Graph(100, -step / 2, +step / 2);

        num_zones = calculateMaxZones();
        triangleStoredValues = new Array(num_zones);
    }

    function copyImage(src, dst) {
        var n = src.length;
        if (!dst || dst.length != n) dst = new src.constructor(n);
        while (n--) dst[n] = src[n];
        return dst;
    }

    function same(a1, a2, stride, n) {
        for (var i = 0; i < n; i += stride) {
            if (a1[i] != a2[i]) {
                return false;
            }
        }
        return true;
    }

     p.draw = () => {
        capture.loadPixels();
        const width = p.width;
        const height = p.height;

        if(gradient === undefined){
            // create gradient from red to blue to yellow
            var gradient = hsbGradient(cols, [{h:0.98, s:0.76, b:1}, {h:0.56, s:.76, b:1}/*, {h:0.16, s:.58, b:1}*/]);
        }

        if (capture.pixels.length > 0) {
            if (previousPixels) {

                // cheap way to ignore duplicate frames
                if (same(previousPixels, capture.pixels, 4, width)) {
                    //console.log("duplicate frames");
                    return;
                }

                flow.calculate(previousPixels, capture.pixels, capture.width, capture.height);
            }
            previousPixels = copyImage(capture.pixels, previousPixels);
            // p.image(capture, 0, 0, w, h);
            if(flow.flow){
                console.log(flow.flow.zones.length);     
            }


            if (flow.flow && flow.flow.u != 0 && flow.flow.v != 0 && gradient) {
                p.background(255);
                uMotionGraph.addSample(flow.flow.u);
                vMotionGraph.addSample(flow.flow.v);

                if(triangles === undefined){
                    triangles = new Triangles(flow, triangleStoredValues);
                }

                p.strokeWeight(2);
                
                triangles.update(flow);
                triangles.draw(p, step, cols, gradient);
                // flow.flow.zones.forEach(function(zone) {
                //     const speed = Math.sqrt(zone.u * zone.u + zone.v * zone.v);
                //     if(speed > 10){
                //         //particles.push(new Particles(zone.x, zone.y, zone.u, zone.v))
                //         //p.line(zone.x, zone.y, zone.x + zone.u, zone.y + zone.v);

                //     }
                // })
            }
            else{
                //console.log("Step Skipped");
            }

            //draw, update
            particles.forEach(part => {
                part.draw(p);
            });
            particles.forEach(part => {
                part.update();
            });
            particles = particles.filter(part => {
                return !part.isOutOfBounds(p.width, p.height);
            })

            p.noFill();
            p.stroke(255);

            // draw left-right motion
            // uMotionGraph.draw(p,width, height / 2);
            // p.line(0, height / 4, width, height / 4);

            // // draw up-down motion
            p.translate(0, height / 2);
            // vMotionGraph.draw(p,width, height / 2);
            // p.line(0, height / 4, width, height / 4);
        } else {
            console.log("Capture.pixels.length <= 0");
        }
    }
}

const myp5 = new p5(p5Flow, "main");