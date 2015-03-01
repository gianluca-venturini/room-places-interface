
var Resource = React.createClass({
    componentDidMount: function () {

    },
    handleParameterChange: function(event) {
        var text = $("#"+event.target.id).text();

        // Pressed return
        if(event.which == 13) {
            $("#"+event.target.id).blur();
            $("#"+event.target.id).text(text);
        }
    },
    handleUpdateParameters: function() {
        var resource = this.props.resource;
        if(resource.continuous != undefined) {
            if(resource.continuous.x != undefined) {
                resource.continuous.x = parseFloat($("#"+this.props.resource.rid+"_parameter_x").text());
            }
            if(resource.continuous.y != undefined) {
                resource.continuous.y = parseFloat($("#"+this.props.resource.rid+"_parameter_y").text());
            }
            if(resource.proximity_range != undefined) {
                resource.proximity_range = parseFloat($("#"+this.props.resource.rid+"_parameter_proximity").text());
            }
        }
        this.props.updateResource(resource);
    },
    handleContinousPressed: function() {
        var resource = this.props.resource;
        delete resource["discrete"];
        resource.continuous = {
            x: this.props.room.x/2,
            y: this.props.room.y/2
        };
        this.props.updateResource(resource);
    },
    handleDiscretePressed: function() {
        var resource = this.props.resource;
        delete resource["continuous"];
        resource.discrete = {
            x: 0,
            y: 0
        };
        this.props.updateResource(resource);
    },
    handleDisablePressed: function() {
        var resource = this.props.resource;
        delete resource["continuous"];
        delete resource["discrete"];
        this.props.updateResource(resource);
    },
    handleDeletePressed: function() {
        this.props.removeResource(this.props.resource);
    },
    handleStaticPressed: function() {
        var resource = this.props.resource;
        if(resource.type == "STATIC")
            return;

        resource.type = "STATIC";
        resource.proximity_range = 1;
        delete resource["proximity"];
        this.props.updateResource(resource);
    },
    handleDynamicPressed: function() {
        var resource = this.props.resource;
        if(resource.type == "DYNAMIC")
            return;

        resource.type = "DYNAMIC";
        delete resource["proximity_range"];
        this.props.updateResource(resource);
    },
    render: function () {
        var self = this;

         var parameters = [];

         if(this.props.resource.continuous != undefined ) {

             if(this.props.resource.continuous.x != undefined) {
                 parameters.push({key: "x", value: this.props.resource.continuous.x});
             }



             if(this.props.resource.continuous.y != undefined) {
                 parameters.push({key: "y", value: this.props.resource.continuous.y});
             }
         }

         if(this.props.resource.proximity_range != undefined) {
             parameters.push({key: "proximity", value: this.props.resource.proximity_range});
         }



         var parameterRows = parameters.map(function (parameter, index) {
             return(
                 <tr>
                     <td className="col-md-6 col-sm-6 col-xs-6"><span>{parameter.key}</span></td>
                     <td className="col-md-6 col-sm-6 col-xs-6">
                         <span id={self.props.resource.rid+"_parameter_"+parameter.key}
                             contentEditable="true"
                             onKeyDown={self.handleParameterChange}
                             onKeyUp={self.handleParameterChange}
                             onBlur={self.handleUpdateParameters}>
                                {parameter.value}
                         </span>
                     </td>
                 </tr>
             );
         });

        var parameterTable =
            <table className="table table-bordered table-striped table-hover" id="resource_table">
                <thead>
                    <tr>
                        <td className="col-md-6 col-sm-6 col-xs-6">Variable</td>
                        <td className="col-md-6 col-sm-6 col-xs-6">Value</td>
                    </tr>
                </thead>
                <tbody>
                    {parameterRows}
                </tbody>
            </table>;

        if(parameterRows.length == 0)
            parameterTable = [];

        var keyValueRows = [];

        if(this.props.parameters != undefined) {
            this.props.parameters.map(function (parameter, index) {
                return (
                    <tr>
                        <td className="col-md-6"><span contentEditable="true">{parameter.key}</span></td>
                        <td className="col-md-6"><span contentEditable="true">{parameter.value}</span></td>
                    </tr>
                );
            });
        }

        var type = "";

        if(this.props.resource.type == "STATIC") {
            type = <b>S</b>;
        }
        else if(this.props.resource.type == "DYNAMIC") {
            type = <b>D</b>;
        }

        var trackingSystem = "";

        if(this.props.resource.continuous != undefined) {
            trackingSystem = <i className="fa fa-arrows fa-fw"></i>;
        }
        else if(this.props.resource.discrete != undefined) {
            trackingSystem = <i className="fa fa-th-large fa-fw"></i>;
        }
        else {
            trackingSystem = <i className="fa fa-ban fa-fw"></i>;
        }

        return(

            <tr>
                <td className="col-md-12 col-sm-12 col-xs-12">
                    <div className="col-md-4 col-sm-4 col-xs-4"><div className="vertical-center"><span>{this.props.resource.rid}</span></div></div>

                    <div className="btn-group">
                        <a className="btn btn-default" href="#">{trackingSystem}</a>
                        <a className="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">
                            <span className="fa fa-caret-down"></span></a>
                        <ul className="dropdown-menu">
                            <li onClick={this.handleContinousPressed}><a href="#"><i className="fa fa-arrows fa-fw"></i> Continuous</a></li>
                            <li onClick={this.handleDiscretePressed}><a href="#"><i className="fa fa-th-large fa-fw"></i> Discrete</a></li>
                            <li onClick={this.handleDisablePressed}><a href="#"><i className="fa fa-ban fa-fw"></i> Disable</a></li>
                            <li className="divider"></li>
                            <li onClick={this.handleDeletePressed}><a href="#"><i className="fa fa-trash-o fa-fw"></i> Delete</a></li>
                        </ul>
                    </div>

                    <div className="btn-group" role="group">
                        <div className="btn-group" role="group">
                            <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                {type}
                                <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu" role="menu">
                                <li onClick={this.handleStaticPressed}><a href="#"><b>S</b> Static</a></li>
                                <li onClick={this.handleDynamicPressed}><a href="#"><b>D</b> Dynamic</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="right"  data-toggle="collapse" data-target={"#collapse-"+this.props.resource.rid}>
                        <button type="button" className="btn btn-default"><span className="glyphicon glyphicon-chevron-down" aria-hidden="true"></span></button>
                    </div>

                    <div className="collapse" id={"collapse-"+this.props.resource.rid}>
                        <div style={{"padding": "20px"}}>
                            {parameterTable}
                            <table className="table table-bordered table-striped table-hover" id="resource_table">
                                <thead>
                                    <tr>
                                        <td className="col-md-6 col-sm-6 col-xs-6">Key</td>
                                        <td className="col-md-6 col-sm-6 col-xs-6">Value</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="col-md-6"><span id="A3" contentEditable="true">Prova</span></td>
                                        <td className="col-md-6"><span id="A3" contentEditable="true">Prova</span></td>
                                    </tr>
                                    <tr>
                                        <td className="col-md-6"><span id="A3" contentEditable="true">Prova</span></td>
                                        <td className="col-md-6"><span id="A3" contentEditable="true">Prova</span></td>
                                    </tr>
                                    <tr>
                                        <td className="col-md-6"><span id="A3" contentEditable="true">Prova</span></td>
                                        <td className="col-md-6"><span id="A3" contentEditable="true">Prova</span></td>
                                    </tr>
                                    <tr>
                                        <td className="col-md-6"><input type="text" className="form-control" placeholder="key" /></td>
                                        <td className="col-md-6"><input type="text" className="form-control" placeholder="value" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </td>
            </tr>
        );

    }
});

