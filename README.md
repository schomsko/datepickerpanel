# Datepicker Panel
Datepicker Panel is a wrapper plugin for the jQuery UI [datepicker widget](http://api.jqueryui.com/datepicker) to add Buttons. 

## Requirements
- jQuery, jQuery UI

## Usage
#### Basic
Instead of calling:

`$('selector').datepicker(options)`

you call:

`$('selector').datepickerpanel(options)`

All options for the jQuery UI Datepicker Widget will be passed through. 

#### Adding buttons
Datepicker Panel let's you use an additional option "_buttons_" to add buttons with custom actions. You can use the option "_template_" for additional markup. 

#### Using another date when opening datepicker
There are also options to open the datepicker with a date that depends on another date stored in another element. This can be done with the options: `srcSelector`, `srcFormat`, `srcAction`, `srcForce`

## buttons & template
```javascript
template : '{{id1}}<span>lorem ipsum</span>{{idx}}</div>',
buttons : [{
	id : 'id1', // to be used in template
	label : 'Click me for another day!', // shown on button
	classAttr : 'nice', // just for styling
	action : '+ 3 months startof week', // textual representation of the date mutation
},...]
```
### template 
The _template_ property can be omitted.
A _template_ value is an html string with "`{{elementId}}`" as placeholder for each button. If you use the template property, make sure to define the _id_ property in your button object.

### buttons
With the option _buttons_ you can add buttons and define actions that transform the date when a button is clicked. _buttons_ is an array of objects that can have the properties `id, label, classAttr, action`.

## action
The value of the property _action_ or _srcAction_ is a series of one or more actions seperated by whitespace. A single _action_ is written as a string of words seperated by whitespace. The actions in a series are used in order of appearance from left to right.
```
command [amount|unit] [unit] [command [amount|unit] [unit] ...]
```
A _command_ can be one of: 
- `+`
- `-` 
- `startof`
- `endof`

An _amount_ is a positiv integer. 

If the command is `+` or `-`, the syntax is:
```
[+|-] [amount] [day|days|week|weeks|month|months|year|years]
```

If the command is `startof` or `endof`, the syntax is: 
```
[startof|endof] [week|month|year]
```
So a valid but probably useless action can be for example:
```bash
startof week + 1 day - 3 years endof week endof year + 1 month
``` 
## Using a date from another element
Sometimes it is usefull if the datepicker opens with a date that is calculated from another value.
```javascript
srcSelector : '#startofsomething', // selector of e.g. an input element
srcFormat : 'mm/dd/yy', // format string
srcAction : '+ 1 year endof week', // action for transforming that date
srcForce : true, // force dependency when widget opens - even if date is already set
```
### srcSelector
A jQuery selector string for a dom element that holds a string retrievable by `$(srcSelector).val()`. 
That string should be in a form that it results in a JavaScript Date object when parsed with `$.datepicker.parse(srcFormat,datestring)`.

### srcFormat
A string for parsing a date. Please look here: http://api.jqueryui.com/datepicker/#utility-parseDate .

### srcAction
The actions to transform the date collected from the _srcSelector_. If omitted, the date will be used unaltered.

### srcForce
By default the datepicker will only set the date if no date is set in the current input element. If srcForce is set to a truthy value, then datepicker will always open with the date collected by _srcSelector_, _srcFormat_ and _srcAction_.

## Full Example
```
<html>
<head><title>datepickerpanel</title>
<link rel="stylesheet" type="text/css" href="../jquery/jquery-ui.css">
<script src="https://code.jquery.com/jquery-3.1.1.min.js" integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=" crossorigin="anonymous"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
<script src="../src/datepickerpanel.js"></script>
<script>
	jQuery(document).ready(function($) {
		var options1 = {
			buttons : [
				{
					label: 'one month ago',
					classAttr: 'nice',
					action: '- 1 month',
				}
			]
		};
		$('.date1').datepickerpanel(options1);
		var options2 = {
			template : '<div><p>Lorem ipsum.</p>{{id1}}{{foobarbaz}}</div>',
			srcSelector : '.date1',
			srcFormat : 'mm/dd/yy',
			srcAction : '+ 1 year',
			srcForce : true,
			buttons : [
				{
					id : 'id1',
					label: 'end of next year',
					classAttr: 'even nicer',
					action: '+ 1 year endof year',
				},{
					id: 'foobarbaz',
					label: 'Two weeks earlier end of week',
					classAttr: 'also nice',
					action: '- 2 weeks endof week',
				}
			]
		};
		$('.date2').datepickerpanel(options2);
	});
</script>
</head>
<body>
<h1>datepickerpanel</h1>
<input type="text" class="date1" />
<input type="text" class="date2" />
</body>
</html>
```