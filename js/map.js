var Map = function(mapId) {
    var self = {};

    // The size measure are in meters
    self.size = {
        x: 15,
        y: 10,
        margin_left: 1,
        margin_right: 1,
        margin_top: 1,
        margin_bottom: 1
    };

    self.style = {
        stroke: 0.01,
        arrow_thick: 0.1,
        arrow_ratio: 0.5,
        font: 0.12,
    };

    self.render = function() {
        var height = self.size.y + self.size.margin_top + self.size.margin_bottom;
        var width = self.size.x + self.size.margin_left + self.size.margin_right;

        self.svg.attr("viewBox", "0 0 " + width + " " + height);

        if(self.room != null) {
            self.room.remove();
        }

        self.room = self.svg.append("g");

        self.rect = self.room.append("rect")
            .attr("x", self.size.margin_left)
            .attr("y", self.size.margin_top)
            .attr("width", self.size.x)
            .attr("height", self.size.y)
            .style("fill", "rgb(255,255,255)")
            .attr("stroke", "black")
            .attr("stroke-width", self.style.stroke);

        // Vertical quotation line
        self.room.append("line")
            .attr("x1", self.size.margin_left/2)
            .attr("x2", self.size.margin_left/2)
            .attr("y1", self.size.margin_top)
            .attr("y2", self.size.margin_top + self.size.y/2 - self.style.font)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.margin_left/2)
            .attr("x2", self.size.margin_left/2)
            .attr("y1", self.size.margin_top + self.size.y/2 + self.style.font)
            .attr("y2", self.size.margin_top + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.margin_left/4)
            .attr("x2", self.size.margin_left)
            .attr("y1", self.size.margin_top)
            .attr("y2", self.size.margin_top)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.margin_left/4)
            .attr("x2", self.size.margin_left)
            .attr("y1", self.size.margin_top + self.size.y)
            .attr("y2", self.size.margin_top + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("text")
            .text(self.size.y)
            .attr("x", self.size.margin_left/2)
            .attr("y", self.size.margin_top + self.size.y/2 +  + self.style.font/3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .on("click", function(e) {
                var newHeight = prompt("Insert new height", self.size.y);
                self.size.y = parseFloat(newHeight);
                self.render();
            });

        // Calculate arrow
        self.drawArrow(self.size.margin_left/2 , self.size.margin_top, "rgb(0,0,255)", Position.top, self.room);
        self.drawArrow(self.size.margin_left/2 , self.size.margin_top+self.size.y, "rgb(0,0,255)", Position.bottom, self.room);

        // Horizontal quotation line
        self.room.append("line")
            .attr("x1", self.size.margin_left)
            .attr("x2", self.size.margin_left + self.size.x/2 - self.style.font*2)
            .attr("y1", self.size.margin_top + self.size.margin_bottom/2 + self.size.y)
            .attr("y2", self.size.margin_top + self.size.margin_bottom/2 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.margin_left + self.size.x/2 + self.style.font*2)
            .attr("x2", self.size.margin_left + self.size.x)
            .attr("y1", self.size.margin_top + self.size.margin_bottom/2 + self.size.y)
            .attr("y2", self.size.margin_top + self.size.margin_bottom/2 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.margin_left)
            .attr("x2", self.size.margin_left)
            .attr("y1", self.size.margin_top + self.size.y)
            .attr("y2", self.size.margin_top + self.size.margin_bottom*3/4 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.margin_left + self.size.x)
            .attr("x2", self.size.margin_left + self.size.x)
            .attr("y1", self.size.margin_top + self.size.y)
            .attr("y2", self.size.margin_top + self.size.margin_bottom*3/4 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("text")
            .text(self.size.x)
            .attr("x", self.size.margin_left + self.size.x/2)
            .attr("y", self.size.y + self.size.margin_top + self.size.margin_bottom/2 + self.style.font/3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .on("click", function(e) {
                var newWidth = prompt("Insert new width", self.size.x);
                self.size.x = parseFloat(newWidth);
                self.render();
            });

        // Calculate arrow
        self.drawArrow(self.size.margin_left , self.size.margin_top+self.size.y+self.size.margin_top/2, "rgb(0,0,255)", Position.left, self.room);
        self.drawArrow(self.size.margin_left + self.size.x , self.size.margin_top+self.size.y+self.size.margin_top/2, "rgb(0,0,255)", Position.right, self.room);
    };

    self.drawArrow = function(x, y, color, position, element) {

        if(element == null)
            element = self.svg;

        var lineData = [
            { "x":  0.0, "y": 0.0},
            { "x":  1*self.style.arrow_thick*self.style.arrow_ratio, "y": 1*self.style.arrow_thick/self.style.arrow_ratio},
            { "x": -1*self.style.arrow_thick*self.style.arrow_ratio, "y": 1*self.style.arrow_thick/self.style.arrow_ratio}
        ];

        var lineFunction = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate("linear");

        // calculate rotation
        var angle;
        switch(position) {
            case Position.top:    angle = 0;   break;
            case Position.bottom: angle = 180; break;
            case Position.right:  angle = 90;  break;
            case Position.left:   angle = 270; break;
            default:              angle = 0;
        }

        var arrow = element.append("g")
            .attr("transform", "translate(" + x + "," + y + ")")
                .append("path")
            .attr("d", lineFunction(lineData))
            .attr("fill", color)
            .attr("transform", "rotate("+angle+")");

        return arrow;
    };

    self.init = function() {
        self.svg = d3.select(mapId);

        self.render();
    }();

    return self;
}