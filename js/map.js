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
        arrow_thick: 0.06,
        _arrow_ratio: 2.0,
        font: 0.12,
        resource_name_font: 0.1,
        quotation_excess: 1.2,
        _quotation_room_offset: 0.4,
        quotation_color: "#056CF2",
        resource_radius: 0.06,
        resource_radius_hover: 0.2,
        resource_range_stroke: 0.05,
        proximity_range_stroke: 0.01,
        location_range_color: "rgba(216, 242, 242, 0.5)",
        location_range_stroke_color: "#056CF2",
        proximity_range_stroke_color: "#056CF2",
        location_range_stroke_color_overlapped: "#c0392b",
        location_range_color_overlapped: "rgba(231, 76, 60, 0.5)",
        resource_name_offset: 0.1
    };

    self.updateStyle = function(k) {
        self.style = {};
        for(var key in self._style) {
            if(typeof self._style[key] == "string") {
                self.style[key] = self._style[key];
            }
            else {
                if(key[0] == "_")
                    self.style[key.slice(1)] = self._style[key];
                else
                    self.style[key] = self._style[key] * k;
            }

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

    // Private variables
    var proximityResourceRangeGroup = undefined;
    var proximityResourceRangeTextGroup = undefined;
    var staticResourceLocationGroup = undefined;
    var staticResourceLocationRangeGroup = undefined;
    var staticResourceLocationRangeBackgroundGroup = undefined;
    var resourceLocationNameGroup = undefined;
    var resourceLocationNumberGroup = undefined;

    // Render the static resources with D3 and keep track of them
    self.renderStaticResources = function() {

        // Check for possible overlap in ranges
        self.checkOverlap();

        var continuousResources = [];
        var proximityResources = [];

        for(var r in self.resources) {
            if(self.resources[r].continuous != undefined)
                continuousResources.push(self.resources[r]);
            if(self.resources[r].proximity != undefined &&
                self.resources[r].proximity.rid != undefined &&
                self.resources[r].proximity.distance != undefined)
                proximityResources.push(self.resources[r]);
        }

        // Drag & drop behavior for resources
        var drag = d3.behavior.drag()
            //.origin(function(d) { return d; })
            .on("dragstart", function(d){
                d3.select(this)
                    .classed({"dragged": true});

                d.dragged = true;

                self.renderResources();
            })
            .on("drag", function(d) {
                d3.select(this)
                    .attr("cx", d.continuous.x = d3.event.x)
                    .attr("cy", d.continuous.y = d3.event.y);

                // Add quotations
                if(d.quotation != undefined)
                    d.quotation.remove();

                // X on the left
                d.quotation = self.drawQuotation(
                    0,
                    d.continuous.y,
                    d.continuous.x,
                    d.continuous.y,
                    Position.bottom,
                    0,
                    d.continuous.x.toPrecision(3),
                    self.style.quotation_color);

                // X on the right
                d.quotation = self.drawQuotation(
                    d.continuous.x,
                    d.continuous.y,
                    self.roomManager.x,
                    d.continuous.y,
                    Position.bottom,
                    0,
                    (self.roomManager.x-d.continuous.x).toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Y on the top
                d.quotation = self.drawQuotation(
                    d.continuous.x,
                    0,
                    d.continuous.x,
                    d.continuous.y,
                    Position.left,
                    0,
                    d.continuous.y.toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Y on the bottom
                d.quotation = self.drawQuotation(
                    d.continuous.x,
                    d.continuous.y,
                    d.continuous.x,
                    self.roomManager.y,
                    Position.left,
                    0,
                    (self.roomManager.y-d.continuous.y).toPrecision(3),
                    self.style.quotation_color,
                    undefined,
                    d.quotation);

                // Recalculate y
                d.continuous.y = self.roomManager.y - d.continuous.y;


            })
            .on("dragend", function(d){
                var x = parseFloat(d3.select(this).attr("cx"));
                var y = self.roomManager.y - parseFloat(d3.select(this).attr("cy"));

                d3.select(this)
                    .classed({"dragged": false});

                d.continuous.y = y;

                var continuous = {x: x, y: y};
                if(d.continuous.z != null)
                    continuous.z = d.continuous.z;

                d.dragged = false;

                // Remove quotation
                d.quotation.remove();

                // Rend all resources
                self.renderResources();

                // Update the resource on the server
                nutella.net.publish("location/resource/update", {rid: d.rid, continuous: continuous});
            });

        // Drag & drop behavior for proximity range
        var dragRange = d3.behavior.drag()
            .on("dragstart", function(d){

            })
            .on("drag", function(d) {

                // Calculate the new range
                if(d.proximity_range != undefined)
                    d.proximity_range = Math.sqrt(
                            Math.pow(d3.event.x - d.continuous.x, 2)+
                            Math.pow(d3.event.y - (self.roomManager.y - d.continuous.y), 2)
                        );

                // Update graphically the range
                d3.select(this)
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
            })
            .on("dragend", function(d) {

                // Update the resource on the server
                if(d.proximity_range != undefined)
                    nutella.net.publish("location/resource/update", {
                        rid: d.rid,
                        proximity_range: d.proximity_range,
                        continuous: d.continuous
                    });
            });

        // Continuous resources

        // Resource D3 object
        var resourceLocation = staticResourceLocationGroup.selectAll(".resource_location")
            .data(continuousResources);

        // Resource range D3 object
        var resourceLocationRange = staticResourceLocationRangeGroup.selectAll(".resource_location_range")
            .data(continuousResources);

        // Resource range background D3 object
        var resourceLocationRangeBackground = staticResourceLocationRangeBackgroundGroup.selectAll(".resource_location_range_background")
            .data(continuousResources);

        // Resource name (RID)
        var resourceLocationName = resourceLocationNameGroup.selectAll(".resource_location_name")
            .data(continuousResources);

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
            .attr("fill", self.style.location_range_color);

        // Update resources that are already there
        resourceLocationRangeBackground
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return self.roomManager.y - d.continuous.y; })
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
            .attr("class", "resource_location_range pointer")
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
            .attr("cy", function(d) { return self.roomManager.y - d.continuous.y; })
            .call(dragRange);

        // Update resources that are already there
        resourceLocationRange
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return self.roomManager.y - d.continuous.y; })
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
            .attr("x", function(d) { return d.continuous.x; })
            .attr("y", function(d) { return (self.roomManager.y - d.continuous.y) - self.style.resource_name_offset; })
            .attr("class", "resource_location_name")
            .attr("text-anchor", "middle")
            .attr("fill", function(d) { if(d.dragged == true) return "none"; else return "black";})
            .attr("font-size", self.style.resource_name_font);

        resourceLocationName
            .attr("x", function(d) { return d.continuous.x; })
            .attr("y", function(d) { return (self.roomManager.y - d.continuous.y) - self.style.resource_name_offset; })
            .attr("fill", function(d) { if(d.dragged == true) return "none"; else return "black";})
            .text(function(d) { return d.rid; });

        resourceLocationName.exit().remove();

        resourceLocationName.order();

        resourceLocation
            .enter()
            .append("circle")
            .attr("class", "resource_location pointer")
            .attr("r", self.style.resource_radius)
            .attr("fill", "black")
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return self.roomManager.y - d.continuous.y; })
            /*
            .on("mouseenter", function(d) {
                if(d.dragged != true)
                    d3.select(this)
                        .transition()
                        .attr("r", self.style.resource_radius_hover);
            })
            .on("mouseleave", function(d) {
                d3.select(this)
                    .transition()
                    .attr("r", self.style.resource_radius);
            })
            */
            .call(drag);

        // Update resources that are already there
        resourceLocation
            .transition()
            .attr("r", self.style.resource_radius)
            .attr("cx", function(d) { return d.continuous.x; })
            .attr("cy", function(d) { return self.roomManager.y - d.continuous.y; });

        resourceLocation.exit().remove();

        resourceLocation.order();

        // Proximity resources

        // Resource
        var proximityResourceRange = proximityResourceRangeGroup.selectAll(".proximity_resource_range")
            .data(proximityResources);

        proximityResourceRangeTextGroup.selectAll(".proximity_resource_text").remove();
        var proximityResourceText = proximityResourceRangeTextGroup.selectAll(".proximity_resource_text")
            .data(proximityResources);

        proximityResourceRange
            .enter()
            .append("circle")
            .attr("class", "proximity_resource_range")
            .attr("r", function(d) { return d.proximity.distance; })
            .attr("fill", "none")
            .attr("stroke", function() {
                return self.style.proximity_range_stroke_color;
            } )
            .attr("stroke-width", self.style.proximity_range_stroke)
            .attr("cx", function(d) { return d.proximity.continuous.x; })
            .attr("cy", function(d) { return self.roomManager.y - d.proximity.continuous.y; });

        // Update resources that are already there
        proximityResourceRange
            .attr("cx", function(d) { return d.proximity.continuous.x; })
            .attr("cy", function(d) { return self.roomManager.y - d.proximity.continuous.y; })
            .transition()
            .attr("r", function(d) { return d.proximity.distance; });

        proximityResourceRange.exit().remove();

        proximityResourceText
            .enter()
            .append("text")
            .attr("class", "proximity_resource_text")
            .attr("x", function(d) { return d.proximity.continuous.x; })
            .attr("y", function(d) { return self.roomManager.y - d.proximity.continuous.y; })
            .attr("text-anchor", "middle")
            .attr("font-size", self.style.resource_name_font)
            .attr("fill", "black")
            .text(function(d) { return d.rid; });

        // Update resources that are already there
        proximityResourceText
            //.transition()
            .attr("x", function(d) { return d.proximity.continuous.x; })
            .attr("y", function(d) { return self.roomManager.y - d.proximity.continuous.y - d.proximity.distance; })
            .text(function(d) { return d.rid; });

        proximityResourceText.exit().remove();

        // Number of beacons tracked for every base station
        var resourceLocationNumber = resourceLocationNumberGroup.selectAll(".resource_location_number")
            .data(continuousResources);

        resourceLocationNumber
            .enter()
            .append("text")
            .attr("x", function(d) { return d.continuous.x; })
            .attr("y", function(d) { return self.roomManager.y - d.continuous.y + self.style.resource_name_font/3})
            .attr("class", "resource_location_number no_interaction")
            .attr("text-anchor", "middle")
            .attr("fill", function(d) { if(d.dragged == true) return "none"; else return "white";})
            .attr("font-size", self.style.resource_name_font);

        // Update resources that are already there
        resourceLocationNumber
            .attr("x", function(d) { return d.continuous.x; })
            .attr("y", function(d) { return self.roomManager.y - d.continuous.y + self.style.resource_name_font/3})
            .text(function(d) {return d.number_resources; });

        resourceLocationNumber.exit().remove();

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

        // Vertical room quotation
        self.drawQuotation(0, 0,                   0,                  self.roomManager.y, Position.left,   0.5, self.roomManager.y, self.style.quotation_color, function() {
            var newHeight = prompt("Insert new height", self.roomManager.y);
            var y = parseFloat(newHeight);

            if(newHeight != undefined) {
                self.roomManager.y = y;
                self.render();
            }
        });

        // Horizontal room quotation
        self.drawQuotation(0, self.roomManager.y,  self.roomManager.x, self.roomManager.y, Position.bottom, 0.5, self.roomManager.x, self.style.quotation_color, function() {
            var newWidth = prompt("Insert new width", self.roomManager.x);
            var x = parseFloat(newWidth);

            if(newWidth != undefined) {
                self.roomManager.x = x;
                self.render();
            }
        });

        // Create all the groups
        staticResourceLocationRangeBackgroundGroup = self.room.clip.append("g").attr("class", "staticResourceLocationRangeBackgroundGroup");
        staticResourceLocationRangeGroup = self.room.clip.append("g").attr("class", "staticResourceLocationRangeGroup");
        resourceLocationNameGroup = self.room.clip.append("g").attr("class", "resourceLocationNameGroup");
        proximityResourceRangeGroup = self.room.clip.append("g").attr("class", "proximityResourceRangeGroup");
        proximityResourceRangeTextGroup = self.room.clip.append("g").attr("class", "proximityResourceRangeTextGroup");
        staticResourceLocationGroup = self.room.clip.append("g").attr("class", "staticResourceLocationGroup");
        resourceLocationNumberGroup = self.room.clip.append("g").attr("class", "resourceLocationNumberGroup");

        self.renderResources();
    };

    self.drawArrow = function(x, y, color, position, element) {

        if(element == null)
            element = self.svg;

        var lineData = [
            { "x":  0.0, "y": 0.0},
            { "x":  1*self.style.arrow_thick/self.style.arrow_ratio, "y": 1*self.style.arrow_thick*self.style.arrow_ratio},
            { "x": -1*self.style.arrow_thick/self.style.arrow_ratio, "y": 1*self.style.arrow_thick*self.style.arrow_ratio}
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

    self.drawQuotation = function(x1, y1, x2, y2, position, offset, quotationText, color, onClick, quotationObject) {

        var quotation;
        if(quotationObject == undefined) {
            quotation = self.room.append("g");
        }
        else {
            quotation = quotationObject;
        }

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
            .text(quotationText)
            .attr("x", (x1+x2)/2 + ox)
            .attr("y", (y1+y2)/2 + oy + self.style.font / 3)
            .attr("font-size", self.style.font)
            .attr("text-anchor", "middle")
            .attr("fill", color);


        if(onClick != null) {
            text.on("click", onClick);
            text.classed("pointer",true);
        }

        // Get the text length
        var textWidth = quotation.select("text").node().getBBox().width;
        var textHeight = quotation.select("text").node().getBBox().height;

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

        return quotation;
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
        nutella.net.request("location/resources", {}, function(reply) {
            for(var r in reply.resources) {
                var resource = reply.resources[r];
                if(resource["continuous"] != null  ||
                    resource["proximity"] != null) {
                    self.resources[resource.rid] = resource;
                }
            }

            //self.renderResources();
        });

        var updateResource = function(message) {
            var resources = message.resources;
            var changed = false;

            for(var r in resources) {
                var resource = resources[r];
                if(resource["continuous"] != null ||
                    resource["proximity"] != null) {
                    self.resources[resource.rid] = resource;
                    changed = true;
                }
                else {
                    delete self.resources[resource.rid];
                    changed = true;
                }
            }

            if(changed) {
                //self.renderResources();
            }
        };

        // Update resources
        nutella.net.subscribe("location/resources/updated", updateResource);

        // Add resources
        nutella.net.subscribe("location/resources/added", updateResource);

        // Delete resources
        nutella.net.subscribe("location/resources/removed", function(message) {
            var resources = message.resources;

            for(var r in resources) {
                delete self.resources[resources[r].rid];
            }

            //self.renderResources();
        });

        // Update the whole map
        room.observers.push(function() {

            // Update the look and feel
            var d = Math.max(room.x, room.y);
            self.updateStyle(d/7.0);

            self.render();
        });

        // Update resources position once a second
        setInterval(self.renderResources, 1000);

    }();

    return self;
}