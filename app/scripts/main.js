'use strict';
var event = new CustomEvent('modalConfirmed', { detail:{ time: new Date() },bubbles: true,cancelable: true});
window.addEventListener('load', function(){
    var form = $('#myform');
    var toggleEmpty = function(value){
        return !value;
    }

    console.log(form);
    form.parent().on('validateReset', function(){
        console.log('someone broadcasted a reset event');
        form.find('input[type="reset"]').trigger('modalConfirmed');
        //$(this).hide();
    });
    $('button.rebind').on('click', function(e){
        e.preventDefault();
        form.parent().show();
        Validate.init(form);
    });
        Validate.init(form);

    $('.toggleEmpty').on('click', function(e){
        e.preventDefault();

        var value = $('#myform').data('handle-empty');
        Validate.reset();
        return $('#myform').data('handle-empty', !value);
    });

    }, false);



