import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';
import { CSS3DObject, CSS3DSprite, CSS3DRenderer } from './CSS3DRenderer.js';
import { GLTFLoader } from './GLTFLoader.js';
import { GUI } from './build/dat.gui.module.js'
import { Sky } from './Sky.js'
// import { ColladaLoader } from './ColladaLoader.js';
// import { RectAreaLightUniformsLib } from './RectAreaLightUniformsLib.js'
// import { RectAreaLightHelper } from './RectAreaLightHelper.js';

let speed = 70;
let
    research=[],
    walls = [],
    detail = false,
    wing3_pedestal_position = [],
    en = true,
    translate_text = false,
    translate = [],
    prevHover,
    num_of_paintings = [6, 9, 5, 8],
    offset_back = [-50, -48, -30, -50],
    offset_front = [-13,-10,-8,-8],
    seperation = [12,8,10,10],
    ui = false,
    floor,
    navigate = false,
    collide_obstacles = false,
    nav_click = false,
    nav_target = new THREE.Vector3(),
    nav_circle_obj,
    wing_BBox = [],
    screen_BBox = [],
    user,
    travelator,
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
    mouse = new THREE.Vector3(),
    choosing = false,
    travel_dst = null,
    travel_dir,
    obstacles = [],
    obstacles_bbox = [],
    collideX = false,
    collideZ = false,
    lastX, lastZ,
    currentX, currentZ,
    collide_index = -1;
let paintings = [];
let drawables = [];
let interactables = [];
let hallwayGroup;
let isDrawing = false;
let cards = [];
let video = document.getElementById("video");
video.play();
let videoTexture = new THREE.VideoTexture(video);
let gif_mirror = document.getElementById("gif-mirror");
gif_mirror.play();
let gif_mirror_Texture = new THREE.VideoTexture(gif_mirror);
let gif_band = document.getElementById("gif-band");
gif_band.play();
let gif_band_Texture = new THREE.VideoTexture(gif_band);
let cube1, cube2;
let enablePaint = false;
let colorPicker = document.getElementById('color-picker');
let paintColor = "#ff0099"
let location = null, screen = null, prevLocation = 1, spot_helper;
let hallway_material = new THREE.MeshBasicMaterial({ color: 0xffffff });




const
    direction = new THREE.Vector3(),
    blocker = document.getElementById('blocker'),
    modal = document.querySelectorAll(".modal"),
    instructions = document.getElementById('instructions'),
    music = document.getElementById('music'),
    // interact = document.getElementById('interact'),
    // progressBar = document.querySelector(".circular-progress"),
    valueContainer = document.querySelector(".value-container"),
    close = document.querySelectorAll(".close"),
    audio = document.getElementById('audio'),
    paintUI = document.getElementById('paintUI'),
    travelatorUI = document.getElementById('travelatorUI'),
    startPaint = document.getElementById('start-paint'),
    exitPaint = document.getElementById('exit-paint'),
    source = document.getElementById('audioSource'),
    spinner = document.getElementById('spinner'),
    song = document.querySelectorAll(".song"),
    wingButton = document.querySelectorAll(".wing-button"),
    progressEndValue = 72;

//For rendering after load
const manager = new THREE.LoadingManager();
manager.onLoad = function () {
    controls.pointerSpeed = 0.5;
    scene.traverse(obj => obj.frustumCulled = false);
    blocker.style.background = "rgba(0,0,0,0.5)"
    document.querySelector("#dot-flashing").style.display = "none";
    document.querySelector("#start-button").style.display = "block";
    animate();
    console.log(obstacles);
    for (var i = 0; i < 91; i++) {
        obstacles[i].geometry.computeBoundingBox();
        obstacles_bbox.push(new THREE.Box3().copy(obstacles[i].geometry.boundingBox).applyMatrix4(obstacles[i].matrixWorld));
    }
    for (var i = 91; i < obstacles.length; i++) {
        obstacles_bbox.push(new THREE.Box3().setFromObject(obstacles[i]));
    }
    scene.traverse(obj => obj.frustumCulled = true);
};

//main function
init();
initSky();
create();
const size = 100;
const divisions = 1000;

const gridHelper = new THREE.GridHelper( size, divisions );
gridHelper.position.set(0,3.5,5)
gridHelper.rotateX(Math.PI/2)
// scene.add( gridHelper );

function init() {
    scene.fog = new THREE.FogExp2(0x666666, 0.01);
    // const light = new THREE.PointLight(0xffffff, 1, 3, 1);
    // light.position.set(-10, 2, 45)
    // light.castShadow = true;
    // scene.add(light)
    // const helper = new THREE.PointLightHelper(light)
    // scene.add(helper)
    // const data = {
    //     color: light.color.getHex(),
    //     mapsEnabled: true
    // }

    // const gui = new GUI()
    // const lightFolder = gui.addFolder('THREE.Light')
    // lightFolder.addColor(data, 'color').onChange(() => {
    //     light.color.setHex(Number(data.color.toString().replace('#', '0x')))
    // })
    // lightFolder.add(light, 'intensity', 0, 1, 0.01)

    // const pointLightFolder = gui.addFolder('THREE.PointLight')
    // pointLightFolder.add(light, 'distance', 0, 100, 0.01)
    // pointLightFolder.add(light, 'decay', 0, 4, 0.1)
    // pointLightFolder.add(light.position, 'x', -50, 50, 0.01)
    // pointLightFolder.add(light.position, 'y', -50, 50, 0.01)
    // pointLightFolder.add(light.position, 'z', -50, 50, 0.01)
    // pointLightFolder.open()

    //Sun light
    const dir_light = new THREE.DirectionalLight()
    dir_light.color.setHex('0xfff5de');
    dir_light.intensity = 0.4;
    dir_light.castShadow = true
    dir_light.shadow.mapSize.width = 4096
    dir_light.shadow.mapSize.height = 4096
    dir_light.shadow.camera.near = 15
    dir_light.shadow.camera.far = 120
    dir_light.shadow.camera.left = -100
    dir_light.shadow.camera.right = 100
    dir_light.shadow.camera.top = 100
    dir_light.shadow.camera.bottom = -100
    dir_light.position.set(-29, 26, -29);
    scene.add(dir_light)
    // dir_helper = new THREE.CameraHelper(dir_light.shadow.camera)
    // dir_helper.needsUpdate= true;
    // scene.add(dir_helper)
    // const dir_data = {
    //     color: dir_light.color.getHex(),
    //     mapsEnabled: true,
    //     shadowMapSizeWidth: 2048,
    //     shadowMapSizeHeight: 2048
    // }

    // const dir_lightFolder = gui.addFolder('THREE.Light.Dir')
    // dir_lightFolder.addColor(dir_data, 'color').onChange(() => {
    //     dir_light.color.setHex(Number(dir_data.color.toString().replace('#', '0x')))
    // })
    // dir_lightFolder.add(dir_light, 'intensity', 0, 1, 0.01)

    // const directionaldir_lightFolder = gui.addFolder('THREE.DirectionalLight')
    // directionaldir_lightFolder
    //     .add(dir_light.shadow.camera, 'left', -100, -1, 0.1)
    //     .onChange(() => dir_light.shadow.camera.updateProjectionMatrix())
    // directionaldir_lightFolder
    //     .add(dir_light.shadow.camera, 'right', 1, 100, 0.1)
    //     .onChange(() => dir_light.shadow.camera.updateProjectionMatrix())
    // directionaldir_lightFolder
    //     .add(dir_light.shadow.camera, 'top', 1, 100, 0.1)
    //     .onChange(() => dir_light.shadow.camera.updateProjectionMatrix())
    // directionaldir_lightFolder
    //     .add(dir_light.shadow.camera, 'bottom', -100, -1, 0.1)
    //     .onChange(() => dir_light.shadow.camera.updateProjectionMatrix())
    // directionaldir_lightFolder
    //     .add(dir_light.shadow.camera, 'near', 0.1, 100)
    //     .onChange(() => dir_light.shadow.camera.updateProjectionMatrix())
    // directionaldir_lightFolder
    //     .add(dir_light.shadow.camera, 'far', 0.1, 100)
    //     .onChange(() => dir_light.shadow.camera.updateProjectionMatrix())
    // directionaldir_lightFolder
    //     .add(dir_data, 'shadowMapSizeWidth', [256, 512, 1024, 2048, 4096])
    //     .onChange(() => updateShadowMapSize())
    // directionaldir_lightFolder
    //     .add(dir_data, 'shadowMapSizeHeight', [256, 512, 1024, 2048, 4096])
    //     .onChange(() => updateShadowMapSize())
    // directionaldir_lightFolder.add(dir_light.position, 'x', -100, 100, 0.01)
    // directionaldir_lightFolder.add(dir_light.position, 'y', 0, 100, 0.01)
    // directionaldir_lightFolder.add(dir_light.position, 'z', -200, 50, 0.01)
    // directionaldir_lightFolder.open()

    // function updateShadowMapSize() {
    //     light.shadow.mapSize.width = data.shadowMapSizeWidth
    //     light.shadow.mapSize.height = data.shadowMapSizeHeight

    // }

    let loader = new GLTFLoader(manager);
    loader.load('./glass3.gltf', function (gltf) {
        gltf.scene.position.set(24.5, 0, -4.5);
        gltf.scene.scale.set(0.083, 0.083, 0.083);
        scene.add(gltf.scene);
        let clone = gltf.scene.clone()
        scene.add(clone);
        gltf.scene.position.set(24.5, 0, -1.5);
        gltf.scene.updateMatrixWorld(true)
        clone.updateMatrixWorld(true)
        obstacles.push(gltf.scene);
        obstacles.push(clone);
    });
    loader.load('./handrail2.glb', function (glb) {
        glb.scene.position.set(24.5, 0, -4.5);
        glb.scene.scale.set(0.083, 0.083, 0.083);
        scene.add(glb.scene);
        let clone = glb.scene.clone()
        scene.add(clone);
        glb.scene.position.set(24.5, 0, -1.5);
        glb.scene.updateMatrixWorld(true)
        clone.updateMatrixWorld(true)
        obstacles.push(glb.scene);
        obstacles.push(clone);
    });
    loader.load('./books.glb', function (glb) {
        glb.scene.position.set(47.95, 1.6, 4.4);
        glb.scene.rotation.y = Math.PI / 2
        glb.scene.scale.set(1, 1, 1);
        scene.add(glb.scene);
        glb.scene.updateMatrixWorld(true)
        obstacles.push(glb.scene);
    });

    loader.load('./monitor.gltf', function (gltf) {
        gltf.scene.position.set(17.5, 1.7, 15);
        gltf.scene.scale.set(0.002, 0.002, 0.002);
        gltf.scene.rotateY(Math.PI / 2)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        scene.add(gltf.scene);


        let clone = gltf.scene.clone()
        clone.position.set(22.5, 1.7, 15);
        scene.add(clone);


        clone = gltf.scene.clone()
        clone.position.set(22.5, 1.7, 24);
        // gltf.scene.rotateY(-Math.PI / 8);
        scene.add(clone);



        clone = gltf.scene.clone()
        clone.position.set(17.5, 1.7, 24);
        scene.add(clone);



        clone = gltf.scene.clone()
        clone.position.set(20, 1.7, 33);
        // clone.rotateY(-Math.PI / 4);
        scene.add(clone);




    });
    loader.load('./projector.glb', function (glb) {
        glb.scene.position.set(-7, 5, 54.5);
        glb.scene.scale.set(1.7, 1.7, 1.7);
        glb.scene.rotateY(-Math.PI / 2)
        // gltf.scene.castShadow=true;
        // gltf.scene.receiveShadow=true;
        scene.add(glb.scene);
        // gltf.scene.updateMatrixWorld(true)
        // obstacles.push(gltf.scene);
        let clone = glb.scene.clone()
        clone.position.set(-8, 5, 54.5);
        scene.add(clone);


        clone = glb.scene.clone()
        clone.position.set(23, 5, 54.5);
        // gltf.scene.rotateY(-Math.PI / 8);
        scene.add(clone);



        clone = glb.scene.clone()
        clone.position.set(38, 5, 54.5);
        scene.add(clone);



        clone = glb.scene.clone()
        clone.position.set(53, 5, 54.5);
        scene.add(clone);
    });
    loader.load('./gramophone.glb', function (gltf) {
        gltf.scene.position.set(2.7, 2.5, 4.4);
        gltf.scene.scale.set(0.2, 0.2, 0.2);
        gltf.scene.rotateY(Math.PI / 2);
        scene.add(gltf.scene);

    });
    loader.load('./notebook.glb', function (gltf) {
        gltf.scene.position.set(-12.4, 1.55, 4.38);
        gltf.scene.scale.set(0.002, 0.002, 0.002);
        gltf.scene.rotateY(Math.PI);
        scene.add(gltf.scene);

    });
    loader.load('./pen.glb', function (gltf) {
        gltf.scene.position.set(-12.5, 0.4, 3.7);
        gltf.scene.scale.set(1.5, 1.5, 1.5);
        // gltf.scene.rotateX(-Math.PI/6);
        gltf.scene.rotateY(-Math.PI / 2);
        scene.add(gltf.scene);

    });
    loader.load('./painting_palette.glb', function (gltf) {
        gltf.scene.position.set(17.7, 1.62, 4.4);
        gltf.scene.scale.set(2.3, 1, 2.3);
        // gltf.scene.rotateX(-Math.PI/6);
        gltf.scene.rotateY(7 * Math.PI / 6);
        scene.add(gltf.scene);

    });
    loader.load('./paint_brush.glb', function (gltf) {
        gltf.scene.position.set(17.4, 1.63, 4.2);
        gltf.scene.scale.set(1.5, 1.5, 1.5);
        gltf.scene.rotateY(-Math.PI / 12);
        gltf.scene.rotateX(7 * Math.PI / 12);
        scene.add(gltf.scene);

    });
    loader.load('./bench.glb', function (gltf) {
        gltf.scene.position.set(-13, 0, 54.5);
        gltf.scene.scale.set(0.02, 0.02, 0.02);
        gltf.scene.rotateY(-Math.PI / 2);
        // gltf.scene.rotateX(7*Math.PI/12);
        scene.add(gltf.scene);
        obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    loader.load('./potted_plant.glb', function (gltf) {
        gltf.scene.position.set(-19, 0, 4);
        gltf.scene.scale.set(0.25, 0.25, 0.25);
        // gltf.scene.rotateY(-Math.PI / 2);
        // gltf.scene.rotateX(7*Math.PI/12);
        scene.add(gltf.scene);
        // obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    loader.load('./screen_plant2.glb', function (gltf) {
        gltf.scene.position.set(-13, 0, 52);
        gltf.scene.scale.set(0.1, 0.1, 0.1);
        // gltf.scene.rotateY(-Math.PI / 2);
        // gltf.scene.rotateX(7*Math.PI/12);
        scene.add(gltf.scene);
        // obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    loader.load('./variety_of_books.glb', function (gltf) {
        gltf.scene.position.set(32.6, 1.6, 4.65);
        gltf.scene.scale.set(0.15, 0.2, 0.15);
        gltf.scene.rotateY(Math.PI / 2);
        // gltf.scene.rotateX(7*Math.PI/12);
        scene.add(gltf.scene);
        // obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    loader.load('./book_opened.glb', function (gltf) {
        gltf.scene.position.set(32.63, 1.7, 4.18);
        gltf.scene.scale.set(0.1, 0.15, 0.098);
        gltf.scene.rotateY(-Math.PI / 2);
        gltf.scene.rotateX(-Math.PI/2);
        scene.add(gltf.scene);
        // obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    // loader.load('./book.glb', function (gltf) {
    //     gltf.scene.position.set(47.63, 1.7, 4.18);
    //     gltf.scene.scale.set(0.1, 0.1, 0.1);
    //     // gltf.scene.rotateY(-Math.PI / 2);
    //     // gltf.scene.rotateX(-Math.PI/2);
    //     scene.add(gltf.scene);
    //     // obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    // });
    loader.load('./wet_floor_sign.glb', function (gltf) {
        gltf.scene.position.set(50, 0.8, 46.5);
        gltf.scene.scale.set(0.02, 0.02, 0.02);
        gltf.scene.rotateY(5*Math.PI / 8);
        gltf.scene.receiveShadow=true;
        // gltf.scene.rotateX(7*Math.PI/12);
        scene.add(gltf.scene);
        // obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    loader.load('./ceiling_light.glb', function (gltf) {
        gltf.scene.scale.set(0.3, 0.3, 0.3);
        // gltf.scene.rotateY(-Math.PI / 2);
        gltf.scene.rotateX(Math.PI);
        for (let i = 0; i <= 5; i++) {
            let clone = gltf.scene.clone()
            clone.position.set(-10 + 12 * i, 6.95, 3.15);
            scene.add(clone);
            clone = gltf.scene.clone()
            clone.position.set(-10 + 12 * i, 6.95, -3.15);
            scene.add(clone);
        }
        // obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    // let loaderCol = new ColladaLoader(manager);
    // loaderCol.load('./plant/model.dae', function (dae) {
    //     dae.scene.position.set(-15,0,0);
    //     scene.add(dae.scene);
    // });
    for (let i = 0; i <= 5; i++) {
        let ceilLight = new THREE.PointLight(0xfffaee, 2.5, 3, 1.2);
        ceilLight.position.set(-10 + 12 * i, 6.75, 3.15);
        scene.add(ceilLight);
        let clone = ceilLight.clone()
        clone.position.set(-10 + 12 * i, 6.75, -3.15);
        scene.add(clone);
    }
    //Light up 2nd pedestal music player
    const spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 5;
    spotLight.distance = 2.5;
    spotLight.decay = 0.5;
    spotLight.angle = 0.5;
    spotLight.position.set(2.7, 3, 3);
    spotLight.target.position.set(2.7, 1.5, 4.4);
    scene.add(spotLight);
    scene.add(spotLight.target);
    //Light up 1st pedestal notebook
    const spotLight2 = new THREE.SpotLight(0xffffff);
    spotLight2.intensity = 1;
    spotLight2.distance = 2;
    spotLight2.decay = 1;
    spotLight2.angle = 0.4;
    spotLight2.position.set(-12.4, 3, 4.38);
    spotLight2.target.position.set(-12.4, 1.55, 4.38);
    scene.add(spotLight2);
    scene.add(spotLight2.target);
    //Light up 3rd pedestal color palette
    const spotLight3 = new THREE.SpotLight(0xffffff);
    spotLight3.intensity = 1;
    spotLight3.distance = 2;
    spotLight3.decay = 0.5;
    spotLight3.angle = 0.4;
    spotLight3.position.set(17.7, 3, 3.5);
    spotLight3.target.position.set(17.7, 1.65, 4.2);
    scene.add(spotLight3);
    scene.add(spotLight3.target);

    //Travelator
    let travelatorText = new THREE.TextureLoader(manager).load("./img/escalator-texture2.jpg");
    travelatorText.wrapS = THREE.RepeatWrapping;
    travelatorText.wrapT = THREE.RepeatWrapping;
    travelatorText.repeat.set(1, 15);
    let travelatorMaterial = new THREE.MeshLambertMaterial({ map: travelatorText });
    travelator = new THREE.Mesh(new THREE.PlaneGeometry(3, 57.5), travelatorMaterial);
    travelator.rotation.x = Math.PI / 2;
    travelator.position.set(19.75, 0.001, -2.2);
    travelator.rotation.y = Math.PI;
    travelator.rotation.z = Math.PI / 2;
    travelator.BBox = new THREE.Box3().setFromObject(travelator);
    travelator.BBox.min.y = 2;
    travelator.BBox.max.y = 2.1;
    scene.add(travelator);

    //For all css element
    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.domElement.style.top = '0px';
    css3DRenderer.domElement.style.left = '0px';
    css3DRenderer.domElement.style.position = 'absolute';
    document.body.appendChild(css3DRenderer.domElement);

    //For all Three.js objects
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    //user bounding box
    let userBoxGeo = new THREE.BoxGeometry(1, 4, 1);
    let userBoxMat = new THREE.MeshLambertMaterial({ color: 0xeeee99, wireframe: true });
    user = new THREE.Mesh(userBoxGeo, userBoxMat);
    user.visible = false;
    // userBoxHelper = new THREE.BoxHelper(user, 0xff0000);
    // userBoxHelper.visible = false;
    user.BBox = new THREE.Box3().setFromObject(user);

    camera.add(user);
    // camera.position.set(-19, 2, 0);
    camera.position.set(35, 2, 5);
    camera.rotation.y = -Math.PI / 2;

    //For fps control
    controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(camera);

    //Painting UI
    colorPicker.addEventListener("input", function () {
        paintColor = colorPicker.value;
    });

    startPaint.addEventListener('click', function () {
        enablePaint = true;
    });
    exitPaint.addEventListener('click', function () {
        enablePaint = false;
    });

    //Music UI
    song.forEach(s => {
        s.addEventListener('click', function () {
            source.src = s.getAttribute('data-value');
            console.log(source.src);
            audio.load();
            audio.play();
        })

    });

    //Travelator UI
    wingButton.forEach(e => {
        e.addEventListener('click', function () {
            travel_dst = Number(e.getAttribute('coordX'));
            travel_dir = Math.sign(travel_dst - camera.position.x);
            travelatorUI.classList.remove('show');
            controls.lock();
        })

    });

    //Close button for all UI
    close.forEach(c => {
        c.addEventListener('click', function () {
            modal.forEach(m => {
                m.classList.remove('show');
            })
            controls.lock();
        })
    });

    blocker.addEventListener('click', function () {
        modal.forEach(m => {
            m.classList.remove('show');
        })
        controls.lock();
    })

    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    //Painting detection
    window.addEventListener('mousedown', function () {
        isDrawing = true;
    });
    window.addEventListener('mouseup', function () {
        isDrawing = false;
    });

    //UI for starting pointerlock control
    document.querySelector("#start-button").addEventListener('click', function () {
        controls.lock();
    });

    window.addEventListener('click', function () {
        if (!ui) {
            nav_click = true;
            translate_text = true;
            detail = true;
        }
    });

    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';
        modal.forEach(m => {
            m.classList.remove('show');
        })
        music.classList.remove('show');
        paintUI.classList.remove('show');
        travelatorUI.classList.remove('show');
        document.querySelector('.container').classList.remove('show');
        ui = false;
    });

    controls.addEventListener('unlock', function () {
        if (!ui) {
            instructions.style.display = '';
        }
        blocker.style.display = 'block';
        ui = true;
    });

    //Keyboard control for moving and interacting
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

function initSky() {
    let sky, sun;
    sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    sun = new THREE.Vector3();

    const effectController = {
        turbidity: 0.005,
        rayleigh: 0.714,
        mieCoefficient: 0.019,
        mieDirectionalG: 0.999,
        elevation: 23,
        azimuth: -135,
        exposure: 0.5
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
    }

    // const gui = new GUI();

    // gui.add(effectController, 'turbidity', 0.0, 20.0, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'rayleigh', 0.0, 4, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'mieDirectionalG', 0.0, 1, 0.001).onChange(guiChanged);
    // gui.add(effectController, 'elevation', 0, 90, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'azimuth', - 180, 180, 0.1).onChange(guiChanged);
    // gui.add(effectController, 'exposure', 0, 1, 0.0001).onChange(guiChanged);
    guiChanged();
}

//To add a new gallery wing for new semaster
function addWing(x, wing_number) {
    let wingGroup = new THREE.Group();
    scene.add(wingGroup);
    let wall_material =
        new THREE.MeshLambertMaterial({ color: 0xffffff });
    // let dark1_Material = [
    //     new THREE.MeshBasicMaterial({ color: 0xffffff }),
    //     new THREE.MeshBasicMaterial({ color: 0xeeeeee }),
    //     new THREE.MeshBasicMaterial({ color: 0xffffff }),
    //     new THREE.MeshBasicMaterial({ color: 0xffffff }),
    //     new THREE.MeshBasicMaterial({ color: 0xffffff }),
    //     new THREE.MeshBasicMaterial({ color: 0xffffff }),
    // ];
    // let dark2_Material = [
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0x555555 }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    // ];
    // let dark3_Material = [
    //     new THREE.MeshLambertMaterial({ color: 0x555555 }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    //     new THREE.MeshLambertMaterial({ color: 0xffffff }),
    // ];
    let arch_Material = [
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xeeeeee }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];
    let wall3_2Material = [
        new THREE.MeshBasicMaterial({ color: 0xf7f7f7 }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];
    let wall3_1Material = [
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xf7f7f7 }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];
    let wall1 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), wall_material);
    let wall2_1 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6, 1), wall_material);
    let wall2_3 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6, 1), wall_material);
    let wall3_2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 7, 1), wall3_2Material);
    // let wall3_3 = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.5, 1), wall3_3Material);
    let arch = new THREE.Shape()
    arch.moveTo(-1.8, 0)
    arch.quadraticCurveTo(0, 1.8, 1.8, 0)
    arch.lineTo(1.8, 2.5)
    arch.lineTo(-1.8, 2.5)
    arch.lineTo(-1.8, 0)

    var extrudeSettings = {
        curveSegments: 20,
        depth: 1,
        bevelEnabled: false,
    }

    let arch_mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(arch, extrudeSettings), arch_Material);
    let wall3_1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 7, 1), wall3_1Material);
    let wall4 = new THREE.Mesh(new THREE.BoxGeometry(40, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    let dark_sign = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 0.05), new THREE.MeshPhysicalMaterial({ color: 0xaaaaaa, metalness: 0.5, roughness: 0.5 }));
    dark_sign.position.set(-19.5, -1, 3.3)
    dark_sign.rotateY(-Math.PI / 2)
    let room_sign = document.createElement('div');
    room_sign.innerHTML = "<b style='font-size: 48px; line-height: 0; margin-left:-2px;'>&#8593;</b><br><b>放映室<br>Screening<br>Room</b>";
    room_sign.className = 'sign';
    room_sign.classList.add('sign' + wing_number);

    let sign_obj = new CSS3DObject(room_sign);
    sign_obj.scale.set(0.015, 0.015, 0.015);
    sign_obj.rotateY(Math.PI / 2)
    sign_obj.position.set(-20, -0.3, -2.6)

    let wing_title = document.createElement('div');
    switch(wing_number){
        case 1:
            wing_title.innerHTML = "<b class='wing-title'>109</b><b class='wing-title-ch'>下，</b><b class='wing-title-ch'>藝術創作基礎</b><b class='wing-title'><br>Core Studio in Fine Arts</b>";
            break;
        case 2:
            wing_title.innerHTML = "<b class='wing-title'>110</b><b class='wing-title-ch'>上，</b><b class='wing-title-ch'>當代藝術與跨域設計</b><b class='wing-title' style='font-size:32px'><br>Contemporary Art and Cross-Disciplinary Design</b>";
            break;
        case 3:
            wing_title.innerHTML = "<b class='wing-title'>110</b><b class='wing-title-ch'>上，</b><b class='wing-title-ch'>視覺藝術概論</b><b class='wing-title'><br>Introduction to Visual</b>";
            break;
        case 4:
            wing_title.innerHTML = "<b class='wing-title'>110</b><b class='wing-title-ch'>下，</b><b class='wing-title-ch'>藝術創作基礎</b><b class='wing-title'><br>Core Studio in Fine Arts</b>";
            break;
        case 5:
            wing_title.innerHTML = "<b class='wing-title'>111</b><b class='wing-title-ch'>上，</b><b class='wing-title-ch'>當代藝術與跨域設計</b><b class='wing-title' style='font-size:32px'><br>Contemporary Art and Cross-Disciplinary Design</b>";
            break;
            // wing_title.innerHTML = "<b class='wing-title'>109</b><b class='wing-title-ch'>下，</b><b class='wing-title'>1652</b><b class='wing-title-ch'> 藝術創作基礎</b><b class='wing-title'><br>Core Studio in Fine Arts</b>";
    }

    let wing_title_obj = new CSS3DObject(wing_title);
    wing_title_obj.scale.set(0.008, 0.008, 0.008);
    wing_title_obj.rotateY(Math.PI / 2)
    switch(wing_number){
        case 1:
            wing_title_obj.position.set(21, 2.3, -4.5);
            break;
        case 2:
            wing_title_obj.position.set(21, 2.3, -5.66);
            break;
        case 3:
            wing_title_obj.position.set(21, 2.3, -4.4);
            break;
        case 4:
            wing_title_obj.position.set(21, 2.3, -4.5);
            break;
        case 5:
            wing_title_obj.position.set(21, 2.3, -5.66);
            break;
    }
    // wing_title_obj.position.set(21, 2.3, -4.5)
    
    wingGroup.add(wing_title_obj)

    let wing_text = document.createElement('div');
    switch(wing_number){
        case 1:
            wing_text.innerHTML = "<div class='wing-text-en show'><p class='wing-text'>The elements and principles of design are the building blocks used to create a work of art. Elements of Art are the visual &quot;tools&quot; that artists use to create artwork - they make up an image or an art object: line, shape/form, value, color, space, and texture. Principles of Design are how artists use the Elements of Art in an artwork - this is &quot;what we do with the Elements&quot; - how we arrange them, balance them, what is being emphasized, etc.</p>";
            break;
        case 2:
            wing_text.innerHTML = "<div class='wing-text-en show'><p class='wing-text'>Conceptual art is art for which the idea (or concept) behind the work is more important than the finished art object. Artists associated with the Conceptual Art Movement attempted to bypass the increasingly commercialized art world by stressing thought processes and methods of production as the value of the work. The art forms they used were often intentionally those that did not produce a finished object, such as a sculpture or painting. This meant their work could not be easily bought and sold and did not need to be viewed in a formal gallery. It was not just the structures of the art world that many conceptual artists questioned; there was often a strong socio-political dimension to much of the work they produced, reflecting broader dissatisfaction with society and government policies.</p>";
            break;
        case 3:
            wing_text.innerHTML = "<div class='wing-text-en show'><p class='wing-text' style='width:530px;'>Seeing is not a simple act. According to Jacques-Marie-Émile Lacan's &quot;mirror stage,&quot; infants between the ages of six and eighteen months come to recognize themselves through the reflection of the self-image, an &quot;other&quot; in the mirror. This process of self-identification is also the creation of an external self. Du Shenfeng commented on this concept, explaining that when a baby sees and interacts with their reflection in the mirror, they later understand it as an image and eventually confirm that this image is themselves. This is how they come to understand the identity and wholeness of their own body. Lacan's ideas have influenced art criticism, and his concept of the &quot;mirror stage&quot; of spiritual development was later used as a tool in theoretical works, such as film theory, and even extended to all media based on the lens, including perspective records in drawing and sketching. His theory of the &quot;gaze,&quot; in particular, has drawn the attention of artists and critics. According to Lacan, the gaze represents the division between the eye and the sight, with the sight examining what one looks at and the gaze being produced by what one looks at. The relationship between “the sight towards oneself” and “the gaze returned by the object” is symmetrical, as Lacan said: &quot;You never see me where I see you.&quot; This emphasis on the gaze highlights Lacan's belief that &quot;the subject is within the self.&quot; Dynamic image works that depict the active viewing and passive gaze of the same human body challenge the balance of female self-agency in different media.</p>";
            break;
        case 4:
            wing_text.innerHTML = "<div class='wing-text-en show'><p class='wing-text'>Art history doesn’t consist in simply listing all the art movements and placing them on a timeline. It is the study of objects of art considered within their time period. Studying the art of the past teaches us how people see themselves and their world and ignites the desire to show our world to others. Art history provides a means by which we can understand our human past and its relationship to our present and future, because making art is one of humanity's most ubiquitous activities.</p>";
            break;
        case 5:
            wing_text.innerHTML = "<div class='wing-text-en show'><p class='wing-text' style='width:470px;'>In our contemporary urban life, we experience visuality and its constantly shifting cultural phenomena daily. Visual culture studies a work that uses art history, humanities, sciences, and social sciences. It is intertwined with everything one sees in day-to-day life - advertising, landscape, buildings, photographs, movies, paintings, apparel - anything within our culture that communicates through visual means. When looking at visual culture, one must focus on production, reception, and intention, as well as economic, social, and ideological aspects. It reflects the culture of the work and analyzes how the visual aspect affected it. Visual culture focuses on questions of the visible object and the viewer - how sight, knowledge, and power are all related. Visual culture analyzes the act of seeing as 'tension between the external object and the internal thought processes.' Visual and critical studies enable students to critically unpack such visual information and meaningfully situate their journey/research within a broader epistemological horizon.</p>";
            break;
        }
    // <div class='wing-text-ui-cn'>中</div></div>
    // wing_text.className = 'wing-text-visible';
    // wing_text.classList.add('sign' + x);

    let wing_text_obj = new CSS3DObject(wing_text);
    wing_text_obj.scale.set(0.008, 0.008, 0.008);
    wing_text_obj.rotateY(Math.PI / 2)
    switch(wing_number){
        case 1:
            wing_text_obj.position.set(21, 1.1, -4.5);
            break;
        case 2:
            wing_text_obj.position.set(21, 0.42, -4.5);
            break;
        case 3:
            wing_text_obj.position.set(21, 0.12, -4.5);
            break;
        case 4:
            wing_text_obj.position.set(21, 0.93, -4.5);
            break;
        case 5:
            wing_text_obj.position.set(21, 0.5, -4.5);
            break;
    }
    wingGroup.add(wing_text_obj)

    let wing_text2 = document.createElement('div');
    switch(wing_number){
        case 1:
            wing_text2.innerHTML = "<p class='wing-text-cn'>設計的本質和原則是藝術創作的構成條件。組成藝術的元素是藝術家創造作品時所運用的視覺 「工具」 － 它們可以堆疊出一個圖像或藝術物件：線條、形狀／形式、明暗、色彩、空間和肌理；而設計原則是藝術家在作品中應用這些組成工具的手法 – 即 「我們如何運用元素」 – 如何編排與平衡，並抉擇怎樣做出重點的強調等等。</p>";
            break;
        case 2:
            wing_text2.innerHTML = "<p class='wing-text-cn'>概念藝術是指作品背後的思想（或概念）比完成的實際作品更為重要的藝術類型。概念藝術運動相關的藝術家試圖強調的作品價值在於思想過程與創作方式，以繞過日益商業化的藝術界。這些藝術家經常刻意不製作如雕塑或繪畫一般具有「結果」的作品；這一方面代表他們的作品不一定需要在正式或者實體的畫廊裡被觀看，然而另一方面也說明作品無法輕易被買賣的特色。許多概念藝術家質疑的不僅僅是藝術界的結構；他們的創作往往具有強烈的社會批判與政治色彩，能更大幅度的映射對社會和政府政策的不滿。</p>";
            break;
        case 3:
            wing_text2.innerHTML = "<p class='wing-text-cn' style='width:400px;'>觀看，從來就不只是一個單純的行為。拉康（Jacques-Marie-Émile Lacan）著名的「鏡像階段」便是指嬰兒在六到十八個月大的這段期間，透過鏡子反射出的自我形象（他者）來認識自己，進而去認同自己的過程。能夠辨認鏡中人完全相等於自己的當下，一個外在於自己的他者便同時被賦予存在。杜聲鋒對鏡像階段下了這樣的註解：嬰兒看見鏡中的自己並且與之互動，後來將它理解成影像，最後當他確認這個影像就是自己時，便掌握自己身體的同一性與整體性，也就是一個完形的概念。拉康的思想日後深刻影響了藝術評論學界；其中心靈發展之「鏡像階段」後來更被各領域理論學者多方引述運用 — 從電影理論擴展至所有以鏡頭為紀錄基礎之媒材，其中也包含素描與繪畫的透視表現方法。尤其拉康的「凝視（gaze）」 理論，特別引起藝術家與藝評的注目 — 拉康認為凝視呈現了眼睛本身與視線（sight）兩者間的劃分：視線根本上只是檢閱視野間的事物；凝視則從被觀看事物之間誕生。「觀看自己的視線」與「事物反射之凝視」間的關係是對稱的；正如拉康所言：「你從來不曾在我看見你的地方觀看我」—「凝視」的概念強調了拉康「主體在自身之中」的主張。透過同一人體主動的觀看與被動的凝視，動態影像作品無疑挑戰著女性自主權（self agency）在不同媒介間的動態平衡。</p>";
            break;
        case 4:
            wing_text2.innerHTML = "<p class='wing-text-cn'>藝術史並不只是簡單地陳列出所有藝術運動並將它們置放在時間軸上，它是對藝術作品在其時代背景下的研究。琢磨歷史洪流中的藝術提供我們如何看待自己和自己的世界的另一視角，並激發向他人展示自己所處世界樣貌的心意。通曉藝術史就能理解藝術創作是如何的無處不在，串接身為人類我們的過去、現在與未來。</p>";
            break;
        case 5:
            wing_text2.innerHTML = "<p class='wing-text-cn'>在當代城市生活中，我們每天都在經驗視覺性及其千變萬化的文化現象。視覺文化研究是一項結合藝術史、人文、科學與社會科學的工作；它與人們在日常生活中所看到的一切交織在一起 － 廣告、景觀、建築、照片、電影、繪畫、服飾 － 各種文化當中任何通過視覺手段達到溝通的方式。在審視視覺文化時，我們必須專注於生產手段、被設計的接收方式和傳達意圖，以及經濟、社會和意識形態等面向；它們反映了作品背後的文化，並分析這些文化是如何被視覺因素所影響。視覺文化關注的是可見物體和觀者的關係議題 – 視野、知識和權力如何交疊。視覺文化將觀看行為定調為 「外在物體和內部思維過程間拉鋸的張力」。視覺批判研究使學生能夠透過批判性眼光去解讀視覺信息，並更有意義地將他們的學習創作歷程與研究方向置於更廣泛的知識論視野當中。</p>";
            break;
        }
    wing_text2.className = 'wing-text-cn';
    // wing_text.classList.add('sign' + x);

    let wing_text2_obj = new CSS3DObject(wing_text2);
    wing_text2_obj.scale.set(0.008, 0.008, 0.008);
    wing_text2_obj.rotateY(Math.PI / 2)
    switch(wing_number){
        case 1:
            wing_text2_obj.position.set(21, 1.32, -4.5)
            break;
        case 2:
            wing_text2_obj.position.set(21, 1.1, -4.5)
            break;
        case 3:
            wing_text2_obj.position.set(21, 0.3, -4.5)
            break;
        case 4:
            wing_text2_obj.position.set(21, 1.32, -4.5)
            break;
        case 5:
            wing_text2_obj.position.set(21, 0.74, -4.5)
            break;
    }
    wingGroup.add(wing_text2_obj)
    wingGroup.add(sign_obj)

    // translate.push(wing_text_obj, wing_text2_obj);

    let wall2_2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2, 1), wall_material);
    wall2_2.position.set(-20.5, 2, 0);
    wall2_2.rotation.y = -Math.PI / 2;
    wall2_2.receiveShadow = true;
    wingGroup.add(wall2_2);
    obstacles.push(wall2_2);
    walls.push(wall2_2);

    wingGroup.add(sign_obj)

    wall1.position.z = -5;
    wall1.myNormal = new THREE.Vector3(0, 0, 0.01);
    wall1.castShadow = true;
    wall2_1.position.set(-20.5, 0, 3.3);
    wall2_1.rotation.y = -Math.PI / 2;
    wall2_1.receiveShadow = true;

    wall2_3.receiveShadow = true;

    wall2_3.position.set(-20.5, 0, -3.3);
    wall2_3.rotation.y = -Math.PI / 2;
    wall3_1.position.set(20.5, 0.5, 3.4);
    wall3_1.rotation.y = -Math.PI / 2;
    wall3_1.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall3_2.position.set(20.5, 0.5, -3.4);
    wall3_2.rotation.y = -Math.PI / 2;
    wall3_2.myNormal = new THREE.Vector3(0, 0, -0.01);
    translate.push(wall3_2);
    arch_mesh.position.set(21, 1.5, 0);
    arch_mesh.rotation.y = -Math.PI / 2;
    arch_mesh.myNormal = new THREE.Vector3(0, 0, -0.01);
    drawables.push(wall3_1, wall3_2, arch_mesh);
    // wall3_3.position.set(20.5,2.75,0);
    // wall3_3.rotation.y = -Math.PI / 2;
    // wall3_3.myNormal = new THREE.Vector3(-0.01, 0, 0);
    wall4.position.z = 5;
    wall4.rotation.y = Math.PI;
    wall4.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall4.receiveShadow = true;

    let dark1 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x000000 }));
    let dark2 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark3 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x222222 }));
    let dark4_1 = new THREE.Mesh(new THREE.BoxGeometry(8.4, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark4_2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark4_3 = new THREE.Mesh(new THREE.BoxGeometry(3.4, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    // let dark4 = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    dark1.position.set(-28.5, 0, -10);
    dark2.position.set(-28.5, 0, 5);
    dark3.position.set(-36, 0, -2.5);
    dark3.rotation.y = Math.PI / 2
    dark4_1.position.set(-21, 0, -5.8);
    dark4_1.rotation.y = Math.PI / 2
    dark4_2.position.set(-21, 2, 0);
    dark4_2.rotation.y = Math.PI / 2
    dark4_3.position.set(-21, 0, 3.3);
    dark4_3.rotation.y = Math.PI / 2
    let ceilMaterialDark = new THREE.MeshLambertMaterial({ color: 0x222222 });
    let ceilDark = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), ceilMaterialDark);
    ceilDark.position.set(-28.5, 3, -2.5);
    ceilDark.rotation.x = Math.PI / 2;

    let floorText = new THREE.TextureLoader(manager).load("./img/carpet2.jpg");
    floorText.wrapS = THREE.RepeatWrapping;
    floorText.wrapT = THREE.RepeatWrapping;
    floorText.repeat.set(6, 6);

    let floorMaterial = new THREE.MeshLambertMaterial({ map: floorText });
    let floorDark = new THREE.Mesh(new THREE.PlaneGeometry(16, 15), floorMaterial);
    floorDark.rotation.x = -Math.PI / 2;
    floorDark.position.set(-28, -2.999, -2.5);

    // const num_of_paintings = 6;
    const artHeight = 2.5 - 3, cardHeight = 1.8 - 3, card_offset = 0.7, offset__front = -8;
    if (wing_number <= 4) {
        for (var i = 0; i < num_of_paintings[wing_number - 1]; i++) {
            (function (index) {
                //https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
                var artwork = new Image();
                var ratiow = 0;
                var ratioh = 0;
                if (wing_number == 4) {
                    var source = './img/wing' + wing_number.toString() + '/art-' + (index).toString() + '.png';
                }
                else {

                    var source = './img/wing' + wing_number.toString() + '/art-' + (index).toString() + '.jpg';
                }
                artwork.src = source;

                var texture = new THREE.TextureLoader(manager).load(artwork.src);
                texture.generateMipmaps = false;
                texture.minFilter = THREE.LinearFilter;
                var img = new THREE.MeshLambertMaterial({ map: texture });

                artwork.onload = function () {
                    if (artwork.width > 100) {

                        // console.log(artwork.width)
                        ratiow = artwork.width / 200;
                        ratioh = artwork.height / 200;

                        var art = new THREE.Group();
                        art.name = 'art-' + wing_number.toString() + '-' + (index).toString();


                        // plane for artwork
                        var plane = new THREE.Mesh(new THREE.PlaneGeometry(ratiow, ratioh), img); //width, height
                        plane.overdraw = true;

                        let card = document.createElement('div');
                        switch (wing_number) {
                            case 1:
                                switch (index) {
                                    case 0:
                                        card.innerHTML = "<p class='artist'>林佳翰&nbsp;<nobr>Jia-Han John Lin</nobr></p><b><i class='title'>光與幾何,</i></b><p class='year'>2020</p><p class='content'><br>石膏繃帶、雕塑、攝影、數位影像檔</p>";
                                        break;
                                    case 1:
                                        card.innerHTML = "<p class='artist'>郭光祥&nbsp;<nobr>Guang-Xiang Guo</nobr></p><b><i class='title'>Key metrics,</i></b><p class='year'>2020</p><p class='content'><br>電腦鍵盤、攝影、數位影像檔</p>";
                                        break;
                                    case 2:
                                        card.innerHTML = "<p class='artist'>陳睦夫&nbsp;<nobr>Mu-Fu Chen</nobr></p><b><i class='title'>兩面之隔,</i></b><p class='year'>2020</p><p class='content'><br>手、自拍像、影像合成、數位影像檔</p>";
                                        break;
                                    case 3:
                                        card.innerHTML = "<p class='artist'>蔣承育&nbsp;<nobr>Cheng-Yu Jiang</nobr></p><b><i class='title'>Between 1 and 0,</i></b><p class='year'>2020</p><p class='content'><br>衍生藝術、自動生成數位影像</p>";
                                        break;
                                    case 4:
                                        card.innerHTML = "<p class='artist'>林佳翰&nbsp;<nobr>Jia-Han John Lin</nobr></p><b><i class='title'>逝,</i></b><p class='year'>2020</p><p class='content'><br>番茄皮、玻璃器皿、水、衣物、各類生活用品、攝影、文字、影像、電子書檔</p>";
                                        break;
                                    case 5:
                                        card.innerHTML = "<p class='artist'>程祖寧&nbsp;<nobr>Zu-Ning Cheng</nobr></p><b><i class='title'>鏡像空間,</i></b><p class='year'>2020</p><p><br>水晶、攝影、影像後製、圖像互換格式</p>";
                                        break;

                                }
                                break;
                            case 2:
                                switch (index) {
                                    case 0:
                                        card.innerHTML = "<p class='artist'>蕭筑元&nbsp;<nobr>Zhu-Yuan Xiao</nobr></p><b><i class='title'>Daydreaming,</i></b><p class='year'>2021</p><p class='content'><br>互動網頁遊戲</p>";
                                        break;
                                    case 1:
                                        card.innerHTML = "<p class='artist'>莊慶怡&nbsp;<nobr>Qing-Yi Zhuang</nobr></p><b><i class='title'>無題,</i></b><p class='year'>2021</p><p class='content'><br>電腦繪圖、 攝影、電子書檔</p>";
                                        break;
                                    case 2:
                                        card.innerHTML = "<p class='artist'>陳睦夫&nbsp;<nobr>Mu-Fu Chen</nobr></p><b><i class='title'文字遊戲,</i></b><p class='year'>2021</p><p class='content'><br>線上數位遊戲</p>";
                                        break;
                                    case 3:
                                        card.innerHTML = "<p class='artist'>柯亦霏&nbsp;<nobr>Yi-Fei Judy Ke</nobr></p><b><i class='title'>いただきます,</i></b><p class='year'>2021</p><p class='content'><br>吃播、攝影機、單頻道錄像，5分57秒</p>";
                                        break;
                                    case 4:
                                        card.innerHTML = "<p class='artist'>陳睦夫&nbsp;<nobr>Mu-Fu Chen</nobr></p><b><i class='title'>Museum,</i></b><p class='year'>2021</p><p class='content'><br>線上數位遊戲</p>";
                                        break;
                                    case 5:
                                        card.innerHTML = "<p class='artist'>莊慶怡&nbsp;<nobr>Qing-Yi Zhuang</nobr></p><b><i class='title'>病態我,</i></b><p class='year'>2021</p><p><br>3D建模、單頻道3D動畫，2分45秒</p>";
                                        break;
                                    case 6:
                                        card.innerHTML = "<p class='artist'>黃姿瑀&nbsp;<nobr>Zi-Yu Riley Huang</nobr></p><b><i class='title'>IYIYI,</i></b><p class='year'>2021</p><p><br單頻道錄像，1分06秒</p>";
                                        break;
                                    case 7:
                                        card.innerHTML = "<p class='artist'>黃暘&nbsp;<nobr>Yang Huang</nobr></p><b><i class='title'>竹林七賢,</i></b><p class='year'>2021</p><p><br>Youtube頻道</p>";
                                        break;
                                    case 8:
                                        card.innerHTML = "<p class='artist'>黃暘&nbsp;<nobr>Yang Huang</nobr></p><b><i class='title'>沒考上台大的建中生現在在哪,</i></b><p class='year'>2021</p><p><br>單頻道錄像，9分16秒</p>";
                                        break;
                    

                                }
                                break;
                        }
                        // card.innerHTML = "<b>Artist<br></b><nobr><b><i>Artwork, &nbsp</i></b>2022</nobr><p>Material</p>";
                        card.className = 'card';
                        card.classList.add('card' + wing_number);
                        card.id = 'card' + wing_number.toString() + '-' + index.toString();
                        let card_obj = new CSS3DObject(card);
                        card_obj.scale.set(0.003, 0.003, 0.003);
                        let art_border = document.createElement('div');
                        art_border.style.height = (100 * ratioh + 20) + 'px';
                        art_border.style.width = (100 * ratiow + 20) + 'px';
                        art_border.innerHTML = "";
                        // art_border.style.border='10px solid red';
                        art_border.style.border = '2px solid #999';
                        // art_border.style.boxShadow = '0px 0px 15px #ff6ec7';
                        art_border.className = 'art-border';
                        // art_border.classList.add('art-border' + x);
                        art_border.id = 'art-border-' + wing_number.toString() + '-' + index.toString();
                        let art_border_obj = new CSS3DObject(art_border);
                        art_border_obj.scale.set(0.01, 0.01, 0.01);

                        //-1 because index is 0 - n-1 but num of paintings is n
                        if (wing_number != 3) {
                            if (index <= Math.floor(num_of_paintings[wing_number - 1] / 2) - 1) //bottom half
                            {
                                //plane.rotation.z = Math.PI/2;
                                plane.position.set(seperation[wing_number - 1] * index + offset_front[wing_number - 1], artHeight, -4.96); //y and z kept constant
                                card_obj.position.set(seperation[wing_number - 1] * index + offset_front[wing_number - 1] + ratiow / 2 + card_offset, cardHeight, -5);
                                // art_border_obj.position.set(seperation * index + offset__front, artHeight, -4.5)
                                // var mesh = drawFrame({
                                //     x: seperation * index + offset__front - (ratiow / 2) - 0.1,
                                //     y: artHeight + (ratioh / 2) + 0.1,
                                //     z: -5
                                // }, {
                                //     x: seperation * index + offset__front + (ratiow / 2) + 0.1,
                                //     y: artHeight - (ratioh / 2) - 0.1,
                                //     z: -5
                                // }, 0.005);
                                // art.add(mesh);

                            }
                            else {
                                // plane.rotation.z = Math.PI/2;
                                plane.position.set(-(seperation[wing_number - 1] * index + offset_back[wing_number - 1]), artHeight, 4.96);
                                //plane.position.set(65*i - 75*Math.floor(num_of_paintings/2) - 15*Math.floor(num_of_paintings/2), 48, 90);
                                plane.rotation.y = Math.PI;
                                // art_border_obj.position.set(seperation * index + offset__front, artHeight, 4.5)
                                card_obj.position.set(-(seperation[wing_number - 1] * index + offset_back[wing_number - 1] + ratiow / 2 + card_offset), cardHeight, 5);
                                card_obj.rotation.y = Math.PI;
                                // var mesh = drawFrame({
                                //     x: seperation * index + offset_back[wing_number - 1] - (ratiow / 2) - 0.1,
                                //     y: artHeight + (ratioh / 2) + 0.1,
                                //     z: -5
                                // }, {
                                //     x: seperation * index + offset_back[wing_number - 1] + (ratiow / 2) + 0.1,
                                //     y: artHeight - (ratioh / 2) - 0.1,
                                //     z: -5
                                // }, 0.005);
                                // mesh.rotation.y = Math.PI;
                                // mesh.lookAt(0, 0, -1);
                                // art.add(mesh);
                            }
                            plane.receiveShadow = true;
                            art.add(card_obj);
                            if (wing_number == 1 && index == 5) {
                                gif_mirror_Texture.minFilter = THREE.LinearFilter;
                                gif_mirror_Texture.magFilter = THREE.LinearFilter;
                                // videoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                                var gifMaterial = new THREE.MeshLambertMaterial({
                                    map: gif_mirror_Texture
                                })
                                let gifGeometry = new THREE.PlaneGeometry(3.5, 2.8);
                                let gifScreen = new THREE.Mesh(gifGeometry, gifMaterial);
                                gifScreen.position.set(-(seperation[wing_number - 1] * index + offset_back[wing_number - 1]), artHeight, 4.96);
                                //plane.position.set(65*i - 75*Math.floor(num_of_paintings/2) - 15*Math.floor(num_of_paintings/2), 48, 90);
                                gifScreen.rotation.y = Math.PI;
                                art.add(gifScreen)
                            }
                            else if (wing_number == 4 && index == 3) {
                                gif_band_Texture.minFilter = THREE.LinearFilter;
                                gif_band_Texture.magFilter = THREE.LinearFilter;
                                // videoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                                var gifMaterial = new THREE.MeshLambertMaterial({
                                    map: gif_band_Texture
                                })
                                let gifGeometry = new THREE.PlaneGeometry(2.8, 2);
                                let gifScreen = new THREE.Mesh(gifGeometry, gifMaterial);
                                gifScreen.position.set(-(seperation[wing_number - 1] * index + offset_front[wing_number - 1]), artHeight, -4.96);
                                //plane.position.set(65*i - 75*Math.floor(num_of_paintings/2) - 15*Math.floor(num_of_paintings/2), 48, 90);
                                // gifScreen.rotation.y = Math.PI;
                                art.add(gifScreen)
                            }
                            else {
                                art.add(plane);

                            }
                            art_border_obj.position.copy(plane.position);

                            art.add(art_border_obj);

                            wingGroup.add(art);
                            paintings.push(art);
                        }
                        else if (wing_number == 3) {
                            switch (index) {
                                case (0):
                                    plane.position.set(22.45, 2.26, 14.78); //y and z kept constant
                                    plane.rotation.y = Math.PI;
                                    plane.scale.set(0.22, 0.22, 0.22)
                                    scene.add(plane);
                                    break;
                                case (1):
                                    plane.position.set(17.45, 2.26, 14.78); //y and z kept constant
                                    plane.rotation.y = Math.PI;
                                    plane.scale.set(0.43, 0.4, 0.4)
                                    scene.add(plane);
                                    break;
                                case (2):
                                    plane.position.set(22.45, 2.26, 23.78); //y and z kept constant
                                    plane.rotation.y = Math.PI;
                                    plane.scale.set(0.4, 0.4, 0.4)
                                    scene.add(plane);
                                    break;
                                case (3):
                                    plane.position.set(17.45, 2.26, 23.78); //y and z kept constant
                                    plane.rotation.y = Math.PI;
                                    plane.scale.set(0.42, 0.42, 0.42)
                                    scene.add(plane);
                                    break;
                                case (4):
                                    plane.position.set(19.95, 2.26, 32.78); //y and z kept constant
                                    plane.rotation.y = Math.PI;
                                    plane.scale.set(0.42, 0.42, 0.42)
                                    scene.add(plane);
                                    break;
                            }
                            plane.name = 'art-3-'+ index.toString();
                            research.push(plane);
                        }
                        // card_cover.position.copy(card_obj.position);


                        // cssGroup.add(card_cover);
                        //https://aerotwist.com/tutorials/create-your-own-environment-maps/

                    }
                };

                // img.map.needsUpdate = true; //ADDED
            }(i))
        }
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
    let ceil = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 0.05), material);
    ceil.position.set(0, 3, 0);
    ceil.rotation.x = Math.PI / 2;
    wingGroup.add(ceil);
    let beamMaterial = new THREE.MeshPhysicalMaterial({ color: 0x999999, metalness: 0.5, roughness: 0.5 })
    // let beamMaterial = new THREE.MeshPhongMaterial({color:0x555555, shininess:80})
    for (let i = 0; i < 9; i++) {
        let beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 0.2), beamMaterial);
        beam.position.set(-20 + i * 5, 2.98, 0);
        beam.rotation.x = Math.PI / 2;
        beam.castShadow = true;
        if (i == 0)
            beam.castShadow = false;
        wingGroup.add(beam);
    }
    let beam1 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 0.2), beamMaterial);
    beam1.position.set(0, 2.98, 5);
    beam1.rotation.x = Math.PI / 2;
    // beam1.castShadow = true;
    wingGroup.add(beam1);
    let beam2 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 0.2), beamMaterial);
    beam2.position.set(0, 2.98, -5);
    beam2.rotation.x = Math.PI / 2;
    // beam2.castShadow = true;
    wingGroup.add(beam2);

    wingGroup.add(wall1, wall2_1, wall2_3, wall3_1, wall3_2, arch_mesh, wall4, dark1, dark2, dark3, dark4_1, dark4_2, dark4_3, floorDark, ceilDark);
    obstacles.push(wall1, wall2_1, wall2_3, wall3_1, wall3_2, arch_mesh, wall4, dark1, dark2, dark3, dark4_1, dark4_2, dark4_3)
    walls.push(wall1, wall2_1, wall2_3, wall3_1, wall3_2, arch_mesh, wall4, dark1, dark2, dark3, dark4_1, dark4_2, dark4_3)
    wingGroup.position.set(x, 3, 26);
    wingGroup.rotateY(Math.PI / 2);

}

function create() {
    let worldLight = new THREE.HemisphereLight(
        'white', // bright sky color
        'lightgrey', // dim ground color
        1, // intensity
    );
    // let worldLight = new THREE.AmbientLight('white', 1);
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
    // for(let i=0;i<6;i++){
    //     let rectLight = new THREE.RectAreaLight( 0xffffff, 4, 10, 6.5 );
    //     rectLight.position.set( -20+20/7+(10+20/7)*i, 6.95, 0 );
    //     rectLight.lookAt(-20+20/7+(10+20/7)*i,0,0);
    //     scene.add( rectLight );
    //     scene.add( new RectAreaLightHelper( rectLight ) );
    // }

    //set the floor up
    let floorText = new THREE.TextureLoader(manager).load("./img/concrete5.jpg");
    floorText.wrapS = THREE.RepeatWrapping;
    floorText.wrapT = THREE.RepeatWrapping;
    floorText.repeat.set(14, 7);

    let floorMaterial = new THREE.MeshLambertMaterial({ map: floorText });
    floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = Math.PI / 2;
    floor.rotation.y = Math.PI;
    floor.position.set(20, 0, 20);
    floor.receiveShadow = true;
    scene.add(floor);

    //Create the walls////
    hallwayGroup = new THREE.Group();
    scene.add(hallwayGroup);

    let material = new THREE.MeshPhysicalMaterial({})
    material.transparent = true;
    material.opacity = 0.3;
    // material.reflectivity = 0
    // material.transmission = 1.0
    // material.roughness = 0.2
    // material.metalness = 0
    // material.clearcoat = 0.3
    // material.clearcoatRoughness = 0.25
    // material.color = new THREE.Color(0xffffff)
    // material.ior = 1.2
    material.thickness = .5
    let wall2_2Material = [
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xeeeeee }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];
    let wall2_1Material = [
        new THREE.MeshBasicMaterial({ color: 0xf7f7f7 }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];
    let wall2_3Material = [
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xf7f7f7 }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];
    let beamMaterial = new THREE.MeshPhysicalMaterial({ color: 0x999999, metalness: 0.5, roughness: 0.5 })

    let wall1 = new THREE.Mesh(new THREE.BoxGeometry(80, 7, 0.001), hallway_material);
    let wall2_1 = new THREE.Mesh(new THREE.BoxGeometry(3, 7, 0.05), wall2_1Material);
    let wall2_2 = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 0.05), wall2_2Material);
    let door = new THREE.Mesh(new THREE.BoxGeometry(4, 4.5, 0.05), material);
    for (let i = 0; i < 3; i++) {
        let beamVer = new THREE.Mesh(new THREE.BoxGeometry(0.051, 4.5, 0.08), beamMaterial);
        beamVer.position.set(-20, -1.25, -2 + 2 * i);
        // beam.rotation.x = Math.PI / 2;
        beamVer.rotation.z = Math.PI;
        hallwayGroup.add(beamVer);
        if (i < 2) {
            let beamHor = new THREE.Mesh(new THREE.BoxGeometry(0.051, 4.08, 0.1), beamMaterial);
            beamHor.position.set(-20, -3.45 + 4.4 * i, 0);
            beamHor.rotation.x = Math.PI / 2;
            beamHor.rotation.z = Math.PI;
            hallwayGroup.add(beamHor);
        }
    }
    let wall2_3 = new THREE.Mesh(new THREE.BoxGeometry(3, 7, 0.05), wall2_3Material);
    let wall3 = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 0.001), material);
    let wall4_1 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_2 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_3 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_4 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_5 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_6 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);


    hallwayGroup.add(wall1, wall2_1, wall2_2, door, wall2_3, wall3, wall4_1, wall4_2, wall4_3, wall4_4, wall4_5, wall4_6);
    drawables.push(wall1, wall2_1, wall2_2, wall2_3, wall3, wall4_1, wall4_2, wall4_3, wall4_4, wall4_5, wall4_6);
    obstacles.push(wall1, wall2_1, door, wall2_3, wall3, wall4_1, wall4_2, wall4_3, wall4_4, wall4_5, wall4_6)
    walls.push(wall1, wall2_1, door, wall2_3, wall3, wall4_1, wall4_2, wall4_3, wall4_4, wall4_5, wall4_6)
    // wingGroup.add(wall1, wall2, wall3, wall4, dark1, dark2, dark3, dark4);
    hallwayGroup.position.y = 3.5;

    wall1.position.z = -5;
    wall1.position.x = 20;
    wall1.myNormal = new THREE.Vector3(0, 0, 0.01);
    wall2_1.position.set(-20, 0, 3.5)
    wall2_1.rotation.y = Math.PI / 2;
    wall2_1.myNormal = new THREE.Vector3(0.01, 0, 0);
    wall2_2.position.set(-20, 2.25, 0)
    wall2_2.rotation.y = Math.PI / 2;
    wall2_2.myNormal = new THREE.Vector3(0.01, 0, 0);
    door.position.set(-20, -1.25, 0)
    door.rotation.y = Math.PI / 2;
    wall2_3.position.set(-20, 0, -3.5)
    wall2_3.rotation.y = Math.PI / 2;
    wall2_3.myNormal = new THREE.Vector3(0.01, 0, 0);
    //end window
    let plantText = new THREE.TextureLoader(manager).load("./img/plant.jpg");

    //Phong is for shiny surfaces
    let plantMaterial = new THREE.MeshLambertMaterial({ map: plantText });
    let plant_bg = new THREE.Mesh(new THREE.PlaneGeometry(16 / 1.2, 9 / 1.2), plantMaterial);

    plant_bg.rotation.y = -Math.PI / 2;
    plant_bg.position.set(60.5, 3.5, 0);
    scene.add(plant_bg);

    let riley_left_Text = new THREE.TextureLoader(manager).load("./img/ReilyShinning-left.jpg");
    let riley_left_Material = new THREE.MeshLambertMaterial({ map: riley_left_Text });
    let riley_left = new THREE.Mesh(new THREE.PlaneGeometry(0.295, 0.25), riley_left_Material);
    riley_left.position.set(32.762, 1.7, 4.14);
    riley_left.rotateY(-6*Math.PI/5+0.05);
    scene.add(riley_left);
    let riley_right_Text = new THREE.TextureLoader(manager).load("./img/ReilyShinning-right.jpg");
    let riley_right_Material = new THREE.MeshLambertMaterial({ map: riley_right_Text });
    let riley_right = new THREE.Mesh(new THREE.PlaneGeometry(0.295, 0.25), riley_right_Material);
    riley_right.position.set(32.52, 1.7, 4.1345);
    riley_right.rotateY(-4*Math.PI/5-0.04);
    scene.add(riley_right);
    let riley_mid_Text = new THREE.TextureLoader(manager).load("./img/ReilyShinning-mid.jpg");
    let riley_mid_Material = new THREE.MeshLambertMaterial({ map: riley_mid_Text });
    let riley_mid = new THREE.Mesh(new THREE.PlaneGeometry(0.015, 0.25), riley_mid_Material);
    riley_mid.position.set(32.637, 1.7, 4.045);
    riley_mid.rotateY(Math.PI);
    scene.add(riley_mid);
    let jon_Text = new THREE.TextureLoader(manager).load("./img/jon3.jpg");
    jon_Text.anisotropy = renderer.capabilities.getMaxAnisotropy();
    let jon_Material = new THREE.MeshLambertMaterial({ map: jon_Text });
    let jon = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.26), jon_Material);
    jon.position.set(47.815, 1.625, 4.157);
    jon.rotateX(-Math.PI/2);
    jon.rotateZ(-5*Math.PI/4);
    scene.add(jon);

    wall3.position.x = 60;
    wall3.rotation.y = -Math.PI / 2;
    wall3.myNormal = new THREE.Vector3(-0.01, 0, 0);
    wall4_1.position.set(-17.5, 0, 5.5);
    wall4_1.rotation.y = Math.PI;
    wall4_1.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall4_2.position.set(-2.5, 0, 5.5);
    wall4_2.rotation.y = Math.PI;
    wall4_2.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall4_3.position.set(12.5, 0, 5.5);
    wall4_3.rotation.y = Math.PI;
    wall4_3.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall4_4.position.set(27.5, 0, 5.5);
    wall4_4.rotation.y = Math.PI;
    wall4_4.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall4_5.position.set(42.5, 0, 5.5);
    wall4_5.rotation.y = Math.PI;
    wall4_5.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall4_6.position.set(57.5, 0, 5.5);
    wall4_6.rotation.y = Math.PI;
    wall4_6.myNormal = new THREE.Vector3(0, 0, -0.01);

    // let beamMaterial = new THREE.MeshPhongMaterial({color:0x555555, shininess:80})
    for (let i = 0; i < 3; i++) {
        let beamVer = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 0.2), beamMaterial);
        beamVer.position.set(60, 0, -5 + 5 * i);
        // beam.rotation.x = Math.PI / 2;
        beamVer.rotation.z = Math.PI;
        hallwayGroup.add(beamVer);
        let beamHor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 0.2), beamMaterial);
        beamHor.position.set(60, -3.5 + 3.5 * i, 0);
        beamHor.rotation.x = Math.PI / 2;
        beamHor.rotation.z = Math.PI;
        hallwayGroup.add(beamHor);
    }
    // let beam1 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 0.2), beamMaterial);
    // beam1.position.set(0, 2.98, 5);
    // beam1.rotation.x = Math.PI / 2;
    // // beam1.castShadow = true;
    // wingGroup.add(beam1);
    // let beam2 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 0.2), beamMaterial);
    // beam2.position.set(0, 2.98, -5);
    // beam2.rotation.x = Math.PI / 2;
    // // beam2.castShadow = true;
    // wingGroup.add(beam2);

    addWing(-10, 5);
    addWing(5, 4);
    addWing(20, 3);
    addWing(35, 2);
    addWing(50, 1);

    //按照wing順序推
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(45, 0, 5), new THREE.Vector3(55, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(30, 0, 5), new THREE.Vector3(40, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(15, 0, 5), new THREE.Vector3(25, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(0, 0, 5), new THREE.Vector3(10, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(-15, 0, 5), new THREE.Vector3(-5, 7, 45)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(40, 0, 45), new THREE.Vector3(55, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(25, 0, 45), new THREE.Vector3(40, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(10, 0, 45), new THREE.Vector3(25, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(-5, 0, 45), new THREE.Vector3(10, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(-20, 0, 45), new THREE.Vector3(-5, 7, 60)));

    let nav_circle = document.createElement('div');
    nav_circle.className = 'circle';

    nav_circle_obj = new CSS3DObject(nav_circle);
    nav_circle_obj.scale.set(0.02, 0.02, 0.02);
    nav_circle_obj.rotateX(Math.PI / 2)
    nav_circle_obj.position.set(-15, 0.1, 0)

    scene.add(nav_circle_obj);



    //Ceiling//
    //ceilMaterial = new THREE.MeshLambertMaterial({color: 0x8DB8A7});


    // let ceil = new THREE.Mesh(new THREE.BoxGeometry(40, 10, 0.05), material);
    // ceil.position.set(0, 6, 0);
    // ceil.rotation.x = Math.PI / 2;
    let ceil1 = new THREE.Mesh(new THREE.BoxGeometry(80, 10, 0.05), new THREE.MeshBasicMaterial({ color: 0xeeeeee }));
    ceil1.position.set(20, 7, 0);
    ceil1.rotation.x = Math.PI / 2;
    ceil1.myNormal = new THREE.Vector3(0, -0.01, 0);
    drawables.push(ceil1);
    // let ceil2 = new THREE.Mesh(new THREE.BoxGeometry(40, 2, 0.05), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    // ceil2.position.set(0, 6, 4);
    // ceil2.rotation.x = Math.PI / 2;
    // let ceil3 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 0.05), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    // ceil3.position.set(19, 6, 0);
    // ceil3.rotation.x = Math.PI / 2;
    // let ceil4 = new THREE.Mesh(new THREE.BoxGeometry(2, 6, 0.05), new THREE.MeshLambertMaterial({ color: 0xdddddd }));
    // ceil4.position.set(-19, 6, 0);
    // ceil4.rotation.x = Math.PI / 2;




    // scene.add(ceilDark);
    // ceil1.castShadow=true;
    scene.add(ceil1);
    // scene.add(ceil1);
    // scene.add(ceil2);
    // scene.add(ceil3);
    // scene.add(ceil4);

    let pedestalMaterial = new THREE.MeshLambertMaterial({ color: 0xeeeeee });

    let pedestal_wing3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), pedestalMaterial);
    pedestal_wing3.position.set(17.5, 0.8, 15);
    pedestal_wing3.receiveShadow = true;
    pedestal_wing3.castShadow = true;
    scene.add(pedestal_wing3);
    obstacles.push(pedestal_wing3);
    walls.push(pedestal_wing3);
    let clone = pedestal_wing3.clone();
    pedestal_wing3.position.set(22.5, 0.8, 15);
    scene.add(clone);
    obstacles.push(clone);
    walls.push(clone);
    clone = pedestal_wing3.clone();
    pedestal_wing3.position.set(22.5, 0.8, 24);
    scene.add(clone);
    obstacles.push(clone);
    walls.push(clone);
    clone = pedestal_wing3.clone();
    pedestal_wing3.position.set(17.5, 0.8, 24);
    scene.add(clone);
    obstacles.push(clone);
    walls.push(clone);
    clone = pedestal_wing3.clone();
    pedestal_wing3.position.set(20, 0.8, 33);
    scene.add(clone);
    obstacles.push(clone);
    walls.push(clone);
    
    

    let hallwaypedestalMaterial = [
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xf7f7f7 }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];

    let pedestal1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal4 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal5 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);

    pedestal1.position.set(-12.3, 0.8, 4.4);
    pedestal2.position.set(2.7, 0.8, 4.4);
    pedestal3.position.set(17.7, 0.8, 4.4);
    pedestal4.position.set(32.7, 0.8, 4.4);
    pedestal5.position.set(47.7, 0.8, 4.4);
    pedestal1.name = "1";
    pedestal2.name = "2";
    pedestal3.name = "3";
    pedestal4.name = "4";
    pedestal5.name = "5";
    // pedestal2_2.position.set(-12.25, 0.85, 4.4);
    // pedestal2_3.position.set(-12.25, 0.225, 4.4);
    for (let i = 1; i <= 5; i++) {
        let interact_instruction = document.createElement('div');
        interact_instruction.innerHTML = "Press & Hold 'E' to Interact";
        interact_instruction.className = 'interact_instruction';
        interact_instruction.id = 'interactable' + i;

        let interact_obj = new CSS3DObject(interact_instruction);
        interact_obj.scale.set(0.003, 0.003, 0.003);
        interact_obj.rotateY(Math.PI)
        interact_obj.rotateX(-Math.PI / 2)
        // interact_obj.rotateZ(Math.PI)
        interact_obj.position.set(-12.3 + 15 * (i - 1), 1.601, 3.95)
        scene.add(interact_obj)

        let interact_progress = document.createElement('div');
        interact_progress.className = 'interact_progress';
        interact_progress.id = 'progress' + i;

        let progress_obj = new CSS3DObject(interact_progress);
        progress_obj.scale.set(0.05, 0.05, 0.05);
        progress_obj.rotateX(-Math.PI / 2)
        // interact_obj.rotateZ(Math.PI)
        progress_obj.position.set(-12.3 + 15 * (i - 1), 1.601, 4.4)
        scene.add(progress_obj)
    }

    scene.add(pedestal1, pedestal2, pedestal3, pedestal4, pedestal5);

    obstacles.push(pedestal1, pedestal2, pedestal3, pedestal4, pedestal5)
    walls.push(pedestal1, pedestal2, pedestal3, pedestal4, pedestal5)
    interactables.push(pedestal1, pedestal2, pedestal3, pedestal4, pedestal5)
    // var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    // cube1 = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x333333 }));
    // cube1.position.set(-10, 2.2, 0);
    // cube1.name = "music";
    // // scene.add(cube1);
    // // paintings.push(cube1);
    // cube2 = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x333333 }));
    // cube2.position.set(10, 2.2, 0);
    // cube2.name = "paint";
    // scene.add(cube2);
    // paintings.push(cube2);



    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    // videoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    var slideshowMaterial = new THREE.MeshLambertMaterial({
        map: videoTexture
    })
    let slideshowGeometry = new THREE.PlaneGeometry(9.6, 5.4);
    let slideshowScreen = new THREE.Mesh(slideshowGeometry, slideshowMaterial);
    slideshowScreen.position.set(-19.99, 3, 54);
    slideshowScreen.rotation.y = Math.PI / 2;
    scene.add(slideshowScreen)


    // videoTexture2.minFilter = THREE.LinearFilter;
    // videoTexture2.magFilter = THREE.LinearFilter;
    // // videoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    // var slideshowMaterial2 = [
    //     new THREE.MeshLambertMaterial({ color: 0x333333 }),
    //     new THREE.MeshLambertMaterial({ color: 0x333333 }),
    //     new THREE.MeshLambertMaterial({ color: 0x333333 }),
    //     new THREE.MeshLambertMaterial({ color: 0x333333 }),
    //     new THREE.MeshLambertMaterial({ color: 0x333333 }),
    //     new THREE.MeshLambertMaterial({ map: videoTexture2 }),
    // ];
    // let slideshowGeometry2 = new THREE.BoxGeometry(6.4, 3.6, 0.5);
    // let slideshowScreen2 = new THREE.Mesh(slideshowGeometry2, slideshowMaterial2);
    // slideshowScreen2.position.set(6, 1.8, 13);
    // scene.add(slideshowScreen2);
    // scene.add(slideshowScreen);

    // var artwork = new Image();

    // var source = './img/portal.png';
    // artwork.src = source;

    // var texture = new THREE.TextureLoader().load(artwork.src);
    // texture.generateMipmaps = false;
    // texture.minFilter = THREE.LinearFilter;
    // var img = new THREE.MeshLambertMaterial({ map: texture, transparent: true });
    // var plane = new THREE.Mesh(new THREE.PlaneGeometry(1.191 * 6, 0.67 * 6), img); //width, height
    // plane.position.set(14, 2.5, 4.99);
    // plane.rotation.z = Math.PI / 2;
    // plane.rotation.y = Math.PI;
    // plane.name = "portal";
    // paintings.push(plane);
    // scene.add(plane);


    // var plane2 = new THREE.Mesh(new THREE.PlaneGeometry(1.191 * 6, 0.67 * 6), img); //width, height
    // plane2.position.set(14, 2.5, 5.2);
    // plane2.rotation.z = Math.PI / 2;
    // plane2.name = "portal2";
    // paintings.push(plane2);
    // scene.add(plane2);

}



function animate() {
    requestAnimationFrame(animate);

    const time = performance.now();
    // user.BBox.setFromObject(user);
    if (controls.isLocked === true) {
        // console.log(user.BBox.intersectsBox(travelator.BBox))
        // console.log(userBoxHelper)
        // console.log(userBBox.max.x, travelator.BBox.min.x)
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 3 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

        for (i = 0; i < wing_BBox.length; i++) {
            if (user.BBox.intersectsBox(wing_BBox[i])) {
                location = i + 1;
                prevLocation = location;
                break;
            }
            else {
                location = null;
            }
        }
        for (i = 0; i < screen_BBox.length; i++) {
            if (user.BBox.intersectsBox(screen_BBox[i])) {
                screen = i + 1;
                break;
            }
            else {
                screen = null;
            }
        }
        if (location) {
            audio.volume = 0.3;
            let showCard = document.querySelectorAll(".card" + location);
            showCard.forEach(s => {
                s.classList.add("show")

            });
            document.querySelector(".sign" + location).classList.add("show");
            let research_interact = raycaster.intersectObjects(research);
            if (research_interact.length !== 0) {
                // intersects[0].object.material.color.set(0xaaeeee);
                // intersects[0].object.parent.children[0].visible=false;
                // console.log(intersects[0].object.name);
                if (research_interact[0].object.name) {
                    console.log(research_interact[0].object.name)
                    // console.log(intersects[0].distance);
                    // console.log($('#card-'+intersects[0].object.parent.name.substring(4)).innerHTML);

                    // interact.style.display = 'block';
                    if (research_interact[0].distance < 10) {
                        // document.querySelector('#art-border-' + research_interact[0].object.parent.name.substring(4)).classList.add('show');
                        // prevHover = '#art-border-' + research_interact[0].object.parent.name.substring(4);
                        // if (detail) {
                        //     nav_click = false;
                        //     document.getElementById(intersects[0].object.parent.name).classList.add('show');
                        //     controls.unlock();
                        //     ui = true;
                        // }
                    }
                    // if (interacting) {
                    //     let target = document.querySelector('#card' + location + '-' + intersects[0].object.parent.name.substring(4));

                    //     progressValue++;
                    //     // valueContainer.textContent = `${progressValue}%`;
                    //     target.style.borderImageSource = `conic-gradient(
                    //     #ee82ee,
                    //     #ffff00,
                    //     #ee82ee
                    //     ${progressValue * 5}deg,
                    //     #555555 ${progressValue * 5}deg
                    // )`;
                    //     if (progressValue == progressEndValue) {
                    //         // valueContainer.textContent = "done";
                    //         progressValue--;
                    //         // console.log(document.getElementById(intersects[0].object.parent.name));
                    //         document.getElementById(intersects[0].object.parent.name).classList.add('show');
                    //         // blocker.style.display = 'block';
                    //         controls.unlock();
                    //     }
                    // }
                }

                else {
                    // interact.style.display = 'none'
                    // if (prevHover) {
                    //     document.querySelector(prevHover).classList.remove('show');
                    // }
                    // progressValue = 0;
                    // progressBar.style.borderImageSource = `conic-gradient(
                    //     #444444 ${progressValue * 1.2}deg,
                    //     #555555 ${progressValue * 1.2}deg
                    // )`;
                    // valueContainer.textContent = "E";

                }

            }
            else if (prevHover) {
                // document.querySelector(prevHover).classList.remove('show');
            }

            let intersects = raycaster.intersectObjects(paintings);
            if (intersects.length !== 0) {
                // intersects[0].object.material.color.set(0xaaeeee);
                // intersects[0].object.parent.children[0].visible=false;
                // console.log(intersects[0].object.name);
                if (intersects[0].object.parent.name) {
                    // console.log(intersects[0].distance);
                    // console.log($('#card-'+intersects[0].object.parent.name.substring(4)).innerHTML);

                    // interact.style.display = 'block';
                    if (intersects[0].distance < 10) {
                        document.querySelector('#art-border-' + intersects[0].object.parent.name.substring(4)).classList.add('show');
                        prevHover = '#art-border-' + intersects[0].object.parent.name.substring(4);
                        if (detail) {
                            nav_click = false;
                            document.getElementById(intersects[0].object.parent.name).classList.add('show');
                            controls.unlock();
                            ui = true;
                        }
                    }
                    // if (interacting) {
                    //     let target = document.querySelector('#card' + location + '-' + intersects[0].object.parent.name.substring(4));

                    //     progressValue++;
                    //     // valueContainer.textContent = `${progressValue}%`;
                    //     target.style.borderImageSource = `conic-gradient(
                    //     #ee82ee,
                    //     #ffff00,
                    //     #ee82ee
                    //     ${progressValue * 5}deg,
                    //     #555555 ${progressValue * 5}deg
                    // )`;
                    //     if (progressValue == progressEndValue) {
                    //         // valueContainer.textContent = "done";
                    //         progressValue--;
                    //         // console.log(document.getElementById(intersects[0].object.parent.name));
                    //         document.getElementById(intersects[0].object.parent.name).classList.add('show');
                    //         // blocker.style.display = 'block';
                    //         controls.unlock();
                    //     }
                    // }
                }

                else {
                    // interact.style.display = 'none'
                    if (prevHover) {
                        document.querySelector(prevHover).classList.remove('show');
                    }
                    progressValue = 0;
                    // progressBar.style.borderImageSource = `conic-gradient(
                    //     #444444 ${progressValue * 1.2}deg,
                    //     #555555 ${progressValue * 1.2}deg
                    // )`;
                    // valueContainer.textContent = "E";

                }

            }
            else if (prevHover) {
                document.querySelector(prevHover).classList.remove('show');
            }
        }
        else {
            if (screen)
                audio.volume = 0;
            else
                audio.volume = 1;
            let showCard = document.querySelectorAll(".card" + prevLocation);
            showCard.forEach(s => {
                s.classList.remove("show")

            });
            document.querySelector(".sign" + prevLocation).classList.remove("show");
        }

        if (user.BBox.intersectsBox(travelator.BBox) && choosing == false) {
            travelatorUI.classList.add('show');
            controls.unlock();
            choosing = true;
            ui = true;
        }
        if (!user.BBox.intersectsBox(travelator.BBox)) {
            choosing = false;
            travel_dst = null
        }
        if (travel_dst) {
            if (Math.abs(travel_dst - camera.position.x) > 1.5)
                camera.position.x += 10 * travel_dir * delta;
            else {
                let temp = travel_dst;
                spinner.style.display = "block";
                setTimeout(() => { spinner.style.display = "none"; }, 2000);
                setTimeout(() => { camera.position.x = temp; camera.position.z = 7; camera.lookAt(camera.position.x, camera.position.y, 8); }, 1500);
                travel_dst = null;
            }
        }

        // camera.position.x += 10 * delta;

        controls.moveRight(- velocity.x * delta);
        controls.moveForward(- velocity.z * delta);
        currentX = camera.position.x;
        currentZ = camera.position.z;
        collideX = false;
        collideZ = false;
        user.BBox.min = new THREE.Vector3(camera.position.x - 0.5, camera.position.y - 0.6, camera.position.z - 0.5)
        user.BBox.max = new THREE.Vector3(camera.position.x + 0.5, camera.position.y + 0.5, camera.position.z + 0.5)
        for (var i = 0; i < obstacles_bbox.length; i++) {

            if (user.BBox.intersectsBox(obstacles_bbox[i])) {
                if (i == 0) {
                    // document.querySelector("#screen_video").style.display="block"
                }
                // if(camera.position.x>lastX)
                camera.position.x = lastX;
                // else if(camera.position.x<lastX)
                //     camera.position.x=lastX;
                user.BBox.min = new THREE.Vector3(camera.position.x - 0.5, camera.position.y - 0.6, camera.position.z - 0.5)
                user.BBox.max = new THREE.Vector3(camera.position.x + 0.5, camera.position.y + 0.5, camera.position.z + 0.5)

                if (user.BBox.intersectsBox(obstacles_bbox[i])) {
                    //     if(camera.position.z>lastZ)
                    camera.position.z = lastZ;
                    //     else if(camera.position.z<lastZ)
                    camera.position.x = currentX;
                    collideX = false;
                    collideZ = true;
                    // console.log(i + "z1")
                }
                else {
                    collideX = true;
                    collideZ = false;
                    // console.log(i + "x1")
                }

                user.BBox.min = new THREE.Vector3(camera.position.x - 0.5, camera.position.y - 0.6, camera.position.z - 0.5)
                user.BBox.max = new THREE.Vector3(camera.position.x + 0.5, camera.position.y + 0.5, camera.position.z + 0.5)

                for (var j = 0; j < obstacles_bbox.length; j++) {
                    if (j == i)
                        continue;
                    if (user.BBox.intersectsBox(obstacles_bbox[j])) {
                        // if(camera.position.x>lastX)
                        camera.position.x = lastX;
                        // else if(camera.position.x<lastX)
                        //     camera.position.x=lastX;
                        user.BBox.min = new THREE.Vector3(camera.position.x - 0.5, camera.position.y - 0.6, camera.position.z - 0.5)
                        user.BBox.max = new THREE.Vector3(camera.position.x + 0.5, camera.position.y + 0.5, camera.position.z + 0.5)

                        if (user.BBox.intersectsBox(obstacles_bbox[j])) {
                            //     if(camera.position.z>lastZ)
                            camera.position.z = lastZ;
                            //     else if(camera.position.z<lastZ)
                            camera.position.x = currentX;
                            collideZ = true;
                            // console.log(j + "z2" + "i=" + i)
                        }
                        else {
                            collideX = true;
                            // console.log(j + "x2" + "i=" + i)
                        }
                        break;
                    }

                }
                break;

            }

        }

        if (!collideX) {
            lastX = camera.position.x;
        }
        if (!collideZ) {
            lastZ = camera.position.z;
        }

        camera.position.y += (velocity.y * delta); // new behavior

        if (camera.position.y < 2) {

            velocity.y = 0;
            camera.position.y = 2;

            canJump = true;

        }
        if(camera.position.x>45 && camera.position.z>45){
            camera.position.z=45;
        }
        // if (camera.position.y > 5) {

        //     velocity.y = 0;
        //     camera.position.y = 5;
        // }

        // if (camera.position.z < -4) {
        //     camera.position.z = -4
        // }
        // if (camera.position.z > 4 && camera.position.z < 5) {
        //     camera.position.z = 4
        // }
        // if (camera.position.z > 5 && camera.position.z < 5.5) {
        //     camera.position.z = 5.5
        // }
        // if (camera.position.x < -18) {
        //     camera.position.x = -18
        // }intersects_obj
        // if (camera.position.x > 18) {
        //     camera.position.x = 18
        // }

        raycaster.setFromCamera(mouse.clone(), camera);

        let intersects_text = raycaster.intersectObjects(translate);
        if (intersects_text.length !== 0 && translate_text) {
            if (en) {

                document.querySelectorAll('.wing-text-cn').forEach(e => {
                    e.classList.add('show');
                });
                document.querySelectorAll('.wing-text-en').forEach(e => {
                    e.classList.remove('show');
                });
            }
            else {
                document.querySelectorAll('.wing-text-en').forEach(e => {
                    e.classList.add('show');
                });
                document.querySelectorAll('.wing-text-cn').forEach(e => {
                    e.classList.remove('show');
                });
            }
            en = !en;
        }
        if (camera.position.z > 5) {
            document.querySelectorAll('.wing-text-cn').forEach(e => {
                e.classList.remove('show');
            });
            document.querySelectorAll('.wing-title').forEach(e => {
                e.classList.add('invisible');
            });
            document.querySelectorAll('.wing-title-ch').forEach(e => {
                e.classList.add('invisible');
            });
            document.querySelectorAll('.wing-text-en').forEach(e => {
                e.classList.remove('show');
            });
        }
        else {
            document.querySelectorAll('.wing-title').forEach(e => {
                e.classList.remove('invisible');
            });
            document.querySelectorAll('.wing-title-ch').forEach(e => {
                e.classList.remove('invisible');
            });
            if (en) {

                document.querySelectorAll('.wing-text-en').forEach(e => {
                    e.classList.add('show');
                });

            }
            else {
                document.querySelectorAll('.wing-text-cn').forEach(e => {
                    e.classList.add('show');
                });

            }
        }
        let intersects_obj = raycaster.intersectObjects(interactables);
        if (intersects_obj.length !== 0) {
            if (intersects_obj[0].distance < 1.5) {
                document.querySelector('#interactable' + intersects_obj[0].object.name).classList.add('show');

                if (interacting) {
                    document.querySelector('#progress' + intersects_obj[0].object.name).classList.add('show')
                    progressValue++;
                    // console.log(progressValue);
                    // valueContainer.textContent = `${progressValue}%`;
                    document.querySelector('#progress' + intersects_obj[0].object.name).style.borderImageSource = `conic-gradient(
                        from 45deg,
                        #ee82ee,
                        #ffff00,
                        #ee82ee
                        ${progressValue * 5}deg,
                        #fafafa ${progressValue * 5}deg
                    )`;
                    if (progressValue == progressEndValue) {
                        progressValue = 0;

                        // console.log(document.getElementById(intersects[0].object.parent.name));
                        if (intersects_obj[0].object.name == "1") {
                            document.querySelector(".container").classList.add("show")
                            controls.unlock();
                            ui = true;
                        }
                        else if (intersects_obj[0].object.name == "2") {
                            music.classList.add('show');
                            controls.unlock();
                            ui = true;
                        }
                        else if (intersects_obj[0].object.name == "3") {
                            paintUI.classList.add('show');
                            controls.unlock();
                            ui = true;
                        }
                        else if (intersects_obj[0].object.name == "portal2")
                            camera.position.set(14, 0, 4.5);
                    }
                }
                else {
                    progressValue = 0;
                    document.querySelector('#progress' + intersects_obj[0].object.name).classList.remove('show')
                }
            }
            else {
                document.querySelector('#interactable' + intersects_obj[0].object.name).classList.remove('show');
            }

        }
        else {
            document.querySelectorAll('.interact_instruction').forEach(e => {
                e.classList.remove('show');
            });
        }

        let intersects_walls = raycaster.intersectObjects(walls);
        let intersects_floor = raycaster.intersectObject(floor);
        if (intersects_walls.length != 0) {
            document.querySelector(".circle").classList.remove("show");
        }
        else {

            if (intersects_floor.length != 0) {
                document.querySelector(".circle").classList.add("show");
                if (!navigate) {
                    nav_circle_obj.position.copy(intersects_floor[0].point);

                    nav_circle_obj.position.y = 0.01;
                }
                if (nav_click == true) {
                    document.querySelector(".circle").classList.add("grow");
                    nav_target.copy(nav_circle_obj.position);
                    nav_target.y = 2;
                    navigate = true;
                    controls.pointerSpeed = 0;
                }
            }
        }
        if (navigate == true) {

            if (nav_target.distanceTo(camera.position) > 0.3 && !collideX && !collideZ) {
                moveForward = true;
            }
            else {
                moveForward = false;
                navigate = false;
                document.querySelector(".circle").classList.remove("grow");
                controls.pointerSpeed = 0.5;
            }
        }
        nav_click = false;
        detail = false;

        translate_text = false;
        if (intersects_obj.length !== 0) {
            document.querySelector(".circle").classList.remove("show");
        }
        //calculate objects interesting ray



    }
    // cube1.rotation.x += 0.01;
    // cube1.rotation.y += 0.01;
    // cube2.rotation.x += 0.01;
    // cube2.rotation.y += 0.01;
    // dir_helper.update();
    // spot_helper.update()
    prevTime = time;
    videoTexture.needsUpdate = true;
    renderer.render(scene, camera);
    css3DRenderer.render(scene, camera);
    if (isDrawing && enablePaint) {
        paint();
    }
}

function paint() {
    let drawIntersect = raycaster.intersectObjects(drawables);
    if (drawIntersect.length != 0 && drawIntersect[0].point.z < 5.01) {
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

    var material = new THREE.MeshLambertMaterial({ color: 0x999999 }); // ??? Where is this from?
    var blackBorders = new THREE.Mesh(geometry, material);
    frame.add(blackBorders);


    var backingGeometry = new THREE.BufferGeometry();
    backingGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    backingGeometry.setIndex([
        12, 14, 13,
        12, 15, 14
    ]);
    var backingMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    var backing = new THREE.Mesh(backingGeometry, backingMaterial);
    frame.add(backing);

    return frame;
}