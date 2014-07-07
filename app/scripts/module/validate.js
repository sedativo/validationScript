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
                    password: /^.{6,}$/,
                    postalcode: /^[A-Z0-9\-]{3,10}$/i,
                    cc: {
                        visa: /^4[0-9]{12,15}$/,
                        mastercard: /^5[0-9]{15}$/,
                    }
                }
            },
            activeForm : null,
            isAjax : null,
            timer : null,
            init: function(form, isAjax){
                this.activeForm = form;
                this.isAjax = isAjax || null;
                return this.bindEvents();
            },
            bindEvents: function(){

                var self = this;

                this.activeForm.find('input[type="submit"]')
                .off().on('click', function(e){
                    e.preventDefault();
                    self.validate(self.activeForm.find('input[required], select[required]'), true);
                });
                this.activeForm.find('input[required], select[required]')
                .off()
                .on('blur change', function(){
                    console.log('event: '+event.type);
                    self.validate($(this), false);
                })
                .on('keyup', function(){
                    clearTimeout(self.timer);
                    self.timer = setTimeout(function(){
                        self.validate($(this), false);
                    }.bind(this), self.settings.timeout);
                });

                // this.activeForm.find('input[type="reset"]')
                // .on('click', function(){

                //     if($(this).data('confirm')){
                //         console.log('broadcast reset');
                //         self.activeForm.trigger('validateReset');
                //         return;
                //     }

                //     return self.reset.call(self);
                // })
                // .on('modalConfirmed', function(){
                //     console.log('modal confirmed reset form');
                //     self.reset.call(self);

                //     return self.removeEvents();

                // })
                // .on('ajaxDone', function(){

                //     return self.reset.call(self);

                // });

                return this.createEvent();
            },
            createEvent: function(){
                var valReset = new CustomEvent(
                    'validateReset',
                    {
                        detail:
                        {
                            time: new Date()
                        },
                        bubbles: true,
                        cancelable: true
                    }
                ),
                callAjax = new CustomEvent(
                    'callAjax',
                    {
                        detail: {
                            time: new Date()
                        },
                        bubbles: true,
                        cancellable: true
                    }
                );


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

                var fields = this.activeForm.find('input[required], select[required]'),
                    reset = this.activeForm.find('input[type="reset"]');

                fields.each(function(){

                    if( $(this).is('select') ){
                        $(this).val('0')
                            .removeAttr('data-invalid')
                            .removeAttr('data-valid');
                    } else {
                        $(this).val('')
                            .removeClass('dirty')
                            .addClass('pristine')
                            .removeAttr('data-invalid')
                            .removeAttr('data-valid');
                    }

                });

                return this.toggleDisabled();

            },
            validate: function(elements, submit){
                console.log('validate');
                var el = elements,
                    self = this;

                el.each(function(){
                    console.log($(this));
                    if( !$(this).val().length || $(this).val() === '0' ){
                        self.handleEmptyField.call(self, $(this));
                    }
                    if( $(this).hasClass('pristine') && $(this).val().length ){
                        $(this).removeClass('pristine').addClass('dirty');
                    }
                    if( $(this).data('pattern') && $(this).val().length ){
                        self.parsePattern($(this));
                    }
                    if( $(this).data('type') === 'month' || $(this).data('type') === 'year' ){
                        self.handleDate($('select[data-type="month"]'), $('select[data-type="year"]'));
                    }
                    if( $(this).data('equal-to') && $(this).val().length ){
                        self.handleEqualTo($(this));
                    }
                    if( $(this).attr('type') === 'checkbox' ){
                        self.handleCheckBox($(this));
                    }

                });

                return this.canSubmitCheck(submit);
            },
            handleEmptyField: function(element){
                console.log('handleEmpty field');
                if( this.activeForm.data('handle-empty') ){
                    this.setMessage(element, 'empty', false);
                }

                if( element.hasClass('dirty') ){
                    element.removeClass('dirty').addClass('pristine');
                }

                return this.toggleDisabled(false);

            },
            parsePattern: function(element){
                console.log('parsePattern');
                var el = element,
                    pattern = el.data('pattern'),
                    patterns = this.settings.patterns,
                    testVal = null;

                if( pattern === 'cc' ){
                    return this.handleCreditCard(el);
                }

                if( patterns.hasOwnProperty(pattern) && pattern.length ){
                    console.log('patterns[pattern]: '+patterns[pattern]);
                    testVal = patterns[pattern];
                } else if ( pattern.length ) {
                    testVal = new RegExp('^'+pattern+'$');
                }

                return this.handlePattern(el, testVal);

            },
            handlePattern: function(element, testValue){
                console.log('handle Pattern');
                var el = element,
                    pattern = testValue,
                    valid = pattern.test(el.val()),
                    type = valid ? '' : 'invalid';

                return this.setMessage(el, type, valid);

            },
            canSubmitCheck: function(submit){
                console.log('cansubmit check');
                var feilds = this.activeForm.find('input[required], select[required]'),
                    canSubmit = true;

                    feilds.each(function(){
                        if( $(this).attr('data-invalid') || $(this).hasClass('pristine') ){
                            canSubmit = false;
                        }
                    });

                if( canSubmit && this.isAjax ){
                    return this.activeForm.find('input[type="submit"]').trigger('callAjax');
                }

                if( canSubmit && submit ){
                    this.toggleDisabled(false);
                    return this.activeForm.submit();
                }
                console.log('canSubmit: '+canSubmit);
                return this.toggleDisabled(canSubmit);

            },
            setMessage: function(element, type, valid){
                console.log('set message');
                var messageEL = element.siblings('small'),
                    text = messageEL.data(type) ? messageEL.data(type) : '';

                messageEL.text(text);

               return this.setvalidity(element, valid);
            },
            setvalidity: function(element, valid){
                console.log('setvalidity');
                return valid ? element.removeAttr('data-invalid').attr('data-valid', '') :
                    element.removeAttr('data-valid').attr('data-invalid', '');

            },
            toggleDisabled: function(canSubmit){
                console.log('toggleDisabled canSubmit: '+canSubmit);
                var submitButton = this.activeForm.find('input[type="submit"]');

                return  canSubmit ?
                        submitButton.removeClass('is-disabled').removeAttr('disabled') :
                        submitButton.addClass('is-disabled').attr('disabled', 'disabled');

            },
            handleEqualTo: function(element){

                var value = element.data('equal-to'),
                    checkVal = $('#'+value),
                    valid = element.val() === checkVal.val() ? true : false,
                    type = valid ? '' : 'not-equal';

                return this.setMessage(element, type, valid);

            },
            handleCheckBox: function(element){

                var valid = element.is(':checked') ? true : false,
                    type = valid ? '' : 'invalid';

                return this.setMessage(element, type, valid);

            },
            handleCreditCard: function(element){

                var el = element,
                    patterns = this.settings.patterns;

                if ( patterns.cc.visa.test(el.val()) && !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid-visa', false);
                }
                if ( patterns.cc.mastercard.test(el.val()) && !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid-mc', false);
                }

                return this.setMessage(element, '', true);

            },
            luhnCheck: function(value){

                var number = value.replace(/\D/g, ''),
                    number_length = number.length,
                    parity = number_length % 2,
                    total = 0;

                for ( i = 0; i < number_length; i++ ) {
                    var digit = number.charAt(i);
                    if ( i % 2 == parity ) {
                        digit = digit * 2;
                        if ( digit > 9 ) {
                            digit = digit - 9;
                        }
                    }
                    total = total + parseInt(digit);
                }

                if ( total % 10 == 0 ){
                    return true;
                } else {
                    return false;
                }

            },
            handleDate: function(month, year){

                var dayArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                    mval = month.val(),
                    mvalTrim = mval.substring(1),
                    yval = year.val(),
                    today = new Date(),
                    expDate = new Date(),
                    day,
                    valid = false,
                    type;

                if( month.val() === '0' && year.val() === '0' ){
                    return this.setMessage(year, 'empty', valid);
                }
                //decrement month value by 1 to match 0 indexed array
                mvalTrim--;

                //check if month value === february then check if leap year,
                //otherwise set date var with value from day array.

                day = mvalTrim === 1 ? (yval % 4 === 0 ? 29 : 28) : dayArray[mvalTrim];

                //date object value with expiration date
                expDate.setFullYear(yval, mvalTrim, day, 23, 59, 59);

                valid = (today > expDate) ? false : true;
                type = valid ? '' : 'invalid';

                return this.setMessage(year, type, valid)
            }
        };
    })();

    window.myValidate = myValidate;

})(this, this.document);
