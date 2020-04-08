module.exports = class Particle {
    constructor(x, y, vx, vy){
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy =vy;    
    }

    update(){
        // this.x += this.vx;
        // this.y += this.vy;
        // this.vy += 1;
        // this.vx *= .5;
    }

    draw(p){
        p.push();
        p.strokeWeight(0);
        p.fill(255);
        p.ellipse(this.x, this.y, 2, 2);
        p.pop();
    }

    isOutOfBounds(width, height){
        return this.x < 0 || //left side of 
            this.x > width || //right
            this.y < 0 || //top
            this.y > height; //bottom
    }
}

