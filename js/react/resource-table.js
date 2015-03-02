var ResourceTable = React.createClass({
    getInitialState: function () {
        return {
            resourceData: [],
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
            data = data.concat(message.resources)

            self.setState({resourceData: data});
        });

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
    },
    updateResource: function(resource) {
        console.log("update resource "+resource.rid);
        nutella.net.publish("location/resource/update", resource);
    },
    removeResource: function(resource) {
        console.log("remove resource "+resource.rid);
        nutella.net.publish("location/resource/remove", resource);
    },
    render: function() {
        var self = this;

        // Order the resource list
        var resources = this.state.resourceData;
        resources = resources.sort(function(a, b) {return a.rid.localeCompare(b.rid)});
        console.log(resources);

        var resourceRows = resources.map(function (resource, index) {
            return (
                <Resource resource={resource}
                    key={resource.rid}
                    updateResource={self.updateResource}
                    removeResource={self.removeResource}
                    room={self.props.room}/>
            );
        });

        return(
            <div>
                <div id="resource_table" className="col-md-12 table-responsive" style={{"overflowX": "scroll"}}>
                    <table className="table table-bordered table-striped table-hover" id="resource_table">
                        <thead>
                            <tr>
                                <th className="col-md-12 col-sm-12 col-xs-12 text-center">Resources</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resourceRows}
                        </tbody>
                    </table>
                </div>
                <ResourceAdd />
            </div>
        );
    }
});