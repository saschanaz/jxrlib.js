# Merge JxrLib.out.js and jxrlibwrapper.js

$libout = gc jxrlib/JxrLib.out.js
$wrapper = gc jswrapper/jxrlibwrapper.js
sc jxrlib.js $($libout + $wrapper[0..$($wrapper.length - 2)])