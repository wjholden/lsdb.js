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
    //console.log(buffer.substring(2 * offset, 2 * (offset + byteCount)));
    return parseInt(buffer.substring(2 * offset, 2 * (offset + byteCount)), 16);
}

/*
var x = "00112233445566";
console.log(getByte(x, 0).toString(16));
console.log(getShort(x, 1).toString(16));
console.log(getInt(x, 3).toString(16));
*/
