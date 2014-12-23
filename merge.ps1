# Merge JxrDecLib.out.js and jxrlibwrapper.js

$decout = gc jxrlib/JxrDecLib.out.js
$wrapper = gc jswrapper/jxrlibwrapper.js
sc jxrdeclib.js $($decout + $wrapper[0..$($wrapper.length - 2)])