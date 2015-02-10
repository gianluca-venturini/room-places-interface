var Map = function(mapId, room) {
    var self = {};

    // The size measure are in meters
    self.size = {
        margin_left: 1,
        margin_right: 1,
        margin_top: 1,
        margin_bottom: 1
    };

    self._style = {
        stroke: 0.01,
        arrow_thick: 0.1,
        arrow_ratio: 0.5,
        font: 0.12,
        quotation_excess: 1.2,
        resource_radius: 0.1,
        resource_range_stroke: 0.05,
        location_range_color: "rgba(216, 242, 242, 0.5)",
        location_range_stroke_color: "#056CF2",
        location_range_stroke_color_overlapped: "#c0392b",
        location_range_color_overlapped: "rgba(231, 76, 60, 0.5)",
        resource_name_offset: 0.2
    };

    self.updateStyle = function(k) {
        self.style = {};
        for(var key in self._style) {
            if(typeof self._style[key] == "string")
                self.style[key] = self._style[key];
            else
                self.style[key] = self._style[key] * k;
        }
    };

    // Room model
    self.roomManager = room;

    // D3 group containing the room objects
    self.room = null;

    // Contains all the resources data indexed with the RID
    self.resources = {};

    // Contains all the graphical resources indexed with the RID
    self.graphicResources = {};

    // Render the resources and keep track of them
    self.renderResources = function() {
        self.renderStaticResources();
    };

    // Render the static resources and keep track of them
    self.renderStaticResources = function() {

        // Check for possible overlap in ranges
        self.checkOverlap();

        var resources = [];

        for(var r in self.resources) {
            resources.push(self.resources[r]);
        }

        // Memorize last time (in ms) that we render the page
        var lastRender = 0;

        // Drag & drop behavior
        var drag = d3.behavior.drag()
            //.origin(function(d) { return d; })
            .on("dragstart", function(d){
                d.dragged = true;

                self.renderResources();
            })
            .on("drag", function(d) {
                d3.select(this)
                    .attr("cx", d.continuous.x = d3.event.x)
                    .attr("cy", d.continuous.y = d3.event.y);

                /*
                var date = new Date();
                if(date.getTime() - lastRender > 200) {
                    self.renderResources();
                    lastRender = date.getTime();
                }
                */

            })
            .on("dragend", function(d){
                var x = d3.select(this).attr("cx");
                var y = d3.select(this).attr("cy");

                var continuous = {x: x, y: y};
                if(d.continuous.z != null)
                    continuous.z = d.continuous.z;

                d.dragged = false;

                // Rend all resources
                self.renderResources();

                // Update the resource on the server
                nutella.publish("location/resource/update", {rid: d.rid, continuous: continuous});
            });

        // Resource D3 object
        var resourceLocation = self.room.clip.selectAll(".resource_location")
            .data(resources);

        // Resource range D3 object
        var resourceLocationRange = self.room.clip.selectAll(".resource_location_range")
            .data(resources);

        // Resource range background D3 object
        var resourceLocationRangeBackground = self.room.clip.selectAll(".resource_location_range_background")
            .data(resources);

        // Resource name (RID)
        var resourceLocationName = self.room.clip.selectAll(".resource_location_name")
            .data(resources);
        
        resourceLocationRangeBackground
            .enter()
            .append("circle")
            .attr("class", "resource_location_range_background")
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            })
            .attr("fill", self.style.location_range_color)
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return d.continuous.y; });

        // Update resources that are already there
        resourceLocationRangeBackground
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return d.continuous.y; })
            .attr("fill", function(d) {
                if(d.overlapped == true) {
                    return self.style.location_range_color_overlapped;
                }
                else
                    return self.style.location_range_color;
            })
            .transition()
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            });

        resourceLocationRangeBackground.exit().remove();


        resourceLocationRange
            .enter()
            .append("circle")
            .attr("class", "resource_location_range")
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            })
            .attr("fill", "none")
            .attr("stroke", function() {
                return self.style.location_range_stroke_color;
            } )
            .attr("stroke-width", self.style.resource_range_stroke)
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return d.continuous.y; });

        // Update resources that are already there
        resourceLocationRange
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return d.continuous.y; })
            .attr("stroke", function(d) {
                if(d.overlapped == true) {
                    return self.style.location_range_stroke_color_overlapped;
                }
                else {
                    return self.style.location_range_stroke_color;
                }
            } )
            .transition()
            .attr("r", function(d) {
                if(d.proximity_range != null) {
                    if(d.dragged == true)
                        return 0;
                    else
                        return d.proximity_range;
                }
                else {
                    return 0;
                }
            });

        resourceLocationRange.exit().remove();

        resourceLocationName
            .enter()
            .append("text")
            .attr("class", "resource_location_name")
            .attr("x", function(d) { return d.continuous.x; })
            .attr("y", function(d) { return d.continuous.y - self.style.resource_name_offset; })
            .attr("text-anchor", "middle")
            .attr("fill", function(d) { if(d.dragged == true) return "none"; else return "black";})
            .attr("font-size", self.style.font)
            .text(function(d) { return d.rid; });

        resourceLocationName
            .attr("x", function(d) { return d.continuous.x; })
            .attr("y", function(d) { return d.continuous.y - self.style.resource_name_offset; })
            .attr("fill", function(d) { if(d.dragged == true) return "none"; else return "black";});

        resourceLocationName.exit().remove();

        resourceLocation
            .enter()
            .append("circle")
            .attr("class", "resource_location")
            .attr("r", self.style.resource_radius)
            .attr("fill", "black")
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return d.continuous.y; })
            .call(drag);

        // Update resources that are already there
        resourceLocation
            .transition()
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return d.continuous.y; });

        resourceLocation.exit().remove();

    };

    // Render the map from the beginning
    self.render = function() {
        var height = self.roomManager.y + self.size.margin_top  + self.size.margin_bottom;
        var width  = self.roomManager.x + self.size.margin_left + self.size.margin_right;

        self.svg.attr("viewBox", "0 0 " + width + " " + height);

        if(self.room != null) {
            self.room.remove();
        }

        // Group that contains all the elements of the room
        self.room = self.svg.append("g")
            .attr("transform", "translate("+ self.size.margin_left +","+ self.size.margin_top +")");

        // Clip path used in order to crop elements outside the room
        var defs = self.room.append("defs");

        defs.append("rect")
            .attr("id", "rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", self.roomManager.x)
            .attr("height", self.roomManager.y)
            .attr("fill", "black")
            .attr("stroke", "blue");

        defs.append("clipPath")
            .attr("id", "clip")
                .append("use")
                .attr({"xlink:href": "#rect"});



        self.room.clip = self.room.append("g")
            .attr("clip-path", "url(#clip)");


        // Rectangle that represent the room
        self.rect = self.room.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", self.roomManager.x)
            .attr("height", self.roomManager.y)
            .style("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", self.style.stroke);

        // Vertical quotation line
        self.room.append("line")
            .attr("x1", -self.size.margin_left/2)
            .attr("x2", -self.size.margin_left/2)
            .attr("y1", 0)
            .attr("y2", self.roomManager.y/2 - self.style.font)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", -self.size.margin_left/2)
            .attr("x2", -self.size.margin_left/2)
            .attr("y1", self.roomManager.y/2 + self.style.font)
            .attr("y2", self.roomManager.y)
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
            .attr("y1", self.roomManager.y)
            .attr("y2", self.roomManager.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("text")
            .text(self.roomManager.y)
            .attr("x", -self.size.margin_left/2)
            .attr("y", self.roomManager.y/2 + self.style.font/3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .on("click", function(e) {
                var newHeight = prompt("Insert new height", self.roomManager.y);
                self.roomManager.y = parseFloat(newHeight);
                self.render();
            });

        // Calculate arrow
        self.drawArrow(-self.size.margin_left/2 , 0, "rgb(0,0,255)", Position.top, self.room);
        self.drawArrow(-self.size.margin_left/2 , self.roomManager.y, "rgb(0,0,255)", Position.bottom, self.room);

        // Horizontal quotation line
        self.room.append("line")
            .attr("x1", 0)
            .attr("x2", self.roomManager.x/2 - self.style.font*2)
            .attr("y1", self.size.margin_bottom/2 + self.roomManager.y)
            .attr("y2", self.size.margin_bottom/2 + self.roomManager.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.roomManager.x/2 + self.style.font*2)
            .attr("x2", self.roomManager.x)
            .attr("y1", self.size.margin_bottom/2 + self.roomManager.y)
            .attr("y2", self.size.margin_bottom/2 + self.roomManager.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", self.roomManager.y)
            .attr("y2", self.size.margin_bottom*3/4 + self.roomManager.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("line")
            .attr("x1", self.roomManager.x)
            .attr("x2", self.roomManager.x)
            .attr("y1", self.roomManager.y)
            .attr("y2", self.size.margin_bottom*3/4 + self.roomManager.y)
            .style("stroke", "rgb(0,0,255)")
            .style("stroke-width", self.style.stroke);

        self.room.append("text")
            .text(self.roomManager.x)
            .attr("x", self.roomManager.x/2)
            .attr("y", self.roomManager.y + self.size.margin_bottom/2 + self.style.font/3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .on("click", function(e) {
                var newWidth = prompt("Insert new width", self.roomManager.x);
                self.roomManager.x = parseFloat(newWidth);
                self.render();
            });

        // Calculate arrow
        self.drawArrow(0, self.size.margin_top+self.roomManager.y - self.size.margin_top/2, "rgb(0,0,255)", Position.left, self.room);
        self.drawArrow(self.roomManager.x , self.roomManager.y+self.size.margin_top/2, "rgb(0,0,255)", Position.right, self.room);

        //self.drawQuotation(2, 1, 2, 5, Position.right, 1, "prova", "rgb(0,0,255)");

        self.renderResources();
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

    // Check if two static resources are overlapped and ser overlapped=true in case
    self.checkOverlap = function() {
        for(r1 in self.resources) {
            self.resources[r1].overlapped = false;
            for(r2 in self.resources) {
                if( r1 != r2 ) {
                    var resource1 = self.resources[r1];
                    var resource2 = self.resources[r2];

                    if(resource1.continuous != null &&
                        resource2.continuous != null &&
                        resource1.proximity_range != null &&
                        resource2.proximity_range != null) {

                        // Check if the distance is less than the sum of proximity ranges
                        var distance = Math.sqrt(
                                        Math.pow(resource1.continuous.x - resource2.continuous.x,2)
                                      + Math.pow(resource1.continuous.y - resource2.continuous.y,2));

                        var sumRange = parseFloat(resource1.proximity_range) + parseFloat(resource2.proximity_range);

                        if(distance < sumRange) {
                            resource1.overlapped = true;
                        }
                    }
                }
            }
        }
    };


    self.init = function() {
        self.svg = d3.select(mapId);

        self.updateStyle(1);

        self.render();

        // Download all resources
        nutella.request("location/resources", {}, function(reply) {
            for(var r in reply.resources) {
                var resource = reply.resources[r];
                if(resource["continuous"] != null ) {
                    self.resources[resource.rid] = resource;
                }
            }

            self.renderResources();
        });

        var updateResource = function(message) {
            var resources = message.resources;
            var changed = false;

            for(var r in resources) {
                var resource = resources[r];
                if(resource["continuous"] != null ) {
                    self.resources[resource.rid] = resource;
                    changed = true;
                }
                else {
                    delete self.resources[resource.rid];
                    changed = true;
                }
            }

            if(changed) {
                self.renderResources();
            }
        };

        // Update resources
        nutella.subscribe("location/resources/updated", updateResource);

        // Add resources
        nutella.subscribe("location/resources/added", updateResource);

        // Delete resources
        nutella.subscribe("location/resources/removed", function(message) {
            var resources = message.resources;

            for(var r in resources) {
                delete self.resources[resources[r].rid];
            }

            self.renderResources();
        });

        // Update the whole map
        room.observers.push(function() {

            // Update the look and feel
            var d = Math.max(room.x, room.y);
            self.updateStyle(d/7.0);

            self.render();
        });

    }();

    return self;
}