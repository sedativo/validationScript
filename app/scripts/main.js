'use strict';
window.addEventListener('load', function(){
    var timeout;
    //$('form').validate( {isAjax: true});

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


    $('#myform').formatVal().avsAuto().validate();
    $('#anotherForm').formatVal();
    $('#newForm').validate();
}, false);



