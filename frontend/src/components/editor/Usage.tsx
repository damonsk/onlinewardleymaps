import {Divider, Link, Typography} from '@mui/material';
import React from 'react';
import usages from '../../constants/usages';
import {useI18n} from '../../hooks/useI18n';

const toUsageKey = (value: string): string => value.toLowerCase().replace(/\s+/g, '_').replace(/\.+$/, '');

function Usage(props: {mapText: string; mutateMapText: (arg0: any) => void; mapStyleDefs: any}) {
    const addOnClick = (txt: string) => {
        let before = props.mapText;
        before = before + (props.mapText.trim().length > 0 ? '\n' : '') + txt.trim();
        props.mutateMapText(before);
    };
    return (
        <>
            {usages.map((usage, idx) => (
                <UsageDefinition
                    key={idx}
                    title={usage.title}
                    Icon={usage.Icon}
                    mapStyleDefs={props.mapStyleDefs}
                    summary={usage.summary}
                    examples={usage.examples}
                    addOnClick={addOnClick}
                />
            ))}
        </>
    );
}
const UsageDefinition = (props: {
    title?: any;
    summary?: any;
    examples?: string[];
    addOnClick: (txt: string) => void;
    Icon?: any;
    mapStyleDefs?: any;
}) => {
    const {Icon, mapStyleDefs} = props;
    const enabledIcons = false;
    const {t} = useI18n();
    return (
        <>
            <Typography variant="h3">{t(`editor.usages.${toUsageKey(props.title)}`, props.title)}</Typography>
            {props.summary.length > 0 ? (
                <Typography variant="body1">
                    {t(`editor.usages.${toUsageKey(props.summary)}`, props.summary)}{' '}
                </Typography>
            ) : null}
            <Typography variant="h5">{t('editor.example', 'Example')}</Typography>
            {props.examples &&
                props.examples.map((example, idx) => (
                    <React.Fragment key={idx}>
                        <UsageExample addOnClick={props.addOnClick} example={example} />
                    </React.Fragment>
                ))}
            {enabledIcons && Icon ? <Icon mapStyleDefs={mapStyleDefs} hideLabel={false} /> : null}
            <Divider sx={{marginTop: 2, marginBottom: 2}} />
        </>
    );
};
const UsageExample = (props: {addOnClick: (txt: string) => void; example: string}) => (
    <Typography>
        <Link sx={{cursor: 'pointer'}} onClick={() => props.addOnClick(props.example)} className="add clickable">
            {props.example}
        </Link>
    </Typography>
);
export default Usage;
