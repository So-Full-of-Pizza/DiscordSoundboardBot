import { FC } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { button } from '../../styles/mixins';

const LogOutMenuMain = styled.div`
  position: absolute;
  top: 56px;
  left: -25px;

  @media only screen and (max-width: ${ props => props.theme.params.widthSelector2 }px) {
    left: 0px;
  }

  button {
    ${ button }

    color: white;
    background-color: ${ props => props.theme.colors.innerB };
    border: none;
    border-radius: 2px;
    box-shadow: 0 0 6px 0 white;
    min-height: 32px;
  }

  &::after {
    content: '';
    position: absolute;
    top: -12px;
    left: 37.5px;
    border: solid 5px transparent;
    border-bottom-color: ${ props => props.theme.colors.innerB };
    border-bottom-width: 7px;
    border-right-width: 14px;
    border-left-width: 14px;
  }

  @media only screen and (max-width: ${ props => props.theme.params.widthSelector2 }px) {
    &::after {
      left: 12.5px;
    }
  }
`;

const LogoutMenu: FC = () => (
  <LogOutMenuMain>
    <Link to="/logout">
      <button type="button">log out</button>
    </Link>
  </LogOutMenuMain>
);

export default LogoutMenu;
