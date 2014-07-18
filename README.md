<h1>Validation Plugin Documentation</h1>

<h3>Table of Contents</h3>
<ul>
  <li><a href="https://github.com/sedativo/validationScript/blob/master/README.md#validation-script-plugin">Validation Plugin</a></li>
  <li><a href="https://github.com/sedativo/validationScript/blob/master/README.md#avs-auto-complete-plugin">Avs Auto complete</a></li>
  <li><a href="https://github.com/sedativo/validationScript/blob/master/README.md#browser-support">Supported Browsers</a></li>
</ul>

<h2 id="#valid">Validation Script Plugin</h2>

<p>This script for validating form values depends on data attributes in the mark up for defining matching patterns and error messages.</p>

<h3>Default attributes on form tag</h3>

<ul>
  <li>novalidate="novalidate" : *this stops the browsers default input validation</li>
  <li>data-toggle-submit="[true/false]" : default value is false, will toggle disabled attribute on submit button when true</li>
  <li>data-handle-empty="[true/false]" : default value is false, will show error messages for empty inputs when true</li>
  <li>data-type="date-input" : this is required when validating a date using a single input</li>
</ul>
<small>all attributes marked with * are required for this plugin to work</small>

<pre>
  
  &lt;form id="someID" 
           action="someAction"
           data-toggle-submit="true" 
           data-handle-empty="false"
           novalidate="novalidate"&gt;
  &lt;/form&gt;

</pre>

<h3>Attributes for Inputs: </h3>

<ul>
  <li>required : *all fields to be validated by the plugin need the required attribute.</li>
  <li>data-pattern="[named pattern/regEX]" : *reference pattern name to validate against here or pass a regEX </li>
  <li>data-equal-to="[id of input]" : pass the id of the input that this input must match</li>
  <li>data-check="[id of input]" : pass the id of the input that must match this input, will re-validate matching input if this inputs value changes and matching input has a value</li>
</ul>

<pre>

  &lt;label&gt;Email&lt;/label&gt;
  &lt;input type="email" id="email" data-pattern="email" data-check="email-confirm" required &gt;

  &lt;label>Confirm Email&lt;/label>  
  &lt;input type="email" id="email-confirm" data-equal-to="email" required &gt;

</pre>

<small>all attributes marked with * are required for this plugin to work</small>

<h3>Attributes for Select boxes</h3>
<ul>
  <li>required</li>
  <li>data-select="true" : this is required for generic select boxes</li>
  <li>data-type="date-select" : this is required for validating a pair of select boxes </li>
  <li>data-date="[month/year]" : this is required if data-type is date-select and drop down is month/year</li>
</ul>

<pre>

  &lt;label&gt;Select Language&lt;/label&gt;
  &lt;select id="someID" data-select="true" required &gt;
    //options 
  &lt;select &gt;

  &lt;label&gt;Select date&lt;/label&gt;
  &lt;select id="month" data-type="date-select" data-date="month" required &gt;
    //options 
  &lt;select &gt;
  &lt;select id="year" data-type="date-select" data-date="year" required &gt;
    //options 
  &lt;select &gt;
  
</pre>

<h3>Attributes for checkboxes and radios</h3>
<ul>
  <li>required : this is all that is required for checkboxes, radios need additional attributes</li>
  <li>data-group="name of radio group" : required on radios wrapping element</li>
</ul>

<pre>

  &lt;label&gt;Checkbox&lt;/label&gt;
  &lt;input "type="checkbox id="someID" required &gt;


  &lt;label&gt;Radios&lt;/label&gt;
  &lt;radiogroup data-group="someName"&gt;
    &lt;type="radio" name="someName" value="1" required &gt;
    &lt;type="radio" name="someName" value="2" required &gt;
  &lt;radiogroup&gt;
  
</pre>

<h3>Attributes for Error messages</h3>

  <ul>
    <li>data-empty="some error message for empty field" : *required when handling empty feilds</li>
    <li>data-invalid="some error message for invalid value in field" : *required for invalid fields</li>
    <li>data-not-equal="some error message when field does not match another input value" : required for matching values</li>
    <li>data-invalid-format="Please enter a valid expiration date: MM/YYYY." : used by single input date validation</li>
    <li>data-invalid-visa="Please enter a valid Visa number." : used by credit card validation</li>
    <li>data-invalid-mc="Please enter a valid Mastercard number." : used by credit card validation</li>
  </ul>

<pre>

  &lt;div class="row"&gt;
    &lt;label&gt;Email&lt;/label&gt;
    &lt;input type="email" id="email" data-pattern="email" data-check="email-confirm" required &gt;
  
    &lt;small
            class="error"
            data-empty="Please enter an email address"
            data-invalid="Please enter a valid email address" &gt;
    &lt;/small&gt;
  &lt;/div&gt;

</pre>
<h3>Default plugin settings</h3>
<pre>
  settings : {
    liveValidate: true,
    timeout : 1000,
    patterns : {
      name : /^[a-z ,.'-]+$/i,
      email : /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
      cvv : /^[0-9]{3,4}$/,
      password : /^.{6,}$/,
      state : /^.{0,80}$/,
      postalcode : /^[A-Z0-9\-]{3,10}$/i,
      //date formatt MM/YYYY
      date : /^(0[1-9]|1[012])[- \/.]\d{4}$/,
      cc : {
        visa : /^4[0-9]{12,15}$/,
        mastercard : /^5[0-9]{15}$/,
      }
    }
  },
  isAjax : null
</pre>

<p>Calling the plugin</p>

<pre>

  $('form').validate();
  
</pre>

<p>Changing settings:</p>

<pre>

  //turn off keyup validation
  $('form').validate({ liveValidate : false });
  
  //turn on ajax form submition, when true will trigger callAjax custom event
  $('form').validate({ isAjax : true });
  
  //livevalidate and isAjax settings can be passed together
  $('form').validate({ isAjax : true, liveValidate : false });
  
</pre>
  
<hr/>

<h2 id="#avs">Avs Auto complete plugin</h2>

<p>This plugin creates the state/province drop downs for Canada and United States if either is selected in Country drop down. For other countries an input type text replaces the drop downs. A wrapping element for the select/input with default data attributes is required. The plugin will look for two elements when initialised: a country element with the id of 'fake_country' and the wrapping element with an id of 'region'. </p>

<h3>Default Attributes on Region wrapper</h3>

<ul>
  <li>data-value="get state value posted to server" : this attribute holds the value that was posted to the server</li>
  <li>data-state="add state value from server" : this will autcomplete the state value</li>
  <li>data-tabindex="[number]" : needed when building the select/input </li>
  <li>data-placeholder="state" : value is used to add a placeholder to the input field</li>
</ul>
<pre>

    &lt;div
        id="region"
        class="row"
        data-value="<?php echo $_POST['state'] ?>"
        data-state="<?=(isset($_GET['state']) ? $_GET['state'] : '')?>"
        data-tabindex="7"
        data-placeholder="<?=getWord('W01087')?>"
    &gt;
      
      &lt;!--- plugin will build input/select here --&gt;

    &lt;/div&gt;
  
</pre>

<p>Calling the plugin</p>
<pre>

  $('form').avsAuto(); 
  
</pre>

<p>Changing settings</p>
<pre>

  //if you want to change the default elements
  //for country drop down and region wrapper
  $('form').avsAuto(
      { 
        country: $('#country_dropdown'), 
        region: $('#region_wrapper') 
      }
  );
  
</pre>

<hr/>

<h2 id="#support" >Browser Support</h2>

<p>This plugin uses the Object.create() method for instances of the plugin, if your target browsers don't support Object.create() you will need a polyfil for this method, which can be found here: <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create" >MDN: Object.create()</a>.</li>

<small>*compat table from Mozilla Developer Network:</small>
<h5>Desktop</h5>

<table class="compat-table">
  <tbody>
   <tr>
    <th>Feature</th>
    <th>Chrome</th>
    <th>Firefox (Gecko)</th>
    <th>Internet Explorer</th>
    <th>Opera</th>
    <th>Safari</th>
   </tr>
   <tr>
    <td>Basic support</td>
    <td>5</td>
    <td><a title="Released on 2011-03-22." href="/en-US/Firefox/Releases/4">4.0</a> (2)</td>
    <td>9</td>
    <td>11.60</td>
    <td>5</td>
   </tr>
  </tbody>
 </table>

<h5>Mobile</h5>

<table class="compat-table">
  <tbody>
   <tr>
    <th>Feature</th>
    <th>Android</th>
    <th>Chrome for Android</th>
    <th>Firefox Mobile (Gecko)</th>
    <th>IE Mobile</th>
    <th>Opera Mobile</th>
    <th>Safari Mobile</th>
   </tr>
   <tr>
    <td>Basic support</td>
    <td><span title="Please update this with the earliest version of support." style="color: #888;">(Yes)</span></td>
    <td><span title="Please update this with the earliest version of support." style="color: #888;">(Yes)</span></td>
    <td><a title="Released on 2011-03-22." href="/en-US/Firefox/Releases/4">4.0</a> (2)</td>
    <td><span title="Please update this with the earliest version of support." style="color: #888;">(Yes)</span></td>
    <td>11.50</td>
    <td><span title="Please update this with the earliest version of support." style="color: #888;">(Yes)</span></td>
   </tr>
  </tbody>
 </table>

