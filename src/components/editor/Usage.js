import React from 'react';

const Usage = () => (
    <p class="small">Usage:<br /><br />
        <strong>To create a component:</strong> <br />
        component Name [Visibility (Y Axis), Maturity (X Axis)]
        <br /><br />
        <strong>Example:</strong> <br /><a href="#" class="add">component Customer [1, 0.5]</a><br />
        <a href="#" class="add">component Cup of Tea [0.9, 0.5]</a>
        <br /><br />
        ------------------------<br />
        <strong>To evolve a component:</strong> <br />
        component Name [Visibility (Y Axis), Maturity (X Axis)] evole (X Axis)
        <br /><br />
        <strong>Example:</strong> <br /><a href="#" class="add">component Customer [1, 0.5] evolve 0.8</a><br />
        <a href="#" class="add">component Cup of Tea [0.9, 0.5] evolve 0.8</a>
        <br /><br />
        ------------------------<br />
        <strong>To evolve a component with inertia:</strong> <br />
        component Name [Visibility (Y Axis), Maturity (X Axis)] evole (X Axis) inertia
        <br /><br />
        <strong>Example:</strong> <br /><a href="#" class="add">component Customer [1, 0.5] evolve 0.8 inertia</a><br />
        <a href="#" class="add">component Cup of Tea [0.9, 0.5] evolve 0.8 inertia</a>
        <br /><br />
        ------------------------<br />
        <strong>To link components:</strong><br />
        <a href="#" class="add">Start Component->End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a href="#" class="add">Customer->Cup of Tea</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow:</strong><br />
        <a href="#" class="add">Start Component+&lt;&gt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a href="#" class="add">Public+&lt;&gt;Cup of Tea</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow - past components only:</strong><br />
        <a href="#" class="add">Start Component+&lt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a href="#" class="add">Hot Water+&lt;Kettle</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow - future components only:</strong><br />
        <a href="#" class="add">Start Component+&gt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a href="#" class="add">Hot Water+&gt;Kettle</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow - with label:</strong><br />
        <a href="#" class="add">Start Component+'insert text'&gt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a href="#" class="add">Hot Water+'+$0.10'&gt;Kettle</a>
        <br /><br />
        ------------------------<br />
        <strong>Available styles:</strong><br />
        <a href="#" class="add">style wardley</a>
        <br /><br />
        <a href="#" class="add">style handwritten</a>
        <br /><br />
        ------------------------<br />
        <strong>To set evolution labels:</strong><br />
        <a href="#" class="add">evolution First->Second->Third->Fourth</a>
        <br /><br />
        <strong>Example:</strong><br /> <a href="#" class="add">evolution Novel->Emerging->Good->Best</a>
    </p>
)

export default Usage;