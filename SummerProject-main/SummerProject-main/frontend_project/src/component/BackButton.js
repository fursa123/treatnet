import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const StyledBackButton = styled(Link)`
  background-color: #003A9A;
  color: white;
  padding: 6px 20px;
  border-radius: 5px;
  border: none;
  text-decoration: none;
  cursor: pointer;
  position: absolute;
  top: 80px;
  right: 30px;
`;

const BackButton = ({ to }) => {
  return <StyledBackButton to={to}>Back to Home</StyledBackButton>;
};

export default BackButton;
