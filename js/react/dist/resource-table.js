var ResourceTable = React.createClass({displayName: "ResourceTable",
    getInitialState: function () {
        return {
            resourceData: [],
            beaconData: []
        };
    },
    componentDidMount: function () {
        self = this;

        // Download all resources
        nutella.net.request("location/resources", {}, function(reply) {
            self.setState({resourceData: reply.resources});
        });

        // Wait for new added resources
        nutella.net.subscribe("location/resources/added", function(message) {
            var data = self.state.resourceData;
            data = data.concat(message.resources);

            self.setState({resourceData: data});
        });

        setInterval(function() {
            nutella.net.request("location/resources", {}, function(reply) {
                self.setState({resourceData: reply.resources});
            });
        }, 1000);

        // Wait for updated resources
        nutella.net.subscribe("location/resources/updated", function(message) {
            var data = self.state.resourceData;
            data = data.filter(function(d) {
                return $.inArray(d.rid, message.resources.map(function(r) {
                        return r.rid;
                    })) == -1;
            });
            data = data.concat(message.resources)
            self.setState({resourceData: data});
        });

        // Wait for removed resources
        nutella.net.subscribe("location/resources/removed", function(message) {
            var data = self.state.resourceData;
            data = data.filter(function(d) {
                return $.inArray(d.rid, message.resources.map(function(r) {
                        return r.rid;
                    })) == -1;
            });

            self.setState({resourceData: data});
        });


        // Download all beacons
        nutella.net.request("beacon/beacons", {}, function(reply) {
            self.setState({beaconData: reply.beacons});
        });

        // Wait for new added beacons
        nutella.net.subscribe("beacon/beacons/added", function(message) {
            var data = self.state.beaconData;
            data = data.concat(message.beacons);

            self.setState({beaconData: data});
        });

        // Wait for removed beacons
        nutella.net.subscribe("beacon/beacons/removed", function(message) {
            var data = self.state.beaconData;
            data = data.filter(function(d) {
                return $.inArray(d.rid, message.beacons.map(function(r) {
                        return r.rid;
                    })) == -1;
            });

            self.setState({beaconData: data});
        });
    },
    updateResource: function(resource) {
        console.log("update resource "+resource.rid);
        nutella.net.publish("location/resource/update", resource);
    },
    removeResource: function(resource) {
        console.log("remove resource "+resource.rid);
        nutella.net.publish("location/resource/remove", resource);
    },
    addResource: function(resource) {
        nutella.net.publish("location/resource/add", resource);
    },
    render: function() {
        var self = this;

        // Order the resource list
        var resources = this.state.resourceData;
        resources = resources.sort(function(a, b) {return a.rid.localeCompare(b.rid)});

        var resourceRows = resources.map(function (resource, index) {
            return (
                React.createElement(Resource, {resource: resource, 
                    key: resource.rid, 
                    updateResource: self.updateResource, 
                    removeResource: self.removeResource, 
                    room: self.props.room})
            );
        });

        // Order the resource list
        var beacons = this.state.beaconData;
        beacons = beacons.sort(function(a, b) {return a.rid.localeCompare(b.rid)});
        beacons = beacons.filter(function(b) {

            return $.inArray(b.rid, resources.map(function(r) {
                return r.rid;
            })) == -1;

        });

        var beaconRows = beacons.map(function (beacon, index) {
            return (
                React.createElement(Beacon, {beacon: beacon, 
                    key: beacon.rid, 
                    addResource: self.addResource})
            );
        });

        return(
            React.createElement("div", null, 
                React.createElement("div", {id: "resource_table", className: "col-md-12 table-responsive", style: {"overflowX": "scroll"}}, 
                    React.createElement("table", {className: "table table-bordered table-striped table-hover", id: "resource_table"}, 
                        React.createElement("thead", null, 
                            React.createElement("tr", null, 
                                React.createElement("th", {className: "col-md-12 col-sm-12 col-xs-12 text-center"}, "Resources")
                            )
                        ), 
                        React.createElement("tbody", null, 
                            resourceRows
                        )
                    )
                ), 
                React.createElement(ResourceAdd, {room: this.props.room}), 
                React.createElement("div", {id: "beacon_table", className: "col-md-12 table-responsive", style: {"overflowX": "scroll"}}, 
                    React.createElement("table", {className: "table table-bordered table-striped table-hover", id: "resource_table"}, 
                        React.createElement("thead", null, 
                            React.createElement("tr", null, 
                                React.createElement("th", {className: "col-md-12 col-sm-12 col-xs-12 text-center"}, "Beacons")
                            )
                        ), 
                        React.createElement("tbody", null, 
                            beaconRows
                        )
                    )
                ), 
                React.createElement(Discrete, {room: this.props.room})
            )
        );
    }
});
