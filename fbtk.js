// Author: Mathias Rav
// Date: May 22, 2013
// rød grød med fløde æ ø å

function year_prefix(year) {
	year = 2012 - year;
	var prefixes = ['', 'G', 'B', 'O', 'TO'];
	if (0 <= year && year < prefixes.length) {
		return prefixes[year];
	}
	var exponent = (year - 3)+'';
	var exponentString = '';
	var s = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹']
	for (var i = 0; i < exponent.length; ++i)
		exponentString += s[exponent.charCodeAt(i) - 48];
	return 'T'+exponentString+'O';
}

function title_prefix(title) {
	if (title == 'FORM') return "\u265B "; // chess black queen
	return "";
}

function title_bling(title) {
	if (title == "KASS") return "KA$$";
	if (title == 'CERM') return "\u2102ERM"; // complex C
	if (title == 'VC') return "V\u2102";

	return title;
}

var TK = (
'<span '+
'style="vertical-align: -0.4pt">T</span><span '+
'style="font-weight: bold">&Aring;</span>G<span '+
'style="display: inline-block; transform: rotate(8deg); -webkit-transform: rotate(8deg)">E</span><span '+
'style="vertical-align: -0.6pt">K</span><span '+
'style="vertical-align: 0.2pt; font-weight: bold">A</span><span '+
'style="vertical-align: -0.6pt">M</span><span '+
'style="display: inline-block; transform: rotate(-8deg); -webkit-transform: rotate(-8deg); font-weight: bold">M</span>ER');
var TKET = TK + '<span style="vertical-align: 0.6pt">ET</span>';

function insert_TK_html(h) {
	return function (n, orig_string) {
		var replaced = document.createElement('span');
		replaced.style.fontFamily = 'monospace';
		replaced.style.display = 'inline-block';
		replaced.style.whiteSpace = 'nowrap';
		replaced.innerHTML = h;
		n.parentNode.insertBefore(replaced, n);
	};
}

var aliases = {'replacements': {}, 'targets': []};
function add_alias(source, destination) {
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
			'title': hangaround[1]};
	}
	return null;
}

function parse_aliases(input, cb) {
	var lineMatch;
	var re = /^.+$/mg;
	while (lineMatch = re.exec(input)) {
		var line = lineMatch[0];
		var parsed = parse_alias(line);
		cb(parsed, line);
	}
}

function make_title(o) {
	var title = o.title;
	var fancy = title_bling(o.title);
	if ('year' in o) {
		var year = o.year;
		if (title == 'FUAN') {
			fancy = year_prefix(year) + fancy;
		} else if (title.substring(0, 2) != 'FU') {
			fancy = year_prefix(year) + fancy;
		} else {
			// FU; no prefix
		}
	}
	return title_prefix(title) + fancy;
}

function insert_alias(str) {
	return function (n, orig_string) {
		var replaced = document.createElement('span');
		replaced.title = orig_string;
		replaced.className = 'tk_title';
		replaced.textContent = str;
		n.parentNode.insertBefore(replaced, n);
	};
}

function add_parsed_alias(o, origLine) {
	if (!o) {
		// parse error
		console.log("Failed to parse input line: ["+origLine+"]");
		return;
	}
	var title = make_title(o);
	add_alias(o.name, insert_alias(title));
}

// Recursively apply transformation to all text nodes in a DOM subtree.
function r(n) {
	if (n.nodeType == 1) {
		for (var i = 0, l = n.childNodes.length; i < l; ++i) {
			r(n.childNodes[i]);
		}
	} else if (n.nodeType == 3) {
		var o = alias_regexp.exec(n.nodeValue);
		while (o) {
			if (o.index > 0) {
				var before = document.createTextNode(n.nodeValue.substring(0, o.index));
				n.parentNode.insertBefore(before, n);
			}
			aliases.replacements[o[0]](n, o[0]);
			n.nodeValue = n.nodeValue.substring(o.index + o[0].length, n.nodeValue.length);

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
		/*
		if (m.type == 'characterData') {
			r(m.target);
		} else if (m.addedNodes != null) {
			for (var ii = 0, ll = m.addedNodes.length; ii < ll; ++ii) {
				r(m.addedNodes[ii]);
			}
		}
		*/
	}
});

window.theTKTitleObserver.observe(document.body, {
	'childList': true,
	'characterData': true,
	'subtree': true
});

function add_aliases(input) {
	parse_aliases(input, add_parsed_alias);
	compute_alias_regexp();
	r(document.body);
}

add_aliases(
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
''
);
