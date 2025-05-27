import Box from '@mui/material/Box';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import { makeStyles } from '@mui/styles';
import * as React from 'react';
import { MapTheme } from '../../constants/mapstyles';
import ComponentSymbol from '../symbols/ComponentSymbol';
import { ComponentIcon } from '../symbols/icons';

const useStyles = makeStyles(() => ({
    smallerSpeedDial: {
        '& .MuiSpeedDial-fab': {
            width: '32px',
            height: '32px',
            minHeight: '32px',
            minWidth: '32px',
        },
    },
}));

interface QuickAddCursor {
    cursor: React.ReactElement;
    template: (val: string, y: number, x: number) => string;
}
interface CanvasSpeedDialProps {
    setQuickAdd: React.Dispatch<React.SetStateAction<QuickAddCursor>>;
    mapStyleDefs: MapTheme;
}

interface Action {
    name: string;
    icon: React.ReactElement;
    onClick: (
        setQuickAddCursor: React.Dispatch<React.SetStateAction<QuickAddCursor>>,
        props: CanvasSpeedDialProps,
    ) => void;
}

export default function CanvasSpeedDial(props: CanvasSpeedDialProps) {
    const classes = useStyles();
    const { setQuickAdd } = props;

    const actionMapTheme = props.mapStyleDefs;
    actionMapTheme.component = Object.assign(actionMapTheme.component, {
        stroke: 'white',
        fill: 'transparent',
        strokeWidth: 1,
        radius: 5,
    });
    const actions: Action[] = [
        {
            name: 'Component',
            icon: (
                <ComponentIcon
                    id="component-icon"
                    text=""
                    hideLabel={true}
                    mapStyleDefs={actionMapTheme}
                    evolved={false}
                />
            ),
            onClick: (setQuickAddCursor, props) => {
                setQuickAddCursor({
                    cursor: (
                        <ComponentSymbol
                            styles={props.mapStyleDefs.component}
                            cx={'8px'}
                            cy={'8px'}
                        />
                    ),
                    template: (val, y, x) => `component ${val} [${y}, ${x}]`,
                });
            },
        },
    ];

    return (
        <>
            <Box sx={{ transform: 'translateZ(0px)', flexGrow: 1 }}>
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    className={classes.smallerSpeedDial}
                    sx={{ position: 'absolute', top: -10, right: 60 }}
                    icon={<SpeedDialIcon />}
                    direction="left"
                >
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            onClick={() => action.onClick(setQuickAdd, props)}
                        />
                    ))}
                </SpeedDial>
            </Box>
        </>
    );
}
