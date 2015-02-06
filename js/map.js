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
        quotation_excess: 1.2,
    };

    // Contains all the resources indexed with the RID
    self.resources = {};

    self.renderResources = function() {

    };

    self.render = function() {
        var height = self.size.y + self.size.margin_top + self.size.margin_bottom;
        var width = self.size.x + self.size.margin_left + self.size.margin_right;

        self.svg.attr("viewBox", "0 0 " + width + " " + height);

        if(self.room != null) {
            self.room.remove();
        }

        self.room = self.svg.append("g")
            .attr("transform", "translate("+ self.size.margin_left +","+ self.size.margin_top +")")

        self.rect = self.room.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", self.size.x)
            .attr("height", self.size.y)
            .style("fill", "rgb(255,255,255)")
            .attr("stroke", "black")
            .attr("stroke-width", self.style.stroke);

        // Vertical quotation line
        self.room.append("line")
            .attr("x1", -self.size.margin_left/2)
            .attr("x2", -self.size.margin_left/2)
            .attr("y1", 0)
            .attr("y2", self.size.y/2 - self.style.font)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", -self.size.margin_left/2)
            .attr("x2", -self.size.margin_left/2)
            .attr("y1", self.size.y/2 + self.style.font)
            .attr("y2", self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", -self.size.margin_left*3/4)
            .attr("x2", 0)
            .attr("y1", 0)
            .attr("y2", 0)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", -self.size.margin_left*3/4)
            .attr("x2", 0)
            .attr("y1", self.size.y)
            .attr("y2", self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("text")
            .text(self.size.y)
            .attr("x", -self.size.margin_left/2)
            .attr("y", self.size.y/2 + self.style.font/3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .on("click", function(e) {
                var newHeight = prompt("Insert new height", self.size.y);
                self.size.y = parseFloat(newHeight);
                self.render();
            });

        // Calculate arrow
        self.drawArrow(-self.size.margin_left/2 , 0, "rgb(0,0,255)", Position.top, self.room);
        self.drawArrow(-self.size.margin_left/2 , self.size.y, "rgb(0,0,255)", Position.bottom, self.room);

        // Horizontal quotation line
        self.room.append("line")
            .attr("x1", 0)
            .attr("x2", self.size.x/2 - self.style.font*2)
            .attr("y1", self.size.margin_bottom/2 + self.size.y)
            .attr("y2", self.size.margin_bottom/2 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.x/2 + self.style.font*2)
            .attr("x2", self.size.x)
            .attr("y1", self.size.margin_bottom/2 + self.size.y)
            .attr("y2", self.size.margin_bottom/2 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", self.size.y)
            .attr("y2", self.size.margin_bottom*3/4 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.size.x)
            .attr("x2", self.size.x)
            .attr("y1", self.size.y)
            .attr("y2", self.size.margin_bottom*3/4 + self.size.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("text")
            .text(self.size.x)
            .attr("x", self.size.x/2)
            .attr("y", self.size.y + self.size.margin_bottom/2 + self.style.font/3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .on("click", function(e) {
                var newWidth = prompt("Insert new width", self.size.x);
                self.size.x = parseFloat(newWidth);
                self.render();
            });

        // Calculate arrow
        self.drawArrow(0, self.size.margin_top+self.size.y - self.size.margin_top/2, "rgb(0,0,255)", Position.left, self.room);
        self.drawArrow(self.size.x , self.size.y+self.size.margin_top/2, "rgb(0,0,255)", Position.right, self.room);

        self.drawQuotation(2, 1, 2, 5, Position.right, 1, "prova", "rgb(0,0,255)");
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

    self.drawQuotation = function(x1, y1, x2, y2, position, offset, text, color) {

        var quotation = self.room.append("g");

        // Calculate the offsets in two dimensions
        var ox, oy;

        switch(position) {
            case Position.bottom:
                ox = 0;
                oy = offset;

                break;
            case Position.top:
                ox = 0;
                oy = -offset;

                break;
            case Position.left:
                ox = -offset;
                oy = 0;

                break;
            case Position.right:
                ox = offset;
                oy = 0;
                break;
        }

        var text = quotation.append("text")
            .text(text)
            .attr("x", (x1+x2)/2 + ox)
            .attr("y", (y1+y2)/2 + oy + self.style.font / 3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .attr("fill", color);

        // Get the text length
        var textWidth = text.node().getBBox().width;
        var textHeight = text.node().getBBox().height;

        var sx, sy;

        switch(position) {
            case Position.bottom:
            case Position.top:
                sx = textWidth / 2;
                sy = 0;

                quotation.append("line")
                    .attr("x1", x1 + ox)
                    .attr("x2", (x1+x2)/2 + ox - sx)
                    .attr("y1", y1 + oy)
                    .attr("y2", y2 + oy)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                quotation.append("line")
                    .attr("x1", (x1+x2)/2 + ox + sx)
                    .attr("x2", x2 + ox)
                    .attr("y1", y1 + oy)
                    .attr("y2", y2 + oy)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                self.drawArrow(x1+ox, y1+oy, color, Position.left, quotation);
                self.drawArrow(x2+ox, y2+oy, color, Position.right, quotation);

                break;

            case Position.left:
            case Position.right:
                sx = 0;
                sy = textHeight / 2;

                quotation.append("line")
                    .attr("x1", x1 + ox)
                    .attr("x2", x2 + ox)
                    .attr("y1", y1 + oy)
                    .attr("y2", (y1+y2)/2 + oy - sy/2)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                quotation.append("line")
                    .attr("x1", x1 + ox)
                    .attr("x2", x2 + ox)
                    .attr("y1", (y1+y2)/2 + oy + sy/2)
                    .attr("y2", y2 + oy)
                    .style("stroke", color)
                    .style("stroke-width", self.style.stroke);

                self.drawArrow(x1+ox, y1+oy, color, Position.top, quotation);
                self.drawArrow(x2+ox, y2+oy, color, Position.bottom, quotation);

                break;
        }


        quotation.append("line")
            .attr("x1", x1)
            .attr("x2", x1+ox*self.style.quotation_excess)
            .attr("y1", y1)
            .attr("y2", y1+oy*self.style.quotation_excess)
            .style("stroke", color)
            .style("stroke-width", self.style.stroke);

        quotation.append("line")
            .attr("x1", x2)
            .attr("x2", x2+ox*self.style.quotation_excess)
            .attr("y1", y2)
            .attr("y2", y2+oy*self.style.quotation_excess)
            .style("stroke", color)
            .style("stroke-width", self.style.stroke);
    };

    self.init = function() {
        self.svg = d3.select(mapId);

        self.render();
    }();

    return self;
}