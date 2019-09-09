
window.onload = function() {

    //環境變數
    var updateFPS = 30;
    var showMouse = true;
    var time = 0;
    var bgcolor = "black";

    var tt = 0; // 控制左右
    //控制
    var controls = {
        move : function() {

            tt+=1;
            TweenMax.staggerTo (trees, 2, {
                angle: tt%2==0?0.5:-0.5,
                ease: Elastic.easeOut,
            })
        }
    }

    var gui = new dat.GUI();
    gui.add(controls, "move");

    //--------------vec2 向量------------------

    class Vec2 {
        constructor(x, y){
            this.x = x || 0;
            this.y = y || 0;
        }

        set(x, y) {
            this.x = x;
            this.y = y;
        }
        
        move(x, y) {
            this.x += x;
            this.y += y;
        }

        add(v) {
            return new Vec2(this.x + v.x, this.y + v.y)
        }
        sub(v) {
            return new Vec2(this.x - v.x, this.y - v.y)
        }
        mul(s) {
            return new Vec2(this.x*s, this.y*s)
        }

        //新的向量長度
        set length(nv) {
            var temp = this.unit.mul(nv); //this.unit.mul(nv) 是1
            this.set(temp.x, this.y);
        }

        get length() {
            return Math.sqrt(this.x*this.x + this.y*this.y);
        }

        clone() {
            return new Vec2(this.x, this.y);
        }
        //轉成字串
        toString() {
            // return "("+this.x+","+this.y+")";
            return `(${this.x}, ${this.y})`;
        }
        //比較
        equal(){
            return this.x == v.x && this.y == v.y;
        }

        get angle() {
            return Math.atan2(this.y, this.x);
        }

        get unit() {
            return this.mul(1/this.length);
        }


    }
//------------------------------------------------------------
    var canvas = document.getElementById("canvas");
    var cx = canvas.getContext("2d");
   
    //設定畫圓
    cx.circle = function(v, r) {
        this.arc(v.x, v.y, r, 0, Math.PI*2);
    }
    //設定畫線
    cx.line = function (v1, v2) {
        this.moveTo(v1.x, v1.y);
        this.lineTo(v2.x, v2.y);

    }

    // canvas的設定
    function initCanvas() {
 
        ww = canvas.width = window.innerWidth;
        wh = canvas.height =window.innerHeight;
    }
    initCanvas();

    class TreeStage {
        constructor(args) {
            var def = {
                width: 100, 
                height: 50,
                angle: 0,
                color: "white",
            }
            Object.assign(def, args);
            Object.assign(this, def);
        }
        draw() {
            cx.fillStyle = this.color;
            cx.beginPath();
            cx.moveTo(0, 0);
            cx.lineTo(0 - this.width/2, 0);
            cx.lineTo(0, - this.height);
            cx.lineTo(0 + this.width/2, 0);
            cx.closePath();
            cx.fill();
        }
    }

    class Gift {
        constructor(args) {
            var def = {
                p: new Vec2(),
                falllen: 8, //fall掉下來的長度
                width: 50,
                color: "red",
                opacity: 1,
            }
            Object.assign(def, args);
            Object.assign(this, def);
        }
        draw() {
            cx.globalAlpha = this.opacity;
            cx.fillStyle = this.color ;
            cx.fillRect( this.p.x, this.falllen+this.p.y, this.width, this.width);
            cx.globalAlpha = 1;
        }
    }

    var trees = [];
    var gifts = [];
    //邏輯的初始化
    function init() {

        var treecount = 6;
        for (var i = 0; i <treecount; i++) {
            trees.push(new TreeStage({
                width: (treecount - i)*70+5,
                height: (treecount - i)*30+5,
                angle: Math.PI/20,
                color: `hsl(${i*10+60},80%,50%)`,
               
            }));
        }

        TweenMax.staggerTo(trees, 2, {
            angle: -0.5,
            ease: Elastic.easeOut,
            repeat: 2,
            yoyo: true,
            yoyoEase: Elastic.easeOut,
        },0.1); // 0.1 每個延遲0.1秒


        //禮物

        for (var i = 0; i<20; i++) {

            var width = Math.random()*80 + 20;  //20~100
            gifts.push(new Gift({
                p: new Vec2(ww*Math.random(), wh-width),
                width: width,
                color: `hsl(${i*10},80%,50%)`,
                opacity: 1,
            }))
        }

        TweenMax.staggerFrom(gifts, 1, {
            opacity:0,
            falllen: Math.random()*-200-200,
        },0.2);




    }

    //遊戲邏輯的更新
    function update() {

        time++;
    }

    //畫面更新
    function draw() {

        //清空背景
        cx.fillStyle = bgcolor;
        cx.fillRect(0, 0, ww, wh);

        //----在這繪製--------------------------------

        gifts.forEach(gift=>gift.draw());

        cx.save();
            cx.translate(ww/2, wh-50);
            trees.forEach(function(tree) {
                cx.rotate(tree.angle);
                tree.draw();
                cx.translate(0, -tree.height/1.5);
            })

        cx.restore();

 



        //----------------------------------------

        //滑鼠
        cx.fillStyle = "red";
        cx.beginPath();
        cx.circle(mousePos,3);
        cx.fill();

        //滑鼠線
        cx.save();
            cx.beginPath();
            cx.translate(mousePos.x, mousePos.y);
              
                cx.strokeStyle = "red";
                var len = 20;
                cx.line(new Vec2(-len, 0), new Vec2(len, 0));

                cx.fillText (mousePos, 10, -10);
                cx.rotate(Math.PI/2);
                cx.line(new Vec2(-len, 0), new Vec2(len, 0));
                cx.stroke();

        cx.restore();

        requestAnimationFrame(draw)
    }

    //頁面載完依序呼叫
    function loaded() {

        initCanvas();
        init();
        requestAnimationFrame(draw);
        setInterval(update, 1000/updateFPS);
    }

    // window.addEventListener('load', loaded);
    //頁面縮放
    window.addEventListener('resize', initCanvas);


    //滑鼠 事件更新
    var mousePos = new Vec2(0, 0);
    var mousePosDown = new Vec2(0, 0);
    var mousePosUP = new Vec2(0, 0);

    window.addEventListener("mousemove",mousemove);
    window.addEventListener("mouseup",mouseup);
    window.addEventListener("mousedown",mousedown);

    function mousemove(evt) {
        // mousePos.set(evt.offsetX, evt.offsetY);
        mousePos.set(evt.x, evt.y);
        

    }
    function mouseup(evt) {
        // mousePos.set(evt.offsetX, evt.offsetY);
        mousePos.set(evt.x, evt.y);
        mousePosUP = mousePos.clone();
        
    }
    function mousedown(evt) {
        // mousePos.set(evt.offsetX, evt.offsetY);
        mousePos.set(evt.x, evt.y);
        mousePosDown = mousePos.clone();
    }

    loaded();
}
