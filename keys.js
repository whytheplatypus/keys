(function () {
    "use strict";

    /**
     * Creates an instance of keys, an extra row of buttons for the iOS virtual keyboard in webapps.
     *
     * @constructor
     * @this {keys}
     * @param {Array} syms An array of characters that you want the new keyboard to containt (this can be added to later).
     * @param {Object} options An object containing options for the new keys, this is optional
     */
    var Keys = function (syms, opt) {
        this.symbols = syms;
        this.options = opt ? opt : {};
        //we haven't rendered anything yet
        this.board = false;
        this.input = false; //the currently focused input
        
        this.build();
    };

    Keys.prototype.hasClass = function (cls) {
        return this.board.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    Keys.prototype.addClass = function (cls) {
        if (!this.hasClass(cls)) this.board.className += " " + cls;
    }

    Keys.prototype.removeClass = function (cls) {
        if (this.hasClass(cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            this.board.className = this.board.className.replace(reg, ' ');
        }
    }

    /**
     * Updates the orientation of keys display, we define how it handles the orientation in the css
     *
     * @this {keys}
     * @return {string} the current orientation of the device.
     */
    Keys.prototype.orientation = function () {
        if (window.orientation == 0 || 180) {
            this.removeClass("landscape");
            this.addClass("portrait");
            return "portrait";
        } else {
            this.removeClass("portrait");
            this.addClass("landscape");
            return "landscape";
        }
        
    }
        
    /**
     * Inserts text at the carat and updates the carats position
     *
     * @this {insertAtCarat}
     * @return {bool} just because.
     */
    Keys.insertAtCaret = function(el,text) {
        var txtarea = el;
        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        strPos = txtarea.selectionStart;
    
        var front = (txtarea.value).substring(0,strPos);  
        var back = (txtarea.value).substring(strPos,txtarea.value.length); 
        txtarea.value=front+text+back;
        strPos = strPos + text.length;
        txtarea.selectionStart = strPos;
        txtarea.selectionEnd = strPos;
        txtarea.focus();
        txtarea.scrollTop = scrollPos;
        return true;
    }

    /**
     * Creates and or renders the board and respective keys,
     * including listeners, orientation etc.
     *
     * @self {keys}
     * @return {keys} just in case.
     */
    Keys.prototype.build = function () {
        console.log("building keys");
        var self = this;
        //make sure we're on iOS (just iOS for now)
        if (this.options.debug || Keys.isMobile) {
            if (!self.board) {
                self.board = document.createElement('div');
                self.board.id = "keyboard";//make unique at some point
            }
            if (!document.getElementById(self.board.id)) {
                document.body.appendChild(self.board);
                //prevent wierd iOS behavior
                self.board.addEventListener('selectstart', function(event){event.preventDefault(); return false;}, false);
                self.board.addEventListener('select', function(event){event.preventDefault(); return false;}, false);
            }

            self.symbols.forEach(function (key) {
                var newKey = new Key(key);
                
                var keyReleased = function(){
                    newKey.hitButton(self.input);
                }
                
                newKey.button.addEventListener('touchend', keyReleased, false);
                if (self.options.debug && !Keys.isMobile()) {
                    newKey.button.addEventListener('click', keyReleased, false);
                }

                self.board.appendChild(newKey.button);
            });


            //get orientation
            self.orientation();
            document.body.addEventListener('orientationchange', function (event) {
                self.orientation();
            }, false);
            
            var attachInputListeners = function(inputs){
                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].addEventListener('focus', function () {
                        self.input = this;
                        self.show();
                    }, false);
                    inputs[i].addEventListener('blur', function () {
                        self.hide();
                    }, false);
                }
            };
            
            var areas = document.getElementsByTagName('input');
            attachInputListeners(areas);
            
            if(this.options.codemirrors){
                for (var i = 0; i < this.options.codemirrors.length; i++) {
                    var currentMirror = this.options.codemirrors[i];
                    currentMirror.setOption('onFocus', function () {
                        self.input = currentMirror;
                        self.show();
                    });
                    currentMirror.setOption('onBlur', function () {
                        self.hide();
                    });
                }
                areas = new Array();
                for(var i in this.options.textareas){
                    areas.push(document.getElementById(this.options.textareas[i]));
                    attachInputListeners(areas);
                }
            } else {
                areas = document.getElementsByTagName('textarea');
                attachInputListeners(areas);
            }
            

            window.addEventListener('scroll', function () {
                if (self.input) {
                    self.board.style.top = window.pageYOffset + "px";
                    self.board.style.left = window.pageXOffset + "px";
                }
            }, false);
            window.addEventListener('resize', function () {
                if (self.input) {
                    self.board.style.top = window.pageYOffset + "px";
                    self.board.style.left = window.pageXOffset + "px";
                    self.board.style.width = window.innerWidth + "px";
                }
            }, false);
        }

        return this;
    };

    Keys.prototype.hide = function () {
        this.removeClass('visible');
        this.input = false;
        //this.board.style.top = "-60px";
        if(this.options.onHide){
            this.options.onHide();
        }
    };

    Keys.prototype.show = function () {
        var self = this;
        this.addClass('visible');
        self.board.style.top = window.pageYOffset + "px";
        self.board.style.left = window.pageXOffset + "px";
        self.board.style.width = window.innerWidth + "px";
        if(self.options.onShow){
            self.options.onShow();
        }
    };
        
    /**
     * Creates an instance of keys, an extra row of buttons for the iOS virtual keyboard in webapps.
     *
     * @constructor
     * @this {Key}
     * @param {key} A JSON object describing the key, or just a string if the keys value and display are the same.
     */
    var Key = function(key){
        var self = this;
        var button = document.createElement('a');

        button.value = key.value?key.value:key;
        button.innerHTML = key.display?key.display:key;


        button.className = "key";
        
        

        this.hitButton = function (input) {
            if(self.justMoved){
                self.justMoved = false;
                return;
            }
            //self.el.removeEventListener('touchend', self.hitButton, false);
            event.preventDefault();

            if (input.replaceRange) {
                var cursor_temp = self.input.getCursor(true);
                input.replaceRange(button.value, cursor_temp);
            } else {
                Keys.insertAtCaret(input, button.value);
            }

            if(key.behavior){
                key.behavior(input);
            }
        };
        
        button.addEventListener('touchmove', function(){
            self.justMoved = true;
        });
        button.addEventListener('mousedown', function (event) {
            event.preventDefault();
        }, false);
        button.addEventListener('mouseup', function (event) {
            event.preventDefault();
        }, false);
        
        this.button = button;
    }
        
    Keys.isMobile = function(){
        return (navigator.userAgent.indexOf('iPhone') != -1) || 
                (navigator.userAgent.indexOf('iPod') != -1) || 
                (navigator.userAgent.indexOf('iPad') != -1);
    }

    window.Keys = Keys;
})();