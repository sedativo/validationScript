(function(window, document, undefined){

    'use strict';

    var FormatFields = (function(){
        return {
            activeForm : null,
            init : function(form){

                this.activeForm = form;
                return this.bindEvents();
            },
            bindEvents : function(form){

                var self = this;

                this.activeForm.find('input[data-format]').on('keyup', function(e){
                   self.parseFormat($(this), e);
                });

            },
            parseFormat : function(element, event){

                var el = element,
                    format = el.data('format');

                switch(format){
                    case 'numeric':
                        this.handleNumeric(el);
                        break;
                    case 'date':
                        this.handleDate(el, event)
                        break;
                }

            },
            handleNumeric : function(element){

                var el = element,
                    value = el.val();

                return /\D/g.test(value) && element.val(value.replace(/\D/g, ''));

            },
            handleDate : function(element, event){

                var el = element,
                    value = el.val(),
                    type = event.which,
                    newVal = value;

                if( value.substring(0, 2).indexOf('/') !== -1 ){
                    return;
                }

                if( type === 27 || type === 8 || type === 37 || type === 38 ){
                    return;
                }

                if( value.length >= 3 ){

                    var val = value.split('/'),
                        month = val[0],
                        year = val[1].length ? this.formatYear(val[1]) : '';

                    newVal = month+'/'+year;
                }

                if( value.length <= 2 ){
                    newVal = this.formatMonth(value)
                }

                return element.val(newVal);
            },
            formatMonth : function(value){

                if( value.length === 1 ){
                    value = parseInt(value.substr(0,1)) > 1 ? '0'+value+'/' : value;
                }

                if( value.length === 2 ){
                    value += value.indexOf('/') !== -1 ? '' : '/' ;
                }

                return value;
            },
            formatYear : function(value){

                if( value.length === 2 ){
                    value = parseInt(value.substr(0,1)) <= 1 ?
                            '20'+value : ( parseInt(value.substr(0,1)) === 2  && parseInt(value.substr(1,1) ) > 0) ?
                            '20'+value : parseInt(value.substr(0,1)) > 2 ?
                            '20'+value : value;
                }

                return value;
            }
        }
    })();

    window.FormatFields = FormatFields;

})(this, this.document);
