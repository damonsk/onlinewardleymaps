import React from 'react';

interface MapTitleProps {
    mapTitle: string;
}
function MapTitle(props: MapTitleProps) {
    const {mapTitle} = props;

    return (
        <text x={0} y={-10} id={'mapTitle'} fontWeight={'bold'} fontSize={'20px'} fontFamily='"Helvetica Neue",Helvetica,Arial,sans-serif'>
            {mapTitle}
        </text>
    );
}

export default MapTitle;
