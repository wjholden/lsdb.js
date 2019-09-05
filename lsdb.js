// This object controls whether the router/network LSAs are drawn or not.
var lsdbConfig = {
    showRouterLsa: true,
    showNetworkLsa: true
};

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
    return (lsdb);
}

function parseLsa(lsa) {
    switch (getByte(lsa, 3)) {
        case 1:
            return lsdbConfig.showRouterLsa ? parseRouterLsa(lsa) : "";
        case 2:
            return lsdbConfig.showNetworkLsa ? parseNetworkLsa(lsa) : "";
        default:
            return "";
    }
}

function parseRouterLsa(lsa) {
    var number_of_links = getShort(lsa, 22);
    var g = "";
    var advertising_router = intToIp(getInt(lsa, 8));
    for (var i = 0; i < number_of_links; i++) {
        var offset = 6 * 4 + (3 * 4 * i);
        var link_id = intToIp(getInt(lsa, offset));
        var link_data = intToIp(getInt(lsa, offset + 4));
        var link_type = getByte(lsa, offset + 8);
        var metric = getShort(lsa, offset + 10);
        switch (link_type) {
            case 1: /* fall through */
            // point-to-point
            case 2: // transit network
                g += "\"" + advertising_router + "\" -> \"" + link_id +
                    "\" [label=" + metric + "];\n";
                break;
            case 3: // stub network
                g += "\"" + advertising_router + "\" -> \"" + link_id + "/\n" +
                    link_data + "\" [label=" + metric + "];\n";
                break;
        }
    }
    return g;
}

function parseNetworkLsa(lsa) {
    var length = getShort(lsa, 18);
    var link_id = intToIp(getInt(lsa, 4));
    var netmask = intToIp(getInt(lsa, 20));
    var position = 24;
    var g = "";
    while (position < length) {
        var attached_router = intToIp(getInt(lsa, position));
        g += "\"" + link_id + "/\n" + netmask + "\" -> \"" +
            attached_router + "\";\n";
        position += 4;
    }
    return g;
}

function intToIp(x) {
    return (x >>> 24) + "." + ((x >>> 16) & 0xff) + "." + ((x >>> 8) & 0xff) + "." + (x & 0xff);
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
