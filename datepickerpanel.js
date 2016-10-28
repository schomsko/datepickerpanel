(function($) {
	// init extends the options and inits the jquery ui datepicker
	var init = function(ele, options) {
		var settings = $.extend({
			showButtonPanel: true, // that seems to be the natural place for our buttons as well
			beforeShow: function(ele, datepicker) {
				if (options.srcSelector != null && options.srcFormat != null) {
					if ($(ele).datepicker('getDate') == null || !!options.srcForce) {
						setInitialRelativeDate(ele, options);
					}
				}
				addButtons(ele, options);
			}
		}, options);
		$(ele).datepicker(settings);
	};
	// setInitialRelativeDate parses date from other input element 
	// and performs a transformation action
	var setInitialRelativeDate = function(ele, options) {
		var sourceDateString = $(options.srcSelector).val();
		var date = $.datepicker.parseDate(options.srcFormat, sourceDateString);
		if (date instanceof Date && options.srcAction != undefined) {
			date = transformDate(date, options.srcAction);
		}
		if (date instanceof Date) {
			$(ele).datepicker("setDate", date);
		}
	};
	// addButtons builds the buttons, uses a given template and inserts nodes into the DOM 
	var addButtons = function(ele, options) {
		window.setTimeout(function() {
			var nodes = buildButtonEles(ele, options);
			if (typeof options.template == 'string') {
				nodes = useTpl(nodes, options.template);
			}
			$(ele).datepicker("widget").find('.ui-datepicker-buttonpane').append(nodes);
		}, 20);
	};
	// buildButtonEles builds button nodes and attaches event handlers.
	var buildButtonEles = function(ele, options) {
		var eles = [];
		$.each(options.buttons, function(index, val) {
			var classes = (val.classAttr != undefined) ? 'class="' + val.classAttr + '"' : '';
			var label = (val.label != undefined) ? val.label : '';
			var id = (val.id != undefined) ? 'id="' + val.id + '"' : '';
			var button = $('<button ' + id + ' type="button" ' + classes + '>' + label + '</button>');
			var data = {
				'action': val.action,
				'inputEle': ele,
			};
			button.off('click').on('click', data, function(e) {
				var d1 = getSourceDate(data.inputEle);
				var d2 = transformDate(d1, data.action);
				if (!d2) {
					return;
				}
				$(data.inputEle).datepicker('setDate', d2);
				addButtons(ele, options); // because datepicker widget got repainted
			});
			eles.push(button[0]);
		});
		return eles;
	};
	// useTpl creates nodes from a string and replaces placeholders for button nodes
	var useTpl = function(buttons, tpl) {
		tpl = tpl.replace(/{{/g, '<div id="');
		tpl = tpl.replace(/}}/g, '"></div>');
		var nodes = $(tpl);
		$.each(buttons, function(i, val) {
			if (!!val.id) {
				$(nodes).find('#' + val.id + '').replaceWith(buttons[i]);
			}
		});
		return nodes;
	};
	// getSourceDate
	var getSourceDate = function(inputEle) {
		var milliunix;
		var date = $(inputEle).datepicker('getDate');
		if (date instanceof Date) {
			milliunix = date.valueOf();
		}
		if (typeof milliunix == 'undefined') {
			milliunix = getTodayMs();
		}
		return milliunix;
	};
	// transformDate chooses an operation and handles arguments
	var transformDate = function(sourceDate, actionstring) {
		var date = new Date(sourceDate);
		var actions = parseAction(actionstring);
		if (!actions) {
			console.log('parsing actions failed');
			return false;
		}
		var cmd, amount, unit;
		for (var i in actions) {
			cmd = actions[i][0];
			if (cmd == '+' || cmd == '-') {
				amount = actions[i][1];
				unit = actions[i][2];
				date = stepRange(date, cmd, amount, unit);
			} else if (cmd == 'startof' || cmd == 'endof') {
				unit = actions[i][1];
				date = goToWithin(date, cmd, unit);
			}
		}
		return date;
	};
	// parseAction splits a string into a multidimensional array 
	var parseAction = function(action) {
		var commands = [];
		var cmdToken = ['+', '-', 'startof', 'endof'];
		var indexes = [];
		$.each(cmdToken, function(k, t) {
			var pos = action.indexOf(t);
			while (pos != -1) {
				indexes.push(pos);
				pos = action.indexOf(t, pos + 1);
			}
		});
		indexes.sort(function(a, b) { // sort integers
			return a - b;
		});
		for (var k in indexes) {
			var cmdstring = $.trim(action.slice(indexes[k], indexes[parseInt(k) + 1]));
			var cmd = cmdstring.split(/\s+/g);
			cmd = validateCommand(cmd);
			if (!cmd) {
				return false;
			}
			commands.push(cmd);
		}
		return commands;
	};
	// validateCommand
	var validateCommand = function(cmd) {
		if (cmd[0] == '+' || cmd[0] == '-') {
			if (cmd.length != 3) {
				console.log('Wrong command: ' + cmd);
				return false;
			}
			if (!isInt(cmd[1])) {
				console.log('Wrong command: ' + cmd);
				return false;
			}
			if ((['day', 'days', 'week', 'weeks', 'month', 'months', 'year', 'years']).indexOf(cmd[2]) == -1) {
				console.log('Wrong command: ' + cmd);
				return false;
			}
		} else if (cmd[0] == 'startof' || cmd[0] == 'endof') {
			if (cmd.length != 2) {
				console.log('Wrong command: ' + cmd);
				return false;
			}
			if ((['day', 'week', 'month', 'year']).indexOf(cmd[1]) == -1) {
				console.log('Wrong command: ' + cmd);
				return false;
			}
		}
		return cmd;
	};
	// isInt helper
	var isInt = function(value) {
		return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
	};
	// stepRange transforms a date
	var stepRange = function(date, direction, amount, unit) {
		switch (unit) {
			case 'day':
			case 'days':
				date.setDate(date.getDate() + (amount * (direction + '1')));
				break;
			case 'week':
			case 'weeks':
				date.setDate(date.getDate() + (amount * 7 * (direction + '1')));
				break;
			case 'month':
			case 'months':
				date.setMonth(date.getMonth() + (amount * (direction + '1')));
				break;
			case 'year':
			case 'years':
				date.setFullYear(date.getFullYear() + (amount * (direction + '1')));
				break;
		}
		return date;
	};
	// goToWithin transforms a date
	var goToWithin = function(date, cmd, unit) {
		switch (unit) {
			case 'week':
				if (cmd == 'startof') {
					date = getStartOfWeek(date);
				} else if (cmd == 'endof') {
					date = getEndOfWeek(date);
				}
				break;
			case 'month':
				if (cmd == 'startof') {
					date.setDate(1);
				} else if (cmd == 'endof') {
					date.setMonth(date.getMonth() + 1);
					date.setDate(0); // last day of previous month
				}
				break;
			case 'year':
				if (cmd == 'startof') {
					date.setMonth(0);
					date.setDate(1);
				} else if (cmd == 'endof') {
					date.setMonth(12); // 13th month
					date.setDate(0); // last day of previous month
				}
				break;
		}
		return date;
	};
	// getStartOfWeek gets the start of the week of a given date
	var getStartOfWeek = function(d) {
		var firstDay = $.datepicker._curInst.settings.firstDay; // 0 -> Sunday, 1 -> Monday
		if (firstDay == undefined) {
			firstDay = 0;
		}
		d = new Date(d);
		var day = d.getDay();
		var daysToMove;
		if (day == 0) {
			if (firstDay == 0) {
				daysToMove = 0;
			} else {
				daysToMove = -6;
			}
		} else if (day < 6) {
			if (firstDay == 0) {
				daysToMove = (-1 * day);
			} else {
				daysToMove = (-1 * day) + 1;
			}
		} else { // day == 6
			if (firstDay == 0) {
				daysToMove = -6;
			} else {
				daysToMove = -5;
			}
		}
		return new Date(d.setDate(d.getDate() + daysToMove));
	};
	// getEndOfWeek gets the end of the week of a given date
	var getEndOfWeek = function(d) {
		var firstDay = $.datepicker._curInst.settings.firstDay; // 0 -> Sunday, 1 -> Monday
		if (firstDay == undefined) {
			firstDay = 0;
		}
		d = new Date(d);
		var day = d.getDay();
		var daysToMove;
		if (day == 0) {
			if (firstDay == 0) {
				daysToMove = 6;
			} else {
				daysToMove = 0;
			}
		} else if (day < 6) {
			daysToMove = (6 - day) + firstDay;
		} else { // day == 6
			if (firstDay == 0) {
				daysToMove = 0;
			} else {
				daysToMove = 1;
			}
		}
		return new Date(d.setDate(d.getDate() + daysToMove));
	};
	// getTodayMs returns todays date in unix milliseconds
	var getTodayMs = function() {
		var d = new Date();
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);
		d.setMilliseconds(0);
		return d.valueOf();
	};
	// jQuery Plugin Wrapper
	$.fn.datepickerpanel = function(options) {
		return this.each(function() {
			init(this, options);
		});
	};
}(jQuery));
// noop object to avoid fatal errors
if (typeof console == 'undefined') {
	console = {
		log: function() {}
	}
}