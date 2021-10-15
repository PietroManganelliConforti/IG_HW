"use strict";

var canvas;
var gl;
var numVertices = 150;
var program;
var c;
var pointsArray = [];
var texCoordsArray = [];
var normalsArray = [];
var texture;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var projFlag = false;
var shFlag = false;
var posLightFlag = true;
var stop = 0;
var direc = 0;
var Tflag = false;
var nImg = 0;
var ambFlag = true;

var axis = 0;
var theta = [0, 0, 0];

var thetaLoc;

////////////////VARIABILI PROJECTION

var near = -10.0;
var far = 10.0;
var radius = 6.0;
var theta2 = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI / 180.0;

var left = -2.0;
var right = 2.0;
var bottom = -2.0;
var top2 = 2.0;

var fovy = 45.0;  // Field-of-view 
var aspect;

var instanceMatrix, nMatrix;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);


//-------SPOTLIGHT--------//

var spotlightAmbient = vec4(0.5, 0.5, 0.7, 1.0);   //colore amb spot
var lightDiffuse = vec4(0.0, 1.0, 1.0, 1.0);   //colore posizionale
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var lightPosition = vec4(0.0, 0.0, -1.0, 0.0);  //VAR LOC. LIGHT POSIZIONALE DA CAMBIARE (LAMPADINA)

var spotDirection = vec3(0.0, 0.0, -1.0);
var spotCutoff = 0.95;  //regolabile

//-------MATERIAL-------//      //da moltiplicare diff pos e dir con il diff obj, CARATTERISTICHE MATERIALE

var materialAmbientspot = vec4(0.2, 0.2, 0.2, 1.0);
var materialAmbientdir = vec4(0.5, 0.5, 0.5, 1.0);

var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var materialSpecular = vec4(0.6, 0.4, 0.2, 1.0);
var materialShininess = 150.0; //metallo tra 100 e 200

//------DIR. LIGHT-------//

var lightDirPosition = vec4(-1.0, -5.0, 0.0, 1.0);  //VAR LOC. LIGHT POSIZIONALE DA CAMBIARE (LAMPADINA)
var lightDirDiffuse = vec4(0.6, 0.6, 0.1, 0.5);   //colore posizionale
var lightDirAmbient = vec4(0.8, 0.8, 0.8, 1.0);   //AMB DIR

//------VERTICES-------//


var texCoord = [  //coordinate vertici texture
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertexColors = [
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.5, 0.5, 1.0, 1.0),  // blue chi
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 0.5, 1.0),  // white
    vec4(0.0, 1.0, 1.0, 1.0),   // cyan
    vec4(0.0, 0.0, 0.0, 1.0),  // black
];

var vertices = [
    // X      Y      Z
    vec4(-0.75, -0.1, 0.25, 1.0),  //A
    vec4(-0.75, 0.25, 0.25, 1.0),  //B
    vec4(0.55, 0.5, 0.25, 1.0),   //C
    vec4(0.95, -0.1, 0.25, 1.0),   //D
    vec4(-0.75, -0.1, -0.25, 1.0),  //E
    vec4(-0.75, 0.25, -0.25, 1.0),  //F
    vec4(0.55, 0.5, -0.25, 1.0),   //G
    vec4(0.95, -0.1, -0.25, 1.0),   //H
    vec4(-0.75, 0.6, 0.25, 1.0),  //I allettone sx
    vec4(-0.75, 0.6, -0.25, 1.0),  //J  allettonedx
    vec4(-0.7, 0.6, 0.25, 1.0),  //K  
    vec4(-0.7, 0.6, -0.25, 1.0),  //L 
    vec4(-0.3, 0.335, 0.25, 1.0),  //M 
    vec4(-0.3, 0.335, -0.25, 1.0),  //N 

    //prima ala
    vec4(-0.2, 0.05, 0.25, 1.0),   //A1
    vec4(-0.2, -0.05, 0.25, 1.0),  //A2
    vec4(0.5, 0.05, 0.25, 1.0),    //A3
    vec4(0.5, -0.05, 0.25, 1.0),   //A4

    vec4(-0.2, -0.03, 1.3, 1.0),   //A5
    vec4(-0.2, -0.05, 1.3, 1.0),  //A6
    vec4(0.3, -0.03, 1.3, 1.0),    //A7
    vec4(0.3, -0.05, 1.3, 1.0),   //A8

    //seconda ala

    vec4(-0.2, 0.05, -0.25, 1.0),   //B1
    vec4(-0.2, -0.05, -0.25, 1.0),  //B2
    vec4(0.5, 0.05, -0.25, 1.0),    //B3
    vec4(0.5, -0.05, -0.25, 1.0),   //B4

    vec4(-0.2, -0.03, -1.3, 1.0),   //B5
    vec4(-0.2, -0.05, -1.3, 1.0),  //B6
    vec4(0.3, -0.03, -1.3, 1.0),    //B7
    vec4(0.3, -0.05, -1.3, 1.0),   //B8
];

var verticesx = [ //vertici cubo di testing
    vec4(-0.45, -1.70, 0.5, 1.0),
    vec4(-0.45, -0.70, 0.5, 1.0),
    vec4(0.45, -0.70, 0.5, 1.0),
    vec4(0.45, -1.70, 0.5, 1.0),
    vec4(-0.45, -1.70, -0.5, 1.0),
    vec4(-0.45, -0.70, -0.5, 1.0),
    vec4(0.45, -0.70, -0.5, 1.0),
    vec4(0.45, -1.70, -0.5, 1.0)
];


function quad(a, b, c, d) {
    var t1 = subtract(vertices[b], vertices[a]);  //calcolo le normali
    var t2 = subtract(vertices[c], vertices[a]);
    var normal = cross(t1, t2);

    if (a == 0 && b == 1 && c == 2 && d == 3 ||  //giro quelle invertite
        a == 1 && b == 8 && c == 10 && d == 12
    ) normal = cross(t2, t1);

    normal = vec3(normalize(normal));

    var indices = [a, b, c, a, c, d];
    var indicesTex = [0, 1, 2, 0, 2, 3];

    for (var i = 0; i < indices.length; ++i) {

        //pointsArray.push(mult(vertices[indices[i]],vec4(0.5,0.5,0.5,1.0)));  // per scalare la grandezza dell'aereo
        pointsArray.push(vertices[indices[i]]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[indicesTex[i]]);
    }
}

function quad2(a, b, c, d) {
    var t1 = subtract(verticesx[b], verticesx[a]);  //calcolo le normali
    var t2 = subtract(verticesx[c], verticesx[a]);
    var normal = cross(t1, t2);

    if (a == 0 && b == 1 && c == 2 && d == 3 ||  //giro quelle invertite
        a == 1 && b == 8 && c == 10 && d == 12
    ) normal = cross(t2, t1);

    normal = vec3(normalize(normal));

    var indices = [a, b, c, a, c, d];
    var indicesTex = [0, 1, 2, 0, 2, 3];

    for (var i = 0; i < indices.length; ++i) {

        //pointsArray.push(mult(verticesx[indices[i]],vec4(0.5,0.5,0.5,1.0)));  // per scalare la grandezza dell'aereo
        pointsArray.push(verticesx[indices[i]]);
        normalsArray.push(normal);
        texCoordsArray.push(texCoord[indicesTex[i]]);
    }
}


function TestCube()   //CUBO DI TESTING x debug
{
    quad2(1, 0, 3, 2);
    quad2(2, 3, 7, 6);
    quad2(3, 0, 4, 7);
    quad2(6, 5, 1, 2);
    quad2(4, 5, 6, 7);
    quad2(5, 4, 0, 1);
}

function MakeVolume(a, b, c, d, e, f, g, h)  //creo il parallelepipedo
{
    quad(a, b, c, d);
    quad(c, d, h, g);
    quad(d, a, e, h);
    quad(g, f, b, c);
    quad(e, f, g, h);
    quad(f, e, a, b);
}

function PLANE() {

    var a = 0; var b = 1; var c = 2; var d = 3; var e = 4; var f = 5; var g = 6; var h = 7;
    var i = 8; var j = 9; var k = 10; var l = 11; var m = 12; var n = 13;

    var a1 = 14; var a2 = 15; var a3 = 16; var a4 = 17; var a5 = 18; var a6 = 19;  //prima ala
    var a7 = 20; var a8 = 21;

    var b1 = 22; var b2 = 23; var b3 = 24; var b4 = 25; var b5 = 26; var b6 = 27;  //seconda ala
    var b7 = 28; var b8 = 29;

    MakeVolume(a, b, c, d, e, f, g, h);
    MakeVolume(b, i, k, m, f, j, l, n);
    MakeVolume(a6, a5, a7, a8, a2, a1, a3, a4);
    MakeVolume(b2, b1, b3, b4, b6, b5, b7, b8);
}

function configureTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

window.onload = function init() {

    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");
    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect = canvas.width / canvas.height;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Carico gli shaders     
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //this.TestCube();  //CUBO di testing

    PLANE();  //crea l'aereoplano

    ///--------VERTEX BUFFER---------///
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    ///--------NORMALS BUFFER---------///
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);


    ///--------TEXTURE BUFFER---------///
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    var img = document.getElementById("texImage1");
    configureTexture(img);

    ///--------PROJECTION MATRICES---------///
    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

    thetaLoc = gl.getUniformLocation(program, "uTheta");


    //-----LIGHT VAR-----//

    //SPOTLIGHT
    gl.uniform3fv(gl.getUniformLocation(program, "uspotDirection"), flatten(spotDirection));
    gl.uniform1f(gl.getUniformLocation(program, "uspotCutoff"), spotCutoff);

    //ambientProduct
    gl.uniform4fv(gl.getUniformLocation(program, "uspotLightAmbient"), flatten(spotlightAmbient));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightDirAmbient"), flatten(lightDirAmbient));

    gl.uniform4fv(gl.getUniformLocation(program, "umaterialAmbientspot"), flatten(materialAmbientspot));
    gl.uniform4fv(gl.getUniformLocation(program, "umaterialAmbientdir"), flatten(materialAmbientdir));
    //diffuseProduct
    gl.uniform4fv(gl.getUniformLocation(program, "uLightDiffuse"), flatten(lightDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "uMaterialDiffuse"), flatten(materialDiffuse));

    //specularProduct
    gl.uniform4fv(gl.getUniformLocation(program, "uLightSpecular"), flatten(lightSpecular));
    gl.uniform4fv(gl.getUniformLocation(program, "uMaterialSpecular"), flatten(materialSpecular));

    //Directional - sole
    gl.uniform4fv(gl.getUniformLocation(program, "uLightDirPosition"), flatten(lightDirPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "uLightDirDiffuse"), flatten(lightDirDiffuse));

    //position
    gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition));

    //brillantezza
    gl.uniform1f(gl.getUniformLocation(program, "uShininess"), materialShininess);

    //flag spotlight
    gl.uniform1f(gl.getUniformLocation(program, "uposLightFlag"), posLightFlag);

    //flag ambientale
    gl.uniform1f(gl.getUniformLocation(program, "uambFlag"), ambFlag);

    ///--------BUTTONS---------///
    document.getElementById("inccutoff").onclick = function () { spotCutoff += 0.01; gl.uniform1f(gl.getUniformLocation(program, "uspotCutoff"), spotCutoff); };
    document.getElementById("deccutoff").onclick = function () { spotCutoff -= 0.01; gl.uniform1f(gl.getUniformLocation(program, "uspotCutoff"), spotCutoff); };

    document.getElementById("Button1").onclick = function () { near += 2.0; };
    document.getElementById("Button2").onclick = function () { near -= 2.0; };
    document.getElementById("Button11").onclick = function () { far += 2.0; };
    document.getElementById("Button21").onclick = function () { far -= 2.0; };
    document.getElementById("Button3").onclick = function () { radius += 1.0; };
    document.getElementById("Button4").onclick = function () { radius -= 1.0; };
    document.getElementById("Button5").onclick = function () { theta2 += dr; };
    document.getElementById("Button6").onclick = function () { theta2 -= dr; };
    document.getElementById("Button7").onclick = function () { phi += dr; };
    document.getElementById("Button8").onclick = function () { phi -= dr; };
    document.getElementById("xButton").onclick = function () { axis = xAxis; };
    document.getElementById("yButton").onclick = function () { axis = yAxis; };
    document.getElementById("zButton").onclick = function () { axis = zAxis; };
    document.getElementById("stopButton").onclick = function () { stop = (stop + 1) % 2; };
    document.getElementById("dirButton").onclick = function () { direc = (direc + 1) % 2; };
    document.getElementById("projButton").onclick = function () { projFlag = !projFlag; };
    document.getElementById("texButton").onclick = function () {
        Tflag = !Tflag;
        gl.uniform1f(gl.getUniformLocation(program, "uTflag"), Tflag);
    };

    document.getElementById("ChangetexButton").onclick = function () {
        nImg = ((nImg + 1) % 3)
        configureTexture(document.getElementById("texImage" + String(nImg + 1)));

        //document.getElementById("gl-canvas").className  = 'canvas'+String(nImg+1); //f di prova per cambiare sfondo
    };

    //LIGHT BUTTONS
    document.getElementById("ambButton").onclick = function () { ambFlag = !ambFlag; gl.uniform1f(gl.getUniformLocation(program, "uambFlag"), ambFlag); };
    document.getElementById("posLightButton").onclick = function () { posLightFlag = !posLightFlag; gl.uniform1f(gl.getUniformLocation(program, "uposLightFlag"), posLightFlag); };
    document.getElementById("ButtonLightXpos").onclick = function () { lightPosition[0] += 0.2; gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition)); };
    document.getElementById("ButtonLightXneg").onclick = function () { lightPosition[0] -= 0.2; gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition)); };
    document.getElementById("ButtonLightYpos").onclick = function () { lightPosition[1] += 0.2; gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition)); };
    document.getElementById("ButtonLightYneg").onclick = function () { lightPosition[1] -= 0.2; gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition)); };
    document.getElementById("ButtonLightZpos").onclick = function () { lightPosition[2] += 0.2; gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition)); };
    document.getElementById("ButtonLightZneg").onclick = function () { lightPosition[2] -= 0.2; gl.uniform4fv(gl.getUniformLocation(program, "uLightPosition"), flatten(lightPosition)); };
    document.getElementById("shButton").onclick = function () { shFlag = !shFlag; gl.uniform1f(gl.getUniformLocation(program, "shFlag"), shFlag); };
    document.getElementById("colorspot").onchange = function () {

        var color = document.getElementById("colorspot").value;  //da esa a decimale da decimale 0-255 a 0-1
        var R = color[1] + color[2];
        R = parseInt(R, 16) / 255;
        var G = color[3] + color[4];
        G = parseInt(G, 16) / 255;
        var B = color[5] + color[6];
        B = parseInt(B, 16) / 255;
        gl.uniform4fv(gl.getUniformLocation(program, "uLightDiffuse"), flatten(vec4(R, G, B, 1.0)));
    };

    document.getElementById("colordir").onchange = function () {
        var color = document.getElementById("colordir").value;
        var R = color[1] + color[2];
        R = parseInt(R, 16) / 255;
        var G = color[3] + color[4];
        G = parseInt(G, 16) / 255;
        var B = color[5] + color[6];
        B = parseInt(B, 16) / 255;
        gl.uniform4fv(gl.getUniformLocation(program, "uLightDirDiffuse"), flatten(vec4(R, G, B, 1.0)));
    };

    render();
}

function render() {
    gl.clear(gl.DEPTH_BUFFER_BIT);
    //gl.clear( gl.COLOR_BUFFER_BIT); //per tenere lo sfondo con le nuvole

    if (stop == 1) {
        if (direc == 1) theta[axis] += 1.0;
        else theta[axis] -= 1.0;
    }

    instanceMatrix = mat4();
    instanceMatrix = mult(instanceMatrix, rotateX(theta[0]));
    instanceMatrix = mult(instanceMatrix, rotateY(theta[1]));
    instanceMatrix = mult(instanceMatrix, rotateZ(theta[2]));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "uInstanceMatrix"), false, flatten(instanceMatrix));

    if (projFlag) { //per debug se voglio fermare la proiezione passo matrici I
        modelViewMatrix = (mat4(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0));
        projectionMatrix = (mat4(1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0));
    } else {
        eye = vec3(
            radius * Math.sin(theta2) * Math.cos(phi),
            radius * Math.sin(theta2) * Math.sin(phi),
            radius * Math.cos(theta2)
        );

        modelViewMatrix = lookAt(eye, at, up); //cam
        projectionMatrix = ortho(left, right, bottom, top2, near, far); //volume view
    }

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // normali da ruotare
    nMatrix = mat4();
    nMatrix = mult(modelViewMatrix, instanceMatrix);
    nMatrix = normalMatrix(nMatrix, true);

    gl.uniformMatrix3fv(gl.getUniformLocation(program, "uNormalMatrix"), false, flatten(nMatrix));

    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    requestAnimationFrame(render);
}



document.onkeydown = function (e) {  //per usare frecce o wasd come controllo
    switch (e.keyCode) {
        case 65: case 37:
            //a
            axis = yAxis;
            direc = 1;
            break;
        case 87: case 38:
            //w
            axis = xAxis;
            direc = 1;
            break;
        case 68: case 39:
            //d
            axis = yAxis;
            direc = 0;
            break;
        case 83: case 40:
            //s
            axis = xAxis;
            direc = 0;
            break;
        case 81:
            //q
            axis = zAxis;
            direc = 1;
            break;
        case 69:
            //e
            axis = zAxis;
            direc = 0;
            break;
        case 13:
            stop = (stop + 1) % 2;
            break;
    }
};
