"use strict";

var test_flag = true;

var canvas;
var gl;
var program;

var projectionMatrix;
var modelViewMatrix;

var instanceMatrix;

var modelViewMatrixLoc;

var vertices = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5,  0.5,  0.5, 1.0 ),
    vec4( 0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5,  0.5, -0.5, 1.0 ),
    vec4( 0.5, -0.5, -0.5, 1.0 )
];


var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var img1;
var img2;
var img3;
var img4;
var img5;

var torsoId = 0;
var headId  = 1;
var head1Id = 1;
var head2Id = 10;
var leftUpperArmId = 2;
var leftLowerArmId = 3;
var rightUpperArmId = 4;
var rightLowerArmId = 5;
var leftUpperLegId = 6;
var leftLowerLegId = 7;
var rightUpperLegId = 8;
var rightLowerLegId = 9;
var tailId = 11;
var treeId = 12;
var treeHeadId = 13;
var ear1Id = 14;
var leftearId = 15;
var rightearId = 16;


var orsoX = 0.0;
var orsoY = 0.0;
var orsoZ = 0.0

var torsoHeight = 10.0;
var torsoWidth = 5.5;
var upperArmHeight = 4.5;
var lowerArmHeight = 1.0;
var upperArmWidth  = 2.6;
var lowerArmWidth  = 2.0;
var upperLegWidth  = 2.6;
var lowerLegWidth  = 2.0;
var lowerLegHeight = 1.0;
var upperLegHeight = 4.5;
var headHeight = 2.5;
var headWidth = 3.0;
var tailHeight = 0.85;
var tailWidth = 1.35;

var numNodes = 17;
var numAngles = 12;
var angle = 0;

var theta = [0, 10, 90, 0, 90, 0, 90, 0, 90, 0, 0, 0];


var Dsize = 60.0;  //ortho

var at = vec3(4.0, -10.0, 0.0);
var up = vec3(0.0, 10.0, 0.0);
var theta2 = -1.0;
var phi = 0.0;
var radius = 9.0;

var AnimationMatrix = mat4(); // animation
var counter = 0;
var state = 0;
var BackFlag = true;
var StopAnimationID = true;
var translation;
var flag_sit = false;

var stack = [];

var figure = [];

for( var i=0; i<numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelViewLoc;

var pointsArray = [];
var texCoordsArray = [];
var normalsArray = [];
var texture;
var textureArray= []
//-------------------------------------------

function scale4(a, b, c) {  //per creare una matrice per scalare, usa le mat4 mette sulla diagonale i valori a b c 
   var result = mat4();
   result[0] = a;
   result[5] = b;
   result[10] = c;
   return result;
}

//--------------------------------------------

function createNode(transform, render, sibling, child){   //contenuti nella figure list, ogni oggetto con un suo id
    var node = {
    transform: transform,  //mat4, matrice di posizione e rotazione(dell'angolo dell'arto)

    render: render,        //funzione per creare una istance matrix, moltiplica alla modelViewMatrix corrente le funzioni:
                            //translate, che crea una matrice(3D o 4D) con la penultima colonna pari al valore passato e
                            //scale, che mette sulla diagonale i valori passati
                            //il prodotto della traslazione e scaling con la modelViewMatrix viene passata allo shader in "modelViewMatrix"
                            //e per 6 volte usa drawArrays(FAN MODE(tutti connessi con il primo centrale),idx_primo, count_vertici da disegnare)
                            //6 volte, una per faccia del parallelogramma
    sibling: sibling,     
    child: child,
    }
    return node;
}

function initNodes(Id) {

    var m = mat4();

    switch(Id) {

    case torsoId:
    m = mult(m,rotate(180, vec3(0, 1, 0) ));    ////angolo di rotazione del controllore nella pagina
    m = mult(m,rotate(90, vec3(1, 0, 0) ));
    m = mult(m,rotate(theta[torsoId], vec3(0, 1, 0) ));
    //m= mult(m,rotate(90, vec3(0, 0, 1 )));
    m = mult(m,translate(-5.0, -30.0, 0.0));
    m = mult(m,AnimationMatrix);
    figure[torsoId] = createNode( m, torso, null, headId );
    break;

    case tailId:   ////messa come sibling della rightupper leg, così che sia figlia del torso. Come sibling del torso non gira.
    m = rotate(theta[tailId], vec3(0, 1, 0) );
    figure[tailId] = createNode( m, tail, null, null );
    break;


    case headId:
    case head1Id:
    case head2Id:

    m = translate(0.0, torsoHeight+0.5*headHeight, 0.0);
	  m = mult(m, rotate(theta[head1Id], vec3(1, 0, 0)))
	  m = mult(m, rotate(theta[head2Id], vec3(0, 1, 0)));
    m = mult(m, translate(0.0, -0.5*headHeight, 0.0));
    figure[headId] = createNode( m, head, leftUpperArmId, leftearId);
    break;

    case leftearId:
        figure[leftearId] = createNode( m, leftear, rightearId, null );
    break;

    case rightearId:
        figure[rightearId] = createNode( m, rightear, null, null );
    break;


    case leftUpperArmId:

    m = translate(-0.5*(torsoWidth+upperArmWidth), 0.8*torsoHeight, 0.0);  ///REGOLA SPAZIO BIANCO TORSO-BRACCIO -0.5*(torsoWidth+upperArmWidth)..
	  m = mult(m, rotate(theta[leftUpperArmId], vec3(1, 0, 0)));
    figure[leftUpperArmId] = createNode( m, leftUpperArm, rightUpperArmId, leftLowerArmId );
    break;

    case rightUpperArmId:

    m = translate(0.5*(torsoWidth+upperArmWidth), 0.8*torsoHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperArmId], vec3(1, 0, 0)));
    figure[rightUpperArmId] = createNode( m, rightUpperArm, leftUpperLegId, rightLowerArmId );
    break;

    case leftUpperLegId:

    m = translate(-0.5*(torsoWidth+upperLegWidth), 0.4*upperLegHeight, 0.0);
	  m = mult(m , rotate(theta[leftUpperLegId], vec3(1, 0, 0)));
    figure[leftUpperLegId] = createNode( m, leftUpperLeg, rightUpperLegId, leftLowerLegId );
    break;

    case rightUpperLegId:

    m = translate(0.5*(torsoWidth+upperLegWidth), 0.4*upperLegHeight, 0.0);
	  m = mult(m, rotate(theta[rightUpperLegId], vec3(1, 0, 0)));
    figure[rightUpperLegId] = createNode( m, rightUpperLeg, tailId, rightLowerLegId );
    break;

    case leftLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerArmId], vec3(1, 0, 0)));
    figure[leftLowerArmId] = createNode( m, leftLowerArm, null, null );
    break;

    case rightLowerArmId:

    m = translate(0.0, upperArmHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerArmId], vec3(1, 0, 0)));
    figure[rightLowerArmId] = createNode( m, rightLowerArm, null, null );
    break;

    case leftLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[leftLowerLegId],vec3(1, 0, 0)));
    figure[leftLowerLegId] = createNode( m, leftLowerLeg, null, null );
    break;

    case rightLowerLegId:

    m = translate(0.0, upperLegHeight, 0.0);
    m = mult(m, rotate(theta[rightLowerLegId], vec3(1, 0, 0)));
    figure[rightLowerLegId] = createNode( m, rightLowerLeg, null, null );
    break;

    }
}

function traverse(Id) {   
   if(Id == null) return;

   stack.push(modelViewMatrix);                                    //prende l'idx_oggetto, pusha l'attuale modelview matrix nella lista stack
   modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);  //moltiplica l'attuale modelviewmatrix con la transform(= Mat pos e rot)
   figure[Id].render();                                            //chiama la funzione di render, che è associata ad ogni nodo creato e che
                                                                   //-crea la instanceMatrix(usando scale e translate sulla modelViewMatrix attuale)
                                                                   //-passa i valori allo shader e usa 6 volte drawArrays(FAN,idx_primo, N_vert.)                                                          
   if(figure[Id].child != null) traverse(figure[Id].child);        //se un figlio mantiene la modelviewMatrix così da spostarsi e ruotare a partire da quella
                                                                   //altrimenti fa pop dallo stack dell'ultima e continua con i fratelli,
    modelViewMatrix = stack.pop();                                 //che mantengono le precendenti modelviewMatrix dei genitori        
   if(figure[Id].sibling != null) traverse(figure[Id].sibling);    //e procede con traverse su di lui   
}

function plane(){
    instanceMatrix = mult(modelViewMatrix, scale(80.0, 2.0, 80.0) );
    
    instanceMatrix = mult(instanceMatrix, translate(0.0, -0.5*(lowerArmHeight*2.0+upperArmHeight), 0.0 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    //gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) ); //nella loc della texture una mat da 4

    useTexture(textureArray[3]); 
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function SmallTree(){
    
    instanceMatrix = mult(modelViewMatrix, scale(4.0, 25.0, 4.0) );
    instanceMatrix = mult(instanceMatrix, translate(5.0, 0.2, 0.0 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );

    useTexture(textureArray[2]); 

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);  //tronco

    

    instanceMatrix = mult(modelViewMatrix, scale(13.0, 5.0, 13.0) );    //grandezza (pos nello switch)
    instanceMatrix = mult(instanceMatrix, translate(1.5, 3.0, 0.0 ) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) ); 

    
    useTexture(textureArray[4]); 
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);  //chioma1

    
    instanceMatrix = mult(modelViewMatrix, scale(10.0, 9.0, 10.0) );    //grandezza 
    instanceMatrix = mult(instanceMatrix, translate(2.0, 2.3, 0.0) );   //posizione
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);  //chioma2
    
}



function BigTree(){
    instanceMatrix = mult(modelViewMatrix, translate(20.0,5.0, 25.0 ) );
    instanceMatrix = mult(instanceMatrix, scale(5.0, 25.0, 5.0) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    useTexture(textureArray[2]); 
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);         /// tronco

    useTexture(textureArray[4]); 

    for(var j =0; j<5; j++){
        instanceMatrix = mult(modelViewMatrix, translate(20.0, 20.0+j*5, 25.0 ) );
        instanceMatrix = mult(instanceMatrix, scale(23.0-j*5.0, 5.0, 23.0-j*5.0) );
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
        for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4); 
    }
}



function tail(){
    instanceMatrix = mult(modelViewMatrix, translate(0.0,  -(0.5*tailHeight), 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(tailWidth, tailHeight, tailWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function torso() {
    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5*torsoHeight, 0.0) );
    //instanceMatrix = mult(modelViewMatrix, rotateZ(90, vec3(1, 0, 0)) );
    instanceMatrix = mult(instanceMatrix, scale( torsoWidth, torsoHeight, torsoWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );

    useTexture(textureArray[0]); 

    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0 ));
	instanceMatrix = mult(instanceMatrix, scale(headWidth, headHeight, headWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );



    for(var i =0; i<6; i++) { 
        useTexture(textureArray[0]);
        if(i==3) useTexture(textureArray[1]);
        gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
        useTexture(textureArray[0]);
    }
}

function leftear() {

    instanceMatrix = mult(modelViewMatrix, translate(headWidth*0.35, headHeight*0.3 ,headWidth*0.65 ));  //assi con mano sinistra: medio,indice,pollice
	instanceMatrix = mult(instanceMatrix, scale(0.8, 0.8, 0.8) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    useTexture(textureArray[0]);

    for(var i =0; i<6; i++) { 
        gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    }
}

function rightear() {

    instanceMatrix = mult(modelViewMatrix, translate(headWidth*(-0.35), headHeight*0.3 ,headWidth*0.65 ));
    instanceMatrix = mult(instanceMatrix, scale(0.8, 0.8, 0.8) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    useTexture(textureArray[0]);
        
    for(var i =0; i<6; i++) { 
        gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    }
}

function bush() {
    useTexture(textureArray[4]);
    instanceMatrix = mult(modelViewMatrix, translate(-18.0,-3.0, 25.0 ) );
    instanceMatrix = mult(instanceMatrix, scale(10.0, 10.0, 15.0) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
    
    instanceMatrix = mult(modelViewMatrix, translate(-20.0,-3.0, 25.0 ) );
    instanceMatrix = mult(instanceMatrix, scale(10.0, 5.0, 10.0) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);


}

function leftUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperArmWidth, upperArmHeight, upperArmWidth) );
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerArm() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerArmHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerArmWidth, lowerArmHeight, lowerArmWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function  leftUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function leftLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate( 0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightUpperLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(upperLegWidth, upperLegHeight, upperLegWidth) );
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}

function rightLowerLeg() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0) );
	instanceMatrix = mult(instanceMatrix, scale(lowerLegWidth, lowerLegHeight, lowerLegWidth) )
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix) );
    for(var i =0; i<6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4*i, 4);
}



function quad(a, b, c, d) {
     pointsArray.push(vertices[d]);
     texCoordsArray.push(texCoord[0]);
     pointsArray.push(vertices[a]);
     texCoordsArray.push(texCoord[1]);
     pointsArray.push(vertices[b]);
     texCoordsArray.push(texCoord[2]);
     pointsArray.push(vertices[c]);
     texCoordsArray.push(texCoord[3]);
}


function cube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}


function configureTexture( image , i ) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0,  gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.activeTexture(gl.TEXTURE0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    textureArray[i]=texture;
}

function useTexture(texture){
    gl.bindTexture(gl.TEXTURE_2D,texture);
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    program = initShaders( gl, "vertex-shader", "fragment-shader"); //init shaders in program, che dico di usare
    gl.useProgram(program);

    ///creo la matrice delle istanze, che uso nello shader per la rotazione e qui nella creazione degli elementi

    instanceMatrix = mat4();

    projectionMatrix = ortho(-Dsize,Dsize,-Dsize,Dsize,-100.0,100.0); // ortho(left, right, bottom, top, near, far); , view volume

    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation( program, "modelViewMatrix"), false, flatten(modelViewMatrix)  );
    gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

    cube(); //pusha 8 vertici di un cubo nel points array, usato ogni volta per creare un nuovo oggetto
 
    ///--------VERTEX BUFFER---------/// passa i punti in aPosition allo shader
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );


    ///--------TEXTURE BUFFER---------/// passa le coordinate della texture in aTexCoord
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer( texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);

    img1 = document.getElementById("texImage1");
    this.configureTexture(img1,0); 
    img2 = document.getElementById("texImage2");
    this.configureTexture(img2,1);
    img3 = document.getElementById("texImage3");
    this.configureTexture(img3,2);
    img4 = document.getElementById("texImage4");
    this.configureTexture(img4,3);
    img5 = document.getElementById("texImage5");
    this.configureTexture(img5,4);

   
   document.getElementById("Button3").onclick = function(){radius += 3.0;};
   document.getElementById("Button4").onclick = function(){radius -= 3.0;};
   document.getElementById("Button5").onclick = function(){theta2 += 0.2;};
   document.getElementById("Button6").onclick = function(){theta2 -= 0.2;};
   document.getElementById( "zoomButton1" ).onclick = function () {
        Dsize -= 5.0;
        projectionMatrix = ortho(-Dsize,Dsize,-Dsize,Dsize,-100.0,100.0); 
        gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );
    };
   document.getElementById( "zoomButton2" ).onclick = function () {
       Dsize += 5.0;
       projectionMatrix = ortho(-Dsize,Dsize,-Dsize,Dsize,-100.0,100.0); 
       gl.uniformMatrix4fv( gl.getUniformLocation( program, "projectionMatrix"), false, flatten(projectionMatrix)  );
    };
    document.getElementById("stopButton").onclick = function(){StopAnimationID = !StopAnimationID;};
    document.getElementById("sitButton").onclick = function(){flag_sit = !flag_sit;};

   for(i=0; i<numNodes; i++){initNodes(i);}           
                                           //per numNodes volte fa l'initNodes(idx_oggetto in figureList),
                                           //init che chiama uno switch: crea una m=mat4() identità, 
                                           //la trasla in base alla posizione dell'arto
                                           //la ruota in base all'angolo dell'arto
                                           //e crea il nodo con createnode, passando:
                                           //1) matrice m della posizione e rotazione,
                                           //2) funzione per creare la instanceMatrix(usando scale e translate sulla modelViewMatrix attuale)
                                           //passa i valori allo shader e usa 6 volte (una per ogni faccia) usa drawArrays(FAN,idx_primo, N_vert.)
                                           //3,4) id_fratello, id_figlio );
                                           //creati tutti i nodi ancora non compare nulla, devo usare TRAVERSE(idx_oggetto):
                                           //traverse fa lo stack.push(modelViewMatrix);  
                                           //modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
                                           //figure[Id].render();


              
    render();
}



function walk(){

    translation=translate(0.0, 0.1, 0.0);

    if(!StopAnimationID){
        
        var step = 0.9;   //115-65 diviso T
        
        if(counter > 400 && counter < 425)   //cammina dritto
            translation=mult(translate(-0.1, 0.1, 0.0),rotate(-0.5, vec3(0, 0, 1) ));
        
        if(counter >425 && counter <=1100)  //vede l'albero e gira
            translation=translate(-0.006, 0.1, 0.0);

        if(counter>1100 && counter <=1300)  //ruota per mettersi schiena all'albero
            translation=mult(translate(-0.02,-0.02,0.0),rotate(1, vec3(0, 0, 1)));

        if(counter <= 1300){   //mentre cammina muove le gambe
            if(test_flag){
                theta[leftUpperArmId]+=step*1.25;
                theta[rightUpperArmId]-=step*1.25;
                theta[leftUpperLegId]-=step*1.25;
                theta[rightUpperLegId]+=step*1.25;
                theta[torsoId]+=0.05;
                theta[head2Id]-=0.15;
                if( theta[leftUpperArmId] >= 115) test_flag=false;  //OR teta OR teta OR teta
                //if(counter%2==0)AnimationMatrix = mult(AnimationMatrix,translation);
                if(parseInt(theta[leftUpperArmId])%2==0.0 && theta[leftUpperArmId]!=90) AnimationMatrix = mult(AnimationMatrix,translation);
            }else{
                theta[leftUpperArmId]-=step*1.25;
                theta[rightUpperArmId]+=step*1.25;
                theta[leftUpperLegId]+=step*1.25;
                theta[rightUpperLegId]-=step*1.25;
                theta[torsoId]-=0.05;
                theta[head2Id]+=0.15;
                if( theta[leftUpperArmId] <= 65.0) test_flag=true;
                //if(counter%2==0)AnimationMatrix = mult(AnimationMatrix,translation);
                if(parseInt(theta[leftUpperArmId])%2==0.0 && theta[leftUpperArmId]!=90 ) AnimationMatrix = mult(AnimationMatrix,translation);
            }
        }

        if(counter>1300 && counter <=1390){  //si alza
            theta[leftUpperArmId]+=step/2;
            theta[rightUpperArmId]+=step/2;
            theta[rightUpperLegId]+=step;
            theta[leftUpperLegId]+=step*1.2;
            theta[head1Id]+=step;
            translation=mult(translate(0.0, -0.03 , 0.0),rotate(-1.0, vec3(1, 0, 0)));
            AnimationMatrix = mult(AnimationMatrix,translation);
        }

        if(counter>1390 && counter <=1415){ } //resta in attesa per dopo essersi alzato

        
        if(counter>1415 && counter <=1600){  //gratta la schiena sull'albero
            if(counter%20==0) BackFlag = !BackFlag;
            if(BackFlag){
            translation = mult(rotate(-0.1, vec3(0, 0, 1)),rotate(-0.5, vec3(0, 1, 0)));
            translation = mult(translate(0.0, -0.02 , 0.0),translation);
            theta[leftUpperLegId]-=step/2;
            theta[rightUpperLegId]+=step/3;
            theta[leftUpperArmId]+=step/2;
            theta[rightUpperArmId]-=step/3;
            }else{
            translation=mult(rotate(0.1, vec3(0, 0, 1)),rotate(0.5, vec3(0, 1, 0)));
            translation = mult(translate(0.0, 0.02 , 0.0),translation);
            theta[leftUpperLegId]+=step/2;
            theta[rightUpperLegId]-=step/3;
            theta[leftUpperArmId]-=step/2;
            theta[rightUpperArmId]+=step/3;
            }
            AnimationMatrix = mult(AnimationMatrix,translation);
        }

        if(counter == 1600 && !flag_sit){
            counter=1540;
            if(document.getElementById("sitButton").disabled == true) 
                document.getElementById("sitButton").disabled = false;
        }

        if(counter>1600 && counter <=1690){   //torna giù
            theta[leftUpperArmId]-=step/2;
            theta[rightUpperArmId]-=step/2;
            theta[rightUpperLegId]-=step;
            theta[leftUpperLegId]-=step;
            theta[head1Id]-=step;
            translation=mult(translate(0.0, 0.03 , 0.00),rotate(1.0, vec3(1, 0, 0)));
            AnimationMatrix = mult(AnimationMatrix,translation);
        }

        if(counter>1690 && counter <=1710){  //va indietro
            theta[leftUpperArmId]-=step/3;
            theta[rightUpperArmId]-=step/3;
            theta[rightUpperLegId]-=step/3;
            theta[leftUpperLegId]-=step/3;
            AnimationMatrix = mult(AnimationMatrix,translate(0.0, -0.055 , 0.00));
        }       

        if(counter>1710 && counter <=1810){  //siediti
            theta[leftUpperArmId]+=step*0.9;
            theta[rightUpperArmId]+=step*0.9;
            theta[rightUpperLegId]+=step/8;
            theta[leftUpperLegId]+=step/8;
            theta[head1Id]+=step;
            translation=mult(translate(0.0, -0.045 , -0.045),rotate(-0.9, vec3(1, 0, 0)));
            AnimationMatrix = mult(AnimationMatrix,translation);
        }

            counter+=1;
    }

}

var render = function() {
    gl.enable(gl.DEPTH_TEST);

    instanceMatrix = mat4();
    gl.uniformMatrix4fv(gl.getUniformLocation(program,"uInstanceMatrix"), false, flatten(instanceMatrix));


    var eye = vec3(
        radius*Math.sin(theta2)*Math.cos(phi), 
        radius*Math.sin(theta2)*Math.sin(phi),
        radius*Math.cos(theta2)
    );
    
    modelViewMatrix = lookAt(eye, at , up);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    //gl.clear( gl.COLOR_BUFFER_BIT );

    traverse(torsoId);
    
    SmallTree();
    
    plane();
    
    BigTree();

    bush();

    walk();

    for(i=0; i<numNodes; i++){initNodes(i);}   

    requestAnimationFrame(render);
}
