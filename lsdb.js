function split_snmpwalk_output(s) {
    // This function is a finite state machine.
    // State 0: Discard the current line and continue until we see a line containing " = Hex-STRING: ".
    // State 1: We see the magic string, telling us to format and add the parsed string to the LSDB (if any)
    // and begin parsing the next string.
    // State 2: This line does not contain the magic string and we should append its value to the parsed value.
    
    var lines = s.split(/\n/);
    var state = 0;
    var lsdb = [];
    var s = "";

    for (var i = 0; i < lines.length; i++) {
	if (lines[i].includes(" = Hex-STRING: ")) {
	    if (state == 2) {
		lsdb.push(s.replace(/ /g, ''));
	    }
	    state = 1;
	    s = lines[i].substring(15 + lines[i].lastIndexOf(" = Hex-STRING: "));
	    state = 2;
	} else if (state == 2) {
	    s += lines[i];
	}
    }
    return(lsdb);
}

function parseLsa(lsa) {
    var link_state_type = getByte(lsa, 3);
    var link_state_id = getInt(lsa, 4);
    var advertising_rtr = getInt(lsa, 8);
    var length = getShort(lsa, 18);
    return link_state_type;
}

function parseRouterLsa(lsa) {
    var number_of_links = getShort(lsa, 22);
    
}

function getByte(buffer, offset) {
    return getBytes(buffer, offset, 1);
}

function getShort(buffer, offset) {
    return getBytes(buffer, offset, 2);
}

function getInt(buffer, offset) {
    return getBytes(buffer, offset, 4);
}

function getBytes(buffer, offset, byteCount) {
    return parseInt(buffer.substring(2 * offset, 2 * (offset + byteCount)), 16);
}


var input = `iso.3.6.1.2.1.14.4.1.8.0.0.0.0.1.192.168.1.1.192.168.1.1 = Hex-STRING: 00 00 22 01 C0 A8 01 01 C0 A8 01 01 80 00 04 98
55 69 00 48 02 00 00 04 C0 A8 01 01 FF FF FF FF
03 00 00 22 C0 A8 01 02 C0 A8 FE 01 01 00 1A 6D
C0 A8 FE 00 FF FF FF 00 03 00 1A 6D C0 A8 FF 02
C0 A8 FF 01 02 00 0A 18
iso.3.6.1.2.1.14.4.1.8.0.0.0.0.1.192.168.1.2.192.168.1.2 = Hex-STRING: 00 01 22 01 C0 A8 01 02 C0 A8 01 02 80 00 01 85
C7 1E 00 78 00 00 00 08 C0 A8 01 02 FF FF FF FF
03 00 00 01 C0 A8 64 64 C0 A8 64 01 02 00 00 01
C0 A8 14 00 FF FF FF 00 03 00 00 01 C0 A8 01 01
C0 A8 FE 02 01 00 02 62 C0 A8 FE 00 FF FF FF 00
03 00 02 62 C0 A8 FF 02 C0 A8 FF 02 02 00 03 DB
C0 A8 FD 03 C0 A8 FD 02 02 00 00 90 C0 A8 0A 00
FF FF FF 00 03 00 00 01
iso.3.6.1.2.1.14.4.1.8.0.0.0.0.1.192.168.1.3.192.168.1.3 = Hex-STRING: 00 02 22 01 C0 A8 01 03 C0 A8 01 03 80 00 00 EF
FE 97 00 48 00 00 00 04 C0 A8 64 64 C0 A8 64 02
02 00 00 01 C0 A8 01 03 FF FF FF FF 03 00 00 01
C0 A8 FD 03 C0 A8 FD 03 02 00 B5 20 C0 A8 1E 00
FF FF FF 00 03 00 00 01
iso.3.6.1.2.1.14.4.1.8.0.0.0.0.1.192.168.1.100.192.168.1.100 = Hex-STRING: 00 02 22 01 C0 A8 01 64 C0 A8 01 64 80 00 00 EA
7F E6 00 30 01 00 00 02 C0 A8 01 64 FF FF FF FF
03 00 00 01 C0 A8 64 64 C0 A8 64 64 02 00 00 01
iso.3.6.1.2.1.14.4.1.8.0.0.0.0.2.192.168.100.100.192.168.1.100 = Hex-STRING: 00 02 22 02 C0 A8 64 64 C0 A8 01 64 80 00 00 E8
72 32 00 24 FF FF FF 00 C0 A8 01 64 C0 A8 01 02
C0 A8 01 03
iso.3.6.1.2.1.14.4.1.8.0.0.0.0.2.192.168.253.3.192.168.1.3 = Hex-STRING: 00 02 22 02 C0 A8 FD 03 C0 A8 01 03 80 00 00 E6
FF A2 00 20 FF FF FF 00 C0 A8 01 03 C0 A8 01 02
iso.3.6.1.2.1.14.4.1.8.0.0.0.0.2.192.168.255.2.192.168.1.2 = Hex-STRING: 00 01 22 02 C0 A8 FF 02 C0 A8 01 02 80 00 01 2B
56 09 00 20 FF FF FF 00 C0 A8 01 02 C0 A8 01 01
iso.3.6.1.2.1.14.4.1.8.0.0.0.0.5.0.0.0.0.192.168.1.1 = Hex-STRING: 00 00 20 05 00 00 00 00 C0 A8 01 01 80 00 01 58
70 7E 00 24 00 00 00 00 80 00 00 01 00 00 00 00
00 00 00 01`;

var a = split_snmpwalk_output(input);
console.log(a);
for (var i = 0 ; i < a.length ; i++) {
    console.log(parseLsa(a[i]));
}
