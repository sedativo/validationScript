(function(window, document, undefined){
    'use strict';
    var AVSAutoComp = (function(){
        return {
            settings : {
                    US : {
                        regions : [
                            'Select State',
                            'Alabama', 'Alaska', 'Arizona',
                            'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
                            'District Of Columbia', 'Florida', 'Georgia',
                            'Hawaii','Idaho','Illinois','Indiana',
                            'Iowa','Kansas','Kentucky','Louisiana',
                            'Maine','Maryland','Massachusetts','Michigan',
                            'Minnesota','Mississippi','Missouri','Montana',
                            'Nebraska','Nevada','New Hampshire','New Jersey',
                            'New Mexico','New York','North Carolina','North Dakota',
                            'Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
                            'South Carolina','South Dakota','Tennessee','Texas','Utah',
                            'Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'
                        ],
                        regionsAbv : [
                            '', 'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI',
                            'ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS',
                            'MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR',
                            'PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
                        ]
                    },
                CA : {
                    regions : [
                        'Select Province', 'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
                        'Newfoundland', 'Nova Scotia','Nunavut','North West Territories','Ontario',
                        'Prince Edward Island','Quebec','Saskatchewen','Yukon'
                    ],
                    regionsAbv : [
                        '','AB','BC','MB','NB','NL','NT','NS','NU','ON','PE','QC','SK','YT'
                    ]
                }
            },
            activeForm : null,
            countryEL : null,
            regionCon : null,
            init : function(form, countryEl, regionCon){

                this.activeForm = form;
                this.countryEl = countryEl;
                this.regionCon = regionCon;
                return this.bindEvents();

            },
            bindEvents : function(){

                var self = this;

                this.activeForm.find('#fake_country')
                .on('change', function(){
                    return self.createElements();
                });

                return this.createElements();
            },
            createElements : function(){

                var settings = this.settings,
                    selectIndx = this.countryEl.val(),
                    whole_str = "",
                    region = this.regionCon,
                    value = region.data('value'),
                    tabindx = region.data('tabindex'),
                    setState = region.data('state'),
                    country = selectIndx === 'CA' ? 'CA' : selectIndx === 'US' ? 'US' : null,
                    select = $('<select id="dd_state" class="pristine" name="state" data-select="true" required ></select>'),
                    input = $('<input type="text" class="pristine" id="txt_state"  name="state" rel="type-2"  data-pattern="state" required/>'),
                    placeholder = region.data('placeholder');


                if( country ){

                    for(var i=0; i < settings[country].regions.length; i++){
                        var dd_str = "<option value='"+settings[country].regionsAbv[i]+"'";
                            if( setState === settings[country].regionsAbv[i] ){
                                dd_str += "selected=selected";
                            }
                        dd_str += ">" + settings[country].regions[i] +"</option>";
                        whole_str =  whole_str+dd_str;
                    }

                    select.html(whole_str);
                    select.attr('tabindex', tabindx);
                    region.find('input').remove();
                    region.find('select').remove();
                    region.append(select);

                } else {

                    input.attr('tabindex', tabindx);
                    input.attr('value', value);
                    input.attr('placeholder', placeholder);
                    region.find('select').remove();
                    region.append(input);

                }

            }
        };
    })();

    window.AVSAutoComp = AVSAutoComp;

})(this, this.document);
