// vim:set fileencoding=utf-8 sw=2 ts=2 sts=2:
// Author: Mathias Rav
// Date: May 22, 2013
// encoding test: rød grød med fløde æ ø å

function year_prefix(year) {
	year = 2012 - year;
	var prefixes = ['', 'G', 'B', 'O', 'TO'];
	if (0 <= year && year < prefixes.length) {
		return prefixes[year];
	}
	if (year == -1) return 'K';
	var negative = false;
	var exponent = year - 3;
	if (year < 0) { exponent = -year; negative = true; }
	exponent = exponent+'';
	var exponentString = '';
	var s = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
	for (var i = 0; i < exponent.length; ++i)
		exponentString += s[exponent.charCodeAt(i) - 48];
	return negative ? 'K'+exponentString : 'T'+exponentString+'O';
}

function title_bling(title) {
	if (title == "KASS") return "KA$$";
	if (title == 'CERM') return "\u2102ERM"; // complex C
	if (title == 'VC') return "V\u2102";

	return title;
}

var svg = {};

var TK = (
'<span '+
'style="vertical-align: -0.4pt">T</span><span '+
'style="font-weight: bold">&Aring;</span>G<span '+
'style="display: inline-block; transform: rotate(8deg); -webkit-transform: '+
'rotate(8deg)">E</span><span '+
'style="vertical-align: -0.6pt">K</span><span '+
'style="vertical-align: 0.2pt; font-weight: bold">A</span><span '+
'style="vertical-align: -0.6pt">M</span><span '+
'style="display: inline-block; transform: rotate(-8deg); -webkit-transform: '+
'rotate(-8deg); font-weight: bold">M</span>ER');
var TKET = TK + '<span style="vertical-align: 0.6pt">ET</span>';

///////////////////////////////////////////////////////////////////////////////
// Callback generator for add_alias.
///////////////////////////////////////////////////////////////////////////////
function insert_TK_html(h) {
	return function (n, orig_string) {
		var replaced = document.createElement('span');
		replaced.style.fontFamily = 'monospace';
		replaced.style.fontWeight = 'normal';
		replaced.style.display = 'inline-block';
		replaced.style.whiteSpace = 'nowrap';
		replaced.className = 'tket';
		replaced.innerHTML = h;
		n.parentNode.insertBefore(replaced, n);
	};
}

var aliases = {'replacements': {}, 'targets': []};

///////////////////////////////////////////////////////////////////////////////
// Add a text replacement.
//
// `source` is a string to watch for in DOM text nodes.
// Whenever `source` is found, the function `destination` is invoked with two
// parameters: the insertion point of the replacement text, and the original
// replaced text.
///////////////////////////////////////////////////////////////////////////////
function add_alias(source, destination) {
	// June 12, 2013:
	// On latin1 pages, the utf8 strings in this script do not match with
	// non-ascii characters. I don't know how to do this for all
	// characters, so give special treatment to those special letters.
	// This appears to fix it for both Firefox 24 and Chromium 27.
	source = (source
		  .replace(/æ/g, '\xe6')
		  .replace(/ø/g, '\xf8')
		  .replace(/å/g, '\xe5')
		  .replace(/Æ/g, '\xc6')
		  .replace(/Ø/g, '\xd8')
		  .replace(/Å/g, '\xc5'));

	aliases.targets.push(source);
	aliases.replacements[source] = destination;
}

add_alias('TÅGEKAMMERET', insert_TK_html(TKET));
add_alias('TÅGEKAMMER', insert_TK_html(TK));

var alias_regexp;
function compute_alias_regexp() {
	alias_regexp = new RegExp(aliases.targets.join('|'));
}
compute_alias_regexp();

///////////////////////////////////////////////////////////////////////////////
// Parse input line to an object.
///////////////////////////////////////////////////////////////////////////////
function parse_alias(line) {
	var prefixed = /^(\d+) +([^ ]+) +(.*)/.exec(line);
	if (prefixed) {
		return {'name': prefixed[3],
			'year': prefixed[1],
			'title': prefixed[2]};
	}
	var hangaround = /^"([^"]*)" +(.*)/.exec(line);
	if (hangaround) {
		return {'name': hangaround[2],
			'nickname': hangaround[1]};
	}
	return null;
}

///////////////////////////////////////////////////////////////////////////////
// Parse input lines, sending objects to a callback function.
///////////////////////////////////////////////////////////////////////////////
function parse_aliases(input, cb) {
	var lineMatch;
	var re = /^.+$/mg;
	while (lineMatch = re.exec(input)) {
		var line = lineMatch[0];
		var parsed = parse_alias(line);
		cb(parsed, line);
	}
}

///////////////////////////////////////////////////////////////////////////////
// Given a parsed input line object, produce the fancy unicode text to insert.
///////////////////////////////////////////////////////////////////////////////
function make_title(o) {
	if (o['nickname']) return o['nickname'];
	var title = o['title'];
	var fancy = title_bling(o['title']);
	if ('year' in o) {
		var year = o['year'];
		if (title == 'FUAN') {
			fancy = year_prefix(year) + fancy;
		} else if (title == 'FU') {
			// Unnamed FU (e.g. KFU); always show prefix
			fancy = year_prefix(year) + fancy;
		} else if (title.substring(0, 2) != 'FU') {
			fancy = year_prefix(year) + fancy;
		} else {
			// FU; no prefix
		}
	}
	return fancy;
}

function icon_eligible(n) {
	return true;
	while (n) {
		if (n.classList
		    && (n.classList.contains("cover")
			|| n.classList.contains("uiContextualLayer"))) return true;
		n = n.parentNode;
	}
}

///////////////////////////////////////////////////////////////////////////////
// Callback generator for add_alias.
///////////////////////////////////////////////////////////////////////////////
function insert_alias(str, prefixSVG) {
	var cb = function (n, orig_string) {
		// TODO make sure the svg is not separated by a line break from the title.
		if (svg[prefixSVG] && icon_eligible(n)) {
			var before = document.createElement('span');
			before.innerHTML = svg[prefixSVG];
			n.parentNode.insertBefore(before, n);
		}
		var replaced = document.createElement('span');
		replaced.title = orig_string;
		replaced.className = 'tk_title';
		replaced.textContent = str;
		n.parentNode.insertBefore(replaced, n);
	};
	cb.inserted_string = str;
	return cb;
}

///////////////////////////////////////////////////////////////////////////////
// Given a parsed input line object, add the appropriate alias.
///////////////////////////////////////////////////////////////////////////////
function add_parsed_alias(o, origLine) {
	if (!o) {
		// parse error
		console.log("Failed to parse input line: ["+origLine+"]");
		return;
	}
	var title = make_title(o);
	var prefixSVG = o['title'] ? (/^FU/.exec(o['title']) ? 'FU' : o['title']) : '';
	add_alias(o['name'], insert_alias(title, prefixSVG));
}

///////////////////////////////////////////////////////////////////////////////
// Recursively apply transformation to all text nodes in a DOM subtree.
///////////////////////////////////////////////////////////////////////////////
function r(n) {
	if (n.nodeType == 1) {
		// Recurse through all child nodes of this DOM element.
		for (var i = 0, l = n.childNodes.length; i < l; ++i) {
			r(n.childNodes[i]);
		}
	} else if (n.nodeType == 3) {
		// We are in a DOM text node.
		// Replace every occurrence of a real name with an alias.
		// If the node contains x substrings,
		// we split this text node into 2x+1 parts.
		var o = alias_regexp.exec(n.nodeValue);
		while (o) {
			// We currently have n.nodeValue == a+b+c,
			// and b needs to be replaced with f(b).
			// f(b) is not necessarily just a text string;
			// it could be an arbitrary sequence of DOM nodes.
			// Therefore, we split `n` into three parts:
			// A text node containing `a`, the dom nodes `f(b)`,
			// and a text node containing `c`.
			// We have to recurse on `c` (the rest of the text),
			// so in reality we just insert `a` and `f(b)`
			// before `n` and replace `n` with `c`.

			// Insert (possibly empty) text node `a` before `n`:
			var before = document.createTextNode(n.nodeValue.substring(0, o.index));
			if (o.index != 0) n.parentNode.insertBefore(before, n);

			// Insert nodes `f(b)` before n (might be a no-op if f(b) is empty):
			aliases.replacements[o[0]](n, o[0]);

			// Set the text of the `n` node to the remaining (maybe empty) text `c`:
			n.nodeValue =
				n.nodeValue.substring(o.index + o[0].length, n.nodeValue.length);

			// Find the next occurrence:
			o = alias_regexp.exec(n.nodeValue);
		}
	}
}

if (window.theTKTitleObserver) {
	window.theTKTitleObserver.disconnect();
}

window.theTKTitleObserver = new MutationObserver(function (mutations) {
	for (var i = 0, l = mutations.length; i < l; ++i) {
		var m = mutations[i];
		r(m.target);
	}
});

window.theTKTitleObserver.observe(document.body, {
	'childList': true,
	'characterData': true,
	'subtree': true
});

///////////////////////////////////////////////////////////////////////////////
// Add aliases from input alias specification.
///////////////////////////////////////////////////////////////////////////////
function add_aliases(input) {
	parse_aliases(input, add_parsed_alias);
}


var svg_style = 'style="height: 1em; width: 1.5em; margin-right: .3em"';

svg['CERM'] = (
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 564.39" '+
svg_style+' version="1.1">'+
'<g transform="matrix(1.25,0,0,-1.25,0,564.38782)">'+
'<path fill-rule="nonzero" fill="currentColor" d="m365.37,0.409c-44.027,1.406'+
'-98.398,3.675-106.13,6.23-1.832,0.606-5.574,1.492-8.312,1.973-7.485,1.316-24'+
'.094,5.969-29.625,8.422-11.629,5.16-21.563,13.664-31.684,20.629-13.543,9.316'+
'-28.371,27.328-37.383,48.199-7.336,16.996-14.004,46.058-14.019,84.551-0.004,'+
'23.98,0.176,26.515,2.746,38.507,3.988,18.618,12.394,40.571,19.59,51.176,3.19'+
'5,4.707,5.808,8.953,5.808,9.434,0,1.496-3.035,1.781-23.105,2.168-31.324,0.60'+
'5-54.617,0.008-66.879-1.715-16.758-2.359-17.102-2.496-18.465-7.219-0.637-2.2'+
'22-0.969-4.371-0.738-4.777,0.23-0.41,2.598-1.703,5.254-2.879,5.836-2.574,10.'+
'742-7.109,14.422-13.324,2.398-4.051,2.722-5.645,2.613-12.903-0.129-8.375-1.3'+
'56-12.125-7.074-21.625l-1.93-3.211,2.75-3.265c9.281-11.031,14.965-27.86,18.6'+
'76-55.305,2.793-20.652,1.929-29.586-4.176-43.351-2.883-6.493-3.773-7.661-5.6'+
'72-7.43-1.238,0.148-2.988-0.352-3.89-1.11-2.563-2.164-10.18-2.007-11.579,0.2'+
'39-1.105,1.765-1.343,1.738-4.742-0.571-1.969-1.332-4.09-2.41-4.719-2.394-2.1'+
'79,0.062-4.863,2.871-4.543,4.75,0.196,1.141-0.289,1.894-1.218,1.894-0.985,0-'+
'1.449-0.832-1.293-2.312,0.211-2.004-0.235-2.309-3.371-2.309-1.989,0-5.274,0.'+
'692-7.301,1.539-4.297,1.797-12.68,2.071-12.68,0.418,0-0.617,0.926-1.367,2.05'+
'5-1.66,2.898-0.758,2.555-2.351-0.508-2.351-3.207,0-7.535,5.668-12.547,16.429'+
'-3.23,6.926-3.644,8.844-4.129,19.055-1.195,25.016,7.871,53.785,22.168,70.371'+
'l3.446,3.996-4.356,5.199c-5.59,6.676-7.055,10.95-7.109,20.719-0.082,14.262,5'+
',22.778,17.078,28.621,3.726,1.809,4.441,2.633,4.441,5.141,0,2.461-0.429,2.98'+
'8-2.433,2.988-4.52,0-23.129-6.133-28.024-9.238-7.713-4.9-9.4-4.13-11.619,5.2'+
'5-1.742,7.35-5.168,33.61-5.168,39.58,0,13.476,7.078,48.836,10.449,52.207,20.'+
'469-8.774,41.934-15.473,63.973-19.551,5.664-0.801,12.609-1.941,15.433-2.531,'+
'2.825-0.59,30.782-1.535,62.129-2.098,31.344-0.562,61.383-1.102,66.746-1.199,'+
'15.454-0.274,44.286,0.988,49.321,2.164,8.16,1.898,29.5,3.129,63.64,3.66,131.'+
'29,3.859,87.68-1.281,211.5,8.211,21.461,1.687,23.11,1.902,35.59,4.695,4.801,'+
'1.078,11.735,2.43,15.403,3.012,14.265,2.262,17.804,3.125,31.523,7.703,21.227'+
',7.086,28.559,10.238,43.605,18.746,7.536,4.258,17.168,9.66,21.403,11.996,9.4'+
'84,5.242,17.945,11.43,26.734,19.563,3.692,3.414,9.235,8.262,12.324,10.773,5.'+
'176,4.219,24.926,26.852,29.301,31.633,2.078,2.273,4.488,3.594,5.012,3.574,1.'+
'602-0.058,3.457-5.668,5.625-14.957,0.801-3.422,2.043-12.34,3.5-19.683,1.457-'+
'7.34,3.371-17.278,4.254-22.078,7.5-40.821,8.812-131.22,2.535-174.58-2.969-20'+
'.508-8.547-41.109-12.652-46.722-1.325-1.813-1.934-1.469-10.172,5.711-4.821,4'+
'.199-12.356,10.64-16.746,14.312-4.391,3.672-11.02,9.231-14.731,12.359-9.387,'+
'7.911-24.359,19.239-27.734,20.985-1.551,0.801-6.473,3.875-10.938,6.836-13.02'+
'7,8.625-33.152,17.058-56.386,23.625-10.692,3.019-36.645,7.316-63.926,10.586-'+
'5.965,0.715-6.832-0.289-3.449-3.981,3.382-3.691,13.515-19.16,17.73-27.07,6.9'+
'38-13.016,10.793-24.652,14.199-42.828,3.223-17.199,3.27-18.071,2.106-39.145-'+
'1.328-24.004-2.762-29.855-12.824-52.25-3.555-7.906-6.786-15.426-7.18-16.707-'+
'1.03-3.412-8.52-15.471-12.76-20.557-16.08-19.289-20.16-23.207-36.64-35.187-5'+
'.96-4.332-11.23-6.934-33.8-16.676-4.88-2.109-12.38-4.262-18.48-5.301-5.65-0.'+
'965-14.66-2.848-20.03-4.18-91.76-4.793-83.91-4.214-90.18-3.593zm30.039,10.57'+
'c24.528-0.125,51.524,3.133,60.86,5.148,32.98,5.469,51.511,14.172,77.484,35.9'+
'77,23.484,18.254,42.816,57.094,50.187,85.445,3.907,13.59,2.649,38.594-0.246,'+
'53.977-2.715,33.504-20.691,49.457-38.164,76.672-30.035,0.043-48.988,5.183-77'+
'.758,3.074-1.113-4.605,32.211-18.215,43.207-28.848,32.317-33.445,35.532-74.8'+
'47,21.704-118.56-3.95-11.188-17.223-29.692-23.618-35.879-60.168-34.91-76.953'+
'-31.406-109.09-36.508-30.743,0.031-69.25,1.496-130.92,8.766-15.235,2.449-27.'+
'535,8.304-40.746,17.14-27.207,18.196-35.848,58.871-38.262,90.793,1.32,29.129'+
',17.183,74.801,43.523,91.903,22.75,14.769,37.621,21.347,59.09,22.394,127.78,'+
'6.238,78.574,2.977,207.25,0.195,74.672-1.613,93.055-2.031,135.43-11.988,50.1'+
'84-11.781,74.09-31.793,115.98-59.519-1.254,8.289-1.808,10.246-3.636,20.351-1'+
'.735,9.262-5.422,39.442-6.286,51.442-0.496,6.906-1.871,20.316-2.05,24.55-1.3'+
'68,32.422,0.5,59.657,5.957,86.774,4.55,22.629-1.883,10.59,1.449,20.351,0.32-'+
'4.054-36.922-31.961-55.004-44.894-38.703-20.668-105.6-38.813-149.43-42.195-1'+
'51.1-8.383-110.73-3.227-252.48-8.926-20.989-1.453-53.051-12.27-67.028-20.91-'+
'84.09-44.418-84-135.18-54.023-215.58,3.379-14.679,46.32-50.316,70.16-58.015,'+
'12.574-8.282,126.6-12.133,156.45-13.137zm-11.23,52.648c36.812,1.547,52.277,4'+
'.899,57.008,6.227,2.824,0.793,10.148,4.336,16.871,6.105,13.171,3.469,23.039,'+
'10.34,36.027,18.797,15.019,9.782,23.344,22.586,30.027,48.282,14.348,65.312-2'+
'4.371,101.21-76.769,121.53-27.004,5.68-42.383,6.894-71.824,6.937-42.856-0.26'+
'9-119.28,3.938-141.09-27.867-17.395-13.601-25.211-31.343-29.618-52.359-1.933'+
'-10.988-2.484-35.594-0.578-44.395,6.11-29.75,11.782-48.812,38.043-64.597,11.'+
'957-6.817,15.856-8.211,30.883-11.055,17.07-3.23,55.043-6.605,79.586-7.066,7.'+
'906-0.153,18.766-0.641,24.133-1.09,60.953,0.039-55.176-1.758,7.301,0.554zm-3'+
'63.17,209.58c3.957,2.293,15.332,1.089,17.84,1.113,0.937,13.566-6.371,30.051,'+
'0,48.863-7.164,0.863-8.27,5.313-15.754,4.473-15.696-3.133-14.535-57.34-2.086'+
'-54.449zm187.04,33.136c10.597,9.563-6.457,7.457-16.137,7.657-23.324,0.484-21'+
'.269,0.668-47.316,0.339-20.903-0.265-22.754-0.488-24.254-2.144-8.297-12.379-'+
'5.879-15.852,2.359-27.328l22.445-0.223,26.961-0.269c13.305,9.324,22,13.351,3'+
'5.942,21.968"/>'+
'</svg>'+
''
);

svg['FORM'] = (
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 902.5 801.25" '+
svg_style+' version="1.1">'+
'<g transform="matrix(1.25,0,0,-1.25,0,801.25)">'+
'<g transform="scale(0.1,0.1)">'+
'<path fill-rule="nonzero" fill="currentColor" '+
'd="M3398.4,1.1055c-1039.5,36.676-2099.1,143.87-3079.8,509.1-468.44,73.04-203'+
'.06,638.29-276.75,971.99-11.488,1583.3-64.386,3166.5-30.816,4749.8,241.79,25'+
'2.61,351.72-469.66,382.04-662.36,168.13-511.19,27.398-675.35-79.961-951.01,4'+
'3.586-767.43-77.453-2036.8,26.469-2804.7,320.88-170.07,781.13-102.7,1159.3-1'+
'46.58,573.53-0.48,1179.6-57.07,1721.6,161.22,87.27,468.11,27.68,960.18,50.43'+
',1437.9-16.76,483.22,72.5,971.7-17.15,1450.2-388.68,506.53-237.94,1266.7,203'+
'.67,1686.6,648.91,4.14,741.43-415.88,764.9-889.39,81.4-608.87-333.01-813.39-'+
'228.74-1299.4,15.12-624.22,41.43-1274.7,133.93-1892,66.82-415.12,300.07-637.'+
'53,696.74-633.25,668.69-82.62,1352.6-93.36,2018.8,16.39,131.89,419.22,30.58,'+
'884.98,76.01,1322-16.78,551.42-4.73,1098.7-37.05,1665.7-225,196.4-195.23,794'+
'.84-26.49,1190,24.83,371.45,436.2,624.59,341.64,84.1-28.8-1793.7,12.92-3588.'+
'2-43.3-5381.5-1120.1-462.22-2341.6-612.43-3546.4-582.99-69.6-0.5039-139.2-1.'+
'0664-208.8-1.8086zm1787,369.94c668.46,81.101,987.7,132.8,1613.6,380.33,43.53'+
',551.2,16.56,463.02-16.24,633.16-488.36-126.67-707.11-92.64-1170.2-172.41-48'+
'3.29-22.41-929.04-52.83-1407.8,30.63-454.96,201.84-385.78,755.5-428.65,1167.'+
'4-37.42,752.61-62.42,1529-15.99,2281.1,182.15,346.57,264.33,781.27,120.71,11'+
'77.7-95.87,264.6-222.68,464.01-468.88,182.24-287.41-415.53-298.95-834.22,29.'+
'26-1237.5,112.37-580.46-38.55-1279.2-3.31-1866.4-31.9-502.07,71.62-1016.2-17'+
'1.26-1480-226.7-392.1-816.9-281.9-1191.5-278.8-561.5,57.6-1112.4,66.8-1638.2'+
',284.8-168.26-0.6-28.73,16-120.04-664.08,945.18-421.75,1841.7-466.25,2864.1-'+
'525.22,675.37-38.961,1332.2,5.593,2004.4,87.152"/>'+
'</g></g></svg>'+
''
);

svg['KASS'] = (
'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '+
svg_style+' viewBox="0 0 847.5 850">'+
'<g transform="matrix(1.25,0,0,-1.25,0,850)">'+
'<g transform="scale(0.1,0.1)">'+
'<path fill-rule="nonzero" fill="currentColor" '+
'd="M6024.6,26.016c-501,79.314-170.8,751.91-650.2,769.8-789.2,92.68-1442.2,77'+
'6.78-1592,1533-9.1,417.53-493.56,341.57-771.93,274.17-186.44-308.2-243.94-62'+
'2.11-480-907.08-300.3-433.7-759.9-827.46-1272.9-964-376.99-27-274.19-748.96-'+
'755.74-722.08-370.82,8.5197-700.82,600.34-369.34,850.1,226.78,221.96,551.8,1'+
'21,629.96,553.35,244.26,682.49,796.57,1305,1482.8,1497.2,393.63,110.24,582.9'+
'4,478.36,448.53,711.34-961.3,82.09-1769.1,726.73-2333.1,1470.6-267.75,315.93'+
'-411.65,730.03-5.594,1004.2,252.22,266.67,523.58,533.29,853.32,698.5,800.92-'+
'504.23,1486.2-1242.1,1778.8-2156.5,82.49-294.7,173.48-879.36,592.39-564.1,11'+
'9.09,372.66,157.67,735.05,355.97,1081.9,392.69,692.1,968.93,1320.4,1712.6,16'+
'34.8,431.74-207.65,780.05-571.71,1049.8-961.37,287.88-346.7-272.75-645.7-448'+
'.82-918.72-522.51-542.36-1105.1-978.95-1807.1-1248.6-308.12-19.59-421.05-147'+
'.49-291.17-438.43,1.68-391.67,536.7-164.09,762.09-405.57,412.32-291.38,804.8'+
'2-657.94,1019-1116.9,88-291.89,27.72-780.44,459.2-697.28,523.4-149.32,363.3-'+
'1029-161.8-1005.1l-204.85,26.828zm358.64,220.51c234.67,166.73,168.02,502.87-'+
'94.64,546.54-534.84-66.3-437.23,540.57-629.37,864.7-236.66,399.39-535.1,742.'+
'21-927.5,993.21-284.25,207-671.25-42.61-782.78,407.89-96.88-252.05-321.91-31'+
'7.89-155.48-303.77,318.58-149.23,146.42-645.84,412.26-902.56,296.05-502.28,8'+
'18.02-854.46,1409.4-864.06,434.01-79.883,100.05-792.04,642.17-760.42l125.93,'+
'18.472zm-5124.2,693.35c675,370.22,1258.6,898.12,1487.6,1629.6,101.53,482.16,'+
'748.84,123.82,993.47,465.64,204.16,276.6,99.57,869.99,588.07,837.35,509.46,1'+
'41.87,810.69,471.35,1232.4,781.8,377.94,319.92,617.49,476.22,881.27,898.24-4'+
'52.17,300.6-607.57,353.22-884.1,824.01-807.9-403.41-1247.2-901.07-1551.8-175'+
'7.9-147.15-304.07-147.79-965.13-655.53-896.73-612.35,5.62-248.69-450.9-683.3'+
'-864.13-767.1-329.9-1133.2-533.5-1506.3-1085.4-218.99-323.9-215.32-906.67-71'+
'6.06-950.54-431.02-242.99-196.73-579.24,96.28-562.32l92.863,69.254c342.87,23'+
'0.76,39.196,622.91,624.98,611.18zm1607.6,3232.1c-150.37,726.81-388.69,1108.7'+
'-914.13,1634.8-266.71,228.14-370.68,481.64-690.94,615.91-286.28-425.9-415.88'+
'-572.8-867.53-827.3,277.92-699.9,668.23-1020.3,1300.8-1405.1,358.18-217.9,57'+
'0.78-289.01,986.1-322.55,180.91,113.04,214.66,186.13,185.55,304.28"/>'+
'</g></g></svg>'+
''
);

svg['NF'] = (
'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '+
svg_style+' viewBox="0 0 1077.5 795">'+
'<g transform="matrix(1.25,0,0,-1.25,0,795)">'+
'<g transform="scale(0.1,0.1)">'+
'<path fill-rule="nonzero" fill="currentColor" '+
'd="M1227,7.8711c-226.3,50.598-65,420.77-107.2,614.42,209.68,859.19,540.37,17'+
'26.9,842.39,2562.5-327.71-124.68-858.63,33.29-577.47,521.92,187.44,339.36,18'+
'0.27,487.18-228.08,400.02-282.93-74.99-190.71,118-291.01,248.79-123.1-405.5-'+
'192.81-595.6-229.75-1019.7,434.56-47.7-56.5-624.2-20.54-896.6-146.78-247.3-8'+
'24.99-26.3-556.14,315.4,151.78,617.1,335.18,1230.8,492.75,1846.3,5.399,237.6'+
'2,185.66,426.98,323.24,487,5.488,163.46,194.7,508.3,571.56,374.22,410.1-4.71'+
',820.81-16.38,1230.6,0.27,152.03,280.93,153.92,718.93,423.19,890.91,1178-25.'+
'19,2356.7-12.38,3534.9-37.46,245.91-16.95,764.61,105.79,450.56-278.22-82.49-'+
'243.21-345.11-725.03,129.67-599.33,420.7-6.94,841.5-2.37,1262,12.71,187.59-4'+
'17.65,177.52-930.62-35.95-1337.5-276.48,45.9-93.51-339.62-155.3-497.57-27.33'+
'-812.63-16.83-1625.9-22.22-2438.8-428.9-373.83-784.2-833.67-1258-1152.2-1034'+
'.9-58.101-2072.3,15.747-3108.5-8.585-890.3,5.542-1780.9,4.894-2670.8-8.4849z'+
'm5418.5,242.29c345.09-84.965,235.36,80.57,267.98,288.6-48.47,55.156-180.53,0'+
'.89-276.08,34.277-1817.5-4.215-3444.6-20.309-5262.1-29.492-76.1-108.67,17.96'+
'-176.02-10.1-320.28,284.44-92.938,509.23,81.859,778.48,5.988,1522,12.285,292'+
'9.5-8.18,4501.8,20.906zm1387.9,1097.6c25.96,964.16-4.47,752.53,25.6,1716.9,4'+
'.94,178.22-98.96,85.62-246.24,52.76-234.7-624.3-355.6-1268.7-578.1-1897.2-11'+
'7.7-371.58-125.7-378.57-103.5-767.01,222.8,203.67,670.69,667.03,902.17,894.5'+
'3zm-5824.9,1785.8c-298.42-795.57-538.72-1445.7-795.52-2256.7,35.47-247,418.7'+
'8-31.844,645.32-100.64,1590.2-1.477,3073-15.723,4662.9-3.008,268.31-72.949,1'+
'65.64,147.73,220.32,342.35,142.27,508.95,326.75,979.08,465.75,1488.9-15.75,1'+
'78.73,231.25,572.71-79.4,557.43-1563.4,28.95-2806.6,43.61-4370.2,25.2m2588.4'+
'-2180.1c-1047.6,42.45-2010.6-29.218-3056.9,16.51-112.49,290.71-3.6,910.63,34'+
'5.79,770.38,971.14-19.93,2050.1,2.16,3021.2,1.58,364.67-20.58-90.73-672.5-31'+
'0.15-788.47zm-76.12,202.4c248.86,191.49,406.77,463.61,83.11,361.48-905.15-16'+
'.98-1748.3-2.73-2653.3-6.81-251.68,111.93-297.7-152.49-148.41-322.31l2718.6-'+
'32.36zm-2108,926.44c-159.59-28.01-775.82-157.09-1053.2,11.03-277.32,168.12,4'+
'8.49,584.52,148.5,727.57,298.1,154.47,914.09,79.83,956.47-96.6,38.27-159.37,'+
'62.37-553.85-51.82-642zm-198.45,215.06c190.91,199.4-12.23,432.06-354.59,439.'+
'75-249.91-22.18-430.37-346.74-88.37-447.12,57.13,1.7,390.82-22.9,442.96,7.37'+
'zm707.6-206.2c-41.97,195.88-23.12,604.17,158.13,784.17,230.18,101.72,984.85,'+
'190.45,1181.5-115.8-9.74-227.75,75.54-568.36-89.66-640.5-165.19-72.14-1040.8'+
'-71.53-1250-27.87zm689.64,683.74c-348.84-22.55-403.35-117.5-401.57-387.32,18'+
'7.72-191.53,294.71-117.55,445.03-95.82,425.13-21.15,354.6-100.57,340.36,229.'+
'27-12.44,287.88-26.06,226-383.82,253.87zm1147.6-732.4c-223.39-61.21-168.13,4'+
'80.42,78.19,725.21,246.32,244.78,579.24,80.67,735.26,98.88,423.1,49.39,387.5'+
'4-682.25,177.83-824.38-90.48-8.6-900.74-4.83-991.28,0.29zm817.35,234.52c144.'+
'84,217.1,291.61,432.53-432.03,363.82-272.74,13.94-266.89-430.6-98.16-369.75,'+
'58.89,7.37,482.79-40.04,530.19,5.93zm-3814.7,1088.1c1451,16.89,2833.7,27.9,4'+
'284.4-9.83,294.83,65.02,646.92-116.86,832.97,138.84-100.8,316.07-61.84,233.3'+
'3-791.51,236.11-1788.6,54.54-3578,0.28-5366.8,30.14-5.24-102.99-190.56-243.3'+
'7,223.53-384.89,285.53-4.16,531.95-17.09,817.38-10.37zm3903,623.1c-171.76,81'+
'1.48-62.88,1308.1,277.77,2058.2-1329.9,22.02-2243.6,34.99-3573.9,18.45-272.5'+
'-19.8-226.02-336.55-356.7-526.34-166.23-525.91-175.52-913.21-77.04-1455.1,40'+
'3.1-149.28,646.17-25.53,974.77-98.01,1032.7,6.52,1723.1,22.89,2755.1,2.75zm-'+
'4073.7,326.39c-35.66,403.92,9.24,429.42,73.59,828.8-326.16,91.72-736.16-9.9-'+
'1106.3,19.93-320.86-2.4-395.87,78.43-394.61-286.03-4.45-273.91-142.48-635.81'+
',250.99-601.33,460.13,14.94,717.7,11.33,1176.3,38.63zm5559.4-27.02c-146,397.'+
'52-136.88,480.68,23.01,871.27-500.19-26.22-749.6-3.13-1247.8-24.48-100.71-39'+
'0.06-90.79-434.37-31.95-833.88,514.54-14.03,742.09-24.71,1256.7-12.91"/>'+
'</g></g></svg>'+
''
);

svg['PR'] = (
'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '+
svg_style+' viewBox="0 0 868.75 918.75">'+
'<g transform="matrix(1.25,0,0,-1.25,0,918.75)">'+
'<g transform="scale(0.1,0.1)">'+
'<path fill-rule="nonzero" fill="currentColor" '+
'd="M6536.8,17.578c-100.9,405.49-39.5,834.99-64.9,1250.2-29.41,1509.1-8.12,30'+
'19-80.28,4527.2,16.97,381.26-111.38,743.14-135.94,1119.4,13.97,325.92,428.43'+
',101.87,577.9,185.76,227.19-80.12,36.76-501.48,68.65-727.58-109.61-451.47-21'+
'.84-928.1-61.15-1389.8-19.78-597.04,29.34-1200.2,1.01-1797.4-28.35-597.67,15'+
'.58-1189.9-17.91-1787.7-3.09-446.58-6.9-878.52-22.5-1324.6-5.93-39.246-241.3'+
'6-91.801-264.92-55.594zm-6353.8,75.137c-54.43,649.02-34.01,1309.2-48.03,1962'+
'.7-4.42,1017.7-13.78,2035-20.24,3052.8,36.12,619.5-31.168,1216.9-116.06,1828'+
'-28.261,214.3,41.43,401.4,138.34,366.9-88.272-156.9,316.22-82.3,330.31,45.2,'+
'101.26-232.8,253.82,48.5,354.43-174.6,96.6-364.4-57.8-607.8-179.5-972.8-151.'+
'97-269.6-28.86-682.4-78.36-988-38.06-1030.4-26.59-2048.2-33.09-3079.3-40.64-'+
'648.6-40.09-1312.6-59.72-1961.9,19.51-75.512-241.46-144.66-288.08-78.985zm27'+
'79.2,291.94c-590.53,59.66-1257.3,202.57-1615.4,721.61-339.42,545.14-522.98,1'+
'187.1-475.1,1830.9,19.43,834.9,353.16,1619.3,679.78,2374.4,346.19,580.54,819'+
'.28,1176.1,1506.1,1346.2,425.99,86.24,905.46,152.63,1305.8-55.46,321.51-284.'+
'17,346.69-610.04,685.96-887.17,226.09-221.19,602.83-456.51,687.56-803.67,185'+
'.1-578.9,214.5-1201.1,174.1-1804.4-33.3-847.6-423.1-1678.9-1063.4-2237.8-413'+
'.7-359.76-962.3-518.39-1505-501.29-126.96-0.906-254.08,3.64-380.41,16.738zm7'+
'34.16,299.36c724.38-0.465,998.5,277.06,1398.2,875.47,377.14,508.93,465.88,10'+
'26.8,497.33,1653.6,29.81,605.42,65.94,1059.9-149.91,1632.5-158.71,315.53-443'+
'.51,415.31-634.35,710.58-243.43,282.62-351.63,544.85-624.1,803-420.86,206.97'+
'-713.38,20.01-1154.5-72.18-644.13-198.3-900.14-594.25-1221.5-1158.1-372.56-8'+
'42.04-695.41-1597.6-646.69-2533.6,21.36-569.72,189.8-968.13,523.17-1426.6,45'+
'2.35-480.79,937.88-525.82,1561.4-563.84,68.37-3.515,382.73,78.031,451,79.235'+
'zm231.5,3440.6c-421.35,51.87-584.37,925.26-270.22,1173.4,219.36,219.68,954.0'+
'1,254.2,1059.6-104.7,197.32-345.46,65.91-1135-369.44-1105.1-62.24-1.97-358.5'+
'8,23.06-419.92,36.36zm296.83,229.78c429.7,41.03,441.82,456.14,212.97,731.53-'+
'335.38,320.73-592.12-41.85-724.16-411.25,35.57-278.05,268.71-369.45,511.19-3'+
'20.28"/>'+
'</g></g></svg>'+
''
);

svg['SEKR'] = (
'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '+
svg_style+' viewBox="0 0 622.5 625">'+
'<g transform="matrix(1.25,0,0,-1.25,0,625)">'+
'<g transform="scale(0.1,0.1)">'+
'<path fill-rule="nonzero" fill="currentColor" '+
'd="m138.75,4949.3c20.066,13.6,234.94-5'+
'.52,352.92-4.84,73.988,0.42,215.25,11.29,270.9,15.55,55.645,4.25,152.57-1.91'+
',206.78-5.09,104.13-6.09,746.83-1.55,960.92,6.75,940.98,52.11,1916.2,29.75,2'+
'856.8-22.68,39.73-27.7,85.98-102.02,91.79-160.58,7.08-71.39,32.53-505.34,44.'+
'35-647.95,127.6-1540.5-38.6-3188.2-50.5-3916.2-568.2-178.78-1224.3-242.69-33'+
'40-192.45-667.7,15.855-924.47,11.984-1425.2,29.922-138.57,472.37-161.1,4443.'+
'6,31.28,4897.6zm4545.8-4289.6c-32.86,631.42,179.48,3469.7-52.95,4137.1-38.09'+
',8.84-114.02,13.91-248.04,16.56-241.16,4.77-890.48,4.55-898.33-0.3-6.52-4.03'+
'-290.27-14.38-403.61-14.72-40.35-0.12-179.77,3.01-309.8,6.96-319.63,9.69-600'+
'.87,9.91-758.21,0.61-71.75-4.25-190.98,1.98-264.97,1.06-73.98-0.93-217.07-3.'+
'03-317.96-4.68s-302.67-1.83-448.4-0.4c-173.66,1.7-274.72-0.44-293.26-6.19-18'+
'.207-5.66-69.16-6.93-142.9-3.58-81.92-320.3-102.08-3141.4-97.91-4166.7,603.2'+
'7-137.73,572.67-97.98,888.77-117.32,2802.6-18.64,2159.5-43.22,3347.6,151.58z'+
'm-1203.4,2249.8c-174.91,7.24-694.74,10.95-1333,9.5-544.19-1.23-658.42,2.25-6'+
'78.75,20.65-35.39,32.02-41.17,56.87-35.2,151.25,3.09,48.78,5.46,195.71,5.28,'+
'326.51-0.19,130.8,3.37,259.83,7.9,286.73,4.54,26.9,9.06,107.42,10.05,178.91l'+
'1.81,129.99,28.53,16.76c26.4,15.51,39.83,16.61,179.37,14.76,82.95-1.1,187.87'+
'-5.76,233.16-10.34,87.9-8.91,789.81-3.93,1103.4,7.82,261.99,9.82,861.93,10.6'+
'7,879.54,1.25,30.4-16.27,36.97-63.55,30.95-222.75-3.11-81.95-7.34-271.91-9.4'+
'1-422.13-2.07-150.21-5.97-311.09-8.66-357.49-4.48-77.22-6.82-86.53-27.49-109'+
'.67l-22.59-25.27-100.9-1.62c-55.5-0.89-174.28,1.43-263.96,5.14zm162.51,219.7'+
'4c124.03,240.98,53.34,452.97-0.99,674.24-615.56,85.01-1074.9,13.65-1717,37.7'+
'5-241.36,14.3-249.64-34.89-234.16-100.97-10.3-248.22-73.46-335.45-33.37-582.'+
'04,20.74-33.08,15.88-33.57,234.06-40.55,164.53-5.26,516.71,20.46,753.34,26.1'+
'3,215.45,25.7,704.43-62.53,998.17-14.56"/>'+
'</g></g></svg>'+
''
);

svg['VC'] = (
'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" '+
svg_style+' viewBox="0 0 567.5 867.5">'+
'<g transform="matrix(1.25,0,0,-1.25,0,867.5)">'+
'<g transform="scale(0.1,0.1)">'+
'<path fill-rule="nonzero" fill="currentColor" '+
'd="M1996.8,6.1055c-646.7,38.456-1268.2,413.46-1566.1,995.19-293.91,477.6-421'+
'.35,1037.1-423.21,1594.1-11.676,888.5-15.559,1780.6,70.372,2665.6,22.222,171'+
'.38,83.093,438.66,306.84,376.61,256.68,12.88,526.31-19.77,775.31,23.71-152.1'+
'2,4.19-208.18,299.23,2.29,311.79-105.2,29.39-353.68-29.23-490.63,11.41-312.1'+
'1-77.05-670.16,64.06-589.35,448.71-69.574,339.76,188.92,555.98,512.11,476.61'+
',1080,6.72,2159.9,3.29,3239.8,26.73,220.97-18.37,666.4,93.6,639.27-258.7-9.1'+
'5-234.04,74.31-681.23-271.16-679.68-228.35-39.17-583.68-1.18-743.45-46.22,29'+
'9.66-47.62-150.5-350.91,155.49-271.89,266.18-23.83,592.7,84.48,813.61-94.26,'+
'154.59-297.82,89.19-646.59,99.1-968.92-35.1-821.7-11.3-1646.9-87.1-2466.4-38'+
'.9-372.3-119.2-746.7-330.6-1062.7-211-398.52-553.6-724.52-946.5-939.23-361.5'+
'-192.54-772.8-144.76-1166-142.36zm828.6,200.55c373.33,77.758,528.81,236.97,7'+
'93.51,507.57,261.28,248.21,364.31,564.2,507.03,887.86,225.09,763.54,160.57,1'+
'493.1,200.71,2278.2-6.07,500.69,17.5,817.74-50.31,1315.9-49.49,368.14-308.63'+
',227.69-565.91,251.85-1000-5.07-1972.6-29.27-2972.9-13.45-279.96,31.4-511.81'+
',44.8-485.98-328.9-80.37-885.5-60.2-1641-53.29-2529.3,10.76-552.3,118.49-105'+
'8.8,432.28-1522.4,319.49-600.22,890.79-914.38,1570.2-884.52,193.65,4.055,432'+
'.63,8.875,624.62,37.172zm-807.26,598.67c-519.45,50.746-894.25,521.33-1046.9,'+
'989.32-168.43,520.34-127.38,1077.6-158.66,1617.2,3.824,406.9-41.469,826.55,7'+
'8.996,1221.1,198.53,255.57,583.43,77.92,863.59,128.1,585-7.8,1170.8,17.29,17'+
'55.3-3.14,338.26-43.98,197.52-457.16,223.07-692.34-4.51-623.27-31.17-1247-12'+
'6.75-1863.1-55.7-484.5-293.3-949.4-665.8-1266.1-281.9-150.48-612.1-152.49-92'+
'2.9-131.1zm548.71,207.12c309.86,12.14,359.24,170.08,530.9,406.24,244.8,346.8'+
'3,295.62,679.99,323.18,1097.2,104.01,680.23,119.08,1180.6,107.51,1866.8-128.'+
'8,248.03-339.18,150.94-569.57,181.87-620.85-18.74-1062-24.51-1682.9-29.76-32'+
'6.56-94.16-222.79-414.19-253.43-682.85-5.06-545.6,19.08-1013.4,69.75-1556.4,'+
'47.72-415.5,69.86-724.52,385.3-1012.3,225.44-201.48,385.68-310.75,688.64-291'+
'.42,90.85,1.242,310.18,11.062,400.61,20.692zm11.49,4646c116.42,15.21,413.17-'+
'11.02,152.94,101.82-98.48,175.55,298.77,241.78-3.71,231.95-346.39,7.73-688.3'+
'2,5.76-1034.8,6.07,14.07-124.47,258.11-45.55,158.87-247.36-48.26-68.19-264.5'+
'3-78.55-40.78-103.63,255.75-1.54,512-2.02,767.45,11.15zm1577.4,497.43c250.03'+
',120.55,159.99,294.01,119.6,539.05-295.95,87.84-503.97,32.32-810.21,51.32-93'+
'0.27-17.26-1765.3-10.46-2695.6-21.8-255.04,17.26-538.51,113.52-473.24-244.11'+
'-47.598-266.78-10.66-380.38,291.92-337.68,1031.4-0.12,1959.5,12.33,2990.1-34'+
'.96,217.78,0.41,360.19,31.17,577.43,48.18"/>'+
'</g></g></svg>'+
''
);

svg['FU'] = (
'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 926.5 947.86" '+
svg_style+' version="1.1">'+
'<path fill-rule="nonzero" fill="currentColor" d="m12.544,943.59c-28.569-20.8'+
'79-0.36625-81.118,6.5825-120.14,16.46-43.765,30.4-95.386,50.034-137.88,52.60'+
'8-152.28,103.35-296.85,159.25-447.84,34.019-75.069,61.069-150.22,93.759-226.'+
'02,19.776-34.688,60.568,18.96,89.835,15.796,64.97,37.582,110.4,108.04,187.78'+
',123.34,45.396,11.015,95.191,18.809,127.59,56.211,59.638,48.288,119.7,104.65'+
',199.12,115.91-1.4625,41.5-40.175,80.938-49.062,124.45-27.362,90.388-57.538,'+
'180.79-104.06,263.38-33.696,12.334-79.375-15.005-114.22-27.095-60.659-29.678'+
'-96.089-98.54-165.49-113.12-63.789-14.624-131.14-31.45-178.14-80.546-25.649-'+
'20.528-64.761-77.285-95.034-57.812-47.212,109.8-75.925,226.2-119.73,337.24-2'+
'0.736,54.332-29.086,86.031-51.352,139.72-3.33,10.302-12.826,51.962-36.86,34.'+
'409zm746.05-268.75c49.106-84.644,59.15-149.26,88.15-242.11,5.5312-35.318,48.'+
'866-67.744,32.324-91.968-88.022-18.691-130.29-77.559-198.88-130.01-57.91-32.'+
'759-138.06-26.919-188.72-74.575-44.101-31.66-70.61-72.28-127.38-81.158-43.68'+
'1,108.09-66.094,185.5-111.83,292.89-8.285,32.572-28.584,44.389,26.085,52.802'+
',48.842,37.974,76.425,97.354,139.55,113.36,57.7,18.515,134.32,28.441,178.68,'+
'75.052,35.308,35.522,61.25,63.609,111.02,76.495,20.244,3.4812,32.574,19.859,'+
'50.991,9.2338zm-122.92-115.42c-41.26-10.932-28.266-59.165-35.561-91.318-5.66'+
'88-46.03-27.71,76.719-66.386,29.721-31.602-9.3262,14.12-66.738,17.114-93.164'+
',22.505-32.759,38.452-100.43,71.978-115.05,53.038,10.722,13.506,61.899,16.73'+
'9,80.185,33.51-2.4512,50.4-57.172,79.101-21.415,46.22,16.245-26.094,57.47-44'+
'.918,68.886-47.856,16.44-3.0362,76.772-15.585,116.49-2.34,9.4488-0.445,50.78'+
'1-22.481,25.664zm2.2025-30.214c2.75-40.35-10.79-81.97-4.53-116.78,21.538-15.'+
'294,75.702-30.269,70.635-47.861-14.956-17.861-65.361,37.221-98.355,38.305,11'+
'.944-26.401,46.216-90.561,14.126-82.221-30.464,57.984-53.042,96.914-78.281,1'+
'57.09,30.19,26.314,30.894-57.056,57.71-47.886,37.871,32.759-6.07,94.316,42.3'+
'78,112.52l-3.6812-13.164zm-213.78-74.292c-27.578-10.596-47.354-33.086-25.449'+
'-59.678,8.53-39.405,52.505-77.325,39.961-112.55-28.262-19.165-63.98-63.891-2'+
'9.434-93.022,34.291,16.998,69.585,58.34,111.84,63.638,30.996,3.935,95.63,33.'+
'091,44.8,74.244-38.008-9.58-68.681-29.18-82.578,24.296-19.351,29.839-38.15,8'+
'3.306-59.146,103.08zm4.9362-37.392c21.831-43.799,47.266-114.58,65.855-125.62'+
',19.405-11.529,87.51,43.676,67.476-4.1362-43.814-16.132-88.199-12.934-122.12'+
'-50.229-18.448-28.629-32.07-33.135-25.38-0.1125,17.529,27.392,68.018,39.429,'+
'39.135,77.51-10.176,36.304-47.241,86.45-45.082,115.08,7.7688-0.25375,18.095,'+
'5.9862,20.116-12.485z"/>'+
'</svg>'+
''
);

add_aliases(
'2002 FORM Nikolaj Thomas Zinner\n'+
'2002 KASS Rasmus Villemoes\n'+
'2003 CERM Sune S. Thomsen\n'+
'2004 VC   Christina Koch Perry\n'+
'2005 CERM Ole Søe Sørensen\n'+
'2005 FORM Dan Beltoft\n'+
'2005 KASS Tanja Kragbæk\n'+
'2005 VC   Rasmus Ragnvald Olofsson\n'+
'2006 CERM Tine Vraast-Thomsen\n'+
'2006 FORM Michael Volf Henneberg\n'+
'2006 KASS Lars Thorhauge\n'+
'2006 NF   Aslak Thorndahl Lindballe\n'+
'2006 PR   Mia Dyhr Christensen\n'+
'2006 SEKR Lasse Vilhelmsen\n'+
'2006 VC   Martin Studsgaard Christensen\n'+
'2007 CERM Johan Sigfred Abildskov\n'+
'2007 FORM Jan Munksgård Baggesen\n'+
'2007 KASS Mads Baggesen\n'+
'2007 NF   Eva Lykkegaard Poulsen\n'+
'2007 PR   Sidse Damgaard\n'+
'2007 SEKR Ninni Schaldemose\n'+
'2007 VC   Kasper Søgaard Deleuran\n'+
'2008 CERM Sofie Kastbjerg\n'+
'2008 FORM Tue Christensen\n'+
'2008 KASS Adam Ehlers Nyholm Thomsen\n'+
'2008 PR   Cecilie Vahlstrup\n'+
'2009 CERM Christian Bladt Brandt\n'+
'2009 FORM Jonas Bæklund\n'+
'2009 KASS Rikke Aagaard\n'+
'2009 NF   Ditte Både Sandkamm\n'+
'2009 PR   Nikolaj Andresen\n'+
'2009 SEKR Anne Clemmensen\n'+
'2009 VC   Troels Tinggaard Hahn\n'+
'2010 FORM Mie Elholm Birkbak\n'+
'2010 KASS Torben Muldvang Andersen\n'+
'2010 NF   Morten Jensen\n'+
'2010 PR   Kristoffer L. Winge\n'+
'2010 SEKR Maria Kragelund\n'+
'2010 VC   Morten Rasmussen\n'+
'2011 CERM Sabrina Tang Christensen\n'+
'2011 FORM Jakob Schultz-Nielsen\n'+
'2011 KASS Britt Fredsgaard\n'+
'2011 NF   Kasper Monrad\n'+
'2011 PR   Marie Kirkegaard\n'+
'2011 SEKR Niels Ramskov Bøje\n'+
'2011 VC   Maiken Haahr Hansen\n'+
'2012 CERM Mads Fabricius\n'+
'2012 FORM Steffen Videbæk Petersen\n'+
'2012 KASS Eva Gjaldbæk Frandsen\n'+
'2012 NF   Johannes Christensen\n'+
'2012 PR   Nana Halle\n'+
'2012 SEKR Jakob Rørsted Mosumgaard\n'+
'2012 VC   Peter Slemming-Adamsen\n'+
'2005 FUJA Jane Drejer\n'+
'2006 FUZA Sarah Zakarias\n'+
'2007 FUAN Kenneth Sejdenfaden Bøgh\n'+
'2007 FUHO Daniel Dalhoff Hviid\n'+
'2007 FUME Mette Aagaard\n'+
'2008 FUAN Andreas Sand Gregersen\n'+
'2008 FUNÉ René Søndergaard\n'+
'2008 FURU Jesper Unna\n'+
'2009 FUBS Sandra Pedersen\n'+
'2009 FUHN Mette Hansen\n'+
'2009 FUXA Christian Fretté\n'+
'2009 FUØL Carina Kjeldahl Møller\n'+
'2009 FUØR Signe Grønborg\n'+
'2010 FUAN Andreas Nikolai Kyed Bovin\n'+
'2010 FUNI Asbjørn Stensgaard\n'+
'2010 FUPH Pernille Hornemann Jensen\n'+
'2010 FUUL Camilla Pedersen\n'+
'2010 FURØ Lærke Rønlev Reinholdt\n'+
'2011 FUFR Anders Friis Jensen\n'+
'2011 FUHR Christina Moeslund\n'+
'2011 FUIØ Mathilde Biørn Madsen\n'+
'2011 FULA Camilla Skree Sørensen\n'+
'2011 FUNU Andreas Bendix Nuppenau\n'+
'2011 FURI Frederik Jerløv\n'+
'2011 FURT Martin Sand\n'+
'2012 FUAN Henrik Lund Mortensen\n'+
'2012 FUCO Jacob Schnedler\n'+
'2012 FUHI Mathias Dannesbo\n'+
'2012 FULI Line Bjerg Sørensen\n'+
'2012 FULO Lone Koed\n'+
'2012 FULS Sara Poulsen\n'+
'2012 FUMO Marianne Ostenfeldt Mortensen\n'+
'2012 FUMY Rasmus Thygesen\n'+
'2012 FUNA Karina Sunds Nielsen\n'+
'2012 FUZU Christian Bonar Zeuthen\n'+
'"ADAM"       Adam Etches\n'+
'"Nissen"     Anders Hauge Nissen\n'+
'"Metal Bo"   Bo Mortensen\n'+
'"CBM"        Christian Brandt Møller\n'+
'"J-DAG"      Jacob Damgaard Jensen\n'+
'"Jen_s"      Jens Kusk Block\n'+
'"EFUIT"      Lauge Mølgaard Hoyer\n'+
'"Have"       Martin Anker Have\n'+
'"Mavraganis" Mathias Jaquet Mavraganis\n'+
'"Rav"        Mathias Rav\n'+
'"Metten"     Mette Lysgaard Schulz\n'+
'"Vester"     Mikkel Bak Vester\n'+
'"M3"         Morten Schaumburg\n'+
'"Cramer"     Morten \'Cramer\' Nikolaj Pløger\n'+
'"#"          Rikke Hein\n'+
'"Sean"       Sean Geggie\n'+
'"Køleren"    Karsten Handrup\n'+
'"P∀"         Palle Jørgensen\n'+
'"Thyregod"   Klaus Eriksen\n'+
'"Graa mand"  Per Graa\n'+
'"Łabich"     Anders Labich\n'+
'"Onklen"     Henrik Bindesbøll Nørregaard\n'+
'"Clausen"    Jakob Clausen\n'+
'"Dobbelt Wester" Michael Westergaard\n'+
'"Brøl"       Morten Grud Rasmussen\n'+
'"Stive-Anna" Anna Sejersen Riis\n'+
''
);

if (new Date().getTime() < 1378936800000) {
	add_aliases(
	'"♥ Steffen Videbæk Fredslund" Steffen Videbæk Fredsgaard\n'+
	'"♥ Britt Videbæk Fredslund" Britt Videbæk Fredsgaard\n'+
	'');
}

compute_alias_regexp();
r(document.body);
