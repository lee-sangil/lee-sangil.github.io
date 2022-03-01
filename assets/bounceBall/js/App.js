import {Ball} from "./Ball.js"
import {Obstacles} from "./Obstacles.js"
import * as utils from "./utils.js"

class App{
    constructor(){
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.addEventListener("touchstart", this.touchstart.bind(this), false);
        this.canvas.addEventListener("touchmove", this.touchmove.bind(this), false);
        this.canvas.addEventListener("mousedown", this.mousedown.bind(this), false);
        this.canvas.addEventListener("mouseup", this.mouseup.bind(this), false);
        this.canvas.addEventListener("resize", this.resize.bind(this), false);

        this.resize();

        this.ball = new Ball(this.stageWidth, this.stageHeight, this.stageHeight*0.04, this.stageHeight*0.006); // width, height, radius, initial speed
        this.obstacles = new Obstacles(this.stageWidth, this.stageHeight, 10, this.ball); // width, height, the maximum number of obstacles, exclusion region(=ball)
        this.obstacles.updateView(this.stageWidth, this.stageHeight, 0, 0);

        window.requestAnimationFrame(this.animate.bind(this));
    }
    touchstart(evt){
        let pos = utils.getCanvasRelativePosition(evt.touches[0], this.canvas);
        this.pos_last = pos;

        this.id_drag = this.obstacles.intersect(pos);
    }
    touchmove(evt){
        let pos = utils.getCanvasRelativePosition(evt.touches[0], this.canvas);

        // Calculate touch distance
        const delta_x = pos.x - this.pos_last.x;
        const delta_y = pos.y - this.pos_last.y;

        if (this.id_drag == -1)
            this.obstacles.updateView(this.stageWidth, this.stageHeight, delta_x, delta_y);
        else{
            this.obstacles.nth_child[this.id_drag].updatePosition(delta_x, delta_y);
            this.obstacles.updateView(this.stageWidth, this.stageHeight, 0, 0);
        }

        this.pos_last = pos;
    }
    mousedown(evt){
        let pos = utils.getCanvasRelativePosition(evt, this.canvas);
        this.pos_last = pos;

        this.id_drag = this.obstacles.intersect(pos);
        console.log(pos.x + ',' + pos.y);

        this.canvas.onmousemove = ((evt)=>{this.mousemove(evt);}).bind(this);
    }
    mousemove(evt){
        // Calculate touch distance
        let pos = utils.getCanvasRelativePosition(evt, this.canvas)
        const delta_x = pos.x - this.pos_last.x;
        const delta_y = pos.y - this.pos_last.y;

        if (this.id_drag == -1)
            this.obstacles.updateView(this.stageWidth, this.stageHeight, delta_x, delta_y);
        else{
            this.obstacles.nth_child[this.id_drag].updatePosition(delta_x, delta_y);
            this.obstacles.updateView(this.stageWidth, this.stageHeight, 0, 0);
        }

        this.pos_last = pos;
    }
    mouseup(evt){
        this.canvas.onmousemove = null;
    }
    resize() {
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = this.stageWidth * 0.5;

        this.canvas.width = this.stageWidth * 2;
        this.canvas.height = this.stageHeight * 2;
        this.ctx.scale(2, 2);

        if (this.obstacles)
            this.obstacles.updateView(this.stageWidth, this.stageHeight, 0, 0);
    }

    animate(t) {
        this.ctx.clearRect(0,0,this.stageWidth, this.stageHeight);
        this.obstacles.drawShadow(this.ctx);
        this.ball.draw(this.ctx, this.stageWidth, this.stageHeight, this.obstacles);
        this.obstacles.drawForeground(this.ctx);
        window.requestAnimationFrame(this.animate.bind(this));
    }
}

window.onload = () => {
    // $(window.document).on("contextmenu", function(event){ return false; }); // lock right click
    
    // if (getComputedStyle(document.documentElement).getPropertyValue('--debug-mode') != 1){
    //     $(window.document).on("keydown", function(event){
    //         if(event.keyCode==123){ // Prevent from <F12> key
    //             return false;
    //         }
    //         else if(event.ctrlKey && event.shiftKey && event.keyCode==73){
    //             return false;  // Prevent from ctrl+shift+i
    //         }
    //         else if(event.ctrlKey){
    //             return false;  // Prevent from ctrl
    //         }
    //     });
    // }
    
    new App();
}
