(function($, window, document, undefined){
    'use strict';

    var Validate = (function(){

        return {
            settings : {
                liveValidate: true,
                isAjax : null,
                timeout : 1000,
                patterns : {
                    phone : /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i,
                    alphaNumeric : /^[a-zA-Z0-9]+$/,
                    name : /^[a-z ,.'-]+$/i,
                    email : /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
                    cvv : /^[0-9]{3,4}$/,
                    password : /^.{6,}$/,
                    state : /^.{0,80}$/,
                    postalcode : /^[A-Z0-9\-]{3,10}$/i,
                    address : /^[a-zA-Z0-9\s,'-]*$/,
                    //date formatt MM/YYYY
                    date : /^(0[1-9]|1[012])[- \/.]\d{4}$/,
                    cc : {
                        visa : /^4[0-9]{12,15}$/,
                        mastercard : /^5[0-9]{15}$/,
                    }
                }
            },
            activeForm : null,
            toggleSubmit : null,
            init : function(form, settings){

                this.activeForm = form;

                if( settings ){
                    for(var setting in settings){
                        if( settings.hasOwnProperty(setting) ){
                            if( typeof this.settings[setting] !== 'object' || setting !== 'patterns' ){
                                this.settings[setting] = settings[setting];
                            }
                        }
                    }
                }

                this.toggleSubmit = form.data('toggle-submit') || false;

                if( !form.attr('data-handle-empty') ){
                    form.attr('data-handle-empty', 'false');
                }
                if( this.toggleSubmit ){
                    this.activeForm.find('input[type="submit"]')
                        .attr('disabled', 'disabled')
                        .addClass('is-disabled');
                }
                if( !form.find('[required]').hasClass('dirty') || !form.find('[required]').hasClass('pristine') ){
                    form.find('[required]').addClass('pristine');
                }
                return this.bindEvents();
            },
            bindEvents : function(){

                var self = this;

                this.activeForm.find('input[type="submit"], button[type="submit"], [type="submit"]')
                .on('click', function(e){
                    e.preventDefault();
                    self.validate(self.activeForm.find('input[required], select[required]'), true);
                });

                this.activeForm
                .on('blur change','input[required], select[required]', function(){
                    if( self.settings.liveValidate ){
                        clearTimeout(self.timer);
                    }
                    self.validate($(this), false);
                })
                .on('keyup', 'input[required], select[required]', function(){
                    if( self.settings.liveValidate ){
                        clearTimeout(self.timer);
                        self.timer = setTimeout(function(){
                            self.validate($(this), false);
                        }.bind(this), self.settings.timeout);
                    }
                });

                this.activeForm.find('input[type="reset"]')
                .on('click', function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    if($(this).data('confirm')){
                        self.activeForm.trigger('validateReset');
                        return;
                    }
                    return self.reset.call(self);
                });
                this.activeForm
                .on('resetConfirmed', function(){
                    return self.reset.call(self);
                })
                .on('ajaxDone', function(){
                    return self.reset.call(self);
                });

                return this.createEvent();
            },
            createEvent : function(){

                //polyfill for CostumEvent constructor from Mozilla Developer Network
                //IE 9+ needs this.

                if ( typeof CustomEvent !== 'function' ){
                    (function () {
                        function CustomEvent ( event, params ) {
                            params = params || { bubbles: false, cancelable: false, detail: undefined };
                            var evt = document.createEvent( 'CustomEvent' );
                            evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
                            return evt;
                        }

                        CustomEvent.prototype = window.Event.prototype;

                        window.CustomEvent = CustomEvent;

                    })();
                }

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
                ),
                resetConf = new CustomEvent(
                    'resetConfirmed',
                    {
                        detail:
                        {
                            time: new Date()
                        },
                        bubbles: true,
                        cancelable: true
                    }
                ),
                ajaxDone = new CustomEvent(
                    'ajaxDone',
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
                    //handle all empty inputs
                    if( !$(this).val().length ||
                        ($(this).val().length === 0 &&
                        $(this)[0].selectedIndex === 0 ) ){
                        self.handleEmptyField($(this), submit);

                    }
                    //if input/select box has value other than 0,
                    if( $(this).is('input') && $(this).hasClass('pristine') ){
                        if( $(this).val().length ){
                            $(this).removeClass('pristine').addClass('dirty');
                        }
                    }
                    if( $(this).data('select') && $(this).val().length ){
                        $(this).removeClass('pristine').addClass('dirty');
                        self.setvalidity($(this), true);
                    }
                    if( $(this).data('pattern') && $(this).val().length ){
                        self.parsePattern($(this));
                    }
                    if( $(this).data('check') && $(this).val().length ){
                        self.recheckEqualTo($(this).data('check'));
                    }
                    if( $(this).data('type') === 'date-select' ){

                        var month = self.activeForm.find('[data-date="month"]'),
                            year = self.activeForm.find('[data-date="year"]'),
                            mval = month.val(),
                            yval = year.val();

                        if( mval === '0' || yval === '0' ){
                            self.setvalidity($(this), false);
                            self.handleEmptyField(year);
                        } else {
                            $(this).removeClass('pristine').addClass('dirty');
                            self.handleDate(mval, yval, year, month);
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
                    if( $(this).attr('type') === 'radio' ){
                        self.handleRadio($(this));
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

                feilds.each(function(i, v){

                    if( $(this).attr('data-invalid') || $(this).hasClass('pristine') ){
                        canSubmit = false;
                    }

                });

                if( !canSubmit && submit ){
                    this.activeForm.addClass('invalid-empty');
                }

                if( canSubmit && this.isAjax && submit ){

                    this.activeForm.removeClass('invalid-empty');
                    return this.activeForm.trigger('callAjax');
                }

                if( canSubmit && submit && !this.isAjax ){
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

                var messageEL = element.siblings('.error'),
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

                var submitButton = this.activeForm.find('input[type="submit"], button[type="submit"]');

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
                    type = valid ? '' : 'empty';

                if( valid ) {
                    element.addClass('dirty').removeClass('pristine');
                } else {
                    element.addClass('pristine').removeClass('dirty');
                }


                return this.setMessage(element, type, valid);

            },
            handleRadio : function(element){

                var name = element.attr('name'),
                    group = this.activeForm.find('radiogroup[data-group="'+name+'"]').find('input[type="radio"]'),
                    valid = false,
                    self = this;

                group.each(function(){
                    if( $(this).is(':checked') ){
                        valid = true;
                    }
                });

                group.each(function(){
                    if( valid ) {
                        $(this).addClass('dirty').removeClass('pristine');
                        self.setMessage($(this), '', true);
                    } else {
                        $(this).addClass('pristine').removeClass('dirty');
                        self.setMessage($(this), 'empty', false);
                    }
                });

            },
            handleCreditCard : function(element){

                var el = element,
                    patterns = this.settings.patterns;

                if( isNaN(el.val()) ){
                    return this.setMessage(element, 'invalid', false);
                }

                if ( patterns.cc.visa.test(el.val()) && !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid-visa', false);
                }

                if ( patterns.cc.mastercard.test(el.val()) && !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid-mc', false);
                }

                if ( ( !patterns.cc.mastercard.test(el.val()) || !patterns.cc.visa.test(el.val()) ) &&
                    !this.luhnCheck(el.val()) ){
                    return this.setMessage(element, 'invalid', false);
                }

                return this.setMessage(element, '', true);
            },
            luhnCheck : function(value){

                var number = value.replace(/\D/g, ''),
                    numberLength = number.length,
                    parity = numberLength % 2,
                    total = 0;

                for ( var i = 0; i < numberLength; i++ ) {
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
                    if(valid){
                        Melement.removeClass('pristine').addClass('dirty');
                    }
                    this.setvalidity(Melement, valid);
                }
                return this.setMessage(Eelement, type, valid);
            }
        };
    })();

    $.fn.validate = function(settings){
        return this.each(function(){
            var validate = Object.create(Validate);
            validate.init($(this), settings);
        });
    };

    window.Validate = Validate;

})(jQuery, this, this.document);
