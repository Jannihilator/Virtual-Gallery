import * as THREE from './three.module.js';
import { PointerLockControls } from './PointerLockControls.js';
import { CSS3DObject, CSS3DSprite, CSS3DRenderer } from './CSS3DRenderer.js';
import { GLTFLoader } from './GLTFLoader.js';
import { GUI } from './build/dat.gui.module.js'
import { Sky } from './Sky.js'
// import { RectAreaLightUniformsLib } from './RectAreaLightUniformsLib.js'
// import { RectAreaLightHelper } from './RectAreaLightHelper.js';

let speed = 50;
let
    ui=false,
    wing_BBox=[],
    screen_BBox=[],
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
let cube1, cube2;
let enablePaint = false;
let colorPicker = document.getElementById('color-picker');
let paintColor = "#ff0099"
let location=null, screen=null,prevLocation=-10,spot_helper;
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
// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// THREE.Object3D.frustumCulled = true;
const manager = new THREE.LoadingManager();
manager.onLoad = function () {
    document.querySelector(".scene").style.display="none";
    blocker.style.background="rgba(0,0,0,0.5)"
    instructions.innerHTML += "<p>click anywhere to start</p>";
    animate();
    for (var i = 1; i < 85; i++) {
        obstacles[i].geometry.computeBoundingBox();
        obstacles_bbox.push(new THREE.Box3().copy(obstacles[i].geometry.boundingBox).applyMatrix4(obstacles[i].matrixWorld));
    }
    for (var i = 85; i < obstacles.length; i++) {
        obstacles_bbox.push(new THREE.Box3().setFromObject(obstacles[i]));
    }
};
init();
initSky();
create();
// renderer.render(scene, camera);


function init() {
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

    const dir_light = new THREE.DirectionalLight()
    dir_light.color.setHex('0xfff5de');
    dir_light.intensity = 0.4;
    dir_light.castShadow = true
    dir_light.shadow.mapSize.width = 2048
    dir_light.shadow.mapSize.height = 2048
    dir_light.shadow.camera.near = 15
    dir_light.shadow.camera.far = 100
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
        glb.scene.position.set(32.95, 1.6, 4.4);
        glb.scene.rotation.y = Math.PI / 2
        glb.scene.scale.set(1, 1, 1);
        scene.add(glb.scene);
        glb.scene.updateMatrixWorld(true)
        obstacles.push(glb.scene);
    });

    loader.load('./scene.gltf', function (gltf) {
        gltf.scene.position.set(-10, 1.65, 30);
        gltf.scene.scale.set(0.0012, 0.0012, 0.0012);
        gltf.scene.rotateY(Math.PI / 3)
        gltf.scene.castShadow = true;
        gltf.scene.receiveShadow = true;
        scene.add(gltf.scene);
        gltf.scene.updateMatrixWorld(true)
        obstacles.push(gltf.scene);
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
    });
    loader.load('./gramophone.glb', function (gltf) {
        gltf.scene.position.set(2.7, 2.5, 4.4);
        gltf.scene.scale.set(0.2, 0.2, 0.2);
        gltf.scene.rotateY(Math.PI/2);
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
        gltf.scene.rotateY(-Math.PI/2);
        scene.add(gltf.scene);
        
    });
    loader.load('./painting_palette.glb', function (gltf) {
        gltf.scene.position.set(17.7, 1.62, 4.4);
        gltf.scene.scale.set(2.3, 1, 2.3);
        // gltf.scene.rotateX(-Math.PI/6);
        gltf.scene.rotateY(7*Math.PI/6);
        scene.add(gltf.scene);
        
    });
    loader.load('./paint_brush.glb', function (gltf) {
        gltf.scene.position.set(17.4, 1.63, 4.2);
        gltf.scene.scale.set(1.5, 1.5, 1.5);
        gltf.scene.rotateY(-Math.PI/12);
        gltf.scene.rotateX(7*Math.PI/12);
        scene.add(gltf.scene);
        
    });
    loader.load('./bench.glb', function (gltf) {
        gltf.scene.position.set(-13, 0, 54.5);
        gltf.scene.scale.set(0.02, 0.02, 0.02);
        gltf.scene.rotateY(-Math.PI/2);
        // gltf.scene.rotateX(7*Math.PI/12);
        scene.add(gltf.scene);
        obstacles_bbox.push(new THREE.Box3(new THREE.Vector3(-13.5, 0, 52.5), new THREE.Vector3(-12.5, 2, 56.5)));
    });
    const spotLight = new THREE.SpotLight(0xffffff);
        spotLight.intensity = 5;
        spotLight.distance = 2.5;
        spotLight.decay=0.5;
        spotLight.angle=0.5;
        spotLight.position.set(2.7, 3, 3);
        spotLight.target.position.set(2.7, 1.5, 4.4);
        scene.add(spotLight);
        scene.add(spotLight.target);
    const spotLight2 = new THREE.SpotLight(0xffffff);
        spotLight2.intensity = 1;
        spotLight2.distance = 2;
        spotLight2.decay=1;
        spotLight2.angle=0.4;
        spotLight2.position.set(-12.4, 3, 4.38);
        spotLight2.target.position.set(-12.4, 1.55, 4.38);
        scene.add(spotLight2);
        scene.add(spotLight2.target);
    const spotLight3 = new THREE.SpotLight(0xffffff);
        spotLight3.intensity = 1;
        spotLight3.distance = 2;
        spotLight3.decay=0.5;
        spotLight3.angle=0.4;
        spotLight3.position.set(17.7, 3, 3.5);
        spotLight3.target.position.set(17.7, 1.65, 4.2);
        scene.add(spotLight3);
        scene.add(spotLight3.target);
        // spot_helper = new THREE.SpotLightHelper(spotLight3)
        // //const helper = new THREE.CameraHelper(light.shadow.camera);
        // scene.add(spot_helper)

    let travelatorText = new THREE.TextureLoader(manager).load("./img/escalator-texture2.jpg");
    travelatorText.wrapS = THREE.RepeatWrapping;
    travelatorText.wrapT = THREE.RepeatWrapping;
    travelatorText.repeat.set(1, 15);

    //Phong is for shiny surfaces
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

    scene.fog = new THREE.FogExp2(0x666666, 0.01);


    css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    css3DRenderer.domElement.style.top = '0px';
    css3DRenderer.domElement.style.left = '0px';
    css3DRenderer.domElement.style.position = 'absolute';
    document.body.appendChild(css3DRenderer.domElement);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    let userBoxGeo = new THREE.BoxGeometry(1, 4, 1);
    let userBoxMat = new THREE.MeshLambertMaterial({ color: 0xeeee99, wireframe: true });
    user = new THREE.Mesh(userBoxGeo, userBoxMat);
    user.visible = false;
    // userBoxHelper = new THREE.BoxHelper(user, 0xff0000);
    // userBoxHelper.visible = false;
    user.BBox = new THREE.Box3().setFromObject(user);

    camera.add(user);
    camera.position.set(-18, 2, 0);
    // camera.position.set(-10, 2, 40);
    camera.rotation.y = -Math.PI / 2;

    controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(camera);
    colorPicker.addEventListener("input", function () {
        paintColor = colorPicker.value;
    });

    startPaint.addEventListener('click', function () {
        enablePaint = true;
    });
    exitPaint.addEventListener('click', function () {
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
    wingButton.forEach(e => {
        e.addEventListener('click', function () {
            travel_dst = Number(e.getAttribute('coordX'));
            travel_dir = Math.sign(travel_dst - camera.position.x);
            travelatorUI.classList.remove('show');
            controls.lock();
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


    // interact.style.display = 'none';

    blocker.addEventListener('click', function () {

        controls.lock();
        // instructions.style.display = 'none';
        // blocker.style.display = 'none';
    });

    controls.addEventListener('lock', function () {

        instructions.style.display = 'none';
        blocker.style.display = 'none';
        // interact.style.display = 'block';
        modal.forEach(m => {
            m.classList.remove('show');
        })
        music.classList.remove('show');
        paintUI.classList.remove('show');
        travelatorUI.classList.remove('show');
        document.querySelector('.container').classList.remove('show')
        ui=false;
        // choosing = false;
    });

    controls.addEventListener('unlock', function () {
        if (!ui) {

            instructions.style.display = '';
        }
        blocker.style.display = 'block';
    });

    scene.add(camera);


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

    /// GUI

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
        // renderer.render(scene, camera);

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

function addWing(x) {
    let wingGroup = new THREE.Group();
    scene.add(wingGroup);
    let wall_material =
        new THREE.MeshLambertMaterial({ color: 0xffffff });
    let dark1_Material = [
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xeeeeee }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];
    let dark2_Material = [
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0x555555 }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
    ];
    let dark3_Material = [
        new THREE.MeshLambertMaterial({ color: 0x555555 }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
        new THREE.MeshLambertMaterial({ color: 0xffffff }),
    ];
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
    let wall2_2 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2, 1), wall_material);
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
    room_sign.innerHTML = "<b style='font-size: 36px; line-height: 0; margin-left:-2px;'>&#8593;</b><br><b>Screening<br>Room</b>";
    room_sign.className = 'sign';
    room_sign.classList.add('sign' + x);

    let sign_obj = new CSS3DObject(room_sign);
    sign_obj.scale.set(0.02, 0.02, 0.02);
    sign_obj.rotateY(Math.PI / 2)
    sign_obj.position.set(-20, -1, -2.7)
    
    wingGroup.add(sign_obj)
    wall1.position.z = -5;
    wall1.myNormal = new THREE.Vector3(0, 0, 0.01);
    wall1.castShadow = true;
    wall2_1.position.set(-20.5, 0, 3.3);
    wall2_1.rotation.y = -Math.PI / 2;
    wall2_1.receiveShadow = true;
    wall2_2.receiveShadow = true;
    wall2_3.receiveShadow = true;
    wall2_2.position.set(-20.5, 2, 0);
    wall2_2.rotation.y = -Math.PI / 2;
    wall2_3.position.set(-20.5, 0, -3.3);
    wall2_3.rotation.y = -Math.PI / 2;
    wall3_1.position.set(20.5, 0.5, 3.4);
    wall3_1.rotation.y = -Math.PI / 2;
    wall3_1.myNormal = new THREE.Vector3(0, 0, -0.01);
    wall3_2.position.set(20.5, 0.5, -3.4);
    wall3_2.rotation.y = -Math.PI / 2;
    wall3_2.myNormal = new THREE.Vector3(0, 0, -0.01);
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

    let dark1 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark2 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
    let dark3 = new THREE.Mesh(new THREE.BoxGeometry(15, 6, 0.001), new THREE.MeshLambertMaterial({ color: 0x333333 }));
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

    //Phong is for shiny surfaces
    let floorMaterial = new THREE.MeshLambertMaterial({ map: floorText });
    let floorDark = new THREE.Mesh(new THREE.PlaneGeometry(16, 15), floorMaterial);
    floorDark.rotation.x = -Math.PI / 2;
    floorDark.position.set(-28, -2.999, -2.5);



    const num_of_paintings = 6;
    const seperation = 8, artHeight = 2.5 - 3, cardHeight = 1.8 - 3, card_offset = 0.9, offset__front = -8, offset_back = -30;

    for (var i = 0; i < num_of_paintings; i++) {
        (function (index) {
            //https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image
            var artwork = new Image();
            var ratiow = 0;
            var ratioh = 0;

            var source = './img/works/art-(' + (index).toString() + ').jpg';
            artwork.src = source;

            var texture = new THREE.TextureLoader(manager).load(artwork.src);
            texture.generateMipmaps = false;
            texture.minFilter = THREE.LinearFilter;
            var img = new THREE.MeshLambertMaterial({ map: texture });

            artwork.onload = function () {
                if (artwork.width > 100) {

                    // console.log(artwork.width)
                    ratiow = artwork.width / 425;
                    ratioh = artwork.height / 425;

                    var art = new THREE.Group();
                    art.name = 'art-' + (index).toString();


                    // plane for artwork
                    var plane = new THREE.Mesh(new THREE.PlaneGeometry(ratiow, ratioh), img); //width, height
                    plane.overdraw = true;
                    plane.frustumCulled = false;
                    let card = document.createElement('div');
                    card.innerHTML = "<b>Artist<br></b><nobr><b><i>Artwork, &nbsp</i></b>2022</nobr><p>Material</p>";
                    card.className = 'card';
                    card.classList.add('card' + x);
                    card.id = 'card' + x.toString() + '-' + index.toString();

                    let card_obj = new CSS3DObject(card);
                    card_obj.scale.set(0.005, 0.005, 0.005);
                    var cover_material = new THREE.MeshLambertMaterial({
                        color: new THREE.Color(0x000000),
                        opacity: 0,
                        side: THREE.DoubleSide,
                    });
                    // let card_cover = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), cover_material);
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
                        }, 0.005);
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
                        }, 0.005);
                        // mesh.rotation.y = Math.PI;
                        mesh.lookAt(0, 0, -1);
                        art.add(mesh);
                    }
                    // card_cover.position.copy(card_obj.position);
                    plane.receiveShadow = true;
                    art.add(card_obj);
                    // cssGroup.add(card_cover);
                    //https://aerotwist.com/tutorials/create-your-own-environment-maps/
                    art.add(plane);






                    wingGroup.add(art);
                    paintings.push(art);
                }
            };

            // img.map.needsUpdate = true; //ADDED
        }(i))
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

    wingGroup.add(wall1, wall2_1, wall2_2, wall2_3, wall3_1, wall3_2, arch_mesh, wall4, dark1, dark2, dark3, dark4_1, dark4_2, dark4_3, floorDark, ceilDark);
    obstacles.push(wall1, wall2_1, wall2_2, wall2_3, wall3_1, wall3_2, arch_mesh, wall4, dark1, dark2, dark3, dark4_1, dark4_2, dark4_3)
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

    // const rectLight1 = new THREE.RectAreaLight( 0xffffff, 5, 40, 10 );
    // rectLight1.position.set( 0, 6, 0 );
    // rectLight1.lookAt(0,0,0);
    // scene.add( rectLight1 );
    // scene.add( new RectAreaLightHelper( rectLight1 ) );

    //set the floor up
    let floorText = new THREE.TextureLoader(manager).load("./img/concrete5.jpg");
    floorText.wrapS = THREE.RepeatWrapping;
    floorText.wrapT = THREE.RepeatWrapping;
    floorText.repeat.set(14, 7);

    //Phong is for shiny surfaces
    let floorMaterial = new THREE.MeshLambertMaterial({ map: floorText });
    let floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 60), floorMaterial);
    floor.receiveShadow = true;
    floor.rotation.x = Math.PI / 2;
    floor.rotation.y = Math.PI;
    floor.position.set(30, 0, 20);
    floor.receiveShadow = true;
    scene.add(floor);


    // scene.add(floorDark);
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
    let wall1 = new THREE.Mesh(new THREE.BoxGeometry(80, 7, 0.001), hallway_material);
    let wall2 = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 0.001), hallway_material);
    let wall3 = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 0.001), material);
    let wall4_1 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_2 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_3 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_4 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_5 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);
    let wall4_6 = new THREE.Mesh(new THREE.BoxGeometry(5, 7, 1), hallway_material);


    hallwayGroup.add(wall1, wall2, wall3, wall4_1, wall4_2, wall4_3, wall4_4, wall4_5, wall4_6);
    drawables.push(wall1, wall2, wall3, wall4_1, wall4_2, wall4_3, wall4_4, wall4_5, wall4_6);
    obstacles.push(wall1, wall2, wall3, wall4_1, wall4_2, wall4_3, wall4_4, wall4_5, wall4_6)
    // wingGroup.add(wall1, wall2, wall3, wall4, dark1, dark2, dark3, dark4);
    hallwayGroup.position.y = 3.5;

    wall1.position.z = -5;
    wall1.position.x = 20;
    wall1.myNormal = new THREE.Vector3(0, 0, 0.01);
    wall2.position.x = -20;
    wall2.rotation.y = Math.PI / 2;
    wall2.myNormal = new THREE.Vector3(0.01, 0, 0);
    //end window
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

    let beamMaterial = new THREE.MeshPhysicalMaterial({ color: 0x999999, metalness: 0.5, roughness: 0.5 })
    // let beamMaterial = new THREE.MeshPhongMaterial({color:0x555555, shininess:80})
    for (let i = 0; i < 3; i++) {
        let beamVer = new THREE.Mesh(new THREE.BoxGeometry(0.3, 7, 0.2), beamMaterial);
        beamVer.position.set(60, 0, -5+5*i);
        // beam.rotation.x = Math.PI / 2;
        beamVer.rotation.z = Math.PI;
        hallwayGroup.add(beamVer);
        let beamHor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 10, 0.2), beamMaterial);
        beamHor.position.set(60, -3.5+3.5*i, 0);
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

    addWing(50);
    addWing(35);
    addWing(20);
    addWing(5);
    addWing(-10);

    wing_BBox.push(new THREE.Box3(new THREE.Vector3(-15, 0, 5), new THREE.Vector3(-5, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(0, 0, 5), new THREE.Vector3(10, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(15, 0, 5), new THREE.Vector3(25, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(30, 0, 5), new THREE.Vector3(40, 7, 45)));
    wing_BBox.push(new THREE.Box3(new THREE.Vector3(45, 0, 5), new THREE.Vector3(55, 7, 45)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(-20, 0, 45), new THREE.Vector3(-5, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(-5, 0, 45), new THREE.Vector3(10, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(10, 0, 45), new THREE.Vector3(25, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(25, 0, 45), new THREE.Vector3(40, 7, 60)));
    screen_BBox.push(new THREE.Box3(new THREE.Vector3(40, 0, 45), new THREE.Vector3(55, 7, 60)));





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
    let hallwaypedestalMaterial = [
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xf7f7f7 }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
        new THREE.MeshBasicMaterial({ color: 0xffffff }),
    ];

    let pedestal_wing1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), pedestalMaterial);
    // let card = document.createElement('div');
    // card.innerHTML = "<b>Student<br></b><nobr><b><i>Research, &nbsp</i></b>2022</nobr><p>Topic</p>";
    // card.className = 'card show';
    pedestal_wing1.position.set(-10, 0.8, 30);
    pedestal_wing1.receiveShadow = true;
    pedestal_wing1.castShadow = true;

    // let card_obj = new CSS3DObject(card);
    // card_obj.scale.set(0.005, 0.005, 0.005);
    let pedestal1 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal2 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal3 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal4 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    let pedestal5 = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 1), hallwaypedestalMaterial);
    // let pedestal2_2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.8), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    // let pedestal2_3 = new THREE.Mesh(new THREE.BoxGeometry(1, 0.25, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }));
    // card_obj.position.set(-10, 1.1, 29.49)
    // card_obj.rotateY(Math.PI);
    pedestal1.position.set(-12.3, 0.8, 4.4);
    pedestal2.position.set(2.7, 0.8, 4.4);
    pedestal3.position.set(17.7, 0.8, 4.4);
    pedestal4.position.set(32.7, 0.8, 4.4);
    pedestal5.position.set(47.7, 0.8, 4.4);
    pedestal1.name="1";
    pedestal2.name="2";
    pedestal3.name="3";
    pedestal4.name="4";
    pedestal5.name="5";
    // pedestal2_2.position.set(-12.25, 0.85, 4.4);
    // pedestal2_3.position.set(-12.25, 0.225, 4.4);
    for(let i =1; i<=5; i++){
        let interact_instruction = document.createElement('div');
        interact_instruction.innerHTML = "Press & Hold 'E' to Interact" ;
        interact_instruction.className = 'interact_instruction';
        interact_instruction.id = 'interactable'+i;

        let interact_obj = new CSS3DObject(interact_instruction);
        interact_obj.scale.set(0.003, 0.003, 0.003);
        interact_obj.rotateY(Math.PI)
        interact_obj.rotateX(-Math.PI / 2)
        // interact_obj.rotateZ(Math.PI)
        interact_obj.position.set(-12.3+15*(i-1), 1.601, 3.95)
        scene.add(interact_obj)

        let interact_progress = document.createElement('div');
        interact_progress.className = 'interact_progress';
        interact_progress.id = 'progress'+i;

        let progress_obj = new CSS3DObject(interact_progress);
        progress_obj.scale.set(0.05, 0.05, 0.05);
        progress_obj.rotateX(-Math.PI / 2)
        // interact_obj.rotateZ(Math.PI)
        progress_obj.position.set(-12.3+15*(i-1), 1.601, 4.4)
        scene.add(progress_obj)
    }

    scene.add(pedestal_wing1);
    scene.add(pedestal1, pedestal2, pedestal3, pedestal4, pedestal5);

    obstacles.push(pedestal_wing1, pedestal1, pedestal2, pedestal3, pedestal4, pedestal5)
    interactables.push(pedestal1, pedestal2, pedestal3, pedestal4, pedestal5)
    var geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
    cube1 = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x333333 }));
    cube1.position.set(-10, 2.2, 0);
    cube1.name = "music";
    // scene.add(cube1);
    // paintings.push(cube1);
    cube2 = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x333333 }));
    cube2.position.set(10, 2.2, 0);
    cube2.name = "paint";
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

        for(i=0;i<wing_BBox.length;i++){
            if (user.BBox.intersectsBox(wing_BBox[i])){
                location=15*i-10;
                prevLocation=location;
                break;
            }
            else{
                location=null;
            }
        }
        for(i=0;i<screen_BBox.length;i++){
            if (user.BBox.intersectsBox(screen_BBox[i])){
                screen=15*i-10;
                break;
            }
            else{
                screen=null;
            }
        }
        if (location) {
            audio.volume=0.3;
            let showCard = document.querySelectorAll(".card"+location);
            showCard.forEach(s => {
                s.classList.add("show")

            });
            document.querySelector(".sign"+location).classList.add("show");
        }
        else {
            if(screen)
                audio.volume=0;
            else
                audio.volume=1;
            let showCard = document.querySelectorAll(".card"+prevLocation);
            showCard.forEach(s => {
                s.classList.remove("show")

            });
            document.querySelector(".sign"+prevLocation).classList.remove("show");
        }

        if (user.BBox.intersectsBox(travelator.BBox) && choosing == false) {
            travelatorUI.classList.add('show');
            controls.unlock();
            choosing = true;
            ui=true;
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
                if(i==0){
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
        // }
        // if (camera.position.x > 18) {
        //     camera.position.x = 18
        // }

        raycaster.setFromCamera(mouse.clone(), camera);
        let intersects_obj = raycaster.intersectObjects(interactables);
        if(intersects_obj.length!==0){
            if(intersects_obj[0].distance<1.5){
                document.querySelector('#interactable'+intersects_obj[0].object.name).classList.add('show');
                
                if (interacting) {
                    document.querySelector('#progress'+intersects_obj[0].object.name).classList.add('show')
                    progressValue++;
                    // console.log(progressValue);
                    // valueContainer.textContent = `${progressValue}%`;
                    document.querySelector('#progress'+intersects_obj[0].object.name).style.borderImageSource = `conic-gradient(
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
                        if (intersects_obj[0].object.name == "1"){
                            document.querySelector(".container").classList.add("show")
                            controls.unlock();
                            ui=true;
                        }
                        else if (intersects_obj[0].object.name == "2") {
                            music.classList.add('show');
                            controls.unlock();
                            ui=true;
                        }
                        else if (intersects_obj[0].object.name == "3") {
                            paintUI.classList.add('show');
                            controls.unlock();
                            ui=true;
                        }
                        else if (intersects_obj[0].object.name == "portal2")
                            camera.position.set(14, 0, 4.5);
                    }
                }
                else{
                    progressValue = 0;
                    document.querySelector('#progress'+intersects_obj[0].object.name).classList.remove('show')
                }
            }
            else{
                document.querySelector('#interactable'+intersects_obj[0].object.name).classList.remove('show');
            }
            
        }
        else{
            document.querySelectorAll('.interact_instruction').forEach(e => {   
                    e.classList.remove('show');
            });
        }

        //calculate objects interesting ray
        let intersects = raycaster.intersectObjects(paintings);
        if (intersects.length !== 0) {
            // intersects[0].object.material.color.set(0xaaeeee);
            // intersects[0].object.parent.children[0].visible=false;
            // console.log(intersects[0].object.name);
            if (intersects[0].object.parent.name) {
                // console.log(intersects[0].distance);
                // console.log($('#card-'+intersects[0].object.parent.name.substring(4)).innerHTML);

                // interact.style.display = 'block';

                if (interacting) {
                    let target = document.querySelector('#card' + location + '-' + intersects[0].object.parent.name.substring(4));

                    progressValue++;
                    // valueContainer.textContent = `${progressValue}%`;
                    target.style.borderImageSource = `conic-gradient(
                        #ee82ee,
                        #ffff00,
                        #ee82ee
                        ${progressValue * 5}deg,
                        #555555 ${progressValue * 5}deg
                    )`;
                    if (progressValue == progressEndValue) {
                        // valueContainer.textContent = "done";
                        progressValue--;
                        // console.log(document.getElementById(intersects[0].object.parent.name));
                        document.getElementById(intersects[0].object.parent.name).classList.add('show');
                        // blocker.style.display = 'block';
                        controls.unlock();
                    }
                }
            }
            
            else {
                // interact.style.display = 'none'
                progressValue = 0;
                // progressBar.style.borderImageSource = `conic-gradient(
                //     #444444 ${progressValue * 1.2}deg,
                //     #555555 ${progressValue * 1.2}deg
                // )`;
                // valueContainer.textContent = "E";
                
            }

        }


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
    if (drawIntersect.length != 0 && drawIntersect[0].point.z<5.01) {
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