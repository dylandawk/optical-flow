module.exports = class Triangles{
    constructor(flow, values){
        this.triangles = new Array(flow.flow.zones.length);
        this.values = new Array(values.length);
    }

    update(flow){
        this.triangles = flow.flow.zones.map((zone, i) => {
            if(flow.flow.zones.length !== this.triangles.length){
                return zone;
            }

            let oldFlowZone = this.triangles[i];
            if(oldFlowZone === undefined) return zone;
            zone.u = (oldFlowZone.u + zone.u) / 2;
            zone.v = (oldFlowZone.v + zone.v) / 2;
            return zone;
            
        });

    }

    draw(p, step, cols, gradient){
        this.triangles.forEach(function(zone){
            // p.stroke(p.map(zone.u, -step, +step, 0, 255), p.map(zone.v, -step, +step, 0, 255), 128);
            p.push();
            p.noStroke();
            p.colorMode(p.HSB, 100, 100, 100);
           
            for(let i = 0; i < cols; i ++){
                var h = gradient[i].h * 100;
                var s = gradient[i].s * 100;
                var b = gradient[i].b * 100;
                if(zone.i === i ) p.fill(h, s, b);
            }
        
            p.beginShape(p.TRIANGLES);
            p.vertex(zone.x, zone.y + (step/2));
            p.vertex(zone.x + zone.u, zone.y + zone.v);
            p.vertex(zone.x, zone.y - (step/2));
            p.endShape()
            p.pop();
        })
       
    }
}