'use strict';
var event = new CustomEvent('modalConfirmed', { detail:{ time: new Date() },bubbles: true,cancelable: true});
window.addEventListener('load', function(){
    var form = $('#myform');


    console.log(form);
    form.parent().on('validateReset', function(){
        console.log('someone broadcasted a reset event');
        form.find('input[type="reset"]').trigger('modalConfirmed');
        //$(this).hide();
    });
    $('button').on('click', function(e){
        e.preventDefault();
        form.parent().show();
        myValidate.init(form);
    });
        myValidate.init(form);
    }, false);



