(function(window, document, undefined){
    'use strict';

    var Validate = (function(){

        return {
            settings : {
                live_validate: true,
                timeout : 1000,
                patterns : {
                    name : /^[a-z ,.'-]+$/i,
                    email : /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                    cvv : /^[0-9]{3,4}$/,
                    password : /^.{6,}$/,
                    postalcode : /^[A-Z0-9\-]{3,10}$/i,
                    //date formatt MM/YYYY
                    date : /^(0[1-9]|1[012])[- \/.]\d{4}$/,
                    cc : {
                        visa : /^4[0-9]{12,15}$/,
                        mastercard : /^5[0-9]{15}$/,
                    }
                }
            },
            activeForm : null,
            isAjax : null,
            timer : null,
            init : function(form, settings){

                this.activeForm = form;
                this.isAjax = settings ? settings.isAjax ? settings.isAjax : null : null;
                this.settings.live_validate = settings ? settings.live_validate : this.settings.live_validate;

                if(this.activeForm.data('toggle-submit')){
                    this.activeForm.find('input[type="submit"]')
                        .attr('disabled', 'disabled')
                        .addClass('is-disabled');
                }

                return this.bindEvents();
            },
            bindEvents : function(){

                var self = this;

                this.activeForm.find('input[type="submit"]')
                .on('click', function(e){
                    e.preventDefault();
                    self.validate(self.activeForm.find('input[required], select[required]'), true);
                });

                this.activeForm.find('input[required], select[required]')
                .on('blur change', function(){
                    clearTimeout(self.timer);
                    self.validate($(this), false);
                })
                .on('keyup', function(){
                    if(self.settings.live_validate){
                        clearTimeout(self.timer);
                        self.timer = setTimeout(function(){
                            self.validate($(this), false);
                        }.bind(this), self.settings.timeout);
                    }
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
            createEvent : function(){

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
            removeEvents : function(){

                var self = this;

                this.activeForm.off();

                this.activeForm.find('input[required], select[required]').off();

                this.activeForm.find('input[type="reset"]').off(
                    'click', self.reset.bind(self)
                    );

            },
            reset : function(){

                var fields = this.activeForm.find('input[required], select[required]'),
                    reset = this.activeForm.find('input[type="reset"]');

                fields.each(function(){

                    if( $(this).is('select') ){
                        $(this).val('0')
                            .removeAttr('data-invalid')
                            .removeAttr('data-valid')
                            .addClass('pristine')
                            .removeClass('dirty');

                    } else {
                        $(this).val('')
                            .removeClass('dirty')
                            .addClass('pristine')
                            .removeAttr('data-invalid')
                            .removeAttr('data-valid');
                    }

                });

                this.activeForm.removeClass('invalid-empty');

                return this.activeForm.data('toggle-submit') && this.toggleDisabled();

            },
            validate : function(elements, submit){
                var el = elements,
                    self = this;

                el.each(function(){

                    if( !$(this).val().length || $(this).val() === '0' ){
                        self.handleEmptyField($(this), submit);
                    }
                    if( ( $(this).is('input') && $(this).hasClass('pristine') && $(this).val().length )
                        || ( $(this).is('select') && $(this).hasClass('pristine') && $(this).val() !== '0') ){

                        $(this).removeClass('pristine').addClass('dirty');
                    }
                    if( $(this).data('pattern') && $(this).val().length ){
                        self.parsePattern($(this));
                    }
                    if( $(this).data('check') && $(this).val().length ){
                        self.recheckEqualTo($(this).data('check'));
                    }
                    if( $(this).data('type') === 'date-select' ){

                        var month = $('select[data-date="month"]').val(),
                            year = $('select[data-date="year"]').val();

                        if( month === '0' || year === '0' ){
                            self.handleEmptyField($('select[data-date="year"]'));
                        } else {
                            self.handleDate(
                                $('select[data-date="month"]').val(),
                                $('select[data-date="year"]').val(),
                                $('select[data-date="year"]'),
                                $('select[data-date="month"]')
                            );
                        }

                    }
                    if( $(this).data('type') === 'date-input' && $(this).val().length  ){
                        self.formatDate($(this), $(this).val());
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
            handleEmptyField : function(element, submit){

                if( element.hasClass('dirty') ){
                    element.removeClass('dirty').addClass('pristine');
                }

                this.setMessage(element, 'empty', false);

                return this.activeForm.data('toggle-submit') && this.toggleDisabled(false);

            },
            parsePattern : function(element){

                var el = element,
                    pattern = el.data('pattern'),
                    patterns = this.settings.patterns,
                    testVal = null;

                if( pattern === 'cc' ){
                    return this.handleCreditCard(el);
                }

                if( patterns.hasOwnProperty(pattern) && pattern.length ){
                    testVal = patterns[pattern];
                } else if ( pattern.length ) {
                    testVal = new RegExp('^'+pattern+'$');
                }

                return this.handlePattern(el, testVal);

            },
            handlePattern : function(element, testValue){

                var el = element,
                    pattern = testValue,
                    valid = pattern.test(el.val()),
                    type = valid ? '' : 'invalid';

                return this.setMessage(el, type, valid);

            },
            canSubmitCheck : function(submit){

                var feilds = this.activeForm.find('input[required], select[required]'),
                    canSubmit = true,
                    self = this;

                    feilds.each(function(){

                        if( $(this).attr('data-invalid') || $(this).hasClass('pristine') ){
                            canSubmit = false;
                        }

                    });

                if( !canSubmit && submit ){
                    this.activeForm.addClass('invalid-empty');
                }

                if( canSubmit && this.isAjax ){
                    return this.activeForm.find('input[type="submit"]').trigger('callAjax');
                }

                if( canSubmit && submit ){
                    this.toggleDisabled(false);
                    this.activeForm.removeClass('invalid-empty');
                    return this.activeForm.submit();
                }
                if( canSubmit ){
                    this.activeForm.removeClass('invalid-empty');
                }

                return this.activeForm.data('toggle-submit') && this.toggleDisabled(canSubmit);

            },
            setMessage : function(element, type, valid){

                var messageEL = element.siblings('small'),
                    text = messageEL.data(type) ? messageEL.data(type) : '';

                messageEL.text(text);

               return this.setvalidity(element, valid);

            },
            setvalidity : function(element, valid){

                return valid ?
                        element.removeAttr('data-invalid').attr('data-valid', 'true') :
                        element.removeAttr('data-valid').attr('data-invalid', 'true');

            },
            toggleDisabled : function(canSubmit){

                var submitButton = this.activeForm.find('input[type="submit"]');

                return  canSubmit ?
                        submitButton.removeClass('is-disabled').removeAttr('disabled') :
                        submitButton.addClass('is-disabled').attr('disabled', 'disabled');

            },
            recheckEqualTo : function(check){
                var element = $('#'+check);
                return element.hasClass('dirty') && this.handleEqualTo(element);
            },
            handleEqualTo : function(element){

                var value = element.data('equal-to'),
                    checkVal = $('#'+value),
                    valid = element.val() === checkVal.val() ? true : false,
                    type = valid ? '' : 'not-equal';

                return this.setMessage(element, type, valid);

            },
            handleCheckBox : function(element){

                var valid = element.is(':checked') ? true : false,
                    type = valid ? '' : 'invalid';

                return this.setMessage(element, type, valid);

            },
            handleCreditCard : function(element){

                var el = element,
                    patterns = this.settings.patterns;

                if ( patterns.cc.visa.test(el.val()) && !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid-visa', false);
                }
                if ( patterns.cc.mastercard.test(el.val()) && !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid-mc', false);
                }
                if ( ( !patterns.cc.mastercard.test(el.val()) || !patterns.cc.visa.test(el.val()) )
                        && !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid', false);
                }
                return this.setMessage(element, '', true);

            },
            luhnCheck : function(value){

                var number = value.replace(/\D/g, ''),
                    number_length = number.length,
                    parity = number_length % 2,
                    total = 0;

                for ( var i = 0; i < number_length; i++ ) {
                    var digit = number.charAt(i);
                    if ( i % 2 === parity ) {
                        digit = digit * 2;
                        if ( digit > 9 ) {
                            digit = digit - 9;
                        }
                    }
                    total = total + parseInt(digit);
                }

                return total % 10 === 0 ? true : false;
            },
            formatDate : function(element, value){

                var date = this.settings.patterns.date.test(value) ? value.split('/') : false,
                    month = date ? date[0] : null,
                    year = date ? date[1] : null;

                return date ? this.handleDate(month, year, element) : this.setMessage(element, 'invalid-format', false);

            },
            handleDate : function(month, year, Eelement, Melement){

                var dayArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                    mval = month,
                    mvalTrim = mval.indexOf('0') === 0 ? mval.substring(1) : mval,
                    yval = year,
                    today = new Date(),
                    expDate = new Date(),
                    day,
                    valid = false,
                    type;

                if( year === '0' ){
                    return this.handleEmptyField(Eelement);
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

                if(Melement){
                    this.setvalidity(Melement, valid);
                }
                return this.setMessage(Eelement, type, valid);
            }
        };
    })();

    window.Validate = Validate;

})(this, this.document);
