const fric = .999
const surF = .999
const grav = 0.5
const stiffness = 5
const linkSize = 25
const horizSpace = 50
const leniency = 10;
var monkeSprite;
var angle = degToRad(75)
var t = 0
var g = 10
var chainLen = 0
var points = []
var lines = []
var paused = false
var hovering = false
var mi = 1

document.querySelector("button").addEventListener("click", function () {
    paused = !paused
})

function degToRad(degrees) {
    return degrees * (Math.PI/180)
}

function randomColor() {
    let letters = "0123456789ABCDEF".split('')
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += letters[Math.round(Math.random()*15)]
    }
    return color
}

function addPoint(x, y, vx, vy, rad=15, fixed=false) {
    points.push({
        x: x,
        y: y,
        ox: x-vx,
        oy: y-vy,
        fixed: fixed,
        radius: rad
    })
    return points[points.length-1]
}

function addLine(p1,p2,col){
    lines.push({
        p1, p2,
        len : Math.hypot(p1.x - p2.x,p1.y-p2.y),
        col
    })   
    return lines[lines.length-1]
}

function movePoint(p){
    if(p.fixed){
        return
    }
    var vx = (p.x - p.ox) * fric
    var vy = (p.y - p.oy) * fric
    p.ox = p.x
    p.oy = p.y
    p.x += vx
    p.y += vy
    p.y += grav
}

function constrainLine(l){
    var dx = l.p2.x - l.p1.x
    var dy = l.p2.y - l.p1.y
    var ll = Math.hypot(dx,dy)
    var fr = ((l.len - ll) / ll) / 2
    dx *= fr
    dy *= fr
    if(l.p2.fixed){
        if(!l.p1.fixed){
            l.p1.x -=dx * 2
            l.p1.y -=dy * 2
        }
    }else if(l.p1.fixed){
        if(!l.p2.fixed){
            l.p2.x +=dx * 2
            l.p2.y +=dy * 2
        }
    }else{
        l.p1.x -=dx
        l.p1.y -=dy
        l.p2.x +=dx
        l.p2.y +=dy
    }
}

function drawLine(l) {
    if (hovering && l == lines[mi]) tint(255, 125.5)
    else tint(255, 255)
    let monkeWidth = monkeSprite.width / 10;
    let monkeHeight = monkeSprite.height / 10;
    push()
    translate((l.p1.x + l.p2.x)/2, (l.p1.y + l.p2.y)/2)
    rotate(Math.atan2(l.p2.y - l.p1.y, l.p2.x - l.p1.x) - radians(90))
    image(monkeSprite, 0, 0, monkeWidth, monkeHeight)
    pop()
}

function movePoints(){
    for(let i = 0; i < points.length; i ++){
        movePoint(points[i])
    }
}
function drawLines(){
    for(let i = 0; i < lines.length; i ++){
        drawLine(lines[i])
    }
}
function constrainLines() {
  for (let i = 0; i < lines.length; i++) {
    constrainLine(lines[i])
  }
}

function addChainLink(p1, p2){
    let lp = points[points.length - 1]

    var dx = 0
    var dy = linkSize

    let nx = lp.x + dx
    let ny = lp.y + dy
    let nvx = nx - lp.ox
    let nvy = ny - lp.oy
   
    addPoint(nx, ny, nvx, nvy)

    points[points.length - 1].fixed = true

    let c = randomColor()

    addLine(points[points.length-2], points[points.length-1], c)

}

function connectLink() {
    let p1 = points[mi]
    let p2 = points[mi + 1]
    
    lines.forEach(ln => {
        if (ln.p1 == p2) {
            ln.p1 = p1
        }
        if (ln.p2 == p2) {
            ln.p2 = p1
        }
    })

    points[mi].fixed = false
    points.splice(mi+1, 1)
    points[mi + 1].fixed = true
    mi++

    // before we adjust l, this is what the inside of the cos funciton is:

    let inside = sqrt(g / chainLen) * t
    chainLen += linkSize
    let newInside = sqrt(g / chainLen) * t

    if (!isNaN(inside)) {
        t = t * (inside / newInside)
    }

    for (i = 0; i < mi; i++) {
        points[i].y -= linkSize
        points[i].oy -= linkSize
    }

    for (i = mi; i < points.length; i++) {
        points[i].x += horizSpace
        points[i].ox += horizSpace
    }

}

// NOT VERLET


function setup() {
    createCanvas(windowWidth, windowHeight)
    rectMode(CENTER)
    noStroke()
    resetGame()
    h = windowHeight
    w = windowWidth
    frameRate(30)
    monkeSprite = loadImage('../egg.png');
    imageMode(CENTER);
}

function resetGame() {
    points = []
    lines = []
    mi = 1

    addPoint(windowWidth / 2, windowHeight / 2, 0, 0, 15, fixed = true)
    addChainLink()
    chainLen = linkSize

    // add the monkeys
    for (i = 0; i < 5; i++) {
        let tp = addPoint(windowWidth / 2 - i * horizSpace, windowHeight / 2 + linkSize, 0, 0, 15, fixed = true)
        let bp = addPoint(windowWidth / 2 - i * horizSpace, windowHeight / 2 + linkSize * 2, 0, 0, 15, fixed = true)
        addLine(tp, bp, randomColor())
    }
}

function computePendulumTheta() {
    return angle * cos(sqrt(g / chainLen) * t)
}

function draw() {
    if (paused) return
    if (mi == points.length - 1) {
        resetGame()
    }

    let theta = computePendulumTheta()
    if (abs(degrees(theta)) < leniency) hovering = true;
    else hovering = false;

    t += degToRad(10)

    background(255)
    lp = points[mi]
    lp.ox = lp.x
    lp.oy = lp.y
    let px = sin(theta) * chainLen + points[0].x
    let py = cos(theta) * chainLen + points[0].y
    lp.x = px
    lp.y = py

    // draw the pendum
    //stroke(120, 120, 120)
    //line(points[0].x, points[0].y, px, py)

    movePoints()
    for (var i = 0; i < stiffness; i++){
        constrainLines()
    }
    drawLines()

}


function keyPressed() {
    if (key == "z") {
        let theta = computePendulumTheta()
        if (abs(degrees(theta)) < leniency) {
            connectLink()
        } else resetGame();
    }
}