import React from 'react';

function Usage(props){

    const addOnClick = (event) => {
        let before = props.mapText;
        console.log(before);
        before = before + "\n" + event.target.textContent.trim();
        props.mutateMapText(before);
    }
    
    return (
    <p className="small">Usage:<br /><br />
        <strong>To create a component:</strong> <br />
        component Name [Visibility (Y Axis), Maturity (X Axis)]
        <br /><br />
        <strong>Example:</strong> <br /><a onClick={event => addOnClick(event)} href="#" className="add">component Customer [1, 0.5]</a><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">component Cup of Tea [0.9, 0.5]</a>
        <br /><br />
        ------------------------<br />
        <strong>To evolve a component:</strong> <br />
        component Name [Visibility (Y Axis), Maturity (X Axis)] evole (X Axis)
        <br /><br />
        <strong>Example:</strong> <br /><a onClick={event => addOnClick(event)} href="#" className="add">component Customer [1, 0.5] evolve 0.8</a><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">component Cup of Tea [0.9, 0.5] evolve 0.8</a>
        <br /><br />
        ------------------------<br />
        <strong>To evolve a component with inertia:</strong> <br />
        component Name [Visibility (Y Axis), Maturity (X Axis)] evole (X Axis) inertia
        <br /><br />
        <strong>Example:</strong> <br /><a onClick={event => addOnClick(event)} href="#" className="add">component Customer [1, 0.5] evolve 0.8 inertia</a><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">component Cup of Tea [0.9, 0.5] evolve 0.8 inertia</a>
        <br /><br />
        ------------------------<br />
        <strong>To link components:</strong><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">Start Component->End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a onClick={event => addOnClick(event)} href="#" className="add">Customer->Cup of Tea</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow:</strong><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">Start Component+&lt;&gt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a onClick={event => addOnClick(event)} href="#" className="add">Public+&lt;&gt;Cup of Tea</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow - past components only:</strong><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">Start Component+&lt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a onClick={event => addOnClick(event)} href="#" className="add">Hot Water+&lt;Kettle</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow - future components only:</strong><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">Start Component+&gt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a onClick={event => addOnClick(event)} href="#" className="add">Hot Water+&gt;Kettle</a>
        <br /><br />
        ------------------------<br />
        <strong>To indicate flow - with label:</strong><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">Start Component+'insert text'&gt;End Component</a>
        <br /><br />
        <strong>Example:</strong><br /> <a onClick={event => addOnClick(event)} href="#" className="add">Hot Water+'+$0.10'&gt;Kettle</a>
        <br /><br />
        ------------------------<br />
        <strong>Available styles:</strong><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">style wardley</a>
        <br /><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">style handwritten</a>
        <br /><br />
        ------------------------<br />
        <strong>To set evolution labels:</strong><br />
        <a onClick={event => addOnClick(event)} href="#" className="add">evolution First->Second->Third->Fourth</a>
        <br /><br />
        <strong>Example:</strong><br /> <a onClick={event => addOnClick(event)} href="#" className="add">evolution Novel->Emerging->Good->Best</a>
    </p>
    )
}

export default Usage;