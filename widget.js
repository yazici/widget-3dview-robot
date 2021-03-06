/* global requirejs cprequire cpdefine chilipeppr THREE */
// Defining the globals above helps Cloud9 not show warnings for those variables

// ChiliPeppr Widget/Element Javascript

// Predefine THREE so eval doesn't fail
var THREE = {
    TrackballControls: {},
    TransformControls: {},
    OrbitControls: {}
};

requirejs.config({
    paths: {
        //Three: '//i2dcui.appspot.com/geturl?url=http://threejs.org/build/three.min.js',
        // Keep in mind that the /slingshot url does the same as /geturl but it is not cached
        // Three: '//i2dcui.appspot.com/slingshot?url=http://threejs.org/build/three.min.js',
        // Three: '//i2dcui.appspot.com/geturl?url=http://threejs.org/build/three.js',
        Three: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/102/three',
        ThreeTextGeometry: '//i2dcui.appspot.com/js/three/TextGeometry',
        ThreeFontUtils: '//i2dcui.appspot.com/js/three/FontUtils',
        ThreeDetector: '//i2dcui.appspot.com/geturl?url=https://threejs.org/examples/js/WebGL.js',
        //ThreeTrackballControls: '//i2dcui.appspot.com/geturl?url=http://threejs.org/examples/js/controls/TrackballControls.js',
        // Latest release
        // ThreeTrackballControls: '//i2dcui.appspot.com/slingshot?url=http://threejs.org/examples/js/controls/TrackballControls.js',
        // r79 (to solve that mousewheel zoom started not working in r80, so had to force to older version. eventually they'll fix the bug cuz i filed it)
        // ThreeTrackballControls: '//i2dcui.appspot.com/slingshot?url=http://rawgit.com/mrdoob/three.js/r79/examples/js/controls/TrackballControls.js',
        ThreeTrackballControls: '//i2dcui.appspot.com/geturl?url=https://rawgit.com/mrdoob/three.js/r102/examples/js/controls/TrackballControls.js',
        ThreeOrbitControls: '//threejs.org/examples/js/controls/OrbitControls',
        ThreeHelvetiker: '//i2dcui.appspot.com/js/three/threehelvetiker',
        ThreeTypeface: 'https://superi.googlecode.com/svn-history/r1953/trunk/MBrand/MBrand/Scripts/typeface-0.15',
        ThreeTween: '//i2dcui.appspot.com/js/three/tween.min',
        ThreeBufferGeometryUtils: '//i2dcui.appspot.com/js/three/BufferGeometryUtils',
        ThreeCanvasRenderer: '//i2dcui.appspot.com/geturl?url=http://threejs.org/examples/js/renderers/CanvasRenderer.js',
        ThreeProjector: '//i2dcui.appspot.com/geturl?url=http://threejs.org/examples/js/renderers/Projector.js',
    },
    shim: {
        ThreeTextGeometry: ['Three'],
        ThreeFontUtils: ['Three', 'ThreeTextGeometry'],
        ThreeHelvetiker: ['Three', 'ThreeTextGeometry', 'ThreeFontUtils'],
        //ThreeHelvetiker: ['Three', 'ThreeTextGeometry'],
        ThreeTrackballControls: ['Three'],
        // ThreeDetector: ['Three'],
        // ThreeTween: ['Three'],
        // ThreeSparks: ['Three'],
        // ThreeParticle: ['Three'],
        // ThreeBufferGeometryUtils: ['Three'],
        // ThreeCanvasRenderer: ['Three', 'ThreeProjector'],
        // ThreeProjector: ['Three']
    }
});

cprequire_test(['inline:com-chilipeppr-widget-3dview-robot'], function (mywidget) {

    // Test this element. This code is auto-removed by the chilipeppr.load()
    // when using this widget in production. So use the cpquire_test to do things
    // you only want to have happen during testing, like loading other widgets or
    // doing unit tests. Don't remove end_test at the end or auto-remove will fail.

    console.log("Running 3dview-robot");
    
    // set my title while in test mode so it's pretty
    $('title').html(mywidget.name);
    
    // actually finally init me
    mywidget.init({doMyOwnDragDrop: true});
    
    console.log("3d viewer robot initted");
} /*end_test*/ );


cpdefine('inline:com-chilipeppr-widget-3dview-robot', ['chilipeppr_ready', 'Three'], function (cp, Three) {
    
    // console.log("global:", global);
    // var tmpThree = THREE;
    // Define some fake values so the eval during runme.js doesn't fail
    if (Three === undefined) {
        Three = {
            EventDispatcher: function(){},
            Object3D: function(){},
            Mesh: function(){},
        };
    }
    THREE = Three;

    console.log("THREE:", THREE);

    loadTrackballControls();
    // console.log("THREE.TrackballControls:", THREE.TrackballControls);
    // console.log("WEBGL:", WEBGL);

    return {


        id: 'com-chilipeppr-widget-3dview-robot',
        name: "Widget / 3D Robot Viewer",
        desc: "Visualize your robot arm in 3D.",
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        publish: {
            '/recv3dObject' : "When you send a /request3dObject you will receive a signal back of /recv3dObject. This signal has a payload of the THREE.js user object being shown in the 3D viewer.",
            '/recvUnits' : 'When you send a /requestUnits you will receive back this signal with a payload of "mm" or "inch" as a string. Please also see /unitsChanged in case you want to know whenever units are changed from a file open event. You can request what units the Gcode are in from the 3D Viewer. Since the 3D Viewer parses Gcode, it can determine the units. The 3D Viewer is mostly unit agnostic, however to draw the toolhead, grid, and extents labels it does need to know the units to draw the decorations in a somewhat appropriate size.',
            '/unitsChanged' : 'This signal is published when the user loads a new file into the 3D viewer and the units change. If other widgets need to know what units are being used, you should subscribe to this signal to be notified on demand.',
            '/sceneReloaded' : "This signal is sent when the scene has been (re)load because the user dragged / dropped. The payload indicates the global bounding box of the scene. This signal is similar to listening to /com-chilipeppr-elem-dragdrop/ondropped however, /sceneReloaded is guaranteed to fire every time the 3D viewer loads a new file into the viewer. Credit for this signal goes to Dat Chu who created it for his GrblLaser workspace."
            
        },
        subscribe: {
            '/gotoline': "This widget subscribes to this channel so other widgets can move the toolhead and highlight the Gcode line being worked on. This would mostly be when sending Gcode from a Gcode viewer/sender widget, that widget can have the 3D view follow along. Just the line number should be sent as the 3D viewer has it's own cache of the Gcode data loaded.",
            '/resize' : "You can ask this widget to resize itself. It will resize the rendering area to the region it is bound to (typically the window width/height).",
            '/sceneadd' : "You can send Threejs objects to this widget and they will be added to the scene. You must send true THREE.Line() or other ThreeJS objects in that are added as scene.add() objects.",
            '/sceneremove' : "You can also remove objects from the 3D scene. This is the opposite of /sceneadd",
            '/sceneclear' : "This resets the 3D viewer and clears the scene. It keeps the axes, toolhead, and grid. The user object and extents is removed.",
            '/drawextents' : "This asks the 3D viewer to draw the extents of what it is showing.",
            '/viewextents' : "This asks the 3D viewer to place the entire 3D object set in the view window from a front facing position. It is the equivalent of the button with the \"eye\" icon in the toolbar.",
            '/setunits' : "Pass in a string of \"mm\" or \"inch\" to set the units for the 3D Viewer.",
            '/wakeanimate' : "The 3d viewer sleeps the rendering after 5 seconds. So if you are going to do any updates to the 3D scene you should wake the animation before your update. It will timeout on its own so you don't have to worry about it. /sceneadd and /sceneremove do their own waking so you don't need to ask for it on those.",
            '/request3dObject' : "You can request the parent-most object that is showing in the 3D viewer. This is a THREE.js object that is generated by the 3D viewer. It contains all user elements shown in the scene. It does not contain the XYZ axis, toolhead, or other system elements. When you send this signal you will receive a publish back on /recv3dObject",
            '/requestUnits' : 'Send in this signal and you will be sent back a /recvUnits with a payload of "mm" or "inch" as a string. Please also see /unitsChanged in case you want to know whenever units are changed from a file open event. You can request what units the Gcode are in from the 3D Viewer. Since the 3D Viewer parses Gcode, it can determine the units. The 3D Viewer is mostly unit agnostic, however to draw the toolhead, grid, and extents labels it does need to know the units to draw the decorations in a somewhat appropriate size.'
        },
        foreignSubscribe: {
            "/com-chilipeppr-interface-cnccontroller/axes" : "If we see this signal come in, we move the toolhead to the xyz position in the payload of the signal.",
            "/com-chilipeppr-elem-dragdrop/ondropped" : "When a user drags and drops a file to the main window, we want to get notified so we can load it into the 3D viewer. During development mode in JSFiddle, this widget loads it's own com-chilipeppr-elem-dragdrop so you can test development, but when this widget is loaded in a full ChiliPeppr app it uses the global com-chilipeppr-elem-dragdrop."
        },
        foreignPublish: {
        },
        scene: null,
        object: null,
        camera: null,
        controls: null,
        toolhead: null,
        tween: null,
        tweenHighlight: null,
        tweenIndex: null,
        tweenSpeed: 1,
        tweenPaused: false,
        tweenIsPlaying: false,
        wantAnimate: true, // we automatically timeout rendering to save on cpu
        initOptions: {},
        init: function (initOptions) {
            this.initOptions = initOptions;
            var that = this;

            // Drop files from desktop onto main page to import them.
            // We also can subscribe to the main chilipeppr drag/drop
            // pubsub to get drop events from a parent, rather than doing
            // this on our own
            
            // subscribe to file load events
            chilipeppr.subscribe("/com-chilipeppr-elem-dragdrop/ondropped", this, this.onPubSubFileLoaded);
            
            if (this.initOptions && this.initOptions.doMyOwnDragDrop) {
                console.log("Doing my own drag drop for 3D viewer cuz asked to. Attaching to body tag in DOM.");
                $('body').on('dragover', function (event) {
                    event.stopPropagation();
                    event.preventDefault();
                    event.originalEvent.dataTransfer.dropEffect = 'copy'
                }).on('drop', function (event) {
                    console.log("got drop:", event);
                    event.stopPropagation();
                    event.preventDefault();
                    var files = event.originalEvent.dataTransfer.files;
                    if (files.length > 0) {
                        var reader = new FileReader();
                        reader.onload = function () {
                            console.log("opening file. reader:", reader);
                            console.log ("stringify", JSON.stringify(reader.result, null, 2) );
                            that.openGCodeFromText(reader.result);
                        };
                        reader.readAsText(files[0]);
                        // reader.readAsArrayBuffer(files[0]);
                    }
                });
            }
            
            that.scene = that.createScene($('#com-chilipeppr-widget-3dview-robot-renderArea'));
            // that.openGCodeFromText("G0 X1\nG1 X2");

            /*
            var lastImported = localStorage.getItem('last-imported');
            var lastLoaded = localStorage.getItem('last-loaded');
            if (lastImported) {
                that.openGCodeFromText(lastImported);
            } else {
                //console.log("would have opened octocat");
                //that.openGCodeFromPath(lastLoaded || 'examples/octocat.gcode');
                console.log("loading chilipeppr logo");
                that.openGCodeFromPath(lastLoaded || 'http://www.chilipeppr.com/3d/chilipepprlogo.nc');
            }
            */
            
            var lastFpsRate = localStorage.getItem ('fpsRate');
            if (lastFpsRate) {
                console.log("got prior FPS Rate, setting it now:  ", lastFpsRate, "//rk");
                //this.setFrameRate(parseInt(lastFpsRate) );
                var fr = parseInt(lastFpsRate);
                this.setFrameRate(fr);
                // set css to show selected
                $('.com-chilipeppr-widget-3dview-robot-settings-fr').removeClass('alert-info');
                $('.com-chilipeppr-widget-3dview-robot-settings-fr-' + fr).addClass('alert-info');
            }

            // setup toolbar buttons
            this.btnSetup();
            
            this.forkSetup();
            //this.setDetails("blah");
            
            // subscribe to gotoline signal so we can move toolhead to correct location
            // to sync with the gcode sender
            chilipeppr.subscribe('/' + this.id + '/gotoline', this, this.gotoLine);

            // subscribe to gotoline signal so we can move toolhead to correct location
            // to sync with the actual milling machine
            chilipeppr.subscribe('/com-chilipeppr-interface-cnccontroller/axes', this, this.gotoXyz);
            
            // we can be asked to resize ourself by a publish call to this signal
            chilipeppr.subscribe('/' + this.id + '/resize', this, this.resize);
            
            // requestUnits, recvUnits
            chilipeppr.subscribe("/" + this.id + "/requestUnits", this, this.requestUnits);
            
            // setup more pubsub to allow other widgets to inject objects to our scene
            this.setupScenePubSub();
            
            this.setupGridSizeMenu();
            
            this.setupCogMenu();
            this.setupFpsMenu();
            // this.initJog(); //this.setupJog();
            // this.initInspect();
            
            that.openRobot();

            // hide the pan/zoom/orbit msg after 1 minute
            setTimeout(function() {
                console.log("hiding pan/zoom/orbit msg");
                $('.com-chilipeppr-widget-3dview-robot-panzoom-indicator').fadeOut("slow"); //addClass("hidden");
            }, 60 * 1000);
            
        },
        setupScenePubSub: function() {
            // these pubsubs let others add objects to our 3d scene
            chilipeppr.subscribe("/" + this.id + "/wakeanimate", this, this.wakeAnimate);
            chilipeppr.subscribe("/" + this.id + "/sceneadd", this, this.sceneAdd);
            chilipeppr.subscribe("/" + this.id + "/sceneremove", this, this.sceneRemove);
            chilipeppr.subscribe("/" + this.id + "/sceneclear", this, this.sceneClear);
            chilipeppr.subscribe("/" + this.id + "/drawextents", this, this.drawAxesToolAndExtents);
            chilipeppr.subscribe("/" + this.id + "/viewextents", this, this.viewExtents);
            chilipeppr.subscribe("/" + this.id + "/setunits", this, this.setUnits);
            
            chilipeppr.subscribe("/" + this.id + "/request3dObject", this, this.request3dObject);
        },
        onSignalSceneReloadedFailAttempts: 0, // track failed nulls
        onSignalSceneReloaded: function () {
            // this can get called before there is userData, so check for that
            // and if so, wait to publish until there is
            if (this.object && this.object.userData && this.object.userData.bbbox2) {
                console.log("publishing /sceneReloaded. It took us X attempts:", this.onSignalSceneReloadedFailAttempts);
                chilipeppr.publish("/" + this.id + "/sceneReloaded", this.object.userData.bbbox2);
                this.onSignalSceneReloadedFailAttempts = 0;
            } else {
                // call ourselves again in 2 seconds
                if (this.onSignalSceneReloadedFailAttempts >= 5) {
                    // give up
                    console.log("tried 5 times onSignalSceneReloadedFailAttempts. giving up.");
                    this.onSignalSceneReloadedFailAttempts = 0;
                } else {
                    this.onSignalSceneReloadedFailAttempts++;
                    setTimeout(this.onSignalSceneReloaded.bind(this), 2000);
                }
            }
        },
        showShadow: false,
        setupCogMenu: function() {
            $('.com-chilipeppr-widget-3dview-robot-settings-shadows').click( this.onToggleShadowClick.bind(this));
        },
        onToggleShadowClick: function(evt, param) {
            console.log("got onToggleShadowClick. evt:", evt, "param:", param);
            this.showShadow = !this.showShadow; // toggle
            this.drawToolhead();
        },
        setupFpsMenu: function() {
            $('.com-chilipeppr-widget-3dview-robot-settings-fr-5').click(5, this.onFpsClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-settings-fr-10').click(10, this.onFpsClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-settings-fr-15').click(15, this.onFpsClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-settings-fr-30').click(30, this.onFpsClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-settings-fr-60').click(60, this.onFpsClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-settings-fr-0').click(0, this.onFpsClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-settings-fr--5').click(-5, this.onFpsClick.bind(this));
        },
        onFpsClick: function(evt, param) {
            console.log("got onFpsClick. evt:", evt, "param:", param);
            var fr = evt.data;
            this.setFrameRate(fr);
            // set css to show selected
            $('.com-chilipeppr-widget-3dview-robot-settings-fr').removeClass('alert-info');
            $('.com-chilipeppr-widget-3dview-robot-settings-fr-' + fr).addClass('alert-info');
            this.wakeAnimate();
        },
        gridSize: 1, // global property for size of grid. default to 1 (shapeoko rough size)
        setupGridSizeMenu: function() {
            $('.com-chilipeppr-widget-3dview-robot-gridsizing-1x').click(1, this.onGridSizeClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-gridsizing-2x').click(2, this.onGridSizeClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-gridsizing-5x').click(5, this.onGridSizeClick.bind(this));
            $('.com-chilipeppr-widget-3dview-robot-gridsizing-10x').click(10, this.onGridSizeClick.bind(this));
        },
        onGridSizeClick: function(evt, param) {
            console.log("got onGridSizeClick. evt:", evt, "param:", param);
            
            // remove old css
            $('.com-chilipeppr-widget-3dview-robot-gridsizing-' + this.gridSize + 'x').removeClass("alert-info");
            
            var size = evt.data;
            this.gridSize = size;
            // redraw grid
            this.drawGrid();
            
            $('.com-chilipeppr-widget-3dview-robot-gridsizing-' + this.gridSize + 'x').addClass("alert-info");
            
        },
        setUnits: function(units) {
            if (units == "mm")
                this.isUnitsMm = true;
            else
                this.isUnitsMm = false;
            this.onUnitsChanged();
        },
        requestUnits: function() {
            console.log("requestUnits");
            // we need to publish back the units
            var units = "mm";
            if (!this.isUnitsMm) units = "inch";
            chilipeppr.publish("/" + this.id + "/recvUnits", units);
        },
        onUnitsChanged: function() {
            //console.log("onUnitsChanged");
            // we need to publish back the units
            var units = "mm";
            if (!this.isUnitsMm) units = "inch";
            chilipeppr.publish("/" + this.id + "/unitsChanged", units);
            $('.com-chilipeppr-widget-3dview-robot-units-indicator').text(units);
        },
        request3dObject: function() {
            console.log("request3dObject");
            // we need to publish back the object
            chilipeppr.publish("/" + this.id + "/recv3dObject", this.object, {'scene': this.scene, 'camera': this.camera, 'toolhead': this.toolhead, 'widget': this });
        },
        sceneAdd: function(obj) {
            console.log("sceneAdd. obj:", obj);
            this.wakeAnimate();
            this.scene.add(obj);
        },
        sceneRemove: function(obj) {
            console.log("sceneRemove. obj:", obj);
            this.wakeAnimate();
            if (obj && 'traverse' in obj) {
                this.scene.remove(obj);
                obj.traverse( function ( child ) {
                    if (child.geometry !== undefined) {
                        child.geometry.dispose();
                        child.material.dispose();
                    }
                } );
            }
        },
        sceneClear: function() {
            this.stopSampleRun();
            this.wakeAnimate();
            //this.scene.remove(this.object);
            this.object.children = [];
            this.sceneRemove(this.decorate);
        },
        btnSetup: function() {
            
            // attach button bar features
            var that = this;
            this.isLookAtToolHeadMode = true;
            $('.com-chilipeppr-widget-3d-menu-lookattoolhead').click(function () {
                if (that.isLookAtToolHeadMode) {
                    // turn off looking at toolhead
                    that.isLookAtToolHeadMode = false;
                    $('.com-chilipeppr-widget-3d-menu-lookattoolhead').removeClass("active btn-primary");
                } else {
                    // turn on looking at toolhead
                    that.isLookAtToolHeadMode = true;
                    that.lookAtToolHead();
                    $('.com-chilipeppr-widget-3d-menu-lookattoolhead').addClass("active btn-primary");
                }                    
            });
            $('.com-chilipeppr-widget-3d-menu-viewextents').click(function () {
                that.viewExtents()
            });
            $('.com-chilipeppr-widget-3d-menu-samplerun').click(function () {
                that.playSampleRun()
            });
            $('.com-chilipeppr-widget-3d-menu-samplerunstop').click(function () {
                that.stopSampleRun()
            });
            $('.com-chilipeppr-widget-3d-menu-samplerunspeed').click(function () {
                that.speedUp()
            });
            $('.com-chilipeppr-widget-3d-menu-samplerunpause').click(function () {
                that.pauseSampleRun()
            }).prop('disabled', true);
            $('.com-chilipeppr-widget-3d-menu-samplerunstop').prop('disabled', true);
            $('.btn').popover({
                animation: true,
                placement: "auto",
                trigger: "hover"
            });
        },
        forkSetup: function () {
            //$('#com-chilipeppr-widget-3dview-robot .fork').prop('href', this.fiddleurl);
            //$('#com-chilipeppr-widget-3dview-robot .standalone').prop('href', this.url);
            //var t = $('#com-chilipeppr-widget-3dview-robot .fork-name');
            //t.html(this.id);
            $('#com-chilipeppr-widget-3dview-robot .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true
            });
            
            // load the pubsub viewer / fork element which decorates our upper right pulldown
            // menu with the ability to see the pubsubs from this widget and the forking links
            var that = this;
            chilipeppr.load(
                "http://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html", 
                // "http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/", 
                function () {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function (pubsubviewer) {
                    pubsubviewer.attachTo($('#com-chilipeppr-widget-3dview-robot-dropdown'), that);
                });
            });

            //console.log("title in menu", t);
        },
        onPubSubFileLoaded: function(txt) {
            this.openGCodeFromText(txt);
        },
        error: function (msg) {
            alert(msg);
        },
        loadFile: function (path, callback /* function(contents) */ ) {
            var that = this;
            
          // rewrite www.chilipeppr.com url's to i2dcui.appspot.com so we support SSL
          path = path.replace(/http\:\/\/www.chilipeppr.com/i, "//i2dcui.appspot.com");
          path = path.replace(/http\:\/\/chilipeppr.com/i, "//i2dcui.appspot.com");
          path = path.replace(/\/\/www.chilipeppr.com/i, "//i2dcui.appspot.com");
          path = path.replace(/\/\/chilipeppr.com/i, "//i2dcui.appspot.com");

            $.get(path, null, callback, 'text')
                .error(function () {
                that.error()
            });
        },
        setDetails: function(txt) {
            $('#com-chilipeppr-widget-3dview-robot-renderArea .data-details').text(txt);
        },
        speedUp: function () {
            //var txt = $('.com-chilipeppr-widget-3d-menu-samplerunspeed').text();
            console.log("speedUp. tweenSpeed:", this.tweenSpeed);
            //var s = this.tweenSpeed;
            this.tweenSpeed = this.tweenSpeed * 10;
            if (this.tweenSpeed > 1024) this.tweenSpeed = 1;
            var txt = "x" + this.tweenSpeed;
            $('.com-chilipeppr-widget-3d-menu-samplerunspeed').text(txt);
        },

        openRobot: function() {
            this.isUnitsMm = true;
            this.wakeAnimate();
            // this.drawToolhead();
            this.drawGrid();
            // this.drawExtentsLabels();
            this.drawAxes();
            this.setDetails("Robot Arm Loaded");

            var loader = new THREE.FileLoader();
            var that = this;
			// loader.load( 'scene.json', function ( text ) {
            loader.load( 'https://raw.githubusercontent.com/chilipeppr/widget-3dview-robot/master/scene.json', function ( text ) {

                var json = JSON.parse(text);
                console.log("json:", json);
                var loader = new THREE.ObjectLoader();
                var sceneRobot = loader.parse( json );
                that.object = sceneRobot;

                // rotate by 90 degrees to make it straight
                // that.object.rotation.x = Math.PI / -2;
                that.object.position.z = -150;
                that.object.position.y = -150;
                that.object.castShadow = true;
                that.object.receiveShadow = true;
                that.scene.add(that.object);

                // now draw a ground
                var groundGeometry = new THREE.BoxBufferGeometry( 1000, 1000, 0.1 );
				var groundMaterial = new THREE.MeshLambertMaterial( { color: 'rgb(80,80,80)' } ); //, opacity: 0.1, transparent: true } );
				groundMesh = new THREE.Mesh( groundGeometry, groundMaterial );
				groundMesh.position.z = -80.1; //this value must be slightly lower than the planeConstant (0.01) parameter above
                groundMesh.receiveShadow = true;
                that.object.add( groundMesh );

                // Add a shadow casting light
                //Create a PointLight and turn on shadows for the light
                var light = new THREE.PointLight( 0xffffff, 0.1, 0, 2 );
                light.position.set( -500, 100, 800 );
                light.castShadow = true;            // default false
                // light.shadowDarkness = 0.1;
                light.shadow.radius = 18;
                light.target = this.object;
                // light.target.updateMatrixWorld()
                that.scene.add( light );

                //Set up shadow properties for the light
                light.shadow.mapSize.width = 512 * 4;  // default
                light.shadow.mapSize.height = 512 * 4; // default
                light.shadow.camera.near = 10;       // default
                light.shadow.camera.far = 1600      // default
                // light.shadow.camera.lookAt(0,0,0);
                // that.scene.add(light);

                // Add ambient light to lighten up the shadow
                that.scene.add( new THREE.AmbientLight( 0xffffff, 0.6 ) );

                //Create a helper for the shadow camera (optional)
                // var helper = new THREE.CameraHelper( light.shadow.camera );
                // that.scene.add( helper );

                // Make every part of the STL robot object cast a shadow
                that.object.getObjectByName('Basecone.stl').traverse( function ( child ) {
                    if ( child instanceof THREE.Mesh ) {
                        // child.material.map = texture;
                        child.castShadow = true; 
                        // child.material.transparent = true;
                        // child.material.opacity = 0.5;          
                    }
                } );

                // attach rotate control
                // console.log("rotate object:", that.object);

                // var object = that.scene.getObjectByName( "Ring48_20pOriginBelowObject.stl", true );
                // that.controls.attach( object );
                // that.controls.setMode( "rotate" );
                // that.controls.showX = false;
                // that.controls.showY = false;
                // that.controls.setSize( that.controls.size - 0.5 );

                
                // var object = that.scene.getObjectByName( "UpperArm.stl", true );
                // console.log("object to attach rotate to:", object);
                // that.controls.attach( object );
                // that.controls.setMode( "rotate" );
                // that.controls.showY = false;
                // that.controls.showZ = false;
                // that.controls.setSize( that.controls.size - 0.7 );
                
                // Setup raycaster for selection of parts of robot arm
                that.raycaster = new THREE.Raycaster();
                that.mouse = new THREE.Vector2();

                window.addEventListener( 'mousemove', that.onMouseMove.bind(that), false );
                window.addEventListener( 'mousedown', that.onMouseDown.bind(that), false );
                // window.addEventListener( 'mouseup', that.onMouseUp.bind(that), false );
                that.controls.addEventListener( 'dragging-changed', that.onTransformControlDragChanged.bind(that) );

                // Zoom to Mouse position
                that.orbit.enableZoom = false;

                // so that left/right keyboard keys wake up the animation
                $('body').on('keydown', that.wakeAnimate.bind(that));

                $('body').on('mousewheel', function (e){

                    that.wakeAnimate();

                    var factor = 20;
                    var mX = ( event.clientX / window.innerWidth ) * 2 - 1;
                    var mY = - ( event.clientY / window.innerHeight ) * 2 + 1;
                    var vector = new THREE.Vector3(mX, mY, 1 );
                    vector.unproject(that.camera);
                    vector.sub(that.camera.position);
                    if ( e.originalEvent.deltaY < 0 ) {
                        that.camera.position.addVectors(that.camera.position,vector.setLength(factor));
                        that.orbit.target.addVectors(that.orbit.target,vector.setLength(factor));
                    } else {
                        that.camera.position.subVectors(that.camera.position,vector.setLength(factor));
                        that.orbit.target.subVectors(that.orbit.target,vector.setLength(factor));
                    }

                    // var WIDTH = window.innerWidth;
                    // var HEIGHT = window.innerHeight;
            
                    // var mouseX = (e.clientX - (WIDTH/2)) * 10;
                    // var mouseY = (e.clientY - (HEIGHT/2)) * 10;

                    // if(e.originalEvent.deltaY < 0){ // zoom to the front
                    //     that.camera.position.x -= mouseX * .00125;
                    //     that.camera.position.y += mouseY * .00125;
                    //     that.camera.position.z += 1.1 * 10;
                    //     that.orbit.target.x -= mouseX * .00125;
                    //     that.orbit.target.y += mouseY * .00125;
                    //     that.orbit.target.z += 1.1 * 10;
                    // }else{                          // zoom to the back
                    //     that.camera.position.x += mouseX * .00125;
                    //     that.camera.position.y -= mouseY * .00125;
                    //     that.camera.position.z -= 1.1 * 10;
                    //     that.orbit.target.x += mouseX * .00125;
                    //     that.orbit.target.y -= mouseY * .00125;
                    //     that.orbit.target.z -= 1.1 * 10;
                    // }
                });

                // that.sceneAdd(sceneRobot);
                console.log("sceneRobot:", sceneRobot);
                // that.viewExtents();

			} );
             
            this.wakeAnimate();
        },
        onTransformControlDragChanged: function(event) {
            // this.isIgnoreMouseDown = true;
            // console.log("onTransformControlDragChanged. event:", event);
            // don't raycast while in the middle of dragging
            if (event.value) {
                // we started our drag on the rotation widget
                this.ignoreRaycasting = true;
                this.setNoRobotOpacity();
            } else {
                this.ignoreRaycasting = false;
            }
        },
        // isIgnoreMouseDown: false,
        onMouseDown: function( event ) {
            
            // we need to wakeup the animation on mousemove
            this.wakeAnimate();

            if (this.ignoreRaycasting) return;

            console.log("onMouseDown. event:", event);

            // update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera( this.mouse, this.camera );

            // calculate objects intersecting the picking ray
            // check the Basecone and all descendents, thus true in 2nd param
            var intersects = this.raycaster.intersectObject( this.object.getObjectByName('Basecone.stl'), true );
            console.log("did raycaster. intersects:", intersects);

            // don't redo the opacity or rotate attach if we are on the same
            // object
            if (intersects.length > 0 ) {

                // console.log("raycast obj:", intersects[0], "objToRotate:", intersects[0].object.userData.objToRotate);
            
                // just look at first item

                // set the rotate item
                console.log("isClick setting rotate widget");
                var objToRotate = this.object.getObjectByName(intersects[0].object.userData.objToRotate, true);
                // console.log("objToRotate:", intersects[0].object.userData.objToRotate, objToRotate);
                // this.controls.detach();
                this.controls.attach( objToRotate );
                this.controls.setMode( "rotate" );
                this.controls.setSpace("local");
                this.controls.showX = objToRotate.userData.showX;
                this.controls.showY = objToRotate.userData.showY;
                this.controls.showZ = objToRotate.userData.showZ;
                // this.controls.setSize( this.controls.size - 0.5 );
                this.controls.setSize( 0.3 );

                // set some quick material to indicate mouse clicked
                
            } else {
                this.controls.detach();
            }
        },
        onMouseUp: function( event ) {

        },
        onMouseMove: function( event ) {

            // we need to wakeup the animation on mousemove
            this.wakeAnimate();

            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
            this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        },
        lastIntersectSecNum: null,
        ignoreRaycasting: false,
        checkRaycast: function() {

            if (this.ignoreRaycasting) return;

            // update the picking ray with the camera and mouse position
            this.raycaster.setFromCamera( this.mouse, this.camera );

            // calculate objects intersecting the picking ray
            // check the Basecone and all descendents, thus true in 2nd param
            var intersects = this.raycaster.intersectObject( this.object.getObjectByName('Basecone.stl'), true );
            // console.log("did raycaster. intersects:", intersects);

            // don't redo the opacity or rotate attach if we are on the same
            // object
            if (intersects.length > 0 ) {

                if (this.lastIntersectSecNum != intersects[0].object.userData.secNum) {
                    // record that we're setting up this item so we can ignore next time
                    this.lastIntersectSecNum = intersects[0].object.userData.secNum;

                    // console.log("raycast obj:", intersects[0], "objToRotate:", intersects[0].object.userData.objToRotate);
                
                    // just look at first item

                    this.setAllRobotOpacity(0.5);
                    // take its userData of "secNum" which was set in the three.js editor
                    // and make all objects with that "secNum" be opacity = 1
                    this.setOpacityForAllWithUserdata("secNum", intersects[0].object.userData.secNum);

                    // for ( var i = 0; i < intersects.length; i++ ) {
                    //     intersects[ i ].object.material.opacity = 1; //.color.set( 0xff0000 );
                    // }
                }

            } else {
                // we had no intersects
                // set everything to no opacity
                // console.log("no intersect");
                this.setNoRobotOpacity();
            }
        },
        setOpacityForAllWithUserdata(key, val) {
            this.object.getObjectByName('Basecone.stl').traverse( function ( child ) {
                if ( child instanceof THREE.Mesh && child.userData[key] == val) {
                    child.material.opacity = 1; 
                    child.material.transparent = false;         
                }
            } );
        },
        setAllRobotOpacity: function(opacity) {
            if (!opacity) opacity = 0.5;
            this.object.getObjectByName('Basecone.stl').traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material.opacity = opacity;
                    child.material.transparent = true;          
                }
            } );
        },
        setNoRobotOpacity: function(opacity) {
            if (!opacity) opacity = 1;
            this.object.getObjectByName('Basecone.stl').traverse( function ( child ) {
                if ( child instanceof THREE.Mesh ) {
                    child.material.opacity = opacity;
                    child.material.transparent = false;          
                }
            } );
        },
        openGCodeFromPath: function (path) {
            var that = this;
            //$('#openModal').modal('hide');
            if (that.object) {
                //TWEEN.removeAll();
                this.stopSampleRun();
                that.scene.remove(that.object);
                //that.scene.remove(that.decorate);
            }
            that.loadFile(path, function (gcode) {
                that.object = that.createObjectFromGCode(gcode);
                that.scene.add(that.object);
                that.viewExtents();
                //that.decorateExtents();
                that.drawAxesToolAndExtents();
                that.onUnitsChanged();
                localStorage.setItem('last-loaded', path);
                localStorage.removeItem('last-imported');
            });
            // fire off Dat Chu's scene reload signal
            that.onSignalSceneReloaded();
        },
        openGCodeFromText: function (gcode) {
            console.log("openGcodeFromText");
            this.wakeAnimate();
            //$('#openModal').modal('hide');
            if (this.object) {
                //TWEEN.removeAll();
                this.stopSampleRun();
                this.scene.remove(this.object);
                //this.scene.remove(this.decorate);
            }
            this.object = this.createObjectFromGCode(gcode);
            console.log("done creating object:", this.object);
            this.scene.add(this.object);
            //this.lookAtCenter();
            this.viewExtents();
            //this.decorateExtents();
            this.drawAxesToolAndExtents();
            this.onUnitsChanged();
            this.setDetails(this.object.userData.lines.length + " GCode Lines");
            this.wakeAnimate();
            
            // we can get a QuotaExceededError here, so catch it
            try {
                // remove old 1st to perhaps make more room for quota check
                localStorage.removeItem('last-imported');
                // now set
                localStorage.setItem('last-imported', gcode);
            } catch(e) {
                if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name == "QuotaExceededError" || e.code == 22 || e.name == "NS_ERROR_DOM_QUOTA_REACHED" || e.code == 1014) {
                    //this.sceneRemove(this.object);
                    // show err dialog
                    console.error("3D Viewer Widget. out of local storage space, but letting user proceed. err:", e);
                    $('#com-chilipeppr-widget-3dview-robot-outofspace').modal();
                } else {
                    console.error("3D Viewer Widget. got err with localStorage:", e);
                }
            }
            localStorage.removeItem('last-loaded');
            
            // fire off Dat Chu's scene reload signal
            this.onSignalSceneReloaded();

        },
        lookAtCenter: function () {
            // this method makes the trackball controls look at center of gcode object
            this.controls.target.x = this.object.userData.center2.x;
            this.controls.target.y = this.object.userData.center2.y;
            this.controls.target.z = this.object.userData.center2.z;
        },
        isLookAtToolHeadMode: false,
        lookAtToolHead: function () {
            // this method makes the trackball controls look at the tool head
            //console.log("lookAtToolHead. controls:", this.controls, "toolhead:", this.toolhead);
            if (this.isLookAtToolHeadMode) {
                this.controls.target.x = this.toolhead.position.x;
                this.controls.target.y = this.toolhead.position.y;
                //this.controls.target.z = this.toolhead.position.z - 20;
                this.controls.target.z = this.toolhead.position.z;
            }
        },
        toCameraCoords: function (position) {
            return this.camera.matrixWorldInverse.multiplyVector3(position.clone());
        },
        scaleInView: function () {
            // NOT WORKING YET
            var tmp_fov = 0.0;

            for (var i = 0; i < 8; i++) {
                proj2d = this.toCameraCoords(boundbox.geometry.vertices[i]);

                angle = 114.59 * Math.max( // 2 * (Pi / 180)
                Math.abs(Math.atan(proj2d.x / proj2d.z) / this.camera.aspect),
                Math.abs(Math.atan(proj2d.y / proj2d.z)));
                tmp_fov = Math.max(tmp_fov, angle);
            }

            this.camera.fov = tmp_fov + 5; // An extra 5 degrees keeps all lines visible
            this.camera.updateProjectionMatrix();
        },
        viewExtents: function () {
            // if (this.object && this.object.userData) {
            //     console.log("viewExtents. object.userData:", this.object.userData);
            // }
            // console.log("controls:", this.controls);
            this.wakeAnimate();
            if (this.orbit) {
                this.orbit.reset();
            }
            return;
            
            // lets override the bounding box with a newly
            // generated one
            // get its bounding box
            // var helper = new THREE.BoundingBoxHelper(this.object, 0xff0000);
            // helper.update();
            // //if (this.bboxHelper)
            // //    this.scene.remove(this.bboxHelper);
            // this.bboxHelper = helper;
            // // If you want a visible bounding box
            // //this.scene.add(this.bboxHelper);
            // console.log("helper bbox:", helper);

            var box3 = new THREE.Box3();
            var size = new THREE.Vector3(); // create once and reuse

            var boxHelper = new THREE.BoxHelper( this.object );
            // scene.add( boxHelper );

            box3.setFromObject( boxHelper ); // or from mesh, same answer
            console.log( "box3:", box3 );

            box3.getSize( size ); // pass in size so a new Vector3 is not allocated
            console.log( "size:", size );
            
            var minx = box3.min.x;
            var miny = box3.min.y;
            var maxx = box3.max.x;
            var maxy = box3.max.y;
            var minz = box3.min.z;
            var maxz = box3.max.z;
            
            var ud = this.object.userData;
            // ud.bbox2 = helper.box;
            ud.bbox2 = box3;
            ud.center2 = {};
            
            ud.center2.x = minx + ((maxx - minx) / 2);
            ud.center2.y = miny + ((maxy - miny) / 2);
            ud.center2.z = minz + ((maxz - minz) / 2);
            
            //this.controls.enabled = false;
            // If using TrackballControls use the line below
            // this.controls.reset();

            //this.controls.object.rotation._x = 0.5;
            //this.controls.object.rotation._y = 0.5;
            //this.controls.object.rotation._z = 0.5;
            //this.controls.object.rotation = THREE.Euler(0.5, 0.5, 0.5);
            //this.controls.object.setRotationFromEuler(THREE.Euler(0.5,0.5,0.5));

            // get max of any of the 3 axes to use as max extent
            //var lenx = Math.abs(ud.bbbox2.min.x) + ud.bbbox2.max.x;
            //var leny = Math.abs(ud.bbbox2.min.y) + ud.bbbox2.max.y;
            //var lenz = Math.abs(ud.bbbox2.min.z) + ud.bbbox2.max.z;
            var lenx = maxx - minx;
            var leny = maxy - miny;
            var lenz = maxz - minz;
            console.log("lenx:", lenx, "leny:", leny, "lenz:", lenz);
            
            var maxBeforeWarnX = 50;
            var maxBeforeWarnY = 50;
            var maxBeforeWarnZ = 50;
            
            if (lenx > maxBeforeWarnX || leny > maxBeforeWarnY || lenz > maxBeforeWarnZ) {
                //alert ("too big!");
                //chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GCode Size Warning", "This GCode looks very large. Are you sure the units are correct?", 6 * 1000);
            }
            
            
            var maxlen = Math.max(lenx, leny, lenz);
            var dist = 2 * maxlen;
            // center camera on gcode objects center pos, but twice the maxlen
            this.controls.object.position.x = ud.center2.x;
            this.controls.object.position.y = ud.center2.y;
            this.controls.object.position.z = ud.center2.z + dist;
            this.controls.target.x = ud.center2.x;
            this.controls.target.y = ud.center2.y;
            this.controls.target.z = ud.center2.z;
            console.log("maxlen:", maxlen, "dist:", dist);
            var fov = 2.2 * Math.atan(maxlen / (2 * dist)) * (180 / Math.PI);
            console.log("new fov:", fov, " old fov:", this.controls.object.fov);
            if (isNaN(fov)) {
                console.log("giving up on viewing extents because fov could not be calculated");
                return;
            }
            this.controls.object.fov = fov;
            //this.controls.object.setRotationFromEuler(THREE.Euler(0.5,0.5,0.5));
            //this.controls.object.rotation.set(0.5,0.5,0.5,"XYZ");
            //this.controls.object.rotateX(2);
            //this.controls.object.rotateY(0.5);
            
            var L = dist;
            var camera = this.controls.object;
            var vector = controls.target.clone();
            var l = (new THREE.Vector3()).subVectors(camera.position, vector).length();
            var up = camera.up.clone();
            var quaternion = new THREE.Quaternion();
            
            // Zoom correction
            camera.translateZ(L - l);
            console.log("up:", up);
            up.y = 1; up.x = 0; up.z = 0;
            quaternion.setFromAxisAngle(up, 0.5);
            //camera.position.applyQuaternion(quaternion);
            up.y = 0; up.x = 1; up.z = 0;
            quaternion.setFromAxisAngle(up, 0.5);
            camera.position.applyQuaternion(quaternion);
            up.y = 0; up.x = 0; up.z = 1;
            quaternion.setFromAxisAngle(up, 0.5);
            //camera.position.applyQuaternion(quaternion);
            
            camera.lookAt(vector);
                        
            //this.camera.rotateX(90);
            
            this.controls.object.updateProjectionMatrix();
            //this.controls.enabled = true;
            //this.scaleInView();
            //this.controls.rotateCamera(0.5);
            //this.controls.noRoll = true;
            //this.controls.noRotate = true;
        },
        stopSampleRun: function (evt) {
            console.log("stopSampleRun. tween:", this.tween);
            this.tweenIsPlaying = false;
            //this.tween.stopChainedTweens();
            //console.log("_onCompleteCallback:", this.tween._onCompleteCallback);
            //this.tween._onCompleteCallback.apply(this.tween, null);
            if (this.tweenHighlight) this.scene.remove(this.tweenHighlight);
            if (this.tween) this.tween.stop();
            //TWEEN.stopChainedTweens();
            //TWEEN.removeAll();
            //TWEEN.stop();
            $('.com-chilipeppr-widget-3d-menu-samplerun').prop('disabled', false);
            $('.com-chilipeppr-widget-3d-menu-samplerunstop').prop('disabled', true);
            $('.com-chilipeppr-widget-3d-menu-samplerunstop').popover('hide');
            this.animAllowSleep();
        },
        pauseSampleRun: function () {
            console.log("pauseSampleRun");
            if (this.tweenPaused) {
                // the tween was paused, it's being non-paused
                console.log("unpausing tween");
                this.animNoSleep();
                this.tweenIsPlaying = true;
                this.tweenPaused = false;
                this.playNextTween();
            } else {
                console.log("pausing tween on next playNextTween()");
                this.tweenIsPlaying = false;
                this.tweenPaused = true;
                this.animAllowSleep();
            }
        },
        gotoXyz: function(data) {
            // we are sent this command by the CNC controller generic interface
            console.log("gotoXyz. data:", data);
            this.animNoSleep();
            this.tweenIsPlaying = false;
            this.tweenPaused = true;
            
            if ('x' in data && data.x != null) this.toolhead.position.x = data.x;
            if ('y' in data && data.y != null) this.toolhead.position.y = data.y;
            //if ('z' in data && data.z != null) this.toolhead.position.z = data.z + 20;
            if ('z' in data && data.z != null) this.toolhead.position.z = data.z;
            if (this.showShadow) {
                this.toolhead.children[0].target.position.set(this.toolhead.position.x, this.toolhead.position.y, this.toolhead.position.z);
                this.toolhead.children[1].target.position.set(this.toolhead.position.x, this.toolhead.position.y, this.toolhead.position.z);
            }
            this.lookAtToolHead();
            
            // see if jogging, if so rework the jog tool
            // double check that our jog 3d object is defined
            // cuz on early load we can get here prior to the
            // jog cylinder and other objects being defined
            if (this.isJogSelect && this.jogArrowCyl) {
                if ('z' in data && data.z != null) {
                    console.log("adjusting jog tool:", this.jogArrow);
                    var cyl = this.jogArrowCyl; //.children[0];
                    var line = this.jogArrowLine; //.children[2];
                    var shadow = this.jogArrowShadow; //.children[3];
                    var posZ = data.z * 3; // acct for scale
                    cyl.position.setZ(posZ + 20);
                    console.log("line:", line.geometry.vertices);
                    line.geometry.vertices[1].z = posZ; // 2nd top vertex
                    line.geometry.verticesNeedUpdate = true;
                    shadow.position.setX(posZ * -1); // make x be z offset
                }
            }
            
            this.animAllowSleep();
        },
        gotoLine: function(data) {
            // this method is sort of like playNextTween, but we are jumping to a specific
            // line based on the gcode sender
            console.log("got gotoLine. data:", data);
            //this.stopSampleRun();
            //this.tweenPaused = false;
            //this.pauseSampleRun();
            this.animNoSleep();
            this.tweenIsPlaying = false;
            this.tweenPaused = true;
            
            var lines = this.object.userData.lines;
            console.log("userData.lines:", lines[data.line]);
            var curLine = lines[data.line];
            var curPt = curLine.p2;
            //if (false && lines[data.line].p2) curPt = lines[data.line].p2;
            //else curPt = {x:0,y:0,z:0};
            console.log("p2 for toolhead move. curPt:", curPt);
            this.toolhead.position.x = curPt.x;
            this.toolhead.position.y = curPt.y;
            //this.toolhead.position.z = curPt.z + 20;
            this.toolhead.position.z = curPt.z;
            if (this.showShadow) {
                this.toolhead.children[0].target.position.set(this.toolhead.position.x, this.toolhead.position.y, this.toolhead.position.z);
                this.toolhead.children[1].target.position.set(this.toolhead.position.x, this.toolhead.position.y, this.toolhead.position.z);
            }
            this.lookAtToolHead();
            this.animAllowSleep();
            
            /* GOOD STUFF BUT IF DON'T WANT ANIM*/
            if (this.tweenHighlight) this.scene.remove(this.tweenHighlight);
            if (this.tween) this.tween.stop();
            if (data.anim && data.anim == "anim") {
                console.log("being asking to animate gotoline");
                this.animNoSleep();
                this.tweenPaused = false;
                this.tweenIsPlaying = true;
                this.tweenIndex = data.line;
                this.playNextTween(true);
            }
        },
        playNextTween: function (isGotoLine) {

            if (this.tweenPaused) return;
            
            //this.wakeAnimate();

            var that = this;
            var lines = this.object.userData.lines;
            if (this.tweenIndex + 1 > lines.length - 1) {
                // done tweening
                console.log("Done with tween");
                this.stopSampleRun();
                return;
            }

            var lineMat = new THREE.LineBasicMaterial({
                color: 0xff0000,
                lineWidth: 1,
                transparent: true,
                opacity: 1,
            });

            // find next correct tween, i.e. ignore fake commands
            var isLooking = true;
            var indxStart = this.tweenIndex + 1;
            //console.log("starting while loop");
            while(isLooking) {
                if (indxStart > lines.length - 1) {
                    console.log("we are out of lines to look at");
                    that.stopSampleRun();
                    return;
                }
                if (lines[indxStart].args.isFake) {
                    // this is fake, skip it
                    //console.log("found fake line at indx:", indxStart);
                } else {
                    // we found a good one. use it
                    //console.log("found one at indx:", indxStart);
                    isLooking = false;
                    break;
                }
                indxStart++;
            }
            var ll;
            if (lines[this.tweenIndex].p2) ll = lines[this.tweenIndex].p2;
            else ll = {x:0,y:0,z:0};
            console.log("start line:", lines[this.tweenIndex], "ll:", ll);
            
            this.tweenIndex = indxStart;
            var cl = lines[this.tweenIndex].p2;
            console.log("end line:", lines[this.tweenIndex], " el:", cl);
            
            var curTween = new TWEEN.Tween({
                x: ll.x,
                y: ll.y,
                z: ll.z
            })
                .to({
                x: cl.x,
                y: cl.y,
                z: cl.z
            }, 1000 / that.tweenSpeed)
            .onStart(function () {
                that.tween = curTween;
                //console.log("onStart");
                // create a new line to show path
                var lineGeo = new THREE.Geometry();
                lineGeo.vertices.push(new THREE.Vector3(ll.x, ll.y, ll.z), new THREE.Vector3(cl.x, cl.y, cl.z));
                var line = new THREE.Line(lineGeo, lineMat);
                line.type = THREE.Lines;
                that.tweenHighlight = line;
                that.scene.add(line);

            })
            .onComplete(function () {
                //console.log("onComplete");
                that.scene.remove(that.tweenHighlight);
                //setTimeout(function() {that.playNextTween();}, 0);
                if (isGotoLine) {
                    console.log("got onComplete for tween and since isGotoLine mode we are stopping");
                    that.stopSampleRun();
                } else {
                    that.playNextTween();
                }
            })
            .onUpdate(function () {
                that.toolhead.position.x = this.x;
                that.toolhead.position.y = this.y;
                that.toolhead.position.z = this.z;
                //that.zheighttest -= 0.1;
                //that.toolhead.position.z = this.z + that.zheighttest;
                //that.toolhead.position.z = this.z + 20;
                // update where shadow casting light is looking
                if (this.showShadow) {
                    that.toolhead.children[0].target.position.set(this.x, this.y, that.toolhead.position.z);
                    that.toolhead.children[1].target.position.set(this.x, this.y, that.toolhead.position.z);
                }
                //that.toolhead.children[0].target.matrixWorldNeedsUpdate = true;
                //console.log("onUpdate2. toolhead:", that.toolhead);
                that.lookAtToolHead();
            });
            //lastTween.chain(curTween);
            //lastTween = curTween;
            this.tween = curTween;
            //this.tweenIndex++;
            this.tween.start();
        },
        zheighttest: 0, // test toolhead going up in z
        playSampleRun: function (evt) {
            console.log("controls:", this.controls);
            //this.wakeAnimate();
            this.animNoSleep();
            $('.com-chilipeppr-widget-3d-menu-samplerun').prop('disabled', true);
            $('.com-chilipeppr-widget-3d-menu-samplerun').popover('hide');
            $('.com-chilipeppr-widget-3d-menu-samplerunstop').prop('disabled', false);
            $('.com-chilipeppr-widget-3d-menu-samplerunpause').prop('disabled', false);

            this.tweenPaused = false;
            this.tweenIsPlaying = true;
            this.tweenIndex = 0;

            var that = this;
            console.log("playSampleRun");
            //console.log("playSampleRun click:", evt, that);

            // cleanup previous run
            TWEEN.removeAll();

            // we will tween all gcode locs in order
            //var lines = this.object.userData.lines;
            //var pstart = this.object.userData.lines[0];
            var tween = new TWEEN.Tween({
                x: 0,
                y: 0,
                z: 0
            })
                .to({
                x: 0,
                y: 0,
                z: 0
            }, 20)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function () {
                //console.log("onComplete");
                that.playNextTween();
            })
            .onUpdate(function () {
                that.toolhead.position.x = this.x;
                that.toolhead.position.y = this.y;
                //that.toolhead.position.z = this.z + 20;
                that.toolhead.position.z = this.z;
                // update where shadow casting light is looking
                if (this.showShadow) {
                    that.toolhead.children[0].target.position.set(this.x, this.y, that.toolhead.position.z);
                    that.toolhead.children[1].target.position.set(this.x, this.y, that.toolhead.position.z);
                }
                
                //that.toolhead.children[0].target.position.set(this.x, this.y, this.z);
                //that.toolhead.children[0].target.matrixWorldNeedsUpdate = true;
                //console.log("onUpdate. toolhead:", that.toolhead);
            });

            this.tween = tween;
            this.tweenIndex = 0;
            this.tween.start();


        },
        makeText: function(vals) {
            var shapes, geom, mat, mesh;
            
            console.log("Do we have the global ThreeHelvetiker font:", ThreeHelvetiker);
            console.log("THREE.FontUtils:", THREE.FontUtils);
            
            if (!THREE.FontUtils) {
                console.error("THREE.FontUtils not defined per bug in r73 of three.js. So not making text.");
                return;
            }
            
            THREE.FontUtils.loadFace(ThreeHelvetiker);
            shapes = THREE.FontUtils.generateShapes( vals.text, {
                font: "helvetiker",
                //weight: "normal",
                size: vals.size ? vals.size : 10
            } );
            geom = new THREE.ShapeGeometry( shapes );
            mat = new THREE.MeshBasicMaterial({
                color: vals.color,
                transparent: true,
                opacity: vals.opacity ? vals.opacity : 0.5,
            });
            mesh = new THREE.Mesh( geom, mat );
            
            mesh.position.x = vals.x;
            mesh.position.y = vals.y;
            mesh.position.z = vals.z;
            
            return mesh;
            
        },
        decorate: null, // stores the decoration 3d objects
        decorateExtents: function() {
            
            // remove grid if drawn previously
            if (this.decorate != null) {
                console.log("there was a previous extent decoration. remove it. grid:", this.decorate);
                this.sceneRemove(this.decorate);
            } else {
                console.log("no previous decorate extents.");
            }
            
            // get its bounding box
            console.log("about to do THREE.BoundingBoxHelper on this.object:", this.object);
            // var helper = new THREE.BoundingBoxHelper(this.object, 0xff0000);
            // helper.update();
            // this.bboxHelper = helper;
            // // If you want a visible bounding box
            // //this.scene.add(helper);
            // console.log("helper bbox:", helper);

            var box3 = new THREE.Box3();
            var size = new THREE.Vector3(); // create once and reuse

            var boxHelper = new THREE.BoxHelper( this.object );
            // scene.add( boxHelper );

            box3.setFromObject( boxHelper ); // or from mesh, same answer
            console.log( "box3:", box3 );

            box3.getSize( size ); // pass in size so a new Vector3 is not allocated
            console.log( "size:", size );
            
            var color = '#0d0d0d';
            //var color = '#ff0000';
            
            var material = new THREE.LineDashedMaterial({ 
                vertexColors: false, color: color,
                dashSize: this.getUnitVal(1), gapSize: this.getUnitVal(1), linewidth: 1,
                transparent: true,
                opacity: 0.3,
            });

            // Create X axis extents sprite
            var z = 0;
            var offsetFromY = this.getUnitVal(-4); // this means we'll be below the object by this padding
            var lenOfLine = this.getUnitVal(5);
            var minx = box3.min.x;
            var miny = box3.min.y;
            var maxx = box3.max.x;
            var maxy = box3.max.y;
            var minz = box3.min.z;
            var maxz = box3.max.z;
            
            var lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(
                new THREE.Vector3(minx, miny+offsetFromY, z), 
                new THREE.Vector3(minx, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(minx, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(maxx, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(maxx, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(maxx, miny+offsetFromY, z)
                
            );
            lineGeo.computeLineDistances();
            var line = new THREE.Line(lineGeo, material, THREE.LinePieces);
            line.type = THREE.Lines;
            
            // Draw text label of length
            var txt = "X " + (maxx - minx).toFixed(2);
            txt += (this.isUnitsMm) ? " mm" : " in";
            var txtX = this.makeText({
                x: minx + this.getUnitVal(1),
                y: miny + offsetFromY - lenOfLine - this.getUnitVal(3),
                z: z,
                text: txt,
                color: color,
                opacity: 0.3,
                size: this.getUnitVal(2)
            });
            
            // Create Y axis extents sprite
            var offsetFromX = this.getUnitVal(-4); // this means we'll be below the object by this padding
            
            var lineGeo2 = new THREE.Geometry();
            lineGeo2.vertices.push(
                new THREE.Vector3(minx + offsetFromX, miny, z), 
                new THREE.Vector3(minx + offsetFromX - lenOfLine, miny, z),
                new THREE.Vector3(minx + offsetFromX - lenOfLine, miny, z),
                new THREE.Vector3(minx + offsetFromX - lenOfLine, maxy, z),
                new THREE.Vector3(minx + offsetFromX - lenOfLine, maxy, z),
                new THREE.Vector3(minx + offsetFromX, maxy, z)
            );
            lineGeo2.computeLineDistances();
            var line2 = new THREE.Line(lineGeo2, material, THREE.LinePieces);
            line2.type = THREE.Lines;
            
            // Draw text label of length
            var txt = "Y " + (maxy - miny).toFixed(2);
            txt += (this.isUnitsMm) ? " mm" : " in";
            var txtY = this.makeText({
                x: minx + offsetFromX - lenOfLine,
                y: miny - this.getUnitVal(3),
                z: z,
                text: txt,
                color: color,
                opacity: 0.3,
                size: this.getUnitVal(2)
            });

            var zlineGeo = new THREE.Geometry();
            var lenEndCap = this.getUnitVal(2);
            zlineGeo.vertices.push(
                new THREE.Vector3(maxx, miny, minz), 
                new THREE.Vector3(maxx + lenOfLine, miny, minz), 
                new THREE.Vector3(maxx + lenOfLine, miny, minz), 
                new THREE.Vector3(maxx + lenOfLine, miny, maxz),
                new THREE.Vector3(maxx + lenOfLine, miny, maxz),
                new THREE.Vector3(maxx, miny, maxz) 

                /*
                new THREE.Vector3(maxx + offsetFromX, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(minx, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(maxx, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(maxx, miny+offsetFromY-lenOfLine, z),
                new THREE.Vector3(maxx, miny+offsetFromY, z)
                */
                
            );
            zlineGeo.computeLineDistances();
            var zline = new THREE.Line(zlineGeo, material, THREE.LinePieces);
            zline.type = THREE.Lines;
            
            // Draw text label of z height
            var txt = "Z " + (maxz - minz).toFixed(2);
            txt += (this.isUnitsMm) ? " mm" : " in";
            var txtZ = this.makeText({
                x: maxx + offsetFromX + lenOfLine,
                y: miny - this.getUnitVal(3),
                z: z,
                text: txt,
                color: color,
                opacity: 0.3,
                size: this.getUnitVal(2)
            });
            txtZ.rotateX(Math.PI / 2);
            var v = txtZ.position;
            txtZ.position.set(v.x + this.getUnitVal(5), v.y + this.getUnitVal(3), v.z);
            
            // draw lines on X axis to represent width
            // create group to put everything into
            this.decorate = new THREE.Object3D();
            this.decorate.add(line);
            this.decorate.add(txtX);
            this.decorate.add(line2);
            this.decorate.add(txtY);
            this.decorate.add(zline);
            this.decorate.add(txtZ);
            
            // Add estimated time and distance
            var ud = this.object.userData.lines;
            var udLastLine = ud[ud.length-1].p2;
            //console.log("lastLine:", udLastLine, "userData:", ud, "this.object:", this.object);
            // use last array value of userData cuz it keeps a running total of time
            // and distance
            
            // get pretty print of time
            var ret = this.convertMinsToPrettyDuration(udLastLine.timeMinsSum);
            
            
            var txt = "Estimated Time: " + ret + ","
            + " Total Distance: " + (udLastLine.distSum).toFixed(2);
            txt = (this.isUnitsMm) ? txt + " mm" : txt + " in";
            //console.log("txt:", txt);
            //console.log("blah", blah);
            var txtTimeDist = this.makeText({
                x: minx + this.getUnitVal(1),
                y: miny + offsetFromY - lenOfLine - this.getUnitVal(6),
                z: z,
                text: txt,
                color: color,
                opacity: 0.3,
                size: this.getUnitVal(2)
            });
            this.decorate.add(txtTimeDist);
            
            this.sceneAdd(this.decorate);
            console.log("just added decoration:", this.decorate);

        },
        convertMinsToPrettyDuration: function(mins) {
            // Minutes and seconds
            var time = mins * 60;
            //var mins = ~~(time / 60);
            //var secs = time % 60;
            
            // Hours, minutes and seconds
            var hrs = ~~(time / 3600);
            var mins = ~~((time % 3600) / 60);
            var secs = time % 60;
            
            // Output like "1:01" or "4:03:59" or "123:03:59"
            ret = "";
            
            if (hrs > 0)
                ret += "" + hrs + "h " + (mins < 10 ? "0" : "");
            
            ret += "" + mins + "m " + (secs < 10 ? "0" : "");
            ret += "" + secs.toFixed(0) + "s";
            return ret;
        },
        makeSprite: function (scene, rendererType, vals) {
            var canvas = document.createElement('canvas'),
                context = canvas.getContext('2d'),
                metrics = null,
                textHeight = 100,
                textWidth = 0,
                actualFontSize = this.getUnitVal(10);
            var txt = vals.text;
            if (vals.size) actualFontSize = vals.size;

            context.font = "normal " + textHeight + "px Arial";
            metrics = context.measureText(txt);
            var textWidth = metrics.width;

            canvas.width = textWidth;
            canvas.height = textHeight;
            context.font = "normal " + textHeight + "px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            //context.fillStyle = "#ff0000";
            context.fillStyle = vals.color;

            context.fillText(txt, textWidth / 2, textHeight / 2);

            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;

            var material = new THREE.SpriteMaterial({
                map: texture,
                useScreenCoordinates: true,
                transparent: true,
                opacity: 0.6
            });
            material.transparent = true;
            //var textObject = new THREE.Sprite(material);
            var textObject = new THREE.Object3D();
            textObject.position.x = vals.x;
            textObject.position.y = vals.y;
            textObject.position.z = vals.z;
            var sprite = new THREE.Sprite(material);
            textObject.textHeight = actualFontSize;
            textObject.textWidth = (textWidth / textHeight) * textObject.textHeight;
            if (rendererType == "2d") {
                sprite.scale.set(textObject.textWidth / textWidth, textObject.textHeight / textHeight, 1);
            } else {
                sprite.scale.set(textWidth / textHeight * actualFontSize, actualFontSize, 1);
            }
            // textObject.rotation.y = Math.PI;
            // textObject.up.set(new Vector3(0,0,1));
            sprite.center.set( 0,-1,0 );
            textObject.add(sprite);

            console.log("textObject:", textObject);

            //scene.add(textObject);
            return textObject;
        },
        element: null,

        getInchesFromMm: function(mm) {
            return mm * 0.0393701;
        },
        getUnitVal: function(val) {
            // if drawing untis is mm just return cuz default
            if (this.isUnitsMm) return val;
            // if drawing is in inches convert
            return this.getInchesFromMm(val);
        },
        drawAxesToolAndExtents: function() {
            
            //return;
            // these are drawn after the gcode is rendered now
            // so we can see if in inch or mm mode
            // these items scale based on that mode
            // this.drawToolhead();
            this.drawGrid();
            this.drawExtentsLabels();
            this.drawAxes();
        },
        shadowplane: null,
        drawToolhead: function() {
            
            return;

            console.group("drawToolhead");
            
            // remove grid if drawn previously
            if (this.toolhead != null) {
                console.log("there was a previous toolhead. remove it. toolhead:", this.toolhead, "shadowplane:", this.shadowplane);
                if (this.shadowplane != null) {
                    console.log("removing shadowplane and setting null");
                    this.sceneRemove(this.shadowplane);
                    this.shadowplane = null;
                }
                this.sceneRemove(this.toolhead);
            } else {
                console.log("no previous toolhead or shadowplane.");
            }
            
            // TOOLHEAD WITH SHADOW
            var toolheadgrp = new THREE.Object3D();
            
            // SHADOWS
            if (this.showShadow) {
                var light = new THREE.DirectionalLight(0xffffff);
                //var light = new THREE.SpotLight(0xffffff);
                light.position.set(0, 60, 60);
                //light.rotation.x = 90 * Math.PI / 180;
                //light.lookat(
                //light.target.position.set(0, 0, 0);
                light.castShadow = true;
                light.onlyShadow = true;
                light.shadowDarkness = 0.05;
                //light.shadowCameraVisible = true; // only for debugging
                // these six values define the boundaries of the yellow box seen above
                light.shadowCameraNear = 0;
                light.shadowCameraFar = this.getUnitVal(1000);
                light.shadowCameraLeft = this.getUnitVal(-5);
                light.shadowCameraRight = this.getUnitVal(5);
                light.shadowCameraTop = 0;
                light.shadowCameraBottom = this.getUnitVal(-35);
                //scene.add(light);
                toolheadgrp.add(light);
                
                var light2 = light.clone();
                light2.position.set(60, 0, 60);
                light2.shadowCameraLeft = 0; //-5;
                light2.shadowCameraRight = this.getUnitVal(-35); //5;
                light2.shadowCameraTop = this.getUnitVal(-5); //0;
                light2.shadowCameraBottom = this.getUnitVal(5); //-35;
                light2.shadowDarkness = 0.03;
                //light2.rotation.z = 90 * Math.PI / 180;
                toolheadgrp.add(light2);
            }
            
            // ToolHead Cylinder
            // API: THREE.CylinderGeometry(bottomRadius, topRadius, height, segmentsRadius, segmentsHeight)
            var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0, 5, 40, 15, 1, false), new THREE.MeshNormalMaterial());
            cylinder.overdraw = true;
            cylinder.rotation.x = -90 * Math.PI / 180;
            cylinder.position.z = 20;
            //cylinder.position.z = 40;
            cylinder.material.opacity = 0.3;
            cylinder.material.transparent = true;
            cylinder.castShadow = true;
            //cylinder.receiveShadow = true;
            console.log("toolhead cone:", cylinder);
            //scene.add(cylinder);
            
            //light.shadowCamera.lookAt(cylinder);
            toolheadgrp.add(cylinder);
            
            if (this.showShadow) {
                // mesh plane to receive shadows
                var planeFragmentShader = [
                    
                    "uniform vec3 diffuse;",
                    "uniform float opacity;",
                    
                    //THREE.ShaderChunk[ "color_pars_fragment" ],
                    //THREE.ShaderChunk[ "map_pars_fragment" ],
                    //THREE.ShaderChunk[ "lightmap_pars_fragment" ],
                    //THREE.ShaderChunk[ "envmap_pars_fragment" ],
                    //THREE.ShaderChunk[ "fog_pars_fragment" ],
                    THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
                    //THREE.ShaderChunk[ "specularmap_pars_fragment" ],
                    
                    "void main() {",
                    
                    "gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 );",
                    
                    //THREE.ShaderChunk[ "map_fragment" ],
                    //THREE.ShaderChunk[ "alphatest_fragment" ],
                    //THREE.ShaderChunk[ "specularmap_fragment" ],
                    //THREE.ShaderChunk[ "lightmap_fragment" ],
                    //THREE.ShaderChunk[ "color_fragment" ],
                    //THREE.ShaderChunk[ "envmap_fragment" ],
                    THREE.ShaderChunk[ "shadowmap_fragment" ],
                    //THREE.ShaderChunk[ "linear_to_gamma_fragment" ],
                    //THREE.ShaderChunk[ "fog_fragment" ],
                    
                    "gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 - shadowColor.x );",
                    
                    "}"
                    
                ].join("\n");
                
                var planeMaterial = new THREE.ShaderMaterial({
                    uniforms: THREE.ShaderLib['basic'].uniforms,
                    vertexShader: THREE.ShaderLib['basic'].vertexShader,
                    fragmentShader: planeFragmentShader,
                    color: 0x0000FF, transparent: true
                });
                
                var planeW = 50; // pixels
                var planeH = 50; // pixels 
                var numW = 50; // how many wide (50*50 = 2500 pixels wide)
                var numH = 50; // how many tall (50*50 = 2500 pixels tall)
                var plane = new THREE.Mesh( new THREE.PlaneGeometry( planeW*50, planeH*50, planeW, planeH ), new   THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false, transparent: true, opacity: 0.5 } ) );
                var plane = new THREE.Mesh( new THREE.PlaneGeometry( planeW*50, planeH*50, planeW, planeH ), planeMaterial );
                //plane.castShadow = false;
                plane.position.z = 0;
                plane.receiveShadow = true;
                
                console.log("toolhead plane:", plane);
                //scene.add(plane);
                //toolheadgrp.add(plane);
            }
            
            // scale the whole thing to correctly match mm vs inches
            var scale = this.getUnitVal(1);
            if (this.showShadow) plane.scale.set(scale, scale, scale);
            toolheadgrp.scale.set(scale, scale, scale);
            
            this.toolhead = toolheadgrp;
            if (this.showShadow) {
                this.shadowplane = plane;
                this.sceneAdd(this.shadowplane);
            }
            this.sceneAdd(this.toolhead);
            
            console.groupEnd();
            
        },
        grid: null, // stores grid
        gridTurnOff: function() {
            if (this.grid != null) {
                console.log("there was a previous grid. remove it. grid:", this.grid);
                this.sceneRemove(this.grid);
            } else {
                console.log("no previous grid.");
            }
        },
        gridTurnOn: function() {
            if (this.grid != null) {
                console.log("there was a previous grid. so ignoring request to turn on. grid:", this.grid);
            } else {
                console.log("no previous grid. so drawing.");
                this.drawGrid();
            }
        },
        drawGrid: function() {
            
            // remove grid if drawn previously
            if (this.grid != null) {
                console.log("there was a previous grid. remove it. grid:", this.grid);
                this.sceneRemove(this.grid);
            } else {
                console.log("no previous grid.");
            }

            // will get mm or inches for grid
            var widthHeightOfGrid; //= this.getUnitVal(200);
            var subSectionsOfGrid; //= this.getUnitVal(10);
            if (this.isUnitsMm) {
                widthHeightOfGrid = 200; // 200 mm grid should be reasonable
                subSectionsOfGrid = 10; // 10mm (1 cm) is good for mm work
            } else {
                widthHeightOfGrid = 20; // 20 inches is good
                subSectionsOfGrid = 1; // 1 inch grid is nice
            }
            
            // see if user wants to size up grid. default is size 1
            // so this won't modify size based on default
            widthHeightOfGrid = widthHeightOfGrid * this.gridSize * 2;
            
            // draw grid
            var helper = new THREE.GridHelper(widthHeightOfGrid, subSectionsOfGrid, 0x0000ff, 0x808080);
            // helper.setColors(0x0000ff, 0x808080);
            helper.position.y = 0;
            helper.position.x = 0;
            helper.position.z = -150 - 80;
            helper.rotation.x = 90 * Math.PI / 180;
            helper.material.opacity = 0.45;
            helper.material.transparent = true;
            helper.receiveShadow = true;
            console.log("helper grid:", helper);
            this.grid = helper;
            this.sceneAdd(this.grid);
            //this.scene.add(helper);

        },
        drawExtentsLabels: function() {
            this.decorateExtents();
        },
        axes: null, // global property to store axes that we drew
        drawAxes: function() {
            
            // remove axes if they were drawn previously
            if (this.axes != null) {
                console.log("there was a previous axes. remove it. axes:", this.axes);
                this.sceneRemove(this.axes);
            } else {
                console.log("no previous axes to remove. cool.");
            }
            
            // axes
            var axesgrp = new THREE.Object3D();
            
            axes = new THREE.AxesHelper(this.getUnitVal(100));
            axes.material.transparent = true;
            axes.material.opacity = 0.8;
            axes.material.depthWrite = false;
            var posZ = -150 - 80 + 0.001;
            axes.position.set(0,0,posZ);
            //this.scene.add(axes);
            axesgrp.add(axes);

            // add axes labels
            var xlbl = this.makeSprite(this.scene, "webgl", {
                x: this.getUnitVal(110),
                y: 0,
                z: posZ + 10,
                text: "X",
                color: "#ff0000",
                // scale: -1,
            });
            var ylbl = this.makeSprite(this.scene, "webgl", {
                x: 0,
                y: this.getUnitVal(110),
                z: posZ + 10,
                text: "Y",
                // scale: -1,
                color: "#00ff00"
            });
            // ylbl.rotation.x = Math.PI;
            var zlbl = this.makeSprite(this.scene, "webgl", {
                x: 0,
                y: 0,
                z: this.getUnitVal(110) + posZ,
                text: "Z",
                // scale: -1,
                color: "#0000ff"
            });
            
            console.log("xlbl:", xlbl);
            axesgrp.add(xlbl);
            axesgrp.add(ylbl);
            axesgrp.add(zlbl);
            this.axes = axesgrp;
            this.sceneAdd(this.axes);

        },
        getWhatCameraIsLookingAt: function(camera) {
            return;

            console.log("camera:", camera);
            console.log("cam pos:", camera.position);

            // The camera is looking down its internal negative z-axis, so create a vector pointing down the negative z-axis:
            var vector = new THREE.Vector3( 0, 0, - 1 );

            // Now, apply the same rotation to the vector that is applied to the camera:
            vector.applyQuaternion( camera.quaternion );
            console.log("camera lookat vector:", vector);
            
            // The resulting vector will be pointing in the direction that the camera is looking.
            // Alternatively, you can use the following method, which works even if the camera is a child of another object:
            var dirVector = camera.getWorldDirection( vector );
            console.log("camera world lookat vector:", dirVector);

        },
        colorBackground: 0xeeeeee, // this is the background color of the 3d viewer
        createScene: function (element) {

            console.log("inside createScene: element:", element);
            // if (!Detector.webgl) Detector.addGetWebGLMessage();
            if ( WEBGL.isWebGLAvailable() === false ) {

				document.body.appendChild( WEBGL.getWebGLErrorMessage() );

			}

            // store element on this object
            this.element = element;
            
            // Scene
            var scene = new THREE.Scene();
            this.scene = scene;

            // Lights...
            var ctr = 0;
            [
                [0, 0, 1, 0xFFFFCC],
                [0, 1, 0, 0xFFCCFF],
                [1, 0, 0, 0xCCFFFF],
                [0, 0, -1, 0xCCCCFF],
                [0, -1, 0, 0xCCFFCC],
                [-1, 0, 0, 0xFFCCCC]
            ].forEach(function (position) {
                var light = new THREE.DirectionalLight(position[3]);
                light.position.set(position[0], position[1], position[2]).normalize();
                /*if (ctr == 0) {
                    light.castShadow = true;
                    light.shadowDarkness = 0.95;
                    light.shadowCameraRight     =  5;
                    light.shadowCameraLeft     = -5;
                    light.shadowCameraTop      =  5;
                    light.shadowCameraBottom   = -5;
                    light.shadowCameraVisible = true;
                }*/
                scene.add(light);
                ctr++;
            });

            // Camera...
            // If you make the near and far too much you get
            // a fail on the intersectObjects()
            var fov = 50,
                aspect = element.width() / element.height(),
                near = 1, //01, // 1e-6, //
                far = 5000,
                camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            this.camera = camera;
            // camera.rotationAutoUpdate = true;
            // camera.position.x = 370;
            // camera.position.y = -350;
            // camera.position.z = 1450;
            camera.position.set( 1000, 500, 1000 );
            camera.up = new THREE.Vector3(0,0,1);
            camera.fov *= 0.3;
            camera.updateProjectionMatrix();
            camera.lookAt( 0, 0, 0 );
            camera.updateProjectionMatrix();
            // Vector3 {x: -0.8526811091969646, y: 0.3802994799004513, z: -0.3581999882831947}
            // camera.lookAt(new THREE.Vector3(-0.859,0.439,-0.261));
            // camera.lookAt(new THREE.Vector3(4000,4000,4000));
            scene.add(camera);

            // Controls
            // TrackbacllControls approach
            /*
            //var mouseEvtContainer = $('#com-chilipeppr-widget-3dview-robot-renderArea');
            //console.log(mouseEvtContainer);
            //controls = new THREE.TrackballControls(camera, mouseEvtContainer[0]);
            controls = new THREE.TrackballControls(camera, element[0]);
            this.controls = controls; // set property for later use
            //controls = new THREE.OrbitControls(camera);
            controls.noPan = false;
            controls.dynamicDampingFactor = 0.99; //0.15;
            controls.rotateSpeed = 2.0;
            //controls.staticMoving = true;
            //controls.target.x = 50;
            //controls.target.y = 100;
            //controls.autoRotate = true;
            console.log("controls:", controls);
            //controls.target.z = 100;
            //controls.addEventListener( 'change', render );
            document.addEventListener( 'mousemove', controls.update.bind( controls ), false );
            document.addEventListener( 'touchmove', controls.update.bind( controls ), false );
            controls.addEventListener( 'start', this.animNoSleep.bind(this));
            controls.addEventListener( 'end', this.animAllowSleep.bind(this));
            */

            var that = this;

            // OrbitControls with Transform approach
            this.orbit = new THREE.OrbitControls( camera, element[0] );
            this.orbit.update();
            // this.orbit.addEventListener( 'change', render );
            this.orbit.addEventListener( 'start', this.animNoSleep.bind(this));
            this.orbit.addEventListener( 'end', this.animAllowSleep.bind(this));
            

            // TransformControls area
            this.controls = new THREE.TransformControls( camera, element[0] );
            // this.controls.addEventListener( 'change', render );
            this.controls.addEventListener( 'start', this.animNoSleep.bind(this));
            this.controls.addEventListener( 'end', this.animAllowSleep.bind(this));
            this.controls.addEventListener( 'dragging-changed', function ( event ) {
                // only do this line if using OrbitControls
                that.orbit.enabled = ! event.value;
            } );
            // var mesh = new THREE.Mesh( geometry, material );
            // scene.add( mesh );
            // control.attach( mesh );
            scene.add( this.controls );

            // Renderer
            var renderer;
            
            var webgl = ( function () { try { return !! window.WebGLRenderingContext && !! document.createElement( 'canvas' ).getContext( 'experimental-webgl' ); } catch( e ) { return false; } } )();

            if (webgl) {
                console.log('WebGL Support found!  Success: CP will work optimally on this device!');
    
                renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    preserveDrawingBuffer: false,
                    alpha: false,
                    logarithmicDepthBuffer: false
                });
            } else {
                console.error('No WebGL Support found! CRITICAL ERROR!');
                chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "No WebGL Found!", "This device/browser does not support WebGL or WebGL has crashed. Chilipeppr needs WebGL to render the 3D View.", 10 * 1000);
                $('#' + this.id + ' .youhavenowebgl').removeClass("hidden");
                return;
            };

            renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

            renderer.shadowMap.enabled = true;
            renderer.gammaOutput = true;
            renderer.setPixelRatio( window.devicePixelRatio );

            this.renderer = renderer;
            //renderer.setClearColor( scene.fog.color, 1 );
            //renderer.setClearColor(0xeeeeee, 1);
            renderer.setClearColor(this.colorBackground, 1);
            renderer.setSize(element.width(), element.height());
            renderer.setPixelRatio( window.devicePixelRatio );
            element.append(renderer.domElement);
            //renderer.autoClear = true;
            //renderer.clear();
            
            // cast shadows
            // renderer.shadowMapEnabled = true;
            // to antialias the shadow
            // renderer.shadowMapSoft = true;
            /*
            renderer.shadowCameraNear = 3;
            renderer.shadowCameraFar = camera.far;
            renderer.shadowCameraFov = 50;
            */
            /*
            renderer.shadowMapBias = 0.0039;
            renderer.shadowMapDarkness = 1.0;
            renderer.shadowMapWidth = 1024;
            renderer.shadowMapHeight = 1024;
            */

            // Action!
            /*
            //controls.addEventListener( 'change', test );
            //element.on('change', test);
            var mouseEvtContainer = $('#com-chilipeppr-widget-3dview-robot-renderArea');
            console.log(mouseEvtContainer);
            //mouseEvtContainer.on('mousemove mousedown mousewheel hover click dblclick scroll touchstart touchmove touchenter focus resize', this.wakeAnimate.bind(this));
            //controls.addEventListener( 'change', this.wakeAnimate.bind(this));
            controls.addEventListener( 'start', this.animNoSleep.bind(this));
            controls.addEventListener( 'end', this.animAllowSleep.bind(this));
            //mouseEvtContainer.on('', wakeAnimate);
            */

            /*
            function test(evt) {
                console.log("got event listener", evt);
            }
            function slowDown() {
                requestAnimationFrame(animate); // And repeat...
            }
            */
            console.log("this wantAnimate:", this);
            this.wantAnimate = true;
            //this.camera = camera; 
            //var that = this;
            /*
            function animate() {
                TWEEN.update();
                //setTimeout(slowDown, 100);
                if (that.wantAnimate) requestAnimationFrame(animate); // And repeat...
                controls.update();
                // Use a fixed time-step here to avoid gaps
                //render( clock.getDelta() );
                //render();
                renderer.render(scene, camera);
            }
            */
            
            this.wakeAnimate();

            // Fix coordinates up if window is resized.
            var that = this;
            $(window).on('resize', function () {
                //console.log("got resize event. resetting aspect ratio.");
                renderer.setSize(element.width(), element.height());
                camera.aspect = element.width() / element.height();
                camera.updateProjectionMatrix();
                // that.orbit.screen.width = window.innerWidth;
                // that.orbit.screen.height = window.innerHeight;
                that.wakeAnimate();
                //render();
            });
            
            // try to get orbit controls to zoom towards mouse rather than zoom
            // towards center
            // controls.noZoom = true;
            /*
            mouseEvtContainer.on('mousewheel', function (event){
                // console.log("mousewheel. event:", event);
                // controls.noZoom = true;
                event.preventDefault();
                var factor = 10;
                var mX = (event.clientX / mouseEvtContainer.width()) * 2 - 1;
                var mY = -(event.clientY / mouseEvtContainer.height()) * 2 + 1;
                var vector = new THREE.Vector3(mX, mY, 0.1);
    
                vector.unproject(camera);
                vector.sub(camera.position);
                if (event.originalEvent.deltaY < 0) {
                    camera.position.addVectors(camera.position, vector.setLength(factor));
                    controls.target.addVectors(controls.target, vector.setLength(factor));
                    
                } else {
                    camera.position.subVectors(camera.position, vector.setLength(factor));
                    controls.target.subVectors(controls.target, vector.setLength(factor));
    
                }
                camera.updateProjectionMatrix();
                // controls.noZoom = false;
            });
            */

            return scene;
        },
        resize: function() {
            //console.log("got resize event. resetting aspect ratio.");
            this.renderer.setSize(this.element.width(), this.element.height());
            this.camera.aspect = this.element.width() / this.element.height();
            this.camera.updateProjectionMatrix();
            // probably need to rework this to this.orbit
            // this.orbit.screen.width = window.innerWidth;
            // this.orbit.screen.height = window.innerHeight;
            this.wakeAnimate();
        },
        mytimeout: null,
        renderFrameCtr: 0, // keep track of fps
        fpsCounterInterval: null,
        fpsEl: null,
        fpsCounterStart: function() {
            
            if (this.fpsEl == null) {
                // pull dom el and cache so the dom updates are efficient
                this.fpsEl = $('#com-chilipeppr-widget-3dview-robot .frames-per-sec');
            }

            // if 3d viewer disabled, exit
            if (this.animEnable == false) {
                this.fpsEl.html('<span class="alert-danger" style="font-size:12px;">Manually Disabled. Go to cog wheel icon to choose a frame rate to re-enable.</span>');
                return;
            }
            
            // update fps each second
            if (this.fpsCounterInterval == null) {
                // start fps counting
                this.renderFrameCtr = 0;
                console.log("starting fps counting");
                this.fpsCounterInterval = setInterval(this.fpsCounterOnInterval.bind(this), 1000);
            }
        },
        fpsCounterOnInterval: function() {
            this.fpsEl.html(this.renderFrameCtr + "&nbsp;fps");
            this.renderFrameCtr = 0;
        },
        fpsCounterEnd: function() {
            console.log("stopping fps counting");
            clearInterval(this.fpsCounterInterval);
            this.fpsCounterInterval = null;
            console.log("checking if anim is disabled. this.animEnable:", this.animEnable);
            if (this.animEnable == false) {
                this.fpsEl.html('<div class="alert-danger" style="font-size:12px;line-height: 12px;padding: 6px;">Manually Disabled. Go to cog wheel icon to choose a frame rate to re-enable.</div>');
            } else {
                // set fps to just a dash
                this.fpsEl.html("-&nbsp;fps");
            }
        },
        setFrameRate: function(rate) {
            
            localStorage.setItem ('fpsRate', rate);
            console.log ("Set fpsRate in storage:  ", rate);
            
            // see if disabled
            if (rate == 0) {
                this.animateDisabled();
            } else {
                this.animateEnabled();
            }
            
            // rate is frames per second
            if (rate == 5) this.frameRateDelayMs = 200;
            if (rate == 10) this.frameRateDelayMs = 100;
            if (rate == 15) this.frameRateDelayMs = 70;
            if (rate == 30) this.frameRateDelayMs = 32;
            if (rate == 60) this.frameRateDelayMs = 0;
        },
        animEnable: true, // boolean tracking whether we allow animation
        animateDisabled: function() {
            console.log("disabling animation");
            this.animEnable = false;
            this.fpsEl.html('<span class="alert-danger">Disabled</span>');
        },
        animateEnabled: function() {
            console.log("enabling animation");
            this.animEnable = true;
        },
        // reduce rate by 2, 3, 4, etc. 60fps becomes 30fps
        //frameRateSkipEvery: [false, true, true, true, true], 
        //frameRateSkipEvery: [false], 
        //frameRateCtr: 0, // counts to skip animate
        
        // 200 = 5fps, 100 = 10fps, 70=15fps, 50=20fps, 40=25fps, 30=30fps
        frameRateDelayMs: 32, 
        animate: function() {
            
            // if 3d viewer disabled, exit
            if (this.animEnable == false) {
                console.log("animate(). this.animEnable false, so exiting.");
                return;
            }
            
            // see if we should exit to reduce frame count
            /*
            if (this.frameRateSkipEvery[this.frameRateCtr]) {
                if (this.frameRateCtr == this.frameRateSkipEvery.length - 1)
                    this.frameRateCtr = 0;
                else
                    this.frameRateCtr++;
                requestAnimationFrame(this.animate.bind(this));
                return;
            }
            this.frameRateCtr++;
            if (this.frameRateCtr > 200) this.frameRateCtr = 0; // prevent overruns
            */
            
            // TWEEN.update();
            if (this.wantAnimate) {
                
                // see if we're adding delay to slow frame rate
                if (this.frameRateDelayMs > 0) {
                    var that = this;
                    setTimeout(function() {
                        requestAnimationFrame(that.animate.bind(that));
                    }, this.frameRateDelayMs);
                } else {
                    requestAnimationFrame(this.animate.bind(this));
                }
            }
            // FOR TRACKBALLCONTROLS, MAY NEED TO UNCOMMENT THIS LINE
            // this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.renderFrameCtr++;

            // watch the mousemove and check what the mouse is over so we can hilite
            // the robot
            if (this.mouse && this.object) {
                this.checkRaycast();
            }
        },
        wakeAnimate: function(evt) {
            
            // if 3d viewer disabled, exit
            if (this.animEnable == false) {
                return;
            }
            
            //console.log("wakeAnimate:", evt);
            this.wantAnimate = true;
            this.fpsCounterStart();
            //controls.update();
            //clearTimeout(this.mytimeout);
            if (!this.mytimeout) {
                this.mytimeout = setTimeout(this.sleepAnimate.bind(this), 10000);
                //console.log("wakeAnimate");
                requestAnimationFrame(this.animate.bind(this));
            }
        },
        sleepAnimate: function() {
            this.mytimeout = null;
            if (this.isNoSleepMode) {
                // skip sleeping the anim
                console.log("Being asked to sleep anim, but in NoSleepMode");
            } else {
                this.wantAnimate = false;
                this.fpsCounterEnd();
                console.log("slept animate");
            }
        },
        cancelSleep: function() {
            clearTimeout(this.mytimeout);
        },
        isNoSleepMode: false,
        animNoSleep: function() {
            //console.log("anim no sleep");
            this.isNoSleepMode = true;
            //this.cancelSleep();
            this.wakeAnimate();
        },
        animAllowSleep: function(args) {
            console.log("anim allow sleep."); // args:", args, args.target.object.position);
            // var camera = args.target.object;
            // console.log("camera:", camera);
            // var vector = new THREE.Vector3(0, 0, -1);
            // vector.applyEuler(camera.rotation, camera.eulerOrder);
            // console.log("lookat:", vector);
            // this.getWhatCameraIsLookingAt(camera);
            
            // even if we're being asked to allow sleep
            // but the tween is playing, don't allow it
            if (this.tweenIsPlaying) return;
            
            // if we get here, then allow sleep
            this.isNoSleepMode = false;
            if (!this.mytimeout) this.mytimeout = setTimeout(this.sleepAnimate.bind(this), 5000);
        },
        /**
         * Parses a string of gcode instructions, and invokes handlers for
         * each type of command.
         *
         * Special handler:
         *   'default': Called if no other handler matches.
         */
        GCodeParser: function (handlers, modecmdhandlers) {
            this.handlers = handlers || {};
            this.modecmdhandlers = modecmdhandlers || {};
            
            this.lastArgs = {cmd: null};
            this.lastFeedrate = null;
            this.isUnitsMm = true;
            
            this.parseLine = function (text, info) {
                //text = text.replace(/;.*$/, '').trim(); // Remove comments
                //text = text.replace(/\(.*$/, '').trim(); // Remove comments
                //text = text.replace(/<!--.*?-->/, '').trim(); // Remove comments
                
                var origtext = text;
                // remove line numbers if exist
                if (text.match(/^N/i)) {
                    // yes, there's a line num
                    text = text.replace(/^N\d+\s*/ig, "");
                }
                
                // collapse leading zero g cmds to no leading zero
                text = text.replace(/G00/i, 'G0');
                text = text.replace(/G0(\d)/i, 'G$1');
                // add spaces before g cmds and xyzabcijkf params
                text = text.replace(/([gmtxyzabcijkfst])/ig, " $1");
                // remove spaces after xyzabcijkf params because a number should be directly after them
                text = text.replace(/([xyzabcijkfst])\s+/ig, "$1");
                // remove front and trailing space
                text = text.trim();
                
                // see if comment
                var isComment = false;
                if (text.match(/^(;|\(|<)/)) {
                    text = origtext;
                    isComment = true;
                } else {
                    // make sure to remove inline comments
                    text = text.replace(/\(.*?\)/g, "");
                }
                //console.log("gcode txt:", text);
                
                if (text && !isComment) {
                    //console.log("there is txt and it's not a comment");
                    //console.log("");
                    // preprocess XYZIJ params to make sure there's a space
                    //text = text.replace(/(X|Y|Z|I|J|K)/ig, "$1 ");
                    //console.log("gcode txt:", text);
                    
                    // strip off end of line comment
                    text = text.replace(/(;|\().*$/, ""); // ; or () trailing
                    //text = text.replace(/\(.*$/, ""); // () trailing
                    
                    var tokens = [];
                    
                    // Execute any non-motion commands on the line immediately
                    // Add other commands to the tokens list for later handling
                    // Segments are not created for non-motion commands;
                    // the segment for this line is created later
                    
                    text.split(/\s+/).forEach(function (token) {
                        var modehandler = modecmdhandlers[token.toUpperCase()];
                        if (modehandler) {
                            modehandler();
                        } else {
                            tokens.push(token);
                        }
                    });

                    if (tokens.length) {
                        var cmd = tokens[0];
                        cmd = cmd.toUpperCase();
                        // check if a g or m cmd was included in gcode line
                        // you are allowed to just specify coords on a line
                        // and it should be assumed that the last specified gcode
                        // cmd is what's assumed
                        isComment = false;
                        if (!cmd.match(/^(G|M|T)/i)) {
                            // if comment, drop it
                            /*
                            if (cmd.match(/(;|\(|<)/)) {
                                // is comment. do nothing.
                                isComment = true;
                                text = origtext;
                                //console.log("got comment:", cmd);
                            } else {
                            */

                                //console.log("no cmd so using last one. lastArgs:", this.lastArgs);
                                // we need to use the last gcode cmd
                                cmd = this.lastArgs.cmd;
                                //console.log("using last cmd:", cmd);
                                tokens.unshift(cmd); // put at spot 0 in array
                                //console.log("tokens:", tokens);
                            //}
                        } else {
                            
                            // we have a normal cmd as opposed to just an xyz pos where
                            // it assumes you should use the last cmd
                            // however, need to remove inline comments (TODO. it seems parser works fine for now)
                            
                        }
                        var args = {
                            'cmd': cmd,
                            'text': text,
                            'origtext': origtext,
                            'indx': info,
                            'isComment': isComment,
                            'feedrate': null,
                            'plane': undefined
                        };
                        
                        //console.log("args:", args);
                        if (tokens.length > 1  && !isComment) {
                            tokens.splice(1).forEach(function (token) {
                                //console.log("token:", token);
                                if (token && token.length > 0) {
                                    var key = token[0].toLowerCase();
                                    var value = parseFloat(token.substring(1));
                                    //console.log("value:", value, "key:", key);
                                    //if (isNaN(value))
                                    //    console.error("got NaN. val:", value, "key:", key, "tokens:", tokens);
                                    args[key] = value;
                                } else {
                                    //console.log("couldn't parse token in foreach. weird:", token);
                                }
                            });
                        }
                        var handler = this.handlers[cmd] || this.handlers['default'];

                        // don't save if saw a comment
                        if (!args.isComment) {
                            this.lastArgs = args;
                            //console.log("just saved lastArgs for next use:", this.lastArgs);
                        } else {
                            //console.log("this was a comment, so didn't save lastArgs");
                        }
                        //console.log("calling handler: cmd:", cmd, "args:", args, "info:", info);
                        if (handler) {
                            // scan for feedrate
                            if (args.text.match(/F([\d.]+)/i)) {
                                // we have a new feedrate
                                var feedrate = parseFloat(RegExp.$1);
                                console.log("got feedrate on this line. feedrate:", feedrate, "args:", args);
                                args.feedrate = feedrate;
                                this.lastFeedrate = feedrate;
                            } else {
                                // use feedrate from prior lines
                                args.feedrate = this.lastFeedrate;
                                //if (args.feedrate 
                            }
                            
                            //console.log("about to call handler. args:", args, "info:", info, "this:", this);
                            
                            return handler(args, info, this);
                        } else {
                            console.error("No handler for gcode command!!!");
                        }
                            
                    }
                } else {
                    // it was a comment or the line was empty
                    // we still need to create a segment with xyz in p2
                    // so that when we're being asked to /gotoline we have a position
                    // for each gcode line, even comments. we just use the last real position
                    // to give each gcode line (even a blank line) a spot to go to
                    var args = {
                        'cmd': 'empty or comment',
                        'text': text,
                        'origtext': origtext,
                        'indx': info,
                        'isComment': isComment
                    };
                    var handler = this.handlers['default'];
                    return handler(args, info, this);
                }
            }

            this.parse = function (gcode) {
                var lines = gcode.split(/\r{0,1}\n/);
                for (var i = 0; i < lines.length; i++) {
                    if (this.parseLine(lines[i], i) === false) {
                        break;
                    }
                }
            }
        },
        colorG0: 0x00ff00,
        colorG1: 0x0000ff,
        colorG2: 0x999900,
        createObjectFromGCode: function (gcode, indxMax) {
            //debugger;
            // Credit goes to https://github.com/joewalnes/gcode-viewer
            // for the initial inspiration and example code.
            // 
            // GCode descriptions come from:
            //    http://reprap.org/wiki/G-code
            //    http://en.wikipedia.org/wiki/G-code
            //    SprintRun source code

            // these are extra Object3D elements added during
            // the gcode rendering to attach to scene
            this.extraObjects = [];
            this.extraObjects["G17"] = [];
            this.extraObjects["G18"] = [];
            this.extraObjects["G19"] = [];
            this.offsetG92 = {x:0, y:0, z:0, e:0};
            this.setUnits("mm");

            var lastLine = {
                x: 0,
                y: 0,
                z: 0,
                e: 0,
                f: 0,
                feedrate: null,
                extruding: false
            };

            // we have been using an approach where we just append
            // each gcode move to one monolithic geometry. we
            // are moving away from that idea and instead making each
            // gcode move be it's own full-fledged line object with
            // its own userData info
            // G2/G3 moves are their own child of lots of lines so
            // that even the simulator can follow along better
            var new3dObj = new THREE.Group();
            var plane = "G17"; //set default plane to G17 - Assume G17 if no plane specified in gcode.
            var layers = [];
            var layer = undefined;
            var lines = [];
            var totalDist = 0;
            var bbbox = {
                min: {
                    x: 100000,
                    y: 100000,
                    z: 100000
                },
                max: {
                    x: -100000,
                    y: -100000,
                    z: -100000
                }
            };
            var bbbox2 = {
                min: {
                    x: 100000,
                    y: 100000,
                    z: 100000
                },
                max: {
                    x: -100000,
                    y: -100000,
                    z: -100000
                }
            };

            this.newLayer = function (line) {
                //console.log("layers:", layers, "layers.length", layers.length);
                layer = {
                    type: {},
                    layer: layers.length,
                    z: line.z,
                };
                layers.push(layer);
            };

            this.getLineGroup = function (line, args) {
                //console.log("getLineGroup:", line);
                if (layer == undefined) this.newLayer(line);
                var speed = Math.round(line.e / 1000);
                var grouptype = (line.extruding ? 10000 : 0) + speed;
                //var color = new THREE.Color(line.extruding ? 0xff00ff : 0x0000ff);
                var color = new THREE.Color(line.extruding ? 0xff00ff : this.colorG1);
                if (line.g0) {
                    grouptype =  "g0";
                    //color = new THREE.Color(0x00ff00);
                    color = new THREE.Color(this.colorG0);
                } else if (line.g2) {
                    grouptype = "g2";
                    //color = new THREE.Color(0x999900);
                    color = new THREE.Color(this.colorG2);
                } else if (line.arc) {
                    grouptype = "arc";
                    color = new THREE.Color(0x0099ff);
                }
                // see if we have reached indxMax, if so draw, but 
                // make it ghosted
                if (args.indx > indxMax) {
                    grouptype = "ghost";
                    //console.log("args.indx > indxMax", args, indxMax);
                    color = new THREE.Color(0x000000);
                }
                //if (line.color) color = new THREE.Color(line.color);
                if (layer.type[grouptype] == undefined) {
                    layer.type[grouptype] = {
                        type: grouptype,
                        feed: line.e,
                        extruding: line.extruding,
                        color: color,
                        segmentCount: 0,
                        material: new THREE.LineBasicMaterial({
                            opacity: line.extruding ? 0.3 : line.g2 ? 0.2 : 0.5,
                            transparent: true,
                            linewidth: 1,
                            vertexColors: THREE.FaceColors
                        }),
                        geometry: new THREE.Geometry(),
                    }
                    if (args.indx > indxMax) {
                        layer.type[grouptype].material.opacity = 0.05;
                    }
                }
                return layer.type[grouptype];
            };

            this.drawArc = function(aX, aY, aZ, endaZ, aRadius, aStartAngle, aEndAngle, aClockwise, plane) {
                //console.log("drawArc:", aX, aY, aZ, aRadius, aStartAngle, aEndAngle, aClockwise);
                var ac = new THREE.ArcCurve(aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise);
                //console.log("ac:", ac);
                var acmat = new THREE.LineBasicMaterial({
                    color: 0x00aaff,
                    opacity: 0.5,
                    transparent: true
                });
                var acgeo = new THREE.Geometry();
                var ctr = 0;
                var z = aZ;
                ac.getPoints(20).forEach(function (v) {
                    //console.log(v);
                    z = (((endaZ - aZ) / 20) * ctr) + aZ;
                    acgeo.vertices.push(new THREE.Vector3(v.x, v.y, z));
                    ctr++;
                });
                var aco = new THREE.Line(acgeo, acmat);
                //aco.position.set(pArc.x, pArc.y, pArc.z);
                //console.log("aco:", aco);
                this.extraObjects[plane].push(aco);
                return aco;
            };
            
            this.drawArcFrom2PtsAndCenter = function(vp1, vp2, vpArc, args) {
                //console.log("drawArcFrom2PtsAndCenter. vp1:", vp1, "vp2:", vp2, "vpArc:", vpArc, "args:", args);
                
                //var radius = vp1.distanceTo(vpArc);
                //console.log("radius:", radius);
                
                // Find angle
                var p1deltaX = vpArc.x - vp1.x;
                var p1deltaY = vpArc.y - vp1.y; 
                var p1deltaZ = vpArc.z - vp1.z;

                var p2deltaX = vpArc.x - vp2.x;
                var p2deltaY = vpArc.y - vp2.y; 
                var p2deltaZ = vpArc.z - vp2.z;

                switch(args.plane){
                    case "G18":
                        var anglepArcp1 = Math.atan(p1deltaZ / p1deltaX);
                        var anglepArcp2 = Math.atan(p2deltaZ / p2deltaX);
                        break;
                    case "G19":
                        var anglepArcp1 = Math.atan(p1deltaZ / p1deltaY);
                        var anglepArcp2 = Math.atan(p2deltaZ / p2deltaY);
                        break;
                    default:
                        var anglepArcp1 = Math.atan(p1deltaY / p1deltaX);
                        var anglepArcp2 = Math.atan(p2deltaY / p2deltaX);
                }
                
                // Draw arc from arc center
                var radius = vpArc.distanceTo(vp1);
                var radius2 = vpArc.distanceTo(vp2);
                //console.log("radius:", radius);
                
                if (Number((radius).toFixed(2)) != Number((radius2).toFixed(2))) console.log("Radiuses not equal. r1:", radius, ", r2:", radius2, " with args:", args, " rounded vals r1:", Number((radius).toFixed(2)), ", r2:", Number((radius2).toFixed(2)));
                
                // arccurve
                var clwise = true;
                if (args.clockwise === false) clwise = false;
                //if (anglepArcp1 < 0) clockwise = false;

                switch(args.plane){
                    case "G19":
                        if (p1deltaY >= 0) anglepArcp1 += Math.PI;
                        if (p2deltaY >= 0) anglepArcp2 += Math.PI;
                        break;
                    default:
                        if (p1deltaX >= 0) anglepArcp1 += Math.PI;
                        if (p2deltaX >= 0) anglepArcp2 += Math.PI;
                }

                if (anglepArcp1 === anglepArcp2 && clwise === false)
                    // Draw full circle if angles are both zero, 
                    // start & end points are same point... I think
                    switch(args.plane){
                        case "G18":
                            var threeObj = this.drawArc(vpArc.x, vpArc.z, (-1*vp1.y), (-1*vp2.y), radius, anglepArcp1, (anglepArcp2 + (2*Math.PI)), clwise, "G18");
                            break;
                        case "G19":
                            var threeObj = this.drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, (anglepArcp2 + (2*Math.PI)), clwise, "G19");
                            break;
                        default:
                            var threeObj = this.drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, (anglepArcp2 + (2*Math.PI)), clwise, "G17");
                    }
                else
                    switch(args.plane){
                        case "G18":
                            var threeObj = this.drawArc(vpArc.x, vpArc.z, (-1*vp1.y), (-1*vp2.y), radius, anglepArcp1, anglepArcp2, clwise, "G18");
                            break;
                        case "G19":
                            var threeObj = this.drawArc(vpArc.y, vpArc.z, vp1.x, vp2.x, radius, anglepArcp1, anglepArcp2, clwise, "G19");
                            break;
                        default:
                            var threeObj = this.drawArc(vpArc.x, vpArc.y, vp1.z, vp2.z, radius, anglepArcp1, anglepArcp2, clwise, "G17");
                    }
                return threeObj;
            };
            
            this.addSegment = function (p1, p2, args) {
                //console.log("");
                //console.log("addSegment p2:", p2);
                // add segment to array for later use
                lines.push({
                    p2: p2,
                    'args': args
                });

                var group = this.getLineGroup(p2, args);
                var geometry = group.geometry;

                group.segmentCount++;
                // see if we need to draw an arc
                if (p2.arc) {
                    //console.log("");
                    //console.log("drawing arc. p1:", p1, ", p2:", p2);
                    
                    //var segmentCount = 12;
                    // figure out the 3 pts we are dealing with
                    // the start, the end, and the center of the arc circle
                    // radius is dist from p1 x/y/z to pArc x/y/z
                    //if(args.clockwise === false || args.cmd === "G3"){
                    //    var vp2 = new THREE.Vector3(p1.x, p1.y, p1.z);
                    //    var vp1 = new THREE.Vector3(p2.x, p2.y, p2.z);
                    //}
                    //else {
                        var vp1 = new THREE.Vector3(p1.x, p1.y, p1.z);
                        var vp2 = new THREE.Vector3(p2.x, p2.y, p2.z);
                    //}   
                    var vpArc;
                    
                    // if this is an R arc gcode command, we're given the radius, so we
                    // don't have to calculate it. however we need to determine center
                    // of arc
                    if (args.r != null) {
                        //console.log("looks like we have an arc with R specified. args:", args);
                        //console.log("anglepArcp1:", anglepArcp1, "anglepArcp2:", anglepArcp2);

                        radius = parseFloat(args.r);
                        
                        // First, find the distance between points 1 and 2.  We'll call that q, 
                        // and it's given by sqrt((x2-x1)^2 + (y2-y1)^2).
                        var q = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2) + Math.pow(p2.z - p1.z, 2));

                        // Second, find the point halfway between your two points.  We'll call it 
                        // (x3, y3).  x3 = (x1+x2)/2  and  y3 = (y1+y2)/2.  
                        var x3 = (p1.x + p2.x) / 2;
                        var y3 = (p1.y + p2.y) / 2;
                        var z3 = (p1.z + p2.z) / 2;
                        
                        // There will be two circle centers as a result of this, so
                        // we will have to pick the correct one. In gcode we can get
                        // a + or - val on the R to indicate which circle to pick
                        // One answer will be:
                        // x = x3 + sqrt(r^2-(q/2)^2)*(y1-y2)/q
                        // y = y3 + sqrt(r^2-(q/2)^2)*(x2-x1)/q  
                        // The other will be:
                        // x = x3 - sqrt(r^2-(q/2)^2)*(y1-y2)/q
                        // y = y3 - sqrt(r^2-(q/2)^2)*(x2-x1)/q  
                        var pArc_1 = undefined;
                        var pArc_2 = undefined;
                        var calc = Math.sqrt((radius * radius) - Math.pow(q / 2, 2));
                        
                        // calc can be NaN if q/2 is epsilon larger than radius due to finite precision
                        // When that happens, the calculated center is incorrect
                        if (isNaN(calc)) {
                            calc = 0.0;
                        }
                        var angle_point = undefined;
                        
                        switch(args.plane){
                            case "G18":
                                pArc_1 = {
                                    x: x3 + calc * (p1.z - p2.z) / q,
                                    y: y3 + calc * (p2.y - p1.y) / q, 
                                    z: z3 + calc * (p2.x - p1.x) / q };
                                pArc_2 = {
                                    x: x3 - calc * (p1.z - p2.z) / q,
                                    y: y3 - calc * (p2.y - p1.y) / q, 
                                    z: z3 - calc * (p2.x - p1.x) / q };
                                angle_point = Math.atan2(p1.z, p1.x) - Math.atan2(p2.z, p2.x);
                                if(((p1.x-pArc_1.x)*(p1.z+pArc_1.z))+((pArc_1.x-p2.x)*(pArc_1.z+p2.z)) >= 
                                   ((p1.x-pArc_2.x)*(p1.z+pArc_2.z))+((pArc_2.x-p2.x)*(pArc_2.z+p2.z))){
                                    var cw = pArc_1;
                                    var ccw = pArc_2;
                                }
                                else{
                                    var cw = pArc_2;
                                    var ccw = pArc_1;
                                }
                                break;
                            case "G19":
                                pArc_1 = {
                                    x: x3 + calc * (p1.x - p2.x) / q,
                                    y: y3 + calc * (p1.z - p2.z) / q, 
                                    z: z3 + calc * (p2.y - p1.y) / q };
                                pArc_2 = {
                                    x: x3 - calc * (p1.x - p2.x) / q,
                                    y: y3 - calc * (p1.z - p2.z) / q, 
                                    z: z3 - calc * (p2.y - p1.y) / q };
                                
                                if(((p1.y-pArc_1.y)*(p1.z+pArc_1.z))+((pArc_1.y-p2.y)*(pArc_1.z+p2.z)) >= 
                                   ((p1.y-pArc_2.y)*(p1.z+pArc_2.z))+((pArc_2.y-p2.y)*(pArc_2.z+p2.z))){
                                    var cw = pArc_1;
                                    var ccw = pArc_2;
                                }
                                else{
                                    var cw = pArc_2;
                                    var ccw = pArc_1;
                                }
                                break;
                            default:
                                pArc_1 = {
                                    x: x3 + calc * (p1.y - p2.y) / q,
                                    y: y3 + calc * (p2.x - p1.x) / q, 
                                    z: z3 + calc * (p2.z - p1.z) / q };
                                pArc_2 = {
                                    x: x3 - calc * (p1.y - p2.y) / q,
                                    y: y3 - calc * (p2.x - p1.x) / q, 
                                    z: z3 - calc * (p2.z - p1.z) / q };
                                if(((p1.x-pArc_1.x)*(p1.y+pArc_1.y))+((pArc_1.x-p2.x)*(pArc_1.y+p2.y)) >= 
                                   ((p1.x-pArc_2.x)*(p1.y+pArc_2.y))+((pArc_2.x-p2.x)*(pArc_2.y+p2.y))){
                                    var cw = pArc_1;
                                    var ccw = pArc_2;
                                }
                                else{
                                    var cw = pArc_2;
                                    var ccw = pArc_1;
                                }
                        }
                        
                        if((p2.clockwise === true && radius >= 0) || (p2.clockwise === false && radius < 0)) vpArc = new THREE.Vector3(cw.x, cw.y, cw.z);
                        else vpArc = new THREE.Vector3(ccw.x, ccw.y, ccw.z);
                        
                    } else {
                        // this code deals with IJK gcode commands
                        /*if(args.clockwise === false || args.cmd === "G3")
                            var pArc = {
                                x: p2.arci ? p1.x + p2.arci : p1.x,
                                y: p2.arcj ? p1.y + p2.arcj : p1.y,
                                z: p2.arck ? p1.z + p2.arck : p1.z,
                            };
                        else*/
                        var pArc = {
                            x: p2.arci,
                            y: p2.arcj,
                            z: p2.arck,
                        };
                        //console.log("new pArc:", pArc);
                        vpArc = new THREE.Vector3(pArc.x, pArc.y, pArc.z);
                        //console.log("vpArc:", vpArc);
                    }
                    
                    var threeObjArc = this.drawArcFrom2PtsAndCenter(vp1, vp2, vpArc, args);
                    
                    // still push the normal p1/p2 point for debug
                    p2.g2 = true;
                    p2.threeObjArc = threeObjArc;
                    group = this.getLineGroup(p2, args);
                    // these golden lines showing start/end of a g2 or g3 arc were confusing people
                    // so hiding them for now. jlauer 8/15/15
                    /*
                    geometry = group.geometry;
                    geometry.vertices.push(
                        new THREE.Vector3(p1.x, p1.y, p1.z));
                    geometry.vertices.push(
                        new THREE.Vector3(p2.x, p2.y, p2.z));
                    geometry.colors.push(group.color);
                    geometry.colors.push(group.color);
                    */
                } else {
                    geometry.vertices.push(
                        new THREE.Vector3(p1.x, p1.y, p1.z));
                    geometry.vertices.push(
                        new THREE.Vector3(p2.x, p2.y, p2.z));
                    geometry.colors.push(group.color);
                    geometry.colors.push(group.color);
                }
                
                if (p2.extruding) {
                    bbbox.min.x = Math.min(bbbox.min.x, p2.x);
                    bbbox.min.y = Math.min(bbbox.min.y, p2.y);
                    bbbox.min.z = Math.min(bbbox.min.z, p2.z);
                    bbbox.max.x = Math.max(bbbox.max.x, p2.x);
                    bbbox.max.y = Math.max(bbbox.max.y, p2.y);
                    bbbox.max.z = Math.max(bbbox.max.z, p2.z);
                }
                if (p2.g0) {
                    // we're in a toolhead move, label moves
                    /*
                    if (group.segmentCount < 2) {
                    this.makeSprite(this.scene, "webgl", {
                        x: p2.x,
                        y: p2.y,
                        z: p2.z + 0,
                        text: group.segmentCount,
                        color: "#ff00ff",
                        size: 3,
                    });
                    }
                    */
                }
                // global bounding box calc
                bbbox2.min.x = Math.min(bbbox2.min.x, p2.x);
                bbbox2.min.y = Math.min(bbbox2.min.y, p2.y);
                bbbox2.min.z = Math.min(bbbox2.min.z, p2.z);
                bbbox2.max.x = Math.max(bbbox2.max.x, p2.x);
                bbbox2.max.y = Math.max(bbbox2.max.y, p2.y);
                bbbox2.max.z = Math.max(bbbox2.max.z, p2.z);
                
                // NEW METHOD OF CREATING THREE.JS OBJECTS
                // create new approach for three.js objects which is
                // a unique object for each line of gcode, including g2/g3's
                // make sure userData is good too
                var gcodeObj;
                
                if (p2.arc) {
                    // use the arc that already got built
                    gcodeObj = p2.threeObjArc;
                } else {
                    // make a line
                    var color = 0X0000ff;
                    
                    if (p2.extruding) {
                        color = 0xff00ff;
                    } else if (p2.g0) {
                        color = 0x00ff00;
                    } else if (p2.g2) {
                        //color = 0x999900;
                    } else if (p2.arc) {
                        color = 0x0033ff;
                    }
                    
                    var material = new THREE.LineBasicMaterial({
                        color: color,
                        opacity: 0.5,
                        transparent: true
                    });
                    
                    var geometry = new THREE.Geometry();
                    geometry.vertices.push(
                        new THREE.Vector3( p1.x, p1.y, p1.z ),
                        new THREE.Vector3( p2.x, p2.y, p2.z )
                    );
                    
                    var line = new THREE.Line( geometry, material );
                    gcodeObj = line;
                }
                gcodeObj.userData.p2 = p2;
                gcodeObj.userData.args = args;
                new3dObj.add(gcodeObj);
                
                // DISTANCE CALC
                // add distance so we can calc estimated time to run
                // see if arc
                var dist = 0;
                if (p2.arc) {
                    // calc dist of all lines
                    //console.log("this is an arc to calc dist for. p2.threeObjArc:", p2.threeObjArc, "p2:", p2);
                    var arcGeo = p2.threeObjArc.geometry;
                    //console.log("arcGeo:", arcGeo);
                                        
                    var tad2 = 0;
                    for (var arcLineCtr = 0; arcLineCtr < arcGeo.vertices.length - 1; arcLineCtr++) {
                        tad2 += arcGeo.vertices[arcLineCtr].distanceTo(arcGeo.vertices[arcLineCtr+1]);
                    }
                    //console.log("tad2:", tad2);
                    
                    
                    // just do straight line calc
                    var a = new THREE.Vector3( p1.x, p1.y, p1.z );
                    var b = new THREE.Vector3( p2.x, p2.y, p2.z );
                    var straightDist = a.distanceTo(b);
                    
                    //console.log("diff of straight line calc vs arc sum. straightDist:", straightDist);
                    
                    dist = tad2;
                    
                } else {
                    // just do straight line calc
                    var a = new THREE.Vector3( p1.x, p1.y, p1.z );
                    var b = new THREE.Vector3( p2.x, p2.y, p2.z );
                    dist = a.distanceTo(b);
                }
                
                if (dist > 0) {
                    this.totalDist += dist;
                }
                
                // time to execute this move
                // if this move is 10mm and we are moving at 100mm/min then
                // this move will take 10/100 = 0.1 minutes or 6 seconds
                var timeMinutes = 0;
                if (dist > 0) {
                    var fr;
                    if (args.feedrate > 0) {
                        fr = args.feedrate
                    } else {
                        fr = 100;
                    }
                    timeMinutes = dist / fr;
                    
                    // adjust for acceleration, meaning estimate
                    // this will run longer than estimated from the math
                    // above because we don't start moving at full feedrate
                    // obviously, we have to slowly accelerate in and out
                    timeMinutes = timeMinutes * 1.32;
                }
                this.totalTime += timeMinutes;

                p2.feedrate = args.feedrate;
                p2.dist = dist;
                p2.distSum = this.totalDist;
                p2.timeMins = timeMinutes;
                p2.timeMinsSum = this.totalTime;
                
                //console.log("calculating distance. dist:", dist, "totalDist:", this.totalDist, "feedrate:", args.feedrate, "timeMinsToExecute:", timeMinutes, "totalTime:", this.totalTime, "p1:", p1, "p2:", p2, "args:", args);
                
            }
            this.totalDist = 0;
            this.totalTime = 0;
            
            var relative = false;

            this.delta = function (v1, v2) {
                return relative ? v2 : v2 - v1;
            }

            this.absolute = function (v1, v2) {
                return relative ? v1 + v2 : v2;
            }

            var ijkrelative = true;  // For Mach3 Arc IJK Absolute mode
            this.ijkabsolute = function (v1, v2) {
                return ijkrelative ? v1 + v2 : v2;
            }
            
            this.addFakeSegment = function(args) {
                //line.args = args;
                var arg2 = {
                    isFake : true,
                    text : args.text,
                    indx : args.indx
                };
                if (arg2.text.match(/^(;|\(|<)/)) arg2.isComment = true;
                lines.push({
                    p2: lastLine,    // since this is fake, just use lastLine as xyz
                    'args': arg2
                });
            }

            var cofg = this;
            var parser = new this.GCodeParser({
                //set the g92 offsets for the parser - defaults to no offset
                /* When doing CNC, generally G0 just moves to a new location
                as fast as possible which means no milling or extruding is happening in G0.
                So, let's color it uniquely to indicate it's just a toolhead move. */
                G0: function (args, indx) {
                    //G1.apply(this, args, line, 0x00ff00);
                    //console.log("G0", args);
                    var newLine = {
                        x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
                        y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
                        z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
                        e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
                        f: args.f !== undefined ? cofg.absolute(lastLine.f, args.f) : lastLine.f,
                    };
                    newLine.g0 = true;
                    //cofg.newLayer(newLine);
                    
                    cofg.addSegment(lastLine, newLine, args);
                    //console.log("G0", lastLine, newLine, args, cofg.offsetG92);
                    lastLine = newLine;
                },  
                G1: function (args, indx) {
                    // Example: G1 Z1.0 F3000
                    //          G1 X99.9948 Y80.0611 Z15.0 F1500.0 E981.64869
                    //          G1 E104.25841 F1800.0
                    // Go in a straight line from the current (X, Y) point
                    // to the point (90.6, 13.8), extruding material as the move
                    // happens from the current extruded length to a length of
                    // 22.4 mm.

                    var newLine = {
                        x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
                        y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
                        z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
                        e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
                        f: args.f !== undefined ? cofg.absolute(lastLine.f, args.f) : lastLine.f,

                    };
                    /* layer change detection is or made by watching Z, it's made by
         watching when we extrude at a new Z position */
                    if (cofg.delta(lastLine.e, newLine.e) > 0) {
                        newLine.extruding = cofg.delta(lastLine.e, newLine.e) > 0;
                        if (layer == undefined || newLine.z != layer.z) cofg.newLayer(newLine);
                    }
                    cofg.addSegment(lastLine, newLine, args);
                    //console.log("G1", lastLine, newLine, args, cofg.offsetG92);
                    lastLine = newLine;
                },
                G2: function (args, indx, gcp) {
                    /* this is an arc move from lastLine's xy to the new xy. we'll
                    show it as a light gray line, but we'll also sub-render the
                    arc itself by figuring out the sub-segments . */
                    
                    args.plane = plane; //set the plane for this command to whatever the current plane is
                    
                    var newLine = {
                        x: args.x !== undefined ? cofg.absolute(lastLine.x, args.x) + cofg.offsetG92.x : lastLine.x,
                        y: args.y !== undefined ? cofg.absolute(lastLine.y, args.y) + cofg.offsetG92.y : lastLine.y,
                        z: args.z !== undefined ? cofg.absolute(lastLine.z, args.z) + cofg.offsetG92.z : lastLine.z,
                        e: args.e !== undefined ? cofg.absolute(lastLine.e, args.e) + cofg.offsetG92.e : lastLine.e,
                        f: args.f !== undefined ? cofg.absolute(lastLine.f, args.f) : lastLine.f,
                        arci: args.i !== undefined ? cofg.ijkabsolute(lastLine.x, args.i) : lastLine.x,
                        arcj: args.j !== undefined ? cofg.ijkabsolute(lastLine.y, args.j) : lastLine.y,
                        arck: args.k !== undefined ? cofg.ijkabsolute(lastLine.z, args.k) : lastLine.z,
                        arcr: args.r ? args.r : null,
                    };
                   
                    //console.log("G2 newLine:", newLine);
                    //newLine.g2 = true;
                    newLine.arc = true;
                    newLine.clockwise = true;
                    if (args.clockwise === false) newLine.clockwise = args.clockwise;
                    cofg.addSegment(lastLine, newLine, args);
                    //console.log("G2", lastLine, newLine, args, cofg.offsetG92);
                    lastLine = newLine;
                    //console.log("G2. args:", args);
                },
                G3: function (args, indx, gcp) {
                    /* this is an arc move from lastLine's xy to the new xy. same
                    as G2 but reverse*/
                    args.arc = true;
                    args.clockwise = false;
                    gcp.handlers.G2(args, indx, gcp);
                },

                G73: function(args, indx, gcp) {
                    // peck drilling. just treat as g1
                    console.log("G73 gcp:", gcp);
                    gcp.handlers.G1(args);
                },

                G92: function (args) { // E0
                    // G92: Set Position
                    // Example: G92 E0
                    // Allows programming of absolute zero point, by reseting the
                    // current position to the values specified. This would set the
                    // machine's X coordinate to 10, and the extrude coordinate to 90.
                    // No physical motion will occur.

                    // TODO: Only support E0
                    var newLine = lastLine;
                    
                    cofg.offsetG92.x = (args.x !== undefined ? (args.x === 0 ? newLine.x : newLine.x - args.x) : 0);
                    cofg.offsetG92.y = (args.y !== undefined ? (args.y === 0 ? newLine.y : newLine.y - args.y) : 0);
                    cofg.offsetG92.z = (args.z !== undefined ? (args.z === 0 ? newLine.z : newLine.z - args.z) : 0);
                    cofg.offsetG92.e = (args.e !== undefined ? (args.e === 0 ? newLine.e : newLine.e - args.e) : 0);

                    //newLine.x = args.x !== undefined ? args.x + newLine.x : newLine.x;
                    //newLine.y = args.y !== undefined ? args.y + newLine.y : newLine.y;
                    //newLine.z = args.z !== undefined ? args.z + newLine.z : newLine.z;
                    //newLine.e = args.e !== undefined ? args.e + newLine.e : newLine.e;
                    
                    //console.log("G92", lastLine, newLine, args, cofg.offsetG92);
                    
                    //lastLine = newLine;
                    cofg.addFakeSegment(args);
                },
                M30: function (args) {
                    cofg.addFakeSegment(args);
                },

                'default': function (args, info) {
                    //if (!args.isComment)
                    //    console.log('Unknown command:', args.cmd, args, info);
                    cofg.addFakeSegment(args);
                },
            },
            // Mode-setting non-motion commands, of which many may appear on one line
            // These take no arguments
            {
                G17: function () {
                    console.log("SETTING XY PLANE");
                    plane = "G17";
                },

                G18: function () {
                    console.log("SETTING XZ PLANE");
                    plane = "G18";
                },

                G19: function () {
                    console.log("SETTING YZ PLANE");
                    plane = "G19";
                },

                G20: function () {
                    // G21: Set Units to Inches
                    // We don't really have to do anything since 3d viewer is unit agnostic
                    // However, we need to set a global property so the trinket decorations
                    // like toolhead, axes, grid, and extent labels are scaled correctly
                    // later on when they are drawn after the gcode is rendered
                    cofg.setUnits("inch");
                },

                G21: function () {
                    // G21: Set Units to Millimeters
                    // Example: G21
                    // Units from now on are in millimeters. (This is the RepRap default.)
                    cofg.setUnits("mm");
                },

                // A bunch of no-op modes that do not affect the viewer
                G40: function () {}, // Tool radius compensation off
                G41: function () {}, // Tool radius compensation left
                G42: function () {}, // Tool radius compensation right
                G45: function () {}, // Axis offset single increase
                G46: function () {}, // Axis offset single decrease
                G47: function () {}, // Axis offset double increase
                G48: function () {}, // Axis offset double decrease
                G49: function () {}, // Tool length offset compensation cancle
                G54: function () {}, // Select work coordinate system 1
                G55: function () {}, // Select work coordinate system 2
                G56: function () {}, // Select work coordinate system 3
                G57: function () {}, // Select work coordinate system 4
                G58: function () {}, // Select work coordinate system 5
                G59: function () {}, // Select work coordinate system 6
                G61: function () {}, // Exact stop check mode
                G64: function () {}, // Cancel G61
                G69: function () {}, // Cancel G68

                G90: function () {
                    // G90: Set to Absolute Positioning
                    // Example: G90
                    // All coordinates from now on are absolute relative to the
                    // origin of the machine. (This is the RepRap default.)
                    relative = false;
                },

                'G90.1': function () {
                    // G90.1: Set to Arc Absolute IJK Positioning
                    // Example: G90.1
                    // From now on, arc centers are specified directly by
                    // the IJK parameters, e.g. center_x = I_value
                    // This is Mach3-specific
                    ijkrelative = false;
                },

                G91: function () {
                    // G91: Set to Relative Positioning
                    // Example: G91
                    // All coordinates from now on are relative to the last position.
                    relative = true;
                },

                'G91.1': function () {
                    // G91.1: Set to Arc Relative IJK Positioning
                    // Example: G91.1
                    // From now on, arc centers are relative to the starting
                    // coordinate, e.g. center_x = this_x + I_value
                    // This is the default, and the only possibility for most
                    // controllers other than Mach3
                    ijkrelative = true;
                },

                // No-op modal macros that do not affect the viewer
                M07: function () {}, // Coolant on (mist)
                M08: function () {}, // Coolant on (flood)
                M09: function () {}, // Coolant off
                M10: function () {}, // Pallet clamp on
                M11: function () {}, // Pallet clamp off
                M21: function () {}, // Mirror X axis
                M22: function () {}, // Mirror Y axis
                M23: function () {}, // Mirror off
                M24: function () {}, // Thread pullout gradual off
                M41: function () {}, // Select gear 1
                M42: function () {}, // Select gear 2
                M43: function () {}, // Select gear 3
                M44: function () {}, // Select gear 4
                M48: function () {}, // Allow feedrate override
                M49: function () {}, // Disallow feedrate override
                M52: function () {}, // Empty spindle
                M60: function () {}, // Automatic pallet change

                M82: function () {
                    // M82: Set E codes absolute (default)
                    // Descriped in Sprintrun source code.

                    // No-op, so long as M83 is not supported.
                },

                M84: function () {
                    // M84: Stop idle hold
                    // Example: M84
                    // Stop the idle hold on all axis and extruder. In some cases the
                    // idle hold causes annoying noises, which can be stopped by
                    // disabling the hold. Be aware that by disabling idle hold during
                    // printing, you will get quality issues. This is recommended only
                    // in between or after printjobs.

                    // No-op
                },
            });

            parser.parse(gcode);

            console.log("inside creatGcodeFromObject. this:", this);

            console.log("Layer Count ", layers.length);

            
            var object = new THREE.Object3D();
            
            
            // old approach of monolithic line segment
            for (var lid in layers) {
                var layer = layers[lid];
                //      console.log("Layer ", layer.layer);
                for (var tid in layer.type) {
                    var type = layer.type[tid];
                    //console.log("Layer:", layer.layer, "type:", type, "segCnt:", type.segmentCount);
                    // normal geometry (not buffered)
                    //object.add(new THREE.Line(type.geometry, type.material, THREE.LinePieces));
                    // using buffer geometry
                    var bufferGeo = this.convertLineGeometryToBufferGeometry( type.geometry, type.color );
                    object.add(new THREE.Line(bufferGeo, type.material, THREE.LinePieces));
                }
            }
            //XY PLANE
            this.extraObjects["G17"].forEach(function(obj) {
                // non-buffered approach
                //object.add(obj);
                
                // buffered approach
                // convert g2/g3's to buffer geo as well
                //console.log("extra object:", obj);
                var bufferGeo = this.convertLineGeometryToBufferGeometry( obj.geometry, obj.material.color );
                object.add(new THREE.Line(bufferGeo, obj.material));
            }, this);
            //XZ PLANE
            this.extraObjects["G18"].forEach(function(obj) {
                // buffered approach
                var bufferGeo = this.convertLineGeometryToBufferGeometry( obj.geometry, obj.material.color );
                var tmp = new THREE.Line(bufferGeo, obj.material)
                tmp.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
                object.add(tmp);
            }, this);
            //YZ PLANE
            this.extraObjects["G19"].forEach(function(obj) {
                // buffered approach
                var bufferGeo = this.convertLineGeometryToBufferGeometry( obj.geometry, obj.material.color );
                var tmp = new THREE.Line(bufferGeo, obj.material)
                tmp.rotateOnAxis(new THREE.Vector3(1,0,0),Math.PI/2);
                tmp.rotateOnAxis(new THREE.Vector3(0,1,0),Math.PI/2);
                object.add(tmp);
            }, this);
            
            // use new approach of building 3d object where each
            // gcode line is its own segment with its own userData
            //object = new3dObj;


            console.log("bbox ", bbbox);

            // Center
            var scale = 1; // TODO: Auto size

            var center = new THREE.Vector3(
            bbbox.min.x + ((bbbox.max.x - bbbox.min.x) / 2),
            bbbox.min.y + ((bbbox.max.y - bbbox.min.y) / 2),
            bbbox.min.z + ((bbbox.max.z - bbbox.min.z) / 2));
            console.log("center ", center);

            var center2 = new THREE.Vector3(
            bbbox2.min.x + ((bbbox2.max.x - bbbox2.min.x) / 2),
            bbbox2.min.y + ((bbbox2.max.y - bbbox2.min.y) / 2),
            bbbox2.min.z + ((bbbox2.max.z - bbbox2.min.z) / 2));
            console.log("center2 of all gcode ", center2);

            // store meta data in userData of object3d for later use like in animation
            // of toolhead
            object.userData.bbbox2 = bbbox2;
            object.userData.lines = lines;
            object.userData.layers = layers;
            object.userData.center2 = center2;
            object.userData.extraObjects = this.extraObjects;
            object.userData.threeObjs = new3dObj;
            
            console.log("userData for this object3d:", object.userData);
            /*
            this.camera.target.x = center2.x;
            this.camera.target.y = center2.y;
            this.camera.target.z = center2.z;
            */

            //object.position = center.multiplyScalar(-scale);

            //object.scale.multiplyScalar(scale);
            console.log("final object:", object);

            return object;
        },
        convertLineGeometryToBufferGeometry: function(lineGeometry, color) {
            
            var positions = new Float32Array( lineGeometry.vertices.length * 3 );
            var colors = new Float32Array( lineGeometry.vertices.length * 3 );
            
            var r = 800;
            
            var geometry = new THREE.BufferGeometry();
            
            for (var i = 0; i < lineGeometry.vertices.length; i++) {
                
                var x = lineGeometry.vertices[i].x;
                var y = lineGeometry.vertices[i].y;
                var z = lineGeometry.vertices[i].z;
                
                // positions
                positions[ i * 3 ] = x;
                positions[ i * 3 + 1 ] = y;
                positions[ i * 3 + 2 ] = z;
                
                // colors
                colors[ i * 3 ] = color.r;
                colors[ i * 3 + 1 ] = color.g;
                colors[ i * 3 + 2 ] = color.b;
            }
            
            geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
            geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
            
            geometry.computeBoundingSphere();
            
            return geometry;
        },
        
     
    }

});

function loadTrackballControls() {

    THREE.TrackballControls = function ( object, domElement ) {

        var _this = this;
        var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };
    
        this.object = object;
        this.domElement = ( domElement !== undefined ) ? domElement : document;
    
        // API
    
        this.enabled = true;
    
        this.screen = { left: 0, top: 0, width: 0, height: 0 };
    
        this.rotateSpeed = 1.0;
        this.zoomSpeed = 1.2;
        this.panSpeed = 0.3;
    
        this.noRotate = false;
        this.noZoom = false;
        this.noPan = false;
    
        this.staticMoving = false;
        this.dynamicDampingFactor = 0.2;
    
        this.minDistance = 0;
        this.maxDistance = Infinity;
    
        this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];
    
        // internals
    
        this.target = new THREE.Vector3();
    
        var EPS = 0.000001;
    
        var lastPosition = new THREE.Vector3();
    
        var _state = STATE.NONE,
            _prevState = STATE.NONE,
    
            _eye = new THREE.Vector3(),
    
            _movePrev = new THREE.Vector2(),
            _moveCurr = new THREE.Vector2(),
    
            _lastAxis = new THREE.Vector3(),
            _lastAngle = 0,
    
            _zoomStart = new THREE.Vector2(),
            _zoomEnd = new THREE.Vector2(),
    
            _touchZoomDistanceStart = 0,
            _touchZoomDistanceEnd = 0,
    
            _panStart = new THREE.Vector2(),
            _panEnd = new THREE.Vector2();
    
        // for reset
    
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.up0 = this.object.up.clone();
    
        // events
    
        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };
    
    
        // methods
    
        this.handleResize = function () {
    
            if ( this.domElement === document ) {
    
                this.screen.left = 0;
                this.screen.top = 0;
                this.screen.width = window.innerWidth;
                this.screen.height = window.innerHeight;
    
            } else {
    
                var box = this.domElement.getBoundingClientRect();
                // adjustments come from similar code in the jquery offset() function
                var d = this.domElement.ownerDocument.documentElement;
                this.screen.left = box.left + window.pageXOffset - d.clientLeft;
                this.screen.top = box.top + window.pageYOffset - d.clientTop;
                this.screen.width = box.width;
                this.screen.height = box.height;
    
            }
    
        };
    
        var getMouseOnScreen = ( function () {
    
            var vector = new THREE.Vector2();
    
            return function getMouseOnScreen( pageX, pageY ) {
    
                vector.set(
                    ( pageX - _this.screen.left ) / _this.screen.width,
                    ( pageY - _this.screen.top ) / _this.screen.height
                );
    
                return vector;
    
            };
    
        }() );
    
        var getMouseOnCircle = ( function () {
    
            var vector = new THREE.Vector2();
    
            return function getMouseOnCircle( pageX, pageY ) {
    
                vector.set(
                    ( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
                    ( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
                );
    
                return vector;
    
            };
    
        }() );
    
        this.rotateCamera = ( function () {
    
            var axis = new THREE.Vector3(),
                quaternion = new THREE.Quaternion(),
                eyeDirection = new THREE.Vector3(),
                objectUpDirection = new THREE.Vector3(),
                objectSidewaysDirection = new THREE.Vector3(),
                moveDirection = new THREE.Vector3(),
                angle;
    
            return function rotateCamera() {
    
                moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );
                angle = moveDirection.length();
    
                if ( angle ) {
    
                    _eye.copy( _this.object.position ).sub( _this.target );
    
                    eyeDirection.copy( _eye ).normalize();
                    objectUpDirection.copy( _this.object.up ).normalize();
                    objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();
    
                    objectUpDirection.setLength( _moveCurr.y - _movePrev.y );
                    objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );
    
                    moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );
    
                    axis.crossVectors( moveDirection, _eye ).normalize();
    
                    angle *= _this.rotateSpeed;
                    quaternion.setFromAxisAngle( axis, angle );
    
                    _eye.applyQuaternion( quaternion );
                    _this.object.up.applyQuaternion( quaternion );
    
                    _lastAxis.copy( axis );
                    _lastAngle = angle;
    
                } else if ( ! _this.staticMoving && _lastAngle ) {
    
                    _lastAngle *= Math.sqrt( 1.0 - _this.dynamicDampingFactor );
                    _eye.copy( _this.object.position ).sub( _this.target );
                    quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
                    _eye.applyQuaternion( quaternion );
                    _this.object.up.applyQuaternion( quaternion );
    
                }
    
                _movePrev.copy( _moveCurr );
    
            };
    
        }() );
    
    
        this.zoomCamera = function () {
    
            var factor;
    
            if ( _state === STATE.TOUCH_ZOOM_PAN ) {
    
                factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
                _touchZoomDistanceStart = _touchZoomDistanceEnd;
                _eye.multiplyScalar( factor );
    
            } else {
    
                factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;
    
                if ( factor !== 1.0 && factor > 0.0 ) {
    
                    _eye.multiplyScalar( factor );
    
                }
    
                if ( _this.staticMoving ) {
    
                    _zoomStart.copy( _zoomEnd );
    
                } else {
    
                    _zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;
    
                }
    
            }
    
        };
    
        this.panCamera = ( function () {
    
            var mouseChange = new THREE.Vector2(),
                objectUp = new THREE.Vector3(),
                pan = new THREE.Vector3();
    
            return function panCamera() {
    
                mouseChange.copy( _panEnd ).sub( _panStart );
    
                if ( mouseChange.lengthSq() ) {
    
                    mouseChange.multiplyScalar( _eye.length() * _this.panSpeed );
    
                    pan.copy( _eye ).cross( _this.object.up ).setLength( mouseChange.x );
                    pan.add( objectUp.copy( _this.object.up ).setLength( mouseChange.y ) );
    
                    _this.object.position.add( pan );
                    _this.target.add( pan );
    
                    if ( _this.staticMoving ) {
    
                        _panStart.copy( _panEnd );
    
                    } else {
    
                        _panStart.add( mouseChange.subVectors( _panEnd, _panStart ).multiplyScalar( _this.dynamicDampingFactor ) );
    
                    }
    
                }
    
            };
    
        }() );
    
        this.checkDistances = function () {
    
            if ( ! _this.noZoom || ! _this.noPan ) {
    
                if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {
    
                    _this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );
                    _zoomStart.copy( _zoomEnd );
    
                }
    
                if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {
    
                    _this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );
                    _zoomStart.copy( _zoomEnd );
    
                }
    
            }
    
        };
    
        this.update = function () {
    
            _eye.subVectors( _this.object.position, _this.target );
    
            if ( ! _this.noRotate ) {
    
                _this.rotateCamera();
    
            }
    
            if ( ! _this.noZoom ) {
    
                _this.zoomCamera();
    
            }
    
            if ( ! _this.noPan ) {
    
                _this.panCamera();
    
            }
    
            _this.object.position.addVectors( _this.target, _eye );
    
            _this.checkDistances();
    
            _this.object.lookAt( _this.target );
    
            if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {
    
                _this.dispatchEvent( changeEvent );
    
                lastPosition.copy( _this.object.position );
    
            }
    
        };
    
        this.reset = function () {
    
            _state = STATE.NONE;
            _prevState = STATE.NONE;
    
            _this.target.copy( _this.target0 );
            _this.object.position.copy( _this.position0 );
            _this.object.up.copy( _this.up0 );
    
            _eye.subVectors( _this.object.position, _this.target );
    
            _this.object.lookAt( _this.target );
    
            _this.dispatchEvent( changeEvent );
    
            lastPosition.copy( _this.object.position );
    
        };
    
        // listeners
    
        function keydown( event ) {
    
            if ( _this.enabled === false ) return;
    
            window.removeEventListener( 'keydown', keydown );
    
            _prevState = _state;
    
            if ( _state !== STATE.NONE ) {
    
                return;
    
            } else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && ! _this.noRotate ) {
    
                _state = STATE.ROTATE;
    
            } else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && ! _this.noZoom ) {
    
                _state = STATE.ZOOM;
    
            } else if ( event.keyCode === _this.keys[ STATE.PAN ] && ! _this.noPan ) {
    
                _state = STATE.PAN;
    
            }
    
        }
    
        function keyup( event ) {
    
            if ( _this.enabled === false ) return;
    
            _state = _prevState;
    
            window.addEventListener( 'keydown', keydown, false );
    
        }
    
        function mousedown( event ) {
    
            if ( _this.enabled === false ) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            if ( _state === STATE.NONE ) {
    
                _state = event.button;
    
            }
    
            if ( _state === STATE.ROTATE && ! _this.noRotate ) {
    
                _moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
                _movePrev.copy( _moveCurr );
    
            } else if ( _state === STATE.ZOOM && ! _this.noZoom ) {
    
                _zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
                _zoomEnd.copy( _zoomStart );
    
            } else if ( _state === STATE.PAN && ! _this.noPan ) {
    
                _panStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
                _panEnd.copy( _panStart );
    
            }
    
            document.addEventListener( 'mousemove', mousemove, false );
            document.addEventListener( 'mouseup', mouseup, false );
    
            _this.dispatchEvent( startEvent );
    
        }
    
        function mousemove( event ) {
    
            if ( _this.enabled === false ) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            if ( _state === STATE.ROTATE && ! _this.noRotate ) {
    
                _movePrev.copy( _moveCurr );
                _moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
    
            } else if ( _state === STATE.ZOOM && ! _this.noZoom ) {
    
                _zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );
    
            } else if ( _state === STATE.PAN && ! _this.noPan ) {
    
                _panEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );
    
            }
    
        }
    
        function mouseup( event ) {
    
            if ( _this.enabled === false ) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            _state = STATE.NONE;
    
            document.removeEventListener( 'mousemove', mousemove );
            document.removeEventListener( 'mouseup', mouseup );
            _this.dispatchEvent( endEvent );
    
        }
    
        function mousewheel( event ) {
    
            if ( _this.enabled === false ) return;
    
            if ( _this.noZoom === true ) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            switch ( event.deltaMode ) {
    
                case 2:
                    // Zoom in pages
                    _zoomStart.y -= event.deltaY * 0.025;
                    break;
    
                case 1:
                    // Zoom in lines
                    _zoomStart.y -= event.deltaY * 0.01;
                    break;
    
                default:
                    // undefined, 0, assume pixels
                    _zoomStart.y -= event.deltaY * 0.00025;
                    break;
    
            }
    
            _this.dispatchEvent( startEvent );
            _this.dispatchEvent( endEvent );
    
        }
    
        function touchstart( event ) {
    
            if ( _this.enabled === false ) return;
            
            event.preventDefault();
    
            switch ( event.touches.length ) {
    
                case 1:
                    _state = STATE.TOUCH_ROTATE;
                    _moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                    _movePrev.copy( _moveCurr );
                    break;
    
                default: // 2 or more
                    _state = STATE.TOUCH_ZOOM_PAN;
                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    _touchZoomDistanceEnd = _touchZoomDistanceStart = Math.sqrt( dx * dx + dy * dy );
    
                    var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                    var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                    _panStart.copy( getMouseOnScreen( x, y ) );
                    _panEnd.copy( _panStart );
                    break;
    
            }
    
            _this.dispatchEvent( startEvent );
    
        }
    
        function touchmove( event ) {
    
            if ( _this.enabled === false ) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            switch ( event.touches.length ) {
    
                case 1:
                    _movePrev.copy( _moveCurr );
                    _moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                    break;
    
                default: // 2 or more
                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    _touchZoomDistanceEnd = Math.sqrt( dx * dx + dy * dy );
    
                    var x = ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX ) / 2;
                    var y = ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY ) / 2;
                    _panEnd.copy( getMouseOnScreen( x, y ) );
                    break;
    
            }
    
        }
    
        function touchend( event ) {
    
            if ( _this.enabled === false ) return;
    
            switch ( event.touches.length ) {
    
                case 0:
                    _state = STATE.NONE;
                    break;
    
                case 1:
                    _state = STATE.TOUCH_ROTATE;
                    _moveCurr.copy( getMouseOnCircle( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) );
                    _movePrev.copy( _moveCurr );
                    break;
    
            }
    
            _this.dispatchEvent( endEvent );
    
        }
    
        function contextmenu( event ) {
    
            if ( _this.enabled === false ) return;
    
            event.preventDefault();
    
        }
    
        this.dispose = function () {
    
            this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
            this.domElement.removeEventListener( 'mousedown', mousedown, false );
            this.domElement.removeEventListener( 'wheel', mousewheel, false );
    
            this.domElement.removeEventListener( 'touchstart', touchstart, false );
            this.domElement.removeEventListener( 'touchend', touchend, false );
            this.domElement.removeEventListener( 'touchmove', touchmove, false );
    
            document.removeEventListener( 'mousemove', mousemove, false );
            document.removeEventListener( 'mouseup', mouseup, false );
    
            window.removeEventListener( 'keydown', keydown, false );
            window.removeEventListener( 'keyup', keyup, false );
    
        };
    
        this.domElement.addEventListener( 'contextmenu', contextmenu, false );
        this.domElement.addEventListener( 'mousedown', mousedown, false );
        this.domElement.addEventListener( 'wheel', mousewheel, false );
    
        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );
    
        window.addEventListener( 'keydown', keydown, false );
        window.addEventListener( 'keyup', keyup, false );
    
        this.handleResize();
    
        // force an update at start
        this.update();
    
    };
    
    THREE.TrackballControls.prototype = Object.create( THREE.EventDispatcher.prototype );
    THREE.TrackballControls.prototype.constructor = THREE.TrackballControls;

    THREE.OrbitControls = function ( object, domElement ) {

        this.object = object;
    
        this.domElement = ( domElement !== undefined ) ? domElement : document;
    
        // Set to false to disable this control
        this.enabled = true;
    
        // "target" sets the location of focus, where the object orbits around
        this.target = new THREE.Vector3();
    
        // How far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = 0;
        this.maxDistance = Infinity;
    
        // How far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Infinity;
    
        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians
    
        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle = - Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians
    
        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.enableDamping = false;
        this.dampingFactor = 0.25;
    
        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;
    
        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 1.0;
    
        // Set to false to disable panning
        this.enablePan = true;
        this.panSpeed = 1.0;
        this.screenSpacePanning = false; // if true, pan in screen-space
        this.keyPanSpeed = 7.0;	// pixels moved per arrow key push
    
        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
    
        // Set to false to disable use of the keys
        this.enableKeys = true;
    
        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };
    
        // Mouse buttons
        this.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };
    
        // for reset
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
    
        //
        // public methods
        //
    
        this.getPolarAngle = function () {
    
            return spherical.phi;
    
        };
    
        this.getAzimuthalAngle = function () {
    
            return spherical.theta;
    
        };
    
        this.saveState = function () {
    
            scope.target0.copy( scope.target );
            scope.position0.copy( scope.object.position );
            scope.zoom0 = scope.object.zoom;
    
        };
    
        this.reset = function () {
    
            scope.target.copy( scope.target0 );
            scope.object.position.copy( scope.position0 );
            scope.object.zoom = scope.zoom0;
    
            scope.object.updateProjectionMatrix();
            scope.dispatchEvent( changeEvent );
    
            scope.update();
    
            state = STATE.NONE;
    
        };
    
        // this method is exposed, but perhaps it would be better if we can make it private...
        this.update = function () {
    
            var offset = new THREE.Vector3();
    
            // so camera.up is the orbit axis
            var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
            var quatInverse = quat.clone().inverse();
    
            var lastPosition = new THREE.Vector3();
            var lastQuaternion = new THREE.Quaternion();
    
            return function update() {
    
                var position = scope.object.position;
    
                offset.copy( position ).sub( scope.target );
    
                // rotate offset to "y-axis-is-up" space
                offset.applyQuaternion( quat );
    
                // angle from z-axis around y-axis
                spherical.setFromVector3( offset );
    
                if ( scope.autoRotate && state === STATE.NONE ) {
    
                    rotateLeft( getAutoRotationAngle() );
    
                }
    
                spherical.theta += sphericalDelta.theta;
                spherical.phi += sphericalDelta.phi;
    
                // restrict theta to be between desired limits
                spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );
    
                // restrict phi to be between desired limits
                spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );
    
                spherical.makeSafe();
    
    
                spherical.radius *= scale;
    
                // restrict radius to be between desired limits
                spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );
    
                // move target to panned location
                scope.target.add( panOffset );
    
                offset.setFromSpherical( spherical );
    
                // rotate offset back to "camera-up-vector-is-up" space
                offset.applyQuaternion( quatInverse );
    
                position.copy( scope.target ).add( offset );
    
                scope.object.lookAt( scope.target );
    
                if ( scope.enableDamping === true ) {
    
                    sphericalDelta.theta *= ( 1 - scope.dampingFactor );
                    sphericalDelta.phi *= ( 1 - scope.dampingFactor );
    
                    panOffset.multiplyScalar( 1 - scope.dampingFactor );
    
                } else {
    
                    sphericalDelta.set( 0, 0, 0 );
    
                    panOffset.set( 0, 0, 0 );
    
                }
    
                scale = 1;
    
                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8
    
                if ( zoomChanged ||
                    lastPosition.distanceToSquared( scope.object.position ) > EPS ||
                    8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {
    
                    scope.dispatchEvent( changeEvent );
    
                    lastPosition.copy( scope.object.position );
                    lastQuaternion.copy( scope.object.quaternion );
                    zoomChanged = false;
    
                    return true;
    
                }
    
                return false;
    
            };
    
        }();
    
        this.dispose = function () {
    
            scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
            scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
            scope.domElement.removeEventListener( 'wheel', onMouseWheel, false );
    
            scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
            scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
            scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );
    
            document.removeEventListener( 'mousemove', onMouseMove, false );
            document.removeEventListener( 'mouseup', onMouseUp, false );
    
            window.removeEventListener( 'keydown', onKeyDown, false );
    
            //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    
        };
    
        //
        // internals
        //
    
        var scope = this;
    
        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };
    
        var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };
    
        var state = STATE.NONE;
    
        var EPS = 0.000001;
    
        // current position in spherical coordinates
        var spherical = new THREE.Spherical();
        var sphericalDelta = new THREE.Spherical();
    
        var scale = 1;
        var panOffset = new THREE.Vector3();
        var zoomChanged = false;
    
        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();
    
        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();
    
        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();
    
        function getAutoRotationAngle() {
    
            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
    
        }
    
        function getZoomScale() {
    
            return Math.pow( 0.95, scope.zoomSpeed );
    
        }
    
        function rotateLeft( angle ) {
    
            sphericalDelta.theta -= angle;
    
        }
    
        function rotateUp( angle ) {
    
            sphericalDelta.phi -= angle;
    
        }
    
        var panLeft = function () {
    
            var v = new THREE.Vector3();
    
            return function panLeft( distance, objectMatrix ) {
    
                v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
                v.multiplyScalar( - distance );
    
                panOffset.add( v );
    
            };
    
        }();
    
        var panUp = function () {
    
            var v = new THREE.Vector3();
    
            return function panUp( distance, objectMatrix ) {
    
                if ( scope.screenSpacePanning === true ) {
    
                    v.setFromMatrixColumn( objectMatrix, 1 );
    
                } else {
    
                    v.setFromMatrixColumn( objectMatrix, 0 );
                    v.crossVectors( scope.object.up, v );
    
                }
    
                v.multiplyScalar( distance );
    
                panOffset.add( v );
    
            };
    
        }();
    
        // deltaX and deltaY are in pixels; right and down are positive
        var pan = function () {
    
            var offset = new THREE.Vector3();
    
            return function pan( deltaX, deltaY ) {
    
                var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
    
                if ( scope.object.isPerspectiveCamera ) {
    
                    // perspective
                    var position = scope.object.position;
                    offset.copy( position ).sub( scope.target );
                    var targetDistance = offset.length();
    
                    // half of the fov is center to top of screen
                    targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );
    
                    // we use only clientHeight here so aspect ratio does not distort speed
                    panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
                    panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );
    
                } else if ( scope.object.isOrthographicCamera ) {
    
                    // orthographic
                    panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
                    panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );
    
                } else {
    
                    // camera neither orthographic nor perspective
                    console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
                    scope.enablePan = false;
    
                }
    
            };
    
        }();
    
        function dollyIn( dollyScale ) {
    
            if ( scope.object.isPerspectiveCamera ) {
    
                scale /= dollyScale;
    
            } else if ( scope.object.isOrthographicCamera ) {
    
                scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
                scope.object.updateProjectionMatrix();
                zoomChanged = true;
    
            } else {
    
                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
                scope.enableZoom = false;
    
            }
    
        }
    
        function dollyOut( dollyScale ) {
    
            if ( scope.object.isPerspectiveCamera ) {
    
                scale *= dollyScale;
    
            } else if ( scope.object.isOrthographicCamera ) {
    
                scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
                scope.object.updateProjectionMatrix();
                zoomChanged = true;
    
            } else {
    
                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
                scope.enableZoom = false;
    
            }
    
        }
    
        //
        // event callbacks - update the object state
        //
    
        function handleMouseDownRotate( event ) {
    
            //console.log( 'handleMouseDownRotate' );
    
            rotateStart.set( event.clientX, event.clientY );
    
        }
    
        function handleMouseDownDolly( event ) {
    
            //console.log( 'handleMouseDownDolly' );
    
            dollyStart.set( event.clientX, event.clientY );
    
        }
    
        function handleMouseDownPan( event ) {
    
            //console.log( 'handleMouseDownPan' );
    
            panStart.set( event.clientX, event.clientY );
    
        }
    
        function handleMouseMoveRotate( event ) {
    
            //console.log( 'handleMouseMoveRotate' );
    
            rotateEnd.set( event.clientX, event.clientY );
    
            rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
    
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
    
            rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height
    
            rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
    
            rotateStart.copy( rotateEnd );
    
            scope.update();
    
        }
    
        function handleMouseMoveDolly( event ) {
    
            //console.log( 'handleMouseMoveDolly' );
    
            dollyEnd.set( event.clientX, event.clientY );
    
            dollyDelta.subVectors( dollyEnd, dollyStart );
    
            if ( dollyDelta.y > 0 ) {
    
                dollyIn( getZoomScale() );
    
            } else if ( dollyDelta.y < 0 ) {
    
                dollyOut( getZoomScale() );
    
            }
    
            dollyStart.copy( dollyEnd );
    
            scope.update();
    
        }
    
        function handleMouseMovePan( event ) {
    
            //console.log( 'handleMouseMovePan' );
    
            panEnd.set( event.clientX, event.clientY );
    
            panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );
    
            pan( panDelta.x, panDelta.y );
    
            panStart.copy( panEnd );
    
            scope.update();
    
        }
    
        function handleMouseUp( event ) {
    
            // console.log( 'handleMouseUp' );
    
        }
    
        function handleMouseWheel( event ) {
    
            // console.log( 'handleMouseWheel' );
    
            if ( event.deltaY < 0 ) {
    
                dollyOut( getZoomScale() );
    
            } else if ( event.deltaY > 0 ) {
    
                dollyIn( getZoomScale() );
    
            }
    
            scope.update();
    
        }
    
        function handleKeyDown( event ) {
    
            // console.log( 'handleKeyDown' );
    
            var needsUpdate = false;
    
            switch ( event.keyCode ) {
    
                case scope.keys.UP:
                    pan( 0, scope.keyPanSpeed );
                    needsUpdate = true;
                    break;
    
                case scope.keys.BOTTOM:
                    pan( 0, - scope.keyPanSpeed );
                    needsUpdate = true;
                    break;
    
                case scope.keys.LEFT:
                    pan( scope.keyPanSpeed, 0 );
                    needsUpdate = true;
                    break;
    
                case scope.keys.RIGHT:
                    pan( - scope.keyPanSpeed, 0 );
                    needsUpdate = true;
                    break;
    
            }
    
            if ( needsUpdate ) {
    
                // prevent the browser from scrolling on cursor keys
                event.preventDefault();
    
                scope.update();
    
            }
    
    
        }
    
        function handleTouchStartRotate( event ) {
    
            //console.log( 'handleTouchStartRotate' );
    
            rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    
        }
    
        function handleTouchStartDollyPan( event ) {
    
            //console.log( 'handleTouchStartDollyPan' );
    
            if ( scope.enableZoom ) {
    
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    
                var distance = Math.sqrt( dx * dx + dy * dy );
    
                dollyStart.set( 0, distance );
    
            }
    
            if ( scope.enablePan ) {
    
                var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
                var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
    
                panStart.set( x, y );
    
            }
    
        }
    
        function handleTouchMoveRotate( event ) {
    
            //console.log( 'handleTouchMoveRotate' );
    
            rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    
            rotateDelta.subVectors( rotateEnd, rotateStart ).multiplyScalar( scope.rotateSpeed );
    
            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
    
            rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientHeight ); // yes, height
    
            rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight );
    
            rotateStart.copy( rotateEnd );
    
            scope.update();
    
        }
    
        function handleTouchMoveDollyPan( event ) {
    
            //console.log( 'handleTouchMoveDollyPan' );
    
            if ( scope.enableZoom ) {
    
                var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
    
                var distance = Math.sqrt( dx * dx + dy * dy );
    
                dollyEnd.set( 0, distance );
    
                dollyDelta.set( 0, Math.pow( dollyEnd.y / dollyStart.y, scope.zoomSpeed ) );
    
                dollyIn( dollyDelta.y );
    
                dollyStart.copy( dollyEnd );
    
            }
    
            if ( scope.enablePan ) {
    
                var x = 0.5 * ( event.touches[ 0 ].pageX + event.touches[ 1 ].pageX );
                var y = 0.5 * ( event.touches[ 0 ].pageY + event.touches[ 1 ].pageY );
    
                panEnd.set( x, y );
    
                panDelta.subVectors( panEnd, panStart ).multiplyScalar( scope.panSpeed );
    
                pan( panDelta.x, panDelta.y );
    
                panStart.copy( panEnd );
    
            }
    
            scope.update();
    
        }
    
        function handleTouchEnd( event ) {
    
            //console.log( 'handleTouchEnd' );
    
        }
    
        //
        // event handlers - FSM: listen for events and reset state
        //
    
        function onMouseDown( event ) {
    
            if ( scope.enabled === false ) return;
    
            // Prevent the browser from scrolling.
    
            event.preventDefault();
    
            // Manually set the focus since calling preventDefault above
            // prevents the browser from setting it automatically.
    
            scope.domElement.focus ? scope.domElement.focus() : window.focus();
    
            switch ( event.button ) {
    
                case scope.mouseButtons.LEFT:
    
                    if ( event.ctrlKey || event.metaKey || event.shiftKey ) {
    
                        if ( scope.enablePan === false ) return;
    
                        handleMouseDownPan( event );
    
                        state = STATE.PAN;
    
                    } else {
    
                        if ( scope.enableRotate === false ) return;
    
                        handleMouseDownRotate( event );
    
                        state = STATE.ROTATE;
    
                    }
    
                    break;
    
                case scope.mouseButtons.MIDDLE:
    
                    if ( scope.enableZoom === false ) return;
    
                    handleMouseDownDolly( event );
    
                    state = STATE.DOLLY;
    
                    break;
    
                case scope.mouseButtons.RIGHT:
    
                    if ( scope.enablePan === false ) return;
    
                    handleMouseDownPan( event );
    
                    state = STATE.PAN;
    
                    break;
    
            }
    
            if ( state !== STATE.NONE ) {
    
                document.addEventListener( 'mousemove', onMouseMove, false );
                document.addEventListener( 'mouseup', onMouseUp, false );
    
                scope.dispatchEvent( startEvent );
    
            }
    
        }
    
        function onMouseMove( event ) {
    
            if ( scope.enabled === false ) return;
    
            event.preventDefault();
    
            switch ( state ) {
    
                case STATE.ROTATE:
    
                    if ( scope.enableRotate === false ) return;
    
                    handleMouseMoveRotate( event );
    
                    break;
    
                case STATE.DOLLY:
    
                    if ( scope.enableZoom === false ) return;
    
                    handleMouseMoveDolly( event );
    
                    break;
    
                case STATE.PAN:
    
                    if ( scope.enablePan === false ) return;
    
                    handleMouseMovePan( event );
    
                    break;
    
            }
    
        }
    
        function onMouseUp( event ) {
    
            if ( scope.enabled === false ) return;
    
            handleMouseUp( event );
    
            document.removeEventListener( 'mousemove', onMouseMove, false );
            document.removeEventListener( 'mouseup', onMouseUp, false );
    
            scope.dispatchEvent( endEvent );
    
            state = STATE.NONE;
    
        }
    
        function onMouseWheel( event ) {
    
            if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            scope.dispatchEvent( startEvent );
    
            handleMouseWheel( event );
    
            scope.dispatchEvent( endEvent );
    
        }
    
        function onKeyDown( event ) {
    
            if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;
    
            handleKeyDown( event );
    
        }
    
        function onTouchStart( event ) {
    
            if ( scope.enabled === false ) return;
    
            event.preventDefault();
    
            switch ( event.touches.length ) {
    
                case 1:	// one-fingered touch: rotate
    
                    if ( scope.enableRotate === false ) return;
    
                    handleTouchStartRotate( event );
    
                    state = STATE.TOUCH_ROTATE;
    
                    break;
    
                case 2:	// two-fingered touch: dolly-pan
    
                    if ( scope.enableZoom === false && scope.enablePan === false ) return;
    
                    handleTouchStartDollyPan( event );
    
                    state = STATE.TOUCH_DOLLY_PAN;
    
                    break;
    
                default:
    
                    state = STATE.NONE;
    
            }
    
            if ( state !== STATE.NONE ) {
    
                scope.dispatchEvent( startEvent );
    
            }
    
        }
    
        function onTouchMove( event ) {
    
            if ( scope.enabled === false ) return;
    
            event.preventDefault();
            event.stopPropagation();
    
            switch ( event.touches.length ) {
    
                case 1: // one-fingered touch: rotate
    
                    if ( scope.enableRotate === false ) return;
                    if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?
    
                    handleTouchMoveRotate( event );
    
                    break;
    
                case 2: // two-fingered touch: dolly-pan
    
                    if ( scope.enableZoom === false && scope.enablePan === false ) return;
                    if ( state !== STATE.TOUCH_DOLLY_PAN ) return; // is this needed?
    
                    handleTouchMoveDollyPan( event );
    
                    break;
    
                default:
    
                    state = STATE.NONE;
    
            }
    
        }
    
        function onTouchEnd( event ) {
    
            if ( scope.enabled === false ) return;
    
            handleTouchEnd( event );
    
            scope.dispatchEvent( endEvent );
    
            state = STATE.NONE;
    
        }
    
        function onContextMenu( event ) {
    
            if ( scope.enabled === false ) return;
    
            event.preventDefault();
    
        }
    
        //
    
        scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );
    
        scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
        scope.domElement.addEventListener( 'wheel', onMouseWheel, false );
    
        scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
        scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
        scope.domElement.addEventListener( 'touchmove', onTouchMove, false );
    
        window.addEventListener( 'keydown', onKeyDown, false );
    
        // force an update at start
    
        this.update();
    
    };
    
    THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
    THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;
    
    Object.defineProperties( THREE.OrbitControls.prototype, {
    
        center: {
    
            get: function () {
    
                console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
                return this.target;
    
            }
    
        },
    
        // backward compatibility
    
        noZoom: {
    
            get: function () {
    
                console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
                return ! this.enableZoom;
    
            },
    
            set: function ( value ) {
    
                console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
                this.enableZoom = ! value;
    
            }
    
        },
    
        noRotate: {
    
            get: function () {
    
                console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
                return ! this.enableRotate;
    
            },
    
            set: function ( value ) {
    
                console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
                this.enableRotate = ! value;
    
            }
    
        },
    
        noPan: {
    
            get: function () {
    
                console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
                return ! this.enablePan;
    
            },
    
            set: function ( value ) {
    
                console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
                this.enablePan = ! value;
    
            }
    
        },
    
        noKeys: {
    
            get: function () {
    
                console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
                return ! this.enableKeys;
    
            },
    
            set: function ( value ) {
    
                console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
                this.enableKeys = ! value;
    
            }
    
        },
    
        staticMoving: {
    
            get: function () {
    
                console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
                return ! this.enableDamping;
    
            },
    
            set: function ( value ) {
    
                console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
                this.enableDamping = ! value;
    
            }
    
        },
    
        dynamicDampingFactor: {
    
            get: function () {
    
                console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
                return this.dampingFactor;
    
            },
    
            set: function ( value ) {
    
                console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
                this.dampingFactor = value;
    
            }
    
        }
    
    } );

    THREE.TransformControls = function ( camera, domElement ) {

        THREE.Object3D.call( this );
    
        domElement = ( domElement !== undefined ) ? domElement : document;
    
        this.visible = false;
    
        var _gizmo = new THREE.TransformControlsGizmo();
        this.add( _gizmo );
    
        var _plane = new THREE.TransformControlsPlane();
        this.add( _plane );
    
        var scope = this;
    
        // Define properties with getters/setter
        // Setting the defined property will automatically trigger change event
        // Defined properties are passed down to gizmo and plane
    
        defineProperty( "camera", camera );
        defineProperty( "object", undefined );
        defineProperty( "enabled", true );
        defineProperty( "axis", null );
        defineProperty( "mode", "translate" );
        defineProperty( "translationSnap", null );
        defineProperty( "rotationSnap", null );
        defineProperty( "space", "world" );
        defineProperty( "size", 1 );
        defineProperty( "dragging", false );
        defineProperty( "showX", true );
        defineProperty( "showY", true );
        defineProperty( "showZ", true );
    
        var changeEvent = { type: "change" };
        var mouseDownEvent = { type: "mouseDown" };
        var mouseUpEvent = { type: "mouseUp", mode: scope.mode };
        var objectChangeEvent = { type: "objectChange" };
    
        // Reusable utility variables
    
        var ray = new THREE.Raycaster();
    
        var _tempVector = new THREE.Vector3();
        var _tempVector2 = new THREE.Vector3();
        var _tempQuaternion = new THREE.Quaternion();
        var _unit = {
            X: new THREE.Vector3( 1, 0, 0 ),
            Y: new THREE.Vector3( 0, 1, 0 ),
            Z: new THREE.Vector3( 0, 0, 1 )
        };
        var _identityQuaternion = new THREE.Quaternion();
        var _alignVector = new THREE.Vector3();
    
        var pointStart = new THREE.Vector3();
        var pointEnd = new THREE.Vector3();
        var offset = new THREE.Vector3();
        var rotationAxis = new THREE.Vector3();
        var startNorm = new THREE.Vector3();
        var endNorm = new THREE.Vector3();
        var rotationAngle = 0;
    
        var cameraPosition = new THREE.Vector3();
        var cameraQuaternion = new THREE.Quaternion();
        var cameraScale = new THREE.Vector3();
    
        var parentPosition = new THREE.Vector3();
        var parentQuaternion = new THREE.Quaternion();
        var parentQuaternionInv = new THREE.Quaternion();
        var parentScale = new THREE.Vector3();
    
        var worldPositionStart = new THREE.Vector3();
        var worldQuaternionStart = new THREE.Quaternion();
        var worldScaleStart = new THREE.Vector3();
    
        var worldPosition = new THREE.Vector3();
        var worldQuaternion = new THREE.Quaternion();
        var worldQuaternionInv = new THREE.Quaternion();
        var worldScale = new THREE.Vector3();
    
        var eye = new THREE.Vector3();
    
        var positionStart = new THREE.Vector3();
        var quaternionStart = new THREE.Quaternion();
        var scaleStart = new THREE.Vector3();
    
        // TODO: remove properties unused in plane and gizmo
    
        defineProperty( "worldPosition", worldPosition );
        defineProperty( "worldPositionStart", worldPositionStart );
        defineProperty( "worldQuaternion", worldQuaternion );
        defineProperty( "worldQuaternionStart", worldQuaternionStart );
        defineProperty( "cameraPosition", cameraPosition );
        defineProperty( "cameraQuaternion", cameraQuaternion );
        defineProperty( "pointStart", pointStart );
        defineProperty( "pointEnd", pointEnd );
        defineProperty( "rotationAxis", rotationAxis );
        defineProperty( "rotationAngle", rotationAngle );
        defineProperty( "eye", eye );
    
        {
    
            domElement.addEventListener( "mousedown", onPointerDown, false );
            domElement.addEventListener( "touchstart", onPointerDown, false );
            domElement.addEventListener( "mousemove", onPointerHover, false );
            domElement.addEventListener( "touchmove", onPointerHover, false );
            domElement.addEventListener( "touchmove", onPointerMove, false );
            document.addEventListener( "mouseup", onPointerUp, false );
            domElement.addEventListener( "touchend", onPointerUp, false );
            domElement.addEventListener( "touchcancel", onPointerUp, false );
            domElement.addEventListener( "touchleave", onPointerUp, false );
    
        }
    
        this.dispose = function () {
    
            domElement.removeEventListener( "mousedown", onPointerDown );
            domElement.removeEventListener( "touchstart", onPointerDown );
            domElement.removeEventListener( "mousemove", onPointerHover );
            domElement.removeEventListener( "touchmove", onPointerHover );
            domElement.removeEventListener( "touchmove", onPointerMove );
            document.removeEventListener( "mouseup", onPointerUp );
            domElement.removeEventListener( "touchend", onPointerUp );
            domElement.removeEventListener( "touchcancel", onPointerUp );
            domElement.removeEventListener( "touchleave", onPointerUp );
    
        };
    
        // Set current object
        this.attach = function ( object ) {
    
            this.object = object;
            this.visible = true;
    
        };
    
        // Detatch from object
        this.detach = function () {
    
            this.object = undefined;
            this.visible = false;
            this.axis = null;
    
        };
    
        // Defined getter, setter and store for a property
        function defineProperty( propName, defaultValue ) {
    
            var propValue = defaultValue;
    
            Object.defineProperty( scope, propName, {
    
                get: function() {
    
                    return propValue !== undefined ? propValue : defaultValue;
    
                },
    
                set: function( value ) {
    
                    if ( propValue !== value ) {
    
                        propValue = value;
                        _plane[ propName ] = value;
                        _gizmo[ propName ] = value;
    
                        scope.dispatchEvent( { type: propName + "-changed", value: value } );
                        scope.dispatchEvent( changeEvent );
    
                    }
    
                }
    
            });
    
            scope[ propName ] = defaultValue;
            _plane[ propName ] = defaultValue;
            _gizmo[ propName ] = defaultValue;
    
        }
    
        // updateMatrixWorld  updates key transformation variables
        this.updateMatrixWorld = function () {
    
            if ( this.object !== undefined ) {
    
                this.object.updateMatrixWorld();
                this.object.parent.matrixWorld.decompose( parentPosition, parentQuaternion, parentScale );
                this.object.matrixWorld.decompose( worldPosition, worldQuaternion, worldScale );
    
                parentQuaternionInv.copy( parentQuaternion ).inverse();
                worldQuaternionInv.copy( worldQuaternion ).inverse();
    
            }
    
            this.camera.updateMatrixWorld();
            this.camera.matrixWorld.decompose( cameraPosition, cameraQuaternion, cameraScale );
    
            if ( this.camera instanceof THREE.PerspectiveCamera ) {
    
                eye.copy( cameraPosition ).sub( worldPosition ).normalize();
    
            } else if ( this.camera instanceof THREE.OrthographicCamera ) {
    
                eye.copy( cameraPosition ).normalize();
    
            }
    
            THREE.Object3D.prototype.updateMatrixWorld.call( this );
    
        };
    
        this.pointerHover = function( pointer ) {
    
            if ( this.object === undefined || this.dragging === true || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;
    
            ray.setFromCamera( pointer, this.camera );
    
            var intersect = ray.intersectObjects( _gizmo.picker[ this.mode ].children, true )[ 0 ] || false;
    
            if ( intersect ) {
    
                this.axis = intersect.object.name;
    
            } else {
    
                this.axis = null;
    
            }
    
        };
    
        this.pointerDown = function( pointer ) {
    
            if ( this.object === undefined || this.dragging === true || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;
    
            if ( ( pointer.button === 0 || pointer.button === undefined ) && this.axis !== null ) {
    
                ray.setFromCamera( pointer, this.camera );
    
                var planeIntersect = ray.intersectObjects( [ _plane ], true )[ 0 ] || false;
    
                if ( planeIntersect ) {
    
                    var space = this.space;
    
                    if ( this.mode === 'scale') {
    
                        space = 'local';
    
                    } else if ( this.axis === 'E' ||  this.axis === 'XYZE' ||  this.axis === 'XYZ' ) {
    
                        space = 'world';
    
                    }
    
                    if ( space === 'local' && this.mode === 'rotate' ) {
    
                        var snap = this.rotationSnap;
    
                        if ( this.axis === 'X' && snap ) this.object.rotation.x = Math.round( this.object.rotation.x / snap ) * snap;
                        if ( this.axis === 'Y' && snap ) this.object.rotation.y = Math.round( this.object.rotation.y / snap ) * snap;
                        if ( this.axis === 'Z' && snap ) this.object.rotation.z = Math.round( this.object.rotation.z / snap ) * snap;
    
                    }
    
                    this.object.updateMatrixWorld();
                    this.object.parent.updateMatrixWorld();
    
                    positionStart.copy( this.object.position );
                    quaternionStart.copy( this.object.quaternion );
                    scaleStart.copy( this.object.scale );
    
                    this.object.matrixWorld.decompose( worldPositionStart, worldQuaternionStart, worldScaleStart );
    
                    pointStart.copy( planeIntersect.point ).sub( worldPositionStart );
    
                }
    
                this.dragging = true;
                mouseDownEvent.mode = this.mode;
                this.dispatchEvent( mouseDownEvent );
    
            }
    
        };
    
        this.pointerMove = function( pointer ) {
    
            var axis = this.axis;
            var mode = this.mode;
            var object = this.object;
            var space = this.space;
    
            if ( mode === 'scale') {
    
                space = 'local';
    
            } else if ( axis === 'E' ||  axis === 'XYZE' ||  axis === 'XYZ' ) {
    
                space = 'world';
    
            }
    
            if ( object === undefined || axis === null || this.dragging === false || ( pointer.button !== undefined && pointer.button !== 0 ) ) return;
    
            ray.setFromCamera( pointer, this.camera );
    
            var planeIntersect = ray.intersectObjects( [ _plane ], true )[ 0 ] || false;
    
            if ( planeIntersect === false ) return;
    
            pointEnd.copy( planeIntersect.point ).sub( worldPositionStart );
    
            if ( mode === 'translate' ) {
    
                // Apply translate
    
                offset.copy( pointEnd ).sub( pointStart );
    
                if ( space === 'local' && axis !== 'XYZ' ) {
                    offset.applyQuaternion( worldQuaternionInv );
                }
    
                if ( axis.indexOf( 'X' ) === -1 ) offset.x = 0;
                if ( axis.indexOf( 'Y' ) === -1 ) offset.y = 0;
                if ( axis.indexOf( 'Z' ) === -1 ) offset.z = 0;
    
                if ( space === 'local' && axis !== 'XYZ') {
                    offset.applyQuaternion( quaternionStart ).divide( parentScale );
                } else {
                    offset.applyQuaternion( parentQuaternionInv ).divide( parentScale );
                }
    
                object.position.copy( offset ).add( positionStart );
    
                // Apply translation snap
    
                if ( this.translationSnap ) {
    
                    if ( space === 'local' ) {
    
                        object.position.applyQuaternion(_tempQuaternion.copy( quaternionStart ).inverse() );
    
                        if ( axis.search( 'X' ) !== -1 ) {
                            object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
                        }
    
                        if ( axis.search( 'Y' ) !== -1 ) {
                            object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
                        }
    
                        if ( axis.search( 'Z' ) !== -1 ) {
                            object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
                        }
    
                        object.position.applyQuaternion( quaternionStart );
    
                    }
    
                    if ( space === 'world' ) {
    
                        if ( object.parent ) {
                            object.position.add( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
                        }
    
                        if ( axis.search( 'X' ) !== -1 ) {
                            object.position.x = Math.round( object.position.x / this.translationSnap ) * this.translationSnap;
                        }
    
                        if ( axis.search( 'Y' ) !== -1 ) {
                            object.position.y = Math.round( object.position.y / this.translationSnap ) * this.translationSnap;
                        }
    
                        if ( axis.search( 'Z' ) !== -1 ) {
                            object.position.z = Math.round( object.position.z / this.translationSnap ) * this.translationSnap;
                        }
    
                        if ( object.parent ) {
                            object.position.sub( _tempVector.setFromMatrixPosition( object.parent.matrixWorld ) );
                        }
    
                    }
    
                }
    
            } else if ( mode === 'scale' ) {
    
                if ( axis.search( 'XYZ' ) !== -1 ) {
    
                    var d = pointEnd.length() / pointStart.length();
    
                    if ( pointEnd.dot( pointStart ) < 0 ) d *= -1;
    
                    _tempVector.set( d, d, d );
    
                } else {
    
                    _tempVector.copy( pointEnd ).divide( pointStart );
    
                    if ( axis.search( 'X' ) === -1 ) {
                        _tempVector.x = 1;
                    }
                    if ( axis.search( 'Y' ) === -1 ) {
                        _tempVector.y = 1;
                    }
                    if ( axis.search( 'Z' ) === -1 ) {
                        _tempVector.z = 1;
                    }
    
                }
    
                // Apply scale
    
                object.scale.copy( scaleStart ).multiply( _tempVector );
    
            } else if ( mode === 'rotate' ) {
    
                offset.copy( pointEnd ).sub( pointStart );
    
                var ROTATION_SPEED = 20 / worldPosition.distanceTo( _tempVector.setFromMatrixPosition( this.camera.matrixWorld ) );
    
                if ( axis === 'E' ) {
    
                    rotationAxis.copy( eye );
                    rotationAngle = pointEnd.angleTo( pointStart );
    
                    startNorm.copy( pointStart ).normalize();
                    endNorm.copy( pointEnd ).normalize();
    
                    rotationAngle *= ( endNorm.cross( startNorm ).dot( eye ) < 0 ? 1 : -1);
    
                } else if ( axis === 'XYZE' ) {
    
                    rotationAxis.copy( offset ).cross( eye ).normalize(  );
                    rotationAngle = offset.dot( _tempVector.copy( rotationAxis ).cross( this.eye ) ) * ROTATION_SPEED;
    
                } else if ( axis === 'X' || axis === 'Y' || axis === 'Z' ) {
    
                    rotationAxis.copy( _unit[ axis ] );
    
                    _tempVector.copy( _unit[ axis ] );
    
                    if ( space === 'local' ) {
                        _tempVector.applyQuaternion( worldQuaternion );
                    }
    
                    rotationAngle = offset.dot( _tempVector.cross( eye ).normalize() ) * ROTATION_SPEED;
    
                }
    
                // Apply rotation snap
    
                if ( this.rotationSnap ) rotationAngle = Math.round( rotationAngle / this.rotationSnap ) * this.rotationSnap;
    
                this.rotationAngle = rotationAngle;
    
                // Apply rotate
                if ( space === 'local' && axis !== 'E' && axis !== 'XYZE' ) {
    
                    object.quaternion.copy( quaternionStart );
                    object.quaternion.multiply( _tempQuaternion.setFromAxisAngle( rotationAxis, rotationAngle ) ).normalize();
    
                } else {
    
                    rotationAxis.applyQuaternion( parentQuaternionInv );
                    object.quaternion.copy( _tempQuaternion.setFromAxisAngle( rotationAxis, rotationAngle ) );
                    object.quaternion.multiply( quaternionStart ).normalize();
    
                }
    
            }
    
            this.dispatchEvent( changeEvent );
            this.dispatchEvent( objectChangeEvent );
    
        };
    
        this.pointerUp = function( pointer ) {
    
            if ( pointer.button !== undefined && pointer.button !== 0 ) return;
    
            if ( this.dragging && ( this.axis !== null ) ) {
    
                mouseUpEvent.mode = this.mode;
                this.dispatchEvent( mouseUpEvent );
    
            }
    
            this.dragging = false;
    
            if ( pointer.button === undefined ) this.axis = null;
    
        };
    
        // normalize mouse / touch pointer and remap {x,y} to view space.
    
        function getPointer( event ) {
    
            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;
    
            var rect = domElement.getBoundingClientRect();
    
            return {
                x: ( pointer.clientX - rect.left ) / rect.width * 2 - 1,
                y: - ( pointer.clientY - rect.top ) / rect.height * 2 + 1,
                button: event.button
            };
    
        }
    
        // mouse / touch event handlers
    
        function onPointerHover( event ) {
    
            if ( !scope.enabled ) return;
    
            scope.pointerHover( getPointer( event ) );
    
        }
    
        function onPointerDown( event ) {
    
            if ( !scope.enabled ) return;
    
            document.addEventListener( "mousemove", onPointerMove, false );
    
            scope.pointerHover( getPointer( event ) );
            scope.pointerDown( getPointer( event ) );
    
        }
    
        function onPointerMove( event ) {
    
            if ( !scope.enabled ) return;
    
            scope.pointerMove( getPointer( event ) );
    
        }
    
        function onPointerUp( event ) {
    
            if ( !scope.enabled ) return;
    
            document.removeEventListener( "mousemove", onPointerMove, false );
    
            scope.pointerUp( getPointer( event ) );
    
        }
    
        // TODO: depricate
    
        this.getMode = function () {
    
            return scope.mode;
    
        };
    
        this.setMode = function ( mode ) {
    
            scope.mode = mode;
    
        };
    
        this.setTranslationSnap = function ( translationSnap ) {
    
            scope.translationSnap = translationSnap;
    
        };
    
        this.setRotationSnap = function ( rotationSnap ) {
    
            scope.rotationSnap = rotationSnap;
    
        };
    
        this.setSize = function ( size ) {
    
            scope.size = size;
    
        };
    
        this.setSpace = function ( space ) {
    
            scope.space = space;
    
        };
    
        this.update = function () {
    
            console.warn( 'THREE.TransformControls: update function has been depricated.' );
    
        };
    
    };
    
    THREE.TransformControls.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {
    
      constructor: THREE.TransformControls,
    
      isTransformControls: true
    
    } );
    
    
    THREE.TransformControlsGizmo = function () {
    
        'use strict';
    
        THREE.Object3D.call( this );
    
        this.type = 'TransformControlsGizmo';
    
        // shared materials
    
        var gizmoMaterial = new THREE.MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            side: THREE.DoubleSide,
            fog: false
        });
    
        var gizmoLineMaterial = new THREE.LineBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            linewidth: 1,
            fog: false
        });
    
        // Make unique material for each axis/color
    
        var matInvisible = gizmoMaterial.clone();
        matInvisible.opacity = 0.15;
    
        var matHelper = gizmoMaterial.clone();
        matHelper.opacity = 0.33;
    
        var matRed = gizmoMaterial.clone();
        matRed.color.set( 0xff0000 );
    
        var matGreen = gizmoMaterial.clone();
        matGreen.color.set( 0x00ff00 );
    
        var matBlue = gizmoMaterial.clone();
        matBlue.color.set( 0x0000ff );
    
        var matWhiteTransperent = gizmoMaterial.clone();
        matWhiteTransperent.opacity = 0.25;
    
        var matYellowTransparent = matWhiteTransperent.clone();
        matYellowTransparent.color.set( 0xffff00 );
    
        var matCyanTransparent = matWhiteTransperent.clone();
        matCyanTransparent.color.set( 0x00ffff );
    
        var matMagentaTransparent = matWhiteTransperent.clone();
        matMagentaTransparent.color.set( 0xff00ff );
    
        var matYellow = gizmoMaterial.clone();
        matYellow.color.set( 0xffff00 );
    
        var matLineRed = gizmoLineMaterial.clone();
        matLineRed.color.set( 0xff0000 );
    
        var matLineGreen = gizmoLineMaterial.clone();
        matLineGreen.color.set( 0x00ff00 );
    
        var matLineBlue = gizmoLineMaterial.clone();
        matLineBlue.color.set( 0x0000ff );
    
        var matLineCyan = gizmoLineMaterial.clone();
        matLineCyan.color.set( 0x00ffff );
    
        var matLineMagenta = gizmoLineMaterial.clone();
        matLineMagenta.color.set( 0xff00ff );
    
        var matLineYellow = gizmoLineMaterial.clone();
        matLineYellow.color.set( 0xffff00 );
    
        var matLineGray = gizmoLineMaterial.clone();
        matLineGray.color.set( 0x787878);
    
        var matLineYellowTransparent = matLineYellow.clone();
        matLineYellowTransparent.opacity = 0.25;
    
        // reusable geometry
    
        var arrowGeometry = new THREE.CylinderBufferGeometry( 0, 0.05, 0.2, 12, 1, false);
    
        var scaleHandleGeometry = new THREE.BoxBufferGeometry( 0.125, 0.125, 0.125);
    
        var lineGeometry = new THREE.BufferGeometry( );
        lineGeometry.addAttribute('position', new THREE.Float32BufferAttribute( [ 0, 0, 0,	1, 0, 0 ], 3 ) );
    
        var CircleGeometry = function( radius, arc ) {
    
            var geometry = new THREE.BufferGeometry( );
            var vertices = [];
    
            for ( var i = 0; i <= 64 * arc; ++i ) {
    
                vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
    
            }
    
            geometry.addAttribute('position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    
            return geometry;
    
        };
    
        // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position
    
        var TranslateHelperGeometry = function( radius, arc ) {
    
            var geometry = new THREE.BufferGeometry()
    
            geometry.addAttribute('position', new THREE.Float32BufferAttribute( [ 0, 0, 0, 1, 1, 1 ], 3 ) );
    
            return geometry;
    
        };
    
        // Gizmo definitions - custom hierarchy definitions for setupGizmo() function
    
        var gizmoTranslate = {
            X: [
                [ new THREE.Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, -Math.PI / 2 ], null, 'fwd' ],
                [ new THREE.Mesh( arrowGeometry, matRed ), [ 1, 0, 0 ], [ 0, 0, Math.PI / 2 ], null, 'bwd' ],
                [ new THREE.Line( lineGeometry, matLineRed ) ]
            ],
            Y: [
                [ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], null, null, 'fwd' ],
                [ new THREE.Mesh( arrowGeometry, matGreen ), [ 0, 1, 0 ], [ Math.PI, 0, 0 ], null, 'bwd' ],
                [ new THREE.Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ] ]
            ],
            Z: [
                [ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ Math.PI / 2, 0, 0 ], null, 'fwd' ],
                [ new THREE.Mesh( arrowGeometry, matBlue ), [ 0, 0, 1 ], [ -Math.PI / 2, 0, 0 ], null, 'bwd' ],
                [ new THREE.Line( lineGeometry, matLineBlue ), null, [ 0, -Math.PI / 2, 0 ] ]
            ],
            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronBufferGeometry( 0.1, 0 ), matWhiteTransperent ), [ 0, 0, 0 ], [ 0, 0, 0 ] ]
            ],
            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.295, 0.295 ), matYellowTransparent ), [ 0.15, 0.15, 0 ] ],
                [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.18, 0.3, 0 ], null, [ 0.125, 1, 1 ] ],
                [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.3, 0.18, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ]
            ],
            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.295, 0.295 ), matCyanTransparent ), [ 0, 0.15, 0.15 ], [ 0, Math.PI / 2, 0 ] ],
                [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.18, 0.3 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ],
                [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.3, 0.18 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
            ],
            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.295, 0.295 ), matMagentaTransparent ), [ 0.15, 0, 0.15 ], [ -Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.18, 0, 0.3 ], null, [ 0.125, 1, 1 ] ],
                [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.3, 0, 0.18 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
            ]
        };
    
        var pickerTranslate = {
            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0.6, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
            ],
            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0.6, 0 ] ]
            ],
            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false ), matInvisible ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],
            XYZ: [
                [ new THREE.Mesh( new THREE.OctahedronBufferGeometry( 0.2, 0 ), matInvisible ) ]
            ],
            XY: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0.2, 0 ] ]
            ],
            YZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0, 0.2, 0.2 ], [ 0, Math.PI / 2, 0 ] ]
            ],
            XZ: [
                [ new THREE.Mesh( new THREE.PlaneBufferGeometry( 0.4, 0.4 ), matInvisible ), [ 0.2, 0, 0.2 ], [ -Math.PI / 2, 0, 0 ] ]
            ]
        };
    
        var helperTranslate = {
            START: [
                [ new THREE.Mesh( new THREE.OctahedronBufferGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
            ],
            END: [
                [ new THREE.Mesh( new THREE.OctahedronBufferGeometry( 0.01, 2 ), matHelper ), null, null, null, 'helper' ]
            ],
            DELTA: [
                [ new THREE.Line( TranslateHelperGeometry(), matHelper ), null, null, null, 'helper' ]
            ],
            X: [
                [ new THREE.Line( lineGeometry, matHelper.clone() ), [ -1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
            ],
            Y: [
                [ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, -1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
            ],
            Z: [
                [ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, 0, -1e3 ], [ 0, -Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
            ]
        };
    
        var gizmoRotate = {
            X: [
                [ new THREE.Line( CircleGeometry( 1, 0.5 ), matLineRed ) ],
                [ new THREE.Mesh( new THREE.OctahedronBufferGeometry( 0.04, 0 ), matRed ), [ 0, 0, 0.99 ], null, [ 1, 3, 1 ] ],
            ],
            Y: [
                [ new THREE.Line( CircleGeometry( 1, 0.5 ), matLineGreen ), null, [ 0, 0, -Math.PI / 2 ] ],
                [ new THREE.Mesh( new THREE.OctahedronBufferGeometry( 0.04, 0 ), matGreen ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ],
            ],
            Z: [
                [ new THREE.Line( CircleGeometry( 1, 0.5 ), matLineBlue ), null, [ 0, Math.PI / 2, 0 ] ],
                [ new THREE.Mesh( new THREE.OctahedronBufferGeometry( 0.04, 0 ), matBlue ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ] ],
            ],
            E: [
                [ new THREE.Line( CircleGeometry( 1.25, 1 ), matLineYellowTransparent ), null, [ 0, Math.PI / 2, 0 ] ],
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 1.17, 0, 0 ], [ 0, 0, -Math.PI / 2 ], [ 1, 1, 0.001 ]],
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ -1.17, 0, 0 ], [ 0, 0, Math.PI / 2 ], [ 1, 1, 0.001 ]],
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 0, -1.17, 0 ], [ Math.PI, 0, 0 ], [ 1, 1, 0.001 ]],
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.03, 0, 0.15, 4, 1, false ), matLineYellowTransparent ), [ 0, 1.17, 0 ], [ 0, 0, 0 ], [ 1, 1, 0.001 ]],
            ],
            XYZE: [
                [ new THREE.Line( CircleGeometry( 1, 1 ), matLineGray ), null, [ 0, Math.PI / 2, 0 ] ]
            ]
        };
    
        var helperRotate = {
            AXIS: [
                [ new THREE.Line( lineGeometry, matHelper.clone() ), [ -1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
            ]
        };
    
        var pickerRotate = {
            X: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, -Math.PI / 2, -Math.PI / 2 ] ],
            ],
            Y: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ],
            ],
            Z: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1, 0.1, 4, 24 ), matInvisible ), [ 0, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ],
            ],
            E: [
                [ new THREE.Mesh( new THREE.TorusBufferGeometry( 1.25, 0.1, 2, 24 ), matInvisible ) ]
            ],
            XYZE: [
                [ new THREE.Mesh( new THREE.SphereBufferGeometry( 0.7, 10, 8 ), matInvisible ) ]
            ]
        };
    
        var gizmoScale = {
            X: [
                [ new THREE.Mesh( scaleHandleGeometry, matRed ), [ 0.8, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ],
                [ new THREE.Line( lineGeometry, matLineRed ), null, null, [ 0.8, 1, 1 ] ]
            ],
            Y: [
                [ new THREE.Mesh( scaleHandleGeometry, matGreen ), [ 0, 0.8, 0 ] ],
                [ new THREE.Line( lineGeometry, matLineGreen ), null, [ 0, 0, Math.PI / 2 ], [ 0.8, 1, 1 ] ]
            ],
            Z: [
                [ new THREE.Mesh( scaleHandleGeometry, matBlue ), [ 0, 0, 0.8 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineGeometry, matLineBlue ), null, [ 0, -Math.PI / 2, 0 ], [ 0.8, 1, 1 ] ]
            ],
            XY: [
                [ new THREE.Mesh( scaleHandleGeometry, matYellowTransparent ), [ 0.85, 0.85, 0 ], null, [ 2, 2, 0.2 ] ],
                [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.855, 0.98, 0 ], null, [ 0.125, 1, 1 ] ],
                [ new THREE.Line( lineGeometry, matLineYellow ), [ 0.98, 0.855, 0 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ]
            ],
            YZ: [
                [ new THREE.Mesh( scaleHandleGeometry, matCyanTransparent ), [ 0, 0.85, 0.85 ], null, [ 0.2, 2, 2 ] ],
                [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.855, 0.98 ], [ 0, 0, Math.PI / 2 ], [ 0.125, 1, 1 ] ],
                [ new THREE.Line( lineGeometry, matLineCyan ), [ 0, 0.98, 0.855 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
            ],
            XZ: [
                [ new THREE.Mesh( scaleHandleGeometry, matMagentaTransparent ), [ 0.85, 0, 0.85 ], null, [ 2, 0.2, 2 ] ],
                [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.855, 0, 0.98 ], null, [ 0.125, 1, 1 ] ],
                [ new THREE.Line( lineGeometry, matLineMagenta ), [ 0.98, 0, 0.855 ], [ 0, -Math.PI / 2, 0 ], [ 0.125, 1, 1 ] ]
            ],
            XYZX: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent ), [ 1.1, 0, 0 ] ],
            ],
            XYZY: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent ), [ 0, 1.1, 0 ] ],
            ],
            XYZZ: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.125, 0.125, 0.125 ), matWhiteTransperent ), [ 0, 0, 1.1 ] ],
            ]
        };
    
        var pickerScale = {
            X: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0.5, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ]
            ],
            Y: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0, 0.5, 0 ] ]
            ],
            Z: [
                [ new THREE.Mesh( new THREE.CylinderBufferGeometry( 0.2, 0, 0.8, 4, 1, false ), matInvisible ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ]
            ],
            XY: [
                [ new THREE.Mesh( scaleHandleGeometry, matInvisible ), [ 0.85, 0.85, 0 ], null, [ 3, 3, 0.2 ] ],
            ],
            YZ: [
                [ new THREE.Mesh( scaleHandleGeometry, matInvisible ), [ 0, 0.85, 0.85 ], null, [ 0.2, 3, 3 ] ],
            ],
            XZ: [
                [ new THREE.Mesh( scaleHandleGeometry, matInvisible ), [ 0.85, 0, 0.85 ], null, [ 3, 0.2, 3 ] ],
            ],
            XYZX: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 1.1, 0, 0 ] ],
            ],
            XYZY: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 1.1, 0 ] ],
            ],
            XYZZ: [
                [ new THREE.Mesh( new THREE.BoxBufferGeometry( 0.2, 0.2, 0.2 ), matInvisible ), [ 0, 0, 1.1 ] ],
            ]
        };
    
        var helperScale = {
            X: [
                [ new THREE.Line( lineGeometry, matHelper.clone() ), [ -1e3, 0, 0 ], null, [ 1e6, 1, 1 ], 'helper' ]
            ],
            Y: [
                [ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, -1e3, 0 ], [ 0, 0, Math.PI / 2 ], [ 1e6, 1, 1 ], 'helper' ]
            ],
            Z: [
                [ new THREE.Line( lineGeometry, matHelper.clone() ), [ 0, 0, -1e3 ], [ 0, -Math.PI / 2, 0 ], [ 1e6, 1, 1 ], 'helper' ]
            ]
        };
    
        // Creates an Object3D with gizmos described in custom hierarchy definition.
    
        var setupGizmo = function( gizmoMap ) {
    
            var gizmo = new THREE.Object3D();
    
            for ( var name in gizmoMap ) {
    
                for ( var i = gizmoMap[ name ].length; i --; ) {
    
                    var object = gizmoMap[ name ][ i ][ 0 ].clone();
                    var position = gizmoMap[ name ][ i ][ 1 ];
                    var rotation = gizmoMap[ name ][ i ][ 2 ];
                    var scale = gizmoMap[ name ][ i ][ 3 ];
                    var tag = gizmoMap[ name ][ i ][ 4 ];
    
                    // name and tag properties are essential for picking and updating logic.
                    object.name = name;
                    object.tag = tag;
    
                    if (position) {
                        object.position.set(position[ 0 ], position[ 1 ], position[ 2 ]);
                    }
                    if (rotation) {
                        object.rotation.set(rotation[ 0 ], rotation[ 1 ], rotation[ 2 ]);
                    }
                    if (scale) {
                        object.scale.set(scale[ 0 ], scale[ 1 ], scale[ 2 ]);
                    }
    
                    object.updateMatrix();
    
                    var tempGeometry = object.geometry.clone();
                    tempGeometry.applyMatrix(object.matrix);
                    object.geometry = tempGeometry;
    
                    object.position.set( 0, 0, 0 );
                    object.rotation.set( 0, 0, 0 );
                    object.scale.set(1, 1, 1);
    
                    gizmo.add(object);
    
                }
    
            }
    
            return gizmo;
    
        };
    
        // Reusable utility variables
    
        var tempVector = new THREE.Vector3( 0, 0, 0 );
        var tempEuler = new THREE.Euler();
        var alignVector = new THREE.Vector3( 0, 1, 0 );
        var zeroVector = new THREE.Vector3( 0, 0, 0 );
        var lookAtMatrix = new THREE.Matrix4();
        var tempQuaternion = new THREE.Quaternion();
        var tempQuaternion2 = new THREE.Quaternion();
        var identityQuaternion = new THREE.Quaternion();
    
        var unitX = new THREE.Vector3( 1, 0, 0 );
        var unitY = new THREE.Vector3( 0, 1, 0 );
        var unitZ = new THREE.Vector3( 0, 0, 1 );
    
        // Gizmo creation
    
        this.gizmo = {};
        this.picker = {};
        this.helper = {};
    
        this.add( this.gizmo[ "translate" ] = setupGizmo( gizmoTranslate ) );
        this.add( this.gizmo[ "rotate" ] = setupGizmo( gizmoRotate ) );
        this.add( this.gizmo[ "scale" ] = setupGizmo( gizmoScale ) );
        this.add( this.picker[ "translate" ] = setupGizmo( pickerTranslate ) );
        this.add( this.picker[ "rotate" ] = setupGizmo( pickerRotate ) );
        this.add( this.picker[ "scale" ] = setupGizmo( pickerScale ) );
        this.add( this.helper[ "translate" ] = setupGizmo( helperTranslate ) );
        this.add( this.helper[ "rotate" ] = setupGizmo( helperRotate ) );
        this.add( this.helper[ "scale" ] = setupGizmo( helperScale ) );
    
        // Pickers should be hidden always
    
        this.picker[ "translate" ].visible = false;
        this.picker[ "rotate" ].visible = false;
        this.picker[ "scale" ].visible = false;
    
        // updateMatrixWorld will update transformations and appearance of individual handles
    
        this.updateMatrixWorld = function () {
    
            var space = this.space;
    
            if ( this.mode === 'scale' ) space = 'local'; // scale always oriented to local rotation
    
            var quaternion = space === "local" ? this.worldQuaternion : identityQuaternion;
    
            // Show only gizmos for current transform mode
    
            this.gizmo[ "translate" ].visible = this.mode === "translate";
            this.gizmo[ "rotate" ].visible = this.mode === "rotate";
            this.gizmo[ "scale" ].visible = this.mode === "scale";
    
            this.helper[ "translate" ].visible = this.mode === "translate";
            this.helper[ "rotate" ].visible = this.mode === "rotate";
            this.helper[ "scale" ].visible = this.mode === "scale";
    
    
            var handles = [];
            handles = handles.concat( this.picker[ this.mode ].children );
            handles = handles.concat( this.gizmo[ this.mode ].children );
            handles = handles.concat( this.helper[ this.mode ].children );
    
            for ( var i = 0; i < handles.length; i++ ) {
    
                var handle = handles[i];
    
                // hide aligned to camera
    
                handle.visible = true;
                handle.rotation.set( 0, 0, 0 );
                handle.position.copy( this.worldPosition );
    
                var eyeDistance = this.worldPosition.distanceTo( this.cameraPosition);
                handle.scale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size / 7 );
    
                // TODO: simplify helpers and consider decoupling from gizmo
    
                if ( handle.tag === 'helper' ) {
    
                    handle.visible = false;
    
                    if ( handle.name === 'AXIS' ) {
    
                        handle.position.copy( this.worldPositionStart );
                        handle.visible = !!this.axis;
    
                        if ( this.axis === 'X' ) {
    
                            tempQuaternion.setFromEuler( tempEuler.set( 0, 0, 0 ) );
                            handle.quaternion.copy( quaternion ).multiply( tempQuaternion );
    
                            if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {
                                handle.visible = false;
                            }
    
                        }
    
                        if ( this.axis === 'Y' ) {
    
                            tempQuaternion.setFromEuler( tempEuler.set( 0, 0, Math.PI / 2 ) );
                            handle.quaternion.copy( quaternion ).multiply( tempQuaternion );
    
                            if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {
                                handle.visible = false;
                            }
    
                        }
    
                        if ( this.axis === 'Z' ) {
    
                            tempQuaternion.setFromEuler( tempEuler.set( 0, Math.PI / 2, 0 ) );
                            handle.quaternion.copy( quaternion ).multiply( tempQuaternion );
    
                            if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > 0.9 ) {
                                handle.visible = false;
                            }
    
                        }
    
                        if ( this.axis === 'XYZE' ) {
    
                            tempQuaternion.setFromEuler( tempEuler.set( 0, Math.PI / 2, 0 ) );
                            alignVector.copy( this.rotationAxis );
                            handle.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( zeroVector, alignVector, unitY ) );
                            handle.quaternion.multiply( tempQuaternion );
                            handle.visible = this.dragging;
    
                        }
    
                        if ( this.axis === 'E' ) {
    
                            handle.visible = false;
    
                        }
    
    
                    } else if ( handle.name === 'START' ) {
    
                        handle.position.copy( this.worldPositionStart );
                        handle.visible = this.dragging;
    
                    } else if ( handle.name === 'END' ) {
    
                        handle.position.copy( this.worldPosition );
                        handle.visible = this.dragging;
    
                    } else if ( handle.name === 'DELTA' ) {
    
                        handle.position.copy( this.worldPositionStart );
                        handle.quaternion.copy( this.worldQuaternionStart );
                        tempVector.set( 1e-10, 1e-10, 1e-10 ).add( this.worldPositionStart ).sub( this.worldPosition ).multiplyScalar( -1 );
                        tempVector.applyQuaternion( this.worldQuaternionStart.clone().inverse() );
                        handle.scale.copy( tempVector );
                        handle.visible = this.dragging;
    
                    } else {
    
                        handle.quaternion.copy( quaternion );
    
                        if ( this.dragging ) {
    
                            handle.position.copy( this.worldPositionStart );
    
                        } else {
    
                            handle.position.copy( this.worldPosition );
    
                        }
    
                        if ( this.axis ) {
    
                            handle.visible = this.axis.search( handle.name ) !== -1;
    
                        }
    
                    }
    
                    // If updating helper, skip rest of the loop
                    continue;
    
                }
    
                // Align handles to current local or world rotation
    
                handle.quaternion.copy( quaternion );
    
                if ( this.mode === 'translate' || this.mode === 'scale' ) {
    
                    // Hide translate and scale axis facing the camera
    
                    var AXIS_HIDE_TRESHOLD = 0.99;
                    var PLANE_HIDE_TRESHOLD = 0.2;
                    var AXIS_FLIP_TRESHOLD = -0.4;
    
    
                    if ( handle.name === 'X' || handle.name === 'XYZX' ) {
                        if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {
                            handle.scale.set( 1e-10, 1e-10, 1e-10 );
                            handle.visible = false;
                        }
                    }
                    if ( handle.name === 'Y' || handle.name === 'XYZY' ) {
                        if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {
                            handle.scale.set( 1e-10, 1e-10, 1e-10 );
                            handle.visible = false;
                        }
                    }
                    if ( handle.name === 'Z' || handle.name === 'XYZZ' ) {
                        if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) > AXIS_HIDE_TRESHOLD ) {
                            handle.scale.set( 1e-10, 1e-10, 1e-10 );
                            handle.visible = false;
                        }
                    }
                    if ( handle.name === 'XY' ) {
                        if ( Math.abs( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {
                            handle.scale.set( 1e-10, 1e-10, 1e-10 );
                            handle.visible = false;
                        }
                    }
                    if ( handle.name === 'YZ' ) {
                        if ( Math.abs( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {
                            handle.scale.set( 1e-10, 1e-10, 1e-10 );
                            handle.visible = false;
                        }
                    }
                    if ( handle.name === 'XZ' ) {
                        if ( Math.abs( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) ) < PLANE_HIDE_TRESHOLD ) {
                            handle.scale.set( 1e-10, 1e-10, 1e-10 );
                            handle.visible = false;
                        }
                    }
    
                    // Flip translate and scale axis ocluded behind another axis
    
                    if ( handle.name.search( 'X' ) !== -1 ) {
                        if ( alignVector.copy( unitX ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {
                            if ( handle.tag === 'fwd' ) {
                                handle.visible = false;
                            } else {
                                handle.scale.x *= -1;
                            }
                        } else if ( handle.tag === 'bwd' ) {
                            handle.visible = false;
                        }
                    }
    
                    if ( handle.name.search( 'Y' ) !== -1 ) {
                        if ( alignVector.copy( unitY ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {
                            if ( handle.tag === 'fwd' ) {
                                handle.visible = false;
                            } else {
                                handle.scale.y *= -1;
                            }
                        } else if ( handle.tag === 'bwd' ) {
                            handle.visible = false;
                        }
                    }
    
                    if ( handle.name.search( 'Z' ) !== -1 ) {
                        if ( alignVector.copy( unitZ ).applyQuaternion( quaternion ).dot( this.eye ) < AXIS_FLIP_TRESHOLD ) {
                            if ( handle.tag === 'fwd' ) {
                                handle.visible = false;
                            } else {
                                handle.scale.z *= -1;
                            }
                        } else if ( handle.tag === 'bwd' ) {
                            handle.visible = false;
                        }
                    }
    
                } else if ( this.mode === 'rotate' ) {
    
                    // Align handles to current local or world rotation
    
                    tempQuaternion2.copy( quaternion );
                    alignVector.copy( this.eye ).applyQuaternion( tempQuaternion.copy( quaternion ).inverse() );
    
                    if ( handle.name.search( "E" ) !== - 1 ) {
    
                        handle.quaternion.setFromRotationMatrix( lookAtMatrix.lookAt( this.eye, zeroVector, unitY ) );
    
                    }
    
                    if ( handle.name === 'X' ) {
    
                        tempQuaternion.setFromAxisAngle( unitX, Math.atan2( -alignVector.y, alignVector.z ) );
                        tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
                        handle.quaternion.copy( tempQuaternion );
    
                    }
    
                    if ( handle.name === 'Y' ) {
    
                        tempQuaternion.setFromAxisAngle( unitY, Math.atan2( alignVector.x, alignVector.z ) );
                        tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
                        handle.quaternion.copy( tempQuaternion );
    
                    }
    
                    if ( handle.name === 'Z' ) {
    
                        tempQuaternion.setFromAxisAngle( unitZ, Math.atan2( alignVector.y, alignVector.x ) );
                        tempQuaternion.multiplyQuaternions( tempQuaternion2, tempQuaternion );
                        handle.quaternion.copy( tempQuaternion );
    
                    }
    
                }
    
                // Hide disabled axes
                handle.visible = handle.visible && ( handle.name.indexOf( "X" ) === -1 || this.showX );
                handle.visible = handle.visible && ( handle.name.indexOf( "Y" ) === -1 || this.showY );
                handle.visible = handle.visible && ( handle.name.indexOf( "Z" ) === -1 || this.showZ );
                handle.visible = handle.visible && ( handle.name.indexOf( "E" ) === -1 || ( this.showX && this.showY && this.showZ ) );
    
                // highlight selected axis
    
                handle.material._opacity = handle.material._opacity || handle.material.opacity;
                handle.material._color = handle.material._color || handle.material.color.clone();
    
                handle.material.color.copy( handle.material._color );
                handle.material.opacity = handle.material._opacity;
    
                if ( !this.enabled ) {
    
                    handle.material.opacity *= 0.5;
                    handle.material.color.lerp( new THREE.Color( 1, 1, 1 ), 0.5 );
    
                } else if ( this.axis ) {
    
                    if ( handle.name === this.axis ) {
    
                        handle.material.opacity = 1.0;
                        handle.material.color.lerp( new THREE.Color( 1, 1, 1 ), 0.5 );
    
                    } else if ( this.axis.split('').some( function( a ) { return handle.name === a; } ) ) {
    
                        handle.material.opacity = 1.0;
                        handle.material.color.lerp( new THREE.Color( 1, 1, 1 ), 0.5 );
    
                    } else {
    
                        handle.material.opacity *= 0.25;
                        handle.material.color.lerp( new THREE.Color( 1, 1, 1 ), 0.5 );
    
                    }
    
                }
    
            }
    
            THREE.Object3D.prototype.updateMatrixWorld.call( this );
    
        };
    
    };
    
    THREE.TransformControlsGizmo.prototype = Object.assign( Object.create( THREE.Object3D.prototype ), {
    
        constructor: THREE.TransformControlsGizmo,
    
        isTransformControlsGizmo: true
    
    } );
    
    
    THREE.TransformControlsPlane = function () {
    
        'use strict';
    
        THREE.Mesh.call( this,
            new THREE.PlaneBufferGeometry( 100000, 100000, 2, 2 ),
            new THREE.MeshBasicMaterial( { visible: false, wireframe: true, side: THREE.DoubleSide, transparent: true, opacity: 0.1 } )
        );
    
        this.type = 'TransformControlsPlane';
    
        var unitX = new THREE.Vector3( 1, 0, 0 );
        var unitY = new THREE.Vector3( 0, 1, 0 );
        var unitZ = new THREE.Vector3( 0, 0, 1 );
    
        var tempVector = new THREE.Vector3();
        var dirVector = new THREE.Vector3();
        var alignVector = new THREE.Vector3();
        var tempMatrix = new THREE.Matrix4();
        var identityQuaternion = new THREE.Quaternion();
    
        this.updateMatrixWorld = function() {
    
            var space = this.space;
    
            this.position.copy( this.worldPosition );
    
            if ( this.mode === 'scale' ) space = 'local'; // scale always oriented to local rotation
    
            unitX.set( 1, 0, 0 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
            unitY.set( 0, 1, 0 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
            unitZ.set( 0, 0, 1 ).applyQuaternion( space === "local" ? this.worldQuaternion : identityQuaternion );
    
            // Align the plane for current transform mode, axis and space.
    
            alignVector.copy( unitY );
    
            switch ( this.mode ) {
                case 'translate':
                case 'scale':
                    switch ( this.axis ) {
                        case 'X':
                            alignVector.copy( this.eye ).cross( unitX );
                            dirVector.copy( unitX ).cross( alignVector );
                            break;
                        case 'Y':
                            alignVector.copy( this.eye ).cross( unitY );
                            dirVector.copy( unitY ).cross( alignVector );
                            break;
                        case 'Z':
                            alignVector.copy( this.eye ).cross( unitZ );
                            dirVector.copy( unitZ ).cross( alignVector );
                            break;
                        case 'XY':
                            dirVector.copy( unitZ );
                            break;
                        case 'YZ':
                            dirVector.copy( unitX );
                            break;
                        case 'XZ':
                            alignVector.copy( unitZ );
                            dirVector.copy( unitY );
                            break;
                        case 'XYZ':
                        case 'E':
                            dirVector.set( 0, 0, 0 );
                            break;
                    }
                    break;
                case 'rotate':
                default:
                    // special case for rotate
                    dirVector.set( 0, 0, 0 );
            }
    
            if ( dirVector.length() === 0 ) {
    
                // If in rotate mode, make the plane parallel to camera
                this.quaternion.copy( this.cameraQuaternion );
    
            } else {
    
                tempMatrix.lookAt( tempVector.set( 0, 0, 0 ), dirVector, alignVector );
    
                this.quaternion.setFromRotationMatrix( tempMatrix );
    
            }
    
            THREE.Object3D.prototype.updateMatrixWorld.call( this );
    
        };
    
    };
    
    THREE.TransformControlsPlane.prototype = Object.assign( Object.create( THREE.Mesh.prototype ), {
    
        constructor: THREE.TransformControlsPlane,
    
        isTransformControlsPlane: true
    
    } );
}

var WEBGL = {

	isWebGLAvailable: function () {

		try {

			var canvas = document.createElement( 'canvas' );
			return !! ( window.WebGLRenderingContext && ( canvas.getContext( 'webgl' ) || canvas.getContext( 'experimental-webgl' ) ) );

		} catch ( e ) {

			return false;

		}

	},

	isWebGL2Available: function () {

		try {

			var canvas = document.createElement( 'canvas' );
			return !! ( window.WebGL2RenderingContext && canvas.getContext( 'webgl2' ) );

		} catch ( e ) {

			return false;

		}

	},

	getWebGLErrorMessage: function () {

		return this.getErrorMessage( 1 );

	},

	getWebGL2ErrorMessage: function () {

		return this.getErrorMessage( 2 );

	},

	getErrorMessage: function ( version ) {

		var names = {
			1: 'WebGL',
			2: 'WebGL 2'
		};

		var contexts = {
			1: window.WebGLRenderingContext,
			2: window.WebGL2RenderingContext
		};

		var message = 'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';

		var element = document.createElement( 'div' );
		element.id = 'webglmessage';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		if ( contexts[ version ] ) {

			message = message.replace( '$0', 'graphics card' );

		} else {

			message = message.replace( '$0', 'browser' );

		}

		message = message.replace( '$1', names[ version ] );

		element.innerHTML = message;

		return element;

	}

};