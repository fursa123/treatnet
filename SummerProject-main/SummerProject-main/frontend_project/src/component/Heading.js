import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    width: 100%;
    padding: 0 110px;
    margin-top: 30px;
    margin-bottom: 15px;
`;

const Heading = ({ title, subtitle }) => {
    return (
        <HeaderContainer>
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-[#003A9A] sm:text-4xl">
                    {title}
                </h1>
                {subtitle && <p className="mt-4 text-lg leading-6 text-gray-600">{subtitle}</p>}
            </div>
        </HeaderContainer>
    );
};

export default Heading;
