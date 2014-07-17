<h2>Validation Script Plugin</h2>

<p>This script for validating form values depends on data attributes in the mark up for defining matching patterns and error messages.</p>

<h2>Default attributes on form tag</h2>

<ul>
  <li>novalidate="novalidate" : *this stops the browsers default input validation</li>
  <li>data-toggle-submit="[true/false]" : default value is false, will toggle disabled attribute on submit button when true</li>
  <li>data-handle-empty="[true/false]" : default value is false, will show error messages for empty inputs when true</li>
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

<h2>Attributes for Inputs: </h2>

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

<h2>Attributes for Select boxes</h2>
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
