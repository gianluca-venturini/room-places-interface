var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;


var AddResource = React.createClass({
	getInitialState: function() {
		return {name: "", model: "IPAD"};
 	},
 	handleSubmit: function(e) {
 		e.preventDefault();

 		var name = this.refs.name.getDOMNode().value.trim();
 		var model = this.refs.model.getDOMNode().value.trim();

 		nutella.publish("location/resource/add", {rid: name, model: model, type: this.props.type});

 		// Clean the form
 		this.setState({name: ""});
 	},
	handleChangeName: function(e) {
		this.setState({name: event.target.value});
	},
	handleChangeModel: function(e) {
		this.setState({model: event.target.value});
	},
	render: function() {
		return(
			<tr>
				<td>
					<form onSubmit={this.handleSubmit}>
						<input type="text" value={this.state.name} placeholder="Name" onChange={this.handleChangeName} ref="name"/>
						<select value={this.state.model} onChange={this.handleChangeModel} ref="model">
							<option value="IMAC">iMac</option>
							<option value="IPHONE">iPhone</option>
							<option value="IPAD">iPad</option>
							<option value="IBEACON">iBeacon</option>
						</select>
						<input type="submit" />
					</form>
				</td>
			</tr>
		);
	}
});

var AddKeyValue = React.createClass({
	render: function() {
		return(
			<form onSubmit={this.handleSubmit}>
			<tr>
				<td>
					<input type="text" placeholder="Key" ref="key"/>
				</td>
				<td>
					<input type="text" placeholder="Value" ref="value"/>	
				</td>
			</tr>
			</form>
		);
	}
});

var KeyValue = React.createClass({
	getInitialState: function() {
		return {keyModification: false, valueModification: false, key: this.props._key, value: this.props.value};
 	},
 	handleKeyChanged: function(event) {
 		this.setState({key: event.target.value});
 	},
 	handleValueChanged: function(event) {
 		this.setState({value: event.target.value});
 	},
 	handleKeyClicked: function() {
 		this.setState({keyModification: true}, function() {
 			this.refs.key.getDOMNode().focus();
 		});
 	},
 	handleValueClicked: function() {
 		this.setState({valueModification: true}, function() {
 			this.refs.value.getDOMNode().focus();
 		});
 	},
 	handleSubmit: function(event) {
 		event.preventDefault();
 		this.setState({keyModification: false, valueModification: false});
 	},
	render: function() {
		var key;
		var value;
		if(this.state.keyModification)
			key = <form onSubmit={this.handleSubmit}><input type="text" placeholder="Key" ref="key" value={this.state.key} onChange={this.handleKeyChanged} onBlur={this.handleSubmit} /></form>
		else
			key = <div onClick={this.handleKeyClicked}>{this.state.key}</div>

		if(this.state.valueModification)
			value = <form onSubmit={this.handleSubmit}><input type="text" placeholder="Key" ref="value" value={this.state.value} onChange={this.handleValueChanged} onBlur={this.handleSubmit} /></form>
		else
			value = <div onClick={this.handleValueClicked}>{this.state.value}</div>

		return(
			<tr>
				<td>{key}</td>
				<td>{value}</td>
			</tr>
		);
	}
});

var Resource = React.createClass({
	getInitialState: function() {
		return {collapse: false, keyValues: [{key: "key1", value: "value1"}, {key: "key2", value: "value2"}, {key: "key3", value: "value3"}]};
 	},
	handleDelete: function() {
		this.props.handleDelete(this.props.rid);
	},
	handleCollapse: function() {
		this.setState({collapse: !this.state.collapse});
	},
	render: function() {
		var keyValues = this.state.keyValues.map(function (keyValue, index) {
			return (
				<KeyValue key={keyValue.key} _key={keyValue.key} value={keyValue.value}/>
			);
		});

		return(
			<tr>
				<td>
					<div className="col-md-4">{this.props.rid}</div>
					<button className="col-md-2 col-md-offset-4 btn btn-default" type="button" aria-label="Left Align" onClick={this.handleDelete}>
						<span className="glyphicon glyphicon-remove" aria-hidden="true" />
					</button>
					<button className="col-md-2 btn btn-default" type="button" data-toggle="collapse" data-target={"#collapse_"+this.props.rid} aria-expanded="true" aria-controls={"collapse_"+this.props.rid} onClick={this.handleCollapse}>
						<span className={this.state.collapse ? "glyphicon glyphicon-triangle-top" : "glyphicon glyphicon-triangle-bottom"} aria-hidden="true" />
					</button>
					<div className="collapse" id={"collapse_"+this.props.rid}>
						<table className="table table-bordered table-striped">
							<ReactCSSTransitionGroup transitionName="example" component="tbody">
								<tr><th>Key</th><th>Values</th></tr>
								{keyValues}
								<AddKeyValue />
							</ReactCSSTransitionGroup>
						</table>
					</div>
				</td>
			</tr>
		);
	}
});

var ResourceEstimote = React.createClass({
	handleAdd: function() {
		this.props.handleAdd(this.props.rid);
	},
	render: function() {
		return(
			<tr>
				<td>
					<div className="col-md-4">{this.props.rid}</div>
					<button className="col-md-2 col-md-offset-6 btn btn-default" type="button" aria-label="Left Align" onClick={this.handleAdd}>
						<span className="glyphicon glyphicon-plus" aria-hidden="true" />
					</button>
				</td>
			</tr>
		);
	}
});


var ResourceTable = React.createClass({
	getInitialState: function() {
    	return {
    		resourceData: [],
    		estimoteData: []
    	};
 	},
 	componentDidMount: function() {
 		self = this;

 		// Download all resources
 		nutella.request("location/resources", {}, function(reply) {
 			self.setState({resourceData: reply.resources});
 		});

 		// Wait for new added resources
 		nutella.subscribe("location/resources/added", function(message) {
 			var data = self.state.resourceData;
 			data = data.concat(message.resources)

 			self.setState({resourceData: data});
 		});

 		// Wait for removed resources
 		nutella.subscribe("location/resources/removed", function(message) {
 			var data = self.state.resourceData;
 			data = data.filter(function(d) { 
 				return $.inArray(d.rid, message.resources.map(function(r) {
 					return r.rid;
 				})) == -1;
 			});

 			self.setState({resourceData: data});
 		});

 		// Download estimote beacons data
		nutella.request("location/estimote", {}, function(reply) {
 			self.setState({estimoteData: reply.resources});
 		});
  	},
  	handleResourceDelete: function(rid) {
		nutella.publish("location/resource/remove", {rid: rid});

		// Delete the corresponding row
		var data = this.state.resourceData;
 		data = data.filter(function(d) { return d.rid != rid; });
 		this.setState({resourceData: data});
	},
	handleResourceEstimoteAdd: function(rid) {
		nutella.publish("location/resource/add", {rid: rid,
				model: "IBEACON",
				type: "DYNAMIC"
			});
	},
	render: function() {
		var self = this;

		var staticResourcesData = this.state.resourceData.filter(function(resource) { return resource.type == "STATIC"});
		var dynamicResourcesData = this.state.resourceData.filter(function(resource) { return resource.type == "DYNAMIC"});
		var estimoteResourcesData = this.state.estimoteData.filter(function(resource) { 
				return $.inArray(resource.name, dynamicResourcesData.map(function(r) {
 					return r.rid;
 				})) == -1; 
			});

		var staticResources = staticResourcesData.map(function (resource, index) {
			return (
				<Resource key={resource.rid} rid={resource.rid} handleDelete={self.handleResourceDelete}/>
			);
		});

		var dynamicResources = dynamicResourcesData.map(function (resource, index) {
			return (
				<Resource key={resource.rid} rid={resource.rid} handleDelete={self.handleResourceDelete}/>
			);
		});

		var estimoteResources = estimoteResourcesData.map(function (resource, index) {
			return (
				<ResourceEstimote key={resource.name} rid={resource.name} handleAdd={self.handleResourceEstimoteAdd}/>
			);
		});

		return(
			<div>
				<table className="table table-bordered table-striped">
					<ReactCSSTransitionGroup transitionName="example" component="tbody">
						<tr><th>Static resources</th></tr>
						{staticResources}
						<AddResource type="STATIC"/>
					</ReactCSSTransitionGroup>
				</table>

				<table className="table table-bordered table-striped">
					<ReactCSSTransitionGroup transitionName="example" component="tbody">
						<tr><th>Dynamic resources</th></tr>
						{dynamicResources}
						<AddResource type="DYNAMIC"/>

						<tr><th>Estimote iBeacon</th></tr>
						{estimoteResources}
					</ReactCSSTransitionGroup>
					
				</table>
			</div>
		);
	}
});
