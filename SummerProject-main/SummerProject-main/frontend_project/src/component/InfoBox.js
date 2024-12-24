import React from 'react';

const InfoBox = ({ title, children }) => {
    return (
        <div className="card">
            <div className="card-header">{title}</div>
            <div className="card-main">
                <div className="main-description">{children}</div>
            </div>
        </div>
    );
}

export default InfoBox;
