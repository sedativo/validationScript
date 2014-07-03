'use strict';
window.addEventListener('load', function(){
    var form = $('#myform');
    console.log(form);
    form.parent().on('validateReset', function(){
        $(this).hide();
    });
    $('button').on('click', function(e){
        e.preventDefault();
        form.parent().show();
        //myValidate.init(form);
    });
        myValidate.init(form);
    }, false);



