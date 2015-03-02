
var ResourceAdd = React.createClass({
    componentDidMount: function () {

    },
    getInitialState: function() {
        return {name: "", model: "IPAD", type: "DYNAMIC", tracking: "CONTINUOUS"};
    },
    handleSubmit: function(e) {
        alert("Submit");
        e.preventDefault();


        nutella.net.publish("location/resource/add", {rid: this.state.name, model: this.state.model, type: this.state.type});

        // Clean the form
        this.setState({name: ""});
    },
    handleChangeName: function(e) {
        this.setState({name: event.target.value});
    },
    handleChangeTypeDynamic: function(e) {
        this.setState({type: "DYNAMIC"});
    },
    handleChangeTypeStatic: function(e) {
        this.setState({type: "STATIC"});
    },
    handleChangeTrackingContinuous: function(e) {
        this.setState({tracking: "CONTINUOUS"});
    },
    handleChangeTrackingDiscrete: function(e) {
        this.setState({tracking: "DISCRETE"});
    },
    handleChangeTrackingNone: function(e) {
        this.setState({tracking: "NONE"});
    },
    handleChangeModel: function(e) {
        this.setState({model: event.target.value});
    },
    render: function () {

        var type = "";

        if(this.state.type == "STATIC")
            type = <b>S</b>;
        else if(this.state.type == "DYNAMIC")
            type = <b>D</b>;

        var tracking = "";

        if(this.state.tracking == "CONTINUOUS")
            tracking = "fa-arrows";
        else if(this.state.tracking == "DISCRETE")
            tracking = "fa-th-large";
        else
            tracking = "fa-ban";

        return(
            <div className="col-md-12 col-sm-12 col-xs-12 table-responsive" style={{"overflowX": "visible"}}>
                <table className="table table-bordered table-striped table-hover" id="resource_table" style={{"overflowX": "visible"}}>
                    <thead>
                        <tr>
                            <th className="col-md-12 col-sm-12 col-xs-12 text-center">Add resource</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="col-md-12 col-sm-12 col-xs-12">
                                <form onSubmit={this.handleSubmit}>
                                    <div className="col-md-4 col-sm-4 col-xs-4">
                                        <input type="text" className="form-control" placeholder="resource-id" value={this.state.name} onChange={this.handleChangeName}/>
                                    </div>
                                    <div className="btn-group dropup">
                                        <a className="btn btn-default" href="#"><i className={"fa " + tracking + " fa-fw"}></i></a>
                                        <a className="btn btn-default dropdown-toggle" data-toggle="dropdown" href="#">
                                            <span className="fa fa-caret-up"></span>
                                        </a>
                                        <ul className="dropdown-menu">
                                            <li onClick={this.handleChangeTrackingContinuous}><a href="#"><i className="fa fa-arrows fa-fw"></i> Continuous</a></li>
                                            <li onClick={this.handleChangeTrackingDiscrete}>  <a href="#"><i className="fa fa-th-large fa-fw"></i> Discrete</a></li>
                                            <li onClick={this.handleChangeTrackingNone}>      <a href="#"><i className="fa fa-ban fa-fw"></i> Disabled</a></li>
                                        </ul>
                                    </div>

                                    <div className="btn-group dropup" role="group">
                                        <div className="btn-group" role="group">
                                            <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">
                                                {type}
                                                <span className="caret"></span>
                                            </button>
                                            <ul className="dropdown-menu" role="menu">
                                                <li onClick={this.handleChangeTypeStatic}> <a href="#"><b>S</b> Static</a></li>
                                                <li onClick={this.handleChangeTypeDynamic}><a href="#"><b>D</b> Dynamic</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <button onClick={this.handleSubmit} type="button" className="btn btn-default right">
                                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
});
