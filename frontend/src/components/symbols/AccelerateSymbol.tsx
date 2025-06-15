import React, {memo} from 'react';

export interface AccelerateSymbolProps {
    id?: string;
    deaccel?: boolean;
    styles: {stroke: string};
}

const AccelerateSymbol: React.FunctionComponent<AccelerateSymbolProps> = ({id, styles, deaccel}) => {
    return (
        <polygon
            id={id}
            points="0,0 100,0 100,-25 150,25 100,75 100,50 0,50"
            transform={deaccel ? 'scale(-1,1) translate(-150)' : ''}
            fill="url(#accelGradient)"
            stroke={styles.stroke}
            strokeWidth="2"
        />
    );
};

export default memo(AccelerateSymbol);
