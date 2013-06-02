// Author: Mathias Rav
// Date: May 22, 2013
// rød grød med fløde æ ø å

function insert_alias(str) {
	return function (n, orig_string) {
		var replaced = document.createElement('span');
		replaced.title = orig_string;
		replaced.className = 'tk_title';
		replaced.textContent = str;
		n.parentNode.insertBefore(replaced, n);
	};
}

function ReplacementList(arg, fn, target) {
	var f = function (arg, fn, target) {
		var replacer = fn(arg);
		if ('string' === typeof(replacer)) {
			replacer = insert_alias(replacer);
		}
		f.replacements[target] = replacer;
		f.targets.push(target);
		return f;
	};
	f.replacements = {};
	f.targets = [];
	return f(arg, fn, target);
}

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

function t(title, year) {
	return title_prefix(title) + year_prefix(year) + title_bling(title);
}

function mk_t(title) {
	return function (year) {
		return t(title, year);
	}
}

var FORM = mk_t('FORM'),
    NF = mk_t('NF'),
    KASS = mk_t('KASS'),
    CERM = mk_t('CERM'),
    VC = mk_t('VC'),
    SEKR = mk_t('SEKR'),
    PR = mk_t('PR');

function FU(title) {
	return function (year) {
		return ((title == 'AN')
			? (year_prefix(year) + 'FU' + title)
			: ('FU' + title));
	}
}

function h(s) {
	return s;
}

var TK_base = (
'<span style="font-family: monospace; display: inline-block; white-space: nowrap"><span '+
'style="vertical-align: -0.4pt">T</span><span '+
'style="font-weight: bold">&Aring;</span>G<span '+
'style="display: inline-block; transform: rotate(8deg)">E</span><span '+
'style="vertical-align: -0.6pt">K</span><span '+
'style="vertical-align: 0.2pt; font-weight: bold">A</span><span '+
'style="vertical-align: -0.6pt">M</span><span '+
'style="display: inline-block; transform: rotate(-8deg); font-weight: bold">M</span>ER');
var TK = TK_base + '</span>';
var TKET = TK_base + '<span style="vertical-align: 0.6pt">ET</span></span>';

function insert_html(h) {
	return function (n, orig_string) {
		var replaced = document.createElement('span');
		replaced.innerHTML = h;
		n.parentNode.insertBefore(replaced, n);
	};
}

var aliases = (ReplacementList
(2003, CERM, 'Sune S. Thomsen')
(2004, VC,   'Christina Koch Perry')
(2005, CERM, 'Ole Søe Sørensen')
(2005, FORM, 'Dan Beltoft')
(2005, KASS, 'Tanja Kragbæk')
(2005, VC,   'Rasmus Ragnvald Olofsson')
(2006, CERM, 'Tine Vraast-Thomsen')
(2006, FORM, 'Michael Volf Henneberg')
(2006, KASS, 'Lars Thorhauge')
(2006, NF,   'Aslak Thorndahl Lindballe')
(2006, PR,   'Mia Dyhr Christensen')
(2006, SEKR, 'Lasse Vilhelmsen')
(2006, VC,   'Martin Studsgaard Christensen')
(2007, CERM, 'Johan Sigfred Abildskov')
(2007, FORM, 'Jan Munksgård Baggesen')
(2007, KASS, 'Mads Baggesen')
(2007, NF,   'Eva Lykkegaard Poulsen')
(2007, PR,   'Sidse Damgaard')
(2007, SEKR, 'Ninni Schaldemose')
(2007, VC,   'Kasper Søgaard Deleuran')
(2008, CERM, 'Sofie Kastbjerg')
(2008, FORM, 'Tue Christensen')
(2008, PR,   'Cecilie Vahlstrup')
(2009, CERM, 'Christian Bladt Brandt')
(2009, FORM, 'Jonas Bæklund')
(2009, KASS, 'Rikke Aagaard')
(2009, NF,   'Ditte Både Sandkamm')
(2009, PR,   'Nikolaj Andresen')
(2009, SEKR, 'Anne Clemmensen')
(2009, VC,   'Troels Tinggaard Hahn')
(2010, FORM, 'Mie Elholm Birkbak')
(2010, KASS, 'Torben Muldvang Andersen')
(2010, NF,   'Morten Jensen')
(2010, PR,   'Kristoffer L. Winge')
(2010, SEKR, 'Maria Kragelund')
(2010, VC,   'Morten Rasmussen')
(2011, CERM, 'Sabrina Tang Christensen')
(2011, FORM, 'Jakob Schultz-Nielsen')
(2011, KASS, 'Britt Fredsgaard')
(2011, NF,   'Kasper Monrad')
(2011, PR,   'Marie Kirkegaard')
(2011, SEKR, 'Niels Ramskov Bøje')
(2011, VC,   'Maiken Haahr Hansen')
(2012, CERM, 'Mads Fabricius')
(2012, FORM, 'Steffen Videbæk Petersen')
(2012, KASS, 'Eva Gjaldbæk Frandsen')
(2012, NF,   'Johannes Christensen')
(2012, PR,   'Nana Halle')
(2012, SEKR, 'Jakob Rørsted Mosumgaard')
(2012, VC,   'Peter Slemming-Adamsen')
(2005, FU('JA'), 'Jane Drejer')
(2006, FU('ZA'), 'Sarah Zakarias')
(2007, FU('AN'), 'Kenneth Sejdenfaden Bøgh')
(2007, FU('HO'), 'Daniel Dalhoff Hviid')
(2007, FU('ME'), 'Mette Aagaard')
(2008, FU('AN'), 'Andreas Sand Gregersen')
(2008, FU('NÉ'), 'René Søndergaard')
(2008, FU('RU'), 'Jesper Unna')
(2009, FU('BS'), 'Sandra Pedersen')
(2009, FU('HN'), 'Mette Hansen')
(2009, FU('XA'), 'Christian Fretté')
(2009, FU('ØL'), 'Carina Kjeldahl Møller')
(2009, FU('ØR'), 'Signe Grønborg')
(2010, FU('AN'), 'Andreas Nikolai Kyed Bovin')
(2010, FU('NI'), 'Asbjørn Stensgaard')
(2010, FU('PH'), 'Pernille Hornemann Jensen')
(2010, FU('UL'), 'Camilla Pedersen')
(2010, FU('RØ'), 'Lærke Rønlev Reinholdt')
(2011, FU('FR'), 'Anders Friis Jensen')
(2011, FU('HR'), 'Christina Moeslund')
(2011, FU('IØ'), 'Mathilde Biørn Madsen')
(2011, FU('LA'), 'Camilla Skree Sørensen')
(2011, FU('NU'), 'Andreas Bendix Nuppenau')
(2011, FU('RI'), 'Frederik Jerløv')
(2011, FU('RT'), 'Martin Sand')
(2012, FU('AN'), 'Henrik Lund Mortensen')
(2012, FU('CO'), 'Jacob Schnedler')
(2012, FU('HI'), 'Mathias Dannesbo')
(2012, FU('LI'), 'Line Bjerg Sørensen')
(2012, FU('LO'), 'Lone Koed')
(2012, FU('LS'), 'Sara Poulsen')
(2012, FU('MO'), 'Marianne Ostenfeldt Mortensen')
(2012, FU('MY'), 'Rasmus Thygesen')
(2012, FU('NA'), 'Karina Sunds Nielsen')
(2012, FU('ZU'), 'Christian Bonar Zeuthen')
('ADAM',      h, 'Adam Etches')
('Nissen',    h, 'Anders Hauge Nissen')
('Metal Bo',  h, 'Bo Mortensen')
('CBM',       h, 'Christian Brandt Møller')
('J-DAG',     h, 'Jacob Damgaard Jensen')
('Jen_s',     h, 'Jens Kusk Block')
('EFUIT',     h, 'Lauge Mølgaard Hoyer')
('Have',      h, 'Martin Anker Have')
('Mavraganis',h, 'Mathias Jaquet Mavraganis')
('Rav',       h, 'Mathias Rav')
('Metten',    h, 'Mette Lysgaard Schulz')
('Vester',    h, 'Mikkel Bak Vester')
('M3',        h, 'Morten Schaumburg')
('Cramer',    h, 'Morten \'Cramer\' Nikolaj Pløger')
('#',         h, 'Rikke Hein')
('Sean',      h, 'Sean Geggie')
(insert_html(TKET), h, 'TÅGEKAMMERET')
(insert_html(TK),   h, 'TÅGEKAMMER')
);

var alias_regexp = new RegExp(aliases.targets.join('|'));

//Sune Riise Nielsen: T^78OVC (1931)

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

// Apply transformation initially.
r(document.body);
