function init() {
    "use strict";
    var scene, camera, renderer, controls, stats, textureLoader, car, wheel, wheels;

    /*global Stats*/
    stats = new Stats(); /*开启性能监视*/
    document.body.appendChild(stats.dom);

    /*global THREE*/

    /*camera
     *THREE.PerspectiveCamera(fov, aspect, near, far)
     */
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(2.41, 0.85, 1.66);
    camera.lookAt(new THREE.Vector3(10, 0, 0));

    /*scene*/
    scene = new THREE.Scene();

    /*car group*/
    car = new THREE.Group();
    wheel = new THREE.Group();

    /*texture*/
    textureLoader = new THREE.TextureLoader(); /*设置贴图*/

    /*car`s body*/
    function createCarBody() {
        var cubeMaterials, i, cube;
        cubeMaterials = [];
        /*multiMaterial for car (right,left,top,bottom,back,front)*/
        for (i = 0; i < 6; i += 1) {
            cubeMaterials.push(new THREE.MeshPhongMaterial({
                color: 0xffffff,
                map: textureLoader.load('img/' + (i + 1) + '.jpg'),
                overdraw: true
            }));
        }

        cube = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 1), new THREE.MultiMaterial(cubeMaterials));
        cube.castShadow = true; /*产生阴影*/
        car.add(cube);
    }
    createCarBody();

    /*wheel*/
    function createWheel() {
        var materialWheel, torusGeometry, textureWheel;
        wheels = [];
        torusGeometry = new THREE.TorusGeometry(0.22, 0.08, 35, 35);
        textureWheel = textureLoader.load('img/wheel.jpg', function (texture) {
            materialWheel = new THREE.MeshPhongMaterial({
                color: 0xffffff,
                map: texture
            });
            var i;
            for (i = 0; i < 4; i += 1) {
                wheels.push(new THREE.Mesh(torusGeometry, materialWheel));
                switch (i) {
                case 0:
                    wheels[i].position.set(0.5, -0.4, 0.47);
                    break;
                case 1:
                    wheels[i].position.set(-0.5, -0.4, 0.47);
                    break;
                case 2:
                    wheels[i].position.set(0.5, -0.4, -0.47);
                    break;
                case 3:
                    wheels[i].position.set(-0.5, -0.4, -0.47);
                    break;
                }
                wheels[i].castShadow = true;
                wheel.add(wheels[i]);
            }
        }).repeat.set(1, 1);

        car.add(wheel);
        scene.add(car);
    }
    createWheel();

    /*plane  */
    function createPlane() {
        var texturePlane;
        /*.load ( url, onLoad, onProgress, onError )*/
        texturePlane = textureLoader.load('img/plane.jpg', function (texture) {
            texturePlane.wrapS = texturePlane.wrapT = THREE.RepeatWrapping; /*指定重复方式*/
            texturePlane.repeat.set(6, 6); /*重复次数*/
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(8, 8, 16, 16), new THREE.MeshPhongMaterial({
                color: 0xffffff,
                map: texture
            }));
            plane.rotation.x = -Math.PI / 2; /*将平面旋转*/
            plane.position.set(-1, -0.7, 1.5); /*调整平面空间位置*/
            plane.receiveShadow = true; /*接受投影*/
            scene.add(plane);
        });
    }

    createPlane();

    /*SpotLight*/
    function createLight() {
        var SpotLight, ambientLight, helper;
        SpotLight = new THREE.SpotLight(0xcccccc, 1, 100, Math.PI / 6, 25);
        SpotLight.position.set(-1, 3.5, 6);
        SpotLight.target = car; /*将灯光目标定为car*/
        SpotLight.castShadow = true; /*开启聚光灯产生阴影*/
        SpotLight.shadow.camera.visible = true;
        SpotLight.shadow.mapSize.width = 2048; /*提高阴影分辨率*/
        SpotLight.shadow.mapSize.height = 2048;
        scene.add(SpotLight);


        /*AmbientLight*/
        ambientLight = new THREE.AmbientLight(0x515151);
        scene.add(ambientLight);

        /*helper*/
        helper = new THREE.CameraHelper(SpotLight.shadow.camera);
        scene.add(helper);
    }
    createLight();

    /*axes*/
    function axesHelper() {
        var axes;
        axes = new THREE.AxisHelper(10);
        scene.add(axes);
    }
    axesHelper();

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight; /*设置camera的视口宽高比*/
        camera.updateProjectionMatrix(); /*更新投影矩阵*/
        renderer.setSize(window.innerWidth, window.innerHeight);
        controls.handleResize();
    }

    window.addEventListener('resize', onWindowResize, false);

    /*renderer*/
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        /*抗锯齿*/
        precision: "highp" /*高精度*/
    });
    /*setSize()  canvas.width = displayWidth*/
    renderer.setSize(window.innerWidth, window.innerHeight); /* 设置canvas宽高和像素*/
    renderer.setClearColor(0x666666);
    renderer.shadowMap.enabled = true; /*开启阴影*/
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; /*开启阴影柔滑*/
    renderer.setPixelRatio(window.devicePixelRatio); /* 防止形变*/
    document.body.appendChild(renderer.domElement);

    /*controls   TrackballControls(obj, domElement)*/
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 3.5; /*旋转速度*/
    controls.zoomSpeed = 3.5; /* 变焦速度*/
    controls.panSpeed = 3.5; /*  平移速度*/
    controls.noZoom = false; /* 开启变焦*/
    controls.noPan = false; /* 开启移动*/
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3; /*动态阻尼系数（灵敏度）*/
    controls.keys = [65, 83, 68]; /*  A-S-D*/

    /*render all*/
    function render() {
        renderer.clear(); /* 清理缓存*/
        renderer.render(scene, camera);
    }

    controls.addEventListener('change', render);

    function animate() {
        /*car.position.x += 0.01;*/
        controls.update(); /* 更新鼠标控制*/
        stats.update(); /* 更新性能监测*/
        render();
        /*global requestAnimationFrame*/
        requestAnimationFrame(animate); /* 递归*/
    }
    animate();
    /*keycode   87- W   65 - A  83 - S  68 - D*/
    function driveCar(ev) {
        var i, key;
        key = ev.keyCode;

        function rotation(sign) {
            if (wheels.length) {
                for (i = 0; i < wheels.length; i += 1) {
                    if (sign) {
                        wheels[i].rotation.z += 0.05;
                    } else {
                        wheels[i].rotation.z -= 0.05;
                    }

                }
            }
        }

        function turnL() {
            wheels[0].rotation.z -= 0.05;
            car.rotation.y += 0.15;
        }

        function turnR() {
            wheels[1].rotation.z -= 0.05;
            car.rotation.y -= 0.15;
        }

        function forward() {
            car.position.x -= 0.15;
            rotation(1);
        }

        function back() {
            rotation(0);
            car.position.x += 0.15;
        }

        switch (key) {
        case 65:
            /*turn left*/
            turnL();
            break;
        case 68:
            /*turn right*/
            turnR();
            break;
        case 83:
            /*go forward*/
            forward();
            break;
        case 87:
            /*go back*/
            back();
            break;
        }
    }
    document.addEventListener('keydown', function (event) {
        driveCar(event);
    });
}
init();