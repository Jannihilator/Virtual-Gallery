// import * as THREE from 'three';
import { PointerLockControls } from './PointerLockControls.js';


const speed = 50;
let
    controls,
    scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    renderer = new THREE.WebGLRenderer({ antialias: true }),
    raycaster = new THREE.Raycaster(),

    //only when pointer is locked will translation controls be allowed: controls.enabled
    velocity = new THREE.Vector3(),
    canJump = true, // allow jump
    moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false,
    interacting = false,

    prevTime = performance.now(),
    progressValue = 0,
    mouse = new THREE.Vector3();
let paintings = [];
let video = document.getElementById("video");
let video2 = document.getElementById("video2");
video2.currentTime = 25;
video.play();
video2.play();
let videoTexture = new THREE.VideoTexture(video);
let videoTexture2 = new THREE.VideoTexture(video2);
let cube;

let audio = document.getElementById('audio');

let source = document.getElementById('audioSource');
let song = document.querySelectorAll(".song");

const
    direction = new THREE.Vector3(),
    blocker = document.getElementById('blocker'),
    modal = document.querySelectorAll(".modal"),
    instructions = document.getElementById('instructions'),
    music = document.getElementById('music'),
    interact = document.getElementById('interact'),
    progressBar = document.querySelector(".circular-progress"),
    valueContainer = document.querySelector(".value-container"),
    close = document.querySelectorAll(".close"),
    progressEndValue = 72;
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

init();
create();
animate();

function init() {
    scene.fog = new THREE.FogExp2(0x666666, 0.04);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);

    let userBoxGeo = new THREE.BoxGeometry(2, 1, 2);
    let userBoxMat = new THREE.MeshBasicMaterial({ color: 0xeeee99, wireframe: true });
    let user = new THREE.Mesh(userBoxGeo, userBoxMat);
    user.visible = false;
    user.BBox = new THREE.Box3();

    camera.add(user);
    camera.position.set(-18, 2, 0);
    camera.rotation.y = -Math.PI/2;

    controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(camera);

    song.forEach(s =>{
        s.addEventListener('click', function(){
            source.src = s.getAttribute('data-value');
            console.log(source.src);
            audio.load();
            audio.play();
        })
        
    });

    close.forEach(c => {
        c.addEventListener('click', function () {
            modal.forEach(m => {
                m.classList.remove('show');
            })
            controls.lock();
        })
    });

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });


    interact.style.display = 'none';

    instructions.addEventListener('click', function () {

        controls.lock();

    });

    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';
        interact.style.display = 'block';
        modal.forEach(m => {
            m.classList.remove('show');
        })
        music.classList.remove('show');
    });

    controls.addEventListener('unlock', function () {
        if(!music.classList.contains("show")){

            instructions.style.display = '';
        }
        blocker.style.display = 'block';

        interact.style.display = 'none';
    });

    scene.add(controls.getObject());


    const onKeyDown = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;

            case 'Space':
                if (canJump === true) velocity.y += 10;
                canJump = false;
                break;
            case 'KeyE':
                interacting = true;
                break;

        }

    };

    const onKeyUp = function (event) {

        switch (event.code) {

            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;

            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;

            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;

            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;

            case 'KeyE':
                interacting = false;
                break;

        }

    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function create() {
    let worldLight = new THREE.AmbientLight(0xffffff);
    scene.add(worldLight);

    //set the floor up
    let floorText = new THREE.TextureLoader().load("./img/floor.jpg");
    floorText.wrapS = THREE.RepeatWrapping;
    floorText.wrapT = THREE.RepeatWrapping;
    floorText.repeat.set(24, 24);

    //Phong is for shiny surfaces
    let floorMaterial = new THREE.MeshPhongMaterial({ map: floorText });
    let floor = new THREE.Mesh(new THREE.PlaneGeometry(45, 45), floorMaterial);

    floor.rotation.x = Math.PI / 2;
    floor.rotation.y = Math.PI;
    scene.add(floor);

    let floorDark = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), new THREE.MeshPhongMaterial({ color: 0x222222 }));
    floorDark.rotation.x = Math.PI / 2;
    floorDark.rotation.y = Math.PI;
    floorDark.position.set(10, 0.001, 12.5);
    scene.add(floorDark);
    //Create the walls////
    let wallGroup = new THREE.Group();
    scene.add(wallGroup);

    let wall1 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    let wall2 = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    let wall3 = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    let wall4 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    let dark1 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark2 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark3 = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark4 = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));

    wallGroup.add(wall1, wall2, wall3, wall4, dark1, dark2, dark3, dark4);
    wallGroup.position.y = 3;

    wall1.position.z = -5;
    wall2.position.x = -20;
    wall2.rotation.y = Math.PI / 2;
    wall3.position.x = 20;
    wall3.rotation.y = -Math.PI / 2;
    wall4.position.z = 5;
    wall4.rotation.y = Math.PI;

    dark1.position.x = 0;
    dark1.position.z = 12.5;
    dark1.rotation.y = Math.PI / 2;
    dark2.position.x = 20;
    dark2.position.z = 12.5;
    dark2.rotation.y = -Math.PI / 2;
    dark3.position.x = 10;
    dark3.position.z = 17;
    dark4.position.z = 5.1;
    dark4.position.x = 10;

    for (var i = 0; i < wallGroup.children.length; i++) {
        wallGroup.children[i].BBox = new THREE.Box3();
        wallGroup.children[i].BBox.setFromObject(wallGroup.children[i]);
    }

    //Ceiling//
    //ceilMaterial = new THREE.MeshLambertMaterial({color: 0x8DB8A7});
    let ceilMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
    let ceil = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), ceilMaterial);
    ceil.position.y = 6;
    ceil.rotation.x = Math.PI / 2;
    let ceilMaterialDark = new THREE.MeshLambertMaterial({ color: 0x222222 });
    let ceilDark = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), ceilMaterialDark);
    ceilDark.position.set(10, 6, 12.5);
    ceilDark.rotation.x = Math.PI / 2;

    scene.add(ceilDark);
    scene.add(ceil);

    let standMaterial = [
        new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
        new THREE.MeshLambertMaterial({ color: 0xdddddd }),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee }),
        new THREE.MeshLambertMaterial({ color: 0xeeeeee })
    ];
    let stand1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), standMaterial);
    let stand2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), standMaterial);
    stand1.position.set(10, 0.8, 0);
    stand2.position.set(-10, 0.8, 0);
    scene.add(stand1);
    scene.add(stand2);
    var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    cube = new THREE.LineSegments(new THREE.EdgesGeometry( geometry ), new THREE.LineBasicMaterial({ color: 0x333333}));
    cube.position.set(-10, 2.2, 0);
    cube.name = "music";
    scene.add(cube);
    paintings.push(cube);

    const num_of_paintings = 6;
    const seperation = 8, artHeight = 2.5, offset__front = -8, offset_back = -30;

    for (var i = 0; i < num_of_paintings; i++) {
        (function (index) {
            //https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
            var artwork = new Image();
            var ratiow = 0;
            var ratioh = 0;

            var source = './img/works/art-(' + (index).toString() + ').jpg';
            artwork.src = source;

            var texture = new THREE.TextureLoader().load(artwork.src);
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            var img = new THREE.MeshBasicMaterial({ map: texture });

            artwork.onload = function () {
                if (artwork.width > 100) {


                    ratiow = artwork.width / 1700;
                    ratioh = artwork.height / 1700;

                    var art = new THREE.Group();
                    art.name = 'art-' + (index).toString();


                    // plane for artwork
                    var plane = new THREE.Mesh(new THREE.PlaneGeometry(ratiow, ratioh), img); //width, height
                    plane.overdraw = true;
                    //-1 because index is 0 - n-1 but num of paintings is n 
                    if (index <= Math.floor(num_of_paintings / 2) - 1) //bottom half
                    {
                        //plane.rotation.z = Math.PI/2;
                        plane.position.set(seperation * index + offset__front, artHeight, -4.96); //y and z kept constant

                        var mesh = drawFrame({
                            x: seperation * index + offset__front - (ratiow / 2) - 0.3,
                            y: artHeight + (ratioh / 2) + 0.3,
                            z: -5
                        }, {
                            x: seperation * index + offset__front + (ratiow / 2) + 0.3,
                            y: artHeight - (ratioh / 2) - 0.3,
                            z: -5
                        }, 0.03);
                        art.add(mesh);

                    }
                    else {
                        // plane.rotation.z = Math.PI/2;
                        plane.position.set(-(seperation * index + offset_back), artHeight, 4.96);
                        //plane.position.set(65*i - 75*Math.floor(num_of_paintings/2) - 15*Math.floor(num_of_paintings/2), 48, 90);
                        plane.rotation.y = Math.PI;

                        var mesh = drawFrame({
                            x: seperation * index + offset_back - (ratiow / 2) - 0.3,
                            y: artHeight + (ratioh / 2) + 0.3,
                            z: -5
                        }, {
                            x: seperation * index + offset_back + (ratiow / 2) + 0.3,
                            y: artHeight - (ratioh / 2) - 0.3,
                            z: -5
                        }, 0.03);
                        // mesh.rotation.y = Math.PI;
                        mesh.lookAt(0, 0, -1);
                        art.add(mesh);
                    }

                    //https://aerotwist.com/tutorials/create-your-own-environment-maps/
                    art.add(plane);






                    scene.add(art);
                    paintings.push(art);

                }
            };

            img.map.needsUpdate = true; //ADDED
        }(i))
    }


    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    // videoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var slideshowMaterial = new THREE.MeshBasicMaterial({
        map: videoTexture
    })
    let slideshowGeometry = new THREE.PlaneGeometry(9.6, 5.4);
    let slideshowScreen = new THREE.Mesh(slideshowGeometry, slideshowMaterial);
    slideshowScreen.position.set(15, 3, 16.99);
    slideshowScreen.rotation.y = Math.PI;

    videoTexture2.minFilter = THREE.LinearFilter;
    videoTexture2.magFilter = THREE.LinearFilter;
    // videoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var slideshowMaterial2 = [
        new THREE.MeshLambertMaterial({ color: 0x333333 }),
        new THREE.MeshLambertMaterial({ color: 0x333333 }),
        new THREE.MeshLambertMaterial({ color: 0x333333 }),
        new THREE.MeshLambertMaterial({ color: 0x333333 }),
        new THREE.MeshLambertMaterial({ color: 0x333333 }),
        new THREE.MeshBasicMaterial({ map: videoTexture2 }),
    ];
    let slideshowGeometry2 = new THREE.BoxGeometry(6.4, 3.6, 0.5);
    let slideshowScreen2 = new THREE.Mesh(slideshowGeometry2, slideshowMaterial2);
    slideshowScreen2.position.set(6, 1.8, 13);
    scene.add(slideshowScreen2);
    scene.add(slideshowScreen);

    var artwork = new Image();

    var source = './img/portal.png';
    artwork.src = source;

    var texture = new THREE.TextureLoader().load(artwork.src);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    var img = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(1.191 * 6, 0.67 * 6), img); //width, height
    plane.position.set(14, 2.5, 4.99);
    plane.rotation.z = Math.PI / 2;
    plane.rotation.y = Math.PI;
    plane.name = "portal";
    paintings.push(plane);
    scene.add(plane);


    var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(1.191 * 6, 0.67 * 6), img); //width, height
    plane2.position.set(14, 2.5, 5.2);
    plane2.rotation.z = Math.PI / 2;
    plane2.name = "portal2";
    paintings.push(plane2);
    scene.add(plane2);
}



function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();

    if (controls.isLocked === true) {


        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 3 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;


        controls.moveRight(- velocity.x * delta);
        controls.moveForward(- velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 2) {

            velocity.y = 0;
            controls.getObject().position.y = 2;

            canJump = true;

        }
        if (controls.getObject().position.y > 5) {

            velocity.y = 0;
            controls.getObject().position.y = 5;
        }

        if (controls.getObject().position.z < -4) {
            controls.getObject().position.z = -4
        }
        if (controls.getObject().position.z > 4 && controls.getObject().position.z < 5) {
            controls.getObject().position.z = 4
        }
        if (controls.getObject().position.z > 5 && controls.getObject().position.z < 5.5) {
            controls.getObject().position.z = 5.5
        }
        if (controls.getObject().position.x < -18) {
            controls.getObject().position.x = -18
        }
        if (controls.getObject().position.x > 18) {
            controls.getObject().position.x = 18
        }

        raycaster.setFromCamera(mouse.clone(), camera);
        //calculate objects interesting ray
        let intersects = raycaster.intersectObjects(paintings);
        interact.style.display = 'none';
        if (intersects.length !== 0) {
            // intersects[0].object.material.color.set(0xaaeeee);
            // intersects[0].object.parent.children[0].visible=false;
            // console.log(intersects[0].object.name);
            if (intersects[0].object.parent.name) {
                // console.log(intersects[0].distance);
                // console.log(intersects[0].object.parent.name);

                interact.style.display = 'block';

                if (interacting) {
                    progressValue++;
                    // console.log(progressValue);
                    // valueContainer.textContent = `${progressValue}%`;
                    progressBar.style.borderImageSource = `conic-gradient(
                        #ee82ee,
                        #ffff00,
                        #ee82ee
                        ${progressValue * 5}deg,
                        #cccccc ${progressValue * 5}deg
                    )`;
                    if (progressValue == progressEndValue) {
                        valueContainer.textContent = "done";
                        progressValue--;
                        // console.log(document.getElementById(intersects[0].object.parent.name));
                        document.getElementById(intersects[0].object.parent.name).classList.add('show');
                        // blocker.style.display = 'block';
                        controls.unlock();
                    }
                }
            }
            else if (intersects[0].object.name) {
                // console.log(intersects[0].distance);
                // console.log(intersects[0].object.parent.name);

                interact.style.display = 'block';

                if (interacting) {
                    progressValue++;
                    // console.log(progressValue);
                    // valueContainer.textContent = `${progressValue}%`;
                    progressBar.style.borderImageSource = `conic-gradient(
                        #ee82ee,
                        #ffff00,
                        #ee82ee
                        ${progressValue * 5}deg,
                        #cccccc ${progressValue * 5}deg
                    )`;
                    if (progressValue == progressEndValue) {
                        progressValue = 0;
                        progressBar.style.borderImageSource = `conic-gradient(
                            #444444 ${progressValue * 1.2}deg,
                            #cccccc ${progressValue * 1.2}deg
                        )`;
                        // console.log(document.getElementById(intersects[0].object.parent.name));
                        if (intersects[0].object.name == "portal")
                            controls.getObject().position.set(14, 0, 5.5);
                        else if (intersects[0].object.name == "portal2")
                            controls.getObject().position.set(14, 0, 4.5);
                        else if (intersects[0].object.name == "music"){
                            music.classList.add('show');
                            controls.unlock();
                        }
                    }
                }
            }
            else {
                interact.style.display = 'none'
                progressValue = 0;
                progressBar.style.borderImageSource = `conic-gradient(
                    #444444 ${progressValue * 1.2}deg,
                    #cccccc ${progressValue * 1.2}deg
                )`;
                valueContainer.textContent = "E";
            }

        }

    }
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    prevTime = time;
    videoTexture.needsUpdate = true;
    renderer.render(scene, camera);
}

function drawFrame(a, b, t) {
    var frame = new THREE.Group();

    var geometry = new THREE.BufferGeometry();
    var vertices = [];
    var indices = [];

    vertices.push(a.x - t, a.y + t, a.z + t);
    vertices.push(b.x + t, a.y + t, a.z + t);
    vertices.push(b.x + t, b.y - t, a.z + t);
    vertices.push(a.x - t, b.y - t, a.z + t);

    vertices.push(a.x + t, a.y - t, a.z + t);
    vertices.push(b.x - t, a.y - t, a.z + t);
    vertices.push(b.x - t, b.y + t, a.z + t);
    vertices.push(a.x + t, b.y + t, a.z + t);

    indices.push(0, 5, 1);
    indices.push(0, 4, 5);
    indices.push(0, 3, 7);
    indices.push(0, 7, 4);
    indices.push(3, 6, 7);
    indices.push(3, 2, 6);
    indices.push(2, 5, 6);
    indices.push(2, 1, 5);

    vertices.push(a.x - t, a.y + t, a.z - t);
    vertices.push(b.x + t, a.y + t, a.z - t);
    vertices.push(b.x + t, b.y - t, a.z - t);
    vertices.push(a.x - t, b.y - t, a.z - t);

    vertices.push(a.x + t, a.y - t, a.z - t);
    vertices.push(b.x - t, a.y - t, a.z - t);
    vertices.push(b.x - t, b.y + t, a.z - t);
    vertices.push(a.x + t, b.y + t, a.z - t);

    indices.push(0, 9, 8);
    indices.push(0, 1, 9);
    indices.push(9, 1, 2);
    indices.push(9, 2, 10);
    indices.push(2, 3, 11);
    indices.push(2, 11, 10);
    indices.push(8, 11, 3);
    indices.push(8, 3, 0);
    indices.push(4, 12, 13);
    indices.push(4, 13, 5);
    indices.push(5, 13, 14);
    indices.push(5, 14, 6);
    indices.push(14, 15, 7);
    indices.push(14, 7, 6);
    indices.push(4, 7, 15);
    indices.push(4, 15, 12);

    indices.push(8, 10, 11);
    indices.push(8, 9, 10);

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);

    var colors = new Float32Array(indices.length * 3);
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    var material = new THREE.MeshBasicMaterial({ color: 0x111111 }); // ??? Where is this from?
    var blackBorders = new THREE.Mesh(geometry, material);
    frame.add(blackBorders);


    var backingGeometry = new THREE.BufferGeometry();
    backingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    backingGeometry.setIndex([
        12, 14, 13,
        12, 15, 14
    ]);
    var backingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    var backing = new THREE.Mesh(backingGeometry, backingMaterial);
    frame.add(backing);

    return frame;
}