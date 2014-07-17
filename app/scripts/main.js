'use strict';
var event = new CustomEvent('modalConfirmed', { detail:{ time: new Date() },bubbles: true,cancelable: true});
window.addEventListener('load', function(){
    var timeout;
    $('form').validate();

    $('form').find('input[type=submit]')
    .on('click', function(e){
        e.preventDefault();
        clearTimeout(timeout);
        if($(this).parents('form').hasClass('invalid-empty')){
             timeout = setTimeout(function(){
                $('body').stop().animate({scrollTop:0}, 500);
            }, 100);
        }
    });
    // AVSAutoComp.init(
    //     $('#myForm'),
    //     {
    //         country: $('#fake_country'),
    //         region: $('#region')
    //     }
    // );

    $('#myform').formatVal().avsAuto();
    $('#anotherForm').formatVal();
    // var form = $('#myform'),
    //     country = $('#fake_country'),
    //     region = $('#region');
    // var toggleEmpty = function(value){
    //     return !value;
    // }

    // console.log(form);
    // form.parent().on('validateReset', function(){
    //     console.log('someone broadcasted a reset event');
    //     form.find('input[type="reset"]').trigger('modalConfirmed');
    //     //$(this).hide();
    // });
    // $('button.rebind').on('click', function(e){
    //     e.preventDefault();
    //     form.parent().show();
    //     Validate.init(form);
    // });

    //     Validate.init(form);
    //     FormatFields.init(form);
    //     AVSAutoComp.init(form, country, region)

    // $('.toggleEmpty').on('click', function(e){
    //     e.preventDefault();

    //     var value = $('#myform').data('handle-empty');

    //     if( $('.handleEmpty').hasClass('success') ){
    //         $('.handleEmpty').removeClass('success').addClass('alert');
    //     } else {
    //         $('.handleEmpty').removeClass('alert').addClass('success');
    //     }

    //     Validate.reset();
    //     return $('#myform').data('handle-empty', !value);
    // });

    // $('.toggleSubmit').on('click', function(e){
    //     e.preventDefault();

    //     var value = $('#myform').data('toggle-submit');

    //     if( $('.handlesubmit').hasClass('success') ){
    //         $('.handlesubmit').removeClass('success').addClass('alert');
    //         form.find('input[type="submit"]').removeAttr('disabled');
    //     } else {
    //         $('.handlesubmit').removeClass('alert').addClass('success');
    //         form.find('input[type="submit"]').attr('disabled', 'disabled');

    //     }
    //     return $('#myform').data('toggle-submit', !value);
    // });
    }, false);



