
var demo_keys = new Keys([{value: 'not equal', display: '$ \\ne $'},
    {value: 'sqrt()',
     display: '$ \\\sqrt{} $',
     behavior:
        function(input){
            input.selectionStart -= 1;
            input.selectionEnd -= 1;
            //this.focus();
        }
    },'~','`','_','#','*','[',']','{','}','(',')',':','/','@','^'], {debug:true});
demo_keys.build();
