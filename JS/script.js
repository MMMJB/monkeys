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

var points = []
var lines = []
const fric = .999
const surF = .999
const grav = 0.5
const stiffness = 5

var paused = false;
document.querySelector("button").addEventListener("click", function () {
    paused = !paused
})

var angle = degToRad(75);
var t = 0;
var g = 10;
var l = 0

function addPoint(x, y, vx, vy,rad = SIZE/2, fixed = false){
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

function addChainLink(){
    let lp = points[points.length - 1]

    var dx = 0
    var dy = SIZE

    if (points.length > 1) {
        let lpp = points[points.length - 2]
        dx = lp.x - lpp.x
        dy = lp.y - lpp.y
    }

    let nx = lp.x + dx
    let ny = lp.y + dy
    let nvx = nx - lp.ox
    let nvy = ny - lp.oy
   
    addPoint(nx, ny, nvx, nvy)

    if (points.length >= 3) {
        points[points.length - 2].fixed = false
    }

    points[points.length - 1].fixed = true

    let c = randomColor()

    addLine(points[points.length-2], points[points.length-1], c);

    // before we adjust l, this is what the inside of the cos funciton is:
    let inside = sqrt(g/l)*t
    l += SIZE
    let newInside = sqrt(g/l)*t
  
    if (!isNaN(inside)) {
        t = t * (inside / newInside)
    }
    
}

// NOT VERLET

const SIZE = 25

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noStroke();
  addPoint(windowWidth/2 - SIZE/2, windowHeight/2 - SIZE/2, 0, 0, SIZE/2, fixed=true);
  addChainLink();
  h = windowHeight;
  w = windowWidth;
  frameRate(30);
}

var dir = 1
function draw() {
    if (paused) return
    let theta = angle * cos(sqrt(g/l)*t)
    t += degToRad(10)

    background(255);
    lp = points[points.length-1]
    lp.ox = lp.x
    lp.oy = lp.y
    let px = sin(theta) * l + points[0].x
    let py = cos(theta) * l + points[0].y
    lp.x = px
    lp.y = py

    // draw the pendum
    //stroke(120, 120, 120)
    //line(points[0].x, points[0].y, px, py)

    movePoints();
    for (var i = 0; i < stiffness; i++){
        constrainLines();
    }
    drawLines()

}

function printLastPoint(msg) {
    console.log(msg)
    let lp = points[points.length - 1]
    console.log(lp.x, lp.y)
}

function keyPressed() {
    if (key == "z") {
        addChainLink();
    }
}