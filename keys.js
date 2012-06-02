
(function(){
  "use strict";

    /**
    * Creates an instance of keys, an extra row of buttons for the iOS virtual keyboard in webapps.
    *
    * @constructor
    * @this {keys}
    * @param {Array} syms An array of characters that you want the new keyboard to containt (this can be added to later).
    * @param {Object} options An object containing options for the new keys, this is optional
    */
    var keys = function(syms, options){
        this.symbols = syms;
    };

});