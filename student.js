import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';
import { CSS3DObject, CSS3DSprite, CSS3DRenderer } from './CSS3DRenderer.js';
// import { GUI } from './build/dat.gui.module.js'
import { Sky } from './Sky.js'
// import { RectAreaLightUniformsLib } from './RectAreaLightUniformsLib.js'
// import { RectAreaLightHelper } from './RectAreaLightHelper.js';

const speed = 50;
let
    controls,
    scene = new THREE.Scene(),
    // scene2 = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100),
    renderer = new THREE.WebGLRenderer({ antialias: true }),
    css3DRenderer = new CSS3DRenderer({ antialias: true }),
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
let wallGroup;
let isDrawing = false;
let cards = [];
let video = document.getElementById("video");
let video2 = document.getElementById("video2");
video2.currentTime = 25;
video.play();
video2.play();
let videoTexture = new THREE.VideoTexture(video);
let videoTexture2 = new THREE.VideoTexture(video2);
let cube1, cube2;
let enablePaint = false;
let colorPicker = document.getElementById('color-picker');
let paintColor = "#ff0099"



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
    audio = document.getElementById('audio'),
    paintUI = document.getElementById('paintUI'),
    startPaint = document.getElementById('start-paint'),
    exitPaint = document.getElementById('exit-paint'),
    source = document.getElementById('audioSource'),
    song = document.querySelectorAll(".song"),
    progressEndValue = 72;
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );


init();
initSky();
create();
animate();

function init() {
    scene.fog = new THREE.FogExp2(0x666666, 0.04);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;

    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.domElement.style.top = '0px';
    css3DRenderer.domElement.style.left = '0px';
    css3DRenderer.domElement.style.position = 'absolute';
    document.querySelector('#css').appendChild(css3DRenderer.domElement);


    let userBoxGeo = new THREE.BoxGeometry(2, 1, 2);
    let userBoxMat = new THREE.MeshBasicMaterial({ color: 0xeeee99, wireframe: true });
    let user = new THREE.Mesh(userBoxGeo, userBoxMat);
    user.visible = false;
    user.BBox = new THREE.Box3();

    camera.add(user);
    camera.position.set(-18, 2, 0);
    camera.rotation.y = -Math.PI / 2;

    controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(camera);
    colorPicker.addEventListener("input", function(){
        paintColor = colorPicker.value;  
    });

    startPaint.addEventListener('click', function(){
        enablePaint = true;
    });
    exitPaint.addEventListener('click', function(){
        enablePaint = false;
    });

    song.forEach(s => {
        s.addEventListener('click', function () {
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

    window.addEventListener('mousedown', function () {
        isDrawing = true;
    });
    window.addEventListener('mouseup', function () {
        isDrawing = false;
    });


    interact.style.display = 'none';

    instructions.addEventListener('click', function () {

        controls.lock();
        // instructions.style.display = 'none';
        // blocker.style.display = 'none';
    });

    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';
        interact.style.display = 'block';
        modal.forEach(m => {
            m.classList.remove('show');
        })
        music.classList.remove('show');
        paintUI.classList.remove('show');
    });

    controls.addEventListener('unlock', function () {
        if (!music.classList.contains("show") && !paintUI.classList.contains("show")) {

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
                // canJump = false;
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

function initSky() {
    let sky, sun;
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    sun = new THREE.Vector3();

    /// GUI

    const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.3,
        elevation: 7.6,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms['turbidity'].value = effectController.turbidity;
        uniforms['rayleigh'].value = effectController.rayleigh;
        uniforms['mieCoefficient'].value = effectController.mieCoefficient;
        uniforms['mieDirectionalG'].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
        const theta = THREE.MathUtils.degToRad(effectController.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        uniforms['sunPosition'].value.copy(sun);

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render(scene, camera);

    }

    // const gui = new GUI();

    // gui.add(effectController, 'turbidity', 0.0, 20.0, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'elevation', 0, 90, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'azimuth', - 180, 180, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged);

    // guiChanged();
}

function create() {
    let worldLight = new THREE.AmbientLight(0xffffff);
    scene.add(worldLight);
    // let directionalLight = new THREE.DirectionalLight(0xffffff)
    // directionalLight.position.set(0, 30, 0)
    // directionalLight.target.position.set(0,0,0);
    // directionalLight.castShadow = true
    // scene.add(directionalLight)
    // scene.add(directionalLight.target);
    // let directionalLightHelper = new THREE.DirectionalLightHelper(
    //     directionalLight
    // )
    // scene.add(directionalLightHelper)

    // RectAreaLightUniformsLib.init();

    // const rectLight1 = new THREE.RectAreaLight( 0xffffff, 5, 40, 10 );
    // rectLight1.position.set( 0, 6, 0 );
    // rectLight1.lookAt(0,0,0);
    // scene.add( rectLight1 );
    // scene.add( new RectAreaLightHelper( rectLight1 ) );

    //set the floor up
    let floorText = new THREE.TextureLoader().load("./img/marble.jpg");
    // floorText.wrapS = THREE.RepeatWrapping;
    // floorText.wrapT = THREE.RepeatWrapping;
    // floorText.repeat.set(2, 3);

    //Phong is for shiny surfaces
    let floorMaterial = new THREE.MeshBasicMaterial({ map: floorText });
    let floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 60), floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = Math.PI / 2;
    floor.rotation.y = Math.PI;
    floor.position.z = 20;
    scene.add(floor);

    let floorDark = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), new THREE.MeshPhongMaterial({ color: 0x222222 }));
    floorDark.rotation.x = Math.PI / 2;
    floorDark.rotation.y = Math.PI;
    floorDark.position.set(10, 0.001, 12.5);
    scene.add(floorDark);
    //Create the walls////
    wallGroup = new THREE.Group();
    scene.add(wallGroup);

    let wall1 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    let wall2 = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 0.001), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    let wall3 = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 0.001), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    let wall4 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    let dark1 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark2 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark3 = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark4 = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));

    wallGroup.add(wall1, wall2, wall3, wall4, dark1, dark2, dark3, dark4);
    wallGroup.position.y = 3;

    wall1.position.z = -5;
    wall1.myNormal = new THREE.Vector3(0, 0, 0.01);
    wall2.position.x = -20;
    wall2.rotation.y = Math.PI / 2;
    wall2.myNormal = new THREE.Vector3(0.01, 0, 0);
    wall3.position.x = 20;
    wall3.rotation.y = -Math.PI / 2;
    wall3.myNormal = new THREE.Vector3(-0.01, 0, 0);
    wall4.position.z = 5;
    wall4.rotation.y = Math.PI;
    wall4.myNormal = new THREE.Vector3(0, 0, -0.01);

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

    let material = new THREE.MeshPhysicalMaterial({})
    material.transparent = true;
    material.opacity = 0.5;
    // material.reflectivity = 0
    // material.transmission = 1.0
    // material.roughness = 0.2
    // material.metalness = 0
    // material.clearcoat = 0.3
    // material.clearcoatRoughness = 0.25
    // material.color = new THREE.Color(0xffffff)
    // material.ior = 1.2
    material.thickness = .5
    const options = {
        side: {
            FrontSide: THREE.FrontSide,
            BackSide: THREE.BackSide,
            DoubleSide: THREE.DoubleSide,
        },
    }
    // const gui = new GUI()
    // const materialFolder = gui.addFolder('THREE.Material')
    // materialFolder.add(material, 'transparent').onChange(() => material.needsUpdate = true)
    // materialFolder.add(material, 'opacity', 0, 1, 0.01)
    // materialFolder.add(material, 'depthTest')
    // materialFolder.add(material, 'depthWrite')
    // materialFolder
    //     .add(material, 'alphaTest', 0, 1, 0.01)
    //     .onChange(() => updateMaterial())
    // materialFolder.add(material, 'visible')
    // materialFolder
    //     .add(material, 'side', options.side)
    //     .onChange(() => updateMaterial())
    // // materialFolder.open()

    // const data = {
    //     color: material.color.getHex(),
    //     emissive: material.emissive.getHex(),
    // }

    // const meshPhysicalMaterialFolder = gui.addFolder('THREE.MeshPhysicalMaterial')

    // meshPhysicalMaterialFolder.addColor(data, 'color').onChange(() => {
    //     material.color.setHex(Number(data.color.toString().replace('#', '0x')))
    // })
    // meshPhysicalMaterialFolder.addColor(data, 'emissive').onChange(() => {
    //     material.emissive.setHex(
    //         Number(data.emissive.toString().replace('#', '0x'))
    //     )
    // })

    // meshPhysicalMaterialFolder.add(material, 'wireframe')
    // meshPhysicalMaterialFolder
    //     .add(material, 'flatShading')
    //     .onChange(() => updateMaterial())
    // meshPhysicalMaterialFolder.add(material, 'reflectivity', 0, 1)
    // meshPhysicalMaterialFolder.add(material, 'roughness', 0, 1)
    // meshPhysicalMaterialFolder.add(material, 'metalness', 0, 1)
    // meshPhysicalMaterialFolder.add(material, 'clearcoat', 0, 1, 0.01)
    // meshPhysicalMaterialFolder.add(material, 'clearcoatRoughness', 0, 1, 0.01)
    // meshPhysicalMaterialFolder.add(material, 'transmission', 0, 1, 0.01)
    // meshPhysicalMaterialFolder.add(material, 'ior', 1.0, 2.333)
    // meshPhysicalMaterialFolder.add(material, 'thickness', 0, 10.0)
    //Ceiling//
    //ceilMaterial = new THREE.MeshLambertMaterial({color: 0x8DB8A7});
    let beamMaterial = new THREE.MeshPhysicalMaterial({ color: 0x999999, metalness: 0.5, roughness: 0.5 })
    // let beamMaterial = new THREE.MeshPhongMaterial({color:0x555555, shininess:80})
    for (let i = 0; i < 9; i++) {
        let beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 0.2), beamMaterial);
        beam.position.set(-20 + i * 5, 5.98, 0);
        beam.rotation.x = Math.PI / 2;
        scene.add(beam);
    }
    let beam1 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 0.2), beamMaterial);
    beam1.position.set(0, 5.98, 5);
    beam1.rotation.x = Math.PI / 2;
    scene.add(beam1);
    let beam2 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 0.2), beamMaterial);
    beam2.position.set(0, 5.98, -5);
    beam2.rotation.x = Math.PI / 2;
    scene.add(beam2);

    let ceil = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 0.05), material);
    ceil.position.set(0, 6, 0);
    ceil.rotation.x = Math.PI / 2;
    let ceil1 = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 0.05), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    ceil1.position.set(0, 6, -4);
    ceil1.rotation.x = Math.PI / 2;
    let ceil2 = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 0.05), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    ceil2.position.set(0, 6, 4);
    ceil2.rotation.x = Math.PI / 2;
    let ceil3 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 0.05), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    ceil3.position.set(19, 6, 0);
    ceil3.rotation.x = Math.PI / 2;
    let ceil4 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 0.05), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    ceil4.position.set(-19, 6, 0);
    ceil4.rotation.x = Math.PI / 2;


    let ceilMaterialDark = new THREE.MeshLambertMaterial({ color: 0x222222 });
    let ceilDark = new THREE.Mesh(new THREE.PlaneGeometry(20, 15), ceilMaterialDark);
    ceilDark.position.set(10, 6, 12.5);
    ceilDark.rotation.x = Math.PI / 2;

    scene.add(ceilDark);
    scene.add(ceil);
    // scene.add(ceil1);
    // scene.add(ceil2);
    // scene.add(ceil3);
    // scene.add(ceil4);


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
    stand2.castShadow = true;
    scene.add(stand1);
    scene.add(stand2);
    var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    cube1 = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x333333 }));
    cube1.position.set(-10, 2.2, 0);
    cube1.name = "music";
    scene.add(cube1);
    paintings.push(cube1);
    cube2 = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x333333 }));
    cube2.position.set(10, 2.2, 0);
    cube2.name = "paint";
    scene.add(cube2);
    paintings.push(cube2);

    const num_of_paintings = 6;
    const seperation = 8, artHeight = 2.5, cardHeight = 1.8, card_offset = 0.9, offset__front = -8, offset_back = -30;

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
                    let card = document.createElement('div');
                    card.innerHTML = "<b>Artist<br></b><nobr><b><i>Artwork, &nbsp</i></b>2022</nobr><p>Material</p>";
                    card.className = 'card';
                    card.id = 'card-' + index.toString();
                    let card_obj = new CSS3DObject(card);
                    card_obj.scale.set(0.005, 0.005, 1);
                    //-1 because index is 0 - n-1 but num of paintings is n 
                    if (index <= Math.floor(num_of_paintings / 2) - 1) //bottom half
                    {
                        //plane.rotation.z = Math.PI/2;
                        plane.position.set(seperation * index + offset__front, artHeight, -4.96); //y and z kept constant

                        card_obj.position.set(seperation * index + offset__front + ratiow / 2 + card_offset, cardHeight, -5);

                        var mesh = drawFrame({
                            x: seperation * index + offset__front - (ratiow / 2) - 0.3,
                            y: artHeight + (ratioh / 2) + 0.3,
                            z: -5
                        }, {
                            x: seperation * index + offset__front + (ratiow / 2) + 0.3,
                            y: artHeight - (ratioh / 2) - 0.3,
                            z: -5
                        }, 0.02);
                        art.add(mesh);

                    }
                    else {
                        // plane.rotation.z = Math.PI/2;
                        plane.position.set(-(seperation * index + offset_back), artHeight, 4.96);
                        //plane.position.set(65*i - 75*Math.floor(num_of_paintings/2) - 15*Math.floor(num_of_paintings/2), 48, 90);
                        plane.rotation.y = Math.PI;

                        card_obj.position.set(-(seperation * index + offset_back + ratiow / 2 + card_offset), cardHeight, 5);
                        card_obj.rotation.y = Math.PI;
                        var mesh = drawFrame({
                            x: seperation * index + offset_back - (ratiow / 2) - 0.3,
                            y: artHeight + (ratioh / 2) + 0.3,
                            z: -5
                        }, {
                            x: seperation * index + offset_back + (ratiow / 2) + 0.3,
                            y: artHeight - (ratioh / 2) - 0.3,
                            z: -5
                        }, 0.02);
                        // mesh.rotation.y = Math.PI;
                        mesh.lookAt(0, 0, -1);
                        art.add(mesh);
                    }
                    art.add(card_obj);
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
        // if (controls.getObject().position.y > 5) {

        //     velocity.y = 0;
        //     controls.getObject().position.y = 5;
        // }

        // if (controls.getObject().position.z < -4) {
        //     controls.getObject().position.z = -4
        // }
        // if (controls.getObject().position.z > 4 && controls.getObject().position.z < 5) {
        //     controls.getObject().position.z = 4
        // }
        // if (controls.getObject().position.z > 5 && controls.getObject().position.z < 5.5) {
        //     controls.getObject().position.z = 5.5
        // }
        // if (controls.getObject().position.x < -18) {
        //     controls.getObject().position.x = -18
        // }
        // if (controls.getObject().position.x > 18) {
        //     controls.getObject().position.x = 18
        // }

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
                // console.log($('#card-'+intersects[0].object.parent.name.substring(4)).innerHTML);

                // interact.style.display = 'block';

                if (interacting) {
                    let target = document.querySelector('#card-' + intersects[0].object.parent.name.substring(4));
                    progressValue++;
                    // console.log(progressValue);
                    // valueContainer.textContent = `${progressValue}%`;
                    target.style.borderImageSource = `conic-gradient(
                        #ee82ee,
                        #ffff00,
                        #ee82ee
                        ${progressValue * 5}deg,
                        #555555 ${progressValue * 5}deg
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

                // interact.style.display = 'block';

                if (interacting) {
                    progressValue++;
                    // console.log(progressValue);
                    // valueContainer.textContent = `${progressValue}%`;
                    progressBar.style.borderImageSource = `conic-gradient(
                        #ee82ee,
                        #ffff00,
                        #ee82ee
                        ${progressValue * 5}deg,
                        #555555 ${progressValue * 5}deg
                    )`;
                    if (progressValue == progressEndValue) {
                        progressValue = 0;
                        progressBar.style.borderImageSource = `conic-gradient(
                            #444444 ${progressValue * 1.2}deg,
                            #555555 ${progressValue * 1.2}deg
                        )`;
                        // console.log(document.getElementById(intersects[0].object.parent.name));
                        if (intersects[0].object.name == "portal")
                            controls.getObject().position.set(14, 0, 5.5);
                        else if (intersects[0].object.name == "portal2")
                            controls.getObject().position.set(14, 0, 4.5);
                        else if (intersects[0].object.name == "music") {
                            music.classList.add('show');
                            controls.unlock();
                        }
                        else if (intersects[0].object.name == "paint") {
                            paintUI.classList.add('show');
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
                    #555555 ${progressValue * 1.2}deg
                )`;
                valueContainer.textContent = "E";
            }

        }


    }
    cube1.rotation.x += 0.01;
    cube1.rotation.y += 0.01;
    cube2.rotation.x += 0.01;
    cube2.rotation.y += 0.01;
    prevTime = time;
    videoTexture.needsUpdate = true;

    renderer.render(scene, camera);
    css3DRenderer.render(scene, camera);
    if (isDrawing && enablePaint) {
        paint();
    }
}

function paint() {
    let drawIntersect = raycaster.intersectObjects(wallGroup.children);
    if (drawIntersect.length != 0) {
        let geometry = new THREE.CircleGeometry(0.1, 16);
        let material = new THREE.MeshBasicMaterial({ color: paintColor });
        let circle = new THREE.Mesh(geometry, material);
        circle.position.copy(drawIntersect[0].point).add(drawIntersect[0].object.myNormal);
        // circle.position.z+= circle.position.z>0?-0.01:0.01;
        let target = new THREE.Vector3();
        target.copy(circle.position).add(drawIntersect[0].object.myNormal);
        circle.lookAt(target);
        scene.add(circle);
        // console.log(drawIntersect[0].object.myNormal);
    }
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