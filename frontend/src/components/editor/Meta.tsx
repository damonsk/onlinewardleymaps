import React, { useState } from 'react';

export interface MetaProps {
    metaText: string;
}

const Meta: React.FunctionComponent<MetaProps> = ({ metaText }) => {
    const [showMeta, setShowMeta] = useState(false);
    const onClickAlert = function() {
        setShowMeta(!showMeta);
    };
    return (
        <>
            {metaText.length > 0 ? <Alert toggleMeta={onClickAlert} /> : null}
            {showMeta ? <MetaText metaText={metaText} /> : null}
        </>
    );
};

interface AlertProps {
    toggleMeta: (arg0: boolean) => void;
}

const Alert: React.FunctionComponent<AlertProps> = ({ toggleMeta }) => (
    <div id="meta-alert" className="alert alert-warning" role="alert">
        Your map has meta data -{' '}
        <span
            onClick={() => toggleMeta(true)}
            id="showMeta"
            className="clickable"
        >
            Show
        </span>
    </div>
);

interface MetaTextProps {
    metaText: string;
}

const MetaText: React.FunctionComponent<MetaTextProps> = ({ metaText }) => (
    <>
        <div id="meta-container">
            <textarea
                readOnly
                className="form-control"
                id="meta"
                value={metaText}
            />
        </div>
    </>
);

export default Meta;
