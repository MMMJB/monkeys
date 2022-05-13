function degToRad(degrees) {
    return degrees * (Math.PI/180);
}

function randomColor() {
    let letters = "0123456789ABCDEF".split('');
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random()*15)];
    }
    return color;
}

var points = [];
var lines = [];
const fric = .999;
const surF = .999;
const grav = 0.5;
const stiffness = 2;

var paused = false;
document.querySelector("button").addEventListener("click", function() {
    if (paused) paused = false;
    else paused = true;
    console.log("yes");
})

var angle = degToRad(180);
var t = 0;
var g = 10;
var l;

function addPoint(x,y,vx,vy,rad = SIZE/2,fixed = false){
    points.push({
        x: x,
        y: y,
        ox: x-vx,
        oy: y-vy,
        fixed: fixed,
        radius: rad
    })
    return points[points.length-1];
}

function addLine(p1,p2,col){
    lines.push({
        p1,p2,
        len : Math.hypot(p1.x - p2.x,p1.y-p2.y),
        col
    })   
    return lines[lines.length-1];
}

function movePoint(p){
    if(p.fixed){
        return;
    }
    var vx = (p.x - p.ox) * fric;
    var vy = (p.y - p.oy) * fric;
    p.ox = p.x;
    p.oy = p.y;
    p.x += vx;
    p.y += vy;
    p.y += grav;
}

function constrainLine(l){
    var dx = l.p2.x - l.p1.x;
    var dy = l.p2.y - l.p1.y;
    var ll = Math.hypot(dx,dy);
    var fr = ((l.len - ll) / ll) / 2;
    dx *= fr;
    dy *= fr;
    if(l.p2.fixed){
        if(!l.p1.fixed){
            l.p1.x -=dx * 2;
            l.p1.y -=dy * 2;
        }
    }else if(l.p1.fixed){
        if(!l.p2.fixed){
            l.p2.x +=dx * 2;
            l.p2.y +=dy * 2;
        }
    }else{
        l.p1.x -=dx;
        l.p1.y -=dy;
        l.p2.x +=dx;
        l.p2.y +=dy;
    }
}

function drawLine(l) {
  stroke(l.col);
  strokeWeight(5);
  line(l.p1.x, l.p1.y, l.p2.x, l.p2.y);
}

function closestPoint(x,y){
    var min = 40;
    var index = -2;
    for(var i = 0; i < points.length; i ++){
        var p = points[i];
        var dist = Math.hypot(p.x-x,p.y-y);
        p.mouseDist = dist;
        if(dist < min){
            min = dist;
            index = i;
            
        }
        
    }
    return index;
}

function movePoints(){
    for(let i = 0; i < points.length; i ++){
        movePoint(points[i]);
    }
}
function drawLines(){
    for(let i = 0; i < lines.length; i ++){
        drawLine(lines[i]);
    }
}
function constrainLines() {
  for (let i = 0; i < lines.length; i++) {
    constrainLine(lines[i]);
  }
}

var lastChainLink = 0;
function addChainLink(){
    let lp = points[points.length-1];
    addPoint(lp.x,lp.y + SIZE/2,lp.ox,lp.oy);
    if (points.length >= 3) {
        llp = points[points.length - 2];
        llp.fixed = false;
    }
    points[points.length - 1].fixed = true;
    let c = randomColor();
    addLine(points[points.length-2],points[points.length-1],c);
    l = 0
    lines.forEach(ln => {
        l += Math.hypot(ln.p1.x - ln.p2.x,ln.p1.y-ln.p2.y)
    })
}

//NOT VERLET
const SIZE = 50;
var lastChainLink = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();
  addPoint(windowWidth/2 - SIZE/2, windowHeight/2 - SIZE/2, 0, 0, SIZE/2, fixed=true);
  addChainLink();
  h = windowHeight;
  w = windowWidth;
  frameRate(1);
}

function draw() {
    if (!paused) {
        let theta = angle * cos(sqrt(g/l) * t);
        background(255);
        lp = points[points.length-1]
        console.log("before lp ", lp.x, lp.y, lp.ox, lp.oy)
        lp.ox = lp.x
        lp.oy = lp.y
        lp.x = sin(theta/2) * l + points[0].x;
        lp.y = cos(theta/2) * l + points[0].y;
        console.log("after lp ", lp.x, lp.y, lp.ox, lp.oy)
        
        movePoints();
        drawLines();
        for (var i = 0; i < stiffness; i++){
            constrainLines();
        }
        t += degToRad(10);
        console.log("after after lp ", lp.x, lp.y, lp.ox, lp.oy)
    }
}

function keyPressed() {
    if (key == "z") {
        addChainLink();
        draw()
        paused = true;
    }
}