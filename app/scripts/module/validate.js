(function(window, document, undefined){
    'use strict';

    var myValidate = (function(){

        return {
            settings: {
                timeout: 1000,
                patterns: {
                    name: /^[a-z ,.'-]+$/i,
                    email: /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                    cvv: /^[0-9]{3,4}$/,
                    postalcode: /^[A-Z0-9\-]{3,10}$/i,
                    cc: {
                        visa: /^4[0-9]{12,15}$/,
                        mastercard: /^5[0-9]{15}$/,
                    }
                }
            },
            activeForm : null,
            timer : null,
            init: function(form){
                this.activeForm = form;
                return this.bindEvents();
            },
            bindEvents: function(){

                var self = this;

                this.activeForm
                .off()
                .on('submit', function(e){
                    e.preventDefault();
                    console.log('submit form');
                }).find('input[required], select[required]')
                .off()
                .on('blur change', function(){
                    console.log('blur change');
                })
                .on('keyup', function(){
                    clearTimeout(self.timer);
                    self.timer = setTimeout(function(){
                        console.log('keyup');
                    }.bind(this), self.settings.timeout);
                });

                this.activeForm.find('input[type="reset"]')
                .on('click', self.reset.bind(self))
                .on('resetConfirmed', function(){

                    self.toggleDisabled();

                    return self.removeEvents();

                });

                return this.createEvent();
            },
            createEvent: function(){
                var event = new CustomEvent(
                    'validateReset',
                    {
                        detail:
                        {
                            time: new Date()
                        },
                        bubbles: true,
                        cancelable: true
                    }
                );

                return event;
            },
            removeEvents: function(){

                var self = this;

                this.activeForm.off();

                this.activeForm.find('input[required], select[required]').off();

                this.activeForm.find('input[type="reset"]').off(
                    'click', self.reset.bind(self)
                    );

            },
            reset: function(){
                console.log(event.type);
                var fields = this.activeForm.find('input[required], select[required]'),
                    reset = this.activeForm.find('input[type="reset"]');

                fields.each(function(){

                    if($(this).hasClass('dirty')){
                        $(this).val('')
                            .removeClass('dirty')
                            .addClass('pristine')
                            .removeAttr('data-invalid')
                            .removeAttr('data-valid');
                    }
                    if($(this).is('select')){
                        $(this).val('0')
                        .removeAttr('data-invalid')
                        .removeAttr('data-valid');
                    }

                });

                if(reset.data('confirm')){
                    this.activeForm.trigger('validateReset');
                    return;
                }

                return this.toggleDisabled();

            },
            canSubmitCheck: function(){

                var feilds = this.activeForm.find('input[required], select[required]'),
                    canSubmit = true;

                    feilds.each(function(){
                        if($(this).attr('data-invalid') || $(this).hasClass('pristine')){
                            canSubmit = false;
                        }
                    });

                return this.toggleDisabled(canSubmit);

            },
            setMessage: function(element, type, valid){
                var messageEL = element.siblings('small'),
                    text = messageEL.data(type) ? messageEL.data(type) : '';

                messageEL.text(text);

               return this.setvalidity(element, valid);
            },
            setvalidity: function(element, valid){
                return valid ? element.removeAttr('data-invalid').attr('data-valid', '') :
                    element.removeAttr('data-valid').attr('data-invalid', '') ;
            },
            toggleDisabled: function(canSubmit){

                var submitButton = this.activeForm.find('input[type="submit"]');

                return (submitButton.attr('disabled') && canSubmit) ?
                        submitButton.removeClass('is-disabled').removeAttr('disabled') :
                        submitButton.addClass('is-disabled').attr('disabled', 'disabled');

            },
            handleDate: function(month, year){

                var dayArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                    mval = month.substring(1),
                    yval = year,
                    today = new Date(),
                    expDate = new Date(),
                    day;

                //decrement month value by 1 to match 0 indexed array
                mval--;

                //check if month value === february then check if leap year,
                //otherwise set date var with value from day array.

                day = mval === 1 ? (yval % 4 === 0 ? 29 : 28) : dayArray[mval];

                //date object value with expiration date
                expDate.setFullYear(yval, mval, day, 23, 59, 59);

                return (today > expDate) ? false : true;
            }
        };
    })();
    window.myValidate = myValidate;
})(this, this.document);
